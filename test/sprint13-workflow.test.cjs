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
test('CLI cannot hide uncommitted dependencies behind a clean committed cosmetic diff',()=>{
 const os=require('node:os'),path=require('node:path'),{execFileSync}=require('node:child_process');
 const dir=fs.mkdtempSync(path.join(os.tmpdir(),'rally-validation-'));
 const env={...process.env,GIT_CONFIG_GLOBAL:'/dev/null',GIT_CONFIG_NOSYSTEM:'1'};
 const git=(...args)=>execFileSync('git',args,{cwd:dir,env,stdio:'pipe',encoding:'utf8'}).trim();
 try{
  git('init');fs.writeFileSync(path.join(dir,'connect-usability.css'),'a{}');git('add','.');
  git('-c','user.name=Test','-c','user.email=test@example.invalid','commit','-m','fixture');const base=git('rev-parse','HEAD');
  fs.writeFileSync(path.join(dir,'connect-usability.css'),'b{}');git('add','.');git('-c','user.name=Test','-c','user.email=test@example.invalid','commit','-m','cosmetic');
  const plan=()=>JSON.parse(execFileSync(process.execPath,[path.resolve('scripts/validation-plan.cjs'),base,'HEAD'],{cwd:dir,env,encoding:'utf8'}));
  assert.equal(plan().tier,1);assert.equal(plan().dirty,false);
  fs.writeFileSync(path.join(dir,'authorization.js'),'unreviewed');assert.equal(plan().dirty,true);assert.equal(plan().tier,3);
 }finally{fs.rmSync(dir,{recursive:true,force:true});}
});
