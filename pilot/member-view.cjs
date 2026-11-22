'use strict';
/**
 * Pilot 1.1: backend-side presentation boundary, not an HTTP server.
 * Only an independently authenticated server can call this with a verified
 * provider session. This module never performs network calls or browser work.
 *
 * The adapter can be replaced with a different church-system provider while
 * preserving the read-only presentation contract and approved Rally Point UI.
 */
const {PilotReadError}=require('./planning-center-readonly-groups.cjs');
const sourceOf=sample=>sample&&sample.source==='planning-center-groups'?'Planning Center Groups':'';
const freeze=obj=>Object.freeze(obj);
const unavailable=()=>freeze({state:'unavailable',group:null,nextGathering:null,checkedAt:null,source:null});
const restricted=()=>freeze({state:'restricted',group:null,nextGathering:null,checkedAt:null,source:null});
const text=value=>typeof value==='string'&&value.length<=100&&value.trim().length>0&&!/[<>\x00-\x1f]/.test(value);
const iso=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{1,3})?(?:Z|[+-]\d{2}:\d{2})$/.test(value)&&Number.isFinite(Date.parse(value));
function createPilotMemberView({readForServerSession,now=()=>new Date(),maximumAgeMs=60_000}={}){
 if(typeof readForServerSession!=='function')throw new TypeError('Server-only provider read required');
 if(!Number.isInteger(maximumAgeMs)||maximumAgeMs<=0||maximumAgeMs>300_000)
  throw new RangeError('Freshness bound must be within five minutes');
 async function viewForServerSession(session){
  // The upstream provider adapter owns authorization. This envelope does not
  // consider a browser role toggle, query string, localStorage or user input.
  let sample;
  try{sample=await readForServerSession(session)}catch(error){
   if(error instanceof PilotReadError&&['access-denied','not-a-member'].includes(error.code))return restricted();
   return unavailable(); // fail closed, never reflect secrets/errors in output
  }
  const current=now();
  if(!(current instanceof Date)||!Number.isFinite(current.getTime()))return unavailable();
  if(!sample||sample.mode!=='read-only'||!sourceOf(sample)||!text(sample.group?.name)||
    !iso(sample.asOf))return unavailable();
  const age=current.getTime()-Date.parse(sample.asOf);
  if(age<0||age>maximumAgeMs)return unavailable(); // no cached private details
  const event=sample.nextGathering;
  let nextGathering=null;
  if(event!==null){
   if(!event||!text(event.title)||!iso(event.startsAt))return unavailable();
   if(Date.parse(event.startsAt)<=current.getTime())return unavailable();
   nextGathering=freeze({title:event.title,startsAt:event.startsAt});
  }
  return freeze({
   state:'ready',
   group:freeze({name:sample.group.name}),
   nextGathering,
   checkedAt:sample.asOf,
   source:sourceOf(sample)
  });
 }
 return freeze({viewForServerSession});
}
module.exports={createPilotMemberView};
