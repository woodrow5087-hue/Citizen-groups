# Sprint 9A — Owner-reported VoiceOver smoke acceptance

Baseline: PR #121 head `90d291f835f6e213620a273569e5c9d2f4e75f26`; owner-confirmed branch deployment with `?rallyOne=1`. See `s9a-owner-acceptance-evidence.md` for deployment provenance limits. Recorded November 23, 2026 Mountain Time.

Owner submitted all six smoke checks as passed:

| Check | Owner-reported result |
| --- | --- |
| Opening screen and buttons are announced clearly | Pass |
| All four navigation tabs are accessible | Pass |
| Ask Rally opens and closes correctly | Pass |
| Opening and closing a profile restores focus logically | Pass |
| Messaging controls are accessible | Pass |
| Verse Circuit controls can be navigated | Pass |

This completes the requested six-item VoiceOver smoke check, in addition to the prior functional smoke check. It is not independent device verification or comprehensive WCAG conformance. OS/browser versions, exact Netlify deploy permalink/full SHA, granular focus traces, reduced motion, manual decorative contrast and sound checks remain unrecorded. Preserve these as separate outstanding checks; repeat affected device tests after refactoring. Security, rights/editorial and live pilot approvals remain separate gates.

Recommend owner-authorized reconciliation of PR #121 into `rally-one/develop` only, after verifying current exact head, green checks and remaining acceptance scope. No production publish, merge, branch retarget, or runtime change is authorized by this test record. R2 launch-mode extraction and R4 onboarding storage protection are next bounded changes after baseline reconciliation and required review.
