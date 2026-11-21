# Rally Point F-02 — Conversation Data Contract v1
**Status:** Initial fictional-domain slice for review (not production integration)  
**Target branch:** `rally-point/develop` via feature PR  
**Schema version:** `1`  
**Date:** November 21, 2026

## Purpose and scope

This is the **first** implementation slice of approved F-02. It introduces stand-alone, dependency-free CommonJS modules and Node tests:

- `lib/conversation-contracts.cjs` — runtime shape/reference integrity checks, fixed schema version and an empty serializable snapshot.
- `lib/mock-conversation-repository.cjs` — an in-memory repository that copies seeded fictional data; deterministic ordering and IDs; read/write operations for conversation, reply, reaction and read status.
- `test/conversation-domain.test.cjs` — Node native test runner coverage, automatically included in the existing `npm test` glob.

**Explicitly not part of this PR:** modifications to `rallypoint.js`, `rallypoint-today.js`, `index.html`, styles, demo `localStorage`, `scripts/build.cjs`, Netlify configuration, real identity, messaging backend or deployment. The current app continues using its original local browser fixture records. The modules are intentionally **not in the published `dist` preview**, because they are not yet wired to any UI.

## Contract

The snapshot shape is:

```js
{
  schemaVersion: 1,
  users: [
    {id, organizationId, displayName}
  ],
  conversations: [
    {id, organizationId, kind: 'group'|'team'|'direct', title, createdAt}
  ],
  memberships: [
    {id, conversationId, userId, role: 'member'|'leader',
     status: 'active'|'revoked'}
  ],
  messages: [
    {id, conversationId, authorId, body, createdAt,
     replyToMessageId: null|string,
     deliveryStatus: 'pending'|'sent'|'failed'}
  ],
  reactions: [
    {id, messageId, userId, emoji, createdAt}
  ],
  readCursors: [
    {conversationId, userId, lastReadMessageId: null|string, readAt}
  ]
}
```

**Stable IDs:** Nonblank identifier strings with permitted ASCII letters/digits, underscore, colon and hyphen; seeded records preserve their IDs. Generated mock IDs are stable within the repository instance and assigned by deterministic sequence or an injected factory. They are **not** globally collision-safe production IDs.

**Timestamps:** UTC ISO 8601. When migrating old records labeled `Today` or `Yesterday` without source timestamps, preserve uncertainty rather than inventing original send times. The migration is **not implemented in this slice**.

**Replies:** A reply is a normal message with `replyToMessageId` pointing to an existing sent message in the *same* conversation. The validator rejects missing parents, self-reference and cycles; there is no separate duplicate reply table.

**Reactions:** A separate record identified by message/user/emoji. The mock toggles a reaction on and off, rejecting inaccessible threads or unsent messages.

**ReadCursor:** One per conversation/user, referencing the last-read sent message. Marking an older message never moves the cursor backward. Unread count excludes the viewer's own messages and excludes pending/failed messages. This replaces old array-signature logic only **when a future approved UI migration is completed**.

**Memberships:** A user's conversation membership is not the same as a global church role. The mock checks active membership on reads/writes, and supports explicit fixture-only revocation for tests. Server-side authorization, confidential group visibility, delegated leader operations, minor policies, direct-message consent and real member provisioning belong to F-03 and require church-owned approval. These local mock checks provide **no security guarantee** outside the in-memory fixture.

**Tenant boundary:** Each user/conversation has an `organizationId`; the validator rejects membership crossing an organization boundary. This is a schema guard, **not** a production multi-tenant isolation service.

## In-memory repository API

```js
const {createMockConversationRepository} =
  require('../../lib/mock-conversation-repository.cjs');
const {emptyConversationSnapshot} =
  require('../../lib/conversation-contracts.cjs');

const mock = createMockConversationRepository({
  seed: emptyConversationSnapshot(),
  clock: () => new Date('2026-11-21T14:00:00Z')
});

mock.getSnapshot();                            // structured deep copy
mock.listConversationsForUser(userId);          // active memberships only
mock.listMessages({conversationId,userId});     // sent + local pending + failed
mock.listReactions({conversationId,userId,messageId});
mock.sendMessage({conversationId,userId,body,replyToMessageId:null});
mock.setDeliveryStatus({messageId,userId,status:'sent'});
mock.toggleReaction({messageId,userId,emoji:'❤️'});
mock.markRead({conversationId,userId,messageId});
mock.getReadCursor({conversationId,userId});
mock.getUnreadCount({conversationId,userId});
mock.setFixtureMembershipStatus({conversationId,userId,status:'revoked'});
```

The repository is synchronous and runs entirely in memory. It does not use `localStorage`, IndexedDB, fetch, WebSockets or church accounts; restarting a repository from a fixture starts a fresh mock. `getSnapshot()` returns a copy; consumers cannot accidentally mutate internal state through query results.

## Test / acceptance matrix

| Requirement | Test target |
| --- | --- |
| Versioned schemas and invalid/unknown versions | Explicit v1 validation; reject version 2 |
| Stable records and relationship integrity | Duplicate IDs, invalid dates, reply chain/cycle, cross-org membership |
| Ordered, isolated queries | UTC time and ID tie-break; copy-on-read and source fixture unchanged |
| Mock-only membership behavior | Active membership required; revoked and unrelated users denied |
| Reply/delivery states | Pending, failed, retry, sent; invalid transitions rejected |
| Reactions | User/message/emoji toggle, accessible sent messages only |
| Accurate read state | Per-user/per-conversation monotonic cursor, own and pending excluded |
| Existing UI unchanged | No `index.html`, `rallypoint.js`, or build integration |

Run: `npm test`. The existing CI also runs the full build and mobile browser regression suite on the draft PR.

## Design and migration guardrails

This PR is not a redesign and introduces **no UI elements**, images, CSS or actual messages. The Premium ALIVE red/charcoal/cream identity and Your People circles are unchanged. F-08 will introduce **non-destructive** versioned legacy browser fixture migration as a separate approved slice. F-04/F-06 will later adapt exactly one fictional Wednesday Group thread to these contracts, followed by a separate review before Team/DM reuse.

Additional approved F-02 records — `ServingShift`, `CoverageRequest`, `CompanionAction`, `CareTask`, `SourceReference` and broader identity/profile details — are **deferred to subsequent narrow slices**, not silently assumed to exist. Schema changes require an explicit version bump/migration plan.

## Preview review and exit

This PR should produce a valid CI run and Netlify Deploy Preview against `rally-point/develop`. Because the new domain modules are not wired to the UI or included in the build, the preview should look and behave exactly like the approved v0.3 app. A successful preview demonstrates **non-regression**, not a visible implementation of messaging or real-time communication.

**Stop at draft PR; no merge, no production deployment, no live church data.** A later separate authorization is required before wiring the mock repository to the app or changing browser persistence.
