# Rally One — Companion intelligence blueprint v1
## 10C.4A · architecture and evaluation contract
Canonical base: ee832daf5dfa5ee0de33d0daed7e1f8c2e6093a8 (accepted PR #131). This is a design/evaluation contract, not a runtime implementation or a claim of conversational AI. All fixtures are fictional and browser-local.

### Product mission
Help a member become known, connected, supported and involved. Today is the proactive interface; Ask Rally is the conversational interface to the same current-source understanding. The companion enables human relationships, not replaces pastors. It is not a church website, attendance tracker, pastoral risk classifier, or general-purpose chatbot.

### Architecture and ownership
| Layer | Current authority | 10C.4 direction |
| --- | --- | --- |
| Know | RallyMemberContext.snapshot; existing local app/profile and modern conversation read owner | Consume minimized current projection; no new member store |
| Understand | RallyPersonalCompanion.respond / classify | Bounded intent resolver, explicit uncertainty, short session topic only |
| Discern | RallyIntelligence.derive / RallyUnifiedFocus.focus | Reuse selected decisions and eligibility; no second scoring engine |
| Guide | Existing Ask response/items/action contract and existing navigation handlers | Current-source response plan, one or two relevant next steps, separately tapped controls |
| Remember | Explicit existing state transitions, local message owner, RallyStorageGuard | Completion follows saved action, never a typed question or draft; no transcript persistence |

Today keeps its current hero and at most one action row. Ask can answer a targeted question about a valid opportunity that was not selected for Today, but must not manufacture a task or change ranking. General focus questions use the identical ordered selected IDs. Distinguish focused recommendations (including optional care) from broader weekly obligations; do not silently label deferred items or optional care as required. Preserve the existing opening view until a separately approved intentional copy/design delta is reviewed.

### Intent and response contract
Extend the existing deterministic responder, not parallel conversational state or a new data owner. Proposed canonical-only intents:
- connect: visitor discovery or existing community reconnection; no automatic enrollment.
- care: authorized explicitly shared request; ready -> read prayer; prayed -> optional check-in; paused -> respect pause; completed -> acknowledge only when asked; absent/revoked -> no private details or action.
- care-status: report only saved current authorized completion; distinguish local save from real delivery.
- focus: same current Today selected IDs and explanation; acknowledge settled/deferred/unavailable states accurately.
- leader: current scoped explicit requested follow-up; never infer risk from absence, attendance, reading, or response speed.
- clarify / unsupported: state uncertainty, offer safe existing topics, do not invent a person or perform an action.
- Existing group, serve, week, scripture, why and legacy preview flows retain their contracts.

Priority of interpretation: reject unsupported surveillance or automatic-action requests; handle explicit new topic; handle narrow short follow-up only within current valid session topic; then existing intent grammar; clarify ambiguity rather than guessing. Explicit new topic supersedes previous topic. A typed yes, imperative, or draft is not consent to mutate. Any action route is allowlisted and revalidated against current source, permission and stage at click. Keep current confirm paths for RSVP/serving; care routes are navigation only. Do not expose raw prayer text in Ask: the authorized existing prayer screen remains the source of details. No person names from unauthorized/stale context, no inference from attendance or photo, no persistent conversational memory. Session history remains short-lived; clear on close and role/scenario changes, and audit for revocation before showing previous private answers.

Response item expectations: title, detail, grounded reason and nullable allowlisted action; intent and session focus are descriptive, not authority. Prefer one actionable answer over multiple options unless clearly requested. Do not introduce a second app-level response schema unless necessary and reviewed. The future external-language adapter is a proposal only: it may classify/phrase from minimized authorized facts; application owns retrieval, truth, eligibility, action execution, consent and validation. No provider keys, network calls, real records or external AI in 10C.4.

### Voice and safety
Warm, attentive, calm, clear, choice-preserving. Use ordinary natural language, not repetitive compliance prose. No guilt, false intimacy, diagnoses, spiritual score, claims of divine guidance, or inferred need. Distinguish actual user-stated overwhelm from inferred condition; simplify choices without labeling the member. If explicit distress or crisis is raised, prioritize appropriate human/urgent support without inventing a pastoral notification; crisis response design and testing are a separate required gate before any general-purpose model deployment. Do not promise delivery or follow-up that the system cannot perform. Explain source limits plainly. No open-ended counseling feature in this sprint.

### Evaluation and release gates
The companion corpus contains 116 prospective cases spanning 13 named synthetic contexts. Each defines intent, outcome, route allowlist and invariants. These are target requirements, NOT claims of passing runtime tests. 4B/4C/4D convert cases to executable current-engine evaluations in their scope; 4E must run the complete corpus with distinct actual fixtures and capture per-case observed outcomes. Preserve originals; any correction to a target must be justified and reviewed. The manifest test validates only corpus integrity. Do not count paraphrase variants as independent users or claim statistical model performance.
Mandatory thresholds: zero unauthorized disclosures, automatic writes, invented completion, inferred risk, stale-route bypasses; 100% supported-case outcome/route compliance before acceptance; no legacy regressions; all existing CI, immutable visual comparison and physical-device acceptance. Separate human review of at least 20 diverse representative answers (helpfulness, clarity, tone, specificity, truthful limits; score 1-5 each, no safety failures, target >=4 per dimension mean). Include VoiceOver, reduced motion, 320/390/430px, touch target and focus behavior. Report actual counts, failures, pending gates and source provenance. No weakening frozen screenshots or source hashes. If intentional copy changes affect baseline screenshots, present scoped before/after for approval, never mask a regression.

### Delivery sequence
A: this blueprint and target evaluation corpus, no runtime changes.
B: canonical intent recognition, adversarial/ambiguous language and legacy parity. Add executable tests for supported grammar.
C: current-context conversation, bounded short follow-ups, completion and revocation, no persistent transcript.
D: response planning and safe actions using existing routes; weekly count semantics, optional vs required labels and copy review. Avoid parallel decision engine.
E: full corpus execution, cross-surface browser scenarios, qualitative review and documented remaining limitations. Then 10C.5 end-to-end member journeys; Sprint 11 server-authenticated integration architecture requires separate approval.

### Change control
Every stage uses a small draft PR against rally-one/develop and the established validation gates, including explicit subsequent merge authorization. Production and existing ten recovery refs must remain untouched. All evaluation data and internal design notes remain outside static dist. Do not use real church data or credentials.
