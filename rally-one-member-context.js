/* Rally One M6A · one read-only member-context projection + explicit local transitions.
 * The EXISTING browser-local app state, onboarding membership selection and
 * versioned Connect conversation remain the authorities for their own fields.
 * No new persistence key, member database, church account or outbound action.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RallyMemberContext=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const allowedCampuses=new Set(['central','north','maui','online']);
const leaderIds=Object.freeze(['marcus','taylor']);
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));
const object=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
const frozen=value=>Object.freeze(value);
function snapshot({state,ui,conversation,now=new Date()}={}){
 const s=object(state),u=object(ui),m=object(u.memberships),c=object(conversation);
 const group=m.group===true,team=m.team===true;
 const leader=group&&s.role==='leader';
 const countValid=Number.isSafeInteger(c.unreadCount)&&c.unreadCount>=0&&c.unreadCount<=9999;
 const status=group?(c.status==='ok'&&countValid?'ok':'unavailable'):'not-joined';
 const unreadCount=status==='ok'?c.unreadCount:null; // unknown is NOT zero
 const rsvp=group&&['going','maybe'].includes(s.rsvp)?s.rsvp:'';
 const servingResponse=team&&['pending','confirmed','declined'].includes(s.teamStatus)?
    s.teamStatus:team?'unknown':'not-joined';
 const prayers=group&&Array.isArray(s.prayers)?s.prayers:[];
 const namedRequest=prayers.some(p=>p?.name==='Marcus C.'&&typeof p.text==='string'&&!!p.text.trim());
 const marcus=object(object(s.companionCare).marcus);
 const prayed=namedRequest&&validDate(marcus.prayedAt);
 const followedUp=namedRequest&&validDate(marcus.completedAt);
 const snoozed=namedRequest&&!followedUp&&validDate(marcus.snoozedUntil)&&Date.parse(marcus.snoozedUntil)>now.getTime();
 const reached=Array.isArray(s.reached)?s.reached.filter(x=>typeof x==='string'):[];
 const leaderPending=leaderIds.filter(id=>!reached.includes(id));
 const rhythm=object(s.rhythm);
 const intentionDue=!!(typeof rhythm.text==='string'&&rhythm.text.trim()&&!rhythm.completedAt&&
    validDate(rhythm.followUpAt)&&Date.parse(rhythm.followUpAt)<=now.getTime());
 const memberName=typeof u.name==='string'?u.name.trim().slice(0,40):'';
 return frozen({
  version:1,origin:'fictional browser-local data; not verified member identity',
  identity:frozen({name:memberName||'Friend',campus:allowedCampuses.has(u.campus)?u.campus:'unspecified'}),
  memberships:frozen({group,team}),
  permissions:frozen({group,team,groupLeader:leader,teamLeader:team&&s.role==='leader'}),
  group:frozen({
    member:group,rsvp,status,unreadCount,
    conversationSource:'RallyConversationRead.peek — only the versioned modern thread owns its read cursor'
  }),
  team:frozen({member:team,response:servingResponse,coverage:team&&!!s.coverage}),
  care:frozen({visible:namedRequest,prayed,followedUp,snoozed,
    status:!namedRequest?'unavailable':followedUp?'followed-up':snoozed?'paused':prayed?'prayed':'ready'}),
  leader:frozen({authorized:leader,requestedCheckIn:leader&&s.leaderRequest==='taylor-wednesday'&&leaderPending.includes('taylor'),pendingIds:frozen(leader?leaderPending:[]),
    reviewedIds:frozen(leader?leaderIds.filter(id=>reached.includes(id)):[])}),
  reading:frozen({readToday:!!s.read,intentionDue}),
  completed:frozen({
    groupRsvp:!!rsvp,servingResponse:servingResponse==='confirmed'||servingResponse==='declined',
    carePrayer:prayed,careCheckIn:followedUp,
    leaderReviews:leader?leaderIds.length-leaderPending.length:0
  })
 });
}
function denied(state,reason){return frozen({ok:false,reason,state});}
function applied(state,details){
 // The context snapshot is frozen, NOT the app's existing mutable state.
 // The caller adopts this fresh state and navigates/edits its own fields.
 return frozen({ok:true,reason:'explicit-local-action',state,details});
}
/* All writes are to pre-existing fields in the pre-existing app state.
 * Callers remain responsible for saving/rolling back via RallyStorageGuard.
 * Navigation and viewing do not call transition().
 */
function transition({state,ui,conversation,command,now=new Date()}={}){
 const s=object(state),cmd=object(command);
 const ctx=snapshot({state:s,ui,conversation,now});
 let next;
 switch(cmd.type){
  case 'group-rsvp':{
    if(!ctx.permissions.group)return denied(s,'not-a-group-member');
    if(!['going','maybe','clear'].includes(cmd.value))return denied(s,'invalid-response');
    const rsvp=cmd.value==='clear'?'':cmd.value;
    if(s.rsvp===rsvp)return denied(s,'no-change');
    next={...s,rsvp};
    break;
  }
  case 'serving-response':{
    if(!ctx.permissions.team)return denied(s,'not-a-team-member');
    if(!['confirmed','declined'].includes(cmd.value))return denied(s,'invalid-response');
    if(s.teamStatus===cmd.value&&!s.coverage)return denied(s,'no-change');
    next={...s,teamStatus:cmd.value};
    if(cmd.value==='confirmed'){
      next.coverage=false;
      next.teamMessages=Array.isArray(s.teamMessages)?s.teamMessages.filter(x=>!x?.coverage):[];
    }
    break;
  }
  case 'reading-mark':{
    if(typeof cmd.value!=='boolean')return denied(s,'invalid-reading-status');
    if(!!s.read===cmd.value)return denied(s,'no-change');
    next={...s,read:cmd.value};
    break;
  }
  case 'prayer-mark':{
    // Personal prayer is optional, never a required task or group activity.
    if(typeof cmd.value!=='boolean')return denied(s,'invalid-prayer-status');
    if(!!s.prayed===cmd.value)return denied(s,'no-change');
    next={...s,prayed:cmd.value};
    break;
  }
  case 'reflection-save':{
    const text=typeof cmd.text==='string'?cmd.text.trim():'';
    const allowedPassages=['John 15:12','James 1:22','Psalm 23:1–2'];
    if(!text||text.length>160||!allowedPassages.includes(cmd.passage))
      return denied(s,'invalid-reflection');
    const tomorrow=new Date(now);
    tomorrow.setDate(tomorrow.getDate()+1);
    tomorrow.setHours(0,0,0,0);
    next={...s,rhythm:{text,passage:cmd.passage,savedAt:now.toISOString(),
      followUpAt:tomorrow.toISOString(),completedAt:null}};
    break;
  }
  case 'reflection-clear':{
    if(!object(s.rhythm).text)return denied(s,'no-reflection');
    next={...s,rhythm:{}};
    break;
  }
  case 'reflection-complete':
  case 'reflection-defer':{
    const rhythm=object(s.rhythm);
    if(typeof rhythm.text!=='string'||!rhythm.text.trim()||rhythm.completedAt||
      !validDate(rhythm.followUpAt)||Date.parse(rhythm.followUpAt)>now.getTime())
      return denied(s,'reflection-not-due');
    if(cmd.type==='reflection-complete'){
      next={...s,rhythm:{...rhythm,completedAt:now.toISOString()}};
    }else{
      const tomorrow=new Date(now);
      tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(0,0,0,0);
      next={...s,rhythm:{...rhythm,followUpAt:tomorrow.toISOString()}};
    }
    break;
  }
  case 'reading-plan-select':{
    if(!ctx.permissions.groupLeader)return denied(s,'not-an-authorized-group-leader');
    if(!['sermon','study','year'].includes(cmd.value))return denied(s,'invalid-reading-path');
    if(s.plan===cmd.value)return denied(s,'no-change');
    next={...s,plan:cmd.value,memoryActive:cmd.value,memoryTarget:null,
      question:object(s.planQuestions)[cmd.value]||s.question};
    break;
  }
  case 'reading-question-save':{
    if(!ctx.permissions.groupLeader)return denied(s,'not-an-authorized-group-leader');
    const question=typeof cmd.text==='string'?cmd.text.trim():'';
    if(!question||question.length>400)return denied(s,'invalid-reading-question');
    const plan=['sermon','study','year'].includes(s.plan)?s.plan:'sermon';
    next={...s,question,planQuestions:{...object(s.planQuestions),[plan]:question}};
    break;
  }
  case 'serving-coverage':{
    // A coverage request is an explicit fictional scheduling action, NOT a
    // message, notification, attendance mark or staff approval.
    if(!ctx.permissions.team)return denied(s,'not-a-team-member');
    if(ctx.team.response!=='declined')return denied(s,'coverage-requires-declined-shift');
    if(!['request','withdraw'].includes(cmd.value))return denied(s,'invalid-coverage-action');
    if(cmd.value==='request'&&ctx.team.coverage)return denied(s,'coverage-already-requested');
    if(cmd.value==='withdraw'&&!ctx.team.coverage)return denied(s,'no-coverage-request');
    const active=cmd.value==='request';
    const prior=Array.isArray(s.teamMessages)?s.teamMessages:[];
    const other=prior.filter(msg=>!msg?.coverage);
    next={...s,coverage:active,teamMessages:active?
      [...other,{name:'You',time:'Just now',text:'Could someone cover my Sunday 9:00 AM shift?',coverage:true}]:other};
    break;
  }
  case 'leader-review':{
    if(!ctx.permissions.groupLeader)return denied(s,'not-an-authorized-group-leader');
    if(!leaderIds.includes(cmd.person))return denied(s,'unknown-demo-followup');
    const original=Array.isArray(s.reached)?s.reached:[];
    next={...s,reached:original.includes(cmd.person)?
       original.filter(id=>id!==cmd.person):[...original,cmd.person]};
    break;
  }
  case 'care-mark-prayed':{
    if(!ctx.permissions.group||ctx.care.status!=='ready')return denied(s,'care-not-available');
    next={...s,companionCare:{...object(s.companionCare),
      marcus:{...object(object(s.companionCare).marcus),prayedAt:now.toISOString()}}};
    break;
  }
  case 'care-resume':{
    if(!ctx.permissions.group||ctx.care.status!=='paused')return denied(s,'care-not-paused');
    const care={...object(object(s.companionCare).marcus)};
    delete care.snoozedUntil;
    next={...s,companionCare:{...object(s.companionCare),marcus:care}};
    break;
  }
  default:return denied(s,'unknown-command');
 }
 return applied(next,frozen({type:cmd.type,value:cmd.value||null,person:cmd.person||null,
   at:now.toISOString(),delivery:'browser-only; no notifications or remote requests'}));
}
return frozen({snapshot,transition});
});
