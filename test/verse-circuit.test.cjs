const { test } = require('node:test');
const assert = require('node:assert/strict');
const versePlay = require('../rallypoint-memorize.js');
const engine = require('../verse-circuit-lab/engine.js');

const { PASSAGE, PHRASES, STORAGE_KEY, RECALL_LIMIT, fresh, linkOrder, reduce, load, save } = engine;
const path = [0, 1, 2];
const act = (state, type, value) => reduce(state, { type, value });
const solve = (state, type) => path.reduce((current, id) => act(current, type, id), state);

function startLink(seed) {
  return act(solve(fresh(seed), 'trace'), 'continue');
}

function startEcho(seed) {
  return act(solve(startLink(seed), 'link'), 'continue');
}

function makeStorage(entries = []) {
  const values = new Map(entries);
  return {
    getItem: key => values.get(key) ?? null,
    setItem: (key, value) => values.set(key, value)
  };
}

test('the circuit derives its three exact BSB phrases from the shared VersePlay passage', () => {
  assert.equal(PASSAGE.reference, 'John 15:12');
  assert.equal(PASSAGE.translation, 'BSB');
  assert.equal(PASSAGE.textRevision, versePlay.textRevision);
  assert.equal(PASSAGE.text, versePlay.library.sermon.text);
  assert.deepEqual(PHRASES.map(phrase => phrase.text), [
    'This is My commandment,', 'that you love one another', 'as I have loved you.'
  ]);
  assert.equal(PHRASES.map(phrase => phrase.text).join(' '), PASSAGE.text);
});

test('TRACE energizes in order and keeps study time under the player’s control', () => {
  const initial = fresh(19);
  assert.equal(act(initial, 'continue'), initial);
  assert.equal(act(initial, 'trace', '0'), initial);
  assert.equal(act(initial, 'link', 0), initial);

  const misplaced = act(initial, 'trace', 2);
  assert.deepEqual(misplaced.trace, []);
  assert.equal(misplaced.feedback, 'trace-next');
  assert.equal(misplaced.mistake, 2);
  const first = act(misplaced, 'trace', 0);
  assert.deepEqual(first.trace, [0]);
  assert.equal(first.feedback, '');
  assert.equal(act(first, 'trace', 0), first);
  assert.deepEqual(initial.trace, []);

  const traced = solve(first, 'trace');
  assert.deepEqual(traced.trace, path);
  assert.equal(traced.stage, 'trace');
  assert.equal(act(traced, 'continue').stage, 'link');
});

test('LINK keeps correct connections on retry and describes the next relation without filling it', () => {
  const linkedOnce = act(startLink(3), 'link', 0);
  const wrong = act(linkedOnce, 'link', 2);
  assert.deepEqual(wrong.links, [0]);
  assert.equal(wrong.feedback, 'link-retry');
  assert.equal(wrong.mistake, 2);
  assert.equal(act(wrong, 'continue'), wrong);

  const hinted = act(wrong, 'hint');
  assert.deepEqual(hinted.links, [0]);
  assert.equal(hinted.linkHint, true);
  assert.equal(hinted.hints, 1);
  assert.equal(hinted.mistake, null);
  assert.equal(act(hinted, 'hint'), hinted);
  assert.equal(act(hinted, 'link', 2).linkHint, true);

  const second = act(hinted, 'link', 1);
  assert.deepEqual(second.links, [0, 1]);
  assert.equal(second.linkHint, false);
  const done = act(act(second, 'hint'), 'link', 2);
  assert.equal(done.stage, 'link');
  assert.equal(done.hints, 2);
  assert.equal(act(done, 'hint'), done);
  assert.equal(act(done, 'continue').stage, 'echo');
});

test('ECHO validates the concluding phrase fairly and awards independent recall only after a match', () => {
  const study = startEcho();
  assert.equal(study.echo, 'reveal');
  assert.equal(act(study, 'check'), study);
  assert.equal(act(study, 'input', 'incorrect'), study);
  const recall = act(study, 'hide');
  assert.equal(recall.echo, 'recall');
  assert.equal(act(act(recall, 'input', '...'), 'check').feedback, 'recall-empty');
  const retry = act(act(recall, 'input', 'As I have loved'), 'check');
  assert.equal(retry.stage, 'echo');
  assert.equal(retry.feedback, 'recall-retry');
  assert.equal(retry.draft, 'As I have loved');
  const unrelated = act(act(retry, 'input', 'Love one another'), 'check');
  assert.equal(unrelated.outcome, null);

  const done = act(act(retry, 'input', '  AS, I\n have  loved—YOU! '), 'check');
  assert.equal(done.stage, 'complete');
  assert.equal(done.outcome, 'independent');
  assert.equal(done.draft, '');
  assert.equal(act(done, 'check'), done);
});

test('re-study preserves an ECHO draft, and assisted recall and skip remain distinct', () => {
  const recall = act(startEcho(), 'hide');
  const draft = act(recall, 'input', 'As I have');
  const study = act(draft, 'reveal');
  assert.equal(study.echo, 'reveal');
  assert.equal(study.draft, 'As I have');
  assert.equal(study.showedEcho, true);
  assert.equal(study.hints, 1);
  assert.equal(act(study, 'reveal'), study);

  const retry = act(study, 'hide');
  assert.equal(retry.draft, draft.draft);
  const helped = act(act(retry, 'input', PHRASES[2].text), 'check');
  assert.equal(helped.outcome, 'assisted');
  assert.equal(helped.hints, 1);

  const skipped = act(recall, 'skip');
  assert.equal(skipped.stage, 'complete');
  assert.equal(skipped.outcome, 'skipped');
  assert.equal(skipped.showedEcho, false);
});

test('replay changes the seeded arrangement and restart clears only the current round', () => {
  assert.deepEqual(linkOrder(3), linkOrder(3));
  assert.deepEqual([...linkOrder(3)].sort(), path);
  const orders = new Set(path.concat(3, 4).map(seed => linkOrder(seed).join(',')));
  assert.equal(orders.size, 5);
  assert.ok(!orders.has(path.join(',')));

  const inProgress = act(act(startLink(2), 'link', 0), 'hint');
  assert.deepEqual(act(inProgress, 'restart'), fresh(2));
  assert.equal(act(inProgress, 'replay'), inProgress);
  for (const seed of [0, 2, 4, 19, Number.MAX_SAFE_INTEGER]) {
    const complete = act(startEcho(seed), 'skip');
    const next = act(complete, 'replay');
    assert.notDeepEqual(linkOrder(next.seed), linkOrder(seed));
    assert.deepEqual(next, fresh(next.seed));
  }
});

test('the private key resumes progress in every stage and leaves app and archive data intact', () => {
  const activeKey = 'rallypoint-phase1-2026';
  const archiveKey = 'citizen-premium-hybrid-demo-v1';
  const storage = makeStorage([[activeKey, '{"current":true}'], [archiveKey, '{"archived":true}']]);
  const trace = act(act(fresh(22), 'trace', 0), 'trace', 2);
  const link = act(act(startLink(22), 'link', 0), 'hint');
  const echo = act(startEcho(22), 'hide');
  const retry = act(act(echo, 'input', 'As I'), 'check');
  const studyAgain = act(retry, 'reveal');
  const done = act(studyAgain, 'skip');
  for (const state of [trace, link, echo, retry, studyAgain, done]) {
    assert.equal(save(storage, state), true);
    assert.deepEqual(load(storage, 10), state);
  }
  assert.equal(storage.getItem(activeKey), '{"current":true}');
  assert.equal(storage.getItem(archiveKey), '{"archived":true}');
});

test('storage handles unavailable, malformed, stale and impossible progress safely', () => {
  const storage = makeStorage([[STORAGE_KEY, 'not JSON']]);
  assert.deepEqual(load(storage, 99), fresh(99));

  save(storage, startEcho(4));
  const stored = JSON.parse(storage.getItem(STORAGE_KEY));
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, textRevision: 'previous' }));
  assert.deepEqual(load(storage, 3), fresh(3));
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, text: 'older source text' }));
  assert.deepEqual(load(storage, 3), fresh(3));

  storage.setItem(STORAGE_KEY, JSON.stringify({
    ...stored, stage: 'complete', links: [0, 2, 1], hints: -1, outcome: 'independent'
  }));
  assert.deepEqual(load(storage), { ...startLink(4), links: [0] });

  storage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, draft: 'x'.repeat(RECALL_LIMIT + 20) }));
  assert.equal(load(storage).draft.length, RECALL_LIMIT);
  const blocked = {
    getItem() { throw new Error('Storage disabled'); },
    setItem() { throw new Error('Storage disabled'); }
  };
  assert.deepEqual(load(blocked, 4), fresh(4));
  assert.equal(save(blocked, startEcho()), false);
});
