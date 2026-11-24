'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Engine=require('../rally-one-intelligence.js'),Context=require('../rally-one-member-context.js'),Ask=require('../rallypoint-personal-companion.js');
const now=new Date('2026-11-25T12:00:00Z');
const chat=unreadCount=>({status:'ok',unreadCount});
const fixture=(group,team,extra={},conversation=chat(0))=>({
 state:{role:'member',rsvp:'going',teamStatus:'confirmed',coverage:false,teamMessages:[],groupMessages:[],read:true,prayed:true,prayers:[],reached:[],rhythm:{},companionCare:{},companionChoices:{snoozedUntil:{}},...extra},
 ui:{name:'Alex',campus:'central',memberships:{group,team}},conversation,now
});
function inspect(args,expected,audience){
 const before=structuredClone(args),result=Engine.derive(args);
 assert.deepEqual(result.decision.selectedIds,expected);
 assert.equal(result.model.audience,audience);
 assert.ok(result.focus.rows.length<=1&&result.decision.actionCount<=2);
 assert.equal(Ask.answer('why',{model:result.model,board:result.board,now:args.now}).intro,result.board.hero.why);
 assert.deepEqual(Engine.derive(args),result);
 assert.deepEqual(args,before,'viewing and explaining are not actions');
 return result;
}
function act(args,command){
 const before=structuredClone(args),r=Context.transition({...args,command});
 assert.equal(r.ok,true);assert.deepEqual(args,before);
 return {...args,state:r.state};
}
const prayer={name:'Marcus C.',text:'Synthetic private prayer example'};
test('10C.1 visitor: welcome without obligations or private membership data',()=>{
 const args=fixture(false,false,{role:'leader',prayers:[prayer],teamStatus:'pending',rsvp:''},chat(9));
 const r=inspect(args,[],'newcomer');
 assert.equal(r.board.hero.id,'welcome-community');
 assert.equal(r.context.group.unreadCount,null);assert.equal(r.care,null);
 assert.equal(r.context.permissions.groupLeader,false);
 const answer=Ask.answer('group',{model:r.model,board:r.board,now});
 assert.ok(!JSON.stringify(answer).includes(prayer.text));
 assert.equal(Context.transition({...args,command:{type:'group-rsvp',value:'going'}}).ok,false);
});
test('10C.1 connected group member: RSVP and reading the conversation are independent',()=>{
 let args=fixture(true,false,{rsvp:''},chat(2));
 inspect(args,['group-rsvp','group-unread'],'group-member');
 args=act(args,{type:'group-rsvp',value:'going'});
 inspect(args,['group-unread'],'group-member');
 inspect({...args,conversation:chat(0)},[],'group-member');
 assert.equal(args.conversation.unreadCount,2);
});
test('10C.1 serving volunteer: confirm or decline, never expose group care',()=>{
 const args=fixture(false,true,{teamStatus:'pending',prayers:[prayer]},chat(6));
 const r=inspect(args,['serve-response'],'volunteer');assert.equal(r.care,null);
 for(const value of ['confirmed','declined']){
  const next=act(args,{type:'serving-response',value});
  const after=inspect(next,[],'volunteer');assert.equal(after.context.team.response,value);
 }
});
test('10C.1 relational care: notice, explicit prayer, optional check-in and follow-through',()=>{
 let args=fixture(true,false,{prayers:[prayer]});
 const first=inspect(args,['care-prayer'],'group-member');
 assert.equal(first.board.hero.primary.id,'care-open-prayer');
 args=act(args,{type:'care-mark-prayed'});
 const next=inspect(args,['care-check-in'],'group-member');
 assert.equal(next.board.hero.primary.id,'companion-encourage');
 assert.equal(next.context.care.followedUp,false);
 // Model a completed explicit local send from the existing message owner.
 const completed={...args,state:{...args.state,companionCare:{marcus:{...args.state.companionCare.marcus,completedAt:now.toISOString()}}}};
 inspect(completed,[],'group-member');
 assert.equal(args.state.companionCare.marcus.completedAt,undefined);
});
test('10C.1 leader: scoped review clears through explicit actions, revocation removes access',()=>{
 let args=fixture(true,false,{role:'leader'});
 inspect(args,['leader-checkins'],'leader');
 args=act(args,{type:'leader-review',person:'marcus'});
 assert.equal(inspect(args,['leader-checkins'],'leader').context.leader.pendingIds.length,1);
 args=act(args,{type:'leader-review',person:'taylor'});
 inspect(args,[],'leader');
 const revoked={...args,state:{...args.state,role:'member',reached:[]}};
 inspect(revoked,[],'group-member');
 assert.equal(Context.transition({...revoked,command:{type:'leader-review',person:'marcus'}}).ok,false);
});
test('10C.1 competing commitments never exceed two visible response actions',()=>{
 let args={...fixture(true,true,{rsvp:'',teamStatus:'pending',prayers:[prayer]},chat(3)),twoCommitmentDemo:true};
 inspect(args,['group-rsvp','serve-response'],'connected');
 args=act(args,{type:'group-rsvp',value:'going'});
 args=act(args,{type:'serving-response',value:'confirmed'});
 inspect(args,['group-unread','care-prayer'],'connected');
 inspect({...args,conversation:chat(0)},['care-prayer'],'connected');
});
test('10C.1 unavailable conversation is not equivalent to no unread messages',()=>{
 const args=fixture(true,false,{}, {status:'unavailable',unreadCount:0});
 assert.equal(inspect(args,['group-unavailable'],'group-member').context.group.unreadCount,null);
});
test('10C.1 paused care remains optional and returns only when the saved pause ends',()=>{
 const args=fixture(true,false,{prayers:[prayer],companionCare:{marcus:{snoozedUntil:'2026-11-26T12:00:00Z'}}});
 inspect(args,[],'group-member');
 inspect({...args,now:new Date('2026-11-27T12:00:00Z')},['care-prayer'],'group-member');
});
