# Citizen Connect — Daily Rhythm (unofficial concept)

A clickable mobile-first front-end prototype inspired by BuddyCheck's daily Scripture/accountability workflow, styled using the earlier Citizen Groups visual design reference. This is **not an official app** or an endorsed project from Citizen Church or BuddyCheck.

## Deploy to Netlify

The GitHub-connected Netlify site serves the project root. Include the `assets/` directory alongside `index.html`, `styles.css`, and `app.js`. No build command is needed.

## Try the interactions

- Today: tap Read, Share, Memorize, and Pray. Completed activities update Today's progress.
- Grow / Read: scroll the KJV reading and tap Mark reading complete.
- Grow / Share: enter a reflection and save it; see it in the local Group feed.
- Grow / Memorize: select five word chips in the right order, remove an incorrect choice by tapping the blank, and Check Answer.
- Grow / Pray: acknowledge prayers, optionally write a request, and finish prayer time.
- Groups: try Celebrate/Nudge, feed reactions, and the sample meeting RSVP.
- You: explore sample achievements, history, stats and Reset.

## Technical details

Plain HTML, CSS and JavaScript, with no external libraries or API requests. Your own inputs and completion state are persisted in **localStorage**, scoped to the browser/device. Daily habits, memory practice, prayer acknowledgments and encouragement reset at local midnight. Returning to the app also checks the date. Saved reflections stay in the local group feed by date. The current prayer request, unfinished prayer draft, feed reactions and meeting RSVP persist across days. Finishing prayer saves the draft as the current request. Confirming the demo reset clears all local demo data. Existing v1 data is migrated when the app opens. Historical metrics and buddies are illustrative sample content. No other users can access what you enter. The prototype does not send notifications or connect to Church Center.

## Run and test

Serve this directory with `python3 -m http.server 8000`, then open `http://localhost:8000`.
For development tests, use Node 22.12 or later and run `npm ci` followed by
`npm test`. The tests drive the app's controls in jsdom with a simulated local
clock. Test dependencies are never loaded by the web app.

## Production roadmap

A real implementation will need authentication, member/group roles, private-by-default prayer permissions, backend database and APIs, user-controlled invitations, content management, real streak logic and time zones, push notifications with frequency/consent settings, and church-approved branding/assets.

## v0.3.10 visual review and browser checks

[Before/after Today and navigation comparisons](docs/review-v0310/README.md)
document the refinement from hybrid commit `8eea23f`. The branded header,
Sandia image, four-across habits, daily calculations, storage namespace and
existing interactions are preserved. Next Step uses the current recommended
activity's icon; Serve, the gathering and circle now have distinct treatments.

Run the browser regression suite after `npm ci`:

```sh
npx playwright install chromium
npm run test:browser
```

The suite starts its own local Python 3 server. If Chromium is already installed,
use `CHROMIUM_PATH=/path/to/chromium npm run test:browser`. It covers 320, 375,
390 and 430px widths, short Safari toolbar-sized viewports, simulated safe areas,
a desktop viewport, all five daily progress states, actual completion flows,
reload persistence, previews, RSVP, encouragement, keyboard navigation,
reduced motion and automated axe WCAG A/AA checks. Screenshots and measurements
are written to the ignored `.browser-artifacts/` directory. `BASE_URL` can point
at a deploy preview to run the same checks there; use only fictional test input.

Safe-area checks substitute the stylesheet's `env()` values in a desktop browser;
they do not replace a physical iPhone/Safari review. The app still uses native
`env(safe-area-inset-*)` and `100dvh` in normal use. Automated accessibility checks
also complement, rather than replace, assistive technology testing.

This branch remains a static prototype: there is no bundling/build step or
runtime dependency. Netlify's existing root publish configuration is unchanged.
Browser-testing packages are development-only and are not imported by the app.

## Appearance

Open **You → Demo controls → Dark appearance** to switch between the original light design and
matte charcoal surfaces. Light remains the default. The accessible switch keeps
keyboard focus when toggled, and the choice is saved on this browser/origin under
`citizen-connect-theme`, independently of activity data. It survives navigation,
reload and daily rollover. Resetting demo activities does not reset appearance.
When browser storage is unavailable, switching still works for the current page
session. No preference is sent to a server. The small `theme.js` initializer runs
before styles load to apply the saved appearance before the app is painted.

The browser regression suite checks both appearances at every viewport, including
progress-ring alignment, completion flows, persistence and accessibility. The
existing preview remains the review destination; nothing is published to production.

The appearance switch lives at the bottom of You under **Demo controls**.
You uses a Citizen-red identity/progress card and collectible shield, seal and
hexagonal award crests. Historical awards remain explicitly marked as samples;
the Memorizer award still follows today's completed practice. Award artwork is
original CSS and inline SVG, with no new image dependencies.

Run `npm run test:you` for the focused 320/375/390/430px light/dark journey checks
(all three tabs, award states, bottom controls, keyboard toggle, overflow and axe).
It starts a local Python server. `CHROMIUM_PATH` supports an installed browser,
and `BASE_URL` supports a running preview, like the full browser suite.
