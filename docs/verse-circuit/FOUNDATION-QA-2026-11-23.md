# Verse Circuit — isolated foundation checkpoint (2026-11-23)

## Source of truth
- Rally One leadership demo PR #115 is **not** the Verse Circuit implementation.
- Verse Circuit preview PR #117 is a **preview-only, do-not-merge** delivery vehicle based on the approved showcase checkpoint.
- This QA branch starts from #117's head. It must not be merged into the older `rally-point/develop` branch without an explicit integration/rebase decision.
- Standalone entry: `/verse-circuit-playground.html`. Other Rally One pages and production deployment remain out of scope.

## What the current implementation actually does
- VersePlay arcade entry with Verse Circuit featured, future games marked as concepts.
- John 15:12 three-stage TRACE → LINK → ECHO progression.
- Correct-order selection, mistake feedback, hints, replay, Afterglow, local save and optional synthesized sound.
- Mobile viewport safe-area padding and reduced-motion CSS.

## Foundation QA
Run:
```sh
node test/verse-circuit-playground.test.cjs
npm test
npm run build
```
The new Node smoke test covers arcade entry, gated stage advancement, wrong selections, hints, correct completion, Afterglow, replay state reset, and optional sound toggle. **A green smoke test is not a replacement for real mobile-browser testing.**

Still required in Safari / Netlify preview:
1. Widths 320, 375, 390, and 430 px; portrait, larger type and device safe areas.
2. Home → Launch → TRACE → LINK → ECHO → Win → Afterglow → Replay; deliberate wrong choices, hints and undo.
3. Refresh at each stage; verify local progress resumes and no incomplete stage can be skipped.
4. Audio off by default, user-enabled sound, mute toggle and iOS audio restrictions.
5. VoiceOver, keyboard traversal, visible focus, correct modal focus containment and Escape behavior.
6. Reduced-motion setting and screen transition behavior.
7. No regressions to Today, Groups, Team, Read or Blank Battle.
8. Review exact Scripture translation and editorial copy before broad release.

## Architecture assessment
Current `verse-circuit-playground.html` intentionally bundles styling, content, state, DOM rendering and event handling into one standalone prototype. It is useful for quick evaluation, but **not** the maintainable production architecture.

Recommended next productionization sequence after prototype approval:
1. Extract a deterministic, pure game engine (stage transitions, answer validation, undo and normalized persistence).
2. Isolate verse content and editorial metadata from game mechanics; add attribution and reviewed-content workflow.
3. Keep the approved design tokens and presentation intact while splitting reusable components and CSS.
4. Introduce browser-level tests using existing Playwright dependencies and real touch/mobile viewport checks.
5. Plan eventual Rally One integration as a separate PR, with no changes to existing Read/Blank Battle until approved.

## Change boundary
This checkpoint adds documentation and a self-contained regression test only. It deliberately changes **zero** runtime styles, artwork, puzzle content, navigation routes, gameplay files or deployment configuration.
