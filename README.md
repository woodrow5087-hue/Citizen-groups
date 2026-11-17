# Citizen Groups · local concept v0.3

React + TypeScript + Vite migration of the supplied v0.2 prototype. An unofficial design exploration, not a church service or production release. All examples are fictional. Use fictional text only: browser storage is neither private nor secure.

## Run and verify

Use Node 24 (see `.nvmrc`) and npm:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite prints the local URL. `build` checks strict TypeScript before generating `dist/`. Tests use Vitest, Testing Library, and jsdom; `npm run test:watch` runs them interactively. No environment variables or external services are required.

## Structure

- `src/App.tsx`: typed application state, actions and dialog content. Navigation remains local state, matching v0.2; refresh starts on Home.
- `src/screens/`: Home, My Group, Prayer and Lead view modules with typed props.
- `src/components/`: shared accessible modal and conversation feed.
- `src/data/examples.ts`: fictional fixtures.
- `src/state/storage.ts`: typed state, runtime storage validation, local-date rollover, load/save error reporting.
- `src/styles.css`: preserved prototype styles plus accessibility fixes.
- `src/**/*.test.*`: interaction and persistence regression checks.
- `docs/AUDIT.md`: source audit, migration decisions and known limits.
- `docs/ROADMAP.md`: reviewable phases and future service boundary.
- `reference/`: unchanged supplied prototype and README, for internal comparison only. Not copied into the production build.
- `netlify.toml`: production build, Node version and response headers.

## Deploy to Netlify

Run `npm ci`, `npm test`, and `npm run build` first. For a connected repository, set the base directory to this project folder (or leave it empty if this folder is the repository root). Netlify reads `netlify.toml`: command `npm run build`, publish directory `dist`, Node 24. Alternatively upload **only `dist/`** for a manual deploy; manual uploads do not apply headers from `netlify.toml` automatically. Do not upload the project root or `reference/` as a static site.

There are no URL routes yet, so an SPA redirect is unnecessary. No Supabase keys, accounts, backend or deployment were created. Review an internal deploy preview before any publication; church naming and final branding still require authorization. Netlify headers should be checked on the actual preview deployment.

## Local behavior

RSVP toggles; daily Connect, Reflect and Pray steps complete through their existing flows. Posts and requests are capped at 12 each. Prayer acknowledgements reset daily; follow-ups remain marked until reset. Notes, RSVP, posts and requests survive reload in the same browser and origin. Steps reset at the local calendar date boundary (checked on load, window focus and once per minute). Dialogs close with Escape or the backdrop, contain keyboard focus, and return focus to their opener. Reset requires confirmation.

v0.3 uses `citizen-groups-concept-v03`; v0.2 browser entries are intentionally not imported. Reset clears only the v0.3 key. Old v0.2 entries, if any, must be removed through the original demo or browser storage controls. Invalid v0.3 storage falls back to fresh examples with a warning; failed saves retain session state with a warning. No cross-tab synchronization is implemented.

The official remote logo and photo are replaced by a plain text mark and CSS background. The provisional red/black/white palette, bold headings, mobile layout and content direction remain. No official artwork is included in `dist/`; original remote references remain only in the internal source archive. No distribution license for church trademarks or supplied assets is implied.

See [audit](docs/AUDIT.md) and [roadmap](docs/ROADMAP.md) for scope and next review steps.
