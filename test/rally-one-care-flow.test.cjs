'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const Care=require('../rally-one-care-flow.js');
const base=()=>({prayers:[{name:'Marcus C.',time:'Yesterday',text:'Praying for wisdom with an upcoming decision.'}],
 companionCare:{marcus:{}},groupMessages:[],rsvp:'',directMessages:{}});
const asDoc=html=>new JSDOM(html).window.document;

test('care derives only from an authorized named sample prayer request',()=>{
 assert.equal(Care.derive({state:base(),member:false}),null);
 assert.equal(Care.derive({state:{prayers:[],companionCare:{}},member:true}),null);
 assert.equal(Care.derive({state:{prayers:[{name:'Other',text:'Help'}]},member:true}),null);
 const m=Care.derive({state:base(),member:true,now:new Date('2026-11-23T12:00:00Z')});
 assert.equal(m.stage,'ready');assert.equal(m.source,'Named sample prayer request in the Wednesday Group');
 assert.equal(m.person,'Marcus C.');assert.equal(m.completed,false);
 assert.equal(m.prayed,false);assert.equal(m.paused,false);
 assert.equal(Object.isFrozen(m),true);
});

test('prayed, paused, resumed and completed states are transparent and deterministic',()=>{
 const now=new Date('2026-11-23T12:00:00Z'),s=base();
 s.companionCare.marcus.prayedAt='2026-11-22T20:00:00Z';
 assert.equal(Care.derive({state:s,member:true,now}).stage,'prayed');
 s.companionCare.marcus.snoozedUntil='2026-11-24T12:00:00Z';
 let m=Care.derive({state:s,member:true,now});
 assert.equal(m.stage,'paused');assert.equal(m.prayed,true);
 let doc=asDoc(Care.render(m,{placement:'today'}));
 assert.ok(doc.querySelector('[data-action="care-resume"]'));
 assert.equal(doc.querySelector('[data-action="companion-encourage"]'),null);
 delete s.companionCare.marcus.snoozedUntil;
 assert.equal(Care.derive({state:s,member:true,now}).stage,'prayed');
 s.companionCare.marcus.completedAt='2026-11-23T10:00:00Z';
 m=Care.derive({state:s,member:true,now});
 assert.equal(m.stage,'followed-up');
 doc=asDoc(Care.render(m,{placement:'group'}));
 assert.match(doc.body.textContent,/No real message was delivered/);
 assert.equal(doc.querySelector('[data-action="companion-encourage"]'),null);
 assert.ok(doc.querySelector('[data-action="care-open-groups"]'));
});

test('Today and Groups show the same progression and ONLY explicit action buttons',()=>{
 const s=base(),m=Care.derive({state:s,member:true});
 const a=asDoc(Care.render(m,{placement:'today'}));
 const b=asDoc(Care.render(m,{placement:'group'}));
 assert.equal(a.querySelector('.ro-care').dataset.careStage,b.querySelector('.ro-care').dataset.careStage);
 assert.equal(a.querySelectorAll('.ro-care-steps li').length,3);
 assert.equal(b.querySelectorAll('.ro-care-steps li').length,3);
 assert.ok(a.querySelector('[data-action="care-open-prayer"]'));
 assert.ok(a.querySelector('[data-action="care-mark-prayed"]'));
 assert.ok(a.querySelector('[data-action="companion-snooze"]'));
 assert.equal(b.querySelector('.ro-care-source'),null,'Groups compact card reduces duplication');
 assert.equal(Care.render(null,{placement:'today'}),'');
 assert.equal(Care.render(m,{placement:'unknown'}),'');
});

test('all sample request text is escaped and never generates synthetic outreach',()=>{
 const s=base();
 s.prayers[0].text='<img src=x onerror=alert(1)> & care';
 const m=Care.derive({state:s,member:true});
 const html=Care.render(m,{placement:'today'});
 assert.ok(html.includes('&lt;img'));assert.ok(html.includes('&amp; care'));
 assert.ok(!html.includes('<img src=x'));
 assert.doesNotMatch(read('rally-one-care-flow.js'),/fetch\s*\(|WebSocket|localStorage|sendMessage|navigator\.share/);
 assert.doesNotMatch(html,/online now|read receipt|sent to Marcus/i);
});

test('companion draft starter explicitly opts in and preserves prior text',()=>{
 const m=Care.derive({state:base(),member:true});
 const doc=asDoc(Care.renderDraftHint(m));
 assert.ok(doc.querySelector('button[data-action="companion-starter"]'));
 assert.match(doc.body.textContent,/Nothing is sent/);
 const source=read('rallypoint.js');
 assert.match(source,/if\(field\.value\.trim\(\)\)/);
 assert.match(source,/Existing draft preserved/);
 assert.match(source,/if\(a==='care-mark-prayed'|a==='care-mark-prayed'/);
 assert.match(source,/if\(a==='companion-encourage'\)/);
 assert.match(source,/s\.directMessages\[s\.directPerson\]\.push\(item\)/);
 assert.match(source,/s\.companionCare\.marcus=\{\.\.\.\(s\.companionCare\.marcus\|\|\{\}\),completedAt:/);
});
test('integration is scoped to Rally One existing surfaces and no new storage owner',()=>{
 const html=read('index.html'),build=read('scripts/build.cjs'),js=read('rallypoint.js');
 for(const f of ['rally-one-care-flow.js','rally-one-care-flow.css']){
  assert.ok(html.includes(f));assert.ok(build.includes("'"+f+"'"));
 }
 assert.match(js,/if\(rallyOne&&window\.RallyCareFlow\)/);
 assert.match(js,/\.f09b-glance/);
 assert.match(js,/\.gv2-care/);
 assert.match(js,/\.gv2-detail-tabs/);
 const css=read('rally-one-care-flow.css');
 assert.match(css,/\.rally-one \.ro-care/);
 assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion:reduce/);
 assert.match(css,/min-height:44px/);
});
