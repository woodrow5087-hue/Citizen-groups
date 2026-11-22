/* Companion F-08: small, explainable, deterministic local suggestion policy.
 * Separate from the earlier F-08 storage-safety milestone. No model calls, telemetry,
 * sensitive inference, notification delivery, or additional persistent storage keys.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RallyCompanionDecision=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const allowedIds=Object.freeze([
  'care-marcus','serve-response','group-unread','group-unavailable',
  'scripture-step','group-rsvp','scripture-read','prayer','group-people',
  'find-community','explore-reading'
]);
const no = (value)=>typeof value!=='string'||!value.trim();
function futureDate(value,now){
  return typeof value==='string' && Number.isFinite(Date.parse(value)) && Date.parse(value)>now.getTime();
}
function hasDeferred(state,id,now){
  const value=state?.companionChoices?.snoozedUntil?.[id];
  return futureDate(value,now);
}
function choose({state,ui,conversation,now=new Date()}={}){
  const s=state&&typeof state==='object'?state:{};
  const member=!!ui?.memberships?.group,team=!!ui?.memberships?.team;
  const chat=conversation&&typeof conversation==='object'?conversation:{status:'unavailable'};
  const care=s?.companionCare?.marcus||{};
  const source=member&&Array.isArray(s.prayers)&&s.prayers.some(p=>
    p?.name==='Marcus C.' && typeof p.text==='string' && !no(p.text));
  const options=[];
  const add=(id,overline,title,description,action,why,dest,pane='',intent='')=>{
    options.push({id,overline,title,description,action,why,dest,pane,intent});
  };
  if(source&&!care.completedAt&&!futureDate(care.snoozedUntil,now)){
    add('care-marcus','A MOMENT TO CONNECT · SAMPLE','Someone to encourage.',
      'Marcus shared a fictional prayer request with your group. Want to send a thoughtful check-in?',
      'Check in with Marcus','A named fictional group prayer request is saved on this device.',
      '','','companion-encourage');
  }
  if(team&&s.teamStatus==='pending'){
    add('serve-response','YOUR COMPANION · SERVING','Your team is counting on you.',
      'Review your sample Sunday availability.','Review my serve',
      'Your sample Welcome Team response is still pending.','team','schedule');
  }
  const unread=chat.status==='ok'&&Number.isSafeInteger(chat.unreadCount)?
    Math.max(0,chat.unreadCount):0;
  if(member&&chat.status==='ok'&&unread>0){
    add('group-unread','YOUR COMPANION · COMMUNITY','Your people have been talking.',
      unread===1?'One unread fictional group message is ready when you are.':
        unread+' unread fictional group messages are ready when you are.',
      'Catch up with my group',
      unread+' unread sent '+(unread===1?'message':'messages')+
        ' from other members, according to your modern group read cursor.',
      'group','chat');
  }
  if(member&&chat.status==='unavailable'){
    add('group-unavailable','YOUR COMPANION · LOCAL PREVIEW','Your conversation needs a look.',
      'The new group thread could not be read. Earlier saved messages are still preserved.',
      'Review the conversation','The versioned local conversation is unavailable; no read status is assumed.',
      'group','chat');
  }
  const rhythm=s.rhythm;
  if(rhythm&&typeof rhythm==='object'&&!no(rhythm.text)&&!rhythm.completedAt&&
    typeof rhythm.followUpAt==='string'&&Number.isFinite(Date.parse(rhythm.followUpAt))&&
    Date.parse(rhythm.followUpAt)<=now.getTime()){
    add('scripture-step','YOUR COMPANION · FOLLOW THROUGH','That small step you chose.',
      'Your saved Scripture intention is ready for a check-in. You decide whether to complete or defer it.',
      'Review my step','A private Scripture intention you saved is due today.','read','questions');
  }
  if(member&&s.rsvp!=='going'&&s.rsvp!=='maybe'){
    add('group-rsvp','YOUR COMPANION · WEDNESDAY','Save your place at the table.',
      'Let your fictional Wednesday Group know whether you expect to join the next gathering.',
      'Respond to my group','The local gathering RSVP has no saved response.','group','gather');
  }
  if(!s.read){
    add('scripture-read','YOUR COMPANION · SCRIPTURE','Take a moment in the Word.',
      'Continue your Scripture rhythm with your current local reading.','Open today’s reading',
      'Today’s reading has not been marked read in this demo.','read','','');
  }
  if(!s.prayed){
    add('prayer','YOUR COMPANION · PRAYER','Carry one another.',
      'Make space for a small moment of prayer today.','Open prayer',
      'The local daily prayer action is not marked complete.',
      member?'group':'read',member?'prayer':'');
  }
  if(member&&chat.status==='ok'){
    add('group-people','YOUR COMPANION · PEOPLE','A little more life, together.',
      'Your group is here between gatherings. Reach out when it feels right.',
      'See my people','You belong to the fictional Wednesday Group; this is an invitation, not an alert.',
      'group','people');
  }
  if(!member){
    add('find-community','YOUR COMPANION · COMMUNITY','There is room for you here.',
      'Explore fictional groups and see what connection could look like.',
      'Find my people','No sample group membership is enabled for this demo.','group');
  }
  add('explore-reading','YOUR COMPANION · TODAY','You showed up today.',
    'Small moments matter. There’s no streak to protect.','Explore my reading',
    'No higher-priority local suggestion is currently available.','read');
  const available=options.filter(option=>
    option.id==='care-marcus'||option.id==='explore-reading'||!hasDeferred(s,option.id,now));
  const selected=available[0]||options.at(-1);
  // F-09 can page through these already-vetted choices without changing a
  // read cursor or quietly snoozing a message. The first remains F-08's choice.
  const alternatives=available.slice(1).map(option=>Object.freeze({...option}));
  return Object.freeze({...selected,hasAlternatives:available.length>1,
    alternatives:Object.freeze(alternatives),
    deferable:selected.id!=='care-marcus'&&selected.id!=='explore-reading',
    source:'fictional local data'});
}
return Object.freeze({allowedIds,choose,hasDeferred});
});
