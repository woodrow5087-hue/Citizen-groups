'use strict';

const assert=require('node:assert/strict');
const test=require('node:test');
const {createServingRehearsal,readServingAssignment}=require('../pilot/f2-synthetic-serving.cjs');
const {makeServingPreviewBundle}=require('../scripts/build-serving-preview.cjs');
const Serving=require('../foundation2/serving-preview.js');

const clock=Date.parse('2026-11-26T00:45:00Z');
const now=()=>clock;
const grant={
 organizationId:'sample-citizen',personId:'sample-volunteer',campus:'north',
 teamId:'sample-welcome',permission:'serving:read',active:true,consent:true
};
const startsAt='2026-11-29T16:00:00.000Z';
const member={permissions:{team:true},identity:{campus:'north'}};
const fakeResponse=()=>({
 status:200,observedAt:new Date(clock).toISOString(),
 assignment:{...grant,title:'Welcome Team',startsAt,internalNote:'Provider-only note'}
});

test('the build rehearses the four outcomes and publishes only the minimum read model',async()=>{
 const fixtures=await createServingRehearsal(clock);
 assert.deepEqual(fixtures,{
  ready:{state:'ready',assignment:{title:'Welcome Team',startsAt,campus:'north'}},
  denied:{state:'restricted'},outage:{state:'unavailable'},stale:{state:'stale'}
 });
 const bundle=await makeServingPreviewBundle(clock);
 assert.doesNotMatch(bundle,/internalNote|sample-volunteer|sample-citizen|sample-welcome|permission|observedAt/);
});

test('missing, revoked and out-of-scope fixture grants cannot read the provider',async()=>{
 for(const invalid of [null,{...grant,active:false},{...grant,consent:false},{...grant,permission:'groups:read'},
  {...grant,organizationId:'other-org'},{...grant,personId:'other-person'},{...grant,campus:'maui'},{...grant,teamId:'other-team'}]){
  let calls=0;
  const result=await readServingAssignment({grant:invalid,now,transport:async()=>{calls++;return fakeResponse();}});
  assert.deepEqual(result,{state:'restricted'});
  assert.equal(calls,0);
 }
});

test('a ready record must match tenant, person, campus and team and include fresh valid dates',async()=>{
 for(const key of ['organizationId','personId','campus','teamId']){
  const response=fakeResponse();
  response.assignment[key]='outside-scope';
  assert.deepEqual(await readServingAssignment({grant,now,transport:async()=>response}),{state:'restricted'});
 }
 for(const response of [
  {...fakeResponse(),observedAt:'malformed'},
  {...fakeResponse(),observedAt:new Date(clock+1).toISOString()},
  {...fakeResponse(),assignment:{...fakeResponse().assignment,startsAt:new Date(clock).toISOString()}}
 ]){
  assert.deepEqual(await readServingAssignment({grant,now,transport:async()=>response}),{state:'unavailable'});
 }
});

test('temporary provider outages retry once; provider denial never retries',async()=>{
 let calls=0;
 const recovered=await readServingAssignment({grant,now,transport:async request=>{
  assert.deepEqual(request,{
   method:'GET',path:'/fixture/serving/assignment',
   organizationId:grant.organizationId,personId:grant.personId,campus:grant.campus,teamId:grant.teamId
  });
  return ++calls===1?{status:503}:fakeResponse();
 }});
 assert.equal(calls,2);
 assert.equal(recovered.state,'ready');
 calls=0;
 const denied=await readServingAssignment({grant,now,transport:async()=>{calls++;return {status:403};}});
 assert.deepEqual(denied,{state:'restricted'});
 assert.equal(calls,1);
});

test('both routes can share a safe projection without exposing an unverified assignment',async()=>{
 const fixtures=await createServingRehearsal(clock);
 assert.equal(Serving.localScenario('serving-ready'),'team');
 assert.equal(Serving.localScenario('visitor'),'visitor');
 assert.equal(Serving.project('team',member,fixtures),null);
 assert.deepEqual(Serving.project('serving-ready',{...member,permissions:{team:false}},fixtures),{state:'restricted'});
 assert.deepEqual(Serving.project('serving-ready',{...member,identity:{campus:'central'}},fixtures),{state:'restricted'});
 assert.deepEqual(Serving.project('serving-ready',member,undefined),{state:'unavailable'});
 const ready=Serving.project('serving-ready',member,fixtures);
 assert.match(ready.date,/^Sunday, Nov 29(?:,| at) 9:00 AM MST$/);
 assert.match(Serving.render(ready),/Welcome Team.*North Campus/);
 const malicious={ready:{...fixtures.ready,assignment:{...fixtures.ready.assignment,title:'<script>escape</script>'}}};
 assert.match(Serving.render(Serving.project('serving-ready',member,malicious)),/&lt;script&gt;/);
 for(const [mode,state] of [['denied','restricted'],['outage','unavailable'],['stale','stale']]){
  const vm=Serving.project('serving-'+mode,member,fixtures);
  assert.deepEqual(vm,{state});
  assert.doesNotMatch(Serving.render(vm),/Welcome Team|<time|data-team-action|data-command/);
 }
});
