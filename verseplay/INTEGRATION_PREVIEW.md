# PR #115 + Verse Circuit — preview-only bridge

This independent branch starts from the exact PR #115 head (`c7d4c1f7e1ba92b429637940bfeb00eb1a5c83e6`). It imports Verse Circuit's runtime, tests, documentation and immutable comparison evidence from PR #118 at `d2155dd0b653c0324209e0e326362506d686b160` without merging or overwriting either PR.

The only player-visible Rally One addition is a Read tab card using the existing card/button classes to open the distinct standalone Verse Circuit page at `/verse-circuit-playground.html`. Blank Battle and the original classic VersePlay remain available. This is a **navigation bridge**, not an embedded game engine; future deeper integration must be separately reviewed.

The production main, PR #115, PR #118, and their visual code are unchanged. The original extracted Verse Circuit CSS and its animation are unchanged. The static build copies only the game runtime, passage content and original HTML fixture; development tests, QA screenshots, and docs are not shipped under dist.

The preview PR is targeted to `rally-point/develop` **only to obtain a Netlify preview** using the existing CI trigger; its diff includes all unmerged PR #115 changes and must **never be merged to older develop**. Verify the Netlify preview at the actual deployed commit, then manually inspect Read → Verse Circuit → TRACE → LINK → ECHO → victory → Afterglow on mobile. Recheck Blank Battle and leadership interactions. This note is a test plan, not a claim QA has passed.
