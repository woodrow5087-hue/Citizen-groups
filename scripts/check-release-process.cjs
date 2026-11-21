#!/usr/bin/env node
/* F-12: enforce that review tooling remains in place. This does NOT replace
 * GitHub branch rules, a human code-owner review, or church pilot authorization.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..');
const baseline='84e489b86851e853948a7d4246475e83b7ddd085';
const errors=[];
const read=file=>fs.readFileSync(path.join(root,file),'utf8');
function requireText(label,body,phrases){
  for(const phrase of phrases)if(!body.includes(phrase))errors.push(label+' missing required control: '+phrase);
}
try{
  const workflow=read('.github/workflows/rally-point-preview-qa.yml');
  requireText('QA workflow',workflow,[
    'rally-point/v08-preferred-design-snapshot',
    'npm ci','npm test','npm run build',
    'npm run test:browser','npm run test:onboarding',
    'npm run test:blank-battle','npm run test:visual',
    'actions/upload-artifact@v4',baseline
  ]);
  const visual=read('scripts/visual-regression-check.mjs');
  requireText('visual comparator',visual,[baseline,'welcome-mobile','today-mobile','groups-mobile','team-mobile','read-mobile','verseplay-mobile','leader-mobile','today-desktop','test-results']);
  const pkg=JSON.parse(read('package.json'));
  if(pkg.scripts?.['test:visual']!=='node scripts/visual-regression-check.mjs')errors.push('Visual test is not wired into npm scripts');
  for(const file of ['.github/PULL_REQUEST_TEMPLATE.md','docs/release/F12_RELEASE_WORKFLOW.md','docs/release/F12_RELEASE_REVIEW_CHECKLIST.md'])read(file);
  const safety=JSON.parse(read('config/rallypoint-v10-readiness.json'));
  if(safety.approved_pilot!==false)console.log('Notice: separate real-data pilot approval manifest changed; F-12 alone does not authorize a live pilot.');
  try{
    execFileSync('git',['cat-file','-e',baseline+'^{commit}'],{cwd:root,stdio:'pipe'});
  }catch{
    console.log('INFO: approved commit not present in local shallow checkout; workflow uses explicit SHA checkout for visual regression.');
  }
}catch(error){errors.push('Release tooling could not be inspected: '+error.message);}
if(errors.length){
  console.error('F-12 RELEASE SAFEGUARD CHECK FAILED');
  errors.forEach(x=>console.error(' - '+x));
  process.exitCode=1;
}else console.log('F-12 release tooling, frozen baseline, review checklist and visual comparison are wired. Manual approvals and repository rules still required.');
