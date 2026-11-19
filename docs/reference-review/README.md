# Reference-red demo review

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
| 320x568 | 0 | 229px | 252px | 174px | 264px |
| 375x667 | 0 | 170px | 165px | 126px | 174px |
| 375x812 | 0 | 25px | 20px | None | 29px |
| 375x812 | 47/34px | 103px | 98px | 59px | 107px |
| 390x844 | 0 | None | None | None | None |
| 390x844 | 47/34px | 55px | 75px | 41px | 58px |
| 430x932 | 59/34px | None | 22px | None | None |
| 1280x900 | 0 | None | 10px | None | None |

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
