# Connect Alive v1 — interactive messaging preview

## Source of truth
This draft extends PR #106 without altering the approved graphite Today, four primary tabs, onboarding, roles, or the existing Connect/Wednesday Group conversation data model. The design is anchored to the graphite, matte Citizen red, parchment and dark navigation seen in #104.

## Implemented in this pass
- **Connect inbox:** refined headline and circle, stronger contrast, red moment-to-care widget, premium conversation cards and clearer message hierarchy.
- **Wednesday Group:** readable 17px message bubbles, properly grouped 44px reaction and reply controls, quoted replies inside messages, persistent reply-to target and cancel action using existing `replyTo` field.
- **Conversation composer:** optional small check-in prompts populate (or append to) a draft but never send automatically; existing composer and save pipeline remain responsible for sending and persistence.
- **Navigation shell:** Connect overlay follows the graphite parent app chrome, without changing current authorized routing, group membership checks, or moving chat into a second data source.
- **Accessibility:** labels, focus management for screen transitions, visible focus state, small-screen rules, and reduced-motion treatment.

## Explicit boundaries
Fictional demo messages only. No real identities, online status, typing indicator, delivery claim, push notifications, contact upload, external API, or production communication. The preview still uses an iframe with the existing safe parent bridge; this milestone improves the integrated feeling rather than claiming a full native route rewrite. No changes to production or Develop.

## QA / acceptance
- From Today open Wednesday Group; open Connect from all four destinations; return to the correct tab.
- Confirm saved draft and reply target survive leaving and reopening Connect; send reply, confirm quote; toggle heart reaction and prayer without losing the draft.
- Confirm compose prompts never send a message directly or overwrite a draft; Escape/back closes cleanly.
- Check group vs guest visibility, inbox at zero unread, Teams room entry and RSVP; test malformed saved conversation safety.
- Verify at 320px, 390px, 430px plus iPhone Safari/keyboard, reduced motion and VoiceOver. The dedicated automated tests cover the source and lab interactions; browser/device verification remains required.

Review-only Netlify deploy from a draft PR targeting `rally-point/develop` for preview. **Do not merge** until explicit owner approval.
