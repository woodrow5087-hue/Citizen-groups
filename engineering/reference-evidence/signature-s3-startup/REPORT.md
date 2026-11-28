# Rally Signature S3 startup proof

**PASS — exact905 validation HEAD and exact799 runtime are independently verified byte-equivalent.** Observed source/ref state at 2026-11-28T15:02:10.240017+00:00; served equivalence completed 2026-11-28T15:02:06.047183+00:00. This snapshot precedes the parent's authorized S3 recovery-tag/successor-lane work.

- PR160 is open, draft and unmerged, exact HEAD `905f7da15d8039c53ce47f42f2d2392125c41334`, branch `rally-one/signature-s1-s2`, canonical base `rally-one/develop`. Provider metadata, remote branch head and remote PR head agree. Working tree was clean at the verification checkpoint.
-905 is the direct child of runtime `799a2690b62773487845aea93ee76377c4682c29`. Accepted E2B runtimebb34cb0, E3B7756470 and canonical076a3393 remain ancestors. The only799→905 files are the documented M5 clock/precondition fixture and authoritative tracker.
- Fresh independent git archives/builds of both799 and905 produce222files each, every built byte identical. Builds used the existing `NETLIFY=true CONTEXT=deploy-preview node scripts/build.cjs` path in separate scratch directories; no repository build output was changed.
- Fresh public API metadata verifies both exact-commit immutable deploys, ready, deploy-preview, review160 and unpublished to production. Fresh reads of **all222 served paths per deploy (444reads)** match the respective independent builds and match one another. The sole documented build-to-served variation is the pre-existing Netlify PrettyURLs legacy-link/quote rewrite in `foundation2/index.html`; there are zero unexplained differences. Both fresh build/served manifests also match the earlier source-specific independently verified manifests.

| Identity | Exact immutable review |
|---|---|
|905 validation/test/documentation head|https://6b0a2b07526d4d774b7fb598--citizen-connect-test.netlify.app/foundation2/|
|799 exact runtime|https://6b0a28912ff171557c3c4eb3--citizen-connect-test.netlify.app/foundation2/|

Canonical `076a3393eef013304e715c6bc283031af4040df1` and main `32bed048a18d7bdd7e1ebb8b420736664a2521b2` remain unchanged. All25protected ref/peeled identities, the accepted E2B tag object+target, and frozen PR150/156/157/158/159 branch+PR-head refs match the prior preservation snapshot. The full remote observation used `git ls-remote`, respecting this checkout's single-branch fetch configuration. No protected ref was moved. `engineering/reference-evidence/` remains unchanged from E3B; no old archive payload was rehashed or historical rendering investigation initiated.

Read-only exact905 check metadata currently shows Foundation `capture` and full `preview-qa` completed successfully (runs46092121926/46092121864). No CI or runtime suite was rerun by this prerequisite audit. Earlier source-specific successes/failures remain attributed to their original heads.

## Scope and next authorized action

AGENTS.md and the authoritative tracker were read. The tracker still records the frozen S1/S2 checkpoint; the owner's later explicit S3 authorization is a new development authorization, **not S1/S2 acceptance**. OriginalPNG files remain unavailable and the exact-image reference column remains owner-deferred. E3B physical acceptance, S1/S2 creative/changed-surface physical acceptance, historical promotion blockers and owner-reserved E4 approval remain open.

The prerequisite is satisfied for the parent to preserve exact905 with the authorized recovery tag and create **one** S3 successor lane. No merge, canonical promotion, default cutover, production publication or acceptance is implied. This audit created only scratch proof and isolated build directories; it changed no repository source, branch or ref and overwrote no earlier evidence artifacts.

`startup-summary.json` is the compact machine-readable outcome. `source-preservation.json`, `pr160.json`, `remote-refs.txt`, `source-diff.txt` and `pr160-checks.json` retain source/ref/PR/check evidence. `build-manifests.json`, `served-equivalence.json`, separate Netlify metadata and build logs retain all222path proofs and prior-artifact provenance. `SHA256SUMS.txt` covers top-level evidence files; the two independent source/build trees remain alongside them.
