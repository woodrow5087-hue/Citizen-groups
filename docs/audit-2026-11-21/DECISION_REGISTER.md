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
- **Decision:** APPROVED — Option B.
- **Owner decision:** “Approve F-05, Option B. Record the decision and proceed to F-06 without implementing code yet.”
- **Intended approach:** Establish church-owned data governance, privacy standards, and human-reviewed care workflows before connecting real attendance, prayer, follow-up, or pastoral records. Define the authoritative source and provenance of every fact; distinguish unrecorded attendance from confirmed absence, and distinguish facts from optional follow-up suggestions. Specify scoped access, task owner, consent and visibility, escalation, retention, deletion, and a reviewable resolution state.
- **Guardrails:** The product supports leaders' care, not surveillance or automated spiritual/psychological classification. Personal app inactivity, attendance gaps, or inferred engagement must not automatically become pastoral risk scores. Sensitive prayer or direct-message content is not generally available to leaders or administrators. Separate church-approved safeguarding rules apply for minors and sensitive data. Use fictional/demo-only examples until the church approves actual policies, and preserve the Premium ALIVE design.
- **Dependencies:** F-02 data/source contracts and F-03 scoped permission rules. Live deployment remains gated by church policies and independent security/privacy validation.
- **Implementation status:** NOT STARTED. No application code, real records, integrations, automatic alerts, or deployments are authorized by this decision.
- **Acceptance evidence required:** Church-owned policy review/signoff; evidence provenance and permissions matrix; fictional human-in-the-loop care task flows including verify, review, no-action, follow-up and resolution; retention/deletion and auditability requirements; explicit live-pilot approval before using real information.

## F-06 — Reusable, expressive messaging experience
- **Decision:** APPROVED — Option B.
- **Owner decision:** “Approve F-06, Option B. Record the decision and proceed to F-07 without implementing code yet.”
- **Intended approach:** Design and build **one excellent, reusable fictional Wednesday Group conversation** inside the canonical working app rather than transferring the self-contained future-state demo wholesale. The component system includes sender-aligned matte-red/cream bubbles, conversation grouping, timestamps, expressive accessible reactions, quoted replies, an adaptive sticky multiline composer, retained drafts, mock send/pending/failure/retry feedback, and reusable context-action cards.
- **Implementation sequence:** Apply the approved F-02 versioned message contract and F-04 module boundaries first; establish detailed UI/interaction specifications and acceptance screenshots; implement one mock-powered Wednesday Group thread; test on representative phone widths and actual iPhone keyboard/VoiceOver; extend to Team and permissioned direct messaging only after review and explicit approval.
- **Guardrails:** Preserve the original Premium ALIVE red/charcoal/cream identity, circular Your People profiles, four-tab navigation and all unrelated existing routes/features. Use fictional browser-local identities and messages; no live delivery, external accounts, new backend, broad redesign, or production release is authorized.
- **Implementation status:** NOT STARTED. This decision authorizes planning only, not application code, UI modifications, merges, or deployments.
- **Acceptance evidence required:** A complete accessible thread with stable IDs, replies, reversible reactions, draft persistence, correct order and scroll/keyboard behavior, explicit sending/sent/failed states, reduced-motion support, and passing unit/browser/mobile visual regression against preserved screens.

## F-07 — Today first-viewport information hierarchy
- **Decision:** PENDING REVIEW.
- **Audit finding:** The large branded greeting, photo-led hero, and Your People circles occupy almost the whole initial 390×844 viewport in both the current v0.3 and future-state concepts, pushing the companion's useful next action down the screen.
- **Candidate approach:** Refine the **information hierarchy** while preserving red/charcoal visual mass, photo warmth, prominent circular people profiles and established four-tab shell. Surface one specific relevant action in the initial viewport, then test content priority, conditional states and mobile accessibility.
- **Implementation status:** NOT STARTED.

## F-08 through F-14
**Decision:** NOT YET REVIEWED. Preserve the original prioritized foundation backlog for the decision sequence.

## Decision protocol
Each item is discussed and explicitly decided before any resulting implementation is undertaken. The user can revise a recorded decision. Do not infer that approval of one finding authorizes changes for another. Protect the agreed Premium ALIVE Hybrid design identity.
