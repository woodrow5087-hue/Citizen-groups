'use strict';

/**
 * In-memory, fictional conversation repository. No localStorage, network, push,
 * credentials, live membership or server enforcement. Not imported by index.html.
 */
const {
  SCHEMA_VERSION,
  DELIVERY_STATES,
  emptyConversationSnapshot,
  assertConversationSnapshot
} = require('./conversation-contracts.cjs');

function requireThat(condition, explanation) {
  if (!condition) throw new Error('Mock conversation repository: ' + explanation);
}
const clone = value => structuredClone(value);
const compareMessages = (a,b) =>
  Date.parse(a.createdAt) - Date.parse(b.createdAt) || a.id.localeCompare(b.id);
const nonemptyId = (id,label) =>
  requireThat(typeof id === 'string' && id.trim() !== '', label + ' is required');

/**
 * @param {object} options
 * @param {object} [options.seed] v1 snapshot, never mutated
 * @param {function} [options.clock] injectable Date/string provider for deterministic tests
 * @param {function} [options.idFactory] optional injectable (prefix)=>id
 */
function createMockConversationRepository({
  seed = emptyConversationSnapshot(),
  clock = () => new Date(),
  idFactory = null
} = {}) {
  requireThat(typeof clock === 'function', 'clock must be a function');
  requireThat(idFactory === null || typeof idFactory === 'function', 'idFactory must be a function');
  assertConversationSnapshot(seed);
  const state = clone(seed);
  let sequence = 0;

  const now = () => {
    const candidate = clock();
    const date = candidate instanceof Date ? candidate : new Date(candidate);
    requireThat(!Number.isNaN(date.getTime()), 'clock must produce a valid date');
    return date.toISOString();
  };
  const findConversation = id => {
    nonemptyId(id,'conversationId');
    const found = state.conversations.find(c=>c.id===id);
    requireThat(!!found,'unknown conversation');
    return found;
  };
  const findMessage = id => {
    nonemptyId(id,'messageId');
    const found = state.messages.find(m=>m.id===id);
    requireThat(!!found,'unknown message');
    return found;
  };
  const member = (conversationId,userId) => {
    const conversation = findConversation(conversationId);
    nonemptyId(userId,'userId');
    const found = state.memberships.find(m=>m.conversationId===conversationId && m.userId===userId);
    requireThat(found?.status === 'active','no active membership for conversation');
    const user = state.users.find(u=>u.id===userId);
    requireThat(!!user && user.organizationId===conversation.organizationId,'organization boundary violation');
    return found;
  };
  const sorted = conversationId => state.messages.filter(m=>m.conversationId===conversationId).sort(compareMessages);
  const sent = conversationId => sorted(conversationId).filter(m=>m.deliveryStatus==='sent');
  const cursor = (conversationId,userId) => state.readCursors.find(c=>c.conversationId===conversationId && c.userId===userId);
  const freshId = (kind,collection) => {
    const used = new Set(state[collection].map(row=>row.id));
    for (let tries=0;tries<100;tries++) {
      const proposed = idFactory ? idFactory(kind) : kind + '_' + (++sequence);
      requireThat(typeof proposed === 'string' && /^[A-Za-z0-9][A-Za-z0-9:_-]{0,127}$/.test(proposed), 'idFactory produced invalid identifier');
      if (!used.has(proposed)) return proposed;
    }
    throw new Error('Mock conversation repository: could not allocate unique ' + kind + ' ID');
  };

  const api = {
    schemaVersion: SCHEMA_VERSION,

    getSnapshot() {
      return clone(state);
    },

    listConversationsForUser(userId) {
      nonemptyId(userId,'userId');
      return clone(state.conversations
        .filter(c=>state.memberships.some(m=>m.conversationId===c.id && m.userId===userId && m.status==='active'))
        .sort((a,b)=>a.title.localeCompare(b.title)||a.id.localeCompare(b.id)));
    },

    listMessages({conversationId,userId}) {
      member(conversationId,userId);
      return clone(sorted(conversationId));
    },

    listReactions({conversationId,userId,messageId}) {
      member(conversationId,userId);
      const message = findMessage(messageId);
      requireThat(message.conversationId===conversationId,'reaction lookup crosses conversation boundary');
      return clone(state.reactions.filter(r=>r.messageId===messageId).sort((a,b)=>a.id.localeCompare(b.id)));
    },

    sendMessage({conversationId,userId,body,replyToMessageId=null}) {
      member(conversationId,userId);
      requireThat(typeof body==='string' && body.trim().length>0 && body.trim().length<=5000,'message body must be nonblank and <=5000 characters');
      if (replyToMessageId!==null) {
        const parent=findMessage(replyToMessageId);
        requireThat(parent.conversationId===conversationId,'cannot reply across conversations');
        requireThat(parent.deliveryStatus==='sent','reply target must have been sent');
      }
      const message={
        id:freshId('msg','messages'),
        conversationId,
        authorId:userId,
        body:body.trim(),
        createdAt:now(),
        deliveryStatus:'pending',
        replyToMessageId
      };
      state.messages.push(message);
      return clone(message);
    },

    setDeliveryStatus({messageId,userId,status}) {
      const message=findMessage(messageId);
      member(message.conversationId,userId);
      requireThat(message.authorId===userId,'only the fictional author may change delivery status');
      requireThat(DELIVERY_STATES.includes(status),'invalid delivery status');
      const allowed={
        pending:['pending','sent','failed'],
        failed:['failed','pending'],
        sent:['sent']
      };
      requireThat(allowed[message.deliveryStatus].includes(status), 'invalid delivery transition ' + message.deliveryStatus + ' -> ' + status);
      message.deliveryStatus=status;
      return clone(message);
    },

    toggleReaction({messageId,userId,emoji}) {
      const message=findMessage(messageId);
      member(message.conversationId,userId);
      requireThat(message.deliveryStatus==='sent','reactions require a sent message');
      requireThat(typeof emoji==='string' && emoji.trim().length>0 && emoji.length<=24,'invalid emoji label');
      const existing=state.reactions.findIndex(r=>r.messageId===messageId && r.userId===userId && r.emoji===emoji);
      if (existing!==-1) {
        const [removed]=state.reactions.splice(existing,1);
        return {active:false,reaction:clone(removed)};
      }
      const reaction={
        id:freshId('reaction','reactions'),messageId,userId,emoji,createdAt:now()
      };
      state.reactions.push(reaction);
      return {active:true,reaction:clone(reaction)};
    },

    markRead({conversationId,userId,messageId=null}) {
      member(conversationId,userId);
      if (messageId!==null) {
        const message=findMessage(messageId);
        requireThat(message.conversationId===conversationId && message.deliveryStatus==='sent','read marker must refer to a sent message in this conversation');
      }
      const prior=cursor(conversationId,userId);
      const ordered=sent(conversationId);
      const position=id=>id===null?-1:ordered.findIndex(m=>m.id===id);
      if (prior && position(messageId)<=position(prior.lastReadMessageId)) return clone(prior);
      const next={
        conversationId,userId,
        lastReadMessageId:messageId,
        readAt:now()
      };
      if (prior) Object.assign(prior,next);
      else state.readCursors.push(next);
      return clone(next);
    },

    getReadCursor({conversationId,userId}) {
      member(conversationId,userId);
      return clone(cursor(conversationId,userId)||null);
    },

    getUnreadCount({conversationId,userId}) {
      member(conversationId,userId);
      const ordered=sent(conversationId);
      const last=cursor(conversationId,userId)?.lastReadMessageId||null;
      const start=last===null?-1:ordered.findIndex(m=>m.id===last);
      return ordered.slice(start+1).filter(m=>m.authorId!==userId).length;
    },

    // Deliberately unmistakable mock-only control for fixture/revocation tests.
    setFixtureMembershipStatus({conversationId,userId,status}) {
      requireThat(status==='active'||status==='revoked','invalid fixture membership status');
      findConversation(conversationId);
      const record=state.memberships.find(m=>m.conversationId===conversationId&&m.userId===userId);
      requireThat(!!record,'cannot create membership through fixture status change');
      record.status=status;
      return clone(record);
    }
  };
  return Object.freeze(api);
}

module.exports={createMockConversationRepository};
