# Rally Point v1.0 — Integration & Pilot Readiness Gate
Review started: November 20, 2026
Status: **BLOCKED for live church member pilot**. The v0.6–v0.9 interface is a fictional, browser-local prototype.

## Why this gate exists
The November 19 leadership meeting established a powerful mission: meaningful connection, readable personal schedules, group and team communication, and leader awareness of possible follow-up needs. It did **not** approve automatic attendance surveillance, member-data access, production credentials, unrestricted 1:1 messaging, or a final data owner for each flow.

Rally Point's approved architecture (D-10, `docs/COMPANION_ARCHITECTURE_DECISION.md`) is a companion to existing church systems, not a replacement.

## Verified from official public Planning Center documentation (November 20, 2026)
- OAuth 2.0 authorization and OpenID Connect (OIDC) are documented. Product-specific scopes are enforced; token access is limited by the authorized Planning Center user's permissions. Browser clients cannot embed Personal Access Tokens or confidential client secrets.
  https://api.planningcenteronline.com/docs/overview/authentication
- Groups API documents group memberships/people, events, and event attendance resources, subject to permissions.
  https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/group
  https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/attendance
- Services API documents person schedules and team associations, subject to permissions.
  https://api.planningcenteronline.com/docs/apps/services/versions/2018-11-01/vertices/person
  https://api.planningcenteronline.com/docs/apps/services/versions/2018-11-01/vertices/schedule
- A Services Chat API reference includes GET chat metadata, **not verification that reading/posting arbitrary Church Center group and 1:1 messages is supported**. Any messaging integration requires a separate endpoint/permission feasibility spike; neither chat replication nor write access has been established.
  https://api.planningcenteronline.com/docs/apps/services/versions/2018-11-01/vertices/chat
- Enabling Groups chat can reveal names/profile photos and other participant attributes to group members, so consent and confidential-member handling matter.
  https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/group

**Public docs are not live authorization or an integration test against Citizen Church's account.**

## Source-of-truth contract to validate
| Rally Point feature | Proposed record owner | Feasibility | Safeguard |
| --- | --- | --- | --- |
| Current user's identity and campus | Approved identity provider / Planning Center People | OIDC and People APIs documented; actual Citizen approval pending | Server-side session, per-user identity and data minimization |
| My Groups and group roster | Planning Center Groups if used by church | Relevant API resources documented; scope/visibility must be tested | Member-only view, confidential groups, consent for avatars |
| Group gatherings | Planning Center Groups/Calendar after confirmation | Events documented | Local time zones, cancellations, enrollment |
| Group attendance | Planning Center Groups event attendance where recorded | API documented; ministry procedure unverified | Distinguish scheduled, present, absent, excused, unknown |
| Serving schedule | Planning Center Services where used | Person schedules documented; authorization not tested | Never mistake a scheduled shift for actual participation |
| Schedule responses / coverage | Services or other approved source | **Write support not verified for exact workflow** | No double writes or phantom confirmations |
| Group/team messages | Existing approved chat/deep link OR separate secure messaging backend | **Unknown; chat read/write not established** | Minors policy, consent, deletion, abuse controls and role checks |
| Pastor/leader follow-up | Church-approved workflow, not inferred from inactivity alone | **Definitions and owner unresolved** | Human review, appeals/correction, restricted audit logs |
| Scripture & content | Rally Point curated material | Feasible as product content after rights/review | Verified public-domain BSB excerpts or appropriately licensed alternatives; editorial approval |
| Notifications | Approved app notification service | Unscoped | Opt-in, quiet hours, sensitive-content redaction |

## Phase gates (see machine-readable config)
1. Leadership has authorized the pilot scope, named decision owners, defined target campuses/age groups, and selected the initial cohort.
2. Identity and roles have been designed and verified with actual per-user authorization. No localStorage role toggle may grant production authority.
3. Data sources and consent are documented; least-privilege permissions and tenant isolation are tested.
4. Messaging decision is made: deep links to Church Center if supported, or a separately reviewed secure backend. v0.7 local direct messages are **not real messaging**.
5. Attendance/follow-up rules and data accuracy are approved, with clear human oversight. No automatic red/yellow spiritual-wellness scoring.
6. Reading content rights and publishing privileges are approved.
7. Support owner, security review, incident handling, audit, deletion/retention, and rollback are documented.
8. Mobile usability, accessibility, automated unit/integration/browser tests, and an authorized small-cohort dry run have passed.

## Recommended smallest *real* pilot
After approval, test **read-only My Groups and My Schedule** for a very small church-approved adult cohort, with OIDC/OAuth or a verified safe link-out and a documented permission boundary. Keep demo conversations disconnected and visibly labeled as sample. Add any real messaging and pastoral follow-up only after the corresponding policy, safety, and API checks pass.

## Release semantics
- `v0.6` through `v0.9`: visual and functional *local-demo* milestones.
- `v1.0 readiness`: documentation and automated blockers; does **not** constitute v1.0 live integration or a launch approval.
- `pilot:check`: must remain failing while gates are unresolved. A successful Netlify deploy says only that the static preview built; it does not assert real-world pilot readiness.
- **Do not merge or deploy to production automatically.**

## Meeting decisions still open
Direct-message scope, age and safeguarding rules; actual group/team member lifecycle; audience/leader notification thresholds; ownership of attendance input; source for schedule updates; reading-plan publication authority; church-specific versus multi-tenant product; final public name; February target and project support staffing.
