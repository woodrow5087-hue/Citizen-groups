'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {evaluate}=require('../scripts/s10c4e-evaluate.cjs');
const r=evaluate();
test('10C.4E all 116 original end-to-end pure response contracts, not just labels',()=>{
 assert.equal(r.fixtureCount,13);assert.equal(r.baseline.cases.length,116);
 assert.deepEqual(r.baseline.cases.filter(c=>!c.pass).map(c=>({id:c.id,failures:c.failures})),[]);
});
test('10C.4E stress evidence is complete and no evaluated question writes source state or repeats raw prayer body',()=>{
 assert.equal(r.stress.cases.length,20);
 for(const c of [...r.baseline.cases,...r.stress.cases]){
  assert.equal(c.mutates,false,c.id);assert.equal(c.disclosesRawPrayer,false,c.id);
  assert.equal(typeof c.pass,'boolean');assert.ok(Array.isArray(c.failures));
 }
 // Deliberately not a claim of stress acceptance. Run evaluator --strict
 // for the separate full release gate; recorded mismatches block acceptance.
});
