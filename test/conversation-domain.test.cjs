'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {
  SCHEMA_VERSION, emptyConversationSnapshot, assertConversationSnapshot
}=require('../lib/conversation-contracts.cjs');
const {createMockConversationRepository}=require('../lib/mock-conversation-repository.cjs');

const when={
  first:'2026-11-18T18:30:00.000Z',
  second:'2026-11-18T18:31:00.000Z',
  third:'2026-11-18T18:32:00.000Z',
  team:'2026-11-19T09:00:00.000Z',
  now:'2026-11-21T14:00:00.000Z'
};
const makeSeed=()=>({
  schemaVersion:SCHEMA_VERSION,
  users:[
    {id:'u_anna',organizationId:'citizen',displayName:'Anna L.'},
    {id:'u_jess',organizationId:'citizen',displayName:'Jess W.'},
    {id:'u_sam',organizationId:'citizen',displayName:'Sam R.'},
    {id:'u_out',organizationId:'otherchurch',displayName:'Other Member'}
  ],
  conversations:[
    {id:'group_wed',organizationId:'citizen',kind:'group',title:'Wednesday Group',createdAt:when.first},
    {id:'team_sun',organizationId:'citizen',kind:'team',title:'Sunday Team',createdAt:when.first}
  ],
  memberships:[
    {id:'mem_anna',conversationId:'group_wed',userId:'u_anna',role:'member',status:'active'},
    {id:'mem_jess',conversationId:'group_wed',userId:'u_jess',role:'leader',status:'active'},
    {id:'mem_sam',conversationId:'team_sun',userId:'u_sam',role:'leader',status:'active'},
    {id:'mem_jess_team',conversationId:'team_sun',userId:'u_jess',role:'member',status:'active'}
  ],
  // Deliberately unordered: queries must sort by UTC timestamp, then stable ID.
  messages:[
    {id:'msg_b',conversationId:'group_wed',authorId:'u_anna',body:'Looking forward to Wednesday.',createdAt:when.second,replyToMessageId:'msg_a',deliveryStatus:'sent'},
    {id:'msg_team',conversationId:'team_sun',authorId:'u_sam',body:'Welcome team.',createdAt:when.team,replyToMessageId:null,deliveryStatus:'sent'},
    {id:'msg_c',conversationId:'group_wed',authorId:'u_jess',body:'See you all soon.',createdAt:when.third,replyToMessageId:null,deliveryStatus:'sent'},
    {id:'msg_a',conversationId:'group_wed',authorId:'u_jess',body:'What stood out in John 15?',createdAt:when.first,replyToMessageId:null,deliveryStatus:'sent'}
  ],
  reactions:[],readCursors:[]
});
const repo=(overrides={})=>createMockConversationRepository({seed:makeSeed(),clock:()=>when.now,...overrides});
const copy=value=>structuredClone(value);

test('v1 shape: explicit schema version, deterministic empty fixture, and valid reference graph',()=>{
  assert.equal(SCHEMA_VERSION,1);
  assert.deepEqual(Object.keys(emptyConversationSnapshot()),['schemaVersion','users','conversations','memberships','messages','reactions','readCursors']);
  assert.doesNotThrow(()=>assertConversationSnapshot(emptyConversationSnapshot()));
  const initial=makeSeed();
  assert.equal(assertConversationSnapshot(initial),initial);
});

test('v1 validation rejects unknown versions, duplicate identity and malformed fields',()=>{
  const brokenVersion=makeSeed();brokenVersion.schemaVersion=2;
  assert.throws(()=>assertConversationSnapshot(brokenVersion),/unsupported schemaVersion/);
  const duplicate=makeSeed();duplicate.messages.push(copy(duplicate.messages[0]));
  assert.throws(()=>assertConversationSnapshot(duplicate),/duplicate msg_b/);
  const invalidDate=makeSeed();invalidDate.messages[0].createdAt='2026-02-30T01:00:00Z';
  assert.throws(()=>assertConversationSnapshot(invalidDate),/UTC ISO/);
  const invalidBody=makeSeed();invalidBody.messages[0].body='  ';
  assert.throws(()=>assertConversationSnapshot(invalidBody),/nonblank/);
});

test('v1 validation blocks cross-organization membership, cross-conversation replies and cycles',()=>{
  const wrongOrg=makeSeed();wrongOrg.memberships[0].userId='u_out';
  assert.throws(()=>assertConversationSnapshot(wrongOrg),/organization/);
  const wrongParent=makeSeed();wrongParent.messages[0].replyToMessageId='msg_team';
  assert.throws(()=>assertConversationSnapshot(wrongParent),/same conversation/);
  const cycle=makeSeed();cycle.messages.find(m=>m.id==='msg_a').replyToMessageId='msg_b';
  assert.throws(()=>assertConversationSnapshot(cycle),/cyclic reply/);
  const missing=makeSeed();missing.readCursors.push({
    conversationId:'group_wed',userId:'u_anna',lastReadMessageId:'unknown',readAt:when.now
  });
  assert.throws(()=>assertConversationSnapshot(missing),/read cursor/);
});

test('queries return ordered deep copies and never mutate the caller’s original fixtures',()=>{
  const original=makeSeed();
  const r=createMockConversationRepository({seed:original,clock:()=>when.now});
  assert.deepEqual(r.listMessages({conversationId:'group_wed',userId:'u_anna'}).map(m=>m.id),['msg_a','msg_b','msg_c']);
  assert.deepEqual(r.listConversationsForUser('u_jess').map(c=>c.id),['team_sun','group_wed']);
  const returned=r.listMessages({conversationId:'group_wed',userId:'u_anna'});
  returned[0].body='mutated external array';
  r.getSnapshot().messages[0].body='mutated snapshot';
  assert.equal(r.listMessages({conversationId:'group_wed',userId:'u_anna'})[0].body,'What stood out in John 15?');
  assert.deepEqual(original,makeSeed());
  assert.deepEqual(r.listConversationsForUser('u_out'),[]);
});

test('mock active memberships gate reads and writes, including revocation',()=>{
  const r=repo();
  assert.throws(()=>r.listMessages({conversationId:'group_wed',userId:'u_sam'}),/no active membership/);
  assert.throws(()=>r.sendMessage({conversationId:'group_wed',userId:'u_out',body:'Not allowed'}),/no active membership/);
  assert.throws(()=>r.listMessages({conversationId:'missing',userId:'u_jess'}),/unknown conversation/);
  assert.equal(r.setFixtureMembershipStatus({conversationId:'group_wed',userId:'u_anna',status:'revoked'}).status,'revoked');
  assert.deepEqual(r.listConversationsForUser('u_anna'),[]);
  assert.throws(()=>r.listMessages({conversationId:'group_wed',userId:'u_anna'}),/no active membership/);
  assert.throws(()=>r.markRead({conversationId:'group_wed',userId:'u_anna',messageId:'msg_c'}),/no active membership/);
  assert.throws(()=>r.toggleReaction({messageId:'msg_a',userId:'u_anna',emoji:'❤️'}),/no active membership/);
  // History must survive membership revocation.
  assert.doesNotThrow(()=>assertConversationSnapshot(r.getSnapshot()));
});

test('sending supports stable message IDs, quoted replies, and pending/failure/retry/sent states',()=>{
  const r=repo();
  assert.throws(()=>r.sendMessage({conversationId:'group_wed',userId:'u_anna',body:'  '}),/nonblank/);
  assert.throws(()=>r.sendMessage({conversationId:'group_wed',userId:'u_anna',body:'Wrong thread',replyToMessageId:'msg_team'}),/across conversations/);
  const pending=r.sendMessage({conversationId:'group_wed',userId:'u_anna',body:'  Thanks!  ',replyToMessageId:'msg_a'});
  assert.equal(pending.id,'msg_1');
  assert.equal(pending.body,'Thanks!');
  assert.equal(pending.replyToMessageId,'msg_a');
  assert.equal(pending.createdAt,when.now);
  assert.equal(pending.deliveryStatus,'pending');
  assert.throws(()=>r.sendMessage({conversationId:'group_wed',userId:'u_jess',body:'Cannot quote pending',replyToMessageId:pending.id}),/reply target/);
  assert.throws(()=>r.setDeliveryStatus({messageId:pending.id,userId:'u_jess',status:'sent'}),/fictional author/);
  assert.equal(r.setDeliveryStatus({messageId:pending.id,userId:'u_anna',status:'failed'}).deliveryStatus,'failed');
  assert.throws(()=>r.setDeliveryStatus({messageId:pending.id,userId:'u_anna',status:'sent'}),/invalid delivery transition/);
  assert.equal(r.setDeliveryStatus({messageId:pending.id,userId:'u_anna',status:'pending'}).deliveryStatus,'pending');
  assert.equal(r.setDeliveryStatus({messageId:pending.id,userId:'u_anna',status:'sent'}).deliveryStatus,'sent');
  assert.throws(()=>r.setDeliveryStatus({messageId:pending.id,userId:'u_anna',status:'failed'}),/invalid delivery transition/);
  assert.doesNotThrow(()=>assertConversationSnapshot(r.getSnapshot()));
});

test('reactions toggle by user/emoji/message and reject pending messages or inaccessible threads',()=>{
  const r=repo();
  const first=r.toggleReaction({messageId:'msg_a',userId:'u_anna',emoji:'❤️'});
  assert.equal(first.active,true);
  assert.equal(first.reaction.id,'reaction_1');
  assert.equal(r.listReactions({conversationId:'group_wed',userId:'u_jess',messageId:'msg_a'}).length,1);
  assert.equal(r.toggleReaction({messageId:'msg_a',userId:'u_anna',emoji:'❤️'}).active,false);
  assert.equal(r.listReactions({conversationId:'group_wed',userId:'u_jess',messageId:'msg_a'}).length,0);
  assert.throws(()=>r.listReactions({conversationId:'team_sun',userId:'u_sam',messageId:'msg_a'}),/crosses conversation/);
  const pending=r.sendMessage({conversationId:'group_wed',userId:'u_jess',body:'Pending'});
  assert.throws(()=>r.toggleReaction({messageId:pending.id,userId:'u_anna',emoji:'❤️'}),/sent message/);
});

test('read cursors are per-user and per-conversation, monotonic, and exclude authored/pending messages',()=>{
  const r=repo();
  assert.equal(r.getReadCursor({conversationId:'group_wed',userId:'u_anna'}),null);
  assert.equal(r.getUnreadCount({conversationId:'group_wed',userId:'u_anna'}),2);
  assert.equal(r.getUnreadCount({conversationId:'group_wed',userId:'u_jess'}),1);
  assert.equal(r.getUnreadCount({conversationId:'team_sun',userId:'u_jess'}),1);
  const cursor=r.markRead({conversationId:'group_wed',userId:'u_anna',messageId:'msg_a'});
  assert.equal(cursor.lastReadMessageId,'msg_a');
  assert.equal(cursor.readAt,when.now);
  assert.equal(r.getUnreadCount({conversationId:'group_wed',userId:'u_anna'}),1);
  r.markRead({conversationId:'group_wed',userId:'u_anna',messageId:'msg_c'});
  assert.equal(r.getUnreadCount({conversationId:'group_wed',userId:'u_anna'}),0);
  assert.equal(r.markRead({conversationId:'group_wed',userId:'u_anna',messageId:'msg_a'}).lastReadMessageId,'msg_c');
  assert.equal(r.getReadCursor({conversationId:'group_wed',userId:'u_jess'}),null);
  assert.equal(r.getReadCursor({conversationId:'team_sun',userId:'u_jess'}),null);
  const pending=r.sendMessage({conversationId:'group_wed',userId:'u_jess',body:'New relevant update'});
  assert.equal(r.getUnreadCount({conversationId:'group_wed',userId:'u_anna'}),0);
  assert.throws(()=>r.markRead({conversationId:'group_wed',userId:'u_anna',messageId:pending.id}),/sent message/);
  r.setDeliveryStatus({messageId:pending.id,userId:'u_jess',status:'sent'});
  assert.equal(r.getUnreadCount({conversationId:'group_wed',userId:'u_anna'}),1);
  assert.equal(r.getUnreadCount({conversationId:'group_wed',userId:'u_jess'}),1,'author does not accrue unread for own message');
});

test('repository never touches localStorage, network, or current UI scripts',()=>{
  const r=repo();
  assert.equal(r.schemaVersion,1);
  assert.doesNotThrow(()=>r.sendMessage({conversationId:'group_wed',userId:'u_anna',body:'Fictional only'}));
  const root=path.resolve(__dirname,'..');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
  const app=fs.readFileSync(path.join(root,'rallypoint.js'),'utf8');
  for(const file of ['conversation-contracts.cjs','mock-conversation-repository.cjs']){
    assert.equal(html.includes(file),false,'no new script imports in live UI');
    assert.equal(build.includes(file),false,'no new runtime file copied into dist');
    assert.equal(app.includes(file),false,'no integration into browser controller');
  }
});
