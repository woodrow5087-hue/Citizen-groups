/* Foundation 2: one explicit presentation projection. No HTML, IO or state writes. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.FoundationToday=api;})(globalThis,function(){
'use strict';
const freeze=Object.freeze;
const dateValue=d=>d instanceof Date&&Number.isFinite(d.valueOf())?d.valueOf():Infinity;
function project(snapshot,now,servingPreviewState,groupPreviewState){
 const m=snapshot.model,c=snapshot.context,b=snapshot.baselineBoard;
 const localGroup=c.permissions.group&&!groupPreviewState;
 const localServing=c.permissions.team&&!servingPreviewState;
 const entries=[{id:'group-rsvp',active:localGroup&&!c.group.rsvp,title:'Wednesday Group',detail:m.groupLocation,date:m.groupDate,command:'rsvp',label:'RSVP · I’m in'},{id:'serve-response',active:localServing&&c.team.response==='pending',title:'Welcome Team',detail:m.serveLocation,date:m.serveDate,command:'serve',label:'Confirm availability'},{id:'leader-checkins',active:localGroup&&c.permissions.groupLeader&&c.leader.pendingIds.length>0,title:'Leader check-ins',detail:c.leader.pendingIds.length+' sample follow-ups',date:null,command:'leader',label:'Review check-ins'}].filter(x=>x.active);
 // Deliberately explicit responsibility policy: dates order commitments; leader
 // follow-up remains discoverable even when two dated commitments precede it.
 const deferred=new Set(m.deferredIds||[]);
 const active=entries.filter(x=>!deferred.has(x.id)||(x.id==='group-rsvp'&&dateValue(x.date)-now.valueOf()<=86400000)||(x.id==='serve-response'&&dateValue(x.date)-now.valueOf()<=172800000)).sort((a,b)=>dateValue(a.date)-dateValue(b.date));
 const paused=entries.filter(x=>!active.includes(x));
 const schedule=b.agenda.filter(x=>x.id==='group'&&localGroup||x.id==='serve'&&localServing&&m.serveDate).map(x=>freeze({...x,date:x.id==='group'?m.groupDate:m.serveDate})).sort((a,b)=>dateValue(a.date)-dateValue(b.date));
 const unavailable=localGroup&&c.group.status==='unavailable',unknownTeam=localServing&&c.team.response==='unknown';
 const guest=!c.permissions.group&&!c.permissions.team;
 const calm=!active.length&&!paused.length&&!unavailable&&!unknownTeam&&!guest&&!servingPreviewState&&!groupPreviewState;
 return freeze({name:m.name||'Friend',involvement:guest?'Exploring community':(c.permissions.group&&c.permissions.team?'Group + serving team':c.permissions.group?'Group member':'Serving volunteer')+(c.permissions.groupLeader||c.permissions.teamLeader?' · Authorized leader':''),greeting:calm?'You’re all set.':guest?'Glad you’re here.':!active.length&&paused.length?'At your own pace.':m.greeting+'.',summary:active.length?active.length+' '+(active.length===1?'thing needs':'things need')+' your response':unavailable?'Your conversation needs review.':unknownTeam?'Your serving response is unavailable.':paused.length?'You have saved items for later.':guest?'Browse groups or make time to Read.':servingPreviewState?'Review your sample serving schedule below.':groupPreviewState?'Review your sample group schedule below.':'Nothing needs your response.',campus:c.identity.campus,date:m.nowLabel,calm,guest,unavailable,unknownTeam,primary:active[0]||null,secondary:freeze(active.slice(1)),paused:freeze(paused),schedule:freeze(schedule),unread:localGroup?c.group.unreadCount:null,reading:!c.reading.readToday||c.reading.intentionDue,passage:m.passage,decision:snapshot.decision,member:c.permissions.group,leaderIds:c.leader.pendingIds});
}
function commandFor(id,value){
 if(id==='rsvp')return {type:'group-rsvp',value:'going'};
 if(id==='serve')return {type:'serving-response',value:'confirmed'};
 if(id==='leader')return {type:'leader-review',person:value};
 return null;
}
return freeze({project,commandFor});
});