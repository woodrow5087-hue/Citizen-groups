'use strict';
// S11A: SERVER-ONLY SYNTHETIC trust rehearsal. No HTTP endpoint, JWT verifier,
// live OAuth client, token store, or durable identity/session database.
// All callbacks are trusted server dependencies, never browser-supplied.
const {randomBytes,createHash,timingSafeEqual}=require('node:crypto');
const {createMemberContract}=require('./s7-readonly-member-contract.cjs');
const freeze=Object.freeze;
const restricted=()=>freeze({state:'restricted'});
const unavailable=()=>freeze({state:'unavailable'});
const restrictedView=()=>freeze({state:'restricted',source:null,checkedAt:null,group:null,nextGathering:null});
const unavailableView=()=>freeze({state:'unavailable',source:null,checkedAt:null,group:null,nextGathering:null});
const token=()=>randomBytes(32).toString('base64url');
const digest=x=>createHash('sha256').update(x).digest('base64url');
const opaque=x=>typeof x==='string'&&/^[A-Za-z0-9_-]{43}$/.test(x);
const identifier=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9:_-]{0,99}$/.test(x);
const codeValue=x=>typeof x==='string'&&/^[\x21-\x7e]{1,512}$/.test(x);
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>object(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const eq=(a,b)=>opaque(a)&&opaque(b)&&timingSafeEqual(Buffer.from(a),Buffer.from(b));
const https=x=>{try{const u=new URL(x);return u.protocol==='https:'&&!u.username&&!u.password&&!u.hash&&!u.search&&u.href===x;}catch{return false;}};
function createSyntheticAuth({issuer,audience,organizationId,redirectUri,
 verifySyntheticCode,lookupPilotGrant,readSyntheticMember,now=Date.now,
 transactionMs=300_000,idleMs=1_800_000,absoluteMs=28_800_000,maxBindings=1000}={}){
 if(!https(issuer)||!https(redirectUri)||!identifier(audience)||!identifier(organizationId)||
    [verifySyntheticCode,lookupPilotGrant,readSyntheticMember,now].some(fn=>typeof fn!=='function')||
    ![transactionMs,idleMs,absoluteMs,maxBindings].every(n=>Number.isSafeInteger(n)&&n>0)||
    transactionMs>600_000||idleMs>absoluteMs||absoluteMs>28_800_000||maxBindings>10000)
  throw TypeError('Invalid synthetic authentication configuration');
 // One flow/session per opaque server-generated browser binding; store only
 // digests of browser binding and session token. A new login replaces the old.
 const records=new Map();
 function time(){const n=now();return Number.isSafeInteger(n)&&n>=0?n:null;}
 function key(binding){return opaque(binding)?digest(binding):null;}
 function validTime(n,r){return n!==null&&n>=r.startedAt&&n<r.expiresAt;}
 function prune(n){
  for(const [k,r] of records){
   if(!validTime(n,r)||(r.session&&n-r.session.lastSeen>=idleMs))records.delete(k);
  }
 }
 function beginLogin(browserBinding){
  const k=key(browserBinding),n=time();
  if(!k||n===null)return restricted();
  prune(n);
  if(!records.has(k)&&records.size>=maxBindings)return unavailable();
  const state=token(),nonce=token(),verifier=token();
  records.set(k,{startedAt:n,expiresAt:n+transactionMs,stateDigest:digest(state),nonce,verifier,used:false,session:null});
  return freeze({state:'challenge',loginState:state,nonce,codeChallenge:digest(verifier),codeChallengeMethod:'S256',redirectUri});
 }
 // The fake verifier is a trusted test double. The checks below are defense in
 // depth over its verified output, NOT a replacement for signature/JWKS validation.
 function verifiedIdentity(claims,r,n){
  if(!object(claims)||claims.issuer!==issuer||claims.audience!==audience||
    claims.organizationId!==organizationId||!identifier(claims.subject)||
    !eq(claims.nonce,r.nonce)||!Number.isSafeInteger(claims.expiresAt)||claims.expiresAt<=n||
    (Object.hasOwn(claims,'notBefore')&&(!Number.isSafeInteger(claims.notBefore)||claims.notBefore>n)))return null;
  return freeze({issuer,subject:claims.subject,organizationId,credentialExpiresAt:claims.expiresAt});
 }
 function grantFor(identity){
  let g;try{g=lookupPilotGrant(freeze({issuer:identity.issuer,subject:identity.subject,organizationId:identity.organizationId}));}
  catch{return null;}
  // Lookup is a synchronous server-owned fixture registry. A promise, browser
  // role, email/name match or truthy but nonboolean consent cannot grant access.
  if(!object(g)||g.issuer!==identity.issuer||g.subject!==identity.subject||g.organizationId!==organizationId||
     g.active!==true||g.adult!==true||g.consent!==true||!identifier(g.personId)||!identifier(g.groupId)||
     !identifier(g.version)||!Array.isArray(g.scopes)||g.scopes.length!==1||g.scopes[0]!=='groups:read')return null;
  return freeze({personId:g.personId,groupId:g.groupId,version:g.version});
 }
 function sameGrant(a,b){return !!a&&!!b&&a.personId===b.personId&&a.groupId===b.groupId&&a.version===b.version;}
 async function completeLogin(input){
  // No arbitrary claim/role fields, no browser-provided nonce or verifier.
  if(!exact(input,['browserBinding','loginState','code','redirectUri'])||input.redirectUri!==redirectUri||!opaque(input.loginState)||!codeValue(input.code))return restricted();
  const k=key(input.browserBinding),r=records.get(k),n=time();
  if(!r||r.used||!validTime(n,r)||!eq(digest(input.loginState),r.stateDigest))return restricted();
  r.used=true; // consume before asynchronous exchange; no replay/retry
  let claims;
  try{claims=await verifySyntheticCode(freeze({code:input.code,nonce:r.nonce,codeVerifier:r.verifier,redirectUri}));}
  catch{if(records.get(k)===r)records.delete(k);return unavailable();}
  const completedAt=time();
  if(records.get(k)!==r||!validTime(completedAt,r))return restricted();
  const identity=verifiedIdentity(claims,r,completedAt),grant=identity&&grantFor(identity);
  if(!identity||!grant){records.delete(k);return restricted();}
  const sessionToken=token(),expiresAt=Math.min(completedAt+absoluteMs,identity.credentialExpiresAt);
  // Drop one-use login secrets entirely after successful exchange.
  records.set(k,{startedAt:completedAt,expiresAt,used:true,session:{tokenDigest:digest(sessionToken),identity,grant,lastSeen:completedAt}});
  return freeze({state:'authenticated',sessionToken,expiresAt});
 }
 function current(binding,sessionToken){
  const k=key(binding),r=records.get(k),n=time(),s=r?.session;
  if(!s||!opaque(sessionToken)||!eq(digest(sessionToken),s.tokenDigest))return null;
  if(!validTime(n,r)||n<s.lastSeen||n-s.lastSeen>=idleMs){records.delete(k);return null;}
  if(!sameGrant(s.grant,grantFor(s.identity))){records.delete(k);return null;}
  return {k,r,s,n};
 }
 // BFF must enforce same-origin, session binding and CSRF before calling this.
 // No client-provided user ID is involved. Logout also cancels pending login.
 function logout(browserBinding){const k=key(browserBinding);if(k)records.delete(k);return freeze({state:'signed-out'});}
 async function readMember(input){
  if(!exact(input,['browserBinding','sessionToken']))return restrictedView();
  const {browserBinding,sessionToken}=input,first=current(browserBinding,sessionToken);
  if(!first)return restrictedView();
  const {s}=first;
  let data;
  try{data=await readSyntheticMember(freeze({subject:s.grant.personId,organizationId,groupId:s.grant.groupId}));}
  catch(error){
   const after=current(browserBinding,sessionToken);
   if(!after||after.r!==first.r)return restrictedView();
   return error?.code==='access-denied'||error?.code==='not-a-member'?restrictedView():unavailableView();
  }
  const after=current(browserBinding,sessionToken);
  if(!after||after.r!==first.r)return restrictedView();
  if(!object(data)||data.state==='unavailable')return unavailableView();
  if(data.state==='restricted')return restrictedView();
  // Explicit group scope check missing from the old generic shape; no other
  // group (including one in the same tenant) may pass this boundary.
  if(data.state!=='ready'||data.group?.id!==s.grant.groupId||data.membership?.groupId!==s.grant.groupId||
    (data.nextGathering!==null&&data.nextGathering?.groupId!==s.grant.groupId))return restrictedView();
  // Existing narrow projection is evaluated at response time, not request time.
  const contract=createMemberContract({organizationId,sourceLabel:'synthetic-verified-member',
   now:()=>new Date(time()??NaN),readForVerifiedSession:async()=>data});
  const view=await contract.viewForVerifiedSession(freeze({authenticated:true,serverVerified:true,subject:s.grant.personId,
   organizationId,scopes:freeze(['groups:read']),expiresAt:first.r.expiresAt}));
  const final=current(browserBinding,sessionToken);
  if(!final||final.r!==first.r)return restrictedView();
  if(view.state==='ready')final.s.lastSeen=final.n;
  return view;
 }
 return freeze({beginLogin,completeLogin,readMember,logout});
}
module.exports={createSyntheticAuth};
