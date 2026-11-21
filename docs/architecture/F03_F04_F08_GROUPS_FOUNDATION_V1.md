# Rally Point — F-03 / F-04 / F-08 Controlled Groups Foundation

**Status:** Review-only development implementation, not production authorization  
**Base:** `rally-point/develop` after the owner-approved F-02 PR #65 merge  
**Branch:** `rally-point/f03-f04-f08-groups-foundation-v1`  
**Date:** November 21, 2026

## Product boundary

The existing Premium ALIVE design and all four tabs **Today / Groups / Team / Read** remain in place. This is **not** the migration of the owner-approved Wednesday Group experimental page (draft PR #66). That standalone lab remains unmerged and unchanged. This slice prepares the *actual* Groups tab for modular messaging and protects the two existing browser-local demo keys before an eventual conversation-data adapter. The familiar Groups conversation retains the **exact same HTML**. The only new user-visible behavior occurs if browser storage becomes corrupted, inaccessible, or is changed by another tab: the app shows a defensive warning and refuses to overwrite the existing bytes.

Files in this PR:
- `lib/mock-access-policy.cjs`: **F-03**, fixture-only deny-by-default resource/action policy.
- `rallypoint-group-view.js`: **F-04**, browser/CommonJS Groups render/composer module; extracts exact existing group chat markup.
- `rallypoint-storage-guard.js`: **F-08**, versioned in-browser write-ahead journal and fail-closed storage guard; **no schema migration**.
- `rallypoint.js`, `index.html` and `scripts/build.cjs`: tiny, explicit integrations of the F-04 and F-08 modules.
- `test/mock-access-policy.test.cjs`, `test/groups-storage-guard.test.cjs`, `scripts/groups-safety-browser-check.mjs`: positive/negative access, unchanged HTML, corrupt-state, in-memory fault-injection and real browser regression tests.
- `package.json`, GitHub Actions preview-QA workflow: test command and gate.
- This document.

The root app never imports the **F-03 mock access policy** as security. The existing role selector and group-membership booleans remain fictional UX fixtures, not real access enforcement.

## F-03 — Permission matrix, mock only

The `createMockAccessPolicy` function requires a fictional actor record with `fixtureVerified:true`, the correct `organizationId`, and active scope-specific membership. These values come from test fixtures and are **not trusted account credentials**. Unknown actor, unknown action, unapproved resource, revoked membership, cross-organization access, and minor-related resources **all deny by default**.

| Resource | Actions | Conditions, in addition to fictional actor/organization match |
| --- | --- | --- |
| Group conversation | Read, write, react | Active membership in that specific group |
| Team conversation | Read, write, react | Active membership in that specific serving team |
| Attendance | Read, manage | Active membership **and** scoped group-leader/admin role |
| Serving shift | Read, respond | Active membership in the corresponding team |
| Serving shift | Manage | Active team membership **and** scoped team-leader/admin role |
| Group prayer request | Read, write | Active group membership **and** explicit group-sharing consent |
| Care task | Read, manage | Scoped group leadership, explicit task-level care assignment **and** subject consent |
| Direct conversation | None | **Denied** pending church-approved consent/minors/DM safeguards |
| Minor-related resources | None | **Denied** pending church-approved safeguards |

This is a provisional conservative simulation. Real church requirements must be reviewed with authorized staff, and live protected operations must be authorized **on the server**. A browser fixture flag, hidden button, global admin role or group leader label is never a security substitute. A church admin without an explicit care-task grant cannot read the associated task. Fixture-based tests prove positive/negative cases, revocation, organization boundaries, privacy consent and deny defaults.

## F-04 — Reusable Groups view boundary

`RallyGroupView.legacyMessages(messages, escape)`, `legacyComposer(type,title,placeholder)` and `legacyGroupChat({messages,escape})` live in a small browser/CommonJS module. The existing app now calls `legacyGroupChat` in its existing Groups chat pane, rather than constructing that pane within `rallypoint.js`. Its text, classes, structure, send button and behaviors are **byte-for-byte equivalent**. No routes, bottom tabs, team/prayer composers, direct messages, VersePlay state or styles are modified.

This is the beginning of incremental extraction; it does **not** yet make existing legacy `groupMessages` into strict F-02 `Message` records, or merge the separate PR #66 UI. F-02 domain, mock access policy and the present legacy renderer have intentionally distinct boundaries until the separately approved adapter/migration design handles unknown author IDs and relative time labels.

## F-08 — Exact-key preservation, journaling and explicit recovery

The current app owns two legacy keys:

- `rallypoint-phase1-2026`: current fictional messages, direct conversations, prayer notes, preferences, readings, VersePlay progress, serving/gathering flags and future unknown fields.
- `rallypoint-today-ui-v1`: local profile display name, fictional membership flags, and the legacy unread signature.

`RallyStorageGuard.create(localStorage)` inspects both keys **before allowing any writes**. Corrupt JSON or known incompatible shapes cause a visible warning and block writing rather than replacing all saved data with defaults. An existing `rallypoint-write-journal-v1` also blocks new saves on startup; **recovery never executes automatically**.

On each accepted local demo save, the guard:
1. Ensures both current raw strings exactly match its last observed originals (no silent overwrite of another browser tab).
2. Validates the two proposed JSON object shapes.
3. Writes a version-1 journal containing **exact previous raw strings** and proposed next strings to `rallypoint-write-journal-v1`. If the browser cannot create this journal, **neither original key is changed**.
4. Writes the two original legacy keys, then clears the journal and updates the observed raw snapshot.
5. If either protected write fails, attempts to restore **both exact previous raw strings**, clearing the journal if rollback succeeds. On incomplete rollback the journal remains so later recovery is possible.

`recoverInterruptedSave()` is an **explicit adapter API** tested with synthetic data; the running app does **not** call recovery automatically or provide a recovery UI. It only restores previous raw strings when both current values match either the journal's original or proposed values; otherwise it refuses to overwrite newer changes. Test coverage includes a simulated interruption, mismatched concurrent edits and invalid journal data.

**Important limitations:** Browser `localStorage` does not offer a genuinely atomic multi-key transaction. A journal is an extra local copy of fictional data; it is not encryption, a remote backup or a guarantee against browser-storage clearing/crashes/quota exhaustion. The journal may make writes fail when storage quota is nearly full; this fail-closed behavior protects data. Do not put actual congregant/private prayer data in these demo keys. The app does not execute F-02's `planLegacyFixtureMigration`, upgrade legacy message identities, assign false timestamps, create event-specific cursors, or replace user-selected games/progress.

Before the full F-08 actual domain upgrade, a dedicated separately authorized feature must add user-visible recovery UX, explicit uncertainty-aware legacy adapters, simulated crash recovery and further real-device testing.

## Acceptance and verification

`npm test` automatically includes fixture-policy and storage-guard tests. `npm run test:groups-safety` exercises existing Groups navigation, original/added messages surviving refresh, persistence of arbitrary unknown fields and direct conversations, corruption refusal, interrupted journal refusal, and zero unintended writes. The existing full preview workflow continues to run mobile/axe, onboarding, VersePlay and Blank Battle regressions. All changes must pass against the accepted Premium ALIVE screenshots, with no CSS changes.

**Stop at a draft PR and owner-reviewed Netlify Deploy Preview.** No automatic merge to `rally-point/develop` or `main`, no production deployment, no actual domain migration, no real church connections, and no merger of separate unapproved draft PR #66.
