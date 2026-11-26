'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const Intelligence=require('../rally-one-intelligence.js');
const Team=require('../foundation2/team.js');
const Today=require('../foundation2/today-model.js');
const Context=require('../rally-one-member-context.js');
const Actions=require('../foundation2/member-actions.js');
const Guard=require('../rallypoint-storage-guard.js'),AppState=require('../rally-one-app-state.js'),Store=require('../foundation2/state-store.js');
const now=new Date('2026-11-25T12:00:00Z');
const conversation={status:'ok',unreadCount:3};
const ui={name:'Friend',campus:'north',memberships:{group:true,team:true}};
const fixture=()=>AppState.initialize(()=>null,true);
const examine=(state=fixture(),who=ui)=>{
 const source=Intelligence.derive({state,ui:who,conversation,now});
 return {source,team:Team.project(source),today:Today.project(source,now)};
};
const dom=s=>new JSDOM(s).window.document;
const memory=()=>{
 const items=new Map();
 return {items,getItem:k=>items.has(k)?items.get(k):null,setItem:(k,v)=>items.set(k,String(v)),removeItem:k=>items.delete(k)};
};
test('Gate 5 Team requires membership and never invents serving eligibility',()=>{
 const guest={...ui,memberships:{group:true,team:false}},v=examine(fixture(),guest).team;
 assert.equal(v.member,false);assert.equal(v.response,'not-joined');assert.equal(v.shift,null);
 const doc=dom(Team.render(v));
 assert.equal(doc.querySelectorAll('[data-team-action]').length,0);
 assert.match(doc.querySelector('.route-stage-label').textContent,/NO SERVING MEMBERSHIP/);
 assert.match(doc.querySelector('.route-preview-card').textContent,/Browsing never creates/);
});
test('Gate 5 Team confirms and declines through canonical transitions, shares status with Today and survives reload',()=>{
 const db=memory(),store=Store.create({storage:db,scenario:'connected',Guard,AppState});
 const {ui:memberUI}=store.read();let s=store.read().state;
 for(const [value,label] of [['confirmed','Confirmed'],['declined','Unable to serve'],['confirmed','Confirmed']]){
  const change=Actions.transition({state:s,ui:memberUI,conversation,command:Team.commandFor('serving-response',value),now});
  assert.equal(change.ok,true);
  assert.equal(store.save(change.state,memberUI).ok,true);
  s=Store.create({storage:db,scenario:'connected',Guard,AppState}).read().state;
  const {team,today}=examine(s,memberUI),doc=dom(Team.render(team));
  assert.equal(doc.querySelector('.team-availability strong').textContent,label);
  assert.equal(team.response,value);
  assert.equal(today.secondary.some(x=>x.id==='serve-response')||today.primary?.id==='serve-response',false);
 }
 assert.equal(db.items.has(Guard.PRIMARY_KEY),false);
 assert.equal(db.items.has(Guard.TODAY_KEY),false);
});
test('Gate 5 Team availability actions remain 44px-target commands with truthful pressed state',()=>{
 const pending=examine().team,doc=dom(Team.render(pending));
 assert.equal(doc.querySelectorAll('[data-team-action=serving-response]').length,2);
 assert.equal(doc.querySelector('[data-value=confirmed]').getAttribute('aria-pressed'),'false');
 assert.equal(doc.querySelector('[data-value=declined]').getAttribute('aria-pressed'),'false');
 assert.equal(Team.commandFor('serving-response','pending'),null);
 const confirmed=examine({...fixture(),teamStatus:'confirmed'}).team;
 assert.equal(dom(Team.render(confirmed)).querySelector('[data-value=confirmed]').getAttribute('aria-pressed'),'true');
});
test('Gate 5C coverage actions remain fictional and attendance is never inferred',()=>{
 const s=fixture();s.teamStatus='declined';s.coverage=true;
 const v=examine(s).team,doc=dom(Team.render(v));
 assert.equal(v.coverage,true);
 assert.match(doc.querySelector('.team-coverage').textContent,/fictional local coverage request saved/);
 assert.match(doc.querySelector('.team-assignment').textContent,/not recorded attendance/);
 const action=doc.querySelector('[data-team-action="serving-coverage"]');
 assert.equal(action?.getAttribute('data-value'),'withdraw');
 assert.match(doc.querySelector('.team-coverage-note').textContent,/No coverage message is delivered/);
 assert.equal(Team.commandFor('serving-coverage','forged'),null);
});
test('Gate 5 Team fail-closed on unknown response and source text escaping',()=>{
 const s=fixture();s.teamStatus='unsupported';
 const v=examine(s).team,doc=dom(Team.render(v));
 assert.equal(v.response,'unknown');
 assert.equal(doc.querySelectorAll('[data-team-action]').length,0);
 assert.match(doc.querySelector('.team-blocked').textContent,/cannot be changed safely/);
 const mutated={...v,location:'<img src=x onerror=alert(1)>'};
 const escaped=dom(Team.render(mutated));
 assert.equal(escaped.querySelector('[onerror]'),null);
 assert.match(escaped.querySelector('.team-assignment').textContent,/img src/);
});
test('Gate 5 Team leader context is explicit and never inferred from schedule or response',()=>{
 const leader=Store.create({storage:memory(),scenario:'leader',Guard,AppState}).read();
 const actual=examine(leader.state,leader.ui).team;
 assert.equal(actual.authorizedLeader,true);
 assert.match(Team.render(actual),/no attendance inferred/);
 const member=examine(fixture()).team;
 assert.equal(member.authorizedLeader,false);
 assert.equal(dom(Team.render(member)).querySelector('.team-leader-notice'),null);
});

test('Gate 5C coverage request/withdraw goes through canonical authorization and survives guard reload',()=>{
 const db=memory(),store=Store.create({storage:db,scenario:'connected',Guard,AppState});
 let {state,ui:memberUI}=store.read();
 const attempt=value=>Actions.transition({state,ui:memberUI,conversation,
  command:Team.commandFor('serving-coverage',value),now});
 assert.equal(attempt('request').ok,false,'cannot request before declining');
 let change=Actions.transition({state,ui:memberUI,conversation,
  command:Team.commandFor('serving-response','declined'),now});
 assert.equal(change.ok,true);assert.equal(store.save(change.state,memberUI).ok,true);state=store.read().state;
 change=attempt('request');
 assert.equal(change.ok,true);assert.equal(change.state.coverage,true);
 assert.equal(change.state.teamMessages.filter(m=>m.coverage).length,1);
 assert.equal(store.save(change.state,memberUI).ok,true);state=Store.create({storage:db,scenario:'connected',Guard,AppState}).read().state;
 assert.equal(examine(state,memberUI).team.coverage,true);
 assert.equal(attempt('request').ok,false,'duplicate request denied');
 change=attempt('withdraw');
 assert.equal(change.ok,true);assert.equal(change.state.coverage,false);
 assert.equal(change.state.teamMessages.some(m=>m.coverage),false);
 assert.equal(store.save(change.state,memberUI).ok,true);state=store.read().state;
 assert.equal(examine(state,memberUI).team.coverage,false);
 assert.equal(attempt('withdraw').ok,false,'duplicate withdrawal denied');
 assert.equal(db.items.has(Guard.PRIMARY_KEY),false);
});
test('Gate 5C cannot make coverage requests without team membership or declined shift',()=>{
 const state=fixture();
 for(const role of [{...ui,memberships:{group:true,team:false}},ui]){
  const result=Actions.transition({state,ui:role,conversation,
   command:{type:'serving-coverage',value:'request'},now});
  assert.equal(result.ok,false);
 }
 const declined={...state,teamStatus:'declined'};
 const noTeam=Actions.transition({state:declined,ui:{...ui,memberships:{group:true,team:false}},
  conversation,command:{type:'serving-coverage',value:'request'},now});
 assert.equal(noTeam.ok,false);
 const active={...declined,coverage:true,teamMessages:[{name:'You',text:'demo',time:'Just now',coverage:true}]};
 const confirmed=Actions.transition({state:active,ui,conversation,
  command:{type:'serving-response',value:'confirmed'},now});
 assert.equal(confirmed.ok,true);assert.equal(confirmed.state.coverage,false);
 assert.equal(confirmed.state.teamMessages.some(m=>m.coverage),false);
});
