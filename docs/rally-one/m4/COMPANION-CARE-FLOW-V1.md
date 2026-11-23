# Rally One · Companion Connection Flows v1
**Review-only draft implementation.** Base: Groups 2.0 review PR #109. This feature does not create live messaging, church accounts, or an autonomous pastoral agent.

## Why this milestone
The November 19 leadership question was, “Once someone is in, how do we pastor them? Take care of them?” Groups, Today and Connect currently each work, but member care should form one understandable journey. This milestone implements **one complete, fictional, human-led path** using data and permissions the app already owns.

## The journey — one source, four contexts
1. **Notice on Today:** A named fictional prayer request from the existing `s.prayers` fixture produces a small, explainable `RallyCareFlow` panel *below* the existing Smart Priority Board. It does not compete with the first priority or decide that anyone is disengaged.
2. **Explore in Groups:** The same local status and original request are shown on the group overview and within Prayer & care. Viewing these is read-only: no attendance, read cursor, prayer or message is marked complete.
3. **Choose to pray:** Only the explicit `I prayed` control writes `prayedAt` into the already existing `s.companionCare.marcus` field. The next recommended action changes to an *optional* local check-in. There is no claim about a real person’s spiritual condition.
4. **Choose to connect:** A separate tap opens the existing fictional Marcus one-to-one local DM. “Use a sample starter” is an explicit optional action and never overwrites an existing draft. Only the existing Send button writes a fictional message into `s.directMessages.marcus`. The existing `completedAt` flag is preserved and now retains the separate explicit prayer mark. Back on Today and Groups, the same projection displays “You followed through” with a clear **no real delivery** notice.
5. **Choose later:** The existing 24-hour companion snooze remains available. A paused card offers Resume, but there is no background follow-up or external notification.

## Data contract and safety
- Reuse **RallyCompanionDecision**’s current named-fictional-request context; `RallyCareFlow` is a pure, deterministic display projection, not a competing recommendation engine.
- Reuse `companionCare.marcus`, `prayers`, the existing in-app group navigation, Connect's real modern thread, and the existing local *fictional* legacy one-to-one DM demo. No new storage keys, PII integrations, API calls, webhooks or AI model invocation.
- The portraits of Dustin, Mandy, Garrett, Nick, Aiden and Dom in Groups 2.0 are **visual demo images, not authenticated accounts**. The fictional Marcus scenario is deliberately separate and is **not** attributed to those photographs.
- Only authorized group members see the care panel. Non-members/guests do not see a named group prayer request or private care prompt. Never infer prayer, spiritual health, distress or risk from attendance, unread state or profile images.
- The UI must never send on opening, viewing, navigating, tapping a suggested response, snoozing or marking prayer. Text is escaped at rendering.
- This is a UX prototype, **not a pastoral-care queue, live delivery, real messaging, professional counseling, safety triage or approved church policy**.

## Visual contract
Maintain the approved #104–#109 matte graphite / Citizen red / parchment system and the Rally One flag. The new Today care card is compact beneath top priorities, while Groups gets a less prominent companion strip under existing Prayer & care, avoiding the return of stacked duplicate hero sections. No redesign of Today, messaging, profiles or the bottom navigation.

## Acceptance and testing
Automated tests cover: guest withholding, exact fixture-source provenance, escaped text, deterministic ready → prayed → paused/resumed → followed-up states, optional starter not replacing a draft, and no automatic messaging/storage calls. Playwright checks complete Today → prayer → explicit mark → draft starter → manual local send → Today/Groups status → Connect → return at 320, 390 and 430px, plus guest access and WCAG AA.

**Manual Safari / VoiceOver:** verify 390px no clipping, card placement below existing Today priorities, labels and action focus, keyboard visibility, and the complete journey; check that opening Today/Groups does not mark messages read.

## Follow-on milestones (only after owner approval)
- Serving alongside care: bring the existing Sunday response into the same explainable companion action ledger, with explicit authorization and no automated outbound messages.
- Multiple small-group contexts and safe leader review, subject to actual membership/role validation.
- Integrations: only after church leadership approves pastoral policy, consent, permissions, retention, moderation and escalation routes.

No merge to Develop/main; save an approved checkpoint only after QA and owner's visual feedback.
