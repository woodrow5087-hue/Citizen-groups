# Rally Point · Visual Unification Audit v1.0

**Date:** November 22, 2026  
**Audit-only baseline:** Develop commit da7c47f75945682faa32c764e18b36af352145d4 (approved PR #90).  
**Result:** Design findings and a proposed implementation contract. **No UI source files changed.**

## Executive decision

**Recommendation: proceed with a scoped Groups visual pass only, after explicit approval of the file/visual contract below.** Then validate Groups against approved Today before separately proposing Team and Read. Do not combine all three in one implementation PR.

This is not a new design direction. Today is the approved source of truth for header, cream canvas, typography, card softness, primary button language, circular people imagery, and light bottom navigation. Retain individual features and personalities of the other tabs.

## Evidence reviewed (actual captured screens and source)

- PR #90 tracked Today screenshots: docs/phase1/screenshots/preview73-today/after-group-tonight-390.webp, after-supporting-390.webp, after-caught-up-390.webp.
- Successful PR #90 CI run 45047520311, QA artifact rally-point-preview-qa: f09-priority-board-390.png (approved Today route); group-connected-390.png; groups-discovery-390.png; team-connected-390.png; team-discovery-390.png; verseplay-read-390.png; leader-care-390.png. All representative captures are 390 × 844 pixels.
- Source on the exact Develop baseline: index.html, rallypoint.js, rallypoint-phase1.css, rallypoint-groups-v07.css, rallypoint-team-v08.css, rallypoint-read-v09.css, rallypoint-premium-alive.css, rallypoint-smart-dashboard.css and rallypoint-priority-board.css.

**Critical implementation detail:** The refined Today Priority Board / Ask Rally styling is currently an opt-in preview path. rallypoint.js derives f09Board from explicit ?f09=board or ?f10=1 and toggles is-f09-board **only on Today**. Other tabs remain controlled by is-groups-v07, is-team-v08 and is-read-v09. Do **not** quietly make the preview the default or change feature flags in the visual pass; that is a separate product release decision. Review against ?f10=1&skipWelcome=1 on the approved baseline.

## What actually matches already

- Authentic Citizen red (#E3002B) and the logo shape are generally carried across tabs.
- Manrope/editorial display headings and large rounded cards are already implemented, and the four-tab information architecture is stable.
- Groups offers real circular photo rings, member conversation and distinct group tasks.
- Team has an understandable next serving shift, a precise response action, and an effective editorial hero.
- Read has a strong Scripture/VersePlay activity entry and appropriately playful game accents.
- These working modules should be refined, **not rebuilt or replaced**.

## Observed inconsistency matrix

| Dimension | Approved Today (F-09 / F-10 preview) | Groups (current) | Team (current) | Read (current) |
|---|---|---|---|---|
| Header / logo / controls | Cream, charcoal identity, white circular controls | Nearly black/teal (#101A1C) with white identity | Full Citizen red with white identity | Full Citizen red with white identity |
| Main canvas | Warm pale cream (#FDF7F1) | Nearly black/teal | Charcoal (#242322) | Charcoal (#242322) |
| Navigation | Cream dock, red-accented active item | Dark charcoal dock, solid red active | Dark charcoal dock, solid red active | Dark charcoal dock, solid red active |
| Lead feature | Photographic matte-red priority hero with light supporting blush/sand/blue actions | Dark 2×2 quick-action grid, red conversation panel, darker people rail | Large red hero then cream schedule card against charcoal | Large red hero, bright lime-accent game card against charcoal |
| Hierarchy | One clear priority followed by secondary actionable rows | Multiple equal-weight group status tiles before the main conversation | Strong urgent serving card, but heavy red/black transition | Game-led hierarchy dominates above the Scripture modules |
| Card system | Soft warm surfaces, subtle depth, legible compact actions | Heavy dark field, thick contrast and hard lower shadows | Cream cards with strong dark shadow on charcoal | Dark game treatments and cream reading cards on charcoal |

The largest problem is **a whole-screen atmosphere change between destinations**, not that any individual page is inherently poorly designed.

### Ranked design findings

**P0 — Shared shell disconnect.** Moving from Today's light header, cream canvas and soft dock to dark Groups or bright-red/charcoal Team/Read makes navigation feel like switching products. Bring the tab shells into the same visual family first.

**P0 — Navigation language changes between tabs.** The nav still has the same four actions, but fills, accent and button treatment change materially. Preserve exact semantics and tap targets; harmonize chrome and selected state.

**P1 — Groups information density obscures its purpose.** The four status tiles (conversation, gathering, prayer, people), tabs, image rail and large conversation module compete for attention. A *styling-only* pass can establish clearer hierarchy through surface/contrast/spacing; it must not remove, rearrange, or duplicate these working functions.

**P1 — Cards and typography lack a unified rhythm.** Multiple background tones, shadow styles, radii and heading sizes are individually polished but are inconsistent when adjacent in one four-tab product.

**P1 — People photography and social affordances are valuable.** Keep the existing round photos and people rail, adjusting containment, contrast and spacing to fit the Today visual family; do not replace with initials, generic icons or invented contacts.

**P2 — Specialized areas should retain their character.** Team keeps high-energy serving urgency; Read retains contemplative Scripture and a vibrant VersePlay game. A brand-wide cream shell does not mean turning all content into identical pastel tiles or removing the game accent.

## Exact proposed Stage 2: Groups-only implementation contract (NOT approved yet)

**Branch:** new branch from current approved Develop HEAD at the moment of approval, never branch from PR #92 or an older RC1 experiment.

**Files permitted:**
1. NEW rallypoint-visual-unification.css — selectors must begin with the existing Groups scoped shell (.premium-alive.is-groups-v07 or equivalent Groups-only scope). No unscoped header, main, bottom, card or body selectors. Group leader and no-membership states must be addressed explicitly.
2. MODIFY index.html — append exactly one stylesheet link **after** current stylesheets. No HTML markup, JS, navigation or DOM modifications.
3. MODIFY scripts/build.cjs — add that one CSS filename to the static build allowlist, and no other changes.
4. NEW test/rallypoint-visual-unification.test.cjs — verify stylesheet loading, selector scope, absence of changes to frozen Today sources and no broken existing screen contracts.

**Not permitted:** modifications to rallypoint.js, storage, role logic, event handlers, auth/provider modules, navigation structure, API contracts, group messages, serving, Scripture content, logo assets, source photographs, or any previously approved Today stylesheet. No direct changes to Develop or main.

**Groups visual changes proposed:**
- Use the approved cream canvas and light branded top header with charcoal brand/icon treatments.
- Give Groups the same light, warm four-tab bottom dock and red-accented active destination as Today, without changing destinations or interactions.
- Keep a distinctive Groups editorial headline. Move away from full-bleed near-black as the default page background; preserve charcoal as *intentional accents* and the active red conversation / priority module.
- Rebalance the existing group status cards into clearer secondary/supporting surfaces using restrained cream/blush/sand/red, with readable contrast and purposeful selected tabs.
- Preserve the genuine circular portraits and group rail. Adjust background/heading contrast only where needed.
- Maintain all chat, direct message, People, Gathering, Prayer, discovery, no-group, and leader-tools screens. Do not invent new actions, move content, remove cards, or alter the state model.

**Baseline screenshots and QA required before accepting Stage 2:**
- Matched before/after at 320, 390 and 430 px width for member with group (conversation), People, Gathering, Prayer, group discovery / no membership, and authorized leader tools.
- Compare Today at 390 px with the same F-09/F-10 URL, fixture/date and state **before and after**; it must be visually unchanged.
- Team and Read must be pixel/DOM unaffected.
- Run npm test, npm run build, browser checks, Groups safety/integration, onboarding, blank battle and accessibility checks; inspect first-fold and below-fold screenshots.
- Report CSS selector diff and exact file list; no new external asset dependencies and no loss of 44 px targets or reduced-motion support.
- Produce a **draft** PR against rally-point/develop, never auto-merge, with screenshot links and a one-paragraph risk assessment.

**Pass/fail:** A reviewer should be able to switch Today ↔ Groups without sensing a change of app identity, while still recognizing Groups as the community-focused destination. Any unintended Today/Team/Read visual shift or functional regression fails the pass.

## Later phases — only after Groups approval and regression sign-off

**Team-only separate visual PR:** apply the same cream shell, top header and nav treatment; retain the vivid red Serve Together hero as a distinct feature, preserve response/coverage status and role clarity, and restyle cream schedule/supporting cards consistently. Check joined, unassigned, confirmed/declined, coverage and team-chat states.

**Read-only separate visual PR:** apply the same light shell/top header/nav, create calmer typography and reading focus around Scripture, retain the VersePlay game as a specialized vivid play zone (including its lime cue if accessible), and do not reorder reading/game sections or change Bible text/rights. Check Read, reflection, prayer, and game route.

**Separate, deferred product decision:** whether and when the approved Today F-09/F-10 preview is made the default release experience. This is explicitly out of scope for visual unification.

## Approval required

This audit authorizes **no implementation**. Approval, if granted, means **Groups-only** exact four-file scope above; Today/Team/Read frozen, pilot PR #92 isolated, stage-by-stage review, no merge or production deployment.

**Owner decision:** approve or revise the Groups-only contract before implementation.
