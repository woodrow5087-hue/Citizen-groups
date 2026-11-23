'use strict';
/* Sprint 7D · provider-neutral SERVER-ONLY data contract, synthetic until authorized.
 * Neither a real authentication mechanism nor an HTTP endpoint. A verified
 * server session MUST be provided by a separately reviewed backend. No static
 * app bundle should import this file; never return source tokens or raw records.
 */
const ready=record=>Object.freeze(record);
const unavailable=()=>ready({state:'unavailable',source:null,checkedAt:null,group:null,nextGathering:null});
const restricted=()=>ready({state:'restricted',source:null,checkedAt:null,group:null,nextGathering:null});
const obj=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:null;
const safeText=v=>typeof v==='string'&&v.trim().length>0&&v.length<=100&&
 !/[<>\x00-\x1f\x7f]/.test(v);
const iso=v=>typeof v==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(v)&&
 Number.isFinite(Date.parse(v));
function createMemberContract({readForVerifiedSession,organizationId,
 sourceLabel,now=()=>new Date(),maximumAgeMs=60_000}={}){
 if(typeof readForVerifiedSession!=='function')throw new TypeError('Server-side provider reader required');
 if(!safeText(organizationId)||!safeText(sourceLabel))throw new TypeError('Expected configured tenant and source');
 if(!Number.isInteger(maximumAgeMs)||maximumAgeMs<1000||maximumAgeMs>300000)
   throw new RangeError('Freshness bound must be 1–300 seconds');
 const org=organizationId,source=sourceLabel;
 async function viewForVerifiedSession(session){
  const current=now();
  if(!(current instanceof Date)||!Number.isFinite(current.getTime()))return unavailable();
  // Server must have validated all these claims independently. A browser can
  // forge this shape, so it must NEVER be used as client authentication.
  if(!session||session.authenticated!==true||session.serverVerified!==true||
   !safeText(session.subject)||session.organizationId!==org||
   !Array.isArray(session.scopes)||!session.scopes.includes('groups:read')||
   !Number.isFinite(session.expiresAt)||session.expiresAt<=current.getTime())
   return restricted();
  let data;
  try{data=await readForVerifiedSession(session)}catch(error){
    return error?.code==='access-denied'||error?.code==='not-a-member'?restricted():unavailable();
  }
  const d=obj(data);
  if(!d||d.state==='restricted')return restricted();
  if(d.state!=='ready'||d.organizationId!==org||d.subject!==session.subject||
    !obj(d.membership)||d.membership.subject!==session.subject||
    d.membership.organizationId!==org||d.membership.active!==true||
    !['member','leader'].includes(d.membership.role))
    return restricted(); // mismatched tenant, revoked or unverified membership
  if(!safeText(d.group?.name)||!iso(d.checkedAt))return unavailable();
  const age=current.getTime()-Date.parse(d.checkedAt);
  if(age<0||age>maximumAgeMs)return unavailable();
  let event=null;
  if(d.nextGathering!==null){
    const g=obj(d.nextGathering);
    if(!g||!safeText(g.title)||!iso(g.startsAt)||
       Date.parse(g.startsAt)<=current.getTime())return unavailable();
    event=ready({title:g.title,startsAt:g.startsAt});
  }
  // Strict projection allowlist: no identity, roster, pastoral notes, tokens,
  // coordinates, unread count, attendance or provider-private fields.
  return ready({state:'ready',source,checkedAt:d.checkedAt,
    group:ready({name:d.group.name}),nextGathering:event});
 }
 return ready({viewForVerifiedSession});
}
module.exports={createMemberContract};
