# F-02 — Unified Domain Composition & Reversible Migration Rehearsal

**Status:** Implementation for review only; no runtime integration or actual migration  
**Branch:** `rally-point/f02-domain-integration-migration-review`  
**Base for draft PR:** `rally-point/develop`  
**Date:** November 21, 2026

## What this PR accomplishes

This is a **self-contained review integration** of two previously reviewed, unmerged F-02 slices:

- **PR #63:** Versioned `User`, `Conversation`, `Membership`, `Message`, `Reaction` and `ReadCursor` schemas, in-memory mock repository, unit tests and architecture notes.
- **PR #64:** Versioned `Gathering`, `ServingShift`, `ShiftResponse`, `CoverageRequest`, `CompanionAction`, `CareTask`, `SourceReference` and `ActivityEvent` schemas, a **read-only** legacy-staging planner, unit tests and architecture notes.
- **This slice (additional files):** `lib/domain-bundle.cjs`, `lib/migration-rehearsal.cjs`, `test/domain-integration.test.cjs`, and this document.

This branch begins from PR #63's head and carries forward the **exact previously reviewed files** from PR #64; neither #63 nor #64 was merged. Its PR against `rally-point/develop` intentionally includes all of those files plus the new integration files so it can be evaluated as a single reproducible package. **Do not merge all three PRs**: they overlap. After review, choose one landing strategy with product-owner authorization (e.g., supersede/close the smaller drafts and merge one integrated PR only after revalidation).

## 1. Composing the two contracts

```js
const {
  blankDomainBundle, composeDomainBundle, assertDomainBundle
} = require('../../lib/domain-bundle.cjs');

const empty = blankDomainBundle();
// { domainVersion:1, conversations:{schemaVersion:1,...},
//                    actions:{schemaVersion:1,...} }

const combined = composeDomainBundle({
  conversations: conversationSnapshot,
  actions: actionSnapshot
});
assertDomainBundle(combined);
```

The integration validator first applies both independently reviewed schema/reference validators; it then requires each shift response, coverage request, activity event, and care task participant or assignee to match an existing `User` in the same `organizationId`. `CompanionAction` records aimed at conversations must resolve to an existing conversation with matching organization. Target validation for gathering, shift and care tasks is performed by their own schema and the bundle. Deep copies prevent cross-module mutation of callers' source snapshots.

**Explicit gaps:** `Gathering.groupId` and `ServingShift.teamId` currently remain opaque stable IDs; there are not yet versioned Group/Team source-of-truth records to prove their actual membership. Similarly `targetType:'reading'` is not resolved to an authorized reading record here. Do not confuse schema coherence with production tenant isolation, permission enforcement, leadership approval, external API support, or operational accuracy. These require F-03/F-12 and future integrations.

## 2. Why direct historical conversion is not safe yet

Actual app keys inspected in `rallypoint.js` and `rallypoint-today.js`:

- `rallypoint-phase1-2026`: messages use `{name,time,text}` with relative labels such as `Today`/`Yesterday` and **no immutable author ID or UTC timestamp**. Other fields include fictional serving/attendance, care, Scripture, VersePlay and preference state.
- `rallypoint-today-ui-v1`: includes fictional group/team membership flags and `seenGroupSignature`, which is **not** a per-conversation read cursor.

PR #63's strict `Message` contract requires `authorId` and `createdAt` with real UTC timestamps. We must not invent these values, falsely upgrade member roles, fabricate date-scoped Scripture events, or silently reset existing data to force compatibility.

PR #64's `planLegacyFixtureMigration` already stages old records in an **uncertainty-aware quarantine**, with original strings preserved and all unknown timestamps `null`.

## 3. Migration review envelope (still no actual storage writes)

```js
const {
  prepareMigrationReview, verifyUnchangedSource,
  validateMigrationReview, recoverOriginalStrings,
  rehearseRollback
} = require('../../lib/migration-rehearsal.cjs');

const review = prepareMigrationReview({
  primaryRaw: exactOriginalPrimaryJsonStringOrNull,
  todayRaw: exactOriginalTodayUiJsonStringOrNull
});

review.status;                   // 'ready', 'empty', 'blocked'
review.originalRaw;              // unmodified original strings
review.quarantine;               // unresolved legacy messages/activity, not domain writes
review.blankNewDomain;           // correctly validated, intentionally EMPTY v1 domain
review.promotedLegacyRows;       // 0
review.unknownDatesRemapped;     // 0
review.verifiedIdentitiesInvented;// 0
review.actualWrites;             // 0
review.requiresSeparateApproval; // true
```

The envelope does **not** promote records into domain collections; its `ready` status means only that legacy inputs passed structural validation and are eligible for **human review**, not that an actual conversion is authorized. The exact raw strings and SHA-256 source fingerprint are preserved; bad JSON or conflicting shapes result in a blocked plan.

`verifyUnchangedSource(review, newRawInput)` detects a browser-data change after planning. The future real migration must stop if data has changed: it cannot overwrite newer messages or progress based on a stale plan.

`validateMigrationReview(review)` re-plans deterministically from original strings, rejects fingerprint/staging tampering and requires an empty verified domain and zero automatic promotions. `recoverOriginalStrings(review)` returns byte-preserved originals from a validated envelope. A record timestamp label is never promoted to an invented UTC date.

**Sensitive data note:** Real-world local notes may be private. This module is run only with explicitly supplied data; do not log or send any real user's `originalRaw` or `quarantine` to CI, an issue, a preview build or another person. All current tests use synthetic fictional fixtures.

## 4. Tested reversible rehearsal, NOT a production storage migration

```js
rehearseRollback(review);                       // successful in-memory publish
rehearseRollback(review, {failAt:'before-publish'});
rehearseRollback(review, {failAt:'after-publish'});
```

This function creates an **ephemeral Map copy** of the two original strings and a non-runtime review key, simulating preparation and a recoverable write. Both failure modes are injected and the function rolls back the in-memory copy exactly, without changing its input.

The actual application does **not** load `lib/migration-rehearsal.cjs`, does not use the rehearsal review key, and does not call any migration function. The simulator demonstrates planned recovery semantics but **does not establish that a future two-key `localStorage` transaction is atomic**, that the user's browser has quota, or that recovery can withstand a real power loss or crash. Those must be specified and tested before a separately approved live UI migration.

## 5. Acceptance and quality gates

The test suite `test/domain-integration.test.cjs` covers:

- Empty v1 composition; valid shared user/source records; defensive deep copies.
- Cross-domain orphan detection, cross-organization shift/coverage/activity/care ownership and conversation actions.
- Unknown author IDs and timestamps quarantined rather than converted.
- Exact backup recovery, deterministic review, source-fingerprint conflicts and corruption detection.
- Fault injection *before and after* simulated publication; both leave original fixture strings unchanged.
- Current app isolation (none of these new files are imported by `index.html`, `rallypoint.js` or `scripts/build.cjs`).

The existing `npm test` glob automatically includes this test, plus both previously reviewed suites. Develop-targeted GitHub Actions also runs build, browser/axe checks, onboarding and Blank Battle. The PR should provide a genuine Netlify Deploy Preview with unchanged Today / Groups / Team / Read visuals and browser-local demo behavior.

## 6. Explicit release / authorization boundary

- This branch and PR are review-only. No code is merged to `rally-point/develop` or `main`, no production deployment, and no real data integration.
- No actual localStorage migration, backup write, deletion, account identity assignment or server role enforcement.
- This is **domain-integration** work, not the expressive Wednesday Group messaging UI. That experience remains a separately reviewed F-04/F-06 implementation slice.
- Remaining decisions: approve a coherent landing strategy for #63/#64 versus this integrated PR, plan crash-safe/browser-quota-safe migration, design uncertainty-aware read compatibility, then authorize one fictional Wednesday Group connection.
- Preserve the approved Premium ALIVE Hybrid red/charcoal/cream identity, People circles, four tabs and VersePlay progress.

**Owner approval of the preview confirms no visible regression; it does not by itself authorize merges, production rollout, or actual migration.**
