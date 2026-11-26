'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Session=require('../foundation2/member-session.js'),PC=require('../rallypoint-personal-companion.js'),App=require('../rally-one-app-state.js'),Store=require('../foundation2/state-store.js'),Guard=require('../rallypoint-storage-guard.js');
const now=new Date('2026-11-26T12:00:00Z'),chat={status:'ok',unreadCount:3},ui={name:'Demo',campus:'north',memberships:{group:true,team:true}};
const initial=()=>App.initialize(()=>null,true);
function act(state,type,value,at=now){const events=Session.derive({state,ui,conversation:chat,now:at}).events;return Session.transition({state,ui,conversation:chat,now:at,command:{type,value,eventId:events[type==='group-rsvp'?'group':'team']}});}
test('dated responses persist for the same event, not the next week; legacy facts remain unbound',()=>{
 let state={...initial(),rsvp:'going',teamStatus:'confirmed'};
 let session=Session.derive({state,ui,conversation:chat,now});assert.equal(session.unbound,true);assert.equal(session.effective.rsvp,'');assert.equal(session.effective.teamStatus,'pending');
 state=act(state,'group-rsvp','going').state;state=act(state,'serving-response','confirmed').state;
 session=Session.derive({state:JSON.parse(JSON.stringify(state)),ui,conversation:chat,now});assert.equal(session.effective.rsvp,'going');assert.equal(session.effective.teamStatus,'confirmed');assert.equal(state.unboundPriorResponses.rsvp,'going');
 const next=Session.derive({state,ui,conversation:chat,now:new Date('2026-12-04T12:00:00Z')});assert.equal(next.effective.rsvp,'');assert.equal(next.effective.teamStatus,'pending');assert.equal(Object.keys(state.eventResponses.records).length,2);
});
test('stale event confirmation and visitor/forged profile authority fail without state mutation',()=>{
 const state=initial(),before=JSON.stringify(state);assert.equal(Session.transition({state,ui,conversation:chat,now:new Date('2026-12-04T12:00:00Z'),command:{type:'group-rsvp',value:'going',eventId:Session.derive({state,ui,conversation:chat,now}).events.group}}).ok,false);
 const guest={...ui,memberships:{group:false,team:false}};const s=Session.derive({state,ui:guest,conversation:chat,now});assert.equal(Session.transition({state,ui:guest,conversation:chat,now,command:{type:'serving-response',value:'confirmed',eventId:s.events.team}}).ok,false);assert.equal(JSON.stringify(state),before);
 const handoff=Session.previewProfile(JSON.stringify({name:'Local',campus:'maui',role:'leader',memberships:{group:true,team:true}}));assert.deepEqual(handoff,{status:'ready',name:'Local',campus:'maui'});
});
test('Today and canonical Ask consume the same required commitments; unread remains optional',()=>{
 for(const [group,team,role] of [[false,false,'member'],[true,false,'member'],[false,true,'member'],[true,true,'member'],[true,true,'leader']]){
  const profile={...ui,memberships:{group,team}};const session=Session.derive({state:{...initial(),role},ui:profile,conversation:chat,now});const d=Session.decision(session,now);assert.equal(d.board.taskCount,[d.view.primary,...d.view.secondary].filter(Boolean).length);
  const result=PC.respond('What needs my attention?',{model:session.snapshot.model,board:d.board,now});assert.ok(result.response);assert.equal(session.snapshot.context.permissions.groupLeader,group&&role==='leader');
 }
 let state=act(initial(),'group-rsvp','going').state;state=act(state,'serving-response','confirmed').state;const session=Session.derive({state,ui,conversation:chat,now});const d=Session.decision(session,now);assert.equal(d.view.calm,true);assert.equal(d.view.unread,3);assert.equal(d.board.taskCount,0);
 assert.match(PC.respond('What needs my attention?',{model:session.snapshot.model,board:d.board,now}).response.intro,/No current sample commitment/);
});
test('malformed event history is preserved and cannot accept a new response',()=>{
 const state={...initial(),eventResponses:{version:1,records:null}};assert.equal(Session.derive({state,ui,conversation:chat,now}).valid,false);assert.equal(act(state,'group-rsvp','going').ok,false);assert.equal(state.eventResponses.records,null);
});
test('profile updates and undo use existing journal, preserve original app keys and fixture authority',()=>{
 const map=new Map([[Guard.TODAY_KEY,'{"name":"Original","campus":"north"}']]),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const store=Store.create({storage,scenario:'visitor',Guard,AppState:App});const before=map.get(Guard.TODAY_KEY);assert.equal(store.updateProfile({name:'New',campus:'maui',role:'leader'}).ok,true);assert.equal(store.read().ui.name,'New');assert.equal(store.read().ui.memberships.group,false);assert.equal(store.read().state.role,'member');assert.equal(map.get(Guard.TODAY_KEY),before);assert.equal(store.updateProfile(null,{undo:true}).ok,true);assert.equal(store.read().ui.name,'Friend');
 storage.setItem=()=>{throw Error('blocked')};assert.equal(store.updateProfile({name:'No',campus:'north'}).ok,false);assert.equal(store.read().ui.name,'Friend');
});

test('unrelated reading changes do not rewrite legacy responses or silently bind them',()=>{
 const state={...initial(),rsvp:'going',teamStatus:'confirmed',coverage:true};
 const r=Session.transition({state,ui,conversation:chat,now,command:{type:'reading-mark',value:true}});
 assert.equal(r.ok,true);assert.equal(r.state.rsvp,'going');assert.equal(r.state.teamStatus,'confirmed');assert.equal(r.state.coverage,true);assert.equal(r.state.eventResponses,undefined);
});

test('unknown legacy response remains unknown rather than a confirmed or empty source',()=>{
 const state={...initial(),teamStatus:'unknown'};const s=Session.derive({state,ui,conversation:chat,now});assert.equal(s.snapshot.context.team.response,'unknown');assert.equal(Session.decision(s,now).view.calm,false);
});
test('personalization changes display identity, not synthetic member identity or permissions',()=>{
 const s=initial();const a=Session.derive({state:s,ui,conversation:chat,now});const b=Session.derive({state:s,ui:{...ui,name:'Other',campus:'maui'},conversation:chat,now});assert.equal(a.identity.id,b.identity.id);assert.equal(b.identity.name,'Other');assert.deepEqual(a.snapshot.context.permissions,b.snapshot.context.permissions);
});
