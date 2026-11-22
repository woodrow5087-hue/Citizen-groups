# Rally Point — Phase 1 Today

Warm Editorial Today-screen prototype on `rally-point/phase1-today`, built from
the existing Rally Point application. The governing specification is
[Master Blueprint v1.0](docs/RALLY_POINT_MASTER_BLUEPRINT_v1.0.md), with the
[Phase 1 handoff](docs/PHASE1_HANDOFF.md) and exact supplied references in
`docs/assets/`.

## Run and check

Node 22.12+; Python 3 for the convenience development server:

```sh
npm ci
npm run dev
# http://localhost:8000
npm test
npm run build
npm run test:browser
```

Browser checks use Chromium at `/usr/bin/chromium` when available. Otherwise run
`npx playwright install chromium`, or set `BROWSER_PATH` to a Chromium executable.
The check serves the actual `dist` artifact and writes captures/results to the
ignored `test-results/` directory.

```sh
PREVIEW_URL='https://deploy-preview-17--citizen-connect-test.netlify.app/?ntl-drawer-state=hidden' npm run test:browser
```

Netlify runs `npm run build` and publishes `dist`. No accounts, secrets,
environment variables or production services are required. Only a PR Deploy
Preview is authorized; do not merge or publish production without approval.

## Phase 1 scope

Today now has the approved warm paper canvas, authentic Citizen flag shape,
compact identity controls, confident greeting, charcoal Up Next feature,
contrasting attention tiles, botanical reading preview and four-tab charcoal
navigation: **Today / Groups / Team / Read**. Font files are self-hosted Manrope
under the bundled SIL Open Font License. Graphics and subtle paper grain are
original SVG/CSS, not stock backgrounds or screenshots used as product UI.

Up Next ranks the existing Wednesday group and Sunday team dates. Cards open the
actual group conversation, My Schedule or existing reading/question view. The
conditional leader entry opens the original group check-in tools only for the
applicable fixture role/membership, and disappears after its pending entries are
reviewed. Today has no duplicate RSVP, schedule, conversation or reading editor.

Use **Demo controls** at the bottom or the header profile button to change the
local first name, try Member/Leader, or select Connected / Caught up / No group or
team fixtures. Scenario changes are explicit: they adjust local fixture
membership/response state while keeping messages, prayer posts, RSVP and saved
reading/leader choices. No real authority or membership is granted.

Groups, Team and Read retain the branch's working workflows and are not a Phase 2
redesign. Existing group/team messages, prayer board, discovery interest, RSVP,
serving confirmation/decline/coverage, attendance/check-ins, reading-plan/question
choices and reading/prayer marks continue to save locally. Memorize is an honest,
labeled Phase 2 preview; no fake completion or exercise is added.

The Today reading uses the existing **John 15:9–12** group selection, whose current
Read screen presents a labeled KJV verse-12 excerpt. The mockup's John 15:1–17 and
7 PM sample time are illustrative; the branch's 6:30 PM group time and selection
are retained so source views stay consistent. KJV text is public domain in the
United States. Full reader/translation/plan decisions remain later-phase work.

## Architecture and preservation

- `index.html`: existing app landmarks, updated branded shell, four-tab navigation.
- `rallypoint.js`: original local workflows, refined Today composition and source links.
- `rallypoint-today.js`: testable aggregation of source state, dates and fixture UI prefs.
- `rallypoint-ui.js`: reusable icon, contour, architectural and reading-graphic components.
- `rallypoint-phase1.css`: Warm Editorial tokens/components layered over existing styles.
- `assets/citizen-flag.svg`: mask of genuine supplied Citizen Church flag pixels,
  colored with the blueprint's provisional `#E3002B`; no invented replacement C.
- `scripts/`: reproducible static build and mobile/browser/accessibility checks.
- `docs/phase1/`: actual screenshots, reference comparison and verification report.

The current foundation is static HTML/JavaScript. No new framework, backend or
older application branch replaces it. Existing state remains under
`rallypoint-phase1-2026`; additional Today name/membership/acknowledgment preferences
use `rallypoint-today-ui-v1`. Neither Citizen Connect's historical storage key nor
its unchanged `premium-hybrid-archive.html` is migrated or reset. The archived app
can be opened from Demo controls; its existing tests remain intact.

The starting branch's old intro/Premium Hybrid tests still targeted `index.html`
and failed because Rally Point had replaced that page. Only their fixture path
was corrected to the existing archive; their assertions are unchanged. Separate
Rally Point tests cover the active app and retained workflows.

## Review and limits

[Working app preview](https://deploy-preview-17--citizen-connect-test.netlify.app/?ntl-drawer-state=hidden) ·
[Reference comparison](docs/phase1/review.html) ·
[Verification report](docs/phase1/VALIDATION.md) ·
[Implementation notes](docs/PHASE1_IMPLEMENTATION.md)

All activity, people, locations and schedules are fictional. Posts, confirmations,
coverage and interest remain local to this browser; nothing reaches another
person, real church system or notification service. Demo role guards are UI
simulation, not production authorization. Local storage is not encrypted member
storage. Use fictional content. New preview origins have separate storage.

Physical iPhone Safari/VoiceOver and user approval remain review steps. Names,
branding, scheduling, attendance/flagging and reading-policy decisions remain
provisional as stated in the blueprint. No production readiness is claimed.

### Comparing Today in the development preview

After the sample welcome flow, Netlify deploy previews and branch deploys open Today on the Priority Board. Use `?f09=legacy` for the earlier Today or `?f09=1` for Smart Stack. These URL choices last only for that visit. Ask Rally requires `?f10=1` or `?f103=1` and opens when tapped. To build the same preview locally, run `CONTEXT=deploy-preview npm run build` and serve `dist/`.
