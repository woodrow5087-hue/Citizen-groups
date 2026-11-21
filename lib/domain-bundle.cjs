'use strict';

/**
 * Composition boundary for previously reviewed F-02 v1 snapshots.
 * Fictional-only, independent of the browser shell and any real account system.
 *
 * Deliberate design choice: do not turn unresolved legacy identities, event
 * timestamps, team/group authority or Church Center references into facts.
 */
const {
  SCHEMA_VERSION,
  emptyConversationSnapshot,
  assertConversationSnapshot
} = require('./conversation-contracts.cjs');
const {
  ACTION_SCHEMA_VERSION,
  blankActionSnapshot,
  assertActionSnapshot
} = require('./action-contracts.cjs');

const DOMAIN_VERSION = 1;
const copy = value => structuredClone(value);
function requireValid(condition, detail) {
  if (!condition) throw new TypeError('Rally Point domain bundle v1: ' + detail);
}

function blankDomainBundle() {
  return {
    domainVersion: DOMAIN_VERSION,
    conversations: emptyConversationSnapshot(),
    actions: blankActionSnapshot()
  };
}
function assertDomainBundle(domain) {
  requireValid(domain !== null && typeof domain === 'object' && !Array.isArray(domain),
    'bundle must be an object');
  requireValid(domain.domainVersion === DOMAIN_VERSION, 'unsupported domainVersion');
  requireValid(domain.conversations?.schemaVersion === SCHEMA_VERSION, 'conversation schema version mismatch');
  requireValid(domain.actions?.schemaVersion === ACTION_SCHEMA_VERSION, 'action schema version mismatch');
  assertConversationSnapshot(domain.conversations);
  assertActionSnapshot(domain.actions);

  const users = new Map(domain.conversations.users.map(row => [row.id, row]));
  const conversations = new Map(domain.conversations.conversations.map(row => [row.id, row]));
  const {actions} = domain;
  const shifts = new Map(actions.servingShifts.map(row => [row.id,row]));
  const gatherings = new Map(actions.gatherings.map(row => [row.id,row]));
  const careTasks = new Map(actions.careTasks.map(row => [row.id,row]));

  function requireUser(userId, orgId, label) {
    const user = users.get(userId);
    requireValid(!!user, label + ': missing user');
    requireValid(user.organizationId === orgId, label + ': organization boundary violation');
  }
  for (const row of actions.shiftResponses) {
    requireUser(row.userId, shifts.get(row.shiftId).organizationId, 'shift response');
  }
  for (const row of actions.coverageRequests) {
    requireUser(row.requestedByUserId, shifts.get(row.shiftId).organizationId, 'coverage request');
  }
  for (const row of actions.activityEvents) {
    requireUser(row.userId, row.organizationId, 'activity event');
  }
  for (const row of actions.careTasks) {
    requireUser(row.subjectUserId, row.organizationId, 'care subject');
    if (row.assignedToUserId !== null) requireUser(row.assignedToUserId, row.organizationId, 'care assignee');
  }
  for (const row of actions.companionActions) {
    let target;
    if (row.targetType === 'conversation') {
      target = conversations.get(row.targetId);
      requireValid(!!target, 'companion action: missing conversation');
    }
    else if (row.targetType === 'gathering') target = gatherings.get(row.targetId);
    else if (row.targetType === 'servingShift') target = shifts.get(row.targetId);
    else if (row.targetType === 'careTask') target = careTasks.get(row.targetId);
    // Reading is an intentionally unresolved external logical reference, not an
    // authenticated record. Its authorization is deferred to the reading adapter.
    if (target) requireValid(target.organizationId === row.organizationId,
      'companion action: target crosses organization boundary');
  }
  return domain;
}

/**
 * Makes a deep-copied, validated bundle out of independently validated parts.
 * Callers cannot accidentally mutate snapshots through the returned reference.
 */
function composeDomainBundle({
  conversations = emptyConversationSnapshot(),
  actions = blankActionSnapshot()
} = {}) {
  const bundle = {
    domainVersion: DOMAIN_VERSION,
    conversations: copy(conversations),
    actions: copy(actions)
  };
  assertDomainBundle(bundle);
  return bundle;
}

module.exports = {
  DOMAIN_VERSION, blankDomainBundle, assertDomainBundle, composeDomainBundle
};
