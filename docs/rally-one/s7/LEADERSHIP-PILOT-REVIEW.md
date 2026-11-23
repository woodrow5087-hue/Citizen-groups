# Rally One · Sprint 7C–7E · Leadership demonstration and pilot decision package

**Audience:** Citizen Church leadership, project owner, group/pastoral care sponsor, ministry operations, and technical/privacy owner.  
**Implementation:** [Rally One Sprint 7 review preview](../../../../index.html) and the existing Profile / Demo Controls selector. No church credentials, real records or external messages are connected.

## The executive framing

At the November 19 meeting, the question was: **“Once someone is in, how do we pastor them? Take care of them?”** Rally One's proposed answer is a *human-led companion* that makes the next meaningful act of belonging, serving, Scripture engagement and care easier. It is **not** a mobile copy of the church website, an engagement score, or a replacement for pastors or group leaders.

The prototype makes four claims we can actually demonstrate:
1. **Personal context:** a member's campus, group and serving involvement determine what is relevant today.
2. **Continuity:** an explicit RSVP or serving decision updates both Today and the corresponding detail screen; opening a real demo conversation updates its own unread cursor.
3. **Human agency:** the sample prayer/check-in and leader review require deliberate taps; Rally does not write or send on someone's behalf.
4. **Least privilege:** a visitor or serving-only member does not gain access to a private small-group conversation, named prayer request or leader fixture.

Those are product and prototype behavior claims only. None validates live authorization, data quality or pastoral suitability.

## 7C · How to run the repeatable demo

Open the **Sprint 7 Netlify preview** on an iPhone. Log in to the fictional demo. Tap the round **profile / demo controls** control in the upper header. Under **Leadership demo · One-tap journeys**, select one of the five preset scenes. You can reselect the same scene to restore its initial RSVP, serving, care and leader-review actions. Use **Restore starting demo state** to return the app's original profile/settings for the current page session.

The controls alter **browser-local synthetic state only**, through the existing guarded save. They deliberately preserve the separate versioned Connect messages/drafts and Scripture progress—neither is erased. A new browser session cannot reconstruct the old session's unsaved restore point; user-added posts in independent messaging repositories are not rolled back. For the most repeatable presentation, use a fresh private browser window containing no personal information.

**Demo controls do not authenticate, verify memberships, or grant actual church permissions.** The "Leader fixture" selects a local synthetic role that is distinct from church-admin authority.

### Seven-minute leadership demonstration

| Time | Scene | Action and what to say |
|---|---|---|
| 0:00–0:40 | **Purpose** | Show the charcoal/Rally One title. Explain the November 19 pastoral-care question, the four primary tabs and the role of personal follow-through. |
| 0:40–1:50 | **01 · Visitor** | Load visitor. Today offers a welcoming next step. Browse the six photo previews on Groups. Point out that there is no private chat, prayer request or group membership implied. |
| 1:50–3:15 | **02 · Small-group member** | Load group member. On Today tap the RSVP, then confirm its change in Groups. Open Connect (if there are unread local messages), return to Today, and observe only the *actual* versioned read cursor changing. |
| 3:15–4:10 | **03 · Serving volunteer** | Load serving-only. Confirm the fictional Sunday shift from Today and observe the same state in Team. Groups is public-safe discovery rather than invented membership. |
| 4:10–5:20 | **04 · Leader fixture** | Load leader scene. Explain that the permission is explicitly enabled **for demo only** and real leadership must be verified on the server. Mark a fictional follow-up reviewed; Today and Groups update without judging anyone's spiritual condition. |
| 5:20–6:25 | **05 · Group + Serving** | Load combined scene. Show one high-priority action, at most one secondary, consistent status across screens. Open the optional prayer/check-in and emphasize that a message requires an explicit send. |
| 6:25–7:00 | **Decision** | State that it's a fully fictional, QA-tested UX prototype. Ask for accountable integration and pastoral policy owners, a small consent-based pilot, and a go/no-go decision on the next limited read-only step—not live launch. |

If modern messages were already read, do not fake "3 new messages": explain that unread state belongs to the real demo chat repository, and demonstrate the permitted thread instead. If a browser is in a storage-conflict state, stop and use a fresh private test browser rather than overriding its saved data.

## 7B · Resilience acceptance matrix

| Situation | Expected outcome |
|---|---|
| Guest or team-only opens Groups | The approved photo-preview rail remains available; no membership, named private care or Connect group access is invented |
| Group membership revoked/removed | Member-only group/leader data and unread fields do not render as authorized |
| Leader role removed | Leader-review tools and private follow-ups disappear; prior local fiction remains protected rather than overwritten |
| Connect conversation unavailable | No guessed unread count; the UI offers a recoverable source-unavailable state |
| Serving decline / response already saved | No false outstanding confirmation or repeated "urgent" action |
| Malformed local prayer/team/direct messages | Storage guard refuses destructive saves; safe in-memory rendering keeps the app usable with a recovery notice |
| Another tab changed state / interrupted save | Write-ahead guard rejects conflicting writes or requires explicit recovery |
| Provider outage, expired session, wrong tenant, revoked membership | The synthetic integration contract returns **unavailable** or **restricted** with no cached protected group/event details |
| Optional prayer, check-in or chat draft | Viewing, praying, or drafting never automatically sends an external message |

Automated QA is an engineering gate, not a substitute for a live-permission security review.

## 7D · Candidate first read-only integration contract

The separate **draft PR #92** already explored a Planning Center Groups *candidate* with a server-only read adapter, synthetic member view, and six-way offline scenario lab. Its documentation states unequivocally that no production source, sign-in, or live integration exists. We reviewed its actual adapter and tests; we **did not merge it**.

Sprint 7 adds an independent, provider-neutral **Node-only synthetic contract** at `pilot/s7-readonly-member-contract.cjs`. It accepts an **already server-verified** session and an injected read provider, not a browser-controlled role. It requires a matching organization, current subject membership, read scope, fresh provider timestamp, safe group name and a verified future event (or null). It drops all unapproved fields such as rosters, tokens, notes, attendance, email addresses and prayer content. Revocation, wrong organization, expired/stale data and outages return protected-data-free **restricted** or **unavailable** envelopes.

**It is not an authentication system, OAuth implementation, HTTP route, or proof that Planning Center is authorized by Citizen Church.** Its `serverVerified` input is a proposed backend trust contract, not a mechanism for verifying itself. Never bundle it into the static Netlify app.

**Recommended first real integration only after written authorization:** one consenting adult, one approved tenant/group, read-only group name and next verified gathering, displayed with provider/source and checked-at time. No live write actions, rosters, prayer records, attendance or messaging in the first pilot. Obtain direct vendor/API documentation and official church approval before implementation.

## 7E · Pilot readiness scorecard

| Area | Current prototype | Required decision before live pilot |
|---|---|---|
| Visual / interaction fidelity | Approved premium layout, mobile/browser checks | Physical Safari, VoiceOver, Dynamic Type and keyboard acceptance |
| Member identity / role | Browser-local fiction and leader preview switch | Church-approved identity provider, secure server sessions, revocation testing |
| Group / campus source | Local fixtures; synthetic contract in separate Node module | Confirm authoritative platform, tenant boundaries, scopes, freshness limits and accountable data owner |
| Messaging | Fictional versioned Connect repository | Approved delivery provider, blocking/reporting, opt-in notification/privacy policy and retention |
| Pastoral care | Fictional example, opt-in tap | Restricted access, member consent, safeguarding, escalation and separate sensitive-data policy |
| Photo/privacy | Six real photos provided for the demo | Permission for publication / testing beyond this private design review |
| Operational controls | Draft PRs + preview-only Netlify | Pilot support owner, rollback plan, written incident response and go/no-go |
| Measurable usefulness | Role-specific journeys test automatically | 3–5 consenting adults complete scripted tasks with optional anonymous feedback |

### Guided 3–5 person pilot evaluation (only after approval)

Use synthetic fixtures. Do not ask volunteers to submit church accounts, actual prayer details, health information, family circumstances, photos or real member identifiers.

For each person, ask them to: find what matters on Today in five seconds; locate their group or serving action; complete one action and see it reflected on another screen; find how to leave, pause or opt out of a suggestion; describe whether the app feels helpful rather than invasive. Record **task success without coaching, misnavigation/permission mistakes, time-to-action, confidence 1–5 and one short comfort/trust comment**. Do not track inferred spirituality, attendance as health, or private conversations.

**Proposed UX acceptance:** at least 4 of 5 participants complete the main follow-through loop uncoached; all restricted-role attempts expose **zero** private data; all participants can distinguish synthetic data from live church information. Any private disclosure is an immediate **stop**; investigate and retest before a real pilot.

## Leadership questions to resolve

1. Who at Citizen owns membership, Group access and campus boundaries? Which provider is authoritative?
2. Who owns and approves serving assignment responses and whether they are communicated externally?
3. Who may see prayer requests and who can designate a leader check-in completed? What consent and safeguarding rules apply?
4. What email/in-app messaging, retention, notification and moderation strategy is permitted?
5. Which adult pilot members opt in, who supports them, and who can withdraw or delete data?
6. Who signs off on the design, security boundary, accessibility results and initial read-only connection?
7. What does a *human-care outcome* look like without using a score for spiritual health?

## Delivery and explicit next decision

**Delivered:** baseline checkpoint, resilience guards and tests, five-scene leadership selector with session restore, server-only synthetic integration contract with failure tests, and this review package.  
**Not delivered:** real sign-in, real Planning Center data, live messaging, pastoral database, permissions server, legal/IT approval, iPhone human testing, production deployment.

**Recommended next decision:** approve an internal leadership walkthrough of the preview, appoint the technical and pastoral data owners, and authorize *research/scoping only* for a tiny **read-only** group/gathering pilot. **No merge to Develop or main without the owner's explicit approval.**
