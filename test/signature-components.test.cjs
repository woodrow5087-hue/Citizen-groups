'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const Signature=require('../foundation2/signature-components.js');
const View=require('../foundation2/today-view.js');
const Session=require('../foundation2/member-session.js');
const Today=require('../foundation2/today-model.js');
const AppState=require('../rally-one-app-state.js');

const now=new Date('2026-11-26T12:00:00Z');
const conversation={status:'ok',unreadCount:3};
const ui={name:'Alex',campus:'north',memberships:{group:true,team:true}};
const doc=html=>new JSDOM(html).window.document;
const session=(state,identity=ui,chat=conversation)=>Session.derive({state,ui:identity,conversation:chat,now,owner:'connected'});
const model=(state,identity=ui,chat=conversation)=>Session.decision(session(state,identity,chat),now).view;

test('Signature actions retain native semantics and escape all supplied text and attributes',()=>{
 const payload='\" autofocus onfocus=alert(1) <img src=x onerror=alert(1)>';
 const page=doc(Signature.action({label:payload,href:'?screen=read',split:true,className:'existing-action',
  attrs:{'data-return-focus':payload,'aria-label':payload,title:payload}}));
 const link=page.querySelector('a');
 assert.equal(link.getAttribute('href'),'?screen=read');
 assert.equal(link.querySelector('.sig-action-label').textContent,payload);
 assert.equal(link.getAttribute('aria-label'),payload);
 assert.equal(link.dataset.returnFocus,payload);
 assert.equal(page.querySelector('[autofocus],[onfocus],[onerror],img,script'),null);
 assert.equal(link.querySelector('svg').getAttribute('aria-hidden'),'true');
 assert.equal(link.querySelector('svg').getAttribute('focusable'),'false');
 const button=doc(Signature.action({label:'Save',attrs:{'data-command':'rsvp'}})).querySelector('button');
 assert.equal(button.type,'button');assert.equal(button.dataset.command,'rsvp');
 assert.equal(doc(Signature.action({label:'Unavailable',attrs:{disabled:true}})).querySelector('button').disabled,true);
 assert.equal(doc(Signature.action({label:'Available',attrs:{disabled:false}})).querySelector('button').disabled,false);
});

test('Signature refuses executable/link attributes, external URLs and malformed presentation options',()=>{
 for(const href of ['https://example.com','//example.com','javascript:alert(1)','data:text/html,unsafe','../index.html','/other','?//example.com','?screen=read\nonclick=bad','?screen=read\\bad'])
  assert.throws(()=>Signature.action({label:'Unsafe',href}),TypeError,href);
 for(const attrs of [{onclick:'bad()'},{style:'color:red'},{href:'javascript:bad()'},{src:'unsafe'},{'aria-label':{}},{type:'image'}])
  assert.throws(()=>Signature.action({label:'Unsafe',attrs}),TypeError);
 for(const className of ['x\" onclick=bad','x;x','x\ny','<svg>'])
  assert.throws(()=>Signature.action({label:'Unsafe',className}),TypeError);
 assert.throws(()=>Signature.action({label:'Unsafe',tone:'neon'}),TypeError);
 assert.throws(()=>Signature.icon('unknown'),TypeError);
 for(const href of ['./','?screen=groups','#gallery-main'])assert.equal(doc(Signature.action({label:'Safe',href})).querySelector('a').getAttribute('href'),href);
});

test('Signature stack has one renderer-owned content area and only inaccessible decorative layers',()=>{
 const html=Signature.stack('<button type="button" data-command="serve">Confirm</button>',{className:'priority-stack'});
 const page=doc(html),layers=page.querySelectorAll('.sig-stack-layer');
 assert.equal(layers.length,2);
 for(const layer of layers){
  assert.equal(layer.getAttribute('aria-hidden'),'true');
  assert.equal(layer.querySelector('a,button,input,[tabindex]'),null);
 }
 assert.equal(page.querySelectorAll('.sig-stack-front [data-command=serve]').length,1);
 assert.throws(()=>Signature.stack({html:'unsafe'}),TypeError);
 assert.equal(doc(Signature.heading('<svg onload=bad()>','<script>bad()</script>')).querySelector('svg,script'),null);
});

test('Signature dates represent the supplied event identity and preserve unavailable dates',()=>{
 const event=new Date('2026-12-05T18:00:00Z'),before=event.toISOString();
 const rendered=doc(Signature.dateBadge(event)),time=rendered.querySelector('time');
 assert.equal(time.getAttribute('datetime'),before);
 assert.match(time.getAttribute('aria-label'),/2026/);
 assert.equal(time.querySelector('.sig-date-number').textContent,String(event.getDate()));
 assert.equal(event.toISOString(),before,'Rendering must not mutate an event date');
 for(const value of [null,undefined,new Date('invalid'),'2026-12-05']){
  const unknown=doc(Signature.dateBadge(value));
  assert.equal(unknown.querySelector('time'),null);
  assert.match(unknown.body.textContent,/Date unavailable/);
 }
});

test('Signature completion cannot contradict remaining responses or turn an unknown count into progress',()=>{
 assert.throws(()=>Signature.completion({complete:true,remaining:1}),TypeError);
 for(const remaining of [-1,1.5,NaN,Infinity,'2'])assert.throws(()=>Signature.completion({remaining}),TypeError);
 const unknown=doc(Signature.completion({title:'Review current state'}));
 assert.equal(unknown.querySelector('.sig-completion--complete'),null);
 assert.equal(unknown.querySelector('.sig-completion-count').textContent,'—');
 const done=doc(Signature.completion({complete:true,remaining:0,title:'All Set.',detail:'<img onerror=bad()>'}));
 assert.ok(done.querySelector('.sig-completion--complete'));
 assert.equal(done.querySelector('[onerror],img'),null);
 assert.equal(done.querySelector('.sig-completion-mark').getAttribute('aria-hidden'),'true');
});

test('Signature timeline escapes supplied events, preserves source order and dates, and has no rendering side effects',()=>{
 const later=new Date('2026-12-06T16:00:00Z'),earlier=new Date('2026-12-05T18:00:00Z'),unknown=new Date('invalid');
 const payload='<svg onload=bad()>\" <script>bad()</script>';
 const items=Object.freeze([
  Object.freeze({date:later,title:payload,detail:payload,selected:true,attrs:Object.freeze({'data-sig-action':'event-detail','data-sig-value':payload,'aria-label':payload})}),
  Object.freeze({date:earlier,title:'Earlier supplied second',detail:'Source order is deliberate.'}),
  Object.freeze({date:unknown,title:'Unknown date',attrs:Object.freeze({'data-sig-action':'event-detail'})})
 ]);
 const before=JSON.stringify(items),laterISO=later.toISOString(),earlierISO=earlier.toISOString();
 const html=Signature.timeline({items,label:payload}),page=doc(html),list=page.querySelector('ol.sig-timeline');
 assert.equal(list.getAttribute('aria-label'),payload);
 assert.deepEqual([...list.querySelectorAll('.sig-timeline-copy>strong')].map(n=>n.textContent),[payload,'Earlier supplied second','Unknown date']);
 assert.deepEqual([...list.querySelectorAll('time')].map(n=>n.getAttribute('datetime')),[laterISO,earlierISO]);
 assert.equal(list.querySelector('.sig-timeline-detail').textContent,payload);
 assert.match(list.querySelector('.sig-timeline-time--unknown').textContent,/Date unavailable/);
 assert.equal(list.querySelectorAll('.sig-timeline-item.is-selected').length,1);
 assert.equal(list.querySelector('button.sig-timeline-control').type,'button');
 assert.equal(list.querySelector('button.sig-timeline-control').getAttribute('data-sig-value'),payload);
 assert.equal(list.querySelectorAll('button.sig-timeline-control').length,2,'Only source-provided action attributes create controls');
 assert.equal(list.querySelector('[onload],script,svg'),null);
 assert.equal(list.querySelectorAll('[aria-current],[aria-pressed]').length,0,'A selected date does not imply attendance or completion');
 assert.equal(JSON.stringify(items),before);
 assert.equal(later.toISOString(),laterISO);assert.equal(earlier.toISOString(),earlierISO);
 assert.equal(Signature.timeline({items,label:payload}),html,'Rendering depends only on its supplied projection');
 assert.throws(()=>Signature.timeline({items:[{title:'Unsafe',attrs:{onclick:'bad()'}}]}),TypeError);
});

test('Signature Today remains a read-only projection of canonical commitments, dates and actions',()=>{
 const state=AppState.initialize(()=>null,true);state.role='leader';
 const vm=model(state),before=JSON.stringify({state,vm});
 const page=doc(View.render(vm));
 assert.equal(JSON.stringify({state,vm}),before);
 assert.equal(page.querySelector('.priority h2').textContent,vm.primary.title);
 assert.equal(page.querySelectorAll('.responsibility').length,vm.secondary.length);
 assert.equal(page.querySelectorAll('.schedule a.event[data-route]').length,vm.schedule.length);
 assert.equal(page.querySelectorAll('[data-command=leader]').length,vm.leaderIds.length,'Leader follow-ups cannot be lost behind a two-card visual simplification');
 for(const item of [vm.primary,...vm.secondary].filter(Boolean))assert.ok(page.querySelector('[data-command="'+item.command+'"]'));
 for(const item of vm.schedule){
  const control=page.querySelector('[data-return-focus="agenda-'+item.id+'"]');
  assert.equal(control.getAttribute('data-route'),item.id==='group'?'groups':'team');
  assert.equal(control.querySelector('time').getAttribute('datetime'),item.date.toISOString());
 }
 assert.equal(page.querySelector('.sig-completion--complete'),null);
});

test('Signature All Set follows real saved responses, leaving optional unread and Scripture intact',()=>{
 let state=AppState.initialize(()=>null,true);state.role='member';
 for(const id of ['serve','rsvp']){
  const command=Today.commandFor(id),current=session(state),kind=id==='serve'?'team':'group';
  const result=Session.transition({state,ui,conversation,now,owner:'connected',command:{...command,eventId:current.events[kind]}});
  assert.equal(result.ok,true);state=result.state;
 }
 const vm=model(state),page=doc(View.render(vm));
 assert.equal(vm.calm,true);assert.equal(vm.unread,3);assert.equal(vm.reading,true);
 assert.ok(page.querySelector('.sig-completion--complete'));
 assert.equal(page.querySelector('.greeting h1').textContent,'You’re all set.');
 assert.equal(page.querySelectorAll('[data-command]').length,0);
 assert.match(page.querySelector('a.utility[href="?screen=connect"]').textContent,/3 new group messages/);
 assert.doesNotMatch(page.body.textContent,/Reading Set|\b\d+%|\bOnline\b/);
});

test('Signature never invents completion for visitor, unavailable, deferred or malformed event state',()=>{
 const base=AppState.initialize(()=>null,true);base.role='member';
 const visitor=model(base,{...ui,memberships:{group:false,team:false}});
 const unavailable=model(base,ui,{status:'unavailable'});
 const deferred={...base,companionChoices:{snoozedUntil:{'group-rsvp':'2026-12-03T12:00:00.000Z','serve-response':'2026-12-03T12:00:00.000Z'}}};
 const malformed={...base,eventResponses:{version:1,records:{bad:{kind:'team'}}}};
 for(const vm of [visitor,unavailable,model(deferred),model(malformed)]){
  assert.equal(vm.calm,false);
  assert.equal(doc(View.render(vm)).querySelector('.sig-completion--complete'),null);
 }
 assert.equal(doc(View.render(visitor)).querySelector('[data-command]'),null);
 assert.match(doc(View.render(unavailable)).querySelector('.utility[role=status]').textContent,/unavailable/i);
});

test('Signature Today escapes member, commitment, receipt and optional source text',()=>{
 const state=AppState.initialize(()=>null,true),vm=model(state),payload='<img src=x onerror=alert(1)>';
 const page=doc(View.render({...vm,name:payload,campus:payload,involvement:payload,greeting:payload,
  primary:{...vm.primary,title:payload,detail:payload,label:payload},secondary:vm.secondary.map(item=>({...item,label:payload,title:payload})),
  schedule:vm.schedule.map(item=>({...item,status:payload})),passage:payload},payload));
 assert.equal(page.querySelector('[onerror],script'),null);
 assert.equal(page.querySelector('.member-context button').textContent,payload);
 assert.equal(page.querySelector('.receipt').textContent,payload);
 assert.equal(page.querySelector('.sig-today-cover img').getAttribute('src'),'../assets/campuses/central.jpg');
});

test('Signature gallery has no application engine/store imports and primitives cannot perform IO',()=>{
 const fs=require('node:fs'),path=require('node:path');
 const read=name=>fs.readFileSync(path.join(__dirname,'../foundation2',name),'utf8');
 const gallery=doc(read('signature-gallery.html'));
 assert.deepEqual([...gallery.querySelectorAll('script[src]')].map(s=>s.getAttribute('src')),['signature-components.js','signature-gallery.js']);
 for(const source of [read('signature-components.js'),read('signature-gallery.js')]){
  for(const forbidden of [/\blocalStorage\b/,/\bsessionStorage\b/,/\bXMLHttpRequest\b/,/\bfetch\s*\(/,/\bFoundationStateStore\b/,/\bFoundationMemberSession\b/,/\bRallyIntelligence\b/])
   assert.doesNotMatch(source,forbidden,'A visual component gallery must not become another application or state owner');
 }
});
