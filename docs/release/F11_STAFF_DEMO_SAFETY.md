# F-11 — Protected Staff Demo Operating Guide

**Scope:** Rally Point v0.8 staff/leader **fictional prototype only**. This work does not create real accounts, private storage, authenticated permissions or a church-approved production environment.

## What changed in the demo

- A small **STAFF DEMO** label stays visible in the app header after welcome.
- Conversation, direct message, serving-team and prayer composers offer **Insert a fictional example**. This is the preferred path for testing.
- A visible caution asks staff not to type actual member, prayer, contact or pastoral details. The demo blocks obvious email addresses, links, phone numbers, ID-like and payment-card-like strings before saving these posts. **It cannot recognize every kind of sensitive content.**
- Profile → Demo controls → **Reset demo** opens a separate, explicit destructive confirmation. The confirm action clears all Rally Point-owned localStorage and sessionStorage keys and returns to the initial animated welcome. It does **not** clear other browser apps, church services or remote accounts.
- Reset includes the main app fixture, Today preferences/onboarding, Blank Battle puzzles, leader attendance and future Rally Point achievement keys by namespaced prefix. Current app may immediately recreate fresh default keys when welcome reloads—this is expected.
- Attempts to reset when browser storage is unavailable show an error instead of claiming success.

## How to run the staff demo responsibly

1. Use only **fictional sample profiles, messages, attendance, prayer requests and serving commitments**. Do not type real church members' private information, patient details, family issues or prayer notes.
2. For messages, use **Insert a fictional example** when possible. Test the UI and workflow rather than testing the privacy detector with real examples.
3. Use Demo controls to switch between local membership/leader fixtures. These are not genuine permissions; an authorized user might be able to change browser storage.
4. Before a new staff testing session, open Profile → Demo controls → Reset demo → Confirm, then redo onboarding. Verify any previous sample message is gone.
5. Do not confuse **Post to sample group** / **Request coverage** / **Mark reviewed** with a real message, schedule or ministry notification. Nothing is transmitted to a church system.
6. Store staff observations separately using approved project tooling; avoid copying private member data into PRs, issues or screenshots.

## Verification

- `npm test`: tests ownership-scoped reset across main app, UI, session, puzzle and future achievement keys, preserving unrelated browser application keys; contact-field screening and interaction cancel path.
- `npm run test:f11`: real Chromium run with fictional sample posting and block attempts, persisted progress/role reset, return to welcome, unrelated local storage preserved, and **zero outbound demo-content writes**.
- Existing full browser/onboarding/VersePlay and accessibility checks remain required.
- F-12 compares eight before/after screenshots to the immutable approved v0.8. The **STAFF DEMO label and composer safety text are intentional small UI changes** that must be explicitly reviewed. Do **not** weaken the reference or skip checks to force a green status.

## Boundaries and upcoming gates

This is a staff-demo safety feature, not a secure release. Human judgment and training remain essential; pattern checks are not data-loss prevention. For real-member use, F-01 authentication, F-02 verified integrations, F-09 privacy-governed leader access, F-11 secure storage/retention and F-12 administrator-enforced release safeguards must be completed and explicitly approved by Citizen Church.

**Never enter actual private information into a Netlify demo preview.**
