# Rally Point — Welcome and Onboarding v2.0

Frontend demonstration on `rally-point/welcome-entry-v1`, PR #19. No authentication, backend, real accounts, or production deployment.

## Approved reference and scope

The latest [four-screen approved mockup](onboarding-v2/approved-reference.jpg) supersedes the earlier flat-red onboarding treatment in this document. It does not change Palette v2 or the underlying Warm Editorial application.

The isolated welcome overlay uses Citizen red `#E3002B`, original flowing tonal-red SVG ribbons, charcoal `#242322`, warm cream `#F3E5D6`, and the existing authentic `assets/citizen-flag.svg`. Manrope remains the existing typeface. No mountain backgrounds, substitute logos, stock buildings, or new framework.

The supplied Central, North, Maui, and Online photographs are copied unchanged into `assets/campuses/`. These are project-supplied church assets for this provisional preview; no broader distribution rights are assumed.

## Opening and routes

- **0.0s:** red canvas. **0.3s:** authentic flag and stacked wordmark begin fading in. **1.5s:** the same branding moves continuously upward and Welcome actions appear. Reduced motion shows the ready Welcome screen immediately.
- **Create Account** → Campus Selection → Connection Type → Group/Team Preferences and optional name → Today demo.
- **Log In** → Login Preview → explicitly labeled **Enter Existing Today Demo**.
- Campus Selection keeps the wide Central panel, North/Maui pair, dark Online panel, and sculpted cream Continue action. Selection changes the border/check treatment without changing card dimensions.
- Change campus later from **Profile and demo controls → Campus preference**.
- Exploring / Guest does not require membership. Group Member / Serving Volunteer and Group or Team Leader may choose both group and team.
- Choosing **Leader never grants permissions**: finishing onboarding sets the existing demo role to `member`. Existing leader tools remain separately available through the original fictional demo controls.

## Honest authentication preview

The email and password controls are read-only, fixed sample values (`alex@example.test`, `demo-only`). Password visibility works only on that sample. There is no submitted form, credential persistence, network authentication, or success claim. Log In is disabled and labeled unavailable. Forgot Password explains that recovery is unavailable. Apple and Google are described as unconnected rather than offered as fake sign-in buttons. The separate Today demo action uses the existing local application.

These deliberate differences from the login mockup enforce the approved no-real-authentication scope.

## Persistence and privacy

- Keep existing keys: `rallypoint-today-ui-v1`, `rallypoint-phase1-2026`, and `rallypoint-welcome-preview-session`.
- Store `campus` plus `onboarding: {version: 2, connection, completed}` in the existing UI record, alongside existing name and membership preferences.
- Merge preferences without discarding posts, prayers, reading progress, RSVP, attendance, team state, or the archived Citizen Connect record. No church record is changed or uploaded.
- Reload the existing app after saving preferences so its closure-based state cannot overwrite the newly saved fields. Campus-only edits preserve the existing demo role and other preferences.
- Blocked/corrupt storage produces an explicit error and an **Enter demo without saving** route. Corrupt records are not silently reset by onboarding.
- Within the same tab session, entry is skipped after visiting Today. A new session can replay the opening. `?welcome=1` explicitly replays it; `?skipWelcome=1` bypasses it for regression checks.

## Accessibility and mobile behavior

The opening is an accessible modal overlay. Underlying app regions are inert while onboarding is open; keyboard focus stays within the overlay. Headings receive focus after navigation; controls have explicit labels, selection states, and at least 44px touch targets. Safe-area variables are reused from the existing app. Short screens scroll instead of clipping fields or actions. Motion honors `prefers-reduced-motion`.

## Run and verify

```sh
npm ci
npm test
npm run build
npm run test:onboarding
npm run test:browser
npm run dev
```

Open `http://localhost:8000/?welcome=1`. Browser checks use `/usr/bin/chromium` by default; set `BROWSER_PATH` if needed. Set `PREVIEW_URL` to run the same checks against a deployed preview. Reports and actual 390×844 screenshots are written to `test-results/onboarding-v2/` (not committed automatically).

The static Netlify configuration remains `npm run build` → `dist`. Pushing this branch updates the existing PR #19 Deploy Preview; do not merge or deploy production. Review the [implementation report and screenshot comparison](onboarding-v2/README.md) before approval.
