/* Rally Companion 1.0. Interprets turns against the current authorized fixture snapshot. */
(function(root,factory){
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  else root.RallyCompanionJourneys=api;
})(typeof window==='object'?window:globalThis,function(){
  'use strict';

  const questions=Object.freeze({
    start:'Where do I start?',
    check:'Am I caught up?',
    week:'What’s coming up?',
    group:'Get ready for Wednesday',
    'group-time':'When does my group meet?',
    'group-where':'Where does my group meet?',
    'group-status':'What’s my RSVP?',
    'group-unread':'Any group updates?',
    serve:'Get ready to serve',
    'serve-time':'When is my shift?',
    'serve-where':'Where do I serve?',
    'serve-status':'What’s my serving response?',
    scripture:'Open Scripture',
    leader:'Any group check-ins?'
  });
  const note='Fictional activity on this device. Church accounts, calendars, and messaging services are disconnected.';
  const dateInMountainTime=new Intl.DateTimeFormat('en-US',{
    timeZone:'America/Denver',weekday:'short',month:'short',day:'numeric',year:'numeric'
  });
  const timeInMountainTime=new Intl.DateTimeFormat('en-US',{
    timeZone:'America/Denver',hour:'numeric',minute:'2-digit'
  });
  const timeValue=iso=>typeof iso==='string'?Date.parse(iso):NaN;
  const count=value=>Number.isSafeInteger(value)&&value>=0?value:null;
  const go=(id,pane,label)=>Object.freeze({kind:'go',id,pane,label,requiresExplicitClick:true,source:'local-fixture'});
  const confirm=(id,label)=>Object.freeze({kind:'confirm',id,label,requiresExplicitClick:true,source:'local-fixture'});
  const row=(title,detail,reason,action=null)=>Object.freeze({title,detail,reason,action});
  const plan=(heading,intro,items=[],focus='',limited=false)=>({heading,intro,items,focus,limited});

  function formatOccurrence(iso){
    const ms=timeValue(iso);
    return Number.isFinite(ms)?dateInMountainTime.format(ms)+' · '+timeInMountainTime.format(ms)+' MT':null;
  }

  function facts(snapshot){
    const sources=snapshot?.sources||{};
    const viewer=snapshot?.viewer;
    const group=viewer?.group===true&&sources.group==='available'?snapshot.group:null;
    const serving=viewer?.team===true&&sources.team==='available'?snapshot.serving:null;
    const leader=!!group&&viewer?.role==='leader';
    const now=timeValue(snapshot?.now);
    const upcoming=record=>{
      const when=timeValue(record?.nextDate);
      return Number.isFinite(now)&&Number.isFinite(when)&&when>=now?record.nextDate:null;
    };
    return {
      sources,group,serving,leader,
      groupDate:upcoming(group),serveDate:upcoming(serving),
      unread:group&&sources.conversation==='available'?count(group.unreadCount):null,
      checkIns:leader?count(snapshot.leadership?.groupCheckIns):null,
      scripture:sources.scripture==='available'?snapshot?.scripture:null
    };
  }

  function eligible(f,id){
    if(id==='rsvp')return !!f.groupDate&&f.group.rsvp==='none';
    return id==='serve'&&!!f.serveDate&&f.serving.response==='pending';
  }

  function canConfirm(snapshot,id){
    return eligible(facts(snapshot),id);
  }

  function community(f){
    return plan('Find your place.', 'Choose whatever feels useful today. Each of these is optional.',[
      row('Explore groups','Browse sample communities at your own pace.',
        'Browsing leaves your membership as it is.',go('group','','Explore groups')),
      row('See ways to serve','Learn what serving teams do.',
        'This opens the Team tab.',go('team','','Explore serving')),
      row('Take a moment for Scripture',f.scripture?.passage||'Open the Read tab.',
        'The reading is available whenever you want it.',go('read','scripture','Open Scripture'))
    ],'community');
  }

  function noAccess(f,topic){
    const group=topic==='group';
    const denied=f.sources[group?'group':'team']==='not-member';
    return plan(group?'Group access unavailable.':'Serving access unavailable.',
      denied?(group?'This sample profile has no joined group.':'This sample profile has no team assignment.'):
        (group?'The current group membership could not be verified.':'The current team membership could not be verified.'),
      [row(group?'Explore groups':'Explore serving','Browse at your own pace.',
        'Exploration leaves your membership as it is.',go(group?'group':'team','',group?'Explore groups':'Explore serving'))],
      '',!denied);
  }

  function groupSchedule(f){
    const date=formatOccurrence(f.groupDate);
    return row('Wednesday Group',[
      date||'An upcoming sample date is unavailable.',f.group.location
    ].filter(Boolean).join(' · '),'This comes from the current gathering fixture.',go('group','gather','See gathering'));
  }

  function groupResponse(f){
    if(eligible(f,'rsvp'))return row('Your RSVP is open','Save Going on this device, or open the gathering to choose Maybe.',
      'Only an explicit button tap can save a response.',confirm('rsvp','Save Going'));
    const saved=f.group.rsvp==='going'?'Going':f.group.rsvp==='maybe'?'Maybe':null;
    return row('Your RSVP',saved?saved+' is saved on this device.':'An upcoming RSVP is unavailable.',
      'Groups contains the saved response.',go('group','gather','Review RSVP'));
  }

  function groupConversation(f){
    if(f.unread===null){
      const canReview=f.sources.conversation!=='not-member';
      return row('Group updates unavailable','I can’t verify unread activity right now.',
        'Unread activity comes from the authorized modern conversation.',
        canReview?go('group','chat','Review conversation'):null);
    }
    const detail=f.unread===0?'You’re up to date with the sample conversation.':
      f.unread+' unread sample '+(f.unread===1?'message.':'messages.');
    return row('Group updates',detail,'The count comes from your modern read cursor.',go('group','chat','Open conversation'));
  }

  function grouping(f,intent){
    if(!f.group)return noAccess(f,'group');
    if(intent==='group-where')return plan('Where your group meets.',
      f.group.location?'The sample venue is '+f.group.location+'.':'The sample venue is unavailable.',
      [groupSchedule(f)],'group',!f.group.location);
    if(intent==='group-time')return plan('When your group meets.',
      f.groupDate?'Here’s the dated gathering in your sample schedule.':'I don’t have a dated upcoming gathering.',
      [groupSchedule(f)],'group',!f.groupDate);
    if(intent==='group-unread')return plan('What’s new with your group.', '',[groupConversation(f)],'group',f.unread===null);
    if(intent==='group-status')return plan('Your Wednesday RSVP.','Review the saved response or choose an available action.',
      [groupResponse(f),...(eligible(f,'rsvp')?[groupSchedule(f)]:[])],'group',f.group.rsvp==='none'&&!f.groupDate);
    return plan('Get ready for Wednesday.','Check the gathering, your RSVP, and any updates you’d like to read.',
      [groupSchedule(f),groupResponse(f),groupConversation(f)],'group',!f.groupDate||f.unread===null);
  }

  function serveSchedule(f){
    const date=formatOccurrence(f.serveDate);
    const detail=f.serving.response==='declined'?'There’s no upcoming shift on this schedule.':
      [date||'An upcoming sample shift date is unavailable.',f.serving.location].filter(Boolean).join(' · ');
    return row('Welcome Team',detail,'This comes from your current sample schedule.',go('team','schedule','See schedule'));
  }

  function serveResponse(f){
    if(eligible(f,'serve'))return row('Availability requested','Confirm only if you’re able to take the sample shift.',
      'A typed reply leaves your serving response as it is.',confirm('serve','Confirm availability'));
    const detail={
      confirmed:'Confirmed on this device.',declined:'Declined on this device.',
      pending:'Your response is pending. An upcoming shift date is unavailable.'
    }[f.serving.response]||'The saved serving response is unavailable.';
    return row('Your serving response',detail,'Team contains your saved availability.',go('team','schedule','Review schedule'));
  }

  function serving(f,intent){
    if(!f.serving)return noAccess(f,'serve');
    if(intent==='serve-where')return plan('Where you serve.',
      f.serving.location?'The sample location is '+f.serving.location+'.':'There’s no location available for an upcoming shift.',
      [serveSchedule(f)],'serve',!f.serving.location);
    if(intent==='serve-time')return plan('When you serve.',
      f.serveDate?'Here’s your dated sample shift.':'I don’t have a dated upcoming shift for you.',
      [serveSchedule(f)],'serve',!f.serveDate);
    if(intent==='serve-status')return plan('Your serving response.','Here’s the current response for your sample profile.',
      [serveResponse(f),...(eligible(f,'serve')?[serveSchedule(f)]:[])],
      'serve',f.serving.response==='unknown'||(f.serving.response==='pending'&&!f.serveDate));
    return plan('Get ready to serve.','Review your sample assignment before choosing a response.',
      [serveSchedule(f),serveResponse(f)],'serve',!f.serveDate&&f.serving.response!=='declined');
  }

  function checkIn(f){
    const label=f.checkIns===1?'1 sample check-in awaits review.':f.checkIns+' sample check-ins await review.';
    return row('Group check-ins',label,'Your group leader scope includes this aggregate.',
      go('group','leader','Review check-ins'));
  }

  function leadership(f){
    if(!f.leader)return plan('Leader review is unavailable.','Checking group follow-ups requires current group leader access.');
    if(f.checkIns===null)return plan('Group check-ins are unavailable.','I can’t verify the status of your group’s review queue.',[],'leader',true);
    if(f.checkIns===0)return plan('Your group check-ins are clear.','There are no sample check-ins awaiting review. No further action is needed.',[],'leader');
    return plan('Your group check-ins.','Review the queue in Groups when you’re ready.',[checkIn(f)],'leader');
  }

  function scripture(f){
    if(!f.scripture)return plan('Scripture is unavailable.','You can still check the Read tab.',
      [row('Read','Open the current reading view.','This is a source link.',go('read','scripture','Open Scripture'))],'scripture',true);
    const detail=f.scripture.readToday===true?'You’ve already marked the sample reading as read.':
      f.scripture.stepDue===true?'You have a saved reflection step you can revisit.':'Take a moment to read whenever you’d like.';
    return plan('A moment for Scripture.','Reading and reflection are always optional.',
      [row(f.scripture.passage||'Your sample reading',detail,'This reflects your saved reading activity.',
        go('read','scripture','Open Scripture'))],'scripture');
  }

  function upcoming(f){
    const items=[];
    if(f.group)items.push(groupSchedule(f));
    if(f.serving)items.push(serveSchedule(f));
    return plan('Your sample schedule.',items.length?'Here are the commitments visible to your current profile.':
      'I can’t verify a group gathering or serving shift for this profile.',items,'week',!items.length);
  }

  function overview(f){
    if(f.sources.group==='not-member'&&f.sources.team==='not-member')return plan('There’s nothing you need to respond to.',
      'Your sample profile has no commitments. You can explore at your own pace.',[],'community');
    const groupPending=f.group?.rsvp==='none';
    const servingPending=f.serving?.response==='pending';
    const unresolved=[
      (!f.group&&f.sources.group!=='not-member')||(!f.serving&&f.sources.team!=='not-member'),
      groupPending&&!f.groupDate,
      servingPending&&!f.serveDate||f.serving?.response==='unknown',
      f.group&&f.unread===null,
      f.leader&&f.checkIns===null
    ].some(Boolean);
    const items=[];
    if(groupPending&&f.groupDate)items.push(row('An RSVP is open',formatOccurrence(f.groupDate),
      'Your current gathering has no saved response.',go('group','gather','See gathering')));
    if(servingPending&&f.serveDate)items.push(row('A serving response is open',formatOccurrence(f.serveDate),
      'Your current shift has a pending response.',go('team','schedule','See schedule')));
    if(f.unread>0)items.push(groupConversation(f));
    if(f.checkIns>0)items.push(checkIn(f));
    if(unresolved)items.push(row('Some details are unavailable','I can’t verify every open item right now.',
      'A source can be unavailable even when other saved responses are visible.'));
    if(items.length)return plan(items.length===1&&unresolved?'I can’t confirm you’re caught up.':'Here’s what needs attention.',
      'These are the sample items I can check. Scripture is optional.',items,'week',unresolved);
    return plan('You’re caught up.', 'Your sample responsibilities are handled. You can stop here.',
      [],'week');
  }

  function clarify(f){
    return plan('Which one do you mean?',f.group||f.serving?
      'Choose a topic below and I’ll keep the details together.':'Tell me which activity you’re asking about.',
    [],'week');
  }

  function receiptPlan(f,receipt){
    if(receipt?.source!=='explicit-user-click'||!['rsvp','serve'].includes(receipt.operation))return null;
    const group=receipt.operation==='rsvp';
    const record=group?f.group:f.serving;
    if(!record)return noAccess(f,group?'group':'serve');
    const completed=group?record.rsvp==='going':record.response==='confirmed';
    const outcome=receipt.outcome;
    if(!completed||!['confirmed','already-completed'].includes(outcome))return plan('I can’t verify a saved change.',
      'Check the current response in its source view before trying again.',
      [group?groupSchedule(f):serveSchedule(f)],group?'group':'serve',true);
    const when=formatOccurrence(group?f.groupDate:f.serveDate);
    const details=[when,record.location].filter(Boolean).join(' · ');
    return plan(group?'Your RSVP is saved.':'Your serving response is saved.',
      group?'Going is saved on this device.':'Confirmed on this device.',
      [row(group?'Wednesday Group':'Welcome Team',details||'The upcoming schedule is unavailable.',
        'You can review the details whenever it’s useful.',group?go('group','gather','See gathering'):go('team','schedule','See schedule'))],
      group?'group':'serve',!when);
  }

  function interpret(query,prior,f){
    const input=query.toLowerCase().replace(/[’‘]/g,"'").replace(/\s+/g,' ');
    if(Object.hasOwn(questions,input))return input;
    if(/\b(next (?:week|month|year|wednesday|sunday)|following (?:week|month|wednesday|sunday)|(?:one|two|three|[0-9]+) weeks? (?:from now|later)|week after|after this (?:week|one)|every (?:week|wednesday|sunday)|(?:wednesday|sunday) after)\b/.test(input))return 'future';
    if(/^(?:no|no thanks|not (?:now|today)|maybe later|stop|i(?:'m| am) done|that(?:'s| is) (?:enough|all))[.!?]*$/.test(input))return 'stop';
    if(/\b(?:send|post|publish|text|contact|notify|message) (?:a |an |the |my |them |someone |this |everyone )?(?:message|group|team|prayer|note|everyone|them|for me)\b/.test(input)||
      /\b(?:join|enroll|register|contact|book|reserve) (?:me|them|for me)\b/.test(input))return 'unsupported';
    if(/\b(?:new here|new to (?:church|citizen)|first time|where (?:do|should|can) i (?:start|begin)|meet people|(?:discover|explore|find|join) (?:a |new |sample )?groups?|get connected|connect with people)\b/.test(input))return 'community';
    if(/\b(?:all caught up|am i caught up|anything (?:left|else)|all set|what (?:needs|requires) (?:my )?attention|what matters|pending tasks?)\b/.test(input))return 'check';
    const group=/\b(?:wednesday|(?:my |our |the )?group|rsvp|gathering|group chat)\b/.test(input);
    const serve=/\b(?:sunday|serv(?:e|ed|ing)|shift|volunteer|welcome team|team|availability)\b/.test(input);
    if(group&&serve)return 'clarify';
    if(/\b(?:leaders?|check[ -]?ins?|attendance)\b/.test(input))return 'leader';
    if(/\b(?:scripture|bible|devotional|reading|read|verse|reflection)\b/.test(input))return 'scripture';
    const unread=/\b(?:unread|any updates|new messages|conversation|group messages|how many messages)\b/.test(input);
    const time=/\b(?:when|what time|what day|what(?:'s| is) the date|how late)\b/.test(input);
    const where=/\b(?:where|location|what campus|which campus|address)\b/.test(input);
    const status=/\b(?:confirm(?:ed|ation)?|rsvp|respond(?:ed)?|response|saved|already (?:do|did|reply)|am i going|did i reply|need to reply)\b/.test(input)||
      /^(?:yes|sure|okay|ok|i(?:'m| am) in|let's do it)[.!?]*$/.test(input);
    const brief=/^(?:why|tell me more|what now|what(?:'s| is| comes) next|then what|what (?:should|can|do) i do (?:now|next|about (?:it|that))|how do i (?:handle|respond to) (?:it|that))[.!?]*$/.test(input);
    const prepare=/\b(?:help me (?:prepare|get ready|plan)|how (?:can|do) i (?:prepare|get ready))\b/.test(input);
    const followUp=unread||time||where||status||brief||prepare;
    let topic=group?'group':serve?'serve':'';
    if(!topic&&followUp){
      if(['group','serve'].includes(prior?.focus))topic=prior.focus;
      else if(unread)topic='group';
      else if(brief)return ['leader','scripture'].includes(prior?.focus)?prior.focus:'check';
      else if(f.group&&f.serving)return 'clarify';
      else if(f.group||f.serving)topic=f.group?'group':'serve';
      else if(prepare)return 'community';
      else if(time||where||status)return 'clarify';
    }
    if(topic==='group'&&unread)return 'group-unread';
    if(topic&&time)return topic+'-time';
    if(topic&&where)return topic+'-where';
    if(topic&&status)return topic+'-status';
    if(topic)return topic;
    if(/\b(?:what(?:'s| is) coming up|schedule|calendar|this week|upcoming)\b/.test(input))return 'week';
    if(brief||/\bwhat (?:should|can) i do\b/.test(input))return 'check';
    return 'unsupported';
  }

  function suggestions(f,focus){
    let ids;
    if(focus==='group'&&f.group)ids=['group-time','group-where','group-unread'];
    else if(focus==='serve'&&f.serving)ids=['serve-time','serve-where','serve-status'];
    else if(focus==='community')ids=['scripture','check'];
    else ids=[...(f.group?['group']:[]),...(f.serving?['serve']:[]),'check',...(f.leader?['leader']:[]),'scripture'];
    return Object.freeze(ids.slice(0,3).map(id=>Object.freeze({id,label:questions[id]})));
  }

  function journey(intent,f){
    if(intent.startsWith('group'))return grouping(f,intent);
    if(intent.startsWith('serve'))return serving(f,intent);
    if(intent==='leader')return leadership(f);
    if(intent==='scripture')return scripture(f);
    if(intent==='check')return overview(f);
    if(intent==='week')return upcoming(f);
    if(intent==='community')return community(f);
    if(intent==='start'){
      if(!f.group&&!f.serving)return community(f);
      return plan('What would help today?', 'We can get you ready for a commitment or look at what still needs attention.',[],'week');
    }
    if(intent==='clarify')return clarify(f);
    if(intent==='future')return plan('That future date is unavailable.',
      'I can only check dated entries in the sample schedule. A repeating day doesn’t establish another gathering or shift.',[],'',true);
    if(intent==='stop')return plan('Of course. You can stop here.','You can return whenever it’s useful.');
    return plan('I can’t help with that here.',
      'Ask about your sample group, serving, Scripture, or what needs attention.',[],'',true);
  }

  function respond(raw,{snapshot,receipt}={},prior={}){
    const query=String(raw??'').trim().slice(0,160);
    const f=facts(snapshot);
    const actionReply=receiptPlan(f,receipt);
    const intent=actionReply?'receipt':interpret(query,prior,f);
    const result=actionReply||journey(intent,f);
    const quiet=intent==='receipt'||intent==='stop'||(intent==='check'&&!result.items.length);
    return Object.freeze({
      query:Object.hasOwn(questions,query)?questions[query]:query,
      response:Object.freeze({intent,heading:result.heading,intro:result.intro,
        items:Object.freeze(result.items),topic:result.focus,note,limited:result.limited}),
      context:Object.freeze({focus:result.focus,intent}),
      suggestions:quiet?Object.freeze([]):suggestions(f,result.focus)
    });
  }

  return Object.freeze({respond,canConfirm,formatOccurrence,questions});
});
