# Today/Connect QA remediation — PR #143

Failure: run 45463589384, commit bdee179a99fd44d0c11cf510eb3eb2c2904596c7,
`Check the default Today on the Netlify preview build`.
`connect-member-browser-check.mjs:30` timed out clicking
`[data-priority="group-unread"] button[data-go="group"]`.
The following assertion requires that unread priority disappears after actually
opening the thread. Neither click nor assertion is removed or broadened.

The step builds locally in deploy-preview context and serves loopback port 8514;
it is not testing the Netlify CDN. All recorded assets loaded successfully.
The downloaded QA artifact has screenshots from preceding successful flows but
no Connect-member screenshot/state/trace at the initial failing click (captures
occur later). No historical trace/console snapshot is invented. Fresh reproduction
captures screenshots, complete fixture state, console/page errors and browser
traces under ignored `test-results/qa-investigation`.

At 2026-11-23 12:00 UTC: unread is the hero and RSVP is the second action.
At the failing 2026-11-24 19:06 UTC time: RSVP is the hero and unread is the second
row, still showing three messages. Both use identical app code and fixture data;
console/page errors were empty. The gathering is Wednesday Nov 25 at 18:30.
Within 24 hours, RSVP scores 100, above unread 76. The selector intentionally
addresses the hero (`data-priority`), while the secondary row uses `data-row`.

The last passing branch baseline b61e25a (run 45458113300) started Nov 24 at
18:18 UTC, just before the 18:30 urgency boundary. The test and final focus module
are byte-identical between that baseline and this PR before correction. Canonical
199a4a4 subsequently failed the same flow after the boundary; no canonical ref is
changed here. This is wall-clock-dependent synthetic test setup, not application,
selector, initialization or deployment provenance regression.

Correction: pin only this flow's browser Date to Nov 23 at noon before navigation,
matching its intended unread-first scenario and existing Connect usability fixture.
Timers/animations still run normally. All selectors, assertions, widths, timeouts,
ranking, UI, storage and functionality are retained. No new production behavior,
baseline replacement, tolerance change, real records or credentials are introduced.

Targeted Connect flow passed at 320/390/430/1280px. Complete automated suites,
including loopback-only synthetic review and immutable PR #119 comparison, are
being rerun and must pass before any continuation. Physical iPhone Safari and
VoiceOver acceptance remain outstanding; no merge or next sprint is authorized.

## Physical-device acceptance record

Use the corrected immutable Netlify deploy permalink recorded in the PR handoff.
Record full source SHA, deploy ID, device/iOS/Safari, reviewer/date and pass/fail
with evidence. Use fictional data only and a fresh preview-host session.

- Title/tagline, onboarding campus and membership choices retain approved design.
- Today prioritizes according to actual date; do not expect unread to always lead.
  Open its visible message action and confirm unread clears only on thread entry.
- Check Today/Groups/Team/Read, Ask Rally agreement, portrait origin/focus return,
  RSVP/serve explicit responses, Connect draft/reply/refresh and keyboard viewport.
- Complete VersePlay/Blank Battle and Verse Circuit TRACE→LINK→ECHO→Afterglow;
  check sound and Safari Back.
- With VoiceOver check headings, tab names/current state, button/input labels,
  dialog focus/Close restoration and status announcements. Check Reduce Motion,
  safe areas, landscape and larger text.
- Check visitor/member/volunteer/leader demo restrictions and restore local state.

Synthetic review is loopback-only and is never added to the public Netlify build.

## Additional deployed initialization race

Exact-commit CDN verification checked 185 files for the first correction deploy.
The deployed Connect flow exposed another test race: static inbox/thread DOM can
be visible before deferred Connect member setup, causing a stale unread badge or
a draft-field assertion to run before saved state is projected. Waiting for the
existing `body.connect-member` marker whenever a fresh embedded inbox is opened
(and after the initial Today link) synchronizes on actual application setup. No
assertion, timeout, selector contract or runtime initialization is changed.
