# UX-03 — implementation and acceptance ledger

Approved Connect-only reference: `26153bab8660144e4bf8e50bbef6482b6e112d12`
(owner approval 2026-11-25). Physical Safari/VoiceOver and final visual acceptance
remain outstanding; no merge is authorized. This status supersedes earlier
reference-pending entries retained below as history.

Canonical base: `94d373cdc30a0defe2d35054770312faaf2db747` (accepted PR146).
Working branch: `rally-one/ux-03-premium-connect`. No reference approval, physical
acceptance or merge authorization is inferred from approval of prior sprints.

## Ownership and implementation

The existing embedded same-origin frame remains Connect's presentation boundary.
`connect-member.js` and the host bridge in `rallypoint.js` are unchanged: membership,
revocation checks, versioned conversation repository, cursor, replies, reactions,
drafts and unavailable-data handling retain their owners. Direct-message drafts
remain session-only per person; group drafts remain versioned/persistent. No storage
keys, dependencies, routes, delivery receipts, presence indicators or integrations
were added. Existing sample identities, portraits, dates and message content remain.
Standalone is explicitly a fictional lab, not an authenticated member experience.

`connect-usability.css` adds a final Connect-only presentation layer: deep matte
charcoal/graphite, Citizen red/cream, quieter portrait rings, compact editorial
headings, readable conversation previews, genuine unread accent, shared group/DM/room
bubble treatment, round Send control, compact room identity, tonal Plans/People cards,
responsive type, safe areas and reduced-motion press feedback. No global app CSS
changed. Existing contrast, keyboard resize and composer constraints remain intact.
The inbox DOM now places the optional care card after actual conversation rows,
matching visual and reading order. Nothing drafts or sends automatically.

Navigation focus is consolidated in `connect-design-lab.js`, removing the competing
delegated handler in `connect-alive.js`. Destination headings receive focus without
scrolling; Back restores the actual launcher, including touch-origin controls and
the New Conversation dialog launcher. Search Escape restores Search. Permission
checks precede screen changes. The People pane's existing scroll region is named and
keyboard-focusable; short screens exposed this existing accessibility defect.
No message, send, keyboard submission, read-marking or scroll-state policy changed.

## Regression safeguards

Historical hashes and PR119/144/145/146 references remain unchanged. The strict
visual runner still compares every prior unaffected surface with its immutable
source, including accepted premium Read and adaptive Today/Groups/Team. An exact
inverse removes only the declared Connect CSS addition before byte-comparing the
original stylesheet. Negative controls reject changed/duplicated declarations and
retain unrelated historical mutations. This source declaration is not approval of
a new visual reference. No tolerance, mask, snapshot replacement or skip was added.

`ux03-browser-check.mjs` exercises six viewport/text contexts: 320×568, 375×667,
390×844, 430×932, 390×500 and doubled root text at 390×844. Each captures inbox,
empty search, thread, direct, room Chat/Plans/People; candidate states require axe
and no document overflow. It checks actual focus return, touch Return draft behavior,
per-person drafts and keyboard room tabs. Historical mode captures review evidence
only and does not attest historical accessibility. CI always runs candidate mode.
Existing suites cover embedded Today -> unread thread -> reply -> Today cursor,
Groups/Team/Read entry, group persistence/reload, DM/room writes, replies/reactions,
guest, revoked and unavailable data, focus, safe areas and source preservation.

## Acceptance stop

Intentional visual changes are limited to the Connect document (inbox/search,
conversations, composers, room tabs and dialog). Candidate screenshots and separate
before/after pixel deltas are review evidence, not a pinned regression reference.
Owner must explicitly approve the exact candidate source before a Connect golden
reference is established. Then complete exact-head automation/provenance and owner
physical Safari/VoiceOver and final visual acceptance. No merge without a separate
explicit authorization.

Physical checklist (record reviewer, iPhone model and iOS/Safari version):
1. Review inbox, authentic portraits, previews/unread, search and empty/guest states.
2. Open from Today, Groups, Team and Read; return to the original route/focus.
3. Read/reply/react in Wednesday Group; check Today unread updates and saved draft
   after closing/reload; unavailable storage must retain prior records.
4. Check different DM drafts, explicit Send and session-only draft semantics.
5. Review room Chat/Plans/People, RSVP and local-only disclaimers; no live delivery.
6. Exercise real keyboard, multiline/emoji/IME, Send, scrolling and keyboard dismissal
   on short/landscape screens without obscured composer or accidental submission.
7. VoiceOver names, reading order, headings, room tabs, reply/cancel, Search Escape,
   origin focus and dialog close; larger text, safe areas, contrast and Reduce Motion.
8. Recheck unchanged Today/Groups/Team/premium Read, Connect access, all three games
   and return paths. No real data or credentials.

## Local validation — 2026-11-25

- Locked install (`npm ci`), normal build and deploy-preview build passed.
- Application suite: 863 tests passed; all existing assertions retained. Seven new
  Connect tests include source-inverse negative controls, canonical source-owner
  hashes, denied navigation, destination/origin focus and dialog return. Hash checks
  work in shallow CI without relying on git history.
- VersePlay unit suite: 172 passed.
- All standard browser suites passed: phase1/mobile/accessibility/storage fallback,
  onboarding, Blank Battle, Groups safety, standalone Wednesday chat and integrated
  Groups chat; leadership demo, full preview/Today/Ask/role/care/navigation/Connect,
  10C.5 member journeys, premium Read and adaptive UX02 six-context scenarios.
- UX03 six-context/42-state candidate audit passed, including axe, focus, touch
  Return, DM draft separation, keyboard room tabs, overflow and motion policy.
  Existing embedded Connect suite passed 320/390/430/1280 and malformed/guest states.
- Isolated 11E synthetic browser review passed at 320/390/430.
- Strict historical visual gate passed: 75 protected files, 64 pairs (32 PR119,
  4 premium Read, 28 adaptive), zero raw different pixels, no page errors.
- Connect review captured 42 historical/candidate pairs with intentional differences;
  no new reference pinned. Evidence: ignored `test-results/ux03` (candidate/accepted
  screenshots and `intentional-deltas.json`); historical mode is capture evidence,
  not historical accessibility acceptance. CI uploads candidate screenshots.

Local runner corrections: builds were isolated/serialized after a concurrent
preview rebuild interfered with the legacy suite. The strict visual invocation
uses the same full Chromium binary/flags as existing CI; default headless shell
stalled under the clock-driven capture. The VersePlay invocation explicitly targets
the running local server rather than its unused default port. No test assertion,
source reference, timeout or pixel tolerance was weakened to address these issues.

Remote CI, immutable deployment provenance and final VersePlay browser results are
recorded in the draft PR handoff when complete. Owner visual-reference approval,
physical-device/final visual acceptance and separate merge authorization remain open.

Final VersePlay browser result: 433 checks, 98 screenshots/49 visual pairs,
no mismatches, no console errors and no font failures. All local gates are complete.
The earlier local port invocation failure was environmental and resolved without
any runtime or validation change.

## Focused owner review refinement — 2026-11-25

The previous `db1daf0` candidate was returned for visual refinement, not approved.
The focused update changes two existing presentation stylesheets only; no runtime
JavaScript, HTML fixtures, storage or permission owners change from that candidate.
Conversation portraits are 50–56px with 17px names, 15px previews and 18px message
body text; Your Circle uses fixed 58–62px items rather than expanding sparse people.
Room header and event card are verified below 135px and 190px respectively at normal
phone text sizes; large text is allowed to grow and scroll. Sender/time spacing is
consistent across group/direct/room. People uses open portrait/name rows with warm
cream type. The app return stays visibly labeled and keeps its 44px target, existing
accessible name, dialog close handler and original-route focus restoration.

The added profile review covers all authorized conversation content: small-group
member 3 rows, serving volunteer 1 row, combined 4 rows. Four widths plus short and
doubled-text contexts yield 14 embedded cases and 44 captures. No people, presence,
message counts or permissions were invented to fill sparse inboxes. Room screenshots
are explicitly scrolled to show their content for review; interaction/scroll-policy
tests remain unchanged. Notifications expire naturally before review captures; no
screenshot masking or runtime style overrides are used.

Local focused results: 864 application tests, 172 VersePlay units, standalone six
viewport/text contexts, all 14 embedded profile cases, existing Connect behavior /
persistence / read-cursor / malformed / guest / cross-tab suites pass. Strict
historical validation again passes all 75 protected files and 64 comparison pairs
with zero raw pixel differences and no page errors. Full preview, synthetic and
VersePlay browser results and exact-source remote verification are recorded in the
PR handoff when complete. No source hash, visual tolerance or assertion was weakened.

Consolidated evidence: `test-results/ux03-refinement/review-board.png`, `review.pdf`
and `review.html`, alongside full-size screenshots and `results.json` (ignored QA
artifacts, not runtime assets or visual references). Eight panels show three inbox
profiles, group thread, direct conversation and all three Rally Room tabs.

To review in the preview: use the existing demo entry, profile avatar, then
`02 · Small-group member`, `03 · Serving volunteer`, or `05 · Group + Serving`.
Open the persistent Connect control after each selection. Scenes are existing
controlled demonstration fixtures, not authentication or live member records.
Owner reference approval, physical iPhone Safari/VoiceOver and final visual
acceptance remain outstanding. The eight-category physical checklist above applies.

Final focused local run: all 14 embedded profile cases/44 captures passed on the
final review script; full preview and 11E synthetic review passed again. VersePlay
browser regression again passed 433 checks and 49 pairs with no mismatches, console
errors or font failures. No new immutable visual reference is established.

## Approved reference establishment — 2026-11-25

Owner authorization pins only the Connect visual direction at exact commit
`26153bab8660144e4bf8e50bbef6482b6e112d12`. Approval covers inboxes/compact circle,
conversation type/bubbles, direct messaging, Room Chat/Plans/People, event widgets,
composer and compact return. No product design or application runtime is changed
while establishing this reference; 186 built files match the approved build exactly.

`test/helpers/ux03-reference.json` records the immutable source and SHA-256 hashes
of ten Connect HTML/script/style owners. `ux03-visual-regression.mjs` verifies those
hashes on the approved build and candidate, runs both existing standalone/profile
suites on each build, checks exact capture inventories, and compares 42 standalone
plus 44 embedded pairs with **zero raw different pixels** required. Missing/extra
frames, dimension drift, substituted reference bytes and any source/pixel mutation
fail. Unit negative controls exercise real one-pixel PNG and dimension mutations,
plus mutations of each protected Connect file. No masks or tolerance changes exist.

CI fetches/builds the exact approved source, not a mutable branch or saved images.
The original Chromium standalone/profile functional invocations remain. The added
strict WebKit gate executes the same complete assertions on reference and candidate.
Historical capture mode is explicitly excluded. Output redirection and paint-readiness controls apply only to test evidence.
Normal Chromium launch settings remain unchanged; no application code is modified.
All original historical (PR119/144/145/146), synthetic, messaging and game gates stay
in place; no approved source hash is replaced. Evidence is under
`test-results/ux03-visual/{reference,candidate}/{standalone,embedded}` and results.json.

Local application tests: 868 passed, including four new reference/inventory/source/
pixel negative-control tests. VersePlay unit tests: 172 passed. Comprehensive browser,
new strict Connect, historical and game regression results are recorded below and
in the exact-head PR handoff when complete. The existing eight-category physical
checklist remains mandatory, with actual iPhone model/iOS and reviewer details.

Strict-gate raster investigation: Chromium self-comparisons intermittently differed
only at circular portrait edges even though all 186 application files were identical.
Cold processes, full-page capture, image/font/paint waits, audit ordering and CPU
raster controls did not reliably eliminate those native-render variants. No design,
image mask, reference source or tolerance was changed to conceal this behavior.

The new strict Connect gate therefore uses pinned Playwright WebKit, adding
Safari-family engine coverage while preserving every original Chromium check.
Twelve repeated WebKit controls matched with zero raw differences. Both sources
use the same WebKit engine, fresh per-case browser processes, native full-page
screenshots and uninstrumented-first capture; every axe assertion still executes.
Reduced-motion duration is compared as exact numeric seconds (1e-6), preserving
its value across Chromium's `1e-06s` and WebKit's `0.000001s` serialization.
Single-pixel/source/dimension negative controls remain mandatory. This is additional
automated WebKit coverage, not physical iPhone Safari or VoiceOver acceptance.

CI installs both Chromium and WebKit using Playwright's supported installer. Local
non-root WebKit setup uses the same official browser binary with user-owned Debian
libraries and an optional `RALLY_WEBKIT_EXECUTABLE` launcher; no system configuration,
QA check, or CI dependency validation is bypassed. The normal CI path needs no
custom launcher. Final full-gate results below validate the chosen engine/pipeline.

WebKit readiness control: one doubled-text snapshot initially showed the previous
normal-size native paint although the DOM had its larger text applied. Strict
capture now flushes layout before font readiness and requires two consecutive
byte-identical native screenshots (the same bounded eight-frame rule used by the
historical suite), failing if native paint never stabilizes. This readiness loop
never reads the approved image or changes application styles. Real one-pixel and
source/dimension regressions still fail the separate zero-raw-difference comparison.
Two added unit controls prove stale frames are not accepted and persistent
instability fails rather than relaxing the gate. Total application test count: 870.

Visual pose is explicit: after navigation RAFs and font weights have settled, each
visual fixture is scrolled to the start of its active content region before native
capture. A doubled-text thread control had different allowed initial scroll offsets
as font/composer layout finished; comparing different portions of the same thread
is not a style comparison. This known-position pose matches the reviewed thread /
Room presentation. Default opening position and saved scroll restoration remain
covered by the unchanged original Chromium behavioral suites, and all accessibility,
permission, draft, reply, reaction and RSVP assertions still execute. No region is
cropped, hidden or exempted from the exact comparison.

## Final local automated acceptance

- Strict approved Connect reference: WebKit 27.2, ten protected source files,
  **86 comparison pairs / zero raw pixel differences / no errors**. Complete
  standalone and profile functional/accessibility assertions passed on both builds.
- Original historical gate: 75 protected files, **64 comparison pairs / zero raw
  pixel differences / no page errors**, preserving PR119, prior Read and UX02 sources.
- All 13 comprehensive local browser suites passed: mobile/legacy/source flows,
  onboarding, Blank Battle, Groups safety, standalone/integrated messaging,
  leadership demo, full preview/Today/Ask/care/roles/Connect, representative journeys,
  premium Read, adaptive scenarios, synthetic review and VersePlay browser.
- VersePlay browser: 433 checks, 49 pairs, no mismatches, console errors or font failures.
- Final application/unit count is 870; VersePlay unit count is 172. Normal and
  deploy-preview builds pass; all 186 built application files match approved source.

The capture investigations and engine choice above are documented rather than
hidden by masks, skipped scenes or relaxed thresholds. Original Chromium coverage
remains mandatory, alongside the added WebKit gate. Runtime, permissions, read
cursors, persistence and approved presentation remain unchanged. CI/exact-head
Netlify provenance and the current device-acceptance URL are recorded in PR147.
Physical iPhone Safari, VoiceOver and final visual acceptance are outstanding;
record the actual device model/iOS/Safari, reviewer and results for all eight
checklist categories. Reference approval does not authorize merging.
