# Rally Point — Fluid Today v1 · Design execution

## Goal
Bring the existing **Today** screen into the same bright Citizen-red, sculpted, layered visual language as the approved Splash / Welcome / Log In / Campus onboarding. **This is a real interface implementation, not a replacement mockup.**

## Intentional changes
- Red header and welcome canvas with matte tonal-red waves and authentic supplied Citizen flag watermark.
- Prominent personal greeting; actual device-local date.
- Immersive charcoal Up Next card with sculpted curve, bright red geometric background, compact fixture-member initials, and meaningful existing source action.
- Two contrast-driven attention panels (cream Group Update, red Serving response) that only show when the underlying fixture requires them.
- Large cream reading widget with red sculpted wave and existing Read/Reflect/Memorize entry points.
- Compact **This Week** linked event ribbon drawn from actual group/team fixture presence, not invented statistics.
- Floating dark charcoal four-tab dock, plus one raised **Quick** control that opens *working* existing conversation, schedule, and Read links.
- Retains contextual leader entry, local fixture data, and all existing controls.

## Boundaries
- **No edits** to Groups / Team / Read layouts, existing onboarding artwork, church identity, schedules, permissions, or local storage format.
- No mountain background, stock image, glowing gradients, cartoon figures, fabricated progress metrics or large all-white surface.
- Keep bright Citizen red (#E3002B), bright tonal-red layers, cream (#F3E5D6), charcoal (#242322); no burgundy/rust.
- Scope new CSS to `.is-fluid-today` so it cannot repaint other tabs. The class is applied only when Today is active.
- Existing four destination tabs remain unchanged; **Quick is an action, not another destination**.
- Use documented asset `assets/citizen-flag.svg` instead of a newly invented mark.

## Files
- `rallypoint-today-fluid.css` — complete scoped compositional redesign.
- `rallypoint.js` — Today-specific markup refinements, date, week links, quick action dialog and switchable theme class.
- `rallypoint-ui.js` — explicit plus icon for Quick button.
- `rallypoint-welcome.js` — Citizen-red status color when returning into Today.
- `index.html` and `scripts/build.cjs` — load/package the new scoped stylesheet.
- `test/rallypoint.test.cjs`, `test/rallypoint-welcome.test.cjs`, `scripts/phase1-browser-check.mjs` — regression expectations for contextual Quick control and Today theme.

## Acceptance checklist
- At 390×844 and 320×700 Today has no clipped widgets, horizontal scrolling, or hidden controls.
- Today and onboarding share a recognizably consistent **layered red / cream / charcoal / sculpted** design language; not simply color-matched cards.
- Four tabs work and Quick opens live demo destinations; leader permissions and read/member flows unchanged.
- No real member data, accounts, notifications or Planning Center access.
- The demo visibly preserves honest fictional fixture labeling.
- Run `npm test`, `npm run build`, `npm run test:browser`; inspect screenshots and browser errors before merge.
- A new Netlify Deploy Preview is requested from a branch PR targeting `main`; **never merge or deploy to production** without user approval.

## Known review step
GitHub static source checks can confirm JavaScript syntax and the Netlify build status. Full iPhone Safari visual fidelity and interactive QA still require viewing the actual preview; do not claim the screenshots were visually inspected unless they were.
