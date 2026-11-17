# Citizen Groups v0.5.1 — Compact, app-first navigation

## Design objective

The first five seconds on each main tab should reveal what the screen is for and the actions that matter without requiring discovery-by-scrolling. The design does **not** hide information behind inaccessible controls, force a fixed viewport height, or prevent natural scrolling when people enlarge text or use a smaller phone.

## Changes

- **Today**: one-line greeting, compact group hero, Check in / Share / Pray action tiles, condensed gathering card, and a single-line latest group update with working local Encourage and Go to feed actions. The full post and interactions remain on the Group Feed.
- **My Group**: tighter one-line heading and member strip. Feed remains scrollable; People, Plan and Resources are not buried below stacked overview cards.
- **Grow**: featured daily Scripture and Open Bible remain prominent. Today's rhythm is a compact three-action strip; saved reflections and Bible attribution stay accessible in an expandable section.
- **You**: smaller profile header, smaller stats, and compact tools; no features removed.
- **Bible reader**: optional collapsible controls for book/chapter and font preferences, so a reader can devote more visible space to Scripture.
- **Responsive**: short-phone-height and 320px-wide overrides without hard clipping; 44px tap targets remain the target.

## Retained behavior

All v0.5 reader data and private reflections; 66 World English Bible books; daily readings; selection, completion, chapter navigation; demo share preview only; group RSVP, feed, encouragement, prayer, guide, leader tools, notes, reset and local persistence. Existing brand asset remains an unofficial internal-use reference.

## QA

Run `npm ci`, `npm test`, `npm run build`. On iPhone Safari, inspect Today/Grow/You for unnecessary vertical scrolling at normal text size, then test accessibility zoom and a smaller phone. Scrolling is allowed for the feed, Bible chapter, expanded reflections, and enlarged text. Test Check in, Share, Pray, Group Feed, RSVP, Grow → Open Bible, selections, font controls, reset and persistence.

## Branch and deployment

This branch was created from `feature/bible-v05` (PR #3) and opened as a **comparison preview** against `design-system/v04` to use the already enabled Netlify preview target. It includes both Bible v0.5 and compact v0.5.1; **do not merge PR #3 and this PR independently** without deciding on a single sequence. No production code has been changed.
