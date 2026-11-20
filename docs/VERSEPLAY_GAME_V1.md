# VersePlay — Read's interactive Scripture memory mini-game
Prototype milestone: November 20, 2026

## User goal and meeting grounding
Church leaders favored the *fill-in-the-blank, game-style memorization exercise*. This implementation gives the concept a prominent, immediately playable place near the top of Read. More ambitious real church-member friend challenges remain a **separate exploratory idea**, not an approved live feature.

## What is actually implemented
- **Solo Word Quest:** Five missing words in a KJV passage, seven chunky tiles (five right words and two distractors). Tap a tile to fill the next gap or tap a gap to target it. Tap a placed word to remove it.
- **Check:** Correct placements stay, incorrect ones clear, and the player gets constructive feedback. No forced complete reset.
- **Hint:** Places one correct word, tracked on the local *puzzle* score.
- **Finish:** An accessible completion panel with puzzle points, replay button, and a persistent personal best.
- **Pass & Play:** Two people can hand one phone back and forth for their own local attempts at the same verse. The result compares game points; it doesn't identify real people or broadcast a score.
- **Current reading:** John 15:12, James 1:22 or Psalm 23:1 follow the selected demo reading path. Bonus sample challenge uses Romans 8:28.
- **Direct discovery:** Arcade appears immediately after the Read hero; Today's reading widget offers a Play shortcut.
- **Aesthetic:** Electric matte-lime accent within an ink-dark game panel, punchy headline, 44px+ controls, playful chip drop, no neon glow. Existing red/cream/charcoal app remains intact.
- **Accessibility:** Keyboard buttons and status feedback, responsive 320px+, reduced-motion support. Automated mobile, accessibility and onboarding suites must pass before visual sign-off.
- **Persistence:** Game state and local player rounds remain in the existing fictional localStorage fixture.
- **Data:** KJV passages supplied as original/public-domain text. No external API, advertising, real scoreboards or member accounts.

## Online friend challenge: future design concept only
Possible future asynchronous flow: invite an opt-in church contact; both play the same selected verse on their own phones; compare game results privately; rematch. Must not be wired to actual members without identity, consent, privacy controls, minors safeguarding, retention/deletion, abuse/reporting limits and an authorized messaging/notification architecture.

A game's points should **never** be used to rate members' spiritual maturity or attendance. This prototype makes no such assessment.

## Review instructions
Open the PR's Netlify preview with `?skipWelcome=1`, select **Read** and play. In **Today**, tap **Play**. Under Read choose **PASS & PLAY**, complete Player 1, hand off to Player 2 and finish to see the friendly result. Try the Romans bonus.

## Scope exclusions
No real member-versus-member invitations, real account login, live leader monitoring, streaks, theology grading, or production deployment. Do not merge until visual review and regression QA.
