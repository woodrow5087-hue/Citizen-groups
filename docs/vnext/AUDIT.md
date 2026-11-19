# Premium Experience vNext — starting point

Based on `feature/premium-hybrid-v1-demo` at `a1825a7`, on the dedicated
`feature/premium-experience-vnext` preview branch. No older application replaces it.

The active preview is a self-contained HTML/JavaScript application, not the
historical React prototype elsewhere in the repository history. It has five
destinations, an embedded official logo, four sample portraits, a serving photo,
a session-only intro, and a local persistence key `citizen-premium-hybrid-demo-v1`.
Reading, reflections, word practice, prayers, encouragement, RSVP, reactions and
serving are functional. Twelve Node regressions cover the current and archived
applications and intro. There was no build command or explicit Netlify config.

Limitations: oversized repeated headlines, one static Bible excerpt, no verse
context or history, notes automatically shown in the local group feed, hardcoded
event dates, sample progress mixed with user actions, shallow details, no focus
trap in sheets, and a single large inline application/style block.

## Reference review

The attachments available for this run are the ten Crossroads screenshots and
the previous Citizen visual concepts. No video file is attached. The useful
patterns are horizontal people navigation, distinct spiritual practices,
contextual Scripture conversations, organized content discovery, rich event
details and profile shortcuts. Crossroads assets, colors, content and layouts
are not included in the application.

The original Citizen direction uses the existing `#e6002f` logo red, warm cream,
strong compact typography and selective charcoal surfaces. No mountains are used.

## Implementation structure

- `index.html`: existing shell, branding intro and accessible app landmarks.
- `experience/styles.css`: shared tokens, components, mobile layout and motion.
- `experience/model.js`: compatible local storage, dates and connected actions.
- `experience/data.js`: fictional people, opportunities and original editorial.
- `experience/scripture.js`: bundled, attributed public-domain WEB chapters.
- `experience/app.js`: shared view components, navigation and interaction handlers.
- `scripts/build.cjs`: validates required assets and produces the static `dist`.
- `test/`: original regressions plus current model and full UI flow coverage.

## Reviewable sequence

1. Audit, brand/asset reuse, coherent data model and persistence boundaries.
2. Shared shell, Today, group and contextual Scripture/practices.
3. Serve, growth history, Explore, events and personal space.
4. Automated regressions, mobile/a11y browser checks and preview verification.

Existing legacy fields retain their meaning and key. New relationships live in a
separate versioned extension. Existing notes enter personal history privately;
sharing always requires an explicit choice. Nothing is synchronized or delivered.
