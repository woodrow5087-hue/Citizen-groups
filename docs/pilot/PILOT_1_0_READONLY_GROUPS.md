# Pilot 1.0 — A member's own group and next real gathering

**Status: pre-integration engineering only; NOT live, authorized, or production ready.**
**Issue:** #91. **Starting point:** approved Develop commit da7c47f (PR #90).

## Goal and exact limit
One authenticated and consenting adult sees one actual group name and the next verified gathering, with last-checked time. Everything else stays in the existing **unchanged** Rally Point UI and fictional demo. Read only; do not write RSVPs, chat messages, attendance, membership, prayers, or serving confirmations.

## Candidate source to verify with Citizen Church
Church Center uses Planning Center; confirm that the church actually uses its Groups product and has authorized a specific group and administrator. Planning Center documents OAuth, current-user group memberships, group records and event reads:
- https://api.planningcenteronline.com/docs/overview/authentication
- https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/group
- https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/membership
- https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/event

This integration is **not wired to the live app or any church account**. The source could be replaced if Citizen confirms a different platform.

## Actual implementation in this PR
The SERVER-ONLY, dependency-injected module at pilot/planning-center-readonly-groups.cjs defines a source adapter, not an HTTP endpoint or authentication system.

Given a real backend-verified, short-lived OAuth user session and a server-configured tenant/group, it:
1. Denies missing auth, expired sessions, wrong organization or missing Groups scope before any provider call.
2. Rechecks OAuth subject and organization through the provider's userinfo endpoint.
3. Rechecks this current user's membership through the Groups my_membership endpoint; never treats an admin's general access or a prior UI group selection as sufficient permission.
4. Requests only that group and its dated upcoming events; filters cross-group, canceled, past and invalid events.
5. Returns only source, read-only mode, group name, next gathering title and start timestamp (or null), and as-of timestamp.
6. Never returns the raw API payload, token, roster, event notes, chat, pastoral content, attendance, other users' details, or a guessed recurring schedule.
7. Uses GET-only provider calls and disables caching and redirects.

The synthetic tests in test/pilot-readonly-groups.test.cjs verify permission denial, tenant isolation, no future events, failures, data minimization, and no writes. This is not an independent security assessment.

## What is deliberately NOT implemented
- OAuth client registration, confidential authorization-code/PKCE callback, token rotation/revocation, server session cookies, CSRF protection and secret storage.
- A backend HTTP endpoint, real provider requests, production login or client-side connection.
- A physical location/address: location is a separate provider relationship and needs scoped review.
- Group discovery, calendar writes, attendance, messaging, real serving rosters or admin data.
- A new Today layout or unauthorized use of the church's member data.

Never paste a PAT, OAuth secret, refresh token, access token or real group member information into a chat, file, GitHub PR or static Netlify preview. Keep all real credentials server-side under controlled access.

## Two-week limited pilot proposal (NOT yet approved)
**Scope:** one campus, one group, 3–5 consenting adult participants, one responsible church owner, one technical/data owner. No minors, no prayer or care notes.

**Step A — authorization:** Citizen leadership confirms data system, explicitly approves purpose, fields, cohort, retention, audit limits, responsible owners, withdrawal and incident handling. API use, source permission visibility, and platform terms reviewed.

**Step B — identity:** build real server-side authenticated OAuth code + PKCE flow with least-privilege Groups scope, safe sessions and token storage. Verify that revoked membership loses access immediately. Do not use local role toggles as security controls.

**Step C — connected preview:** approved server route obtains provider data through this adapter. Only then allow an authenticated client to render group name and next gathering in the existing approved Today card, with a clear connected/source timestamp. Distinguish absent events from unavailable provider data. No browser-side API token, no general directory.

**Step D — pilot and sign-off:** test with consenting members for login, authorized group, canceled/no future event, session expiry, denied access, revocation and disconnect. Review Safari, VoiceOver, rate limits, incident response and rollback. Written go/no-go before real-user deployment.

## Explicit acceptance gates
- [ ] Church confirms Planning Center is the actual Groups system and grants documented access.
- [ ] Church data/technical owner and accountable pilot lead identified.
- [ ] Adult users, consent, written scope, retention, and withdrawal approved.
- [ ] Backend authentication, PKCE, tenant isolation, CSRF and secret storage reviewed.
- [ ] Membership revocation and wrong-tenant test against authorized nonproduction provider account.
- [ ] Exact provider API schema, rate limits, dates and visibility independently verified.
- [ ] No protected member data ever reaches CI, public URLs, browser localStorage or logs.
- [ ] Screenshot and interaction comparison validates PR #90 layout unchanged.
- [ ] 3–5 authorized participants complete real-user acceptance tests.
- [ ] Explicit final pilot go/no-go, disable/rollback plan and support owner.

Keep existing config/rallypoint-v10-readiness.json unchanged (approved_pilot false; all 10 gates pending).

## Deployment rules
This branch and any PR are review-only; no direct Develop merge, no production main deployment, no live connection without explicit approval. A green Netlify preview proves only that the existing fictional app still builds, NOT that a live church pilot is authorized.