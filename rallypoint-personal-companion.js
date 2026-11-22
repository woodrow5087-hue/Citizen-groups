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
 if(/\b(why|reason|priorit|first|shown|recommend)/.test(text))return 'why';
 if(/\b(serv|shift|volunteer|welcome team)/.test(text))return 'serve';
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
function render(response,asked='',notice=''){
 const r=response||answer('unknown');
 const chips=prompts.map(p=>'<button type="button" class="f10-chip" data-action="f10-ask" data-value="'+esc(p.id)+'">'+esc(p.label)+'</button>').join('');
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
 return '<div class="f10-panel" aria-label="Ask Rally local companion">'+
  '<div class="f10-intro"><div class="f10-local-dot" aria-hidden="true"></div><span>PERSONAL COMPANION · LOCAL PREVIEW</span></div>'+
  '<p class="f10-helper">Ask about your week, people, serving or next step.</p>'+
  '<form data-form="f10-query" class="f10-query-form">'+
  '<label for="f10-query">Your question</label><div class="f10-input-line">'+
  '<input id="f10-query" name="question" type="text" maxlength="160" autocomplete="off" placeholder="What do I need to do this week?">'+
  '<button type="submit">Ask</button></div></form>'+
  '<div class="f10-chips" aria-label="Suggested questions">'+chips+'</div>'+notes+question+
  '<section class="f10-response" aria-live="polite" aria-label="Companion answer">'+
   '<h3>'+esc(r.heading)+'</h3><p class="f10-response-intro">'+esc(r.intro)+'</p>'+
   '<div class="f10-results">'+cards+'</div></section>'+
  '<p class="f10-disclosure">'+esc(r.note)+'</p>'+
  '</div>';
}
return Object.freeze({prompts,classify,answer,render});
});