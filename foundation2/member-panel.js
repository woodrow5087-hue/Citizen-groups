/* Existing deterministic Ask Rally presentation and explicit local profile handoff. No new state owner. */
(function(root){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function create({getSession,getUI,getStore,profileChanged,perform,navigate}){
 const dialog=document.getElementById('member-dialog');let prior={},scope=RallyPersonalCompanion.conversationScope(getSession().snapshot.model),lastQuery='',eventIds={},previewRaw=null,returnFocus=null;
 const close=()=>{dialog.close();returnFocus?.focus({preventScroll:true});};
 dialog.addEventListener('close',()=>returnFocus?.focus({preventScroll:true}));
 function scopeCheck(){const next=RallyPersonalCompanion.conversationScope(getSession().snapshot.model);if(next!==scope){scope=next;prior={};lastQuery='';dialog.close();dialog.innerHTML='';}}
 function shell(title,content){dialog.innerHTML='<button type="button" data-member-close aria-label="Close '+title+'">Close</button><h2 tabindex="-1">'+title+'</h2>'+content;if(!dialog.open)dialog.showModal();dialog.querySelector('h2').focus();}
 function profile(notice=''){
  const ui=getUI();
  shell('Your local demo profile','<p>We rally together so no one stands alone.</p><p>Personalization changes your name and campus, not permissions. Involvement and authorized roles remain controlled by the explicit demo scenario.</p>'+
   '<form id="member-profile"><label>Name<input name="name" maxlength="24" autocomplete="given-name" value="'+esc(ui.name)+'"></label><label>Campus<select name="campus">'+['north','central','maui','online'].map(c=>'<option '+(ui.campus===c?'selected ':'')+'value="'+c+'">'+c+'</option>').join('')+'</select></label><button type="submit">Save local profile</button></form>'+
   '<button type="button" data-profile-undo>Undo previous profile change</button><p><a href="../?rallyOne=1&welcome=1">Open the accepted Rally One welcome and onboarding</a></p><button type="button" data-profile-preview>Preview existing local demo profile</button><p>Handoff copies only name and campus after review. No roles, memberships, conversations or game progress are imported. Original records remain untouched.</p><p role="status">'+esc(notice)+'</p>');
 }
 function ask(query='next',notice=''){
  const session=getSession(),decision=FoundationMemberSession.decision(session,new Date());eventIds=session.events;
  const sources={model:session.snapshot.model,board:decision.board,now:new Date(),care:session.snapshot.care};
  const turn=RallyPersonalCompanion.respond(query,sources,prior);prior=turn.context;lastQuery=query;
  // Do not turn unknown/provider data into reassuring completion claims.
  const uncertain=!session.valid||(!decision.board.taskCount&&(decision.view.unavailable||decision.view.unknownTeam))||FoundationServing.isActive(document.getElementById('scenario').value)||FoundationGroupPreview.isActive(document.getElementById('scenario').value);
  const provider=FoundationServing.isActive(document.getElementById('scenario').value)||FoundationGroupPreview.isActive(document.getElementById('scenario').value);
  const response=(provider&&turn.response.intent!=='unsupported'||uncertain&&['next','focus','why'].includes(turn.response.intent))?{...turn.response,heading:'Review the current source.',intro:'Some data is unavailable or is a read-only provider sample. Completion cannot be inferred.',items:[]}:turn.response;
  const dated={...response,items:response.items.map(item=>{const key=item.action?.kind==='confirm'?(item.action.id==='serve'?'serveDate':item.action.id==='rsvp'?'groupDate':null):null;return key&&['next','focus','why'].includes(response.intent)&&sources.model[key] instanceof Date?{...item,detail:RallyToday.dateLabel(sources.model[key],sources.now)+' · '+item.detail}:item;})};
  const supported={...dated,items:dated.items.map(item=>item.action?.kind==='care-route'&&item.action.id==='care-check-in'?{...item,detail:item.detail+' Direct messaging remains in the existing full demo; nothing is sent here.',action:{kind:'go',id:'group',label:'Review group care'}}:item)};
  shell('Ask Rally', '<p>Commitments need a response. Messages, care opportunities and Scripture remain optional.</p>'+RallyPersonalCompanion.render(supported,query,notice,[],turn.suggestions));
 }
 document.getElementById('ask-rally').addEventListener('click',()=>{returnFocus=document.getElementById('ask-rally');ask();});
 document.getElementById('member-profile-open').addEventListener('click',()=>{returnFocus=document.querySelector('#preview-tools>summary');document.getElementById('preview-tools').removeAttribute('open');profile();});
 dialog.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.hasAttribute('data-member-close')){close();return;}
  if(b.hasAttribute('data-profile-undo')){const r=getStore()?.updateProfile(null,{undo:true});if(r?.ok){profileChanged();close();}else profile(r?.reason||'No saved profile can be restored.');return;}
  if(b.hasAttribute('data-profile-preview')){
   try{previewRaw=localStorage.getItem(RallyStorageGuard.TODAY_KEY);const p=FoundationMemberSession.previewProfile(previewRaw);profile(p.status==='ready'?'Preview: '+p.name+' · '+p.campus+'. Original data will remain unchanged.':'Source profile is '+p.status+'. Nothing copied.');if(p.status==='ready')dialog.insertAdjacentHTML('beforeend','<button type="button" data-profile-apply>Use this name and campus</button>');}catch{profile('Source storage unavailable. Nothing copied.');}return;
  }
  if(b.hasAttribute('data-profile-apply')){
   try{if(localStorage.getItem(RallyStorageGuard.TODAY_KEY)!==previewRaw){profile('Source changed. Preview again.');return;}const p=FoundationMemberSession.previewProfile(previewRaw);const r=getStore()?.updateProfile(p);if(r?.ok){profileChanged();close();}else profile(r?.reason||'Profile was not copied.');}catch{profile('Storage unavailable. Nothing copied.');}return;
  }
  if(b.dataset.action==='f10-ask'||b.dataset.action==='f10-followup'){ask(b.dataset.value);return;}
  if(b.dataset.action==='f10-confirm'){
   const kind=b.dataset.value==='rsvp'?'group':b.dataset.value==='serve'?'team':null;
   if(!kind)return;const result=perform({type:kind==='group'?'group-rsvp':'serving-response',value:kind==='group'?'going':'confirmed',eventId:eventIds[kind]});
   ask(lastQuery,result.ok?'Response saved only on this device. No messages or notifications sent.':'No change: '+result.reason);return;
  }
  const destination=b.dataset.go||((b.dataset.action==='f10-care-route')?'group':null);
  const route={group:'groups',team:'team',read:'read',today:'today',connect:'connect'}[destination];
  if(route){returnFocus=null;close();navigate(route,b.dataset.pane||'');}
 });
 dialog.addEventListener('submit',e=>{
  e.preventDefault();if(e.target.id==='member-profile'){const form=e.target;const r=getStore()?.updateProfile({name:form.elements.name.value,campus:form.elements.campus.value});if(r?.ok){profileChanged();close();}else profile(r?.reason||'Storage unavailable. Nothing saved.');}
  else if(e.target.dataset.form==='f10-query')ask(e.target.elements.question.value);
 });
 return Object.freeze({scopeCheck});
}
root.FoundationMemberPanel=Object.freeze({create});
})(globalThis);
