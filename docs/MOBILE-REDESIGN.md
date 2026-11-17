# Mobile app design review

This iteration evolves Phase 1 on the same development branch. The original concept remains in `reference/`; fixtures, storage format, daily rollover, local-only boundaries, modal behavior and Netlify configuration are retained.

## Interface decisions

- A compact identity bar and short screen titles replace marketing heroes. Original three-stroke artwork and hand-authored SVG line icons are defined in source; no BuddyCheck artwork, layout or branded assets were imported. BuddyCheck informed only the requested usability goals, not a visual reproduction.
- Home starts with the next gathering and RSVP, then three equally sized Check In, Share and Pray actions. Completion is shown on each action and the daily progress bar. One conversation preview replaces an unbounded duplicate feed.
- My Group brings fictional members, meeting RSVP and guide together, followed by a full-width compose action and conversation. Invitation information remains an explanatory sheet.
- Prayer offers one clear add action, readable requests and explicit acknowledgement states. No score or competitive counts are added.
- Leader uses a charcoal workspace header, fictional summary cards, full-width follow-up actions, guide and notes. It remains visible to everyone; this styling does not imply authorization.
- Shared tokens establish 20px phone gutters, 12–22px rounded surfaces, legible sentence-case text and at least 44px interactive targets. A slightly deeper provisional red (`#D90030`) improves white-text contrast while preserving the red/black/white direction.
- The four-item bottom navigation uses an active icon capsule and safe-area padding. A bounded 540px app shell keeps phone proportions on desktop. Sheets retain focus containment, return focus, Escape/backdrop closing and background inertness. Reduced motion is respected; text inputs use 16px type to avoid iPhone input zoom.

## Verification

Seven automated tests cover the existing regression cases plus the complete dashboard daily rhythm. Strict TypeScript and Vite build pass. Production-preview Chromium checks cover all four screens at 320, 375, 390, 430 and 980px: no horizontal document overflow and all visible buttons at least 44px in each dimension. Browser journeys cover check-in, sharing, prayer completion, new requests and acknowledgements, RSVP, guide, follow-ups, notes and reload persistence; no runtime page errors observed. Phone screenshots were reviewed.

The updated PR uses its existing Netlify deploy-preview integration, not a production deployment. Real iPhone Safari, VoiceOver and a complete accessibility/contrast audit remain review items; Chromium viewport checks do not establish device conformance. Long conversations can still grow to the existing local cap of 12 posts plus fixtures. No backend, account, real notification or member information is introduced.
