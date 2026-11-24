# Sprint 8 validation recovery — PR #121

## Scope and protected refs

Work continues on `rally-one/s8-foundation-consolidation`, based on canonical
`rally-one/develop`. Starting head: `18abe4b8f0552ecaa21235291a89a1b03ee46fdb`.
Canonical base and recovery checkpoint both resolve to
`5aa88c93c3d4cd22902ef98af98c09b74ca436ce`; ancestry was verified (0 behind,
10 ahead at start). Production `main` was read at
`32bed048a18d7bdd7e1ebb8b420736664a2521b2`. No merge, production configuration,
checkpoint, approved artwork, CSS, font URL, title, tagline, onboarding,
VersePlay runtime, or navigation behavior changes are included.

## VersePlay failure: run 45293910536

Downloaded and inspected `verseplay-regression-evidence` (artifact
14875871571), its failed JSON report, before/after screenshots, and pixel masks.
All failures were at 430px: TRACE 83/74 non-AA pixels, LINK 2/2/2,
ECHO 18/25/30, victory 8, Afterglow 57. Image dimensions matched; the changes
were localized to glyphs. The comparator uses threshold zero and remains unchanged.

Reproduction with Chromium 159.0.8154.6 showed the same text-difference pattern
at varying widths, including when BOTH sides loaded the immutable original HTML.
Thus the difference is not evidence of a refactored game visual regression.
Browser-process isolation did not resolve it and was removed.
Response hashing identified different live Google Fonts stylesheet bodies for
exactly the same requested URL:

- `072db0eb74794251e95c186c0ad0ea7a319b65375527f2ec4f56295d764fea1d`
  selected `/s/manrope/v23/xn7gYHE41ni1AdIRggexSg.woff2` and
  `/s/oxanium/v21/RrQQboN_4yJ0JmiMe2LE0Q.woff2`.
- `762a63048b2014d1bea28dc9931005caffc4c59f9900f47860c197f63add3030`
  selected different `/l/font?kit=...` binaries. Their hashes differed too.

Mismatched screenshot pairs aligned with mismatched initial stylesheet delivery;
font-family availability checks alone could not detect this. The original CI
artifact did not record network bodies, so its exact response variant cannot be
recovered. The same pixel pattern and unchanged game sources support this diagnosis.

The harness now captures each first successful live browser font response and
replays it per URL within the run. All sides receive identical external inputs;
status failures and missing fonts remain failures. Resource hashes are recorded
and checked. No font fixture, baseline image, tolerance increase, CSS mutation,
or production self-hosting was introduced.

A second nondeterminism was independently reproduced with original-vs-original:
the 300ms incorrect-choice border flash could expire between captures (738
non-AA pixels at 390px in that control). Consecutive stable frames did not mean
the same semantic moment. The harness now observes the actual flash appearing
and clearing, checks the persistent error message, and captures that settled
error state. Normal-motion comparison remains required.

## Preview failure: run 45293910546

The timeout in `m5-mobile-parity-browser-check.mjs:62` expected Groups home after
returning from a portrait opened on Today. `portraitOrigin` deliberately stores
view, pane, discovery state and scroll; `portrait-return` restores them. The
approved Back button says Today on that path. The expectation was stale.

The test now verifies Today restoration and its selected nav tab, then explicitly
opens Groups to compare the shared six-person roster. The product navigation is
unchanged. The complete preview sequence subsequently passed locally, including
320/390/430px parity, directory-origin return, guest profiles, connected journeys,
leader walkthrough, and Connect flows.

## Blocked storage in both logs

Both logs contained jsdom's uncaught `Blocked storage` error in the unit fixture
at `test/rallypoint.test.cjs:418`. The fixture intentionally makes the
`localStorage` property getter throw. Groups render passed that getter directly
to `RallyConversationRead.markRead` outside a guard. The adapter cannot catch an
exception thrown while evaluating its argument. jsdom reports event-handler
exceptions without automatically failing that assertion, so the test was falsely
reassuring despite the broader unit job passing.

Guard the argument evaluation at the existing read-cursor boundary, consistent
with the other guarded callers. The existing storage warning and in-memory
interaction remain intact. The unit fixture now asserts zero uncaught window
errors through navigation and send. Three historical source-hash pins were
updated solely for this reviewed nonvisual two-line guard; screenshot baselines
and all other pinned assets were untouched.

## Validation record

- `npm ci`: passed.
- `npm test`: 295 passed, zero failures; blocked-storage exceptions gone.
- `npm run test:verseplay`: 172 passed, zero failures.
- Static build and deploy-preview build: passed.
- `test:browser`, `test:onboarding`, `test:blank-battle`, `test:groups-safety`,
  `test:chat-lab`, `test:groups-integrated`: all passed.
- Full leadership and `preview-today-browser-check.mjs` chain: passed, including
  M5 parity at 320/390/430px, M6 and Sprint 7 scenario gates.
- First complete font-controlled VersePlay run: 395 checks, 49/49 pairs,
  zero raw pixel differences, zero normal-game errors or failed font requests.
- Original-vs-original 430px control after correction: 92 checks, 12/12 pairs,
  zero mismatches. The temporary diagnostic runner is not shipped.
- Final run with explicit error-flash observations and input-equality assertions:
  430 checks passed, 49/49 pairs, zero raw pixel differences, zero normal-game
  errors or font failures. Remote CI must pass before continuing development.

Physical iPhone Safari and VoiceOver acceptance cannot be claimed from Linux
Chromium automation. External font delivery remains a product dependency; the
harness controls comparison inputs without changing that production behavior.
The detailed approved 8B.1–8E sequence is not present in the checkout (8B.1 is
not defined); the user has been asked for its authoritative location. No later
stage is complete or authorized for release merely because preview QA passes.
