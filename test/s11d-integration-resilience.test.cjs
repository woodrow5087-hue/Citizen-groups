'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{randomBytes}=require('node:crypto');
const {createResilientTransport}=require('../pilot/s11d-resilient-transport.cjs');
const {createSyntheticPrivacyPilot,POLICY}=require('../pilot/s11c-synthetic-privacy.cjs');
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
const issuer='https://issuer.example.invalid/',audience='synthetic',organizationId='org-test',redirectUri='https://rally.example.invalid/callback';
const binding=()=>randomBytes(32).toString('base64url');
const id=subject=>({issuer,subject,organizationId});
const rel=(type,id)=>({data:{type,id}});
function harness(opts={}){
 let now=Date.parse('2026-11-25T12:00:00Z'),calls=[],behavior=(req,result)=>result;
 const pilot=createSyntheticPrivacyPilot({issuer,audience,organizationId,redirectUri,now:()=>now,
 lookupApprovedMapping:i=>({...i,active:true,adult:true,personId:'person-'+i.subject,groupId:'group-'+i.subject,version:'v1',scopes:['groups:read']}),
 verifySyntheticCode:async r=>({issuer,audience,organizationId,subject:r.code,nonce:r.nonce,expiresAt:now+3600000}),
 transport:async req=>{
  calls.push(req);const subject=req.subject,groupId='group-'+subject.slice(7),root='/groups/v2/groups/'+groupId;
  let body;
  if(req.path===root+'/my_membership')body={data:{type:'Membership',id:'membership-'+subject,attributes:{role:'member',joined_at:'2025-01-01T00:00:00Z'},relationships:{person:rel('Person',subject),group:rel('Group',groupId)}}};
  else if(req.path===root)body={data:{type:'Group',id:groupId,attributes:{name:'Group '+subject,secret:'PRIVATE'}}};
  else body={data:[{type:'Event',id:'event-'+subject,attributes:{name:'Gathering '+subject,starts_at:'2026-11-26T12:00:00Z',canceled:false,canceled_at:null},relationships:{group:rel('Group',groupId)}}],links:{next:null}};
  return behavior(req,{status:200,organizationId,subject,observedAt:new Date(now).toISOString(),body});
 },resilienceOptions:{baseDelayMs:1,maxRetryAfterMs:10},...opts});
 const {member,administration:admin}=pilot;
 const grant=s=>admin.grantConsent({identity:id(s),purpose:POLICY.purpose,noticeVersion:POLICY.noticeVersion,decision:'explicit-opt-in'});
 async function login(s='a',b=binding()){const c=member.beginLogin(b);return {b,s:await member.completeLogin({browserBinding:b,loginState:c.loginState,code:s,redirectUri})};}
 const read=x=>member.readMember({browserBinding:x.b,sessionToken:x.s.sessionToken});
 return {member,admin,grant,login,read,calls,behavior:f=>{behavior=f;},advance:n=>{now+=n;}};
}
test('11D.1 outage returns unavailable without cached member payload, recovery fresh read',async()=>{
 const h=harness();h.grant('a');const s=await h.login();assert.equal((await h.read(s)).state,'ready');
 h.behavior(()=>({status:503}));const v=await h.read(s);assert.equal(v.state,'unavailable');assert.equal(v.group,null);
 h.behavior((q,r)=>r);assert.equal((await h.read(s)).state,'ready');
});
test('11D.2 explicit transient GET status retries bounded, never repeats permission errors',async()=>{
 for(const status of [502,503,504,429,401,403,404,500]){
  let count=0;
  const guard=createResilientTransport({baseDelayMs:1,transport:async()=>++count===1?{status,retryAfterMs:1}:{status:200}});
  const r=await guard.request({method:'GET'});
  assert.equal(count,[502,503,504,429].includes(status)?2:1);
  assert.equal(r.status,count===2?200:status);
 }
});
test('11D.2 429 without valid bounded hint, exception and writes are not retried',async()=>{
 for(const hint of [undefined,-1,99999,'1']){
  let n=0;const g=createResilientTransport({transport:async()=>{n++;return {status:429,retryAfterMs:hint};}});
  assert.equal((await g.request({method:'GET'})).status,429);assert.equal(n,1);
  await g.request({method:'POST'});assert.equal(n,1);
 }
 let n=0;const g=createResilientTransport({transport:async()=>{n++;throw Error('private');}});
 assert.equal((await g.request({method:'GET'})).status,503);assert.equal(n,1);
});
test('11D.2 abort during retry wait prevents another transport invocation',async()=>{
 const controller=new AbortController();let n=0;
 const guard=createResilientTransport({baseDelayMs:100,transport:async()=>{n++;return {status:503};}});
 const p=guard.request({method:'GET',signal:controller.signal});await Promise.resolve();controller.abort();
 assert.equal((await p).status,503);assert.equal(n,1);
});
test('11D.2 overall read deadline aborts and returns unavailable, late result cannot escape',async()=>{
 const h=harness({authOptions:{readDeadlineMs:20},providerOptions:{timeoutMs:1000}});
 h.grant('a');const s=await h.login(),gate=deferred(),entered=deferred();
 h.behavior((req,r)=>{entered.resolve(req.signal);return gate.promise.then(()=>r);});
 const p=h.read(s),signal=await entered.promise;
 assert.equal((await p).state,'unavailable');assert.equal(signal.aborted,true);
 gate.resolve();await Promise.resolve();assert.equal(h.calls.length,1);
});
test('11D.2 verifier deadline consumes challenge and does not issue late session',async()=>{
 const gate=deferred(),h=harness({authOptions:{verifyDeadlineMs:10},verifySyntheticCode:()=>gate.promise});
 h.grant('a');const s=await h.login();assert.equal(s.s.state,'unavailable');gate.resolve(null);assert.equal(h.calls.length,0);
});
test('11D.3 logout, withdrawal, account switch and shutdown abort current transport, no later calls',async()=>{
 for(const cancel of [h=>h.admin.withdrawConsent(id('a')),(h,s)=>h.member.logout(s.b),(h,s)=>h.member.beginLogin(s.b),h=>h.admin.setPilotEnabled(false)]){
  const h=harness();h.grant('a');const s=await h.login(),gate=deferred(),entered=deferred();
  h.behavior((q,r)=>{entered.resolve(q.signal);return gate.promise.then(()=>r);});
  const p=h.read(s),signal=await entered.promise;cancel(h,s);
  const result=await p;assert.equal(result.state,'restricted');assert.equal(result.group,null);assert.equal(signal.aborted,true);
  gate.resolve();await Promise.resolve();assert.equal(h.calls.length,1);
 }
});
test('11D.3 concurrent sessions never share payload or cache; per-session bound rejects overload',async()=>{
 const h=harness({authOptions:{maxReadsPerSession:1}});h.grant('a');h.grant('b');
 const a=await h.login('a'),b=await h.login('b'),gate=deferred(),entered=deferred();
 h.behavior((q,r)=>{if(q.subject==='person-a'){entered.resolve();return gate.promise.then(()=>r);}return r;});
 const pending=h.read(a);await entered.promise;
 assert.equal((await h.read(a)).state,'unavailable');
 const bv=await h.read(b);assert.equal(bv.group.name,'Group person-b');gate.resolve();
 const av=await pending;assert.equal(av.group.name,'Group person-a');
});
test('11D.4 physical concurrency counts unresolved noncooperative transport even after abort',async()=>{
 const gate=deferred(),controller=new AbortController();let n=0;
 const g=createResilientTransport({maxConcurrent:1,transport:async()=>{n++;await gate.promise;return {status:200};}});
 const p=g.request({method:'GET',signal:controller.signal});controller.abort();
 assert.equal((await g.request({method:'GET'})).status,503);assert.equal(n,1);
 gate.resolve();assert.equal((await p).status,503);assert.equal((await g.request({method:'GET'})).status,200);
});
test('11D.4 bounded fixed-window request quota includes retries, recovers next window and rejects clock rollback',async()=>{
 let t=1000,n=0;const g=createResilientTransport({now:()=>t,maxPerWindow:2,windowMs:100,baseDelayMs:1,transport:async()=>{n++;return {status:503};}});
 assert.equal((await g.request({method:'GET'})).status,503);assert.equal(n,2);
 await g.request({method:'GET'});assert.equal(n,2);
 t=999;await g.request({method:'GET'});assert.equal(n,2);
 t=1100;await g.request({method:'GET'});assert.equal(n,4);
});
test('11D.5 partial retrieval outage never becomes confirmed empty calendar',async()=>{
 const h=harness();h.grant('a');const s=await h.login();
 h.behavior((q,r)=>q.path.includes('/events?')?{status:503}:r);
 const v=await h.read(s);assert.equal(v.state,'unavailable');assert.equal(v.nextGathering,null);assert.equal(v.group,null);
 assert.equal(h.calls.length,4); // membership, group, event and one event retry
});
test('11D.5 shutdown cancels pending login even without consent records',async()=>{
 const gate=deferred(),h=harness({verifySyntheticCode:()=>gate.promise});
 const p=h.login();h.admin.setPilotEnabled(false);h.admin.setPilotEnabled(true);h.grant('a');gate.resolve(null);
 assert.equal((await p).s.state,'restricted');
});
test('11D.6 mixed adversarial read stress with no cross-account leakage or unauthorized calls',async()=>{
 const h=harness({resilienceOptions:{maxConcurrent:4,maxPerWindow:120,baseDelayMs:1}});
 for(const s of ['a','b','c','d'])h.grant(s);
 const sessions=await Promise.all(['a','b','c','d'].map(s=>h.login(s)));
 const revoked=sessions.pop();h.admin.withdrawConsent(id('d'));
 const denied=await h.read(revoked);assert.equal(denied.state,'restricted');assert.equal(h.calls.length,0);
 const results=await Promise.all(sessions.map(h.read));
 for(let i=0;i<results.length;i++){assert.equal(results[i].state,'ready');assert.equal(results[i].group.name,'Group person-'+['a','b','c'][i]);assert.doesNotMatch(JSON.stringify(results[i]),/PRIVATE|sessionToken/);}
 assert.equal(h.calls.length,12);assert.ok(h.calls.every(q=>q.method==='GET'&&q.subject!=='person-d'));
});
