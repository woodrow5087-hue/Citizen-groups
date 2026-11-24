'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {randomBytes}=require('node:crypto');
const fs=require('node:fs');
const {createSyntheticPlanningCenter}=require('../pilot/s11b-synthetic-planning-center.cjs');
const {createSyntheticAuth}=require('../pilot/s11a-synthetic-auth.cjs');
const organizationId='org-test',subject='person-a',groupId='group-a',issuer='https://issuer.example.invalid/',audience='rally-synthetic',redirectUri='https://rally.example.invalid/callback';
const root='/groups/v2/groups/'+groupId,origin='https://api.planningcenteronline.com';
const eventPath=n=>root+'/events?filter=not_canceled&per_page=25&offset='+n;
const link=(type,id)=>({data:{type,id}});
const stamp='2026-11-25T12:00:00.000Z',start='2026-11-26T12:00:00Z';
const event=(id,starts_at=start,extra={})=>({type:'Event',id,attributes:{name:'Gathering '+id,starts_at,canceled:false,canceled_at:null,description:'PRIVATE_EVENT',...extra},relationships:{group:link('Group',groupId),location:link('Location','PRIVATE_LOCATION')}});
function harness(options={}){
 let t=Date.parse(stamp),calls=[],membershipCount=0,mutate=(r)=>r,grant={};
 const membership={type:'Membership',id:'membership-a',attributes:{joined_at:'2025-01-01T00:00:00Z',role:'member',notes:'PRIVATE_NOTE'},relationships:{person:link('Person',subject),group:link('Group',groupId)}};
 const group={type:'Group',id:groupId,attributes:{name:'Synthetic Group',contact_email:'PRIVATE_EMAIL',archived:false}};
 const events={data:[event('later','2026-11-27T12:00:00Z'),event('next')],links:{next:null},included:[{secret:'PRIVATE_INCLUDED'}]};
 const transport=async req=>{
  calls.push(req);let body;
  if(req.path===root+'/my_membership'){membershipCount++;body={data:structuredClone(membership)};}
  else if(req.path===root)body={data:structuredClone(group)};
  else if(req.path.startsWith(root+'/events?'))body=structuredClone(events);
  else throw Error('Unexpected path');
  return mutate({status:200,organizationId,subject,observedAt:new Date(t).toISOString(),body},req,membershipCount);
 };
 const provider=createSyntheticPlanningCenter({organizationId,transport,now:()=>t,...options});
 const auth=createSyntheticAuth({issuer,audience,organizationId,redirectUri,now:()=>t,
  verifySyntheticCode:async r=>r.code==='synthetic-code'?{issuer,audience,organizationId,subject:'a',nonce:r.nonce,expiresAt:t+3600000}:null,
  lookupPilotGrant:identity=>({issuer,subject:identity.subject,organizationId,personId:subject,groupId,active:true,adult:true,consent:true,version:'v1',scopes:['groups:read'],...grant}),
  readSyntheticMember:provider.readSyntheticMember});
 const binding=randomBytes(32).toString('base64url');
 async function login(){const challenge=auth.beginLogin(binding);return auth.completeLogin({browserBinding:binding,loginState:challenge.loginState,code:'synthetic-code',redirectUri});}
 const read=()=>provider.readSyntheticMember({organizationId,subject,groupId});
 return {provider,auth,binding,login,read,sessionRead:s=>auth.readMember({browserBinding:binding,sessionToken:s.sessionToken}),calls,change:f=>{mutate=f;},grant:p=>{grant=p;},advance:n=>{t+=n;}};
}
test('11B.1 invalid scope and path injection make zero transport calls',async()=>{
 const h=harness();
 for(const patch of [{organizationId:'other'},{subject:''},{groupId:'../people'},{groupId:'a%2Fb'},{groupId:'a?x=1'},{method:'POST'},{url:origin}]){
  assert.equal((await h.provider.readSyntheticMember({organizationId,subject,groupId,...patch})).state,'restricted');
 }
 assert.equal(h.calls.length,0);assert.throws(()=>createSyntheticPlanningCenter({}),TypeError);
});
test('11B.2 documented read-only routes are fixed, scoped and ordered',async()=>{
 const h=harness(),r=await h.read();
 assert.equal(r.state,'ready');
 assert.deepEqual(h.calls.map(x=>x.path),[root+'/my_membership',root,eventPath(0),root+'/my_membership']);
 for(const call of h.calls){assert.equal(call.method,'GET');assert.equal(call.origin,origin);assert.equal(call.apiVersion,'2023-07-10');assert.equal(call.organizationId,organizationId);assert.equal(call.subject,subject);assert.ok(!Object.hasOwn(call,'body'));assert.ok(!Object.hasOwn(call,'token'));}
 assert.equal(r.nextGathering.title,'Gathering next');assert.equal(r.checkedAt,stamp);
 assert.doesNotMatch(JSON.stringify(r),/PRIVATE_/);
});
test('11B.3 canceled and past gatherings are excluded; confirmed empty is distinct from unavailable',async()=>{
 const h=harness();h.change((r,req)=>{if(req.path===eventPath(0))r.body.data=[event('past','2026-11-24T12:00:00Z'),event('canceled',start,{canceled:true,canceled_at:'2026-11-24T12:00:00Z'})];return r;});
 const r=await h.read();assert.equal(r.state,'ready');assert.equal(r.nextGathering,null);
});
test('11B.3 earliest across complete pages and deterministic tie break',async()=>{
 const h=harness();h.change((r,req)=>{
  if(req.path===eventPath(0))r.body={data:Array.from({length:25},(_,i)=>event('late-'+i,'2026-11-27T12:00:00Z')),links:{next:origin+eventPath(25)}};
  if(req.path===eventPath(25))r.body={data:[event('z'),event('a')],links:{next:null}};
  return r;});
 const r=await h.read();assert.equal(r.state,'ready');assert.equal(r.nextGathering.title,'Gathering a');assert.equal(h.calls.length,5);
});
for(const [name,next] of [['external host','https://evil.invalid'+eventPath(25)],['other group',origin+eventPath(25).replace(groupId,'group-b')],['loop',origin+eventPath(0)],['extra query',origin+eventPath(25)+'&include=people'],['skip',origin+eventPath(50)],['write path',origin+root+'/enable_chat']]){
 test('11B.3 rejects '+name+' pagination without following link',async()=>{
  const h=harness();h.change((r,req)=>{if(req.path===eventPath(0))r.body={data:Array.from({length:25},(_,i)=>event('e-'+i)),links:{next}};return r;});
  assert.equal((await h.read()).state,'unavailable');assert.equal(h.calls.length,3);
 });
}
test('11B.3 bounded pages, short page with next, duplicates and missing completion are unavailable',async()=>{
 for(const variant of ['bound','short','duplicate','missing']){
  const h=harness({maxPages:1});h.change((r,req)=>{if(req.path===eventPath(0)){
   if(variant==='bound')r.body={data:Array.from({length:25},(_,i)=>event('e-'+i)),links:{next:origin+eventPath(25)}};
   if(variant==='short')r.body={data:[event('e')],links:{next:origin+eventPath(25)}};
   if(variant==='duplicate')r.body={data:[event('e'),event('e')],links:{next:null}};
   if(variant==='missing')delete r.body.links.next;
  }return r;});assert.equal((await h.read()).state,'unavailable',variant);
 }
});
for(const [name,patch,expected] of [
 ['other tenant',r=>{r.organizationId='other';},'restricted'],
 ['other subject',r=>{r.subject='other';},'restricted'],
 ['missing membership',r=>{r.body.data=null;},'restricted'],
 ['wrong person',r=>{r.body.data.relationships.person=link('Person','other');},'restricted'],
 ['wrong group',r=>{r.body.data.relationships.group=link('Group','other');},'restricted'],
 ['wrong role',r=>{r.body.data.attributes.role='administrator';},'restricted'],
 ['malformed membership',r=>{r.body.data={};},'unavailable'],
 ['stale',r=>{r.observedAt='2026-11-24T12:00:00Z';},'unavailable'],
 ['future',r=>{r.observedAt='2026-11-26T12:00:00Z';},'unavailable'],
 ['missing observation',r=>{delete r.observedAt;},'unavailable']
]){
 test('11B.4 '+name+' fails before group or event retrieval',async()=>{
  const h=harness();h.change(r=>{patch(r);return r;});assert.equal((await h.read()).state,expected);assert.equal(h.calls.length,1);
 });
}
for(const [name,path,patch,expected] of [
 ['other group record',root,r=>{r.body.data.id='other';},'restricted'],
 ['archived group',root,r=>{r.body.data.attributes.archived=true;},'restricted'],
 ['invalid group name',root,r=>{r.body.data.attributes.name='<script>';},'unavailable'],
 ['cross-group event',eventPath(0),r=>{r.body.data[0].relationships.group=link('Group','other');},'restricted'],
 ['malformed event date',eventPath(0),r=>{r.body.data[0].attributes.starts_at='2026-02-30T12:00:00Z';},'unavailable'],
 ['ambiguous cancellation',eventPath(0),r=>{delete r.body.data[0].attributes.canceled;},'unavailable'],
 ['inconsistent cancellation',eventPath(0),r=>{r.body.data[0].attributes.canceled=true;},'unavailable'],
 ['invalid event title',eventPath(0),r=>{r.body.data[0].attributes.name='<script>';},'unavailable']
]){
 test('11B.4 '+name+' does not produce member view',async()=>{
  const h=harness();h.change((r,req)=>{if(req.path===path)patch(r);return r;});
  assert.deepEqual(await h.read(),{state:expected});
 });
}
test('11B.4 revalidates membership after event retrieval, including changed role and revoked membership',async()=>{
 for(const variant of ['revoked','role','id']){
  const h=harness();h.change((r,req,count)=>{if(req.path===root+'/my_membership'&&count===2){
   if(variant==='revoked')r.body.data=null;
   else if(variant==='role')r.body.data.attributes.role='leader';
   else r.body.data.id='other';
  }return r;});assert.equal((await h.read()).state,'restricted');assert.equal(h.calls.length,4);
 }
});
test('11B.4 age of oldest observation, not end of request, controls freshness',async()=>{
 const h=harness();h.change((r,req)=>{if(req.path===root)h.advance(60001);return r;});
 assert.equal((await h.read()).state,'unavailable');
 const ok=harness();ok.change((r,req)=>{if(req.path===root+'/my_membership')ok.advance(1000);return r;});
 const r=await ok.read();assert.equal(r.state,'ready');assert.equal(r.checkedAt,stamp);
});
for(const [status,state] of [[401,'restricted'],[403,'restricted'],[404,'restricted'],[429,'unavailable'],[500,'unavailable'],[302,'unavailable']]){
 test('11B.4 HTTP '+status+' denies or returns unavailable without retry',async()=>{
  const h=harness();h.change(r=>({...r,status}));assert.deepEqual(await h.read(),{state});assert.equal(h.calls.length,1);
 });
}
test('11B.4 exception, oversized response and timeout fail closed',async()=>{
 const h=harness();h.change(()=>{throw Error('PRIVATE_TRANSPORT_FAILURE');});assert.deepEqual(await h.read(),{state:'unavailable'});
 const large=harness({maxBytes:1024});large.change(r=>{r.body.extra='x'.repeat(2048);return r;});assert.equal((await large.read()).state,'unavailable');
 let signal;const stalled=harness({timeoutMs:5,transport:req=>{signal=req.signal;return new Promise(()=>{});}});
 assert.equal((await stalled.read()).state,'unavailable');assert.equal(signal.aborted,true);
});
test('11B.5 actual synthetic auth to adapter to minimal contract, no browser claim escalation',async()=>{
 const h=harness();assert.equal((await h.sessionRead({sessionToken:'forged'})).state,'restricted');assert.equal(h.calls.length,0);
 const s=await h.login();assert.equal(s.state,'authenticated');
 const v=await h.sessionRead(s);assert.deepEqual(v,{state:'ready',source:'synthetic-verified-member',checkedAt:stamp,group:{name:'Synthetic Group'},nextGathering:{title:'Gathering next',startsAt:'2026-11-26T12:00:00.000Z'}});
 assert.doesNotMatch(JSON.stringify(v),/PRIVATE_|org-test|person-a|group-a|membership-a|sessionToken/);
 assert.equal(h.calls.length,4);
 h.grant({consent:false});assert.equal((await h.sessionRead(s)).state,'restricted');assert.equal(h.calls.length,4);
});
test('11B.5 logout or consent revocation during provider read suppresses late result',async()=>{
 for(const revoke of [h=>h.auth.logout(h.binding),h=>h.grant({consent:false})]){
  const h=harness(),s=await h.login();let resume,entered;const gate=new Promise(r=>resume=r),started=new Promise(r=>entered=r);
  h.change(async(r,req)=>{if(req.path===root){entered();await gate;}return r;});
  const pending=h.sessionRead(s);await started;revoke(h);resume();assert.equal((await pending).state,'restricted');
 }
});
test('11B.5 provider source failure after earlier success never falls back to cached private view',async()=>{
 const h=harness(),s=await h.login();assert.equal((await h.sessionRead(s)).state,'ready');
 h.change(r=>({...r,status:429}));const v=await h.sessionRead(s);assert.equal(v.state,'unavailable');assert.equal(v.group,null);assert.equal(v.nextGathering,null);
});
test('11B.5 integration remains server-only; no static runtime import or live transport',()=>{
 const build=fs.readFileSync(require.resolve('../scripts/build.cjs'),'utf8'),index=fs.readFileSync(require.resolve('../index.html'),'utf8'),adapter=fs.readFileSync(require.resolve('../pilot/s11b-synthetic-planning-center.cjs'),'utf8');
 assert.doesNotMatch(build,/s11b-synthetic-planning-center|['"]pilot['"]/);
 assert.doesNotMatch(index,/s11b-synthetic-planning-center/);
 assert.doesNotMatch(adapter,/\bfetch\s*\(|https\.request\s*\(|process\.env/);
});
