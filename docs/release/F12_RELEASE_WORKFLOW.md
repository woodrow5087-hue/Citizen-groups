# F-12 — Rally Point Release Workflow

**Status:** Implemented in a draft PR for review; repository-level branch protection and live rollback rehearsal must still be completed by an authorized GitHub/Netlify administrator.

**Approval:** Product sponsor selected professional release workflow (F-12); this does not authorize automatic merges, deployment to production, or use of real church data.

## Protected visual source of truth

- **Approved UI:** Rally Point v0.8 — Unified Experience.
- **Pinned commit:** `84e489b86851e853948a7d4246475e83b7ddd085`.
- **Immutable reference branch:** `rally-point/v08-preferred-design-snapshot`, [design snapshot PR #35](https://github.com/woodrow5087-hue/Citizen-groups/pull/35).
- **Active development/integration branch:** `rally-point/development-v08` (**separate from the snapshot**).
- **Production source:** `main`; do not merge cumulative preview PRs straight into it.
- **Audit backlog:** Issues [#36–#47](https://github.com/woodrow5087-hue/Citizen-groups/issues?q=is%3Aissue+AUDIT+F-) and [planning PR #48](https://github.com/woodrow5087-hue/Citizen-groups/pull/48).

## Feature change flow (no automatic merge)

1. Pick an approved, scoped issue. Resolve prerequisites and document its testable acceptance criteria.
2. Create a feature branch from the **current `rally-point/development-v08`** (initial F-12 setup began from pinned v0.8 before that integration branch existed). Never work directly in the frozen snapshot.
3. Create a **draft PR into development** with the GitHub PR template: issue, why, risks, test steps and visual impacts. Staff-only work must use synthetic fixtures and no real passwords.
4. GitHub Actions runs `npm ci`, unit tests, build, Playwright navigation + accessibility + onboarding + Blank Battle checks.
5. The workflow checks out the **exact pinned v0.8 commit**, builds it independently, and compares screenshots at fixed viewport/time for Welcome, Today, Groups, Team, Read, Blank Battle and Leader, plus desktop Today.
6. Every candidate/baseline/diff image and machine-readable comparison report is stored as CI artifact. Changes exceeding the visual threshold **fail the check**. An intentional visual exception requires an explicit product-owner discussion, written record and approved follow-on baseline/review strategy; do **not** simply raise the threshold, disable the CI job or substitute Studio Concept designs.
7. Review the working Netlify PR preview, run a manual core-journey smoke test, and have the sponsor explicitly approve. A passing pipeline is **necessary but not sufficient**.
8. Merge the scoped feature PR **only into development**, after approval and successful checks. Promotion from development to any shared staging, then `main`, is separately reviewed/authorized.
9. Attach release evidence (source SHA, preview/build URL, screenshots, QA report, approval, known risks and rollback target) to the issue/PR. Close only after acceptance criteria are independently verified.

## Review / checks

- **Unit:** `npm test`.
- **Static packaging:** `npm run build`.
- **Mobile/browser + accessibility:** `npm run test:browser`.
- **Onboarding:** `npm run test:onboarding`.
- **Blank Battle:** `npm run test:blank-battle`.
- **Release integrity:** `npm run test:release`.
- **Visual:** `npm run test:visual` — requires current `dist/` and a freshly built `.release-baseline/dist/` from the pinned source.
- **Existing pilot gate:** `npm run pilot:check` should *fail* until church approval and real integration/security readiness; don't misinterpret preview QA passing as approval for live member data.

The eight screenshot comparisons are deterministic in the CI runner (same Chromium, viewport, clock and assets). They are useful change detectors but **not** substitutes for manual visual inspection or device testing. A pixel match is not a general correctness/security guarantee.

## Required GitHub administration (manual; NOT applied by this PR)

A repository administrator should configure GitHub **Settings → Branches / Rulesets**:

- `rally-point/v08-preferred-design-snapshot`: **deny pushes/force-pushes/deletion and merging** by ordinary maintainers, protect as permanent reference.
- `rally-point/development-v08`: require PRs, at least one independent approval, all required checks (including `Rally Point Preview QA / preview-qa` once available), block force-pushes and deletion, dismiss stale reviews on new commits, restrict direct pushes.
- `main`: require explicit production authorization, approved PR and required tests, restrict pushes, and keep production deploy credentials / Netlify publishing restricted.
- Record exactly who may approve, merge and publish. Keep those permissions separate where practical.

**Important:** GitHub rule enforcement depends on account/repository settings. A workflow file and a draft PR **do not** establish branch protections or required reviewers. Until settings are confirmed, human discipline is the primary control.

## Staging and release

Netlify already builds GitHub PR deploy previews. A preview is **not** the production app. If the church wants a persistent staging site with separate settings, create it deliberately before any real data integration. Never place real member data or production secrets in public PR previews.

Use the [release review checklist](./F12_RELEASE_REVIEW_CHECKLIST.md) before any promotion. Product owner approval is explicitly required. **No automation in this PR merges code or publishes production.**

## Rollback procedure (operator checklist)

### Before a production release
- Record the **currently published Netlify deploy URL/ID**, its GitHub commit, build output checksum if available, and who authorized that release.
- Confirm it remains available and is safe to republish.
- Record data/storage migration impact separately; a frontend rollback does **not** automatically reverse database schema or user data changes.
- Perform a smoke test on a staging preview and establish the support/incident contact.

### If a frontend-only release fails
1. Stop/disable the affected release path as appropriate; alert responsible church/technical owners.
2. Use the appropriate Netlify project's **Deploys** history to identify and **republish the previously verified successful deploy**, if available and authorized; do not publish an unverified older preview.
3. Verify canonical user-facing URL and critical functions (Welcome, Today, Groups, Team, Read, VersePlay).
4. Revert the offending changes in a separate GitHub PR with review so source control and deployment state agree.
5. Attach incident, impacted version, recovery version, timestamps, smoke-test results and follow-up issues.

### If real data, auth or backend changes are involved
- Stop and follow the **church-approved security, backup, migration and incident-response process**. Do not assume a Netlify publish alone makes a database or permissions rollback safe.

### Recovery rehearsal
The project owner and authorized deploy administrator should **practice** the rollback on non-production staging and record evidence **before** the first real-member pilot. This PR documents the procedure but **has not performed a live rollback**.

## Current execution state

| Control | Status in F-12 PR |
|---|---|
| Immutable v0.8 source SHA and separate development branch | Created |
| Issue-linked draft PR and standard review checklist | Implemented |
| Automated unit/browser/accessibility checks | Already present; retained |
| PRs into `development-v08` trigger QA | Added |
| Deterministic screenshot diff vs exact approved commit | Added; requires CI verification |
| CI upload of baseline/candidate/diff images | Added; requires CI verification |
| Human sponsor approval before merges | Documented; admin-enforced review rules **pending** |
| Branch protections and restricted production publish | **Pending manual administrator configuration** |
| Staging rollback exercise | **Pending hands-on rehearsal** |
| Real-member authorization | **Not granted** |
