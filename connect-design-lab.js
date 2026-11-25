/* Rally One Connect: interactive, fictional, presentation-only messaging lab.
   No network calls, auth, church data, or production messaging. */
(function(){
  'use strict';
  const $=selector=>document.querySelector(selector);
  const $$=selector=>Array.from(document.querySelectorAll(selector));
  const screens={inbox:$('#screen-inbox'),thread:$('#screen-thread'),room:$('#screen-room'),direct:$('#screen-direct')};
  const urls={
    'Jess':'assets/today-priority/jess.webp',
    'Alex Morgan':'assets/today-priority/marcus.webp',
    'Anna':'assets/today-priority/anna.webp'
  };
  const greetings={
    'Jess':'Hey! See you soon.',
    'Alex Morgan':'Thanks for checking in. It meant a lot.',
    'Anna':'Thank you for reaching out. I appreciate you.'
  };
  const member=window.RallyConnectMember;
  const dialog=$('#new-dialog');
  const toast=$('#toast');
  let toastTimer=null;
  let activeScreen='inbox';
  let activeDirect='Alex Morgan';
  const scrollPositions=new Map();
  const directDrafts=new Map();
  let inboxOrigin=null;
  const scrollSelectors={inbox:'.inbox-body',thread:'#thread-scroll',room:'#room-scroll',direct:'#direct-scroll'};
  const scrollElement=screen=>screens[screen]?.querySelector(scrollSelectors[screen]);
  const scrollKey=(screen,person=activeDirect)=>screen==='direct'?'direct:'+person:screen;
  function rememberScroll(screen,person=activeDirect){
    const scroll=scrollElement(screen);
    if(scroll && !screens[screen].hidden)scrollPositions.set(scrollKey(screen,person),scroll.scrollTop);
  }
  function showToast(message){
    if(toastTimer!==null)clearTimeout(toastTimer);
    toast.textContent=message;
    toast.hidden=false;
    toastTimer=setTimeout(()=>{toast.hidden=true;toastTimer=null;},3100);
  }
  function openScreen(name,person=activeDirect,origin=document.activeElement){
    if(!Object.prototype.hasOwnProperty.call(screens,name))return;
    if(member && !member.allowed(name))return;
    if(activeScreen==='inbox'&&name!=='inbox'){
      if(screens.inbox.contains(origin))inboxOrigin=origin;
      else if(dialog.contains(origin))inboxOrigin=$('#compose-toggle');
    }
    rememberScroll(activeScreen,activeDirect);
    if(document.activeElement?.matches('.composer textarea'))document.activeElement.blur();
    if(activeScreen==='direct')directDrafts.set(activeDirect,$('#direct-input').value);
    if(name==='direct')activeDirect=person;
    const priorScreen=activeScreen;
    activeScreen=name;
    Object.entries(screens).forEach(([key,screen])=>{screen.hidden=key!==name;});
    if(dialog.open)dialog.close();
    if(name==='room'&&priorScreen!=='room')selectRoomTab('chat');
    if(name==='direct'){
      $('#direct-input').value=directDrafts.get(activeDirect)||'';
      syncComposer($('#direct-input'));
    }
    member?.show(name,activeDirect);
    const focusTarget=name==='inbox'?inboxOrigin:screens[name].querySelector('.chat-header h2,.room-identity h2');
    if(focusTarget&&!focusTarget.hidden&&focusTarget.isConnected){
      if(name!=='inbox')focusTarget.tabIndex=-1;
      focusTarget.focus({preventScroll:true});
    }
    if(name==='thread')syncComposer($('#thread-input'));
    const scroller=scrollElement(name);
    // Restore position after message rows have been reconciled with the
    // existing repository; first-time conversations open at the latest.
    requestAnimationFrame(()=>{
      if(!scroller||screens[name].hidden)return;
      const saved=scrollPositions.get(scrollKey(name,activeDirect));
      scroller.scrollTop=typeof saved==='number'?saved:
        name==='inbox'?0:scroller.scrollHeight;
    });
    document.title=(name==='inbox'?'Connect':name==='thread'?'Wednesday Crew':name==='room'?'Citizen Serve Team':activeDirect)+' — Rally One';
  }
  function openDirect(name,origin=document.activeElement){
    if(!Object.prototype.hasOwnProperty.call(urls,name))return;
    $('#direct-name').textContent=name;
    $('#direct-author').textContent=name.split(' ')[0];
    $('#direct-first-message').textContent=greetings[name];
    $('#direct-avatar').src=urls[name];
    $('#direct-message-avatar').src=urls[name];
    openScreen('direct',name,origin);
  }
  function selectRoomTab(name){
    if(!['chat','plans','people'].includes(name))return;
    if(name!=='chat'&&document.activeElement?.matches('#room-input'))document.activeElement.blur();
    $$('.room-tabs [role=tab]').forEach(button=>{
      const on=button.dataset.roomTab===name;
      button.setAttribute('aria-selected',String(on));
      button.tabIndex=on?0:-1;
    });
    $$('.room-panel').forEach(panel=>{panel.hidden=panel.id!=='room-panel-'+name;});
    $('#room-form').hidden=name!=='chat';
    $('#room-scroll').scrollTop=0;
  }
  function syncComposer(textarea){
    const form=textarea.closest('form');
    const send=form.querySelector('button[type=submit]');
    send.disabled=textarea.value.trim().length===0;
    textarea.style.height='46px';
    textarea.style.height=Math.max(46,Math.min(120,textarea.scrollHeight))+'px';
  }
  function createTextMessage(text){
    const row=document.createElement('article');
    row.className='message outgoing';
    const stack=document.createElement('div');
    stack.className='message-stack';
    const bubble=document.createElement('div');
    bubble.className='bubble';
    bubble.textContent=text; // Never interpret user-entered text as markup.
    const time=document.createElement('time');
    time.textContent='Just now · Local demo';
    stack.append(bubble,time);
    row.append(stack);
    return row;
  }
  function wireComposer(formId,targetId,scrollId){
    const form=$(formId),textarea=form.querySelector('textarea'),target=$(targetId);
    textarea.addEventListener('input',()=>syncComposer(textarea));
    textarea.addEventListener('keydown',event=>{
      // Soft-keyboard Return inserts a newline; users explicitly tap Send.
      // Desktop Enter sends, Shift+Enter inserts a newline, and IME input
      // must never submit an unfinished composition.
      if(event.isComposing||event.keyCode===229)return;
      if(event.key==='Enter'&&!event.shiftKey&&!window.matchMedia('(pointer: coarse)').matches){
        event.preventDefault();
        form.requestSubmit();
      }
    });
    form.addEventListener('submit',event=>{
      event.preventDefault();
      const text=textarea.value.trim();
      if(!text)return;
      if(member){
        if(!member.send(activeScreen,activeDirect,text)){showToast('Could not save this sample message. Your draft is still here.');return;}
      }else target.append(createTextMessage(text));
      textarea.value='';
      syncComposer(textarea);
      const scroll=$(scrollId);
      requestAnimationFrame(()=>{scroll.scrollTop=scroll.scrollHeight;});
      showToast('Message added to this fictional preview only.');
    });
    syncComposer(textarea);
  }
  $$('.screen [data-open]').forEach(button=>{
    button.addEventListener('click',()=>openScreen(button.dataset.open,activeDirect,button));
  });
  $$('[data-person]').forEach(button=>{
    button.addEventListener('click',()=>openDirect(button.dataset.person,button));
  });
  $$('.room-tabs [role=tab]').forEach((button,index,all)=>{
    button.addEventListener('click',()=>selectRoomTab(button.dataset.roomTab));
    button.addEventListener('keydown',event=>{
      if(event.key!=='ArrowRight'&&event.key!=='ArrowLeft')return;
      event.preventDefault();
      const step=event.key==='ArrowRight'?1:-1;
      const next=all[(index+all.length+step)%all.length];
      selectRoomTab(next.dataset.roomTab);
      next.focus();
    });
  });
  $('#moment-open').addEventListener('click',()=>{
    openScreen('thread',activeDirect,$('#moment-open'));
    requestAnimationFrame(()=>$('#prayer-moment').scrollIntoView({block:'center',behavior:'auto'}));
  });
  $('#thread-info').addEventListener('click',()=>showToast('Fictional group conversation. Live member access is not connected.'));
  const search=$('#conversation-search'),searchWrap=$('#search-wrap'),searchButton=$('#search-toggle');
  function filterConversations(){
    const query=search.value.trim().toLocaleLowerCase();
    let visible=0;
    $$('.conversation-row').forEach(row=>{
      const match=(!member||member.allowsRow(row)) && row.dataset.search.includes(query);
      row.hidden=!match;
      if(match)visible++;
    });
    $('#no-results').hidden=visible!==0;
  }
  function toggleSearch(force){
    const open=typeof force==='boolean'?force:searchWrap.hidden;
    searchWrap.hidden=!open;
    searchButton.setAttribute('aria-expanded',String(open));
    if(open)search.focus();
    else{search.value='';filterConversations();searchButton.focus();}
  }
  searchButton.addEventListener('click',()=>toggleSearch());
  search.addEventListener('input',filterConversations);
  search.addEventListener('keydown',event=>{if(event.key==='Escape')toggleSearch(false);});
  $('#compose-toggle').addEventListener('click',()=>dialog.showModal());
  $('#dialog-close').addEventListener('click',()=>dialog.close());
  dialog.addEventListener('click',event=>{if(event.target===dialog)dialog.close();});
  let prayerActive=false;
  $('#prayer-action').addEventListener('click',()=>{
    if(member){member.pray();return;}
    prayerActive=!prayerActive;
    const button=$('#prayer-action');
    button.setAttribute('aria-pressed',String(prayerActive));
    button.textContent=prayerActive?"You're praying ✓":"I'm praying ♡";
  });
  let reactionActive=false;
  $('#chat-reaction').addEventListener('click',()=>{
    reactionActive=!reactionActive;
    $('#chat-reaction').setAttribute('aria-pressed',String(reactionActive));
    $('#chat-reaction-count').textContent=reactionActive?'6':'5';
  });
  let rsvpActive=false;
  function toggleRsvp(){
    if(member){member.rsvp();return;}
    rsvpActive=!rsvpActive;
    const label=rsvpActive?"You're in ✓":"Count me in →";
    $('#rsvp-action').textContent=label;
    $('#rsvp-action').setAttribute('aria-pressed',String(rsvpActive));
    const mirrored=$('[data-rsvp-mirror]');
    mirrored.textContent=label;
    mirrored.setAttribute('aria-pressed',String(rsvpActive));
    showToast(rsvpActive?'RSVP saved in this design preview only.':'Sample RSVP cleared.');
  }
  $('#rsvp-action').addEventListener('click',toggleRsvp);
  $('[data-rsvp-mirror]').addEventListener('click',toggleRsvp);
  wireComposer('#thread-form','#thread-new-messages','#thread-scroll');
  wireComposer('#room-form','#room-new-messages','#room-scroll');
  wireComposer('#direct-form','#direct-new-messages','#direct-scroll');
  if(member){
    member.setup();
    if(member.initial.screen==='direct' && member.allowed('direct'))openDirect(member.initial.person);
    else openScreen(member.allowed(member.initial.screen)?member.initial.screen:'inbox');
  }else openScreen('inbox');
})();
