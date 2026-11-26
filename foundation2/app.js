/* Foundation 2 application controller. Navigation, presentation and Connect
 * use existing canonical state/permissions and domain engines. This controller
 * owns only user events, in-memory route state and preview lifecycle.
 */
(function(){
'use strict';
const root=document.getElementById('today'),select=document.getElementById('scenario'),tabs=document.getElementById('primary-nav');
let route=FoundationNavigation.resolve(window.location.search);
let state,ui,store,connect,receipt='',blocked='',chatFeedback='';
const fallback=name=>{
 const scope=FoundationStateStore.scenarios[name],defaultState=RallyAppState.initialize(()=>null,true);
 defaultState.role=scope.role;
 return {state:defaultState,ui:{name:'Friend',campus:'north',memberships:{group:scope.group,team:scope.team}}};
};
const inThread=()=>route==='connect'&&new URLSearchParams(window.location.search).get('thread')==='group';
const conversation=()=>{
 if(select.value==='unavailable')return {status:'unavailable',unreadCount:null,messages:[],draft:'',replyTo:null};
 return connect?connect.view():{status:'unavailable',unreadCount:null,messages:[],draft:'',replyTo:null};
};
function selectScenario(name){
 receipt='';blocked='';chatFeedback='';
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
  connect=FoundationConnect.create({storage:window.localStorage,scenario:name,Read:RallyConversationRead,
   Domain:RallyChatDomain,isMember:()=>ui.memberships.group===true&&select.value!=='unavailable'});
 }catch(_){connect=null;}
 if(inThread()&&!blocked&&select.value!=='unavailable')connect?.markRead();
 draw();
}
function draw(focus=false){
 const now=new Date(),chat=conversation(),snapshot=RallyIntelligence.derive({state,ui,conversation:chat,now});
 root.innerHTML=route==='today'?FoundationView.render(FoundationToday.project(snapshot,now),receipt):
  route==='connect'?FoundationConnectView.render(chat,{thread:inThread(),member:snapshot.context.permissions.group,feedback:chatFeedback}):
  FoundationNavigation.renderRoute(route,snapshot);
 root.setAttribute('aria-label',FoundationNavigation.names[route]);
 tabs.innerHTML=FoundationNavigation.renderTabs(route);
 const connectLink=document.querySelector('.header-connect');
 if(route==='connect')connectLink?.setAttribute('aria-current','page');
 else connectLink?.removeAttribute('aria-current');
 document.title='Rally One · '+FoundationNavigation.names[route]+' · Foundation 2';
 if(blocked){
  const warning=document.createElement('p');
  warning.className='storage-warning';warning.setAttribute('role','alert');warning.textContent=blocked;
  root.prepend(warning);
  root.querySelectorAll('button[data-command],.chat-send,#chat-draft').forEach(el=>{el.disabled=true;el.setAttribute('aria-disabled','true');});
 }
 if(focus)root.focus({preventScroll:true});
}
function go(next,url){
 const nextUrl=url||FoundationNavigation.href(next);
 if(next===route&&window.location.search===new URL(nextUrl,window.location.href).search){
  root.focus({preventScroll:true});return;
 }
 history.replaceState({...history.state,scroll:window.scrollY,route},'',window.location.href);
 history.pushState({route:next,scroll:0},'',nextUrl);
 route=next;
 chatFeedback='';
 if(inThread()&&!blocked){
  const seen=connect?.markRead();
  if(!seen?.ok)chatFeedback='Conversation could not be marked read. Existing data was preserved.';
 }
 draw(true);
 window.scrollTo(0,0);
}
select.addEventListener('change',()=>{
 selectScenario(select.value);
 document.getElementById('preview-tools')?.removeAttribute('open');
});
document.addEventListener('click',event=>{
 const link=event.target.closest('a[data-route]');
 if(!link||!document.contains(link))return;
 const next=link.dataset.route;
 if(!Object.hasOwn(FoundationNavigation.names,next))return;
 event.preventDefault();go(next);
});
window.addEventListener('popstate',event=>{
 route=FoundationNavigation.resolve(window.location.search);
 chatFeedback='';
 draw(true);
 window.scrollTo(0,Math.max(0,Number(event.state?.scroll)||0));
});
root.addEventListener('click',event=>{
 const target=event.target;
 const open=target.closest('[data-chat-open]');
 if(open){
  if(blocked||conversation().status!=='ok')return;
  go('connect','?screen=connect&thread=group');return;
 }
 const back=target.closest('a[data-thread=inbox]');
 if(back){event.preventDefault();go('connect','?screen=connect');return;}
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
 const button=target.closest('button[data-command]');
 if(!button||blocked)return;
 const command=FoundationToday.commandFor(button.dataset.command,button.dataset.person);
 if(!command)return;
 const result=RallyMemberContext.transition({state,ui,conversation:conversation(),command,now:new Date()});
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
 if(event.target.id!=='chat-compose')return;
 event.preventDefault();
 if(blocked)return;
 const input=root.querySelector('#chat-draft'),body=input?.value||'';
 const result=connect?.send(body);
 chatFeedback=result?.ok?'Sample message saved only on this device. No real delivery.':
  'Unable to save sample message. Draft and previous conversation were preserved.';
 draw(true);
});
selectScenario(select.value);
})();