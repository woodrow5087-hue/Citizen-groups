# UX-02 coordinated implementation and validation

Accepted canonical baseline: 20e71571de10edb3fb09c8b0512997c990ac22bd.
Runtime candidate: 18514495105b771b2ff06039f8df6d208df2297c.
Visual-reference approval is tracked in the charter and PR handoff. Physical
Safari/VoiceOver acceptance, final visual acceptance and merge are separate gates.

## A — shared presentation ownership

`rally-one-widgets.js` exports a small component registry and `apply(view)` adapter.
It decorates already-authorized HTML, retaining native controls, node identities,
accessible names, data-action/data-go selectors, delegated listeners and state
owners. Common header, priority, card, status, people and action classes share scoped
CSS tokens. It has no IO, storage, event handlers, domain lookup, ranking or routing.
The existing composition root calls it after rendering only Rally One Priority Board,
Groups overview and Team schedule. Legacy Smart Stack, Group details/discovery,
Team empty/chat/leader panes, Read, VersePlay and Connect remain outside this scope.
New runtime code is explicitly in the static build allowlist and ordered before
`rallypoint.js`. No dependencies or framework were added.

The CSS uses matte charcoal/graphite, Citizen red, cream, borders and readable
hierarchy. Existing people sprite images remain. Decorative Groups icons share
outline geometry and are hidden from accessibility APIs; no fake counts or data.

## B–D — adaptive presentation, unchanged decisions

Compact greeting and dominant priority precede the existing supporting row; Ask
Rally moves after the actual priority block in DOM order, followed by the existing
At a Glance and people/mission content. The same actions, receipts and reasons stay
attached. Shared context -> RallyIntelligence -> Priority Board -> Unified Focus
remains the sole decision pipeline; none of those domain sources changed.

Leader styling consumes the canonical audience (which derives from context leader
permissions). Existing explicit Taylor/Marcus sample requests and authorized routes
remain the only content; presentation cannot create authority, infer distress,
score spiritual health or send outreach. The same template supports overlapping
memberships and leader/team fixtures.

All Set styling applies to canonical `caught-up`, with existing reassurance and
optional source-backed invitations. `paused`, `group-unavailable` and
`welcome-community` remain distinct; calm is not used as a completion inference.
No counts, tasks, engagement targets or persisted roles are introduced.

## E — transitions, accessibility and responsive coverage

`test/ux02-widgets.test.cjs` covers seven canonical states, unchanged action nodes
and listeners, idempotence, unrelated-surface exclusion, source inverse negative
controls and the absence of IO/controller boundaries. Core application unit tests
continue to guard model, permission, state, storage and recommendation behavior.

`scripts/ux02-browser-check.mjs` exercises visitor, group member, volunteer, leader,
group+serving, leader/team overlap, completed, deferred and malformed-conversation
states. It verifies the existing “Why is this first?” Ask query against the current
Today explanation, preserves unavailable bytes and prevents unknown data becoming
zero unread. It tests 320/375/390/430 widths, short 390×568 and doubled text,
route authorization, native actions, unchanged Read scope, axe contrast/semantics,
normal/reduced-motion presses and Escape focus return. Scenario notifications are
allowed to finish naturally before captures; no screenshot masks are used.

The member/leader, completion, pause and unavailable messages are the canonical
renderer’s existing copy. Presentation contains no alternate recommendation model.
Existing comprehensive browser suites additionally cover confirmations, receipts,
conversation read cursor, response persistence, corrupt/interrupted storage,
portrait origin, care consent and real game interactions.

## F — Groups and Team

Groups retains authentic circular portraits, directory/discovery, actual Wednesday
identity/gathering, conversation status, RSVP, prayer/care and gated leader controls.
The first portrait remains fully visible; larger labels wrap rather than truncate.
Team schedule retains the actual Welcome Team dates, response words, confirmation,
decline/coverage, messages, huddle and permission-gated leader tools. Compact headers
and shared card/status/action treatment do not change fixture data or transitions.
No live synchronization, staffing marketplace or other deferred feature is simulated.

## Regression and acceptance ledger

Historical source hashes are unchanged. An exact inverse removes only the declared
UX02 render hook and scoped CSS addition before the prior UX01/UX1E reconstruction
chain runs. Tests reject unrelated mutations and altered widget CSS. Read’s accepted
source and layout, Connect implementation and all domain/game sources remain intact.

Intentionally affected capture scenes: Today and its role/state variants, Groups
home, Team schedule, and full Ask Rally composition because Today is visible behind
the unchanged dialog. This does not authorize an Ask panel redesign. Strict pixel
comparison for every unaffected capture and accepted Read remains required. All
prior immutable source references and captures remain available; intentional deltas
must be recorded separately. No new reference is established before owner approval.

Local results: npm ci, 856 application tests, 172 VersePlay unit tests, all standard
browser/mobile/accessibility/onboarding/Blank Battle/Groups storage/standalone and
integrated messaging suites, leadership/full preview/10C.5 journeys and synthetic
review passed. VersePlay browser passed 433 checks and 49 pairs with zero raw
pixel differences and no console/font errors. All six targeted viewport/text
scenarios passed, including role overlap, state distinctions and focus/motion.

A review-only control built immutable PR119, accepted PR144 Read and accepted
premium Read independently, and captured candidate source at 320/375/390/430.
All 36 unaffected comparisons (including Read and Ask Rally) had zero raw pixel
differences; 28 intended Today/Groups/Team comparisons record their actual deltas.
Ask Rally full frames proved unchanged, so they remain in the strict historical
scope. The control deliberately exits with review-required status, not acceptance;
it is not the CI gate and is not shipped. No new reference has been pinned.

Owner visual-reference approval is pending. The draft PR, final strict adaptive
reference validation, exact-head CI and deployment provenance remain blocked on
that required decision. No branch push or successful remote QA is claimed yet.
Candidate captures are under ignored `test-results/ux02`; temporary diagnostic
fixtures/controls are not public runtime assets.

## Device acceptance stop

Use the exact immutable preview in the PR handoff and record reviewer/date, model,
iOS/Safari version and evidence. Review member/volunteer/leader/overlap/visitor,
completed/paused/unavailable distinctions, primary action reachability, larger text,
short screens/safe areas/landscape, authentic portraits, Group/Team response and
coverage, conversation unread and care consent, Ask agreement, confirmation receipts,
keyboard/VoiceOver names/order/expanded states/focus return and Reduce Motion.
Recheck the unchanged premium Read, all games/return paths and Connect. Do not merge
without explicit authorization. Production, canonical development, recovery refs
and the engineering roadmap remain untouched; no credentials or live records.


## Owner reference approval — 2026-11-25
Owner approved the hosted visual reference at ef4b8e7bfc2523d109da463b41c78c22ca40d1e9
(runtime identical to 1851449). This supersedes reference-pending statements above.
Only Today role scenes, Groups home and Team schedule use the new reference.
Ask Rally and unaffected PR119 surfaces remain strict; Read keeps its accepted
premium reference. Four widths now yield 32 PR119 + 4 Read + 28 adaptive pairs.
The shared module is additionally byte-protected against the approved source.
Physical Safari/VoiceOver, final acceptance and merge authorization remain pending.
