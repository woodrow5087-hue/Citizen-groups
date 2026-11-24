'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Context=require('../rally-one-member-context.js');
const Today=require('../rallypoint-today.js');
const Smart=require('../rallypoint-smart-dashboard.js');
const Board=require('../rallypoint-priority-board.js');
const Focus=require('../rally-one-unified-focus.js');
const Care=require('../rally-one-care-flow.js');
const now=new Date('2026-11-25T12:00:00');
const read=p=>fs.readFileSync(path.join(__dirname,'..',p),'utf8');
function state(extra={}){return {
 role:'member',rsvp:'',teamStatus:'pending',coverage:false,
 teamMessages:[{text:'Earlier notice',coverage:false},{text:'Coverage needed',coverage:true}],
 prayers:[{name:'Marcus C.',text:'Praying for wisdom with an upcoming decision.'}],
 companionCare:{marcus:{}},reached:[],read:false,rhythm:{},
 groupMessages:[],...extra
};}
const ui=(group,team)=>({name:'Alex',campus:'central',memberships:{group,team}});
const chat=count=>({status:'ok',unreadCount:count,lastMessage:null});
const snap=(s,u,c)=>Context.snapshot({state:s,ui:u,conversation:c,now});
function next(s,u,c){
 const member=snap(s,u,c);
 const m=Smart.model({state:s,ui:u,context:member,conversation:c,now,today:Today,
  companion:null,passage:'John 15:12'});
 const board=Board.derive(m,now);
 const care=Care.derive({state:s,member:member.memberships.group,now});
 const focus=Focus.focus({board,model:m,care,now});
 return {member,m,board,care,focus};
}
test('one read-only context respects membership and the actual modern unread source',()=>{
 const s=state(),visitor=snap(s,ui(false,false),chat(3));
 assert.equal(visitor.group.member,false);
 assert.equal(visitor.group.status,'not-joined');
 assert.equal(visitor.group.unreadCount,null);
 assert.equal(visitor.care.visible,false);
 assert.equal(visitor.team.response,'not-joined');
 assert.equal(visitor.permissions.groupLeader,false);
 const member=snap(s,ui(true,false),chat(3));
 assert.equal(member.group.unreadCount,3);
 assert.equal(member.group.rsvp,'');
 assert.equal(member.care.visible,true);
 assert.equal(member.team.response,'not-joined');
 assert.equal(snap(s,ui(true,false),{status:'unavailable',unreadCount:0}).group.unreadCount,null,
  'unavailable is never silently treated as a read message');
 assert.equal(Object.isFrozen(member),true);
 assert.equal(Object.isFrozen(member.group),true);
 assert.equal(member.identity.name,'Alex');
});
test('one explicit RSVP feeds context, Today priority and Groups without creating an activity log',()=>{
 const s=state(),u=ui(true,true),c=chat(3);
 const before=next(s,u,c);
 assert.equal(before.m.rsvp,'');
 assert.equal(before.member.group.rsvp,'');
 assert.deepEqual(before.focus.selectedIds,['group-rsvp','group-unread']);
 const acted=Context.transition({state:s,ui:u,conversation:c,command:{type:'group-rsvp',value:'going'},now});
 assert.equal(acted.ok,true);assert.equal(s.rsvp,'','pure transition cannot mutate original');
 assert.equal(acted.state.rsvp,'going');
 assert.equal(Object.isFrozen(acted.state),false,'the existing app state must remain editable after local transition');
 const after=next(acted.state,u,c);
 assert.equal(after.member.group.rsvp,'going');
 assert.equal(after.m.rsvp,'going');
 assert.ok(!after.focus.selectedIds.includes('group-rsvp'));
 assert.equal(after.focus.selectedIds[0],'group-unread');
 assert.equal(after.focus.selectedIds[1],'serve-response');
 assert.ok(!Object.hasOwn(acted.state,'activityLog'));
 assert.equal(Context.transition({state:acted.state,ui:u,conversation:c,command:{type:'group-rsvp',value:'going'},now}).ok,false,
  'no duplicate RSVP completion');
});
test('serving status propagates to Team and Today and preserves unrelated messages',()=>{
 const s=state(),u=ui(false,true),c=chat(8);
 assert.deepEqual(next(s,u,c).focus.selectedIds,['serve-response']);
 const x=Context.transition({state:s,ui:u,conversation:c,command:{type:'serving-response',value:'confirmed'},now});
 assert.equal(x.ok,true);
 assert.equal(x.state.teamStatus,'confirmed');
 assert.equal(x.state.coverage,false);
 assert.deepEqual(x.state.teamMessages,[{text:'Earlier notice',coverage:false}]);
 assert.equal(s.teamMessages.length,2);
 const result=next(x.state,u,c);
 assert.equal(result.member.team.response,'confirmed');
 assert.equal(result.m.serveStatus,'confirmed');
 assert.equal(result.focus.selectedIds.length,0);
 const decline=Context.transition({state:s,ui:u,conversation:c,command:{type:'serving-response',value:'declined'},now});
 assert.equal(decline.ok,true);
 assert.equal(snap(decline.state,u,c).team.response,'declined');
});
test('opening or inspecting context cannot alter read receipts',()=>{
 const original=chat(3),s=state(),u=ui(true,false);
 for(let i=0;i<4;i++)snap(s,u,original);
 assert.equal(original.unreadCount,3);
 assert.equal(next(s,u,original).member.group.unreadCount,3);
 assert.equal(next(s,u,chat(0)).member.group.unreadCount,0,
  'only a changed modern conversation projection can clear the unread action');
 assert.ok(!next(s,u,chat(0)).focus.selectedIds.includes('group-unread'));
 assert.ok(next(s,u,original).focus.selectedIds.includes('group-unread'));
 const source=read('rally-one-member-context.js');
 assert.doesNotMatch(source,/localStorage|sessionStorage|setItem|markRead|fetch\s*\(|WebSocket/);
});
test('group and team authorization gates prevent forged local actions',()=>{
 const s=state(),guest=ui(false,false),serve=ui(false,true),group=ui(true,false);
 for(const command of [
   {type:'group-rsvp',value:'going'},
   {type:'serving-response',value:'confirmed'},
   {type:'leader-review',person:'marcus'},
   {type:'care-mark-prayed'},
   {type:'care-resume'}
 ]){
   assert.equal(Context.transition({state:s,ui:guest,conversation:chat(3),command,now}).ok,false);
 }
 assert.equal(Context.transition({state:s,ui:serve,command:{type:'group-rsvp',value:'going'},now}).ok,false);
 assert.equal(Context.transition({state:s,ui:group,command:{type:'serving-response',value:'confirmed'},now}).ok,false);
 assert.equal(Context.transition({state:s,ui:group,command:{type:'leader-review',person:'marcus'},now}).ok,false);
 assert.equal(Context.transition({state:state({role:'leader'}),ui:ui(true,false),
  command:{type:'leader-review',person:'unknown'},now}).ok,false);
 assert.equal(Context.transition({state:s,ui:group,command:{type:'group-rsvp',value:'yes'},now}).ok,false);
 assert.equal(Context.transition({state:s,ui:group,command:{type:'random'},now}).ok,false);
});
test('authorized sample leader follow-through appears consistently then clears',()=>{
 const s=state({role:'leader',rsvp:'going'}),u=ui(true,false),c=chat(0);
 assert.equal(next(s,u,c).m.leaderRemaining,2);
 const one=Context.transition({state:s,ui:u,conversation:c,
   command:{type:'leader-review',person:'marcus'},now});
 assert.equal(one.ok,true);
 assert.equal(next(one.state,u,c).m.leaderRemaining,1);
 const two=Context.transition({state:one.state,ui:u,conversation:c,
   command:{type:'leader-review',person:'taylor'},now});
 assert.equal(two.ok,true);
 const complete=next(two.state,u,c);
 assert.equal(complete.m.leaderRemaining,0);
 assert.equal(complete.member.completed.leaderReviews,2);
 assert.equal(complete.focus.selectedIds.includes('leader-checkins'),false);
});
test('prayer moment stays explicit; optional follow-up is not sent by projection',()=>{
 const s=state({rsvp:'going'}),u=ui(true,false),c=chat(0);
 assert.equal(next(s,u,c).member.care.status,'ready');
 assert.deepEqual(next(s,u,c).focus.selectedIds,['care-prayer']);
 const prayer=Context.transition({state:s,ui:u,conversation:c,command:{type:'care-mark-prayed'},now});
 assert.equal(prayer.ok,true);
 assert.equal(next(prayer.state,u,c).member.care.status,'prayed');
 assert.deepEqual(next(prayer.state,u,c).focus.selectedIds,['care-check-in']);
 const withExplicitLocalSend={...prayer.state,
   companionCare:{marcus:{...prayer.state.companionCare.marcus,completedAt:now.toISOString()}}};
 assert.equal(next(withExplicitLocalSend,u,c).member.care.status,'followed-up');
 assert.ok(!next(withExplicitLocalSend,u,c).focus.selectedIds.some(id=>id.startsWith('care-')));
 assert.ok(!Object.hasOwn(prayer.state,'directMessages'),'praying never sends a DM');
});
test('all four roles use the same context source and no separate persistent owner',()=>{
 const roles=[
  [ui(false,false),state(),'newcomer'],
  [ui(true,false),state(),'group-member'],
  [ui(false,true),state(),'volunteer'],
  [ui(true,false),state({role:'leader'}),'leader']
 ];
 for(const [who,fixture,audience] of roles){
   const n=next(fixture,who,chat(2));
   assert.equal(n.m.audience,audience);
   assert.ok(n.focus.rows.length<=1);
   assert.equal(n.m.memberContext,n.member);
 }
 const app=read('rallypoint.js');
 assert.match(app,/function applyLocalAction\(command\)/);
 assert.match(app,/window\.RallyMemberContext\?\.snapshot/);
 assert.match(app,/reducer\.transition/);
 const engine=read('rally-one-intelligence.js');
 assert.match(app,/window\.RallyIntelligence\.derive/);
 assert.match(engine,/Context\.snapshot/);
 assert.match(engine,/conversation,context,now,today:Today/);
 assert.match(app,/context\?\.team\.response/);
 assert.match(app,/context\?\.group\.rsvp/);
 assert.match(app,/context\.permissions\.group/);
 const html=read('index.html'),build=read('scripts/build.cjs');
 assert.ok(html.includes('rally-one-member-context.js'));
 assert.ok(build.includes("'rally-one-member-context.js'"));
});

test('S8: malformed unread metadata is unavailable, not an empty or read conversation',()=>{
 const s=state({rsvp:'going',teamStatus:'confirmed',read:true}),u=ui(true,false);
 for(const unreadCount of [undefined,null,-1,10000,1.5,'0',NaN]){
   const raw={status:'ok',unreadCount};
   const result=next(s,u,raw);
   assert.equal(result.member.group.status,'unavailable');
   assert.equal(result.member.group.unreadCount,null);
   assert.equal(result.m.conversationStatus,'unavailable');
   assert.equal(result.m.modules.find(x=>x.id==='messages').detail,'Conversation needs review');
   assert.ok(result.focus.selectedIds.includes('group-unavailable'));
   assert.ok(!result.focus.selectedIds.includes('group-unread'));
   assert.equal(raw.status,'ok','projection must not mutate the original record');
 }
 const known=next(s,u,chat(0));
 assert.equal(known.member.group.status,'ok');
 assert.equal(known.member.group.unreadCount,0);
 assert.equal(known.m.modules.find(x=>x.id==='messages').detail,'All caught up');
 const guest=next(s,ui(false,false),chat(3));
 assert.equal(guest.m.conversationStatus,'not-joined');
 assert.ok(!guest.focus.selectedIds.includes('group-unavailable'));
});
