# Rally One — development guardrails

## Canonical branch (2026-11-23)
Use **rally-one/develop** as the sole starting point for future Rally One feature branches. Before editing, fetch it and check the actual branch, HEAD and ancestry; never assume the repository default or rally-point/develop is current. If working on an already-open feature branch, compare with the canonical branch before proceeding. Do not reset, force-push, or mass-merge stacked preview PRs.

The approved demo is pinned to 5aa88c93c3d4cd22902ef98af98c09b74ca436ce, also preserved at rally-one/checkpoints/2026-11-23-approved-demo-119. PR #119 remains the frozen leadership demo, not a merge target. The old rally-point/develop branch is legacy; main is production. Do not edit either, change Netlify production configuration, or merge without explicit authorization. If a Netlify preview cannot be generated from the canonical base, report it rather than silently retargeting to the legacy branch.

## Design and functionality lock
Preserve approved Rally One charcoal/red/cream palette, typography, title artwork, tagline, portraits, four primary tabs, onboarding and navigation. No unintended visual changes; separately approve intentional design work. Preserve Verse Circuit's modular runtime, its artwork and classic VersePlay/Blank Battle. Compare screenshots at 320/390/430px and test real iPhone Safari, accessibility and reduced motion.

## Engineering
- Keep one source owner per field: existing onboarding and local state, modern conversation read cursor, member context projection. Never create another storage key or duplicate member identity to solve a presentation problem.
- Extend the existing shared context and unified focus policy, not competing personalization systems. Keep rules deterministic and explainable, with at most two response-needed actions on Today.
- Local fixtures are not authenticated users. No live messages, real pastoral records, inferred risk scores, automatic outreach or provider credentials. Server-only pilot contracts must not ship in static dist.
- Use feature branches and small reviewable PRs against rally-one/develop. Record base/head SHA, test commands and actual results. Never weaken an acceptance test to get green. Preserve legacy routes unless separately approved.
- Run npm ci, npm test, npm run build, npm run test:verseplay and browser suites; check CI and mobile device acceptance before requesting merge. Report failures and pending checks explicitly. Do not call a successful Netlify deployment full QA.

See engineering/s8-foundation.md for this sprint's audit and release gates.

Sprint 8 architecture, source contracts, shared intelligence, validation history and developer commands are in `engineering/s8-architecture.md`, `s8-data-contracts.md`, `s8-intelligence.md`, `s8-progress.md` and `s8-handoff.md`. Keep these internal notes outside the public `docs` build.

## Persistent project coordination
Read engineering/foundation2-development-program.md for current canonical state, active milestone, master roadmap, decisions and backlog before starting work. Historical gate notes are evidence, not a competing development lane.
