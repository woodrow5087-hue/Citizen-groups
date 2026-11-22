# Rally Companion 1.0 · Source, Conversation and Action Contracts

**Status** · RC1-A implements the fixture source snapshot. The conversation, proposal and receipt contracts describe subsequent work. See the [milestone blueprint](../roadmap/RALLY_COMPANION_1_0.md) and [epic #79](https://github.com/woodrow5087-hue/Citizen-groups/issues/79).

## Existing baseline (keep functional)
- `RallySmartDashboard.model({state,ui,conversation,now,today,companion,passage})` projects the existing local sample role/membership, chat unread state, date/location, RSVP and team status.
- `RallyPriorityBoard.derive(model,now)` produces current actionable priority cards/requirements.
- `RallyPersonalCompanion.respond(raw,{model,board,now,goalMode,...},prior)` returns a source-backed response, topic context and suggestions. Existing `answer`, `classify`, `render` and `followKeys` must continue to work.
- `rallypoint.js` is the current UI orchestrator and owns the only guarded `f10-confirm` actions, which mutate the browser-local fixture.
- `RallyConversationRead.peek` supplies modern authorized unread state. The older `groupMessages` archive is **not** a substitute for modern unread state.

All existing opt-in F-10/F-10.3 behavior, four tabs, CSS and tests are compatibility requirements. F-10.4 in PR #78 is unmerged at kickoff and may only become a dependency after owner approval.

## AuthorizedSourceSnapshot

Call `RallyCompanionSource.snapshot({model, now})` with a fresh `RallySmartDashboard.model` from the current fixture and the same valid `Date` used to build it. The dashboard preserves the status and validated count from the modern read model. The adapter derives the priority board from the same dashboard model, so a board retained before a scope change cannot supply its count. The adapter is available as a browser global and a CommonJS module. F-10 and F-10.3 retain their existing inputs as RC1-B begins adopting the new contract.

```ts
type SourceStatus = 'available' | 'unavailable' | 'not-member' | 'unknown';

type AuthorizedSourceSnapshot = Readonly<{
  viewer: Readonly<{
    role: 'member' | 'leader';          // fixture role; not production identity
    group: boolean;                    // current membership only
    team: boolean;
    audience: string;                  // derived, non-authoritative presentation
  }>;
  sources: Readonly<{
    group: SourceStatus;
    team: SourceStatus;
    conversation: SourceStatus;
    scripture: SourceStatus;
  }>;
  group?: Readonly<{
    nextDate: string | null;            // ISO 8601 scheduled occurrence or unknown
    location: string | null;           // shown only to authorized group members
    rsvp: 'going' | 'maybe' | 'none';
    unreadCount: number | null;        // null when source unavailable; never pretend zero
  }>;
  serving?: Readonly<{
    nextDate: string | null;
    location: string | null;
    response: 'pending' | 'confirmed' | 'declined' | 'unknown';
  }>;
  scripture?: Readonly<{ passage: string | null; readToday: boolean | null }>;
  board: Readonly<{ taskCount: number | null }>;
  provenance: readonly string[];       // fixture source identifiers
  now: string;                          // ISO 8601 copy of the injected clock
}>;
```

| Viewer or source | Snapshot behavior |
| --- | --- |
| Guest or membership revoked | Omit the protected record for the lost scope. Report `not-member` and rederive the task count from current scopes. Scripture remains available from the local fixture. |
| Group member | Expose the group's saved RSVP, fixture venue and any verified upcoming occurrence. Unread requires an authorized modern cursor. |
| Team member | Expose the viewer's saved serving response, fixture venue when present and any verified upcoming shift. Team scope grants no group or conversation access. |
| Leader | Apply the same independent membership gates. The board count can include an authorized group check-in task. The snapshot excludes the roster, check-in records and private text. |
| Modern thread with a known count | Preserve the count, including `0` after an explicit acknowledgment. |
| Modern thread unavailable or denied | Return `null` unread. `unavailable` includes unreadable, blocked or invalid modern storage and can produce a board review task. `not-member` includes an explicit denial. |
| Unknown cursor data | Return `null` unread and `null` task count for a group member. The archive, saved draft and legacy read signature supply no cursor evidence. |
| Missing, invalid, past or rolling preview date | Return `null` for `nextDate`. A source event can use `dateSource: 'scheduled'` for an explicit occurrence. The current Today fixture calculates rolling demo dates and supplies no such occurrence. Its existing rendering is preserved. |

All returned records and the provenance array are frozen. Dates use ISO strings because a frozen `Date` still accepts `Date` setters. Locations describe fixture venues independently of date availability. The snapshot excludes message bodies, author information, prayer text, roster data, raw storage and action controls. The caller should rebuild the dashboard and snapshot whenever source state changes. The adapter performs no writes and provides no live identity, calendar or authorization service.

## Proposed contract: ConversationTurn
```ts
type ConversationTurn = Readonly<{
  question: string;                      // bounded 160 chars, escaped at rendering
  focus: 'group' | 'serve' | 'scripture' | 'week' | 'community' | '';
  intent: string;
  askedAt: number;                       // in-memory only, not persisted
}>;
type SessionContext = Readonly<{
  priorTurns: readonly ConversationTurn[]; // max 3; existing behavior preserved
  focus: ConversationTurn['focus'];
  lastActionReceipt?: ActionReceipt | null; // only a locally observed guarded click
}>;
```

Session clear on sheet close, navigation or role/membership change. Inherited focus can help resolve “What time?”, but cannot confer scope, private data or action rights. When context is ambiguous, prefer a question to an invented answer. Never persist questions or focus across device or reload.

## Proposed contract: Reply + ActionProposal
```ts
type ActionProposal = Readonly<{
  kind: 'navigate' | 'confirm';
  id: 'group' | 'team' | 'read' | 'rsvp' | 'serve';
  pane?: string;
  label: string;
  requiresExplicitClick: true;
  source: 'local-fixture';               // for this milestone only
}>;
type Reply = Readonly<{
  heading: string;
  intro: string;
  items: readonly {
    title: string;
    detail: string;
    reason: string;
    action: ActionProposal | null;
  }[];
  followups: readonly string[];
  focus: SessionContext['focus'];
  limitations: readonly string[];       // e.g. next week unavailable
}>;
```

Action proposal is a presentation object, **never executable by a conversation text handler**. The existing `go` and `confirm` action shapes remain valid in v1; use an adapter rather than changing all UI consumers at once. Disable hidden or stale proposals when status changes.

## Proposed contract: ActionReceipt
```ts
type ActionReceipt = Readonly<{
  operation: 'rsvp' | 'serve';
  outcome: 'confirmed' | 'already-completed' | 'rejected';
  source: 'explicit-user-click';
  // This is a transient event, not a persistent audit log or authoritative grant.
}>;
```

The UI handler first validates membership and current pending state, performs the existing explicit state mutation, and only then produces an ephemeral receipt. The companion **re-reads current source state** before acknowledging completion; never trust a receipt alone. The same receipt can't trigger another write and doesn't survive a close/reopen. Production would require an independently designed authenticated, idempotent server receipt and audit mechanism.

## Migration / implementation steps
1. Characterize existing behavior with tests for F-09/F-10.3 (plus F-10.4 if separately merged) and record fixtures for `guest`, `group-member`, `volunteer`, `connected`, `scoped-leader`, `source-unavailable`.
2. Extract the pure `rallypoint-companion-source.js` projection from the trusted dashboard and priority board. Preserve the existing comparator interfaces during migration.
3. Add clear tests: forbidden private content never enters snapshot, state isn't mutated, `unavailable !== 0 unread`, dates are not extrapolated, team and group gates remain independent.
4. Extend goal policies and follow-through on top of the normalized source. Keep `RallyPersonalCompanion.respond()` signature and basic UI response stable.
5. Consolidate repeated intent/confirmation logic once behavior tests are green. Never do a wholesale rewrite of `rallypoint.js` and companion engine simultaneously.
6. Add JSDOM and Playwright integration checks; compare existing opt-in flags and default Today.
7. Use feature branch previews, review owner acceptance; no automatic merging.

## Real data is a separate phase
Before any Citizen Church / Church Center connection, the project needs authenticated identity, organization/tenant model, consent by data category, minimum privilege per membership, server-validated action permissions and idempotency, audit retention, privacy review and revocation. A working UI fixture or local role toggle does not satisfy any of those controls.

## Anti-patterns to reject in review
- Synthetic “Jesus wants you to…” recommendations or spiritual engagement scores.
- Fabricated time/date/message/attendance to make a demo feel alive.
- Conversation-triggered RSVP, group join, confirmation, outreach or leader update.
- Forged context granting access after membership revocation.
- A new global event bus or persisted transcript invented only to support one post-action message.
- New navigation, paid dependencies, or production deployment as a by-product of refactoring.
