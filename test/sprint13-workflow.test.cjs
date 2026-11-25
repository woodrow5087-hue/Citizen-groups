'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {classify}=require('../scripts/validation-plan.cjs');
test('ambiguous, mixed, shared, security and validator changes cannot receive reduced advice',()=>{
 for(const files of [[],['rallypoint.js'],['styles.css'],['scripts/validation-plan.cjs'],['test/foo.cjs'],['connect-usability.css','member-context.js'],['unknown.css'],['connect-member.js']])assert.equal(classify(files).tier,3);
 assert.equal(classify(['connect-usability.css']).tier,1);
 assert.match(classify(['connect-usability.css']).ci,/full Tier 3/);
});
test('aggregate is unconditional and requires both isolated suites; original visual checks stay mandatory',()=>{
 const s=fs.readFileSync('.github/workflows/rally-point-preview-qa.yml','utf8');
 assert.match(s,/preview-qa:\n    if: always\(\)\n    needs: \[functional, visual\]/);
 for(const result of ['FUNCTIONAL','VISUAL'])assert.ok(s.includes('test "$'+result+'" = success'));
 for(const runner of ['s8-visual-regression.mjs','ux03-visual-regression.mjs','s11e-local-review-browser-check.mjs'])assert.ok(s.includes(runner));
 assert.ok(!s.includes('continue-on-error'));assert.ok(!s.includes('validation-plan.cjs'));
 assert.ok(s.includes('rally-point-preview-qa-functional'));assert.ok(s.includes('rally-point-preview-qa-visual'));
});
