# Verse Circuit content lifecycle

The sample at [john-15-12.json](john-15-12.json) reproduces the approved John 15:12 prototype exactly. The verse text was compared on November 23, 2026 against [Bible Hub's Berean Standard Bible, John 15](https://biblehub.com/bsb/john/15.htm), verse 12. Its capital letters, words, comma, and final period match. The [publisher's licensing page](https://berean.bible/licensing.htm) states that Berean Bible texts entered the public domain April 30, 2023.

Source verification is recorded as `source-verified-editorial-pending`. It does **not** assert a church review or approval. The original prototype did not identify its author, so the attribution says so. Afterglow preserves the original author-written connection to Mark 12:31 and its visible illustrative/editorial-review caution. It is not a second verified Scripture quotation or official church teaching.

## Add another passage

1. Obtain the exact text from the BSB publisher or another permitted, vetted source. Record its URL, reference, exact text, verification date, translation, attribution, and rights evidence. Do not assume another translation is public domain.
2. Copy the sample structure into a new JSON file. Assign a new stable lowercase ID. Start `version` at 1. Preserve IDs across changes only when they still identify the same phrase or answer.
3. Supply three TRACE phrases, three LINK segments, and three ECHO answers. This engine intentionally models the current three-challenge game; it is not a general Scripture engine.
4. Set `sequence` to segment IDs in source order. Each segment's `following` supplies punctuation or spaces **after** its displayed phrase, so joining `text + following` reconstructs the entire exact source. `linkOrder` controls the displayed choices without changing the correct order.
5. Define `traceTokens` as literal `{ "text": "..." }` chunks and `{ "phraseId": "..." }` references. Define `echoTokens` with literal text and `{ "answerId": "..." }` blanks. Both must reconstruct the exact vetted text; punctuation and case are significant.
6. Supply `answerSequence` in blank order, distractors with distinct IDs/text, and `echoOrder` containing every answer and distractor once. Give segments and answers explicit hint text. The current hints preserve the prototype's opening words and first letters.
7. Omit optional `afterglow`, or supply attributed copy with an explicit review status. Keep an explicit illustrative/editorial-review caution while unapproved. Never set an approval status or name a reviewer without evidence of their approval.
8. Run `npm run test:verseplay` from the repository root. Add a content-validation test for the new fixture. Compare the full passage reconstructed by TRACE, LINK, and ECHO with the source. Execute browser QA at 320, 375, 390, and 430 pixels after choosing the new content in the controller.
9. Obtain human Scripture/editorial and rights review before church-wide publication. Automated validation checks consistency; it cannot establish theological or editorial accuracy.

## Version and migration policy

`schemaVersion` describes the content file format. `version` identifies the reviewed passage/puzzle revision. Increment the content version for wording, punctuation, phrase boundaries, answer, order, or hint changes that can invalidate existing progress. A different passage requires a new content ID. Do not silently reuse the same ID/version for changed content.

Saved progress binds to both the content ID and version. Unsupported saves reset only the affected Verse Circuit game; the player receives a clear explanation and their sound preference and unrelated Rally One data remain intact. A current-version valid prototype save migrates from `verse-circuit-design-v1`; its legacy key is left untouched so the original remains useful for comparison.

## Validation contract

`validateContent(value)` returns `{ valid, errors }`; `assertValidContent(value)` throws an actionable error for invalid input. Validation covers required metadata and review attribution, stable unique IDs, option permutations, correct answer order, distinct distractors, explicit hints, and exact reconstruction of the vetted source text in all three stages. The controller must validate before rendering or restoring progress. Content text must be escaped when rendered as HTML.

The recorded `source.text` is an audit snapshot. Code checks compare against that snapshot; a developer changing both fields can still introduce an editorial mistake. Source verification and human review remain required for every new passage or textual revision.
