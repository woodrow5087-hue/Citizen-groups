# Rally Point · Visual Recovery North Star — November 22, 2026

**Status:** Owner-supplied references and recovery instructions. **Not a new art direction or a claim of pixel-perfect implementation.**

## Decision

Recover the preserved **Premium ALIVE Hybrid** visual direction on top of the now-working Rally Companion 1.0 engineering. **No redesign, no reset to main, no loss of the RC1 conversation journeys.**

The authoritative historical decisions are in:
- `FINAL_VISUAL_DIRECTION_v1.md` — approved reference hierarchy and companion philosophy
- `RALLY_POINT_VISUAL_SPEC_v1.md` — palettes, people rails, route invariants, review gates
- `PREMIUM_ALIVE_HYBRID_V01_CHECKPOINT.md` — immutable working visual checkpoint `e1b347528526aec62309d58774c712e52c56dbf8`
- `REFERENCE_MANIFEST.md` — older original images saved separately; **not** the same three Nov 22 screenshot files

## New owner-supplied screenshot set: three alternative single-phone explorations

The screenshots uploaded on **November 22** are packaged, byte-for-byte and without transformation, in the companion downloadable `Rally_Point_Visual_Recovery_References_2026-11-22.zip` that the owner can attach to Codex. **These image bytes are not stored in GitHub.** Codex must inspect the actual images (the ZIP) before doing visual work, or explicitly report that it cannot access them.

| ZIP image | Dimensions | SHA-256 | What to preserve |
| --- | --- | --- | --- |
| `references/01_warm_cream_group_hero.jpeg` | 864 × 1536 | `f63f70e52ded022e89e8a3446b1bbe3fd8dc0dc4445a783c10b4c3ed2c2c9ff5` | Warm premium cream canvas, prominent vivid red/photo gathering hero, dense but clear pastel blue/pink/warm accent rows, strong friendly type, bright red calls to action, horizontally visible named people avatars, tasteful local landscape context |
| `references/02_charcoal_red_contrast.jpeg` | 728 × 1536 | `75a5db961e0aa088826f6fd6b51c27e2dc6d64fb30ac1b7e2d2dd91bcdaf2e9d` | Charcoal/red confidence and visual mass, large lead action, rich photo-backed tiles, strong type and named people circles; **reference for contrast, not automatic approval to switch the whole app to dark or glowing glass** |
| `references/03_warm_priority_tiles.jpeg` | 768 × 1536 | `5cedc50d58978703457d590da8cc5b39a6c01ef463dda96b493276a16c10b68f` | Cream base, bright matte red **asymmetric priority hero** with smaller relevant actions next to it, meaningful spacing, avatars near the top, photo-backed Wednesday Group card, mature iconography and red selected tab |

These are **not a single identical screen**, and some elements vary or conflict. Do not invent the owner's choice among variants. For restoration, preserve the established **warm cream + bright matte red + charcoal** design family, use 01 and 03 as the light/default Today composition references, and use 02 for controlled richer contrast. Any change that would switch the entire app to 02's black/glossy treatment must get explicit review.

The screenshot illustrations contain sample counts, times, avatars and labels only. Do not hard-code those into the actual prototype when they are not authorized facts. The screenshot nav labels vary; preserve working **Today / Groups / Team / Read** tabs and role-scoped Leader Care, not the concept's People/Profile nav substitutions.

## Non-negotiable look and flow
1. **The first glance is emotionally alive:** oversized welcoming identity, prominent actionable red/charcoal area, not a 60px generic “Ask Rally” strip.
2. **The visual hierarchy is unmistakable:** one top relevant action, smaller group/serve/Scripture context, and named people circles.
3. **Real functional companion:** personalized source-backed question/response and explicit actions live **inside** the approved card/sheet structure. No fake live AI, invented calendar, auto-RSVP or forced conversation.
4. **Keep original strengths:** bright matte Citizen red `#E3002B` where working baseline uses it, deep charcoal `#242322`, warm cream `#F3E5D6`, bold Manrope, distinctive rounded cards, deliberate photo/context, people circles and compact premium navigation.
5. **No duplicate Today:** screenshot 01 includes both three action rows and “Today at a Glance” repeating them; the real app should **deduplicate**, not copy both. User already requested less redundancy.
6. **No visual drift:** do not replace major brand surfaces with generic white grids, invent another design, bury Your People, add fifth tab, replace icons/brand or change layout of unrequested screens.
7. **Existing RC1 behavior survives:** J1 visitor, J2 group, J3 serving, J4 caught-up, J5 scoped leader, J6 unknown/revoked/focus; preserve save guards, modern conversation source and existing Word/VersePlay/Blank Battle functions.

## Execution protocol (one visual-recovery PR)
- Branch: `rally-point/rc1-visual-recovery-2026-11-22`, created from RC1-B/C head `f3fdd79af720b5593becc943f729a524a6992c0c`.
- Baseline comparisons: existing working RC1 review PR #86 and approved checkpoint `e1b347528526aec62309d58774c712e52c56dbf8`.
- **Before editing**, capture current RC1 Today and Groups at 390×844, plus 320 and 430; inspect all three owner screenshots.
- Keep source adapter / conversational engine / authorization logic intact. Refine Today and the necessary presentation/UI classes only, without broad reset.
- Add geometry / visual-regression tests that assert major components, card order, four tabs, no screen-wide layout changes or overflow.
- **After editing**, collect matched before/after 320, 390 and 430 screenshots plus a written visual delta table mapping each reference characteristic to its new on-screen implementation.
- Run `npm test`, build, browser checks, the integrated RC1 scenarios, accessibility and game regression. Review any CSS changes affecting Groups/Team/Read.
- Produce one review URL on a draft PR and explicitly request **owner visual acceptance** before any merge. Protected Develop and production `main` stay untouched.

## Visual decision test

**“Would somebody who saw our approved Premium Hybrid/ALIVE screens recognize the app immediately, while still experiencing the new RC1 companion behavior?”** If no, do not call the recovery complete.

Source references are preserved, not reinvented. The entire purpose of this document is to avoid another cycle of reconfiguring an already approved design.