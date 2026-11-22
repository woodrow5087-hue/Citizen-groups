# Codex execution brief · Rally Companion 1.0

Use this brief when starting a substantial Codex repository task. It is intended to replace repeated feature-by-feature prompts with one outcome-driven assignment. **This file is a handoff, not an indication that a Codex agent is currently running.**

## Start here
- Repository: `woodrow5087-hue/Citizen-groups`
- Kickoff branch: `rally-point/companion-1-0-kickoff`
- Product epic: [#79](https://github.com/woodrow5087-hue/Citizen-groups/issues/79)
- Implementation: [#80 source adapter](https://github.com/woodrow5087-hue/Citizen-groups/issues/80), then [#81 conversation journeys](https://github.com/woodrow5087-hue/Citizen-groups/issues/81), then [#82 integrated UX/QA](https://github.com/woodrow5087-hue/Citizen-groups/issues/82)
- Root instructions: `AGENTS.md`
- Product and acceptance: `docs/roadmap/RALLY_COMPANION_1_0.md`
- Source/action contracts: `docs/architecture/RALLY_COMPANION_1_0_CONTRACTS.md`
- F-10.4 PR #78: **unmerged/owner-review only**. Do not include without separate approval.

## Single master task for Codex

> Act as the senior implementation team for **Rally Companion 1.0**. Inspect the actual repository, follow AGENTS.md and issue #79, and deliver the three work packages in dependency order. Work from the kickoff branch using isolated, clearly named implementation branches; create cohesive PRs, not micro-PRs. Begin with issue #80. Keep the current approved Rally Point visual design and user journeys intact; add a normalized authorized read-only source projection with strong scope-denial characterization tests. Then use it for the goal-to-action user journeys in #81 and polish one integrated Today/Ask Rally experience with full tests in #82. It is okay to fix implementation details and CI failures without requesting approval for each small change. Preserve F-10/F-10.3 comparator behavior, do not merge F-10.4 PR #78, do not assume real church data, and do not introduce autonomous changes, new secrets or persistent transcripts. Keep the user aware of meaningful decisions and blockers. Run fast tests during work; finish with full existing test/build/mobile/accessibility/game/Groups checks and a consolidated preview plus a compact acceptance report for J1–J6. **Do not merge into rally-point/develop or main, do not deploy production, and do not connect live data without explicit separate approval.**

## Expected handoff artifact
One concise report containing:
1. **What a member can now do** in the integrated preview for new attendee, group member, volunteer, leader and caught-up scenarios.
2. **Code/architecture changes** with file ownership and migration notes.
3. **Source and permission matrix**, especially unavailable/future/guest/revoked roles.
4. **Exact preview URL, PR URLs and head SHAs**.
5. **Evidence:** unit, build, browser widths, axe and relevant existing app regression results.
6. **Open limitations** and any proposed integration/production decisions requiring owner approval.

When the handoff is ready, the owner should be able to evaluate the *complete experience* without approving dozens of small technical steps.