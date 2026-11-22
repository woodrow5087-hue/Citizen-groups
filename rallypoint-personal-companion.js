/* F-10 Personal Companion Lab.
 * Deterministic, explainable responses from existing fictional local fixture state.
 * No LLM, network, telemetry, new storage, read receipts or unsolicited actions.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RallyPersonalCompanion=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const prompts=Object.freeze([
 Object.freeze({id:'week',label:'What’s happening this week?'}),
 Object.freeze({id:'next',label:'What needs my attention?'}),
 Object.freeze({id:'group',label:'My group'}),
 Object.freeze({id:'serve',label:'Serving'}),
 Object.freeze({id:'scripture',label:'Scripture'}),
 Object.freeze({id:'why',label:'Why this priority?'})
]);
const ids=new Set(prompts.map(x=>x.id));
const safeDate=(d,now)=>d instanceof Date&&Number.isFinite(d.getTime())&&d>=now;
const formatDate=(d)=>d.toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})+
 ' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
const go=(id,pane,label)=>Object.freeze({kind:'go',id,pane:pane||'',label});
const direct=(id,label)=>Object.freeze({kind:'confirm',id,label});
const item=(title,detail,reason,action=null)=>Object.freeze({title,detail,reason,action});
const sourceNote='Fictional sample activity on this device only. No church accounts, messages or calendar are connected.';
function classify(value){
 const text=String(value||'').trim().slice(0,160).toLowerCase();
 if(ids.has(text))return text;
 // “Take care of this week” asks for decisions, not just calendar entries.
 if(/\b(need to|take care of|must|should|tasks?|action items?|handle|to do)\b/.test(text)&&
    /\b(week|today|tomorrow|next)\b/.test(text))return 'next';
 if(/\b(why|reason|priorit|first|shown|recommend)/.test(text))return 'why';
 if(/\b(serv\w*|shift|volunteer|welcome team)/.test(text))return 'serve';
 if(/\b(scripture|bible|reading|verse|prayer|pray|intention)/.test(text))return 'scripture';
 if(/\b(group|people|community|message|conversation|rsvp)/.test(text))return 'group';
 if(/\b(week|schedule|calendar|upcoming|event|when)/.test(text))return 'week';
 if(/\b(next|attention|today|do|priority|task|now)/.test(text))return 'next';
 return 'unknown';
}
function answer(query,{model,board,now=new Date()}={}){
 const d=model&&typeof model==='object'?model:{};
 const b=board&&typeof board==='object'?board:{hero:{},rows:[],agenda:[],taskCount:0};
 const intent=classify(query);
 const hasGroup=!!d.member,hasTeam=!!d.team;
 const items=[];
 let heading='',intro='';
 let note=sourceNote;
 const push=(title,detail,reason,action)=>items.push(item(title,detail,reason,action));
 const schedule=(date)=>safeDate(date,now)?formatDate(date):'No upcoming fixture date available';
 if(intent==='week'){
  heading='Your week, at a glance.';
  intro='Here are the scheduled sample gatherings and commitments currently visible to your profile.';
  if(hasGroup&&safeDate(d.groupDate,now)){
   push('Wednesday Group · '+formatDate(d.groupDate),
    (d.groupLocation||'Sample group gathering')+' · '+(!d.rsvp?'RSVP open':d.rsvp==='going'?'Going':'Maybe'),
    'Your local demo includes Wednesday Group membership.',
    go('group','gather','See gathering'));
  }
  if(hasTeam&&d.serveStatus!=='declined'&&safeDate(d.serveDate,now)){
   push('Welcome Team · '+formatDate(d.serveDate),
    (d.serveLocation||'Sample Sunday shift')+' · '+(d.serveStatus==='pending'?'Response needed':d.serveStatus==='confirmed'?'Confirmed':'Schedule'),
    'Your local demo includes Welcome Team membership.',
    go('team','schedule','See schedule'));
  }
  if(!items.length)push('No sample commitments scheduled','You can explore community or serving without joining anything.',
    'Your local demo currently has no group or team schedule.',
    go('group','','Explore groups'));
  if(b.taskCount>0)intro+=' You also have '+b.taskCount+' sample '+(b.taskCount===1?'item':'items')+' needing attention.';
 }else if(intent==='next'){
  heading='What needs your attention.';
  const required=[];
  if(b.hero&&!b.hero.calm&&b.hero.id!=='paused'&&b.hero.id!=='welcome-community'&&b.taskCount>0){
   required.push(b.hero);
  }
  for(const r of b.rows||[])if(r.requiresResponse&&!required.some(x=>x.id===r.id))required.push(r);
  intro=b.taskCount>0?
    'These are response-needed items from your existing fictional profile—not a measure of participation or spiritual health.':
    'Nothing in your sample commitments needs a response right now. There’s no streak or pressure to create more tasks.';
  for(const r of required){
   let action=r.action||r.primary||null;
   let label=r.label||r.heroLabel||'Open';
   if(r.id==='group-rsvp')action=direct('rsvp','RSVP · I’m in');
   else if(r.id==='serve-response')action=direct('serve','Confirm serving');
   else if(action&&action.kind==='go')action=go(action.id,action.pane,label);
   else if(action&&action.kind==='action')action=null;
   push(r.title,r.detail||r.subtitle||'Review this sample action',
    r.why||'This request is still open in your saved demo activity.',action);
  }
  if(required.length<b.taskCount){
   push('More sample items are available','Open the Priority Board for the full visible action list.',
     'Additional source-backed items may be shown in the Today board.',null);
  }
  if(!required.length)push('You’re all caught up','You can still enjoy Scripture or connect with your people.',
    'No required response is currently outstanding.',go('read','','Explore Scripture'));
 }else if(intent==='group'){
  heading='Your group, your people.';
  if(!hasGroup){
   intro='You are not part of a sample group in this demo.';
   push('Explore community','No private group updates, RSVP or people details are shown without membership.',
     'Group membership is disabled in this profile.',go('group','','Find a group'));
  }else{
   intro='Your sample Wednesday Group information comes from local membership and the modern conversation read cursor.';
   push('Next gathering · '+schedule(d.groupDate),d.groupLocation||'North Commons',
     'The next Wednesday gathering comes from the local fixture schedule.',
     go('group','gather','See group details'));
   if(!d.rsvp)push('RSVP is open','Let the sample group know you’re coming.',
     'Your local RSVP has no saved response.',direct('rsvp','RSVP · I’m in'));
   if(d.conversationStatus==='unavailable')push('Conversation needs review','The thread could not be read; no unread count is assumed.',
     'The modern conversation source is unavailable.',go('group','chat','Review conversation'));
   else push(d.unread>0?d.unread+' unread sample '+(d.unread===1?'message':'messages'):'Group conversation',
     d.unread>0?'Open the conversation to read and acknowledge updates.':'No unread updates are recorded.',
     'Only the modern group read cursor determines unread count; older messages are preserved.',
     go('group','chat','Open conversation'));
  }
 }else if(intent==='serve'){
  heading='Your serving rhythm.';
  if(!hasTeam){
   intro='Your demo profile has no assigned team or serving shift.';
   push('Explore serving','You can look at sample teams without a commitment.',
     'No team membership is enabled for this local profile.',go('team','','Explore teams'));
  }else{
   intro='This is your current fictional Welcome Team commitment.';
   const label=d.serveStatus==='pending'?'Response needed':d.serveStatus==='confirmed'?'Confirmed':
    d.serveStatus==='declined'?'Declined':'No upcoming response';
   push('Welcome Team · '+label,
     d.serveStatus==='declined'?'You declined the sample shift.':schedule(d.serveDate)+(d.serveLocation?' · '+d.serveLocation:''),
     'This status comes from your saved sample team response.',
     d.serveStatus==='pending'?direct('serve','Confirm serving'):go('team','schedule','Open schedule'));
   if(d.serveStatus==='pending')note='Confirm means “I can serve” in this browser-only fixture. To decline, open Team instead. '+sourceNote;
  }
 }else if(intent==='scripture'){
  heading='Your Scripture rhythm.';
  intro='Your reading and saved follow-through are private local choices, never an attendance or engagement score.';
  if(d.rhythmDue)push('Your saved step is due','Review the Scripture intention you chose earlier.',
    'Your private intention has reached its saved follow-up date.',go('read','','Review saved step'));
  else push(d.readToday?'Reading marked complete':'Today’s reading is available',
    d.passage||'Open your reading',
    d.readToday?'You marked this reading as read in this demo.':'No reading completion is recorded yet.',
    go('read','','Open Scripture'));
  if(!d.rhythmDue&&d.readToday)intro+=' You do not need to do anything else to keep a streak.';
 }else if(intent==='why'){
  heading='Why this appears first.';
  intro=b.hero?.why||'The board uses only current saved, fictional commitments and explicit responses.';
  push(b.hero?.title||'Your next step',
    b.hero?.subtitle||'Current local recommendation',
    'The board prioritizes unanswered time-sensitive commitments over optional invitations. It never infers spiritual health.',
    b.hero?.primary?.kind==='go'?go(b.hero.primary.id,b.hero.primary.pane,'Open next step'):null);
 }else{
  heading='Here’s what I can help with.';
  intro='This prototype understands a few specific questions about sample church activities. It does not generate open-ended AI responses.';
  push('Try a question below','Ask about your week, next actions, group, serving, Scripture or why a priority appears.',
    'Only these topics are implemented with local fixture data.',null);
 }
 return Object.freeze({intent,heading,intro,items:Object.freeze(items),note});
}
/* F-10.1: short source-scoped follow-ups within the OPEN sheet only.
 * Prior conversation helps interpret words, never grants access.
 * Every answer is derived from CURRENT profile and fixtures.
 */
const followKeys=Object.freeze({
 'group-time':'What time is Wednesday Group?',
 'serve-time':'What time am I serving Sunday?',
 'group-where':'Where does my group meet?',
 'serve-where':'Where am I serving?',
 'group-confirm':'Can I RSVP for my group?',
 'serve-confirm':'Can I confirm my serving shift?',
 'why-first':'Why is this first?',
 'week':'What’s happening this week?',
 'next':'What needs my attention?',
 'group':'My group',
 'serve':'Serving',
 'scripture':'Scripture'
});
const followIds=new Set(Object.keys(followKeys));
const topicOf=(r,board)=>{
 if(r?.topic)return r.topic;
 if(r?.intent==='group')return 'group';
 if(r?.intent==='serve')return 'serve';
 if(r?.intent==='scripture')return 'scripture';
 if(r?.intent==='next'||r?.intent==='why'){
  const id=String(board?.hero?.id||'');
  if(id==='group-rsvp'||id.startsWith('group-'))return 'group';
  if(id==='serve-response')return 'serve';
 }
 return '';
};
const suggestions=(topic,model={})=>{
 const group=!!model.member,team=!!model.team;
 if(topic==='group'&&group)return ['group-time','group-where','group-confirm'];
 if(topic==='serve'&&team)return ['serve-time','serve-where','serve-confirm'];
 if(topic==='week'||topic==='')return [
  ...(group?['group-time']:[]),
  ...(team?['serve-time']:[]),
  'next'
 ].slice(0,3);
 if(topic==='scripture')return ['next',...(group?['group-time']:[]),...(team?['serve-time']:[])];
 return ['why-first',...(group?['group-time']:[]),...(team?['serve-time']:[])].slice(0,3);
};
function respond(raw,sources={},prior={}){
 const query=String(raw||'').trim().slice(0,160);
 const d=sources.model||{},b=sources.board||{},now=sources.now instanceof Date?sources.now:new Date();
 const previous=prior&&typeof prior==='object'?prior:{};
 const lower=query.toLowerCase();
 const key=followIds.has(query)?query:null;
 const shorthand=/^\s*(and|what about|how about)\s+(sunday|wednesday)(?:\s+too)?[!?\.]*$/i.exec(query);
 const known=key?followKeys[key]:shorthand?(shorthand[2].toLowerCase()==='sunday'?'Serving':'My group'):query;
 const subject=key?.startsWith('group-')?'group':key?.startsWith('serve-')?'serve':'';
 const explicitGroup=/\b(group|wednesday|rsvp|gathering)\b/.test(lower);
 const explicitServe=/\b(sunday|serv(?:e|ing|ice)|shift|volunteer|welcome team)\b/.test(lower);
 const explicitScripture=/\b(scripture|bible|reading|verse)\b/.test(lower);
 let focus=subject||(explicitServe&&!explicitGroup?'serve':explicitGroup&&!explicitServe?'group':
   explicitScripture?'scripture':'');
 const inherited=previous.focus&&['group','serve','scripture'].includes(previous.focus)?previous.focus:'';
 const isTime=!!(key&&key.endsWith('-time'))||
    /\b(what time|what hour|when is it|when does it|when am i|what's the time)\b/.test(lower);
 const isWhere=!!(key&&key.endsWith('-where'))||
    /\b(where|what location|which campus|what campus)\b/.test(lower);
 const isConfirm=!!(key&&key.endsWith('-confirm'))||
    /\b(confirm|rsvp|sign me up|respond|say yes)\b/.test(lower)||
    /^(yes|sure|okay|ok|yep|let's do it)[.!?]*$/.test(lower);
 const isShortWhy=/^(why|how come|why that|why this)[.!?]*$/.test(lower);
 const isFollowup=isTime||isWhere||isConfirm||isShortWhy;
 if(!focus&&isFollowup)focus=inherited;
 const source=sourceNote;
 const itemFor=(title,detail,reason,action=null)=>item(title,detail,reason,action);
 function result(heading,intro,items,topic='',extra={}){
  const response=Object.freeze({intent:'followup',heading,intro,
    items:Object.freeze(items),note:source,topic,...extra});
  return Object.freeze({query:known,response,
    context:Object.freeze({intent:response.intent,focus:topic||''}),
    suggestions:Object.freeze(suggestions(topic||'week',d))});
 }
 // A week-wide question can have two commitments. Clarify a pronoun.
 if(isFollowup&&!focus&&(d.member||d.team)){
  const candidates=[];
  if(d.member)candidates.push(itemFor('Wednesday Group','Ask about your sample gathering time or RSVP.',
    'This is a separate sample gathering.',go('group','gather','See gathering')));
  if(d.team)candidates.push(itemFor('Sunday Welcome Team','Ask about your sample serving time or confirmation.',
    'This is a separate sample commitment.',go('team','schedule','See schedule')));
  if(candidates.length>1)return result('Which one do you mean?',
    'I can help with Wednesday Group or Sunday serving. Choose a follow-up below; nothing has been changed.',
    candidates,'week',{clarify:true});
  focus=d.member?'group':'serve';
 }
 if(isFollowup&&focus==='group'){
  if(!d.member)return result('Your group isn’t linked in this demo.',
    'There is no sample group membership for your current profile.',
    [itemFor('Explore sample groups','No group RSVP or private conversation is available.',
      'This profile has no group membership.',go('group','','Find a group'))],'group');
  if(isTime||isWhere)return result(isTime?'Your Wednesday gathering.':'Where your group meets.',
    isTime?'Your next fictional Wednesday Group gathering is '+(d.groupDate instanceof Date&&d.groupDate>=now?formatDate(d.groupDate):'not scheduled')+'.':
      'Your sample group meets at '+(d.groupLocation||'the location shown in Groups')+'.',
    [itemFor('Wednesday Group',
      (d.groupDate instanceof Date&&d.groupDate>=now?formatDate(d.groupDate):'No upcoming fixture date')+
      ' · '+(d.groupLocation||'Location not available'),
      'This comes from the local group fixture, not a live church calendar.',
      go('group','gather','Group details'))],'group');
  if(isConfirm)return result('Your group RSVP.',
    d.rsvp?'You already have a sample RSVP response: '+(d.rsvp==='going'?'Going':'Maybe')+'.':
      'You can mark yourself Going, but only by tapping the RSVP button below.',
    [itemFor(d.rsvp?'RSVP already saved':'RSVP for Wednesday Group',
      d.rsvp?'No additional action is needed.':'This confirms Going on this device only.',
      'A spoken or typed “yes” never completes an RSVP.',
      d.rsvp?go('group','gather','See RSVP'):direct('rsvp','RSVP · I’m in'))],'group');
  if(isShortWhy)return result('Why your group was mentioned.',
    'The board considers an unanswered sample RSVP and unread modern messages when ranking actions.',
    [itemFor('Your group status',d.rsvp?'RSVP: '+d.rsvp:'RSVP is open',
      'These are explicit fixture records, not a judgment about you.',go('group','gather','Group details'))],'group');
 }
 if(isFollowup&&focus==='serve'){
  if(!d.team)return result('You have no sample serving assignment.',
    'Your current profile does not include a team membership.',
    [itemFor('Explore serving','There is nothing to confirm.',
      'No sample shift has been assigned.',go('team','','Explore serving'))],'serve');
  if(isTime||isWhere)return result(isTime?'Your Sunday shift.':'Your serving location.',
    isTime?'Your sample Welcome Team shift is '+(d.serveDate instanceof Date&&d.serveDate>=now?formatDate(d.serveDate):'not scheduled')+'.':
      'The sample shift is at '+(d.serveLocation||'the campus shown on Team')+'.',
    [itemFor('Welcome Team',
      (d.serveDate instanceof Date&&d.serveDate>=now?formatDate(d.serveDate):'No upcoming fixture date')+
      ' · '+(d.serveLocation||'Location not available'),
      'This comes from your fictional team fixture, not a live roster.',
      go('team','schedule','See schedule'))],'serve');
  if(isConfirm)return result('Your serving response.',
    d.serveStatus==='pending'?
      'You can confirm the sample shift by tapping the button below. A typed “yes” is not enough.':
      d.serveStatus==='confirmed'?'Your sample shift is already confirmed.':
      d.serveStatus==='declined'?'You declined this sample shift.':
      'There is no open sample confirmation for this shift.',
    [itemFor('Welcome Team · '+(d.serveStatus==='pending'?'Response open':d.serveStatus||'Schedule'),
      'Confirm means “I can serve” in this local demo. To decline, open Team.',
      'Only a deliberate tap can change this saved response.',
      d.serveStatus==='pending'?direct('serve','Confirm serving'):go('team','schedule','See schedule'))],'serve');
  if(isShortWhy)return result('Why serving appeared.',
    'A sample shift needs a response only while your saved availability is pending.',
    [itemFor('Welcome Team',d.serveStatus||'No response found',
      'This is sourced from your saved team status.',go('team','schedule','Team details'))],'serve');
 }
 if(isShortWhy&&focus==='scripture'){
  const base=answer('scripture',sources);
  return result('Why Scripture was mentioned.',
    'Scripture suggestions reflect only your saved reading state or follow-through intention.',
    base.items,'scripture');
 }
 const response=answer(known,sources);
 focus=subject||topicOf(response,b)||focus;
 return Object.freeze({query:known,response,
  context:Object.freeze({intent:response.intent,focus}),
  suggestions:Object.freeze(suggestions(focus||response.intent,d))});
}

function render(response,asked='',notice='',history=[],suggested=[]){
 const r=response||answer('unknown');
 const chips=prompts.map(p=>
  '<button type="button" class="f10-chip" data-action="f10-ask" data-value="'+esc(p.id)+'">'+esc(p.label)+'</button>'
 ).join('');
 const followups=(Array.isArray(suggested)?suggested:[])
  .filter((id,i,arr)=>followIds.has(id)&&arr.indexOf(id)===i).slice(0,3)
  .map(id=>'<button type="button" class="f10-followup" data-action="f10-followup" data-value="'+esc(id)+'">'+
    esc(followKeys[id])+'</button>').join('');
 const older=(Array.isArray(history)?history:[]).slice(-3).map(turn=>
  '<div class="f10-earlier-turn"><p class="f10-earlier-question">'+esc(String(turn.asked||'').slice(0,160))+'</p>'+
  '<p class="f10-earlier-reply">'+esc(String(turn.heading||'').slice(0,100))+
   (turn.intro?' · '+esc(String(turn.intro).slice(0,120)):'')+'</p></div>'
 ).join('');
 const notes=notice?'<p class="f10-notice" role="status" aria-live="polite">'+esc(notice.slice(0,180))+'</p>':'';
 const question=asked?'<p class="f10-question"><span>You asked</span>'+esc(asked.slice(0,160))+'</p>':'';
 const cards=r.items.map(x=>{
  const action=x.action;
  const allowed=action&&(['go','confirm'].includes(action.kind));
  const control=allowed?
   '<button type="button" class="f10-route" '+(action.kind==='go'?
      'data-go="'+esc(action.id)+'"'+(action.pane?' data-pane="'+esc(action.pane)+'"':''):
      'data-action="f10-confirm" data-value="'+esc(action.id)+'"')+'>'+
      esc(action.label||'Open')+' <span aria-hidden="true">›</span></button>':'';
  return '<div class="f10-result-card"><div><strong>'+esc(x.title)+'</strong>'+
   '<p>'+esc(x.detail)+'</p><details><summary>Why this?</summary><p>'+esc(x.reason)+'</p></details></div>'+control+'</div>';
 }).join('');
 return '<div class="f10-panel f10-conversation" aria-label="Ask Rally local companion">'+
  '<div class="f10-intro"><div class="f10-local-dot" aria-hidden="true"></div><span>ASK RALLY · LOCAL PREVIEW</span></div>'+
  '<p class="f10-helper">We can stay on the same topic. Try “What time?” or “And Sunday?” after a question.</p>'+
  (older?'<div class="f10-earlier" role="region" tabindex="0" aria-label="Earlier messages in this session">'+older+'</div>':'')+
  notes+question+
  '<section class="f10-response" aria-live="polite" aria-label="Companion answer">'+
   '<h3>'+esc(r.heading)+'</h3><p class="f10-response-intro">'+esc(r.intro)+'</p>'+
   '<div class="f10-results">'+cards+'</div></section>'+
  (followups?'<div class="f10-followups" aria-label="Possible follow-up questions">'+
   '<span>YOU CAN ASK NEXT</span><div class="f10-followup-list">'+followups+'</div></div>':'')+
  '<form data-form="f10-query" class="f10-query-form">'+
  '<label for="f10-query">Your next question</label><div class="f10-input-line">'+
  '<input id="f10-query" name="question" type="text" maxlength="160" autocomplete="off" placeholder="Ask a follow-up...">'+
  '<button type="submit">Ask</button></div></form>'+
  '<details class="f10-topics"'+(!asked?' open':'')+'><summary>Explore other topics</summary>'+
   '<div class="f10-chips" aria-label="Suggested questions">'+chips+'</div></details>'+
  '<p class="f10-disclosure">'+esc(r.note)+'</p>'+
  '</div>';
}
return Object.freeze({prompts,classify,answer,respond,followKeys,render});
});