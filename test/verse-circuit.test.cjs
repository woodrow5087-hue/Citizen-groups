const { test } = require('node:test');
const assert = require('node:assert/strict');
const versePlay = require('../rallypoint-memorize.js');
const engine = require('../verse-circuit-lab/engine.js');

const { PASSAGE, PHRASES, ECHO_TASKS, STORAGE_KEY, RECALL_LIMIT, fresh, linkOrder, reduce, load, save } = engine;
const path = [0, 1, 2];
const act = (state, type, value) => reduce(state, { type, value });
const solve = (state, type) => path.reduce((current, id) => act(current, type, id), state);
const recallAnswer = (state, text) => act(act(state, 'input', text), 'check');

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
  const gaps = ['commandment', 'loved'];
  assert.deepEqual(ECHO_TASKS[0].parts.filter(part => typeof part === 'number'), [0, 1]);
  assert.equal(ECHO_TASKS[0].parts.map(part => typeof part === 'number' ? gaps[part] : part).join(''), PASSAGE.text);
  assert.equal(ECHO_TASKS[1].phraseId, PHRASES.at(-1).id);
  assert.equal(ECHO_TASKS[2].optional, true);
});

test('TRACE energizes in order and keeps study time under the player’s control', () => {
  const initial = fresh(19);
  assert.deepEqual(initial.trace, [0]);
  assert.equal(act(initial, 'continue'), initial);
  assert.equal(act(initial, 'trace', '1'), initial);
  assert.equal(act(initial, 'trace', 0), initial);
  assert.equal(act(initial, 'link', 0), initial);

  const misplaced = act(initial, 'trace', 2);
  assert.deepEqual(misplaced.trace, [0]);
  assert.equal(misplaced.feedback, 'trace-next');
  assert.equal(misplaced.mistake, 2);
  const next = act(misplaced, 'trace', 1);
  assert.deepEqual(next.trace, [0, 1]);
  assert.equal(next.feedback, '');
  assert.equal(act(next, 'trace', 1), next);
  assert.deepEqual(initial.trace, [0]);

  const traced = act(next, 'trace', 2);
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
  assert.equal(hinted.linkHints, 1);
  assert.equal(hinted.mistake, null);
  assert.equal(act(hinted, 'hint'), hinted);
  assert.equal(act(hinted, 'link', 2).linkHint, true);

  const second = act(hinted, 'link', 1);
  assert.deepEqual(second.links, [0, 1]);
  assert.equal(second.linkHint, false);
  const done = act(act(second, 'hint'), 'link', 2);
  assert.equal(done.stage, 'link');
  assert.equal(done.linkHints, 2);
  assert.equal(act(done, 'hint'), done);
  const echo = act(done, 'continue');
  assert.equal(echo.stage, 'echo');
  assert.equal(recallAnswer(echo, 'commandment loved').echoResults.word, 'independent');
});

test('ECHO moves from typed words to the closing phrase, validating only the current answer', () => {
  const words = startEcho();
  assert.equal(words.echo, 'recall');
  assert.equal(words.echoLevel, 0);
  assert.equal(act(words, 'continue'), words);
  assert.equal(recallAnswer(words, '...').feedback, 'recall-empty');
  assert.equal(recallAnswer(words, 'loved commandment').feedback, 'recall-retry');
  const wordSolved = recallAnswer(words, '  COMMANDMENT,\n loved! ');
  assert.equal(wordSolved.echo, 'solved');
  assert.deepEqual(wordSolved.echoResults, { word: 'independent' });
  assert.equal(act(wordSolved, 'finish'), wordSolved);

  const phrase = act(wordSolved, 'continue');
  assert.equal(phrase.echo, 'recall');
  assert.equal(phrase.echoLevel, 1);
  const retry = recallAnswer(phrase, 'As I have loved');
  assert.equal(retry.stage, 'echo');
  assert.equal(retry.feedback, 'recall-retry');
  assert.equal(retry.draft, 'As I have loved');
  assert.equal(recallAnswer(retry, 'Love one another').echoResults.phrase, undefined);

  const phraseSolved = recallAnswer(retry, '  AS, I\n have  loved—YOU! ');
  assert.deepEqual(phraseSolved.echoResults, { word: 'independent', phrase: 'independent' });
  const done = act(phraseSolved, 'finish');
  assert.equal(done.stage, 'complete');
  assert.equal(done.outcome, 'independent');
  assert.equal(done.echoResults.verse, undefined);
  assert.equal(done.draft, '');
  assert.equal(act(done, 'check'), done);
});

test('ECHO tracks hints and re-study by level, preserving the draft and separating Link hints', () => {
  const halfway = act(act(startLink(), 'link', 0), 'hint');
  const words = act(solve(halfway, 'link'), 'continue');
  const hinted = act(words, 'hint');
  assert.equal(hinted.echoHints, 1);
  assert.equal(hinted.echoHint, true);
  assert.equal(hinted.linkHints, 1);
  assert.equal(act(hinted, 'hint'), hinted);
  const wordSolved = recallAnswer(hinted, 'commandment loved');
  assert.equal(wordSolved.echoResults.word, 'assisted');

  const phrase = act(wordSolved, 'continue');
  assert.equal(phrase.echoHint, false);
  assert.equal(phrase.echoStudied, false);
  const draft = act(phrase, 'input', 'As I have');
  const study = act(draft, 'reveal');
  assert.equal(study.echo, 'reveal');
  assert.equal(study.draft, 'As I have');
  assert.equal(study.echoStudied, true);
  assert.equal(study.echoStudies, 1);
  assert.equal(act(study, 'reveal'), study);
  assert.equal(act(study, 'check'), study);

  const retry = act(study, 'hide');
  assert.equal(retry.draft, draft.draft);
  const phraseSolved = recallAnswer(retry, PHRASES[2].text);
  assert.equal(phraseSolved.echoResults.phrase, 'assisted');
  const fullRecall = act(phraseSolved, 'continue');
  assert.equal(fullRecall.echoLevel, 2);
  assert.equal(fullRecall.echoStudied, false);
  assert.equal(recallAnswer(fullRecall, PHRASES[2].text).feedback, 'recall-retry');
  const final = act(recallAnswer(fullRecall, PASSAGE.text.toLowerCase()), 'continue');
  assert.equal(final.stage, 'complete');
  assert.equal(final.outcome, 'assisted');
  assert.deepEqual(final.echoResults, { word: 'assisted', phrase: 'assisted', verse: 'independent' });
});

test('studying the ending never claims credit for a skipped task', () => {
  const words = startEcho();
  const wordSolved = recallAnswer(words, 'commandment loved');
  const phrase = act(wordSolved, 'continue');
  const skipped = act(act(phrase, 'reveal'), 'skip');
  assert.equal(skipped.stage, 'complete');
  assert.equal(skipped.outcome, 'skipped');
  assert.deepEqual(skipped.echoResults, { word: 'independent' });

  const phraseSolved = recallAnswer(phrase, PHRASES[2].text);
  const optional = act(phraseSolved, 'continue');
  const bonusSkipped = act(act(act(optional, 'hint'), 'reveal'), 'finish');
  assert.equal(bonusSkipped.stage, 'complete');
  assert.equal(bonusSkipped.outcome, 'independent');
  assert.equal(bonusSkipped.echoHints, 1);
  assert.equal(bonusSkipped.echoStudies, 1);
  assert.deepEqual(bonusSkipped.echoResults, { word: 'independent', phrase: 'independent' });
});

test('replay changes the seeded arrangement and restart clears only the current round', () => {
  assert.deepEqual(linkOrder(3), linkOrder(3));
  assert.deepEqual([...linkOrder(3)].sort(), path);
  const orders = new Set(path.concat(3, 4).map(seed => linkOrder(seed).join(',')));
  assert.equal(orders.size, 5);
  assert.ok(!orders.has(path.join(',')));
  assert.deepEqual([0, 1, 2, 3, 4].map(seed => linkOrder(seed)), [[2, 0, 1], [1, 2, 0], [0, 2, 1], [2, 1, 0], [1, 0, 2]]);
  for (const count of [2, 4, 5]) {
    const reference = Array.from({ length: count }, (_, index) => index);
    const shuffled = linkOrder(43, count);
    assert.deepEqual(shuffled, linkOrder(43, count));
    assert.notDeepEqual(shuffled, reference);
    assert.deepEqual([...shuffled].sort((a, b) => a - b), reference);
  }

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
  const echo = startEcho(22);
  const retry = recallAnswer(echo, 'command');
  const studyAgain = act(retry, 'reveal');
  const wordSolved = recallAnswer(act(studyAgain, 'hide'), 'commandment loved');
  const phrase = act(wordSolved, 'continue');
  const done = act(phrase, 'skip');
  for (const state of [trace, link, echo, retry, studyAgain, wordSolved, phrase, done]) {
    assert.equal(save(storage, state), true);
    assert.deepEqual(load(storage, 10), state);
  }
  assert.equal(storage.getItem(activeKey), '{"current":true}');
  assert.equal(storage.getItem(archiveKey), '{"archived":true}');
});

test('v1 progress preserves its board, Echo draft, help and honest completion without awarding new tasks', () => {
  const storage = makeStorage();
  const v1 = {
    reference: PASSAGE.reference, textRevision: PASSAGE.textRevision, text: PASSAGE.text,
    seed: 22, stage: 'echo', trace: path, links: path, echo: 'recall', draft: 'as I have', hints: 3,
    linkHint: false, showedEcho: true, outcome: null, feedback: 'recall-retry', mistake: null
  };
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...v1, stage: 'trace', trace: [] }));
  assert.deepEqual(load(storage).trace, [0]);
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...v1, stage: 'trace', trace: [0, 1] }));
  assert.deepEqual(load(storage).trace, [0, 1]);
  storage.setItem(STORAGE_KEY, JSON.stringify({ ...v1, stage: 'link', links: [0], hints: 2, linkHint: true, showedEcho: false }));
  const oldLink = load(storage);
  assert.equal(oldLink.stage, 'link');
  assert.deepEqual(oldLink.links, [0]);
  assert.equal(oldLink.linkHint, true);
  assert.equal(oldLink.linkHints, 2);
  storage.setItem(STORAGE_KEY, JSON.stringify(v1));
  const migrated = load(storage);
  assert.equal(migrated.echoLevel, 1);
  assert.equal(migrated.echo, 'recall');
  assert.equal(migrated.draft, v1.draft);
  assert.equal(migrated.feedback, v1.feedback);
  assert.equal(migrated.echoStudied, true);
  assert.equal(migrated.echoStudies, 1);
  assert.equal(migrated.legacyHelp, 2);
  assert.equal(migrated.seed, v1.seed);
  assert.deepEqual(linkOrder(migrated.seed), [0, 2, 1]);
  assert.deepEqual(migrated.echoResults, {});
  save(storage, migrated);
  assert.equal(JSON.parse(storage.getItem(STORAGE_KEY)).version, 2);
  assert.deepEqual(load(storage), migrated);

  storage.setItem(STORAGE_KEY, JSON.stringify({ ...v1, echo: 'reveal', showedEcho: false }));
  const oldStudy = load(storage);
  assert.equal(oldStudy.echo, 'reveal');
  assert.equal(oldStudy.echoLevel, 1);
  assert.equal(oldStudy.linkHints, 3);
  assert.equal(oldStudy.echoStudies, 0);

  for (const outcome of ['independent', 'assisted', 'skipped']) {
    storage.setItem(STORAGE_KEY, JSON.stringify({ ...v1, stage: 'complete', showedEcho: outcome === 'assisted', outcome }));
    const done = load(storage);
    assert.equal(done.stage, 'complete');
    assert.equal(done.outcome, outcome);
    assert.deepEqual(done.echoResults, outcome === 'skipped' ? {} : { phrase: outcome });
    assert.equal(done.draft, '');
    save(storage, done);
    assert.deepEqual(load(storage), done);
  }
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
