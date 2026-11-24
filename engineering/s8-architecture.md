# Rally One architecture and ownership

Rally One is a church community companion. Its purpose is helping people be
known and supported after they join, through explicit commitments and human-led
care. This engineering sprint preserves PR #119's interface and behavior.

## Dependency and ownership audit

| Boundary | Existing owner | Dependents and constraints |
| --- | --- | --- |
| Composition and DOM effects | `rallypoint.js` (~1200 lines at entry) | Renders four destinations, binds actions, focus, overlays and portrait motion. Oversized; extract coherent source access and recommendation orchestration, not an indiscriminate controller rewrite. |
| Application fixture state | `rallypoint.js` defaults and explicit reducers | Historical messages, RSVP, serving, reading and explicit care transitions. No additional state store. |
| Profile and involvement | `rallypoint-today.js`, `rallypoint-welcome.js` | Own existing local profile, campus and boolean demo memberships. Profile choices do not verify identity or grant real authority. |
| Main persistence | `rallypoint-storage-guard.js` | Sole atomic/rollback guard for primary and profile keys. Preserve original malformed bytes and interrupted-write protection. |
| Messaging domain | `lib/conversation-*`, mock repository, policy, transport | Pure contracts/policy, versioned modern snapshot and read cursor. Bundled explicitly for browser; legacy messages remain separate history. |
| Messaging application access | `rallypoint-conversation-read-model.js` | `createAccess` receives lazy storage and current membership. Catches property-getter failures, refuses unauthorized IO, delegates normalization and cursor persistence to the existing adapter. |
| Messaging presentation | `wednesday-chat-lab.js`, `connect-member.js`, Connect iframe | Explicit send/reply/draft/read events; loading Today is not a read event. Scope/organization checks remain in policy. |
| Shared member context | `rally-one-member-context.js` | Read-only canonical projection plus explicit transition API. No IO, browser globals or identity duplication. |
| Personalization | SmartDashboard model → PriorityBoard → UnifiedFocus | Existing deterministic pipeline; shared orchestration is consolidated in 8D. Legacy companion/Smart Stack routes remain supported, not alternative authorities for Rally One. |
| Ask Rally | `rallypoint-personal-companion.js` (~464 lines) | Intent parsing and approved response rendering consume the shared model/board. No external AI or independent member database. |
| Navigation and focus | `navigate`, `portraitOrigin`, Connect overlay in composition root | DOM focus/scroll effects depend on live elements; retain here. Portrait origin is session-only and restores original view, pane, discovery and scroll. Do not persist another navigation stack. |
| Presentation | Existing renderers and ordered CSS | Protected charcoal/cream/red design, four tabs, title/tagline, portraits and typography. No CSS extraction or reordering in this sprint. |
| VersePlay | `verseplay/core`, content, game controller/renderer/storage/sounds | Already modular and validated. Remains independent of church participation and personalization. Classic VersePlay and Blank Battle preserved. |
| Future provider contract | Server-only `pilot/s7-readonly-member-contract.cjs` | Receives separately verified server sessions; never browser claims. No live provider, auth, credentials or endpoint in this sprint. |

## Conflicts and coupling addressed or deliberately retained

Direct modern-storage property evaluation was duplicated in four composition-root
call sites and had already caused uncaught blocked-storage exceptions. The new
access API centralizes the boundary inside its existing owner, resolves membership
on every call, and retains `peek`/`markRead` for current messaging consumers.

Today and Ask Rally separately assembled the same dashboard/context/focus inputs.
This is an application-service seam, not a reason to move DOM rendering into the
domain. A shared injectable pipeline will own those inputs and expose one decision
snapshot to both surfaces. Today ranking and optional/legacy suggestions have
historical differences; preserve them deliberately while consolidating common
eligibility and selection rules under tests.

The app has two conversation histories: historical `groupMessages` and the modern
versioned conversation. This is intentional archival coexistence, not two unread
sources. Only the modern cursor determines unread state. Onboarding/profile owns
membership; no inference from portraits, attendance, browsing or a leader label.

Persistence access remains direct in some legacy fixtures, Connect and onboarding,
but each has its own existing validation boundary and data owner. Avoid a universal
repository abstraction that conflates their formats or invents a migration. The
composition root retains rendering/focus effects; splitting every handler before
there is a stable domain seam would increase coupling rather than reduce it.

## Loading and public build

Ordered deferred scripts are the current module system. Browser globals have
CommonJS exports for pure unit tests. Add a runtime module only to its dependency
position and the explicit `scripts/build.cjs` allowlist. No framework is required.
Server contracts, migration tools, engineering notes, tests and QA artifacts must
remain outside `dist`; the current build copies all `docs` and `assets`, so internal
operational material belongs under `engineering`, not `docs`.

## Decisions and validation

- 8B.2: lazy conversation access within the existing adapter preserves all storage
  keys and record shapes; revoked membership is checked before touching storage.
- No navigation redesign: existing automated journeys cover Today-origin and
  directory-origin portrait return, focus restoration, guest discovery and Connect.
- Immutable PR #119 SHA `5aa88c93c3d4cd22902ef98af98c09b74ca436ce` supplies the
  visual comparison build. Comparison uses threshold zero without masks or saved
  replacement baselines; fixed time, identical local font files and reduced motion
  align inputs. Normal motion and VersePlay are separately exercised.
- Stage and final results are recorded in `s8-progress.md` and the acceptance report.
