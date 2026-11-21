# F-06 — Wednesday Group integrated into canonical Groups (review slice)

**Date:** November 21, 2026  
**Status:** REVIEW ONLY — separate feature branch, draft PR to `rally-point/develop`. Not merged, no production deployment.  
**Branch:** `rally-point/f06-groups-integrated-review-v1`  
**Prerequisites:** Owner-approved standalone F-06 conversation lab (draft PR #66) and F-03/F-04/F-08 Groups foundation (draft PR #67). Neither prerequisite PR has been merged. This branch **starts at the exact approved #67 head**, carries forward the seven reviewed lab assets from #66, and adds a tightly-scoped in-app adapter and integration tests. Do **not** merge all overlapping drafts.

## What changes for a fictional member

Open the normal Rally Point home preview, then tap **Groups → Conversation**. Beneath the existing group hero, people circles, group summary and Conversation/People/Gathering/Prayer tabs, the member now sees the expressive approved **Wednesday Group chat**:

- matte Citizen red, cream and charcoal styling isolated to the Groups conversation;
- real F-02 v1 in-memory mock repository and conversation contracts;
- actual F-03 mock group-scope policy on reads, writing and reactions (still only a fictional browser fixture);
- message bubbles, author/date labels, quoted replies, reactions, local drafts, pending/sent and simulated failed/retried sends;
- retained test data after refresh and after leaving/returning to Groups;
- old fictional group messages under **Your earlier saved messages**, including the original legacy composer.

The standalone lab at `/wednesday-chat-lab.html` also remains accessible in the preview and uses **the exact same JavaScript conversation controller** (`wednesday-chat-lab.js`), not an independent implementation.

## F-08: no fabricated legacy migration

Old `groupMessages` values such as `{name:'Jess W.',time:'Yesterday',text:'...'}` do **not** have verified historical author IDs or UTC dates. They remain in their original array and original raw data, displayed in a clearly labeled earlier-saved-messages section. The new F-02 snapshot, reactions and drafts remain in the **separate versioned local-only key**:

`rallypoint-wednesday-chat-lab-v1`

The existing two keys `rallypoint-phase1-2026` and `rallypoint-today-ui-v1` remain owned by the reviewed F-08 write journal `rallypoint-write-journal-v1`. Sending in the **new** chat changes only the new chat key; sending in the **old** composer changes the old groupMessages collection and preserves all other stored fields.

That is **parallel, non-destructive coexistence**, not a migration or full data unification. It does not convert historical records to typed F-02 messages, reconstruct historical read cursors, or update the legacy Today unread signature. The "Latest conversation" Today teaser currently reflects the legacy messages, not the new thread; harmonization requires a separately reviewed step.

Storage limitations: the new lab/controller uses simple lab-key persistence with malformed-data protection, while the approved F-08 journaling protects the original two keys. No atomic transactions or remote backup are claimed for the new key. Onboarding still contains separate historical writes requiring a later unified storage adapter. Do not enter real church member messages or sensitive prayer/care data.

## F-03: simulated access only

When a member opens Groups, the app computes an **explicit fictional** `createMockAccessPolicy` fixture for `u_you` and the `wed` group. The new controller checks the policy before read, write, reaction and retry operations. The current local Group membership flag also gates whether the actual Groups screen shows the fictional conversation at all. Revoked/unknown scope in the mock policy is denied.

These labels, local member flags and the existing role toggle are **not authentication**. They are not proof of real group membership or real church permissions. Production would require approved identity, backend authorization and church consent/minor safeguards before any live group/direct message access.

## Code organization and scope

- Base files from PR #67 provide `rallypoint-group-view.js`, `lib/mock-access-policy.cjs` and `rallypoint-storage-guard.js`.
- Reviewed assets from PR #66: `wednesday-chat-lab.html/css/js`, `scripts/build-chat-lab.cjs`, both lab tests and architecture documentation.
- The chat controller now exposes `window.RallyWednesdayChat.mount(root,{authorize})`, used by both lab (automatic page mount) and Groups (the main renderer mounts only while Groups/Conversation is active).
- The browser adapter for the real F-02 contracts and repository also includes the F-03 mock policy. No alternative message schema.
- `rallypoint-group-view.js` exports `integratedGroupChat`, which assembles the embedded chat plus untouched legacy conversation view.
- `rallypoint-wednesday-integrated.css` scopes the new styling to `.rpx-chat` and the archive wrapper; the existing red/cream design, all tabs and all other styles remain.
- `scripts/build.cjs` includes the new page/scripts and emits the browser-ready F-02/F-03 adapter.
- The root `index.html` loads domain + controller **before** `rallypoint.js`; the existing standalone lab does not load the root app.
- Existing unit and regression tests are updated where necessary to load the newly extracted modules.

## Acceptance gates

1. `npm test` — prior F-02/F-03/F-04/F-08 unit suites plus shared F-06 bundle and original app tests.
2. `npm run test:browser`, `npm run test:onboarding`, `npm run test:blank-battle`, `npm run test:groups-safety` — preserved existing journeys and saved-state regression.
3. `npm run test:chat-lab` — exact standalone #66 experience still works, including mobile/axe, reactions, replies, drafts, failure/retry.
4. `npm run test:groups-integrated` — in-app thread at 320/390/430/1280 widths, axe, unchanged legacy author/time labels, new and old sends, navigation/refresh persistence, failed-send retry, sample-membership access gating and corrupt modern-key protection.
5. Netlify Develop-targeted Deploy Preview of this draft branch. Owner tests the full flow on **an actual iPhone**, including touch targets, scrolling, multitasking, keyboard focus and VoiceOver. Automated Chromium mobile simulation is not real-device certification.
6. No files changed in `main` or production, no merge, and no actual migration.

## Subsequent work — deliberately deferred

- User-visible migration/recovery UI and a fully reversible legacy conversation import with verified sender identity and time provenance.
- Unify the Today conversation teaser/unread model, including per-user read cursors.
- Replace the provisional fixture policy with server-enforced authenticated membership and organization scopes.
- Church-approved direct messaging, care/privacy/minor consent controls.
- Removing the old composer only after an explicit archival/migration design and user approval.

**Review signoff is not merge authorization.** After visual owner acceptance, determine one landing strategy for overlapping PRs #66/#67 and this integrated PR, rather than merging all three independently.
