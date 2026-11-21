/* F-06 fictional Wednesday Group lab: no real people, server, or legacy state migration. */
(function(){
'use strict';
const DOMAIN=window.RallyChatDomain;
const STORAGE_KEY='rallypoint-wednesday-chat-lab-v1';
const CONVERSATION='group_wednesday';
const SELF='u_you';
const date='2026-11-18T18:30:00.000Z';
const users=[
  {id:'u_you',organizationId:'citizen_demo',displayName:'You'},
  {id:'u_jess',organizationId:'citizen_demo',displayName:'Jess W.'},
  {id:'u_anna',organizationId:'citizen_demo',displayName:'Anna L.'},
  {id:'u_marcus',organizationId:'citizen_demo',displayName:'Marcus C.'},
  {id:'u_taylor',organizationId:'citizen_demo',displayName:'Taylor D.'}
];
const $=id=>document.getElementById(id);
const view=$('conversation'),scroll=$('thread-scroll'),input=$('message-input'),send=$('send-message');
const status=$('save-indicator'),error=$('lab-error'),failControl=$('fail-next');
const messagesById=new Map();
const esc=value=>String(value??'').replace(/[&<>"']/g,char=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[char]));
const showError=message=>{error.textContent=message;error.hidden=!message;};
function fixture(){
 const snapshot=DOMAIN.emptyConversationSnapshot();
 snapshot.users=structuredClone(users);
 snapshot.conversations=[{id:CONVERSATION,organizationId:'citizen_demo',kind:'group',
   title:'Wednesday Group',createdAt:date}];
 snapshot.memberships=users.map((person,index)=>({
   id:'member_'+person.id,conversationId:CONVERSATION,userId:person.id,
   role:index===1?'leader':'member',status:'active'
 }));
 snapshot.messages=[
   {id:'seed_jess',conversationId:CONVERSATION,authorId:'u_jess',
     body:'This week we’re reading John 15:12. What’s one practical way we can love one another?',createdAt:'2026-11-18T18:30:00.000Z',
     deliveryStatus:'sent',replyToMessageId:null},
   {id:'seed_anna',conversationId:CONVERSATION,authorId:'u_anna',
     body:'I keep thinking it can be as simple as checking in on someone who’s had a hard week.',
     createdAt:'2026-11-18T18:33:00.000Z',deliveryStatus:'sent',replyToMessageId:'seed_jess'},
   {id:'seed_marcus',conversationId:CONVERSATION,authorId:'u_marcus',
     body:'That means a lot. Really grateful for you all.',
     createdAt:'2026-11-20T15:12:00.000Z',deliveryStatus:'sent',replyToMessageId:null},
   {id:'seed_you',conversationId:CONVERSATION,authorId:SELF,
     body:'Love that. Looking forward to seeing everyone Wednesday!',
     createdAt:'2026-11-20T16:21:00.000Z',deliveryStatus:'sent',replyToMessageId:'seed_anna'}
 ];
 snapshot.reactions=[
   {id:'seed_react',messageId:'seed_marcus',userId:'u_jess',emoji:'❤️',createdAt:'2026-11-20T15:13:00.000Z'}
 ];
 return snapshot;
}
let repository,draft='',replyTo=null,storageLocked=false;
function readLab(){
 try {
   const raw=localStorage.getItem(STORAGE_KEY);
   if(raw===null)return null;
   const parsed=JSON.parse(raw);
   if(parsed?.schemaVersion!==1 || !parsed.snapshot || typeof parsed.draft!=='string' ||
     parsed.draft.length>700 ||
     !(parsed.replyTo===null||typeof parsed.replyTo==='string'))throw Error('Unsupported local demo version');
   DOMAIN.assertConversationSnapshot(parsed.snapshot);
   const current=parsed.snapshot.conversations.some(c=>c.id===CONVERSATION);
   const member=parsed.snapshot.memberships.some(m=>m.userId===SELF&&m.conversationId===CONVERSATION&&m.status==='active');
   if(!current||!member)throw Error('Missing local demo thread or membership');
   return parsed;
 } catch(_){
   storageLocked=true;
   showError('This lab has saved data that could not be read. Nothing has been overwritten. Use Reset to start a fresh fictional lab.');
   return null;
 }
}
function saveLab(){
 if(storageLocked)return false;
 try {
   localStorage.setItem(STORAGE_KEY,JSON.stringify({
     schemaVersion:1,snapshot:repository.getSnapshot(),draft,replyTo
   }));
   status.textContent='Saved on this device';
   return true;
 } catch(_){
   status.textContent='Device save unavailable';
   return false;
 }
}
function errorMessage(message){
 showError(message);
 if(message)status.textContent='Please review';
}
function nameOf(id){return users.find(person=>person.id===id)?.displayName||'Fictional member';}
function initials(id){return nameOf(id).split(' ').map(w=>w[0]).join('').slice(0,2);}
function isoTime(iso){return new Date(iso).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
function isoDay(iso){return new Date(iso).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});}
function dayKey(iso){return new Date(iso).toDateString();}
function scrollToLatest(){scroll.scrollTop=scroll.scrollHeight;}
function updateCompose(){
 const ready=input.value.trim().length>0 && !storageLocked;
 send.disabled=!ready;
 input.style.height='auto';
 input.style.height=Math.min(115,Math.max(44,input.scrollHeight))+'px';
 const parent=replyTo===null?null:messagesById.get(replyTo);
 $('reply-preview').hidden=!parent;
 if(parent){
   $('reply-name').textContent=nameOf(parent.authorId);
   $('reply-snippet').textContent=parent.body.slice(0,110);
 }
}
function render({bottom=false}={}){
 const nearBottom=(scroll.scrollHeight-scroll.scrollTop-scroll.clientHeight)<130;
 const before=scroll.scrollTop;
 const all=repository.listMessages({conversationId:CONVERSATION,userId:SELF});
 const reactions=repository.getSnapshot().reactions;
 messagesById.clear();
 all.forEach(message=>messagesById.set(message.id,message));
 let lastDay='';
 const markup=[];
 for(const m of all){
   const group=dayKey(m.createdAt),own=m.authorId===SELF;
   if(group!==lastDay){
     markup.push('<div class="day-divider" role="separator">'+esc(isoDay(m.createdAt).toUpperCase())+'</div>');
     lastDay=group;
   }
   const parent=m.replyToMessageId===null?null:messagesById.get(m.replyToMessageId);
   const selected=reactions.filter(r=>r.messageId===m.id);
   const tally=selected.reduce((a,r)=>(a[r.emoji]=(a[r.emoji]||0)+1,a),{});
   const ownReact=emoji=>selected.some(r=>r.userId===SELF&&r.emoji===emoji);
   const controls=m.deliveryStatus==='sent'?
     '<div class="message-actions" role="group" aria-label="Message actions">'+
     ['❤️','🙏','🙌'].map(emoji=>'<button class="reaction-btn" data-action="react" data-id="'+esc(m.id)+'" data-emoji="'+emoji+'" aria-pressed="'+ownReact(emoji)+'" aria-label="React with '+emoji+' to '+esc(nameOf(m.authorId))+' message">'+emoji+'</button>').join('')+
     '<button class="reply-btn" data-action="reply" data-id="'+esc(m.id)+'" aria-label="Reply to '+esc(nameOf(m.authorId))+' message">↩ Reply</button></div>':
     own?'<div class="message-actions"><button class="retry-btn" data-action="retry" data-id="'+esc(m.id)+'">'+(m.deliveryStatus==='failed'?'Retry send':'Retry pending')+'</button></div>':'';
   const delivery=own?'<div class="delivery'+(m.deliveryStatus==='failed'?' failed':'')+'">'+
     (m.deliveryStatus==='sent'?'Sent · local demo':m.deliveryStatus==='pending'?'Sending · local demo':'Failed · tap Retry')+'</div>':'';
   markup.push('<article class="message-row'+(own?' own':'')+'" data-message-id="'+esc(m.id)+'">'+
     (own?'':'<div class="message-face" aria-hidden="true">'+esc(initials(m.authorId))+'</div>')+
     '<div class="message-body"><div class="message-meta"><strong>'+esc(own?'You':nameOf(m.authorId))+'</strong><time datetime="'+esc(m.createdAt)+'">'+esc(isoTime(m.createdAt))+'</time></div>'+
     '<div class="bubble">'+(parent?'<div class="bubble-quote"><strong>'+esc(nameOf(parent.authorId))+'</strong>'+esc(parent.body.slice(0,100))+'</div>':'')+esc(m.body)+'</div>'+
     Object.entries(tally).map(([emoji,count])=>'<span class="reaction-tally" aria-label="'+count+' '+emoji+' reactions">'+emoji+' '+count+'</span>').join('')+
     controls+delivery+'</div></article>');
 }
 view.innerHTML=markup.join('');
 $('message-count').textContent=all.length+' MESSAGES';
 updateCompose();
 if(bottom||nearBottom)scrollToLatest();
 else scroll.scrollTop=before;
}
function deliver(id,fail){
 window.setTimeout(()=>{
   try{
     const record=repository.getSnapshot().messages.find(m=>m.id===id);
     if(!record||record.deliveryStatus!=='pending')return;
     repository.setDeliveryStatus({messageId:id,userId:SELF,status:fail?'failed':'sent'});
     saveLab();render({bottom:true});
   }catch(ex){errorMessage('Could not finish the fictional send: '+ex.message);}
 },500);
}
function sendMessage(){
 const body=input.value.trim();
 if(!body||storageLocked)return;
 try {
   const message=repository.sendMessage({conversationId:CONVERSATION,userId:SELF,body,replyToMessageId:replyTo});
   draft='';replyTo=null;input.value='';
   const shouldFail=failControl.checked;
   failControl.checked=false;
   saveLab();render({bottom:true});
   input.focus({preventScroll:true});
   deliver(message.id,shouldFail);
 }catch(ex){errorMessage(ex.message);}
}
function react(id,emoji){
 try{repository.toggleReaction({messageId:id,userId:SELF,emoji});saveLab();render();}
 catch(ex){errorMessage(ex.message);}
}
function reply(id){
 const target=messagesById.get(id);
 if(!target||target.deliveryStatus!=='sent')return;
 replyTo=id;saveLab();updateCompose();
 input.focus({preventScroll:true});
}
function retry(id){
 const target=messagesById.get(id);
 if(!target||target.authorId!==SELF||target.deliveryStatus==='sent')return;
 try{
   repository.setDeliveryStatus({messageId:id,userId:SELF,status:'pending'});
   const shouldFail=failControl.checked;
   failControl.checked=false;saveLab();render({bottom:true});
   deliver(id,shouldFail);
 }catch(ex){errorMessage(ex.message);}
}
if(!DOMAIN){
 errorMessage('Could not load the conversation domain. Refresh this demo.');
 return;
}
const saved=readLab();
try{repository=DOMAIN.createMockConversationRepository({seed:saved?.snapshot||fixture()});}
catch(_){
 storageLocked=true;
 repository=DOMAIN.createMockConversationRepository({seed:fixture()});
 errorMessage('Stored sample cannot be opened safely. Your original storage was not changed. Reset this lab to continue.');
}
draft=saved?.draft||'';
replyTo=saved?.replyTo||null;
input.value=draft;
const lastSent=repository.listMessages({conversationId:CONVERSATION,userId:SELF})
 .filter(m=>m.deliveryStatus==='sent').at(-1);
if(lastSent){
 try{repository.markRead({conversationId:CONVERSATION,userId:SELF,messageId:lastSent.id});}catch(_){}
}
render({bottom:true});saveLab();
input.addEventListener('input',()=>{
 draft=input.value;saveLab();updateCompose();
});
send.addEventListener('click',sendMessage);
input.addEventListener('keydown',event=>{
 if(event.key==='Enter'&&(event.metaKey||event.ctrlKey)){
   event.preventDefault();sendMessage();
 }
});
$('cancel-reply').addEventListener('click',()=>{
 replyTo=null;saveLab();updateCompose();input.focus({preventScroll:true});
});
view.addEventListener('click',event=>{
 const control=event.target.closest('button[data-action]');
 if(!control)return;
 const {action,id,emoji}=control.dataset;
 if(action==='react')react(id,emoji);
 if(action==='reply')reply(id);
 if(action==='retry')retry(id);
});
$('reset-lab').addEventListener('click',()=>{
 if(!window.confirm('Reset this fictional conversation lab? This affects only the lab’s saved messages and drafts, never the main Rally Point app.'))return;
 try{localStorage.removeItem(STORAGE_KEY);window.location.reload();}
 catch(_){errorMessage('This browser prevented resetting the lab storage.');}
});
})();
