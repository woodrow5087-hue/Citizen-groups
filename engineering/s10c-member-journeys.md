# Sprint 10C.1 — Member journey acceptance contract

Canonical engineering closeout: d7ad874f5c2d7ca4b90c94e74bc6d747854f4697. PR #128 accepted both CI workflows and physical-device review; checkpoint rally-one/checkpoints/2026-11-23-s9br-accepted. Existing production and prior recovery references were verified unchanged. The checkpoint is a branch reference, not a claim that branch rules prevent edits.

## Purpose

Help people become known, connected, supported and involved. Today and Ask Rally must use the existing RallyIntelligence / RallyMemberContext / RallyUnifiedFocus pipeline. No additional identity store, inference system, task store, tracking score or dashboard tab.

| Journey | Initial experience | Explicit follow-through | Acceptance boundary |
| --- | --- | --- | --- |
| Visitor | Welcome and optional discovery | Choose an existing community path | No fabricated commitments or private group data |
| Group member | RSVP and modern unread updates | Save RSVP; actual conversation cursor advances independently | Viewing Today or Ask does not acknowledge messages |
| Volunteer | Scoped serving commitment | Confirm or decline | No unauthorized group care details |
| Care participant | Named synthetic prayer request | Mark prayed, optionally compose and explicitly send | Drafting is not delivery; no automated outreach |
| Leader fixture | Authorized sample review items | Explicitly review each item | Role or membership revocation removes access |

The executable scenarios use existing pure fixture APIs and simulated source updates, not a new runtime scene picker. Existing browser smoke tests cover UI navigation; this PR does not change UI, runtime source, persisted data, or approved visuals. Run npm test through existing CI; require full applicable preview QA, immutable reference comparison and verified deployment. Physical-device acceptance remains required under existing guardrails.

## Findings to address next

- Unified selection already caps visible actions at two, but RallyIntelligence copies the baseline board taskCount into its shared board even when unified focus selects a different set (care-only, deferred or competing actions). Ask Rally uses taskCount to decide whether to describe actions. Audit and align selected count, explanation and action list in 10C.2; preserve legacy behavior and approve intentional copy changes separately from frozen screenshots.
- Ask next/why currently removes certain generic action controls, including care actions. Add safe navigation to existing prayer/check-in destinations rather than automatic sends. Test exact source, eligibility, stale context and user agency.
- Current care completion is based on explicit local message flow; never treat opening or drafting as a send. Test revocation and pause semantics before expansion.
- All current records are fictional. Sprint 11 requires independent server-side verification, organization and scope checks, consent/privacy review, retention rules, and a separately authorized read-only provider pilot. No credentials, real records, or remote write actions in 10C.

## Sequence

10C.2 recommendation coherence; 10C.3 explicit relational follow-through; 10C.4 Today/Ask parity and accessible navigation; 10C.5 end-to-end member journeys. Keep existing two-action limit and four-tab design. Close remaining technical debt alongside feature work rather than broad extraction.
