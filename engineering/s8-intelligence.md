# Rally Intelligence — deterministic shared decisions

## One application service

`rally-one-intelligence.js` is the pure application service used by both Today and
Ask Rally through `recommendationSnapshot(now, chat)`. It receives existing state,
profile, modern conversation, a supplied clock, current passage and explicit
session-only demo flags. It constructs one canonical member context, dashboard
model, candidate board, care projection and final focus decision. Neither consumer
assembles an alternative ranking. Ask Rally's existing parser/renderer explains
the same board and reasons that Today displays; typed text does not save actions.

Dependency order: Today/domain modules → SmartDashboard → PriorityBoard → Care /
UnifiedFocus / MemberContext → Intelligence → composition root. CommonJS exports
provide unit-test access to the same implementation. The service has no IO,
external AI, rendering, new persistence, timestamps from browsing, or outreach.

## Rule ownership

| Responsibility | Single owner |
| --- | --- |
| Identity/involvement, permissions, completion, valid unread status | MemberContext snapshot, existing source adapters |
| Legacy candidate descriptions, calendar events and presentation model | SmartDashboard; canonical memberships are passed to its legacy source helpers |
| Candidate eligibility facts | `RallyUnifiedFocus.facts` shared by PriorityBoard and final policy |
| Candidate copy, action labels, optional invitations and agenda rendering | PriorityBoard |
| Final Rally One ordering, family deduplication, two-action cap and explanations | UnifiedFocus |
| Shared input assembly and decision snapshot | Intelligence service |
| Supported question/follow-up parsing and response markup | PersonalCompanion, consuming service model/board |
| Explicit RSVP/serve/care/leader transition and save/rollback | Existing application/member transition and storage guard |

Historical Board/Smart Stack modes have different presentation scores from the
final Rally One focus (for example conversation-unavailable 88 in the historical
board, 80 in final focus). These are compatibility policies, not two independent
Rally One recommendation engines. This sprint preserves their observable ordering
and copy while sharing eligibility and service assembly. A future removal of old
experiment routes is a separate product decision.

## Selection behavior and pastoral boundaries

- Real near-term fixture RSVP/serve obligations outrank optional invitations.
  Shared facts use explicit boolean memberships, actual pending responses,
  authorized leader count, source-backed unread data and due saved intentions.
- A versioned thread's confirmed zero removes unread priority. Unknown/malformed
  unread metadata produces a review/unavailable action rather than false completion.
- Final candidates sort deterministically by existing score and stable ID; one
  candidate per family and at most two actions are selected.
- Existing explicit completion and care follow-through remove those actions.
  Existing “Not now” uses its current snooze expiry; it is a temporary dismissal,
  not a new permanent task field. Nonurgent deferred actions stay suppressed until
  expiry. Near-term commitments retain their existing urgency exception.
- Prayer/care suggestions require an authorized, named fictional request. Prayer
  is explicit, subsequent messaging is optional, and no private request text is
  included in decision explanations. There are no risk scores, inferred needs,
  auto-messages or provider/model calls.
- `decision` exposes selected IDs, action count, deferred IDs and source-backed
  reasons. The board's historical `taskCount` remains a total pending digest for
  compatibility; it is not a third selected recommendation.

## Representative scenarios

| Scenario | Purposefully different result |
| --- | --- |
| First-time visitor | Welcome/community invitation; zero response-needed actions, no private payload. |
| Established group member | Authorized unread conversation or actual unanswered gathering, then optional care when legitimate. |
| Serving volunteer | Pending serving response; no private group/prayer/leader content. |
| Authorized group leader | Existing unreviewed fixture follow-ups, including an explicit requested check-in when present; revoked role removes leader relevance. |

Tests verify the matrix, deterministic repeated results, no input mutation,
Today/Ask explanation identity, completion, defer/resumption, malformed unread,
revocation, private care exclusion, nonboolean membership and contract projection.
Source-wiring tests moved their assertions to the new owner; behavioral coverage
was retained and expanded. Historical source hash pins reflect the reviewed
extractions only; all approved style/assets are independently compared against
PR #119, without replacement image baselines.
