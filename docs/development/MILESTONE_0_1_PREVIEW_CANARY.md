# Milestone 0.1 — Canonical Development Preview Canary
**Rally Point / Citizen Church**  
**Created:** November 21, 2026  
**Change type:** Documentation-only canary; no application logic, CSS, datasets or deployment configuration changed by this PR.

## Why this file exists

This small PR targets **`rally-point/develop`**, not `main`. It is a deliberately harmless test to verify that our GitHub Actions checks run on the canonical development branch and that Netlify can provide Deploy Previews for PRs whose base is that branch.

- Canonical baseline: audited v0.3 `01cce2801a15565d34b042304758ed73d9877449`.
- The existing application keeps its four-tab **Today / Groups / Team / Read** shell, local fictional demo data, and approved **Premium ALIVE Hybrid** design.
- `main` and production remain separate; **do not merge this PR to `main`**.
- The preview is not a live-member pilot, production approval, or verification of Planning Center access.

## GitHub CI gate to check

The existing `.github/workflows/rally-point-preview-qa.yml` now includes `pull_request.branches: ['rally-point/develop']` and `push.branches: ['rally-point/develop']`, while retaining older triggers. For this **docs-only** canary PR, verify:
1. A GitHub Actions run appears for the PR targeting `rally-point/develop`.
2. `npm ci`, `npm test`, `npm run build`, browser/onboarding/Blank Battle tests pass.
3. Review any failure logs rather than claiming success prematurely.
4. The PR diff contains **only this file**.

## Netlify setup prerequisite (external project setting)

According to the official Netlify documentation, a PR Deploy Preview requires its base branch to be the production branch **or a branch with branch deploys enabled**. The existing production branch must **not** be changed.

For the existing `citizen-connect-test` Netlify project, an authorized site owner should:
1. Navigate to **Project configuration → Developer settings → Continuous deployment → Branches and deploy contexts → Configure**.
2. Under **Branch deploys**, select **Let me add individual branches** and enter **`rally-point/develop`**. Preserve any existing branch settings that are needed by other projects/workflows.
3. Ensure **Deploy Previews** remain enabled. Save.
4. Check this PR's GitHub status for an actual Netlify **Deploy Preview** URL and successful build.
5. Confirm the URL renders the current local demo at `/`, without modifying production. Never infer that a predictable preview URL is active unless GitHub/Netlify reports it.

Docs:
- https://docs.netlify.com/deploy/deploy-types/deploy-previews/
- https://docs.netlify.com/deploy/deploy-types/branch-deploys/

**Privacy:** Branch deploy URLs can be indexed; don't put real people, confidential content, tokens or member records in these builds. Preview protection may require Netlify site settings.

## Site-owner configuration confirmation / retrigger

On November 21, 2026, the Netlify site owner reported that the `rally-point/develop` branch-deploy setting had been updated. This is **owner-reported configuration**, not a verified successful Deploy Preview. The original GitHub Actions [run #44945286190](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/44945286190) completed successfully across unit, build, Chromium/axe, onboarding and Blank Battle checks.

This documentation-only canary update intentionally triggers a new PR event **after** the branch setting change to test whether Netlify now creates an actual PR preview. Do not mark the Netlify gate passed until the URL appears as a genuine GitHub/Netlify deploy record and renders the expected app. No application files or production targets are modified.

## Completion gate (human review)

Mark Milestone 0.1 complete **only** after both direct GitHub CI and an actual Netlify preview are verified. Document the PR number, SHA, run result and URL. If Netlify access/configuration is unavailable, label the preview gate **BLOCKED**, not passed.

No automatic merge or deployment to production is authorized. The next separately approved implementation milestone is versioned conversation/data contracts (F-02), not a redesign.
