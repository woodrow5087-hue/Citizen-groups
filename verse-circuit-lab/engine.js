/* The lab shares the verified BSB passage with VersePlay and keeps its own game state. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) {
    module.exports = factory(require('../rallypoint-memorize.js'));
  } else {
    root.VerseCircuit = factory(root.RallyMemory);
  }
})(typeof window === 'object' ? window : globalThis, source => {
  'use strict';

  const { reference, text, title } = source.library.sermon;
  const PASSAGE = Object.freeze({ reference, text, title, translation: source.translation, textRevision: source.textRevision });
  const words = text.split(' ');
  const PHRASES = Object.freeze([
    words.slice(0, 4), words.slice(4, 9), words.slice(9)
  ].map((chunk, id) => Object.freeze({ id, text: chunk.join(' ') })));
  const STORAGE_KEY = 'rallypoint-verse-circuit-lab-v1';
  const RECALL_LIMIT = 160;
  const phraseCount = PHRASES.length;

  // The five permutations which actually scramble these three phrases.
  const linkOrders = [[2, 0, 1], [1, 2, 0], [0, 2, 1], [2, 1, 0], [1, 0, 2]];
  const validCount = value => Number.isSafeInteger(value) && value >= 0;
  const validId = id => Number.isInteger(id) && id >= 0 && id < phraseCount;
  const pathComplete = path => path.length === phraseCount;

  function linkOrder(seed = 0) {
    const index = validCount(seed) ? seed % linkOrders.length : 0;
    return [...linkOrders[index]];
  }

  function fresh(seed = 0) {
    return {
      stage: 'trace', seed: validCount(seed) ? seed : 0, trace: [], links: [],
      echo: 'reveal', draft: '', hints: 0, linkHint: false, showedEcho: false,
      outcome: null, feedback: '', mistake: null
    };
  }

  function normalizeRecall(value) {
    return value.normalize('NFKC').toLowerCase().match(/[\p{L}\p{N}]+/gu)?.join(' ') || '';
  }

  const expectedRecall = normalizeRecall(PHRASES[phraseCount - 1].text);
  const complete = (state, outcome) => ({
    ...state, stage: 'complete', echo: 'recall', outcome, draft: '', feedback: '', mistake: null
  });

  function reduce(state, { type, value }) {
    if (type === 'restart') return fresh(state.seed);
    if (state.stage === 'complete') {
      if (type === 'replay') {
        // Preserve shuffle variation at the upper bound of the stored seed range.
        return fresh(state.seed === Number.MAX_SAFE_INTEGER ? 0 : state.seed + 1);
      }
      return state;
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
      return { ...state, linkHint: true, hints: state.hints + 1, feedback: '', mistake: null };
    }

    if (state.stage !== 'echo') return state;
    if (type === 'skip') return complete(state, 'skipped');
    if (state.echo === 'reveal') {
      return type === 'hide' ? { ...state, echo: 'recall' } : state;
    }
    if (type === 'reveal') {
      return { ...state, echo: 'reveal', showedEcho: true, hints: state.hints + 1, feedback: '' };
    }
    if (type === 'input' && typeof value === 'string') {
      return { ...state, draft: value.slice(0, RECALL_LIMIT), feedback: '' };
    }
    if (type === 'check') {
      const answer = normalizeRecall(state.draft);
      if (answer === expectedRecall) return complete(state, state.showedEcho ? 'assisted' : 'independent');
      return { ...state, feedback: answer ? 'recall-retry' : 'recall-empty' };
    }
    return state;
  }

  function savedPath(raw) {
    if (!Array.isArray(raw)) return [];
    const path = [];
    for (let index = 0; index < phraseCount && raw[index] === index; index++) path.push(index);
    return path;
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
    const stages = ['trace', 'link', 'echo', 'complete'];
    const requestedStage = stages.indexOf(stored.stage);
    if (requestedStage === -1) return fresh(seed);

    const state = fresh(validCount(stored.seed) ? stored.seed : seed);
    state.trace = savedPath(stored.trace);
    if (requestedStage > 0 && pathComplete(state.trace)) {
      state.stage = 'link';
      state.links = savedPath(stored.links);
      state.linkHint = stored.linkHint === true && !pathComplete(state.links);
      state.hints = validCount(stored.hints) ? Math.min(stored.hints, Number.MAX_SAFE_INTEGER - 1) : 0;
    }
    if (requestedStage >= 2 && pathComplete(state.links)) {
      state.stage = 'echo';
      state.echo = stored.echo === 'recall' ? 'recall' : 'reveal';
      state.draft = typeof stored.draft === 'string' ? stored.draft.slice(0, RECALL_LIMIT) : '';
      state.showedEcho = stored.showedEcho === true;
    }
    if (requestedStage === 3 && state.stage === 'echo') {
      if (stored.outcome === 'skipped') return complete(state, 'skipped');
      if (stored.outcome === 'assisted' || stored.outcome === 'independent') {
        return complete(state, state.showedEcho ? 'assisted' : 'independent');
      }
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
      if (stored.feedback === 'recall-retry' && answer && answer !== expectedRecall) state.feedback = stored.feedback;
    }
    return state;
  }

  function save(storage, state) {
    try {
      storage.setItem(STORAGE_KEY, JSON.stringify({
        ...state, reference: PASSAGE.reference, textRevision: PASSAGE.textRevision, text: PASSAGE.text
      }));
      return true;
    } catch {
      return false;
    }
  }

  return { PASSAGE, PHRASES, STORAGE_KEY, RECALL_LIMIT, linkOrder, fresh, reduce, load, save };
});
