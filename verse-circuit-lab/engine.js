/* The lab shares the verified BSB passage with VersePlay and keeps its own game state. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../rallypoint-memorize.js'));
  } else {
    root.VerseCircuit = factory(root.RallyMemory);
  }
})(typeof window === 'object' ? window : globalThis, source => {
  'use strict';

  const definition = {
    source: 'sermon',
    phrases: [
      { wordCount: 4, label: 'The opening', hint: 'Start with the phrase that introduces Jesus’ commandment.' },
      { wordCount: 5, label: 'The instruction', prompt: 'What are we called to do?', hint: 'Find the phrase that tells us what to do.' },
      { wordCount: 5, label: 'The closing', prompt: 'What does that love look like?', hint: 'Close with the phrase that shows how Jesus has loved us.' }
    ],
    echoWordIndexes: [3, 12]
  };
  const { reference, text, title } = source.library[definition.source];
  const PASSAGE = Object.freeze({ reference, text, title, translation: source.translation, textRevision: source.textRevision });
  const words = [...text.matchAll(/\S+/gu)];
  if (definition.phrases.reduce((sum, phrase) => sum + phrase.wordCount, 0) !== words.length) {
    throw new Error('The passage definition must include every Scripture word.');
  }
  let phraseStart = 0;
  const PHRASES = Object.freeze(definition.phrases.map(({ wordCount, ...guidance }, id) => {
    const first = words[phraseStart];
    const last = words[phraseStart + wordCount - 1];
    phraseStart += wordCount;
    return Object.freeze({ id, text: text.slice(first.index, last.index + last[0].length), ...guidance });
  }));

  const lastPhrase = PHRASES.at(-1);
  function missingWord(index) {
    const word = words[index];
    const letters = word[0].match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/u);
    return { text: letters[0], start: word.index + letters.index };
  }
  const echoWords = definition.echoWordIndexes.map(missingWord);
  let start = 0;
  const echoParts = echoWords.flatMap((word, gap) => {
    const fragment = text.slice(start, word.start);
    start = word.start + word.text.length;
    return [fragment, gap];
  });
  echoParts.push(text.slice(start));
  const ECHO_TASKS = Object.freeze([
    Object.freeze({
      id: 'word', optional: false, parts: Object.freeze(echoParts),
      hint: `The missing words begin with ${echoWords.map(word => word.text[0].toUpperCase()).join(' and ')}.`
    }),
    Object.freeze({
      id: 'phrase', optional: false, phraseId: lastPhrase.id,
      hint: `The closing phrase starts with “${lastPhrase.text.split(/\s+/u).slice(0, 2).join(' ')}”.`
    }),
    Object.freeze({
      id: 'verse', optional: true,
      hint: `Start with “${PHRASES[0].text.split(/\s+/u).slice(0, 3).join(' ')}” and follow the phrases in order.`
    })
  ]);
  const STORAGE_KEY = 'rallypoint-verse-circuit-lab-v1';
  const STORAGE_VERSION = 2;
  const RECALL_LIMIT = Math.max(160, text.length * 2);
  const phraseCount = PHRASES.length;
  const outcomes = ['independent', 'assisted', 'skipped'];

  // Keep the original seed-to-order mapping for three phrases so saved boards stay put.
  const threePhraseOrders = [[2, 0, 1], [1, 2, 0], [0, 2, 1], [2, 1, 0], [1, 0, 2]];
  const validCount = value => Number.isSafeInteger(value) && value >= 0;
  const validId = id => Number.isInteger(id) && id >= 0 && id < phraseCount;
  const pathComplete = path => path.length === phraseCount;
  const nextSeed = seed => seed === Number.MAX_SAFE_INTEGER ? 0 : seed + 1;

  function linkOrder(seed = 0, count = phraseCount) {
    let orderSeed = validCount(seed) ? seed : 0;
    if (count === 3) return [...threePhraseOrders[orderSeed % threePhraseOrders.length]];

    // Use successive seed remainders as the choices in a Fisher–Yates shuffle.
    const order = Array.from({ length: count }, (_, id) => id);
    for (let last = order.length - 1; last > 0; last--) {
      const pick = orderSeed % (last + 1);
      orderSeed = Math.floor(orderSeed / (last + 1));
      [order[last], order[pick]] = [order[pick], order[last]];
    }
    if (order.length > 1 && order.every((id, index) => id === index)) {
      [order[0], order[1]] = [order[1], order[0]];
    }
    return order;
  }

  function replaySeed(seed) {
    let next = nextSeed(seed);
    if (phraseCount > 2) {
      const previous = linkOrder(seed).join(',');
      while (linkOrder(next).join(',') === previous) next = nextSeed(next);
    }
    return next;
  }

  function fresh(seed = 0) {
    return {
      stage: 'trace', seed: validCount(seed) ? seed : 0, trace: [0], links: [],
      linkHint: false, linkHints: 0,
      echo: 'recall', echoLevel: 0, echoResults: {}, echoHint: false, echoStudied: false,
      echoHints: 0, echoStudies: 0, draft: '', legacyHelp: 0, outcome: null, feedback: '', mistake: null
    };
  }

  function normalizeRecall(value) {
    return value.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(' ') || '';
  }

  const echoAnswers = [echoWords.map(word => word.text).join(' '), lastPhrase.text, text].map(normalizeRecall);

  function complete(state) {
    const outcome = !state.echoResults.phrase ? 'skipped'
      : Object.values(state.echoResults).includes('assisted') ? 'assisted' : 'independent';
    return {
      ...state, stage: 'complete', echo: state.echo === 'solved' ? 'solved' : 'recall',
      outcome, draft: '', feedback: '', mistake: null
    };
  }

  function playEcho(state, type, value) {
    const task = ECHO_TASKS[state.echoLevel];
    if (type === 'skip' || (type === 'finish' && task.optional)) return complete(state);
    if (state.echo === 'solved') {
      if (type === 'finish' && task.id === 'phrase') return complete(state);
      if (type !== 'continue') return state;
      if (state.echoLevel === ECHO_TASKS.length - 1) return complete(state);
      return { ...state, echo: 'recall', echoLevel: state.echoLevel + 1, echoHint: false, echoStudied: false };
    }
    if (state.echo === 'reveal') {
      return type === 'hide' ? { ...state, echo: 'recall' } : state;
    }
    if (type === 'hint' && !state.echoHint) {
      return { ...state, echoHint: true, echoHints: state.echoHints + 1, feedback: '' };
    }
    if (type === 'reveal') {
      return { ...state, echo: 'reveal', echoStudied: true, echoStudies: state.echoStudies + 1, feedback: '' };
    }
    if (type === 'input' && typeof value === 'string') {
      return { ...state, draft: value.slice(0, RECALL_LIMIT), feedback: '' };
    }
    if (type === 'check') {
      const answer = normalizeRecall(state.draft);
      if (answer !== echoAnswers[state.echoLevel]) {
        return { ...state, feedback: answer ? 'recall-retry' : 'recall-empty' };
      }
      const result = state.echoHint || state.echoStudied ? 'assisted' : 'independent';
      return { ...state, echo: 'solved', echoResults: { ...state.echoResults, [task.id]: result }, draft: '', feedback: '' };
    }
    return state;
  }

  function reduce(state, { type, value }) {
    if (type === 'restart') return fresh(state.seed);
    if (state.stage === 'complete') {
      return type === 'replay' ? fresh(replaySeed(state.seed)) : state;
    }

    if (type === state.stage && (type === 'trace' || type === 'link')) {
      const key = type === 'trace' ? 'trace' : 'links';
      const placed = state[key];
      if (!validId(value) || placed.includes(value)) return state;
      if (value !== placed.length) {
        return { ...state, feedback: type === 'trace' ? 'trace-next' : 'link-retry', mistake: value };
      }
      return { ...state, [key]: [...placed, value], linkHint: false, feedback: '', mistake: null };
    }

    if (type === 'continue') {
      if (state.stage === 'trace' && pathComplete(state.trace)) {
        return { ...state, stage: 'link', feedback: '', mistake: null };
      }
      if (state.stage === 'link' && pathComplete(state.links)) {
        return { ...state, stage: 'echo', feedback: '', mistake: null };
      }
    }

    if (state.stage === 'link' && type === 'hint' && !pathComplete(state.links) && !state.linkHint) {
      return { ...state, linkHint: true, linkHints: state.linkHints + 1, feedback: '', mistake: null };
    }

    return state.stage === 'echo' ? playEcho(state, type, value) : state;
  }

  function savedPath(raw) {
    if (!Array.isArray(raw)) return [];
    const path = [];
    for (let index = 0; index < phraseCount && raw[index] === index; index++) path.push(index);
    return path;
  }

  function readEcho(state, stored, legacy) {
    state.stage = 'echo';
    state.draft = typeof stored.draft === 'string' ? stored.draft.slice(0, RECALL_LIMIT) : '';
    state.echo = stored.echo === 'reveal' ? 'reveal' : 'recall';
    if (legacy) {
      state.echoLevel = ECHO_TASKS.findIndex(task => task.id === 'phrase');
      state.echoStudied = stored.showedEcho === true;
      if (stored.stage === 'complete' && ['independent', 'assisted'].includes(stored.outcome)) {
        state.echoResults.phrase = stored.outcome;
        state.echo = 'solved';
      }
      return;
    }

    state.echoLevel = validCount(stored.echoLevel) && stored.echoLevel < ECHO_TASKS.length ? stored.echoLevel : 0;
    state.echoHint = stored.echoHint === true;
    state.echoStudied = stored.echoStudied === true;
    state.echoHints = validCount(stored.echoHints) ? Math.min(stored.echoHints, ECHO_TASKS.length) : 0;
    state.echoStudies = validCount(stored.echoStudies) ? stored.echoStudies : 0;
    ECHO_TASKS.slice(0, state.echoLevel + 1).forEach(({ id }, index) => {
      const result = stored.echoResults?.[id];
      const checked = index < state.echoLevel || stored.echo === 'solved';
      if (checked && (result === 'independent' || result === 'assisted')) state.echoResults[id] = result;
    });
    const task = ECHO_TASKS[state.echoLevel];
    if (state.echoResults[task.id]) state.echo = 'solved';
  }

  function load(storage, seed = 0) {
    let stored;
    try {
      stored = JSON.parse(storage.getItem(STORAGE_KEY));
    } catch {
      return fresh(seed);
    }
    if (stored?.reference !== PASSAGE.reference || stored.textRevision !== PASSAGE.textRevision || stored.text !== PASSAGE.text) {
      return fresh(seed);
    }
    const legacy = stored.version === undefined || stored.version === 1;
    if (!legacy && stored.version !== STORAGE_VERSION) return fresh(seed);
    const stages = ['trace', 'link', 'echo', 'complete'];
    const requestedStage = stages.indexOf(stored.stage);
    if (requestedStage === -1) return fresh(seed);

    const state = fresh(validCount(stored.seed) ? stored.seed : seed);
    const traced = savedPath(stored.trace);
    if (traced.length) state.trace = traced;
    if (requestedStage > 0 && pathComplete(state.trace)) {
      state.stage = 'link';
      state.links = savedPath(stored.links);
      state.linkHint = stored.linkHint === true && !pathComplete(state.links);
      const hints = legacy ? stored.hints : stored.linkHints;
      if (validCount(hints) && (!legacy || !stored.showedEcho)) state.linkHints = Math.min(hints, phraseCount);
      if (!legacy && validCount(stored.legacyHelp)) state.legacyHelp = stored.legacyHelp;
    }
    if (requestedStage >= 2 && pathComplete(state.links)) {
      readEcho(state, stored, legacy);
      if (legacy && state.echoStudied) {
        // V1 tracked Link clues and re-study in one counter, without their individual totals.
        state.echoStudies = 1;
        state.legacyHelp = validCount(stored.hints) ? Math.max(0, stored.hints - 1) : 0;
      }
    }
    if (requestedStage === 3 && state.stage === 'echo' && outcomes.includes(stored.outcome)) {
      return complete(state);
    }
    const mistakePath = state.stage === 'trace' ? state.trace : state.links;
    const mistakeFeedback = state.stage === 'trace' ? 'trace-next' : 'link-retry';
    if (state.stage !== 'echo' && stored.feedback === mistakeFeedback && validId(stored.mistake) && stored.mistake > mistakePath.length) {
      state.feedback = mistakeFeedback;
      state.mistake = stored.mistake;
    }
    if (state.stage === 'echo' && state.echo === 'recall') {
      const answer = normalizeRecall(state.draft);
      if (stored.feedback === 'recall-empty' && !answer) state.feedback = stored.feedback;
      if (stored.feedback === 'recall-retry' && answer && answer !== echoAnswers[state.echoLevel]) state.feedback = stored.feedback;
    }
    return state;
  }

  function save(storage, state) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({
        ...state, version: STORAGE_VERSION, reference: PASSAGE.reference, textRevision: PASSAGE.textRevision, text: PASSAGE.text
      }));
      return true;
    } catch {
      return false;
    }
  }

  return { PASSAGE, PHRASES, ECHO_TASKS, STORAGE_KEY, RECALL_LIMIT, linkOrder, fresh, reduce, load, save };
});
