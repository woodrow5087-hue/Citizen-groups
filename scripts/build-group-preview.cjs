'use strict';

const {randomBytes}=require('node:crypto');
const {createSyntheticPrivacyPilot,POLICY}=require('../pilot/s11c-synthetic-privacy.cjs');

const issuer='https://issuer.example.invalid/';
const audience='foundation-group-rehearsal';
const redirectUri='https://rally.example.invalid/callback';
const identity={issuer,organizationId:'sample-citizen',subject:'sample-group-member'};
const personId='sample-person';
const groupId='sample-north-group';
const path='/groups/v2/groups/'+groupId;
const rel=(type,id)=>({data:{type,id}});

async function readScenario(mode,time){
 const now=()=>time;
 const gathering=new Date(time);
 gathering.setUTCHours(18,0,0,0);
 gathering.setUTCDate(gathering.getUTCDate()+7-(gathering.getUTCDay()+1)%7);
 const pilot=createSyntheticPrivacyPilot({
  issuer,audience,redirectUri,organizationId:identity.organizationId,now,
  lookupApprovedMapping:i=>i.subject===identity.subject?
   {...identity,personId,groupId,active:true,adult:true,version:'v1',scopes:['groups:read']}:null,
  verifySyntheticCode:async r=>r.code===identity.subject?
   {...identity,audience,nonce:r.nonce,expiresAt:time+300_000}:null,
  resilienceOptions:{baseDelayMs:1},
  transport:async request=>{
   if(request.method!=='GET'||request.organizationId!==identity.organizationId||request.subject!==personId)return {status:403};
   if(mode==='denied')return {status:403};
   if(mode==='outage')return {status:503};
   let body;
   if(request.path===path+'/my_membership'){
    body={data:{type:'Membership',id:'sample-membership',attributes:{role:'member',joined_at:'2020-01-01T00:00:00Z'},
     relationships:{group:rel('Group',groupId),person:rel('Person',personId)}}};
   }else if(request.path===path){
    body={data:{type:'Group',id:groupId,attributes:{name:'North Campus Group',description:'Fixture-only details'}}};
   }else if(request.path===path+'/events?filter=not_canceled&per_page=25&offset=0'){
    const event={type:'Event',id:'sample-gathering',attributes:{
     name:'Community gathering',starts_at:gathering.toISOString(),canceled:false,canceled_at:null
    },relationships:{group:rel('Group',groupId)}};
    body={data:mode==='empty'?[]:[event],links:{next:null}};
   }else{
    return {status:403};
   }
   return {status:200,organizationId:identity.organizationId,subject:personId,
    observedAt:new Date(mode==='stale'?time-60_001:time).toISOString(),body};
  }
 });
 const consent=pilot.administration.grantConsent({
  identity,purpose:POLICY.purpose,noticeVersion:POLICY.noticeVersion,decision:'explicit-opt-in'
 });
 if(consent.state!=='accepted')throw Error('Synthetic group consent setup failed');
 const browserBinding=randomBytes(32).toString('base64url');
 const challenge=pilot.member.beginLogin(browserBinding);
 const session=await pilot.member.completeLogin({browserBinding,loginState:challenge.loginState,code:identity.subject,redirectUri});
 if(session.state!=='authenticated')throw Error('Synthetic group session setup failed');
 try{
  const view=await pilot.member.readMember({browserBinding,sessionToken:session.sessionToken});
  if(view.state!=='ready')return {state:view.state};
  return {
   state:'ready',name:view.group.name,
   nextGathering:view.nextGathering&&{title:view.nextGathering.title,startsAt:view.nextGathering.startsAt}
  };
 }finally{
  pilot.member.logout(browserBinding);
 }
}

async function createGroupRehearsal(time=Date.now()){
 const modes=['ready','empty','denied','outage','stale'];
 const results=await Promise.all(modes.map(mode=>readScenario(mode,time)));
 return Object.fromEntries(modes.map((mode,index)=>[mode,results[index]]));
}

async function makeGroupPreviewBundle(time){
 return 'window.FoundationGroupFixtures = '+JSON.stringify(await createGroupRehearsal(time))+';\n';
}

module.exports={createGroupRehearsal,makeGroupPreviewBundle};
