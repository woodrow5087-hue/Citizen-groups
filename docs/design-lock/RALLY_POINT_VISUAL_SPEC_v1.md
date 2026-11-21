# Rally Point — Visual & Experience Design Lock v1.0

**Established:** November 21, 2026  
**Status:** OWNER-APPROVED REFERENCE DIRECTION — preserved, not approved for automatic merging or production release.  
**Scope:** Rally Point, Citizen Church mobile-first companion.  
**Authoritative image references:** three exact screenshots supplied by the product owner on November 21, 2026 (see companion `REFERENCE_MANIFEST.md` and downloadable original-image archive). **Never replace these with AI-generated approximations.**

> **Core rule:** Evolve the intelligence, contextual interactions, and usefulness of Rally Point *inside the established visual designs*. Do not restart the aesthetic, flatten the composition, turn the app into a website feed, or rebuild unrelated screens.

## A. Source-of-truth register

**Two distinct visual/reference lines must both survive. They are NOT interchangeable or a mandate to merge their colors and layouts indiscriminately.**

| Priority | Source | Immutable reference | What it establishes |
|---|---|---|---|
| A | Product-owner supplied **Premium Hybrid four-screen image** | Exact original in reference-image archive | Red-led Today, My People, My Team, Leader Care functional presentation; high-fidelity mobile polish; action-centered cards |
| A | Product-owner supplied **ALIVE: people story rail screenshot** | Exact original in reference-image archive | Horizontal Instagram-like circular profiles, colorful rings, charcoal masthead, logo lockup and balanced avatar sizing |
| A | Product-owner supplied **ALIVE: four-screen concept image** | Exact original in reference-image archive | Editorial Today / Daily Rhythm / Groups / Community Action composition, expressive typography, cream/charcoal contrast, photo-led storytelling |
| B | Approved v0.8 code | `84e489b86851e853948a7d4246475e83b7ddd085` | Existing production-minded interaction structure, CSS geometry, working routes, state and components |
| B | ALIVE × Citizen v02 concept | `1da3bab388f85010e541b4ecb3c441b4431c5b81` | Implemented ALIVE concept and separate campus/photo/content exploration, not part of approved v0.8 |
| C | Prior decisions | `docs/PALETTE_V2_COLOR_ONLY.md`; `docs/COMPANION_ARCHITECTURE_DECISION.md`; `docs/RALLY_POINT_MASTER_BLUEPRINT_v1.0.md` in v0.8 | Existing locked palette/integration decisions, used only where compatible with A/B and the specific screen under modification |

Immutable commit links:
- Approved v0.8: https://github.com/woodrow5087-hue/Citizen-groups/tree/84e489b86851e853948a7d4246475e83b7ddd085
- ALIVE × Citizen v02: https://github.com/woodrow5087-hue/Citizen-groups/tree/1da3bab388f85010e541b4ecb3c441b4431c5b81
- Standalone ALIVE preview (PR #53): https://deploy-preview-53--citizen-connect-test.netlify.app/alive-lab.html
- Original ALIVE preview (PR #52): https://deploy-preview-52--citizen-connect-test.netlify.app/alive-lab.html
- PR #53: https://github.com/woodrow5087-hue/Citizen-groups/pull/53

**Scope warning:** Current `main` is an older/different implementation. Do **not** use `main` as the visual baseline for v0.8. PR #53 was intentionally a standalone preview based on `main`; do **not** mistake the presence of `alive-lab.*` for integration into v0.8.

## B. Non-negotiable visual DNA

1. **Real Citizen identity:** preserve the white Citizen flag/logo as used in the UI, the stacked/compact RALLY POINT wordmark, and its bright matte red emphasis. No generic church-app branding or invented substitute icon.
2. **Charcoal as structure:** rich, nearly black masthead and navigation zones; clear cream/charcoal alternation rather than all-white surfaces.
3. **Warm tactile canvas:** cream/parchment content surfaces with editorial warmth; not clinical gray cards, whitewash, glassmorphism everywhere or indistinguishable rounded tiles.
4. **Color confidence:** vivid Citizen red, never burgundy/dark crimson or luminous gradient-red overload. Contrast with charcoal and warm neutrals. Accent colors only as established in the particular concept.
5. **People first:** a horizontally scrollable row of authentic-feeling circular profile images with distinguishable colored story rings and visible labels near the top; preserve its dimensions, spacing, hierarchy, swipe affordance, and placement before introducing other feature modules.
6. **Large editorial type:** substantial Manrope headings, compressed tracking, confident line breaks; selective Georgia italic words as featured in ALIVE. Avoid generic dashboard typography.
7. **Photo-led moments:** deliberate cropped image treatments, layered labels, high-contrast readable text overlays, selected asymmetric card shapes, no broad stock-photo montage.
8. **Strong composition:** bold large/small tile asymmetry, energetic section transitions, distinctive photography, thoughtful cards. Do not remake as a uniform list of white boxes.
9. **Navigation discipline:** preserve the v0.8 four-tab foundation **Today / Groups / Team / Read**; translate the ALIVE visual experiments intentionally, rather than silently replacing functional routes. Leader Care is role-gated, not automatically a public fifth tab.
10. **Everyday usefulness:** buttons are real actions or explicitly labeled demo actions. Never decorate the home screen with fake interaction indicators.

## C. Exact code-grounded palette per design line

These are **implementation-observed tokens**, not permission for blanket substitution or a new combined palette.

| Token | Approved v0.8 / D-11 Warm Editorial | ALIVE v01 / ALIVE × Citizen v02 |
|---|---|---|
| Primary red | `#E3002B` | `#E40032` |
| Charcoal/deep | `#242322` | `#101A1C` deep; `#172124` ink |
| Warm cream | `#F3E5D6` | `#F5EFE4` |
| Secondary pale | `#FCF7F0` paper, sparingly | `#FFFAF2` paper |
| Other established colors | `#E9D5C1` parchment; `#5E7065` sage; `#C5AA94` border | `#F99B39` orange; `#9BE0CC` aqua; `#C3FF5C` mint |

**Conflict policy:** D-11 explicitly removed orange/rust *from the locked v0.8 Warm Editorial variant*. The ALIVE reference deliberately includes an orange Daily Rhythm tile. Preserve each source **as it exists**; don't bleach the orange from ALIVE or reintroduce it in v0.8 without a separately reviewed decision. Do not convert code-grounded colors in either variant to a guessed logo red.

Typography: Manrope (existing asset); ALIVE uses Georgia for selective italic emphasis. Preserve actual font weights, line heights and line breaks when comparing screenshots. Do not redistribute fonts from the repository in separate deliverables.

## D. Screen-level invariants

### Today
- Strong branded header, personal welcome, clear next relevant action, intentional photo/context.
- Preserve the bold red/cream/charcoal visual hierarchy and non-uniform card silhouettes of the chosen variant.
- The companion should identify *what matters to me now*, not aggregate a website homepage.
- The ALIVE story rail is a signature interaction; keep it visible and horizontal.

### My People / Groups
- Preserve the Instagram-like story circles, colored rings, labels and tap target behavior.
- Group members, conversations, prayer and personal check-ins take priority over broad event discovery.
- No public display of private prayer, attendance or member status; all sample data in concept previews must be plainly marked fictional.

### My Team / Serve
- Keep clear serving schedules, confirmations and team updates in concise interactive panels.
- Do not remove the functional service flows while visually evolving layouts.
- Never claim a real schedule response was synchronized without an authorized integration.

### Leader Care
- Preserve approachable, people-centered follow-up cards, visible action hierarchy and private role access.
- Avoid scoring people, alarming absence badges, or automatic pastoral judgements.
- Role authorization must be enforced beyond client UI when real data is ever connected.

### Read / Daily Rhythm / VersePlay
- Retain engaging expressive tiles and the Scripture-first identity; retain working progress, memorization and related existing routes.
- Daily companion nudges should deepen engagement, not create compulsory streak pressure.
- Do not break local progress or move/rebrand these experiences without an explicit request.

## E. Virtual companion product rule (not a website clone)

**Rally Point's job:** Remember what matters with permission; connect people; help users take the next relevant step; support Scripture/prayer/serving throughout the week.

| Weak (website-like) | Strong (companion-first) |
|---|---|
| Here is this week's sermon | Want to revisit the idea you saved on Sunday? |
| These are our groups | Your Wednesday group meets tomorrow—would you like to check in? |
| Browse volunteer opportunities | You're serving Sunday; review your team plan |
| View church announcements | Your campus has something relevant to the group you're part of |
| Here's the recap email | Here is one meaningful thing from Sunday you could carry into this week |

Actual Citizen sermon notes, campus galleries, weekly emails, website and Church Center may be **contextual sources and link-outs**, not the primary navigation architecture. A source appearing on a website does not authorize reproducing it as live synchronized user data. Preserve prior D-10 integration constraints and use church-authorized APIs only.

## F. Change-control policy for Codex

A future task **MUST**:
1. Identify the exact current development branch and the specific screen(s) to edit. Never start from `main` just because it is default; never overwrite v0.8 with ALIVE or merge PR #53.
2. Read this specification, the image reference manifest, D-10, D-11, and the relevant CSS/JS files before changes.
3. Define the intended action/behavior and the *smallest* needed code change. **Preserve unchanged CSS, spacing, typography, color, component geometry, card order and navigation outside scope.**
4. Create a separate preview branch/PR. No production deploy, default-branch merge or data connector activation without explicit owner authorization.
5. Use existing image, logo and font assets; don't silently replace reference imagery with AI-generated photos, invented portraits or a different wordmark.
6. Capture BEFORE/AFTER screenshots with identical fixture data at 320, 390 and 430 px mobile widths (at minimum 390×844) and desktop when relevant; compare pixel-level or side by side.
7. Run existing build/tests, verify tap/swipe/navigation and accessibility, including no horizontal overflow, readable contrast and reduced-motion support.
8. Summarize precisely what changed and what stayed the same. List any deliberate visual deviations and seek explicit product-owner signoff.
9. If an enhancement cannot fit the established visual system, STOP and propose an isolated experiment rather than redesigning the app to make it fit.

**Change approval test:** Does the new screen still instantly look like the owner-supplied Rally Point references? Does it perform a useful companion action? If either is no, the change fails.

## G. Explicitly disallowed without new design approval

- Replacing the signature story rail with a basic list, tiny thumbnail row, or generic top navigation.
- White/gray corporate cards, generic icon-dashboard template, broad minimalist simplification, flat rectangles everywhere.
- Dark burgundy gradients, neon/glowing red, color drift, font replacement, unapproved logo redesign.
- Dropping or renaming Today, Groups, Team or Read routes without a product decision.
- Recreating the church site or recap email as the app's main experience.
- Quietly replacing actual app images with stock photos or user-submitted references with lookalikes.
- Adding unverified Church Center sync, member data, attendance, prayer or pastoral follow-up integration.
- Merging / deploying either reference branch as production.

## H. Acceptance checklist

- [ ] Source branch, exact commit, target screen and scope recorded
- [ ] Three owner-provided visual references reviewed side by side
- [ ] Correct design line (v0.8 vs ALIVE) identified and its palette respected
- [ ] Charcoal/cream/red ratios and distinctive type/card compositions retained
- [ ] People circles preserved when relevant
- [ ] Same functional routes, storage keys, and role protections
- [ ] Meaningful virtual companion interaction, not just more site content
- [ ] No real/private member information in a preview
- [ ] Before/after mobile screenshots and tests provided
- [ ] No merge/deployment without explicit approval

## I. Reference integrity

- This is a **documentation/QA design lock**, not a claim of GitHub-enforced branch protection.
- The snapshot refs and **immutable commit SHAs** protect against losing the historical source even if development branches move.
- GitHub branch-protection rules / repository rulesets still need to be enabled by an administrator in Settings to prevent future accidental writes; this connector cannot configure them.
- Original user-supplied screenshots are included as byte-for-byte originals in the separate downloadable image archive; the GitHub document records their filenames and SHA-256 digests in `REFERENCE_MANIFEST.md`. The images are **not** asserted to be uploaded to GitHub.
