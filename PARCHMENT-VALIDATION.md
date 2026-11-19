# Warm Parchment verification

Applied directly to `feature/premium-hybrid-v1-demo`, based on Cream Edition
commit `c658099`. No other branch's application or visual design was imported.

The active application is the inline script in `index.html`. A source comparison
confirms unchanged application logic, storage code, embedded images and document
structure. Only a Serve ARIA role changes within the script; styling is appended
as an isolated Warm Parchment block. Existing dimensions and spacing are retained.

The original six `npm test` regressions initially failed because they loaded
legacy `app.js` against the new inline demo's DOM. Their original assertions are
retained; a minimal legacy-shell fixture now supplies the IDs that app expects.
Two new tests exercise the actual Premium Hybrid inline app, including all four
completions, five destinations, prayer, reflections, RSVP, serving and reload
persistence. The full eight-test suite passes.

The Serve wrapper previously used `role="img"` while containing a Join button.
It is now a labeled group. This fixes the nested-interactive accessibility warning
without changing the photo, markup hierarchy, controls or behavior.

Palette contrast checks: approved red against primary ivory 4.65:1; muted text
against the darker parchment edge 5.29:1; charcoal text against parchment center
14.22:1. These text colors also pass against the other paper surfaces. Red on
secondary paper is restricted to non-text icons/borders (4.43:1); small active
labels use charcoal.

Native Safari and assistive-technology review remain device checks. Browser
checks use Chromium and simulate safe areas; automated accessibility checks
complement manual contrast analysis for the radial gradient.

## Browser verification

All five screens passed before/after geometry comparison at these seven settings:

- 320 × 568
- 375 × 667
- 375 × 812 with simulated 47px top / 34px bottom insets
- 390 × 844
- 390 × 844 with simulated 47px top / 34px bottom insets
- 430 × 932 with simulated 59px top / 34px bottom insets
- Desktop 1280 × 1000

The bounding boxes of every direct screen module match the Cream Edition
baseline within 0.1 CSS pixels. No horizontal overflow or cut-off bottom
navigation was found. All seven cases exercised reading, reflection saving,
memorization, prayer acknowledgment/notes, RSVP, reaction and serving join/leave,
then verified persisted state after reload. Completed reading states and group
dialogs were also exercised at 390px.

Axe WCAG A/AA checks reported no detected violations on all five fresh screens at
every size and on the completed reading/activity states. Gradient-related
contrast checks that require manual review are covered by the explicit palette
contrast calculations above. This does not replace physical Safari/VoiceOver review.
