/* Foundation 2 Today: real guarded transitions, isolated synthetic persistence.
 * Existing intelligence and storage modules own state and write safety.
 * No production, network, legacy local-storage or cross-scenario writes.
 */
(function(){
'use strict';
const root=document.getElementById('today'),select=document.getElementById('scenario');
let state,ui,conversation,store,receipt='',blocked='';
const fallback=name=>{
 const scope=FoundationStateStore.scenarios[name];
 const state=RallyAppState.initialize(()=>null,true);
 state.role=scope.role;
 return {state,ui:{name:'Friend',campus:'north',memberships:{group:scope.group,team:scope.team}}};
};
function selectScenario(name){
 receipt='';blocked='';
 try{
  store=FoundationStateStore.create({
   storage:window.localStorage,scenario:name,
   Guard:RallyStorageGuard,AppState:RallyAppState
  });
  const loaded=store.read();
  state=loaded.state;ui=loaded.ui;
  if(!loaded.ok)blocked=loaded.reason;
 }catch(_){
  store=null;
  ({state,ui}=fallback(name));
  blocked='This preview could not safely access local storage. Responses are disabled; nothing will be overwritten.';
 }
 conversation=name==='unavailable'?{status:'unavailable'}:{status:'ok',unreadCount:3};
 draw();
}
function draw(focus=false){
 const now=new Date(),snapshot=RallyIntelligence.derive({state,ui,conversation,now});
 root.innerHTML=FoundationView.render(FoundationToday.project(snapshot,now),receipt);
 if(blocked){
  const warning=document.createElement('p');
  warning.className='storage-warning';warning.setAttribute('role','alert');warning.textContent=blocked;
  root.prepend(warning);
  root.querySelectorAll('button[data-command]').forEach(b=>{b.disabled=true;b.setAttribute('aria-disabled','true');});
 }
 if(focus)root.focus({preventScroll:true});
}
select.addEventListener('change',()=>{
 selectScenario(select.value);
 document.getElementById('preview-tools')?.removeAttribute('open');
});
root.addEventListener('click',event=>{
 const button=event.target.closest('button[data-command]');
 if(!button||!root.contains(button)||blocked)return;
 const command=FoundationToday.commandFor(button.dataset.command,button.dataset.person);
 if(!command)return;
 const result=RallyMemberContext.transition({state,ui,conversation,command,now:new Date()});
 if(!result.ok){receipt='No change: '+result.reason+'.';draw(true);return;}
 // Commit first; never show completion or adopt uncommitted state.
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
selectScenario(select.value);
})();