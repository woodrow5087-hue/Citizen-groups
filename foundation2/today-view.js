/* Foundation 2: direct Today renderer. One markup owner, no legacy DOM rewriting.
 * All display text is derived from the read-only presentation model.
 */
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./widgets.js'):root.FoundationWidgets);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationView=api;
})(globalThis,function(Widgets){
'use strict';
const esc=value=>String(value??'').replace(/[&<>"']/g,ch=>({
 '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const arrow=Widgets.icon('arrow'),chat=Widgets.icon('chat'),book=Widgets.icon('book');
const image='<img src="../assets/rally-one/community.webp" alt="" width="440" height="130" decoding="async">';
const welcomeImage='<img src="../assets/rally-one/community.webp" alt="" width="440" height="220" decoding="async">';
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
function render(v,receipt='',schedulePreview=''){
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
  '<p>Find a place to connect at your own pace.</p>'+
  '<a href="?screen=groups" data-route="groups" data-return-focus="today-groups">Explore groups '+arrow+'</a></div></article>':'';
 const secondary=v.secondary.length?'<section class="responsibilities" aria-label="Other responsibilities">'+
  Widgets.heading('Also needs a response',v.secondary.length+' more')+
  '<div class="responsibility-list">'+v.secondary.map(x=>'<article class="responsibility"><div class="responsibility-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></div>'+action(x,v,true)+'</article>').join('')+'</div></section>':'';
 const paused=v.paused.length?'<details class="deferred-panel"><summary>Saved for later <span>'+v.paused.length+'</span></summary>'+
  v.paused.map(x=>'<div class="deferred-item"><strong>'+esc(x.title)+'</strong>'+action(x,v)+'</div>').join('')+'</details>':'';
 const schedule=v.schedule.length?'<section class="coming" aria-label="Coming up">'+Widgets.heading('Coming up','Your schedule')+
  '<div class="schedule">'+v.schedule.map(x=>'<a class="event" href="?screen='+ (x.id==='group'?'groups':'team') +'" data-route="'+(x.id==='group'?'groups':'team')+'" data-return-focus="agenda-'+x.id+'"><div class="day" aria-hidden="true"><small>'+esc(x.date?.toLocaleDateString('en-US',{weekday:'short'})||'—')+'</small><b>'+esc(x.date?.getDate()||'—')+'</b></div>'+
  '<div class="event-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></div>'+
  '<span class="event-status '+(x.statusTone==='complete'?'complete':'')+'">'+esc(x.status)+'</span></a>').join('')+'</div></section>':'';
 let optional='';
 if(v.unavailable)optional='<aside class="utility" role="status"><span class="utility-icon">'+chat+'</span><div><strong>Conversation unavailable</strong><small>Your saved messages are not assumed read. <a data-route="connect" data-return-focus="today-unavailable" href="?screen=connect">Review Connect</a></small></div></aside>';
 else if(v.unknownTeam)optional='<aside class="utility" role="status"><span class="utility-icon">'+book+'</span><div><strong>Serving response unavailable</strong><small>No response inferred. <a data-route="team" data-return-focus="today-unknown-team" href="?screen=team">Review your schedule</a></small></div></aside>';
 else if(v.unread>0)optional=Widgets.utility({title:v.unread+' new group '+(v.unread===1?'message':'messages'),detail:'Optional · Open Connect',icon:'chat',href:'?screen=connect',route:'connect',focusId:'today-connect'});
 else if(v.reading)optional=Widgets.utility({title:'A moment with God',detail:v.passage+' · Optional Scripture and prayer',icon:'book',href:'?screen=read',route:'read',focusId:'today-read'});
 const heading='<header class="greeting"><div class="eyebrow">'+esc(v.date)+(v.campus==='unspecified'?'':' · '+esc(v.campus)+' campus')+'</div>'+
  '<h1>'+esc(v.greeting)+'</h1><div class="member-context"><button type="button" data-profile-entry data-return-focus="today-profile" aria-label="Edit profile for '+esc(v.name||'Friend')+'">'+esc(v.name||'Friend')+'</button><span>'+esc(v.involvement||'')+'</span></div><p class="summary '+(v.calm?'complete':'')+'">'+esc(v.summary)+'</p></header>';
 return heading+'<p class="receipt" role="status" aria-live="polite">'+esc(receipt)+'</p>'+
  main+settled+welcome+secondary+paused+schedule+schedulePreview+optional;
}
return Object.freeze({render});
});