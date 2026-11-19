const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { JSDOM } = require('jsdom');

process.env.TZ = 'America/Denver';
const source = name => readFileSync(join(__dirname, '..', name), 'utf8');
const storageKey = 'citizen-connect-demo-v038';
const oldStorageKey = 'citizen-buddycheck-concept-v1';

function open(t, { time = '2026-11-18T23:59:59', saved, oldSaved, theme, unavailableStorage = false } = {}) {
  const dom = new JSDOM(source('index.html'), { url: 'https://demo.test', runScripts: 'outside-only' });
  t.after(() => dom.window.close());
  const { window } = dom;
  const { document, localStorage } = window;
  let now = new Date(time).getTime();
  const timers = new Map();
  let nextId = 0;
  window.Date = class extends Date {
    constructor(...args) { super(...(args.length ? args : [now])); }
    static now() { return now; }
  };
  window.setTimeout = (fn, delay) => {
    timers.set(++nextId, { fn, due: now + delay });
    return nextId;
  };
  window.clearTimeout = id => timers.delete(id);
  if (saved) localStorage.setItem(storageKey, JSON.stringify(saved));
  if (oldSaved) localStorage.setItem(oldStorageKey, JSON.stringify(oldSaved));
  if (theme) localStorage.setItem('citizen-connect-theme', theme);
  if (unavailableStorage) window.Storage.prototype.setItem = () => { throw new Error('Unavailable'); };
  window.eval(source('theme.js'));
  window.eval(source('app.js'));

  function click(selector) {
    const element = document.querySelector(selector);
    assert.ok(element, selector);
    element.click();
  }
  function type(selector, text) {
    const field = document.querySelector(selector);
    field.value = text;
    field.dispatchEvent(new window.Event('input', { bubbles: true }));
  }
  function advance(time, fire = true) {
    now = new Date(time).getTime();
    if (fire) {
      for (const [id, timer] of [...timers]) {
        if (timer.due <= now && timers.delete(id)) timer.fn();
      }
    }
  }
  return { window, document, advance, type, click,
    action: name => click('[data-action="' + name + '"]'),
    grow: name => click('[data-grow="' + name + '"]'),
    tab: name => click('nav [data-tab="' + name + '"]'),
    saved: () => JSON.parse(localStorage.getItem(storageKey)),
    text: () => document.querySelector('main').textContent };
}

test('Read, Share, Memorize and Pray update progress through their screen controls', t => {
  const ui = open(t);
  ui.grow('read');
  ui.action('finish');
  ui.grow('share');
  ui.action('save-share');
  assert.equal(ui.saved().daily.done.share, false);
  ui.type('#reflection', '  A thought  ');
  ui.action('save-share');
  ui.grow('memorize');
  ui.action('check-memory');
  for (const word of ['know', 'good', 'love', 'called', 'always']) ui.click('[data-word="' + word + '"]');
  ui.action('check-memory');
  assert.match(ui.text(), /Not quite/);
  ui.click('[data-index="4"]');
  ui.click('[data-word="purpose"]');
  ui.action('check-memory');
  assert.match(ui.text(), /Perfect!/);
  ui.grow('pray');
  ui.action('finish-pray');
  assert.ok(ui.document.querySelector('.celebrate'));
  ui.action('finish-pray');
  assert.equal(ui.saved().persistent.totalComplete, 1);
  ui.tab('today');
  assert.match(ui.text(), /4 of 4 today/);
  const again = open(t, { saved: ui.saved() });
  assert.match(again.text(), /4 of 4 today/);
  again.tab('groups');
  assert.match(again.text(), /A thought/);
});

test('a prayer draft survives acknowledgments, navigation, reload and midnight without completing Pray', t => {
  let ui = open(t);
  ui.grow('pray');
  ui.type('#prayer-request', 'Please pray for <someone>');
  ui.action('prayed');
  ui.tab('groups');
  ui = open(t, { saved: ui.saved() });
  ui.grow('pray');
  ui.advance('2026-11-19T00:00:00');
  assert.equal(ui.document.querySelector('#prayer-request').value, 'Please pray for <someone>');
  assert.equal(ui.saved().daily.done.pray, false);
  assert.equal(ui.saved().persistent.prayerRequest, '');
  ui.action('finish-pray');
  assert.equal(ui.saved().persistent.prayerRequest, 'Please pray for <someone>');
  ui.type('#prayer-request', '');
  ui.action('prayed');
  assert.equal(ui.document.querySelector('#prayer-request').value, '');
});

test('midnight clears daily actions and retains saved writings, reactions and RSVP', t => {
  const ui = open(t);
  ui.grow('share');
  ui.type('#reflection', 'First day');
  ui.action('save-share');
  ui.grow('pray');
  ui.action('prayed');
  ui.type('#prayer-request', 'Prayer');
  ui.action('finish-pray');
  ui.grow('memorize');
  ui.click('[data-word=know]');
  ui.tab('groups');
  ui.action('encourage');
  ui.action('react');
  ui.click('[data-value=going]');
  ui.advance('2026-11-19T00:00:00');
  const { daily, persistent } = ui.saved();
  assert.deepEqual(Object.values(daily.done), [false, false, false, false]);
  for (const key of ['words', 'prayed', 'encouraged']) assert.deepEqual(daily[key], []);
  assert.equal(persistent.prayerRequest, 'Prayer');
  assert.equal(persistent.rsvp, 'going');
  assert.equal(persistent.reactions.length, 1);
  assert.match(ui.text(), /Saved locally 2026-11-18/);
  ui.tab('today');
  ui.grow('share');
  assert.equal(ui.document.querySelector('#reflection').value, '');
  ui.type('#reflection', 'Second day');
  ui.action('save-share');
  ui.tab('groups');
  assert.match(ui.text(), /Second day.*First day/);
});

test('migrates older and same-day v1 storage without losing saved work', t => {
  const saved = { date:'2026-11-18', done:{ read:true }, words:['know'],
    reflection:'Legacy note', prayerRequest:'Legacy request', rsvp:'maybe', totalComplete:3 };
  for (const [time, complete] of [['2026-11-18T12:00:00', true], ['2026-11-19T12:00:00', false]]) {
    const ui = open(t, { time, saved });
    const data = ui.saved();
    assert.equal(data.daily.done.read, complete);
    assert.deepEqual(data.daily.words, complete ? ['know'] : []);
    assert.equal(data.persistent.reflections[saved.date], saved.reflection);
    assert.equal(data.persistent.prayerRequest, saved.prayerRequest);
    assert.equal(data.persistent.rsvp, 'maybe');
    assert.equal(data.persistent.totalComplete, 3);
    assert.deepEqual(open(t, { time, saved:data }).saved(), data);
  }
});

test('a delayed first tap is credited to the new local day, including after several days asleep', t => {
  const ui = open(t);
  ui.grow('read');
  ui.action('finish');
  ui.grow('share');
  ui.type('#reflection', 'Still writing');
  ui.advance('2026-11-22T08:00:00', false);
  ui.action('save-share');
  const { daily, persistent } = ui.saved();
  assert.equal(daily.date, '2026-11-22');
  assert.equal(daily.done.read, false);
  assert.equal(daily.done.share, true);
  assert.equal(persistent.reflections[daily.date], 'Still writing');
});

test('foreground resume updates the screen and reschedules midnight on 23- and 25-hour days', t => {
  for (const day of ['2026-03-08', '2026-11-01']) {
    const tomorrow = day === '2026-03-08' ? '2026-03-09' : '2026-11-02';
    const ui = open(t, { time:day + 'T00:00:00' });
    ui.grow('read');
    ui.action('finish');
    ui.advance(day + 'T23:59:59');
    assert.equal(ui.saved().daily.done.read, true);
    ui.advance(tomorrow + 'T00:00:00');
    assert.equal(ui.saved().daily.date, tomorrow);
    ui.action('finish');
    ui.advance('2027-01-02T06:30:00', false);
    ui.window.dispatchEvent(new ui.window.Event('pageshow'));
    assert.match(ui.text(), /Mark reading complete/);
  }
});


test('Grow opens on Read by default, while direct Memorize navigation still works', t => {
  const ui = open(t);
  ui.tab('grow');
  assert.ok(ui.document.querySelector('.seg-btn.active[data-grow="read"]'));
  assert.match(ui.text(), /TODAY.S PASSAGE/);
  ui.grow('memorize');
  assert.ok(ui.document.querySelector('.seg-btn.active[data-grow="memorize"]'));
  ui.tab('today');
  ui.tab('grow');
  assert.ok(ui.document.querySelector('.seg-btn.active[data-grow="read"]'));
});

test('daily progress ring labels remain structured for narrow phone screens', t => {
  const ui = open(t);
  const ring = ui.document.querySelector('.today-hero .daily-ring');
  assert.ok(ring);
  assert.equal(ring.querySelector('.ring-center strong').textContent, '0/4');
  assert.deepEqual([...ring.querySelectorAll('.ring-label > span')].map(x => x.textContent), ['Daily', 'rhythm']);
  assert.match(ring.getAttribute('aria-label'), /0 of 4 today/);
});

test('new preview starts at zero despite earlier demo selections and retains new progress', t => {
  const ui = open(t, { oldSaved: { version:2, daily: {
    date:'2026-11-18', done:{read:true,share:true,memorize:false,pray:false},
    prayed:[], encouraged:[], words:[], memoryResult:''
  }, persistent:{reflections:{},prayerRequest:'',prayerDraft:null,rsvp:'',reactions:[],totalComplete:0} } });
  assert.equal(ui.saved().daily.done.read, false);
  assert.equal(ui.saved().daily.done.share, false);
  assert.match(ui.text(), /0 of 4 today/);
  assert.ok(ui.document.querySelector('.habit-tile.featured[data-grow="read"]'));
  ui.grow('read');
  ui.action('finish');
  const reloaded = open(t, { saved:ui.saved() });
  assert.equal(reloaded.saved().daily.done.read, true);
  assert.equal(reloaded.saved().daily.done.share, false);
});

test('Today recommendation advances in order without losing saved work on reload', t => {
  const ui = open(t);
  function recommended(key, step) {
    ui.tab('today');
    const next = ui.document.querySelector('.rhythm-nudge');
    assert.equal(next.dataset.grow, key);
    assert.match(next.textContent, new RegExp(step + ' OF 4'));
    next.click();
    assert.equal(ui.document.querySelector('nav [aria-current="page"]').dataset.tab, 'grow');
  }
  recommended('read', 1);
  ui.action('finish');
  recommended('share', 2);
  ui.type('#reflection', 'A locally saved thought');
  ui.action('save-share');
  recommended('memorize', 3);
  for (const word of ['know','good','love','called','purpose']) ui.click('[data-word="' + word + '"]');
  ui.action('check-memory');
  recommended('pray', 4);
  ui.action('finish-pray');
  const reloaded = open(t, { saved:ui.saved() });
  assert.match(reloaded.document.querySelector('.rhythm-finished').textContent, /All four, complete/);
  assert.equal(reloaded.saved().persistent.totalComplete, 1);
  reloaded.click('.rhythm-finished [data-tab="groups"]');
  assert.match(reloaded.text(), /A locally saved thought/);
});

test('Today previews and local encouragement preserve their disclosures and navigation', t => {
  const ui = open(t);
  ui.action('serve');
  assert.match(ui.document.querySelector('[role="dialog"]').textContent, /Serve Together/);
  assert.match(ui.document.querySelector('[role="dialog"]').textContent, /preview|fictional|sample/i);
  ui.action('close-sheet');
  ui.action('encourage');
  assert.equal(ui.document.querySelector('.round-react').getAttribute('aria-pressed'), 'true');
  assert.match(ui.document.querySelector('#toast').textContent, /No message was sent/);
  ui.action('encourage');
  assert.deepEqual(ui.saved().daily.encouraged, ['anna']);
  const reloaded = open(t, { saved:ui.saved() });
  assert.equal(reloaded.document.querySelector('.round-react').getAttribute('aria-pressed'), 'true');
  // jsdom has no layout/scroll implementation; assert the existing destination and focus.
  reloaded.window.HTMLElement.prototype.scrollIntoView = function() {};
  reloaded.action('gathering');
  assert.equal(reloaded.document.activeElement.id, 'group-gathering');
  for (const id of ['today','grow','groups','you']) {
    reloaded.tab(id);
    assert.equal(reloaded.document.querySelectorAll('nav [aria-current="page"]').length, 1);
    assert.equal(reloaded.document.querySelector('nav [aria-current="page"]').dataset.tab, id);
    assert.equal(reloaded.document.querySelectorAll('nav button svg[aria-hidden="true"]').length, 4);
  }
});


test('appearance switch defaults to light, persists separately, and leaves progress and drafts intact', t => {
  const ui = open(t);
  assert.equal(ui.document.documentElement.dataset.theme, 'light');
  ui.grow('read'); ui.action('finish');
  ui.tab('you');
  const before = ui.saved();
  const control = ui.document.querySelector('[role="switch"]');
  control.focus(); control.click();
  assert.equal(ui.document.activeElement, control);
  assert.equal(control.getAttribute('aria-checked'), 'true');
  assert.equal(ui.document.documentElement.dataset.theme, 'dark');
  assert.deepEqual(ui.saved(), before);
  const reloaded = open(t, {saved:ui.saved(),theme:ui.window.localStorage.getItem('citizen-connect-theme')});
  assert.equal(reloaded.document.documentElement.dataset.theme, 'dark');
  reloaded.tab('you'); reloaded.action('toggle-theme');
  assert.equal(reloaded.document.documentElement.dataset.theme, 'light');
  assert.equal(reloaded.document.querySelector('[role="switch"]').getAttribute('aria-checked'), 'false');
});

test('invalid appearance values fall back to light and unavailable storage allows session toggling', t => {
  const ui = open(t, {theme:'invalid',unavailableStorage:true});
  assert.equal(ui.document.documentElement.dataset.theme,'light');
  ui.tab('you'); ui.action('toggle-theme');
  assert.equal(ui.document.documentElement.dataset.theme,'dark');
  ui.tab('today'); ui.tab('you');
  assert.equal(ui.document.querySelector('[role="switch"]').getAttribute('aria-checked'),'true');
});

test('You keeps appearance in bottom controls and preserves the live Memorizer award state', t => {
  const ui = open(t);
  ui.tab('you');
  for (const section of ['awards','history','stats']) {
    ui.click('[data-profile="' + section + '"]');
    assert.ok(ui.document.querySelector('.demo-controls [role="switch"]'));
    assert.equal(ui.document.querySelector('.you-hero [role="switch"]'), null);
  }
  ui.click('[data-profile="awards"]');
  assert.equal(ui.document.querySelectorAll('.award').length,8);
  assert.match(ui.document.querySelectorAll('.award')[2].textContent,/Next to unlock/);
  ui.tab('grow'); ui.grow('memorize');
  for (const word of ['know','good','love','called','purpose']) ui.click('[data-word="' + word + '"]');
  ui.action('check-memory'); ui.tab('you');
  const memory = ui.document.querySelectorAll('.award')[2];
  assert.equal(memory.classList.contains('locked'), false);
  assert.match(memory.textContent,/Earned today/);
});
