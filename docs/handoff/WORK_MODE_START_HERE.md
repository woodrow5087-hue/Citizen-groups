# Work Mode — Rally One Execution Kickoff (copy/paste or open this file)

You are taking over the **implementation** of Rally One, Citizen Church's mobile-first community companion. The product owner has approved a visual direction through multiple iterations and wants **continuity above reinvention**.

## Mandatory first source

Read the complete **Master Development Handoff & Continuity Contract** on branch **rally-one/master-work-handoff-2026-11-22**, file:

https://github.com/woodrow5087-hue/Citizen-groups/blob/rally-one/master-work-handoff-2026-11-22/docs/handoff/RALLY_ONE_MASTER_HANDOFF_2026-11-22.md

**Do not** assume that documentation has been merged into Develop. Do not start coding before reading its source hierarchy, approved/rejected visual patterns, exact PR links, architecture/permission caveats, source status and five-step plan.

## What to do FIRST (before implementation)

1. Read the exact handoff and current **rally-point/develop** branch; inspect PR **#101** (Rally One onboarding/shared app), **#102** (Connect messaging design), **#100** (earlier Today proof for comparison), and isolated integration **#92**. Check latest branch heads, merge state, CI and previews.
2. **Actually open** the deployed visual previews and inspect current design at phone scale:
   - PR #101 welcome: https://deploy-preview-101--citizen-connect-test.netlify.app/?rallyOne=1&welcome=1
   - PR #102 Connect: https://deploy-preview-102--citizen-connect-test.netlify.app/connect-design-lab.html
3. Read docs/RALLY_POINT_MASTER_BLUEPRINT_v1.0.md, docs/COMPANION_ARCHITECTURE_DECISION.md, docs/PALETTE_V2_COLOR_ONLY.md, docs/V10_PILOT_READINESS.md, and PR #101 docs/rally-one/INTEGRATION.md.
4. Return a **Context Verification Report**: source-of-truth order, visible screen contracts, exact red/charcoal/cream and type principles, what the owner has explicitly rejected, messaging/local-data boundary, branch/diff conflicts, current test/release gates, and evidence that you understand the ministry problem.
5. Prepare a **conflict map** and **Milestone 1 implementation plan**, ideally from a fresh Develop base with narrow feature-level integration. Include both feasible navigation alternatives: the approved four primary tabs vs the Connect lab's illustrative fifth tab. **Ask the product owner to choose before modifying shared navigation.**

## Then execute the five gates in order

1. Unified Rally One app incorporating #101 and the #102 design without destroying existing Today/Groups/Team/Read.
2. Connected member journeys using existing source-owned fixture data, no duplicate data engines.
3. Mobile accessibility, keyboard, layout, visual fidelity and regression QA at 320/390/430 px plus larger screens.
4. Prepare user-research scenarios/materials; do **not** pretend real people tested it. Actual human testing is a separate coordination/approval step.
5. Feasibility and readiness for authorized read-only church-system pilot, then separately evaluate live secure messaging. No credentials or real church-member access without approval.

Maintain preview links, explicit status/evidence, rollback plan, comparisons, and approval checkpoints.

## Hard boundaries

- No unapproved redesign, new typography system, giant ultra-bold chat copy, generic card grid, dark rusty red or bleached white UI.
- Do not conflate brainstormed attendance/care flags with approved surveillance or spiritual scores.
- Keep each user's fictional demo data, legacy group messages, Ask Rally and Scripture games working.
- Do not merge any branch to **rally-point/develop** or **main**, or deploy production, without explicit approval.
- No real accounts, messaging, pastoral/child data, broad admin token, insecure browser-side secret or unapproved Planning Center integration.
- Work must be candid about anything it cannot access (previous chat images or private meeting recording) and use the linked source-of-truth prototypes instead of inventing details.

**Your first deliverable is the Context Verification Report + integration conflict map—not a broad implementation PR.** This prevents the drift that caused repeated redesign/recovery work in earlier development sessions.
