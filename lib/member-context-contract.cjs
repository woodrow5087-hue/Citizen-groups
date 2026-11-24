'use strict';
// Provider-neutral, read-only handoff contract. Not an authentication mechanism,
// repository, endpoint or migration writer. This module is excluded from dist.
const Context=require('../rally-one-member-context.js');
const STATES=Object.freeze(['unavailable','unknown','empty','stale','malformed','confirmed']);
const DOMAINS=Object.freeze(['profile','involvement','relationships','serving','conversations','care','scripture','actions','permissions']);
const object=x=>x!==null&&typeof x==='object'&&!Array.isArray(x);
const keys=(x,names)=>object(x)&&Object.keys(x).length===names.length&&names.every(k=>Object.hasOwn(x,k));
const text=x=>typeof x==='string'&&x.trim().length>0&&x.length<=160&&!/[<>\x00-\x1f\x7f]/.test(x);
const bool=x=>typeof x==='boolean';
const iso=x=>typeof x==='string'&&/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.\d{3}Z$/.test(x)&&Number.isFinite(Date.parse(x))&&new Date(x).toISOString()===x;
const list=x=>Array.isArray(x)&&x.length<=20&&x.every(text)&&new Set(x).size===x.length;
const actionIds=new Set(['group-rsvp','serve-response','group-unavailable','group-unread','leader-checkins','care-check-in','care-prayer','scripture-step']);
const validators={
 profile:x=>keys(x,['name','identityVerified'])&&text(x.name)&&x.identityVerified===false,
 involvement:x=>keys(x,['campus','group','team'])&&['central','north','maui','online','unspecified'].includes(x.campus)&&bool(x.group)&&bool(x.team),
 relationships:x=>keys(x,['groupMember','rsvp'])&&x.groupMember===true&&['','going','maybe'].includes(x.rsvp),
 serving:x=>keys(x,['teamMember','response','coverage'])&&x.teamMember===true&&['pending','confirmed','declined'].includes(x.response)&&bool(x.coverage),
 conversations:x=>keys(x,['unreadCount'])&&Number.isSafeInteger(x.unreadCount)&&x.unreadCount>=0&&x.unreadCount<=9999,
 care:x=>keys(x,['status'])&&['ready','prayed','paused','followed-up'].includes(x.status),
 scripture:x=>keys(x,['readToday','intentionDue'])&&bool(x.readToday)&&bool(x.intentionDue),
 actions:x=>keys(x,['selectedIds','completed','dismissedIds'])&&list(x.selectedIds)&&x.selectedIds.length<=2&&list(x.dismissedIds)&&[...x.selectedIds,...x.dismissedIds].every(id=>actionIds.has(id))&&
   keys(x.completed,['groupRsvp','servingResponse','carePrayer','careCheckIn','leaderReviews'])&&
   ['groupRsvp','servingResponse','carePrayer','careCheckIn'].every(k=>bool(x.completed[k]))&&Number.isInteger(x.completed.leaderReviews)&&x.completed.leaderReviews>=0&&x.completed.leaderReviews<=2,
 permissions:x=>keys(x,['group','team','groupLeader','teamLeader'])&&Object.values(x).every(bool)&&(!x.groupLeader||x.group)&&(!x.teamLeader||x.team)
};
function freeze(value){if(object(value)||Array.isArray(value)){Object.values(value).forEach(freeze);Object.freeze(value);}return value;}
function record({domain,source,state,data,observedAt=null,maximumAgeMs=null,now=new Date()}={}){
 if(!DOMAINS.includes(domain)||!text(source))throw TypeError('Invalid member source/domain');
 if(!STATES.includes(state))state='unknown';
 if(observedAt!==null&&!iso(observedAt))state='malformed';
 if(state==='confirmed'&&!validators[domain](data))state='malformed';
 if(maximumAgeMs!==null){
  if(!Number.isSafeInteger(maximumAgeMs)||maximumAgeMs<=0||!(now instanceof Date)||!Number.isFinite(now.getTime()))throw TypeError('Invalid freshness policy');
  if(state==='confirmed'){
   if(observedAt===null)state='unknown';
   else if(Date.parse(observedAt)>now.getTime())state='malformed';
   else if(now.getTime()-Date.parse(observedAt)>maximumAgeMs)state='stale';
  }
 }
 // Never preserve malformed/stale/private raw records in the handoff.
 return freeze({state,source,observedAt:iso(observedAt)?observedAt:null,
  data:state==='confirmed'?structuredClone(data):null});
}
function assertEnvelope(value){
 if(!keys(value,['schemaVersion','mode','domains'])||value.schemaVersion!==1||value.mode!=='demonstration'||!keys(value.domains,DOMAINS))throw TypeError('Unsupported member envelope');
 for(const domain of DOMAINS){
  const r=value.domains[domain];
  if(!keys(r,['state','source','observedAt','data'])||!STATES.includes(r.state)||!text(r.source)||!(r.observedAt===null||iso(r.observedAt))||
   (r.state==='confirmed'?!validators[domain](r.data):r.data!==null))throw TypeError('Invalid member domain: '+domain);
 }
 const p=value.domains.permissions;
 if(p.state!=='confirmed'||!p.data.group){
  for(const d of ['relationships','conversations','care'])if(value.domains[d].data!==null)throw TypeError('Restricted group projection');
 }
 if(p.state!=='confirmed'||!p.data.team)if(value.domains.serving.data!==null)throw TypeError('Restricted team projection');
 const actions=value.domains.actions.data;
 if(actions){
  for(const id of [...actions.selectedIds,...actions.dismissedIds]){
   if((id.startsWith('group-')||id.startsWith('care-')||id==='leader-checkins')&&!(p.data?.group===true))throw TypeError('Restricted group action');
   if(id==='serve-response'&&!(p.data?.team===true))throw TypeError('Restricted serving action');
   if(id==='leader-checkins'&&!(p.data?.groupLeader===true))throw TypeError('Restricted leader action');
  }
  if(actions.completed.leaderReviews>0&&!(p.data?.groupLeader===true))throw TypeError('Restricted leader completion');
 }
 return value;
}
// A format migration/projection from existing owners; never writes or creates an
// identity. Caller supplies its existing fixture inputs and, optionally, focus.
function fromFixture({state={},ui={},conversation,focus,now=new Date()}={}){
 if(!object(state)||!object(ui))throw TypeError('Expected parsed fixture records; preserve invalid raw input in its existing owner');
 const ctx=Context.snapshot({state,ui,conversation,now});
 const m=object(ui?.memberships)?ui.memberships:{};
 const membershipKnown=bool(m.group)&&bool(m.team);
 const membershipsMalformed=Object.values(m).some(v=>!bool(v));
 const domains={};
 const put=(domain,source,status,data)=>domains[domain]=record({domain,source,state:status,data});
 const knowledge=(value,valid)=>value===undefined?'unknown':valid?'confirmed':'malformed';
 put('profile','onboarding-local',knowledge(ui.name,text(ui.name)),{name:ctx.identity.name,identityVerified:false});
 put('involvement','onboarding-local',membershipsMalformed?'malformed':!membershipKnown||ui.campus===undefined?'unknown':
  ui.campus!==undefined&&!['central','north','maui','online'].includes(ui.campus)?'malformed':'confirmed',
  {campus:ctx.identity.campus,group:ctx.memberships.group,team:ctx.memberships.team});
 put('permissions','fixture-policy',membershipKnown?'confirmed':membershipsMalformed?'malformed':'unknown',ctx.permissions);
 const group=membershipKnown&&ctx.permissions.group,team=membershipKnown&&ctx.permissions.team;
 put('relationships','app-local',!group?'empty':knowledge(state.rsvp,['','going','maybe'].includes(state.rsvp)),
  {groupMember:true,rsvp:ctx.group.rsvp});
 put('serving','app-local',!team?'empty':knowledge(state.teamStatus,['pending','confirmed','declined'].includes(state.teamStatus)),
  {teamMember:true,response:ctx.team.response,coverage:ctx.team.coverage});
 const c=object(conversation)?conversation:{};
 put('conversations','modern-thread',!group?'empty':c.status==='unavailable'?'unavailable':c.status!=='ok'?'unknown':
  c.unreadCount===undefined?'unknown':ctx.group.status==='ok'?'confirmed':'malformed',
  {unreadCount:ctx.group.unreadCount});
 put('care','app-local',!group?'empty':state.prayers===undefined?'unknown':!Array.isArray(state.prayers)||!state.prayers.every(p=>object(p)&&typeof p.name==='string'&&typeof p.text==='string')?'malformed':ctx.care.visible?'confirmed':'empty',
  {status:ctx.care.status});
 put('scripture','app-local',knowledge(state.read,bool(state.read)),ctx.reading);
 put('actions','intelligence',focus===undefined?'unknown':'confirmed',{
  selectedIds:focus?.selectedIds,completed:ctx.completed,dismissedIds:focus?.dismissedIds||[]});
 const result={schemaVersion:1,mode:'demonstration',domains};
 assertEnvelope(result);return freeze(result);
}
module.exports=Object.freeze({STATES,DOMAINS,record,assertEnvelope,fromFixture});
