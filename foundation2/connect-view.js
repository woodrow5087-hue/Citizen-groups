/* Foundation 2 Connect UI — escaped direct rendering over the existing domain.
 * No synthetic sends outside browser-local storage, no duplicate chat engine.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationConnectView=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const body=(tag,text)=>'<'+tag+'>'+esc(text)+'</'+tag+'>';
function render(chat,{thread=false,member=false,feedback='',returnToGroups=false}={}){
 const head='<section class="connect-page" aria-labelledby="route-title"><span class="eyebrow">CONNECT · FICTIONAL LOCAL MESSAGING</span>'+
  '<h1 id="route-title" tabindex="-1">'+(thread?'Wednesday Group':'Stay connected.')+'</h1>';
 const notice='<p class="connect-disclaimer">Synthetic conversation stored only in this preview. No messages are delivered to real people.</p>';
 if(!member||chat.status==='no-access'){
  return head+'<p class="route-lead">Join a group to access group conversations.</p>'+
   '<div class="route-preview-card"><p>Group messaging is unavailable for this demo scenario.</p>'+
   '<p>Direct messaging and serving-team conversations have not yet been migrated. No member data is accessible.</p></div>'+notice+'</section>';
 }
 if(chat.status!=='ok'){
  return head+'<p class="connect-alert" role="alert">Saved conversation unavailable. Existing data has been preserved; messaging is disabled until the source is recovered.</p>'+
   notice+'</section>';
 }
 const status=feedback?'<p class="chat-feedback" role="status">'+esc(feedback)+'</p>':'';
 if(!thread){
  const last=chat.lastMessage,preview=last?last.author+': '+last.body:'Start a conversation';
  const unread=chat.unreadCount>0?'<span class="chat-unread" aria-label="'+chat.unreadCount+' unread messages">'+chat.unreadCount+' new</span>':'';
  return head+'<p class="route-lead">Your conversations</p>'+status+
   '<button type="button" class="connect-thread-entry" data-chat-open="group" data-return-focus="connect-thread">'+
   '<span class="connect-thread-avatar" aria-hidden="true">W</span>'+
   '<span class="connect-thread-copy"><strong>Wednesday Group</strong><small>'+esc(preview)+'</small></span>'+unread+
   '<span aria-hidden="true">›</span></button>'+
   '<p class="connect-secondary-note">Only the authorized Wednesday Group thread is available in this experiment. Other messaging destinations will be migrated separately.</p>'+
   notice+'</section>';
 }
 const messages=chat.messages.map(item=>{
  const reply=item.replyTo?chat.messages.find(m=>m.id===item.replyTo):null;
  return '<li class="chat-message'+(item.mine?' is-mine':'')+'" data-message-id="'+esc(item.id)+'">'+
   '<div class="chat-message-meta">'+body('strong',item.mine?'You':item.author)+
   '<time datetime="'+esc(item.createdAt)+'">'+esc(new Date(item.createdAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}))+'</time></div>'+
   (reply?'<p class="chat-quote">'+esc(reply.author+': '+reply.body.slice(0,100))+'</p>':'')+
   '<p class="chat-bubble">'+esc(item.body)+'</p>'+
   '<span class="chat-message-status">'+esc(item.status==='sent'?'Saved · sample':item.status)+'</span>'+
   (item.status==='sent'?'<button type="button" class="chat-reply" data-chat-reply="'+esc(item.id)+'" aria-label="Reply to '+esc(item.mine?'your message':item.author+' message')+'">Reply</button>':'')+
   '</li>';
 }).join('');
 const reply=chat.replyTo?chat.messages.find(m=>m.id===chat.replyTo):null;
 const context=reply?'<div class="chat-reply-context"><span>Replying to '+esc(reply.author)+': '+esc(reply.body.slice(0,90))+'</span>'+
  '<button type="button" data-chat-reply-cancel aria-label="Cancel reply">×</button></div>':'';
 const back=returnToGroups?
  '<a class="chat-inbox-back" href="?screen=groups" data-thread="inbox">‹ Back to Groups</a>':
  '<a class="chat-inbox-back" href="?screen=connect" data-thread="inbox">‹ Back to inbox</a>';
 return head+back+
  '<p class="route-lead">Wednesday Group · Fictional local conversation</p>'+status+
  '<ol class="chat-messages" aria-label="Wednesday Group messages">'+messages+'</ol>'+
  '<form id="chat-compose" class="chat-compose" aria-label="Write a sample group message">'+context+
  '<label for="chat-draft">Message</label>'+
  '<textarea id="chat-draft" maxlength="700" rows="2" placeholder="Write a sample message…">'+esc(chat.draft)+'</textarea>'+
  '<button type="submit" class="chat-send"'+(!chat.draft.trim()?' disabled':'')+'>Save sample message</button>'+
  '</form>'+notice+'</section>';
}
return Object.freeze({render});
});