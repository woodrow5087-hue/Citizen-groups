# Rally Companion 1.0 · Source, Conversation and Action Contracts

**Status** · RC1-A provides the authorized fixture snapshot. RC1-B/C uses that snapshot for the integrated Today and Ask Rally preview. [Milestone blueprint](../roadmap/RALLY_COMPANION_1_0.md) · [Review journeys](../roadmap/RALLY_COMPANION_1_0_REVIEW.md) · [Epic #79](https://github.com/woodrow5087-hue/Citizen-groups/issues/79)

## Existing baseline (keep functional)
- `RallySmartDashboard.model({state,ui,conversation,now,today,companion,passage})` projects the existing local sample role/membership, chat unread state, date/location, RSVP and team status.
- `RallyPriorityBoard.derive(model,now)` produces current actionable priority cards/requirements.
- `RallyPersonalCompanion.respond(raw,{model,board,now,goalMode,...},prior)` returns a source-backed response, topic context and suggestions. Existing `answer`, `classify`, `render` and `followKeys` must continue to work.
- `rallypoint.js` owns the UI and the explicit click handlers that update the browser-local fixture. The integrated preview uses `rc1-confirm`, while the existing comparators use `f10-confirm`.
- `RallyConversationRead.peek` supplies modern authorized unread state. The older `groupMessages` archive is **not** a substitute for modern unread state.

The default Today and the F-10/F-10.3 comparators retain their existing paths. The integrated preview reuses the approved Today layout, the existing sheet and four-tab navigation. F-10.4 remains a separate owner review. [PR #78](https://github.com/woodrow5087-hue/Citizen-groups/pull/78)

## AuthorizedSourceSnapshot

Call `RallyCompanionSource.snapshot({model, now})` with a fresh `RallySmartDashboard.model` from the current fixture and the same valid `Date` used to build it. The dashboard preserves the status and validated count from the modern read model. The adapter derives the priority board from that dashboard model. The integrated journey policy receives the resulting snapshot, while F-10 and F-10.3 retain their existing inputs.

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
  leadership?: Readonly<{ groupCheckIns: number }>;
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
| Leader | Apply the same independent membership gates. Only a leader with current group scope may receive the aggregate count of pending group check-ins. The snapshot excludes the roster, check-in records and private text. |
| Modern thread with a known count | Preserve the count, including `0` after an explicit acknowledgment. |
| Modern thread unavailable or denied | Return `null` unread. `unavailable` includes unreadable, blocked or invalid modern storage and can produce a board review task. `not-member` includes an explicit denial. |
| Unknown cursor data | Return `null` unread and `null` task count for a group member. The archive, saved draft and legacy read signature supply no cursor evidence. |
| Explicit upcoming occurrence | Accept a valid date marked `dateSource: 'scheduled'`. RC1 uses one fictional Wednesday Group occurrence on November 25, 2026 at 6:30 p.m. Mountain Time and one Welcome Team occurrence on November 29, 2026 at 9 a.m. Mountain Time. |
| Missing, invalid, past or rolling preview date | Return `null` for `nextDate`. The default Today and F-10/F-10.3 retain rolling display dates for their existing UI. RC1 links to Groups and Team using the explicit fixture occurrences. |

All returned records and the provenance array are frozen. Dates use ISO strings because a frozen `Date` still accepts `Date` setters. Locations describe fixture venues independently of date availability. The snapshot excludes message bodies, author information, prayer text, roster data, raw storage and action controls. Rebuild the dashboard and snapshot whenever source state changes.

The opt-in review clock, `sampleWeek=1`, opens the labeled November 23–29, 2026 fixture week. With just `rc1=1`, the current clock governs stale dates. Both modes format verified occurrences in Mountain Time. Asking about a later week never advances the fixture or generates another occurrence.

## Conversation and session

`RallyCompanionJourneys.respond(raw, {snapshot, receipt}, prior)` returns a query, reply, context and up to three suggested questions. The controller keeps bounded prior turns and the current focus in memory while the sheet is open. The view escapes user input and bounds it to 160 characters. Closing the sheet, navigating away or changing membership or role clears the conversation and receipt. Current scope gates every answer. Inherited focus can help resolve “What time?” and ambiguous references prompt the viewer to clarify. Unsupported requests receive a description of the topics available in this preview.

## Reply and action proposals
```ts
type ActionProposal = Readonly<{
  kind: 'go' | 'confirm';
  id: 'group' | 'team' | 'read' | 'rsvp' | 'serve';
  pane?: string;
  label: string;
  requiresExplicitClick: true;
  source: 'local-fixture';               // for this milestone only
}>;
type Reply = Readonly<{
  intent: string;
  heading: string;
  intro: string;
  items: readonly {
    title: string;
    detail: string;
    reason: string;
    action: ActionProposal | null;
  }[];
  note: string;
}>;
```

The view renders only recognized routes and action IDs. Text submits to the journey policy. A separate confirmation click requests a local state change. The controller verifies that the current response offered the action and that the viewer's current snapshot permits it. A session can list an optional route back to Groups, Team or Scripture after an action or an informational answer.

## Action receipts
```ts
type ActionReceipt = Readonly<{
  operation: 'rsvp' | 'serve';
  outcome: 'confirmed' | 'already-completed' | 'rejected';
  source: 'explicit-user-click';
  // This is a transient event, not a persistent audit log or authoritative grant.
}>;
```

The controller verifies scope, the upcoming occurrence and the current response state at the click. It records a successful receipt after the guarded save succeeds. The journey policy checks the receipt against a fresh snapshot before acknowledging Going or Confirmed. The receipt has no write authority and clears with the next question or session end. A blocked or failed save produces a failure message. Production would require authenticated action permissions, server-side idempotency and an audited receipt design.

## F-10.4 overlap

Both reviews acknowledge an explicit local RSVP or serving confirmation, check current membership and saved response state, and offer an optional source route. F-10.4 carries its own in-memory `f10AfterAction` token through the F-10.3 reply path. Its interaction consumes the legacy dashboard's display dates and sets the token before the render-triggered save. RC1 uses the authorized occurrence snapshot, confirms the guarded save, and checks the resulting state before responding. If the owner approves both paths for integration, compare the post-action wording and comparator coverage, then consolidate the production-bound behavior around the RC1 receipt contract and explicit dates. [F-10.4 review](https://github.com/woodrow5087-hue/Citizen-groups/pull/78)

## Real data is a separate phase
Before any Citizen Church / Church Center connection, the project needs authenticated identity, organization/tenant model, consent by data category, minimum privilege per membership, server-validated action permissions and idempotency, audit retention, privacy review and revocation. A working UI fixture or local role toggle does not satisfy any of those controls.

## Anti-patterns to reject in review
- Synthetic “Jesus wants you to…” recommendations or spiritual engagement scores.
- Fabricated time/date/message/attendance to make a demo feel alive.
- Conversation-triggered RSVP, group join, confirmation, outreach or leader update.
- Forged context granting access after membership revocation.
- A new global event bus or persisted transcript invented only to support one post-action message.
- New navigation, paid dependencies, or production deployment as a by-product of refactoring.
