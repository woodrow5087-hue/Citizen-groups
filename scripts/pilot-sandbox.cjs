#!/usr/bin/env node
'use strict';
/*
 * Pilot 1.1 / synthetic-only smoke harness.
 * No environment variables, provider credentials, network, browser storage
 * or actual member information. Output intentionally avoids account IDs.
 */
const assert=require('node:assert/strict');
const {createReadOnlyGroupClient}=require('../pilot/planning-center-readonly-groups.cjs');
const {createPilotMemberView}=require('../pilot/member-view.cjs');
const clock=new Date('2026-11-22T17:00:00.000Z');
function reply(data,status=200){
 return {status,headers:{get:()=>null},text:async()=>JSON.stringify(data)};
}
const session=()=>({
 authenticated:true,organizationId:'111',subject:'333',
 accessToken:'SYNTHETIC_TOKEN_MUST_NOT_PRINT',scopes:['groups','openid'],
 expiresAt:Date.now()+60_000
});
function fakeFetch(scenario){
 return async (url,opts)=>{
  if(opts.method!=='GET'||!opts.headers['User-Agent'])throw new Error('unsafe request');
  const path=new URL(url).pathname;
  if(scenario==='unavailable'&&path.endsWith('/events'))return reply({errors:[]},503);
  if(path==='/oauth/userinfo')return reply({sub:'333',organization_id:111});
  if(path.endsWith('/my_membership')){
   if(scenario==='revoked')return reply({data:null},404);
   return reply({data:{id:'1',type:'Membership',attributes:{role:'member'},
    relationships:{group:{data:{type:'Group',id:'222'}}}}});
  }
  if(path==='/groups/v2/groups/222')return reply({data:{id:'222',type:'Group',attributes:{
   name:'Sample Wednesday Group',notes:'Private synthetic notes, must not print'
  }}});
  if(path==='/groups/v2/groups/222/events')return reply({data:scenario==='no-event'?[]:[
   {id:'1',type:'Event',attributes:{name:'Sample group gathering',
    starts_at:'2026-11-25T18:30:00-07:00'},relationships:{group:{data:{id:'222'}}}}
  ]});
  throw new Error('Unexpected fake path');
 };
}
async function simulate(scenario){
 const adapter=createReadOnlyGroupClient({fetchImpl:fakeFetch(scenario),
  organizationId:'111',groupId:'222',now:()=>clock});
 const view=createPilotMemberView({readForServerSession:adapter.readForServerSession,now:()=>clock});
 const s=session();
 if(scenario==='expired')s.expiresAt=Date.now()-1000;
 if(scenario==='wrong-organization')s.organizationId='999';
 const result=await view.viewForServerSession(s);
 // Validate the projection is entirely non-sensitive before printing.
 const serialized=JSON.stringify(result);
 assert.doesNotMatch(serialized,/SYNTHETIC_TOKEN|Private synthetic|roster|email|person_id/);
 assert.ok(['ready','restricted','unavailable'].includes(result.state));
 return {scenario,status:result.state,group:result.group,
  nextGathering:result.nextGathering,source:result.source};
}
async function run(){
 const scenarios=['member','no-event','revoked','expired','wrong-organization','unavailable'];
 const records=[];
 for(const scenario of scenarios)records.push(await simulate(scenario));
 assert.deepEqual(records.map(r=>r.status),
  ['ready','ready','restricted','restricted','restricted','unavailable']);
 process.stdout.write('Rally Point Pilot 1.1 — SYNTHETIC ONLY (no connected accounts)\n');
 for(const record of records)process.stdout.write(JSON.stringify(record)+'\n');
}
if(require.main===module)run().catch(()=>{console.error('Synthetic pilot verification failed');process.exitCode=1});
module.exports={simulate};
