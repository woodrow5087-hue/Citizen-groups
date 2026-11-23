/** The saved gameplay contract. Interface preferences are stored separately. */
export const STATE_SCHEMA_VERSION = 1;
export const SCREENS = Object.freeze(['home', 'launch', 'trace', 'link', 'echo', 'win', 'afterglow']);

export function createInitialState(content) {
  return {
    schemaVersion: STATE_SCHEMA_VERSION,
    contentId: content.id,
    contentVersion: content.version,
    screen: 'home',
    trace: [],
    link: [],
    echo: [],
    mistakes: 0,
    hints: 0,
    completed: false,
  };
}

const STATE_FIELDS = Object.keys(createInitialState({ id: '', version: 1 }));
const isRecord = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const uniqueStrings = value => Array.isArray(value) && value.every(id => typeof id === 'string') && new Set(value).size === value.length;
const prefixOf = (values, sequence) => values.every((id, index) => id === sequence[index]);

/** Validate both field types and reachability; never repair progress by guessing. */
export function validateState(state, content) {
  const errors = [];
  if (!isRecord(state)) return { valid: false, errors: ['State must be an object.'] };
  if (!isRecord(content) || !Array.isArray(content.phrases) || !Array.isArray(content.sequence) || !Array.isArray(content.answerSequence)) {
    return { valid: false, errors: ['Validated Scripture content is required.'] };
  }
  for (const field of STATE_FIELDS) if (!Object.hasOwn(state, field)) errors.push(`Missing ${field}.`);
  if (Object.keys(state).some(field => !STATE_FIELDS.includes(field))) errors.push('Unknown gameplay fields.');
  if (state.schemaVersion !== STATE_SCHEMA_VERSION) errors.push('Unsupported state schema version.');
  if (state.contentId !== content.id || state.contentVersion !== content.version) errors.push('Scripture content has changed.');
  if (!SCREENS.includes(state.screen)) errors.push('Unknown screen.');
  if (typeof state.completed !== 'boolean') errors.push('Completion must be a boolean.');
  for (const field of ['mistakes', 'hints']) {
    if (!Number.isSafeInteger(state[field]) || state[field] < 0) errors.push(`${field} must be a nonnegative safe integer.`);
  }
  for (const field of ['trace', 'link', 'echo']) if (!uniqueStrings(state[field])) errors.push(`${field} must contain unique identifiers.`);
  if (errors.length) return { valid: false, errors };

  const phraseIds = content.phrases.map(phrase => phrase.id);
  if (state.trace.some(id => !phraseIds.includes(id))) errors.push('Unknown TRACE phrase.');
  if (!prefixOf(state.link, content.sequence)) errors.push('LINK progress is not a correct sequence prefix.');
  if (!prefixOf(state.echo, content.answerSequence)) errors.push('ECHO progress is not a correct answer prefix.');
  const traced = state.trace.length === phraseIds.length;
  const linked = state.link.length === content.sequence.length;
  const echoed = state.echo.length === content.answerSequence.length;
  if (state.link.length && !traced) errors.push('LINK requires completed TRACE.');
  if (state.echo.length && (!traced || !linked)) errors.push('ECHO requires completed TRACE and LINK.');
  if ((state.hints || state.mistakes) && (!traced || state.screen === 'trace')) errors.push('Hints and mistakes require reaching LINK.');
  if (state.completed && (!traced || !linked || !echoed)) errors.push('Completion requires every stage.');
  if (state.screen === 'trace' && (state.link.length || state.echo.length || state.completed)) errors.push('TRACE cannot contain later-stage progress.');
  if (state.screen === 'link' && (!traced || state.echo.length || state.completed)) errors.push('Unreachable LINK state.');
  if (state.screen === 'echo' && (!traced || !linked || state.completed)) errors.push('Unreachable ECHO state.');
  if (['win', 'afterglow'].includes(state.screen) && !state.completed) errors.push('Victory and Afterglow require completion.');
  if (state.screen === 'afterglow' && !content.afterglow) errors.push('This passage has no Afterglow connection.');
  return { valid: errors.length === 0, errors };
}
