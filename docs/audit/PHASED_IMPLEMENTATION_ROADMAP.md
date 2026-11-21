# Rally Point — Phased Implementation Roadmap

**Status:** v1 project plan **from 12 product decisions approved November 20, 2026**. This is **not** a launch commitment or authorized implementation of real member data.

**Frozen product design:** v0.8 Unified Experience, `84e489b86851e853948a7d4246475e83b7ddd085`; [reference preview](https://deploy-preview-32--citizen-connect-test.netlify.app/?welcome=1); [locked snapshot PR #35](https://github.com/woodrow5087-hue/Citizen-groups/pull/35). All changes must preserve approved visual identity and pass QA.

## North-star question

Does Rally Point make it easier for people to feel known, participate, and take a **meaningful relational next step**? Avoid confusing screen visits, streaks, or activity counts with spiritual wellbeing.

## Phase 0 — Make development safe and repeatable

**Goal:** An approved baseline, ownership, issue tracking and reliable deployment controls.

- Keep v0.8 immutable; create feature branches from approved baseline, not from Studio Concept experiments or cumulative draft PRs.
- Define code-review owner, required checks, reference screenshots, accessibility baseline, merge authorization, preview/staging and recovery route.
- Preserve changes as isolated small PRs. No automatic production deployment.
- Document manual rollback of tested artifact/commit and practice recovery.

**Exit gate:** Review branch is demonstrably separate; the approved reference still works; an authorized person can reproduce a deploy, approve a change, or restore a known version.

## Phase 1 — Staff and leader demo (fictional-only)

**Goal:** A compelling, coherent experience safe for stakeholder discovery; no real accounts or confidential information.

- Add visible demonstration boundaries, realistic synthetic fixtures and one complete clear/reset-data control (F-11).
- Implement versioned local progress migration (F-07), Read → matching available VersePlay challenge and fallback (F-05).
- Complete passage/date-specific history and **approved gamified achievements**, including forgiving streaks and badges, with all progress private by default (F-06).
- Test Guest → campus → Today → existing group → team → Read → VersePlay → return; run staff/leader moderated testing and voice/keyboard/accessibility scenarios (F-10).
- Record friction as issues; preserve v0.8 visuals and only change identifiable failures.

**Exit gate:** At least one complete task-based walkthrough reproduces reliable results, all state is fictional/resettable, game aligns with reading, progress is accurate, and staff can independently locate group/serving next steps. No severe usability or privacy blockers left undocumented.

**Deliverable:** repeatable staff preview, no claim of production readiness.

## Parallel discovery — Integration, security and ministry ownership

**Goal:** Prove a feasible real-member architecture **before writing integration-dependent features**.

- Confirm that Citizen Church intends to authorize pilot access; appoint church product/privacy/contact owners.
- Verify Planning Center/Church Center Groups, People, Services, event, access and existing communication functionality. Distinguish **supported API**, **approved deep link**, **manual workflow**, **unavailable** (F-02).
- Define secure identity and linking, group/team membership and role revocation (F-01).
- Define where Rally Point data exists separately (scripture, streaks, game progress), minimal telemetry, sync/conflict and migration (F-07).
- Ratify leader-care purpose, controls and limits, handling prayer and sensitive personal information, incident response and retention (F-09, F-11).
- Define true group/team update ownership, acceptable freshness and fallback navigation (F-04, F-08).

**Exit gate:** A signed-off architecture decision record and written church permissions/governance path. If a planned integration isn't feasible, change **implementation method**, not visual design, and request explicit decision before changing pilot scope.

## Phase 2 — Limited real-member pilot (existing connected groups + teams)

**Goal:** Test real belonging and participation with a small, church-authorized cohort.

**In scope:**
- Verified user accounts and scoped access (F-01).
- Actual membership-aware group experience based on verified integration/handoffs (F-02).
- Team information plus existing Planning Center workflows for responses/coverage unsupported in Rally Point (F-04).
- Verified Today group/serving activities with error and stale indicators, never invented dates (F-08).
- Secure, account-linked achievement and game progress (F-06, F-07).
- Limited human-led leader attendance/check-in **only after approved governance and verified permissions**; otherwise remain disabled (F-09).
- Moderated member testing including physical iOS/Android and accessibility (F-10).

**Out of scope for the first pilot:**
- Real new-group discovery/enrollment (F-03).
- Unverified direct schedule writes or speculative replacement of Planning Center workflows.
- Broad pastoral-care records or automated spiritual-health scoring.
- Public devotion rankings/leader-visible achievement metrics.
- Church-wide rollout.

**Exit gate / conditional rollout check:**
1. **Identity:** no guest/other-group read of restricted data; role changes revoked correctly.
2. **Integrity:** source-of-truth schedule matches actual member context; unsupported actions hand off transparently.
3. **Privacy:** church-approved disclosures, access, retention/deletion and incident owner; no sensitive test data leaked into demo.
4. **Reliability:** errors, offline behavior, retry and sync conflict are communicated; progress survives device change.
5. **Usability:** members accomplish five agreed tasks without coaching, including assistive-technology users where recruited; critical issues retested.
6. **Operations:** support contact, monitored release, manual rollback tested, incident response route established.
7. **Approvals:** named church owner and project owner explicitly authorize pilot.

If any gate fails, restrict scope, revert, or remain in fictional demonstration mode.

## Phase 3 — Improve based on real-world learning

**Goal:** Expand only the workflows members and leaders demonstrate they need.

- Introduce full real group discovery/request/welcome process (F-03).
- Consider deeper scheduling coordination where technically supported and operationally justified (F-04).
- Refine achievements, storytelling and optional member-controlled sharing (F-06).
- Expand leader-care functionality only via separate data-governance reviews (F-09).
- Run further accessibility and usability iterations with the same visual design lock (F-10).

## Operating rhythm and checkpoints

- **Work intake:** issue ID, user problem, baseline screenshot, affected personas, dependencies, privacy impact, criteria.
- **Development:** small feature branch; local tests and Playwright/axe/accessibility as appropriate; no hardcoded real data.
- **Review:** preview URL plus before/after visuals; explicit reviewer acceptance; no cosmetic changes without approval.
- **Release:** staged deployment, smoke test, monitoring, rollback release pointer/artifact, clear release notes.
- **Learn:** verify member tasks and relational outcomes, close issues only with evidence; don't infer spiritual health from metrics.

## Core task tests

1. Member locates their next **verified** group gathering.
2. Member can see a group message or reach the existing authorized conversation workflow.
3. Volunteer finds their next serving commitment and the correct authoritative response action.
4. Member reads the day's verse and opens the matching available VersePlay puzzle.
5. Member returns later (and in real pilot, on another device) to correct progress/achievements.

## Unknowns to validate before any dates or launch promises

- Planning Center account/API capabilities and contractual policies; what church systems can actually surface.
- Church authorization to access and process real People/Groups/Services data.
- Named project owner, technical maintainer, privacy/security approver, ministry escalation contact.
- Hosting/data architecture, incident support, platform/browser requirements and cost.
- Membership pilot cohort, recruitment and success thresholds (propose together with church stakeholders).

**Next immediate work:** implement the **F-12 delivery foundation** in a **separate issue-linked feature PR**, then F-11 protected-demo/reset and F-07 local schema. In parallel, obtain church-approved integration discovery access. Do not modify the locked snapshot, and do not treat this planning PR as a production-ready change.

See the [decisions register](./APPROVED_PRODUCT_DECISIONS_F01_F12.md) and [backlog](./IMPLEMENTATION_BACKLOG.md).
