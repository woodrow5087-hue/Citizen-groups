'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{randomBytes}=require('node:crypto');
const fs=require('node:fs');
const {POLICY,permits,createSyntheticPrivacyPilot}=require('../pilot/s11c-synthetic-privacy.cjs');
const issuer='https://issuer.example.invalid/',audience='synthetic-pilot',organizationId='org-test',redirectUri='https://rally.example.invalid/callback';
const identity=subject=>({issuer,subject,organizationId});
const binding=()=>randomBytes(32).toString('base64url');
const groupId='group-test',personId='person-test',root='/groups/v2/groups/'+groupId;
const relation=(type,id)=>({data:{type,id}});
function harness(options={}){
 let t=Date.parse('2026-11-25T12:00:00.000Z'),reads=0,patch={},wait=null,verifyWait=null;
 const b=binding(),i=identity('subject-test'),other=identity('subject-other');
 const pilot=createSyntheticPrivacyPilot({issuer,audience,organizationId,redirectUri,now:()=>t,
  lookupApprovedMapping:x=>({...x,active:true,adult:true,personId,groupId,version:'v1',scopes:['groups:read'],...patch}),
  verifySyntheticCode:async r=>{if(verifyWait)await verifyWait;return {issuer,audience,organizationId,subject:r.code,nonce:r.nonce,expiresAt:t+3600000};},
  transport:async r=>{reads++;if(wait)await wait;let body;
   if(r.path===root+'/my_membership')body={data:{type:'Membership',id:'membership-test',attributes:{role:'member',joined_at:'2025-01-01T00:00:00Z',private:'PRIVATE_PRAYER'},relationships:{person:relation('Person',personId),group:relation('Group',groupId)}}};
   else if(r.path===root)body={data:{type:'Group',id:groupId,attributes:{name:'Synthetic Group',private:'PRIVATE_ROSTER'}}};
   else body={data:[{type:'Event',id:'event-test',attributes:{name:'Synthetic Gathering',starts_at:'2026-11-26T12:00:00Z',canceled:false,canceled_at:null,private:'PRIVATE_MESSAGE'},relationships:{group:relation('Group',groupId)}}],links:{next:null}};
   return {status:200,organizationId,subject:personId,observedAt:new Date(t).toISOString(),body};
  },...options});
 const {member,administration:admin}=pilot;
 const grant=(who=i,extra={})=>admin.grantConsent({identity:who,purpose:POLICY.purpose,noticeVersion:POLICY.noticeVersion,decision:'explicit-opt-in',...extra});
 const login=async(who=i,bb=b)=>{const c=member.beginLogin(bb);return c.state==='challenge'?member.completeLogin({browserBinding:bb,loginState:c.loginState,code:who.subject,redirectUri}):c;};
 const read=(s,bb=b)=>member.readMember({browserBinding:bb,sessionToken:s.sessionToken});
 return {member,admin,i,other,b,grant,login,read,reads:()=>reads,advance:n=>{t+=n;},patch:x=>{patch=x;},pauseRead:()=>{let release;wait=new Promise(r=>release=r);return release;},pauseVerify:()=>{let release;verifyWait=new Promise(r=>release=r);return release;}};
}
test('11C.1 only three own-member fields for exact purpose, no AI or pastoral use',()=>{
 for(const field of POLICY.permittedFields)assert.equal(permits({purpose:POLICY.purpose,field,destination:'own-member-view'}),true);
 for(const purpose of POLICY.prohibitedPurposes)assert.equal(permits({purpose,field:'group.name',destination:'own-member-view'}),false);
 for(const field of POLICY.prohibitedCategories)assert.equal(permits({purpose:POLICY.purpose,field,destination:'own-member-view'}),false);
 assert.equal(permits({purpose:POLICY.purpose,field:'group.name',destination:'leader-dashboard'}),false);
 assert.ok(Object.isFrozen(POLICY.permittedFields));
});
test('11C.2 no consent defaults to deny; browser surface has no administrative capabilities',async()=>{
 const h=harness();assert.deepEqual(Object.keys(h.member).sort(),['beginLogin','completeLogin','logout','readMember']);
 assert.equal((await h.login()).state,'restricted');assert.equal(h.reads(),0);
 assert.equal(h.admin.retentionSummary().consentRecords,0);
});
for(const [name,extra] of [['wrong purpose',{purpose:'pastoral-profiling'}],['old notice',{noticeVersion:'v0'}],['implicit consent',{decision:true}],['extra fields',{prayer:'PRIVATE'}],['foreign identity',{identity:{...identity('subject-test'),organizationId:'other'}}]]){
 test('11C.2 refuses '+name,async()=>{const h=harness();assert.equal(h.grant(h.i,extra).state,'restricted');assert.equal((await h.login()).state,'restricted');assert.equal(h.reads(),0);});
}
for(const [name,patch] of [['minor',{adult:false}],['unverified age',{adult:null}],['revoked mapping',{active:false}],['wrong tenant',{organizationId:'other'}],['wrong subject',{subject:'other'}],['extra scopes',{scopes:['groups:read','people:read']}]]){
 test('11C.2 rejects '+name+' before opt-in or provider access',async()=>{const h=harness();h.patch(patch);assert.equal(h.grant().state,'restricted');assert.equal((await h.login()).state,'restricted');assert.equal(h.reads(),0);});
}
test('11C.2 explicit notice consent allows actual 11A to 11B minimized view',async()=>{
 const h=harness();assert.equal(h.grant().state,'accepted');const s=await h.login();assert.equal(s.state,'authenticated');
 const v=await h.read(s);assert.equal(v.state,'ready');assert.deepEqual(v.group,{name:'Synthetic Group'});
 assert.deepEqual(Object.keys(v.nextGathering).sort(),['startsAt','title']);assert.doesNotMatch(JSON.stringify(v),/PRIVATE|subject-test|person-test|membership-test|org-test|group-test/);
 assert.equal(h.reads(),4);
});
test('11C.2 withdrawal revokes all sessions and fresh consent cannot resurrect them',async()=>{
 const h=harness();h.grant();const a=await h.login(),bb=binding(),b=await h.login(h.i,bb);
 assert.equal(h.admin.withdrawConsent(h.i).state,'accepted');assert.equal(h.admin.retentionSummary().consentRecords,0);
 h.grant();assert.equal((await h.read(a)).state,'restricted');assert.equal((await h.read(b,bb)).state,'restricted');
 assert.equal(h.reads(),0);assert.equal((await h.read(await h.login())).state,'ready');
});
test('11C.2 withdrawal during verified exchange cancels pending callback even after new opt-in',async()=>{
 const h=harness();h.grant();const release=h.pauseVerify(),p=h.login();
 h.admin.withdrawConsent(h.i);h.grant();release();assert.equal((await p).state,'restricted');
 assert.equal(h.reads(),0);
});
test('11C.2 consent withdrawal during actual provider read discards result',async()=>{
 const h=harness();h.grant();const s=await h.login(),release=h.pauseRead(),p=h.read(s);
 await Promise.resolve();h.admin.withdrawConsent(h.i);release();
 assert.equal((await p).state,'restricted');
});
test('11C.2 mapping changes invalidate consent, cannot restore silently',async()=>{
 const h=harness();h.grant();const s=await h.login();h.patch({version:'v2'});
 assert.equal((await h.read(s)).state,'restricted');assert.equal(h.reads(),0);
 h.patch({});assert.equal((await h.login()).state,'restricted');assert.equal(h.admin.retentionSummary().consentRecords,0);
});
test('11C.3 consent expiry proactively sweeps, new opt-in requires fresh session',async()=>{
 const h=harness({consentMs:2000});h.grant();const s=await h.login();h.advance(2000);
 h.admin.sweep();assert.equal(h.admin.retentionSummary().consentRecords,0);assert.equal((await h.read(s)).state,'restricted');
 assert.equal(h.reads(),0);h.grant();assert.equal((await h.read(s)).state,'restricted');
});
test('11C.3 local deletion removes consent, not provider records, and no stale session',async()=>{
 const h=harness();h.grant();const s=await h.login();
 assert.deepEqual(h.admin.deleteLocalConsent(h.i),{state:'accepted'});
 assert.equal(h.admin.retentionSummary().consentRecords,0);assert.equal((await h.read(s)).state,'restricted');
 assert.equal(h.reads(),0);
});
test('11C.3 bounded consent capacity and expiry reclaim',()=>{
 const h=harness({maxConsents:1,consentMs:1000});assert.equal(h.grant().state,'accepted');
 assert.equal(h.grant(h.other).state,'unavailable');h.advance(1000);assert.equal(h.grant(h.other).state,'accepted');
 assert.equal(h.admin.retentionSummary().consentRecords,1);
});
test('11C.4 audit is coarse aggregate enum only, immutable and bounded, no subject or payload',async()=>{
 const h=harness({maxAuditBuckets:1,auditMs:7200000});h.grant();const s=await h.login();await h.read(s);
 const report=h.admin.auditSummary();assert.equal(report.length,1);assert.equal(report[0].counts['read:ready'],1);
 assert.ok(Object.isFrozen(report[0].counts));assert.doesNotMatch(JSON.stringify(report),/PRIVATE|Synthetic Group|person-test|subject-test|group-test|sessionToken|org-test/);
 h.advance(3600000);h.admin.withdrawConsent(h.i);assert.equal(h.admin.auditSummary().length,1);
 h.advance(7200000);assert.deepEqual(h.admin.auditSummary(),[]);
});
test('11C.4 disabling pilot revokes consent and sessions, no provider fallback',async()=>{
 const h=harness();h.grant();const s=await h.login();h.admin.setPilotEnabled(false);
 assert.equal((await h.read(s)).state,'restricted');assert.equal((await h.login()).state,'restricted');
 assert.equal(h.grant().state,'restricted');assert.equal(h.reads(),0);
 h.admin.setPilotEnabled(true);assert.equal((await h.login()).state,'restricted');
 h.grant();assert.equal((await h.read(s)).state,'restricted');assert.equal((await h.read(await h.login())).state,'ready');
});
test('11C.5 consent bound to specific identity, does not authorize another person',async()=>{
 const h=harness();h.grant();assert.equal((await h.login(h.other,binding())).state,'restricted');assert.equal(h.reads(),0);
 assert.equal(permits({purpose:'ai-personalization',field:'group.name',destination:'own-member-view'}),false);
});
test('11C.6 server-only and no new network, persistence or browser runtime import',()=>{
 const build=fs.readFileSync(require.resolve('../scripts/build.cjs'),'utf8'),source=fs.readFileSync(require.resolve('../pilot/s11c-synthetic-privacy.cjs'),'utf8');
 assert.doesNotMatch(build,/s11c-synthetic-privacy|['"]pilot['"]/);
 assert.doesNotMatch(source,/\bfetch\s*\(|localStorage|process\.env|writeFile/);
});
