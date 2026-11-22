'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {respond,canConfirm,formatOccurrence,questions}=require('../rallypoint-companion-journeys.js');

const gathering='2026-11-26T01:30:00.000Z';
const shift='2026-11-29T16:00:00.000Z';
const clock='2026-11-23T19:00:00.000Z';
const snapshot=(options={})=>{
  const {
    group=true,team=true,role='member',unread=3,conversation=group?'available':'not-member',
    groupDate=gathering,teamDate=shift,rsvp='none',response='pending',checkIns=0,
    now=clock,readToday=false,stepDue=false
  }=options;
  return {
    viewer:{group,team,role},now,
    sources:{group:group?'available':'not-member',team:team?'available':'not-member',conversation,scripture:'available'},
    ...(group&&{group:{nextDate:groupDate,location:'North Commons',rsvp,unreadCount:unread}}),
    ...(team&&{serving:{nextDate:teamDate,location:'North Campus',response}}),
    ...(group&&role==='leader'&&{leadership:{groupCheckIns:checkIns}}),
    scripture:{passage:'John 15:12',readToday,stepDue},
    board:{taskCount:0}
  };
};
const ask=(query,fixture,prior,receipt)=>respond(query,{snapshot:fixture,receipt},prior);
const actions=turn=>turn.response.items.flatMap(item=>item.action?[item.action]:[]);
const confirms=turn=>actions(turn).filter(action=>action.kind==='confirm');
const copy=turn=>JSON.stringify(turn.response);
const clicked=(operation,outcome='confirmed')=>({operation,outcome,source:'explicit-user-click'});

test('visitor gets optional discovery and Scripture without exposing private fixture facts',()=>{
  const guest=snapshot({group:false,team:false});
  const answer=ask('I’m new here. Where do I start?',guest);
  assert.match(answer.response.intro,/optional/);
  assert.deepEqual(actions(answer).map(({kind,id,pane})=>[kind,id,pane]),[
    ['go','group',''],['go','team',''],['go','read','scripture']
  ]);
  assert.match(copy(answer),/John 15:12/);
  assert.doesNotMatch(copy(answer),/Wednesday Group|Welcome Team|North Commons|North Campus|RSVP/);
  assert.equal(ask('start',guest).response.heading,answer.response.heading);
  assert.match(ask('Am I all caught up?',guest).response.intro,/no commitments/);
});

test('group preparation shows the explicit Mountain Time date, location, RSVP and modern unread count',()=>{
  const current=snapshot({team:false,unread:1});
  const baseline=structuredClone(current);
  const ready=ask('Help me get ready for Wednesday',current);
  assert.match(copy(ready),/Wed, Nov 25, 2026 · 6:30 PM MT · North Commons/);
  assert.match(copy(ready),/1 unread sample message\./);
  assert.deepEqual(confirms(ready),[
    {kind:'confirm',id:'rsvp',label:'Save Going',requiresExplicitClick:true,source:'local-fixture'}
  ]);
  assert.deepEqual(actions(ready).filter(a=>a.kind==='go').map(a=>a.pane),['gather','chat']);
  assert.equal(ready.context.focus,'group');
  for(const option of ready.suggestions)assert.equal(option.label,questions[option.id]);
  const yes=ask('Yes',current,ready.context);
  assert.equal(yes.response.intent,'group-status');
  assert.deepEqual(confirms(yes).map(a=>a.id),['rsvp']);
  assert.equal(ask('I’m in',current,ready.context).response.intent,'group-status');
  assert.deepEqual(current,baseline,'questions and recommendations leave source inputs untouched');
  const maybe=ask('What’s my RSVP?',snapshot({team:false,rsvp:'maybe'}));
  assert.match(copy(maybe),/Maybe is saved/);
  assert.deepEqual(confirms(maybe),[]);
  assert.equal(actions(maybe)[0].pane,'gather');
});

test('serving preparation and pending, confirmed and declined statuses use only the current assignment',()=>{
  const current=snapshot({group:false});
  const ready=ask('What do I need for Sunday?',current);
  assert.equal(ready.context.focus,'serve');
  assert.match(copy(ready),/Sun, Nov 29, 2026 · 9:00 AM MT · North Campus/);
  assert.doesNotMatch(copy(ready),/Wednesday Group|North Commons/);
  assert.deepEqual(confirms(ready).map(a=>a.id),['serve']);
  for(const [response,label] of [['confirmed','Confirmed'],['declined','Declined']]){
    const fixture=snapshot({group:false,response,teamDate:response==='declined'?null:shift});
    const result=ask('Can I confirm that?',fixture,ready.context);
    assert.match(copy(result),new RegExp(label+' on this device'));
    assert.deepEqual(confirms(result),[]);
    assert.equal(canConfirm(fixture,'serve'),false);
  }
});

test('follow-up references are bounded by the current explicit subject and genuine ambiguity',()=>{
  const current=snapshot();
  const start=ask('start',current);
  assert.deepEqual(start.suggestions.map(s=>s.id),['group','serve','check']);
  assert.equal(ask('What time?',current,start.context).response.intent,'clarify');
  const group=ask('I need to prepare for my group',current);
  assert.equal(ask('What time is it?',current,group.context).response.intent,'group-time');
  assert.equal(ask('Can you tell me where it is?',current,group.context).response.intent,'group-where');
  const serving=ask('And Sunday?',current,group.context);
  assert.equal(serving.context.focus,'serve');
  assert.match(copy(ask('What time?',current,serving.context)),/9:00 AM MT/);
  assert.equal(ask('Help me prepare for that',current,serving.context).response.intent,'serve');
  assert.equal(ask('Help me prepare',current,start.context).response.intent,'clarify');
  const mixed=ask('What time is my Wednesday Group and Sunday shift?',current,serving.context);
  assert.equal(mixed.response.intent,'clarify');
  assert.deepEqual(mixed.suggestions.slice(0,2).map(s=>s.id),['group','serve']);
  assert.deepEqual(actions(mixed),[]);
  assert.equal(ask('What should I do next?',current,group.context).context.focus,'group');
  assert.equal(ask('What should I do next?',current,start.context).response.intent,'check');
  const stop=ask('Not now',current,group.context);
  assert.equal(stop.context.focus,'');
  assert.deepEqual(stop.suggestions,[]);
  assert.equal(ask('Where?',current,stop.context).response.intent,'clarify');
});

test('saved receipts acknowledge only re-read responses and leave a single voluntary route',()=>{
  for(const [id,update,expected] of [
    ['rsvp',{rsvp:'going'},['group','gather','Going is saved']],
    ['serve',{response:'confirmed'},['team','schedule','Confirmed on this device']]
  ]){
    const pending=snapshot();
    const current=snapshot(update);
    const receipt=clicked(id);
    const rejected=ask('yes',pending,{},receipt);
    assert.match(rejected.response.heading,/can’t verify/);
    const proven=ask('yes',current,{},receipt);
    assert.equal(proven.response.intent,'receipt');
    assert.match(proven.response.intro,new RegExp(expected[2]));
    assert.deepEqual(actions(proven).map(a=>[a.kind,a.id,a.pane]),[['go',...expected.slice(0,2)]]);
    assert.deepEqual(proven.suggestions,[]);
    assert.equal(canConfirm(current,id),false);
    const duplicate=ask('yes',current,{},clicked(id,'already-completed'));
    assert.equal(duplicate.response.heading,proven.response.heading);
    const failed=ask('yes',current,{},clicked(id,'rejected'));
    assert.match(failed.response.heading,/can’t verify/);
    assert.doesNotMatch(failed.response.intro,/saved on this device|Confirmed on this device/);
    assert.equal(ask('yes',current,{},{...receipt,source:'typed'}).response.intent,'clarify');
  }
});

test('group and team revocation defeat inherited focus, stale injected facts and receipts',()=>{
  const before=snapshot();
  const after=snapshot({group:false,team:false,role:'leader'});
  // Even an accidental stale record must not grant conversational privilege.
  after.group=before.group;
  after.serving=before.serving;
  after.leadership={groupCheckIns:999};
  for(const topic of ['group','serve']){
    const prior=ask(topic,before).context;
    const denied=ask('Where?',after,prior);
    assert.equal(denied.context.focus,'');
    assert.doesNotMatch(copy(denied),/North Commons|North Campus|Wednesday Group|Welcome Team|999/);
    assert.deepEqual(confirms(denied),[]);
    assert.equal(actions(denied)[0].pane,'');
    const reply=ask(topic,after,prior,clicked(topic==='group'?'rsvp':'serve'));
    assert.match(reply.response.heading,/access unavailable/);
    assert.doesNotMatch(copy(reply),/is saved/);
  }
  for(const id of ['rsvp','serve','join'])assert.equal(canConfirm(after,id),false);
  assert.match(ask('Are there any leader check-ins?',after).response.heading,/unavailable/);
});

test('only a current group leader receives the scope aggregate and route',()=>{
  const source=snapshot({role:'leader',checkIns:2,group:true,team:false});
  source.leadership.privateRoster=['Another member'];
  source.leadership.privatePrayer='A very private prayer';
  const result=ask('Any group check-ins?',source);
  assert.match(copy(result),/2 sample check-ins await review/);
  assert.doesNotMatch(copy(result),/Another member|very private prayer/);
  assert.deepEqual(actions(result).map(a=>[a.kind,a.id,a.pane]),[['go','group','leader']]);
  const noAccess=ask('Any check-ins?',{...source,viewer:{...source.viewer,role:'member'}},result.context);
  assert.deepEqual(actions(noAccess),[]);
  assert.doesNotMatch(copy(noAccess),/2 sample check-ins/);
  assert.match(ask('leader',snapshot({role:'leader',checkIns:0})).response.heading,/are clear/);
});

test('caught-up distinguishes optional Scripture, known open items and unavailable sources',()=>{
  const complete=snapshot({rsvp:'going',response:'confirmed',unread:0,stepDue:true});
  complete.board.taskCount=2;
  const done=ask('Am I all caught up?',complete);
  assert.equal(done.response.heading,'You’re caught up.');
  assert.deepEqual(actions(done),[]);
  assert.deepEqual(done.suggestions,[]);
  assert.match(done.response.intro,/You can stop here/);
  const open=ask('What needs my attention?',snapshot({rsvp:'going',response:'confirmed',unread:2}));
  assert.equal(open.response.heading,'Here’s what needs attention.');
  assert.match(copy(open),/2 unread sample messages/);
  const mixed=ask('check',snapshot({conversation:'unavailable',unread:0}));
  assert.equal(mixed.response.limited,true);
  assert.match(copy(mixed),/An RSVP is open|A serving response is open/);
  assert.match(copy(mixed),/Some details are unavailable/);
  const unavailable=ask('check',snapshot({rsvp:'going',response:'confirmed',conversation:'unavailable',unread:0}));
  assert.equal(unavailable.response.heading,'I can’t confirm you’re caught up.');
  const missing=ask('check',undefined);
  assert.equal(missing.response.heading,unavailable.response.heading);
});

test('missing or past occurrences never propose a new response or extend a schedule',()=>{
  const stale=snapshot({now:'2026-11-30T17:00:00.000Z'});
  assert.equal(canConfirm(stale,'rsvp'),false);
  assert.equal(canConfirm(stale,'serve'),false);
  const noDate=ask('group',stale);
  assert.match(copy(noDate),/upcoming sample date is unavailable/);
  assert.doesNotMatch(copy(noDate),/Nov 25|6:30 PM/);
  assert.deepEqual(confirms(noDate),[]);
  for(const text of ['What about next week?', 'Are we serving the following Sunday?', 'Does the group meet every week?']){
    const future=ask(text,snapshot(),noDate.context);
    assert.equal(future.response.intent,'future');
    assert.equal(future.response.limited,true);
    assert.doesNotMatch(copy(future),/Nov 25|Nov 29|6:30 PM|9:00 AM/);
    assert.deepEqual(actions(future),[]);
  }
  assert.equal(formatOccurrence('not a date'),null);
  assert.equal(formatOccurrence(gathering),'Wed, Nov 25, 2026 · 6:30 PM MT');
});

test('unread answers distinguish a known zero, unavailable cursor and explicit thread denial',()=>{
  const zero=ask('Any group updates?',snapshot({unread:0}));
  assert.match(copy(zero),/up to date/);
  const unknown=ask('Any updates?',snapshot({conversation:'unavailable',unread:3}));
  assert.match(copy(unknown),/can’t verify unread/);
  assert.doesNotMatch(copy(unknown),/3 unread|up to date/);
  const denied=ask('group-unread',snapshot({conversation:'not-member',unread:3}));
  assert.deepEqual(actions(denied),[]);
  assert.doesNotMatch(copy(denied),/3 unread|up to date/);
});

test('unsupported requests clear inherited scope and never produce an action',()=>{
  const fixture=snapshot();
  const first=ask('group',fixture);
  for(const query of ['Send a message to my group','Book me a shift','Join me to a group','What is the weather?','<img onerror=alert(1)>']){
    const unsupported=ask(query,fixture,first.context);
    assert.equal(unsupported.response.intent,'unsupported',query);
    assert.equal(unsupported.context.focus,'');
    assert.deepEqual(actions(unsupported),[]);
    assert.equal(ask('What time?',fixture,unsupported.context).response.intent,'clarify');
  }
  assert.equal(ask('z'.repeat(260),fixture).query.length,160);
});
