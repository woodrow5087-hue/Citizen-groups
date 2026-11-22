const {test}=require('node:test');
const assert=require('node:assert/strict');
const D=require('../rallypoint-companion-decision.js');
const now=new Date('2026-11-23T12:00:00.000Z');
const ui={memberships:{group:true,team:true}};
const clean={
  role:'member',prayers:[],companionCare:{},companionChoices:{snoozedUntil:{}},
  teamStatus:'confirmed',rsvp:'going',read:true,prayed:true,groupMessages:[]
};
const chat={status:'ok',unreadCount:0};
const select=(s=clean,u=ui,c=chat)=>D.choose({state:s,ui:u,conversation:c,now});
test('Companion F-08 prioritizes named consentful fixture action, then real serving state',()=>{
  const s={...clean,teamStatus:'pending',prayers:[{name:'Marcus C.',text:'Praying for clarity.'}]};
  const before=structuredClone(s);
  assert.equal(select(s).id,'care-marcus');
  assert.match(select(s).description,/fictional prayer request/);
  assert.deepEqual(s,before,'pure selector cannot write source records');
  assert.equal(select({...s,companionCare:{marcus:{completedAt:'2026-11-20T12:00:00Z'}}}).id,'serve-response');
  assert.equal(select({...s,companionCare:{marcus:{snoozedUntil:'2026-11-25T00:00:00Z'}}}).id,'serve-response');
  assert.equal(select({...s,companionCare:{marcus:{snoozedUntil:'2026-11-20T00:00:00Z'}}}).id,'care-marcus');
});
test('Companion F-08 reads F-02 cursor, never legacy group messages or fake read receipts',()=>{
  const s={...clean,groupMessages:[{name:'Jess',time:'Yesterday',text:'A legacy message'}]};
  assert.equal(select(s).id,'group-people');
  const incoming={status:'ok',unreadCount:2,lastMessage:{author:'You',body:'Own latest sent'}};
  const result=select(s,ui,incoming);
  assert.equal(result.id,'group-unread');
  assert.match(result.why,/2 unread sent messages from other members/);
  assert.equal(result.dest,'group');
  assert.equal(result.pane,'chat');
  assert.equal(select(s,ui,{status:'ok',unreadCount:0}).id,'group-people');
});
test('Corrupt/unavailable conversation does not hallucinate all-read and cannot leak when revoked',()=>{
  assert.equal(select(clean,ui,{status:'unavailable',unreadCount:99}).id,'group-unavailable');
  assert.match(select(clean,ui,{status:'unavailable'}).why,/no read status is assumed/);
  const guest={memberships:{group:false,team:false}};
  const s={...clean,prayers:[{name:'Marcus C.',text:'Private group content'}]};
  const d=select(s,guest,{status:'ok',unreadCount:10});
  assert.notEqual(d.id,'care-marcus');
  assert.notEqual(d.id,'group-unread');
  assert.notEqual(d.id,'group-unavailable');
  assert.equal(d.dest,'group');
  assert.doesNotMatch(JSON.stringify(d),/Marcus|Private group content/);
});
test('Serving, due Scripture intention, RSVP, daily reading all refer to their own saved source',()=>{
  assert.equal(select({...clean,teamStatus:'pending'}).id,'serve-response');
  const rhythm={text:'Encourage someone.',followUpAt:'2026-11-22T00:00:00Z',completedAt:null};
  assert.equal(select({...clean,rhythm}).id,'scripture-step');
  assert.equal(select({...clean,rhythm:{...rhythm,completedAt:'2026-11-22T01:00:00Z'}}).id,'group-people');
  assert.equal(select({...clean,rsvp:''}).id,'group-rsvp');
  assert.equal(select({...clean,read:false}).id,'scripture-read');
  assert.equal(select({...clean,prayed:false}).id,'prayer');
});
test('Deferred normal prompts are excluded for 24 hours without altering their source state',()=>{
  const s={...clean,teamStatus:'pending',companionChoices:{snoozedUntil:{'serve-response':'2026-11-24T12:01:00Z'}}};
  assert.equal(select(s).id,'group-people');
  assert.equal(select({...s,companionChoices:{snoozedUntil:{'serve-response':'2026-11-21T00:00:00Z'}}}).id,'serve-response');
  assert.equal(D.hasDeferred(s,'serve-response',now),true);
  assert.equal(D.hasDeferred({...s,companionChoices:{}},'serve-response',now),false);
  assert.equal(select({...clean,read:false,rsvp:'',companionChoices:{snoozedUntil:{
    'group-rsvp':'2026-11-24T14:00:00Z','scripture-read':'2026-11-24T14:00:00Z'
  }}}).id,'group-people');
});
test('With no relevant action, supportive fallback never misrepresents another user',()=>{
  const s={...clean,read:true,prayed:true};
  assert.equal(select(s,{memberships:{group:false,team:false}},chat).id,'find-community');
  assert.equal(select({...s,companionChoices:{snoozedUntil:{'find-community':'2026-11-25T12:00:00Z'}}},
    {memberships:{group:false,team:false}},chat).id,'explore-reading');
  assert.equal(select(s).source,'fictional local data');
});
