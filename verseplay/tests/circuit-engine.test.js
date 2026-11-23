import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createInitialState, transition } from '../core/circuit-engine.js';
import { validateState } from '../core/state-schema.js';

const content = JSON.parse(readFileSync(new URL('../content/john-15-12.json', import.meta.url)));
const initial = () => createInitialState(content);
const apply = (state, type, value) => {
  const result = transition(state, { type, value }, content);
  assert.equal(result.accepted, true, `${type} should be accepted: ${result.reason}`);
  assert.equal(validateState(result.state, content).valid, true);
  return result.state;
};
const reject = (state, type, value) => {
  const result = transition(state, { type, value }, content);
  assert.equal(result.accepted, false, `${type} should be rejected`);
  assert.equal(result.state, state);
  assert.deepEqual(result.effects, []);
};
const trace = () => apply(apply(initial(), 'launch'), 'start');
const traced = () => content.phrases.reduce((state, phrase) => apply(state, 'trace', phrase.id), trace());
const link = () => apply(traced(), 'next');
const linked = () => content.sequence.reduce((state, id) => apply(state, 'link', id), link());
const echo = () => apply(linked(), 'next');
const echoed = () => content.answerSequence.reduce((state, id) => apply(state, 'echo', id), echo());
const win = () => apply(echoed(), 'next');

test('initial gameplay is versioned, empty, and has no interface preferences', () => {
  assert.deepEqual(initial(), {
    schemaVersion: 1, contentId: content.id, contentVersion: content.version,
    screen: 'home', trace: [], link: [], echo: [], hints: 0, mistakes: 0, completed: false,
  });
  assert.equal(validateState(initial(), content).valid, true);
});

const permutations = values => values.length ? values.flatMap((value, index) => permutations(values.filter((_, other) => index !== other)).map(rest => [value, ...rest])) : [[]];
for (const order of permutations(content.phrases.map(phrase => phrase.id))) {
  test(`TRACE accepts all phrases in order ${order.join(', ')}`, () => {
    let state = trace();
    for (const id of order) {
      state = apply(state, 'trace', id);
      reject(state, 'trace', id);
    }
    assert.deepEqual(state.trace, order);
    assert.equal(state.completed, false);
    assert.equal(apply(state, 'next').screen, 'link');
  });
}
for (const value of [undefined, null, 0, -1, '', 'not-a-phrase', {}, [], 'love one another']) {
  test(`TRACE rejects invalid identifier ${JSON.stringify(value)}`, () => reject(trace(), 'trace', value));
}
test('TRACE cannot advance with zero, one, or two selections', () => {
  let state = trace();
  for (const phrase of content.phrases) {
    reject(state, 'next');
    state = apply(state, 'trace', phrase.id);
  }
});

for (let index = 0; index < content.sequence.length; index++) {
  test(`LINK choice ${index + 1} validates every available phrase`, () => {
    let state = link();
    for (const id of content.sequence.slice(0, index)) state = apply(state, 'link', id);
    for (const id of content.sequence) {
      if (state.link.includes(id)) reject(state, 'link', id);
      else {
        const result = transition(state, { type: 'link', value: id }, content);
        assert.equal(result.accepted, true);
        if (id === content.sequence[index]) {
          assert.deepEqual(result.state.link, content.sequence.slice(0, index + 1));
          assert.equal(result.state.mistakes, 0);
        } else {
          assert.deepEqual(result.state.link, state.link);
          assert.equal(result.state.mistakes, 1);
          assert.deepEqual(result.effects.find(effect => effect.type === 'feedback'), {
            type: 'feedback', target: 'link-feedback', message: 'Not quite—try the phrase that comes next.', error: true,
          });
          assert.equal(result.effects.some(effect => effect.type === 'render'), false);
        }
      }
    }
  });
}
test('LINK rejects unknown IDs and incomplete transitions', () => {
  let state = link();
  for (const id of content.sequence) {
    reject(state, 'link', 'unknown');
    reject(state, 'next');
    state = apply(state, 'link', id);
  }
  assert.equal(apply(state, 'next').screen, 'echo');
});
test('LINK hints are deterministic and undo removes only the latest connection', () => {
  let state = link();
  reject(state, 'resetlink');
  for (const id of content.sequence) {
    const result = transition(state, { type: 'hint' }, content);
    assert.deepEqual(result, transition(state, { type: 'hint' }, content));
    assert.equal(result.state.hints, state.hints + 1);
    const segment = content.segments.find(item => item.id === id);
    assert.equal(result.effects[0].message, `Hint: The next phrase begins “${segment.hint}…”`);
    assert.equal(result.effects.some(effect => effect.type === 'render'), false);
    state = apply(result.state, 'link', id);
  }
  reject(state, 'hint');
  const undone = apply(state, 'resetlink');
  assert.deepEqual(undone.link, content.sequence.slice(0, -1));
  assert.equal(undone.hints, 3);
  assert.equal(apply(undone, 'link', content.sequence.at(-1)).link.length, 3);
});

for (let index = 0; index < content.answerSequence.length; index++) {
  test(`ECHO blank ${index + 1} validates answers and distractors`, () => {
    let state = echo();
    for (const id of content.answerSequence.slice(0, index)) state = apply(state, 'echo', id);
    for (const option of [...content.answers, ...content.distractors]) {
      if (state.echo.includes(option.id)) reject(state, 'echo', option.id);
      else {
        const result = transition(state, { type: 'echo', value: option.id }, content);
        assert.equal(result.accepted, true);
        if (option.id === content.answerSequence[index]) {
          assert.deepEqual(result.state.echo, content.answerSequence.slice(0, index + 1));
          assert.equal(result.state.mistakes, 0);
        } else {
          assert.equal(result.state.mistakes, 1);
          assert.deepEqual(result.state.echo, state.echo);
          assert.equal(result.effects.find(effect => effect.type === 'feedback').message, 'Almost. Try the word that fits this blank.');
        }
      }
    }
  });
}
test('ECHO rejects unknown options, incomplete victory, and actions after all blanks filled', () => {
  let state = echo();
  for (const id of content.answerSequence) {
    reject(state, 'echo', 'unknown');
    reject(state, 'next');
    state = apply(state, 'echo', id);
    assert.equal(state.completed, false);
  }
  reject(state, 'echo', content.distractors[0].id);
  reject(state, 'hint');
  assert.equal(apply(state, 'next').completed, true);
});
test('ECHO hints and undo retain prior progress without completing the game', () => {
  let state = echo();
  reject(state, 'resetecho');
  for (const id of content.answerSequence) {
    const result = transition(state, { type: 'hint' }, content);
    const answer = content.answers.find(item => item.id === id);
    assert.equal(result.effects[0].message, `Hint: The answer begins with “${answer.hint}”.`);
    state = apply(result.state, 'echo', id);
  }
  const undone = apply(state, 'resetecho');
  assert.deepEqual(undone.echo, content.answerSequence.slice(0, -1));
  assert.deepEqual(undone.link, content.sequence);
  assert.deepEqual(undone.trace, content.phrases.map(phrase => phrase.id));
  assert.equal(undone.completed, false);
  reject(undone, 'next');
});

test('victory, optional Afterglow, arcade navigation and replay preserve the intended loop', () => {
  const complete = win();
  reject(complete, 'next');
  const afterglow = apply(complete, 'afterglow');
  assert.equal(afterglow.screen, 'afterglow');
  reject(afterglow, 'afterglow');
  const home = apply(afterglow, 'home');
  assert.equal(home.completed, true);
  assert.deepEqual(home.echo, content.answerSequence);
  assert.deepEqual(apply(complete, 'restart'), { ...initial(), screen: 'trace' });
  assert.deepEqual(apply(afterglow, 'restart'), { ...initial(), screen: 'trace' });
  assert.deepEqual(apply(apply(home, 'launch'), 'start'), { ...initial(), screen: 'trace' });
});

const stageFactories = { home: initial, launch: () => apply(initial(), 'launch'), trace, link, echo, win, afterglow: () => apply(win(), 'afterglow') };
for (const [screen, makeState] of Object.entries(stageFactories)) {
  test(`${screen}: rejects selections and commands for every other stage`, () => {
    const state = makeState();
    for (const [type, value, allowed] of [
      ['trace', content.phrases[0].id, ['trace']], ['link', content.sequence[0], ['link']],
      ['echo', content.answerSequence[0], ['echo']], ['start', undefined, ['launch']],
      ['restart', undefined, ['win', 'afterglow']], ['afterglow', undefined, ['win']],
      ['launch', undefined, ['home']], ['hint', undefined, ['link', 'echo']],
      ['resetlink', undefined, ['link']], ['resetecho', undefined, ['echo']],
    ]) if (!allowed.includes(screen)) reject(state, type, value);
  });
  test(`${screen}: JSON restoration preserves all gameplay exactly`, () => {
    const state = makeState();
    const restored = JSON.parse(JSON.stringify(state));
    assert.equal(validateState(restored, content).valid, true);
    assert.deepEqual(restored, state);
    assert.deepEqual(transition(restored, { type: 'home' }, content), transition(state, { type: 'home' }, content));
  });
}

test('rapid repeated selections and NEXT cannot skip stages or produce false completion', () => {
  let state = trace();
  for (const phrase of content.phrases) {
    state = apply(state, 'trace', phrase.id);
    reject(state, 'trace', phrase.id);
  }
  state = apply(state, 'next');
  reject(state, 'next');
  for (const id of content.sequence) {
    state = apply(state, 'link', id);
    reject(state, 'link', id);
  }
  state = apply(state, 'next');
  reject(state, 'next');
  for (const id of content.answerSequence) {
    state = apply(state, 'echo', id);
    reject(state, 'echo', id);
  }
  state = apply(state, 'next');
  reject(state, 'next');
  assert.equal(state.screen, 'win');
});

test('transitions never mutate frozen state, actions, or content', () => {
  const deepFreeze = value => {
    Object.freeze(value);
    for (const child of Object.values(value)) if (child && typeof child === 'object' && !Object.isFrozen(child)) deepFreeze(child);
    return value;
  };
  const frozenContent = deepFreeze(structuredClone(content));
  for (const makeState of [initial, trace, link, echo, win]) {
    const state = deepFreeze(makeState());
    const before = JSON.stringify(state);
    for (const action of [{ type: 'home' }, { type: 'trace', value: content.phrases[0].id }, { type: 'link', value: content.sequence[0] }, { type: 'echo', value: content.distractors[0].id }, { type: 'hint' }, { type: 'restart' }]) {
      transition(state, deepFreeze(action), frozenContent);
      assert.equal(JSON.stringify(state), before);
    }
  }
});

const invalidStates = [
  ['null', () => null], ['array', () => []], ['missing fields', () => ({ screen: 'home' })],
  ['old schema', () => ({ ...initial(), schemaVersion: 0 })], ['future schema', () => ({ ...initial(), schemaVersion: 2 })],
  ['different content', () => ({ ...initial(), contentId: 'another-verse' })], ['changed content', () => ({ ...initial(), contentVersion: 2 })],
  ['unknown screen', () => ({ ...initial(), screen: 'unknown' })], ['nonboolean completion', () => ({ ...initial(), completed: 'yes' })],
  ['false completion', () => ({ ...initial(), completed: true })], ['premature victory', () => ({ ...initial(), screen: 'win' })],
  ['premature Afterglow', () => ({ ...initial(), screen: 'afterglow' })], ['LINK before TRACE', () => ({ ...initial(), screen: 'link' })],
  ['ECHO before LINK', () => ({ ...traced(), screen: 'echo' })], ['unknown trace phrase', () => ({ ...trace(), trace: ['invented'] })],
  ['duplicate trace', () => ({ ...trace(), trace: [content.phrases[0].id, content.phrases[0].id] })],
  ['incorrect LINK sequence', () => ({ ...link(), link: [content.sequence[1]] })],
  ['incorrect ECHO sequence', () => ({ ...echo(), echo: [content.answerSequence[1]] })],
  ['later progress at TRACE', () => ({ ...linked(), screen: 'trace' })], ['later progress at LINK', () => ({ ...echoed(), screen: 'link' })],
  ['completed ECHO screen', () => ({ ...win(), screen: 'echo' })], ['negative hints', () => ({ ...link(), hints: -1 })],
  ['fractional mistakes', () => ({ ...echo(), mistakes: 0.5 })], ['unsafe counter', () => ({ ...link(), hints: Infinity })],
  ['preferences in gameplay', () => ({ ...initial(), sound: true })], ['hints before LINK', () => ({ ...trace(), hints: 1 })],
];
for (const [name, makeState] of invalidStates) {
  test(`state validation rejects ${name} and engine refuses it`, () => {
    const state = makeState();
    assert.equal(validateState(state, content).valid, false);
    reject(state, 'home');
  });
}
test('unknown and malformed actions are safe rejections', () => {
  for (const action of [null, undefined, {}, [], { type: 1 }, { type: 'unknown' }]) {
    const result = transition(initial(), action, content);
    assert.equal(result.accepted, false);
    assert.deepEqual(result.effects, []);
  }
});
test('repeated playthroughs, hints, wrong answers, and replay do not leak previous state', () => {
  let state = apply(apply(initial(), 'launch'), 'start');
  for (let round = 0; round < 25; round++) {
    for (const phrase of content.phrases) state = apply(state, 'trace', phrase.id);
    state = apply(state, 'next');
    state = apply(state, 'hint');
    state = apply(state, 'link', content.sequence[2]);
    for (const id of content.sequence) state = apply(state, 'link', id);
    state = apply(state, 'next');
    state = apply(state, 'echo', content.distractors[0].id);
    for (const id of content.answerSequence) state = apply(state, 'echo', id);
    state = apply(state, 'next');
    assert.equal(state.hints, 1);
    assert.equal(state.mistakes, 2);
    if (round % 2) state = apply(state, 'afterglow');
    state = apply(state, 'restart');
    assert.deepEqual(state, { ...initial(), screen: 'trace' });
  }
});

for (let mask = 0; mask < 8; mask++) {
  test(`TRACE subset ${mask.toString(2).padStart(3, '0')} offers exactly its remaining anchors`, () => {
    let state = trace();
    for (let index = 0; index < 3; index++) if (mask & (1 << index)) state = apply(state, 'trace', content.phrases[index].id);
    for (let index = 0; index < 3; index++) {
      const id = content.phrases[index].id;
      if (mask & (1 << index)) reject(state, 'trace', id);
      else assert.equal(transition(state, { type: 'trace', value: id }, content).accepted, true);
    }
    assert.equal(transition(state, { type: 'next' }, content).accepted, mask === 7);
  });
}
test('all partial-stage snapshots survive JSON restoration and continue correctly', () => {
  let state = apply(apply(initial(), 'launch'), 'start');
  const actions = [
    ...content.phrases.map(phrase => ({ type: 'trace', value: phrase.id })), { type: 'next' },
    ...content.sequence.map(id => ({ type: 'link', value: id })), { type: 'next' },
    ...content.answerSequence.map(id => ({ type: 'echo', value: id })), { type: 'next' }, { type: 'afterglow' },
  ];
  for (const action of actions) {
    const restored = JSON.parse(JSON.stringify(state));
    assert.equal(validateState(restored, content).valid, true);
    const originalResult = transition(state, action, content);
    const restoredResult = transition(restored, action, content);
    assert.equal(originalResult.accepted, true);
    assert.deepEqual(restoredResult, originalResult);
    state = restoredResult.state;
  }
  assert.equal(state.screen, 'afterglow');
});
test('Afterglow is optional content and can never unlock without its connection', () => {
  const withoutConnection = structuredClone(content);
  delete withoutConnection.afterglow;
  const result = transition(win(), { type: 'afterglow' }, withoutConnection);
  assert.equal(result.accepted, false);
  assert.equal(result.state.screen, 'win');
  assert.equal(validateState(apply(win(), 'afterglow'), withoutConnection).valid, false);
});
test('adversarial action streams preserve reachable state and cannot bypass completion', () => {
  const actions = [
    ...['home', 'launch', 'start', 'restart', 'next', 'hint', 'resetlink', 'resetecho', 'afterglow', 'unknown'].map(type => ({ type })),
    ...content.phrases.map(phrase => ({ type: 'trace', value: phrase.id })),
    ...content.sequence.map(value => ({ type: 'link', value })),
    ...[...content.answers, ...content.distractors].map(answer => ({ type: 'echo', value: answer.id })),
  ];
  let seed = 1729;
  for (const makeState of Object.values(stageFactories)) {
    let state = makeState();
    for (let index = 0; index < 300; index++) {
      seed = (seed * 48271) % 2147483647;
      const action = actions[seed % actions.length];
      const result = transition(state, action, content);
      assert.equal(validateState(result.state, content).valid, true);
      if (result.state.completed) {
        assert.equal(result.state.trace.length, 3);
        assert.deepEqual(result.state.link, content.sequence);
        assert.deepEqual(result.state.echo, content.answerSequence);
      }
      if (!result.accepted) assert.equal(result.state, state);
      state = result.state;
    }
  }
});
