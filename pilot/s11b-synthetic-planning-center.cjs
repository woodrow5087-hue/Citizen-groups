'use strict';
// Sprint 11B: SERVER-ONLY simulation. No fetch, credentials, HTTP endpoint,
// provider SDK or browser import. The injected transport is a trusted fake;
// its tenant/subject/observation metadata is NOT a real PCO response field.
const freeze=Object.freeze;
const API_VERSION='2023-07-10',ORIGIN='https://api.planningcenteronline.com',PAGE=25;
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const exact=(x,keys)=>object(x)&&Object.keys(x).length===keys.length&&keys.every(k=>Object.hasOwn(x,k));
const id=x=>typeof x==='string'&&/^[A-Za-z0-9][A-Za-z0-9_-]{0,99}$/.test(x);
const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<=100&&!/[<>\x00-\x1f\x7f]/.test(x);
const instant=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d(?:\.\d{1,3})?Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(Date.parse(x)).toISOString().slice(0,19)===x.slice(0,19);
const rel=(x,k,type,value)=>x?.relationships?.[k]?.data?.type===type&&x.relationships[k].data.id===value;
const restricted=()=>freeze({state:'restricted'}),unavailable=()=>freeze({state:'unavailable'});
const fault=state=>Object.assign(new Error('Synthetic provider '+state),{state});
function eventsPath(groupId,offset){return '/groups/v2/groups/'+groupId+'/events?filter=not_canceled&per_page='+PAGE+'&offset='+offset;}
function createSyntheticPlanningCenter({organizationId,transport,now=Date.now,maximumAgeMs=60_000,maxPages=5,timeoutMs=1500,maxBytes=262144}={}){
 if(!id(organizationId)||typeof transport!=='function'||typeof now!=='function'||
  ![maximumAgeMs,maxPages,timeoutMs,maxBytes].every(Number.isSafeInteger)||
  maximumAgeMs<1000||maximumAgeMs>60000||maxPages<1||maxPages>10||timeoutMs<1||timeoutMs>10000||maxBytes<1024||maxBytes>1048576)
  throw TypeError('Invalid synthetic provider settings');
 function time(){const t=now();if(!Number.isSafeInteger(t)||t<0||t>8640000000000000)throw fault('unavailable');return t;}
 function fresh(value,t){return instant(value)&&Date.parse(value)<=t&&t-Date.parse(value)<=maximumAgeMs;}
 async function readSyntheticMember(input,signal){
  // Only existing 11A session-derived IDs may reach this reader. Reject extra
  // client-like fields and path injection before transport invocation.
  if(!exact(input,['subject','organizationId','groupId'])||input.organizationId!==organizationId||!id(input.subject)||!id(input.groupId))return restricted();
  const {subject,groupId}=input,root='/groups/v2/groups/'+groupId,observed=[];
  async function get(path){
   // Construct paths internally; never follow provider-supplied URLs directly.
   const valid=path===root||path===root+'/my_membership'||Array.from({length:maxPages},(_,i)=>eventsPath(groupId,i*PAGE)).includes(path);
   if(!valid)throw fault('restricted');
   if(signal?.aborted)throw fault('unavailable');
   let timer,abort;const controller=new AbortController();
   let result;
   try{
    result=await Promise.race([
     Promise.resolve().then(()=>transport(freeze({method:'GET',origin:ORIGIN,path,apiVersion:API_VERSION,organizationId,subject,signal:controller.signal}))),
     new Promise((_,reject)=>{abort=()=>{controller.abort();reject(fault('unavailable'));};signal?.addEventListener('abort',abort,{once:true});if(signal?.aborted)abort();else timer=setTimeout(abort,timeoutMs);})
    ]);
   }catch{throw fault('unavailable');}finally{clearTimeout(timer);if(abort)signal?.removeEventListener('abort',abort);}
   if(signal?.aborted)throw fault('unavailable');
   if(!object(result)||!Number.isInteger(result.status))throw fault('unavailable');
   if([401,403,404].includes(result.status))throw fault('restricted');
   if(result.status!==200)throw fault('unavailable'); // no retry/elevation in 11B
   if(result.organizationId!==organizationId||result.subject!==subject)throw fault('restricted');
   const t=time();
   if(!fresh(result.observedAt,t)||!object(result.body))throw fault('unavailable');
   try{if(Buffer.byteLength(JSON.stringify(result.body),'utf8')>maxBytes)throw fault('unavailable');}catch{throw fault('unavailable');}
   observed.push(result.observedAt);
   return result.body;
  }
  function membership(body){
   const m=body.data;
   if(m===null)throw fault('restricted');
   if(!object(m)||m.type!=='Membership'||!id(m.id)||!object(m.attributes))throw fault('unavailable');
   if(!rel(m,'person','Person',subject)||!rel(m,'group','Group',groupId)||!['member','leader'].includes(m.attributes.role))throw fault('restricted');
   if(!instant(m.attributes.joined_at)||Date.parse(m.attributes.joined_at)>time())throw fault('unavailable');
   // A current my_membership result is active evidence only in this simulation.
   // Live endpoint semantics and per-member token eligibility remain unverified.
   return {id:m.id,role:m.attributes.role};
  }
  try{
   const first=membership(await get(root+'/my_membership'));
   const g=(await get(root)).data;
   if(!object(g)||g.type!=='Group'||!object(g.attributes))throw fault('unavailable');
   if(g.id!==groupId)throw fault('restricted');
   if(!text(g.attributes.name))throw fault('unavailable');
   // Archived group status is outside the narrow projection; fail closed.
   if(g.attributes.archived===true||g.attributes.archived_at!=null)throw fault('restricted');
   if(g.attributes.archived!==undefined&&g.attributes.archived!==false)throw fault('unavailable');
   const seen=new Set(),eligible=[];
   let complete=false;
   for(let page=0;page<maxPages;page++){
    const body=await get(eventsPath(groupId,page*PAGE));
    if(!Array.isArray(body.data)||body.data.length>PAGE||!object(body.links)||!Object.hasOwn(body.links,'next'))throw fault('unavailable');
    for(const e of body.data){
     if(!object(e)||e.type!=='Event'||!id(e.id)||!object(e.attributes))throw fault('unavailable');
     if(!rel(e,'group','Group',groupId))throw fault('restricted');
     if(seen.has(e.id))throw fault('unavailable');seen.add(e.id);
     const a=e.attributes;
     if(typeof a.canceled!=='boolean'||!Object.hasOwn(a,'canceled_at')||
       !(a.canceled_at===null||instant(a.canceled_at))||
       a.canceled!==(a.canceled_at!==null)||!instant(a.starts_at))throw fault('unavailable');
     if(a.canceled)continue;
     if(!text(a.name))throw fault('unavailable');
     eligible.push({id:e.id,title:a.name,startsAt:new Date(Date.parse(a.starts_at)).toISOString()});
    }
    if(body.links.next===null){complete=true;break;}
    // Accept only the exact expected forward page on the same resource.
    // A missing/short intermediate page is ambiguous, not confirmed absence.
    if(body.data.length!==PAGE||page+1>=maxPages||body.links.next!==ORIGIN+eventsPath(groupId,(page+1)*PAGE))throw fault('unavailable');
   }
   if(!complete)throw fault('unavailable');
   const last=membership(await get(root+'/my_membership'));
   if(first.id!==last.id||first.role!==last.role)throw fault('restricted');
   if(signal?.aborted)throw fault('unavailable');
   const t=time();
   if(observed.some(x=>!fresh(x,t)))throw fault('unavailable');
   const next=eligible.filter(x=>Date.parse(x.startsAt)>t).sort((a,b)=>Date.parse(a.startsAt)-Date.parse(b.startsAt)||(a.id<b.id?-1:a.id>b.id?1:0))[0];
   // Oldest validated observation governs freshness; no renewal by rendering.
   const checkedAt=new Date(Math.min(...observed.map(Date.parse))).toISOString();
   return freeze({state:'ready',organizationId,subject,membership:freeze({subject,organizationId,groupId,active:true,role:last.role}),
    group:freeze({id:groupId,name:g.attributes.name}),nextGathering:next?freeze({groupId,title:next.title,startsAt:next.startsAt}):null,checkedAt});
  }catch(error){return error?.state==='restricted'?restricted():unavailable();}
 }
 return freeze({readSyntheticMember});
}
module.exports={createSyntheticPlanningCenter};
