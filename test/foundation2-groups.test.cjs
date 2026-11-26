'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const Intelligence=require('../rally-one-intelligence.js');
const Groups=require('../foundation2/groups.js');
const Today=require('../foundation2/today-model.js');
const Context=require('../rally-one-member-context.js');
const Guard=require('../rallypoint-storage-guard.js'),AppState=require('../rally-one-app-state.js'),Store=require('../foundation2/state-store.js');
const now=new Date('2026-11-25T12:00:00Z');
const conversation={status:'ok',unreadCount:3,lastMessage:{author:'Jess W.',body:'Looking forward to Wednesday group!'}};
const ui={name:'Friend',campus:'north',memberships:{group:true,team:true}};
const fixture=()=>AppState.initialize(()=>null,true);
const evaluate=(state=fixture(),identity=ui,chat=conversation)=>{
 const source=Intelligence.derive({state,ui:identity,conversation:chat,now});
 return {source,group:Groups.project(source,chat),today:Today.project(source,now)};
};
const dom=html=>new JSDOM(html).window.document;
const store=()=>{
 const items=new Map();
 return {getItem:k=>items.has(k)?items.get(k):null,setItem:(k,v)=>items.set(k,String(v)),removeItem:k=>items.delete(k),items};
};

test('Gate 5 Groups uses exact member context and never offers group actions to nonmembers',()=>{
 const guest={...ui,memberships:{group:false,team:true}};
 const {group}=evaluate(fixture(),guest);
 assert.equal(group.member,false);assert.equal(group.rsvp,'');assert.equal(group.care,null);
 const page=dom(Groups.render(group));
 assert.equal(page.querySelectorAll('[data-group-action],[data-chat-open]').length,0);
 assert.match(page.querySelector('.route-stage-label').textContent,/NO GROUP MEMBERSHIP/);
});
test('Gate 5 RSVP, Maybe and Clear responses are the existing canonical transitions in Today and Groups',()=>{
 const mem=store(),g=Store.create({storage:mem,scenario:'connected',Guard,AppState});
 let {state,ui:identity}=g.read();
 const statuses=[['going','Going'],['maybe','Maybe'],['clear','RSVP open']];
 for(const [choice,label] of statuses){
  const command=Groups.commandFor('group-rsvp',choice);
  const transition=Context.transition({state,ui:identity,conversation,command,now});
  assert.equal(transition.ok,true);
  assert.equal(g.save(transition.state,identity).ok,true);
  state=g.read().state;
  const {group,today}=evaluate(state,identity);
  const page=dom(Groups.render(group));
  assert.equal(page.querySelector('.group-response-status strong').textContent,label);
  assert.equal(group.rsvp,choice==='clear'?'':choice);
  assert.equal(today.primary?.id==='group-rsvp'||today.secondary.some(x=>x.id==='group-rsvp'),choice==='clear');
 }
 assert.equal(Groups.commandFor('group-rsvp','forged'),null);
 assert.equal(mem.items.has(Guard.PRIMARY_KEY),false);
});
test('Gate 5 Groups conversation is the same unread source as Today and opens the same thread',()=>{
 const {group,today}=evaluate();
 assert.equal(group.unread,3);assert.equal(today.unread,3);
 const page=dom(Groups.render(group));
 assert.equal(page.querySelectorAll('[data-chat-open=group]').length,2);
 assert.match(page.querySelector('.group-conversation').textContent,/3 new group messages/);
 const unavailable=evaluate(fixture(),ui,{status:'unavailable'}).group;
 const un=dom(Groups.render(unavailable));
 assert.equal(un.querySelector('.group-conversation button').disabled,true);
 assert.match(un.querySelector('.group-conversation').textContent,/unavailable/);
});
test('Gate 5 care uses existing named prayer request and never creates automated outreach',()=>{
 const s=fixture(),{group}=evaluate(s);
 assert.equal(group.care.stage,'ready');
 const page=dom(Groups.render(group));
 assert.equal(page.querySelector('[data-group-action=group-care-prayed]')?.textContent,'I prayed');
 assert.match(page.querySelector('.group-care blockquote').textContent,/Marcus C./);
 const action=Groups.commandFor('group-care-prayed');
 const applied=Context.transition({state:s,ui,conversation,command:action,now});
 assert.equal(applied.ok,true);
 const after=evaluate(applied.state).group;
 assert.equal(after.care.stage,'prayed');
 assert.equal(dom(Groups.render(after)).querySelector('[data-group-action=group-care-prayed]'),null);
 assert.match(Groups.render(after),/no automated outreach/);
});
test('Gate 5 leader reviews are permission gated and survive the existing guard',()=>{
 const leader=Store.create({storage:store(),scenario:'leader',Guard,AppState});
 const loaded=leader.read(),initial=evaluate(loaded.state,loaded.ui).group;
 assert.equal(initial.leader,true);assert.deepEqual(initial.leaderIds,['marcus','taylor']);
 const command=Groups.commandFor('group-leader','marcus');
 const result=Context.transition({state:loaded.state,ui:loaded.ui,conversation,command,now});
 assert.equal(result.ok,true);assert.equal(leader.save(result.state,loaded.ui).ok,true);
 assert.deepEqual(evaluate(leader.read().state,loaded.ui).group.leaderIds,['taylor']);
 const nonleader=Context.transition({state:fixture(),ui,conversation,command,now});
 assert.equal(nonleader.ok,false);
});
test('Gate 5 Groups escape source text, use accessible explicit commands and do not mutate source',()=>{
 const s=fixture();s.prayers=[{name:'Marcus C.',time:'Today',text:'<img src=x onerror=alert(1)>'}];
 const {group}=evaluate(s);
 const page=dom(Groups.render(group));
 assert.equal(page.querySelector('img[onerror],[onload]'),null);
 assert.match(page.querySelector('.group-care blockquote p').textContent,/img src/);
 for(const button of page.querySelectorAll('[data-group-action]'))assert.equal(button.getAttribute('type'),'button');
 assert.ok(page.querySelector('.group-feature>img[src$="/community.webp"]'));
 assert.equal(s.prayers[0].text,'<img src=x onerror=alert(1)>');
});
