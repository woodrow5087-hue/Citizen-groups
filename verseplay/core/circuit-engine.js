import { createInitialState, validateState } from './state-schema.js';
export { createInitialState } from './state-schema.js';

const sound = frequency => ({ type: 'sound', frequency });
const announce = message => ({ type: 'announce', message });
const render = screenChanged => ({ type: 'render', screenChanged });
const rejected = (state, reason) => ({ state, accepted: false, effects: [], reason });
const accepted = (state, effects) => ({ state, accepted: true, effects });
const increment = number => Math.min(number + 1, Number.MAX_SAFE_INTEGER);

/**
 * Pure transition API: identifiers in, immutable state and declarative effects out.
 * The caller executes presentation effects and persists only validated gameplay.
 */
export function transition(state, action, content) {
  if (!validateState(state, content).valid) return rejected(state, 'invalid-state');
  if (!action || typeof action.type !== 'string') return rejected(state, 'invalid-action');
  const { type, value } = action;
  switch (type) {
    case 'home':
      return state.screen === 'home' ? rejected(state, 'already-home') : accepted({ ...state, screen: 'home' }, [render(true)]);
    case 'launch':
      return state.screen !== 'home' ? rejected(state, 'wrong-stage') : accepted({ ...state, screen: 'launch' }, [render(true)]);
    case 'start':
    case 'restart': {
      const allowed = type === 'start' ? state.screen === 'launch' : ['win', 'afterglow'].includes(state.screen);
      if (!allowed) return rejected(state, 'wrong-stage');
      return accepted({ ...createInitialState(content), screen: 'trace' }, [render(true), announce('New Verse Circuit started. Stage one of three. Trace.')]);
    }
    case 'next': {
      if (state.screen === 'trace' && state.trace.length === content.phrases.length) {
        return accepted({ ...state, screen: 'link' }, [sound(530), render(true), announce('Stage two. Link the three phrases in order.')]);
      }
      if (state.screen === 'link' && state.link.length === content.sequence.length) {
        return accepted({ ...state, screen: 'echo' }, [sound(600), render(true), announce('Stage three. Echo. Fill three missing words.')]);
      }
      if (state.screen === 'echo' && state.echo.length === content.answerSequence.length) {
        return accepted({ ...state, completed: true, screen: 'win' }, [sound(740), render(true), announce(`Circuit complete. You restored ${content.reference}.`)]);
      }
      return rejected(state, 'stage-incomplete');
    }
    case 'trace': {
      if (state.screen !== 'trace') return rejected(state, 'wrong-stage');
      const phrase = content.phrases.find(item => item.id === value);
      if (!phrase) return rejected(state, 'unknown-selection');
      if (state.trace.includes(value)) return rejected(state, 'repeated-selection');
      const trace = [...state.trace, value];
      return accepted({ ...state, trace }, [sound(480 + trace.length * 100), render(false), announce(`${phrase.text} selected. ${trace.length} of 3 anchors.`)]);
    }
    case 'link': {
      if (state.screen !== 'link') return rejected(state, 'wrong-stage');
      if (!content.sequence.includes(value)) return rejected(state, 'unknown-selection');
      if (state.link.includes(value)) return rejected(state, 'repeated-selection');
      const index = state.link.length;
      if (value !== content.sequence[index]) return wrongAnswer(state, 'link', value, 'Not quite—try the phrase that comes next.');
      const link = [...state.link, value];
      return accepted({ ...state, link }, [sound(450 + index * 90), render(false), announce(`Phrase ${link.length} of 3 connected.`)]);
    }
    case 'echo': {
      if (state.screen !== 'echo') return rejected(state, 'wrong-stage');
      if (![...content.answers, ...content.distractors].some(item => item.id === value)) return rejected(state, 'unknown-selection');
      if (state.echo.includes(value)) return rejected(state, 'repeated-selection');
      const index = state.echo.length;
      if (index === content.answerSequence.length) return rejected(state, 'stage-complete');
      if (value !== content.answerSequence[index]) return wrongAnswer(state, 'echo', value, 'Almost. Try the word that fits this blank.');
      const echo = [...state.echo, value];
      return accepted({ ...state, echo }, [sound(570 + index * 80), render(false), announce(`You recalled ${echo.length} of three missing words.`)]);
    }
    case 'hint': {
      let message;
      if (state.screen === 'link' && state.link.length < content.sequence.length) {
        const segment = content.segments.find(item => item.id === content.sequence[state.link.length]);
        const beginning = segment.hint || segment.text.split(' ').slice(0, 3).join(' ');
        message = `Hint: The next phrase begins “${beginning}…”`;
      } else if (state.screen === 'echo' && state.echo.length < content.answerSequence.length) {
        const answer = content.answers.find(item => item.id === content.answerSequence[state.echo.length]);
        message = `Hint: The answer begins with “${(answer.hint || answer.text[0]).toUpperCase()}”.`;
      } else return rejected(state, 'no-hint-available');
      return accepted({ ...state, hints: increment(state.hints) }, [{ type: 'feedback', target: `${state.screen}-feedback`, message, error: false }, sound(400)]);
    }
    case 'resetlink':
    case 'resetecho': {
      const stage = type === 'resetlink' ? 'link' : 'echo';
      if (state.screen !== stage) return rejected(state, 'wrong-stage');
      if (!state[stage].length) return rejected(state, 'nothing-to-undo');
      return accepted({ ...state, [stage]: state[stage].slice(0, -1) }, [render(false)]);
    }
    case 'afterglow':
      return state.screen !== 'win' || !state.completed || !content.afterglow ? rejected(state, 'afterglow-unavailable') : accepted({ ...state, screen: 'afterglow' }, [sound(740), render(true)]);
    default:
      return rejected(state, 'unknown-action');
  }
}

function wrongAnswer(state, stage, value, message) {
  return accepted({ ...state, mistakes: increment(state.mistakes) }, [
    { type: 'feedback', target: `${stage}-feedback`, message, error: true },
    { type: 'incorrect', action: stage, value },
    sound(180),
  ]);
}
