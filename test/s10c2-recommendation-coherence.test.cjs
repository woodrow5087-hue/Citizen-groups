'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const Engine=require('../rally-one-intelligence.js'),Ask=require('../rallypoint-personal-companion.js');
const {restoreCompanionSource}=require('./helpers/s10c2-companion-source.cjs');
const now=new Date('2026-11-25T12:00:00Z');
const request={name:'Marcus C.',text:'Private synthetic request'};
const input=(extra={},memberships={group:true,team:false},unreadCount=0)=>({
 state:{role:'member',rsvp:'going',teamStatus:'confirmed',read:true,prayed:true,prayers:[],reached:[],rhythm:{},companionCare:{},companionChoices:{snoozedUntil:{}},...extra},
 ui:{name:'Alex',campus:'central',memberships},conversation:{status:'ok',unreadCount},now
});
function check(args,expected){
 const before=structuredClone(args),r=Engine.derive(args);
 assert.deepEqual(r.decision.selectedIds,expected);
 assert.equal(r.board.taskCount,r.decision.actionCount);
 assert.equal(r.board.taskCount,expected.length);
 assert.equal(r.board.caughtUp,r.board.hero.id==='caught-up');
 assert.equal(r.board.weeklyTaskCount,r.baselineBoard.taskCount);
 const sources={model:r.model,board:r.board,now:args.now};
 const next=Ask.answer('next',sources);
 const visible=[r.board.hero,...r.board.rows].filter(x=>expected.includes(x.id));
 if(expected.length){
  assert.deepEqual(next.items.map(x=>x.title),visible.map(x=>x.title));
  assert.doesNotMatch(JSON.stringify(next),/More sample items are available|You’re all caught up/);
 }else assert.match(next.items[0].title,/caught up/);
 assert.equal(Ask.answer('why',sources).intro,r.board.hero.why);
 assert.deepEqual(args,before);
 return {r,next,sources};
}
test('10C.2 care-only priority no longer gets an incorrect caught-up answer',()=>{
 const {r,next}=check(input({prayers:[request]}),['care-prayer']);
 assert.equal(r.baselineBoard.taskCount,0);
 assert.match(next.intro,/optional/);
 assert.equal(next.items[0].action,null,'safe care routing is a separate milestone');
 assert.ok(!JSON.stringify(next).includes(request.text));
});
test('10C.2 prayed care remains visible and optional until explicit completion',()=>{
 const args=input({prayers:[request],companionCare:{marcus:{prayedAt:now.toISOString()}}});
 const {next}=check(args,['care-check-in']);assert.match(next.intro,/optional/);
 check({...args,state:{...args.state,companionCare:{marcus:{prayedAt:now.toISOString(),completedAt:now.toISOString()}}}},[]);
});
test('10C.2 competing commitments produce exactly the same two focused recommendations',()=>{
 const {r,sources}=check({...input({rsvp:'',teamStatus:'pending',prayers:[request]},{group:true,team:true},3),twoCommitmentDemo:true},['group-rsvp','serve-response']);
 assert.equal(r.baselineBoard.taskCount,3);
 assert.match(Ask.answer('week',sources).intro,/3 sample items/);
});
test('10C.2 paused unread does not produce a phantom next action',()=>{
 const args=input({companionChoices:{snoozedUntil:{'group-unread':'2026-11-26T12:00:00Z'}}},{group:true,team:false},2);
 const {r}=check(args,[]);assert.equal(r.board.hero.id,'paused');
 assert.equal(r.baselineBoard.taskCount,1);
 check({...args,now:new Date('2026-11-27T12:00:00Z')},['group-unread']);
});
test('10C.2 guest and revoked membership never expose care or leader items',()=>{
 check(input({role:'leader',prayers:[request]},{group:false,team:false},5),[]);
});
test('10C.2 unavailable conversation remains a review priority, not zero unread',()=>{
 const {r}=check({...input(),conversation:{status:'unavailable',unreadCount:0}},['group-unavailable']);
 assert.equal(r.context.group.unreadCount,null);
});
test('10C.2 legacy mode retains the original board and weekly behavior',()=>{
 const r=Engine.derive({...input({rsvp:'',teamStatus:'pending'},{group:true,team:true},3),enabled:false});
 assert.equal(r.board,r.baselineBoard);assert.equal(r.decision,null);assert.equal(r.board.weeklyTaskCount,undefined);
 assert.equal(r.board.taskCount,3);
 assert.match(Ask.answer('week',{model:r.model,board:r.board,now}).intro,/3 sample items/);
});
test('10C.2 frozen companion source reconstructs exact previous approved bytes',()=>{
 const b=Buffer.from(restoreCompanionSource());assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),'d8527afdcd9cf43c82fe3237407b21d67a1b8c5a');
});
