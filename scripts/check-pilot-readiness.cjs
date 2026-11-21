#!/usr/bin/env node
/* v1.0 readiness preflight. This is a documentary release gate, not authentication.
 * A successful frontend preview is not proof that live data use is approved.
 * Do NOT store tokens or personal data in this manifest.
 */
'use strict';
const fs=require('node:fs');
const path=require('node:path');
const manifestPath=path.resolve(__dirname,'../config/rallypoint-v10-readiness.json');
function evaluate(manifest){
  const failures=[];
  if(!manifest||typeof manifest!=='object')return {ready:false,failures:['Missing pilot manifest']};
  if(manifest.version!=='1.0')failures.push('Manifest version must be 1.0');
  if(!Array.isArray(manifest.gates)||manifest.gates.length<8)failures.push('Missing required release gates');
  const seen=new Set();
  for(const g of Array.isArray(manifest.gates)?manifest.gates:[]){
    if(!g||typeof g.id!=='string'||!g.id.trim()){failures.push('Gate without a valid ID');continue;}
    if(seen.has(g.id))failures.push('Duplicate release gate: '+g.id);seen.add(g.id);
    if(g.status!=='approved')failures.push('Not approved: '+g.id+' — '+(g.label||''));
    if(g.status==='approved'){
      if(typeof g.owner!=='string'||!g.owner.trim())failures.push('Missing accountable owner for approved gate: '+g.id);
      if(!Array.isArray(g.evidence)||!g.evidence.length||g.evidence.some(v=>typeof v!=='string'||!v.trim()))failures.push('Missing referenced decision/test evidence for approved gate: '+g.id);
    }
  }
  if(manifest.approved_pilot!==true)failures.push('Live pilot has not received final explicit go/no-go approval');
  return {ready:failures.length===0,failures,gateCount:Array.isArray(manifest.gates)?manifest.gates.length:0};
}
if(require.main===module){
  try{
    const m=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
    const report=evaluate(m);
    if(report.ready){
      console.log('Pilot readiness evidence checklist satisfied; independent security review and live integration tests still required.');
      process.exitCode=0;
    }else{
      console.error('RALLY POINT LIVE PILOT IS NOT AUTHORIZED / NOT READY');
      for(const f of report.failures)console.error('  - '+f);
      console.error('Demo previews can continue; never treat this as authentication or permission enforcement.');
      process.exitCode=1;
    }
  }catch(error){console.error('Unable to evaluate pilot readiness: '+error.message);process.exitCode=1}
}
module.exports={evaluate};
