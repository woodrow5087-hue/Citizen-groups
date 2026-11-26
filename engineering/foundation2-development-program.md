# Rally One Foundation 2.0 — Gated Development Program
Status: Active experimental development. Source branch `rally-one/foundation-2`; draft PR #151 against `rally-one/develop`.
Last accepted canonical base: `d038fc6adfdbc7c9b5925fc91e475cb1f15c7467`. Original Studio 13 review: draft PR #150; do not merge or rebase from PR #150 without independent authorization.

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
