'use strict';

/**
 * Review-only reversible migration rehearsal. No localStorage, IndexedDB,
 * external service, file IO, or production data is read/written here.
 * Only source strings explicitly passed by a test or caller are examined.
 */
const {
  PRIMARY_KEY, TODAY_UI_KEY,
  planLegacyFixtureMigration
} = require('./legacy-fixture-migration.cjs');
const {
  blankDomainBundle, assertDomainBundle
} = require('./domain-bundle.cjs');

const REVIEW_VERSION = 1;
const REHEARSAL_KEY = 'rallypoint-f02-uncommitted-review-v1';
const clone = value => structuredClone(value);
function must(condition, detail) {
  if (!condition) throw new TypeError('Rally Point migration rehearsal: ' + detail);
}
function exactSources(backup) {
  must(backup !== null && typeof backup === 'object' && !Array.isArray(backup), 'backup is not a record');
  for (const key of [PRIMARY_KEY, TODAY_UI_KEY]) {
    must(backup[key] === null || typeof backup[key] === 'string',
      key + ' must be original raw string or null');
  }
  return {
    primaryRaw: backup[PRIMARY_KEY],
    todayRaw: backup[TODAY_UI_KEY]
  };
}

/**
 * Never moves an unknown-timestamp message into the strict conversation
 * contract. Keeps staged rows, legacy raw strings, and empty v1 domain apart.
 * Review status 'ready' means valid legacy input, NOT migration-ready.
 */
function prepareMigrationReview(options = {}) {
  const legacy = planLegacyFixtureMigration(options);
  const emptyDomain = blankDomainBundle();
  assertDomainBundle(emptyDomain);
  return {
    reviewVersion: REVIEW_VERSION,
    status: legacy.status,
    sourceFingerprint: legacy.fingerprint,
    originalRaw: clone(legacy.backup),
    quarantine: clone(legacy.staged),
    blankNewDomain: emptyDomain,
    issues: clone(legacy.issues),
    warnings: clone(legacy.warnings),
    promotedLegacyRows: 0,
    unknownDatesRemapped: 0,
    verifiedIdentitiesInvented: 0,
    actualWrites: 0,
    requiresSeparateApproval: true
  };
}

/** Validates provenance against a deterministic re-plan and no assumptions. */
function validateMigrationReview(review) {
  must(review !== null && typeof review === 'object' && !Array.isArray(review),
    'review must be an object');
  must(review.reviewVersion === REVIEW_VERSION, 'unsupported reviewVersion');
  const {primaryRaw,todayRaw} = exactSources(review.originalRaw);
  const expected = prepareMigrationReview({primaryRaw,todayRaw});
  must(review.sourceFingerprint === expected.sourceFingerprint, 'backup fingerprint mismatch');
  must(review.status === expected.status, 'review status does not match source');
  must(JSON.stringify(review.quarantine) === JSON.stringify(expected.quarantine),
    'staging does not match original source');
  must(JSON.stringify(review.blankNewDomain) === JSON.stringify(expected.blankNewDomain),
    'new-domain payload is not an empty validated domain');
  must(review.promotedLegacyRows === 0 && review.unknownDatesRemapped === 0 &&
    review.verifiedIdentitiesInvented === 0 && review.actualWrites === 0 &&
    review.requiresSeparateApproval === true, 'unsafe promotion assertion');
  assertDomainBundle(review.blankNewDomain);
  return review;
}

/**
 * Conflict check: if browser data changed after planning, a future migration
 * must stop and re-plan. Never use a saved old snapshot to overwrite new data.
 */
function verifyUnchangedSource(review, {primaryRaw=null,todayRaw=null} = {}) {
  validateMigrationReview(review);
  const current = planLegacyFixtureMigration({primaryRaw,todayRaw});
  return current.fingerprint === review.sourceFingerprint &&
    primaryRaw === review.originalRaw[PRIMARY_KEY] &&
    todayRaw === review.originalRaw[TODAY_UI_KEY];
}

/**
 * In-memory rehearsal only: prepare -> publish a NON-RUNTIME preview key ->
 * verify -> either retain original strings or undo the new preview key.
 * Failure injection proves rollback even when the failure follows publish.
 * Returned mock entries contain fictional data only in tests.
 */
function rehearseRollback(review, {failAt=null} = {}) {
  validateMigrationReview(review);
  must(failAt === null || failAt === 'before-publish' || failAt === 'after-publish',
    'unsupported fault injection');
  const originals = exactSources(review.originalRaw);
  const initial = new Map([
    [PRIMARY_KEY, originals.primaryRaw],
    [TODAY_UI_KEY, originals.todayRaw]
  ]);
  const working = new Map(initial);
  if (review.status !== 'ready') {
    return {status:'blocked', restored:true, originalUnchanged:true,
      reviewKeyPresent:false, entries:Object.fromEntries(working)};
  }
  try {
    if (failAt === 'before-publish') throw new Error('simulated before-publish failure');
    working.set(REHEARSAL_KEY, JSON.stringify(review));
    if (failAt === 'after-publish') throw new Error('simulated after-publish failure');
    const reread = JSON.parse(working.get(REHEARSAL_KEY));
    validateMigrationReview(reread);
    return {status:'simulated-only', restored:false,
      originalUnchanged:working.get(PRIMARY_KEY)===originals.primaryRaw &&
        working.get(TODAY_UI_KEY)===originals.todayRaw,
      reviewKeyPresent:working.has(REHEARSAL_KEY), entries:Object.fromEntries(working)};
  } catch (_error) {
    // Real storage rollback is NOT implemented. This is a copy-on-write
    // ephemeral Map rehearsal that leaves input browser state unchanged.
    working.clear();
    for (const [key,value] of initial) working.set(key,value);
    return {status:'rolled-back-in-memory', restored:true,
      originalUnchanged:working.get(PRIMARY_KEY)===originals.primaryRaw &&
        working.get(TODAY_UI_KEY)===originals.todayRaw,
      reviewKeyPresent:working.has(REHEARSAL_KEY), entries:Object.fromEntries(working)};
  }
}

/** Copy exact legacy strings out of a tamper-checked review for rollback planning. */
function recoverOriginalStrings(review) {
  validateMigrationReview(review);
  return clone(review.originalRaw);
}

module.exports={
  REVIEW_VERSION, REHEARSAL_KEY, prepareMigrationReview,
  validateMigrationReview, verifyUnchangedSource, rehearseRollback,
  recoverOriginalStrings
};
