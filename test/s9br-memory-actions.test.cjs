'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const M=require('../rallypoint-memorize.js'),A=require('../rally-one-memory-actions.js');
const {restoreMemoryActionsSource}=require('./helpers/s9br-memory-actions-source.cjs');
const root=path.resolve(__dirname,'..'),prior=restoreMemoryActionsSource();
const legacy=prior.slice(prior.indexOf("if(a==='memory-mode'){"),prior.indexOf("if(a==='rhythm-save'){"));
test('memory action extraction reconstructs the exact accepted controller',()=>{
 const b=Buffer.from(prior);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),'ee6989e1599096159da420a3c171a33196bbf832');
});
function execute(variant,steps,extra={}){
 const s={plan:'sermon',memoryMode:'solo',memoryActive:null,memoryPassTurn:1,memoryTarget:null,memoryGames:{},unrelated:{keep:true},...structuredClone(extra)};
 const effects=[];
 const render=()=>effects.push(['render',JSON.stringify(s)]),notify=x=>effects.push(['notify',x]);
 for(const [a,v=''] of steps){
  if(variant==='legacy')vm.runInNewContext('(function(){'+legacy+'})();',{a,v,s,M,render,notify});
  else if(A.handles(a))A.run(a,v,{s,M,render,notify});
 }
 return JSON.stringify({s,effects});
}
const picks=Array.from({length:5},(_,i)=>['memory-pick','a'+i]);
const cases=[
 ['solo mode',[['memory-mode','solo']]],['pass mode',[['memory-mode','pass']]],['invalid mode',[['memory-mode','invalid']]],
 ['Romans challenge',[['memory-challenge','romans']]],['existing plan challenge',[['memory-challenge','study']],{plan:'study'}],
 ['valid slot',[['memory-slot','2']]],['invalid slot',[['memory-slot','8']]],['clear filled slot',[['memory-pick','a0'],['memory-slot','0']]],
 ['targeted pick',[['memory-slot','3'],['memory-pick','a3']]],['invalid pick',[['memory-pick','bad']]],
 ['incomplete check',[['memory-check']]],['complete verse',[...picks,['memory-check']]],
 ['solved slot cannot change',[...picks,['memory-check'],['memory-slot','0']]],
 ['hint',[['memory-pick','a0'],['memory-hint']]],['reset',[...picks,['memory-check'],['memory-reset']]],
 ['next player blocked',[['memory-mode','pass'],['memory-next-player']]],
 ['pass and play',[['memory-mode','pass'],...picks,['memory-check'],['memory-next-player'],...picks,['memory-check']]],
 ['new duel',[['memory-mode','pass'],...picks,['memory-check'],['memory-next-player'],['memory-new-duel']]],
 ['unknown action',[['rhythm-save']]]
];
for(const [label,steps,extra] of cases)test('memory action parity: '+label,()=>assert.equal(execute('new',steps,extra),execute('legacy',steps,extra)));
test('action boundary is exhaustive and excludes other features',()=>{
 for(const a of ['mode','challenge','slot','pick','check','hint','reset','next-player','new-duel'])assert.equal(A.handles('memory-'+a),true);
 for(const a of ['memory-unknown','rhythm-save','f10-confirm','send','read',undefined])assert.equal(A.handles(a),false);
});
test('completed verse preserves unrelated data and emits original receipt',()=>{
 const r=JSON.parse(execute('new',[...picks,['memory-check']]));
 assert.equal(r.s.memoryGames['sermon:solo'].solved,true);assert.deepEqual(r.s.unrelated,{keep:true});
 assert.deepEqual(r.effects.at(-1),['notify','Verse complete — nicely done!']);
});
test('memory dependency loads before controller and ships in build',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 assert.ok(html.includes('src="rally-one-memory-actions.js"'));assert.ok(html.indexOf('rally-one-memory-actions.js')<html.indexOf('src="rallypoint.js"'));assert.ok(build.includes("'rally-one-memory-actions.js'"));
});
