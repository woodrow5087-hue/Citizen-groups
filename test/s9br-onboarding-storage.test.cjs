'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const G=require('../rallypoint-storage-guard.js');
const {assertWelcomeSource}=require('../scripts/s9br-onboarding-source-invariant.cjs');
const source=fs.readFileSync(path.join(__dirname,'../rallypoint-welcome.js'),'utf8');
const start=source.indexOf('  function persistPreferences('),end=source.indexOf("  gateway.addEventListener('input'",start);
assert.ok(start>=0&&end>start);
const fragment=source.slice(start,end);
const P=G.PRIMARY_KEY,U=G.TODAY_KEY,J=G.JOURNAL_KEY;
const original={[P]:'{"role":"leader","view":"team","groupMessages":[],"custom":"keep"}',[U]:'{"campus":"north","name":"Before","memberships":{"group":true,"team":true},"other":"keep"}',unrelated:'untouched'};
function disk(initial=original,fault=()=>false){
 const map=new Map(Object.entries(initial));let writes=0;
 return {getItem:k=>map.get(k)??null,setItem(k,v){if(fault(k,++writes))throw Error('simulated write failure');map.set(k,String(v));},removeItem(k){if(fault(k,++writes))throw Error('simulated remove failure');map.delete(k);},snapshot:()=>JSON.stringify([...map.entries()].sort())};
}
function run(storage,overrides={},campusOnly=false){
 let renders=0,exits=0;
 const context={window:{RallyStorageGuard:G},localStorage:storage,campus:'central',name:'Fixture',kind:'connected',membership:{group:true,team:false},rallyOne:true,render(){renders++},returnToApp(){exits++},...overrides};
 const error=vm.runInNewContext("let error='';"+fragment+'\nsavePreview('+campusOnly+'); error;',context);
 return {error,renders,exits};
}
test('full onboarding preserves existing fields',()=>{
 const d=disk();assert.equal(run(d).exits,1);assert.equal(JSON.parse(d.getItem(P)).custom,'keep');assert.equal(JSON.parse(d.getItem(U)).other,'keep');assert.equal(JSON.parse(d.getItem(P)).groupPane,'overview');assert.equal(d.getItem('unrelated'),'untouched');
});
test('guest cannot inherit memberships',()=>{const d=disk();assert.equal(run(d,{kind:'guest'}).exits,1);assert.deepEqual(JSON.parse(d.getItem(U)).memberships,{group:false,team:false});});
test('legacy onboarding keeps chat default',()=>{const d=disk();assert.equal(run(d,{rallyOne:false}).exits,1);assert.equal(JSON.parse(d.getItem(P)).groupPane,'chat');});
test('campus-only keeps exact primary bytes and existing preferences',()=>{const d=disk();assert.equal(run(d,{},true).exits,1);assert.equal(d.getItem(P),original[P]);assert.equal(JSON.parse(d.getItem(U)).name,'Before');});
test('campus-only keeps absent primary absent',()=>{const d=disk({[U]:original[U]});assert.equal(run(d,{},true).exits,1);assert.equal(d.getItem(P),null);});
for(const [label,initial,fault] of [
 ['malformed record',{...original,[P]:'{bad'},()=>false],
 ['existing journal',{...original,[J]:'interrupted'},()=>false],
 ['journal start failure',original,(k,n)=>n===1],
 ['first data write failure',original,(k,n)=>n===2],
 ['second data write failure',original,(k,n)=>n===3]
]){
 test(label+' preserves data and prevents exit',()=>{const d=disk(initial,fault),before=d.snapshot(),r=run(d);assert.equal(r.exits,0);assert.equal(r.renders,1);assert.match(r.error,/could not save/);assert.equal(d.snapshot(),before);});
}
test('rollback failure keeps recoverable journal',()=>{const d=disk(original,(k,n)=>n===3||n===4),before=d.snapshot();assert.equal(run(d).exits,0);assert.ok(d.getItem(J));assert.equal(G.create(d).recoverInterruptedSave().ok,true);assert.equal(d.snapshot(),before);});
test('nullable primary journal supports explicit recovery',()=>{const d=disk({[U]:original[U]},(k,n)=>n===3||n===4),before=d.snapshot();assert.equal(run(d,{},true).exits,0);assert.ok(d.getItem(J));assert.equal(G.create(d).recoverInterruptedSave().ok,true);assert.equal(d.snapshot(),before);});
test('guard rejects concurrent edits even during onboarding',()=>{
 const d=disk();const get=d.getItem;let reads=0;d.getItem=k=>{if(k===P&&++reads===2){d.setItem(P,'{"role":"member","external":true}');}return get(k);};
 assert.equal(run(d).exits,0);assert.equal(JSON.parse(d.getItem(P)).external,true);
});
test('blocked storage discloses error',()=>{const r=run({getItem(){throw Error('blocked')},setItem(){throw Error('blocked')},removeItem(){throw Error('blocked')}});assert.equal(r.exits,0);assert.match(r.error,/could not save/);});
test('protected source exception rejects unrelated mutation',()=>{
 const before=Buffer.from(source.replace("  // Use the existing two-record journal guard for all onboarding mutations.\n  function persistPreferences(campusOnly=false){\n    const guard=window.RallyStorageGuard.create(localStorage);\n    if(!guard.status().ok)return false;\n    const {primaryRaw,todayRaw}=guard.readOriginals();\n    const ui=JSON.parse(todayRaw??'null')||{};\n    ui.campus=campus;\n    let nextPrimary=primaryRaw;\n    if(!campusOnly){\n      ui.name=name.trim()||ui.name||'Friend';ui.memberships={...ui.memberships,group:kind==='guest'?false:membership.group,team:kind==='guest'?false:membership.team};ui.seenGroupSignature='';ui.onboarding={version:2,connection:kind,completed:true};\n      const app=JSON.parse(primaryRaw??'null')||{};\n      app.role='member';app.view='today';app.groupPane=rallyOne?'overview':'chat';app.teamPane='schedule';\n      nextPrimary=JSON.stringify(app);\n    }\n    return guard.save({primaryRaw:nextPrimary,todayRaw:JSON.stringify(ui)}).ok;\n  }\n  function savePreview(campusOnly=false){\n    try{\n      if(!persistPreferences(campusOnly))throw Error('Guarded preference save refused');\n    }catch{error='This browser could not save your preferences. Existing demo data has not been reset. Try again, or enter without saving.';render();return;}\n    returnToApp();\n  }\n","  function savePreview(campusOnly=false){\n    try{\n      // Parse without fallback here: never replace an unreadable existing record silently.\n      const ui=JSON.parse(localStorage.getItem(UI_KEY)||'null')||{};\n      ui.campus=campus;\n      if(!campusOnly){ui.name=name.trim()||ui.name||'Friend';ui.memberships={...ui.memberships,group:kind==='guest'?false:membership.group,team:kind==='guest'?false:membership.team};ui.seenGroupSignature='';ui.onboarding={version:2,connection:kind,completed:true};}\n      const app=JSON.parse(localStorage.getItem(APP_KEY)||'null')||{};\n      if(!campusOnly){app.role='member';app.view='today';app.groupPane=rallyOne?'overview':'chat';app.teamPane='schedule';}\n      localStorage.setItem(UI_KEY,JSON.stringify(ui));if(!campusOnly)localStorage.setItem(APP_KEY,JSON.stringify(app));\n    }catch{error='This browser could not save your preferences. Existing demo data has not been reset. Try again, or enter without saving.';render();return;}\n    returnToApp();\n  }\n").replace("if(!rallyOne)try{if(!persistPreferences(true))throw Error('Guarded campus save refused');}catch","if(!rallyOne)try{const ui=JSON.parse(localStorage.getItem(UI_KEY)||'null')||{};ui.campus=campus;localStorage.setItem(UI_KEY,JSON.stringify(ui));}catch"));
 assertWelcomeSource(before,Buffer.from(source));
 assert.throws(()=>assertWelcomeSource(before,Buffer.from(source+'\n// unexpected change')));
});
