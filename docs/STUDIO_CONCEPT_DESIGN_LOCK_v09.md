# Rally Point — Studio Concept Design Lock v0.9

## Authority of reference

The reference is the user-supplied four-iPhone **01 Today / 02 My People / 03 My Team / 04 Leader Care** agency concept board from the Nov 20 design conversation, supported by *Rally Point Product Blueprint v1.0* and *Executive Summary*.

This is a **design study, not a production architecture**. Match the composition and interaction patterns; do not copy mockup text errors or invent church data.

## Locked visual principles

- Strong Citizen red \`#E3002B\`, deep dimensional red \`#C9002C\`, charcoal \`#242122\`, warm cream \`#F4E6D8\`. Electric lime \`#DFFF00\` is **reserved for VersePlay**, not the general app.
- Bold Manrope-style editorial typography, short headings, high contrast.
- Clear sweeping red surfaces in prominent hero sections; avoid full-screen decoration, generic white SaaS boxes, full-page gradients, excessive icons or gamification.
- High-quality cream cards with subtle depth, rounded 18–25px corners, dense but legible tap targets.
- App icon / logo anchored in Citizen flag; preserve correct existing asset in \`assets/citizen-flag.svg\`.
- Bottom nav: Today, Groups, Team, Read. Leader Care is a **role-permissioned layer**, not an ordinary open member destination.

## Reference screen contract

| Screen | First-view hierarchy | Primary action |
| --- | --- | --- |
| Today | Red greeting -> red community feature -> group conversation -> next gathering/serve -> today's passage | Open your group |
| My People | Charcoal, identity-focused hero -> cream group members/messages/prayer | Check in or reply |
| My Team | Bright red Serve Together hero -> cream next assignment -> charcoal team update | Confirm / respond |
| Leader Care | Red Care for Your People hero -> permissioned follow-up summary -> cream contextual cards | Human outreach/review |
| Read (additional route) | Shared passage, discussion, optional game | Open VersePlay |

## Working click targets in this concept

1. Navigate via bottom tab bar and compact mobile screen picker.
2. Today cards open Group, Team, or Read.
3. Group demo check-in, prayer, and messaging update **only local sample state**.
4. Team demo confirm / response toggles **only local sample state**.
5. Leader follow-up cards permit review toggles but do **not** infer spiritual well-being or contact a real person.
6. Read has an optional link to the existing standalone Blank Battle implementation.

All simulated members, conversations, assignments and leader alerts are illustrative. **No real church integration, authentication, network messaging, push notifications or leader authorization is provided** by this demo.

## Fidelity acceptance gate

- Desktop width 1440px: show four distinct side-by-side device screens, no horizontal overflow, differentiated content and matching design language.
- Mobile 390px: show one phone and a natural way to switch among four states; usable tap targets and a visible bottom nav.
- No simulated claims of genuine church activity; clear demo label.
- Data changes persist across refresh only in \`localStorage\`; no app data keys overwritten.
- Visible on both light and dark OS display modes; text readable and respect reduced motion.
- Existing \`index.html\`, auth demo, main v0.8 flows, and \`blank-battle.html\` remain unchanged.
- Tests: \`npm test\` and \`npm run test:studio\`. Review screenshots from CI **before proposing more visual changes**.

## Review and change control

Get stakeholder feedback under **Visual fidelity**, **Understanding the next action**, and **What is real versus simulated**. Group related changes into one v0.9 refinement list. Do not scope-creep into user accounts, multi-church SaaS, chat backends, dashboards or extra games before approval.

## Structural caution

This code lives on \`rally-point/studio-concept-v09\` based on unmerged v0.8 work; PR #33 is cumulative against \`main\` for Netlify preview and must not be merged as a clean standalone patch.
