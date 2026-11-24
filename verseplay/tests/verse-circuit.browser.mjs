import assert from "node:assert/strict";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { existsSync } from "node:fs";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
import { compareScreenshots } from "./visual-comparison.mjs";

// Before/after always use the immutable approved HTML, actual button clicks,
// the same installed browser/fonts, viewport, motion mode and screenshot settings.
const base = (
  process.env.VERSEPLAY_URL ||
  process.argv.find((x) => /^https?:/.test(x)) ||
  "http://127.0.0.1:8000"
).replace(/\/$/, "");
const baselineOnly = process.argv.includes("--baseline");
const out = resolve("test-results/verseplay");
await mkdir(out, { recursive: true });
const browser = await chromium.launch({
  executablePath:
    process.env.BROWSER_PATH ||
    (existsSync("/usr/bin/chromium") ? "/usr/bin/chromium" : undefined),
  args: [
    "--no-sandbox",
    "--disable-gpu",
    "--disable-lcd-text",
    "--disable-font-subpixel-positioning",
    "--font-render-hinting=none",
  ],
});
const results = {
  browser: await browser.version(),
  base,
  viewports: [],
  comparisons: [],
  checks: 0,
  axe: [],
  consoleErrors: [],
  fontFailures: [],
  fontResources: [],
  cameraOffsets: [],
};
// Capture live external font responses once per URL for this comparison run.
// Google Fonts can serve different font formats for the same stylesheet URL.
// Both versions must receive identical inputs; product URLs/assets stay untouched.
const fontInputs = new Map();
async function createContext(options) {
  const context = await browser.newContext(options);
  context.on("response", async (response) => {
    const input = fontInputs.get(response.url());
    if (!input || input.resolved) return;
    input.resolved = true;
    try {
      assert.equal(response.status(), 200, `Font input failed: ${response.url()}`);
      const body = await response.body();
      const headers = await response.allHeaders();
      delete headers["content-encoding"];
      delete headers["content-length"];
      input.resolve({status:response.status(), headers, body});
    } catch (error) { input.reject(error); }
  });
  context.on("requestfailed", (request) => {
    const input = fontInputs.get(request.url());
    if (input && !input.resolved) {
      input.resolved = true;
      input.reject(new Error(`Font input failed: ${request.url()}`));
    }
  });
  await context.route(/^https:\/\/fonts\.(googleapis|gstatic)\.com\//, async (route) => {
    const url = route.request().url();
    if (!fontInputs.has(url)) {
      const input = {};
      input.promise = new Promise((resolve, reject) => Object.assign(input, {resolve, reject}));
      input.promise.catch(() => {}); // Report through fontFailures and the route consumer.
      fontInputs.set(url, input);
      await route.continue();
    } else await route.fulfill(await fontInputs.get(url).promise);
  });
  return context;
}
const check = (value, message) => {
  assert.ok(value, message);
  results.checks++;
};
const click = async (page, action) =>
  page.locator(`[data-action="${action}"]`).click();
const matchButton = (page, action, text) =>
  page.locator(`[data-action="${action}"]`).filter({ hasText: text });
const settle = async (page) => {
  await page.evaluate(async () => {
    for (const weight of [400, 500, 600, 700, 800])
      await document.fonts.load(`${weight} 19px Manrope`);
    for (const weight of [500, 600, 700, 800])
      await document.fonts.load(`${weight} 38px Oxanium`);
    await document.fonts.ready;
  });
  await page.mouse.move(0, 0);
};
function contrastResult(axe) {
  return {
    passedNodes:
      axe.passes.find((rule) => rule.id === "color-contrast")?.nodes.length ||
      0,
    violations: axe.violations
      .filter((rule) => rule.id === "color-contrast")
      .flatMap((rule) =>
        rule.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      ),
    incomplete: axe.incomplete
      .filter((rule) => rule.id === "color-contrast")
      .flatMap((rule) =>
        rule.nodes.map((node) => ({
          target: node.target,
          summary: node.failureSummary,
        })),
      ),
  };
}
async function stableScreenshot(page, options) {
  let previous;
  for (let attempt = 0; attempt < 8; attempt++) {
    await page.evaluate(
      () =>
        new Promise((resolve) =>
          requestAnimationFrame(() => requestAnimationFrame(resolve)),
        ),
    );
    const current = await page.screenshot(options);
    if (previous?.equals(current)) return current;
    previous = current;
  }
  throw new Error("Screenshot did not settle across consecutive frames");
}
async function snapshot(page, label, kind, width) {
  await settle(page);
  const filename = `${kind}-${width}-${label}.png`;
  await page.evaluate(() =>
    window.scrollTo({ left: 0, top: 0, behavior: "instant" }),
  );
  const buffer = await stableScreenshot(page, {
    fullPage: true,
    animations: "disabled",
  });
  await writeFile(`${out}/${filename}`, buffer);
  const hash = createHash("sha256").update(buffer).digest("hex");
  if (kind === "after") {
    const before = await readFile(`${out}/before-${width}-${label}.png`);
    results.comparisons.push({
      viewport: width,
      state: label,
      ...compareScreenshots(before, buffer),
      beforeSha256: createHash("sha256").update(before).digest("hex"),
      afterSha256: hash,
    });
  }
  return hash;
}
async function geometry(page, kind, label, width) {
  if (kind !== "after") return;
  const sizes = await page.evaluate(() => ({
    width: innerWidth,
    scrollWidth: document.documentElement.scrollWidth,
    main: document.querySelector("#game").getBoundingClientRect().width,
    buttons: [...document.querySelectorAll("#game button")]
      .filter((x) => !x.disabled)
      .map((x) => {
        const r = x.getBoundingClientRect();
        return {
          text: x.textContent.trim(),
          left: r.left,
          right: r.right,
          width: r.width,
          height: r.height,
        };
      }),
  }));
  check(
    sizes.scrollWidth <= sizes.width,
    `No horizontal overflow ${width} ${label}`,
  );
  check(sizes.main > 0, `Main rendered ${width} ${label}`);
  for (const button of sizes.buttons) {
    check(
      button.left >= -1 &&
        button.right <= width + 1 &&
        button.width > 0 &&
        button.height > 0,
      `Reachable button ${button.text} ${width} ${label}`,
    );
  }
}
async function visit(kind, width, height = 844) {
  const context = await createContext({
    viewport: { width, height },
    isMobile: width < 500,
    hasTouch: width < 500,
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  page.on("response", async (response) => {
    if (/fonts\.(googleapis|gstatic)/.test(response.url())) {
      try {
        const body = await response.body();
        if (response.url().includes("fonts.googleapis.com"))
          await writeFile(`${out}/font-${createHash("sha256").update(body).digest("hex")}.css`, body);
        results.fontResources.push({kind, width, url:response.url(),
          sha256:createHash("sha256").update(body).digest("hex")});
      } catch (error) {
        results.fontFailures.push({kind, width, url:response.url(), error:error.message});
      }
    }
  });
  await page.route("**/favicon.ico", (route) => route.fulfill({ status: 204 })); // browser-generated request, absent in approved prototype
  page.on("pageerror", (e) =>
    results.consoleErrors.push({ kind, width, message: e.message }),
  );
  page.on("console", (m) => {
    if (m.type() === "error")
      results.consoleErrors.push({ kind, width, message: m.text() });
  });
  page.on("requestfailed", (r) => {
    if (/fonts\.(googleapis|gstatic)/.test(r.url()))
      results.fontFailures.push({
        kind,
        width,
        url: r.url(),
        error: r.failure()?.errorText,
      });
  });
  await page.goto(
    `${base}/${kind === "before" ? "verseplay/reference/verse-circuit-original.html" : "verse-circuit-playground.html"}`,
  );
  await page.locator('[data-action="launch"]').waitFor();
  await settle(page);
  results.viewports.push({
    kind,
    width,
    height,
    fonts: await page.evaluate(() => ({
      oxanium: document.fonts.check("800 38px Oxanium"),
      manrope: document.fonts.check("600 19px Manrope"),
      loadedFamilies: [...document.fonts]
        .filter((face) => face.status === "loaded")
        .map((face) => face.family.replace(/['"]/g, "")),
    })),
  });
  const save = async (label) => {
    if (label.endsWith("-incorrect")) {
      // The 300ms error flash is transient; capture its persistent error message
      // only after the flash clears, rather than racing wall-clock screenshots.
      await page.waitForFunction(() => !document.querySelector(".incorrect, .wrong"));
    }
    await geometry(page, kind, label, width);
    await snapshot(page, label, kind, width);
    if (
      width === 390 &&
      [
        "arcade",
        "introduction",
        "trace",
        "link",
        "echo",
        "victory",
        "afterglow",
      ].includes(label)
    ) {
      const axe = await new AxeBuilder({ page }).analyze();
      results.axe.push({
        kind,
        state: label,
        colorContrast: contrastResult(axe),
        violations: axe.violations.map((v) => ({
          id: v.id,
          impact: v.impact,
          description: v.description,
          nodes: v.nodes.map((n) => ({
            target: n.target,
            summary: n.failureSummary,
          })),
        })),
      });
    }
  };
  const wrongChoice = async (action, text, className, feedback, message) => {
    // Observe the real transient feedback before clicking, so a slow screenshot
    // cannot miss it. Then compare the settled error state on both versions.
    await page.evaluate((className) => {
      window.errorFlash = new Promise((resolve) => {
        let shown = false;
        const observer = new MutationObserver(() => {
          const visible = !!document.querySelector(`.${className}`);
          if (visible) shown = true;
          else if (shown) { observer.disconnect(); resolve(true); }
        });
        observer.observe(document.querySelector("#game"), {subtree:true, attributes:true, attributeFilter:["class"]});
      });
    }, className);
    await matchButton(page, action, text).click();
    await page.waitForFunction(() => window.errorFlash);
    check(await page.evaluate(() => window.errorFlash), `${kind} ${width} ${action} error flash appears and clears`);
    check((await page.locator(feedback).textContent()) === message, `${kind} ${width} ${action} preserves error feedback`);
  };
  await save("arcade");
  await click(page, "launch");
  await save("introduction");
  await click(page, "start");
  await save("trace");
  for (const text of ["commandment", "love one another", "loved you"])
    await matchButton(page, "trace", text).click();
  await save("trace-complete");
  await click(page, "next");
  await save("link");
  await wrongChoice("link", "as I have loved you", "incorrect", "#link-feedback", "Not quite—try the phrase that comes next.");
  await save("link-incorrect");
  for (const text of [
    "This is My commandment",
    "that you love one another",
    "as I have loved you",
  ])
    await matchButton(page, "link", text).click();
  await save("link-complete");
  await click(page, "next");
  await save("echo");
  await wrongChoice("echo", "know", "wrong", "#echo-feedback", "Almost. Try the word that fits this blank.");
  await save("echo-incorrect");
  for (const text of ["commandment", "one another", "loved"])
    await matchButton(page, "echo", new RegExp(`^${text}$`)).click();
  await save("echo-complete");
  await click(page, "next");
  await save("victory");
  await click(page, "afterglow");
  await save("afterglow");
  await context.close();
}
async function integration() {
  const context = await createContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.route("**/favicon.ico", (route) => route.fulfill({ status: 204 })); // browser-generated request, absent in approved prototype
  page.on("pageerror", (e) =>
    results.consoleErrors.push({ kind: "integration", message: e.message }),
  );
  const reload = async (label) => {
    await page.reload();
    await page.locator("#game h1").waitFor();
    check(
      (await page.locator(`[aria-label="${label}"]`).count()) === 1,
      `Reload restored ${label}`,
    );
  };
  await page.goto(`${base}/verse-circuit-playground.html`);
  await page.locator('[data-action="launch"]').waitFor();
  const sound = page.locator("#audio");
  await sound.click();
  check(
    (await sound.getAttribute("aria-pressed")) === "true",
    "Sound toggles separately",
  );
  await click(page, "launch");
  await reload("Verse Circuit game introduction");
  await click(page, "start");
  await matchButton(page, "trace", "commandment").dblclick({ delay: 10 });
  check(
    (await page.locator(".anchor.selected").count()) === 1,
    "Rapid repeated TRACE selects once",
  );
  await reload("Trace stage");
  check(
    (await page.locator(".anchor.selected").count()) === 1,
    "TRACE progress restored",
  );
  for (const text of ["love one another", "loved you"])
    await matchButton(page, "trace", text).click();
  await click(page, "next");
  await matchButton(page, "link", "This is My commandment").click();
  await reload("Link stage");
  check(
    (await page.locator(".assembled:not(.placeholder)").count()) === 1,
    "LINK progress restored",
  );
  await click(page, "hint");
  check(
    /Hint:/.test(await page.locator("#link-feedback").textContent()),
    "LINK accessible hint",
  );
  await click(page, "resetlink");
  check(
    (await page.locator(".assembled:not(.placeholder)").count()) === 0,
    "LINK undo",
  );
  for (const text of [
    "This is My commandment",
    "that you love one another",
    "as I have loved you",
  ])
    await matchButton(page, "link", text).click();
  await click(page, "next");
  await matchButton(page, "echo", "commandment").click();
  await reload("Echo memory stage");
  check(
    (await page.locator(".blank.filled").count()) === 1,
    "ECHO progress restored",
  );
  await click(page, "hint");
  check(
    /Hint:/.test(await page.locator("#echo-feedback").textContent()),
    "ECHO accessible hint",
  );
  await click(page, "resetecho");
  check((await page.locator(".blank.filled").count()) === 0, "ECHO undo");
  for (const text of ["commandment", "one another", "loved"])
    await matchButton(page, "echo", new RegExp(`^${text}$`)).click();
  await click(page, "next");
  await reload("Circuit completion");
  await click(page, "afterglow");
  await reload("Afterglow Scripture connection");
  check(
    (await sound.getAttribute("aria-pressed")) === "true",
    "Sound survives gameplay and reload",
  );
  await click(page, "restart");
  check(
    (await page.locator(".anchor.selected").count()) === 0,
    "Replay clears progress",
  );
  check(
    (await sound.getAttribute("aria-pressed")) === "true",
    "Replay preserves sound preference",
  );
  check(
    (await page
      .locator(".screen")
      .evaluate((x) => getComputedStyle(x).animationName)) === "none",
    "Reduced motion disables screen animation",
  );
  await click(page, "home");
  await page.keyboard.press("Tab"); // use actual keyboard rather than programmatic focus for concept navigation
  await page.locator('[data-action="concept"]').first().focus();
  await page.keyboard.press("Enter");
  check(
    (await page.locator('[role="dialog"]').count()) === 1,
    "Keyboard opens concept dialog",
  );
  await page.keyboard.press("Tab");
  check(
    await page
      .locator('[data-action="close-modal"]')
      .evaluate((x) => x === document.activeElement),
    "Dialog focus trapped",
  );
  await page.keyboard.press("Escape");
  check(
    await page
      .locator('[data-action="concept"]')
      .first()
      .evaluate((x) => x === document.activeElement),
    "Escape restores focus",
  );
  await page.locator('[data-action="launch"]').focus();
  check(
    (await page
      .locator('[data-action="launch"]')
      .evaluate((x) => getComputedStyle(x).outlineStyle)) !== "none",
    "Visible keyboard focus",
  );
  for (const state of [
    "arcade",
    "introduction",
    "trace",
    "link",
    "echo",
    "victory",
    "afterglow",
  ]) {
    if (state === "introduction") await click(page, "launch");
    if (state === "trace") await click(page, "start");
    if (state === "link") {
      for (const text of ["commandment", "love one another", "loved you"])
        await matchButton(page, "trace", text).click();
      await click(page, "next");
    }
    if (state === "echo") {
      for (const text of [
        "This is My commandment",
        "that you love one another",
        "as I have loved you",
      ])
        await matchButton(page, "link", text).click();
      await click(page, "next");
    }
    if (state === "victory") {
      for (const text of ["commandment", "one another", "loved"])
        await matchButton(page, "echo", new RegExp(`^${text}$`)).click();
      await click(page, "next");
    }
    if (state === "afterglow") await click(page, "afterglow");
    const axe = await new AxeBuilder({ page }).analyze();
    results.axe.push({
      kind: "after",
      state,
      colorContrast: contrastResult(axe),
      violations: axe.violations.map((v) => ({
        id: v.id,
        impact: v.impact,
        description: v.description,
        nodes: v.nodes.map((n) => ({
          target: n.target,
          summary: n.failureSummary,
        })),
      })),
    });
  }
  await context.close();
}
async function failureRecovery() {
  for (const fixture of [
    { label: "corrupted JSON", value: "{broken" },
    {
      label: "partial state",
      value: JSON.stringify({ screen: "win", completed: true }),
    },
    {
      label: "unsupported version",
      value: JSON.stringify({ schemaVersion: 999 }),
    },
  ]) {
    const context = await createContext({
      viewport: { width: 375, height: 844 },
    });
    await context.addInitScript((value) => {
      localStorage.setItem("verseplay:verse-circuit:john-15-12", value);
      localStorage.setItem("unrelated-app", "retained");
      localStorage.setItem(
        "verseplay:preferences:v1",
        JSON.stringify({ schemaVersion: 1, sound: true }),
      );
    }, fixture.value);
    const page = await context.newPage();
    await page.goto(`${base}/verse-circuit-playground.html`);
    await page.locator('[data-action="launch"]').waitFor();
    check(
      /was reset because/.test(
        await page.locator('[role="status"]').first().textContent(),
      ),
      `${fixture.label} gives readable reset notice`,
    );
    check(
      (await page.evaluate(() => localStorage.getItem("unrelated-app"))) ===
        "retained",
      `${fixture.label} retains unrelated app data`,
    );
    check(
      (await page.locator("#audio").getAttribute("aria-pressed")) === "true",
      `${fixture.label} retains sound preference`,
    );
    await click(page, "launch");
    await click(page, "start");
    check(
      (await page.locator(".anchor").count()) === 3,
      `${fixture.label} still playable`,
    );
    await context.close();
  }
  const unavailable = await createContext({
    viewport: { width: 320, height: 844 },
  });
  await unavailable.addInitScript(() =>
    Object.defineProperty(window, "localStorage", {
      get() {
        throw new DOMException("Storage disabled", "SecurityError");
      },
    }),
  );
  const unavailablePage = await unavailable.newPage();
  await unavailablePage.goto(`${base}/verse-circuit-playground.html`);
  await unavailablePage.locator('[data-action="launch"]').waitFor();
  check(
    /keep playing/.test(
      await unavailablePage.locator('[role="status"]').first().textContent(),
    ),
    "Unavailable storage explains in-memory play",
  );
  await click(unavailablePage, "launch");
  await click(unavailablePage, "start");
  await matchButton(unavailablePage, "trace", "commandment").click();
  check(
    (await unavailablePage.locator(".anchor.selected").count()) === 1,
    "Unavailable storage remains playable",
  );
  await unavailable.close();
  const quota = await createContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const quotaPage = await quota.newPage();
  await quotaPage.goto(`${base}/verse-circuit-playground.html`);
  await quotaPage.locator('[data-action="launch"]').waitFor();
  await quotaPage.evaluate(() => {
    Storage.prototype.setItem = () => {
      throw new DOMException("Quota exceeded", "QuotaExceededError");
    };
  });
  await click(quotaPage, "launch");
  await click(quotaPage, "start");
  await matchButton(quotaPage, "trace", "commandment").click();
  check(
    (await quotaPage.locator(".anchor.selected").count()) === 1,
    "Quota failure keeps gameplay working",
  );
  check(
    (await quotaPage.locator("#verseplay-storage-notice").count()) === 1,
    "Quota failure notice persists across gameplay rerenders",
  );
  await quotaPage.locator("#audio").click();
  check(
    (await quotaPage.locator("#verseplay-storage-notice").count()) === 1,
    "Preference save failure keeps one persistent notice",
  );
  check(
    /keep playing/.test(
      await quotaPage.locator("#verseplay-storage-notice").textContent(),
    ),
    "Quota notice remains readable after gameplay announcements",
  );
  await quota.close();
  const missing = await createContext();
  const missingPage = await missing.newPage();
  await missingPage.route("**/content/john-15-12.json", (route) =>
    route.fulfill({ status: 503, body: "Unavailable" }),
  );
  await missingPage.goto(`${base}/verse-circuit-playground.html`);
  await missingPage.getByRole("button", { name: "RETRY" }).waitFor();
  check(
    /could not be loaded safely/.test(
      await missingPage.getByRole("alert").textContent(),
    ),
    "Passage fetch failure has accessible retry, no blank screen",
  );
  await missingPage.unroute("**/content/john-15-12.json");
  await missingPage.getByRole("button", { name: "RETRY" }).click();
  await missingPage.locator('[data-action="launch"]').waitFor();
  check(true, "Retry recovers after passage load failure");
  await missing.close();
}
async function normalMotionParity() {
  const original = await readFile(
    resolve("verseplay/reference/verse-circuit-original.html"),
    "utf8",
  );
  const stylesheet = await readFile(
    resolve("verseplay/games/verse-circuit/verse-circuit.css"),
    "utf8",
  );
  check(
    original.match(/<style>([\s\S]*?)<\/style>/)[1] === stylesheet,
    "Extracted stylesheet is byte-for-byte identical to approved CSS",
  );
  const signatures = [],
    captures = [];
  for (const [kind, path] of [
    ["before", "verseplay/reference/verse-circuit-original.html"],
    ["after", "verse-circuit-playground.html"],
  ]) {
    const context = await createContext({
      viewport: { width: 390, height: 844 },
      reducedMotion: "no-preference",
    });
    const page = await context.newPage();
    await page.goto(`${base}/${path}`);
    await page.locator('[data-action="launch"]').waitFor();
    const signature = await page.locator(".screen").evaluate((el) => {
      const s = getComputedStyle(el);
      return {
        name: s.animationName,
        duration: s.animationDuration,
        easing: s.animationTimingFunction,
        fill: s.animationFillMode,
      };
    });
    check(
      signature.name === "screen-in" && signature.duration === "0.32s",
      "Approved screen transition enabled for normal-motion users",
    );
    await click(page, "launch");
    await click(page, "start");
    for (const text of ["commandment", "love one another", "loved you"])
      await matchButton(page, "trace", text).click();
    await click(page, "next");
    for (const text of [
      "This is My commandment",
      "that you love one another",
      "as I have loved you",
    ])
      await matchButton(page, "link", text).click();
    await click(page, "next");
    for (const text of ["commandment", "one another", "loved"])
      await matchButton(page, "echo", new RegExp(`^${text}$`)).click();
    await click(page, "next");
    await settle(page);
    signature.confetti = await page
      .locator(".confetti i")
      .evaluateAll((nodes) =>
        nodes.map((el) => {
          const s = getComputedStyle(el);
          return {
            name: s.animationName,
            duration: s.animationDuration,
            delay: s.animationDelay,
            iterations: s.animationIterationCount,
          };
        }),
      );
    check(
      signature.confetti.length === 8 &&
        signature.confetti.every(
          (x) => x.name === "float" && x.duration === "1.9s",
        ),
      "All approved completion particles animate",
    );
    signatures.push(signature);
    // Pause the real CSS animations at an explicit matching timeline point.
    await page.evaluate(() => {
      for (const animation of document.getAnimations()) {
        animation.pause();
        animation.currentTime = 900;
      }
    });
    results.cameraOffsets.push({
      kind,
      ...(await page.evaluate(() => ({
        windowX: scrollX,
        shellX: document.querySelector(".app-shell").scrollLeft,
        bodyX: document.querySelector(".app-body").scrollLeft,
      }))),
    });
    await page.evaluate(() => {
      window.scrollTo({ left: 0, top: 0, behavior: "instant" });
      document.querySelector(".app-shell").scrollLeft = 0;
      document.querySelector(".app-body").scrollLeft = 0;
    });
    const capture = await stableScreenshot(page, {
      fullPage: true,
      animations: "allow",
    });
    await writeFile(`${out}/${kind}-390-victory-normal-900ms.png`, capture);
    captures.push(capture);
    await context.close();
  }
  assert.deepEqual(signatures[0], signatures[1]);
  results.checks++;
  results.comparisons.push({
    viewport: 390,
    state: "victory-normal-900ms",
    ...compareScreenshots(captures[0], captures[1]),
    beforeSha256: createHash("sha256").update(captures[0]).digest("hex"),
    afterSha256: createHash("sha256").update(captures[1]).digest("hex"),
  });
}
async function keyboardPlay() {
  const context = await createContext({
    viewport: { width: 390, height: 844 },
    reducedMotion: "reduce",
  });
  const page = await context.newPage();
  await page.goto(`${base}/verse-circuit-playground.html`);
  await page.locator('[data-action="launch"]').waitFor();
  await page.keyboard.press("Tab");
  check(
    await page.locator("#audio").evaluate((x) => x === document.activeElement),
    "Tab reaches sound control",
  );
  await page.keyboard.press("Tab");
  check(
    await page
      .locator('[data-action="launch"]')
      .evaluate((x) => x === document.activeElement),
    "Tab reaches launch control",
  );
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  check(
    await page
      .locator('[data-action="start"]')
      .evaluate((x) => x === document.activeElement),
    "Tab reaches start from introduction heading",
  );
  await page.keyboard.press("Enter");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  check(
    (await page.locator(".anchor.selected").count()) === 1,
    "Keyboard selects TRACE anchor",
  );
  check(
    await page
      .locator(".anchor.selected")
      .evaluate((x) => x === document.activeElement),
    "Keyboard focus survives same-screen render",
  );
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Space");
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  check(
    (await page.locator('[aria-label="Link stage"]').count()) === 1,
    "Keyboard advances TRACE to LINK",
  );
  await context.close();
}
try {
  for (const width of process.env.VERSEPLAY_WIDTH
    ? [Number(process.env.VERSEPLAY_WIDTH)]
    : [320, 375, 390, 430])
    await visit("before", width);
  if (!baselineOnly) {
    for (const width of process.env.VERSEPLAY_WIDTH
      ? [Number(process.env.VERSEPLAY_WIDTH)]
      : [320, 375, 390, 430])
      await visit("after", width);
    if (!process.argv.includes("--visual-only")) {
      await integration();
      await failureRecovery();
      await normalMotionParity();
      await keyboardPlay();
    } else if (process.argv.includes("--normal-motion")) {
      await normalMotionParity();
    }
  }
  check(results.consoleErrors.length === 0, "No console/page errors");
  check(results.fontFailures.length === 0, "No failed font requests");
  for (const url of new Set(results.fontResources.map((resource) => resource.url)))
    check(new Set(results.fontResources.filter((resource) => resource.url === url)
      .map((resource) => resource.sha256)).size === 1, `Identical font input bytes: ${url}`);
  check(
    results.viewports.every(
      (viewport) =>
        viewport.fonts.oxanium &&
        viewport.fonts.manrope &&
        ["Oxanium", "Manrope"].every((family) =>
          viewport.fonts.loadedFamilies.includes(family),
        ),
    ),
    "Both approved font families are loaded at every viewport",
  );
  if (!baselineOnly)
    check(
      results.comparisons.every((x) => x.equal),
      "Before/after screenshots must have no non-antialias pixel changes",
    );
  if (!baselineOnly) {
    for (const after of results.axe.filter((x) => x.kind === "after")) {
      const before = results.axe.find(
        (x) => x.kind === "before" && x.state === after.state,
      );
      check(
        after.violations.every((violation) =>
          before.violations.some((original) => original.id === violation.id),
        ),
        `No new accessibility findings on ${after.state}`,
      );
      check(
        after.violations.length === 0,
        `No axe violations on ${after.state}`,
      );
    }
  }
  results.status = "passed";
  await writeFile(
    `${out}/${baselineOnly ? "baseline" : "results"}.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
  console.log(
    JSON.stringify(
      {
        screenshots:
          results.viewports.length * 12 +
          results.comparisons.filter((x) => x.state.includes("normal")).length *
            2,
        checks: results.checks,
        comparisons: results.comparisons.length,
        mismatches: results.comparisons.filter((x) => !x.equal),
        axe: results.axe.map((x) => ({
          state: x.state,
          violations: x.violations.length,
        })),
        consoleErrors: results.consoleErrors,
        fontFailures: results.fontFailures,
      },
      null,
      2,
    ),
  );
} catch (error) {
  results.status = "failed";
  results.error = error.message;
  await writeFile(
    `${out}/results-failed.json`,
    JSON.stringify(results, null, 2) + "\n",
  );
  throw error;
} finally {
  await browser.close();
}
