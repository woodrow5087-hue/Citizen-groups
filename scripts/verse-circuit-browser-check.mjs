import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import { chromium } from 'playwright';

const root = fileURLToPath(new URL('../', import.meta.url));
const output = path.join(root, 'test-results', 'verse-circuit');
const labKey = 'rallypoint-verse-circuit-lab-v1';
const verse = 'This is My commandment, that you love one another as I have loved you.';
const ending = 'as I have loved you.';
const missingWords = 'commandment loved';
const traceSteps = [1, 2];
const linkSteps = [0, 1, 2];
const existingStorage = {
  'rallypoint-phase1-2026': '{"question":"A pre-existing group discussion","read":true}',
  'rallypoint-today-ui-v1': '{"name":"Jamie","campus":"maui"}',
  'citizen-premium-hybrid-demo-v1': '{"reflection":"Keep this old note"}'
};
const cases = [
  { width: 320, height: 568, touch: true, reducedMotion: 'reduce', outcome: 'independent', skipReplay: true },
  { width: 390, height: 844, touch: true, reducedMotion: 'no-preference', outcome: 'assisted', fullVerse: true, screenshot: true, safeTop: 47, safeBottom: 34 },
  { width: 1280, height: 900, touch: false, reducedMotion: 'no-preference', outcome: 'independent', fullVerse: true }
];
const preview = process.env.PREVIEW_URL;

async function localServer() {
  const dist = path.join(root, 'dist');
  const types = { '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript', '.svg': 'image/svg+xml', '.ttf': 'font/ttf' };
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(dist, `.${pathname}`);
      if (!file.startsWith(dist + path.sep)) return response.writeHead(404).end();
      const content = fs.readFileSync(file);
      response.setHeader('Content-Type', types[path.extname(file)] || 'application/octet-stream');
      response.end(content);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise((resolve, reject) => server.listen(0, '127.0.0.1', resolve).once('error', reject));
  return server;
}

function controls(page) {
  const game = page.locator('#vc-game');
  return {
    game,
    next: game.locator('[data-vc-action="continue"]'),
    action: (name, value) => game.locator(`[data-vc-action="${name}"]${value === undefined ? '' : `[data-vc-value="${value}"]`}`),
    feedback: page.locator('#vc-feedback'),
    recall: page.locator('#vc-recall'),
    live: game.locator('.vc-stop[data-state="live"]'),
    at: stage => page.locator(`#vc-game[data-stage="${stage}"]`).waitFor({ timeout: 5000 }),
    atEcho: (level, mode = 'recall') => page.locator(`#vc-game[data-stage="echo"][data-echo-level="${level}"][data-echo="${mode}"]`).waitFor({ timeout: 5000 })
  };
}

async function focusWithTab(page, target) {
  for (let attempts = 0; attempts < 24; attempts += 1) {
    if (await target.evaluate(element => element === document.activeElement)) return;
    await page.keyboard.press('Tab');
  }
  assert.fail(`Control unreachable by Tab: ${target}`);
}

async function verifyReducedMotion(page) {
  const motion = await page.evaluate(() => {
    return {
      reduced: matchMedia('(prefers-reduced-motion: reduce)').matches,
      sustained: document.getAnimations().some(animation => animation.effect.getComputedTiming().duration > 1)
    };
  });
  assert.deepEqual(motion, { reduced: true, sustained: false });
}

async function reviewStage(page, stage, mode) {
  const label = `${stage} at ${mode.width}×${mode.height}`;
  await page.waitForFunction(() => document.getAnimations().every(animation => animation.playState !== 'running'));
  await page.evaluate(() => window.scrollTo(0, 0));
  const geometry = await page.evaluate(() => {
    const root = document.querySelector('#vc-game');
    const controls = [...document.querySelectorAll('button, textarea, input:not([type="hidden"]), a[href]')].flatMap(control => {
      const { x, right, width, height } = control.getBoundingClientRect();
      return width && height ? [{ name: control.getAttribute('aria-label') || control.textContent.trim(), x, right, width, height }] : [];
    });
    return {
      overflow: document.documentElement.scrollWidth > innerWidth + 1 || root.scrollWidth > root.clientWidth + 1,
      headingTop: root.querySelector('h1').getBoundingClientRect().top,
      badTargets: controls.filter(({ width, height, x, right }) => width < 44 || height < 44 || x < -1 || right > innerWidth + 1)
    };
  });
  assert.equal(geometry.overflow, false, `${label} horizontal overflow`);
  assert.ok(geometry.headingTop >= (mode.safeTop || 0), `${label} title under the top safe area`);
  assert.deepEqual(geometry.badTargets, [], `${label} target size and horizontal clipping`);
  if (mode.safeBottom) {
    const last = page.locator('#vc-game button:visible').last();
    const space = await last.evaluate(button => {
      window.scrollTo(0, document.documentElement.scrollHeight);
      return innerHeight - button.getBoundingClientRect().bottom;
    });
    assert.ok(space >= mode.safeBottom - 1, `${label} last action cannot scroll above the bottom safe area`);
    await page.evaluate(() => window.scrollTo(0, 0));
  }
  const report = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(report.violations.map(violation => ({
    id: violation.id,
    nodes: violation.nodes.map(node => ({ target: node.target, details: node.failureSummary }))
  })), [], label);
  if (mode.screenshot) {
    await page.screenshot({ path: path.join(output, `${stage}-390.png`), fullPage: true });
  }
}

async function verifyStorageIsolation(page) {
  const observed = await page.evaluate(() => Object.fromEntries(Object.keys(localStorage).map(key => [key, localStorage.getItem(key)])));
  assert.ok(observed[labKey], 'Gameplay creates a lab-only save');
  delete observed[labKey];
  assert.deepEqual(observed, existingStorage);
}

const savedRound = page => page.evaluate(key => JSON.parse(localStorage.getItem(key)), labKey);

async function seedStorage(context, additions = {}) {
  await context.addInitScript(fixtures => {
    if (sessionStorage.getItem('verse-circuit-qa-fixture-seeded')) return;
    for (const [key, value] of Object.entries(fixtures)) localStorage.setItem(key, value);
    sessionStorage.setItem('verse-circuit-qa-fixture-seeded', '1');
  }, { ...existingStorage, ...additions });
}

async function play(browser, url, mode) {
  const { width, height, touch, reducedMotion, safeTop = 0, safeBottom = 0 } = mode;
  const viewport = { width, height };
  const context = await browser.newContext({ viewport, isMobile: touch, hasTouch: touch, reducedMotion });
  try {
    await seedStorage(context);
    const page = await context.newPage();
    page.setDefaultTimeout(10000);
    const errors = [];
    const requests = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', response => {
      if (response.status() >= 400) errors.push(`${response.status()} ${response.url()}`);
    });
    page.on('request', request => requests.push({ url: request.url(), method: request.method() }));

    async function preparePage() {
      await page.evaluate(() => document.fonts.ready);
      if (safeTop || safeBottom) {
        await page.addStyleTag({ content: `:root { --vc-safe-top: ${safeTop}px; --vc-safe-bottom: ${safeBottom}px }` });
      }
    }

    async function activate(target) {
      if (touch) {
        await target.tap();
      } else {
        await focusWithTab(page, target);
        assert.ok(await target.evaluate(element => {
          const style = getComputedStyle(element);
          return element.matches(':focus-visible') && (parseFloat(style.outlineWidth) >= 1 || style.boxShadow !== 'none');
        }), `No visible keyboard focus: ${target}`);
        await page.keyboard.press('Enter');
      }
      if (reducedMotion === 'reduce') await verifyReducedMotion(page);
    }

    await page.goto(url.href);
    await preparePage();
    const { game, action, next, feedback, recall, live, at, atEcho } = controls(page);
    async function answer(text) {
      if (touch) {
        await recall.fill(text);
      } else {
        await focusWithTab(page, recall);
        await page.keyboard.type(text);
      }
      await activate(action('check'));
    }

    await at('trace');
    assert.equal(await feedback.getAttribute('role'), 'status');
    assert.equal(await next.isVisible() && await next.isEnabled(), false, 'Trace cannot advance before all three nodes are live');
    assert.equal(await live.count(), 1, 'The opening node is energized on arrival');
    await activate(action('trace', 1));
    assert.equal(await live.count(), 2);
    if (!touch) {
      assert.equal(await page.locator(':focus').getAttribute('aria-label'), 'that you love one another',
        'Keyboard focus reads the newly revealed phrase before the next prompt');
    }
    await reviewStage(page, 'trace', mode);
    await activate(action('trace', 2));
    assert.equal(await live.count(), 3);
    await at('trace');
    await activate(next);
    await at('link');

    const linkOrder = () => action('link').evaluateAll(modules => modules.map(module => module.dataset.vcValue));
    const firstOrder = await linkOrder();
    assert.deepEqual([...firstOrder].sort(), ['0', '1', '2']);
    assert.notDeepEqual(firstOrder, ['0', '1', '2']);
    await activate(action('link', 0));
    if (mode.outcome === 'assisted') {
      await activate(action('link', 2));
      assert.equal(await live.count(), 1, 'Mistake preserves the correct opening link');
      assert.match(await feedback.textContent(), /comes later/i);
      await activate(action('hint'));
      assert.equal(await live.count(), 1, 'Link hint does not select a module');
      assert.equal(await feedback.getAttribute('data-tone'), 'help');
      assert.match(await feedback.textContent(), /what to do/i);
      assert.equal(await action('link', 1).getAttribute('data-clue'), '', 'The clue marks the next phrase');
      const remainingOrder = await linkOrder();
      await page.reload();
      await preparePage();
      await at('link');
      assert.equal(await live.count(), 1, 'Visible linked path survived reload');
      assert.deepEqual(await linkOrder(), remainingOrder, 'The remaining phrases keep their order after reload');
      assert.equal(await action('link', 0).isVisible() && await action('link', 0).isEnabled(), false, 'Opening phrase remains placed');
    }
    await reviewStage(page, 'link', mode);
    await activate(action('link', 1));
    await activate(action('link', 2));
    assert.equal(await live.count(), 3);
    await at('link');
    await activate(next);
    await atEcho('word');
    assert.doesNotMatch(await game.innerText(), /as I have loved you\./i, 'The missing-word prompt conceals the answer');
    await reviewStage(page, 'echo-words', mode);
    if (mode.outcome === 'assisted') {
      await answer('commandment');
      await atEcho('word');
      assert.equal(await feedback.getAttribute('data-tone'), 'error');
      assert.equal(await recall.inputValue(), 'commandment');
      const error = await feedback.textContent();
      await activate(action('hint'));
      await atEcho('word');
      const hint = (await feedback.textContent()).trim();
      assert.ok(hint && hint !== error, 'The word hint gives additional, readable feedback');
      assert.equal(await recall.inputValue(), 'commandment', 'The hint does not fill a gap for the player');
    }
    await answer(missingWords);
    await atEcho('word', 'solved');
    await activate(next);
    await atEcho('phrase');
    assert.doesNotMatch(await game.innerText(), /as I have loved you\./i, 'The phrase prompt conceals the closing phrase');
    await reviewStage(page, 'echo-phrase', mode);

    if (mode.outcome === 'assisted') {
      await recall.tap();
      await page.setViewportSize({ width, height: 415 });
      await recall.scrollIntoViewIfNeeded();
      const inputBounds = await recall.boundingBox();
      assert.ok(inputBounds.y >= 0 && inputBounds.y + inputBounds.height <= 416, 'Recall remains reachable in a short viewport');
      await action('check').scrollIntoViewIfNeeded();
      const checkBounds = await action('check').boundingBox();
      assert.ok(checkBounds.y >= 0 && checkBounds.y + checkBounds.height <= 416, 'Recall action remains reachable with a short viewport');
      await page.setViewportSize(viewport);

      await answer('Love one another');
      await atEcho('phrase');
      assert.equal(await recall.inputValue(), 'Love one another');
      assert.equal(await feedback.getAttribute('data-tone'), 'error');
      await page.reload();
      await preparePage();
      await atEcho('phrase');
      assert.equal(await recall.inputValue(), 'Love one another', 'Typed draft survived reload');
      await activate(action('reveal'));
      await atEcho('phrase', 'reveal');
      assert.ok((await game.innerText()).replace(/\s+/g, ' ').includes(verse), 'Restudy shows the exact passage');
      await activate(action('hide'));
      await atEcho('phrase');
      assert.equal(await recall.inputValue(), 'Love one another', 'Restudy leaves the current draft in place');
    }
    await answer(mode.outcome === 'assisted' ? '  AS I have loved you!  ' : ending);
    await atEcho('phrase', 'solved');

    if (mode.fullVerse) {
      if (mode.outcome === 'assisted') {
        await page.reload();
        await preparePage();
        await atEcho('phrase', 'solved');
      }
      await activate(next);
      await atEcho('verse');
      assert.ok(!(await game.innerText()).replace(/\s+/g, ' ').includes(verse), 'The full-verse prompt conceals the passage');
      await reviewStage(page, 'echo-full', mode);
      if (mode.outcome === 'assisted') {
        await answer(ending);
        await atEcho('verse');
        assert.equal(await feedback.getAttribute('data-tone'), 'error');
      }
      await answer(verse);
      await atEcho('verse', 'solved');
      await activate(next);
    } else {
      await activate(next);
      await atEcho('verse');
      await activate(action('finish'));
    }

    await at('complete');
    assert.match(await game.innerText(), /Circuit complete/i);
    await verifyStorageIsolation(page);
    const outcome = await savedRound(page);
    assert.deepEqual(outcome.echoResults, {
      word: mode.outcome,
      phrase: mode.outcome,
      ...(mode.fullVerse ? { verse: 'independent' } : {})
    });
    const results = game.getByRole('list', { name: 'Recall results' });
    assert.equal(await results.getByRole('listitem').count(), mode.fullVerse ? 3 : 2);
    assert.match(await results.innerText(), mode.outcome === 'assisted' ? /With help/i : /From memory/i);
    const renderedVerse = (await game.innerText()).replace(/\s+/g, ' ');
    assert.ok(renderedVerse.includes(verse), 'Completion shows exact BSB verse');
    await reviewStage(page, 'complete', mode);
    await page.reload();
    await preparePage();
    await at('complete');
    await verifyStorageIsolation(page);

    await activate(action('replay'));
    await at('trace');
    assert.equal(await live.count(), 1);
    if (mode.skipReplay) {
      for (const id of traceSteps) await activate(action('trace', id));
      await activate(next);
      for (const id of linkSteps) await activate(action('link', id));
      await activate(next);
      await atEcho('word');
      await answer(missingWords);
      await atEcho('word', 'solved');
      await activate(next);
      await atEcho('phrase');
      await activate(action('skip'));
      await at('complete');
      assert.match(await game.innerText(), /study|reading/i);
      assert.deepEqual((await savedRound(page)).echoResults, { word: 'independent' }, 'A study-only ending records completed practice without claiming additional recall');
    }
    if (mode.outcome === 'assisted') {
      for (const id of traceSteps) await activate(action('trace', id));
      await activate(next);
      await at('link');
      assert.notDeepEqual(await linkOrder(), firstOrder, 'Replay reshuffles the phrase modules');
      await activate(action('link', 0));
      await activate(action('restart'));
      await at('trace');
      assert.equal(await live.count(), 1);
    }
    await verifyStorageIsolation(page);
    assert.deepEqual(errors, [], 'JavaScript and runtime assets load without errors');
    if (!preview) {
      assert.ok(requests.every(request => new URL(request.url).origin === url.origin && ['GET', 'HEAD'].includes(request.method)), 'Standalone game makes only local static requests');
    }
  } finally {
    await context.close();
  }
}

async function blockedStorage(browser, url) {
  const context = await browser.newContext({ viewport: { width: 320, height: 568 }, isMobile: true, hasTouch: true, reducedMotion: 'reduce' });
  try {
    await context.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw Error('Blocked'); } }));
    const page = await context.newPage();
    await page.goto(url.href);
    const { action, at, live } = controls(page);
    await at('trace');
    await action('trace', 1).tap();
    assert.equal(await live.count(), 2);
    assert.ok((await page.locator('#vc-storage-notice').textContent()).trim(), 'Storage failure is disclosed while play continues');
  } finally {
    await context.close();
  }
}

async function migratedRounds(browser, url) {
  const legacy = {
    reference: 'John 15:12', textRevision: 'BSB-2026-1', text: verse,
    stage: 'echo', seed: 3, trace: [0, 1, 2], links: [0, 1, 2], echo: 'recall',
    draft: 'as I have', hints: 1, linkHint: false, showedEcho: true,
    outcome: null, feedback: 'recall-retry', mistake: null
  };
  for (const stage of ['echo', 'complete']) {
    const complete = stage === 'complete';
    const record = complete
      ? { ...legacy, stage, draft: '', hints: 0, showedEcho: false, outcome: 'independent', feedback: '' }
      : legacy;
    const context = await browser.newContext({ viewport: { width: 390, height: 844 }, reducedMotion: 'reduce' });
    try {
      await seedStorage(context, { [labKey]: JSON.stringify(record) });
      const page = await context.newPage();
      await page.goto(url.href);
      const { game, at, atEcho, action, recall } = controls(page);
      if (complete) {
        await at('complete');
        const results = game.getByRole('list', { name: 'Recall results' });
        assert.equal(await results.getByRole('listitem').count(), 1);
        assert.match((await results.innerText()).replace(/\s+/g, ' '), /Closing phrase From memory/i);
      } else {
        await atEcho('phrase');
        assert.equal(await game.locator('#vc-steps [data-state="done"]').count(), 2, 'Migration retains the two completed circuit stages');
        assert.equal(await recall.inputValue(), legacy.draft, 'The legacy closing phrase draft retains its matching exercise');
        await recall.fill(ending);
        await action('check').click();
        await atEcho('phrase', 'solved');
        await action('finish').click();
        await at('complete');
        const updated = await savedRound(page);
        assert.equal(updated.version, 2);
        assert.deepEqual(updated.links, linkSteps, 'Migration keeps the completed linked path');
        assert.deepEqual(updated.echoResults, { phrase: 'assisted' }, 'Migration resumes correct prior level without retroactive credit');
        await page.reload();
        await at('complete');
      }
      await verifyStorageIsolation(page);
    } finally {
      await context.close();
    }
  }
}

fs.mkdirSync(output, { recursive: true });
const server = preview ? null : await localServer();
const url = new URL(preview || `http://127.0.0.1:${server.address().port}`);
url.pathname = '/verse-circuit-lab.html';
const launch = {};
if (process.env.BROWSER_PATH) launch.executablePath = process.env.BROWSER_PATH;
else if (fs.existsSync('/usr/bin/chromium')) launch.executablePath = '/usr/bin/chromium';
if (preview && process.env.HTTPS_PROXY) {
  const proxy = new URL(process.env.HTTPS_PROXY);
  launch.proxy = { server: proxy.origin, username: decodeURIComponent(proxy.username) || undefined, password: decodeURIComponent(proxy.password) || undefined };
}

let browser;
try {
  browser = await chromium.launch(launch);
  for (const mode of cases) {
    await play(browser, url, mode);
    console.log(`Verse Circuit passed ${mode.width}×${mode.height}, ${mode.touch ? 'touch' : 'keyboard only'}`);
  }
  await blockedStorage(browser, url);
  await migratedRounds(browser, url);
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify({
    cases,
    result: 'All passed',
    checks: ['Touch and keyboard journeys', 'Graduated word, phrase and whole-verse recall', 'Study-only and optional-verse completion', 'Stage and input resume', 'Legacy round migration', 'Hints and wrong answers', 'Reduced motion', 'Axe WCAG A/AA', '44px controls and no horizontal overflow', 'Short viewport during recall', 'Storage isolation and fallback', 'Replay and restart'],
    scope: 'Chromium desktop and emulated mobile viewports. Physical iOS and its software keyboard were not tested.'
  }, null, 2) + '\n');
  console.log('All Verse Circuit browser checks passed. Captures are in test-results/verse-circuit/.');
} finally {
  if (browser) await browser.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
