/* Foundation 2: direct Today renderer. One markup owner, no legacy DOM rewriting.
 * All display text is derived from the read-only presentation model.
 */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationView=api;
})(globalThis,function(){
'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const chat='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-5 3v-3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><circle cx="8.5" cy="11" r=".85" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r=".85" fill="currentColor" stroke="none"/><circle cx="15.5" cy="11" r=".85" fill="currentColor" stroke="none"/></svg>';
const book='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/></svg>';
const image='<img src="../assets/rally-one/community.webp" alt="" width="440" height="130" decoding="async">';
const welcomeImage='<img src="../assets/rally-one/title-card.jpg" alt="" width="440" height="260" decoding="async">';
const faces='<div class="faces" aria-hidden="true"><img src="../assets/rally-one/anna.webp" alt="" width="30" height="30" loading="lazy"><img src="../assets/rally-one/jess.webp" alt="" width="30" height="30" loading="lazy"><img src="../assets/rally-one/marcus.webp" alt="" width="30" height="30" loading="lazy"></div>';
const dateLabel=d=>d instanceof Date&&Number.isFinite(d.valueOf())?
 d.toLocaleDateString('en-US',{weekday:'short'})+' · '+d.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'';
function action(item,vm,compact=false){
 if(item.command==='leader'){
  return '<details class="leader-actions"><summary>Review sample check-ins <span aria-hidden="true">›</span></summary><div class="leader-people">'+
   vm.leaderIds.map(id=>'<button type="button" data-command="leader" data-person="'+esc(id)+'">Mark '+esc(id)+' reviewed</button>').join('')+'</div></details>';
 }
 const label=compact&&item.command==='serve'?'Confirm':compact&&item.command==='rsvp'?'RSVP':item.label;
 return '<button type="button" class="action'+(compact?' action-compact':'')+'" data-command="'+esc(item.command)+'" aria-label="'+esc(item.label)+'">'+esc(label)+arrow+'</button>';
}
function render(v,receipt=''){
 const p=v.primary;
 const meta=p?'<div class="priority-meta"><span class="kicker">UP NEXT</span><span>'+esc(dateLabel(p.date))+'</span></div>':'';
 const main=p?'<article class="priority" aria-label="Next responsibility">'+meta+
  '<div class="priority-body"><div class="priority-copy"><h2>'+esc(p.title)+'</h2><p>'+esc(p.detail)+'</p>'+
  (p.command==='rsvp'?faces:'')+'</div>'+(p.command==='rsvp'?'<div class="priority-photo">'+image+'</div>':'')+'</div>'+
  action(p,v)+'</article>':'';
 const settled=!p&&v.calm?'<article class="settled">'+(v.member?'<div class="settled-photo">'+image+'</div>':'')+
  '<div class="settled-copy"><h2>'+(v.member?'Life is better together.':'Small acts. Real impact.')+'</h2>'+
  '<p>'+(v.member?'Take a moment to connect with your people.':'Your serving community is here for you.')+'</p></div></article>':'';
 const welcome=v.guest?'<article class="settled welcome-card"><div class="welcome-photo">'+welcomeImage+'</div><div class="settled-copy"><span class="welcome-kicker">RALLY ONE · YOUR COMMUNITY</span><h2>We rally together so no one stands alone.</h2>'+
  '<p>Explore the community in the current Rally One demo. No account or private data is connected here.</p>'+
  '<a href="../index.html">Open the full demo '+arrow+'</a></div></article>':'';
 const secondary=v.secondary.length?'<section class="responsibilities" aria-label="Other responsibilities">'+
  '<div class="section-heading"><h2>Also needs a response</h2><span>'+v.secondary.length+' more</span></div>'+
  '<div class="responsibility-list">'+v.secondary.map(x=>'<article class="responsibility"><div class="responsibility-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></div>'+action(x,v,true)+'</article>').join('')+'</div></section>':'';
 const paused=v.paused.length?'<details class="deferred-panel"><summary>Saved for later <span>'+v.paused.length+'</span></summary>'+
  v.paused.map(x=>'<div class="deferred-item"><strong>'+esc(x.title)+'</strong>'+action(x,v)+'</div>').join('')+'</details>':'';
 const schedule=v.schedule.length?'<section class="coming" aria-label="Coming up"><div class="section-heading"><h2>Coming up</h2><span>Your schedule</span></div>'+
  '<div class="schedule">'+v.schedule.map(x=>'<div class="event"><div class="day" aria-hidden="true"><small>'+esc(x.date?.toLocaleDateString('en-US',{weekday:'short'})||'—')+'</small><b>'+esc(x.date?.getDate()||'—')+'</b></div>'+
  '<div class="event-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></div>'+
  '<span class="event-status '+(x.statusTone==='complete'?'complete':'')+'">'+esc(x.status)+'</span></div>').join('')+'</div></section>':'';
 let optional='';
 if(v.unavailable)optional='<aside class="utility" role="status"><span class="utility-icon">'+chat+'</span><div><strong>Conversation unavailable</strong><small>Saved messages could not be read in this preview.</small></div></aside>';
 else if(v.unknownTeam)optional='<aside class="utility" role="status"><span class="utility-icon">'+book+'</span><div><strong>Serving response unavailable</strong><small>Review the saved schedule in the full application.</small></div></aside>';
 else if(v.unread>0)optional='<aside class="utility"><span class="utility-icon">'+chat+'</span><div><strong>'+esc(v.unread)+' new group '+(v.unread===1?'message':'messages')+'</strong><small>Sample activity · conversations remain in the full app</small></div></aside>';
 else if(v.reading)optional='<aside class="utility"><span class="utility-icon">'+book+'</span><div><strong>A moment with God</strong><small>'+esc(v.passage)+' · Read is not yet migrated</small></div></aside>';
 const heading='<header class="greeting"><div class="eyebrow">'+esc(v.date)+(v.campus==='unspecified'?'':' · '+esc(v.campus)+' campus')+'</div>'+
  '<h1>'+esc(v.greeting)+'</h1><p class="summary '+(v.calm?'complete':'')+'">'+esc(v.summary)+'</p></header>';
 return heading+'<p class="receipt" role="status" aria-live="polite">'+esc(receipt)+'</p>'+
  main+settled+welcome+secondary+paused+schedule+optional;
}
return Object.freeze({render});
});