'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {initialize}=require('../rally-one-app-state.js');
const {restoreStateSource}=require('./helpers/s9br-state-source.cjs');
const root=path.resolve(__dirname,'..');
const old=restoreStateSource(),bytes=Buffer.from(old);
const block=old.slice(old.indexOf('const defaults=()=>'),old.indexOf('const T=window.RallyToday'));
function legacy(readRaw,rallyOne){
 return vm.runInNewContext(block+'\nJSON.stringify(s);',{localStorage:{getItem:readRaw},key:'rallypoint-phase1-2026',rallyOne});
}
test('controller reconstructs to the prior exact approved Git blob',()=>{
 assert.equal(crypto.createHash('sha1').update('blob '+bytes.length+'\0').update(bytes).digest('hex'),'26ab4ffcec2941d2f6b15df051265246a7e0f381');
});
const cases=[
 ['empty',()=>null],
 ['empty string',()=>''],
 ['malformed JSON',()=>'{broken'],
 ['unreadable storage',()=>{throw Error('storage blocked');}],
 ['null JSON',()=>'null'],
 ['valid saved preferences',()=>JSON.stringify({view:'team',role:'leader',plan:'study',custom:{keep:true},memoryTarget:3})],
 ['bad group list',()=>JSON.stringify({groupMessages:{},custom:'legacy reset'})],
 ['malformed lists and maps',()=>JSON.stringify({groupMessages:[null,{name:'A',text:'valid'},{text:'bad'}],teamMessages:'bad',prayers:[{}, {name:'B',text:'valid'}],reached:['a',7],attendance:[],directMessages:null,planQuestions:[],companionCare:'bad',companionChoices:{snoozedUntil:[]},rhythm:null,memoryGames:[],memoryMode:'invalid',memoryActive:'invalid',memoryPassTurn:4,memoryTarget:7})],
 ['valid memory progress',()=>JSON.stringify({memoryTextRevision:'KJV-legacy',memoryMode:'pass',memoryActive:'study',memoryPassTurn:2,memoryTarget:4,memoryGames:{round:{slots:[1]}}})],
 ['unknown future fields',()=>JSON.stringify({custom:{nested:[1,2]},companionChoices:{snoozedUntil:{group:42},extra:true},directMessages:{a:[{text:'sample'}]}})]
];
for(const [label,readRaw] of cases)test('state parity: '+label,()=>{
 for(const rallyOne of [false,true]){
  let reads=0;
  const actual=initialize(()=>{reads++;return readRaw();},rallyOne);
  assert.equal(JSON.stringify(actual),legacy(readRaw,rallyOne));
  assert.equal(reads,1);
 }
});
test('each initialization returns fresh independent defaults',()=>{
 const a=initialize(()=>null,false);a.groupMessages[0].text='changed';a.companionChoices.snoozedUntil.a=1;
 const b=initialize(()=>null,false);
 assert.notEqual(b.groupMessages[0].text,'changed');assert.deepEqual(b.companionChoices.snoozedUntil,{});
});
test('browser dependency order and static build allowlist',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 const name='rally-one-app-state.js';assert.ok(html.includes('src="'+name+'"'));assert.ok(html.indexOf(name)<html.indexOf('src="rallypoint.js"'));
 assert.ok(build.includes("'"+name+"'"));
});
