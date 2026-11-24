'use strict';
// Engineering-only prototype. Does not alter the app or release test gates.
// Run with: node engineering/s9br-onboarding-prototype.cjs
const {execFileSync}=require('node:child_process');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const original=execFileSync('git',['show','1be48f9ca6784e2c2767565eddd7b536d644f9f1:rallypoint-storage-guard.js'],{encoding:'utf8'});
// Candidate: preserve absent keys in campus-only transactions; allow recovery of a null proposed record.
const candidate=original.replace("storage.setItem(PRIMARY_KEY,primaryRaw);\n        storage.setItem(TODAY_KEY,todayRaw);","restoreOne(PRIMARY_KEY,primaryRaw);\n        restoreOne(TODAY_KEY,todayRaw);").replace("every(k=>typeof after[k]==='string')","every(k=>after[k]===null||typeof after[k]==='string')");
assert.notEqual(candidate,original);
const candidateModule={exports:{}};
new Function('module',candidate)(candidateModule);
const G=candidateModule.exports;
function savePreferences(storage,options,guardModule){
 const guard=guardModule.create(storage);
 if(!guard.status().ok)return guard.status();
 const {primaryRaw,todayRaw}=guard.readOriginals();
 const {campus,campusOnly=false,name='',kind,membership={},rallyOne=false}=options;
 const ui=JSON.parse(todayRaw??'null')||{};
 ui.campus=campus;
 let nextPrimary=primaryRaw;
 if(!campusOnly){
  ui.name=name.trim()||ui.name||'Friend';
  ui.memberships={...ui.memberships,group:kind==='guest'?false:membership.group,team:kind==='guest'?false:membership.team};
  ui.seenGroupSignature='';
  ui.onboarding={version:2,connection:kind,completed:true};
  const app=JSON.parse(primaryRaw??'null')||{};
  app.role='member';app.view='today';app.groupPane=rallyOne?'overview':'chat';app.teamPane='schedule';
  nextPrimary=JSON.stringify(app);
 }
 return guard.save({primaryRaw:nextPrimary,todayRaw:JSON.stringify(ui)});
}
function disk(initial={},fault=()=>false){
 const map=new Map(Object.entries(initial));let writes=0;
 return {getItem:k=>map.get(k)??null,setItem(k,v){if(fault(k,++writes,'set'))throw Error('simulated write failure');map.set(k,String(v));},removeItem(k){if(fault(k,++writes,'remove'))throw Error('simulated remove failure');map.delete(k);},snapshot:()=>JSON.stringify([...map.entries()].sort())};
}
const P=G.PRIMARY_KEY,U=G.TODAY_KEY,J=G.JOURNAL_KEY;
const initial={"rallypoint-phase1-2026":"{\"role\":\"leader\",\"view\":\"team\",\"groupMessages\":[],\"custom\":\"keep\"}","rallypoint-today-ui-v1":"{\"campus\":\"north\",\"name\":\"Before\",\"memberships\":{\"group\":true,\"team\":true},\"other\":\"keep\"}","unrelated":"untouched"};
const opts={"campus":"central","name":"Fixture","kind":"connected","membership":{"group":true,"team":false},"rallyOne":true};
const eq=(x,y)=>JSON.stringify(x)===JSON.stringify(y);
test("full onboarding preserves unrelated fields",()=>assert.ok((()=>{const d=disk(initial);const r=savePreferences(d,opts,G);return r.ok&&JSON.parse(d.getItem(P)).custom==='keep'&&JSON.parse(d.getItem(U)).other==='keep'&&JSON.parse(d.getItem(P)).groupPane==='overview'&&d.getItem('unrelated')==='untouched'})()));
test("guest cannot inherit membership",()=>assert.ok((()=>{const d=disk(initial);const r=savePreferences(d,{...opts,kind:'guest'},G);return r.ok&&eq(JSON.parse(d.getItem(U)).memberships,{group:false,team:false})})()));
test("campus only preserves exact primary bytes",()=>assert.ok((()=>{const d=disk(initial);return savePreferences(d,{campus:'maui',campusOnly:true},G).ok&&d.getItem(P)===initial[P]})()));
test("campus only preserves absent primary",()=>assert.ok((()=>{const d=disk({[U]:initial[U]});return savePreferences(d,{campus:'maui',campusOnly:true},G).ok&&d.getItem(P)===null})()));
test("legacy full onboarding keeps chat default",()=>assert.ok((()=>{const d=disk(initial);return savePreferences(d,{...opts,rallyOne:false},G).ok&&JSON.parse(d.getItem(P)).groupPane==='chat'})()));
test("malformed saved record untouched",()=>assert.ok((()=>{const d=disk({...initial,[P]:'{bad'});const b=d.snapshot();return !savePreferences(d,opts,G).ok&&d.snapshot()===b})()));
test("existing journal blocks changes",()=>assert.ok((()=>{const d=disk({...initial,[J]:'interrupted'});const b=d.snapshot();return !savePreferences(d,opts,G).ok&&d.snapshot()===b})()));
test("journal start failure leaves records untouched",()=>assert.ok((()=>{const d=disk(initial,(k,n)=>n===1);const b=d.snapshot();return !savePreferences(d,opts,G).ok&&d.snapshot()===b})()));
test("first data write failure rolls back",()=>assert.ok((()=>{const d=disk(initial,(k,n)=>n===2);const b=d.snapshot();return !savePreferences(d,opts,G).ok&&d.snapshot()===b})()));
test("second data write failure rolls back",()=>assert.ok((()=>{const d=disk(initial,(k,n)=>n===3);const b=d.snapshot();return !savePreferences(d,opts,G).ok&&d.snapshot()===b})()));
test("rollback failure retains recovery journal",()=>assert.ok((()=>{const d=disk(initial,(k,n)=>n===3||n===4);const b=d.snapshot();const r=savePreferences(d,opts,G);if(r.ok||!d.getItem(J))return false;const recovery=G.create(d).recoverInterruptedSave();return recovery.ok&&d.snapshot()===b})()));
test("nullable proposed primary survives explicit recovery",()=>assert.ok((()=>{const d=disk({[U]:initial[U]},(k,n)=>n===3||n===4);const b=d.snapshot();const r=savePreferences(d,{campus:'maui',campusOnly:true},G);if(r.ok||!d.getItem(J))return false;const recovery=G.create(d).recoverInterruptedSave();return recovery.ok&&d.snapshot()===b})()));
// Remaining before runtime integration: guarded adapter acquisition on blocked
// localStorage getter, concurrent change between reads/save, browser onboarding
// routes and failure copy, exact protected-source gate review, and visual parity.
// Existing journal/version and unrelated storage keys must not be migrated.
