# F-10.2 · Conversational Intelligence Lab v0.1

**Scope:** A deliberately limited, source-grounded expansion of Ask Rally. Review-only draft branch `rally-point/f10-2-conversational-intelligence-lab-v1`, based on the approved and integrated F-10/F-10.1 Develop commit `84703a9`.

**Review URL switch:** `?f10=2&skipWelcome=1`. **Comparator:** `?f10=1&skipWelcome=1`. The default Today view, four permanent tabs, `?f09=board`, Smart Stack `?f09=1`, Develop, and production `main` remain unchanged by this experiment.

## Why this matters

F-10.1 made the conversation continuous but supported a narrow set of follow-up phrases. F-10.2 adds useful **conversational planning** while preserving precise, inspectable source boundaries. It is not an online generative AI chatbot, a semantic language model, a real member assistant, or an integrated Church Center service.

Three natural question examples appear as compact, membership-aware horizontal chips. Users may type requests directly. Only supported phrases and recognized combinations produce guided responses; unknown questions continue to disclose the prototype's limits.

## F-10.2 behaviors

- **Get ready for Wednesday:** source-backed group date, location and RSVP; unread modern thread updates, only if available; optional Scripture. It never invents packing lists, attendance requirements or prayer obligations.
- **Get ready for Sunday:** the local Welcome Team shift, stored response status, location and an explicit confirmation button only if the user is team-member and pending.
- **Combined request:** “When is my group and my Sunday shift?” returns two distinct authorized commitments in one answer. The associated cards are separate actions. Merely mentioning “confirm” does not commit either action.
- **What remains / what can wait:** re-queries the F-09 Adaptive Today decision at answer time. Already-completed actions disappear; optional Scripture never becomes a made-up obligation. One-thing-at-a-time language presents a source-backed next real decision without assessing emotional health.
- **I can’t make Sunday / Wednesday:** conversational text cannot decline or confirm a commitment. Rally explains the current status and offers an explicit route to the relevant existing Team/Groups screen. A short “I can’t make it” can inherit a prior in-sheet group/serving focus, but that focus never confers membership.
- **Ambiguity:** F-10.1's clarifying flow is preserved for “What time?” with two plausible subjects.

## Technical contract

- The new pure `RallyPersonalCompanion.interpretNatural(query,sources,prior)` is limited to the source model from `RallySmartDashboard.model` and `RallyPriorityBoard.derive`.
- `respond()` invokes this interpreter **only when `sources.enableIntelligence === true`**, which the new `?f10=2` route supplies. F-10.1 `?f10=1` behavior is unchanged.
- Every item is explicitly scoped to currently enabled membership. No private conversation, prayer, leader check-in, event details or unread count is disclosed outside membership in guided answers.
- All statuses come from local fixture values and are recomputed on each turn. No answer is inferred from prior generated text.
- Every change still requires an explicit existing RSVP/serving button, with the same membership and pending guards. No hidden auto-action; in particular, “I can't come” does not initiate an RSVP decline.
- The existing ephemeral three-turn bounded conversation trail and source explanations persist only while the sheet is open. No network request, client-side API key, AI transcript, telemetry, new localStorage key, persistent preference or remote data.
- Answers identify the data as **fictional sample activity**. No claim that the prototype can understand arbitrary questions.
- F-10.2 retains the approved cream/charcoal/Citizen-red visual identity and the established lightweight Ask Rally entry; it adds no fifth tab.

## QA and merge gate

1. Pure unit tests must cover both flags, group/team/guest roles, explicit combined requests, up-to-date statuses, no implicit decline/confirm, malicious text escaping, and no mutation of user-supplied source objects.
2. JSDOM interaction tests must cover actual chip and typed-question flows, local RSVP sync, no extra storage keys, the unchanged F-10.1 comparator and guest isolation.
3. Playwright at 390px verifies a full guided sequence, accessibly renders the modal, checks no horizontal overflow and no WCAG A/AA violations. The existing broad 320/390/430 F-10.1, F-09, onboarding, gameplay, and Groups/messaging regression suites remain required.
4. Inspect Netlify's draft PR preview and have the owner review naturalness, usefulness and accuracy of the conversational planning.
5. **Do not merge F-10.2 into Develop or production without explicit approval for this PR.** The previously authorized F-10/F-10.1 integration is complete; this is a separate experiment.

## Next technical decision

Genuine generative intelligence would require an expressly approved server-side service, authenticated user permissions, data minimization and consent, model evaluation against real church workflows, and isolation of suggested actions from execution. Do not embed AI keys in client code or connect to personal church records in this preview.
