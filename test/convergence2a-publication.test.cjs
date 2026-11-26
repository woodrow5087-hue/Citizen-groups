'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const fs=require('node:fs'),os=require('node:os'),path=require('node:path');
const root=path.join(__dirname,'..');
test('publication is opt-in, deterministic, canonical-only and excluded from production',()=>{
 // Each build gets a private source copy: concurrent node:test files never share dist.
 const temp=fs.mkdtempSync(path.join(os.tmpdir(),'rally-2a-'));
 try{
  execFileSync('git',['archive','HEAD'],{cwd:root,stdio:['ignore',fs.openSync(path.join(temp,'source.tar'),'w'),'pipe']});
  execFileSync('tar',['-xf','source.tar'],{cwd:temp});
  // Include candidate working build in local validation before the first commit.
  fs.copyFileSync(path.join(root,'scripts/build.cjs'),path.join(temp,'scripts/build.cjs'));
  const env={...process.env,NETLIFY:'true',CONTEXT:'branch-deploy',BRANCH:'rally-one/develop'};
  const build=overrides=>{execFileSync(process.execPath,['scripts/build.cjs'],{cwd:temp,env:{...env,...overrides}});return path.join(temp,'dist');};
  const read=(dir,file)=>fs.readFileSync(path.join(dir,file),'utf8');
  let out=build({});
  const legacy=read(out,'index.html');
  assert.ok(!legacy.includes('data-default-experience'));
  const first=read(out,'foundation2/group-fixtures.js'),serving=read(out,'foundation2/serving-fixtures.js');
  assert.match(first,/2026-12-05T18:00:00.000Z/);
  assert.match(serving,/2026-12-06T16:00:00.000Z/);
  assert.match(read(out,'foundation2/index.html'),/Fictional demonstration.*December 2, 2026/);
  assert.match(read(out,'foundation2/index.html'),/index.html\?rallyOne=1/);
  out=build({});assert.equal(read(out,'foundation2/group-fixtures.js'),first);assert.equal(read(out,'foundation2/serving-fixtures.js'),serving);
  for(const overrides of [{CONTEXT:'production',BRANCH:'main'},{BRANCH:'other'},{NETLIFY:'false'},{NETLIFY:'',CONTEXT:'deploy-preview'}]){
   out=build(overrides);assert.equal(fs.existsSync(path.join(out,'foundation2')),false);
  }
  out=build({CONTEXT:'deploy-preview'});assert.ok(fs.existsSync(path.join(out,'foundation2/index.html')));
  assert.match(read(out,'index.html'),/data-default-experience="rally-one"/);
 }finally{fs.rmSync(temp,{recursive:true,force:true});}
});
test('Foundation gate covers every canonical PR and canonical push without self-selected paths',()=>{
 const workflow=fs.readFileSync(path.join(root,'.github/workflows/foundation2-review.yml'),'utf8');
 assert.match(workflow,/pull_request:\s+branches: \[rally-one\/develop\]/);
 assert.match(workflow,/push:\s+branches: \[rally-one\/develop\]/);
 assert.doesNotMatch(workflow,/head_ref|paths:|paths-ignore:/);
});
