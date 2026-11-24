# UX-1A Read source audit

Baseline f4f81936eb937f36eb9f5229057ecad27bd873ed. Source inspection only; no rendered viewport, browser or physical device audit completed.

## Evidence
- rallypoint.js lines 468–511: hero, featured Blank Battle, classic game label and full VP.render, reading path, Scripture excerpt and mark-read, reflection/group chat/rhythm editor, conditional leader controls, prayer, footer.
- rally-one-verse-circuit-entry.js: MutationObserver injects a generic card before classic label, separate from native renderer; label NEW GAME, arrow, standalone game aria-label, preview note and link to verse-circuit-playground.html.
- rallypoint-verseplay-ui.js: full classic puzzle includes solo/pass modes, verse selection, tiles, hint/reset/check, feedback and local progress. Preserve all.
- index.html: ordered styles and deferred scripts; architecture document requires explicit build allowlist for new runtime modules. No global CSS reordering.

## Proposed information architecture (pending design acceptance)
Read landing: compact heading, reading path with actual passage and completion state; equally discoverable native VersePlay feature with Verse Circuit flagship and access to Blank Battle and classic. Reflection and prayer contextual to reading; leader-only tools remain gated and accessible in secondary section. Do not invent full Bible reader, streaks, library or a shared reading/game verse where content does not match. Preserve reading IDs, existing data-action handlers and deep-link/focus paths; handle disclosures before targeting nested elements. Preserve game engine and verified return link. Prefer native renderer ownership over injected duplicate card; retire observer only after checking dependent tests and entry contexts. Use existing approved palette and actual game identity.

## Next gate
Three high-fidelity variants against current rendered baseline; inspect at 320, 375, 390, 430 CSS px, verify first viewport and touch/keyboard/focus/VoiceOver. Existing immutable comparison must remain intact for unaffected surfaces, with intentional Read differences explicitly documented and reviewed separately. No implementation, CI or visual acceptance claimed.
