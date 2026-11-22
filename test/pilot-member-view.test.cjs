'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createPilotMemberView}=require('../pilot/member-view.cjs');
const {PilotReadError}=require('../pilot/planning-center-readonly-groups.cjs');
const now=new Date('2026-11-22T17:00:00.000Z');
const sample=()=>({
 source:'planning-center-groups',mode:'read-only',group:{name:'Sample Wednesday Group'},
 nextGathering:{title:'Wednesday gathering',startsAt:'2026-11-25T18:30:00-07:00'},
 asOf:now.toISOString(),token:'must never appear',
 privateNotes:'Sensitive sample context',roster:[{name:'Never show member'}]
});
const client=(readForServerSession,current=()=>now,maximumAgeMs=60_000)=>
 createPilotMemberView({readForServerSession,now:current,maximumAgeMs});
test('Valid server-scoped read becomes a minimal frozen presentation envelope',async()=>{
 const serverSession=Object.freeze({test:'opaque-server-session'});
 const reader=async passed=>{assert.equal(passed,serverSession);return sample()};
 const result=await client(reader).viewForServerSession(serverSession);
 assert.deepEqual(result,{
  state:'ready',group:{name:'Sample Wednesday Group'},
  nextGathering:{title:'Wednesday gathering',startsAt:'2026-11-25T18:30:00-07:00'},
  checkedAt:now.toISOString(),source:'Planning Center Groups'
 });
 assert.equal(Object.isFrozen(result),true);
 assert.equal(Object.isFrozen(result.group),true);
 assert.equal(Object.isFrozen(result.nextGathering),true);
 assert.doesNotMatch(JSON.stringify(result),/token|Sensitive|Never show|roster|privateNotes/);
});
test('No verified next event remains null; absence does not imply a weekly recurrence',async()=>{
 const data=sample();data.nextGathering=null;
 const result=await client(async()=>data).viewForServerSession({});
 assert.equal(result.state,'ready');
 assert.equal(result.nextGathering,null);
});
test('Revoked membership and forbidden auth yield identical non-enumerating restricted envelopes',async()=>{
 const get=code=>client(async()=>{throw new PilotReadError(code)}).viewForServerSession({});
 const [one,two]=await Promise.all([get('not-a-member'),get('access-denied')]);
 assert.deepEqual(one,two);
 assert.deepEqual(one,{state:'restricted',group:null,nextGathering:null,checkedAt:null,source:null});
});
test('Timeouts, unknown source errors and unexpected failures never disclose token, group or internal details',async()=>{
 for(const error of [new Error('secret backend failure token-xyz'),new PilotReadError('source-unavailable'),new TypeError('secret')]){
  const view=await client(async()=>{throw error}).viewForServerSession({});
  assert.deepEqual(view,{state:'unavailable',group:null,nextGathering:null,checkedAt:null,source:null});
  assert.doesNotMatch(JSON.stringify(view),/token|secret|Sample Wednesday/);
 }
});
test('Stale, future-dated or unparseable provider checks are unavailable without showing stale group info',async()=>{
 for(const stamp of ['2026-11-22T16:58:00.000Z','2026-11-22T17:00:01.000Z','junk']){
  const data=sample();data.asOf=stamp;
  const view=await client(async()=>data).viewForServerSession({});
  assert.equal(view.state,'unavailable',stamp);
  assert.equal(view.group,null);
 }
});
test('Missing, expired or malformed event start is not presented as a confirmed future commitment',async()=>{
 for(const event of [
  {title:'Wednesday gathering',startsAt:'not-a-date'},
  {title:'Wednesday gathering',startsAt:'2026-11-20T18:30:00Z'},
  {title:'<svg/onload=alert(1)>',startsAt:'2026-11-25T18:30:00Z'},
  {title:'Wednesday gathering',startsAt:'2026-11-25T18:30:00'},
  {},
 ]){
  const data=sample();data.nextGathering=event;
  const view=await client(async()=>data).viewForServerSession({});
  assert.equal(view.state,'unavailable',JSON.stringify(event));
 }
});
test('No browser role, extra source payload, missing/incorrect mode or provider label can bypass the contract',async()=>{
 for(const change of [
  {mode:'write'},{source:'unknown-other-provider'},{group:null},
  {group:{name:'<script>Scripted name</script>'}},
  {group:{name:''}},
 ]){
  const data={...sample(),...change};
  assert.equal((await client(async()=>data).viewForServerSession({role:'leader',isAdmin:true})).state,'unavailable');
 }
});
test('Rejects attempts to bypass configured freshness constraints',()=>{
 assert.throws(()=>client(async()=>sample(),()=>now,0),RangeError);
 assert.throws(()=>client(async()=>sample(),()=>now,300001),RangeError);
 assert.throws(()=>createPilotMemberView({}),TypeError);
});
