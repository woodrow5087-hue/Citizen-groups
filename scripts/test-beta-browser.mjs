import { chromium } from "playwright";
import { createFixtures, checked } from "./beta-fixtures.mjs";
const f = await createFixtures();
const browser = await chromium.launch({
  executablePath: "/usr/bin/chromium",
  headless: true,
  args: ["--no-sandbox"],
});
const p = await browser.newPage();
const session = checked(await f.a.client.auth.getSession()).session;
await p.addInitScript(
  (s) =>
    localStorage.setItem(
      "citizen-beta-auth:127.0.0.1:54321",
      JSON.stringify(s),
    ),
  session,
);
p.setDefaultTimeout(15000);
const errors = [];
p.on("console", (m) => {
  if (m.type() === "error")
    console.log(
      "Browser:",
      m.text().replace(/Bearer [A-Za-z0-9_.-]+/g, "Bearer [redacted]"),
    );
});
p.on("pageerror", (e) => errors.push(e.message));
await p.goto("http://127.0.0.1:4177");
await p.getByRole("button", { name: "My Group", exact: true }).click();
await p.getByRole("button", { name: /Share something/ }).click();
await p
  .getByRole("textbox", { name: "Group post" })
  .fill("Fictional browser beta post");
await p.getByRole("button", { name: "Post to group", exact: true }).click();
await p.getByText("Fictional browser beta post", { exact: true }).waitFor();
for (const width of [320, 375, 390, 430, 980]) {
  await p.setViewportSize({ width, height: 844 });
  if (await p.evaluate(() => document.documentElement.scrollWidth > innerWidth))
    throw Error("Overflow " + width);
}
const meeting = checked(
  await f.leader.client
    .from("meetings")
    .insert({
      group_id: f.groupA.id,
      title: "Fictional browser gathering",
      starts_at: new Date(Date.now() + 86400000).toISOString(),
    })
    .select("id")
    .single(),
);
const b = await browser.newPage();
const sb = checked(await f.b.client.auth.getSession()).session;
await b.addInitScript(
  (s) =>
    localStorage.setItem(
      "citizen-beta-auth:127.0.0.1:54321",
      JSON.stringify(s),
    ),
  sb,
);
await b.goto("http://127.0.0.1:4177");
await b.getByRole("button", { name: "My Group", exact: true }).click();
await b.getByText("Fictional browser beta post", { exact: true }).waitFor();
await b
  .locator("summary")
  .filter({ hasText: /Comments/ })
  .first()
  .click();
await b
  .getByRole("textbox", { name: "Add a comment" })
  .fill("Fictional second browser reply");
await b.getByRole("button", { name: "Post comment", exact: true }).click();
await p.getByRole("button", { name: "Refresh", exact: true }).click();
await p
  .locator("summary")
  .filter({ hasText: /Comments/ })
  .first()
  .click();
await p.getByText("Fictional second browser reply", { exact: true }).waitFor();
await p.getByRole("tab", { name: "Resources", exact: true }).click();
await p.getByRole("button", { name: /Group prayer requests/ }).click();
await p.getByRole("button", { name: "Add a prayer request" }).click();
await p
  .getByRole("textbox", { name: "Shared prayer request" })
  .fill("Fictional browser prayer");
await p
  .getByRole("button", { name: "Share prayer request", exact: true })
  .click();
await b.getByRole("button", { name: "Refresh", exact: true }).click();
await b.getByRole("tab", { name: "Resources", exact: true }).click();
await b.getByRole("button", { name: /Group prayer requests/ }).click();
await b.getByText("Fictional browser prayer", { exact: true }).waitFor();
await b.getByRole("button", { name: "I prayed", exact: true }).click();
await b.getByRole("button", { name: "✓ You prayed" }).waitFor();
await b.keyboard.press("Escape");
await b.getByRole("tab", { name: "Plan", exact: true }).click();
await b.getByRole("button", { name: "I'm going", exact: true }).click();
await p.getByRole("button", { name: "Refresh", exact: true }).click();
await p.getByRole("tab", { name: "Plan", exact: true }).click();
await p.getByText("Group RSVPs (1 going)", { exact: true }).waitFor();
console.log(
  "PASS two real browser sessions share posts, comments, prayers, acknowledgements and RSVPs",
);
if (errors.length) throw Error(errors.join("\n"));
console.log(
  "PASS connected browser session, shared post and five responsive widths",
);
await browser.close();
