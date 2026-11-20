# Approved Onboarding v2.0 — implementation review

The four-screen reference is implemented in the existing Rally Point application on `rally-point/welcome-entry-v1`, PR #19. This remains a local demonstration with no real accounts, password submission, backend, or production deployment.

## Actual screens and direct comparison

Open [the reference and implementation comparison](comparison.html). Screenshots below are full-size 390×844 Chromium captures of the application, with normal animation enabled and the default unselected campus state. They are not illustrations or mockups.

| Splash | Welcome | Log In preview | Campus Selection |
| --- | --- | --- | --- |
| [Actual screenshot](01-splash-390.png) | [Actual screenshot](02-welcome-390.png) | [Actual screenshot](03-login-390.png) | [Actual screenshot](04-campus-390.png) |

The original [approved reference](approved-reference.jpg) is preserved unchanged. All four supplied campus images are present, copied unchanged. See `assets/campuses/` at the repository root.

## Implemented flows

- Timed splash → continuous brand lift → Welcome, with immediate ready state for reduced motion.
- Create Account → campus → connection type → group/team preferences → Today.
- Both memberships can be selected; choosing Leader does not grant leader access.
- Local name, campus, memberships and onboarding preferences survive refresh and subsequent app actions.
- Profile and demo controls expose campus editing later, preserving existing app records and role.
- Log In shows locked sample fields, working sample password visibility and truthful recovery messaging; a separate labeled route opens the existing Today demo.
- Back, focus containment, selected states, disabled actions, storage-error messaging, and an unsaved fallback.

## Verification performed

- `npm test`: **33 passed, 0 failed**, including existing application and archived demo regressions.
- `npm run build`: passed; required branding, photography and SVG background assets checked.
- `npm run test:onboarding`: passed at **320×568, 375×667, 390×844, 430×932, 390×844 with 47/34px safe areas, and 1280×1020**.
- Onboarding WCAG A/AA axe scans passed on Welcome, Login, Campus, Connection and Preferences at those sizes. No horizontal overflow; active touch targets measured at least 44px. Campus selection retains card geometry.
- Existing Phase 1 browser suite passed at **320×568, 375×667, 375×812, 390×844, 430×932, two safe-area cases and desktop**. Original messages/prayers, RSVP, serving, leader tools, reading, persistence, focus and storage fallback remain functional.
- Main application JavaScript, Today model, shared UI module, both application stylesheets, and `netlify.toml` remain byte-for-byte unchanged from the starting branch.
- Browser reports are included beside these screenshots. Automated browser checks emulate iPhone dimensions; a physical iPhone/Safari review remains appropriate before merge.

Pre-existing regression helpers matched every `[role="dialog"]`, including the welcome overlay. They now explicitly target `#dialog-root` for application dialogs; their behavior assertions are retained.

## Intentional differences from the mockup

- No decorative phone bezel, fake status bar or notch is drawn. The real device supplies those; the app respects safe areas.
- Flowing red artwork is recreated as original SVG geometry, rather than stretching the screenshot into the app. The exact existing Citizen flag is reused.
- Login fields display locked samples and the action is disabled. Unsupported Apple/Google entry points are described as unavailable, rather than rendered as fake working sign-in buttons. The explicitly labeled Today demo action adds space to this screen.
- Small prototype disclosures remain visible. Campus card crops follow the supplied actual photographs rather than reproducing alternate building crops from the composite reference.
- Very short displays scroll to keep every control reachable. Authentication and real permissions require a separate implementation phase.

No merge or production deployment is authorized by this change.
