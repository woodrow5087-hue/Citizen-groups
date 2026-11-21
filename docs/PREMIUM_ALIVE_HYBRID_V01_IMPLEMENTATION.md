# Premium ALIVE Hybrid — First Implementation Slice

**2026-11-21 | Preview only | No production merge | No real church/member data**

## Visual target
The product owner's approved *four-phone red/black Premium Hybrid rendering* is the **primary visual target**. The ALIVE horizontal circular story rail, bold expressive typography, and photographic warmth are selectively incorporated while preserving functional v0.8 architecture. Read the protected `rally-point/design-lock-2026-11-21/docs/design-lock/FINAL_VISUAL_DIRECTION_v1.md` before any future changes.

## Base
Exact v0.8 approved source commit: `84e489b86851e853948a7d4246475e83b7ddd085`. The `main` branch is **not** the working app baseline. This branch uses v0.8 as the functional foundation; it never merges into reference snapshots.

## First slice implemented
- `rallypoint-premium-alive.css`: scoped premium red/black/cream chassis, visible photo-led Today hero, responsive story rail, warm contextual prompt, My People editorial look, Team photographic update, red-led Leader Care state.
- `rallypoint-premium-alive.js`: pure markup helpers for fictional members and state-dependent companion action.
- `rallypoint.js`: small integration seams; reuses existing navigation, group direct messaging, attending, serving, prayer, reading and role checks. People circle -> fictional private local direct chat uses existing member IDs and routing.
- `index.html` and `scripts/build.cjs`: load and package the two new files.
- Tests: new companion visual helper assertions and adjusted existing layout expectations; existing v0.8 functional tests retained.

## What stays unchanged
Existing localStorage key(s), user data defaults, group direct messages, group chat, prayer, attendance, serving response, team chat, Scripture progress, Blank Battle, onboarding, basic navigation, role-scoped leader controls, reference files, protected branch settings. The primary bottom destinations are still Today / Groups / Team / Read. Leader Care lives within role-aware Groups tools.

## Deliberate prototype caveats
- People portraits are third-party stock examples already explored by the ALIVE lab, **not actual Citizen Church members**. All persons and messages are fictional.
- Hero photography is an illustrative stock image; replace with explicitly approved Citizen media for real users.
- No API connector / Church Center read-write integration is represented.
- This is an *implementation slice*, not evidence the four-phone rendering has been reproduced pixel-for-pixel. Review device screenshots before approving a merge.
- Do not suggest or run a production merge from the temporary main-targeted Netlify bridge PR if one is created.

## Acceptance tasks before approving integration
1. Build + unit tests.
2. Browser journey across 320 / 375 / 390 / 430px and desktop.
3. Before/after screenshots at equal fixtures: Today, Groups, Team, scoped Leader Care, Read. Review against **the original supplied image**, not a generated substitute.
4. Functional direct message send and reload, serving response, prayer and Scripture retention.
5. No overflow, WCAG AA and keyboard/focus states.
6. Verify user-facing demo states remain unmistakably fictional.

**No production release without explicit owner approval.**
