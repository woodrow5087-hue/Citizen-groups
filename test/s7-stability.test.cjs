'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Storage=require('../rallypoint-storage-guard.js');
const root=path.resolve(__dirname,'..'),read=file=>fs.readFileSync(path.join(root,file),'utf8');
function disk(primaryRaw,todayRaw){
 const data=new Map([[Storage.PRIMARY_KEY,primaryRaw],[Storage.TODAY_KEY,todayRaw]]);
 return {
  getItem:k=>data.has(k)?data.get(k):null,
  setItem:(k,v)=>data.set(k,v),
  removeItem:k=>data.delete(k),
  snapshot:()=>Object.fromEntries(data)
 };
}
test('invalid group, team, prayer, leader or direct data never overwrites original storage',()=>{
 const today=JSON.stringify({memberships:{group:true,team:true}}),
 invalid=[
  {groupMessages:[{name:null,text:'bad'}]},
  {prayers:'not an array'},
  {prayers:[{name:'Taylor',text:42}]},
  {teamMessages:[null]},
  {teamMessages:[{name:'Sam',text:{}}]},
  {reached:'yes'},
  {reached:[null]},
  {directMessages:{anna:'not-array'}},
  {directMessages:{anna:[{text:null}]}},
  {companionCare:[]},
  {attendance:'wrong-type'}
 ];
 for(const record of invalid){
  const raw=JSON.stringify({groupMessages:[],...record}),store=disk(raw,today),guard=Storage.create(store);
  assert.equal(guard.status().ok,false,JSON.stringify(record));
  assert.equal(guard.save({primaryRaw:JSON.stringify({groupMessages:[]}),todayRaw:today}).ok,false);
  assert.equal(store.getItem(Storage.PRIMARY_KEY),raw);
  assert.equal(store.getItem(Storage.TODAY_KEY),today);
 }
});
test('normal fixture remains editable, with explicit storage guard as the only primary writer',()=>{
 const primary=JSON.stringify({groupMessages:[{name:'Jess',text:'Hello',time:'Now'}],
  teamMessages:[],prayers:[],reached:[],directMessages:{},companionCare:{},attendance:{}});
 const today=JSON.stringify({memberships:{group:true,team:false}});
 const store=disk(primary,today),guard=Storage.create(store);
 assert.equal(guard.status().ok,true);
 assert.equal(guard.save({primaryRaw:primary,todayRaw:today}).ok,true);
 assert.equal(store.getItem(Storage.JOURNAL_KEY),null);
});
test('fixed visual baseline, four tabs and local demo source order remain intact',()=>{
 const html=read('index.html'),build=read('scripts/build.cjs'),app=read('rallypoint.js');
 for(const asset of ['rally-one-groups-v2.css','rally-one-m5-mobile-parity.css','rally-one-s7-demo.css',
   'rally-one-groups-v2.js','rally-one-member-context.js','rally-one-s7-demo.js']){
   assert.ok(html.includes(asset),'index missing '+asset);
   assert.ok(build.includes("'"+asset+"'"),'build missing '+asset);
 }
 assert.ok(html.indexOf('rally-one-s7-demo.css')>html.indexOf('rally-one-m5-mobile-parity.css'));
 assert.ok(html.indexOf('rally-one-s7-demo.js')<html.indexOf('rallypoint.js'));
 assert.ok(html.indexOf('rally-one-member-context.js')<html.indexOf('rallypoint.js'));
 assert.match(app,/const rallyOne=/);
 assert.match(app,/s7-scenario'\|\|a==='s7-restore/);
 const workflow=read('.github/workflows/rally-point-preview-qa.yml');
 assert.match(workflow,/Run mobile, accessibility/);
 assert.match(workflow,/Check the default Today on the Netlify preview build/);
 assert.match(read('scripts/preview-today-browser-check.mjs'),/s7-demo-browser-check/);
});
test('synthetic provider contract cannot reach static Netlify bundle',()=>{
 const build=read('scripts/build.cjs'),html=read('index.html');
 assert.doesNotMatch(build,/s7-readonly-member-contract/);
 assert.doesNotMatch(html,/s7-readonly-member-contract/);
 assert.equal(read('rally-one-s7-demo.js').includes('localStorage'),false);
 assert.equal(read('rally-one-s7-demo.js').includes('fetch('),false);
});
