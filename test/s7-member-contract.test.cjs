'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createMemberContract}=require('../pilot/s7-readonly-member-contract.cjs');
const now=new Date('2026-11-25T17:00:00Z');
const session=()=>({
 authenticated:true,serverVerified:true,subject:'synthetic-member-1',
 organizationId:'citizen-synthetic',scopes:['groups:read'],
 expiresAt:now.getTime()+30000,accessToken:'NOT FOR OUTPUT'
});
const record=()=>({
 state:'ready',organizationId:'citizen-synthetic',subject:'synthetic-member-1',
 membership:{subject:'synthetic-member-1',organizationId:'citizen-synthetic',active:true,role:'member'},
 group:{name:'Synthetic Wednesday Group',privateNotes:'Do not expose'},
 nextGathering:{title:'Sample gathering',startsAt:'2026-11-26T18:30:00-07:00',roster:['PRIVATE']},
 checkedAt:now.toISOString(),token:'SECRET-CANDIDATE',memberEmail:'private@example.com'
});
const create=(reader,age=60000)=>createMemberContract({
 readForVerifiedSession:reader,organizationId:'citizen-synthetic',sourceLabel:'Synthetic Church Groups',
 now:()=>now,maximumAgeMs:age
});
test('only minimal future event and group name escape the server-side projection',async()=>{
 let called=0;
 const f=create(async s=>{called++;assert.equal(s.subject,'synthetic-member-1');return record()});
 const view=await f.viewForVerifiedSession(session());
 assert.equal(called,1);
 assert.deepEqual(view,{
  state:'ready',source:'Synthetic Church Groups',checkedAt:now.toISOString(),
  group:{name:'Synthetic Wednesday Group'},
  nextGathering:{title:'Sample gathering',startsAt:'2026-11-26T18:30:00-07:00'}
 });
 assert.equal(Object.isFrozen(view),true);
 assert.equal(Object.isFrozen(view.group),true);
 assert.doesNotMatch(JSON.stringify(view),/SECRET|private|token|roster|email|accessToken/i);
});
test('missing, expired, wrong organization or missing server auth fails without provider call',async()=>{
 let requests=0;
 const contract=create(async()=>{requests++;return record()});
 for(const edits of [
  {authenticated:false},{serverVerified:false},{subject:null},
  {organizationId:'other-org'},{scopes:['groups:write']},
  {expiresAt:now.getTime()-1}
 ]){
  const view=await contract.viewForVerifiedSession({...session(),...edits});
  assert.deepEqual(view,{state:'restricted',source:null,checkedAt:null,group:null,nextGathering:null});
 }
 assert.equal(requests,0);
});
test('revoked or mismatched provider membership never returns cached group details',async()=>{
 for(const edit of [
  {membership:{...record().membership,active:false}},
  {subject:'someone-else'},
  {organizationId:'other-org'},
  {membership:{...record().membership,subject:'someone-else'}},
  {membership:{...record().membership,organizationId:'other-org'}},
  {membership:null},
  {state:'restricted'}
 ]){
  const view=await create(async()=>({...record(),...edit})).viewForVerifiedSession(session());
  assert.equal(view.state,'restricted',JSON.stringify(edit));
  assert.equal(view.group,null);
 }
});
test('stale or future provider data and invalid event cannot be mistaken for an upcoming gathering',async()=>{
 for(const edit of [
  {checkedAt:'2026-11-25T16:58:00Z'},
  {checkedAt:'2026-11-25T17:00:01Z'},
  {checkedAt:'2026-11-25T17:00:00'},
  {nextGathering:{title:'bad',startsAt:'2026-11-20T15:00:00Z'}},
  {nextGathering:{title:'<script>x</script>',startsAt:'2026-11-26T18:30:00Z'}},
  {nextGathering:{title:'bad',startsAt:'not-a-time'}},
  {group:{name:'<img src=x>'}}
 ]){
  const view=await create(async()=>({...record(),...edit})).viewForVerifiedSession(session());
  assert.equal(view.state,'unavailable',JSON.stringify(edit));
  assert.equal(view.group,null);
  assert.equal(view.nextGathering,null);
 }
 const noEvent=await create(async()=>({...record(),nextGathering:null})).viewForVerifiedSession(session());
 assert.equal(noEvent.state,'ready');
 assert.equal(noEvent.nextGathering,null,'do not invent a weekly recurring meeting');
});
test('provider outages and authorization errors disclose no secrets',async()=>{
 for(const error of [new Error('SECRET provider token'),Object.assign(new Error('forbidden'),{code:'access-denied'}),Object.assign(new Error('revoked'),{code:'not-a-member'})]){
  const view=await create(async()=>{throw error}).viewForVerifiedSession(session());
  assert.ok(['restricted','unavailable'].includes(view.state));
  assert.equal(view.group,null);
  assert.equal(view.source,null);
  assert.doesNotMatch(JSON.stringify(view),/SECRET|forbidden|token|revoked/);
 }
});
test('contract is backend-only and freshness bounds are enforced',()=>{
 assert.throws(()=>createMemberContract({readForVerifiedSession:null}),TypeError);
 assert.throws(()=>create(async()=>record(),0),RangeError);
 assert.throws(()=>create(async()=>record(),300001),RangeError);
 const fs=require('node:fs');
 const index=fs.readFileSync(require('node:path').join(__dirname,'..','index.html'),'utf8');
 const build=fs.readFileSync(require('node:path').join(__dirname,'..','scripts/build.cjs'),'utf8');
 assert.doesNotMatch(index,/s7-readonly-member-contract/);
 assert.doesNotMatch(build,/s7-readonly-member-contract/);
 const code=fs.readFileSync(require('node:path').join(__dirname,'..','pilot','s7-readonly-member-contract.cjs'),'utf8');
 assert.doesNotMatch(code,/fetch\s*\(|localStorage|sessionStorage|setItem|authorizationHeader/);
});
