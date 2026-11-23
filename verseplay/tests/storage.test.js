import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialState, transition } from '../core/circuit-engine.js';
import { loadProgress, saveProgress, savePreferences, progressKey, PREFERENCES_KEY, LEGACY_KEY } from '../core/storage.js';
const content = JSON.parse(readFileSync(new URL('../content/john-15-12.json', import.meta.url)));
function memoryStorage(entries = {}) {
  const data = new Map(Object.entries(entries));
  return { data, getItem: key => data.get(key) ?? null, setItem: (key, value) => data.set(key, value) };
}
const stateKey = progressKey(content);
const initial = () => createInitialState(content);
function stages() {
  let state = initial();
  const result = [state];
  const act = (type, value) => { state = transition(state, { type, value }, content).state; result.push(state); };
  act('launch'); act('start');
  for (const phrase of content.phrases) act('trace', phrase.id);
  act('next');
  for (const segment of content.sequence) act('link', segment);
  act('next');
  for (const answer of content.answerSequence) act('echo', answer);
  act('next'); act('afterglow'); act('home');
  return result;
}

test('missing storage creates valid playable defaults', () => {
  const result = loadProgress(memoryStorage(), content);
  assert.deepEqual(result.state, initial());
  assert.deepEqual(result.preferences, { sound: false });
  assert.equal(result.status, 'new');
});
test('unavailable, denied, and throwing Storage remain playable', () => {
  for (const storage of [null, undefined, {}, { getItem() { throw new Error('denied'); } }]) {
    const result = loadProgress(storage, content);
    assert.deepEqual(result.state, initial());
    assert.equal(result.status, 'unavailable');
    assert.match(result.notice, /keep playing/);
    assert.equal(saveProgress(storage, initial(), content).saved, false);
  }
});
for (const state of stages()) {
  test(`round trip ${state.screen} trace=${state.trace.length} link=${state.link.length} echo=${state.echo.length} completed=${state.completed}`, () => {
    const storage = memoryStorage();
    assert.equal(saveProgress(storage, state, content).saved, true);
    const result = loadProgress(storage, content);
    assert.equal(result.status, 'restored');
    assert.deepEqual(result.state, state);
  });
}
for (const [name, raw] of [
  ['invalid JSON', '{'],
  ['null', 'null'],
  ['array', '[]'],
  ['missing fields', '{}'],
  ['unknown version', JSON.stringify({ ...initial(), schemaVersion: 0 })],
  ['future version', JSON.stringify({ ...initial(), schemaVersion: 2 })],
  ['content change', JSON.stringify({ ...initial(), contentVersion: 2 })],
  ['different content', JSON.stringify({ ...initial(), contentId: 'other' })],
  ['premature victory', JSON.stringify({ ...initial(), screen: 'win', completed: true })],
  ['duplicate selections', JSON.stringify({ ...initial(), screen: 'trace', trace: ['commandment', 'commandment'] })],
  ['forged LINK', JSON.stringify({ ...initial(), link: ['segment-2'] })],
  ['malformed counters', JSON.stringify({ ...initial(), hints: 'many' })],
  ['preference inside gameplay', JSON.stringify({ ...initial(), sound: true })],
]) {
  test(`unsafe saved state resets: ${name}`, () => {
    const storage = memoryStorage({ [stateKey]: raw, unrelated: 'kept', [PREFERENCES_KEY]: JSON.stringify({ schemaVersion: 1, sound: true }) });
    const result = loadProgress(storage, content);
    assert.equal(result.status, 'reset');
    assert.deepEqual(result.state, initial());
    assert.equal(result.preferences.sound, true);
    assert.equal(storage.data.get('unrelated'), 'kept');
    assert.match(result.notice, /was reset because/);
    assert.equal(loadProgress(storage, content).status, 'restored');
  });
}
test('invalid progress is never persisted', () => {
  const storage = memoryStorage();
  assert.equal(saveProgress(storage, { ...initial(), completed: true }, content).saved, false);
  assert.equal(storage.data.has(stateKey), false);
});
test('quota failure reports memory-only play and does not throw', () => {
  const storage = { getItem: () => null, setItem() { throw new Error('quota'); } };
  assert.equal(saveProgress(storage, initial(), content).saved, false);
  assert.equal(savePreferences(storage, { sound: true }).saved, false);
});
test('sound preference remains independent of gameplay, reset, and content failure', () => {
  const storage = memoryStorage();
  assert.equal(savePreferences(storage, { sound: true }).saved, true);
  assert.equal(loadProgress(storage, content).preferences.sound, true);
  saveProgress(storage, stages().find(s => s.screen === 'win'), content);
  assert.equal(loadProgress(storage, content).preferences.sound, true);
  assert.equal(Object.hasOwn(loadProgress(storage, content).state, 'sound'), false);
  saveProgress(storage, initial(), content);
  assert.equal(loadProgress(storage, content).preferences.sound, true);
});
test('invalid preference records do not reset valid gameplay', () => {
  for (const raw of ['{', '{}', 'null', JSON.stringify({ schemaVersion: 2, sound: true }), JSON.stringify({ schemaVersion: 1, sound: 'yes' })]) {
    const state = stages().find(s => s.screen === 'echo');
    const storage = memoryStorage({ [stateKey]: JSON.stringify(state), [PREFERENCES_KEY]: raw });
    const result = loadProgress(storage, content);
    assert.equal(result.status, 'restored');
    assert.deepEqual(result.state, state);
    assert.equal(result.preferences.sound, false);
  }
});
test('invalid preference writes are rejected', () => {
  for (const value of [null, {}, { sound: 1 }]) assert.equal(savePreferences(memoryStorage(), value).saved, false);
});
function legacyFrom(state) {
  return {
    screen: state.screen,
    trace: state.trace.map(id => content.phrases.find(p => p.id === id).text),
    link: state.link.map(id => content.sequence.indexOf(id)),
    echo: state.echo.map(id => content.answerSequence.indexOf(id)),
    mistakes: state.mistakes, hints: state.hints, completed: state.completed, sound: true,
  };
}
for (const state of stages()) {
  test(`migrate legacy ${state.screen} trace=${state.trace.length} link=${state.link.length} echo=${state.echo.length}`, () => {
    const original = JSON.stringify(legacyFrom(state));
    const storage = memoryStorage({ [LEGACY_KEY]: original });
    const result = loadProgress(storage, content);
    assert.equal(result.status, 'migrated');
    assert.deepEqual(result.state, state);
    assert.equal(result.preferences.sound, true);
    assert.equal(storage.data.get(LEGACY_KEY), original, 'original comparison prototype save remains untouched');
    assert.equal(loadProgress(storage, content).status, 'restored');
  });
}
test('existing separate preference wins over legacy preference', () => {
  const storage = memoryStorage({ [LEGACY_KEY]: JSON.stringify(legacyFrom(initial())) });
  savePreferences(storage, { sound: false });
  assert.equal(loadProgress(storage, content).preferences.sound, false);
});
test('malformed legacy data cannot create impossible gameplay', () => {
  for (const value of [{}, null, { ...legacyFrom(initial()), screen: 'afterglow', completed: true }, { ...legacyFrom(initial()), trace: [null] }, { ...legacyFrom(initial()), link: ['0'] }]) {
    const result = loadProgress(memoryStorage({ [LEGACY_KEY]: JSON.stringify(value) }), content);
    assert.equal(result.status, 'reset');
    assert.deepEqual(result.state, initial());
  }
});
test('legacy progress does not migrate into changed Scripture content', () => {
  const result = loadProgress(memoryStorage({ [LEGACY_KEY]: JSON.stringify(legacyFrom(initial())) }), { ...content, version: 2 });
  assert.equal(result.status, 'reset');
  assert.equal(result.state.contentVersion, 2);
});
test('current valid progress takes precedence over stale legacy progress', () => {
  const state = stages().find(s => s.screen === 'echo');
  const storage = memoryStorage({ [stateKey]: JSON.stringify(state), [LEGACY_KEY]: '{' });
  assert.deepEqual(loadProgress(storage, content).state, state);
});
