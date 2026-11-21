const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {evaluate}=require('../scripts/check-pilot-readiness.cjs');
const manifest=JSON.parse(fs.readFileSync(path.resolve(__dirname,'../config/rallypoint-v10-readiness.json'),'utf8'));
test('live pilot is blocked by default, regardless of whether the fixture preview builds',()=>{
 const report=evaluate(manifest);
 assert.equal(report.ready,false);
 assert.ok(report.failures.some(x=>x.includes('Not approved')));
 assert.ok(report.failures.some(x=>x.includes('final explicit go/no-go')));
 assert.ok(report.gateCount>=8);
});
test('unchecked release gates and undocumented approvals cannot be silently accepted',()=>{
 const copy=JSON.parse(JSON.stringify(manifest));
 copy.gates.forEach(g=>g.status='approved');
 copy.approved_pilot=true;
 const r=evaluate(copy);
 assert.equal(r.ready,false);
 assert.ok(r.failures.some(x=>x.includes('owner')));
 assert.ok(r.failures.some(x=>x.includes('evidence')));
});
test('structurally documented approvals would clear preflight but not replace independent security review',()=>{
 const copy=JSON.parse(JSON.stringify(manifest));
 copy.approved_pilot=true;
 copy.gates.forEach(g=>{g.status='approved';g.owner='Verified pilot owner';g.evidence=['approved review/test evidence reference']});
 assert.equal(evaluate(copy).ready,true);
 copy.gates[1].id=copy.gates[0].id;
 assert.equal(evaluate(copy).ready,false);
});
