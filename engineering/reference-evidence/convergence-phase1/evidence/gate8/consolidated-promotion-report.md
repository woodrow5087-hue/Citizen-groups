# Rally One Foundation 2.0 — Gate 8 accepted and promoted

**Result: COMPLETE.** The owner authorized final Gate 8 acceptance and promotion of the exact accepted source into `rally-one/develop` only. [PR #151](https://github.com/woodrow5087-hue/Citizen-groups/pull/151) merged on **2026-11-26 at 17:06:13 UTC**. Post-promotion verification completed at **17:24:16 UTC**. No outstanding engineering regression or failed acceptance gate was identified.

## Canonical identity and authorization

- Canonical merge commit: **`b7bb0687a498f2ba9ab1f2a244b187013ceea339`**.
- Accepted PR head: **`3838aa87f6e8217c2b779bfcfa5976dda72dcb56`**.
- Merge parents, in order: previous canonical **`d038fc6adfdbc7c9b5925fc91e475cb1f15c7467`**, then the accepted PR head above.
- Complete source tree of both accepted head and merge: **`d43e2b8d32396b9ea9f6710b3a1d93c02d171fa6`**. This is exact whole-tree equality, including application, tests, lockfile and workflows.
- Promotion used the normal GitHub merge API with `expected_head_sha` and merge-commit method. Draft status was removed as the necessary preceding step. No admin-bypass option, force push, direct source commit, branch deletion or protection-setting change was used.

Before merging, the exact head/base, all three passing PR workflows, native Netlify preview success, evidence-file integrity and canonical ancestry were reverified. No candidate implementation was changed. The owner's new acceptance/promotion authorization supersedes earlier HOLD/no-merge statements in historical PR and programme notes.

## Validation and acceptance

| Gate | Evidence and result |
|---|---|
| Accepted protected application QA | [45849062336](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45849062336) PASS at `3838aa8`; 929 units, full configured browser/mobile/accessibility/synthetic suites, 64 historical and 86 Connect pairs with zero raw differences. |
| Accepted Foundation mobile QA | [45849062005](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45849062005) PASS; 72 scenes, zero page errors/axe violations. |
| Accepted independent VersePlay QA | [45849062258](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45849062258) PASS; 172 units, 433 browser checks, 49 comparisons, no console/font failures. |
| Fixture determinism | Previously completed 12 corrected fresh-browser controls all zero raw pixels, including initial 0px/2px native textarea poses. The 1,431-pixel failure was isolated to native textarea scroll state. Baselines, inventories, thresholds, application source and functional assertions remain protected. |
| Physical Safari/VoiceOver | Owner-confirmed **13/13**, carried forward across the verified identical runtime and then identical merge source tree. Final Gate 8 acceptance explicitly authorized. No redundant physical run required or claimed. |
| Fresh canonical regression | [45864800091](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/45864800091) **PASS on the merge commit**, first attempt, **16m35s**, all **21 steps successful**. 929/929 units, zero skipped; all configured browser/mobile/accessibility/onboarding/game/storage/messaging/preview journeys and synthetic review completed. Historical 75 protected sources/64 pairs and Connect 10 protected sources/86 pairs: **zero raw differences**, no errors. |

The existing independent Foundation and VersePlay workflows are PR-only; they did not create new runs for the canonical push. Their accepted results apply to the merge's **identical complete source tree**. The canonical push freshly reran the full configured protected application workflow. No workflow was altered to skip, reduce or manufacture acceptance. Existing nonblocking Actions v4 runtime-deprecation annotations remain tooling maintenance debt.

The three official device journey scopes remain: visitor discovery/Read/game history and focus return; group conversation return/RSVP consistency; volunteer decline/coverage/Today All Set consistency. The owner's aggregate 13/13 attestation is authoritative acceptance evidence. Original item IDs and device/iOS settings are not itemized in the accessible record; that is a residual audit-detail limitation, not a newly untested assertion or a reason to repeat the checks.

## Deployment provenance and preview links

**Canonical branch deployment:** [immutable canonical build](https://6b086708cfe8cbce7f62b6e0--citizen-connect-test.netlify.app/).

- Netlify deploy **`6b086708cfe8cbce7f62b6e0`** is ready, context **branch-deploy**, branch **rally-one/develop**, exact commit **`b7bb0687a498f2ba9ab1f2a244b187013ceea339`**, production publication null.
- A clean archive of the exact merge was built with the existing `NETLIFY=true`, `CONTEXT=branch-deploy` configuration. **All 186 deployed files match that build byte-for-byte**, including HTML, scripts, styles, assets and approved references; no transformation allowance was needed.
- GitHub exposes the successful canonical QA as a Check Run. No legacy commit-status entry is emitted for this Netlify branch deploy; provider metadata and all deployed payloads independently verify delivery. No passing status was manually inserted.

**Foundation 2 experience:** [accepted immutable Foundation preview](https://6b084f8d62492b74b209f1c5--citizen-connect-test.netlify.app/foundation2/).

- This deploy remains ready at accepted head **`3838aa8`**, whose full source tree equals the canonical merge. Its 15 Foundation sources and two generated synthetic bundles were verified, and all 17 Foundation runtime files match the pre-correction accepted runtime byte-for-byte.
- Its native GitHub Netlify preview status remained successful before promotion; the provider still reports this preview ready after promotion.
- **Existing publication boundary:** `scripts/build.cjs` publishes Foundation 2 only in actual Netlify `deploy-preview` context. The canonical branch deploy preserves the legacy root and does **not** publish `/foundation2/` (verified HTTP 404). This is source promotion, not a default-experience cutover. The accepted Foundation preview above remains the correct review link. No build/deployment configuration was changed to widen that boundary.

## Production, PR #150 and recovery preservation

- Production `main` remains **`32bed048a18d7bdd7e1ebb8b420736664a2521b2`**.
- Netlify's production publication remains deploy **`6b00560bc816d49907a2911e`**, branch `main`, the same commit, original publication **2026-11-20T14:16:03.797Z**. Before/after/final production metadata is identical.
- PR #150 remains **open/draft** at **`57409b8ceb573d092545906ca6738d6e19428ae3`**. Its head was not merged, rebased or modified. The target branch's authorized advancement naturally changes the surrounding base context.
- All **18 checkpoint/recovery reference entries** in the complete opening inventory remain unchanged, including annotated tag objects/peeled targets and the legacy visual-recovery branch. Pre-correction tag `rally-one/checkpoints/2026-11-26-f2-gate8-pre-correction` still preserves **`e7a6e752a07eede2052b2ae4082b420277bd0f9a`**.
- The full remote-ref diff contains only the authorized canonical head advancement and GitHub's automatic removal of the synthetic `refs/pull/151/merge` test ref. That synthetic ref is not a recovery checkpoint. The feature branch remains at the accepted head.

## Governance limitation, resolved verification gap

The administrator reports inspecting **Settings → Branches → Branch protection rules** and finding **no existing classic branch-protection rules**. This reconciles with the authenticated API's **empty effective active-rules responses for both `main` and `rally-one/develop`**. The sole listed active ruleset, 27798928, protects specific legacy `rally-point/reference-*`/design-lock branches; it does not establish enforcement on the production/canonical branches or Rally One checkpoint tags.

**Accordingly, absence of server-enforced branch protections is a confirmed governance limitation, not a failed engineering test.** The owner knowingly authorized this promotion after that verification. Established acceptance gates were manually verified and remained passing. No applicable requirement was bypassed, no protection setting was modified, and no claim of server-enforced review/check/force-push/deletion safeguards is made. Verified ref integrity is distinct from policy-enforced immutability.

A separately authorized governance follow-up should decide branch/recovery protections and exact required contexts. It is not implemented by this promotion or implicitly authorized by the audit proposal.

## Remaining scope and recommendation

Gate 8 is accepted and promoted; post-merge QA and deployment verification are complete. Residual limitations are the acknowledged governance gap, PR-only Foundation publication, branch-specific/PR-only validation triggers for future work, incomplete device-detail itemization, and historical documentation that predates final acceptance. No production readiness, live member-data integration or full legacy feature-parity claim is made.

**Recommended next scope:** authorize a read-only **feature-parity and architecture audit** from this canonical commit. Deliver a capability/acceptance matrix, domain/state/storage ownership map, confirmed gap/dependency findings, and prioritized remediation/cutover gates. Cover Today/Ask Rally, Groups/Team, Connect, Read/all games, entry/navigation/accessibility, permissions/privacy, degraded states, persistence and deployment/CI applicability. Preserve approved designs and source owners; do not start features, refactoring, storage migration, live integration, new visual references or default-route cutover during the audit.

See [recommended audit scope](recommended-parity-architecture-audit.md) for priorities and required owner decisions. It is planning only; no audit implementation or new sprint has begun.

Reports/evidence are external deliverables so the canonical merge remains exactly the verified commit. Supporting JSON contains source-tree identity, deployment hashes, production identity, acceptance evidence, current ref inventory and the full successful CI step list. `SHA256SUMS.txt` records bundle integrity.
