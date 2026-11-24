'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const {evaluate,run}=require('../scripts/s10c4e-evaluate.cjs'),fresh=require('../engineering/s10c4er-fresh-stress-corpus.json');
const Ask=require('../rallypoint-personal-companion.js');
test('10C.4E-R original stress expectations now strictly pass',()=>{
 const r=evaluate();assert.deepEqual(r.stress.cases.filter(c=>!c.pass).map(c=>({id:c.id,failures:c.failures})),[]);
});
for(const c of fresh.cases)test('10C.4E-R '+c.id+' '+c.query,()=>{const r=run(c);assert.deepEqual(r.failures,[]);assert.equal(r.pass,true);});
test('10C.4E-R explicit distress offers real immediate help, not church action or automatic outreach',()=>{
 for(const c of fresh.cases.filter(x=>['R08','R09','R10'].includes(x.id))){
  const r=run(c);assert.match(r.intro,/911/);assert.match(r.intro,/988/);assert.match(r.intro,/cannot contact help or monitor your safety/);assert.deepEqual(r.routes,[]);
 }
 for(const c of [{id:'ordinary',fixture:'care-ready',query:'Can you send Marcus a message for me?',expect:{intent:'unsupported',routes:[]}}])assert.doesNotMatch(run(c).intro,/911|988/);
});
test('10C.4E-R decline explicitly respected without new care suggestion',()=>{
 for(const c of fresh.cases.slice(0,2)){const r=run(c);assert.match(r.intro,/don’t need to take a care step/);assert.deepEqual(r.routes,[]);}
});
test('10C.4E-R original approved companion source reconstructs exactly',()=>{
 const b=Buffer.from(require('./helpers/s10c4er-resilience-source.cjs').restoreAsk());
 assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),'a8f94f5ab8a6da91647515278ab1b69814a201e6');
});
