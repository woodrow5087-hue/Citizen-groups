# Citizen Connect — Premium Hybrid, Warm Parchment Edition

The current preview is the self-contained `index.html` on
`feature/premium-hybrid-v1-demo`. Its five screens, embedded branding/photography,
inline application logic, and localStorage behavior remain the Premium Hybrid
demo. This refinement adds a color skin, with no layout or interaction redesign.
No mountain imagery has been added.

## Palette

| Element | Color |
| --- | --- |
| Parchment center | `#FFF4D6` |
| Parchment edges | `#FFEDC5` |
| Primary ivory cards and navigation | `#FFFCF5` |
| Secondary cards | `#FFF6E2` |
| Card borders | `#EADDBF` |
| Main text | `#242329` |
| Muted text | `#686157` |
| Approved red, unchanged | `#e6002f` |

A broad two-stop radial gradient sits behind every screen. Cards use matte ivory
surfaces and restrained warm shadows. Red remains in the header, selected states,
Scripture references, progress fills and meaningful actions. Conversations and
weekly progress use ivory cards; serving information is warm white over the
existing photo. Charcoal is used for text and small contrast elements.

Red text is placed on primary ivory (4.65:1), rather than the darker secondary
paper (4.43:1). Active rhythm labels stay charcoal, with red icons/borders. Main
and muted text meet normal-text contrast against both parchment stops and cards.
Focus outlines use red on paper and ivory in the red header.

## Run and verify

No build command, backend, credentials or environment variables are required.
Netlify continues to publish the project root with the existing settings.

```sh
python3 -m http.server 8000
npm ci
npm test
```

Open http://localhost:8000. The test suite includes current inline Premium Hybrid
flows and the retained legacy `app.js` regressions. The legacy test fixture is
isolated because its DOM IDs differ from the standalone preview. No legacy
application code was changed or substituted into the current demo.

The only non-color application edit corrects the existing Serve photo wrapper
from `role="img"` to `role="group"`, so its nested Join button remains available
to assistive technology. Markup structure, image data, sizing, text and event
handlers are otherwise preserved.

## Demo privacy

People, group posts, stats and opportunities are fictional. Reading completion,
reflections, memory practice, prayer acknowledgments/notes, RSVP, encouragement,
reactions and serving commitments save locally under the existing
`citizen-premium-hybrid-demo-v1` key. Nothing is sent to another person or server.
No data migration, reset, real authentication or database has been introduced.

A preview URL is a separate browser storage origin; use the same preview URL to
retain existing activity. This change leaves stored data intact.

[Warm Parchment verification](PARCHMENT-VALIDATION.md).

Citizen branding remains provisional pending church approval. This branch is
for review only; no merge into main or production publish is authorized.

## Branded intro

A short Citizen-red intro appears once per tab session, with the existing flag
and wordmark arranged vertically. It automatically reveals Today after one
second with a 180ms fade. Tap anywhere, press Enter/Space, or Escape to skip.
Reduced-motion preference removes the fade and the underlying view entrance
animation. The intro scales to the existing phone frame and mobile safe areas.

Only `sessionStorage['citizen-connect-intro-seen-v1']` records dismissal. Demo
localStorage, completion state and all existing navigation stay independent.
Reloading the same tab skips the intro; a fresh tab session shows it again. If
session storage is blocked, dismissal still works for the current visit.

The intro is a separate bootstrap; the existing inline app script is unchanged.
While visible, the covered app is hidden and inert. Keyboard skipping moves focus
to the main content, and the browser theme color is restored after dismissal.
There is no simulated loading progress, account check or backend request.
