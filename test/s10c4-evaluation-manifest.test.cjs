'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const corpus=require('../engineering/s10c4-evaluation-corpus.json');
const allowed=new Set(['group:','care-prayer','care-check-in','serve','rsvp','group:leader','group:chat']);
test('10C.4A evaluation target manifest has at least 100 uniquely identified prospective cases',()=>{
 assert.equal(corpus.version,1);assert.equal(corpus.phase,'target-contract-not-runtime-results');
 assert.ok(corpus.cases.length>=100);
 assert.equal(new Set(corpus.cases.map(x=>x.id)).size,corpus.cases.length);
 assert.equal(new Set(corpus.cases.map(x=>JSON.stringify([x.fixture,x.query,x.prior]))).size,corpus.cases.length);
});
test('10C.4A every target case has a declared fixture and explicit safe outcome contract',()=>{
 for(const c of corpus.cases){
  assert.ok(Object.hasOwn(corpus.fixtures,c.fixture),c.id);
  assert.ok(c.query.trim().length>0&&c.query.length<=160,c.id);
  assert.ok(c.expect.intent&&c.expect.outcome,c.id);
  assert.equal(c.expect.mutates,false,c.id);assert.equal(c.expect.disclosesRawPrayer,false,c.id);
  assert.ok(c.expect.routes.length<=2&&c.expect.routes.every(r=>allowed.has(r)),c.id);
 }
});
test('10C.4A target manifest includes revocation, pause, unavailable, ambiguity and adversarial negative cases',()=>{
 for(const fixture of Object.keys(corpus.fixtures))assert.ok(corpus.cases.some(c=>c.fixture===fixture),fixture);
 for(const outcome of ['no-group-access','respect-pause','source-unavailable-review','clarify-without-action','no-inferred-risk-or-write','recorded-local-completion'])assert.ok(corpus.cases.some(c=>c.expect.outcome===outcome),outcome);
 for(const c of corpus.cases.filter(c=>['no-group-access','respect-pause','clarify-without-action','no-inferred-risk-or-write','recorded-local-completion'].includes(c.expect.outcome)))assert.deepEqual(c.expect.routes,[],c.id);
});
