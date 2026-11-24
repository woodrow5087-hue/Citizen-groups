# UX-01 visual reconciliation — PR #144

Starting head: 4e3baa96cc10ab4b32cbaecb69d19098f05840c0.
Canonical base: f4f81936eb937f36eb9f5229057ecad27bd873ed (0 behind, 13 ahead).
Failure: Preview QA run 45499238793, immutable comparison step,
`scripts/s8-visual-regression.mjs:52`: protected `rally-one-graphite-parity.css`
changed. This failed before screenshot comparisons, not on a visual pixel assertion.
All preceding functional and synthetic gates passed in that run. Historical
artifact download returned Forbidden; no historical screenshot inspection is claimed.
Fresh local screenshot evidence and reports were generated instead.

## Authorized boundary

The owner explicitly approved the existing Read-only layout at immutable commit
4e3baa96cc10ab4b32cbaecb69d19098f05840c0 for design direction and regression scope.
That does not authorize other design changes, final visual/device acceptance or merge.
The charter records this authorization, superseding its pending direction selection.
No application JS, stylesheet, artwork, font, game engine or interface was changed
by this correction.

The protected stylesheet gate now uses the existing exact UX inverse-source guard:
remove only the byte-exact approved Read addition, then require exact equality with
PR #119's original stylesheet. No blanket file exemption or historical hash update.
Negative controls confirmed an altered Read addition is rejected, and an unrelated
CSS append cannot match the historical source. Existing source guard unit tests pass.
All other protected files and the full inventory remain guarded as before.

CI builds two independently archived immutable sources: PR #119 at
5aa88c93c3d4cd22902ef98af98c09b74ca436ce, and approved UX-01 at 4e3baa9 above.
Of the same 48 screenshot comparisons, 45 unaffected states use PR #119 and three
Read states at 320/390/430 use approved UX-01. Each report entry identifies its
reference. PR #119 Read screenshots are retained, and the intentional Read delta
is separately recorded in `approvedReadDeltas`; it is not represented as parity.
No saved screenshot baseline is regenerated, assertion removed, mask applied,
application style overridden or tolerance increased. Missing Read reference fails.

## Rendering input investigation

Running the newly reachable screenshot checks locally exposed an independent
rendering artifact: title JPEG differences and small campus image-edge differences.
Protected source/assets were byte-identical. Campus differences were 1–2 RGB channel
values along rounded image edges (105 raw pixels in one 430px run). An immutable
PR119-versus-itself control also failed (9 raw pixels at 320px), proving application
changes are not necessary to produce this failure. Browser-process isolation alone
and color-profile/runtime-optimization flags did not resolve that control and the
ineffective flags are not included.

Captures now await actual image decoding alongside font readiness. Separate
browser processes prevent the extra Read-reference run warming only one comparison
side. Chromium's supported `--disable-yuv-image-decoding` uses a consistent RGB
image decode path on both sides. With that setting, the same original-versus-original
control passed all nine title/welcome/campus pairs at 320/390/430 with zero raw pixel
differences. The complete dual-reference comparison subsequently passed all 48
pairs with zero raw differences. Product images, CSS, image URLs and browser
runtime are untouched; these are comparison input controls, not a product fix.

## Comprehensive local validation

One complete functional validation pass used locked dependencies and Playwright's
Chromium 159.0.8154.6; successful suites were not repeated.

- npm ci; app units: 842 passed; VersePlay units: 172 passed.
- Build and deploy-preview build passed.
- Browser/mobile/accessibility/source navigation, animated onboarding, Blank Battle,
  Groups/storage safety, standalone Wednesday chat and integrated messaging passed.
- Leadership, full preview/Today/Ask/Read/Connect chain, role journeys and five
  10C.5 member journeys passed, including existing disclosure and deep-link checks.
- Loopback synthetic lab passed at 320/390/430.
- Full VersePlay browser: 433 checks, 49 pairs, zero raw pixel differences,
  zero console errors/font failures.
- Dual-reference visual gate: 74 protected files, 45 PR119 pairs + 3 approved Read
  pairs, zero raw pixel differences, no page errors.

The comparison ran in a separate, exact-source build directory to avoid concurrent
functional-suite rebuilds mutating its served files. Temporary diagnostic controls
remain outside the committed application. CI status and the exact-head preview are
recorded in the PR handoff; passing deployment alone is not QA.

## Physical acceptance stop

PR #144 remains unmerged. On the exact corrected preview, record device/iOS/Safari,
reviewer/date and pass/fail evidence. Check Read's first viewport at small widths,
cream tile and typography, Scripture/reflect/prayer disclosures, read completion,
leader-only tools, classic VersePlay and Blank Battle access, Verse Circuit launch
and Rally One return, deep-link reveal/focus, touch keyboard, reduced motion,
VoiceOver headings/summary expanded state/control labels/focus return and contrast.
Recheck Today/Groups/Team/navigation for unintended changes. Final visual and physical
acceptance and merge authorization remain pending. No production deployment, live
credentials/records, canonical update or recovery-reference change is included.
