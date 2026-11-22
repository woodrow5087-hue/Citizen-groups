'use strict';

const {test}=require('node:test');
const assert=require('node:assert/strict');
const Source=require('../rallypoint-companion-source.js');
const Dashboard=require('../rallypoint-smart-dashboard.js');
const Board=require('../rallypoint-priority-board.js');
const Today=require('../rallypoint-today.js');
const Decision=require('../rallypoint-companion-decision.js');
const Companion=require('../rallypoint-personal-companion.js');
const Read=require('../rallypoint-conversation-read-model.js');
const domain={
  ...require('../lib/conversation-contracts.cjs'),
  ...require('../lib/mock-conversation-repository.cjs')
};

const now=new Date('2026-11-25T12:00:00');
const fixture=()=>({
  role:'member',rsvp:'maybe',teamStatus:'pending',read:false,reached:[],
  groupMessages:[{text:'Private archive text'}],teamMessages:[{text:'Private team text'}],
  prayers:[{name:'Marcus C.',text:'Private prayer text'}]
});
const membership=(group,team)=>({name:'Private profile name',memberships:{group,team}});
function project({state=fixture(),ui=membership(true,true),conversation,clock=now,today=Today}={}){
  return Dashboard.model({state,ui,conversation,now:clock,today,companion:Decision,passage:'John 15:12'});
}
function modernStore(){
  const saved=Read.fixture(domain);
  saved.messages.at(-1).body='Private modern message';
  const records=new Map([
    ['rallypoint-phase1-2026',JSON.stringify(fixture())],
    [Read.STORAGE_KEY,JSON.stringify({schemaVersion:1,snapshot:saved,draft:'Private draft',replyTo:null})]
  ]);
  const storage={getItem:key=>records.get(key)??null,setItem:(key,value)=>records.set(key,value)};
  return {records,storage};
}

test('snapshot projects only allowlisted facts from the real dashboard, board and modern cursor',()=>{
  const {records,storage}=modernStore();
  const before=new Map(records);
  const state=fixture(),ui=membership(true,true);
  const chat=Read.peek({storage,domain});
  assert.equal(chat.lastMessage.body,'Private modern message');
  const input=structuredClone({state,ui,chat});
  const model=project({state,ui,conversation:chat});
  const modelBefore=structuredClone(model);
  const actual=Source.snapshot({model,now});
  assert.deepEqual(actual,{
    viewer:{role:'member',group:true,team:true,audience:'connected'},
    sources:{group:'available',team:'available',conversation:'available',scripture:'available'},
    group:{nextDate:null,location:'North Commons',rsvp:'maybe',unreadCount:3},
    serving:{nextDate:null,location:'North Campus',response:'pending'},
    scripture:{passage:'John 15:12',readToday:false},
    board:{taskCount:Board.derive(model,now).taskCount},
    provenance:['smart-dashboard','priority-board','modern-conversation-read'],
    now:now.toISOString()
  });
  assert.doesNotMatch(JSON.stringify(actual),/Private|Marcus|seed_you|lastMessage|attendance|leaderRemaining/);
  assert.deepEqual(records,before);
  assert.deepEqual({state,ui,chat},input);
  assert.deepEqual(model,modelBefore);
  assert.deepEqual(Source.snapshot({model,now}),actual);
});

test('independent group and team scopes are re-evaluated even with old cursor and response state',()=>{
  const state={...fixture(),role:'leader',rsvp:'',teamStatus:'pending'};
  const {storage}=modernStore();
  const cursor=Read.peek({storage,domain});
  const get=(group,team)=>Source.snapshot({model:project({state,ui:membership(group,team),conversation:cursor}),now});
  const connected=get(true,true);
  assert.equal(connected.viewer.audience,'leader');
  assert.equal(connected.board.taskCount,4);
  assert.equal(connected.group.unreadCount,3);
  const groupOnly=get(true,false);
  assert.equal(groupOnly.sources.team,'not-member');
  assert.equal(Object.hasOwn(groupOnly,'serving'),false);
  assert.equal(groupOnly.board.taskCount,3);
  const teamOnly=get(false,true);
  assert.deepEqual(teamOnly.viewer,{role:'leader',group:false,team:true,audience:'volunteer'});
  assert.equal(teamOnly.sources.conversation,'not-member');
  assert.equal(Object.hasOwn(teamOnly,'group'),false);
  assert.equal(teamOnly.serving.response,'pending');
  assert.equal(teamOnly.board.taskCount,1);
  const revoked=get(false,false);
  assert.deepEqual(revoked.viewer,{role:'leader',group:false,team:false,audience:'newcomer'});
  assert.deepEqual(revoked.sources,{group:'not-member',team:'not-member',conversation:'not-member',scripture:'available'});
  assert.equal(Object.hasOwn(revoked,'group'),false);
  assert.equal(Object.hasOwn(revoked,'serving'),false);
  assert.equal(revoked.board.taskCount,0);
  assert.doesNotMatch(JSON.stringify(revoked),/North Commons|North Campus|modern-conversation-read/);
  const malformed=get('false',1);
  assert.equal(Object.hasOwn(malformed,'group'),false);
  assert.equal(Object.hasOwn(malformed,'serving'),false);
  const guest=Source.snapshot({model:project({ui:membership(false,false),conversation:cursor}),now});
  assert.deepEqual(guest.viewer,{role:'member',group:false,team:false,audience:'newcomer'});
});

test('the modern cursor distinguishes an acknowledged zero from unavailable, revoked and malformed sources',()=>{
  const {records,storage}=modernStore();
  const snapshot=conversation=>Source.snapshot({model:project({conversation}),now});
  const current=()=>snapshot(Read.peek({storage,domain}));
  assert.equal(current().group.unreadCount,3);
  assert.equal(Read.markRead({storage,domain}),true);
  const read=new Map(records);
  assert.equal(current().sources.conversation,'available');
  assert.equal(current().group.unreadCount,0);
  assert.deepEqual(records,read);

  const revoked=JSON.parse(storage.getItem(Read.STORAGE_KEY));
  revoked.snapshot.memberships.find(member=>member.userId===Read.SELF).status='revoked';
  for(const raw of [JSON.stringify(revoked),'{damaged']){
    storage.setItem(Read.STORAGE_KEY,raw);
    const unavailable=current();
    assert.equal(unavailable.sources.conversation,'unavailable');
    assert.equal(unavailable.group.unreadCount,null);
    assert.equal(storage.getItem(Read.STORAGE_KEY),raw);
  }
  assert.equal(snapshot(Read.peek({storage:{getItem(){throw Error('Blocked');}},domain})).group.unreadCount,null);
  assert.equal(snapshot(undefined).group.unreadCount,null);
  for(const unreadCount of [undefined,null,-1,1.5,'0']){
    const unknown=snapshot({status:'ok',unreadCount});
    assert.equal(unknown.sources.conversation,'unknown');
    assert.equal(unknown.group.unreadCount,null);
    assert.equal(unknown.board.taskCount,null);
  }
  const denied=snapshot({status:'no-access',unreadCount:9});
  assert.equal(denied.sources.conversation,'not-member');
  assert.equal(denied.group.unreadCount,null);
  assert.equal(denied.board.taskCount,null);
});

test('only explicit current occurrences can supply an upcoming date',()=>{
  const meeting=new Date('2026-11-26T01:30:00Z');
  const shift=new Date('2026-11-29T16:00:00Z');
  const datedSource={...Today,snapshot(state,ui,clock,chat){
    const result=Today.snapshot(state,ui,clock,chat);
    result.events=result.events.map(event=>({...event,dateSource:'scheduled',date:event.id==='group'?meeting:shift}));
    return result;
  }};
  const clock=new Date('2026-11-25T19:00:00Z');
  const model=project({clock,today:datedSource});
  assert.equal(Source.snapshot({model,now:clock}).group.nextDate,meeting.toISOString());
  assert.equal(Source.snapshot({model,now:clock}).serving.nextDate,shift.toISOString());
  assert.equal(Source.snapshot({model,now:meeting}).group.nextDate,meeting.toISOString());

  const after=new Date('2026-11-30T12:00:00Z');
  const expired=Source.snapshot({model:project({clock:after,today:datedSource}),now:after});
  assert.equal(expired.group.nextDate,null);
  assert.equal(expired.serving.nextDate,null);
  for(const [date,dateSource] of [[null,'scheduled'],[new Date(NaN),'scheduled'],[meeting,null]]){
    const uncertain=Source.snapshot({model:{...model,groupDate:date,groupDateSource:dateSource},now:clock});
    assert.equal(uncertain.group.nextDate,null);
  }
  const legacy=project({clock:after});
  assert.ok(legacy.groupDate>after && legacy.serveDate>after);
  const fromPreview=Source.snapshot({model:legacy,now:after});
  assert.equal(fromPreview.group.nextDate,null);
  assert.equal(fromPreview.serving.nextDate,null);
  const declined=Source.snapshot({model:project({state:{...fixture(),teamStatus:'declined'}}),now});
  assert.deepEqual(declined.serving,{nextDate:null,location:null,response:'declined'});
});

test('snapshots have frozen records and scalar dates without retaining input references',()=>{
  const clock=new Date('2026-11-25T19:00:00Z');
  const date=new Date('2026-11-26T01:30:00Z');
  const model={...project(),groupDate:date,groupDateSource:'scheduled'};
  const snapshot=Source.snapshot({model,now:clock});
  for(const record of [snapshot,...Object.values(snapshot).filter(value=>typeof value==='object')]){
    assert.ok(Object.isFrozen(record));
  }
  assert.throws(()=>{snapshot.group.location='changed';},TypeError);
  assert.throws(()=>snapshot.provenance.push('changed'),TypeError);
  assert.equal(Object.isFrozen(date),false);
  date.setUTCFullYear(2035);
  clock.setUTCFullYear(2035);
  model.groupLocation='changed';
  assert.equal(snapshot.group.nextDate,'2026-11-26T01:30:00.000Z');
  assert.equal(snapshot.now,'2026-11-25T19:00:00.000Z');
  assert.equal(snapshot.group.location,'North Commons');
  assert.throws(()=>Source.snapshot({model,now:new Date(NaN)}),TypeError);
});

test('missing model does not imply confirmed memberships, an available Scripture source or zero tasks',()=>{
  const snapshot=Source.snapshot({now});
  assert.deepEqual(snapshot.sources,{group:'unknown',team:'unknown',conversation:'unknown',scripture:'unknown'});
  assert.deepEqual(snapshot.board,{taskCount:null});
  assert.deepEqual(snapshot.provenance,[]);
  for(const property of ['group','serving','scripture'])assert.equal(Object.hasOwn(snapshot,property),false);
});

test('existing F-10 and F-10.3 consume the same preview dates and explicit action proposals',()=>{
  const state={...fixture(),rsvp:''};
  const model=project({state,conversation:{status:'ok',unreadCount:3}});
  const board=Board.derive(model,now);
  const sources={model,board,now};
  assert.equal(Source.snapshot({model,now}).group.nextDate,null);
  const week=Companion.respond('week',sources).response;
  assert.match(week.items[0].title,/Wed, Nov 25 · 6:30 PM/);
  assert.match(week.items[1].title,/Sun, Nov 29 · 9:00 AM/);
  const goal=Companion.respond('Help me get ready for Wednesday',{...sources,goalMode:true}).response;
  assert.equal(goal.goal,true);
  assert.ok(goal.items.some(item=>item.action?.kind==='confirm'&&item.action.id==='rsvp'));
  assert.equal(state.rsvp,'');
  assert.equal(state.teamStatus,'pending');
  assert.equal(Companion.respond('What about next week?',sources).response.limited,true);
});
