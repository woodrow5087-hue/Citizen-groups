'use strict';
// Isolated, dependency-free state-machine regression check for the Verse Circuit lab.
// Run: node test/verse-circuit-playground.test.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const html = fs.readFileSync(path.join(__dirname, '..', 'verse-circuit-playground.html'), 'utf8');
const scripts = [...html.matchAll(/<script src="(verse-circuit-[^"]+\.js)"><\/script>/g)].map(m=>m[1]);
assert.equal(scripts.length, 3, 'Content, engine and presentation scripts exist');
const storage = new Map();
const listeners = {};
const game = {
  innerHTML: '',
  addEventListener(name, callback) { listeners['game:' + name] = callback; },
  querySelector(selector) {
    if (selector === 'h1') return { focus() {} };
    return { classList: { add() {}, remove() {} } };
  },
  querySelectorAll() { return []; }
};
const audio = {
  style: {},
  attributes: {},
  setAttribute(name, value) { this.attributes[name] = value; },
  addEventListener(name, callback) { listeners['audio:' + name] = callback; }
};
const live = { textContent: '' };
const document = {
  activeElement: { focus() {} },
  getElementById(id) { return { game, audio, live }[id] || null; },
  addEventListener(name, callback) { listeners['document:' + name] = callback; },
  createElement() {
    return {
      innerHTML: '', className: '',
      querySelector() { return { focus() {} }; },
      remove() {}
    };
  },
  body: { appendChild() {} }
};
const context = {
  document,
  window: { scrollTo() {} },
  localStorage: {
    getItem(key) { return storage.get(key) ?? null; },
    setItem(key, value) { storage.set(key, value); }
  },
  requestAnimationFrame(callback) { callback(); },
  setTimeout() {},
  console
};
vm.createContext(context);
for(const file of scripts)vm.runInContext(fs.readFileSync(path.join(__dirname,'..',file),'utf8'),context,{filename:file,timeout:3000});

function click(action, value) {
  const btn = {
    disabled: false,
    dataset: { action, value },
    classList: { add() {}, remove() {} }
  };
  listeners['game:click']({ target: { closest() { return btn; } } });
}
function state() { return JSON.parse(storage.get('verse-circuit-design-v1')); }
function screen(expected) {
  assert.equal(state().screen, expected);
  assert.ok(game.innerHTML.includes('class="screen"'), expected + ' rendered');
}
assert.match(game.innerHTML, /VERSE<em>PLAY/);
assert.match(game.innerHTML, /WORD RUSH/);
assert.match(game.innerHTML, /CROSSROADS/);
assert.match(game.innerHTML, /THREADS/);
click('launch'); screen('launch');
click('start'); screen('trace');
click('next'); screen('trace'); // Cannot skip stage.
for (const anchor of ['commandment', 'love one another', 'loved you']) click('trace', anchor);
assert.equal(state().trace.length, 3);
click('next'); screen('link');
click('link', '2'); assert.equal(state().link.length, 0, 'Incorrect order does not advance');
assert.equal(state().mistakes, 1);
click('hint'); assert.equal(state().hints, 1);
click('link', '0'); click('link', '1'); click('link', '2');
assert.equal(state().link.length, 3);
click('next'); screen('echo');
click('echo', 'listen'); assert.equal(state().echo.length, 0, 'Wrong answer does not advance');
for (const answer of ['commandment', 'one another', 'loved']) click('echo', answer);
assert.equal(state().echo.length, 3);
click('next'); screen('win');
assert.equal(state().completed, true);
click('afterglow'); screen('afterglow');
assert.match(game.innerHTML, /MARK 12:31/);
click('home'); screen('home');
click('launch'); click('start'); screen('trace');
assert.equal(state().completed, false, 'Replay resets completion');
assert.equal(state().mistakes, 0, 'Replay resets errors');
listeners['audio:click']();
assert.equal(state().sound, true, 'Audio preference can be changed');
assert.equal(audio.attributes['aria-pressed'], 'true');
console.log('Verse Circuit state-machine smoke test: PASS (arcade, stage gating, wrong answers, hints, completion, afterglow, replay, audio).');

// Pure engine edge cases, independent of UI.
const {VerseCircuitEngine:E,VerseCircuitContent:C}=context;
const p=C.passage;
assert.equal(E.transition(E.defaults(),'next',null,p).kind,'ignored');
assert.equal(E.normalize({screen:'win',trace:['invalid'],link:[2],echo:[2],completed:true},p).screen,'trace');
let s=E.transition(E.transition(E.defaults(),'launch',null,p).state,'start',null,p).state;
for(const x of p.anchors)s=E.transition(s,'trace',x,p).state;
s=E.transition(s,'next',null,p).state;
for(const i of [0,1,2])s=E.transition(s,'link',i,p).state;
assert.equal(E.transition(s,'hint',null,p).kind,'ignored');
assert.equal(E.transition(s,'resetlink',null,p).state.link.length,2);
assert.equal(s.link.length,3,'Transitions must not mutate the previous state');
