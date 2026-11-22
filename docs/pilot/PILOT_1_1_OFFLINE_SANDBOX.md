# Pilot 1.1 · Offline, authorization-safe member sandbox

**State:** synthetic engineering validation only, NOT a live church connection, browser sign-in flow or deployable server endpoint.

**Depends on:** read-only adapter draft PR #92. This stacked branch contains PR #92 and its own changes. **Do not merge either PR without owner approval.** The approved PR #90 Today design remains unchanged.

## Why this work can proceed before Citizen confirms its systems
The output contract for a secure group summary should not depend on a specific vendor. A member may see (a) an authorized, fresh group name and next gathering, (b) a generic restricted state, or (c) an unavailable state. Neither denial exposes the group name, meeting location, other people, token details, or even which check failed. An authorized group may also legitimately have **no upcoming gathering**; do not extrapolate weekly recurrence.

## Run without credentials or any provider connection

    npm ci
    npm run pilot:sandbox
    npm test

The sandbox exercises six synthetic conditions using an injected fake HTTP client: authorized member, authorized member with no next event, revoked membership, expired session, wrong tenant, and provider outage. No environment variables, church IDs, real users, external requests or secrets are needed. The output is limited to presentation-safe synthetic fields.

## Engineering changes
- pilot/member-view.cjs creates a backend-only presentation contract for the provider adapter. It accepts only fresh verified read-only snapshots and returns a minimal frozen result. It converts denied membership to a generic restricted state and outages/malformed data to unavailable.
- The existing pilot/planning-center-readonly-groups.cjs now requires both openid and groups scopes for OIDC userinfo, adds a User-Agent, queries only a group-specific events endpoint *after* checking my_membership, and refuses unsupported pagination rather than incorrectly claiming no event.
- scripts/pilot-sandbox.cjs and automated tests exercise cross-tenant denial, membership revocation, freshness, unavailable states, no writes and no private fields in the presentation.
- Existing Today UI, root HTML, CSS, all four tabs and the production build list are unchanged.

## Vendor documentation confirmed (subject to later real-tenant validation)
- OAuth / OIDC, scopes and User-Agent requirements: https://api.planningcenteronline.com/docs/overview/authentication
- Group-specific events, current person's membership: https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/group
- Event dates and group association: https://api.planningcenteronline.com/docs/apps/groups/versions/2023-07-10/vertices/event

These references do **not** establish that Citizen uses Planning Center or has approved this integration.

## Explicitly not implemented
- No live access, OAuth app registration, login, server session/token storage, or server endpoint. Synthetic session values are fixtures, not security controls.
- No rosters, minors, leader care, private prayer notes, messaging, attendance, contacts or writes.
- No visual redesign or new external AI dependencies.
- No real member data in Netlify previews, CI, GitHub or prompts; do not ask Garrett for credentials.
- The existing pilot readiness checklist remains unapproved.

## After the church's approval
Build and independently review a real confidential backend with OIDC discovery, authorization code + PKCE, verified state/nonce and tenant-bound sessions, secure token storage/revocation, and nonproduction provider permission tests. Confirm exact real API shape, pagination and rate limits before connecting one read-only group card in the **existing** Today design.