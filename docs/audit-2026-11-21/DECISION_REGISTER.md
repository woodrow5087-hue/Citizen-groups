# Rally Point — Foundation Audit Decision Register
**Review started:** November 21, 2026  
**Scope:** Product/engineering decisions only. Recording approval is **not** permission to implement, merge, or deploy.

## F-01 — Canonical development baseline & preview workflow
- **Decision:** APPROVED — Option B.
- **Owner decision:** “Approve F-01, Option B. Record this as our agreed development decision and move to F-02 without implementing changes yet.”
- **Intended approach:** Create a clearly designated `rally-point/develop` branch using audited v0.3 commit `01cce2801a15565d34b042304758ed73d9877449` as its initial source, subject to a fresh divergence check when implementation begins. Configure direct CI checks and Netlify Deploy Previews for feature PRs targeting `rally-point/develop`, and verify using a small documentation-only test PR.
- **Guardrails:** Preserve protected visual/reference branches; retain the future-state lab as a separate visual and interaction benchmark; do not overwrite `main`; no automatic merge or production deployment. Preserve existing functional routes and local demo data.
- **Implementation status:** NOT STARTED. This entry records a decision only. The `rally-point/develop` branch and corresponding CI/Netlify changes have **not** been made as part of this review.
- **Acceptance evidence required:** Consistent canonical source/ref, feature PR passing tests and receiving a preview without any main-targeted bridge, no production change.

## F-02 — Versioned conversation and action domain model
- **Decision:** APPROVED — Option B.
- **Owner decision:** “Approve F-02, Option B. Record this in our decision register and continue to F-03 without implementing code yet.”
- **Intended approach:** Define shared, **versioned domain contracts** with a mock repository adapter first, then integrate gradually. Distinguish user/membership/permissions, conversation/message/reply/reaction/read cursor, verified serving and gathering events, companion actions, leader care tasks, and source references. Use stable IDs, timestamps, typed statuses, explicit relationships and fixture-based contract tests.
- **Implementation sequence:** Begin with a single Wednesday Group conversation contract; reuse the model for team and authorized direct messages later. Preserve existing routes, browser-local demo activity and protected visual design. Plan a migration for pre-existing demo state rather than silently deleting it.
- **Guardrails:** This is an architectural commitment, **not** a backend selection or authorization for live data. No assumptions about Planning Center/Church Center write access. Real permissions, privacy, and minors policies remain subject to F-03 and F-05.
- **Implementation status:** NOT STARTED. No application code, data migrations, API integrations or deployments authorized by this decision.
- **Acceptance evidence required:** Validated schemas and versioning rules, mock repository contract tests (ordering, replies, reactions, read state, delivery/retry), non-destructive legacy fixture migration, unchanged functional screens and demo data.

## F-03 — Verified identity, role, membership and access permissions
- **Decision:** APPROVED — Option B.
- **Owner decision:** “Approve F-03, Option B. Record the decision and proceed to F-04 without implementing code yet.”
- **Intended approach:** Define an explicit role/resource/action authorization matrix for member, group leader, serving-team leader, and authorized church administration; verify group and team membership as separate scoped relationships. Require server-side authorization for all protected read/write operations in any eventual production implementation. Prototype and test rules using fictional identities and mock authorization first.
- **Guardrails:** Distinguish identity, membership and permission. Define membership-revocation behavior; require church-approved safeguards for minors, direct messaging, sensitive prayer information and pastoral care. Neither local `role` toggles nor hidden UI elements constitute security. No live records or account integration authorized.
- **Implementation status:** NOT STARTED. This is a planning decision only; no authentication, authorization, application code, integrations, or deployments have been implemented.
- **Acceptance evidence required:** Resource/action permission matrix; mock positive/negative authorization tests including revoked membership; reviewed access boundaries for care tasks and messages; separate explicit authorization and backend verification before any live-member pilot.

## F-04 — Incremental modularization of the application
- **Decision:** APPROVED — Option B.
- **Owner decision:** “Approve F-04, Option B. Record the decision and proceed to F-05 without implementing code yet.”
- **Intended approach:** Gradually extract independent, reusable modules from `rallypoint.js`, starting with the F-02 conversation contract, a mock conversation repository, shared conversation rendering and composer, permission boundaries, and eventually a separately testable Today companion selector. Keep existing route names, browser-local demo state, core functionality, and Premium ALIVE visual design intact.
- **Implementation sequence:** Define module interfaces and tests → adapt a single Wednesday Group conversation → verify unchanged app behavior → reuse for Team and authorized direct messages → continue targeted extraction. Do not require a React rewrite or another framework migration as a prerequisite.
- **Guardrails:** Small isolated feature branches, regression screenshots and tests at each stage; no broad CSS replacement or unrelated design changes. This decision authorizes architecture planning, **not** immediate source code changes, merges or deployment.
- **Implementation status:** NOT STARTED.
- **Acceptance evidence required:** Module contracts, regression tests, no loss of existing browser demo messages/progress or routes, visual comparison against protected references, and explicit approval of each implementation slice.

## F-05 — Pastoral care, verified evidence and human oversight
- **Decision:** PENDING REVIEW.
- **Audit finding:** The companion and Leader Care currently use fictional prayer/attendance fixtures; official attendance sources, case ownership, consent/visibility, escalation, retention and deletion are not established.
- **Candidate approach:** Define a church-owned pastoral-care and data governance policy before introducing real information. Separate recorded facts from suggestions, permit only authorized leaders to make decisions, and keep care notes restricted and reviewed.
- **Implementation status:** NOT STARTED.

## F-06 through F-14
**Decision:** NOT YET REVIEWED. Preserve the original prioritized foundation backlog for the decision sequence.

## Decision protocol
Each item is discussed and explicitly decided before any resulting implementation is undertaken. The user can revise a recorded decision. Do not infer that approval of one finding authorizes changes for another. Protect the agreed Premium ALIVE Hybrid design identity.
