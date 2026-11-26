/* Foundation 2 domain extension — explicit preview-only actions.
 * The original RallyMemberContext source is immutable under historical QA.
 * Existing RSVP, serving, care and leader actions are delegated to it intact.
 * This module owns only additional coverage/Read actions against those same
 * PRE-EXISTING app-state fields; its caller owns the guarded commit.
 * Synthetic/browser-local only. No messages, staff alerts or remote writes.
 */
(function(root,factory){
 'use strict';
 const canonical=typeof module==='object'&&module.exports?
  require('../rally-one-member-context.js'):root.RallyMemberContext;
 const api=factory(canonical);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationMemberActions=api;
})(typeof window!=='undefined'?window:null,function(Canonical){
'use strict';
if(!Canonical?.snapshot||!Canonical?.transition)throw new Error('Canonical member context unavailable');
const extended=new Set([
 'serving-coverage','reading-mark','prayer-mark','reflection-save','reflection-clear',
 'reflection-complete','reflection-defer','reading-plan-select','reading-question-save'
]);
const object=v=>v&&typeof v==='object'&&!Array.isArray(v)?v:{};
const validDate=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T/.test(value)&&Number.isFinite(Date.parse(value));
const denied=(state,reason)=>Object.freeze({ok:false,reason,state});
const applied=(state,command,now)=>Object.freeze({
 ok:true,reason:'explicit-local-action',state,
 details:Object.freeze({type:command.type,value:command.value??null,at:now.toISOString(),
  delivery:'browser-only; no notifications or remote requests'})
});
function transition({state,ui,conversation,command,now=new Date()}={}){
 const s=object(state),cmd=object(command);
 if(!extended.has(cmd.type)){
  return Canonical.transition({state,ui,conversation,command,now});
 }
 const context=Canonical.snapshot({state:s,ui,conversation,now});
 let next;
 switch(cmd.type){
  case 'serving-coverage':{
   if(!context.permissions.team)return denied(state,'not-a-team-member');
   if(context.team.response!=='declined')return denied(state,'coverage-requires-declined-shift');
   if(!['request','withdraw'].includes(cmd.value))return denied(state,'invalid-coverage-action');
   if(cmd.value==='request'&&context.team.coverage)return denied(state,'coverage-already-requested');
   if(cmd.value==='withdraw'&&!context.team.coverage)return denied(state,'no-coverage-request');
   const active=cmd.value==='request',prior=Array.isArray(s.teamMessages)?s.teamMessages:[];
   const other=prior.filter(msg=>!msg?.coverage);
   next={...s,coverage:active,teamMessages:active?
    [...other,{name:'You',time:'Just now',text:'Could someone cover my Sunday 9:00 AM shift?',coverage:true}]:other};
   break;
  }
  case 'reading-mark':{
   if(typeof cmd.value!=='boolean')return denied(state,'invalid-reading-status');
   if(!!s.read===cmd.value)return denied(state,'no-change');
   next={...s,read:cmd.value};break;
  }
  case 'prayer-mark':{
   if(typeof cmd.value!=='boolean')return denied(state,'invalid-prayer-status');
   if(!!s.prayed===cmd.value)return denied(state,'no-change');
   next={...s,prayed:cmd.value};break;
  }
  case 'reflection-save':{
   const text=typeof cmd.text==='string'?cmd.text.trim():'';
   if(!text||text.length>160||!['John 15:12','James 1:22','Psalm 23:1–2'].includes(cmd.passage))
    return denied(state,'invalid-reflection');
   const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(0,0,0,0);
   next={...s,rhythm:{text,passage:cmd.passage,savedAt:now.toISOString(),
    followUpAt:tomorrow.toISOString(),completedAt:null}};break;
  }
  case 'reflection-clear':{
   if(!object(s.rhythm).text)return denied(state,'no-reflection');
   next={...s,rhythm:{}};break;
  }
  case 'reflection-complete':
  case 'reflection-defer':{
   const rhythm=object(s.rhythm);
   if(typeof rhythm.text!=='string'||!rhythm.text.trim()||rhythm.completedAt||
    !validDate(rhythm.followUpAt)||Date.parse(rhythm.followUpAt)>now.getTime())
    return denied(state,'reflection-not-due');
   if(cmd.type==='reflection-complete')next={...s,rhythm:{...rhythm,completedAt:now.toISOString()}};
   else{
    const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);tomorrow.setHours(0,0,0,0);
    next={...s,rhythm:{...rhythm,followUpAt:tomorrow.toISOString()}};
   }
   break;
  }
  case 'reading-plan-select':{
   if(!context.permissions.groupLeader)return denied(state,'not-an-authorized-group-leader');
   if(!['sermon','study','year'].includes(cmd.value))return denied(state,'invalid-reading-path');
   if(s.plan===cmd.value)return denied(state,'no-change');
   next={...s,plan:cmd.value,memoryActive:cmd.value,memoryTarget:null,
    question:object(s.planQuestions)[cmd.value]||s.question};break;
  }
  case 'reading-question-save':{
   if(!context.permissions.groupLeader)return denied(state,'not-an-authorized-group-leader');
   const question=typeof cmd.text==='string'?cmd.text.trim():'';
   if(!question||question.length>400)return denied(state,'invalid-reading-question');
   const plan=['sermon','study','year'].includes(s.plan)?s.plan:'sermon';
   next={...s,question,planQuestions:{...object(s.planQuestions),[plan]:question}};break;
  }
 }
 return applied(next,cmd,now);
}
return Object.freeze({transition,snapshot:Canonical.snapshot,extendedTypes:Object.freeze([...extended])});
});