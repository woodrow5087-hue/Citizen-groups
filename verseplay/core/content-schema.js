/** Data validation only. Editorial approval is a human decision, never inferred here. */
export const CONTENT_SCHEMA_VERSION = 1;
const record = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const text = value => typeof value === 'string' && value.trim().length > 0;
const id = value => typeof value === 'string' && /^[a-z][a-z0-9-]*$/.test(value);
const unique = values => new Set(values).size === values.length;

/** Validate a three-stage Verse Circuit passage without changing its text or punctuation. */
export function validateContent(content) {
  const errors = [];
  const check = (condition, message) => { if (!condition) errors.push(message); };
  if (!record(content)) return { valid: false, errors: ['Content must be an object.'] };
  check(content.schemaVersion === CONTENT_SCHEMA_VERSION, 'Unsupported content schema version.');
  check(id(content.id), 'A stable content identifier is required.');
  check(Number.isSafeInteger(content.version) && content.version >= 1, 'A positive content version is required.');
  for (const key of ['ref', 'reference', 'text']) check(text(content[key]), `${key} is required.`);
  check(record(content.translation) && text(content.translation.id) && text(content.translation.name) && text(content.translation.caption), 'Translation identity and caption are required.');
  check(record(content.source) && text(content.source.url) && text(content.source.reference) && text(content.source.verifiedOn) && text(content.source.verification), 'Vetted source evidence is required.');
  check(content.source?.text === content.text, 'Passage must match its recorded vetted source text exactly.');
  check(record(content.review) && ['source-verified-editorial-pending', 'editorially-approved'].includes(content.review.status) && text(content.review.editorialAttribution), 'Review status and editorial attribution are required.');
  if (content.review?.status === 'editorially-approved') check(text(content.review.approvedBy), 'Editorial approval requires attribution.');
  check(record(content.rights) && content.rights.status === 'public-domain' && text(content.rights.url) && text(content.rights.attribution), 'Public-domain rights evidence is required.');

  const tables = {};
  const allIds = [];
  for (const collection of ['phrases', 'segments', 'answers', 'distractors']) {
    const entries = content[collection];
    check(Array.isArray(entries) && (collection === 'distractors' || entries.length === 3), `${collection} must be an array${collection === 'distractors' ? '' : ' with three entries'}.`);
    tables[collection] = new Map();
    if (!Array.isArray(entries)) continue;
    for (const entry of entries) {
      check(record(entry) && id(entry.id) && text(entry.text), `${collection} entries require stable IDs and text.`);
      if (!record(entry)) continue;
      allIds.push(entry.id);
      tables[collection].set(entry.id, entry);
      if (collection === 'segments') check(typeof entry.following === 'string' && text(entry.hint), 'Segments require punctuation and hint text.');
      if (collection === 'answers') check(text(entry.hint), 'Answers require hint text.');
    }
    check(unique(entries.map(entry => entry?.text)), `${collection} texts must be distinct.`);
  }
  check(unique(allIds), 'Phrase, segment, answer, and distractor IDs must be unique.');
  const permutation = (values, expected, label) => {
    check(Array.isArray(values) && unique(values) && values.length === expected.length && values.every(value => expected.includes(value)), `${label} must contain each expected ID exactly once.`);
  };
  const segmentIds = [...tables.segments.keys()];
  const answerIds = [...tables.answers.keys()];
  const optionIds = [...answerIds, ...tables.distractors.keys()];
  permutation(content.sequence, segmentIds, 'Correct sequence');
  permutation(content.linkOrder, segmentIds, 'LINK display order');
  permutation(content.answerSequence, answerIds, 'Answer sequence');
  permutation(content.echoOrder, optionIds, 'ECHO display order');
  const optionTexts = [...tables.answers.values(), ...tables.distractors.values()].map(entry => entry.text);
  check(unique(optionTexts), 'Distractors must differ from correct answers.');
  if (Array.isArray(content.sequence)) {
    const rebuilt = content.sequence.map(segmentId => {
      const segment = tables.segments.get(segmentId);
      return segment ? segment.text + segment.following : '';
    }).join('');
    check(rebuilt === content.text, 'Reconstructed LINK passage must match source text exactly.');
  }
  for (const [field, tokenKey, table] of [['traceTokens', 'phraseId', tables.phrases], ['echoTokens', 'answerId', tables.answers]]) {
    const tokens = content[field];
    check(Array.isArray(tokens) && tokens.length > 0, `${field} are required.`);
    if (!Array.isArray(tokens)) continue;
    const usedIds = [];
    let rebuilt = '';
    for (const token of tokens) {
      const plain = record(token) && Object.keys(token).length === 1 && typeof token.text === 'string';
      const reference = record(token) && Object.keys(token).length === 1 && table.has(token[tokenKey]);
      check(plain || reference, `${field} contains an invalid token.`);
      if (plain) rebuilt += token.text;
      else if (reference) { usedIds.push(token[tokenKey]); rebuilt += table.get(token[tokenKey]).text; }
    }
    permutation(usedIds, [...table.keys()], `${field} references`);
    check(rebuilt === content.text, `Reconstructed ${field} passage must match source text exactly.`);
    if (field === 'echoTokens') check(JSON.stringify(usedIds) === JSON.stringify(content.answerSequence), 'ECHO blanks must follow the answer sequence.');
  }
  if (content.afterglow !== undefined) {
    const note = content.afterglow;
    check(record(note) && id(note.id) && ['illustrative', 'editorially-approved'].includes(note.status), 'Afterglow must have an explicit review status.');
    for (const field of ['editorialAttribution', 'prompt', 'completedReference', 'completedSummary', 'relatedRef', 'relatedSummary', 'label', 'title', 'body', 'caution']) check(text(note?.[field]), `Afterglow ${field} is required.`);
    if (note?.status === 'editorially-approved') check(text(note.approvedBy), 'Afterglow approval requires attribution.');
    if (note?.status === 'illustrative') check(/illustrative/i.test(note.caution) && /editorial review/i.test(note.caution), 'Illustrative Afterglow must retain a clear editorial-review caution.');
  }
  return { valid: errors.length === 0, errors };
}

export function assertValidContent(content) {
  const result = validateContent(content);
  if (!result.valid) throw new Error(`Invalid Verse Circuit content: ${result.errors.join(' ')}`);
  return content;
}
