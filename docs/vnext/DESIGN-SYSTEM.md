# Citizen Connect — Premium Experience design system

| Role | Value | Use |
| --- | --- | --- |
| Citizen red | `#e6002f` | Existing supplied logo red, primary actions, Scripture feature, selected icons |
| Warm cream | `#fff8ed` | Main app canvas |
| Ivory | `#fffdf8` | Cards, inputs, bottom navigation |
| Charcoal | `#222326` | Type, next step, group identity, weekly overview |
| Near black | `#121315` | Scrim foundation |
| Sand | `#f2eadf` | Separators, tracks, secondary surfaces |
| Rose | `#ffedf0` | Selected states with charcoal labels and red icons |
| Muted text | `#68615b` | Supporting text on light surfaces |

No burgundy, gradients, mountains, gloss, neon or glow. A red header and daily
Scripture feature anchor Today; cream breaks up the rest of the page. Charcoal
marks the recommended action, group identity and growth overview. Small labels
on rose stay charcoal for AA contrast while keeping exact logo red for icons.

## Shared components

- System typography: compact 33–43px bold headings, 20–24px section headings,
  13–16px body; Scripture uses Georgia at 18/20/23/26px and 1.75 line height.
- Spacing: 20px page gutter (16px at 320), 19–22px modules, 12px small stacks.
- Corners: 24px cards, 16px buttons, 19px practices, 29px contextual sheets.
- Cards: ivory editorial/conversation, matte red Scripture, charcoal anchors.
- People: horizontal avatar strip, member sheet, compact feed authors.
- Activity: four-across practices, SVG completion ring, actual weekly history.
- Content: original typographic editorial art and complete reading details.
- Events: shared date tile, metadata, RSVP/commitment and confirmation components.
- Navigation: five persistent tabs, 54px+ targets, red active icon, rose selected
  background, readable charcoal labels and a small red indicator.

## Interaction and accessibility

Content scrolls independently of the header and navigation. Horizontal people and
content rails stay within their parent. Primary actions and tab targets are at
least 44px. Inputs use 16px type to avoid iOS focus zoom. Forms have labels, native
validation and readable privacy instructions.

Secondary pages use a common Back header and browser history. Sheets trap focus,
make the covered app inert, close on Escape/backdrop/Close and restore focus.
Member details, compose and chapter choice use sheets; readings, conversations
and event details use full pages. No simulated media playback, account or delivery.

Transitions take 120–250ms with gentle press feedback. Reduced-motion preference
disables animation, transitions and smooth scrolling. Top/bottom safe areas use
native `env()` values; browser checks override the same variables to test insets.

## Connected experience

Attract: a daily passage, people and an original featured reading.
Connect: Scripture context, explicit reflection sharing, comments and prayer.
Activate: one next practice, an RSVP, encouragement or a serving commitment.

The same records appear in relevant destinations. Private notes never implicitly
become group posts. Every community preview states the local delivery boundary.
