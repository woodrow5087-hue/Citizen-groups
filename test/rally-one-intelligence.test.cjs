'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const Engine=require('../rally-one-intelligence.js');
const Ask=require('../rallypoint-personal-companion.js');
const Focus=require('../rally-one-unified-focus.js');
const Contract=require('../lib/member-context-contract.cjs');
const now=new Date('2026-11-25T12:00:00Z');
const base={role:'member',rsvp:'going',teamStatus:'pending',read:true,prayed:true,prayers:[],reached:[],rhythm:{},companionCare:{},companionChoices:{snoozedUntil:{}}};
function input(group,team,extra={},chat={status:'ok',unreadCount:2}){
 return {state:{...base,...extra},ui:{name:'Alex',campus:'central',memberships:{group,team}},conversation:chat,now};
}
test('S8 role matrix uses one context and one explainable engine for Today and Ask Rally',()=>{
 const cases=[
  ['visitor',input(false,false),[],'welcome-community'],
  ['group member',input(true,false),['group-unread'],'group-unread'],
  ['serving volunteer',input(false,true),['serve-response'],'serve-response'],
  ['authorized leader',input(true,false,{role:'leader'},{status:'ok',unreadCount:0}),['leader-checkins'],'leader-checkins']
 ];
 for(const [name,args,ids,hero] of cases){
  const before=structuredClone(args),r=Engine.derive(args);
  assert.deepEqual(r.decision.selectedIds,ids,name);assert.equal(r.board.hero.id,hero,name);
  assert.equal(r.model.memberContext,r.context,name);
  assert.deepEqual(Engine.derive(args),r,'deterministic '+name);
  assert.deepEqual(args,before,'no implicit action '+name);
  assert.ok(r.focus.rows.length<=1&&r.decision.actionCount<=2);
  const why=Ask.answer('why',{model:r.model,board:r.board,now});
  assert.equal(why.intro,r.board.hero.why,'Ask explains the exact Today decision '+name);
  for(const reason of r.decision.reasons)assert.ok(reason.why.length>0);
  assert.equal(Contract.assertEnvelope(Contract.fromFixture({...args,focus:r.focus})).schemaVersion,1);
 }
});
test('S8 completion, explicit defer and resumption use existing fields without creating tasks',()=>{
 const args={...input(true,true,{rsvp:'',read:false}),twoCommitmentDemo:true};
 const first=Engine.derive(args);
 assert.deepEqual(first.decision.selectedIds,['group-rsvp','serve-response']);
 const done=Engine.derive({...args,state:{...args.state,rsvp:'going',teamStatus:'confirmed'},conversation:{status:'ok',unreadCount:0}});
 assert.deepEqual(done.decision.selectedIds,[]);
 const paused=input(true,false,{companionChoices:{snoozedUntil:{'group-unread':'2026-11-26T12:00:00.000Z'}}});
 assert.deepEqual(Engine.derive(paused).decision.selectedIds,[]);
 assert.equal(Engine.derive(paused).board.hero.id,'paused');
 assert.deepEqual(Engine.derive({...paused,now:new Date('2026-11-27T12:00:00Z')}).decision.selectedIds,['group-unread']);
});
test('S8 unknown conversation, care privacy, and leader revocation fail closed',()=>{
 for(const count of ['0',-1,NaN]){
  const r=Engine.derive(input(true,false,{}, {status:'ok',unreadCount:count}));
  assert.deepEqual(r.decision.selectedIds,['group-unavailable']);
 }
 const secret={...base,role:'leader',prayers:[{name:'Marcus C.',text:'Private fixture text'}],companionCare:{marcus:{}}};
 const guest=Engine.derive(input(false,false,secret));
 assert.deepEqual(guest.decision.selectedIds,[]);assert.equal(guest.care,null);
 assert.ok(!JSON.stringify(guest.decision).includes('Private fixture'));
 const member=Engine.derive(input(true,false,secret,{status:'ok',unreadCount:0}));
 assert.ok(member.decision.selectedIds.includes('leader-checkins'));
 const revoked=Engine.derive(input(true,false,{...secret,role:'member'},{status:'ok',unreadCount:0}));
 assert.ok(!revoked.decision.selectedIds.includes('leader-checkins'));
 const completed=Engine.derive(input(true,false,{...secret,role:'member',companionCare:{marcus:{completedAt:'2026-11-24T12:00:00.000Z'}}},{status:'ok',unreadCount:0}));
 assert.deepEqual(completed.decision.selectedIds,[]);
});
test('S8 shared eligibility rejects forged candidate facts and malformed memberships',()=>{
 for(const model of [{member:'true',team:1,audience:'leader',leaderRemaining:2},{member:false,team:false}]){
  for(const id of ['group-rsvp','group-unread','group-unavailable','leader-checkins','serve-response'])assert.equal(Focus.permitted(id,model),false);
 }
 assert.equal(Focus.permitted('group-unavailable',{member:true,conversationStatus:'ok'}),false);
 assert.equal(Focus.permitted('group-unread',{member:true,conversationStatus:'unavailable',unread:3}),false);
});
test('S8 service has no IO/AI dependency and both surfaces call the same service',()=>{
 const source=fs.readFileSync(require.resolve('../rally-one-intelligence.js'),'utf8');
 assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\s*\(|WebSocket|Date\.now\(|setItem|document\./);
 const app=fs.readFileSync(require.resolve('../rallypoint.js'),'utf8');
 assert.equal((app.match(/recommendationSnapshot\(now,chat\)/g)||[]).length,3);
 assert.doesNotMatch(app,/RallyUnifiedFocus\?\.focus|RallyPriorityBoard\.derive/);
});
test('S8 malformed source memberships cannot leak private legacy candidates into canonical model',()=>{
 const args=input(false,false,{role:'leader',prayers:[{name:'Marcus C.',text:'Restricted fixture'}]});
 args.ui.memberships={group:'true',team:1};
 const r=Engine.derive(args);
 assert.equal(r.context.permissions.group,false);
 assert.deepEqual(r.decision.selectedIds,[]);
 for(const item of r.model.allPriorities)assert.ok(!['care-marcus','group-unread','group-rsvp','serve-response'].includes(item.id));
});
