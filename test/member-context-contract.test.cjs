'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const C=require('../lib/member-context-contract.cjs');
const state={role:'member',rsvp:'',teamStatus:'pending',prayers:[],read:false};
const ui={name:'Alex',campus:'central',memberships:{group:true,team:true}};
const conversation={status:'ok',unreadCount:0};
const project=extra=>C.fromFixture({state,ui,conversation,...extra});
test('S8 canonical fixture handoff retains confirmed zero and does not mutate or write sources',()=>{
 const input={state:structuredClone(state),ui:structuredClone(ui),conversation:structuredClone(conversation)};
 const before=JSON.stringify(input),r=C.fromFixture(input);
 assert.equal(JSON.stringify(input),before);
 assert.equal(r.schemaVersion,1);assert.equal(r.mode,'demonstration');
 assert.equal(r.domains.conversations.state,'confirmed');
 assert.equal(r.domains.conversations.data.unreadCount,0);
 assert.equal(r.domains.profile.data.identityVerified,false);
 assert.equal(r.domains.care.state,'empty');
 assert.equal(r.domains.actions.state,'unknown');
 assert.ok(Object.isFrozen(r.domains.involvement.data));
});
test('S8 unknown, unavailable, malformed and restricted data never become confirmed zero',()=>{
 for(const [chat,status] of [[undefined,'unknown'],[{status:'unavailable'},'unavailable'],[{status:'ok'},'unknown'],[{status:'ok',unreadCount:'0'},'malformed']]){
  const r=project({conversation:chat}).domains.conversations;
  assert.equal(r.state,status);assert.equal(r.data,null);
 }
 for(const memberships of [{group:false,team:false},{group:'yes',team:true},{}]){
  const r=project({ui:{...ui,memberships}});
  for(const domain of ['relationships','conversations','care'])assert.equal(r.domains[domain].data,null);
  if(typeof memberships.group!=='boolean')assert.notEqual(r.domains.permissions.state,'confirmed');
 }
});
test('S8 source freshness uses observed evidence, never message age or a fabricated timestamp',()=>{
 const args={domain:'conversations',source:'adapter',state:'confirmed',data:{unreadCount:0},maximumAgeMs:60000,now:new Date('2026-11-24T12:00:00.000Z')};
 assert.equal(C.record(args).state,'unknown');
 assert.equal(C.record({...args,observedAt:'2026-11-24T11:58:00.000Z'}).state,'stale');
 assert.equal(C.record({...args,observedAt:'2026-11-24T12:01:00.000Z'}).state,'malformed');
 assert.equal(C.record({...args,observedAt:'2026-11-24T12:00:00.000Z'}).state,'confirmed');
 assert.equal(project().domains.conversations.observedAt,null);
});
test('S8 schema rejects versions, secret fields, contradictory permissions and private guest projections',()=>{
 const r=JSON.parse(JSON.stringify(project()));
 for(const mutate of [x=>x.schemaVersion=2,x=>x.token='secret',x=>x.domains.profile.data.token='secret',x=>x.domains.permissions.data.group=false]){
  const copy=structuredClone(r);mutate(copy);assert.throws(()=>C.assertEnvelope(copy));
 }
 const bad=C.record({domain:'conversations',source:'modern-thread',state:'confirmed',data:{unreadCount:0,body:'private'}});
 assert.equal(bad.state,'malformed');assert.equal(bad.data,null);
});
test('S8 format migration remains server/tool-only and preserves legacy raw backups',()=>{
 const source=fs.readFileSync(require.resolve('../lib/member-context-contract.cjs'),'utf8');
 assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\s*\(|setItem\s*\(/);
 const build=fs.readFileSync(require.resolve('../scripts/build.cjs'),'utf8');
 assert.ok(!build.includes('member-context-contract.cjs'));
 const raw='{broken original';
 const r=C.fromFixture({state:{...state,prayers:raw},ui,conversation});
 assert.equal(r.domains.care.state,'malformed');assert.equal(raw,'{broken original');
});
test('S8 cross-role envelopes fail closed and restrict recommendation IDs',()=>{
 for(const [group,team,role] of [[false,false,'member'],[true,false,'member'],[false,true,'member'],[true,false,'leader']]){
  const result=C.fromFixture({state:{...state,role},ui:{...ui,memberships:{group,team}},conversation,focus:{selectedIds:[]}});
  assert.equal(C.assertEnvelope(result),result);
  assert.equal(result.domains.permissions.data.groupLeader,group&&role==='leader');
  assert.equal(result.domains.conversations.data!==null,group);
  assert.equal(result.domains.serving.data!==null,team);
 }
 const guest=JSON.parse(JSON.stringify(project({ui:{...ui,memberships:{group:false,team:false}},focus:{selectedIds:[]}})));
 guest.domains.actions.data.selectedIds=['care-prayer'];
 assert.throws(()=>C.assertEnvelope(guest),/Restricted group action/);
 const extra=project({focus:{selectedIds:['group-rsvp','serve-response','group-unread']}});
 assert.equal(extra.domains.actions.state,'malformed');
 assert.throws(()=>C.fromFixture({state:'{broken',ui}),/parsed fixture/);
});
