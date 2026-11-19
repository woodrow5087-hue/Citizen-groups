# Mobile contrast demo review

Based on main `33b44a9`; a dedicated preview branch. [Open gallery](index.html).

All ten Node/jsdom tests pass (including all six existing regression tests).
The static production build passes. Eight Chromium viewport/safe-area cases pass,
covering all five tabs, the four completion flows, persisted text and RSVP,
join/leave after reload, full group details, keyboard dialogs, reduced motion,
asset/network errors, accessibility and horizontal overflow. Axe WCAG A/AA checks
reported zero detected violations on the five main screens at every viewport;
expanded group, profile, notification and all reading activity states were also
checked at 390px. This is not a claim of physical Safari or VoiceOver testing.

| CSS viewport | Insets | Today scroll | Group scroll | Serve scroll | Progress scroll |
| --- | --- | --- | --- | --- | --- |
| 320x568 | 0 | 234px | 261px | 176px | 259px |
| 375x667 | 0 | 142px | 170px | 123px | 167px |
| 375x812 | 0 | None | 25px | None | 22px |
| 375x812 | 47/34px | 74px | 102px | 55px | 99px |
| 390x844 | 0 | None | None | None | None |
| 390x844 | 47/34px | 47px | 76px | 37px | 49px |
| 430x932 | 59/34px | None | 11px | None | None |
| 1280x900 | 0 | None | 6px | None | None |

No horizontal overflow or cut-off navigation was found. Shorter viewports scroll
normally; the final content remains reachable above the persistent navigation.
Read scrolls for the full passage, reflection and activities. All navigation
buttons are at least 44×44 CSS pixels. Dialog focus trapping, Escape, restoration
and background isolation were exercised.

The reference JPEG reds vary; the app consistently uses matte `#dc001f`, warm
cream `#fff7eb` and ink `#111213`. Inter Tight 900 supplies the heavy headlines.
The supplied logo and actual Sandia asset remain in use. Group and serving hero
photos are displayed through CSS apertures into the supplied references; all UI
content and controls are native DOM elements, not screenshot hit areas.

The reference's five-tab navigation replaces the old visible navigation while
keeping its activity and local-storage logic. Existing awards, profile, history,
stats and reset remain available through the header profile control. All shared
activity and historical totals are clearly disclosed as fictional.

## Mobile contrast update

The original red token is unchanged. Charcoal content areas and cream reading,
group identity and rhythm sections reduce continuous red coverage. Fluid
headlines, compact spacing and an explicit active tab improve phone scanning.
All ten logic tests, the build and eight viewport cases pass after the update.
The four landing screens fit at 390×844 without vertical scrolling; their
interactive targets are at least 44px in both dimensions. The original activity
and persistence checks remain in the browser suite.
