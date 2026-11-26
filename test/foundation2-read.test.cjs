'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path');
const Memory=require('../rallypoint-memorize.js');
const Actions=require('../rally-one-memory-actions.js');
const Read=require('../foundation2/read.js');
const Intelligence=require('../rally-one-intelligence.js');
const Context=require('../rally-one-member-context.js');
const Guard=require('../rallypoint-storage-guard.js'),AppState=require('../rally-one-app-state.js'),Store=require('../foundation2/state-store.js');
const now=new Date('2026-11-25T12:00:00Z'),conversation={status:'ok',unreadCount:3};
const ui={name:'Friend',campus:'north',memberships:{group:true,team:true}};
const initial=()=>AppState.initialize(()=>null,true);
const model=(state=initial(),identity=ui,when=now)=>Read.project(Intelligence.derive({
 state,ui:identity,conversation,now:when
}),state,Memory,when);
const doc=html=>new JSDOM(html).window.document;
const storage=()=>{
 const items=new Map();
 return {items,getItem:k=>items.has(k)?items.get(k):null,setItem:(k,v)=>items.set(k,String(v)),removeItem:k=>items.delete(k)};
};
test('Gate 6 Read displays exact canonical public-domain BSB library, no copied passage text',()=>{
 const state=initial(),m=model(state),page=doc(Read.render(m));
 assert.equal(m.passage.reference,Memory.library.sermon.reference);
 assert.equal(m.passage.text,Memory.library.sermon.text);
 assert.match(page.querySelector('.read-scripture blockquote').textContent,/love one another/);
 assert.equal(page.querySelector('button[data-read-action=read]').getAttribute('aria-pressed'),'false');
 assert.ok(page.querySelector('a[href="../verse-circuit-playground.html"]'));
 assert.ok(page.querySelector('a[href="../blank-battle.html"]'));
 assert.ok(page.querySelector('a[data-read-view=classic]'));
 assert.doesNotMatch(Read.render(m),/score for spiritual growth|assigned reading calendar due/);
});
test('Read and optional prayer use existing guarded local transitions and survive reload',()=>{
 const mem=storage(),store=Store.create({storage:mem,scenario:'connected',Guard,AppState});
 let {state,ui:memberUI}=store.read();
 for(const command of [Read.commandFor('read','true'),Read.commandFor('pray','true')]){
  const result=Context.transition({state,ui:memberUI,conversation,command,now});
  assert.equal(result.ok,true);assert.equal(store.save(result.state,memberUI).ok,true);
  state=Store.create({storage:mem,scenario:'connected',Guard,AppState}).read().state;
 }
 assert.equal(model(state).read,true);assert.equal(model(state).prayed,true);
 assert.equal(doc(Read.render(model(state))).querySelector('button[data-read-action=read]').getAttribute('aria-pressed'),'true');
 assert.equal(Context.transition({state,ui:memberUI,conversation,command:Read.commandFor('read','true'),now}).ok,false);
 assert.equal(mem.items.has(Guard.PRIMARY_KEY),false);
 assert.equal(mem.items.has(Guard.TODAY_KEY),false);
});
test('Reflection is optional, bounded, saved and may be completed/deferred only when due',()=>{
 const state=initial(),text='Send an encouraging note to a friend.';
 const command={type:'reflection-save',text,passage:Memory.library.sermon.reference};
 const saved=Context.transition({state,ui,conversation,command,now});
 assert.equal(saved.ok,true);
 const next=saved.state;
 assert.equal(next.rhythm.text,text);
 assert.equal(next.rhythm.passage,Memory.library.sermon.reference);
 assert.equal(model(next).due,false);
 assert.equal(Context.transition({state:next,ui,conversation,command:{type:'reflection-complete'},now}).ok,false);
 const tomorrow=new Date('2026-11-27T12:00:00Z');
 assert.equal(model(next,ui,tomorrow).due,true);
 const postponed=Context.transition({state:next,ui,conversation,command:{type:'reflection-defer'},now:tomorrow});
 assert.equal(postponed.ok,true);assert.equal(model(postponed.state,ui,tomorrow).due,false);
 const complete=Context.transition({state:next,ui,conversation,command:{type:'reflection-complete'},now:tomorrow});
 assert.equal(complete.ok,true);assert.equal(model(complete.state,ui,tomorrow).completed,true);
 assert.equal(Context.transition({state:complete.state,ui,conversation,command:{type:'reflection-complete'},now:tomorrow}).ok,false);
 assert.equal(Context.transition({state,ui,conversation,command:{...command,text:'x'.repeat(161)},now}).ok,false);
 const cleared=Context.transition({state:next,ui,conversation,command:{type:'reflection-clear'},now});
 assert.equal(cleared.ok,true);assert.deepEqual(cleared.state.rhythm,{});
});
test('Leader changes of reading pathway and questions require explicit verified demo role',()=>{
 const guest=initial();assert.equal(Context.transition({state:guest,ui,conversation,
  command:{type:'reading-plan-select',value:'study'},now}).ok,false);
 const leader={...guest,role:'leader'};
 const changed=Context.transition({state:leader,ui,conversation,command:{type:'reading-plan-select',value:'study'},now});
 assert.equal(changed.ok,true);assert.equal(model(changed.state).passage.reference,Memory.library.study.reference);
 const question=Context.transition({state:changed.state,ui,conversation,command:{
  type:'reading-question-save',text:'What does doing the word look like?'},now});
 assert.equal(question.ok,true);
 assert.match(Read.render(model(question.state)),/doing the word/);
 assert.equal(Context.transition({state:leader,ui,conversation,command:{type:'reading-plan-select',value:'forged'},now}).ok,false);
 assert.equal(Context.transition({state:leader,ui,conversation,command:{type:'reading-question-save',text:'x'.repeat(401)},now}).ok,false);
 const read=doc(Read.render(model(guest)));assert.equal(read.querySelector('.read-leader'),null);
 const leaderDOM=doc(Read.render(model(leader)));assert.ok(leaderDOM.querySelector('.read-leader'));
});
test('Classic VersePlay is rendered and operated by the original engine and action handlers',()=>{
 const code=fs.readFileSync(path.join(__dirname,'../rallypoint-verseplay-ui.js'),'utf8');
 const fake={RallyMemory:Memory};
 new Function('window',code)(fake);
 const state=initial();
 const visible={...state,memoryGames:{...state.memoryGames}};
 const html=fake.RallyVersePlay.render(visible,x=>String(x),()=>'<svg aria-hidden="true"></svg>');
 assert.match(html,/Pass & Play|PASS & PLAY/);
 const page=doc(Read.render(model(state),{mode:'classic',gameHTML:html}));
 assert.ok(page.querySelector('[data-action=memory-mode]'));
 assert.ok(page.querySelector('[data-action=memory-pick]'));
 assert.equal(page.querySelector('a[data-read-view=home]').getAttribute('href'),'?screen=read');
 const next={...state,memoryGames:{...state.memoryGames}};
 Actions.run('memory-pick','a0',{s:next,M:Memory,render:()=>{},notify:()=>{}});
 assert.equal(next.memoryGames['sermon:solo'].slots.includes('a0'),true);
 Actions.run('memory-hint',null,{s:next,M:Memory,render:()=>{},notify:()=>{}});
 assert.ok(next.memoryGames['sermon:solo'].hints>=1);
 Actions.run('memory-mode','pass',{s:next,M:Memory,render:()=>{},notify:()=>{}});
 assert.equal(next.memoryMode,'pass');
});
test('Original full games remain referenced unchanged and do not falsely synchronize progress with Foundation',()=>{
 const root=path.join(__dirname,'..');
 const blank=fs.readFileSync(path.join(root,'blank-battle.html'),'utf8');
 const circuit=fs.readFileSync(path.join(root,'verse-circuit-playground.html'),'utf8');
 assert.match(blank,/rallypoint-memorize\.js/);
 assert.match(blank,/blank-battle\.js/);
 assert.match(circuit,/verseplay\/games\/verse-circuit\/controller\.js/);
 assert.match(Read.render(model()),/Standalone games retain their own existing independent browser progress/);
});
test('Scripture, reflection and discussion text escape HTML and invalid commands cannot write',()=>{
 const vm=model(initial());
 const dangerous={...vm,question:'<svg onload=alert(1)>',passage:{...vm.passage,text:'<img src=x onerror=alert(1)>'},reflection:'<script>alert(1)</script>'};
 const page=doc(Read.render(dangerous));
 assert.equal(page.querySelector('[onerror],[onload]'),null);
 assert.equal(page.querySelector('script'),null);
 assert.match(page.querySelector('.read-scripture blockquote').textContent,/img src/);
 assert.equal(Read.commandFor('forged','true'),null);
});
