# Output 3 — Ranked Foundation Backlog & Development Gates
**Rally Point foundation audit · November 21, 2026**  
**Ranking:** impact on the quality, safety, and cost of upcoming development, not an estimate of completion time.  
**Code changes in this audit:** none. All changes are documentation on an isolated audit branch.

## Priority scale

- **P0 — prerequisite:** Resolve/decide before another broad functional expansion or before connecting real church data (specified below).
- **P1 — next focused development:** Improve a single component through tested changes.
- **P2 — later:** Valuable but not an immediate prerequisite for messaging/companion architecture.
- **LIVE-PILOT BLOCKER:** Must be independently verified before any actual congregation records are used, even if a front-end prototype appears complete.

## Ranked issues

| Rank | ID / priority | Verified finding and impact | Proposed next change and acceptance gate |
|---:|---|---|---|
| 1 | F-01 **P0** | Ambiguous branch/release flow: \`main\` differs from functional v0.3; canonical PRs target feature branches while the CI workflow tests PRs to \`main\`. Each stage created a broad **never-merge preview bridge** to activate Netlify. High risk of confusing a demo build with a releasable product. | Establish **one declared canonical development branch** from audited v0.3 SHA. Configure CI/Deploy Preview for feature PRs targeting it. Demonstrate a new docs-only PR builds/tests without any bridge to \`main\`. Keep main and existing design locks unchanged. |
| 2 | F-02 **P0** | Message, shift, RSVP and read data are browser-local arrays/booleans rather than stable source records. Adding reactions, reply threading, coverage, reminders or account sync to these shapes would cause repeated rewrites. | Approve a **versioned domain model**: User, Membership, Conversation, Message, Reaction, Reply, ReadCursor, ServingShift, CoverageRequest, CompanionAction, CareTask, SourceReference. Mock adapter first, event-specific IDs and timestamps, deterministic schemas and tests. |
| 3 | F-03 **P0 / LIVE-PILOT BLOCKER** | Demo role/membership toggles control UI access via client-side \`canLead()\`. No authenticated identity or server-side permission checks are present. | Write identity, group/team membership and role-permission **authorization matrix**; explicitly define the allowed pilot cohort and minors/DM policy. No actual membership/care data until access-denial and revoked-membership tests pass at a backend boundary. |
| 4 | F-04 **P0** | UI rendering, browser persistence, route transitions and action handlers are concentrated in the ~55.9 kB \`rallypoint.js\` controller. Local message lists render separately for Groups, Team, and DMs. | Design a **nonbreaking extraction plan**: \`conversation-model\`, \`conversation-repository\`, \`conversation-view\`, \`message-composer\`, \`permissions\` and \`today-selector\`. Build adapters that preserve current DOM routes and storage until replacements are tested. Do not begin with a wholesale framework rewrite. |
| 5 | F-05 **P0 / LIVE-PILOT BLOCKER** | The companion and Leader Care can consume sample prayer/attendance data, but real definitions of attendance source, follow-up ownership, consent, escalation and retention are not approved. | Obtain a church-owned **data ownership and pastoral-care policy**: verified facts only, human review, least access, explicit task resolution and deletion. Do not derive spiritual/emotional risk from app inactivity or raw absence. |
| 6 | F-06 **P1** | Group chat is a simple vertical message list and textarea. The future-state demo has bubble/reply/reaction patterns, but only in a standalone HTML lab. | Build **one** reusable fictional Wednesday Group conversation from the approved future-state design with stable message IDs, reactions, quoted replies, sticky mobile composer, keyboard-safe viewport, pending/failed states and local persistence. Visual/behavioral signoff on iOS + automated checks. |
| 7 | F-07 **P1** | Today’s greeting + large photo hero + people strip use nearly the first 390×844 viewport; companion action is partly below it, in both v0.3 and the future-state demo. | Reallocate space **without abandoning the red/black hero or people circles**. Show one genuinely relevant action in the initial viewport on a 390×844 device; compare exact before/after screenshot and confirm keyboard/font accessibility. |
| 8 | F-08 **P1** | Browser key \`rallypoint-phase1-2026\` stores many unrelated domains; \`rallypoint-today-ui-v1\` stores UI values. Daily "read/prayed" flags persist as undated booleans; read status is based on a message-array signature, not a per-user read cursor. | Introduce a **versioned local-fixture migration** and tests that preserve old saved demo state. Date-scope daily actions; add stable event IDs and per-conversation read cursor in the mock model. Never silently discard user-entered demo text. |
| 9 | F-09 **P1** | The active app loads **12 sequential CSS stylesheets** reflecting multiple historical iterations, with evolving overrides. This increases visual regression risk during messaging work. | Extract shared red/cream/charcoal/type/spacing tokens and reusable conversation styles **incrementally**. Keep visual goldens and protected screenshots intact. No aesthetic simplification or broad CSS rewrite. |
| 10 | F-10 **P1** | Tests cover fixture journeys and Chromium/axe, with screenshots retained for 7 days. No established CI on canonical PR base, recurring versioned screenshot baseline in repo, or proof of iPhone Safari/VoiceOver. | Make preview QA first-class on canonical feature PRs; add focused conversation contract tests, goldens, failure/offline cases, mobile keyboard/WebKit and manual accessibility checklists. Preserve no-production-merge policy. |
| 11 | F-11 **P1** | README/various UI disclosures still describe "Phase 1", "v0.6", provisional branding and old sample defaults while v0.3 and future-state exist. The Spotify shortcut competes with core actions in header. | Update source-of-truth docs and demo labels; review header priorities; retain truthful sample disclaimers and avoid confusing lab interactions with live church services. |
| 12 | F-12 **LIVE-PILOT BLOCKER** | No verified real-member access to Planning Center/Church Center, no real-time messaging storage/delivery, no notification permissions or production monitoring. Explicit \`v10\` pilot config is **blocked**. | Church-authorized discovery: test exact source systems, OAuth scopes, least privilege, authoritative schedule/attendance owners and link-outs; separately select a secure messaging backend or permitted existing chat. Prove migration, rollback, support, incident and deletion flows before actual pilot data. |
| 13 | F-13 **P2** | Future-state demo’s notification interactions are simulated with browser state; real push preference and delivery states are not modeled in current app. | After authenticated messaging: define notification categories, consent/quiet hours/redaction, token registration, retry and dedupe. |
| 14 | F-14 **P2** | Multi-church extensibility, commercialization and broad content/event parity are interesting but not required to validate Citizen’s core use case. | Defer until a single authorized Citizen cohort reliably communicates and serves using a safe system. Keep tenant boundaries in schema design now without shipping a multi-church admin product. |

## Practical work order and gates

### Gate A — Project stabilization: **start here**
1. Declare canonical branch and exact commit; retain all protected design references.
2. Adjust GitHub Actions + Netlify preview settings to test the canonical branch directly.
3. Demonstrate tests/preview on one **docs-only** isolated PR, no production change.
4. Ratify a one-page module/data-owner architecture decision, signed off before UI expansion.

**Pass criteria:** Every engineer knows what to branch from, where to compare, how to run tests, and what can be merged. No PR bridge to old main is necessary.

### Gate B — Conversation architecture (without cosmetic redesign)
1. Define \`Conversation\`, \`Message\`, \`Reply\`, \`Reaction\`, \`ReadCursor\`, \`ContextAction\` contract and examples.
2. Implement local \`ConversationRepository\` adapter with versioned in-memory/fixture data; no backend, auth token or secret.
3. Write tests for ordering, sending, editable drafts, reactions, replies, idempotent retries, deletion fallback, and per-user read state.
4. Extract just the Wednesday Group conversation rendering and event behavior into shared UI modules.

**Pass criteria:** The original Groups/Team/Read/Leader screens and existing local progress behave exactly as before; a new reusable chat component consumes the new contract.

### Gate C — Messaging experience
1. Reproduce the approved future-state bubbles and accent language inside the current app.
2. Verify tap, reply, reaction, send, failure, retry, keyboard, scrolling, focus and reduced-motion behavior at 320–430px.
3. Approve real mobile screenshots before applying the component to Team or DM.

**Pass criteria:** One conversation has exceptional behavior, coherent design and passing accessibility/regression tests.

### Gate D — Today hierarchy / companion rules
1. Expose one relevant contextual next action above the fold, retaining the original hero and rings.
2. Make companion suggestions pure/testable decisions backed by source and permission metadata.
3. Confirm dismiss, no-pressure behavior, and no private member content surfaced to unauthorized people.

**Pass criteria:** A user sees what matters and can act without a website-style content feed.

### Gate E — Real-data pilot (separate authorization)
**Blocked** pending church decisions, authentication and server permission tests, verified provider integration and messaging choice, security/privacy signoff, retention/incident handling, actual device testing and authorized cohort acceptance. No schedule estimate or automatic production merge is implied.

## Recommended first change request

**F-01: Canonical branch and CI/preview cleanup — documentation plus automation only.**

The first focused development change should **not** be an aesthetic tweak. It should make the project safe and comprehensible to extend. After that, tackle F-02 (conversation data contract) before building a richer bubble UI.

## Evidence links

- [Canonical v0.3 source](https://github.com/woodrow5087-hue/Citizen-groups/tree/01cce2801a15565d34b042304758ed73d9877449)
- [Main application controller](https://github.com/woodrow5087-hue/Citizen-groups/blob/01cce2801a15565d34b042304758ed73d9877449/rallypoint.js)
- [CI workflow](https://github.com/woodrow5087-hue/Citizen-groups/blob/01cce2801a15565d34b042304758ed73d9877449/.github/workflows/rally-point-preview-qa.yml)
- [Pilot readiness config](https://github.com/woodrow5087-hue/Citizen-groups/blob/01cce2801a15565d34b042304758ed73d9877449/config/rallypoint-v10-readiness.json)
- [Future-state standalone concept](https://github.com/woodrow5087-hue/Citizen-groups/blob/eace4b617e08165341f8da5a06dd2c21965f4159/future-state-lab.html)
- [Protected final visual direction](https://github.com/woodrow5087-hue/Citizen-groups/blob/rally-point/design-lock-2026-11-21/docs/design-lock/FINAL_VISUAL_DIRECTION_v1.md)

**Audit outcome:** Continue building Rally Point; do not restart its design. Stabilize the development baseline, then deliberately extract and mature the messaging system before layering in more companion intelligence.
