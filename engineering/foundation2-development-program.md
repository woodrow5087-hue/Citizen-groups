# Rally One Foundation 2.0 — Gated Development Program
Status: CONVERGENCE 2B active candidate; not promoted. One active implementation branch: `rally-one/convergence-2b`.
Canonical: `9b06795f9087e07e1b8e12b55bfa109d68fc41d1` (PR #152 merge; parents b7bb0687 and accepted 37c4be9).

## Current project recovery record (authoritative over historical gate notes below)

- 2A closed: canonical push QA [45887514510](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45887514510) and Foundation [45887514399](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45887514399) passed. Canonical immutable preview: https://6b088f41185ab13161bad865--citizen-connect-test.netlify.app/foundation2/ . All 203 files verified; explicit legacy return passed. Production/main, PR150 and recovery refs preserved.
- Owner accepted 3/3 targeted 2A physical checks and the 72-image technical reference at 37c4be9; manifest SHA256 87418a8d58c72b2e08dd0e485f580cadeb6fe4ab1c3410db36a64f2ede8c57d7. Reference is not a permanent design lock.
- Owner explicitly deferred the unstable new Foundation zero-pixel comparator to [#153](https://github.com/woodrow5087-hue/Citizen-groups/issues/153). It is unresolved, not a passing gate. Do not reopen it in this block. Established historical/Connect/VersePlay protections remain strict. Archived comparator/evidence SHA256 53ca45c9ea383003a8b9c6beafaf5a0341b44c137d2087fad70e9f02ac2da9e4.
- Root/default remains legacy. Foundation is opt-in. No production, live integration, destructive migration, real member records or external communications.

## Master roadmap and prioritized backlog

| Sequence | Status | Scope / source-backed gaps | Acceptance gate |
|---|---|---|---|
| 2A | Closed/promoted | Controlled preview, CI applicability, fictional dates | Accepted exact source; canonical push and deployment verification complete. |
| 2B | Active | P1 G04 shared required/optional decision contract; G05 personalized entry; G06 accepted Ask Rally; G15 safe profile handoff/rollback; G22 event-bound fixture responses | Cross-role, privacy, action/read-state, reload/rollover/unknown/concurrency tests; complete applicable regression; exact preview; changed-journey physical acceptance. Separate promotion authorization. |
| 2C | Planned, not authorized | P1 premium conversation convergence, DM/Room/draft boundaries G07/G12 | Reuse existing domains and UI, authorization/draft/read-cursor gates. |
| 2D | Planned, not authorized | P1 people/care/leader and Read/game return parity G08/G09/G10; storage feedback G13 | Close agreed parity rows with affected visual/device and full game regression. |
| 2E | Planned, not authorized | Controlled default cutover only after parity and state/rollback decisions | Explicit cutover approval, provenance, recovery and complete gates. Production excluded. |
| Deferred | Backlog only | #153 Foundation visual reliability; measured maintenance/performance; governance | Separately scheduled. No weakening existing gates or new infrastructure sprint. |

## Decisions and module ownership

- Preserve the accepted Foundation policy: explicit commitments need a response; messages/Scripture/care opportunities are optional. All Set is not a spiritual/engagement score. Today and Ask must consume the same Foundation commitment projection, not introduce new scoring or change the original protected Focus engine.
- `RallyMemberContext` / `RallyIntelligence` remain source/permission/intelligence authorities; Foundation adapts their context and existing Today projection. Explicit synthetic scenario owns membership/role; personalization/handoff never grants either.
- Existing Foundation guarded primary/today records own persisted local fields; conversation repository owns drafts/read cursor; game engines own progress. No new storage keys or bulk migration.
- Event identities must identify the current dated fictional gathering/shift. Old global responses have no proven event/timestamp and must not be silently assigned to a new event. Preserve them when adding explicit event-bound responses.
- Reuse accepted welcome through its existing entry route and canonical Ask service. Profile handoff is explicit, previewed, name/campus only, with original keys untouched and a local undo. Full welcome controller extraction and cross-application migration are not implied.
- Current implementation: one Foundation member-session adapter, guarded personalization and undo, explicit name/campus-only handoff from accepted onboarding, canonical Ask Rally rendering/actions, shared required/optional projection, and dated fixture response records. Legacy unbound values are retained without inferred event/timestamp; unrelated actions do not rewrite them. Current actions: complete final applicable validation, prepare exact-source preview and targeted device checklist. No 2B merge without owner authorization.

### 2B field contracts and validation recovery

`foundation2/member-session.js` adapts the existing intelligence/context and Foundation Today projection. Synthetic identity is namespace-based, not a verified member ID. `eventResponses.version=1` stores `records[fixtureEventId] = {kind, at, value, coverage}` in the existing guarded primary record. IDs identify the current North-campus local fixture and dated gathering/shift, not a Planning Center event. Browser timezone changes can conservatively require a fresh response. Only explicit dated response actions create records. Assignment dates remain visible after decline so coverage is attached to a reviewable dated shift. Prior undated values stay unbound; unrelated actions preserve raw compatibility fields. Original app keys remain untouched.

`state-store.js` owns guarded name/campus updates in the existing today record and a one-step `previousProfile` undo. `member-panel.js` owns only ephemeral dialog/follow-up state and delegates to the canonical PersonalCompanion service and existing navigation/actions. Source-profile handoff is previewed, rejects changed/unknown/malformed sources, copies no authority/progress/conversations and never writes original records. No bulk migration or generalized import is implemented. Ask exposes existing supported actions; direct care-message composition remains in the original full demo and is presented here as reviewable group care, not a fake send.

Focused checks: `node --test test/foundation2-member-session.test.cjs`; existing `node scripts/foundation2-browser-check.mjs`; built-preview `node scripts/convergence2b-browser-check.mjs ORIGIN`. Complete required app, historical visual and VersePlay gates remain mandatory at final integration. Native dialog focus, profile handoff/undo and Ask actions require targeted physical Safari/VoiceOver acceptance on the final candidate; unchanged games do not need redundant physical acceptance.

Historical gate entries below describe their original stages, not current publication or active branches. PR150 remains an unmerged creative reference; do not incorporate it implicitly.

## Product invariants
- Mission: **We rally together so no one stands alone.** Companion to ministry, not a ministry replacement.
- Four primary destinations: Today, Groups, Team, Read. Connect always accessible as a route or consistent header control.
- Today: explicit commitments first; optional messages/reading never count as required responses. A known unavailable source is not a completed or read source.
- Priorities must be explainable, source-backed, permission-filtered, never based on sensitive inferred pastoral risk.
- Authentic Citizen branding: matte charcoal, cream, bright matte red, no glow or generic stacked dashboards.
- No live member data, credentials, external messaging, production deploy, fixture impersonation or covert network calls.
- Preserve the existing domain engines, permissions, storage guards and VersePlay implementations; no reimplementation without proven need.

## Change protocol — mandatory for every stage
1. **Scope**: List exact files and current source SHA before a change. Never start from a stale branch.
2. **Contract**: State source of truth, owners of reads/writes, authorized actions, and failure/unknown behavior.
3. **Implementation**: One module owns each surface or state transition. Avoid DOM transplantation, duplicate data stores and chained CSS overrides.
4. **Focused tests**: Cover success, denial, unknown/unavailable, malformed storage, old state, reload, accessibility and regression where applicable.
5. **Full validation**: Run original protected unit, browser, visual, mobile and VersePlay checks. Never weaken guards, alter historical baselines, or suppress failure to pass.
6. **Real rendered evidence**: Review fixed-clock mobile screenshots at 320 / 390 / 430 px, doubled text when relevant; check keyboard, VoiceOver/focus and reduced motion.
7. **Evidence record**: Record exact commit, links to passing workflows, preview provenance, screenshot artifacts, limitations, owner acceptance and next stage in PR. A Netlify green deploy is NOT release acceptance.
8. **Promotion**: Only after gates pass and separate owner authorization. Keep canonical `rally-one/develop`, production `main`, PR #150 and all recovery refs unchanged until that authorization.

## Gates
| # | Scope | Exit condition |
|---|---|---|
| F2-01 Foundation | Module boundaries, direct rendering, isolated build, original gates | Original 875+ unit tests, protected visual inventory/sources, VersePlay and isolated mobile review pass at exact head; no changed canonical behavior. |
| F2-02 Today | State, permission-filtered actions, guarded persistence and personalized projections | RSVP/serving/leader saved and reloaded, denied actions have no writes, unavailable and failed storage shown truthfully, no cross-scenario or original-app data contamination; deterministic state tests and real browser reload pass. |
| F2-03 Navigation | One four-tab shell and accessible history | Every route, origin restoration, keyboard, VoiceOver, deep links and guest boundaries pass. |
| F2-04 Connect | Existing modern thread and DM adapter | Exact read cursor, drafts, failure recovery, no cross-member leakage, proper permissions and no fake sends; full conversation checks pass. |
| F2-05 Groups/Team | Membership, gathering, care, schedule and serving | RSVP consistent across Today/Groups, coverage, role gates, attendance never inferred, care human-led, focused journeys pass. |
| F2-06 Read/VersePlay | Scripture/reflect/pray plus all existing games | Scripture copyright/source integrity, progress isolation, all three games, restoration and accessibility/gameplay gates pass. |
| F2-07 Integrations | Synthetic auth/Planning Center/consent/security boundaries | Explicit provider contracts, never live credentials/member data, denial and outage tests, resilience pass. |
| F2-08 Visual refinement | Accepted Studio 13 structure plus Studio 02 editorial accents | Real iPhone acceptance, full content states, screen captures, icon/spacing and motion consistency; no protected baseline regressions. |

## Gate record — source-backed, no automatic promotion
- **F2-01 Foundation and F2-02 Today verified on `b684146e35a06ffe71032138137a0b83824b70c1`:** Rally Point Preview QA, Foundation 2 mobile review, VersePlay foundation, and Netlify deployment reported success. The mobile suite included guarded reload persistence, scenario isolation, inaccessible-storage safeguards, and functional Today transitions. These remain source checkpoints; later changes must pass the same checks.
- **F2-03 Navigation in progress:** `foundation2/navigation.js` owns the URL route table and read-only destination projections; `foundation2/app.js` owns browser history/focus transitions; `foundation2/index.html` contains the persistent four-tab navigation and Connect header route. Browser back/forward, 320/390/430px layout, keyboard navigation and guest visibility are required checks at the current head.
- **Deliberate limitation:** Groups, Team, Read and Connect route pages are labeled *NOT YET MIGRATED*. They display permission-filtered, read-only sample summaries and explicitly link to the existing full application for functionality. Do **not** claim four completed functional destinations. Those engines migrate only under F2-04 through F2-06.
- **Remaining Gate 3 acceptance:** full protected CI at current head, responsive screenshot evidence and physical mobile Safari/VoiceOver route/focus review. Do not merge before separate owner acceptance.
- **Next engineering action after Gate 3 shell validation:** integrate real Connect domain in F2-04, preserving original authorization, thread read cursor, delivery semantics, and draft persistence. Do not invent a chat implementation or treat the read-only preview as a working inbox.

- **F2-05C Coverage and F2-06 Read/VersePlay accepted at `a1cf61bcbf1a91a71ac57d2de575b0159c66daaf`.** Jonathan confirmed physical iPhone checks for coverage persistence/withdrawal, Read and Classic VersePlay persistence, and opening the original Blank Battle and Verse Circuit. [Protected app QA](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45748160799), [Foundation 2 mobile review](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45748160836), [VersePlay foundation](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45748160804) and the [matching Netlify deploy](https://app.netlify.com/projects/citizen-connect-test/deploys/6b07a5388d6850c1db50fbaf) all passed. This checkpoint records feature acceptance on the draft.

## F2-07 first slice — synthetic serving assignment

- **Starting source:** `a1cf61bcbf1a91a71ac57d2de575b0159c66daaf`, descended from canonical `d038fc6adfdbc7c9b5925fc91e475cb1f15c7467`.
- **Files:** this record, `pilot/f2-synthetic-serving.cjs`, `scripts/build-serving-preview.cjs`, `scripts/build.cjs`, `foundation2/serving-preview.js`, `foundation2/index.html`, `foundation2/app.js`, `foundation2/today-model.js`, `foundation2/today-view.js`, `foundation2/team.js`, `test/foundation2-serving-preview.test.cjs` and `scripts/foundation2-browser-check.mjs`.
- **Read contract:** one fictional North Campus volunteer and one Welcome Team assignment. The fixture registry supplies a tenant/person/campus/team grant. The adapter checks that grant and the provider observation, reuses Sprint 11D's bounded GET transport, and emits only a status and, for a valid observation, title, starts-at and campus. Denied, unavailable and stale observations carry no assignment.
- **Preview contract:** the deployment build records the result of four fixture runs as static outcomes. Today and Team use the same read-only projection for the selected Planning Center scenario. The rehearsal replaces the local serving fixture on those two screens while selected. The standard Volunteer scenario still uses guarded local availability and coverage. The server-only Sprint 11 contracts remain outside the published bundle. The static bundle contains all four fictional outcomes. The fixture path and sample grant are internal rehearsal contracts.
- **Local evidence:** 925 application tests and 172 VersePlay tests passed, and the standard build matched the accepted checkpoint byte for byte. The Foundation 2 browser suite passed 44 responsive scenes with zero page errors and zero reported axe violations, including 200% text sizing for the serving card.
- **Acceptance:** unit and mobile browser coverage for matching assignment details and failure states, recovery from failure, membership/campus filtering, and isolation from local availability/coverage. Verify protected application QA, VersePlay, preview provenance and physical iPhone behavior on the candidate before accepting the first slice or extending it to Groups.

## Current boundary
- Foundation 2.0 is available only at `/foundation2/` on draft PR #151's Netlify deploy-preview. The root `/` stays the original canonical application.
- Presentation and routing are isolated in `foundation2/`. `RallyIntelligence`, `RallyMemberContext`, `RallyStorageGuard`, `RallyAppState`, the existing messaging domain and VersePlay engines remain the only respective functional authorities.
- There is no production deployment, live church data, credential use, original-app storage migration, release approval or merge authorization.

## F2-07 second slice — synthetic Groups read

- **Starting source:** `11757e483cd0bdb4c07ca4ebf8c6cc6c251dcbef`, accepted for the serving slice after protected QA and the owner's physical iPhone check. [Acceptance record](https://github.com/woodrow5087-hue/Citizen-groups/pull/151#issuecomment-7182486597).
- **Files:** this record, `scripts/build-group-preview.cjs`, `scripts/build.cjs`, `foundation2/group-preview.js`, `foundation2/app.js`, `foundation2/index.html`, `foundation2/groups.js`, `foundation2/today-model.js`, `scripts/foundation2-browser-check.mjs`, and `test/foundation2-group-preview.test.cjs`.
- **Contract:** the existing Sprint 11 synthetic consent, session, Groups reader, resilience transport and minimized member view run in the preview build. The build publishes fictional group name, next gathering title and time, or a restricted/unavailable result. A successful empty calendar is distinct from an outage or stale data. Today and Groups share the read-only projection. The regular Group member scenario remains the owner of local RSVP, conversation and prayer state.
- **Acceptance:** check the complete, empty, denied, outage and stale states, isolation from the local group fixture, protected QA, exact preview provenance and physical iPhone behavior on this candidate.
- **Local evidence:** 928 application tests, 172 VersePlay tests and 59 responsive browser scenes passed. Browser review reported zero page errors and axe violations. The standard and protected preview builds match the accepted source byte for byte.

## F2-08 first mobile experience pass

- **Starting source:** `d032e7e31edb490d86c8619084505f5ac102f7dd`, accepted after protected QA and the owner's iPhone pass. [Gate 7 evidence](https://github.com/woodrow5087-hue/Citizen-groups/pull/151#issuecomment-7183351534).
- **Files:** this record, `foundation2/app.js`, `foundation2/connect-view.js`, `foundation2/design.css`, `foundation2/groups.js`, `foundation2/index.html`, `foundation2/read.js`, `foundation2/team.js`, `foundation2/today-model.js`, `foundation2/today-view.js`, `scripts/foundation2-browser-check.mjs`, and `test/foundation2-today.test.cjs`.
- **Audit:** the visitor's first action led out of Foundation 2, and the optional message and reading cards advertised destinations without opening them. Connect's Back button always targeted the inbox, even from Groups. Classic VersePlay returned to the top of Read. Long screens and enlarged text needed clearance for the fixed navigation, and coverage was separated from the declined shift by the Team feature card.
- **Contract:** Foundation's existing route and storage owners remain authoritative. Keep launch controls and Back behavior in the preview. Preserve destination scroll and return focus when the originating control still exists. Keep the accepted palette, assets, protected build, game engines and stored fixture state.
- **Accessibility:** corrected overline contrast on dark panels, sized fixed-navigation clearance from the bar's measured height, and verified reduced motion and 200% text sizing in the mobile browser suite.
- **Local evidence:** 928 application tests, 172 VersePlay tests and 72 responsive browser scenes passed with zero page errors and axe violations. The ordinary and protected preview builds matched the accepted checkpoint byte for byte. The three journeys exercised matching saved state, correct destination, Back focus and scroll restoration at 320, 390, and 430 px.
- **Acceptance:** verify exact-head protected workflows and Netlify provenance, then run the three journeys on iPhone Safari before recording Gate 8 acceptance.

### Gate 8 fixture-only acceptance reconciliation

- The owner authorized a deterministic scroll-pose correction for the protected legacy Connect doubled-text direct-message fixture, preserving `e7a6e752a07eede2052b2ae4082b420277bd0f9a` under `rally-one/checkpoints/2026-11-26-f2-gate8-pre-correction`.
- Application source, historical references, inventories and zero-pixel assertions remain protected. See [root cause, controlled evidence and official journey reconciliation](foundation2-gate8-fixture-reconciliation.md).
- The owner reports 13/13 physical Safari/VoiceOver checks passed; the fixture-only change introduces no new runtime behavior to repeat. Individual checklist/device details remain unverified. Final Gate 8 acceptance and separately authorized canonical promotion remain on HOLD pending consolidated validation and human review.
