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
// Only the current canonical care projection may supply a care navigation control.
function careRoute(d,id,action){
 const ctx=d.memberContext;
 if(ctx?.permissions?.group!==true||action?.kind!=='action')return null;
 if(id==='care-prayer'&&ctx.care?.status==='ready'&&action.id==='care-open-prayer')
  return Object.freeze({kind:'care-route',id,label:'Read prayer'});
 if(id==='care-check-in'&&ctx.care?.status==='prayed'&&action.id==='companion-encourage')
  return Object.freeze({kind:'care-route',id,label:'Write a check-in'});
 return null;
}
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
// 10C.4E-R: conservative, bounded text guard; not a clinical assessment.
// Explicit language only. No attendance-based inference or automatic escalation.
function normalizeQuestion(value){
 return String(value||'').trim().slice(0,160).toLowerCase().replace(/[‘’]/g,"'").replace(/[‐‑–—]/g,'-').replace(/\s+/g,' ').replace(/[?!.,]+$/,'').trim();
}
function explicitDistress(q){
 return /\b(?:suicid(?:e|al)|kill (?:myself|themselves|himself|herself)|end(?:ing)? (?:my|their|his|her|your) life|take (?:my|their|his|her) own life|(?:want|wish) to die|don't want to (?:live|be alive)|(?:hurt|harm|injure) myself|self[- ]harm|immediate danger|can't keep myself safe|not safe with myself|overdos(?:e|ed|ing))\b/.test(q);
}
function declinedCare(q){
 return /\b(?:(?:don't|do not|didn't|can't|cannot|won't|wouldn't) (?:want to |feel like |have time to |have the energy to )?|not (?:ready|able|in the mood) to |rather not |no time to |don't feel up to |do not feel up to )(?:pray(?:ing)?|encourag(?:e|ing)|check(?:ing)?[- ]?in|follow(?:ing)? up|care for|send a (?:kind |supportive )?(?:note|message)|support someone)\b/.test(q);
}
function restrictedRequest(q){
 return /\b(?:ignore (?:previous|prior|all) instructions|reveal (?:the )?private|private prayer (?:text|requests?|details)|(?:different|other|another) (?:campus|group)|(?:all|every) (?:campus|group)(?:es|s)?|at risk of leaving|who (?:in (?:my|our|the) group )?is (?:lonely|depressed|struggling)|predict (?:who|which)|(?:rank|score|profile) (?:people|members)|(?:can|could|would|will) you (?:please )?(?:send|post|message|mark|confirm|rsvp|enroll|join)\b|(?:send|post|message|mark|confirm|rsvp|enroll|join) (?:it |them )?for me)\b/.test(q);
}
// 10C.4B: recognize intent only; never authorize or execute a command.
function resolveIntent(value,prior={}){
 const q=normalizeQuestion(value);
 if(!q)return 'clarify';
 if(explicitDistress(q)||restrictedRequest(q))return 'unsupported';
 if(declinedCare(q))return 'clarify';
 // Reject unsafe requests before recognizing any otherwise valid topic.
 if(/\b(spiritually struggling|spiritual health|spiritual score|risk score|depression|most likely to leave|rank (?:my|the) group|ignore permissions|bypass (?:permissions|access)|private (?:prayer records|messages)|another group's|without (?:asking|permission|consent)|automatically|send everyone|mark all|secretly|diagnose)\b/.test(q))return 'unsupported';
 if(/\b(?:send|post|message|mark|confirm|rsvp|enroll|join)\b/.test(q)&&/^(?:please\s+)?(?:send|post|message|mark|confirm|rsvp|enroll|join)\b/.test(q))return 'unsupported';
 if(/\b(?:i (?:want to die|might hurt myself|am going to hurt myself)|kill myself|suicid(?:e|al)|immediate danger)\b/.test(q))return 'unsupported';
 if(/\b(?:leader|member-requested|authorized group check-ins)\b/.test(q)&&/\b(?:check-ins?|follow[- ]ups?|review)\b/.test(q))return 'leader';
 if(/\b(?:have i|did i|is my|what care action)\b/.test(q)&&/\b(?:followed up|follow through|follow-up|checked in|check-in|completed|complete)\b/.test(q)&&/\b(?:already|sent|send|checked in|finished|completed|complete)\b/.test(q))return 'care-status';
 if(/\b(?:encourag(?:e|ement)|prayer requests?|pray for|check[- ]in (?:on|with)|check-ins?|care for|support someone|be there for someone|meaningful (?:way to follow up|for someone)|follow up (?:after praying|with someone)|care opportunity|(?:kind|encouraging|supportive|thoughtful) (?:note|message) to (?:someone|somebody)|(?:write|send) (?:a )?(?:kind|encouraging|supportive|thoughtful) (?:note|message))\b/.test(q))return 'care';
 if(/\b(?:get (?:more )?connected|feel (?:more )?connected|meet (?:some )?people|where do i start|new here|find (?:a group|my people|my next connection)|get (?:back )?involved|reconnect with my group|spend time with my people|start connecting|belong here|connect with my community|make (?:some )?friends|meet (?:new )?friends|find (?:some )?friends|just moved here)\b/.test(q))return 'connect';
 // A new explicit domain outranks an inherited conversational referent.
 if(/\b(?:group|wednesday|rsvp|gathering|sunday|serv(?:e|ing|ice)|shift|volunteer|welcome team|scripture|bible|reading|verse)\b/.test(q))return 'legacy';
 if(prior?.focus==='care'&&/^(?:haven't i already done that|have i already done that|did i already do that|did i do that|is that done|have i prayed already|did i already pray|have i already prayed|did i send it)$/.test(q))return 'care-status';
 if(prior?.focus==='care'&&/^(?:what can i do next|what about that|how can i follow up|why this suggestion|why did you suggest that person|(?:can|could|may) i (?:read|see|review) (?:the|that) request|what about them|how about it|what did (?:he|she|they) ask for prayer about|what is the request|what did they share)$/.test(q))return 'care';
 if(/^(?:what about (?:them|that)|can you do that|how about it|is that done)$/.test(q))return 'clarify';
 if(/\b(?:focus on|next steps?|needs my attention|busy week|what's important|needs a response|prioriti[sz]e|take care of (?:today|first)|outstanding|overwhelmed by my commitments|narrow down what matters|anything to review|what matters (?:right now|most)|caught up|what should i tackle first|what is most important|what's most important)\b/.test(q))return 'focus';
 return 'legacy';
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
  // Week retains the broader commitment overview; next uses the focused Today count.
  const weeklyTaskCount=b.weeklyTaskCount??b.taskCount;
  if(weeklyTaskCount>0)intro+=' You also have '+weeklyTaskCount+' sample '+(weeklyTaskCount===1?'item':'items')+' needing attention.';
 }else if(intent==='next'){
  heading='What needs your attention.';
  const required=[];
  if(b.hero&&!b.hero.calm&&b.hero.id!=='paused'&&b.hero.id!=='welcome-community'&&b.taskCount>0){
   required.push(b.hero);
  }
  for(const r of b.rows||[])if(r.requiresResponse&&!required.some(x=>x.id===r.id))required.push(r);
  const includesCare=required.some(r=>['care-prayer','care-check-in'].includes(r.id));
  intro=includesCare?
    'These are the same current priorities shown on Today. Prayer and personal check-ins are optional; nothing is sent automatically.':b.taskCount>0?
    'These are response-needed items from your existing fictional profile—not a measure of participation or spiritual health.':
    'Nothing in your sample commitments needs a response right now. There’s no streak or pressure to create more tasks.';
  for(const r of required){
   let action=r.action||r.primary||null;
   let label=r.label||r.heroLabel||'Open';
   if(r.id==='group-rsvp')action=direct('rsvp','RSVP · I’m in');
   else if(r.id==='serve-response')action=direct('serve','Confirm serving');
   else if(action&&action.kind==='go')action=go(action.id,action.pane,label);
   else if(action&&action.kind==='action')action=careRoute(d,r.id,action);
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
    b.hero?.primary?.kind==='go'?go(b.hero.primary.id,b.hero.primary.pane,'Open next step'):careRoute(d,b.hero?.id,b.hero?.primary));
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
 'scripture':'Scripture',
 'goal-group':'Help me get ready for Wednesday',
 'goal-serve':'Help me prepare for serving Sunday',
 'goal-connect':'How can I get connected?',
 'goal-check':'Do I need to take care of anything?'
});
const followIds=new Set(Object.keys(followKeys));
const goalIds=new Set(['goal-group','goal-serve','goal-connect','goal-check']);
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

/* F-10.3: current-source goal plans, never inferred commitments or silent actions. */
function goalPlan(goal,sources,d,b,now){
 const items=[],push=(a,v,why,action=null)=>items.push(item(a,v,why,action));
 if(goal==='goal-group'){
  if(!d.member){push('Explore groups','No joined group is recorded for this sample profile.','Membership gates private details.',go('group','','Explore groups'));
   return {heading:'Start with a group.',intro:'Exploring does not enroll you.',items,topic:'community'};}
  const upcoming=safeDate(d.groupDate,now);
  push('Wednesday Group',upcoming?formatDate(d.groupDate)+' · '+(d.groupLocation||'Location unavailable'):'No upcoming sample gathering date is available.',
   'The authorized current group fixture supplies date and place.',go('group','gather','See gathering'));
  if(upcoming&&!d.rsvp)push('RSVP remains open','You can choose Going using this separate button.','No response is saved. Asking never changes it.',direct('rsvp','RSVP · I’m in'));
  else push('Your RSVP',d.rsvp==='going'?'Going is saved.':d.rsvp?'Your response is saved.':'No upcoming RSVP is available.',
   'Current sample RSVP and date are checked.',go('group','gather','Review RSVP'));
  if(d.conversationStatus==='unavailable')push('Group conversation unavailable','Check the conversation in Groups; an unread count cannot be assumed.','Modern conversation source unavailable.',go('group','chat','Open conversation'));
  else if(d.conversationStatus==='ok'&&Number.isFinite(d.unread)&&d.unread>0)push('Group updates',d.unread+' unread sample '+(d.unread===1?'message':'messages')+'.','Modern authorized read cursor only; this answer does not mark anything read.',go('group','chat','Open conversation'));
  return {heading:'Get ready for Wednesday.',intro:'Your current sample gathering details and optional next steps. Nothing has been completed for you.',items,topic:'group'};
 }
 if(goal==='goal-serve'){
  if(!d.team){push('Explore serving','No team assignment is linked to your sample profile.','Team membership gates private shifts.',go('team','','Explore teams'));
   return {heading:'Explore serving.',intro:'Browsing cannot accept a shift.',items,topic:'community'};}
  const upcoming=safeDate(d.serveDate,now);
  push('Welcome Team',upcoming?formatDate(d.serveDate)+' · '+(d.serveLocation||'Location unavailable'):'No upcoming sample shift date is available.',
   'Authorized team fixture supplies schedule and location.',go('team','schedule','See schedule'));
  const status=d.serveStatus==='confirmed'?'Confirmed':d.serveStatus==='declined'?'Declined':d.serveStatus==='pending'?'Response pending':'No response available';
  push('Your serving response',status,'Current saved response; a typed yes cannot commit a shift.',
   upcoming&&d.serveStatus==='pending'?direct('serve','Confirm serving'):go('team','schedule','Review schedule'));
  return {heading:'Get ready to serve.',intro:'Review your sample assignment before choosing any action.',items,topic:'serve'};
 }
 if(goal==='goal-connect'){
  push(d.member?'Your group':'Find a group',d.member?'Reconnect with your own group.':'Explore sample groups without joining automatically.',
   'Current membership determines what you can open.',go('group','',d.member?'Open group':'Explore groups'));
  if(!d.team)push('Explore serving','Learn about sample teams at your own pace.','No team assignment is created.',go('team','','Explore teams'));
  push('Scripture, at your pace','Reading is optional, never a spiritual score.','Existing reading content only.',go('read','','Open Scripture'));
  return {heading:'Find your next connection.',intro:'Pick one useful place to begin, without pressure or invented obligations.',items,topic:'community'};
 }
 const current=answer('next',sources);
 return {heading:b.taskCount>0?'Here’s what needs attention.':'You’re caught up on required responses.',
  intro:current.intro,items:current.items,topic:'week'};
}
function goalSuggestions(topic,d){
 if(topic==='group'&&d.member)return ['goal-group','group-time','group-confirm'];
 if(topic==='serve'&&d.team)return ['goal-serve','serve-time','serve-confirm'];
 if(topic==='week'||topic===''||topic==='community')return [
   d.member?'goal-group':d.team?'goal-serve':'goal-connect',
   d.member&&d.team?'goal-serve':'goal-connect','goal-check'];
 return ['goal-check',...suggestions(topic,d)].slice(0,3);
}

// Current-source care conversation. A referent only selects a topic; the
// existing projection owns permission, stage and completion. Never copy prayer text.
function careConversation(intent,d,query){
 const ctx=d.memberContext,care=ctx?.care;
 const result=(outcome,heading,intro,items=[])=>Object.freeze({intent,topic:'care',outcome,heading,intro,items:Object.freeze(items),note:sourceNote});
 if(ctx?.permissions?.group!==true)
  return result('no-group-access','Care starts with connection.','No group prayer request is available to this profile. You can explore Groups at your own pace.');
 if(care?.visible!==true||!['ready','prayed','paused','followed-up'].includes(care.status))
  return result('no-authorized-request','No current care request is available.','I don’t have an authorized sample prayer request to suggest right now. You don’t need to find another task.');
 if(intent==='care-status'){
  if(care.followedUp===true&&care.status==='followed-up')
   return result('recorded-local-completion','You’ve followed through.','Your check-in was saved on this device. No real message was delivered, and no additional response is required.');
  if(care.prayed===true)
   return result('recorded-prayer','You’ve marked that you prayed.',care.status==='paused'?'Your reminder is paused. You can leave it there.':'A check-in has not been recorded. You can leave it at prayer or ask about an optional next step.');
  return result('no-recorded-completion','No completion is recorded.',care.status==='paused'?'Your reminder is paused. Nothing else is required.':'There is no saved prayer or check-in completion for this request. Asking or opening a draft does not complete it.');
 }
 if(care.status==='paused')
  return result('respect-pause','Care, at your pace.','You chose to pause this reminder. It can stay paused; no response or message is required.');
 if(care.status==='followed-up')
  return result('no-open-care','No further care step is required.','There is no open care suggestion right now. You’re welcome to connect with your group at your own pace.');
 const prayed=care.status==='prayed',id=prayed?'care-check-in':'care-prayer';
 const action=careRoute(d,id,{kind:'action',id:prayed?'companion-encourage':'care-open-prayer'});
 const detailQuery=/\b(?:what did|what is the request|read the request)\b/i.test(query);
 const intro=detailQuery?'The original fictional request is available in your group’s prayer area. I won’t repeat the private text here.':prayed?
  'You marked that you prayed for a shared sample request. A personal check-in is optional.':
  'Someone in your Wednesday Group shared a sample prayer request. You could take a moment to pray, if you’d like.';
 const detail=prayed?'Write a personal note only if you choose.':'Open the original request in your group; reading it does not mark it complete.';
 // For a prayed request, the existing stage-specific check-in route is the only
 // action offered here; the prayer area remains accessible from Groups.
 return result(prayed?'optional-check-in':'optional-prayer',prayed?'Continue a thoughtful check-in.':'A moment to care.',intro,
  [item(prayed?'Write a check-in':'Read the prayer request',detail,'Based on an explicitly shared, authorized fictional group request; no inferred need.',action)]);
}
// Scope key is session-only, never an identity credential or authorization grant.
function conversationScope(model){
 const c=model?.memberContext;
 if(c?.version!==1)return null;
 return JSON.stringify([c.identity?.name,c.identity?.campus,c.permissions?.group===true,c.permissions?.team===true,c.permissions?.groupLeader===true,c.permissions?.teamLeader===true,c.care?.visible===true]);
}
// Explicit guidance consumes current context; it does not create another ranking policy.
function guidanceConversation(intent,d){
 const ctx=d.memberContext;
 const make=(outcome,heading,intro,items=[],topic='')=>Object.freeze({intent,outcome,heading,intro,items:Object.freeze(items),topic,note:sourceNote});
 if(intent==='connect'){
  const member=ctx?.permissions?.group===true;
  return make(member?'reconnect-existing-group':'discover-groups',member?'Start with your people.':'There’s room for you.',
   member?'You already have a group you can reconnect with. Start there, at your own pace.':'You could start by exploring a group. You don’t need to join anything today.',
   [item(member?'Your Wednesday Group':'Explore groups',member?'Open your existing group and choose how to connect.':'Browse the available sample groups without enrolling.','Your current group membership determines this suggestion.',go('group','',member?'Open my group':'Explore groups'))],member?'group':'community');
 }
 if(ctx?.permissions?.groupLeader!==true)
  return make('no-leader-access','Leader follow-up is not available.','This profile does not have access to group leader requests.');
 if(ctx.leader?.requestedCheckIn!==true)
  return make('no-open-leader-request','No requested check-in is open.','There is no outstanding explicit sample request for you to review. This does not assess anyone’s well-being.');
 return make('authorized-review','A member requested a check-in.','Taylor shared an explicit fictional request for a check-in. Review it in your leader tools and decide how to respond.',
  [item('Requested group check-in','Open the existing leader review area.','An authorized, explicitly requested and not yet reviewed sample follow-up—not an inferred need.',Object.freeze({...go('group','leader','Review requested check-in'),requested:true}))],'leader');
}
function focusConversation(sources){
 const d=sources.model||{},b=sources.board||{},ctx=d.memberContext;
 const current=answer('next',sources);
 // Use the ordered selected board candidates only; do not score them again.
 const ids=[b.hero,...(b.rows||[])].filter((r,i)=>r&&b.taskCount>0&&(i===0?!r.calm&&r.id!=='paused'&&r.id!=='welcome-community':r.requiresResponse)).map(r=>r.id);
 let outcome='shared-priorities',intro=current.intro,items=current.items;
 if(!ids.length){
  outcome=b.hero?.id==='paused'?'respect-deferred':'no-outstanding-response';
  intro=b.hero?.id==='paused'?'You chose to revisit some items later. Nothing pressing is being recommended right now.':'No current sample commitment needs your response. You don’t need to find another task.';
  items=[item(b.hero?.id==='paused'?'Nothing pressing right now.':'You’re all caught up.',intro,b.hero?.why||'Current shared priority board.',null)];
 }else if(ids.length===1&&ids[0]==='serve-response')outcome='shared-serving-priority';
 else if(ids.length===2&&ids[0]==='group-rsvp'&&ids[1]==='serve-response')outcome='shared-two-priorities';
 else if(ids.length===1&&ids[0]==='group-unavailable'){
  outcome='source-unavailable-review';
  intro='Your group conversation source is unavailable. I can’t assume it has zero unread messages; you can review the existing conversation.';
 }
 return Object.freeze({...current,intent:'focus',outcome,intro,items:Object.freeze(items)});
}
function respond(raw,sources={},prior={}){
 const query=String(raw||'').trim().slice(0,160);
 const d=sources.model||{},b=sources.board||{},now=sources.now instanceof Date?sources.now:new Date();
 const previous=prior&&typeof prior==='object'?prior:{};
 const goalMode=sources.goalMode===true;
 const recommend=topic=>goalMode?goalSuggestions(topic,d):suggestions(topic,d);
 // Canonical intent recognition is independent of permission and response planning.
 // Legacy previews retain their exact existing grammar and output.
 const recognized=d.memberContext?.version===1?(query==='next'?'focus':resolveIntent(query,previous)):'legacy';
 if(recognized==='unsupported'||recognized==='clarify'){
  const normalized=normalizeQuestion(query),distress=explicitDistress(normalized),declined=declinedCare(normalized);
  const response=Object.freeze({intent:recognized,heading:distress?'Your safety matters.':declined?'It’s okay to leave it for today.':recognized==='clarify'?'Which part do you mean?':'I can help within Rally One.',
    intro:distress?'I’m sorry this is so difficult. You deserve real support. If you or someone else is in immediate danger or has already been hurt, call local emergency services now (911 in the U.S.). In the U.S., call or text 988 to reach a crisis counselor. If possible, reach out to someone you trust who can be with you. Rally cannot contact help or monitor your safety.':
      declined?'You don’t need to take a care step today. Nothing has been changed.':
      recognized==='clarify'?'Tell me whether you mean your group, serving, Scripture or a care opportunity. Nothing has changed.':
      'I can help you review activity you have access to, but I can’t reveal private information, judge someone’s well-being, or take an action for you.',
    items:Object.freeze([]),note:sourceNote});
  return Object.freeze({query,response,context:Object.freeze({intent:recognized,focus:''}),suggestions:Object.freeze(distress||declined?[]:['next','group','scripture'])});
 }
 if(recognized==='focus'){
  let response=focusConversation(sources);
  if(/\b(overwhelmed|only have (?:ten|\d+|a few|five) minutes|short on time|not much time)\b/.test(normalizeQuestion(query))&&response.outcome!=='no-outstanding-response')
   response=Object.freeze({...response,intro:'Let’s keep this manageable. '+response.intro});
  const focus=topicOf({...response,intent:'next'},b);
  return Object.freeze({query,response,context:Object.freeze({intent:response.intent,focus}),suggestions:Object.freeze(recommend(focus||response.intent))});
 }
 if(recognized==='care'||recognized==='care-status'){
  const response=careConversation(recognized,d,query);
  const focus=d.memberContext?.permissions?.group===true&&d.memberContext?.care?.visible===true?'care':'';
  return Object.freeze({query,response,context:Object.freeze({intent:recognized,focus}),suggestions:Object.freeze(['next','group','scripture'])});
 }
 if(['connect','leader'].includes(recognized)){
  const response=guidanceConversation(recognized,d);
  return Object.freeze({query,response,context:Object.freeze({intent:recognized,focus:response.topic}),suggestions:Object.freeze(['next','group','scripture'])});
 }
 // F-10.2: flexible wording over a fixed, source-backed intent allowlist.
 // Language can select a topic; it can never directly perform an action.
 const lower=query.toLowerCase().replace(/[‘’]/g,"'").replace(/\s+/g,' ').trim();
 const key=followIds.has(query)&&(!goalIds.has(query)||goalMode)?query:null;
 const shorthand=/^\s*(and|what about|how about)\s+(sunday|wednesday)(?:\s+too)?[!?\.]*$/i.exec(query);
 const known=key?followKeys[key]:shorthand?(shorthand[2].toLowerCase()==='sunday'?'Serving':'My group'):query;
 const subject=key?.startsWith('group-')?'group':key?.startsWith('serve-')?'serve':'';
 const explicitGroup=/\b(group|wednesday|rsvp|gathering|small group)\b/.test(lower);
 const explicitServe=/\b(sunday|serv(?:e|ing|ice)|shift|volunteer|welcome team)\b/.test(lower);
 const explicitScripture=/\b(scripture|bible|reading|verse)\b/.test(lower);
 const mixedSubjects=explicitGroup&&explicitServe;
 let focus=mixedSubjects?'':subject||(explicitServe?'serve':explicitGroup?'group':
   explicitScripture?'scripture':'');
 const inherited=previous.focus&&['group','serve','scripture'].includes(previous.focus)?previous.focus:'';
 const isTime=!!(key&&key.endsWith('-time'))||
    /\b(what time|what hour|what day|which day|when(?: is| does| do| am| are)|start(?:s)?|begin(?:s)?|what(?:'s| is) the date)\b/.test(lower)||
    /^(?:and )?when[!?.]*$/.test(lower);
 const isWhere=!!(key&&key.endsWith('-where'))||
    /\b(where|location|which campus|what campus|what address|whereabouts)\b/.test(lower);
 const isConfirm=!!(key&&key.endsWith('-confirm'))||
    /\b(confirm|confirmation|rsvp|sign me up|signed up|respond|response|replied|reply|say yes)\b/.test(lower)||
    /^(yes|sure|okay|ok|yep|let's do it)[.!?]*$/.test(lower);
 const isBoardWhy=key==='why-first'||(/\b(first|priorit|ranked|top of)\b/.test(lower)&&!explicitGroup&&!explicitServe);
 const isShortWhy=!isBoardWhy&&/^(why\b|how come\b|what makes (?:that|this) important\b)/.test(lower);
 const isNextStep=/\b(what (?:should|can|do) i do|what now|next step|how (?:can|do) i (?:handle|respond))\b/.test(lower)&&
    (explicitGroup||explicitServe||/\b(that|this|it|there|now)\b/.test(lower));
 const isFollowup=isTime||isWhere||isConfirm||isShortWhy||isNextStep;
 // Mentioning both commitments beats any previous focus.
 if(!focus&&isFollowup&&!mixedSubjects)focus=inherited;
 const source=sourceNote;
 const itemFor=(title,detail,reason,action=null)=>item(title,detail,reason,action);
 function result(heading,intro,items,topic='',extra={}){
  const response=Object.freeze({intent:'followup',heading,intro,
    items:Object.freeze(items),note:source,topic,...extra});
  return Object.freeze({query:known,response,
    context:Object.freeze({intent:response.intent,focus:topic||''}),
    suggestions:Object.freeze(recommend(topic||'week'))});
 }
 // Do not extrapolate recurring schedules from one fictional fixture date.
 if(/\b(next week|following week|week after next|two weeks from now)\b/.test(lower)){
  return result('I can’t verify that week yet.',
    'This demo knows currently dated sample commitments, not a recurring church schedule or future-week events.',
    [itemFor('Current sample schedule','See only the dated commitments actually available.',
      'No additional meeting or shift is inferred from an earlier sample date.',
      go('group','','Explore current schedule'))],'week',{limited:true});
 }

 if(goalMode){
  const prep=/\b(prepare|preparing|get ready|getting ready|ready for|help me plan|plan for|checklist)\b/.test(lower)||/\bbefore (?:my|the|wednesday|sunday)\b/.test(lower);
  const connect=/\b(new here|new to church|first time|meet people|find a group|get connected|make friends|start connecting|where do i start|feel connected)\b/.test(lower);
  const caught=/\b(am i all caught up|anything left|all set|anything i need to do|anything else i need|am i done)\b/.test(lower);
  if(goalIds.has(key)||prep||connect||caught){
   if(prep&&mixedSubjects){
    const candidates=[];
    if(d.member)candidates.push(itemFor('Wednesday Group','Review your sample gathering.','Current group membership required.',go('group','gather','Group details')));
    if(d.team)candidates.push(itemFor('Sunday serving','Review your sample shift.','Current team membership required.',go('team','schedule','Team details')));
    if(!candidates.length)candidates.push(itemFor('Explore groups','Choose a starting point first.','No sample memberships.',go('group','','Explore groups')));
    return result('Which one should we prepare for?','We can tackle one commitment at a time; nothing was changed.',candidates,'week',{clarify:true,goal:true});
   }
   const goal=goalIds.has(key)?key:connect?'goal-connect':caught?'goal-check':
     explicitGroup?'goal-group':explicitServe?'goal-serve':
     inherited==='group'?'goal-group':inherited==='serve'?'goal-serve':'goal-connect';
   const plan=goalPlan(goal,sources,d,b,now);
   return result(plan.heading,plan.intro,plan.items,plan.topic,{goal:true});
  }
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
  if(isNextStep)return result('Your next group step.',
     d.rsvp?'Your sample RSVP is already saved. You can review the gathering below.':
       'Your RSVP is still open. You can choose Going using the separate button below.',
     [itemFor('Wednesday Group',d.rsvp?'RSVP: '+(d.rsvp==='going'?'Going':'Maybe'):'RSVP not yet saved',
       'This reflects the current saved RSVP; asking alone does not change it.',
       d.rsvp?go('group','gather','Review RSVP'):direct('rsvp','RSVP · I’m in'))],'group');
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
  if(isNextStep)return result('Your next serving step.',
     d.serveStatus==='pending'?'Your sample serving response is still pending. Confirm only if you choose to serve.':
       'Your current team response is '+(d.serveStatus||'not available')+'. No new confirmation is required.',
     [itemFor('Welcome Team',d.serveStatus||'No response found',
       'The saved response is authoritative; a conversational reply cannot change it.',
       d.serveStatus==='pending'?direct('serve','Confirm serving'):go('team','schedule','Review schedule'))],'serve');
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
 let response=answer(known,sources);
 // The frozen opening/Week chip retains its approved snapshot copy. Explicit
 // typed weekly queries explain that the broader count is not a to-do list.
 if(d.memberContext?.version===1&&query!=='week'&&response.intent==='week'){
  const count=b.weeklyTaskCount??b.taskCount;
  if(count>0)response=Object.freeze({...response,intro:response.intro.replace(/ You also have \d+ sample items? needing attention\.$/,'')+' The wider sample overview includes '+count+' item'+(count===1?'':'s')+'; some may be deferred or require only review. Ask what needs your attention for the current focused steps.'});
 }
 // Unsupported prompts do not preserve an unrelated conversational referent.
 focus=response.intent==='unknown'?'':subject||topicOf(response,b)||focus;
 return Object.freeze({query:known,response,
  context:Object.freeze({intent:response.intent,focus}),
  suggestions:Object.freeze(recommend(focus||response.intent))});
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
  const allowed=action&&(['go','confirm'].includes(action.kind)||
    (action.kind==='care-route'&&['care-prayer','care-check-in'].includes(action.id)));
  const control=allowed?
   '<button type="button" class="f10-route" '+(action.kind==='go'?
      'data-go="'+esc(action.id)+'"'+(action.pane?' data-pane="'+esc(action.pane)+'"':'')+(action.requested===true&&action.id==='group'&&action.pane==='leader'?' data-requested-check-in="1"':''):
      'data-action="'+(action.kind==='care-route'?'f10-care-route':'f10-confirm')+'" data-value="'+esc(action.id)+'"')+'>'+
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
return Object.freeze({prompts,classify,resolveIntent,conversationScope,answer,respond,followKeys,render});
});