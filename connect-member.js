/* Member presentation for the embedded Connect review. The standalone lab keeps its own fixture. */
(function(){
  'use strict';
  const host=window.frameElement?.connectMember;
  if(!host)return;
  const $=selector=>document.querySelector(selector);
  const all=selector=>Array.from(document.querySelectorAll(selector));
  const {readModel,domain}=host;
  const actor={conversationId:readModel.CONVERSATION,userId:readModel.SELF};
  const threadInput=$('#thread-input');
  const threadScreen=$('#screen-thread');
  const syncDraftPresentation=()=>threadScreen.classList.toggle('has-thread-draft',threadInput.value.trim().length>0);
  const threadList=$('#thread-new-messages');
  const prayer=$('#prayer-moment');
  const note=$('.chat-caption');
  const senderPhotos={u_jess:'jess',u_anna:'anna',u_marcus:'marcus',u_taylor:'taylor'};
  function allowed(screen){
    const permissions=host.access();
    return screen==='inbox'||(screen==='room'?permissions.team:permissions.group);
  }
  function allowsRow(row){return allowed(row.dataset.open||'direct');}
  function element(tag,style,text){
    const node=document.createElement(tag);
    if(style)node.className=style;
    if(text!==undefined)node.textContent=text;
    return node;
  }
  function message(body,name,time,own=true,photo=''){
    const row=element('article','message '+(own?'outgoing':'incoming'));
    if(photo){
      const img=element('img','message-avatar');
      img.src='assets/rally-one/'+photo+'.webp';img.alt='';
      row.append(img);
    }
    const stack=element('div','message-stack');
    if(!own)stack.append(element('span','message-author',name));
    stack.append(element('div','bubble',body),element('time','',time));
    row.append(stack);
    return row;
  }
  // Re-read the versioned owner before every edit, including edits from the composer.
  function thread(change){
    if(!allowed('thread'))throw Error('Membership unavailable');
    const saved=readModel.readSaved(localStorage,domain);
    const repository=domain.createMockConversationRepository({seed:saved?.snapshot||readModel.fixture(domain)});
    const fields={draft:saved?.draft||'',replyTo:saved?.replyTo||null};
    if(change){
      change(repository,fields);
      localStorage.setItem(readModel.STORAGE_KEY,JSON.stringify({
        schemaVersion:1,snapshot:repository.getSnapshot(),...fields
      }));
    }
    return {repository,...fields};
  }
  function drawThread(){
    const scroll=$('#thread-scroll');
    const previousTop=scroll.scrollTop;
    const nearLatest=scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight<88;
    const {repository,draft,replyTo}=thread();
    const snapshot=repository.getSnapshot();
    const messages=repository.listMessages(actor);
    threadList.replaceChildren();
    for(const item of messages){
      const author=snapshot.users.find(person=>person.id===item.authorId);
      const time=new Date(item.createdAt).toLocaleTimeString([], {hour:'numeric',minute:'2-digit'});
      const row=message(item.body,author?.displayName,time,item.authorId===actor.userId,senderPhotos[item.authorId]);
      row.dataset.messageId=item.id;
      const stack=row.querySelector('.message-stack');
      const quoted=messages.find(entry=>entry.id===item.replyToMessageId);
      if(quoted){
        const quotedBy=snapshot.users.find(person=>person.id===quoted.authorId)?.displayName||'Member';
        stack.insertBefore(element('div','message-reply',quotedBy+': '+quoted.body.slice(0,110)),stack.querySelector('.bubble'));
      }
      if(item.deliveryStatus==='sent'){
        const reactions=snapshot.reactions.filter(r=>r.messageId===item.id&&r.emoji==='❤️');
        const button=element('button','reaction','♡ '+reactions.length);
        button.type='button';
        button.setAttribute('aria-label','React with heart to '+(author?.displayName||'member')+' message');
        button.setAttribute('aria-pressed',String(reactions.some(r=>r.userId===actor.userId)));
        button.onclick=()=>safeThread(()=>{
          thread(repo=>repo.toggleReaction({...actor,messageId:item.id,emoji:'❤️'}));drawThread();
        });
        const actions=element('div','message-actions');
        actions.append(button);
        const replyButton=element('button','message-reply-action','↩ Reply');
        replyButton.type='button';
        replyButton.setAttribute('aria-label','Reply to '+(author?.displayName||'member')+' message');
        replyButton.addEventListener('click',()=>safeThread(()=>{
          thread((_repo,fields)=>{fields.replyTo=item.id;});
          drawThread();
          threadInput.focus();
        }));
        actions.append(replyButton);
        stack.append(actions);
      }
      threadList.append(row);
    }
    threadInput.value=draft;
    syncDraftPresentation();
    const quoted=messages.find(entry=>entry.id===replyTo);
    const context=$('#reply-context');
    context.hidden=!quoted;
    if(quoted){
      const name=snapshot.users.find(person=>person.id===quoted.authorId)?.displayName||'Member';
      $('#reply-context-text').textContent=name+': '+quoted.body.slice(0,130);
    }
    $('#thread-form .send-btn').disabled=!draft.trim();
    // Reaction and reply re-render the list; keep the reading position
    // instead of unexpectedly jumping to the beginning of the thread.
    if(!$('#screen-thread').hidden)requestAnimationFrame(()=>{
      scroll.scrollTop=nearLatest?scroll.scrollHeight:previousTop;
    });
  }
  function safeThread(action){
    try{action();return true;}
    catch{
      note.textContent='Saved conversation unavailable. Your earlier messages and draft are preserved.';
      threadInput.disabled=true;
      $('#thread-form .send-btn').disabled=true;
      return false;
    }
  }
  function updateRow(row,preview,time){
    row.querySelector('.conversation-copy > span').textContent=preview;
    row.querySelector('time').textContent=time;
    row.dataset.search=(row.querySelector('strong').textContent+' '+preview).toLocaleLowerCase();
  }
  function inbox(){
    for(const row of all('.conversation-row'))row.hidden=!allowsRow(row);
    const group=$('.conversation-row[data-open="thread"]');
    const latest=host.conversation();
    if(allowed('thread')){
      const item=latest.lastMessage;
      updateRow(group,item?item.author+': '+item.body:latest.status==='ok'?'Start the conversation.':'Saved conversation unavailable',item?new Date(item.createdAt).toLocaleDateString(): '');
      const badge=group.querySelector('.unread');
      badge.hidden=!latest.unreadCount;
      badge.textContent=String(latest.unreadCount);
    }
    for(const row of all('.conversation-row[data-person]')){
      if(!allowsRow(row))continue;
      const last=host.messages(row.dataset.person).at(-1);
      if(last)updateRow(row,last.name+': '+last.text,last.time);
    }
    const team=$('.conversation-row[data-open="room"]');
    team.querySelector('.unread').hidden=true;
    const last=host.room().messages?.at(-1);
    if(last)updateRow(team,'You: '+last,'Local demo');
  }
  function showRsvp(){
    for(const button of [$('#rsvp-action'),$('[data-rsvp-mirror]')]){
      button.setAttribute('aria-pressed',String(!!host.room().rsvp));
      button.textContent=host.room().rsvp?"You're in ✓":"Count me in →";
    }
  }
  function showPrayer(){
    $('#prayer-action').setAttribute('aria-pressed',String(host.praying()));
    $('#prayer-action').textContent=host.praying()?"You're praying ✓":"I'm praying ♡";
  }
  function show(screen,name){
    if(screen==='inbox')inbox();
    if(screen==='thread'){
      safeThread(()=>{
        if(!readModel.markRead({storage:localStorage,domain,member:allowed('thread')}))throw Error('Unavailable');
        drawThread();
      });
      showPrayer();
    }
    if(screen==='room'){
      $('#room-new-messages').replaceChildren(...(host.room().messages||[]).map(text=>message(text,'You','Local demo')));
      showRsvp();
    }
    if(screen==='direct'){
      $('#direct-new-messages').replaceChildren(...host.messages(name).map(item=>message(item.text,item.name,item.time,item.name==='You')));
    }
  }
  function send(screen,name,text){
    if(!allowed(screen))return false;
    if(screen==='thread')return safeThread(()=>{
      thread((repo,fields)=>{
        const sent=repo.sendMessage({...actor,body:text,replyToMessageId:fields.replyTo});
        repo.setDeliveryStatus({...actor,messageId:sent.id,status:'sent'});
        fields.draft='';fields.replyTo=null;
      });drawThread();
    });
    if(!host.write(screen,text,name))return false;
    show(screen,name);
    return true;
  }
  function setup(){
    document.body.classList.add('connect-member');
    $('.bottom-nav').remove();
    all('.people-rail button, .dialog-person').forEach(row=>{row.hidden=!allowsRow(row);});
    $('#compose-toggle').hidden=!allowed('direct');
    $('#moment-open').hidden=!allowed('thread');
    if(!allowed('room')&&!allowed('thread')){
      $('.people-rail').previousElementSibling.hidden=true;
      $('.people-rail').hidden=true;
      $('.inbox-footnote').textContent='Your inbox is ready. Conversations appear when your demo profile has a group or serving team.';
    }else $('.inbox-footnote').textContent='Fictional conversations · Only on this device.';
    all('#thread-scroll > .message').forEach(row=>row.remove());
    prayer.before(threadList);
    $('.chat-header-title p').textContent='Wednesday Group · Small Group';
    threadInput.addEventListener('input',()=>{
      syncDraftPresentation();
      safeThread(()=>thread((_repo,fields)=>{fields.draft=threadInput.value;}));
    });
    $('#reply-cancel').addEventListener('click',()=>safeThread(()=>{
      thread((_repo,fields)=>{fields.replyTo=null;});
      drawThread();
      threadInput.focus();
    }));
  }
  window.RallyConnectMember={initial:host,allowed,allowsRow,setup,show,send,
    pray(){if(host.write('prayer',!host.praying()))showPrayer();},
    rsvp(){if(host.write('rsvp',!host.room().rsvp))showRsvp();}
  };
})();
