## Rally Point — Feature review

**Audit issue:** Fixes/Refs #___
**Branch origin:** `rally-point/development-v08` (or pinned v0.8 only for the initial F-12 setup)
**Target branch:** `rally-point/development-v08` — NEVER the frozen `rally-point/v08-preferred-design-snapshot`
**Preview URL:** [paste successful PR preview]
**Visual comparison artifact:** [link to GitHub Actions test-results/f12-visual]
**Staff-demo or real-data impact:** [clearly state]

### Required checks
- [ ] The user-facing problem and acceptance criteria are documented in the linked GitHub issue.
- [ ] Work is confined to this feature branch; the approved v0.8 snapshot is unchanged.
- [ ] `npm run test:release`, `npm test`, build and all browser checks pass.
- [ ] Eight automated screenshot comparisons against immutable v0.8 are reviewed (look at BOTH candidate captures and the highlighted differences, not just a green badge).
- [ ] Any change from the approved appearance is explicitly described and approved by the product owner before merge. Do not modify comparison thresholds to hide differences.
- [ ] Onboarding, Today, Groups, Team, Read, and Blank Battle still follow the existing navigation journey.
- [ ] No real church/member/prayer data, tokens or secrets were introduced into a demo fixture.
- [ ] Pilot-only permissions and integration behavior are not advertised as real unless verified.
- [ ] Preview was tested manually on a phone-sized viewport and the affected journey was replayed.
- [ ] Rollback target, release owner and smoke-test steps are recorded in the release notes.
- [ ] **Product owner approved this PR.** CI passing by itself is not approval.

### Visual review
**Approved unchanged UI / intentionally changed UI:** [describe]
**Before/after screenshots:** [links]
**User's explicit approval of any appearance change:** [date/reference, otherwise write 'not approved']

### Release
**Staging preview:** [URL]
**Production action:** None unless separate explicit approval is obtained.
**Rollback:** [previous Netlify published deploy ID and GitHub source revision; do not guess]
