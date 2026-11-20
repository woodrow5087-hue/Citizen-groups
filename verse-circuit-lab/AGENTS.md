# AGENTS.md — Verse Circuit lab only

This file applies only to files inside `verse-circuit-lab/`. The repo's broader Rally Point application is not part of this game-development experiment.

Before coding, read:
- `../docs/VERSE_CIRCUIT_GAME_BLUEPRINT.md`
- `../docs/VERSE_CIRCUIT_CODEX_HANDOFF.md`
- `../docs/VERSEPLAY_GAME_V1.md`
- `../rallypoint-memorize.js` (verified BSB source and reference).

## Design expectations
- Build one original, complete interactive mobile game level. Do not copy BuddyCheck's five missing words + answer tiles interaction, UI, layouts or assets.
- The core mechanic is *activating a Scripture circuit, connecting three whole-phrase modules in order, then recalling the final phrase without a tile bank*.
- Style as a tactile premium mobile puzzle arcade, consistent with Rally Point's color family but with its own energetic identity. Favor superb composition over decorative complexity.
- User intensely dislikes generic stacked cards, dead buttons, AI-slop neon visuals and "just enough to pass tests" interfaces.
- Keep original VersePlay and all Rally Point app behavior unchanged. This is a standalone `/verse-circuit-lab.html` experiment.

## Programming constraints
- Make the game state machine pure and unit-testable. Separate rules, view rendering and local persistence.
- Never store data in or overwrite the original `rallypoint-phase1-2026` localStorage entry.
- Do not fetch third-party assets or add unapproved Bible translation text. Use exact public-domain BSB John 15:12 already in repository.
- All interactions need tap + keyboard; hover is optional. Hit areas >=44px; screen-reader-friendly status, focus, semantic labels and WCAG AA contrast.
- Respect reduced motion; avoid timed auto-advance, forced countdown or unfair text matching.
- Use deterministic shuffle with a controllable seed; test mistakes, hints, retry, refresh/resume and full completion.
- Add a real build route, unit and browser tests, screenshot artifacts and a short runbook.
- Do not implement real accounts, church member challenges or message sharing.

## Scope of code changes
Changes to `scripts/build.cjs`, `package.json` and test/CI files are acceptable *only* for wiring and testing this lab. Do not modify existing integrated app CSS/JS, onboarding or navigation in the first vertical slice.

## Submission
Draft PR only, link preview `/verse-circuit-lab.html`, include screenshots and test evidence. Never merge or deploy production without explicit review.
