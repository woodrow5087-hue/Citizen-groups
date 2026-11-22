'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {simulate}=require('../scripts/pilot-sandbox.cjs');
test('Offline pilot sandbox exercises six distinct security and source states without credentials',async()=>{
 const results=[];
 for(const scenario of ['member','no-event','revoked','expired','wrong-organization','unavailable']){
  results.push(await simulate(scenario));
 }
 assert.deepEqual(results.map(x=>x.status),
  ['ready','ready','restricted','restricted','restricted','unavailable']);
 assert.equal(results[0].group.name,'Sample Wednesday Group');
 assert.equal(results[1].nextGathering,null);
 for(const result of results.slice(2)){
  assert.equal(result.group,null);
  assert.equal(result.nextGathering,null);
 }
 assert.doesNotMatch(JSON.stringify(results),/SYNTHETIC_TOKEN|Private synthetic notes|person_id|authorization/i);
});
test('No provider network call is needed to test denied or unavailable member states',async()=>{
 const view=await simulate('wrong-organization');
 assert.deepEqual(view,{scenario:'wrong-organization',status:'restricted',
  group:null,nextGathering:null,source:null});
});
