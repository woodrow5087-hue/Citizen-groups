# Rally Point — Final Visual Direction v1.0
**Working name:** Premium ALIVE Hybrid  
**Date:** November 21, 2026  
**Status:** Owner-selected target direction; documentation decision only. **Not** implementation, new design, merge, production approval, or authorization to access member records.

## Decision in one sentence

> **Preserve the red-and-black four-screen Premium Hybrid concept as Rally Point's PRIMARY visual/product template. Apply selected ALIVE visual energy and the signature people-circle interaction *within* that template. Build an active, personalized church-life companion—not a mobile church website.**

This decision clarifies the order of precedence in `RALLY_POINT_VISUAL_SPEC_v1.md` without changing the source images or code. It is an **art-direction priority**, not a claim that the four-screen illustration already exists as functioning code.

## 1. Design authority / order of precedence

1. **PRIMARY — the owner's four-phone Premium Hybrid concept image:** `references/01_premium_hybrid_four_views.jpeg` in the original-image download archive; design identity for **Today, My People, My Team, and Leader Care**. Its striking matte red / charcoal / warm cream, polished phone-app shell, functional action cards, decisive typography, and precise bottom navigation are the defining visual target.
2. **SECONDARY — the owner's ALIVE people/profile screenshot:** `references/02_alive_people_story_rail.jpeg`; authority for a highly visible, horizontally swipeable **Your People** row with circular individual photographs, colored rings, and labels.
3. **SUPPORTING — the owner's ALIVE four-screen editorial concept:** `references/03_alive_four_screen_storyboard.jpeg`; inspiration for expressive headings, the alternate italic emphasis, genuine photography, varied compositions, and distinctive Daily Rhythm/Read micro-experiences.
4. **CODE BASELINES — two preserved independent implementations:** approved v0.8 commit `84e489b86851e853948a7d4246475e83b7ddd085`; isolated ALIVE × Citizen v02 concept `1da3bab388f85010e541b4ecb3c441b4431c5b81`. Neither automatically replaces the other. The 4-phone design is **a reference illustration, not a finished code screen**.

If there is a visual conflict, prioritize the four-phone PRIMARY reference; document specific intentional deviations for owner review. Never assume both visual designs should simply be merged wholesale.

## 2. Preserve from the PRIMARY four-screen red/black template

- **Overall product chassis:** compact branded header, assertive red hero/headline zones, confident dark charcoal contrast, warm cream action surfaces, premium polished cards, persistent dark bottom navigation with a vivid red active state.
- **Four screen identities:** Today / My People / My Team / Leader Care remain clearly recognizable. These are conceptual experiences; the working app's functional bottom navigation stays **Today / Groups / Team / Read**, with **Leader Care** accessible by authorized role. Do not turn Leader Care into an unsolicited public fifth tab.
- **Action-first hierarchy:** next gathering, relevant person, serving commitment, or Scripture activity should be understandable without browsing a long information feed.
- **People-centered photos:** photos within major hero/community cards; retain human warmth and legibility rather than substituting generic illustration or architecture everywhere.
- **Visual mass:** ample use of brand red/black. The dark and red regions are essential structural surfaces, **not tiny accents pasted onto a mostly cream or white page**. Cream gives breathing room and readability; do not let it wash out the app.
- **Finish:** clear borders/shadows, intentional rounded silhouettes, strong visual alignment, mature restrained iconography, tappable controls, and comfortable mobile spacing.

Use the code-backed v0.8 Citizen red `#E3002B`, charcoal `#242322`, warm cream `#F3E5D6` when developing from v0.8. The ALIVE lab has distinct code tokens; preserve them in its frozen reference rather than changing them without an explicit transition plan. Do not infer all exact colors from a compressed screenshot.

## 3. Selectively bring from ALIVE

**Required:**
- The **Instagram-like Your People circles** become a signature feature. Horizontally scrollable, appropriately sized, authentic-feeling portraits, readable names, distinct ring states, clear tap targets. They belong near the top of **My People** and as a compact context-appropriate module on **Today**.
- Retain **editorial energy**: selected large Manrope headlines, controlled Georgia italic emphasis, varied card sizes, layered photo treatments, expressive crops, tasteful graphic accents.
- Retain **Daily Rhythm / Read / VersePlay personality**, but fit it into the primary app architecture rather than building a separate competing editorial homepage.
- Real Citizen photography may add warmth in approved placements, subject to permission and correct labeling.

**Not automatically imported:**
- ALIVE's nearly full-page charcoal experience on every screen, experimental giant feature tiles everywhere, bright orange / teal / lime as competing brand-dominant colors, novelty icon stickers, or its separate navigation structure.
- A long sermon / campus / announcements feed. These are supporting context, not the primary app.

**Specific observation from screenshots:** PR #53's story row places **This week, Central, North** beside **My group**. Retain campus and weekly stories where relevant, but **do not allow promotional or place tiles to replace the signature row of *people*** (named friends/group members). If we need both, create clearly differentiated **Your People** and **This Week at Citizen** rails. Demo members stay fictional, never implied to be real congregants.

## 4. Unified screen-level art direction

### Today
Red-led personal greeting / hero, premium dark + warm action cards, a visible compact Your People rail, one recommended next action, contextual gathering/serving/reading status. Do not stack the entire weekly email on Today.

### My People (Groups)
The most recognizable people-first screen: charcoal or red header, round person/profile rails, prominent group card, short conversation/prayer context, one-tap check-in, approachable privacy-conscious participation. Maintain the first reference's polished cream cards and bold headline. No public attendance judgments or private prayer disclosures.

### My Team (Serve)
Bright red branded hero, clear next serve/date, confirmation state, team messages, schedule and reply entry points. Preserve the effective first image's strong red/cream/dark action hierarchy; never imply a real schedule writeback in demo mode.

### Leader Care (role-gated)
Preserve the red-led "Care for your people" identity and simple person-centric follow-up cards. Leaders can privately review authorized care tasks; no surveillance scoring, attendance auto-inference, or making private needs public.

### Read / Daily Rhythm / VersePlay
Available from the **Read** functional tab and appropriate contextual cards. Keep the fun, colorful, expressive READ THIS / Pray visuals *as subordinate distinct experiences*, not as a visual takeover of the red/black shell. Preserve VersePlay functionality and saved progress.

## 5. Companion-first feature rule

Rally Point should behave as a **supportive personal assistant**. In design and interaction, favor:
- **Notice / remember:** opt-in context on upcoming group gatherings, serving slots, readings and explicitly shared prayer intentions.
- **Offer a relevant next step:** confirm a shift (only if integrated), check in with a person, reflect on Sunday, read a passage.
- **Enable the action:** a small sheet, modal, or existing card makes the action easy without navigation detours.
- **Respect agency:** gentle prompts, dismissible recommendations, no pressured streaks or unsolicited emotional assessments.

Example fictional prototype journeys:
1. **Today → Your People → Mark → Send encouragement → optional follow-up saved**. Preview data must be fictional and clearly marked.
2. **Today → Your upcoming serve → See team update → prepare/respond**, with sample-only or verified external link semantics.
3. **Today → Today's Scripture → Read/VersePlay → progress retained locally** without breaking existing v0.8 storage.

The companion is not automatically a giant AI chatbot. Website, Church Center, sermons, events, Sunday recap and campus photos are optional supporting inputs or links, not a duplicate church website.

## 6. What must NOT happen

- **Never replace the four-screen red/black template** with a mostly cream editorial page, generic church website feed, or rows of white dashboard rectangles.
- Never push the authentic people circles below a long promotions/campus story strip, or replace individual profiles with mostly buildings and announcements.
- No brand drift toward burgundy, neon reds, grayscale corporate motifs, random image generation, or unapproved font/logo changes.
- No unapproved redesign of Team, Leader, Groups, Read, onboarding or navigation.
- Do not merge ALIVE PR #53 into approved v0.8, alter `main`, or publish production merely because the visual direction is now clarified.
- Do not imply data synchronization, real member identity, prayer records, leader case management, or Church Center privileges without church authorization.

## 7. Execution directive for the next Codex task

**Phase A — no-code screen reconciliation and visual review**
1. Place the original Premium Hybrid four-screen image beside ALIVE screenshots and present a **single proposed hybrid four-screen storyboard** using the PRIMARY layout and SECONDARY details (especially Your People).
2. Record a per-screen **keep / borrow / do-not-change** decision table.
3. Ask for owner approval of *the visual target* before implementing code. Do not generate a different art direction.

**Phase B — isolated companion prototype**
1. Branch from the **specific intended source branch**, never blindly from `main`. Keep approved v0.8 and both reference branches intact.
2. Implement ONLY the approved Today / Your People companion slice with fictional data. Preserve every unrelated route/CSS/storage key.
3. Capture BEFORE/AFTER screenshots at matching 390×844 and 430-wide viewports (also 320 mobile), test navigation, interactions, visual regression, a11y and responsive overflow.
4. Report exactly what was changed, how the signature red/black chassis survived, and any deviations for owner review.
5. Preview PR only. **No merge or production deployment without explicit approval.**

## 8. Design acceptance criteria (binary gates)

- [ ] Four-phone Premium Hybrid immediately recognizable as the primary source
- [ ] Red and charcoal still occupy major visual regions; warm cream is not dominant everywhere
- [ ] Instagram-like individual profile circles visible and useful
- [ ] Bold editorial ALIVE personality present without taking over the app architecture
- [ ] Today / Groups / Team / Read working routes intact; Leader Care role-aware
- [ ] At least one complete, optional, meaningful companion action
- [ ] Screens visually coherent at mobile widths; no generic app or website-clone drift
- [ ] Existing function/progress preserved
- [ ] Original owner reference images used, no invented substitutes
- [ ] Separate preview, no automatic production merge

**Short version for the team:** `Premium Hybrid is the chassis. ALIVE is the personality. The companion is the purpose.`

## 9. Relationship to existing locked documentation

This document **clarifies creative priority** within `docs/design-lock/RALLY_POINT_VISUAL_SPEC_v1.md`. It does not change historical source commits, replace original images, authorize a merge, or invalidate security/integration rules in D-10. It preserves D-11's Warm Editorial palette rule *for that implementation variant* without retrospectively recoloring the ALIVE lab's reference. A subsequent visual implementation should explicitly reconcile the intended target variant's CSS and palette before edits.
