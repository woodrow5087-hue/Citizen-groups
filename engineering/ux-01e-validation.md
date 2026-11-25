# UX-1E implementation and validation handoff

Canonical baseline: a2b246ef3f854b7a4b6d5ecf07f3b1c8ac7359c7.
Branch starts at owner charter c04a0e3; runtime candidate: immutable
16868e6c5f86d38c296e71bb6da8f94f32446028. The owner explicitly approved that
rendered direction as the Read-only regression reference, not device acceptance
or merge authorization. See `ux-01e-premium-read.md` for the acceptance record.

## UX-1E.1 — measured compact landing

Secondary-game row bottom / navigation top, CSS pixels, normal text:

| Viewport | Accepted baseline row | Premium row | Navigation top |
| --- | ---: | ---: | ---: |
| 320×568 | 612.70 | 565.78 | 498 |
| 375×667 | 624.75 | 575.50 | 595 |
| 390×844 | 630.28 | 580.45 | 772 |
| 430×932 | 645.06 | 592.66 | 860 |

Both primary cards and secondary games fit at 375×667 and larger representative
viewports without compacting the shared Connect header. Short 320×568 and 390×568
viewports scroll naturally. Doubled text at 390×844 scrolls without horizontal
overflow; no fixed card heights truncate expanded content. Native Classic details
is the sole Classic entry, with the existing game host, deep-link target and
`data-ux-read-panel` identity preserved. Existing disclosure restoration owns open
state; there is no new state owner or navigation mechanism.

## UX-1E.2–3 — editorial artwork and authentic game identity

The cream tile keeps the actual reading passage and adds restrained open-book
line artwork. The matte Citizen-red Verse Circuit tile uses a hexagonal circuit,
three nodes and a trace/check motif from its existing identity. Artwork is inline,
decorative, aria-hidden and nonfocusable; no image/font/network dependency, glow,
new gradient, invented progress, reading time or content library is added.
Existing typography, palette and shared shell remain. Both secondary controls use
matching charcoal surfaces, icon size, arrow treatment and minimum 48px targets.

## UX-1E.4 — accessible interaction

Press feedback is a 1px movement with a 140ms transition. Reduced motion disables
both movement and transition, verified with actual pointer input. Native summary
keyboard/expanded-state semantics remain; visible focus styles are retained.
Expanded-panel audits exposed existing low contrast in reading details and rhythm
editor text. Read-premium-scoped foreground corrections retain cream/ink colors
and pass axe. Scripture, reflection, prayer, leader authorization, all three games,
Connect, game return paths and guarded persistence remain under existing owners.

## UX-1E.5 — validation and regression boundaries

Comprehensive local commands: npm ci; npm test; npm run test:verseplay; normal and
deploy-preview builds; test:browser, test:onboarding, test:blank-battle,
test:groups-safety, test:chat-lab, test:groups-integrated; leadership, full preview,
10C.5 role journeys, synthetic lab, full VersePlay browser, premium layout and
strict immutable visual comparison. Local results: 842 application tests, 172 VersePlay tests, all listed functional
and synthetic browser suites passed. VersePlay passed 433 checks and 49 visual
pairs with zero raw differences and no console/font errors. Premium layout passed
all six viewport/text scenarios and motion checks. The visual gate passed 74
protected files and 45 + 3 pairs with zero raw differences. Exact-head CI and
preview provenance are recorded in the PR handoff, not inferred from deployment.

Premium layout coverage: 320/375/390/430 widths; short 390×568; doubled text at
390×844; native Classic and Scripture reveal; axe WCAG A/AA; normal/reduced-motion
press behavior; no horizontal overflow or page errors. The same check is added to
CI. Functional suites are run once after the coherent implementation; only
failing/newly changed capture controls are investigated separately.

Historical hashes are unchanged. An exact inverse transform reconstructs the
accepted UX-01 source before the existing historical reconstructions run. No
whole-file exemption is introduced. Source protection still checks all 74 files.
Immutable PR119 (5aa88c9) remains the reference for 45 unaffected screenshot pairs;
three Read pairs use owner-approved 16868e6. The prior accepted PR144 Read source
(4e3baa9) is independently archived and captured; `premiumReadDeltas` reports its
intentional differences separately (131039 / 155334 / 174234 raw pixels at
320 / 390 / 430). No saved baseline, mask, tolerance or historical hash is replaced.

A local unchanged-campus mismatch (70 raw pixels at 430px) exposed incomplete
capture determinism despite the inherited RGB decode setting. An immutable
original-versus-original control and the full comparison passed after full-raster /
deterministic compositor capture settings were added on both sides. The complete
local gate passed 45 + 3 pairs with zero raw differences and no errors. Product
rendering, images, CSS and game animations are not overridden by those test flags;
normal-motion gameplay is independently covered by the unchanged VersePlay suite.
Temporary controls are not shipped.

## Physical acceptance stop

Use only the verified immutable preview whose exact source SHA is in the PR.
Record reviewer/date, iPhone model, iOS/Safari version and pass/fail evidence.
Check first viewport and scrolling with safe areas, landscape and larger text;
Scripture artwork/legibility and passage; native Classic disclosure and actual
solo/pass play; Blank Battle; Circuit launch/gameplay/Rally One return; reading
completion, reflection, prayer, leader-only controls, deep-link reveal and focus;
press feedback and Reduce Motion; VoiceOver headings, labels, summary expanded
states, reading order and focus return; Connect access and unchanged other tabs.
Owner reference approval does not complete these physical tests. Keep the PR draft
and unmerged until physical/visual acceptance and explicit merge authorization.
No live records/credentials, production deployment, canonical update, recovery-ref
change or roadmap implementation is authorized by this work.
