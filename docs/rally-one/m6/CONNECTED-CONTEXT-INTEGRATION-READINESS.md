# Rally One · Milestone 6 · Connected member context and pilot architecture
**Status:** Engineering prototype and church-leadership decision document. Not a production authorization.

## Executive decision
The goal behind the November 19 leadership question was: **“Once someone is in, how do we pastor them? Take care of them?”** Rally One should help people follow through on real relationships, without treating a phone interaction as evidence of discipleship or automating pastoral contact.

Milestone 6 integrates Today, Groups, Team, Connect, Scripture and explicit care actions around **one read-only browser-local member-context projection**. It does not create another tab, dashboard card, data store, or church identity. The approved charcoal, matte Citizen red, parchment, portrait rail and four-tab Today/Groups/Team/Read design remain unchanged.

## What was actually built

### 6A — Shared member context
`rally-one-member-context.js` derives `RallyMemberContext.snapshot({state,ui,conversation,now})` from **existing** owners:
- Onboarding name, campus and selected `memberships.group/team` from `RallyToday.load()` (`rallypoint-today-ui-v1`).
- RSVP, serving response, coverage, explicit care markers, leader preview state, and Scripture intention from the existing `rallypoint-phase1-2026` state.
- Authorized Wednesday Group unread/status exclusively from `RallyConversationRead.peek()` and its existing versioned modern conversation repository. Unknown/unavailable is **null**, never incorrectly “zero unread.”
- `permissions.groupLeader` and `permissions.teamLeader` require both relevant membership and an **explicit developer-only fixture role**. Selecting Leader in onboarding does not confer permissions.
- `group`, `team`, `care`, `leader`, `reading`, `completed` and `identity` are read-only, visibly a **fictional local demo**. The six user-provided portraits are image assets, not verified accounts; they never grant a group or messaging identity.

Rally's existing Today model now accepts this snapshot. Groups overview uses its canonical RSVP, authorized leader state, and actual conversation cursor. Team scheduling reads the same serving response. Connect's iframe parent permission bridge reads the same group/team access. Ask Rally explains the same focused board built from that projection. Existing source owners remain independent internally—this is a consistent view over them, **not** a real synchronized member backend.

### 6B — Explicit action continuity
`RallyMemberContext.transition()` validates and prepares only permitted, **explicit, local actions**. The existing storage guard remains the only writer; if saving fails, the calling app rolls back the action. This is not an event-sourcing implementation and creates no duplicate activity log.

| User action | Allowed demo role | Existing owner updated | Verified next screen effect |
| --- | --- | --- | --- |
| RSVP Going/Maybe/clear | Group member | `state.rsvp` | Today priority updates; Groups gathering displays response |
| Confirm or decline serving | Team member | `state.teamStatus`, coverage fixture | Today reminder clears or changes; Team schedule displays response |
| Open Wednesday Group conversation | Authorized group member | **Modern Connect's own read cursor** | On returning from Connect, Today and Groups display the actual unread count |
| Mark fictional prayer request “I prayed” | Group member and named existing request | `state.companionCare.marcus.prayedAt` | Groups and Today show optional *human-led* check-in next |
| Write/send a fictional check-in | User explicitly taps existing sample Send | `state.directMessages.marcus`, existing `completedAt` marker | Optional care action is no longer suggested; **no real message delivered** |
| Mark fictional leader check-in reviewed | Scoped group leader fixture | `state.reached` | Unreviewed count drops on Today and Groups; never an “engagement score” |

No reading, screen opening, scrolling, recommendation, photo tap or reminder can automatically send a message, join a group, change attendance, mark someone prayed for, or complete a leader review. No personal content is sent to an AI model by this module.

### Acceptance matrix
- **Visitor:** campus + name; Today presents a gentle welcome; Groups shows only public-safe portrait previews; no private group prayer or chat.
- **Group member:** RSVP → Today update → Group details → Connect conversation → read cursor update → optional prayer/check-in, all consistent.
- **Serving volunteer:** no group access; Sunday response updates Today and Team; no fictional group identities implied.
- **Leader preview:** selecting Leader in onboarding does not grant role; separately opting into the developer fixture permits leader reviews; revoking it removes the controls.

Automated checks include pure state-transition/permission/unit tests, 320px/390px/430px viewport tests, existing four complete M5 journeys, five onboarding combinations, Groups profile/gallery regression, Connect read cursor and draft tests, care flow and Scripture/VersePlay/Blank Battle accessibility.

## 6C — Real-integration boundary and pilot readiness (NOT implemented)
**System map and required provenance**

| Domain | Current proof-of-concept owner | Candidate real source / boundary | No-go until |
| --- | --- | --- | --- |
| Identity + campus | Browser-only Welcome selections | Church-approved OIDC/OAuth PKCE sign-in, backend session and scoped tenant/campus membership | IT/security reviews identity provider, session handling, revocation and account recovery |
| Groups / roles / events / RSVP | Local fixtures + RallyToday | Authorized church system, potentially Planning Center Groups, via a **server-only read-only adapter first** | Verified tenant, membership, role and group-event scopes; provider approval; freshness controls |
| Serving assignment and response | Local Team sample | Church-selected scheduling provider + explicit permitted write adapter only after review | Per-team authorization, idempotency, cancellations, timezone-safe deadlines, staff-approved workflow |
| Messages / unread | Versioned local Wednesday chat + Connect iframe | Moderated real messaging service or approved church communications channel | Consent, delivery receipts, blocking/reporting, rate limiting, notifications, deletion, group role-based access |
| Prayer / care / leader follow-up | Fictional sample prompts | Separately permissioned pastoral-care service, **not** general chat analytics | Congregant opt-in, restricted access and sensitivity classifications; escalation, retention, export/deletion |
| Scripture | Existing local reading/puzzle content | Licensed text/source and explicit reading preferences | Copyright/license, offline/accessibility QA, consent for tracking progress |

### Reuse the existing integration research; do not merge it by assumption
[Draft PR #92](https://github.com/woodrow5087-hue/Citizen-groups/pull/92) already contains a separate synthetic **read-only Planning Center candidate** adapter and a member journey lab. Its own description explicitly says **no live connection**, **no real identity**, **not an authenticated HTTP endpoint** and no approved church provider. It remains **unmerged**. We can evaluate its server-side contracts and test cases, but should not combine it with this UI branch or call Planning Center the confirmed source of truth.

### Proposed server-side architecture for a future pilot
1. Authenticate via an approved provider and keep provider access tokens **server-side**; never expose API credentials, sensitive group records or pastoral notes in Netlify static JavaScript or browser storage.
2. Introduce a policy-enforcing backend `MemberContext` endpoint, server-derived from verified identity and provider-specific membership/role scope. Clients receive the **minimal authorized fields** and data freshness/provenance; no public “get member by name/photo” lookup.
3. For unavailable, stale, unauthenticated, mismatched tenant, revoked membership or failed authorization, **deny protected details and actions**. Do not silently fall back to cached prayer requests or names.
4. Split actions by capability: `readGroup`, `respondToMyServing`, `sendAuthorizedMessage`, `viewCareRequest`, `reviewCareAsLeader`. Every mutation validates membership, tenant, scope, request provenance and idempotency server-side. Audit only necessary operational events, not speculative spiritual metrics.
5. Define ownership, caching duration, deletion, compliance and breach response for each source; keep prayer/pastoral care isolated from group-directory and general messaging analytics. Avoid using engagement or attendance as automated measures of spiritual health.
6. Consent-based, small pilot with measured **meaningful next-action clarity**, task completion, navigation recovery, confidence and trust. Staff must retain final control over pastoral follow-up and urgent-case response.

### Leadership decisions before any live deployment
- Which platform officially owns groups, serving, messages and care records? Which campus/tenant and roles exist?
- Who may see a prayer request? Are screenshots/notifications allowed? How can members opt out and delete requests?
- When does a leader follow-up count as authorized, reviewed or escalated? What is the safeguarding/human emergency process?
- Who can send a message on behalf of a group? What moderation and delivery guarantees exist?
- Who owns security, privacy, accessibility, photo permissions, source contracts and support during a pilot?
- What observable outcomes constitute a successful 3–5-person consenting pilot—without evaluating spiritual health?

## Version control / design protection
Baseline: QA-passed, user-reviewed [PR #111](https://github.com/woodrow5087-hue/Citizen-groups/pull/111), SHA `6b540c941dc053857b9835271f75afa98497a07a`, preserved as `rally-one/checkpoints/2026-11-23-m5-mobile-approved-baseline`.

M6 work is isolated on `rally-one/m6-connected-member-context`, with **one new draft Netlify PR** for review only. No Develop/main merge, production deployment, live church connection, new UI tab, redesign, or real-account messaging. Manual iPhone Safari/VoiceOver review and wider photo-use permission remain required.

## Next review
Run one complete Group + Serving member journey on iPhone: RSVP in Today → check Groups → confirm serving in Team → check Today → open the actual Connect group thread → check Today/Groups unread state → optionally mark the sample prayer and return to Today. Then review the leader/guest scenario. Once approved, treat this as a **connected prototype milestone**, and shift resources to a scoped real-source consent/security pilot proposal.
