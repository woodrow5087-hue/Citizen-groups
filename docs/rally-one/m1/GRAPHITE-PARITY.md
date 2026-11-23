# Rally One — graphite screen parity (stacked review)

## Reference and scope
Visual source of truth is **PR #104 graphite Today** (`docs/rally-one/m1/today-graphite.webp`). This is a visual-only refinement stacked on the PR #104 head, not a replacement for Today. It retains the four destination tabs and contextual Connect routing.

## Style contract
- Graphite canvas `#222120`, raised charcoal widgets `#302e2c`, restrained border `#524b44`.
- Matte Citizen-red `#c90031` for the active destination and the single lead action, not full-screen color washes.
- Warm parchment `#f4dfbd` as the lighter supporting widget, blush `#f9e0dc` for supporting CTAs.
- Editorial high-contrast headlines and rounded 17px cards; no glassmorphism, gloss, decorative icons, or new navigation affordances.
- Accessible focus outlines and reduced-motion handling.

## Destination mapping
- **Today:** untouched and remains the approved graphite reference. Existing welcome, onboarding, and Ask Rally untouched.
- **Groups:** graphite introduction and member rail, red activity/next-step feature, parchment route, charcoal member/communication cards. Group discovery retains one neutral, one graphite, one red choice.
- **Team:** graphite introduction and message widget, parchment serving schedule and join card, red RSVP/response buttons, charcoal supporting content.
- **Read:** graphite introduction, charcoal focus/question widgets, parchment Scripture/prayer, red memory game action.
- **Connect:** graphite inbox and message list cards with retained large, high-readability chat bubbles, contrasting prayer cards and Composer. The direct Wednesday Group / Serve Team routing is unchanged.

## Changed surface
New stylesheets `rally-one-graphite-parity.css` and `connect-graphite-parity.css`, link references in `index.html` and `connect-design-lab.html`, build allowlist, and static regression assertions. No app JS, authorization, data, or routing changes. Base PR #104 remains open and unmodified.

## Acceptance still required
Review the draft PR preview at 320, 390, and 430 CSS px; cover Group member and discovery, Team assigned and empty states, Read all cards and game navigation, Connect inbox at zero unread, Wednesday thread, and Serve Team room. Check mobile Safari (keyboard, safe areas, dynamic text) and VoiceOver for contrast, focus, and reading order. No production merge/deployment without approval.
