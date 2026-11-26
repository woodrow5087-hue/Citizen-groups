/* Shared Foundation context and event-bound fixture adapter. No IO, ranking or new storage owner. */
(function(root,factory){
 const node=typeof module==='object'&&module.exports;
 const api=factory(node?require('../rally-one-intelligence.js'):root.RallyIntelligence,node?require('./today-model.js'):root.FoundationToday,node?require('./member-actions.js'):root.FoundationMemberActions);
 if(node)module.exports=api;else root.FoundationMemberSession=api;
})(globalThis,function(Intelligence,Today,Actions){
'use strict';
const object=x=>!!(x&&typeof x==='object'&&!Array.isArray(x));
const types={'group-rsvp':'group','serving-response':'team','serving-coverage':'team'};
const date=d=>d instanceof Date&&Number.isFinite(d.valueOf())?d.toISOString():null;
function derive({state,ui,conversation,now=new Date(),owner='connected'}={}){
 const first=Intelligence.derive({state:{...state,rsvp:'',teamStatus:'pending',coverage:false},ui,conversation,now});
 const events={group:date(first.model.groupDate),team:date(first.model.serveDate)};
 const ids=Object.fromEntries(Object.entries(events).map(([kind,at])=>[kind,at?'fixture:'+owner+':'+kind+':north:'+at:null]));
 const history=state.eventResponses;
 const valid=history===undefined||object(history)&&history.version===1&&object(history.records)&&Object.entries(history.records).every(([id,r])=>/^fixture:/.test(id)&&object(r)&&['group','team'].includes(r.kind)&&typeof r.at==='string'&&Number.isFinite(Date.parse(r.at))&&new Date(r.at).toISOString()===r.at&&(r.kind==='group'?['','going','maybe']:['pending','confirmed','declined']).includes(r.value)&&id.includes(':'+r.kind+':north:')&&typeof r.coverage==='boolean');
 const record=kind=>valid&&history?.records[ids[kind]];
 // Unbound old responses remain preserved; a response to an unknown event is never transferred.
 const group=record('group'),team=record('team');
 const effective={...state,rsvp:group?.kind==='group'?group.value:'',teamStatus:valid?(team?.kind==='team'?team.value:state.teamStatus===undefined||['pending','confirmed','declined'].includes(state.teamStatus)?'pending':'unknown'):'unknown',coverage:team?.kind==='team'&&team.coverage===true};
 const derived=Intelligence.derive({state:effective,ui,conversation,now});
 // Assignment identity is independent of availability; keep its date visible after decline.
 const snapshot=Object.freeze({...derived,model:Object.freeze({...derived.model,serveDate:first.model.serveDate})});
 return Object.freeze({snapshot,effective,identity:Object.freeze({kind:'synthetic',id:'foundation-demo:'+owner,...snapshot.context.identity}),events:Object.freeze(ids),valid,
  unbound:valid&&((!!state.rsvp&&!group)||(['confirmed','declined'].includes(state.teamStatus)&&!team)||(state.coverage===true&&!team))});
}
function decision(session,now,serving,group){
 const view=Today.project(session.snapshot,now,serving,group);
 const items=[view.primary,...view.secondary].filter(Boolean).map(x=>({...x,requiresResponse:true,why:'An explicit response is still needed for this current fictional responsibility.',action:{kind:'go',id:x.id==='serve-response'?'team':'group'}}));
 const hero=items[0]||{id:view.paused.length?'paused':view.guest?'welcome-community':view.unavailable?'group-unavailable':view.unknownTeam?'source-unavailable':'caught-up',calm:true,why:view.summary};
 return Object.freeze({view,board:{hero,rows:items.slice(1),agenda:session.snapshot.baselineBoard.agenda,taskCount:items.length},optional:session.snapshot.focus});
}
function transition({state,ui,conversation,command,now=new Date(),owner='connected'}={}){
 const session=derive({state,ui,conversation,now,owner}),kind=types[command?.type];
 if(!session.valid)return {ok:false,reason:'malformed-event-history',state};
 if(kind&&(!session.events[kind]||command.eventId!==session.events[kind]))return {ok:false,reason:'event-changed-review-current-date',state};
 const result=Actions.transition({state:session.effective,ui,conversation,command,now});
 if(!result.ok)return result;
 const next={...result.state};
 // An unrelated action must not rewrite unbound legacy response fields.
 if(kind!=='group')next.rsvp=state.rsvp;
 if(kind!=='team'){next.teamStatus=state.teamStatus;next.coverage=state.coverage;}
 if(kind&&!state.eventResponses)next.unboundPriorResponses={rsvp:state.rsvp,teamStatus:state.teamStatus,coverage:state.coverage};
 if(kind){
  const prior=state.eventResponses?.records||{};
  next.eventResponses={version:1,records:{...prior,[session.events[kind]]:{kind,at:now.toISOString(),value:kind==='group'?next.rsvp:next.teamStatus,coverage:kind==='team'&&!!next.coverage}}};
 }
 return {...result,state:next};
}
function previewProfile(raw){
 if(raw===null)return {status:'empty'};
 try{const x=JSON.parse(raw);if(object(x)&&(!Object.hasOwn(x,'name')||!Object.hasOwn(x,'campus')))return {status:'unknown'};if(!object(x)||typeof x.name!=='string'||!['north','central','maui','online'].includes(x.campus))return {status:'malformed'};
 return {status:'ready',name:x.name.trim().slice(0,24)||'Friend',campus:x.campus};}catch{return {status:'malformed'};}
}
return Object.freeze({derive,decision,transition,previewProfile});
});
