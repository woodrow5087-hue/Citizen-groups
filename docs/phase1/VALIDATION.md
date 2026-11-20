# Rally Point Phase 1 — verification and comparison

Branch: `rally-point/phase1-today`. Application tested at `5e8f87e`, based on
`e70eaa5`. Later delivery commits add documentation/captures only.

## Reference fidelity and implementation

The repository blueprint and handoff were read before code changes. Both exact
provided PNGs were committed in `3f473fc` before implementation. Their hashes
match the attached originals; the master blueprint itself remains unchanged.

[Open the visual comparison](review.html) ·
[Comparison screenshot](screenshots/reference-comparison.png)

The real app follows the reference's hierarchy, proportions and component
language: compact authentic Citizen branding, warm textured canvas, confident
greeting, a large charcoal feature, contrasting paired action cards, a botanical
reading panel, defined borders and four-tab dark navigation. The desktop wrapper
also follows the charcoal/cream brand direction. Original procedural SVG graphics
and self-hosted Manrope are used; the reference montage is not an app background.

Intentional differences are explicit: initials instead of an unapproved portrait;
no simulated status bar/notch/home indicator or trademark; existing 6:30 PM group
time and John 15:9–12 selection; source dates determine whether Group or Team is
first. The reference-aligned screenshot is a real app render with Monday,
November 23, 2026 frozen as a labeled fixture date. The current-date capture was
taken November 20, when the Sunday serving commitment comes before Wednesday.

## Checks actually run

- **23 automated tests pass.** Twelve preserved Citizen Connect tests (their
  existing assertions now use the existing archive, correcting two inherited
  fixture-path failures) plus eleven tests of the active Rally Point app/model.
- **Production build passes.** Checks JavaScript syntax and required assets;
  produces the static `dist` preview without a new framework or backend.
- **Eight local browser cases pass**, testing the production artifact.
- **Deployed browser checks pass at 390×844 and 320×568**, including full retained
  flows and reload persistence.
- Netlify's PR Deploy Preview succeeded. Deployed scripts, CSS, logo, grain and
  font match byte-for-byte. The archive's original style, bootstrap/application
  blocks and embedded images match; Netlify adds its preview chrome to the HTML.
- `git diff --check` passes. The original `rallypoint.css`, archived app source and
  `premium-hybrid-archive.html` are unchanged.

| Viewport | Simulated safe areas, top / bottom | Result |
| --- | --- | --- |
| 320 × 568 | 0 / 0 | Passed |
| 375 × 667 | 0 / 0 | Passed |
| 375 × 812 | 0 / 0 | Passed |
| 390 × 844 | 0 / 0 | Passed |
| 430 × 932 | 0 / 0 | Passed |
| 390 × 844 | 47 / 34 | Passed |
| 430 × 932 | 59 / 34 | Passed |
| 1280 × 1020 | Desktop frame | Passed |

Each viewport checks the four destinations, no horizontal overflow, full nav
bounds, separation of scrollable content from navigation, exact Citizen red and
44px primary touch targets. Small screens scroll naturally rather than clipping
content. The smallest case runs reduced motion.

### Functional coverage

- Up Next ranks future Group/Team source items and handles same-day start times.
- Today links to the group conversation, gathering, schedule, Scripture or question.
- Group/team messages and prayer posts remain saved locally; composers clear after
  submission. Existing RSVP, serving confirmation/decline/coverage and interest work.
- Reading/prayer marks, leader attendance/check-ins and plan/question edits persist.
- Opening source updates and confirming availability resolves Today attention.
- Leader entry requires a fixture role, relevant membership and pending work;
  reviewing every sample entry removes it. Member attempts to open leader panes
  through injected UI actions are rejected by the demo handler.
- No-membership Today remains meaningful and its destinations are honest about
  discovery scope. Memorize is explicitly labeled Phase 2 and changes no progress.
- Dialog focus trapping, Escape/close/backdrop, source focus, name escaping,
  reload preservation, blocked storage and unrelated historical storage preservation.

### Accessibility and visual checks

No detected axe WCAG A/AA violations on the tested Today/source views and
dialogs. Contrast checks run after short transitions settle. The audit does not
replace manual reading: texture is low opacity, charcoal/cream copy has strong
contrast, the availability card uses a darker matte terracotta for legible pale
text, and red navigation/actions retain the blueprint's Citizen red. An inherited
low-contrast avatar initial and narrow-screen decorative overflow were fixed.

The supplied flag pixels are reused through an SVG luminance mask; the official
shape was not replaced with the old Citizen Connect mark or a generated C.
SVG grain/contours/architecture/leaves are original implementation graphics.
All required runtime assets are local. No missing runtime assets, cut-off nav or
uncaught browser errors were observed.

## Review captures

- [Current-date Today](screenshots/today-390.png)
- [Reference-aligned Today fixture](screenshots/today-reference-aligned-390.png)
- [Caught-up member updates](screenshots/today-caught-up-390.png)
- [No group/team fixture](screenshots/today-empty-390.png)
- [Conditional leader entry](screenshots/today-leader-entry-390.png)
- [Starting branch before changes](screenshots/today-before-390.png)

## Preview and remaining review

[Open the app](https://deploy-preview-17--citizen-connect-test.netlify.app/?ntl-drawer-state=hidden) ·
[Draft PR #17](https://github.com/woodrow5087-hue/Citizen-groups/pull/17).

All activity is fictional and browser-local. Demo role checks are not secure
production authorization; no accounts, integrations, real notifications or member
data are implemented. Groups, Team and Read retain their existing functional
prototype; their full Warm Editorial redesign and new member workflows remain
Phase 2. Existing leader tools are preserved, not newly approved attendance or
flagging policy. The current Read screen remains an excerpt, not a full Bible
reader. Giving, real schedules and messaging are out of scope.

Physical iPhone Safari/VoiceOver, keyboard/device safe-area behavior, editorial/
branding approval and the handoff's mobile-review checkbox remain human review.
No merge, production deploy, production settings change or other-PR merge occurred.
