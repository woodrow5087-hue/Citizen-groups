# Citizen Connect — Premium Experience vNext

A mobile-first connected local demo built from the approved Premium Hybrid
preview (`a1825a7`). It retains the five tabs, supplied official logo, brand intro,
concept photography and existing completion/storage fields. No production app,
backend, real member records or account settings are changed.

## Run, test and build

Node 22.12+ and Python 3 (for the convenience development server):

```sh
npm ci
npm run dev
# Open http://localhost:8000
npm test
npm run build
npm run test:browser
```

The browser check uses Chromium at `/usr/bin/chromium` when available. Otherwise
install it with `npx playwright install chromium`. Set `BROWSER_PATH` to use a
different Chromium executable. Screenshots and results go to the ignored
`test-results/` directory. The check serves the production `dist` build itself.

```sh
PREVIEW_URL='https://your-deploy-preview.netlify.app/?ntl-drawer-state=hidden' npm run test:browser
```

## A connected walkthrough

1. Today introduces fictional member Alex and the Wednesday Group. Open a member
   avatar, see their details and write an encouragement **preview**.
2. Read Romans 8:26–28 (World English Bible). Select a verse, highlight it, save it,
   or reflect on it. Browse ten complete offline chapters and adjust type size.
3. Save a reflection privately. It appears in personal history and Progress, and
   stays out of the group feed. Explicitly choose sharing to add it to the local
   group preview; remove that choice at any time.
4. Open Jess’s sample reflection from My Group or Notifications. Read its Scripture
   context, acknowledge it, add a local comment and return using Back.
5. Practice the five missing words in Romans 8:28. Answers remain compatible with
   saved word practice. Prayer has distinct private intentions, optional group
   previews and reversible acknowledgments.
6. View the upcoming Wednesday gathering, its guide and details. RSVP Going/Maybe.
   Dates are calculated, and the response applies to that occurrence.
7. Browse Serve by category, inspect requirements, join a demo team and manage
   commitments. Leaving reverses the commitment; its selected date is retained.
8. Explore original readings and guides, search/filter, read complete articles and
   save them. Happenings links the same gatherings and opportunities.
9. Progress shows actual local completion history, saved thoughts, prayer and care
   for others. No invented spiritual score or sample streak enters your totals.
10. Your profile contains saved Scripture, reflection/encouragement history,
    commitments, display name, reading-size preferences and reset controls.

## Structure and persistence

The **current Premium Hybrid foundation is static HTML/JavaScript**, rather than
the older React prototype in repository history. This upgrade modularizes that
working application; it does not substitute an older branch or a new framework.
There are no runtime package dependencies or required network requests.

- `index.html`: app shell, supplied icon symbols and preserved intro bootstrap.
- `experience/styles.css`: shared tokens, cards, reader, navigation, sheets and motion.
- `experience/model.js`: DOM-independent local state, history, privacy and dates.
- `experience/data.js`: fictional people/opportunities and original demo articles.
- `experience/scripture.js`: 249 WEB verses in ten complete chapters, bundled locally.
- `experience/app.js`: shared view components, five tabs, secondary routes and actions.
- `scripts/build.cjs`: syntax/asset checks and a reproducible static `dist` artifact.
- `scripts/browser-check.mjs`: viewport, accessibility and full connected-flow checks.
- `test/`: original archived regressions, Premium Hybrid flows, intro, model and UI
  tests. The historical `app.js` is not shipped or executed by this preview.

`citizen-premium-hybrid-demo-v1` retains existing activity fields. A separate
`citizen-connect-experience-vnext-v1` extension records contextual notes, comments,
highlights, bookmarks, history and preferences. Existing reflections are imported
**privately**, without rewriting storage merely by opening the app. New actions
persist both structures. No local content is uploaded. Midnight rolls daily
practices into history without deleting writings or commitments. Storage failures
show a warning while allowing the current visit to continue.

The intro retains `citizen-connect-intro-seen-v1` in sessionStorage, with one-second
automatic dismissal, tap/keyboard skip and reduced-motion support.

## Preview deployment

`netlify.toml` runs `npm run build` and publishes `dist`. No secrets, environment
variables, accounts or server functions are required. The preview branch is
`feature/premium-experience-vnext`, targeting `feature/premium-hybrid-v1-demo`.
Do not merge or publish production without approval. A new preview origin has its
own browser storage; existing notes remain at the old preview URL. Browsers
cannot read another origin’s notes.

## Privacy, assets and limits

All people, posts, opportunities, locations and notifications are fictional.
Community actions are local previews, not delivery or cross-device sync. There
is no authentication, messaging, donation/payment flow or database. Browser data
is not encrypted account storage; use fictional notes when demonstrating the app.

The supplied Citizen logo and existing concept imagery are reused under the
user’s instructions; branding remains provisional pending church approval.
Member portraits use SVG viewports of the supplied Citizen concept. Crossroads
artwork, proprietary imagery and mountain backgrounds are not included. Explore
contains original demo readings, not licensed sermons or recordings. Scripture
is attributed public-domain WEB: [sources and scope](docs/vnext/SCRIPTURE.md).

Physical iPhone Safari/VoiceOver, installed-web-app behavior and real editorial/
branding approval remain human review items. Chromium checks simulate safe areas
and reduced motion; they do not replace testing on an actual iPhone.

See [starting audit](docs/vnext/AUDIT.md), [design system](docs/vnext/DESIGN-SYSTEM.md)
and [verification report](docs/vnext/VALIDATION.md).
