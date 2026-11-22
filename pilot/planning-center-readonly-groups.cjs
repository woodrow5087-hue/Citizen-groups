'use strict';
/**
 * Pilot 1.0: SERVER-SIDE ONLY, minimal Planning Center Groups read adapter.
 *
 * This is not a sign-in implementation or a deployable authenticated endpoint.
 * Call only from a separately reviewed, authenticated backend after an OAuth
 * authorization-code + PKCE exchange and verified server session. Neither
 * access tokens nor this module may be bundled into the Rally Point browser.
 *
 * No network requests occur until readForServerSession() is explicitly called.
 * Default application UI is unchanged; no live data is connected by this PR.
 */
const ORIGIN='https://api.planningcenteronline.com';
const MAX_BODY_BYTES=256_000;
class PilotReadError extends Error {
  constructor(code) {
    super(code);
    this.name='PilotReadError';
    this.code=code;
  }
}
const deny=code=>{throw new PilotReadError(code)};
const idOk=v=>typeof v==='string'&&/^[0-9]{1,20}$/.test(v);
const sameId=(a,b)=>String(a??'')===String(b??'');
const clean=v=>typeof v==='string'?v.replace(/<[^>]*>/g,'').replace(/[\u0000-\u001F\u007F]/g,' ').trim().slice(0,100):'';
const relationship=(record,type)=>record?.relationships?.[type]?.data?.id;
function bodyData(payload,mode='one'){
 if(!payload||typeof payload!=='object'||!('data' in payload))deny('source-unavailable');
 const value=payload.data;
 if(mode==='one')return value&&typeof value==='object'&&!Array.isArray(value)?value:null;
 if(!Array.isArray(value))deny('source-unavailable');
 return value;
}
function pickNext(events,groupId,now) {
 return events
  .filter(e=>e&&e.type==='Event'&&(!relationship(e,'group')||sameId(relationship(e,'group'),groupId)))
  .filter(e=>e.attributes?.canceled!==true&&!e.attributes?.canceled_at)
  .map(e=>({id:e.id,title:clean(e.attributes?.name),start:e.attributes?.starts_at}))
  .filter(e=>typeof e.start==='string'&&Number.isFinite(Date.parse(e.start))&&Date.parse(e.start)>now.getTime())
  .sort((a,b)=>Date.parse(a.start)-Date.parse(b.start))[0]||null;
}
function createReadOnlyGroupClient({fetchImpl,organizationId,groupId,now=()=>new Date()}={}){
 if(typeof fetchImpl!=='function')throw new TypeError('A server-side fetch implementation is required');
 if(!idOk(String(organizationId??''))||!idOk(String(groupId??'')))throw new TypeError('Expected organization and group IDs must be configured on the server');
 const org=String(organizationId),group=String(groupId);
 async function get(path,token){
  const url=new URL(path,ORIGIN);
  if(url.origin!==ORIGIN||!url.pathname.startsWith('/groups/v2/')&&url.pathname!=='/oauth/userinfo')
    deny('source-unavailable');
  let response;
  try {
   response=await fetchImpl(url.toString(),{
    method:'GET',
    headers:{Authorization:'Bearer '+token,Accept:'application/json',
     'User-Agent':'Rally Point Pilot (https://github.com/woodrow5087-hue/Citizen-groups)'},
    redirect:'error',
    cache:'no-store',
    signal:AbortSignal.timeout(7000)
   });
  }catch{
   deny('source-unavailable');
  }
  if(!response||!Number.isInteger(response.status))deny('source-unavailable');
  if(response.status===401||response.status===403)deny('access-denied');
  if(response.status===404&&path.endsWith('/my_membership'))deny('not-a-member');
  if(response.status<200||response.status>299)deny('source-unavailable');
  if(response.headers?.get?.('content-length')&&Number(response.headers.get('content-length'))>MAX_BODY_BYTES)deny('source-unavailable');
  try {
   // A bounded reader avoids accepting unexpectedly huge JSON documents.
   const text=await response.text();
   if(typeof text!=='string'||Buffer.byteLength(text)>MAX_BODY_BYTES)deny('source-unavailable');
   return JSON.parse(text);
  }catch{deny('source-unavailable')}
 }
 async function readForServerSession(session){
  // A caller-supplied browser object is NOT a server session. This function
  // must be invoked only behind real server authentication and verified OAuth.
  if(!session||session.authenticated!==true||typeof session.accessToken!=='string'||
   !session.accessToken.trim()||!idOk(String(session.subject??''))||
   !sameId(session.organizationId,org)||
   !Array.isArray(session.scopes)||!session.scopes.includes('groups')||!session.scopes.includes('openid')||
   !Number.isFinite(session.expiresAt)||session.expiresAt<=Date.now())
   deny('access-denied');
  const current=now();
  if(!(current instanceof Date)||Number.isNaN(current.getTime()))deny('source-unavailable');
  const token=session.accessToken;
  // Bind the OAuth subject and organization again to current userinfo.
  const user=await get('/oauth/userinfo',token);
  if(!sameId(user.sub,session.subject)||!sameId(user.organization_id,org))deny('access-denied');
  // Critical: recheck THIS user's membership, not an admin's list or a
  // previous UI-selected group. A returned Group alone does not confer access.
  const membership=bodyData(await get('/groups/v2/groups/'+group+'/my_membership',token));
  if(!membership)deny('not-a-member');
  if(membership.type!=='Membership'||
   !sameId(relationship(membership,'group'),group)||
   !['member','leader'].includes(membership.attributes?.role))deny('access-denied');
  const [groupDocument,eventDocument]=await Promise.all([
   get('/groups/v2/groups/'+group,token),
   get('/groups/v2/groups/'+group+'/events?filter=not_canceled&order=starts_at&per_page=100',token)
  ]);
  const groupRecord=bodyData(groupDocument);
  if(!groupRecord||groupRecord.type!=='Group'||!sameId(groupRecord.id,group))deny('source-unavailable');
  // Never silently claim "no event" when the provider paginates a group calendar.
  // Future iteration will implement bounded pagination once the actual tenant is approved.
  if(eventDocument?.links?.next||eventDocument?.meta?.next||eventDocument?.meta?.total_count>eventDocument.data?.length)
   deny('source-unavailable');
  const eventRecords=bodyData(eventDocument,'many');
  const event=pickNext(eventRecords,group,current);
  // Explicit small allowlist: never return any raw API objects, roster,
  // prayer requests, notes, member details, addresses, or auth material.
  return Object.freeze({
   source:'planning-center-groups',
   mode:'read-only',
   group:Object.freeze({name:clean(groupRecord.attributes?.name)||'Your group'}),
   nextGathering:event?Object.freeze({title:event.title||'Group gathering',startsAt:event.start}):null,
   asOf:current.toISOString()
  });
 }
 return Object.freeze({readForServerSession});
}
module.exports={createReadOnlyGroupClient,PilotReadError};
