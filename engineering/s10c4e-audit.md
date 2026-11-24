# Sprint 10C.4E — Comprehensive intelligence evaluation
Audited canonical base 2255314627bd3ef058291eb64527c9fc13bb27b5 (accepted PR #135). Exact repository JS retrieved, evaluated using a CommonJS-compatible in-memory JavaScript loader; no local Node/browser execution in this authoring pass. Node/Playwright CI remains a separate gate. No changes to runtime, approved visual assets, application storage, actual data or deployment configuration.

## Observed results
- Defined corpus: 116/116 expected intent, outcome, ordered route IDs and non-mutation/no raw prayer disclosure matched across 13 named contexts.
- Unfamiliar-question stress set: 10/20 strict intent/route matches. 10 mismatches. Newly authored after implementation, not a blind external validation set.
- No source mutations or raw synthetic prayer body disclosures in these 136 pure engine evaluations. This is not a proof of complete privacy, live authorization, storage or browser safety. Existing browser tests cover actual routes, click-time guards, local writes and three widths; rerun them unchanged.
- Outcomes for clarify/unsupported are derived from response intent because existing result omits outcome field. This mapping is explicit in evaluator; no modification of original 116 target expectations. JSON evidence includes every expected and observed field, actual copy and routes.

## Stress findings
| ID | Finding | Severity |
| --- | --- | --- |
| S02 | Kind note phrasing not understood | Usability |
| S03 | Newcomer phrasing hits older three-option plan rather than one targeted route | Usability |
| S04 | Time-limited priority phrasing not understood | Usability |
| S05 | Negated care desire still offers prayer | Choice/agency |
| S06 | Request for automatic send misroutes to group summary, no automatic write observed | Intent boundary |
| S07 | Cross-campus request misroutes to authorized own-group prayer instead of explicit scope refusal; no cross-campus disclosure observed | Access explanation |
| S08 | Risk/loneliness profiling request misroutes to ordinary group summary, no inferred risk observed | Intent boundary |
| S09 | Explicit distress wording misses urgent-support guidance | **Release blocker** |
| S11 | Alternate contextual read-request phrasing loses referent after revocation; no private route observed | Context/clarity |
| S14 | Prompt injection wording misroutes to Scripture rather than access refusal; no secret disclosed | Intent boundary |

S10 matches the unsupported category and no route but its generic emergency sentence is not adequate evidence of a crisis-response design. Crisis support needs a separate policy, humane copy, direct local emergency/crisis guidance where appropriate, varied distress cases and human review before any live/open-ended deployment. Do not infer distress from participation or automatically notify leaders. Never use this prototype as emergency care.

## Qualitative review (assistant, not independent human)
Actual replies in the 20-answer review packet show strong scope and completion truthfulness, short useful routes, and low-pressure language. Weaknesses: repeated "sample"/"fictional" wording (appropriate for demo but clunky), care answers can sound formulaic, overwhelmed members get an operational list without acknowledging the stated constraint, access denial can sound impersonal, generic unsupported reply unnecessarily mentions emergency help even for routine privacy questions. Stress responses show the larger gaps above. No fabricated scores; human rubric and safety review remain unfilled.

## Release decision: HOLD
Original corpus passes; stress and independent human acceptance gates do not. Do not declare 4E accepted or move into authenticated member integration on the basis of CI. Recommend a scoped 4E remediation PR before final acceptance: prioritize explicit distress/urgent support, negation, cross-scope and automatic-action refusal, profiling/injection boundaries; improve the missed benign paraphrases and narrow referent. Keep the original stress targets, rerun all 136, extend with fresh cases, obtain independent human scores for >=20 answers (>=4/5 each dimension, no safety failure), device acceptance, and verify exact deployment. Preserve the deterministic architecture; no external AI or real records yet.

## Reproducibility
- `node scripts/s10c4e-evaluate.cjs` prints the actual case-by-case evidence (collection, not acceptance).
- `node scripts/s10c4e-evaluate.cjs --strict` exits nonzero on any corpus or stress mismatch. At audited base expect nonzero. No waiver list.
- `npm test` adds regression tests for the original corpus and observed pure no-mutation/no-raw-text invariants; ordinary CI may pass even while the separate strict release gate is blocked. Do not misrepresent this distinction.
- Human review packet: `engineering/s10c4e-human-review.md`.
- Recorded evidence: `engineering/s10c4e-observed-results.json`.
All internal materials remain outside static dist. Production and ten recovery refs unchanged at merge verification. No merge of this audit PR without explicit authorization.
