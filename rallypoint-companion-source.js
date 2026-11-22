/* RC1-A authorized, read-only projection of the current Rally Point fixture. */
(function(root,factory){
  'use strict';
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./rallypoint-priority-board.js'));
  else root.RallyCompanionSource=factory(root.RallyPriorityBoard);
})(typeof window==='object'?window:globalThis,function(priorityBoard){
  'use strict';

  const scopeStatus=value=>value===true?'available':value===false?'not-member':'unknown';
  const isCount=value=>Number.isSafeInteger(value)&&value>=0;
  const text=value=>typeof value==='string'&&value.trim()?value:null;

  function conversationStatus(model,groupStatus){
    if(groupStatus!=='available')return groupStatus;
    if(model.conversationStatus==='unavailable')return 'unavailable';
    if(model.conversationStatus==='no-access'||model.conversationStatus==='not-joined')return 'not-member';
    if(model.conversationStatus==='ok'&&isCount(model.conversationUnreadCount))return 'available';
    return 'unknown';
  }

  function nextDate(date,source,now){
    if(source!=='scheduled'||!(date instanceof Date)||!Number.isFinite(date.getTime())||date<now)return null;
    return date.toISOString();
  }

  function snapshot({model,now}={}){
    if(!(now instanceof Date)||!Number.isFinite(now.getTime()))throw new TypeError('A valid fixture clock is required');

    const groupStatus=scopeStatus(model?.member);
    const teamStatus=scopeStatus(model?.team);
    const group=groupStatus==='available',team=teamStatus==='available';
    const role=model?.role==='leader'?'leader':'member';
    const audience=group&&role==='leader'?'leader':group&&team?'connected':group?'group-member':team?'volunteer':'newcomer';
    const conversation=conversationStatus(model,groupStatus);
    const passage=text(model?.passage);
    const readToday=typeof model?.readToday==='boolean'?model.readToday:null;
    const scripture=passage!==null||readToday!==null;

    // Re-derive from the current scopes. An earlier board could count tasks that
    // the current viewer no longer has permission to see.
    const boardAvailable=groupStatus!=='unknown'&&teamStatus!=='unknown'&&
      (!group||conversation==='available'||conversation==='unavailable');
    const taskCount=boardAvailable?priorityBoard.derive(model,now).taskCount:null;

    return Object.freeze({
      viewer:Object.freeze({role,group,team,audience}),
      sources:Object.freeze({group:groupStatus,team:teamStatus,conversation,scripture:scripture?'available':'unknown'}),
      ...(group&&{group:Object.freeze({
        nextDate:nextDate(model.groupDate,model.groupDateSource,now),
        location:text(model.groupLocation),
        rsvp:model.rsvp==='going'||model.rsvp==='maybe'?model.rsvp:'none',
        unreadCount:conversation==='available'?model.conversationUnreadCount:null
      })}),
      ...(team&&{serving:Object.freeze({
        nextDate:nextDate(model.serveDate,model.serveDateSource,now),
        location:text(model.serveLocation),
        response:['pending','confirmed','declined'].includes(model.serveStatus)?model.serveStatus:'unknown'
      })}),
      ...(group&&role==='leader'&&isCount(model.leaderRemaining)&&{
        leadership:Object.freeze({groupCheckIns:model.leaderRemaining})
      }),
      ...(scripture&&{scripture:Object.freeze({passage,readToday})}),
      board:Object.freeze({taskCount}),
      provenance:Object.freeze([
        ...(model?['smart-dashboard']:[]),
        ...(boardAvailable?['priority-board']:[]),
        ...(group&&conversation!=='unknown'?['modern-conversation-read']:[])
      ]),
      now:now.toISOString()
    });
  }

  return Object.freeze({snapshot});
});
