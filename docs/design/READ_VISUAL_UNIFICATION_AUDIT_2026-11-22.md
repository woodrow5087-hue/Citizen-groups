# F-13 — Read Visual Unification Audit and Approval Contract

**Date:** November 22, 2026  
**Source:** Develop at b129081734cd2ca9099d3933f525a7703ac1916f, including approved Today and merged F-11 Groups / F-12 Team.  
**Status:** AUDIT-ONLY. No implementation, merges or deployment.

## Objective
Bring Read into the Today/Groups/Team visual family, while retaining the contemplative character of Scripture reading and the intentionally playful VersePlay experience.

**Primary user question:** "What am I learning, and how do I carry it into my life?"

## Evidence reviewed
- Real CI 390 x 844 screenshots from completed F-12 QA: f09-priority-board-390.png, group-connected-390.png, team-connected-390.png, verseplay-read-390.png.
- Direct code inspection on current Develop: rallypoint-read-v09.css, rallypoint-unified-v08.css, rallypoint-verseplay.css, rallypoint.js, rallypoint-memorize.js, rallypoint-verseplay-ui.js, plus approved Groups and Team unification styles.
- Approved Today, Groups and Team now have cream headers, cream canvas and light dock. Read retains full red header and hero, charcoal canvas and dark dock, plus a distinctive navy/lime VersePlay card.

## Findings and proposed treatments

| Dimension | Current Read | Proposed F-13 |
|---|---|---|
| Header | Red header with white identity | Match approved cream header, charcoal identity and white circular actions |
| Canvas | Charcoal entire screen | Warm cream (#FDF7F1), better breathing room |
| Intro | Very large full-bleed red "In the Word." | Calm cream / subtle blush editorial introduction, bold charcoal typography and small matte-red accent, preserving copy and order |
| VersePlay | Energetic black/lime "Make the words click" feature and working game | Preserve the card, lime accent, game CTA and game identity; adjust only outside margin/shadow if necessary |
| Reading path | Charcoal reading-focus card | Less visually dominant warm surface; readable and purposeful |
| Scripture | Cream card on charcoal | Softer cohesive card treatment and reading typography without changing text |
| Reflection | Intentional dark reflection/question card | Keep strong charcoal contrast with accessible light text |
| Prayer/memory | Mixed cream and red cards | Harmonize radii/elevation/spacing, preserve actions and red focus |
| Bottom nav | Dark dock, solid red selected | Match Today/Groups/Team light dock and selected Read treatment |

**Visual finding:** Read already has strong game design. The current combination of red header, massive red hero, charcoal canvas and bright lime play card creates several competing focal points. Quiet the shell and the introduction; preserve game excitement.

## Important implementation trap — game route shares Read mode

The app's rallypoint.js uses the same is-read-v09 class for both the ordinary Read screen and the in-app Blank Battle game, and adds is-play-v08 when playing. Thus a broad is-read-v09 header, main, or bottom dock rule would silently restyle the standalone game route.

**Every F-13 CSS selector must be anchored by:**

    .premium-alive.is-read-v09:not(.is-play-v08)

or a stricter Read-only descendant selector. Do not change the Blank Battle game route, its Shadow DOM, styles, controls, Back to Read interaction, or active-tab semantics. The immersive dark game experience is intentional and must remain untouched.

## Preserve without exception
- All Scripture excerpt and copyright/rights language; current reading pathways, local selections and saved progress
- Existing sequence: intro, VersePlay, other practice formats, reading path, Scripture, reflection, optional leader editor, prayer
- Existing Blank Battle and VersePlay game logic, lime-on-dark play zone and accessibility
- Group conversation links, reading completion, prayer completion and leader controls
- Today, Groups, Team and all approved states; no new interface features, login, provider connections or data migration
- Existing assets and page layout/navigation architecture

## F-13 implementation contract — NOT APPROVED BY THIS AUDIT

Base from current protected Develop after F-12, **never** from an earlier experiment, audit-only PR or pilot PR #92. Permit **exactly four** files:

1. NEW rallypoint-read-unification.css: strictly scoped Read-only CSS selectors, warm shell, calmer header/hero, coordinated supporting cards, light nav; exclude is-play-v08 route. No unscoped selectors, important overrides, external assets or JavaScript functionality.
2. MODIFY index.html: append exactly one final stylesheet link; no DOM/JS changes.
3. MODIFY scripts/build.cjs: append that single CSS filename to its allowlist.
4. NEW test/rallypoint-read-unification.test.cjs: lock approved Today/Groups/Team and existing game/read logic Git blob SHAs; enforce the exclusion of play mode; verify scope and accessibility affordances.

Forbidden: edits to rallypoint.js, rallypoint-read-v09.css, rallypoint-unified-v08.css, rallypoint-verseplay.css, game JS/CSS, blank-battle.css, app data, Today/Groups/Team styles, pilot auth/API work, or production main.

## Required QA and screenshots
- Run full unit suite, static build, mobile navigation, accessibility, onboarding, Groups/Team, VersePlay and Blank Battle game regression.
- Compare real 320/390/430 screenshots: Read initial, reading path, Scripture, reflection, prayer, memory, completed read/prayer, and leader editor; include below-fold scrolling.
- Confirm consistent text contrast, 44px+ tap areas, visible focus, no horizontal overflow, correct safe area and reduced motion.
- Compare frozen Today, merged Groups, merged Team screenshots with the exact same fixtures, viewport, date and scroll position; no visual changes.
- Compare active Blank Battle gameplay including Back to Read; **no game-route visual or functional change**.
- Only four authorized files in final diff, presented as a draft PR with screenshots. No merges until owner explicitly approves.

## Approval gate
Request explicit owner approval of the **Read-only four-file contract and calmer cream editorial intro** before implementation. After a successful preview and regression review, obtain separate approval before merging into Develop. Production main and pilot PR #92 remain untouched.
