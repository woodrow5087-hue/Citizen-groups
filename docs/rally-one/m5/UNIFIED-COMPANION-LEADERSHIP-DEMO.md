# Rally One · M5A–M5C — unified companion and complete member journeys

**Status:** Review-only implementation and leadership demonstration reference. **Do not merge** to Develop or main without owner approval.

## A — Preserve the working design
- Saved a **named reference branch** pinned to PR #110's successful deployed source SHA `7c9bee93b5a5c73ac36f6702112b69376444d852`:
  `rally-one/checkpoints/2026-11-23-groups-companion-review-baseline`
- That baseline includes approved charcoal / Citizen red / parchment design, Groups 2.0, the six user-supplied real photographs, the safe portrait preview for all onboarding paths, Connect Alive and the original fictional Companion Care flow.
- The new work is isolated on `rally-one/m5-unified-companion-member-journeys`. No existing preview, production, canonical messaging source or baseline branch is modified.
- Browser QA passing does not equate to physical iPhone Safari / VoiceOver acceptance or permission to publish user-supplied photos more broadly.

## B — One contextual companion, inside the existing Today Priority Board
**Decision:** Do not create another Today card, another tab or another storage system.

`RallyUnifiedFocus.focus()` is an explainable **read-only** projection over:
1. `RallyPriorityBoard.derive()` and `RallySmartDashboard.model()` (group RSVP, modern authorized unread status, serving response, opted-in leader fixture follow-ups, due saved Scripture intention);
2. `RallyCareFlow.derive()` (explicit saved *fictional* Marcus prayer request and human-marked prayer/check-in state);
3. membership, permission, and state already present in the existing local fixtures.

It chooses **one existing primary Priority Board hero and up to one supporting row**. The rest of Today at a Glance remains a read-only status digest. The earlier separate care widget is **removed from Today only**; the care path remains in Groups and Prayer.

### Ranking / honest semantics
- Respect near-term group gathering (within 24 hours) and serving assignment (within 48 hours) ahead of ordinary informational updates, using the approved board's existing urgency windows.
- Pending service/group commitments, unread message source, authorized leader fixture follow-ups, and explicit prayer opportunities all compete as **source-backed tasks**; ties are stable and categories are deduplicated.
- When you RSVP, confirm serving, actually open the canonical Connect conversation, mark a prayer, or mark a leader check-in reviewed, the next projection changes. Merely viewing Today/Groups never silently completes them.
- When no response is needed, keep the existing board's calm/visitor presentation. Inviting someone to explore is **not counted as an overdue task**.
- Users can always choose to ignore the suggestion. No inferred disengagement, attendance-based spiritual score, AI-driven outreach, message scraping, recommendation telemetry, contact harvesting or unsanctioned leader access.
- Existing `RallyCompanionDecision` and `RallyPersonalCompanion` / Ask Rally remain the same; this is a unified *display policy* around existing features, not a competing LLM or second messaging database.
- Local, fictional data only. The six real portrait images are visual references for the prototype, not real authenticated contacts.

## C — Four complete member journeys

| Demo role | Starting context | Rally's highest relevant action | Human action and result | Permission boundary |
|---|---|---|---|---|
| **First-time visitor** | No group/team | Welcome and explore community | Browse public demo people circles and Team discovery | No group chat, named prayer or leader care |
| **Small-group member** | Wednesday Group RSVP, unread modern messages, sample prayer | Near-term group RSVP, then actual group conversation, then optional prayer | RSVP explicitly; open Connect to mark read; optionally pray and draft a separate personal check-in | Read cursor updates only in actual Connect thread |
| **Serving volunteer** | Team only, Sunday availability pending | Confirm sample Welcome Team assignment | Confirm, then Today becomes calm/updated | No group prayer or group member data |
| **Authorized leader demo** | Group member with leader fixture enabled explicitly via preview controls | Group commitments and then outstanding local check-in review | Review each fictional check-in; the need disappears when marked reviewed | Onboarding “leader” selection alone does not grant leader tools |

There is also an existing combined Group + Serving onboarding test. The M5C Playwright flow tests these four role journeys at 390px with additional 320px / 430px viewport checks, screenshots, WCAG audits and route transitions. Earlier test suites still cover onboardings at five role combinations, Group photos, Connect drafts, reply, unread read receipts, Scripture game, Team, and the complete Companion Care flow.

## Leadership demo: 7-minute story, not a feature catalog

**0:00–0:45 — Start with the challenge.** At the Nov 19 leadership discussion the question was: *Once someone is in, how do we pastor them? Take care of them?* Rally One supports follow-through, not a digital church bulletin or replacement for pastors. Show the approved Rally One branded welcome.

**0:45–2:00 — The first-time visitor.** Create a Guest demo, show a welcoming Today with an invitation rather than invented urgent tasks. Open Groups and browse the six sample photo circles. Explain that they are *not* connected member identities and private content is hidden.

**2:00–3:40 — The connected group member.** Create Group Member, show how Wednesday RSVP leads Today. RSVP. Next priority changes to unread group conversation. Open the real Connect thread; returning to Today removes its unread action. Optionally open prayer. Emphasize no automatic outbound messages and no private check-in inferred from someone's activity.

**3:40–4:50 — Serving without a group.** Create Serving Team only. Today highlights their pending sample response, not small-group messages. Confirm, and the task disappears. Their Groups tab contains a public-safe preview, not invented membership.

**4:50–6:15 — Human-led leader care.** Show that choosing “Group or Team Leader” in onboarding **does not grant authority**. Enable the explicit leader fixture using the developer preview controls; review two fictional follow-ups. The action disappears only after each is deliberately marked reviewed. Do not represent this as real pastoral tooling or identity verification.

**6:15–7:00 — Close with the decision.** The product is credible as a **human-led companion prototype**, but before a church pilot the team must define permissions, consent, which data is authoritative, messaging delivery, notifications, safeguarding, moderation/escalation, retention, and accessibility. Do not connect real church member records until leadership approves the policy.

## Pilot-readiness decision gates
1. **Visual/interaction acceptance:** approved charcoal/Rally One style stays intact; iPhone Safari, Dynamic Type and VoiceOver reviewed on device at 320/390/430 equivalents.
2. **Privacy:** permission for public use of supplied member photos; never imply Instagram account linkage, message consent or relationship from a photograph.
3. **Identity/authorization:** church-approved account verification, small-group memberships, leader scopes, campus boundaries, privileged care access and offboarding.
4. **Messaging and safety:** real provider integration, moderation and reporting, blocked members, notification opt-ins, accessibility and safe pastoral escalation (including emergencies).
5. **Data quality:** trusted Planning Center or church-specified source of truth, explicit read/response semantics, fixture separation and retention/deletion policy.
6. **Measured pilot:** scenario-based usability with actual consenting users, time-to-meaningful-next-action, error recovery, qualitative comfort/trust; **not** engagement scores as spiritual health.

### Acceptance question
In less than a glance, does each member understand **the one or two things that matter now—and why**, with the option to act or leave it alone? If so, the next initiative should be *authorized real-source integration and a limited usability pilot*, not more dashboard widgets.

## Review artifacts
- `test/rally-one-unified-focus.test.cjs`: deterministic ranking, role gates, deferred/completed state, rendering bounds and no new storage.
- `scripts/m5-member-journeys-browser-check.mjs`: onboarding → next action → follow-through → source-backed status and role gates; 390px screenshot set, 320/430px responsive checks.
- Existing `scripts/preview-today-browser-check.mjs` imports the M5C regression without removing any previous checks.

**Review before merge:** GitHub CI, Netlify PR preview and owner iPhone visual approval. This draft PR is **not a real church communication system**.
