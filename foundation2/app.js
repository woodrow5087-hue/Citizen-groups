/* Foundation 2 application controller. Navigation, presentation and Connect
 * use existing canonical state/permissions and domain engines. This controller
 * owns only user events, in-memory route state and preview lifecycle.
 */
(function(){
'use strict';
const root=document.getElementById('today'),select=document.getElementById('scenario'),tabs=document.getElementById('primary-nav');
let memberPanel,premium=null,renderedEvents={};
let route=FoundationNavigation.resolve(window.location.search);
let scrollTimer;
history.scrollRestoration='manual';
let state,ui,store,connect,receipt='',blocked='',chatFeedback='',groupFeedback='',teamFeedback='',readFeedback='';
const groupPreviewActive=()=>FoundationGroupPreview.isActive(select.value);
const localScenario=selection=>FoundationGroupPreview.isActive(selection)?'group':FoundationServing.localScenario(selection);
const scenarioSessionKey='rally-one-foundation2-v1:selected-scenario';
// The selector represents a synthetic test persona, not app membership state.
// Keep the selected persona across reloads within this tab only, without
// touching any existing Rally One persistent keys or changing permissions.
function restoreScenario(){
 try{
  const saved=window.sessionStorage.getItem(scenarioSessionKey);
  if(saved&&Object.hasOwn(FoundationStateStore.scenarios,localScenario(saved)))select.value=saved;
 }catch(_){/* private-mode fallback: default scenario */ }
}
function rememberScenario(value){
 try{window.sessionStorage.setItem(scenarioSessionKey,value);}catch(_){/* no state mutation */ }
}
const fallback=name=>{
 const scope=FoundationStateStore.scenarios[name],defaultState=RallyAppState.initialize(()=>null,true);
 defaultState.role=scope.role;
 return {state:defaultState,ui:{name:'Friend',campus:'north',memberships:{group:scope.group,team:scope.team}}};
};
const inThread=()=>route==='connect'&&new URLSearchParams(window.location.search).get('thread')==='group';
const inClassic=()=>route==='read'&&new URLSearchParams(window.location.search).get('game')==='classic';
const safeText=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const gameIcon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+
 (name==='check'?'<path d="m4 12 5 5L20 6"/>':name==='group'?'<circle cx="9" cy="8" r="3"/><path d="M2 21v-3a7 7 0 0 1 14 0v3"/>':'<path d="M4 12h16m-6-6 6 6-6 6"/>')+'</svg>';
function readMarkup(snapshot){
 const vm=FoundationRead.project(snapshot,state,RallyMemory,new Date());
 // The canonical VersePlay presentation normalizes memory game state while
 // rendering. Give it a copy so a read-only draw cannot mutate persisted data.
 const visible={...state,memoryGames:{...(state.memoryGames||{})}};
 const gameHTML=inClassic()?RallyVersePlay.render(visible,safeText,gameIcon):'';
 return FoundationRead.render(vm,{feedback:readFeedback,mode:inClassic()?'classic':'home',gameHTML});
}
const conversation=()=>{
 if(select.value==='unavailable')return {status:'unavailable',unreadCount:null,messages:[],draft:'',replyTo:null};
 return connect?connect.view():{status:'unavailable',unreadCount:null,messages:[],draft:'',replyTo:null};
};
function selectScenario(selection){
 const name=localScenario(selection);
 receipt='';blocked='';chatFeedback='';groupFeedback='';teamFeedback='';readFeedback='';
 try{
  store=FoundationStateStore.create({storage:window.localStorage,scenario:name,Guard:RallyStorageGuard,AppState:RallyAppState});
  const loaded=store.read();
  state=loaded.state;ui=loaded.ui;
  if(!loaded.ok)blocked=loaded.reason;
 }catch(_){
  store=null;({state,ui}=fallback(name));
  blocked='This preview could not safely access local storage. Responses are disabled; nothing will be overwritten.';
 }
 try{
  const selectedOwner=select.value,selectedStore=store;
  connect=groupPreviewActive()?null:FoundationConnect.create({storage:window.localStorage,scenario:name,Read:RallyConversationRead,
   Domain:RallyChatDomain,isMember:()=>!blocked&&select.value===selectedOwner&&store===selectedStore&&ui.memberships.group===true&&select.value!=='unavailable'});
 }catch(_){connect=null;}
 draw();
}
function currentSession(){return FoundationMemberSession.derive({state,ui,conversation:conversation(),now:new Date(),owner:localScenario(select.value)});}
function memberTransition(options){
 const kind=options.command.type==='group-rsvp'?'group':['serving-response','serving-coverage'].includes(options.command.type)?'team':null;
 return FoundationMemberSession.transition({...options,owner:localScenario(select.value),command:{...options.command,...(kind?{eventId:options.command.eventId||renderedEvents[kind]}:{})}});
}
function saveConversation(next){
 if(blocked)return {ok:false,reason:blocked};
 const result=store?.save(next,ui)||{ok:false,reason:'Storage unavailable'};
 if(result.ok)state=next;else blocked=result.reason||'Storage unavailable; earlier state is preserved.';
 return result;
}
function connectMarkup(chat,snapshot){
 if(blocked||groupPreviewActive()||FoundationServing.isActive(select.value)||chat.status==='unavailable')return FoundationConnectView.render(chat,{member:!groupPreviewActive()&&snapshot.context.permissions.group});
 return FoundationConnectPresentation.render(history.state?.connectOrigin||history.state?.returnRoute||'today');
}
function mountConnect(){
 const container=root.querySelector('#premium-connect-mount');if(!container)return;
 const owner=select.value,selectedStore=store;
 const host=FoundationConversationHost.create({getState:()=>state,getSession:currentSession,save:saveConversation,
  isCurrent:()=>route==='connect'&&select.value===owner&&store===selectedStore&&!blocked,
  conversation,storage:connect.presentationStorage(),Read:RallyConversationRead,Domain:RallyChatDomain,
  markPrayer:()=>{const next=memberTransition({state,ui,conversation:conversation(),command:{type:'care-mark-prayed'},now:new Date()});return next.ok?saveConversation(next.state):next;}});
 if(!host.status().ok){container.innerHTML='<p role="alert">Saved messaging state needs review. Existing messages and drafts are preserved.</p>';return;}
 const origin=history.state?.connectOrigin||history.state?.returnRoute||'today';
 premium=FoundationConnectPresentation.mount({container,host,storage:host.storage,key:owner,search:location.search,
  onReturn:()=>{const entry=history.state;if(entry?.connectOrigin)history.go(-((entry.connectDepth||0)+1));else go(origin==='connect'?'today':origin);},
  onScreen:(screen,person)=>{
   const url=FoundationConnectPresentation.href(screen,person);if(new URL(url,location.href).href===location.href)return;
   const entry=history.state||{};
   if(screen==='inbox'){
    if(entry.connectDepth>0){history.back();return;}
    history.replaceState({...entry,route:'connect'},'',url);return;
   }
   history.pushState({...entry,route:'connect',returnRoute:'connect',connectOrigin:entry.connectOrigin||origin,connectDepth:(entry.connectDepth||0)+1},'',url);
  }});
}
function draw(focus=false){
 const now=new Date(),chat=conversation(),session=FoundationMemberSession.derive({owner:localScenario(select.value),state,ui,conversation:chat,now}),snapshot=session.snapshot;
 renderedEvents=session.events;
 const avatar=document.querySelector('.preview-avatar');if(avatar)avatar.textContent=ui.name==='Friend'?'D':ui.name.slice(0,1).toUpperCase();
 memberPanel?.scopeCheck();
 const serving=FoundationServing.project(select.value,snapshot.context,window.FoundationServingFixtures);
 const servingPreview=FoundationServing.render(serving);
 const group=FoundationGroupPreview.project(select.value,snapshot.context,window.FoundationGroupFixtures);
 const groupPreview=FoundationGroupPreview.render(group);
 const reuse=route==='connect'&&!blocked&&premium?.key===select.value&&premium.frame.isConnected;
 if(!reuse){premium?.dispose();premium=null;}
 if(!reuse)root.innerHTML=route==='today'?FoundationView.render(FoundationMemberSession.decision(session,now,serving?.state,group?.state).view,receipt,servingPreview+groupPreview):
  route==='connect'?connectMarkup(chat,snapshot):
  route==='groups'?FoundationGroups.render(FoundationGroups.project(snapshot,chat),{feedback:groupFeedback,blocked:!!blocked,groupPreview}):
  route==='team'?FoundationTeam.render(FoundationTeam.project(snapshot),{feedback:teamFeedback,blocked:!!blocked,servingPreview}):
  route==='read'?readMarkup(snapshot):
  FoundationNavigation.renderRoute(route,snapshot);
 if(route==='connect'){if(reuse)premium.restore(location.search);else mountConnect();}
 root.setAttribute('aria-label',FoundationNavigation.names[route]);
 root.classList.toggle('is-read-v09',route==='read');
 tabs.innerHTML=FoundationNavigation.renderTabs(route);
 const connectLink=document.querySelector('.header-connect');
 if(route==='connect')connectLink?.setAttribute('aria-current','page');
 else connectLink?.removeAttribute('aria-current');
 document.title='Rally One · '+FoundationNavigation.names[route]+' · Foundation 2';
 if(session.unbound||!session.valid){root.insertAdjacentHTML('afterbegin','<p role="status">'+(session.valid?'Earlier sample responses are preserved without assigning them to a new event.':'Saved event responses need review. No new response can be saved.')+'</p>');}
 if(blocked){
  const warning=document.createElement('p');
  warning.className='storage-warning';warning.setAttribute('role','alert');warning.textContent=blocked;
  root.prepend(warning);
  root.querySelectorAll('button[data-command],button[data-group-action],button[data-team-action],button[data-read-action],button[data-action^=memory-],button[data-chat-open],.chat-send,#chat-draft,#read-reflection-input,#read-leader-question-text').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true');});
 }
 if(focus&&!reuse)root.focus({preventScroll:true});
}
function rememberPosition(focusId=history.state?.focusId){
 const entry=history.state,scroll=window.scrollY;
 if(entry?.route!==route||entry.scroll!==scroll||entry.focusId!==focusId){
  history.replaceState({...entry,route,scroll,focusId},'');
 }
}
function restorePosition(entry){
 window.scrollTo(0,Math.max(0,Number(entry?.scroll)||0));
}
function go(next,url,origin){
 const nextUrl=url||FoundationNavigation.href(next);
 if(new URL(nextUrl,window.location.href).href===window.location.href){
  root.focus({preventScroll:true});return;
 }
 clearTimeout(scrollTimer);
 rememberPosition(origin?.dataset.returnFocus??null);
 history.pushState({route:next,scroll:0,returnRoute:route,...(next==='connect'?{connectOrigin:route,connectDepth:0}:{})},'',nextUrl);
 route=next;
 chatFeedback='';groupFeedback='';teamFeedback='';readFeedback='';
 draw(true);
 restorePosition(history.state);
}
function returnTo(fallback){
 if(history.state?.returnRoute===fallback){
  clearTimeout(scrollTimer);
  rememberPosition();
  history.back();
 }else{
  go(fallback);
 }
}
function isPlainClick(event){
 return !event.defaultPrevented&&event.button===0&&!event.metaKey&&!event.ctrlKey&&!event.shiftKey&&!event.altKey;
}
select.addEventListener('change',()=>{
 rememberScenario(select.value);
 selectScenario(select.value);
 document.getElementById('preview-tools')?.removeAttribute('open');
 root.focus({preventScroll:true});
});
document.addEventListener('click',event=>{
 const link=event.target.closest('a[data-route]');
 if(!link||!isPlainClick(event))return;
 const next=link.dataset.route;
 if(!Object.hasOwn(FoundationNavigation.names,next))return;
 event.preventDefault();go(next,link.getAttribute('href'),link);
});
window.addEventListener('scroll',()=>{
 clearTimeout(scrollTimer);
 scrollTimer=setTimeout(()=>rememberPosition(),200);
},{passive:true});
window.addEventListener('popstate',event=>{
 clearTimeout(scrollTimer);
 route=FoundationNavigation.resolve(window.location.search);
 chatFeedback='';groupFeedback='';teamFeedback='';readFeedback='';
 draw();
 const control=event.state?.focusId&&document.querySelector('[data-return-focus="'+CSS.escape(event.state.focusId)+'"]');
 if(route!=='connect'||!premium)(control||root).focus({preventScroll:true});
 restorePosition(event.state);
});
if(typeof ResizeObserver==='function'){
 new ResizeObserver(()=>{
  document.documentElement.style.setProperty('--nav-clearance',Math.ceil(tabs.getBoundingClientRect().height+12)+'px');
 }).observe(tabs);
}
root.addEventListener('click',event=>{
 const target=event.target;
 const open=target.closest('[data-chat-open]');
 if(open){
  if(blocked||conversation().status!=='ok')return;
  go('connect','?screen=connect&thread=group',open);return;
 }
 const back=target.closest('a[data-thread=inbox]');
 if(back&&isPlainClick(event)){
  event.preventDefault();
  returnTo(history.state?.returnRoute==='groups'?'groups':'connect');return;
 }
 const reply=target.closest('button[data-chat-reply]');
 if(reply){
  const result=connect?.reply(reply.dataset.chatReply);
  chatFeedback=result?.ok?'Reply selected.':'Reply unavailable; previous draft preserved.';
  draw(true);if(result?.ok)root.querySelector('#chat-draft')?.focus();return;
 }
 const cancel=target.closest('button[data-chat-reply-cancel]');
 if(cancel){
  const result=connect?.reply(null);
  chatFeedback=result?.ok?'Reply cancelled.':'Could not change the saved reply.';
  draw(true);root.querySelector('#chat-draft')?.focus();return;
 }
 const readLink=target.closest('a[data-read-view]');
 if(readLink&&isPlainClick(event)){
  event.preventDefault();
  if(readLink.dataset.readView==='home')returnTo('read');
  else go('read',readLink.getAttribute('href'),readLink);
  return;
 }
 const gamesJump=target.closest('.read-games-jump');
 if(gamesJump&&isPlainClick(event)){
  event.preventDefault();
  const heading=root.querySelector('#read-games-title');
  heading?.focus({preventScroll:true});
  heading?.scrollIntoView({block:'start'});
  return;
 }
 const classicButton=target.closest('button[data-action^=memory-]');
 if(classicButton&&route==='read'&&inClassic()){
  if(blocked)return;
  const before=state;
  const next={...before,memoryGames:structuredClone(before.memoryGames||{})};
  let notice='';
  RallyMemoryActions.run(classicButton.dataset.action,classicButton.dataset.value,{
   s:next,M:RallyMemory,render:()=>{},notify:m=>{notice=m;}
  });
  const saved=store?.save(next,ui)||{ok:false,reason:'Guarded storage unavailable'};
  if(saved.ok){
   state=next;
   readFeedback=notice||'Your original Classic VersePlay progress is saved locally.';
  }else{blocked=saved.reason||'Game progress could not be saved safely.';readFeedback='';}
  draw(true);return;
 }
 const readButton=target.closest('button[data-read-action]');
 if(readButton&&route==='read'){
  if(blocked)return;
  const command=FoundationRead.commandFor(readButton.dataset.readAction,readButton.dataset.value);
  if(!command){readFeedback='Unavailable reading action.';draw(true);return;}
  const changed=memberTransition({state,ui,conversation:conversation(),command,now:new Date()});
  if(!changed.ok){readFeedback='No change: '+changed.reason+'.';draw(true);return;}
  const saved=store?.save(changed.state,ui)||{ok:false,reason:'Guarded storage unavailable'};
  if(saved.ok){
   state=changed.state;
   readFeedback='Your optional reading or reflection state was saved on this device.';
  }else{blocked=saved.reason||'Reading state could not be saved safely.';readFeedback='';}
  draw(true);return;
 }
 const teamButton=target.closest('button[data-team-action]');
 if(teamButton&&route==='team'){
  if(blocked||FoundationServing.isActive(select.value))return;
  const command=FoundationTeam.commandFor(teamButton.dataset.teamAction,teamButton.dataset.value);
  if(!command){teamFeedback='This serving action is not available.';draw(true);return;}
  const result=memberTransition({state,ui,conversation:conversation(),command,now:new Date()});
  if(!result.ok){teamFeedback='No change: '+result.reason+'.';draw(true);return;}
  const saved=store?.save(result.state,ui)||{ok:false,reason:'Guarded storage is unavailable'};
  if(saved.ok){
   state=result.state;
   teamFeedback=command.type==='serving-coverage'?
    (command.value==='request'?'Fictional coverage request saved only on this device. Nobody was notified.':
     'Fictional coverage request withdrawn on this device. Nobody was notified.'):
    command.value==='confirmed'?'Fictional serving availability confirmed on this device.':
    'Fictional serving availability marked unable on this device.';
  }else{
   blocked=saved.reason||'Serving response could not be saved safely.';
   teamFeedback='';
  }
  draw(true);return;
 }
 const groupButton=target.closest('button[data-group-action]');
 if(groupButton&&route==='groups'){
  if(blocked||groupPreviewActive())return;
  const command=FoundationGroups.commandFor(groupButton.dataset.groupAction,groupButton.dataset.value);
  if(!command){groupFeedback='This group action is not available.';draw(true);return;}
  const result=memberTransition({state,ui,conversation:conversation(),command,now:new Date()});
  if(!result.ok){groupFeedback='No change: '+result.reason+'.';draw(true);return;}
  const saved=store?.save(result.state,ui)||{ok:false,reason:'Guarded storage is unavailable'};
  if(saved.ok){
   state=result.state;
   groupFeedback=command.type==='group-rsvp'?'Gathering response saved on this device.':
    command.type==='leader-review'?'Sample leader follow-up saved on this device.':
    'Fictional prayer response saved on this device.';
  }else{
   blocked=saved.reason||'Stored group response could not be saved safely.';
   groupFeedback='';
  }
  draw(true);return;
 }
 const button=target.closest('button[data-command]');
 if(!button||blocked||route!=='today')return;
 const command=FoundationToday.commandFor(button.dataset.command,button.dataset.person);
 if(!command||groupPreviewActive()||(command.type==='serving-response'&&FoundationServing.isActive(select.value)))return;
 const result=memberTransition({state,ui,conversation:conversation(),command,now:new Date()});
 if(!result.ok){receipt='No change: '+result.reason+'.';draw(true);return;}
 const saved=store?.save(result.state,ui)||{ok:false,reason:'Guarded storage is unavailable'};
 if(saved.ok){
  state=result.state;
  receipt=command.type==='group-rsvp'?'Sample RSVP saved on this device.':
   command.type==='serving-response'?'Sample serving response saved on this device.':
   'Sample leader review saved on this device.';
 }else{
  blocked=saved.reason||'Saved state could not be updated safely. Nothing was marked complete.';
  receipt='';
 }
 draw(true);
});
root.addEventListener('input',event=>{
 const input=event.target.closest('#chat-draft');
 if(!input||blocked)return;
 const result=connect?.saveDraft(input.value);
 const send=root.querySelector('.chat-send');
 if(send)send.disabled=!result?.ok||!input.value.trim();
 if(!result?.ok){
  chatFeedback='Draft could not be saved. Your previous saved conversation is unchanged.';
  const notice=root.querySelector('.chat-feedback');
  if(notice)notice.textContent=chatFeedback;
  else input.setAttribute('aria-invalid','true');
 }else{chatFeedback='';input.removeAttribute('aria-invalid');}
});
root.addEventListener('submit',event=>{
 const form=event.target;
 if(form.id==='read-reflection-form'||form.id==='read-leader-question'){
  event.preventDefault();
  if(blocked||route!=='read')return;
  const reading=FoundationRead.project(FoundationMemberSession.derive({owner:localScenario(select.value),
   state,ui,conversation:conversation(),now:new Date()
  }).snapshot,state,RallyMemory,new Date());
  const command=form.id==='read-reflection-form'?
   {type:'reflection-save',text:form.elements.reflection.value,passage:reading.passage.reference}:
   {type:'reading-question-save',text:form.elements.question.value};
  const changed=memberTransition({state,ui,conversation:conversation(),command,now:new Date()});
  if(!changed.ok){readFeedback='Unable to save: '+changed.reason+'.';draw(true);return;}
  const saved=store?.save(changed.state,ui)||{ok:false,reason:'Guarded storage unavailable'};
  if(saved.ok){state=changed.state;readFeedback='Your sample reflection was saved only on this device.';}
  else{blocked=saved.reason||'The local reading note could not be saved safely.';readFeedback='';}
  draw(true);return;
 }
 if(event.target.id!=='chat-compose')return;
 event.preventDefault();
 if(blocked)return;
 const input=root.querySelector('#chat-draft'),body=input?.value||'';
 const result=connect?.send(body);
 chatFeedback=result?.ok?'Sample message saved only on this device. No real delivery.':
  'Unable to save sample message. Draft and previous conversation were preserved.';
 draw(true);
});
restoreScenario();
selectScenario(select.value);
memberPanel=FoundationMemberPanel.create({getSession:currentSession,getUI:()=>ui,getStore:()=>store,
 navigate:(next,pane)=>go(next==='groups'&&pane==='chat'?'connect':next,next==='groups'&&pane==='chat'?'?screen=connect&thread=group':null),
 profileChanged:()=>{ui=store.read().ui;draw(true);},
 perform:command=>{if(FoundationGroupPreview.isActive(select.value)||FoundationServing.isActive(select.value))return {ok:false,reason:'Provider samples are read-only'};if(blocked)return {ok:false,reason:blocked};const r=memberTransition({state,ui,conversation:conversation(),command,now:new Date()});if(!r.ok){draw();return r;}const saved=store?.save(r.state,ui);if(!saved?.ok){blocked=saved?.reason||'Storage unavailable';draw();return {ok:false,reason:blocked};}state=r.state;draw();return {ok:true};}});
restorePosition(history.state);
})();