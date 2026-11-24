'use strict';
// Sprint 9B-R characterization probe. Engineering-only; not bundled or included
// in application CI yet. From a checkout with the pinned commit available:
// node engineering/s9br-baseline-probes.cjs
// This is a reproduction of existing behavior, NOT a desired-behavior test.
// After acceptance, port mode cases to the real module and invert the partial
// write assertion into a non-destructive regression test for the fix.
const assert = require('node:assert/strict');
const {execFileSync} = require('node:child_process');
const vm = require('node:vm');
const {test} = require('node:test');
const BASE = '90d291f835f6e213620a273569e5c9d2f4e75f26';
const source = path => execFileSync('git',['show', BASE+':'+path],{encoding:'utf8'});
function region(source,start,end) {
 const a=source.indexOf(start), b=source.indexOf(end,a+start.length);
 assert.ok(a>=0 && b>a, 'Pinned source markers missing');
 return source.slice(a,b);
}
const modeSource=region(source('rallypoint.js'),'const previewParams=','let f09Index=');
const cases=[
 ['standard','',{},[false,false,false,false,false]],
 ['branch','',{defaultToday:'board'},[false,false,false,true,true]],
 ['PR','',{defaultToday:'board',defaultExperience:'rally-one'},[true,false,true,true,true]],
 ['branch override','?rallyOne=1',{defaultToday:'board'},[true,false,true,true,true]],
 ['explicit opt-out','?rallyOne=0',{defaultToday:'board',defaultExperience:'rally-one'},[false,false,false,true,true]],
 ['stack override','?f09=1',{defaultToday:'board',defaultExperience:'rally-one'},[false,false,false,false,true]],
 ['f10','?f10=1',{defaultExperience:'rally-one'},[false,false,true,true,true]],
 ['f103','?f103=1',{defaultExperience:'rally-one'},[false,true,true,true,true]],
 ['explicit Rally One wins','?rallyOne=1&f09=1',{defaultToday:'board'},[true,false,true,true,true]],
 ['disabled legacy flag still overrides','?f10=0',{defaultToday:'board',defaultExperience:'rally-one'},[false,false,false,true,true]]
];
for(const [name,search,dataset,expected] of cases) {
 test('pinned mode: '+name,()=>{
  const actual=vm.runInNewContext(modeSource+'\n[rallyOne,f103Preview,f10Preview,f09Board,f09Preview]',{
   URLSearchParams,window:{location:{search}},document:{documentElement:{dataset},body:{classList:{add(){}}},querySelector(){return null}}
  });
  assert.deepEqual(Array.from(actual),expected);
 });
}
test('reproduce pinned onboarding partial-write defect (not a passing release gate)',()=>{
 const fn=region(source('rallypoint-welcome.js'),'function savePreview(',"gateway.addEventListener('input'");
 const uiBefore='{"campus":"north","name":"Before"}',appBefore='{"role":"leader","view":"team"}';
 const records=new Map([['ui',uiBefore],['app',appBefore]]);
 let renders=0,exits=0;
 const result=vm.runInNewContext("let error='';"+fn+'\nsavePreview(); error;',{
  localStorage:{getItem:k=>records.get(k)??null,setItem(k,v){if(k==='app')throw Error('simulated write failure');records.set(k,v)}},
  UI_KEY:'ui',APP_KEY:'app',campus:'central',name:'Fixture',kind:'member',membership:{group:true,team:false},rallyOne:true,
  render(){renders++},returnToApp(){exits++}
 });
 assert.notEqual(records.get('ui'),uiBefore,'Existing defect: profile has already changed');
 assert.equal(records.get('app'),appBefore);
 assert.equal(renders,1);assert.equal(exits,0);assert.ok(result);
});
