# Rally Point — Welcome & First-Run Demo v1
**Status:** Working frontend prototype on draft PR #19. **No live accounts, authentication, data connection or production deployment.**

## Approved visual and timing
- Full-screen, matte Citizen red `#E3002B`. Subtle texture only; no mountains, gradients, glow or stock imagery.
- Reuse the repository's authentic `assets/citizen-flag.svg` flag silhouette, rendered **white**; do not draw a substitute church mark.
- White uppercase `RALLY POINT` with Manrope (existing UI font) and spaced `CITIZEN CHURCH` supporting text.
- **0.0s:** red screen; **0.3s:** flag and wordmark fade into view; **1.5s:** brand slides slightly upward while **Create Account** and **Log In** appear. Honors system reduced-motion settings.
- During this reveal, keep the entire background matte Citizen red.

## Routes in this demo
- **Create Account** → choose *I'm exploring*, *I'm connected*, or *I help lead* → choose applicable group/team connections (both allowed) + optional first name → confirmation → Today preview.
- **Log In** → existing Today sample UI for returning visitors. Actual credential entry and identity verification are intentionally NOT simulated.
- **Leader selection never grants leader permissions.** The signup demo leaves `role: member`; eventual elevated access must be verified by church-authorized identity/roles.
- Small on-screen disclaimer communicates this is fictional sample content and not a real account.

## Constraints
- Do not replace or alter the existing high-contrast Warm Editorial Today, Groups, Team or Read implementation. The new splash is an isolated overlay.
- Preserve palette v2 in the *underlying app*. The welcome title card alone is solid Citizen red.
- User's local preview preferences are stored only in existing browser-local fixtures, not sent to a backend.
- Returning within the same session goes directly to Today after entering; a new session can replay the welcome.
- Append `?welcome=1` to explicitly replay splash; `?skipWelcome=1` is a regression-test bypass.

## Validation
- Added `test/rallypoint-welcome.test.cjs` for first-run reveal, guest/connected/leader paths, non-elevation of permissions, demo login and bypass.
- Existing `scripts/phase1-browser-check.mjs` now tests the unchanged underlying Today via an explicit bypass, preserving its original regression journeys.
- `scripts/build.cjs` now includes the welcome CSS and JS and JavaScript syntax checking.
- Device screenshots and browser verification should precede merge. No CI test success or deploy should be assumed unless actually reported by the host.

**Review gate:** Human approval of actual iPhone view before merging; authentication and church-system integrations are separate future milestones.