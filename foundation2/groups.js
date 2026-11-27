/* Foundation 2 Gate 5 — Groups.
 * Read-only projection and escaped direct rendering. The existing
 * RallyMemberContext transition and FoundationStateStore own all writes.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationGroups=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const allowed=new Set(['going','maybe','clear']);
function project(snapshot,chat){
 const ctx=snapshot.context,model=snapshot.model;
 const member=ctx.permissions.group,leader=ctx.permissions.groupLeader;
 const date=model.groupDate instanceof Date&&Number.isFinite(model.groupDate.getTime())?model.groupDate:null;
 const care=snapshot.care&&member?snapshot.care:null;
 const unread=ctx.group.status==='ok'&&Number.isInteger(ctx.group.unreadCount)?ctx.group.unreadCount:null;
 return Object.freeze({
  member,leader,groupName:'Wednesday Group',date,location:model.groupLocation||'North Commons',
  rsvp:member?ctx.group.rsvp:'',unread,conversationStatus:ctx.group.status,
  lastMessage:ctx.group.status==='ok'&&chat?.status==='ok'?chat.lastMessage:null,
  care,leaderIds:leader?Object.freeze([...ctx.leader.pendingIds]):Object.freeze([]),
  campus:ctx.identity.campus
 });
}
function commandFor(kind,value){
 if(kind==='group-rsvp'&&allowed.has(value))return {type:'group-rsvp',value};
 if(kind==='group-leader'&&['marcus','taylor'].includes(value))return {type:'leader-review',person:value};
 if(kind==='group-care-prayed')return {type:'care-mark-prayed'};
 if(kind==='group-care-resume')return {type:'care-resume'};
 return null;
}
function response(vm){
 const status=vm.rsvp==='going'?'Going':vm.rsvp==='maybe'?'Maybe':'RSVP open';
 return '<div class="group-response" aria-label="Gathering response"><span class="group-response-status">Saved response: <strong>'+status+'</strong></span>'+
  '<div class="group-response-actions">'+
  '<button type="button" class="'+(vm.rsvp==='going'?'is-selected':'')+'" data-group-action="group-rsvp" data-value="going"'+(vm.rsvp==='going'?' aria-pressed="true"':' aria-pressed="false"')+'>I’m going</button>'+
  '<button type="button" class="'+(vm.rsvp==='maybe'?'is-selected':'')+'" data-group-action="group-rsvp" data-value="maybe"'+(vm.rsvp==='maybe'?' aria-pressed="true"':' aria-pressed="false"')+'>Maybe</button>'+
  (vm.rsvp?'<button type="button" data-group-action="group-rsvp" data-value="clear">Clear response</button>':'')+'</div></div>';
}
function render(vm,{feedback='',blocked=false,groupPreview=''}={}){
 const heading='<section class="group-page" aria-labelledby="route-title">'+
  '<span class="eyebrow">GROUPS · YOUR COMMUNITY</span><h1 id="route-title" tabindex="-1">'+(vm.member?'Your people.':'Find your people.')+'</h1>';
 if(groupPreview)return heading+groupPreview+'</section>';
 if(!vm.member)return heading+'<p class="route-lead">You are not part of a fictional small group in this scenario.</p>'+
  '<div class="route-preview-card"><span class="route-stage-label">NO GROUP MEMBERSHIP</span>'+
  '<p>Find a place to connect at your own pace. Explore fictional groups here; browsing and interest never create membership or contact anyone.</p><button type="button" class="experience-discover" data-rel-entry="discovery" data-return-focus="visitor-discovery">Explore sample groups</button>'+
  '<a class="route-full-app" href="../index.html">Explore the existing demo <span aria-hidden="true">↗</span></a></div></section>';
 const calendar=vm.date?vm.date.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})+' · '+vm.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'Next gathering date unavailable';
 const state=feedback?'<p class="group-feedback" role="status">'+esc(feedback)+'</p>':'';
 const top='<article class="group-feature"><img src="../assets/rally-one/community.webp" alt="" width="440" height="180" decoding="async">'+
  '<div class="group-feature-copy"><strong>'+esc(vm.groupName)+'</strong><small>Fictional Wednesday Group · '+esc(vm.campus)+' campus</small></div></article>';
 const gather='<section class="group-gathering" aria-labelledby="group-gathering-title">'+
  '<div class="group-overline">NEXT GATHERING</div><h2 id="group-gathering-title">Life together.</h2>'+
  '<p>'+esc(calendar)+' · '+esc(vm.location)+'</p>'+
  (blocked?'<p class="group-blocked">Your saved data needs attention. Responses are disabled.</p>':response(vm))+'</section>';
 const msgStatus=vm.conversationStatus==='unavailable'?'Conversation source unavailable; messages cannot be assumed read.':
  vm.unread===null?'Conversation state is unknown.':
  vm.unread>0?vm.unread+' new group '+(vm.unread===1?'message':'messages'):
  'You are up to date in the fictional group conversation.';
 const conversation='<section class="group-conversation" aria-label="Group conversation"><div>'+
  '<strong>Stay connected</strong><p>'+esc(msgStatus)+'</p>'+
  (vm.lastMessage?'<small>'+esc(vm.lastMessage.author+': '+vm.lastMessage.body.slice(0,110))+'</small>':'')+
  '</div><button type="button" data-chat-open="group" data-return-focus="groups-conversation"'+(vm.conversationStatus!=='ok'?' disabled':'')+'>Open conversation <span aria-hidden="true">›</span></button></section>';
 let care='';
 if(vm.care){
  const m=vm.care;
  const done=m.stage==='followed-up';
  care='<section class="group-care" aria-label="Optional group care"><div class="group-care-heading"><span class="group-overline">PRAY FOR ONE ANOTHER</span>'+
   '<h2>A small moment of care.</h2></div>'+
   '<blockquote><strong>'+esc(m.person)+'</strong><p>'+esc(m.request)+'</p></blockquote>'+
   '<p class="group-care-note">'+esc(m.guidance)+'</p>'+
   '<div class="group-care-actions">'+(m.stage==='ready'?'<button type="button" data-group-action="group-care-prayed">I prayed</button>':
   m.stage==='paused'?'<button type="button" data-group-action="group-care-resume">Revisit this request</button>':
   '<span class="group-care-status">'+(done?'Follow-up recorded in the existing fixture':'Prayer marked on this device')+'</span>')+
   '<button type="button" data-chat-open="group" data-return-focus="groups-care-conversation"'+(vm.conversationStatus!=='ok'?' disabled':'')+'>Open group conversation</button></div>'+
   '<small>Fictional care · no automated outreach</small></section>';
 }
 const leaders=vm.leader&&vm.leaderIds.length?'<section class="group-leader" aria-labelledby="leader-title">'+
  '<h2 id="leader-title">Leader follow-ups</h2><p>Only available in the explicitly authorized leader scenario.</p>'+
  vm.leaderIds.map(id=>'<button type="button" data-group-action="group-leader" data-value="'+esc(id)+'">Mark '+esc(id)+' reviewed</button>').join('')+'</section>':'';
 return heading+state+top+gather+conversation+care+leaders+'</section>';
}
return Object.freeze({project,commandFor,render});
});