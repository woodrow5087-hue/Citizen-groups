/* Today aggregates existing fixture sources; it is not a second schedule or inbox. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.RallyToday=api;})(typeof window==='object'?window:globalThis,()=>{
  'use strict';
  const UI_KEY='rallypoint-today-ui-v1';
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
  function snapshot(state,ui,now=new Date(),conversation=null){
    const events=[];
    if(ui.memberships.group)events.push({id:'group',title:'Wednesday Group',kind:'GROUP GATHERING',date:nextEvent(3,18,30,now),location:'North Commons',pane:'gather'});
    if(ui.memberships.team&&state.teamStatus!=='declined')events.push({id:'team',title:'Sunday Welcome Team',kind:'YOUR SERVING SCHEDULE',date:nextEvent(0,9,0,now),location:'North Campus',pane:'schedule'});
    events.sort((a,b)=>a.date-b.date);
    // Modern F-02 per-member read cursors take precedence in the integrated app. The legacy
    // signature remains only for compatibility with older isolated UI fixtures.
    const unread=!!ui.memberships.group&&(conversation!==null
      ? conversation.available===true && conversation.unreadCount>0
      : ui.seenGroupSignature!==signature(state));
    const pending=ui.memberships.team&&state.teamStatus==='pending';
    const remaining=['marcus','taylor'].filter(id=>!(state.reached||[]).includes(id));
    return {upNext:events[0]||null,events,unread,unreadCount:conversation?.available?conversation.unreadCount:0,pending,attention:Number(!!unread)+Number(!!pending),leader:state.role==='leader'&&ui.memberships.group&&remaining.length?{remaining,context:'group'}:null};
  }
  return {UI_KEY,initial,load,signature,nextEvent,dateLabel,snapshot};
});
