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


## Approved visual master — final production styling brief

The client has explicitly approved the **exact four-phone rendering**, not merely its palette or general creative direction. The screens are an authoritative visual specification. The consulting firm's responsibility is to implement their layout, text hierarchy, proportions, components, and navigation faithfully, adding only minor professional refinements that support those designs.

**Explicitly prohibited:** new marketing headers around the app, "studio concept" dashboards, unrelated UI frameworks, corporate SaaS styling, extra action buttons not in the approved composition, miniature nested phone frames on a real iPhone, oversized default SVGs, and arbitrary new navigation.

### Exact 4-screen comparison gates

1. **Today** — greeting and campus, red "Your people. Your place." feature with member photos, cream Wednesday Group message, two side-by-side gathering/serving cards, cream John 15:9–12 Read tile, black bottom nav.
2. **My People** — charcoal identity hero, one extended warm-cream group conversation card with Wednesday Group and member row, two sample conversation bubbles, prayer request and one prominent Check in button.
3. **My Team** — red "Serve together." hero, one cream next-serving card with small green confirmation chip, one dark Team Update card with a cream reply CTA. No other large action in the first serving card.
4. **Leader Care** — red hero with warm cream curved transition, 2 follow-ups summary, two member cards with compact Reach out / Mark reviewed actions, dark bottom nav. The preview-only care experience is not evidence of real permission enforcement.

On desktop: four large phones, aligned to the original artboard, without other visual content competing with them.
On iPhone: show the **full-screen app**, not a miniature phone inside a marketing site. Bottom nav is the means of switching; tap the Today profile badge to view sample Leader Care.

The approved reference is the source of truth for future changes. Existing code is subordinate to the artwork, not vice versa.

### Release honesty

The delivered experience is a **visual and functional front-end preview**, not a commercially operational application. Real authentication, member authorization, integration, messaging, notifications, secure storage and production observability remain unimplemented. This status should be explained in release notes and stakeholder communications even when the interface looks production-polished.
