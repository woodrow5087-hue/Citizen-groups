# Baseline and scope audit

Audit date: 2026-11-23. Repository: `woodrow5087-hue/Citizen-groups`.

## Verified source of truth

| Ref | Exact commit | Decision |
| --- | --- | --- |
| `rally-one/checkpoints/2026-11-23-evening-showcase-qa-passed` | `9a0f878a3ad13f099cb8ca5e0bf9bb94f3ecf635` | Explicitly approved source; branch creation point. |
| `rally-one/showcase-evening-polish` | `9a0f878a3ad13f099cb8ca5e0bf9bb94f3ecf635` | Identical tree and history at audit; appropriate draft PR target. |
| `feature/verse-circuit-hosted-preview-20261123` | `3304a141270d3f1f912149f7a8c7af30f8b4de7f` | Prototype source only. Its merge base with the checkpoint is exactly `9a0f878…`. |
| `rally-one/leadership-evening-demo` | `c7d4c1f7e1ba92b429637940bfeb00eb1a5c83e6` | Newer timestamp, but divergent draft work; not an approved replacement. |

Only `verse-circuit-playground.html` and the standalone page entry in `scripts/build.cjs` differ between the approved checkpoint and the prototype source. Those are the only changes imported before this refactor. The original page is retained as an immutable comparison fixture under `verseplay/reference/`.

The sprint feature branch is `feature/verseplay-foundation-sprint1-20261123`. It starts at the approved checkpoint; it is not based on the repository's older default/development branch. The draft PR targets the equivalent approved working branch, `rally-one/showcase-evening-polish`, leaving the checkpoint intact.

## Newer branch comparison

`rally-one/leadership-evening-demo` is a sibling branch, not a descendant of the approved evening showcase. Their common ancestor is `59dc849f91fcb428cbb3372fe2f184613eb968d2`. Leadership has three unique commits; showcase has seven. Their trees differ in 17 files (208 insertions, 278 deletions), including onboarding/Today/focus behavior, removal of `rally-one-showcase-polish.css`, removal of the showcase runbook and its browser check, and changes to existing member experiences.

[PR #115](https://github.com/woodrow5087-hue/Citizen-groups/pull/115) is still a draft, has no submitted reviews, and reports no review approval. Its description says “Preview based on #113”; it does not claim to supersede the approved checkpoint. Its current `preview-qa` check reports failure. A successful Netlify preview establishes hosting, not design approval. These observations do not establish that leadership is unusable, but they provide no basis to replace the explicitly approved source. Therefore no leadership or experimental Read changes are imported.

[PR #117](https://github.com/woodrow5087-hue/Citizen-groups/pull/117) remains the original preview-only prototype PR. Its older-development target is a hosting workaround and is not reused for this sprint. No existing PR is merged or retargeted.

## Original engineering audit

The approved prototype is about 39.5 KB in 62 physical lines. It combines the static shell, all styling and geometric artwork, passage material, screen templates, rules, localStorage access, audio synthesis, event delegation, announcements, dialogs, and navigation in one file.

The implementation is effective as a prototype, but several boundaries need extraction:

- Rules mutate shared state directly and depend on rendering/storage; they cannot be exercised independently of the browser.
- Some handlers trust the current screen and array length rather than validating stage eligibility, selection identity, or restored progress.
- The saved object has no schema/content version and only shallow shape checks. Impossible completed states and malformed array contents can survive restoration.
- Gameplay progress and sound preference share one object, coupling replay/storage behavior to an interface preference.
- Passage fragments and Afterglow editorial copy are embedded in screen templates and handlers; adding another passage would require editing the game implementation.
- Hint requests after finishing a stage can address missing entries. DOM replacement also requires deliberate keyboard focus preservation.
- No isolated engine/content/storage tests or standalone browser regression suite exists for this prototype.

## Implementation plan and change control

1. Retain the exact original HTML fixture and capture matching states before altering implementation. Extract CSS verbatim; preserve font URLs, tokens, illustrations, layout, animation definitions, and visible copy.
2. Introduce one native-ES-module Verse Circuit engine, explicit state invariants, and structured effects. Keep navigation/DOM/audio/timers outside the engine.
3. Move passage-specific data into a versioned, source-verified content file with stable identifiers and honest editorial/rights metadata. Keep Afterglow labeled illustrative.
4. Validate every restored state; migrate valid legacy progress, isolate sound preferences, and recover clearly from corrupt or incompatible game saves.
5. Separate renderer, controller, and sound adapter. Extend the existing static copy build with the standalone module directory; do not introduce a bundler or framework.
6. Exercise engine/storage/content boundaries and real browser interactions at 320, 375, 390, and 430 pixels, including matching before/after screenshots, keyboard access, reduced motion, reload, and repeated playthroughs.
7. Run repository checks, document evidence and remaining limits, and open a draft PR against the verified showcase working branch. Do not change `main`, merge, deploy production, or modify unrelated app experiences.

The current GitHub preview workflow only triggers PR checks for `main` and `rally-point/develop`. A showcase-targeted PR may therefore need a separate scoped workflow or local reproducible evidence; it must never be retargeted to older development merely to trigger a preview. Netlify hosting must be verified separately before any preview URL is presented as this refactor's result.
