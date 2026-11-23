'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Scenarios=require('../rally-one-s7-demo.js');
const Member=require('../rally-one-member-context.js');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const base=()=>({
 role:'member',view:'group',groupPane:'gather',teamPane:'schedule',
 rsvp:'going',teamStatus:'confirmed',reached:['marcus'],read:true,
 companionCare:{marcus:{prayedAt:'2026-11-20T10:00:00.000Z'}},
 companionChoices:{snoozedUntil:{care:'later'}},
 groupMessages:[{name:'Jess W.',text:'Preserve fictional conversation'}],
 directMessages:{marcus:[{text:'Preserve fictional message'}]},
 memoryGames:{'john':{solved:true}},
 rhythm:{text:'Preserve Scripture'}
});
const ui=()=>({name:'Original',campus:'north',memberships:{group:true,team:true}});
test('five isolated repeatable scenarios, with no live or authenticated role claims',()=>{
 const host=Scenarios.create(base(),ui());
 assert.deepEqual(Scenarios.scenarios.map(s=>s.id),
  ['visitor','group-member','serving','leader','group-serving']);
 const expected={
  visitor:[false,false,'member'],
  'group-member':[true,false,'member'],
  serving:[false,true,'member'],
  leader:[true,false,'leader'],
  'group-serving':[true,true,'member']
 };
 for(const item of Scenarios.scenarios){
   const s=host.prepare(item.id);
   assert.equal(s.ok,true);
   assert.deepEqual([s.ui.memberships.group,s.ui.memberships.team,s.state.role],expected[item.id]);
   assert.equal(s.state.view,'today');
   assert.equal(s.state.groupPane,'overview');
   assert.equal(s.state.teamStatus,'pending');
   assert.equal(s.state.rsvp,'');
   assert.deepEqual(s.state.reached,[]);
   assert.equal(s.state.companionCare.marcus.prayedAt,undefined);
   assert.deepEqual(s.state.directMessages.marcus,[{text:'Preserve fictional message'}]);
   assert.equal(s.state.memoryGames.john.solved,true);
   const ctx=Member.snapshot({state:s.state,ui:s.ui,conversation:{status:'ok',unreadCount:3}});
   assert.equal(ctx.permissions.groupLeader,item.id==='leader');
   assert.equal(ctx.care.visible,!!s.ui.memberships.group&&!!s.state.prayers?.length);
 }
 assert.equal(host.prepare('evil-admin').ok,false);
 assert.equal(host.setActive('evil-admin'),false);
});
test('switching a scene does not contaminate others and restore returns starting state',()=>{
 const original=base(),settings=ui(),host=Scenarios.create(original,settings);
 const group=host.prepare('group-member');
 group.state.groupMessages.push({name:'X',text:'user changed fixture'});
 group.state.rsvp='maybe';
 const again=host.prepare('group-member');
 assert.equal(again.state.rsvp,'');
 assert.equal(again.state.groupMessages.length,1);
 const serve=host.prepare('serving');
 assert.equal(serve.ui.memberships.group,false);
 assert.equal(serve.state.groupMessages.length,1);
 assert.deepEqual(host.restore(),{ok:true,state:original,ui:settings});
 assert.equal(host.active(),null);
 assert.equal(host.setActive('leader'),true);
 assert.equal(host.active(),'leader');
 assert.equal(host.setActive(null),true);
 assert.equal(host.active(),null);
});
test('current approved app uses existing guarded save, no extra storage or second onboarding',()=>{
 const app=read('rallypoint.js'),markup=read('index.html'),build=read('scripts/build.cjs');
 assert.match(app,/window\.RallySprint7Demo\.create\(s,todayUI\)/);
 assert.match(app,/if\(!save\(\)\)/);
 assert.match(app,/s=oldState;todayUI=oldUI/);
 assert.match(app,/s7-scenario/);
 assert.match(app,/s7-restore/);
 assert.doesNotMatch(read('rally-one-s7-demo.js'),/localStorage|sessionStorage|fetch\s*\(|WebSocket/);
 for(const name of ['rally-one-s7-demo.js','rally-one-s7-demo.css']){
  assert.ok(markup.includes(name));assert.ok(build.includes("'"+name+"'"));
 }
});
test('snapshot denies malformed memberships, revoked leader, broken unread state',()=>{
 const baseState={role:'leader',reached:[],prayers:[{name:'Marcus C.',text:'Fictional prayer'}]};
 const malformed=Member.snapshot({
   state:baseState,ui:{memberships:{group:'false',team:1}},conversation:{status:'ok',unreadCount:23}
 });
 assert.equal(malformed.permissions.group,false);
 assert.equal(malformed.permissions.team,false);
 assert.equal(malformed.permissions.groupLeader,false);
 assert.equal(malformed.care.visible,false);
 assert.equal(malformed.group.unreadCount,null);
 const revoked=Member.snapshot({
   state:baseState,ui:{memberships:{group:false,team:true}},
   conversation:{status:'ok',unreadCount:20}
 });
 assert.equal(revoked.leader.pendingIds.length,0);
 assert.equal(revoked.group.unreadCount,null);
 for(const count of [-1,1.2,10000,'999',NaN]){
   const c=Member.snapshot({
     state:baseState,ui:{memberships:{group:true}},conversation:{status:'ok',unreadCount:count}
   });
   assert.equal(c.group.unreadCount,null);
 }
 const outage=Member.snapshot({
   state:baseState,ui:{memberships:{group:true}},conversation:{status:'unavailable',unreadCount:0}
 });
 assert.equal(outage.group.unreadCount,null);
 assert.equal(outage.group.status,'unavailable');
});
