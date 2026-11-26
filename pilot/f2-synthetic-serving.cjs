'use strict';

const {createResilientTransport}=require('./s11d-resilient-transport.cjs');

// Synthetic rehearsal contract. The path, grant and observation metadata
// belong to the fixture and make no assumptions about the real Services API.
const assignmentScope=Object.freeze({
 organizationId:'sample-citizen',personId:'sample-volunteer',campus:'north',teamId:'sample-welcome'
});
const scope=Object.freeze({...assignmentScope,permission:'serving:read'});
const path='/fixture/serving/assignment';
const maxAgeMs=60_000;
const states=Object.freeze({
 restricted:Object.freeze({state:'restricted'}),
 unavailable:Object.freeze({state:'unavailable'}),
 stale:Object.freeze({state:'stale'})
});
const timestamp=value=>typeof value==='string'&&Number.isFinite(Date.parse(value))&&
 new Date(value).toISOString()===value?Date.parse(value):NaN;
const matches=(record,expected)=>Object.entries(expected).every(([key,value])=>record?.[key]===value);

async function readServingAssignment({grant,transport,now=Date.now}){
 if(grant?.active!==true||grant.consent!==true||!matches(grant,scope))return states.restricted;
 const reader=createResilientTransport({transport,now,baseDelayMs:1});
 const response=await reader.request({method:'GET',path,...assignmentScope});
 if(response?.status===401||response?.status===403)return states.restricted;
 if(response?.status!==200||!response.assignment)return states.unavailable;

 const assignment=response.assignment;
 if(!matches(assignment,assignmentScope))return states.restricted;
 const checkedAt=now(),observedAt=timestamp(response.observedAt),startsAt=timestamp(assignment.startsAt);
 if(!Number.isSafeInteger(checkedAt)||!Number.isFinite(observedAt)||observedAt>checkedAt)return states.unavailable;
 if(checkedAt-observedAt>maxAgeMs)return states.stale;
 const title=typeof assignment.title==='string'?assignment.title.trim():'';
 if(!title||title.length>80||!Number.isFinite(startsAt)||startsAt<=checkedAt)return states.unavailable;

 return Object.freeze({
  state:'ready',
  assignment:Object.freeze({title,startsAt:assignment.startsAt,campus:scope.campus})
 });
}

async function createServingRehearsal(now=Date.now()){
 const clock=()=>now;
 const shift=new Date(now);
 shift.setUTCHours(16,0,0,0);
 shift.setUTCDate(shift.getUTCDate()+7-shift.getUTCDay());
 const startsAt=shift.toISOString();
 const grant={...scope,active:true,consent:true};
 const modes=['ready','denied','outage','stale'];
 const outcomes=await Promise.all(modes.map(mode=>readServingAssignment({grant,now:clock,transport:async request=>{
  if(!matches(request,{method:'GET',path,organizationId:scope.organizationId,personId:scope.personId,
   campus:scope.campus,teamId:scope.teamId})||mode==='denied')return {status:403};
  if(mode==='outage')return {status:503};
  return {
   status:200,
   observedAt:new Date(mode==='stale'?now-maxAgeMs-1:now).toISOString(),
   assignment:{...scope,title:'Welcome Team',startsAt,internalNote:'Fictional provider-only note'}
  };
 }})));
 return Object.fromEntries(modes.map((mode,index)=>[mode,outcomes[index]]));
}

module.exports={createServingRehearsal,readServingAssignment};
