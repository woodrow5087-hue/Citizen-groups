# Citizen Groups · v0.4 internal review

React + TypeScript + Vite application implementing the supplied v0.4 design system. Unofficial and unendorsed, with fictional members, posts and events. Use fictional entries only: localStorage is not secure prayer or member storage.

## Run and verify

Use Node 24 (`.nvmrc`) and npm:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Vite prints the URL. The build checks strict TypeScript before producing `dist/`. Vitest/Testing Library run eleven checks; `npm run test:watch` enables watch mode. No environment variables or services are required.

## App structure

- `src/App.tsx`: typed local state/actions and navigation; refresh starts on Today.
- `src/screens/`: Today, My Group, Grow, You and the separate demo-only Leader surface.
- `src/components/`: BrandHeader, TabBar, GroupHero, ActionTile, EventCard, PostCard, GroupTabs, PrimaryPill, ActionSheet, prayer circle, initials avatars and SVG icons. Icon sizes are centralized in `Icon.tsx`.
- `src/styles/tokens.css`: approved semantic color, surface, border and radius tokens.
- `src/styles.css`: reference-derived component styles with accessibility adjustments.
- `src/data/examples.ts`: fictional fixtures and local feed mapping.
- `src/state/storage.ts`: runtime validation, date rollover and storage error handling.
- `src/assets/`: supplied Citizen flag, authorized only for internal concept review; not a license for distribution.
- `reference/`: original v0.2 source and v0.4 handoff/design-system documents; excluded from build output.
- `docs/V04-IMPLEMENTATION.md`: current decisions, differences, verification and review checklist.
- `docs/AUDIT.md`, `docs/ROADMAP.md`, `docs/MOBILE-REDESIGN.md`: earlier audit, future phases and previous mobile iteration.

## Local behavior

Today → group hero opens Feed; event and See details open Plan. The primary My Group tab preserves the selected Feed/People/Plan/Resources subtab when navigating away and back. Group tabs support arrow keys, Home and End. Grow reuses reflection, prayer and connection actions. You contains About, prayer circle, reset and explicitly labeled **Leader tools · Demo only**. There are no role permissions or real accounts.

Check-ins, prayer acknowledgements and daily rhythm reset at the local date boundary on load, window focus and once per minute. Posts/requests are capped at 12 each. RSVP, posts, requests, reactions, completed follow-ups and notes survive reload in the same browser/origin. Reactions are local and reversible. Reply explains that threaded conversations are not available and offers a standalone Share action; nothing is sent. Reset requires confirmation.

Existing v0.3 data uses the unchanged `citizen-groups-concept-v03` key; the new encouraged-post list defaults to empty for older valid saves. v0.2 and standalone reference-prototype storage are not imported. Reset clears only the app's key. Corrupt data produces fresh examples and a warning; storage write failures preserve the session with a warning. There is no cross-tab synchronization or secure encryption.

## Netlify preview

The `design-system/v04` PR targets `development/phase-1-foundation`. Review via its Netlify Deploy Preview check. Netlify reads `netlify.toml`: build `npm run build`, publish `dist`, Node 24. No URL routes exist, so no SPA redirect is necessary. No Supabase setup, backend, environment secrets or production publication is part of this work.

The supplied flag is bundled for this **internal review preview only**. Netlify preview authentication may require signing into the connected team account. Do not publish this build to production or disable preview protection without the required review and branding authorization. Uploading the project root would expose reference material; only `dist/` is build output. A manual upload does not apply headers in `netlify.toml` automatically.

Church brand permissions, privacy and security design, full accessibility review, device testing and an authorized pilot remain prerequisites for public release. See the [roadmap](docs/ROADMAP.md).
