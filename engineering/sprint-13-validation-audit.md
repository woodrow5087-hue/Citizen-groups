# Sprint 13 validation audit

Read-only audit completed before workflow edits. Starting canonical rally-one/develop: d038fc6adfdbc7c9b5925fc91e475cb1f15c7467; PR147 merged. Approved Connect source bb8f244; validated source head 7e1736a. Production main 32bed048a18d7bdd7e1ebb8b420736664a2521b2. Recovery refs captured with git ls-remote before edits; no alteration authorized.

## Reproducible measured baseline
GitHub run 45649077092, job 139328247064, accepted PR147 workload, ubuntu-latest / Node22 / lockfile-installed Playwright. Job duration 786s. Reproduce with `gh api repos/woodrow5087-hue/Citizen-groups/actions/runs/45649077092/jobs`; retain started_at/completed_at per step. Sequential critical path equals job duration, excluding queue time. Measurements are step wall times, rounded to seconds, not CPU usage.

| Step | Seconds |
|---|---:|
| Set up job | 1 |
| Check out preview branch | 1 |
| Use Node 22 | 2 |
| Install locked dependencies | 1 |
| Run unit and fixture flow tests | 7 |
| Build static preview | 0 |
| Install Playwright Chromium and WebKit | 26 |
| Run mobile, accessibility, source navigation and VersePlay regression | 92 |
| Run animated onboarding → dashboard integration regression | 30 |
| Run Blank Battle mobile gameplay and screenshot QA | 4 |
| Run F-03/F-04/F-08 Groups and storage-protection browser QA | 2 |
| Verify reused standalone Wednesday conversation experience | 10 |
| Verify Wednesday messaging inside canonical Groups and legacy archive | 9 |
| Check the default Today on the Netlify preview build | 291 |
| Exercise isolated synthetic review lab (loopback only) | 5 |
| Compare immutable PR 119 and owner-approved Read references | 38 |
| Validate Connect behavior and compare owner-approved immutable reference | 261 |
| Save visual QA screenshots and results | 2 |
| Post Use Node 22 | 0 |
| Post Check out preview branch | 1 |
| Complete job | 0 |

## Architecture and inventory
Static normal build and separate deploy-preview build select different Today fixtures: never interchange their test inputs. npm scripts intentionally build before browser suites for local convenience. CI previously rebuilt normal dist seven times, then preview once. Unit suite 872 tests; VersePlay 172 units / 433 browser checks / 49 pairs from accepted evidence. Functional scripts: phase1, onboarding, blank-battle, groups-safety, chat-lab, groups-integrated; preview scripts: leadership-demo, preview-today, s10c5-member-journeys, ux01e, ux02, ux03, ux03-profile-review. Synthetic review owns its loopback server. Existing scripts include axe, mobile widths, focus, permissions and persistence assertions.

Historical runner reconstructs PR119, Read, premium Read and UX02 by fixed SHA: 75 protected sources / 64 zero-raw pairs. Connect separately protects ten sources / 86 WebKit zero-raw pairs including standalone/embedded, profiles, short screens and doubled text. Current and retained previous source manifests are immutable; browser capture and comparison implementation are outside this optimization.

## Governance and provenance
PR147 merge verified independently through GitHub and fetch. Branch-protection endpoint returned 403: required contexts cannot be fully inspected with current token. Visible repository ruleset 27798928 protects reference branches against deletion/non-fast-forward; it is not evidence of canonical required-check settings. Preserve existing preview-qa and regression names; never bypass protections. Netlify immutable deployment metadata must match exact SHA, branch, PR and context, and all clean-build files must byte-match deployed output. A successful build alone is not QA. Physical acceptance remains distinct.

## Bottlenecks and proposed changes
Measured: preview journeys 291s, Connect visual 261s; together dominate. Run functional and visual work in separate runner filesystems concurrently, preserving all suites and an unconditional aggregate preview-qa. Functional builds normal once before consumers, then preview once; visual job builds preview separately. Each job installs locked dependencies, using existing setup-node npm cache. Dist/test-results cannot race across job filesystems; artifacts have distinct names. Build reuse is intra-job exact checkout/context only.

Estimated: critical path should approach max(functional, visual) rather than their sum. Additional runner setup increases summed resource time; measure, do not promise savings. Avoid splitting individual suites into many jobs, duplicating setup further. No cross-run build or screenshot cache: exact environment identity and signed evidence retention are not implemented. Browser caching deferred: measured install cost is small relative to suite cost and OS dependencies must always be verified. No tests deleted as duplicates: repeated functional checks inside visual runners establish valid captured state.

## Risk
Infrastructure changes are Tier3. Path classification alone is insufficient. New classifier is advisory, defaults unknown/shared/mixed to Tier3, never gates CI, and tests prove classifier edits themselves cannot reduce CI. Existing full workflows independently exercise classifier and workflow changes; mandatory source/pixel gates remain. Branch-protection visibility is an unresolved administrative limitation.
