import assert from 'node:assert/strict';
import fs from 'node:fs';
import http from 'node:http';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import AxeBuilder from '@axe-core/playwright';
import {chromium} from 'playwright';

const root = fileURLToPath(new URL('..', import.meta.url));
const dist = path.join(root, 'dist');
const output = path.join(root, 'test-results', 'companion');
fs.mkdirSync(output, {recursive: true});
const mime = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'text/javascript',
  '.svg': 'image/svg+xml', '.ttf': 'font/ttf', '.jpg': 'image/jpeg',
  '.png': 'image/png', '.webp': 'image/webp', '.md': 'text/plain'
};
const PRIMARY = 'rallypoint-phase1-2026';
const PROFILE = 'rallypoint-today-ui-v1';
const MESSAGES = 'rallypoint-wednesday-chat-lab-v1';
const legacyMessage = 'An archived fixture note stays exactly as saved.';
const privatePrayer = 'An example of private prayer text.';
const unknownStoredData = {keep: ['this', 'existing', 'data']};
const mobileViewports = [[320, 568], [390, 844], [430, 932]];
const results = [];

async function serveStatic() {
  const server = http.createServer((request, response) => {
    try {
      const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname);
      const file = path.resolve(dist, '.' + (pathname === '/' ? '/index.html' : pathname));
      if (!file.startsWith(dist + path.sep)) {
        response.writeHead(403).end();
        return;
      }
      const contents = fs.readFileSync(file);
      response.setHeader('Content-Type', mime[path.extname(file)] || 'application/octet-stream');
      response.end(contents);
    } catch {
      response.writeHead(404).end();
    }
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  return server;
}

const server = process.env.PREVIEW_URL ? null : await serveStatic();
const base = new URL(process.env.PREVIEW_URL || 'http://127.0.0.1:' + server.address().port);
function preview(sampleWeek = true) {
  const url = new URL(base);
  url.searchParams.set('rc1', '1');
  url.searchParams.set('skipWelcome', '1');
  if (sampleWeek) url.searchParams.set('sampleWeek', '1');
  else url.searchParams.delete('sampleWeek');
  return url.href;
}

const launch = {};
if (process.env.BROWSER_PATH) launch.executablePath = process.env.BROWSER_PATH;
else if (fs.existsSync('/usr/bin/chromium')) launch.executablePath = '/usr/bin/chromium';
if (process.env.PREVIEW_URL && process.env.HTTPS_PROXY) {
  const proxy = new URL(process.env.HTTPS_PROXY);
  launch.proxy = {server: proxy.origin, username: decodeURIComponent(proxy.username) || undefined,
    password: decodeURIComponent(proxy.password) || undefined};
}

const entry = page => page.locator('[data-action="rc1-open"]').first();
const dialog = page => page.locator('#dialog-root [role="dialog"]');
const panel = page => page.locator('.rc1-panel');
const response = page => page.locator('.rc1-response');
const reply = async page => (await response(page).textContent()).replace(/\s+/g, ' ').trim();
const query = page => page.locator('#rc1-query');
const confirm = (page, operation) => panel(page).locator('[data-action="rc1-confirm"]' +
  (operation ? '[data-value="' + operation + '"]' : ''));
const navigate = (page, tab) => page.locator('#nav [data-go="' + tab + '"]').click();
const readStorage = page => page.evaluate(() => Object.fromEntries(
  Object.keys(localStorage).sort().map(key => [key, localStorage.getItem(key)])
));
const readPrimary = async page => JSON.parse((await readStorage(page))[PRIMARY]);
const assertFocused = async (locator, label) =>
  assert.equal(await locator.evaluate(node => document.activeElement === node), true, label);

async function ask(page, question) {
  await query(page).fill(question);
  await query(page).press('Enter');
  await response(page).locator('h3').waitFor();
  return reply(page);
}

async function open(page) {
  await entry(page).click();
  await query(page).waitFor();
}

async function close(page) {
  await page.keyboard.press('Escape');
  await dialog(page).waitFor({state: 'hidden'});
  await assertFocused(entry(page), 'Escape restores the Today trigger');
}

async function audit(page, label) {
  const report = await new AxeBuilder({page}).withTags(['wcag2a', 'wcag2aa', 'wcag21aa']).analyze();
  assert.deepEqual(report.violations.map(v => ({
    rule: v.id, nodes: v.nodes.map(node => ({target: node.target, details: node.failureSummary}))
  })), [], label);
}

async function geometry(page, label) {
  const geometry = await page.evaluate(() => {
    const view = document.querySelector('#view');
    const nav = document.querySelector('#nav');
    const sheet = document.querySelector('#dialog-root [role="dialog"]');
    const viewBox = view.getBoundingClientRect();
    const navBox = nav.getBoundingClientRect();
    const outsideViewport = rect => rect.left < -1 || rect.right > innerWidth + 1;
    return {
      pageOverflows: document.documentElement.scrollWidth > innerWidth + 1,
      viewOverflows: view.scrollWidth > view.clientWidth + 1,
      sheetOverflows: !!sheet && (outsideViewport(sheet.getBoundingClientRect()) ||
        sheet.scrollWidth > sheet.clientWidth + 1),
      navFits: viewBox.bottom <= navBox.top + 1 && navBox.bottom <= innerHeight + 1,
      tabTargets: [...nav.querySelectorAll('button')].map(button => {
        const rect = button.getBoundingClientRect();
        return rect.width >= 44 && rect.height >= 44 && !outsideViewport(rect);
      }),
      actionTargets: [...(sheet?.querySelectorAll('.rc1-panel button, [data-action="close-dialog"]') ??
        document.querySelectorAll('[data-action="rc1-open"]'))]
        .filter(button => button.getClientRects().length).map(button => {
          const rect = button.getBoundingClientRect();
          return {label: button.getAttribute('aria-label') || button.textContent.trim(),
            usable: rect.width >= 44 && rect.height >= 44};
        })
    };
  });
  assert.equal(geometry.pageOverflows || geometry.viewOverflows || geometry.sheetOverflows, false,
    label + ' has horizontal overflow: ' + JSON.stringify(geometry));
  assert.equal(geometry.navFits, true, label + ' clips navigation');
  assert.deepEqual(geometry.tabTargets, [true, true, true, true], label + ' keeps four usable tabs');
  assert.ok(geometry.actionTargets.every(control => control.usable), label +
    ' has a target below 44 by 44 CSS pixels: ' + JSON.stringify(geometry.actionTargets));
}

async function screenshot(page, name) {
  await page.evaluate(() => document.fonts.ready);
  await page.screenshot({path: path.join(output, name + '.png'), animations: 'disabled'});
}

async function exerciseTabs(page) {
  const sheet = dialog(page);
  assert.equal(await page.locator('.phone-inner').evaluate(el => el.inert), true);
  assert.equal(await sheet.evaluate(el => el.contains(document.activeElement)), true, 'initial dialog focus');
  for (const key of ['Shift+Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Tab', 'Tab']) {
    await page.keyboard.press(key);
    assert.equal(await sheet.evaluate(el => el.contains(document.activeElement)), true, 'focus stays in dialog');
  }
}

async function keyboardHistory(page) {
  let reachedHistory = false;
  const summary = panel(page).locator('.rc1-history summary');
  for (let i = 0; i < 12; i++) {
    await page.keyboard.press('Tab');
    reachedHistory = await summary.evaluate(node => document.activeElement === node);
    if (reachedHistory) break;
  }
  assert.equal(reachedHistory, true, 'earlier turns are reachable from the keyboard');
  await page.keyboard.press('Enter');
  assert.equal(await panel(page).locator('.rc1-history').evaluate(node => node.open), true);
}

async function fixture(browser, width, height, options = {}) {
  const context = await browser.newContext({
    viewport: {width, height}, isMobile: true, hasTouch: true, reducedMotion: 'reduce',
    timezoneId: 'America/Denver'
  });
  try {
    const page = await context.newPage();
    page.setDefaultTimeout(10_000);
    const errors = [];
    page.on('pageerror', error => errors.push(error.message));
    page.on('response', res => {
      if (res.status() >= 400 && new URL(res.url()).origin === base.origin) {
        errors.push(res.status() + ' ' + res.url());
      }
    });
    if (options.time) await page.clock.setFixedTime(new Date(options.time));
    const state = {
      role: 'member', view: 'today', rsvp: '', teamStatus: 'pending', groupPane: 'chat', teamPane: 'schedule',
      groupMessages: [{name: 'Historical sample', time: 'Yesterday', text: legacyMessage}],
      prayers: [{name: 'Private example', time: 'Yesterday', text: privatePrayer}],
      teamMessages: [{name: 'Team example', time: 'Yesterday', text: 'A saved team fixture note.'}],
      customFixture: unknownStoredData, ...options.state
    };
    const memberships = {...{group: true, team: true}, ...options.memberships};
    await page.addInitScript(({primary, profile, messages, state, memberships, chat, blocked}) => {
      if (blocked === 'all') {
        Object.defineProperty(window, 'localStorage', {get() {throw new Error('QA storage unavailable');}});
        return;
      }
      if (!sessionStorage.getItem('companionBrowserFixture')) {
        localStorage.setItem(primary, JSON.stringify(state));
        localStorage.setItem(profile, JSON.stringify({name: 'Avery', memberships}));
        if (chat !== undefined) localStorage.setItem(messages, chat);
        sessionStorage.setItem('companionBrowserFixture', '1');
      }
      if (blocked === 'writes') {
        Storage.prototype.setItem = () => {throw new Error('QA write denied');};
      }
    }, {primary: PRIMARY, profile: PROFILE, messages: MESSAGES, state, memberships,
      chat: options.chat, blocked: options.blocked});
    await page.goto(preview(options.sampleWeek), {waitUntil: 'domcontentloaded'});
    await entry(page).waitFor();
    return {page, context, errors};
  } catch (error) {
    await context.close();
    throw error;
  }
}

async function scenario(browser, width, height, ids, options, run) {
  const {page, context, errors} = await fixture(browser, width, height, options);
  try {
    await run(page);
    assert.deepEqual(errors, [], 'browser and app resource errors');
    results.push({journeys: ids, width, height, result: 'passed'});
    console.log('Passed ' + ids.join(', ') + ' at ' + width + 'px');
  } finally {
    await context.close();
  }
}

async function connected(page) {
  const width = page.viewportSize().width;
  assert.equal(await page.locator('.pa-people-rail--today').count(), 1, 'approved Today people rail');
  assert.deepEqual((await page.locator('#nav button').allTextContents()).map(label => label.trim()),
    ['Today', 'Groups', 'Team', 'Read']);
  await geometry(page, 'connected Today');
  await audit(page, 'connected Today ' + width);
  await screenshot(page, 'today-' + width);

  const before = await readStorage(page);
  await open(page);
  await exerciseTabs(page);
  let answer = await ask(page, 'Help me get ready for Wednesday');
  assert.match(answer, /Wednesday Group/i);
  assert.match(answer, /Nov(?:ember)?[\s.]+25/i);
  assert.match(answer, /6:30\s*PM/i);
  assert.match(answer, /North Commons/i);
  assert.match(answer, /3\s+unread/i);
  assert.doesNotMatch(answer, /archived fixture note|private prayer text|seeing everyone/i);
  await assertFocused(response(page).locator('h3'), 'new answer receives focus');
  await geometry(page, 'group preparation');
  await audit(page, 'group preparation ' + width);
  await screenshot(page, 'group-' + width);

  answer = await ask(page, 'What time?');
  assert.match(answer, /6:30\s*PM/i);
  answer = await ask(page, 'Where is it?');
  assert.match(answer, /North Commons/i);
  if (width === 390) await keyboardHistory(page);
  await ask(page, 'Yes, RSVP for me');
  assert.deepEqual(await readStorage(page), before, 'opening and asking never modify local records');
  await ask(page, 'What is my group RSVP?');
  assert.equal(await confirm(page, 'rsvp').count(), 1);
  await confirm(page, 'rsvp').click();
  assert.match(await reply(page), /Going/i, 'receipt rereads actual group response');
  assert.equal(await confirm(page).count(), 0, 'no repeat action after group response');
  assert.equal(await panel(page).isVisible(), true, 'receipt stays in the same sheet');
  const afterRsvp = await readStorage(page);
  assert.deepEqual({...afterRsvp, [PRIMARY]: before[PRIMARY]}, before, 'only existing primary response changed');
  assert.deepEqual(JSON.parse(afterRsvp[PRIMARY]), {...JSON.parse(before[PRIMARY]), rsvp: 'going'});
  if (width === 390) {
    await screenshot(page, 'group-saved-390');
    await panel(page).locator('[data-go="group"][data-pane="gather"]').click();
    await page.locator('.group-gather-rsvp').waitFor();
    assert.match(await page.locator('.group-gather-rsvp').textContent(), /going/i);
    assert.equal(await page.locator('[data-action="rsvp"][data-value="going"]').getAttribute('aria-pressed'), 'true');
    await navigate(page, 'today');
  } else await close(page);

  await open(page);
  const beforeServing = await readStorage(page);
  assert.doesNotMatch(await panel(page).textContent(), /Yes, RSVP for me|Where is it\?/i);
  assert.equal(await panel(page).locator('.rc1-history').count(), 0);
  answer = await ask(page, 'What time are Wednesday Group and Sunday serving?');
  assert.match(answer, /which one|which (?:commitment|topic)|choose (?:one|a topic)/i);
  assert.equal(await confirm(page).count(), 0, 'ambiguous time cannot authorize an action');

  answer = await ask(page, 'And Sunday?');
  assert.match(answer, /Welcome Team/i);
  assert.match(answer, /Nov(?:ember)?[\s.]+29/i);
  assert.match(answer, /9:00\s*AM/i);
  assert.match(answer, /North Campus/i);
  answer = await ask(page, 'What time?');
  assert.match(answer, /9:00\s*AM/i, 'context follows the new subject');
  assert.doesNotMatch(answer, /6:30\s*PM|North Commons/i);
  await ask(page, 'Yes, confirm my serving shift');
  assert.deepEqual(await readStorage(page), beforeServing, 'conversational agreement does not confirm a shift');
  await ask(page, 'What is my serving response?');
  assert.equal(await confirm(page, 'serve').count(), 1);
  await confirm(page, 'serve').click();
  assert.match(await reply(page), /confirmed/i, 'receipt rereads actual serving response');
  assert.equal(await confirm(page).count(), 0);
  const afterServing = await readStorage(page);
  assert.deepEqual({...afterServing, [PRIMARY]: beforeServing[PRIMARY]}, beforeServing);
  assert.deepEqual(JSON.parse(afterServing[PRIMARY]),
    {...JSON.parse(beforeServing[PRIMARY]), teamStatus: 'confirmed'});
  await geometry(page, 'serving receipt');
  await audit(page, 'serving receipt ' + width);
  if (width === 390) await screenshot(page, 'serve-saved-390');

  await panel(page).locator('[data-go="team"][data-pane="schedule"]').click();
  await dialog(page).waitFor({state: 'hidden'});
  await page.locator('.team-schedule-card').waitFor();
  assert.match(await page.locator('.team-schedule-card').textContent(), /confirmed/i);
  assert.match(await page.locator('.team-schedule-card').textContent(), /North Campus/i);
  await navigate(page, 'today');
  await open(page);
  assert.equal(await panel(page).locator('.rc1-history').count(), 0, 'navigation clears the session');
  await ask(page, 'Any unread group messages?');
  await panel(page).locator('[data-go="group"][data-pane="chat"]').click();
  await page.locator('#rpx-chat').waitFor();
  await navigate(page, 'today');
  await open(page);
  answer = await ask(page, 'Any unread group messages?');
  assert.match(answer, /caught up|no unread|zero unread|0\s+unread|up to date/i);
  await close(page);
  await page.reload({waitUntil: 'domcontentloaded'});
  await entry(page).waitFor();
  const restored = await readPrimary(page);
  assert.equal(restored.rsvp, 'going');
  assert.equal(restored.teamStatus, 'confirmed');
  assert.deepEqual(restored.customFixture, unknownStoredData);
  assert.equal(restored.groupMessages[0].text, legacyMessage);
  assert.equal(restored.prayers[0].text, privatePrayer);
  assert.equal(await dialog(page).count(), 0, 'reload does not reopen or restore a transcript');
}

async function visitor(page) {
  const before = await readStorage(page);
  await open(page);
  const answer = await ask(page, 'I’m new here. Where do I start?');
  assert.doesNotMatch(answer, /North Commons|North Campus|6:30|9:00|private prayer|unread/i);
  for (const tab of ['group', 'team', 'read']) {
    assert.equal(await panel(page).locator('[data-go="' + tab + '"]').count(), 1,
      'visitor can explore ' + tab);
  }
  assert.equal(await confirm(page).count(), 0);
  assert.deepEqual(await readStorage(page), before);
  await audit(page, 'visitor sheet');
  await screenshot(page, 'visitor-390');
  await panel(page).locator('[data-go="group"]').click();
  await page.locator('.group-discovery-hero').waitFor();
  await navigate(page, 'today');
  await open(page);
  await ask(page, 'Where do I start?');
  await panel(page).locator('[data-go="team"]').click();
  await page.locator('.team-empty-hero').waitFor();
  await navigate(page, 'today');
  await open(page);
  await ask(page, 'Where do I start?');
  await panel(page).locator('[data-go="read"]').click();
  await page.locator('#reading-scripture').waitFor();
  assert.deepEqual(JSON.parse((await readStorage(page))[PROFILE]).memberships, {group: false, team: false});
  const state = await readPrimary(page);
  assert.deepEqual(state.interest, []);
  assert.equal(state.rsvp, '');
  assert.equal(state.teamStatus, 'pending');
}

async function caughtUp(page) {
  // A visit to the actual thread acknowledges the modern read cursor.
  await navigate(page, 'group');
  await page.locator('#rpx-chat').waitFor();
  await navigate(page, 'today');
  const before = await readStorage(page);
  await open(page);
  assert.match(await ask(page, 'Am I all caught up?'), /caught up|nothing.*needs|all set/i);
  assert.equal(await confirm(page).count(), 0);
  await screenshot(page, 'caught-up-390');
  const serving = await ask(page, 'What is my serving response?');
  assert.match(serving, /declined|unable to serve/i);
  assert.equal(await confirm(page).count(), 0);
  assert.deepEqual(await readStorage(page), before);
}

async function leader(page) {
  const before = await readStorage(page);
  await open(page);
  let answer = await ask(page, 'Any group leader check-ins?');
  assert.match(answer, /check-in/i);
  assert.doesNotMatch(answer, /Marcus|Taylor|Anna|Jess|private prayer|attendance list/i);
  assert.equal(await panel(page).locator('[data-go="group"][data-pane="leader"]').count(), 1);
  await screenshot(page, 'leader-390');
  assert.deepEqual(await readStorage(page), before);
  await panel(page).locator('[data-go="group"][data-pane="leader"]').click();
  await page.locator('[data-action="reached"]').first().waitFor();
  assert.deepEqual((await readPrimary(page)).reached, [], 'opening the source leaves check-ins pending');
  await navigate(page, 'today');
  await open(page);
  await ask(page, 'Any group leader check-ins?');

  const other = await page.context().newPage();
  try {
    // An inert, same-origin tab triggers a real storage event without booting another app.
    const storagePage = new URL('/__companion_browser_storage__', base);
    await other.route(storagePage.href, route => route.fulfill({contentType: 'text/html',
      body: '<!doctype html><title>Fixture storage update</title>'}));
    await other.goto(storagePage.href);
    await other.evaluate(key => {
      const state = JSON.parse(localStorage.getItem(key));
      state.role = 'member';
      localStorage.setItem(key, JSON.stringify(state));
    }, PRIMARY);
    await page.waitForFunction(() => !document.querySelector('.rc1-panel [data-go="group"][data-pane="leader"]'));
    if (!(await panel(page).count())) await open(page);
    await ask(page, 'Any group leader check-ins?');
    assert.equal(await panel(page).locator('[data-go="group"][data-pane="leader"]').count(), 0);
    answer = await ask(page, 'Help me get ready for Wednesday');
    assert.match(answer, /North Commons/i, 'losing leader privileges preserves ordinary group scope');

    await other.evaluate(key => {
      const ui = JSON.parse(localStorage.getItem(key));
      ui.memberships.group = false;
      localStorage.setItem(key, JSON.stringify(ui));
    }, PROFILE);
    await page.waitForFunction(() => !document.querySelector('.rc1-panel')?.textContent.includes('North Commons'));
    if (!(await panel(page).count())) await open(page);
    assert.doesNotMatch(await panel(page).textContent(), /North Commons|6:30|ready for Wednesday/i,
      'scope change clears visible private session context');
    answer = await ask(page, 'Where is my group and what should I review as a leader?');
    assert.doesNotMatch(answer, /North Commons|6:30|Marcus|Taylor|3\s+unread/i);
    await ask(page, 'Any group leader check-ins?');
    assert.equal(await panel(page).locator('[data-go="group"][data-pane="leader"]').count(), 0);
    assert.equal(await confirm(page, 'rsvp').count(), 0);
    assert.equal((await readPrimary(page)).rsvp, '');
    answer = await ask(page, 'And Sunday?');
    assert.match(answer, /Welcome Team|North Campus/i, 'independent team scope remains');
  } finally {
    await other.close();
  }
}

async function staleControl(page) {
  await open(page);
  await ask(page, 'What is my group RSVP?');
  assert.equal(await confirm(page, 'rsvp').count(), 1);
  // Writes in this document dispatch no storage event. The stale rendered control must check again.
  await page.evaluate(key => {
    const ui = JSON.parse(localStorage.getItem(key));
    ui.memberships.group = false;
    localStorage.setItem(key, JSON.stringify(ui));
  }, PROFILE);
  const revoked = await readStorage(page);
  await confirm(page, 'rsvp').click();
  assert.deepEqual(await readStorage(page), revoked);
  assert.equal(await confirm(page, 'rsvp').count(), 0);
  assert.equal((await readPrimary(page)).rsvp, '');
}

async function uncertainty(page) {
  const before = await readStorage(page);
  await open(page);
  const bad = await ask(page, 'Any unread group messages?');
  assert.match(bad, /unavailable|couldn.t|can.t (?:tell|see|verify|read)|unknown/i);
  assert.doesNotMatch(bad, /(?:0|zero|no)\s+unread/i);
  await screenshot(page, 'uncertain-390');
  const unresolved = await ask(page, 'Am I all caught up?');
  assert.match(unresolved, /unavailable|couldn.t|can.t (?:tell|see|verify|read)|unknown/i);
  assert.doesNotMatch(unresolved, /^you(?: are|.re) (?:all )?caught up\b/i);
  const future = await ask(page, 'What time do we meet next week?');
  assert.match(future, /next week|future|schedul|date/i);
  assert.doesNotMatch(future, /6:30|9:00|Nov(?:ember)?[\s.]+(?:25|29)/i);
  assert.equal(await confirm(page).count(), 0);
  const unsupported = await ask(page, 'Send a message to everyone for me');
  assert.match(unsupported, /can (?:only|help)|can.t|cannot|try|support/i);
  assert.equal(await panel(page).locator('[data-go="group"][data-pane="chat"]').count(), 0);
  assert.equal(await confirm(page).count(), 0);
  assert.match(await ask(page, 'No thanks'), /stop here|whenever|of course/i);
  assert.equal(await confirm(page).count(), 0);
  assert.deepEqual(await readStorage(page), before);
}

async function staleSchedule(page) {
  await open(page);
  const group = await ask(page, 'What time is Wednesday Group?');
  assert.doesNotMatch(group, /6:30|Nov(?:ember)?[\s.]+25/i);
  assert.match(group, /unknown|(?:no|don.t|couldn.t|can.t|not).*date|unavailable|verify/i);
  assert.equal(await confirm(page, 'rsvp').count(), 0);
  await panel(page).locator('[data-go="group"][data-pane="gather"]').click();
  assert.match(await page.locator('.group-gather-rsvp').textContent(), /no upcoming/i);
  assert.equal(await page.locator('[data-action="rsvp"]').count(), 0);
  await navigate(page, 'today');
  await open(page);
  const serving = await ask(page, 'What should I know before I serve?');
  assert.doesNotMatch(serving, /9:00|Nov(?:ember)?[\s.]+29/i);
  assert.equal(await confirm(page, 'serve').count(), 0);
  await panel(page).locator('[data-go="team"][data-pane="schedule"]').click();
  assert.match(await page.locator('.team-schedule-card').textContent(), /date unavailable|no upcoming sample date/i);
  assert.equal(await page.locator('[data-action="shift"]').count(), 0);
}

async function blockedStorage(page) {
  await open(page);
  const answer = await ask(page, 'What time is Wednesday Group?');
  assert.match(answer, /membership could not be verified|membership.*unavailable/i);
  assert.doesNotMatch(answer, /North Commons|6:30|unread/i);
  assert.equal(await confirm(page).count(), 0);
  await close(page);
}

async function deniedWrite(page) {
  const before = await readStorage(page);
  await open(page);
  await ask(page, 'What is my group RSVP?');
  const action = confirm(page, 'rsvp');
  if (await action.count()) {
    await action.click();
    assert.match(await panel(page).locator('.rc1-notice').textContent(), /not saved|could(?:n.t| not) save/i);
  }
  assert.doesNotMatch(await reply(page), /Your RSVP is saved|Going is saved|RSVP was saved/i);
  assert.match(await panel(page).textContent() + ' ' + await page.locator('#view').textContent(),
    /can.t save|could not save|couldn.t save|could not be saved|unavailable|storage/i);
  assert.deepEqual(await readStorage(page), before);
}

let browser;
try {
  browser = await chromium.launch(launch);
  for (const [width, height] of mobileViewports) {
    await scenario(browser, width, height, ['J2', 'J3', 'mobile accessibility'], {}, connected);
  }
  await scenario(browser, 390, 844, ['J1'], {state: {role: 'leader'},
    memberships: {group: false, team: false}}, visitor);
  await scenario(browser, 390, 844, ['J4', 'declined response'], {
    state: {rsvp: 'going', teamStatus: 'declined', read: false}}, caughtUp);
  await scenario(browser, 390, 844, ['J5', 'cross-tab revocation'], {state: {role: 'leader'}}, leader);
  await scenario(browser, 390, 844, ['J5', 'stale action'], {}, staleControl);
  await scenario(browser, 390, 844, ['J6', 'damaged conversation'], {
    state: {rsvp: 'going', teamStatus: 'confirmed'}, chat: '{damaged'}, uncertainty);
  await scenario(browser, 390, 844, ['J6', 'past one-off fixtures'], {
    sampleWeek: false, time: '2026-12-07T17:00:00.000Z'}, staleSchedule);
  await scenario(browser, 390, 844, ['J6', 'storage unavailable'], {blocked: 'all'}, blockedStorage);
  await scenario(browser, 390, 844, ['J6', 'write denied'], {blocked: 'writes'}, deniedWrite);
  console.log('Rally Companion integrated mobile journeys and accessibility passed.');
} finally {
  fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(results, null, 2) + '\n');
  await browser?.close();
  if (server) await new Promise(resolve => server.close(resolve));
}
