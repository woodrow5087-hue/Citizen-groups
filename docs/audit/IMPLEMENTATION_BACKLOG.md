# Rally Point — Prioritized Implementation Backlog

**Approved design:** v0.8, commit `84e489b86851e853948a7d4246475e83b7ddd085`. **Status:** planning only; no feature changes are made by this document.

The first real-member pilot deliberately starts with **existing group members** and includes **serving teams**. New-group joining is deferred; unsupported team responses use established Planning Center / Church Center workflows. Priorities indicate **order and gates**, not delivery dates.

## Lane 0 — Reproducible development and a protected staff demo

| Order | Issue | Deliverable and acceptance gate | Dependency |
|---|---|---|---|
| 0.1 | F-12 · [#47](https://github.com/woodrow5087-hue/Citizen-groups/issues/47) | Establish issue-linked feature branches from approved reference, documented CI/visual approval, staged preview and rollback drill. Never auto-merge. | None; gates other feature work |
| 0.2 | F-11 · [#46](https://github.com/woodrow5087-hue/Citizen-groups/issues/46) | Clear persistent DEMO status, entirely synthetic data, realistic safe interactions and **one full reset** clearing UI, chat/prayer fixtures, puzzles, achievements and preferences. | F-12 |
| 0.3 | F-07 · [#42](https://github.com/woodrow5087-hue/Citizen-groups/issues/42) | Versioned, testable **local progress schema** and migration from existing localStorage keys; reset and corruption recovery. | F-12, F-11 |
| 0.4 | F-05 · [#40](https://github.com/woodrow5087-hue/Citizen-groups/issues/40) | Current reading navigates to matching available Blank Battle challenge; other puzzles retained; explicit non-playable fallback. | F-12; align with progress schema |
| 0.5 | F-06 · [#41](https://github.com/woodrow5087-hue/Citizen-groups/issues/41) | Date/passage/plan-scoped progress, full personal milestone/badge/streak rules, accurate history, no spiritual score or forced public ranking. | F-07 schema, F-05 passage identity |
| 0.6 | F-10 · [#45](https://github.com/woodrow5087-hue/Citizen-groups/issues/45) | Moderated staff/leader walkthrough, navigation/keyboard/voice technology checks, defects logged and highest-severity issues retested. | Functional staff demo from 0.1–0.5 |

**Staff-demo go/no-go:** fictional-only; visible and clearable state; consistent Scripture/game passage; recorded and reproducible progress; core tasks can be completed without coaching; no accidental network transmission of demo text. It remains **not authorized** for real member data.

## Lane 1 — Pilot architecture and church decisions (can begin during Lane 0)

| Issue | Deliverable and acceptance gate | Dependency |
|---|---|---|
| F-02 · [#37](https://github.com/woodrow5087-hue/Citizen-groups/issues/37) | Church-admin-reviewed Planning Center / Church Center capability matrix (People, Groups, Services, events, messages, permissions, available deep links), supported vs unsupported operations, data owners and sync/error mapping. | Authorized access and ministry stakeholders |
| F-01 · [#36](https://github.com/woodrow5087-hue/Citizen-groups/issues/36) | Approved identity approach, verified identity/account linking, server-side role/membership enforcement, revocation and denied unauthorized access. | F-02 identity mapping, church authorization |
| F-09 · [#44](https://github.com/woodrow5087-hue/Citizen-groups/issues/44) (policy design) | Written leader access/purpose/retention/deletion policy; human-only follow-up triggers; privacy review and approval pathway. | Church leadership and data steward |
| F-11 · [#46](https://github.com/woodrow5087-hue/Citizen-groups/issues/46) (policy design) | Confidentiality, consent/transparency, access logging, deletion and incident procedure for real data. | Church security/privacy owner |
| F-07 · [#42](https://github.com/woodrow5087-hue/Citizen-groups/issues/42) (sync design) | Account-linked progress data model, cross-device/offline/conflict strategy and migration tests planned. | F-01 identity design, F-06 data model |

**Architecture go/no-go:** feasibility documented; permissions and API terms understood; data owner and operational support named; no speculative promises about messaging APIs or write operations.

## Lane 2 — Limited real-member pilot implementation

| Issue | Deliverable and acceptance gate | Dependency |
|---|---|---|
| F-01 · [#36](https://github.com/woodrow5087-hue/Citizen-groups/issues/36) | Secure login and server authorization; users cannot self-upgrade to leader or access another group's data. | Approved architecture |
| F-02 · [#37](https://github.com/woodrow5087-hue/Citizen-groups/issues/37) | Verified shared member/group/team data through supported integrations; clear handoffs for unsupported features. | F-01, verified API capability |
| F-07 · [#42](https://github.com/woodrow5087-hue/Citizen-groups/issues/42) | Devotion/achievement progress associated with verified account, tested across two devices, with safe logout and conflict handling. | F-01, F-06 |
| F-08 · [#43](https://github.com/woodrow5087-hue/Citizen-groups/issues/43) | Today displays **only verified activities** matching member, campus, group and team; freshness/error handling, correct timezone. | F-02, F-01 |
| F-04 · [#39](https://github.com/woodrow5087-hue/Citizen-groups/issues/39) | Team presence in Rally Point; response/coverage handed to authoritative workflow when direct integration unavailable. Never claim local demo confirmation is real. | F-02, F-08 |
| F-09 · [#44](https://github.com/woodrow5087-hue/Citizen-groups/issues/44) | Basic attendance context and human-managed follow-up for verified scoped leaders **only after explicit church governance sign-off**. Otherwise feature disabled. | F-01, F-02, privacy policy |
| F-10 · [#45](https://github.com/woodrow5087-hue/Citizen-groups/issues/45) | Moderated member testing on actual iOS/Android and accessibility tools; track five key tasks and remediate pilot-blocking issues. | Pilot-ready safe environment |
| F-11 · [#46](https://github.com/woodrow5087-hue/Citizen-groups/issues/46) | Real-member data protection controls, clear privacy notice, retention/deletion, separate demo/production records. | F-01, policy approval |

**Pilot go/no-go:** real account authorization, reliable data and errors, no misleading schedule/serving state, closed privacy/security blockers, functional and accessible core paths, rollback runbook and named support owner. **Do not pilot an unsolved integration as though it works.**

## Lane 3 — After initial pilot

| Issue | Deliverable and acceptance gate | Dependency |
|---|---|---|
| F-03 · [#38](https://github.com/woodrow5087-hue/Citizen-groups/issues/38) | Full discovery-to-join journey with verified request, response, accepted membership, and welcome; no false success states. | Pilot feedback, F-01/F-02 integration |
| F-04 · [#39](https://github.com/woodrow5087-hue/Citizen-groups/issues/39) (enhancement) | Investigate deeper serving writes and coverage coordination *only if supported and justified*. | API feasibility and validated need |
| F-06 · [#41](https://github.com/woodrow5087-hue/Citizen-groups/issues/41) (enhancement) | Consider **optional** personal sharing, additional challenges, and content publishing governance, not automatic leader scoreboards. | Member feedback, approved privacy controls |

## Dependency graph in plain language

- **F-12 → all code changes** (branch/QA/review protection).
- **F-11 → staff demonstration** (privacy and complete reset).
- **F-07 local schema + F-05 verse identity → F-06 achievement correctness**.
- **F-01 + F-02 → real personal/group data, F-07 sync, F-08 schedule, F-04 live teams, F-09 leader access**.
- **F-09 church policy → real Leader Care**.
- **F-10 human task validation → each rollout gate**.
- **F-03 only after first-member-pilot results**, by explicit decision.

## Issue lifecycle

`OPEN / UNTRIAGED` → `READY` (dependency/owner/acceptance confirmed) → `IN DEVELOPMENT` (separate PR) → `IN REVIEW` (CI and screenshot diff attached) → `VERIFIED` (user acceptance) → `DONE`. Reopen on regressions. Record blocked status in the issue. No change should bypass visual baseline comparison, and no design rewrite is implied.

**Important:** these are issue-level epics. Break work into smaller implementation tickets after the first technical spike and staff tests. Acceptance criteria are functional promises **conditional on verified feasibility and appropriate church authorization**. Do not invent timeline estimates.
