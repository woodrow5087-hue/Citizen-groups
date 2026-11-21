/* F-07: one read-only Groups overview derived from existing fictional sources.
 * No additional group state, message writes, or legacy data migration.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RallyGroupExperience=api;
})(typeof window!=='undefined'?window:null,function(){
  'use strict';
  const RSVP_LABELS=Object.freeze({going:'Going · saved locally',maybe:'Maybe · saved locally'});
  function snapshot(state,member,conversation){
    if(!member)return Object.freeze({visible:false});
    const chat=conversation&&typeof conversation==='object'?conversation:{status:'unavailable'};
    const status=chat.status==='ok'?'ok':'unavailable';
    const unread=status==='ok'&&Number.isSafeInteger(chat.unreadCount)?
      Math.max(0,chat.unreadCount):0;
    const rsvp=state?.rsvp==='going'||state?.rsvp==='maybe'?state.rsvp:'';
    const prayerCount=Array.isArray(state?.prayers)?state.prayers.length:0;
    const remaining=state?.role==='leader'?
      ['marcus','taylor'].filter(id=>!Array.isArray(state.reached)||!state.reached.includes(id)).length:0;
    let focus;
    if(status==='unavailable')focus={pane:'chat',eyebrow:'CONVERSATION · CHECK SAVED DATA',
      title:'Your conversation needs a look.',
      detail:'The new local thread could not be read. Earlier saved messages are still preserved.',
      action:'Review conversation'};
    else if(unread>0)focus={pane:'chat',eyebrow:'YOUR PEOPLE · NEW ACTIVITY',
      title:unread===1?'One message to catch up on.':unread+' messages to catch up on.',
      detail:'Catch up with your Wednesday Group, then pick up where you left off.',
      action:'Open conversation'};
    else if(!rsvp)focus={pane:'gather',eyebrow:'UP NEXT · WEDNESDAY GROUP',
      title:'See you Wednesday?',
      detail:'Your gathering is coming up. Let your group know whether you plan to attend.',
      action:'Respond to gathering'};
    else if(remaining>0)focus={pane:'leader',eyebrow:'LEADER VIEW · FICTIONAL CHECK-IN',
      title:remaining+' thoughtful check-in'+(remaining===1?'':'s')+' to review.',
      detail:'These sample suggestions require your judgment; they are not automated assessments.',
      action:'Review leader tools'};
    else focus={pane:'people',eyebrow:'YOUR PEOPLE · BETWEEN GATHERINGS',
      title:'Keep the connection going.',
      detail:'You are caught up with the conversation. Say hello to someone in your group.',
      action:'See your people'};
    return Object.freeze({
      visible:true,status,unreadCount:unread,rsvp,
      rsvpLabel:RSVP_LABELS[rsvp]||'Your response is open',
      prayerCount,remaining,
      messageLabel:status!=='ok'?'Preview unavailable':
        unread>0?unread+' unread':'Conversation caught up',
      focus:Object.freeze(focus)
    });
  }
  return Object.freeze({snapshot});
});
