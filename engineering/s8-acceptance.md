# Sprint 8 engineering acceptance

## Scope and milestones

Starting checkpoint `8ef33da30b7f2c92e25f5bfc9e28e14bf56057e0` was reconciled with
the recovered owner-authorized roadmap. No completed CI remediation was duplicated.
All work remains on PR #121 against `rally-one/develop`.

| Milestone | Commit | Result |
| --- | --- | --- |
| 8B.1 stabilization | `dcd7e9b` | Existing green engineering checkpoint and protected refs verified; fresh install and two identical 179-file builds. |
| 8B.2 modular boundaries | `c7ca1f7` | Audited owners/dependencies; centralized lazy authorized modern-conversation access in its existing adapter; 297 unit tests, Groups journeys and 36 exact visual pairs passed. |
| 8C data contracts | `322671d` | Provider-neutral member v1 envelope/validator/fixture adapter with source quality and privacy restrictions; existing conversation/action/migration contracts retained; unit/contract and 36-pair visual gates passed. |
| 8D intelligence | `858bf26` | Shared pure Today/Ask service, common eligibility facts, canonical memberships supplied to legacy helpers; 309 unit tests, leadership/M6 journeys and 36 exact visual pairs passed. |
| 8E acceptance | This commit and verified checkpoint tag | Broader full acceptance and permanent immutable-reference CI comparison, developer handoff and known limitations. |

The 8E audit additionally tightened source metadata: missing RSVP/serving/campus
is unknown, explicit invalid data is malformed, and blank names cannot become a
confirmed fallback identity. These server/tool contract changes are covered by
new tests and do not change the browser projection or persistence.

## Final automated evidence

| Check | Result |
| --- | --- |
| Fresh locked dependencies | `npm ci` passed |
| Final application units/integration/fixture/migration/policy | 310 passed; zero failed; no uncaught blocked-storage exception |
| VersePlay engine/content/storage | 172 passed; zero failed |
| Static and deploy-preview builds | Passed; two final deploy-preview builds are byte-identical across 180 files; private/tool/engineering source excluded |
| Mobile/accessibility/persistence/source navigation | Full Phase 1 suite passed, including 320/375/390/430px, safe areas and desktop |
| Animated onboarding | Six viewport cases passed |
| Blank Battle, Groups storage safety, chat lab and integrated messaging | Passed |
| Final leadership and complete Today/Connect preview chain | Passed at 320/390/430px; Connect also passed at 1280px |
| Approved Rally One visual comparison | 48/48 pairs; zero raw pixel differences; no page errors |
| Protected design and game bytes | 74 shipped assets/runtime/style files match immutable PR #119 |
| VersePlay browser/visual/motion/recovery/keyboard/a11y | 430 assertions; 49/49 pairs; zero raw pixel differences; no normal-game errors or font failures |
| Privacy/build source review | No `lib`, `pilot`, `engineering`, app tests or VersePlay tests in dist; no credential/live-adapter/AI dependency introduced |
| Runtime size/performance diagnostic | Root shipped JS 323,480 bytes vs approved 321,056 (+2,424 bytes); 400 warmed decisions in 140 ms (~0.35 ms each) in this Linux environment. Diagnostic only, not a device guarantee. |

`test-results/s8-visual/results.json` and screenshots contain each app comparison;
`test-results/verseplay/results.json` contains game, motion, font-input and contrast
findings. CI uploads these artifacts. No comparator, tolerance, approved image
baseline, CSS, artwork, font URL, animation, onboarding, title/tagline or navigation
concept was changed. Frozen composition-root pins reflect the reviewed extraction;
independent exact image and protected-file checks remain strict.

The new runner also exposed capture nondeterminism during repeat verification:
the JavaScript clock did not control the title CSS fade, and the GPU path varied
seven rounded-photo-edge pixels. Explicit matching CSS timeline endpoints and
the existing VersePlay CPU/text capture configuration resolved both; two fresh
48-pair runs passed with zero raw differences. No application CSS/animation or
tolerance was changed.

The permanent CI step fetches and builds approved SHA
`5aa88c93c3d4cd22902ef98af98c09b74ca436ce`, rather than updating image baselines.
It compares title at a controlled normal-motion time and subsequent settled
screens at fixed time/reduced motion. Full motion/navigation/a11y/VersePlay suites
provide complementary coverage. All existing CI requirements remain in place.

## Verified checkpoint and remote evidence

After both workflows pass for the exact final head, create the annotated tag
`rally-one/checkpoints/2026-11-24-s8-automated` pointing to that commit. The tag
annotation records the head SHA, successful workflow URLs, local suite results,
and physical-device limitations. It is a development checkpoint, not a release,
production merge, pilot approval or a replacement for the original recovery ref.
PR #121's description will carry the same exact-head CI evidence.

No live Netlify preview for this new head is claimed without a successful
head-specific deployment status and a responding URL. If unavailable, retain the
canonical base and report that gap; do not silently retarget to legacy develop.

## Handoff and remaining manual gates

Architecture/module owners: `s8-architecture.md`. Contract/adapter/migration rules:
`s8-data-contracts.md`. Intelligence rules and role matrix: `s8-intelligence.md`.
Commands and independent device-review checklist: `s8-handoff.md`. Historical
failure diagnosis remains in `s8-ci-recovery.md`; all stage gates are in
`s8-progress.md`.

Physical iPhone Safari and VoiceOver have NOT been accepted. Manual decorative
contrast, sound/listening, browser-specific behavior, rights/Scripture editorial
approval, real identity/auth/consent/retention and live-pilot authorization remain
separate gates. Google Fonts remains a game runtime dependency. Local fixtures
are not real member records. The composition root remains large; further bounded
extraction needs the same parity/journey gates. No inferred pastoral risk,
automatic outreach, live messages, provider credentials or production deployment
was introduced.

Recommended next milestone: independent physical-device/accessibility acceptance,
then a synthetic provider-adapter and verified server-session/consent/authorization
design review before any proposal to connect real member data.
