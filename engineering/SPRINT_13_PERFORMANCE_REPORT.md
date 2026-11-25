# Sprint 13 performance report

Baseline: accepted run45649077092, 786s preview QA job; timings and reproduction in sprint-13-validation-audit.md. Optimized measurements will be recorded from final exact-head CI in draft PR and attached report. Do not interpret the dependency-install 1s baseline or subsecond build measurement as a promise of substantial savings.

Changes: functional/visual jobs run concurrently on isolated runners; aggregate preview-qa always requires both success. Normal build reduced from seven invocations to one in functional job; preview build retained for functional, separately recreated in visual job. No cross-context/cross-run build reuse. Original npm convenience commands and all suites/assertions/pixel tolerances/source references unchanged. VersePlay workflow also triggers for preview-workflow changes so this infrastructure sprint receives its comprehensive independent gate.

Measure workflow wall/critical path from first job start to aggregate finish, excluding queue, and summed job seconds separately. Compare functional+visual+aggregate against baseline preview job; show supplemental VersePlay separately because baseline preview workload omitted that job. Count duplicated installs/setup as added resource cost. Report OS/browser versions and cache conditions; single samples are directional, not robust statistical savings. No dollar or CPU saving claim without billing/CPU evidence.

Safeguards: advisory classification never skips CI; unknown/shared/security/mixed changes default3. Aggregate checks literal success for both jobs even on failure/cancel/skip. Exact lockfile npm ci retained. Jobs cannot share writable dist or artifacts. Immutable baseline reconstruction remains mandatory. No application files changed; verify clean built file inventory/bytes against starting source, full browser/axe and protected pixel evidence. No baseline cache or changed approval checkpoints. Production/checkpoint refs compared before/after; no production action introduced.

Known limitations: branch-protection API403 prevents authoritative required-context inspection. Admin should independently confirm preview-qa remains required and new child checks cannot substitute for it. Tier2 requires documented dependency review; automatic reduced remote selection and cross-run artifact caching are deliberately deferred. No claim of completed acceptance until exact-head Tier3 CI and Netlify provenance pass.

## Measured optimized sample

Run45654354364 at source3550ae6 (all jobs successful), compared with accepted run45649077092 at7e1736a. Same application bytes, lockfile, validator/source baselines, runner label ubuntu-latest and Node22; two additional unit safeguards in the measured sample. Different runner instances and times: comparable workload, not a controlled CPU benchmark.

| Job | Seconds |
|---|---:|
| functional | 605 |
| visual | 404 |
| preview-qa | 4 |

Core workflow wall/critical path: **612s**, baseline786s; observed change **-22.1%**. Summed core runner wall time: **1013s**, versus786s baseline (**+28.9%**). This is not CPU/billing data. Parallelization reduces observed latency but does not demonstrate resource-cost reduction. Individual suite timing variation contributes; more paired samples are needed before causal/permanent savings claims. Candidate build invocations reduced8→3 (excluding immutable reference builds and separate VersePlay); all tests remain.

Detailed optimized step times:

| Job / Step | Seconds |
|---|---:|
| functional / Set up job | 0 |
| functional / Check out preview branch | 2 |
| functional / Use Node 22 | 1 |
| functional / Install locked dependencies | 1 |
| functional / Run unit and fixture flow tests | 12 |
| functional / Build static preview | 0 |
| functional / Install Playwright Chromium and WebKit | 35 |
| functional / Run mobile, accessibility, source navigation and VersePlay regression | 111 |
| functional / Run animated onboarding → dashboard integration regression | 41 |
| functional / Run Blank Battle mobile gameplay and screenshot QA | 4 |
| functional / Run F-03/F-04/F-08 Groups and storage-protection browser QA | 3 |
| functional / Verify reused standalone Wednesday conversation experience | 11 |
| functional / Verify Wednesday messaging inside canonical Groups and legacy archive | 12 |
| functional / Check the default Today on the Netlify preview build | 360 |
| functional / Exercise isolated synthetic review lab (loopback only) | 7 |
| functional / Save visual QA screenshots and results | 2 |
| functional / Post Use Node 22 | 0 |
| functional / Post Check out preview branch | 0 |
| functional / Complete job | 0 |
| visual / Set up job | 2 |
| visual / Check out preview branch | 5 |
| visual / Use Node 22 | 7 |
| visual / Install locked dependencies | 1 |
| visual / Build deploy-preview once | 0 |
| visual / Install Playwright Chromium and WebKit | 59 |
| visual / Compare immutable PR 119 and owner-approved Read references | 42 |
| visual / Validate Connect behavior and compare owner-approved immutable reference | 280 |
| visual / Save visual QA screenshots and results | 3 |
| visual / Post Use Node 22 | 0 |
| visual / Post Check out preview branch | 0 |
| visual / Complete job | 0 |
| preview-qa / Set up job | 0 |
| preview-qa / Require every validation job | 0 |
| preview-qa / Complete job | 0 |

Supplemental full VersePlay run45654354414: 90 runner seconds, successful. Not included in the baseline preview-only comparison: infrastructure sprint intentionally expands coverage.

Final follow-up adds failure summaries and dirty-worktree escalation, tested locally875/875. Exact-head validation of that final change is mandatory; it is not accepted based only on this measured precursor. Final validation/run provenance is recorded in PR148 without another measurement-only commit loop. Recommendation remains HOLD pending admin confirmation of branch-protection settings (API403) and owner review of runner-time tradeoff.
