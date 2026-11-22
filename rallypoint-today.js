/* Today aggregates existing fixture sources; it is not a second schedule or inbox. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RallyToday=api;})(typeof window==='object'?window:globalThis,()=>{
  'use strict';
  const UI_KEY='rallypoint-today-ui-v1';
  const sampleClock='2026-11-23T19:00:00.000Z';
  const occurrences=Object.freeze({
    group:Object.freeze({id:'group',title:'Wednesday Group',kind:'GROUP GATHERING',at:'2026-11-26T01:30:00.000Z',location:'North Commons',pane:'gather'}),
    team:Object.freeze({id:'team',title:'Sunday Welcome Team',kind:'YOUR SERVING SCHEDULE',at:'2026-11-29T16:00:00.000Z',location:'North Campus',pane:'schedule'})
  });
  const initial=()=>({name:'Jonathan',memberships:{group:true,team:true},seenGroupSignature:''});
  function load(storage){try{const raw=JSON.parse(storage.getItem(UI_KEY)||'null');return {...initial(),...raw,memberships:{...initial().memberships,...raw?.memberships}};}catch{return initial();}}
  function signature(state){return JSON.stringify([state.groupMessages||[],state.prayers||[]]);}
  function nextEvent(weekday,hour,minute,now=new Date()){
    const result=new Date(now);result.setHours(hour,minute,0,0);result.setDate(result.getDate()+(weekday-result.getDay()+7)%7);
    if(result<=now)result.setDate(result.getDate()+7);return result;
  }
  function dateLabel(date,now=new Date()){
    const same=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
    const tomorrow=new Date(now);tomorrow.setDate(tomorrow.getDate()+1);
    const day=same(date,now)?'Today':same(date,tomorrow)?'Tomorrow':date.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'});
    return `${day} · ${date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})}`;
  }
  function project(state,ui,now,conversation,scheduled){
    const events=[];
    const add=(id,weekday,hour,minute)=>{
      const {at,...event}=occurrences[id];
      events.push({...event,date:scheduled?new Date(at):nextEvent(weekday,hour,minute,now),
        dateSource:scheduled?'scheduled':'recurring-preview'});
    };
    if(ui.memberships.group)add('group',3,18,30);
    if(ui.memberships.team&&state.teamStatus!=='declined')add('team',0,9,0);
    events.sort((a,b)=>a.date-b.date);
    const upNext=events.find(event=>!scheduled||event.date>=now)||null;
    // Only the versioned Wednesday thread's own per-user cursor defines unread.
    // The legacy signature stays readable for old local data, but is never a read receipt.
    const unreadCount=ui.memberships.group&&conversation?.status==='ok'&&Number.isInteger(conversation.unreadCount)
      ?Math.max(0,conversation.unreadCount):0;
    const unread=unreadCount>0;
    const pending=ui.memberships.team&&state.teamStatus==='pending'&&(!scheduled||Date.parse(occurrences.team.at)>=now.getTime());
    const remaining=['marcus','taylor'].filter(id=>!(state.reached||[]).includes(id));
    return {upNext,events,unread,unreadCount,pending,attention:Number(!!unread)+Number(!!pending),leader:state.role==='leader'&&ui.memberships.group&&remaining.length?{remaining,context:'group'}:null};
  }
  function snapshot(state,ui,now=new Date(),conversation=null){
    return project(state,ui,now,conversation,false);
  }
  const companion=Object.freeze({sampleClock,occurrences,dateLabel,
    snapshot:(state,ui,now,conversation)=>project(state,ui,now,conversation,true)});
  return {UI_KEY,initial,load,signature,nextEvent,dateLabel,snapshot,companion};
});
