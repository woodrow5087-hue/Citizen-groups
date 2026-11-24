# Rally One — 9B-R1 maintainability audit and gated R2–R7 plan

**Date:** 2026-11-23 Mountain Time. **Status:** source-level audit complete for inspected boundaries; implementation not started. Runtime baseline: [PR #121 exact head](https://github.com/woodrow5087-hue/Citizen-groups/tree/90d291f835f6e213620a273569e5c9d2f4e75f26). Canonical development branch remains at 5aa88c93c3d4cd22902ef98af98c09b74ca436ce; approved PR #119 remains visual reference. Owner confirmed correct branch deployment with rallyOne=1 and successful functional smoke check. VoiceOver and other manual acceptance details remain pending; see s9a-owner-acceptance-evidence.md. GitHub Actions lookup for exact head returned two successful runs each of VersePlay foundation and Rally Point Preview QA. No new tests executed in this audit.

Scope: inspected complete or selected source of composition root, index, build, package scripts, storage guard, Today profile, onboarding, modern read model, Connect member, Wednesday chat lab, intelligence/context, priority board, SmartDashboard, unified focus, care flow, memorization and VersePlay entry/rendering. This is not an exhaustive reachability, security or performance audit. No runtime changes, deletions, dependencies, Netlify changes, PR or merge requested. Source references below use exact-head line numbers.

## R1. Findings and prioritization

| ID | Priority | Evidence and impact | Proposed treatment |
| --- | --- | --- | --- |
| R-01 | P1 | rallypoint-welcome.js:100–115 parses then directly writes profile and primary keys separately, outside journal guard; campus-only and legacy campus branch also direct-write. A second write failure can leave first applied. | Characterize failure and existing reload flow. Route through existing storage guard with fresh baseline; preserve exact values and unrelated keys. |
| R-02 | P1 | rallypoint.js:582–604 render() calls save() before replacing DOM, including navigation and visibility-driven refresh. Guard writes journal plus both records even when unchanged (storage-guard:75–109). | Measure redundant writes; consider no-op after validation and baseline conflict checks. Do not move all saves at once or suppress explicit recovery/error behavior. |
| R-03 | P1 | rallypoint.js:830–1144 delegated click dispatcher mixes 315 lines of navigation, domain actions, legacy and game controls with persistence/focus. | Extract small coherent dispatch groups, one at a time; leave single listener and ordering unchanged; inject effects. |
| R-04 | P1 | rallypoint.js:657–743 Connect overlay owns geometry, iframe bridge, access checks, history, subscriptions and focus. | Extract lifecycle only after physical device acceptance. Keep permission checks fresh and write rollback semantics. |
| R-05 | P2 | rallypoint.js:582–656 full view reconstruction, two modern markRead calls in chat path, repeated context/peek calls (195–215, 652–654). | Instrument render and storage read/write counts; validate mount order and cursor/draft behavior before deduplicating. No unmeasured speed claims. |
| R-06 | P2 | connect-member.js:39–52 and wednesday-chat-lab.js:7–31 write same versioned modern conversation format, while read-model:48–101 validates and writes cursor. | Move common transaction/serialization boundary into existing conversation owner after tests for cross-tab, draft and reply preservation. Keep UI state separate. |
| R-07 | P2 | index.html:13–39 has 27 ordered stylesheet links; 96–118 has 23 deferred scripts before onboarding and other final entries. Legacy layering is intentional but difficult to navigate. | Document load order and overrides; measure CSS/JS transfer and parse first. No CSS consolidation or framework migration in R2. |
| R-08 | P2 | rallypoint.js:5–24 legacy URL modes f09, f10, f103 and rallyOne override; scripts/build.cjs:11–15 differs by deploy context. | Preserve all modes. Document routing and build matrix; separate approved decision on default parity, not a hidden refactor. |
| R-09 | P2 | Existing filenames mix Rally Point, Rally One, historical version names; build allowlist explicitly includes them. | Add developer map first. No mass renames; preserve stable script paths, URL flags, CSS selectors and storage keys. |
| R-10 | P3 | Several legacy paths and standalone labs coexist with approved app; actual external consumers and full reference graph not established. | Inventory inbound links, tests, historical demo requirements and runtime coverage; remove nothing until explicit retirement approval. |

P1 = highest refactor priority, not an assertion of currently observed production failure. P2 = worthwhile after characterization; P3 = inventory first. The local demo is not a production-authentication boundary. R-01 is a code-supported failure scenario, not a reproduced incident. R-02 and R-05 are measurement candidates, not measured regressions.

## R2. Composition and dependency map

Observed composition root rallypoint.js: 1,187 split lines (1,186 newline-terminated content lines), 87,339 JS string code units; not a goal to hit an arbitrary size. Its responsibilities by source region:

| Lines | Current responsibility | Refactor seam |
| --- | --- | --- |
| 1–34 | Mode selection and Ask session | Pure mode resolver candidate, explicit branch/PR and legacy flag precedence; low-risk first extraction |
| 35–112 | Fixture defaults, normalization, guard, context/reducer wiring | Pure fixture normalization under existing state owner; no schema migration |
| 114–217 | Portrait animation, helpers, shared Today presentation | Preserve animation and origin focus; extract pure helpers only |
| 218–545 | Legacy Today, Groups, Team and Read renderers | Keep rendering contracts; later isolate by area only with parity |
| 546–581 | Play and Blank Battle mount | Leave intact until independent game gates |
| 582–656 | Render orchestration and chat mount | Keep shell owner; instrument read/write and focus side effects |
| 657–743 | Connect overlay, iframe bridge and history lifecycle | High-value but mobile-sensitive seam; defer until physical checks |
| 744–829 | Navigation, dialogs, Ask Rally and notices | Preserve focus restoration and session semantics |
| 830–1144 | Delegated actions | Characterize then extract contiguous handler groups |
| 1145–1186 | Touch, submit, keyboard, visibility, storage events | Keep listener lifetime and ordering; do not register duplicate handlers |

Dependencies: index loads Today/UI/game and companion/board/group modules first; priority board resolves UnifiedFocus lazily; member context and Intelligence precede root; storage guard and generated chat domain precede read model and chat lab; root precedes welcome. Existing Node/CommonJS test exports must continue working. Intelligence derives context, SmartDashboard, Board, Care and UnifiedFocus with a supplied clock. Do not add a second ranking implementation, store or module system. Build has an explicit runtime file list and copies assets/docs plus selected VersePlay directories. New browser module must be loaded in dependency order, explicitly allowed in dist, and tested against immutable reference. No code importing server-only contracts.

Recommended extraction order after acceptance: (1) pure URL mode resolution and characterization, (2) guarded onboarding persistence fix in its own PR, (3) legacy memory action group (959–1001) using existing RallyMemory engine and injected state/effects, (4) explicit reading-intention action group (1002–1028) after fake-clock tests, (5) navigation/Connect lifecycle only after physical-device focus, history and keyboard tests. Reorder if characterization reveals a dependency. Keep action dispatch handled/not-handled semantics and return early exactly as before. Prefer small modules and explicit input/output over generic event bus, global service locator or dozens of tiny files.

## R3. Legacy and compatibility inventory

| Surface | Status / evidence | Decision |
| --- | --- | --- |
| Rally One override | rallypoint.js:5–24; owner uses rallyOne=1 branch link | Retain and characterize |
| f09 stack/board and f10/f103 | Existing alternate mode conditions and handlers | Preserve until separately approved retirement |
| Historical groupMessages vs modern thread | Separate history and modern cursor by design | Never merge unread sources or delete history |
| Blank Battle and classic VersePlay | Existing independent paths | Retain and test |
| Verse Circuit standalone | rally-one-verse-circuit-entry.js links verse-circuit-playground.html | Preserve browser Back and progress |
| Connect lab and chat lab | Existing iframe and integrated thread dependencies | Keep paths, verify access and lifecycle |
| premium-hybrid archive and other static labs | Build allowlist includes these | Inventory external links and tests; no deletion |

Full repository tree and external consumers not enumerated in this pass. Before retirement, obtain complete tree, inbound HTML/JS/CSS links and dynamic references, workflow/test references, approved historical preview obligations, owner signoff, rollback checkpoint and browser coverage. Absence of a text-search hit is not proof of dead code. Naming cleanup should begin with documentation, not renames.

## R4. Persistence and state management plan

Current ownership:
- Main app and Today profile: existing two keys and journal managed by RallyStorageGuard; app save uses it, onboarding bypass identified above.
- Modern conversation: versioned snapshot, draft, reply target, cursor; adapter validates, existing Connect/chat writers use same key. Preserve modern/legacy separation and malformed bytes.
- Session-only onboarding marker, in-memory Ask conversation, portrait return and current scenario: preserve existing boundaries; no extra keys.
- VersePlay/Verse Circuit: independent game progress; no coupling to member identity or care.

Acceptance for R-01: normal onboarding (guest/member/team/campus-only and legacy mode), blocked storage getter, malformed JSON/shape, journal already present, failure on first/second write, rollback failure, concurrent change, reload and enter-without-saving. Assert original bytes unchanged or recoverable journal retained; no silent reset, no unrelated field loss, no real credentials. Existing guard creates baseline on construction, so construct/validate at appropriate transaction point; do not reuse stale baseline across onboarding changes. Preserve normal visual copy and flows. Any changed failure behavior must be explicitly documented and tested.

For R-02 no-op optimization: validate candidate and current original, check journal and concurrent changes BEFORE considering equal raw values; no bypass of blocked status, journal inspection, baseline lease or rollback. Test byte-identical save, changed save, malformed saved value, interrupted journal and concurrent edit. Existing localStorage is not a cross-tab transactional database; document residual race limitations. No new backend or schema migration.

For R-06: characterize both modern writers, current membership/revocation check, draft/reply target, markRead, malformed storage, write failure, two tabs, iframe and standalone behavior. Centralize only common persistence operation; keep caller-specific permissions and UI/error copy. Do not coerce unavailable unread to zero at consumer. Never read private records after revocation.

## R5. Repository organization and developer experience

Create a concise root navigation document after accepted baseline: runtime entry and ordered scripts; domain modules and ownership; fixture vs server-only contracts; assets/CSS ordering; games; tests/scripts/CI; internal engineering documentation; historical demos. Add a route/build-context matrix and safe-start commands referencing Sprint 8 handoff. Preserve exact source URLs and legacy paths. Future architecture decisions should use small numbered records for rationale, alternatives, constraints and reversal; do not duplicate AGENTS.md or create conflicting instructions. No wholesale directory move or package/framework conversion.

## R6. Performance assessment protocol (not yet executed)

Use identical exact-head builds, Chromium mobile emulation at 320/390/430 and physical iPhone Safari. Use a fresh fixture session and established member session; measure first load, title transition, navigation, portrait return, Connect open/close, Ask open, Verse Circuit launch and return. Record device/OS, browser, network/cache state, build context, run count (at least five per scenario where practical), median and p95 or individual samples for small n. Instrument JS/CSS transfer (compressed and uncompressed), resource requests, main-thread long tasks, input-to-render latency, render count, storage operations, repeated repository construction, DOM node counts and listener/observer cleanup. Use DevTools/Playwright tracing or isolated test instrumentation; no analytics or real member data. Compare before/after under identical conditions. Report measurements, not estimates. Optimize only measured hotspots; preserve title timing, animation, reduced motion, keyboard and draft state. CSS/asset loading is a candidate, not a demonstrated bottleneck.

## R7. Stage gates and execution

1. Before runtime work: record pending physical accessibility checks (VoiceOver focus/order/labels, reduced motion, contrast and sound), capture exact deploy permalink/full SHA if available, review 9A and accepted canonical ancestry. Explicit owner authorization for canonical merge/reconciliation; do not retarget #121 or fork an alternative runtime baseline. Documentation branch is separate; port docs-only changes after baseline acceptance.
2. Each bounded change: state expected behavior, write characterization tests first, make a small reviewable PR from accepted canonical base, record exact head and changed files. No approved design change, dependency addition, or test weakening. Preserve baseline and protected refs.
3. Run npm ci, npm test, npm run test:verseplay, npm run build and existing browser/mobile/onboarding/Blank Battle/chat/Groups/leadership/Today/VersePlay suites using Sprint 8 handoff. Compare immutable #119 reference: 48 app and 49 game image pairs; zero threshold and no replacement baselines/masks; 74 protected source/style/asset files must remain protected (if a necessary reviewed extraction touches a protected runtime file, do not silently relax its pin; seek explicit gate review and equivalent invariant evidence).
4. Test exact deploy artifact and physical iPhone; use explicit rallyOne=1 for branch deploy or verified PR preview; inspect context and commit, do not publish production. For focus/history work repeat VoiceOver, keyboard, Safari Back, scroll/draft restoration and listener cleanup.
5. Record outcomes, diff, unresolved failures, performance evidence if applicable, rollback method and developer handoff. No merge based solely on CI or line-count reduction. Stop and isolate regressions rather than widening scope.

**Next recommended implementation:** R2 mode resolver characterization and R4 guarded onboarding (separate PRs) after gate 1. Remaining R3–R7 are planned, not executed; R1 source-level audit is completed within the stated scope. No code changed or tests run by this audit.
