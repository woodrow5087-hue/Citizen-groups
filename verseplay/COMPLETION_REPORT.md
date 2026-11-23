# VersePlay foundation sprint 1 — engineering completion report

## A. Executive summary

The approved Verse Circuit prototype has been separated into native JavaScript modules, a deterministic game engine, validated versioned content, and defensive local storage. The existing John 15:12 loop and artwork are retained. This is an isolated engineering foundation, not a production-readiness declaration.

The branch starts at approved checkpoint `9a0f878a3ad13f099cb8ca5e0bf9bb94f3ecf635`, identical to `rally-one/showcase-evening-polish`; the newer divergent leadership demo was inspected and excluded because approval was not established. See [baseline audit](BASELINE_AUDIT.md). No merges, production deployment, main changes, or unrelated member functionality changes were made.

## B. Original architecture problems

The 39,496-byte prototype bundled CSS, templates, content, game rules, storage, audio, and event listeners in one closure. Restoration merged arbitrary parsed values with defaults and checked array shape rather than reachable progress. Action handlers lacked consistent stage guards; hints could access a nonexistent next answer. Gameplay and sound preferences shared a record. Passage words, positions, and discovery copy were embedded in rendering and handlers. There was no isolated unit-testing boundary.

## C. New module structure

- `core/circuit-engine.js`: pure immutable transitions and declarative presentation effects.
- `core/state-schema.js`: explicit state version and reachable-state validation.
- `core/storage.js`: safe persistence, strict restoration, legacy migration, independent sound preferences.
- `core/content-schema.js`: versioned metadata, IDs, answer/order validation, exact passage reconstruction.
- `content/john-15-12.json`: BSB source text, puzzle data, evidence/rights, honest review status, illustrative Afterglow.
- `games/verse-circuit/`: controller, renderer, unchanged extracted stylesheet, optional sound adapter.
- `tests/`: engine/content/storage tests and click-driven browser/visual regressions.
- `reference/verse-circuit-original.html`: byte-identical original for ongoing comparison.

## D. Changes made and maintainability assessment

**Before:** changing a phrase or rule required editing a monolith while accounting for UI, storage, and sound side effects. Corrupted progress could enter impossible screens.

**After:** rules can be modified and tested without a browser; passage content can be validated independently; saved progress must satisfy stage invariants; rendering/effects have explicit owners. Stable identifiers replace array positions in saved state. Replay clears gameplay and preserves sound. There is no new runtime framework or package dependency.

The existing static build copies the standalone entry and VersePlay directory. A scoped GitHub Actions workflow checks this work against the approved showcase target. No app navigation or global Rally One styling was changed. The extracted CSS retains its original bytes; preserved template whitespace avoids reflow during extraction.

Intentional player-visible reliability/accessibility behavior: invalid saves explain the affected-game reset, unavailable persistence displays a persistent notice while in-memory play continues, content load/validation failure offers retry, keyboard activation retains useful focus after rerender, modal background controls are inert, the stage meter has an explicit accessible role, and Afterglow headings expose the correct semantic level. Sound toggling updates only its control so it cannot rerender the gameplay fragment or interrupt focus/feedback. These changes do not restyle the normal game.

## E. Tests executed

- Existing repository unit/fixture suite: **293 passed, 0 failed** (`npm test`).
- New engine/content/storage suite: **172 passed, 0 failed** (`npm run test:verseplay`), including 83 engine tests and 89 content/storage tests.
- Verse Circuit browser verification: **467 successful assertions across the full interaction pass and final targeted verification; 49/49 screenshot pairs byte-identical (98 captures); 0 final axe violations across seven screens.** The QA ledger explains the capture-harness correction and manual-review limits.
- Static build: passed (`npm run build`).
- Built-output smoke: full TRACE → LINK → ECHO → victory → Afterglow journey passed with zero page errors.
- Existing Phase 1 browser suite: passed all 8 viewport/safe-area cases and remaining persistence, accessibility, source-flow, and privacy checks.
- Existing onboarding browser suite: passed 6 viewport/safe-area cases, 30 axe scans, splash timing, and blocked-storage fallback.
- Existing Blank Battle browser suite: passed 2 viewport cases and 2 axe scans. Its first attempt lacked the bundled browser; the standard command passed after browser installation completed.
- Existing Groups safety, Wednesday chat lab, and integrated Groups browser suites: all passed. A shared build preceded unchanged node script invocations with `BROWSER_PATH=/usr/bin/chromium`, avoiding simultaneous rebuilds.

Detailed Verse Circuit browser assertions, visual comparison counts, environment, and Blank Battle execution evidence are recorded in [QA](QA.md). All counts describe executed checks; availability of another repository script is not a claim it ran.

## F. Browser and accessibility QA

See [QA](QA.md) and [committed screenshot evidence](qa/) for matching original/refactored states at 320, 375, 390, and 430 pixels, real interaction/restoration checks, normal/reduced motion checks, console results, and accessibility findings. The original has invalid accessible labeling on its stage meter and a skipped Afterglow heading level. Nonvisual semantic markup repairs address those findings without changing styling; final axe results are recorded in the QA ledger.

## G. Remaining risks and conflicts

Real iOS Safari, Android devices, assistive technology, and audible sound quality require human/device QA. Automated contrast evaluation is incomplete for text whose background is obscured by the approved decorative pseudo-elements; those targets require manual review, as listed in QA. Chromium emulation does not establish device parity. Original remote Google Fonts remain a network dependency; offline packaging needs a separately reviewed asset decision. John 15:12 is source-verified, not church editorial-approved; Afterglow remains explicitly illustrative. Storage is local to the device/browser and does not resolve cross-device progress.

No technical conflict required changing the approved visual experience. No palette, font, layout, or artwork changes were made. New preview availability depends on the host accepting PRs against the approved showcase target; the PR will not be retargeted to older develop to trigger hosting.

## H. Architecture documentation

[Developer README](README.md) · [Architecture and decisions](ARCHITECTURE.md) · [Content guide](content/CONTENT_GUIDE.md) · [Baseline audit](BASELINE_AUDIT.md) · [QA ledger](QA.md).

## I. Draft pull request

The draft PR targets `rally-one/showcase-evening-polish`. Its link and current hosted-preview status are recorded in the delivery message and PR discussion after branch publication. It must remain unmerged pending review.

## J. Preview

The unchanged approved prototype remains available at [preview 117](https://deploy-preview-117--citizen-connect-test.netlify.app/verse-circuit-playground.html). That URL demonstrates the original prototype, not this refactor. Local refactor: `npm run dev`, then `/verse-circuit-playground.html`; comparison original: `/verseplay/reference/verse-circuit-original.html`. A new preview is only reported as verified after checking its actual commit and playable route.

## K. Recommended next milestone

Run a focused release-candidate validation milestone: real-device Safari/Android and screen-reader QA; editorial and rights sign-off; manual accessibility validation and a separately scoped review if it reveals visual changes are needed; and verification of approved-branch preview CI. Then scope Rally One integration behind a clear navigation/storage boundary. Keep cloud saves, analytics, accounts, and additional games outside that milestone until their requirements are agreed.
