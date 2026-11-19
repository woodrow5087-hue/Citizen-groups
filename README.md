# Citizen Connect — reference-red leadership demo

A functional, mobile-first five-tab demo based on `main` (`33b44a9`). The supplied
reference images drive the solid red canvas, large heavy type, warm cream actions,
black cards, photo-led group and serving screens, and persistent five-tab navigation.
This is an unofficial prototype with fictional people and opportunities.

## Run, test and build

Requires Node 22.12+; browser checks also use Python 3.

```sh
npm ci
npm test
npm run build
python3 -m http.server 8000 --directory dist
```

Open http://localhost:8000. The application has no runtime framework or backend;
it retains the existing main branch's HTML/CSS/JavaScript architecture and controls.
The build creates a self-contained `dist/` directory containing only the app,
assets and review documentation. No credentials or environment variables are needed.

```sh
npx playwright install chromium
npm run test:browser
```

The browser suite serves `dist/` itself. An installed browser can be used with
`CHROMIUM_PATH=/path/to/chromium npm run test:browser`. To test a preview, set
`BASE_URL` to its deploy-preview URL. The suite only enters fictional local data.
Screenshots and measurements are saved to `.browser-artifacts/`; the reviewed
390×844 viewport captures also live in `docs/reference-review/`.

## What to click

- **Today:** Start reading; Read, Share, Memorize and Pray; the Sandia group card.
  Read is the first highlighted activity until completed. Completion updates the
  daily count and highlights the next unfinished activity.
- **My Group:** Open group reveals members, local reactions, discussion, saved
  reflections and the meeting RSVP. Back returns to the reference landing screen.
- **Read:** Read the KJV passage, complete reading, write and save a reflection,
  fill the interactive Romans 8:28 word blanks, acknowledge prayer requests,
  save a private request, and finish prayer time.
- **Serve:** Join the team saves a demo place on this device. Joined opens a
  management sheet with Leave demo team. No organiser is contacted.
- **Progress:** The cream summary and black weekly rows combine clearly labeled
  sample history with local activity. Each weekly row opens its corresponding
  activity. The header profile button opens the retained awards, history, stats,
  about and reset controls. The bell opens fictional activity updates.

Dialogs support Escape, focus trapping and focus restoration. Buttons have clear
focus styles and generous touch targets. Short press transitions respect
`prefers-reduced-motion`. Small screens scroll to expose all content; the bottom
navigation stays visible. Native safe-area insets and `100dvh` are supported.

## Local state and privacy

The existing `citizen-buddycheck-concept-v1` storage namespace, version-2 data shape,
legacy migration, local-midnight/DST rollover, completion tracking, saved writings,
prayer drafts, reactions and RSVP are preserved. Existing regression tests still
run. Team joining adds the optional `persistent.opportunities.foodDrive` field;
it survives reload and midnight and is removed by the existing full demo reset.
No old data is silently imported from other unmerged prototype namespaces.

Reflections, prayer text and actions stay in this browser's localStorage. Group
updates and requests shown from other people are fictional. Nothing sends a
message, invitation, prayer, RSVP or volunteer registration to a real person.
Historical streaks and weekly totals are illustrative and explicitly labeled.
Schedules such as “Tonight” and “Sat, Nov 22” reproduce the supplied fictional
reference content; they are not live church events. Scripture is KJV; the Today
summary is a paraphrase, and Hebrews 10:24 is quoted from KJV.

A different Netlify preview hostname has separate browser storage. Switching URLs
does not move or delete saved work on an earlier preview.

## Assets and visual fidelity

- The supplied Citizen Connect logo is preserved. CSS composites its existing
  pixels into the white-on-red header treatment, without replacing its mark.
- Sandia and small member portraits are reused from the existing design work.
- The group hero portraits and volunteer photograph use CSS apertures into the
  user-supplied high-resolution reference images. Only the photographic regions
  are displayed; headings, cards, labels, buttons, icons and navigation are real
  HTML/SVG controls. No screen is implemented as a mockup image.
- Inter Tight is self-hosted under SIL OFL; its license is in
  `assets/Inter-Tight-LICENSE.txt`. The single matte-red token is `#dc001f`;
  reference JPEGs have varying shaded reds. There are no UI background gradients.
- Branding and reference photography remain provisional for this review demo.
  Obtain church approval and approved source photography before a public release.

[Review screenshots and validation](docs/reference-review/README.md).

## Netlify preview

`netlify.toml` sets only the **deploy-preview** context to run `npm run build`
and publish `dist/`. Existing production configuration is not changed. Open a
PR from the preview branch to `main` to trigger the connected preview integration.
Do not merge or publish to production without review.

For iPhone review, append `?ntl-drawer-state=hidden` to the preview URL so Netlify's
feedback overlay does not cover bottom navigation. This is a per-tab display
preference, not a production setting change.
