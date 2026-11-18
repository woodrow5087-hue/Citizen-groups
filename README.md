# Citizen Groups — Daily Rhythm (unofficial concept)

A clickable mobile-first front-end prototype inspired by BuddyCheck's daily Scripture/accountability workflow, styled using the earlier Citizen Groups visual design reference. This is **not an official app** or an endorsed project from Citizen Church or BuddyCheck.

## Deploy to Netlify

1. Zip contains `index.html`, `styles.css`, `app.js`, and `icon.svg` at the top level.
2. Open https://app.netlify.com/drop and drop the ZIP file on the page. Or add the folder to a GitHub repo for continuous deployment.
3. Open the URL on a phone. No environment variables or build command are needed. Publish directory is the project root.

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
Only the root HTML, CSS, JS and SVG files are required for deployment.
For development tests, use Node 22.12 or later and run `npm ci` followed by
`npm test`. The tests drive the app's controls in jsdom with a simulated local
clock. Test dependencies are never loaded by the web app.

## Production roadmap

A real implementation will need authentication, member/group roles, private-by-default prayer permissions, backend database and APIs, user-controlled invitations, content management, real streak logic and time zones, push notifications with frequency/consent settings, and church-approved branding/assets.
