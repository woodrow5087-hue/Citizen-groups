# Rally One · Sprint 7A–7E · Engineering review and release-control record

**Status: review-only synthetic prototype. Do NOT merge or deploy to main/production.**  
**Accepted baseline:** M6 QA-passed SHA `5eaf7a59820f3827e1441c041539f0a9d4bdb9cd`, preserved as `rally-one/checkpoints/2026-11-23-m6-accepted-baseline`.  
**Sprint branch:** `rally-one/s7-stabilize-demo-pilot`. All work is in one draft PR for review; no existing user-approved design is replaced.

## 7A — Audit, preserve and stabilize

### What the audit actually found
- [PR #112](https://github.com/woodrow5087-hue/Citizen-groups/pull/112) is a **large, stacked cumulative diff** relative to `rally-point/develop`: it includes the graphite visual refresh, Connect, Groups 2.0, companion intelligence, source context, new tests and the local portraits. It is not a single isolated feature commit. **Do not merge it without an explicit diff/ownership review.**
- Several generations of CSS and supporting pages intentionally coexist for regression/legacy archive comparisons. Blindly deleting older styles or rebuilding the navigation could reintroduce the user-reported narrow-column Today failure.
- The approved Today, Groups, Team, Read and Connect presentation is therefore **frozen for this sprint**. Add only narrow, well-scoped styles for the developer/leadership selector.
- The M6 context is a read-only projection of separate local sources; it is not a verified church membership service. The versioned Connect chat remains the sole owner of modern message read cursors; prayer/care is fictional.
- Inherited storage recovery protects existing data with a write-ahead journal, but malformed saved message shapes needed additional validation so a screen could fail safely without rewriting historical bytes.

### Changes made in this sprint
- Saved an exact M6 pre-sprint checkpoint and built on a **single new isolated branch**; no Develop/main updates.
- Expanded `rallypoint-storage-guard.js` shape validation for group/team/prayer lists, leader reviews, direct messages and care records. In-memory rendering uses safe sample-message fallbacks, while the guard preserves original raw saved bytes and refuses unsafe writes.
- Strengthened `rally-one-member-context.js` so only actual boolean membership flags confer group/team access; malformed unread counts, invalid timestamps, revocation and unavailable conversations fail closed.
- Added small scenario-picker CSS only, later in the stylesheet order; the approved 320/390/430px layout and exact Groups-to-Today portraits remain governed by the existing locked styles.
- Retained all prior unit and Playwright suites, then added explicit Sprint 7 tests rather than weakening old acceptance criteria.

### Unresolved release risks — intentionally not hidden
1. **Stacked PR/merge complexity:** PR #112 and this Sprint 7 PR should be reconciled into an explicit, ordered merge strategy only after final owner approval and a fresh Develop comparison.
2. **Legacy style generations:** do not remove or consolidate old CSS until screenshot parity and a separately reviewed diff prove it safe.
3. **Local browser storage:** suitable for fictional demonstrations, not authenticated account, private communications or sensitive pastoral information.
4. **Public preview portraits:** the six user-supplied photographs are not a verified member directory; confirm permission before wider dissemination.
5. **Device acceptance:** the user and a church representative still need actual iPhone Safari, keyboard, Dynamic Type and VoiceOver checks. Automated browser QA is necessary but insufficient.

### Release gates
- [ ] Owner approves this exact Netlify preview on a physical iPhone
- [ ] Product and church stakeholders review permissions, notices, labels and demo-only information
- [ ] Fresh GitHub diff review: PR #112 against Develop and Sprint 7 against pinned M6 baseline
- [ ] All automated suites green at head SHA
- [ ] Photo permissions resolved for any broader pilot
- [ ] Written church authorization for any future live integration or member records
- [ ] Explicitly authorized merge decision (no implicit merge via green checks)

**Do not interpret this document or CI status as a production or pastoral-care approval.**
