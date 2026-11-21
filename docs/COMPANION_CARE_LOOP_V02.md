# Rally Point — Companion Care Loop v0.2 (First Meaningful Companion Action)

**Date:** 2026-11-21. **Base:** approved and protected `Premium ALIVE Hybrid v0.1` snapshot `e1b347528526aec62309d58774c712e52c56dbf8`.

## Why this slice
Rally Point must be a personal church-life companion, **not** an alternate church website. One meaningful end-to-end action is more useful than another content screen.

## Journey (fictional / entirely local)
1. **Notice:** Today recognizes the *existing* sample Marcus C. prayer board note (only if the demo group membership is active). No inference from attendance, silence, app analytics, or real members.
2. **Suggest:** One gentle card in the existing red/cream companion section invites a check-in, with **Not now — remind me tomorrow** (about 24h local snooze). No pressure or obligation.
3. **Enable:** Check in with Marcus opens the *existing* group direct-message view and shows a concise sample context; **Suggest a message** fills an **editable draft**, which is not sent automatically.
4. **Remember:** Only an actual sample direct message save marks `companionCare.marcus.completedAt` in the existing browser-local Rally Point state. Back on Today the original card offers the next action and an understated completion memory.
5. **Resume:** Saved sample messages and completion survive refresh. No separate database, notifications, API, member data, or external messaging.

## Design lock
Preserve **the Premium Hybrid red/charcoal/cream four-screen chassis**, the ALIVE circular people rail, four main tabs, typography, route behavior, and role-only Leader Care. Tiny optional controls are added **inside existing cards**, not as new dashboard boxes or new tabs. Protected references are untouched.

## QA expectations
- Unit: nudge source required, membership gate, snooze behavior, draft not complete, save completes, reload preserves.
- Browser: real card → conversation → optional editable starter → local send → remembered Today, at 320 and 390 mobile.
- Existing: team schedule, chats, group/leader roles, Read, VersePlay, onboarding, a11y, overflow and mobile tap targets.
- Use fictional data and sample-only language throughout; never invite real private prayer requests to this fixture.

## Release / privacy
**Draft PR and Netlify preview only.** No connection to Planning Center or Church Center, no publishing to production, no merge into protected reference or into `main`. This is a companion behavior lab within the approved design.
