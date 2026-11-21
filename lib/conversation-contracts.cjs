'use strict';

/**
 * Rally Point fictional conversation contracts, v1.
 * This module is deliberately not wired into the active browser application.
 * Client-side validation is NOT authentication or production authorization.
 */
const SCHEMA_VERSION = 1;
const CONVERSATION_KINDS = Object.freeze(['group', 'team', 'direct']);
const MEMBER_ROLES = Object.freeze(['member', 'leader']);
const MEMBERSHIP_STATES = Object.freeze(['active', 'revoked']);
const DELIVERY_STATES = Object.freeze(['pending', 'sent', 'failed']);
const KEY_PATTERN = /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/;

function assert(condition, message) {
  if (!condition) throw new TypeError('Conversation v1: ' + message);
}
function object(value, label) {
  assert(value !== null && typeof value === 'object' && !Array.isArray(value), label + ' must be an object');
}
function key(value, label) {
  assert(typeof value === 'string' && KEY_PATTERN.test(value), label + ' must be a stable nonempty identifier');
}
function string(value, label, maximum = 200) {
  assert(typeof value === 'string' && value.trim().length > 0 && value.length <= maximum, label + ' must be nonblank (max ' + maximum + ')');
}
function timestamp(value, label) {
  assert(typeof value === 'string' && /^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 19) === value.slice(0, 19), label + ' must be a valid UTC ISO timestamp');
}
function choice(value, options, label) {
  assert(options.includes(value), label + ' must be one of ' + options.join(', '));
}
function unique(list, projection, label) {
  const found = new Set();
  for (const row of list) {
    const id = projection(row);
    assert(!found.has(id), label + ': duplicate ' + id);
    found.add(id);
  }
}
function assertRecord(row, index, kind, spec) {
  const label = kind + '[' + index + ']';
  object(row, label);
  for (const [name, rule] of Object.entries(spec)) rule(row[name], label + '.' + name);
}
const rules = Object.freeze({
  users: {id: key, organizationId: key, displayName: (v,l)=>string(v,l,120)},
  conversations: {id: key, organizationId: key, kind: (v,l)=>choice(v,CONVERSATION_KINDS,l), title: (v,l)=>string(v,l,160), createdAt: timestamp},
  memberships: {id: key, conversationId: key, userId: key, role: (v,l)=>choice(v,MEMBER_ROLES,l), status: (v,l)=>choice(v,MEMBERSHIP_STATES,l)},
  messages: {
    id: key, conversationId: key, authorId: key,
    body: (v,l)=>string(v,l,5000), createdAt: timestamp,
    deliveryStatus: (v,l)=>choice(v,DELIVERY_STATES,l),
    replyToMessageId: (v,l)=>{if (v !== null) key(v,l);}
  },
  reactions: {id: key, messageId: key, userId: key, emoji: (v,l)=>string(v,l,24), createdAt: timestamp},
  readCursors: {
    conversationId: key, userId: key,
    lastReadMessageId: (v,l)=>{if (v !== null) key(v,l);},
    readAt: timestamp
  }
});

function emptyConversationSnapshot() {
  return {
    schemaVersion: SCHEMA_VERSION,
    users: [], conversations: [], memberships: [],
    messages: [], reactions: [], readCursors: []
  };
}

/**
 * Validates shape, reference integrity, organization scope, and uniqueness.
 * Historical entries from revoked members remain valid. This is not a role policy.
 * Returns its input for convenient composition; never modifies it.
 */
function assertConversationSnapshot(snapshot) {
  object(snapshot, 'snapshot');
  assert(snapshot.schemaVersion === SCHEMA_VERSION, 'unsupported schemaVersion (expected 1)');
  for (const [collection, spec] of Object.entries(rules)) {
    const rows = snapshot[collection];
    assert(Array.isArray(rows), 'snapshot.' + collection + ' must be an array');
    rows.forEach((row, i) => assertRecord(row, i, collection, spec));
    if (collection !== 'readCursors') unique(rows, row=>row.id, collection);
  }

  const users = new Map(snapshot.users.map(row=>[row.id,row]));
  const conversations = new Map(snapshot.conversations.map(row=>[row.id,row]));
  const messages = new Map(snapshot.messages.map(row=>[row.id,row]));
  const members = new Map();

  unique(snapshot.memberships, m=>m.conversationId + '/' + m.userId, 'memberships by conversation/user');
  for (const row of snapshot.memberships) {
    const conv = conversations.get(row.conversationId), user = users.get(row.userId);
    assert(!!conv && !!user, 'membership references missing user or conversation');
    assert(conv.organizationId === user.organizationId, 'membership must remain within one organization');
    members.set(row.conversationId + '/' + row.userId, row);
  }

  for (const row of snapshot.messages) {
    assert(conversations.has(row.conversationId), 'message references missing conversation');
    assert(members.has(row.conversationId + '/' + row.authorId), 'message author must belong to conversation (historical revoked members allowed)');
    if (row.replyToMessageId !== null) {
      const parent = messages.get(row.replyToMessageId);
      assert(!!parent && parent.conversationId === row.conversationId && parent.id !== row.id, 'reply must reference a different message in the same conversation');
    }
  }
  // Prevent malformed imports containing a cycle of replies.
  for (const row of snapshot.messages) {
    const seen = new Set([row.id]);
    let parentId = row.replyToMessageId;
    while (parentId !== null) {
      assert(!seen.has(parentId), 'cyclic reply reference');
      seen.add(parentId);
      parentId = messages.get(parentId).replyToMessageId;
    }
  }

  unique(snapshot.reactions, r=>r.messageId + '/' + r.userId + '/' + r.emoji, 'reactions by message/user/emoji');
  for (const row of snapshot.reactions) {
    const message = messages.get(row.messageId);
    assert(!!message, 'reaction references missing message');
    assert(members.has(message.conversationId + '/' + row.userId), 'reaction author must belong to message conversation');
  }

  unique(snapshot.readCursors, r=>r.conversationId + '/' + r.userId, 'readCursors by conversation/user');
  for (const row of snapshot.readCursors) {
    assert(members.has(row.conversationId + '/' + row.userId), 'read cursor requires a conversation membership');
    if (row.lastReadMessageId !== null) {
      const message = messages.get(row.lastReadMessageId);
      assert(!!message && message.conversationId === row.conversationId && message.deliveryStatus === 'sent', 'read cursor must reference a sent message in its conversation');
    }
  }
  return snapshot;
}
module.exports = {
  SCHEMA_VERSION, CONVERSATION_KINDS, MEMBER_ROLES, MEMBERSHIP_STATES,
  DELIVERY_STATES, emptyConversationSnapshot, assertConversationSnapshot
};
