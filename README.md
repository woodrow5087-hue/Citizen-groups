# Citizen Groups · Connected beta foundation v0.6

React, TypeScript and Vite with the approved compact v0.5.1 design. Two explicit modes:

- **Fictional demo:** default when no backend is configured. Existing local posts, prayer requests, leader examples and Bible notes remain on the device.
- **Connected beta:** Supabase invitation-only email sign-in, group membership/roles, shared posts/comments/prayers, leader-managed gatherings and shared RSVPs. Bible reflections stay local under the signed-in account’s device key. No demo content is imported.

See [connected beta setup, security evidence and remaining limits](docs/CONNECTED-BETA.md). That document contains the single hosted setup checklist. No hosted Supabase project or production deployment was created in this run.

## Run and test

Use Node 24 and npm:

```sh
npm ci
npm run dev
npm test
npm run build
npm run preview
```

Without backend variables these commands run/build the demo. Copy `.env.example` for intentional configuration; never put a server secret/service-role key in a `VITE_` variable. The build rejects invalid live configuration and emits Netlify CSP headers for the exact configured backend origin. Keep public review previews in demo mode.

```sh
npm run beta:start
npm run test:policies
npm run test:beta:api
npm run beta:stop
```

These optional commands target only the labelled, disposable localhost Docker test stack and its fictional accounts. See the setup document for connected-browser checks and normal Supabase CLI alternatives. Run `npx playwright install chromium` and `npm run test:browser` for the existing Bible browser suite. `PLAYWRIGHT_CHROMIUM_EXECUTABLE` can point to an installed Chromium.

## Structure

- `src/App.tsx`: fail-closed demo/beta boundary; `src/DemoApp.tsx`: preserved fictional demo.
- `src/features/beta/`: email Auth gate, typed database repository, group refresh, connected screens and forms.
- `supabase/migrations/`: version-controlled schema, admission triggers, grants and RLS. `supabase/tests/security.sql`: transactional policy tests.
- `src/features/bible/`: 66-book WEBP reader and private local reflections; [text provenance](docs/licenses/WORLD-ENGLISH-BIBLE.md).
- `src/styles/` and shared components: approved dark design tokens and controls.
- `scripts/`: localhost-only test stack, schema type generation and integration/browser runners. `.beta-local/` is ignored and contains ephemeral local test credentials only.
- `netlify.toml` and generated `dist/_headers`: build and response headers. No production publication is authorized.

User-supplied Citizen branding remains provisional for internal review. Real-user beta admission requires hosted configuration verification, privacy/retention review and authorized church brand use. Local Bible storage is not encrypted and is not a secure pastoral record.
