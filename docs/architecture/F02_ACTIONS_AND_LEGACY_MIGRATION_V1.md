# Rally Point F-02 — Event, Action, Source and Legacy Migration Preparation (v1)

**Scope:** Second, standalone F-02 implementation slice; separate from draft PR #63.
**Base:** `rally-point/develop` (which does not yet include unmerged PR #63).
**Status:** Versioned contracts and a **read-only migration plan**, not an actual browser data migration or live church integration.

## Changes
- `lib/action-contracts.cjs`: Version-1 schema and referential validation for source references, group gatherings, serving shifts, shift responses, coverage requests, contextual companion actions, care tasks and Scripture/prayer activity events.
- `lib/legacy-fixture-migration.cjs`: Pure, repeatable, non-writing migration **preview** for old local fixtures; supplied raw JSON strings are preserved verbatim.
- `test/action-migration.test.cjs`: Node native tests, automatically included by the existing `npm test` glob.

**No `index.html`, `rallypoint.js`, `rallypoint-today.js`, CSS, build script, localStorage key, Netlify setting, or production code is modified or made to import these modules.** The preview is expected to look and behave exactly like the accepted v0.3 demo.

## Versioned action snapshot

```js
{
  schemaVersion: 1,
  sourceReferences: [],
  gatherings: [],
  servingShifts: [],
  shiftResponses: [],
  coverageRequests: [],
  companionActions: [],
  careTasks: [],
  activityEvents: []
}
```

`assertActionSnapshot(snapshot)` verifies enumerated event and response statuses, stable record IDs, nullable UTC timestamps, uniqueness, links to existing serving shifts, appropriate companion action targets and same-organization source references. A source can be `fixture` or `proposed-external`—the latter means **unverified integration design**, not access to Planning Center. The validator does not provide actual authorization or multi-church security.

`CareTask` requires `fictional-scenario` or `human-reviewed` provenance and rejects `riskScore` and `spiritualScore`. Nothing here evaluates church members, infers absences or exposes pastoral information.

PR #63 defines *separate* version-1 conversation records: users, memberships, conversations, messages, reactions and read cursors. Because PR #63 is deliberately unmerged, this second branch does **not** import it. After independent review of the two PRs, shared schema composition and cross-domain user/team joins require another tested slice. These are not yet a unified production database.

## Legacy data actually inspected

The current `rallypoint.js` stores fixtures at `rallypoint-phase1-2026` including `groupMessages`, `teamMessages`, `directMessages`, `prayers`, `attendance`, `reached`, `teamStatus`, `coverage`, `rsvp`, `planQuestions`, `read`, `prayed`, `memoryGames`, `companionCare`, `rhythm` and other browser-local state.

`rallypoint-today.js` stores `rallypoint-today-ui-v1` with demo name, group/team fixture flags and `seenGroupSignature`. This signature serializes arrays of messages and prayers. It **cannot** be treated as a per-person, per-conversation read cursor.

Neither storage location is read or modified by this PR.

## Pure migration preview

```js
const {
  planLegacyFixtureMigration, PRIMARY_KEY, TODAY_UI_KEY
} = require('../../lib/legacy-fixture-migration.cjs');

// Pass raw fixture strings explicitly. The function performs NO storage I/O.
const proposal = planLegacyFixtureMigration({
  primaryRaw: exactPrimaryJsonStringOrNull,
  todayRaw: exactTodayJsonStringOrNull
});
proposal.status;    // 'ready' | 'empty' | 'blocked'
proposal.backup;    // EXACT original strings under the two original keys
proposal.fingerprint; // Stable SHA-256 of the supplied strings
proposal.staged;    // Fictional staging descriptors, NOT a live database
proposal.writable;  // false: no commit/write API exists
```

**Non-destructive invariants**

1. **Original bytes preserved.** Both raw JSON strings remain exactly as supplied, including any unrecognized keys, existing VersePlay progress, saved reading choices, rhythm notes and drafts where present. The planner does *not* create a persistent backup; that will need separately approved storage/rollback design.
2. **No imaginary time.** Legacy message labels like `Today`, `Yesterday` and `Just now` remain labels. Staging has `occurredAt:null`, `timeCertainty:'unknown'`, `authorId:null`; deterministic staging IDs use original source path and array index. They are not real message identities or timestamps.
3. **No imaginary event association.** An undated `teamStatus`, RSVP or coverage flag is staged without an invented serving shift/gathering ID. `read` and `prayed` booleans yield activity descriptors with null dates.
4. **No fake authorization or unread state.** Old membership flags remain explicitly `verifiedMembership:false`, and old seen-signatures are preserved with `convertedReadCursors:[]`. No server authority is assumed.
5. **Malformed inputs blocked.** Invalid JSON or incorrect source shapes result in `status:'blocked'`, original inputs returned unchanged and no staged rows. Missing values may yield an empty or partial review plan.
6. **Idempotent and pure.** Identical supplied strings yield identical plans; the function does not read browser storage, use the network, write files, call a clock, or mutate caller objects.

**Critical limitation:** Staged legacy messages cannot yet enter PR #63's strict conversation schema, which requires UTC message timestamps and user IDs the old fixtures lack. Later approved work must explicitly design uncertainty-aware import and a safe, reversible browser migration. Never fabricate data just to satisfy a stricter validator.

A planning result can itself contain locally sensitive text from the supplied JSON. Do not log, upload, publish, paste into bug reports, or send migration backups to external services. All tests use synthetic fixtures.

## Review gates
- Native Node tests pass for record validation, missing/duplicate references, cross-organization links, risk-score exclusions, idempotent staging, corrupted JSON and exact saved-data preservation.
- Existing `npm test`, build, Chromium/axe, onboarding and Blank Battle tests pass in develop-targeted GitHub Actions.
- A **real** Netlify Deploy Preview appears for the draft PR; it retains Today / Groups / Team / Read, Premium ALIVE styling and existing local behaviors.
- PR changes only these two library files, one test file and this document.
- **Do not merge to develop or production, deploy to production, connect church accounts, or apply any migration without later explicit approval.**
