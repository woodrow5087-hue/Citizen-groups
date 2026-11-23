import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { assertValidContent, validateContent } from '../core/content-schema.js';
const content = JSON.parse(readFileSync(new URL('../content/john-15-12.json', import.meta.url)));
const changed = mutate => { const candidate = structuredClone(content); mutate(candidate); return candidate; };

test('verified John 15:12 content reconstructs exact BSB text in all stages', () => {
  assert.deepEqual(validateContent(content), { valid: true, errors: [] });
  assert.equal(assertValidContent(content), content);
  assert.equal(content.text, 'This is My commandment, that you love one another as I have loved you.');
  assert.equal(content.review.status, 'source-verified-editorial-pending');
  assert.equal(content.review.approvedBy, null);
  assert.equal(content.afterglow.status, 'illustrative');
});
for (const [name, mutate] of [
  ['unsupported schema', value => value.schemaVersion = 2],
  ['missing content ID', value => delete value.id],
  ['invalid content version', value => value.version = '1'],
  ['missing translation', value => delete value.translation],
  ['changed source text', value => value.text += ' '],
  ['changed source verification', value => delete value.source],
  ['missing rights evidence', value => delete value.rights],
  ['invented editorial approval', value => value.review.status = 'editorially-approved'],
  ['duplicate phrase ID', value => value.phrases[1].id = value.phrases[0].id],
  ['cross-table duplicate ID', value => value.answers[0].id = value.phrases[0].id],
  ['duplicate phrase text', value => value.phrases[1].text = value.phrases[0].text],
  ['missing segment', value => value.segments.pop()],
  ['incorrect sequence', value => value.sequence.reverse()],
  ['missing display option', value => value.linkOrder.pop()],
  ['duplicate answer sequence', value => value.answerSequence[1] = value.answerSequence[0]],
  ['unknown ECHO option', value => value.echoOrder[0] = 'unknown'],
  ['punctuation drift', value => value.segments[0].following = ' '],
  ['TRACE word drift', value => value.traceTokens[0].text = 'This is my '],
  ['TRACE unknown phrase', value => value.traceTokens[1].phraseId = 'unknown'],
  ['TRACE malformed token', value => value.traceTokens[1] = null],
  ['TRACE extra token field', value => value.traceTokens[1].text = 'commandment'],
  ['ECHO missing blank', value => value.echoTokens[1] = { text: 'commandment' }],
  ['ECHO incorrect blank order', value => value.answerSequence.reverse()],
  ['distractor equals answer', value => value.distractors[0].text = 'commandment'],
  ['missing hint', value => delete value.segments[0].hint],
  ['missing review caution', value => value.afterglow.caution = 'Approved teaching.'],
  ['unattributed connection approval', value => value.afterglow.status = 'editorially-approved'],
]) {
  test(`content rejects ${name}`, () => assert.equal(validateContent(changed(mutate)).valid, false));
}
test('validator handles non-objects and malformed collections without throwing', () => {
  for (const value of [null, 7, [], {}, changed(c => c.phrases = [null, {}, 'x']), changed(c => c.segments = 'bad'), changed(c => c.afterglow = null), changed(c => c.answers = [null, {}, 7]), changed(c => c.echoTokens = [null, {}, 7]), changed(c => c.translation = null), changed(c => c.rights = null), changed(c => c.source = null), changed(c => c.review = null)]) {
    assert.equal(validateContent(value).valid, false);
  }
});
test('assertion gives actionable validation errors', () => assert.throws(() => assertValidContent({}), /Invalid Verse Circuit content/));
test('optional Afterglow may be omitted; review remains mandatory when supplied', () => {
  assert.equal(validateContent(changed(c => delete c.afterglow)).valid, true);
});
