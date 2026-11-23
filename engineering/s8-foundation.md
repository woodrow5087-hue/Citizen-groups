# Sprint 8 — Foundation consolidation and engineering maturity

## 8A: verified baseline
- Canonical branch: rally-one/develop; created at 5aa88c93c3d4cd22902ef98af98c09b74ca436ce.
- Recovery branch: rally-one/checkpoints/2026-11-23-approved-demo-119; exact same commit, zero file differences.
- PR #119 remains frozen, deploy-preview reported success for exact head. Current title includes “We rally together so no one stands alone.” No visual device acceptance claimed here.
- Compared with legacy rally-point/develop (30472cf7...), #119 is 194 ahead, zero behind. Compared with #115 (c7d4c1f...), it is three ahead, zero behind. No old branch moved, no production merge.
- #116 is divergent (28 ahead, 194 behind): inspect and port wanted Read work as small, reviewed changes; do not merge wholesale. #117 is isolated prototype; #118 is modular Verse Circuit source integrated into #119; #120 is alternative standalone QA (not executed according to its own description). Preserve for reference, do not merge by number. #92 remains synthetic read-only integration research, not approved production access.
- Older cumulative PRs are historical review/preview artifacts, not competing canonical heads. Do not close them until ownership and evidence are reviewed.

## 8B: architecture inspection, initial findings
The app is a static JS/CSS prototype using ordered scripts, several legacy styles and an explicit build allowlist. Preserve load order and visual parity. rallypoint.js is a large composition root (~1203 lines); extract event-routing or domain-specific controllers only after regression coverage. The priority board and unified focus both rank candidates; map overlapping rules before extracting one policy. Verse Circuit already has core/content/storage/controller/renderer/sound boundaries; use that as a model, not an excuse to rewrite everything. scripts/build.cjs copies assets and the entire docs folder: do not put internal operational or private information there; review the public asset allowlist before any pilot.

## 8C: existing source ownership, not a new backend
- Identity/campus and selected group/team memberships: RallyToday local profile. Not verified identity.
- RSVP, team response, prayer/care, explicit follow-up and Scripture intention: existing app state, guarded persistence; transition must be explicit. No new writer.
- Modern group conversation: RallyConversationRead; versioned conversation owns read cursor. Unknown/unavailable differs from zero unread.
- Shared read-only snapshot: RallyMemberContext.snapshot; permission decisions derive from actual boolean demo memberships and explicit developer fixture role.
- Verse Circuit: own validated game progress, no church engagement inference. Server-only synthetic pilot/s7-readonly-member-contract.cjs is separate; never authenticate from browser claims.
- Next: write a versioned provider-neutral schema and migration tests before live data. Identity, authorization, consent and retention are gates, not UI features.

## 8D: existing intelligence pipeline
RallyMemberContext -> RallySmartDashboard.model -> RallyPriorityBoard.derive -> RallyUnifiedFocus.focus -> existing Today presentation and Ask Rally explanation. Keep current focus behavior and canonical source provenance. No new competing AI ranking system. Initial corrective work: normalize malformed unread data as unavailable in shared context, consume that status in Today, and cover unknown/zero/guest cases. Normal approved scenarios should not change. Next: inventory rule ownership and add a table-driven cross-role matrix before consolidating duplicated ranking.

## 8E: QA and release gate
Exact demo SHA CI evidence:
- Netlify deploy success; VersePlay foundation workflow success (run 45287403300).
- Rally Point Preview QA workflow 45287403493 failed: unit/fixture tests, static build, mobile base, onboarding, Blank Battle, Groups safety, chat and integrated checks passed; the later groups-v2-browser-check.mjs timed out at .gv2-widget-gather after returning from Dom's directory portrait.
- Code inspection: portrait-return restores origin pane (people directory). Prior test incorrectly expected home directly. Sprint test now asserts directory restoration and explicitly navigates back before RSVP. No UI change. Must rerun to confirm.
- New tests committed for malformed unread count, valid zero, guest. Not executed locally by connector. Verify fresh head with npm test, npm run build, npm run test:verseplay, complete preview browser suites, 320/390/430px screenshots, iPhone Safari and VoiceOver. Verify exact commit in deploy status, do not retarget legacy branch to manufacture preview. No merge until green and reviewed.
- Pending: review provider data contract, legacy ranking, production security/permissions, asset rights, Scripture editorial approval, operational pilot consent. This is a fictional demo, not a production authorization.
