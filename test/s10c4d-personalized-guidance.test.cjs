'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const Ask=require('../rallypoint-personal-companion.js'),Engine=require('../rally-one-intelligence.js');
const corpus=require('../engineering/s10c4-evaluation-corpus.json');
const {restoreAsk,restoreApp,restoreContext}=require('./helpers/s10c4d-guidance-source.cjs');
const now=new Date('2026-11-25T12:00:00Z');
const fixtures={
 visitor:{group:false,team:false},connected:{group:true,team:true},
 'volunteer-pending':{team:true,extra:{teamStatus:'pending'}},
 'volunteer-confirmed':{team:true},
 'dual-commitments':{group:true,team:true,extra:{rsvp:'',teamStatus:'pending'},twoCommitmentDemo:true},
 'leader-request':{group:true,extra:{role:'leader',leaderRequest:'taylor-wednesday',reached:['marcus']},requestedCheckIn:true},
 'conversation-unavailable':{group:true,conversation:{status:'unavailable',unreadCount:0}}
};
function fixture({group=false,team=false,extra={},conversation={status:'ok',unreadCount:0},twoCommitmentDemo=false,requestedCheckIn=false}={}){
 return {state:{role:'member',rsvp:'going',teamStatus:'confirmed',read:true,prayed:true,prayers:[],reached:[],rhythm:{},companionCare:{},companionChoices:{snoozedUntil:{}},...extra},ui:{name:'Alex',campus:'central',memberships:{group,team}},conversation,now,twoCommitmentDemo,requestedCheckIn};
}
function derive(args){const r=Engine.derive(args);return {r,sources:{model:r.model,board:r.board,now}};}
const routes=r=>r.items.filter(x=>x.action).map(x=>x.action.kind==='go'?x.action.id+':'+(x.action.pane||''):x.action.id);
for(const c of corpus.cases.filter(x=>Object.hasOwn(fixtures,x.fixture)&&['connect','leader','focus'].includes(x.expect.intent)))test('10C.4D '+c.id+' '+c.query,()=>{
 const args=fixture(fixtures[c.fixture]),before=structuredClone(args),{r,sources}=derive(args),answer=Ask.respond(c.query,sources,c.prior).response;
 assert.equal(answer.intent,c.expect.intent);assert.equal(answer.outcome,c.expect.outcome);assert.deepEqual(routes(answer),c.expect.routes);
 assert.ok(answer.items.length<=2);assert.deepEqual(args,before);
 if(c.expect.intent==='focus'&&r.decision.selectedIds.length)assert.deepEqual(answer.items.map(x=>x.title),[r.board.hero,...r.board.rows].map(x=>x.title));
});
test('10C.4D explicit leader request, role and review state are all required',()=>{
 const q='What should I review as a leader?',a=fixture(fixtures['leader-request']);
 for(const [extra,group,want] of [[{role:'member'},true,'no-leader-access'],[{},false,'no-leader-access'],[{leaderRequest:null},true,'no-open-leader-request'],[{reached:['taylor']},true,'no-open-leader-request']]){
  const x={...a,state:{...a.state,...extra},ui:{...a.ui,memberships:{group,team:false}}};
  const r=Ask.respond(q,derive(x).sources).response;assert.equal(r.outcome,want);assert.deepEqual(routes(r),[]);assert.doesNotMatch(JSON.stringify(r),/Taylor/);
 }
 const r=Ask.respond(q,derive(a).sources).response;assert.match(Ask.render(r),/data-requested-check-in="1"/);assert.match(Ask.render(r),/data-pane="leader"/);
});
test('10C.4D role alone is not evidence of a member-requested check-in',()=>{
 const x=fixture({group:true,extra:{role:'leader'},requestedCheckIn:true});const r=Ask.respond('Any member-requested check-ins to review?',derive(x).sources).response;
 assert.equal(r.outcome,'no-open-leader-request');assert.deepEqual(routes(r),[]);
});
test('10C.4D paused priority does not become an outstanding response or new task',()=>{
 const x=fixture({group:true,conversation:{status:'ok',unreadCount:2},extra:{companionChoices:{snoozedUntil:{'group-unread':'2026-11-26T12:00:00Z'}}}});
 const s=derive(x).sources,r=Ask.respond('What needs my attention?',s).response;
 assert.equal(r.outcome,'respect-deferred');assert.deepEqual(routes(r),[]);assert.match(r.intro,/revisit/);
});
test('10C.4D care remains optional in a shared focus answer',()=>{
 const x=fixture({group:true,extra:{prayers:[{name:'Marcus C.',text:'PRIVATE SAMPLE REQUEST'}]}}),s=derive(x).sources;
 const r=Ask.respond('What should I focus on today?',s).response;assert.deepEqual(routes(r),['care-prayer']);assert.match(r.intro,/optional/);assert.ok(!JSON.stringify(r).includes('PRIVATE SAMPLE REQUEST'));
});
test('10C.4D typed week explains broader count, frozen opening unchanged',()=>{
 const s=derive(fixture(fixtures['dual-commitments'])).sources;
 assert.deepEqual(Ask.respond('week',s).response,Ask.answer('week',s));
 const typed=Ask.respond("What's happening this week?",s).response;assert.match(typed.intro,/wider sample overview/);assert.match(typed.intro,/deferred or require only review/);
});
test('10C.4D historical accepted source reconstruction',()=>{
 for(const [s,hash] of [[restoreAsk(),'b07078b46a5e09584ad114ba43408665dad454d4'],[restoreApp(),'f08416c51ae21bec37791c4b3f4aa8101d606c0a'],[restoreContext(),'843e38dcd838942deecfca18cc526332edd9ea58']]){
  const b=Buffer.from(s);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),hash);
 }
});
