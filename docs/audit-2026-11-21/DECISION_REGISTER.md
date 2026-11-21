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
- **Decision:** PENDING REVIEW.
- **Candidate scope from the audit:** Define stable entities and relations for User, Membership, Conversation, Message, Reaction, Reply, ReadCursor, ServingShift, CoverageRequest, CompanionAction, CareTask, and SourceReference. Implement with a mock adapter before connecting real data.
- **Implementation status:** NOT STARTED.

## F-03 through F-14
**Decision:** NOT YET REVIEWED. Preserve the original prioritized foundation backlog for the decision sequence.

## Decision protocol
Each item is discussed and explicitly decided before any resulting implementation is undertaken. The user can revise a recorded decision. Do not infer that approval of one finding authorizes changes for another. Protect the agreed Premium ALIVE Hybrid design identity.
