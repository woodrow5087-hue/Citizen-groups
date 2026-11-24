# Canonical data architecture — member context v1

## Existing contracts retained

`rally-one-member-context.js` owns the browser's version-1 read-only snapshot and
explicit permitted transitions. It consumes the existing local app/profile and
modern conversation sources. It does not authenticate identity. Existing
`lib/conversation-contracts.cjs`, `lib/action-contracts.cjs` and access-policy
contracts remain authoritative for conversations, events, shifts, actions and
organization-scoped authorization. This sprint composes those boundaries; it does
not create competing schemas for those records or migrate browser storage.

`lib/member-context-contract.cjs` defines the missing versioned member-context
handoff, its executable validator, quality normalization and pure fixture format
adapter. It is server/tool-only and excluded from the static build. It exposes
`record`, `assertEnvelope`, and `fromFixture`. No IO, credentials, authentication,
provider client, new identity record, or new storage key is introduced.

## Envelope

`{schemaVersion:1, mode:'demonstration', domains:{...}}` has exactly the nine domain
keys below. Each domain is `{state, source, observedAt, data}`. Source labels are
provider-neutral provenance, not verification claims. `observedAt` is a canonical
UTC timestamp or null. Do not invent observation time from message timestamps or
from the time a page was rendered. Only confirmed data is projected; every other
state has `data:null`, including stale records. Raw malformed/private records
remain under their original owner's protection, outside this handoff.

| Domain | Existing authority | Minimal confirmed payload |
| --- | --- | --- |
| profile | Onboarding/local profile | Display name; `identityVerified:false`. No synthetic subject ID or real member authentication. |
| involvement | Onboarding/local profile | Campus and explicit boolean group/team involvement. Invalid membership flags cannot grant access. |
| relationships | Existing app + group membership | Authorized group membership and RSVP. No inferred social graph or roster exposure. |
| serving | Existing app + team membership | Team membership, pending/confirmed/declined response and explicit coverage flag. |
| conversations | Versioned modern thread/read adapter | Authorized unread count, including confirmed zero. No legacy-message-derived unread value, bodies, drafts or pastoral records. |
| care | Existing explicit prayer/care state | Authorized ready/prayed/paused/followed-up status from a named fictional request. No inferred need, attendance score or raw prayer text. |
| scripture | Existing read flag and saved intention | Read-today and intention-due booleans. Browsing, game scores and completion are not interchangeable. |
| actions | Shared intelligence output + existing completion fields | At most two supported selected action IDs, explicit completed fields and supported dismissed IDs. No new task store. |
| permissions | Existing boolean memberships + explicit fixture role | Group/team access and scoped leader booleans. Validator rejects contradictory or unauthorized projections. |

## Data quality

| State | Meaning | Required behavior |
| --- | --- | --- |
| confirmed | Valid, source-backed data; unread zero is confirmed | May be consumed subject to scoped permissions. |
| empty | Confirmed absence/no authorized local relationship or request | No fabricated item or hidden private data. |
| unknown | Not supplied, insufficient evidence, or missing freshness evidence | Never coerce into zero, false completion or a real identity claim. |
| unavailable | Source access failed explicitly | Retain existing records, explain unavailability, do not manufacture unread zero. |
| malformed | Unsupported field shape, count, timestamp or contradictory data | Drop payload from projection, preserve original source bytes; no silent repair/write. |
| stale | A caller-configured freshness limit has elapsed for a known observation | Do not expose old records as current; refresh through the source adapter. |

The current local demo has no remote freshness SLA. `observedAt:null` is truthful,
and old conversation content is not automatically stale. When a future adapter
requests freshness enforcement, missing observation evidence becomes unknown,
future timestamps become malformed, and expired observations become stale.

The browser's existing `group.status` remains its compatibility presentation
projection (`ok`, `unavailable`, `not-joined`). The richer handoff adds source
semantics without changing approved rendering or upgrading persisted records.

## Normalization, persistence and migration

- `fromFixture` accepts caller-supplied parsed fixture objects; it calls the
  existing member snapshot, then constructs a strict allowlisted handoff. Inputs
  are not mutated and output is deeply frozen. Unsupported envelope versions
  and extra fields are rejected, including accidental secrets/private fields.
- Nonboolean membership and invalid unread counts are not treated as real access
  or zero. Guest/revoked records lose group/team/care payloads before handoff.
- `RallyStorageGuard` remains the primary/profile writer; the modern conversation
  adapter remains the cursor/draft writer. Existing storage keys and versions
  do not change. This schema does not serialize itself into browser storage.
- Existing `legacy-fixture-migration.cjs` and `migration-rehearsal.cjs` retain their
  exact-backup, dry-run boundaries. Member v1 projection is a format adapter only,
  not a live migration. Any later persisted schema migration needs an explicit
  old/new version, byte-preserving backup, rollback and idempotence tests.

## Future Planning Center boundary

A separately authorized server adapter must verify session, subject, organization,
consent and scoped memberships before reading a provider. It validates provider
records and explicit observation/freshness metadata, then maps to canonical domain
contracts; presentation never imports a provider SDK or credentials. Browser
fixture memberships and `identityVerified:false` must never become session claims.
The existing synthetic `pilot/s7-readonly-member-contract.cjs` remains server-only;
its allowlisted projection and restricted/unavailable handling are preserved.
No real provider, endpoint, member data, automated outreach or live pilot is
approved by this sprint. Care consent/retention, real identity/auth and operational
permissions require independent review before such work.
