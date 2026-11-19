const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { JSDOM } = require('jsdom');

process.env.TZ = 'America/Denver';
const source = name => readFileSync(join(__dirname, '..', name), 'utf8');
const storageKey = 'citizen-buddycheck-concept-v1';

function open(t, { time = '2026-11-18T23:59:59', saved } = {}) {
  // These archived app.js regressions require its original shell IDs. The live
  // Premium Hybrid page is self-contained and covered by premium-hybrid.test.cjs.
  const legacyShell = '<!doctype html><html lang="en"><body><div class="phone-shell"><main id="content"></main><nav id="bottom-nav"></nav><div id="sheet-root"></div><div id="toast" hidden></div></div></body></html>';
  const dom = new JSDOM(legacyShell, { url: 'https://demo.test', runScripts: 'outside-only' });
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
