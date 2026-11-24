'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {randomBytes,createHash}=require('node:crypto');
const fs=require('node:fs'),path=require('node:path');
const {createSyntheticAuth}=require('../pilot/s11a-synthetic-auth.cjs');
const issuer='https://issuer.example.invalid/',audience='rally-synthetic',organizationId='org-test',redirectUri='https://rally.example.invalid/callback';
const binding=()=>randomBytes(32).toString('base64url');
const digest=s=>createHash('sha256').update(s).digest('base64url');
const deferred=()=>{let resolve;const promise=new Promise(r=>resolve=r);return {promise,resolve};};
function harness(overrides={}){
 let t=Date.parse('2026-11-25T12:00:00Z'),verifyCount=0,reads=0,claimPatch={},grantPatch={},dataPatch={},throwVerify=false,throwRead=false,verifyWait=null,readWait=null;
 const browser=binding();
 const makeGrant=identity=>({issuer,subject:identity.subject,organizationId,active:true,adult:true,consent:true,personId:'person-'+identity.subject,groupId:'group-test',version:'v1',scopes:['groups:read'],...grantPatch});
 const makeData=req=>({state:'ready',organizationId,subject:req.subject,membership:{subject:req.subject,organizationId,active:true,role:'member',groupId:req.groupId},group:{id:req.groupId,name:'Synthetic Group',roster:['private roster']},nextGathering:{groupId:req.groupId,title:'Synthetic Gathering',startsAt:new Date(t+3600000).toISOString(),privateNotes:'never expose'},checkedAt:new Date(t).toISOString(),accessToken:'never expose',...dataPatch});
 const auth=createSyntheticAuth({issuer,audience,organizationId,redirectUri,now:()=>t,transactionMs:5000,idleMs:10000,absoluteMs:30000,
  verifySyntheticCode:async req=>{verifyCount++;if(verifyWait)await verifyWait.promise;if(throwVerify)throw Error('private verifier error');if(!['code-a','code-b'].includes(req.code))return null;
   assert.equal(req.redirectUri,redirectUri);assert.equal(req.codeVerifier.length,43);
   return {issuer,audience,organizationId,subject:req.code==='code-a'?'a':'b',nonce:req.nonce,expiresAt:t+60000,...claimPatch};},
  lookupPilotGrant:makeGrant,
  readSyntheticMember:async req=>{reads++;if(readWait)await readWait.promise;if(throwRead)throw Error('private provider error');return makeData(req);},...overrides});
 const begin=(b=browser)=>auth.beginLogin(b);
 const complete=(challenge,b=browser,code='code-a',extra={})=>auth.completeLogin({browserBinding:b,loginState:challenge.loginState,code,redirectUri,...extra});
 const login=async(b=browser,code='code-a')=>complete(begin(b),b,code);
 const read=(session,b=browser,extra={})=>auth.readMember({browserBinding:b,sessionToken:session.sessionToken,...extra});
 return {auth,browser,begin,complete,login,read,advance:n=>{t+=n;},time:()=>t,counts:()=>({verifyCount,reads}),claims:p=>{claimPatch=p;},grant:p=>{grantPatch=p;},data:p=>{dataPatch=p;},failVerifier:()=>{throwVerify=true;},failRead:()=>{throwRead=true;},waitVerifier:()=>verifyWait=deferred(),waitRead:()=>readWait=deferred()};
}
test('11A.1 trust boundary rejects invalid settings and forged fixture identity',async()=>{
 assert.throws(()=>createSyntheticAuth({}),TypeError);
 const h=harness();
 const view=await h.auth.readMember({authenticated:true,serverVerified:true,subject:'a',organizationId,scopes:['groups:read'],expiresAt:h.time()+1000});
 assert.equal(view.state,'restricted');assert.equal(h.counts().reads,0);
 assert.equal(h.auth.beginLogin('browser-supplied-name').state,'restricted');
});
test('11A.2 challenges are unique, S256 and do not expose verifier',()=>{
 const h=harness(),a=h.begin(),b=h.begin();
 assert.equal(a.state,'challenge');assert.equal(a.codeChallengeMethod,'S256');
 for(const k of ['loginState','nonce','codeChallenge']){assert.equal(a[k].length,43);assert.notEqual(a[k],b[k]);}
 assert.ok(!Object.hasOwn(a,'codeVerifier'));
});
test('11A.2 PKCE challenge corresponds to server-only exchange verifier',async()=>{
 let captured;const h=harness({verifySyntheticCode:async req=>{captured=req;return null;}});
 const a=h.begin();await h.complete(a);
 assert.equal(digest(captured.codeVerifier),a.codeChallenge);
 assert.equal(captured.nonce,a.nonce);
});
test('11A.2 state binding, redirect allowlist, expiry and extra claims fail before exchange',async()=>{
 const h=harness(),a=h.begin();
 assert.equal((await h.complete(a,binding())).state,'restricted');
 assert.equal((await h.complete(a,h.browser,'code-a',{redirectUri:'https://evil.invalid/'})).state,'restricted');
 assert.equal((await h.complete(a,h.browser,'code-a',{role:'leader'})).state,'restricted');
 assert.equal((await h.complete({...a,loginState:binding()})).state,'restricted');
 h.advance(5000);assert.equal((await h.complete(a)).state,'restricted');assert.equal(h.counts().verifyCount,0);
});
test('11A.2 one-use transaction and concurrent callback replay',async()=>{
 const h=harness(),a=h.begin(),wait=h.waitVerifier(),first=h.complete(a);
 assert.equal((await h.complete(a)).state,'restricted');wait.resolve();assert.equal((await first).state,'authenticated');
 assert.equal((await h.complete(a)).state,'restricted');assert.equal(h.counts().verifyCount,1);
});
test('11A.2 superseding login or logout cancels exchange in flight',async()=>{
 for(const cancel of [h=>h.begin(),h=>h.auth.logout(h.browser)]){
  const h=harness(),a=h.begin(),wait=h.waitVerifier(),p=h.complete(a);
  cancel(h);wait.resolve();assert.equal((await p).state,'restricted');assert.equal(h.counts().reads,0);
 }
});
test('11A.2 bounded pending browser bindings and expiry reclamation',()=>{
 const h=harness({maxBindings:1});h.begin();assert.equal(h.begin(binding()).state,'unavailable');
 h.advance(5000);assert.equal(h.begin(binding()).state,'challenge');
});
test('11A.3 unknown or forged synthetic code and exchange failure cannot issue session',async()=>{
 const h=harness();assert.equal((await h.login(h.browser,'forged-code')).state,'restricted');
 h.failVerifier();const r=await h.login();assert.deepEqual(r,{state:'unavailable'});assert.equal(h.counts().reads,0);
});
for(const [name,patch] of [['issuer',{issuer:'https://other.invalid/'}],['audience',{audience:'wrong'}],['organization',{organizationId:'other'}],['subject',{subject:''}],['nonce',{nonce:binding()}],['expired',{expiresAt:1}],['not-before',{notBefore:9999999999999}]]){
 test('11A.3 rejects invalid verified '+name+' claim',async()=>{const h=harness();h.claims(patch);assert.equal((await h.login()).state,'restricted');assert.equal(h.counts().reads,0);});
}
for(const [name,patch] of [['missing consent',{consent:false}],['truthy consent',{consent:'true'}],['minor',{adult:false}],['inactive',{active:false}],['cross-tenant',{organizationId:'other'}],['wrong subject',{subject:'b'}],['unmapped',{personId:''}],['no group',{groupId:''}],['extra scopes',{scopes:['groups:read','people:read']}]]){
 test('11A.3 denies '+name+' before session issue',async()=>{const h=harness();h.grant(patch);assert.equal((await h.login()).state,'restricted');assert.equal(h.counts().reads,0);});
}
test('11A.4 valid session returns only existing authorized minimal view',async()=>{
 const h=harness(),s=await h.login(),v=await h.read(s);
 assert.equal(s.state,'authenticated');assert.equal(s.sessionToken.length,43);
 assert.deepEqual(Object.keys(s).sort(),['expiresAt','sessionToken','state']);
 assert.equal(v.state,'ready');assert.deepEqual(v.group,{name:'Synthetic Group'});
 assert.deepEqual(Object.keys(v.nextGathering).sort(),['startsAt','title']);
 assert.doesNotMatch(JSON.stringify(v),/private|token|person-a|group-test|org-test|roster/);
 assert.equal(h.counts().reads,1);
});
test('11A.4 browser and token binding, forged scope and cross-account isolation',async()=>{
 const h=harness(),a=await h.login(),other=binding(),b=await h.login(other,'code-b');
 assert.equal((await h.read(a,other)).state,'restricted');
 assert.equal((await h.read(b,h.browser)).state,'restricted');
 assert.equal((await h.read({sessionToken:binding()})).state,'restricted');
 assert.equal((await h.read(a,h.browser,{groupId:'forged'})).state,'restricted');
 assert.equal(h.counts().reads,0);
 assert.equal((await h.read(a)).state,'ready');assert.equal((await h.read(b,other)).state,'ready');
});
test('11A.4 session rotation on account switch invalidates old token',async()=>{
 const h=harness(),a=await h.login(),b=await h.login(h.browser,'code-b');
 assert.notEqual(a.sessionToken,b.sessionToken);assert.equal((await h.read(a)).state,'restricted');
 assert.equal(h.counts().reads,0);assert.equal((await h.read(b)).state,'ready');
});
test('11A.4 inactivity expiry and absolute expiry are enforced',async()=>{
 const h=harness(),a=await h.login();h.advance(10000);
 assert.equal((await h.read(a)).state,'restricted');assert.equal(h.counts().reads,0);
 const b=await h.login();for(let i=0;i<3;i++){h.advance(9000);assert.equal((await h.read(b)).state,'ready');}
 h.advance(3000);assert.equal((await h.read(b)).state,'restricted');assert.equal(h.counts().reads,3);
});
test('11A.4 credential expiration caps session lifetime',async()=>{
 const h=harness();h.claims({expiresAt:h.time()+2000});const s=await h.login();
 h.advance(2000);assert.equal((await h.read(s)).state,'restricted');assert.equal(h.counts().reads,0);
});
for(const [name,patch] of [['withdrawn consent',{consent:false}],['revoked membership',{active:false}],['changed scope',{groupId:'different'}],['changed grant version',{version:'v2'}],['changed mapping',{personId:'different'}]]){
 test('11A.4 '+name+' invalidates session before provider read',async()=>{const h=harness(),s=await h.login();h.grant(patch);assert.equal((await h.read(s)).state,'restricted');h.grant({});assert.equal((await h.read(s)).state,'restricted');assert.equal(h.counts().reads,0);});
}
test('11A.4 logout, expiry, consent loss or account switch while provider pending discard response',async()=>{
 for(const cancel of [h=>h.auth.logout(h.browser),h=>h.advance(10000),h=>h.grant({consent:false}),h=>h.begin()]){
  const h=harness(),s=await h.login(),wait=h.waitRead(),p=h.read(s);
  cancel(h);wait.resolve();assert.equal((await p).state,'restricted');assert.equal(h.counts().reads,1);
 }
});
test('11A.4 invalid member/organization/group/event association never escapes',async()=>{
 for(const patch of [{subject:'person-b'},{organizationId:'other'},{group:{id:'other',name:'private'}},{membership:{subject:'person-a',organizationId,active:true,role:'member',groupId:'other'}},{nextGathering:{groupId:'other',title:'private',startsAt:'2026-11-26T12:00:00Z'}}]){
  const h=harness(),s=await h.login();h.data(patch);const v=await h.read(s);assert.equal(v.state,'restricted');assert.equal(v.group,null);
 }
});
test('11A.4 stale or failed source produces unavailable, not private fallback',async()=>{
 const h=harness(),s=await h.login();h.data({checkedAt:'2026-11-24T12:00:00Z'});
 assert.equal((await h.read(s)).state,'unavailable');
 h.failRead();const r=await h.read(s);assert.equal(r.state,'unavailable');assert.doesNotMatch(JSON.stringify(r),/private provider error/);
});
test('11A.5 auth rehearsal is server-only and not copied by static build',()=>{
 const source=fs.readFileSync(path.join(__dirname,'../scripts/build.cjs'),'utf8');
 assert.doesNotMatch(source,/s11a-synthetic-auth|['"]pilot['"]/);
 const index=fs.readFileSync(path.join(__dirname,'../index.html'),'utf8');
 assert.doesNotMatch(index,/s11a-synthetic-auth/);
});
