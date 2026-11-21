'use strict';
/**
 * Read-only migration PREPARATION, not a storage migration.
 * Works only on caller-supplied raw JSON strings. Exact raw inputs are retained
 * as a byte-for-byte backup (JS strings); no localStorage or other IO is used.
 * Date-less legacy activity is staged with explicit unknown timestamps.
 */
const {createHash} = require('node:crypto');
const PRIMARY_KEY = 'rallypoint-phase1-2026';
const TODAY_UI_KEY = 'rallypoint-today-ui-v1';
const PLAN_VERSION = 1;

const isObject = value => value !== null && typeof value === 'object' && !Array.isArray(value);
const copy = value => structuredClone(value);
const hash = text => createHash('sha256').update(text).digest('hex');
const stableRowId = (kind, sourceKey, originalIndex) => `legacy_${kind}_${hash(sourceKey).slice(0,12)}_${String(originalIndex).padStart(5,'0')}`;
function parseLegacy(raw, key, issues) {
  if (raw === null) return null;
  if (typeof raw !== 'string') {
    issues.push(`${key}: caller must supply the exact stored string or null`);
    return null;
  }
  let parsed;
  try { parsed = JSON.parse(raw); }
  catch { issues.push(`${key}: invalid JSON; original string preserved`); return null; }
  if (!isObject(parsed)) {
    issues.push(`${key}: expected a JSON object, not a primitive or array`);
    return null;
  }
  return parsed;
}
function validateShapes(state, ui, issues) {
  if (state !== null) {
    for (const field of ['groupMessages','teamMessages','prayers']) {
      if (state[field] !== undefined && !Array.isArray(state[field])) issues.push(`${PRIMARY_KEY}.${field}: expected array`);
    }
    if (state.directMessages !== undefined && !isObject(state.directMessages)) issues.push(`${PRIMARY_KEY}.directMessages: expected object`);
    if (isObject(state.directMessages)) {
      for (const [person, rows] of Object.entries(state.directMessages)) {
        if (!Array.isArray(rows)) issues.push(`${PRIMARY_KEY}.directMessages.${person}: expected array`);
      }
    }
    for (const field of ['attendance','companionCare','memoryGames','planQuestions','rhythm']) {
      if (state[field] !== undefined && !isObject(state[field])) issues.push(`${PRIMARY_KEY}.${field}: expected object`);
    }
    for (const field of ['reached','interest']) {
      if (state[field] !== undefined && !Array.isArray(state[field])) issues.push(`${PRIMARY_KEY}.${field}: expected array`);
    }
    for (const field of ['read','prayed','coverage']) {
      if (state[field] !== undefined && typeof state[field] !== 'boolean') issues.push(`${PRIMARY_KEY}.${field}: expected boolean`);
    }
    if (state.rsvp !== undefined && typeof state.rsvp !== 'string') issues.push(`${PRIMARY_KEY}.rsvp: expected string`);
    if (state.teamStatus !== undefined && typeof state.teamStatus !== 'string') issues.push(`${PRIMARY_KEY}.teamStatus: expected string`);
  }
  if (ui !== null) {
    if (ui.memberships !== undefined && !isObject(ui.memberships)) issues.push(`${TODAY_UI_KEY}.memberships: expected object`);
    if (ui.seenGroupSignature !== undefined && typeof ui.seenGroupSignature !== 'string') issues.push(`${TODAY_UI_KEY}.seenGroupSignature: expected string`);
  }
}
function emptyStage() {
  return {
    messages: [], activities: [], unscopedResponses: [],
    demoAttendance: [], demoCare: [], legacyUi: null
  };
}
function stageFromLegacy(state, ui) {
  const staged = emptyStage();
  if (state !== null) {
    const collect = (kind, rows, sourceKey) => {
      (rows || []).forEach((item, index) => {
        // Unknown/unexpected row shapes are preserved in the exact raw backup.
        // Do not fabricate a valid-looking message by guessing missing fields.
        staged.messages.push({
          id: stableRowId(kind, sourceKey, index),
          kind, sourceKey, originalIndex: index,
          authorDisplayName: isObject(item) && typeof item.name === 'string' ? item.name : null,
          authorId: null,
          body: isObject(item) && typeof item.text === 'string' ? item.text : null,
          originalTimeLabel: isObject(item) && typeof item.time === 'string' ? item.time : null,
          occurredAt: null, timeCertainty: 'unknown',
          needsReview: !isObject(item) || typeof item.text !== 'string' || typeof item.name !== 'string'
        });
      });
    };
    collect('group', state.groupMessages, `${PRIMARY_KEY}.groupMessages`);
    collect('team', state.teamMessages, `${PRIMARY_KEY}.teamMessages`);
    collect('prayer', state.prayers, `${PRIMARY_KEY}.prayers`);
    if (isObject(state.directMessages)) {
      for (const [personId, rows] of Object.entries(state.directMessages)) {
        collect('direct', rows, `${PRIMARY_KEY}.directMessages.${personId}`);
      }
    }
    for (const [kind, field] of [['read','read'],['pray','prayed']]) {
      if (state[field] === true) staged.activities.push({
        id:stableRowId('activity',PRIMARY_KEY + '.' + field,0),
        kind, occurredAt:null, localDate:null, timeCertainty:'unknown'
      });
    }
    if (typeof state.teamStatus === 'string') {
      staged.unscopedResponses.push({kind:'serving-response',value:state.teamStatus,shiftId:null,recordedAt:null});
    }
    if (typeof state.rsvp === 'string' && state.rsvp.length>0) {
      staged.unscopedResponses.push({kind:'gathering-rsvp',value:state.rsvp,gatheringId:null,recordedAt:null});
    }
    if (state.coverage === true) {
      staged.unscopedResponses.push({kind:'coverage-request',value:'requested',shiftId:null,recordedAt:null});
    }
    if (isObject(state.attendance)) {
      for (const [personId,value] of Object.entries(state.attendance)) {
        staged.demoAttendance.push({personId, status:copy(value), gatheringId:null,observedAt:null});
      }
    }
    if (isObject(state.companionCare)) {
      for (const [personId,details] of Object.entries(state.companionCare)) {
        staged.demoCare.push({personId, details:copy(details),source:'fictional-local-demo'});
      }
    }
  }
  if (ui !== null) {
    staged.legacyUi = {
      name: typeof ui.name === 'string' ? ui.name : null,
      memberships: isObject(ui.memberships) ? copy(ui.memberships) : null,
      seenGroupSignature: typeof ui.seenGroupSignature === 'string' ? ui.seenGroupSignature : null,
      verifiedMembership: false,
      convertedReadCursors: [] // Serialized array signatures cannot safely identify read message IDs.
    };
  }
  return staged;
}

/**
 * Pure deterministic proposal; returns 'blocked' instead of losing malformed
 * source bytes. Does not modify either input, call Date.now(), or write storage.
 */
function planLegacyFixtureMigration({primaryRaw=null,todayRaw=null}={}) {
  const backup = {[PRIMARY_KEY]:primaryRaw,[TODAY_UI_KEY]:todayRaw};
  const fingerprint = hash(JSON.stringify([primaryRaw,todayRaw]));
  const issues = [];
  const primary = parseLegacy(primaryRaw,PRIMARY_KEY,issues);
  const today = parseLegacy(todayRaw,TODAY_UI_KEY,issues);
  validateShapes(primary,today,issues);
  const present = primaryRaw !== null || todayRaw !== null;
  const status = issues.length ? 'blocked' : present ? 'ready' : 'empty';
  const stage = status === 'ready' ? stageFromLegacy(primary,today) : emptyStage();
  const warnings = [];
  if (status === 'ready') {
    warnings.push('No legacy relative time label is converted into an invented UTC timestamp.');
    warnings.push('Legacy demo membership and unread signatures are not converted into verified roles or read cursors.');
    warnings.push('Undated read/prayed flags and shift/RSVP states are preserved without invented event IDs or dates.');
    warnings.push('Legacy VersePlay, drafts if stored, unknown fields and unrelated preference values remain in the original raw-string backup.');
  }
  return {
    planVersion: PLAN_VERSION, status, fingerprint,
    sourceKeys: [PRIMARY_KEY,TODAY_UI_KEY],
    backup, issues, warnings, staged: stage,
    writesPerformed: false,
    writable: false // A later, separately approved atomic migration will need backup+rollback logic.
  };
}
module.exports = {PRIMARY_KEY,TODAY_UI_KEY,PLAN_VERSION,planLegacyFixtureMigration};
