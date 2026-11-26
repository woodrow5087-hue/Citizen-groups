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

## Current boundary
- Foundation 2.0 is available only at `/foundation2/` on draft PR #151's Netlify deploy-preview. The root `/` stays the original canonical application.
- Presentation and routing are isolated in `foundation2/`. `RallyIntelligence`, `RallyMemberContext`, `RallyStorageGuard`, `RallyAppState`, the existing messaging domain and VersePlay engines remain the only respective functional authorities.
- There is no production deployment, live church data, credential use, original-app storage migration, release approval or merge authorization.
