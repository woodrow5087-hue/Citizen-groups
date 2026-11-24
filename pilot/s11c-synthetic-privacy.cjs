'use strict';
// S11C synthetic server-only composition. No real consent collection or
// HTTP routes. Administration methods are trusted server capabilities;
// only the eventual independently reviewed BFF may authenticate actors.
const {randomBytes,createHash}=require('node:crypto');
const {createSyntheticAuth}=require('./s11a-synthetic-auth.cjs');
const {createSyntheticPlanningCenter}=require('./s11b-synthetic-planning-center.cjs');
const freeze=Object.freeze;
const PURPOSE='member-group-view',NOTICE='pilot-notice-v1';
const POLICY=freeze({
 purpose:PURPOSE,noticeVersion:NOTICE,
 permittedFields:freeze(['group.name','nextGathering.title','nextGathering.startsAt']),
 prohibitedPurposes:freeze(['advertising','model-training','ai-personalization','pastoral-profiling','attendance-scoring','automatic-outreach','leadership-monitoring']),
 prohibitedCategories:freeze(['prayer','pastoral-notes','messages','attendance','giving','household','minors','roster','contact','health','location','credentials']),
 candidateConsentMs:30*86400000,candidateAuditMs:7*86400000
});
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>object(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const id=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,99}$/.test(x);
const providerId=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(x);
const digest=x=>createHash('sha256').update(x).digest('base64url');
const deny=()=>freeze({state:'restricted'});
function permits({purpose,field,destination}={}){
 return purpose===PURPOSE&&destination==='own-member-view'&&POLICY.permittedFields.includes(field);
}
function createSyntheticPrivacyPilot({issuer,audience,organizationId,redirectUri,verifySyntheticCode,
 lookupApprovedMapping,transport,now=Date.now,consentMs=POLICY.candidateConsentMs,
 auditMs=POLICY.candidateAuditMs,maxConsents=1000,maxAuditBuckets=168,authOptions={},providerOptions={}}={}){
 if(typeof lookupApprovedMapping!=='function'||typeof now!=='function'||
  ![consentMs,auditMs,maxConsents,maxAuditBuckets].every(n=>Number.isSafeInteger(n)&&n>0)||
  consentMs>POLICY.candidateConsentMs||auditMs>POLICY.candidateAuditMs||maxConsents>10000||maxAuditBuckets>168||
  !object(authOptions)||!object(providerOptions))throw TypeError('Invalid privacy pilot settings');
 // The existing approved mapping owner remains authoritative. The only new
 // state is explicit purpose-specific consent; no duplicate member profile.
 const consents=new Map(),audit=new Map();
 let enabled=true;
 const time=()=>{const n=now();return Number.isSafeInteger(n)&&n>=0&&n<=8640000000000000-POLICY.candidateConsentMs?n:null;};
 const validIdentity=i=>exact(i,['issuer','subject','organizationId'])&&i.issuer===issuer&&i.organizationId===organizationId&&id(i.subject);
 const key=i=>JSON.stringify([i.issuer,i.organizationId,i.subject]);
 function mapping(i){
  let m;try{m=lookupApprovedMapping(freeze({...i}));}catch{return null;}
  if(!object(m)||m.issuer!==i.issuer||m.subject!==i.subject||m.organizationId!==organizationId||
     m.active!==true||m.adult!==true||!providerId(m.personId)||!providerId(m.groupId)||!id(m.version)||
     !Array.isArray(m.scopes)||m.scopes.length!==1||m.scopes[0]!=='groups:read')return null;
  return {personId:m.personId,groupId:m.groupId,version:m.version,fingerprint:digest(JSON.stringify([m.personId,m.groupId,m.version]))};
 }
 function expire(n){
  if(n===null){consents.clear();audit.clear();return;}
  for(const [k,r] of consents)if(n<r.acceptedAt||n>=r.expiresAt)consents.delete(k);
  for(const [k,r] of audit)if(n<r.hour||n-r.hour>=auditMs)audit.delete(k);
 }
 // Fixed enum counts by hour, no IDs, group names, messages, request bodies,
 // tokens, errors, IPs or per-person correlation. Bounded in-memory audit only.
 const EVENTS=new Set(['consent-granted','consent-denied','consent-withdrawn','local-consent-deleted','login','read','logout','pilot-disabled','pilot-enabled']);
 const OUTCOMES=new Set(['accepted','restricted','unavailable','ready','authenticated','challenge','signed-out']);
 function record(event,outcome){
  const n=time();expire(n);
  if(n===null||!EVENTS.has(event)||!OUTCOMES.has(outcome))return;
  const hour=Math.floor(n/3600000)*3600000;
  // Expire from beginning of hour; for tiny test TTLs an old bucket is not retained.
  if(n-hour>=auditMs)return;
  const k=String(hour),r=audit.get(k)||{hour,counts:{}},name=event+':'+outcome;
  r.counts[name]=Math.min(Number.MAX_SAFE_INTEGER,(r.counts[name]||0)+1);
  audit.set(k,r);
  while(audit.size>maxAuditBuckets)audit.delete(audit.keys().next().value);
 }
 function lookupPilotGrant(identity){
  const n=time();expire(n);
  if(!enabled||n===null||!validIdentity(identity))return null;
  const k=key(identity),r=consents.get(k),m=mapping(identity);
  if(!r||!m||r.mappingFingerprint!==m.fingerprint){consents.delete(k);return null;}
  return freeze({...identity,active:true,adult:true,consent:true,personId:m.personId,groupId:m.groupId,
   version:r.generation,scopes:freeze(['groups:read'])});
 }
 const provider=createSyntheticPlanningCenter({...providerOptions,organizationId,transport,now});
 const auth=createSyntheticAuth({...authOptions,issuer,audience,organizationId,redirectUri,verifySyntheticCode,lookupPilotGrant,readSyntheticMember:provider.readSyntheticMember,now});
 // No caller can submit a consent boolean as a login claim. In this simulation
 // consent is recorded only through a trusted administration capability with
 // explicit notice/version/purpose attestation. Real verified consent UI pending.
 function grantConsent(input){
  const n=time();expire(n);
  const ok=exact(input,['identity','purpose','noticeVersion','decision'])&&validIdentity(input.identity)&&
   input.purpose===PURPOSE&&input.noticeVersion===NOTICE&&input.decision==='explicit-opt-in';
  const m=ok&&enabled&&n!==null?mapping(input.identity):null;
  if(!m){record('consent-denied','restricted');return deny();}
  const k=key(input.identity);
  if(!consents.has(k)&&consents.size>=maxConsents){record('consent-denied','unavailable');return freeze({state:'unavailable'});}
  const expiresAt=n+consentMs;
  auth.invalidateIdentity(input.identity);
  consents.set(k,freeze({acceptedAt:n,expiresAt,mappingFingerprint:m.fingerprint,generation:randomBytes(32).toString('base64url')}));
  record('consent-granted','accepted');return freeze({state:'accepted',expiresAt,noticeVersion:NOTICE,purpose:PURPOSE});
 }
 function remove(identity,event){
  if(!validIdentity(identity))return deny();
  consents.delete(key(identity));auth.invalidateIdentity(identity);
  record(event,'accepted');return freeze({state:'accepted'});
 }
 function sweep(){expire(time());auth.sweep();}
 function setPilotEnabled(value){
  if(typeof value!=='boolean')return deny();
  if(value===enabled)return freeze({state:'accepted'});
  enabled=value;
  if(!enabled){
   // Disable is deliberately destructive to consent; re-enabling requires new
   // opt-in. Pending challenges canceled via auth sweep/invalidation below.
   for(const k of consents.keys()){
    const [issuer,organizationId,subject]=JSON.parse(k);
    auth.invalidateIdentity({issuer,organizationId,subject});
   }
   consents.clear();auth.sweep();
  }
  record(value?'pilot-enabled':'pilot-disabled','accepted');return freeze({state:'accepted'});
 }
 const member=freeze({
  beginLogin(binding){sweep();const r=enabled?auth.beginLogin(binding):deny();record('login',r.state);return r;},
  async completeLogin(input){sweep();const r=enabled?await auth.completeLogin(input):deny();record('login',r.state);return r;},
  async readMember(input){sweep();const r=await auth.readMember(input);record('read',r.state);return r;},
  logout(binding){const r=auth.logout(binding);record('logout',r.state);return r;}
 });
 const administration=freeze({
  grantConsent,withdrawConsent:i=>remove(i,'consent-withdrawn'),deleteLocalConsent:i=>remove(i,'local-consent-deleted'),
  setPilotEnabled,sweep,
  auditSummary(){sweep();return freeze([...audit.values()].map(r=>freeze({hour:r.hour,counts:freeze({...r.counts})})));},
  retentionSummary(){sweep();return freeze({consentRecords:consents.size,auditBuckets:audit.size});}
 });
 return freeze({member,administration});
}
module.exports={POLICY,permits,createSyntheticPrivacyPilot};
