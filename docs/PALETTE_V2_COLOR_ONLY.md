# Rally Point — Palette v2 / Color-Only Refinement
**Decision:** D-11 · Adopted November 20, 2026  
**Scope:** Approved Warm Editorial design on `rally-point/phase1-today`  
**Status:** Locked palette direction; visual implementation requires separate review

## Non-negotiable brief

**KEEP THE APP EXACTLY AS IT LOOKS NOW, except for orange/rust/terracotta accent colors.** This is a limited palette correction, **NOT** a redesign, cleanup, modernization, simplification, UI-kit migration, or template refresh.

Preserve the existing **nonwhite, textured warm-cream background, charcoal/nav surfaces, strong contrast, outlined cards, bold Manrope typography, icons, asymmetric compositions, illustration geometry, contours, shadows, component sizes, active navigation, and every interaction.**

**NO whitewashing:** do not replace existing cream/parchment/sage/charcoal/card surfaces with white, very pale gray, or uniformly light cards; do not reduce surface variety or border contrast. A result that looks cleaner but flatter, lighter, more corporate, less tactile, or less visually expressive **fails**.

## Palette — retain these actual existing tokens

| Token (blueprint) | Current implementation | Rule |
|---|---|---|
| `brand.citizenRed` | `--red: #E3002B` | Preserve the exact existing Citizen red; don't approximate or substitute coral/orange |
| `ink.charcoal` | `--ink: #242322` | Preserve strong dark structural contrast |
| `surface.cream` | `--cream: #F3E5D6` | Preserve broad tactile warm-cream canvas; **not white** |
| `surface.parchment` | `--parchment: #E9D5C1` | Preserve warm secondary card depth |
| `surface.pale` | `--paper: #FCF7F0` | Retain sparingly in existing locations; never expand across the page |
| `line.defined` | `--border: #C5AA94` | Preserve noticeable borders or improve color contrast only where needed |
| `text.muted` | `--muted: #665E56` | Retain legible secondary hierarchy |
| `accent.sage` | `--sage: #5E7065` | Keep existing small sage reading/community accents; do not introduce new green areas |

### The only requested changes
1. **Remove orange/terracotta/rust as an accent family**, including the old `--terracotta: #BF5B45` and deliberately orange/burnt-orange fills, decorative graphics and emphasis. Do not use a new orange or pinkish-orange substitute.
2. For a **large orange/terracotta card or banner**, replace its *color* with existing charcoal `#242322` **by default** (preserving its shape, texture, stroke, copy color contrast, and location); Citizen red `#E3002B` may be used only if that region is clearly intended as the single primary brand emphasis.
3. For **small orange accents**, use existing Citizen red `#E3002B` for emphasis, or existing charcoal `#242322` for quieter distinction.
4. For **orange-toned contour/graphic strokes**, shift only color to an appropriately contrasted red, charcoal, or existing neutral border tone while retaining **identical paths, opacity intent, and line weight**.
5. **Do not change warm beige/cream/parchment neutrals merely because they have warm undertones.** The user dislikes orange *accents*, not the warm editorial canvas. Do not bleach/neutralize them.
6. Keep the dark navigation rail, its vivid red active pill, and light-on-dark type. Strong graphic and card borders must remain; do not flatten surface contrast.

## Implementation pointers (audit, do not blindly replace)

The active Phase 1 styles live in `rallypoint-phase1.css`, *not* the archived `rallypoint.css`. Inspect how colors are actually used before changing anything. Known orange/rust candidates in the active stylesheet as of this decision:

- `:root --terracotta: #BF5B45` — eliminate as an accent source rather than silently retain.
- `.welcome-graphic:after` — terracotta-shaped graphic: preserve **exact** shape/position/size/texture; recolor only.
- `.availability-action` — burnt-orange filled action tile: preserve dark-card emphasis and readable light text; charcoal is the preferred replacement; red can be used only after an overall balance check.
- `.availability-action .contours` — recolor strokes to visible but restrained existing brand/neutral tones, not orange.
- `.stage:before` — low-opacity burnt-orange decorative wash: recolor only, preserve clipping and opacity.
- Other hardcoded rusty/brown-orange decorative and text colors should be evaluated **one selector at a time**. Neutral warm-beige borders, parchment surfaces and subtly tinted neutral text are *not* automatically orange accents.
- Audit decorative SVGs for orange fills/strokes; preserve every illustration geometry/path and adjust color only when clearly orange.

**Exact substitutions should be selected in context and documented selector-by-selector; do not run global find-and-replace across all warm hues.** Beware accidentally turning all warm neutrals red or black.

## Hard change boundary

**Allowed:** Color value changes to CSS tokens/declarations; SVG fill/stroke color substitutions (same SVG geometry); color-only focus/hover/active states where orange was used; contrast fixes that alter color alone.

**Prohibited:** HTML/JS/application behavior changes, changed wording/content, new icons/imagery, new fonts, new components, spacing/padding/margin/gap changes, rearranged cards, changed grid, altered widths/heights/radii, border widths, shadows' size/blur/offset, changed texture assets or opacity layout, introduced white backgrounds, new dashboards, new branding marks, changes to member/leader permissions, or accidental edits to archived variants.

If a color edit requires changing layout or a graphic asset shape, **stop and report it as out of scope** rather than changing it.

## Verification and acceptance

- Work on the **current** `rally-point/phase1-today` preview branch, preserving its existing implementation and commits; do not create a new app or start from `main`.
- Capture **BEFORE** and **AFTER** full-size screenshots using **identical fixture data, viewport, and scroll positions** (at least Today 390×844; ideally Groups, Team, Read, Leader).
- Side-by-side compare. The difference should be recognizably **color only**. Geometry, hierarchy, typography, contour lines, texture, shadows and card composition must remain intact.
- Verify the original textured cream is **still dominant**, charcoal remains rich, and card borders remain clearly legible. No orange accent, but warm neutral beige is permitted.
- Check WCAG AA text contrast and focus state visibility. Run existing build/tests; no interactions or data behavior should regress.
- List selectors and color values changed. Prefer minimum possible diff. **If the revised UI appears whiter, more generic, flatter or materially different, revert and fix the palette only.**
- Provide screenshots and a development preview; do not merge into main or deploy production without user approval.

## Relationship to earlier blueprint

This decision **overrides only** the terracotta/orange accent guidance in `docs/RALLY_POINT_MASTER_BLUEPRINT_v1.0.md`, section 5.2. All other confirmed feature, visual, navigation and companion-architecture decisions remain unchanged. If a conflict arises, **D-11 controls only palette; D-10 continues to control integration architecture**.
