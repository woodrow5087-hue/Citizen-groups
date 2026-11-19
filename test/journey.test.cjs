const { test } = require('node:test');
const assert = require('node:assert/strict');
const { readFileSync } = require('node:fs');
const { join } = require('node:path');
const { JSDOM } = require('jsdom');

const source = name => readFileSync(join(__dirname, '..', name), 'utf8');
const KEY = 'citizen-connect-journey-v1';
function open(t, prior) {
  const dom = new JSDOM(source('journey.html'), { url:'https://example.test/journey.html', runScripts:'outside-only' });
  t.after(()=>dom.window.close());
  const {window} = dom;
  if (prior) window.localStorage.setItem(KEY, JSON.stringify(prior));
  window.eval(source('journey.js'));
  const document = window.document;
  return {
    window,document,
    click: selector => {
      const button = document.querySelector(selector);
      assert.ok(button, 'Button exists: ' + selector);
      button.click();
    },
    saved: () => JSON.parse(window.localStorage.getItem(KEY)),
    stage: () => document.querySelector('[data-stage][aria-selected="true"]').dataset.stage,
    text: () => document.querySelector('#journey-view').textContent
  };
}

test('Newcomer opens on Attract with fictional group discovery and clear data disclaimer', t => {
  const ui = open(t);
  assert.equal(ui.stage(), 'attract');
  assert.equal(ui.document.querySelectorAll('[data-choose-group]').length, 3);
  assert.match(ui.text(), /Find your people/);
  assert.match(ui.document.querySelector('.legal-note').textContent, /No messages, registrations, or sign-ups are transmitted/);
});

test('Choosing a group opens a personalized circle and saves the selection', t => {
  const ui = open(t);
  ui.click('[data-choose-group="young"]');
  assert.equal(ui.stage(), 'connect');
  assert.match(ui.text(), /Young Adults/);
  assert.equal(ui.saved().group, 'young');
});

test('Group member persona starts in Connect and can try Read/Share/Memorize/Pray', t => {
  const ui = open(t);
  ui.click('[data-persona="member"]');
  assert.equal(ui.stage(), 'connect');
  ui.click('[data-stage="attract"]');
  assert.equal(ui.document.querySelectorAll('[data-habit]').length, 4);
  ui.click('[data-habit="read"]');
  assert.equal(ui.saved().habits.includes('read'), true);
  assert.equal(ui.document.querySelector('[data-habit="read"]').getAttribute('aria-pressed'), 'true');
});

test('Encouragement, prayer and RSVP save only to local demo data', t => {
  const ui = open(t);
  ui.click('[data-stage="connect"]');
  ui.click('[data-toggle="prayed"]');
  ui.click('[data-toggle="encouraged"]');
  ui.click('[data-rsvp="going"]');
  assert.equal(ui.saved().prayed, true);
  assert.equal(ui.saved().encouraged, true);
  assert.equal(ui.saved().rsvp, 'going');
  assert.match(ui.text(), /I’m going/);
});

test('Serve Together interest toggles, persists and never claims registration', t => {
  const ui = open(t);
  ui.click('[data-stage="activate"]');
  assert.equal(ui.document.querySelectorAll('[data-serve]').length, 3);
  ui.click('[data-serve="food-drive"]');
  assert.deepEqual(ui.saved().interested, ['food-drive']);
  assert.match(ui.text(), /Nothing has been submitted/);
  ui.click('[data-serve="food-drive"]');
  assert.deepEqual(ui.saved().interested, []);
});

test('Reset restores a clean newcomer journey without affecting existing Today storage', t => {
  const ui = open(t);
  ui.click('[data-stage="activate"]');
  ui.click('[data-serve="food-drive"]');
  ui.click('#restart');
  assert.equal(ui.stage(), 'attract');
  assert.deepEqual(ui.saved().interested, []);
  assert.equal(ui.document.querySelector('[data-persona="new"]').getAttribute('aria-pressed'), 'true');
  assert.equal(ui.window.localStorage.getItem('citizen-connect-demo-v038'), null);
});

test('Returning to the journey restores local choices but still offers a fresh first view', t => {
  const ui = open(t, {group:'young',prayed:true,encouraged:false,rsvp:'maybe',interested:['camp-prep'],habits:[]});
  assert.equal(ui.stage(), 'attract');
  ui.click('[data-stage="connect"]');
  assert.match(ui.text(), /Young Adults/);
  assert.equal(ui.document.querySelector('[data-toggle="prayed"]').getAttribute('aria-pressed'), 'true');
  ui.click('[data-stage="activate"]');
  assert.equal(ui.document.querySelector('[data-serve="camp-prep"]').getAttribute('aria-pressed'), 'true');
});

test('Group-specific gathering day and time match the selected fictional group', t => {
  const ui = open(t);
  ui.click('[data-choose-group="family"]');
  assert.equal(ui.stage(), 'connect');
  assert.match(ui.text(), /Family Circle/);
  assert.match(ui.text(), /SUN/);
  assert.match(ui.text(), /5:00/);
});