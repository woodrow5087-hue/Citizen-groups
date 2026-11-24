# Sprint 9A — Owner-reported deployment and device acceptance evidence

Recorded 2026-11-23, approximately 20:43 Mountain Time. Documentation only, on isolated Sprint 9B branch; no application or deployment changes.

## Deployment evidence
- Owner supplied a Netlify dashboard screenshot showing a successful hook-triggered branch deploy at 8:28 PM, displayed short commit `90d291f`, project `citizen-connect-test`.
- GitHub PR #121 independently checked: open draft, head `90d291f835f6e213620a273569e5c9d2f4e75f26`, base `5aa88c93c3d4cd22902ef98af98c09b74ca436ce`. No merge authorized.
- Owner supplied branch URL: https://rally-one-s8-foundation-consolidation--citizen-connect-test.netlify.app/ . Initially opened the older experience. Source inspection of `scripts/build.cjs` and `rallypoint.js` at exact head confirms branch-deploy does not set the Rally One default experience, while `rallyOne=1` explicitly enables it.
- Working owner-confirmed URL: https://rally-one-s8-foundation-consolidation--citizen-connect-test.netlify.app/?rallyOne=1 . Owner confirmed correct interface, then reported “Everything is functioning properly.”
- This is owner-reported physical mobile functional smoke acceptance, not an independently executed per-case device test. Exact OS/browser version, permalink/deploy ID, detailed test results, full SHA on Netlify and independent HTTP verification not captured. The PR-specific deploy preview is not claimed to exist. No production publish requested.

## Remaining gate
- VoiceOver, focus order/return, control labels, reduced motion, decorative contrast and sound acceptance are not specifically confirmed. Record actual checks and issues, not assumed passes.
- Do not infer security, production, editorial/rights or live integration approval from demo success. Existing Sprint 8 automated evidence remains separate.
- Read-only maintainability inventory may proceed while accessibility evidence is collected. Implementation must be anchored to the accepted canonical foundation with explicit review and no visual/behavior changes. Do not modify PR #121 or protected refs to manufacture a pass.
