# UX-03 — Premium Connect experience

Accepted baseline PR #146 merge 94d373cdc30a0defe2d35054770312faaf2db747. Branch rally-one/ux-03-premium-connect. Owner authorizes development phase, not final visual reference, physical acceptance or merge.

## Source audit
- connect-design-lab.html defines inbox, people rail, optional care moment, conversation rows, search, thread, room and direct conversation surfaces.
- connect-member.js embedded adapter checks host.access(), uses existing readModel and repository, updates unread and previews, marks read on opening actual thread, preserves group draft/reply, delegates room/direct writes and prayer/RSVP to host. Setup removes standalone bottom navigation. Keep standalone lab behavior and embedded permission boundaries.
- connect-design-lab.js owns screen navigation, scroll restoration, session-local direct drafts, composer sync, room Chat/Plans/People tabs and search. Preserve existing contracts and distinct persistence semantics.
- connect-usability.css and rally-one-connect-usability-shell.css protect keyboard, safe areas, focus, composer and existing contrast fixes. Audit actual cascade before changing anything.
- Verify actual embedded host bridge and return/focus behavior in rallypoint.js before implementation. Do not replace architecture.

## Implementation sequence
A. Audit rendered accepted inbox, group thread, direct message and room at mobile widths. Inventory actual fixtures and current permissions; retain four primary tabs and persistent Connect access.
B. Compact inbox heading, recognizable existing portraits, prioritize conversations over optional care card, clear previews and accurate unread/unavailable states. Improve existing search and empty/guest states; no fabricated presence, timestamps, message counts or search scope.
C. Refine group and direct conversations with readable type, comfortable line lengths, incoming/outgoing distinctions, sender identity, existing timestamps, reply/reaction affordances and accessible focus. Preserve text escaping, message order and local-only disclaimers.
D. Refine composer and room Chat/Plans/People, safe areas, keyboard behavior, drafts, send feedback, scroll anchoring and return focus. Respect reduced motion. Do not invent attachment, voice, delivery or live capabilities. No automatic messages or care actions.
E. Cross-surface journey verification: Today unread -> actual group thread -> reply -> return -> Today updated; Groups and Team destinations; zero unread inbox access; guest, authorized member, revoked/unavailable data; direct/room draft semantics and permission-denial paths. Keep current owners and storage keys unchanged; any privacy defect discovered must be documented and repaired narrowly with negative tests.

## Design system
Use accepted UX02 matte charcoal/graphite, Citizen red and cream; large readable body type, compact headings, consistent existing icons, subtle borders and press feedback. Aim for generous reading space without forcing no-scroll on chat. Preserve authentic accepted portraits; reconcile discrepancies with canonical fixture identity instead of inventing people. Care is optional, private and human-led. No glows, excessive gradients, duplicate global navigation or unrelated redesign.

## Validation
Inspect historical source inverse guards and strict reference manifest before edits. Keep PR119/144/145/146 references and all unaffected surfaces pixel-identical. Identify exact Connect-only intended deltas and candidate capture states (inbox, search, thread, reply, direct, room tabs, guest, unavailable) across 320/375/390/430, short height and doubled text. Obtain explicit owner approval before pinning a new immutable Connect reference; no blanket exceptions, masks, threshold relaxation or skipped gates. Test actual embedded and standalone behavior, authorization, keyboard/focus, axe, reduced motion, safe areas, composer and scroll. Run targeted then comprehensive local application, VersePlay, synthetic and visual checks before consolidated push. Create draft PR targeting develop, verify exact-head CI and immutable preview provenance. Stop at physical Safari/VoiceOver and final visual acceptance; separate explicit merge authorization required.

No production deployment, recovery changes, real data, credentials, integration changes or unrelated features. Target Dec 1 demo freeze. Status: charter and source audit committed; runtime implementation, rendered review and validation pending.

## Implementation ledger — 2026-11-25

Connect-scoped presentation and navigation-focus corrections are implemented; see
`ux-03-validation.md` for ownership, file boundaries and physical checklist.
The optional care card follows conversations in DOM order. Existing repositories,
permissions, persistence keys, read models, intelligence, fixtures and unrelated
screens are unchanged. Focus is consolidated into the existing navigation controller;
no competing message or navigation state was introduced.

Intentional Connect-only candidate captures are recorded separately from immutable
PR119/144/145/146 comparisons. No new visual reference is approved or pinned.
Owner visual-reference review is the next required decision after local validation
and draft-preview preparation; device/final acceptance and merge remain separate.

Local application, messaging, accessibility, synthetic and immutable historical
visual gates passed; result details and runner corrections are in ux-03-validation.md.
No owner visual reference has been pinned.

## Owner-requested focused refinement — 2026-11-25

The owner requested one visual refinement pass on PR147 before approving a Connect
reference; `db1daf0` is not an approved immutable Connect reference. The new candidate
keeps all runtime owners/fixtures and refines only Connect presentation: larger row
portraits/text, non-stretching sparse circle rail, compact room identity and event
card, message spacing/type, relational People list and a compact labeled 44px app
return control. The parent dialog/return handler, keyboard fit and focus lifecycle
are unchanged. Shell CSS is guarded by an additional exact inverse to its original
canonical hash; prior reference hashes and pixel comparisons remain intact.

`ux03-profile-review.mjs` now validates group-only, serving-only and combined
membership at all four phone widths, plus combined membership at short height and
doubled text: 14 embedded cases/44 state captures. Expected authorized inbox counts
are 3 / 1 / 4. It additionally checks sparse rail sizing, compact geometry, reply
sending, shared Chat/Plans RSVP state, axe, four tabs and host focus restoration.
Existing standalone, persistence, unavailable/guest, draft/reaction and cross-surface
suites remain. No new visual reference may be pinned and no merge performed without
explicit owner approval. Consolidated review evidence is separate from references.

## Owner visual-reference approval — 2026-11-25

The owner explicitly approved `26153bab8660144e4bf8e50bbef6482b6e112d12`
as the intentional Connect-only visual regression reference. This supersedes all
reference-pending statements above. Preserve the approved inboxes/portrait rail,
conversation type/bubbles, direct experience, Room Chat/Plans/People, event widgets,
composer and return control. This is reference approval only; physical Safari /
VoiceOver, final visual acceptance and merge authorization remain outstanding.

Reference establishment is validation/documentation only: no application runtime
change. The immutable source manifest protects ten Connect HTML/script/style files.
The strict runner builds the approved commit and compares all 86 existing standalone
and embedded state captures, including four widths, short height, doubled text and
three membership profiles, requiring zero raw pixel differences. Both existing
functional/assertion suites execute on each WebKit build. Their original Chromium
CI invocations also remain, so this adds engine coverage without removing checks.
All original 64 historical comparisons,
source inverses/hashes, game protection, synthetic and other regression gates remain.

Strict Connect pixels use Playwright WebKit after Chromium self-comparisons exposed
intermittent portrait-edge raster variations in identical builds. All existing
Chromium functional checks and historical pixel gates are retained unchanged in
scope. This is a validation-engine decision; the approved application is unchanged.

## Authorized deterministic-portrait candidate — pending new reference review

Following the blocked 3c2ad3a gate, the owner authorized preparing a narrowly scoped
portrait-rendering correction and a new Connect-only reference review. The candidate
uses a single explicit circular clip for rail images and removes redundant opaque
background fills behind rail/list images. Portrait assets, dimensions, circular
borders, layout, typography, colors, state and runtime JavaScript remain unchanged.
`26153ba` stays the immutable historical reference; no replacement is pinned here.
The existing reference hash guard must remain blocked until explicit source approval.

## Owner revised reference approval — 2026-11-25

The owner explicitly approved corrected source `042ab829400437093058b5e99c9c438b0f33fe17`
as the revised Connect-only visual reference. This supersedes the pending-reference
status above. The active manifest and CI archive now pin that immutable source; only
the approved portrait stylesheet hash changes. The original 26153ba manifest is
retained byte-for-byte, with a regression test proving reconstruction of all ten
previous source owners through the exact portrait inverse. No runtime, screenshot
tolerance, inventory, assertion or historical comparison is removed or relaxed.
Physical iPhone Safari/VoiceOver, final visual acceptance and merge authorization
remain outstanding. Automated acceptance results follow after validation.

## CI evidence reconciliation and SVG paint candidate — 2026-11-25

Reference establishment is recorded at 1db15eb, but CI run 45642393746 is blocked:
all earlier unit, functional/mobile/messaging, synthetic and historical gates pass;
the Connect raw-pixel gate fails at the 320×568 combined-profile inbox. The GitHub
connector successfully retrieved this run's artifact, allowing direct examination.
Its only differing capture has exactly 404 changed pixels within (226,67)–(296,88):
the Search and New Conversation SVG icons paint nearly black in the approved-build
frame and cream in the candidate-build frame. Every other pixel and all other
85 capture pairs match. Portrait pixels are identical. Earlier local portrait-edge
variants were real controls, but did not explain the repeated CI blocker.

The SVGs use symbol/use paths and an inherited currentColor stroke. The candidate
sets the two SVG strokes explicitly to the already-approved #f3e9d8 cream. This
removes their dependency on inconsistent inherited-color painting, preserving all
geometry, icons, palette, runtime controllers, state and functionality. The active
042ab82 reference remains pinned; no unapproved source or baseline is substituted.
Historical source tests reconstruct both 042ab82 and 26153ba through exact inverses.
The old-source guard is expected to reject the changed stylesheet until explicit
source-reference approval. Physical acceptance and merge remain blocked.

## Owner SVG source-reference approval — 2026-11-25

Owner explicitly approves bb8f2446a71221148587f09bdf8192d5bde57d83, replacing 042ab82 as the Connect-only reference. The original 042ab82 manifest is retained alongside 26153ba, and reconstruction tests remain. No runtime or tolerance changes. Recent complete candidate validation (86 repeatability pairs, 64 historical pairs, native color controls) remains applicable to identical runtime bytes. Physical Safari/VoiceOver, final visual acceptance and merge remain outstanding. Final CI and immutable preview provenance are recorded in PR147.
