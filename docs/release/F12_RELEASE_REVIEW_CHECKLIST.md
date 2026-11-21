# F-12 — Release Review Checklist

Use this **per PR**. Copy the fields into its description or attach a completed release record. The approved design is pinned at `84e489b86851e853948a7d4246475e83b7ddd085`. A successful Netlify deploy is **not** merge or pilot authorization.

## Release identity

- **Issue / work item:** 
- **Feature branch / head commit:**
- **Target integration branch:** `rally-point/development-v08`
- **Candidate Netlify preview:** 
- **Reviewed build and CI run:** 
- **Release / review owner:** 
- **Previous good deploy and commit (rollback):**

## Evidence gates

- [ ] Acceptance criteria and dependencies addressed, issue references supplied.
- [ ] No unapproved changes to the locked v0.8 visual direction.
- [ ] GitHub unit and browser tests green, including onboarding, accessibility and games.
- [ ] Full visual regression report and screenshots examined (not just a successful run icon).
- [ ] Any intentional visual difference is explicitly reviewed and accepted, or the change is postponed.
- [ ] Member/leader role boundaries inspected for affected workflows.
- [ ] Staff demos contain fictional data only, and no tokens/secrets or private church details.
- [ ] Platform and accessibility checks relevant to the change completed.
- [ ] Correct source-of-truth behavior / integration fallback verified where involved.
- [ ] Named project owner approves merging this scoped PR.
- [ ] Only separately authorized maintainers may publish to production.
- [ ] Previous known-good release recorded, and smoke test/rollback plan verified.

## Manual smoke test

1. Launch welcome from `/?welcome=1`; follow demo onboarding.
2. Open Today and navigate back from Groups/Team/Read.
3. Verify sample conversations and fictional schedule actions without implying remote updates.
4. Open Read, enter Blank Battle and return; progress should persist according to the feature's documented behavior.
5. Test at narrow mobile width, landscape/wide view if relevant, and keyboard/touch focus.
6. Inspect generated before/after/diff screenshots and any CI warnings.

## Decision record

- **Product owner review:** Pending / Accepted / Rejected
- **Security/privacy review when relevant:** Pending / Accepted / Not applicable with reason
- **Merge decision:** **Do not merge until explicit approval**
- **Staging verification:** Pending / Passed / Failed
- **Production deployment:** Not part of normal feature PR
- **Rollback rehearsal:** Pending / Passed, with date and evidence
- **Follow-up issues:** 

## Critical distinctions

Product approval of audit findings is not approval to ship unfinished features. The existing staff demo is fictional. Real member records, communication, permissions, prayer or pastoral care require separate church governance and security authorization, F-01/F-02/F-09/F-11 acceptance, and an actual pilot go/no-go decision.
