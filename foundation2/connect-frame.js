/* Foundation-only binding around the unchanged premium controller's public host
 * seam. Draft durability uses the existing guarded primary owner, never a second
 * message repository. The accepted UI still owns composers, tabs and scrolling. */
(function(){
'use strict';
const host=window.frameElement?.connectMember,member=window.RallyConnectMember;if(!host||!member)return;
let screen='inbox',person='',restoring=false;
const failed=new Set(),$=s=>document.querySelector(s);
const draftKey=(s,n)=>s==='direct'?'direct:'+n:s;
function sync(input){restoring=true;input.dispatchEvent(new Event('input',{bubbles:true}));restoring=false;}
function context(){
 const m=host.metadata(),care=m.care;
 const prayer=$('#prayer-moment');prayer.hidden=!care;
 $('#moment-open').hidden=!care||!host.access().group;
 if(care){
  prayer.querySelector('h3').textContent='A moment for '+care.person;
  prayer.querySelector('p').textContent=care.request;
  prayer.querySelector('.prayer-bottom>span').textContent=care.person+' · Shared sample request';
  $('#moment-open>span:not([class])').textContent=care.person+' shared a prayer request with your group.';
  const button=$('#prayer-action');button.disabled=care.stage!=='ready';button.setAttribute('aria-pressed',String(!!care.prayed));button.textContent=care.prayed?'Prayer marked on this device':'I prayed';
 }
 if(host.access().team){
  $('.room-identity h2').textContent=m.teamName;
  $('.room-identity p').textContent=m.teamLocation+' · Fictional team';
  $('.conversation-row[data-open=room] strong').textContent=m.teamName;
  $('.event-card p').textContent=m.teamLocation+' · Sample Room event';
  $('.plan-block p').textContent=m.teamLocation+' · Sample Room event';
 }
}
const setup=member.setup;
member.setup=()=>{setup();$('.chat-caption').textContent='Fictional group conversation · Saved only on this device.';
 const failure=()=>{if($('#thread-input').disabled)host.report($('.chat-caption').textContent);};
 $('#thread-input').addEventListener('input',failure);document.addEventListener('click',failure);};
const show=member.show;
member.show=function(next,name){
 const priorScreen=screen,priorPerson=person;
 screen=next;person=name||'';show(next,name);context();
 if(next==='inbox')requestAnimationFrame(()=>requestAnimationFrame(()=>{
  if(!window.frameElement?.isConnected||screen!=='inbox')return;
  const active=document.activeElement;
  if(active!==document.body&&active?.isConnected&&!active.closest('[hidden]'))return;
  const selector=priorScreen==='direct'?'.conversation-row[data-person="'+priorPerson+'"]':priorScreen==='thread'||priorScreen==='room'?'.conversation-row[data-open="'+priorScreen+'"]':'#screen-inbox h2';
  const target=$(selector)||(priorScreen==='direct'?$('.people-rail [data-person="'+priorPerson+'"]'):null);if(target&&!target.closest('[hidden]')){if(target.tagName==='H2')target.tabIndex=-1;target.focus({preventScroll:true});target.scrollIntoView({block:'nearest'});}
 }));
 if(next==='direct'||next==='room'){
  const input=$(next==='direct'?'#direct-input':'#room-input'),key=draftKey(next,person);
  if(!failed.has(key)){input.value=host.draft(next,person);sync(input);}
 }
 host.screenChanged(next,person);
};
const send=member.send;
member.send=function(s,n,text){const result=send(s,n,text);if(result){failed.delete(draftKey(s,n));host.report('');}else host.report('Message was not saved. Your earlier conversation and saved draft are preserved. No external delivery.');return result;};
const rsvp=member.rsvp;
member.rsvp=()=>{const wanted=!host.room().rsvp;rsvp();if(!!host.room().rsvp!==wanted)host.report('Room RSVP could not be saved. Earlier state is preserved.');else host.report('');};
member.pray=()=>{if(host.write('prayer',true))context();else host.report('Prayer state could not be saved. Earlier state is preserved.');};
for(const s of ['direct','room']){
 const input=$(s==='direct'?'#direct-input':'#room-input');
 input.addEventListener('input',()=>{
  if(restoring||screen!==s)return;
  const key=draftKey(s,person),ok=host.saveDraft(s,person,input.value);
  if(ok){failed.delete(key);input.removeAttribute('aria-invalid');host.report('');}
  else{failed.add(key);input.setAttribute('aria-invalid','true');host.report('Draft could not be saved. Keep this screen open to retain your unsaved text; reload restores the earlier saved draft.');}
 });
}
window.FoundationConnectFrame={navigate(next){
 if(next.screen===screen&&(next.screen!=='direct'||next.person===person))return;
 if(next.screen==='inbox')$('.screen:not([hidden]) [data-open=inbox]')?.click();
 else if(next.screen==='direct')$('.people-rail [data-person="'+next.person+'"]')?.click();
 else $('.conversation-row[data-open="'+next.screen+'"]')?.click();
}};
// Deferred controller scripts complete before DOMContentLoaded; images may
// still be loading. Expose only the bound, permission-filtered message UI.
document.addEventListener('DOMContentLoaded',()=>{
 if(!document.body.classList.contains('connect-member'))return;
 const active=parent.document.activeElement;
 const mayFocus=active===window.frameElement||active===parent.document.body||active===parent.document.getElementById('today');
 host.ready?.();
 // The accepted controller's initial focus happened while the frame was
 // unavailable. Restore its heading only if the user has not moved elsewhere.
 if(mayFocus){
  const heading=$('.screen:not([hidden]) .chat-header h2,.screen:not([hidden]) .room-identity h2,.screen:not([hidden]) .inbox-headline h2');
  if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});}
 }
},{once:true});
})();
