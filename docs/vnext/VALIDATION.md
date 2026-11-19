# Premium Experience vNext — verification

Application source tested: `fdb46c2`, based on approved Premium Hybrid `a1825a7`.
The subsequent delivery commit adds this report and screenshots only.

## Automated checks actually run

- `npm test`: **32 passed, 0 failed**. Includes the original six archived
  regressions, two retained Premium Hybrid flows, four intro tests, ten connected
  model tests, nine current UI journeys and one Scripture integrity test.
- `npm run build`: **passed**. Validates JavaScript syntax, ten complete Scripture
  chapters and required assets, then produces eleven self-contained static files.
- `git diff --check`: **passed**.
- `npm run test:browser`: **passed all eight viewport cases**, using the built
  `dist`, not just the development source.
- `PREVIEW_URL=… npm run test:browser`: **passed the deployed app** at 390×844 and
  320×568, including the full connected journeys and reload persistence.
- Netlify deploy-preview status: **success** for the Citizen Connect test site.
  Deployed JavaScript, CSS, intro and reused image bytes match the tested source.

| Viewport | Simulated safe areas (top/bottom) | Result |
| --- | --- | --- |
| 320 × 568 | 0 / 0 | Passed |
| 375 × 667 | 0 / 0 | Passed |
| 375 × 812 | 0 / 0 | Passed |
| 390 × 844 | 0 / 0 | Passed |
| 430 × 932 | 0 / 0 | Passed |
| 390 × 844 | 47 / 34 | Passed |
| 430 × 932 | 59 / 34 | Passed |
| 1280 × 1000 | Desktop phone frame | Passed |

Every viewport checks all five tabs, document/content overflow, persistent nav
bounds, 44px navigation targets, main content separation and exact brand-red token.
The smallest width uses reduced motion. The intro also passes automatic/tap,
session/reload, keyboard and storage-fallback checks.

## Connected flows exercised

- Read completion → Today indicator and actual Progress history.
- Select verse → private highlight/bookmark → contextual reflection.
- Default-private note excluded from group → explicit sharing → local group feed.
- Shared reflection → comment → Scripture context → consistent back navigation.
- Five-word memory exercise → completion; prayer draft survives acknowledgment
  rerender → saved private intention → Pray completion.
- Member sheet → encouragement composer → local confirmation and Share completion.
- Dynamic gathering → Going/Maybe RSVP; responses bind to one occurrence.
- Serving details/requirements → join → confirmation → commitments → leave.
- Explore search/filter → complete original article → save → personal library.
- Notifications → actual reflection or gathering, with opened state.
- Profile preferences → saved display name; chapter navigation and larger text.
- Reload retains completed practices, notes, comments, bookmarks, commitments,
  RSVPs and preferences. Original fields and old notes remain accessible.
- Blocked storage gives an explicit warning and usable in-memory interactions.
- User-written markup is escaped; private notes are never silently shared.

## Accessibility and visual review

Axe reported **no detected WCAG A/AA violations** on tested primary views,
community conversation, article/event details, member dialog and completed Progress.
Screens were audited after their short entrance transitions settle. Small selected
labels use charcoal on rose to preserve contrast; the brand red itself is unchanged.
Sheets trap focus and make the background inert. Forms use real labels, native
controls and 16px input text. System reduced-motion disables animation.

Rendered screenshots were inspected for hierarchy, cropping, spacing, contrast,
nav alignment and readability. The reused sample portraits now use clean SVG
viewports of the supplied Citizen concept, rather than its earlier partial crops.
No missing runtime assets or uncaught browser errors were observed.

Current 390px review captures:

- [Today](screenshots/today-390.png)
- [My Group](screenshots/group-390.png)
- [Read](screenshots/read-390.png)
- [Serve](screenshots/serve-390.png)
- [Progress](screenshots/progress-390.png)

## Preview and practical limits

[Open the working preview](https://deploy-preview-15--citizen-connect-test.netlify.app/?ntl-drawer-state=hidden).
[Draft PR #15](https://github.com/woodrow5087-hue/Citizen-groups/pull/15).

Branch: `feature/premium-experience-vnext`. The PR targets main to use the existing
Netlify PR-preview workflow; no merge occurred. The isolated redesign starts at
`a1825a7`; the branch is built from the latest approved Premium Hybrid source.

All people and shared activity are fictional, local previews. No synchronization,
real messaging, backend, account or actual registration is implemented. Explore
offers complete original articles, not simulated video/audio playback. The reader
clearly lists ten available chapters rather than pretending to provide an entire
Bible library. New preview origins have independent browser storage; notes at
preview #14 remain there and cannot be automatically read by preview #15.

The supplied references available in this run were screenshots, not a video file.
Physical iPhone Safari, VoiceOver, keyboard/safe-area behavior on actual hardware,
and editorial/branding approval remain human review. No cross-device or backend
security validation is claimed. Production and other PRs remain untouched.
