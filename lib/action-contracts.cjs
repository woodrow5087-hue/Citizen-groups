'use strict';
/**
 * Versioned, fictional Rally Point event/action/source contracts, v1.
 * This module does not grant identity, permissions, church-system access,
 * or authority to interpret pastoral risk. It is not used by the live UI.
 */
const ACTION_SCHEMA_VERSION = 1;
const KEY = /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/;
const SOURCE_SYSTEMS = Object.freeze(['fixture', 'proposed-external']);
const EVENT_STATUSES = Object.freeze(['scheduled', 'cancelled', 'unknown']);
const RESPONSE_STATUSES = Object.freeze(['pending', 'confirmed', 'declined', 'unknown']);
const COVERAGE_STATUSES = Object.freeze(['requested', 'withdrawn', 'resolved']);
const ACTION_KINDS = Object.freeze(['conversation', 'gathering', 'serving', 'scripture', 'care']);
const TARGET_TYPES = Object.freeze(['conversation', 'gathering', 'servingShift', 'reading', 'careTask']);
const CARE_STATUSES = Object.freeze(['suggested', 'review', 'resolved', 'dismissed']);

function ensure(ok, detail) { if (!ok) throw new TypeError('Rally Point actions v1: ' + detail); }
function object(x, label) { ensure(x !== null && typeof x === 'object' && !Array.isArray(x), label + ' must be an object'); }
function key(x, label) { ensure(typeof x === 'string' && KEY.test(x), label + ' must be a stable identifier'); }
function optionalKey(x, label) { if (x !== null) key(x, label); }
function label(x, name, max = 160) { ensure(typeof x === 'string' && x.trim().length > 0 && x.length <= max, name + ' must be nonblank'); }
function choice(x, allowed, name) { ensure(allowed.includes(x), name + ' has an invalid value'); }
function timestamp(x, name) {
  if (x === null) return;
  ensure(typeof x === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(x) && !Number.isNaN(Date.parse(x)) && new Date(x).toISOString().slice(0,19) === x.slice(0,19), name + ' must be a valid UTC timestamp or null');
}
function blankActionSnapshot() {
  return {
    schemaVersion: ACTION_SCHEMA_VERSION,
    sourceReferences: [], gatherings: [], servingShifts: [],
    shiftResponses: [], coverageRequests: [], companionActions: [],
    careTasks: [], activityEvents: []
  };
}
function assertActionSnapshot(snapshot) {
  object(snapshot, 'snapshot');
  ensure(snapshot.schemaVersion === ACTION_SCHEMA_VERSION, 'unsupported schemaVersion');
  const spec = {
    sourceReferences: {
      id: key, organizationId: key,
      system: (x,n) => choice(x,SOURCE_SYSTEMS,n),
      resourceType: (x,n) => label(x,n),
      externalId: optionalKey,
      observedAt: timestamp
    },
    gatherings: {
      id: key, organizationId: key, groupId: key, title: label,
      startsAt: timestamp, status: (x,n) => choice(x,EVENT_STATUSES,n),
      sourceRefId: optionalKey
    },
    servingShifts: {
      id: key, organizationId: key, teamId: key, title: label,
      startsAt: timestamp, status: (x,n) => choice(x,EVENT_STATUSES,n),
      sourceRefId: optionalKey
    },
    shiftResponses: {
      id: key, shiftId: key, userId: key,
      response: (x,n) => choice(x,RESPONSE_STATUSES,n),
      recordedAt: timestamp, sourceRefId: optionalKey
    },
    coverageRequests: {
      id: key, shiftId: key, requestedByUserId: key,
      status: (x,n) => choice(x,COVERAGE_STATUSES,n),
      requestedAt: timestamp, sourceRefId: optionalKey
    },
    companionActions: {
      id: key, organizationId: key,
      kind: (x,n) => choice(x,ACTION_KINDS,n),
      targetType: (x,n) => choice(x,TARGET_TYPES,n),
      targetId: key,
      state: (x,n) => choice(x,['available','done','dismissed'],n),
      sourceRefId: optionalKey
    },
    careTasks: {
      id: key, organizationId: key, subjectUserId: key,
      assignedToUserId: optionalKey,
      status: (x,n) => choice(x,CARE_STATUSES,n),
      provenance: (x,n) => choice(x,['fictional-scenario','human-reviewed'],n),
      sourceRefId: optionalKey,
      reviewedAt: timestamp
    },
    activityEvents: {
      id: key, organizationId: key, userId: key,
      kind: (x,n) => choice(x,['read','pray','memorize'],n),
      occurredAt: timestamp,
      sourceRefId: optionalKey
    }
  };
  const lookups = {};
  for (const [collection, validators] of Object.entries(spec)) {
    ensure(Array.isArray(snapshot[collection]), collection + ' must be an array');
    const found = new Map();
    snapshot[collection].forEach((row, index) => {
      object(row, collection + '[' + index + ']');
      for (const [field, validator] of Object.entries(validators)) validator(row[field], collection + '[' + index + '].' + field);
      ensure(!found.has(row.id), collection + ': duplicate id ' + row.id);
      found.set(row.id, row);
    });
    lookups[collection] = found;
  }
  const sources = lookups.sourceReferences;
  function checkSource(row, type, orgId) {
    if (row.sourceRefId === null) return;
    const source = sources.get(row.sourceRefId);
    ensure(!!source, type + ' references unknown source');
    ensure(source.organizationId === orgId, type + ' crosses organization source boundary');
  }
  for (const row of [...snapshot.gatherings, ...snapshot.servingShifts]) checkSource(row, 'event', row.organizationId);
  for (const row of snapshot.shiftResponses) {
    const shift = lookups.servingShifts.get(row.shiftId);
    ensure(!!shift, 'response references missing shift');
    checkSource(row, 'response', shift.organizationId);
  }
  for (const row of snapshot.coverageRequests) {
    const shift = lookups.servingShifts.get(row.shiftId);
    ensure(!!shift, 'coverage references missing shift');
    checkSource(row, 'coverage', shift.organizationId);
  }
  for (const row of snapshot.companionActions) {
    checkSource(row, 'companion action', row.organizationId);
    const referenced = row.targetType === 'gathering' ? lookups.gatherings.get(row.targetId)
      : row.targetType === 'servingShift' ? lookups.servingShifts.get(row.targetId)
      : row.targetType === 'careTask' ? lookups.careTasks.get(row.targetId) : null;
    if (['gathering','servingShift','careTask'].includes(row.targetType)) {
      ensure(!!referenced, 'action references missing target');
      ensure(referenced.organizationId === row.organizationId, 'action target crosses organization boundary');
    }
  }
  for (const row of snapshot.careTasks) {
    ensure(!Object.hasOwn(row,'riskScore') && !Object.hasOwn(row,'spiritualScore'), 'care task must not contain automated risk/spiritual scores');
    checkSource(row, 'care task', row.organizationId);
  }
  for (const row of snapshot.activityEvents) checkSource(row, 'activity', row.organizationId);
  return snapshot;
}
module.exports = {
  ACTION_SCHEMA_VERSION, SOURCE_SYSTEMS, EVENT_STATUSES, RESPONSE_STATUSES,
  COVERAGE_STATUSES, ACTION_KINDS, CARE_STATUSES,
  blankActionSnapshot, assertActionSnapshot
};
