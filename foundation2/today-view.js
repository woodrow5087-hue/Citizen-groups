/* Foundation 2: direct Today renderer. One markup owner, no legacy DOM rewriting.
 * All display text is derived from the read-only presentation model.
 */
(function(root,factory){
 const api=factory(typeof module==='object'&&module.exports?require('./widgets.js'):root.FoundationWidgets, typeof module==='object'&&module.exports?require('./signature-components.js'):root.FoundationSignature);
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationView=api;
})(globalThis,function(Widgets,Signature){
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
 return Signature.action({label,icon:compact?null:'arrow',tone:compact?'paper':'red',split:!compact,className:'action'+(compact?' action-compact':''),attrs:{'data-command':item.command,'aria-label':item.label}});

}
function render(v,receipt='',schedulePreview=''){
 const p=v.primary,remaining=(p?1:0)+v.secondary.length;
 const campusPhoto=['north','central','maui','online'].includes(v.campus)?v.campus:'central';
 const dated=p&&p.date instanceof Date&&Number.isFinite(p.date.valueOf());
 const main=p?'<article class="priority'+(dated?' has-date':'')+'" aria-label="Next responsibility" data-motion-task="'+esc(p.id)+'">'+
  (p.command==='rsvp'?'<div class="priority-photo">'+image+'</div>':'')+
  (dated?'<div class="priority-date">'+Signature.dateBadge(p.date)+'</div>':'')+
  '<div class="priority-body"><div class="priority-meta"><span class="kicker">UP NEXT</span><span>'+esc(dateLabel(p.date))+'</span></div><div class="priority-copy"><h2>'+esc(p.title)+'</h2><p>'+esc(p.detail)+'</p></div></div>'+action(p,v)+'</article>':'';
 const secondary=v.secondary.length?'<section class="responsibilities" aria-label="Other responsibilities"><div class="responsibility-list">'+v.secondary.map(x=>'<article class="responsibility" data-motion-task="'+esc(x.id)+'"><div class="responsibility-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></div>'+action(x,v,true)+'</article>').join('')+'</div></section>':'';
 const priorities=p?'<div class="sig-plan-heading">'+Signature.heading('Your next step')+'<p class="summary">'+esc(v.summary)+'</p></div>'+Signature.stack(main+secondary,{className:'sig-priority-stack',tone:'paper'}):'';
 const settled=!p&&v.calm?'<article class="settled">'+(v.member?'<div class="settled-photo">'+image+'</div>':'')+
  Signature.completion({complete:true,title:'All Set.',detail:'Your required responses are saved. Optional moments stay optional.',remaining:0})+'<div class="settled-copy"><h2>'+(v.member?'Life is better together.':'Small acts. Real impact.')+'</h2><p>'+(v.member?'Take a moment to connect with your people.':'Your serving community is here for you.')+'</p></div></article>':'';
 const welcome=v.guest?'<article class="settled welcome-card"><div class="welcome-photo">'+welcomeImage+'</div><div class="settled-copy"><span class="welcome-kicker">RALLY ONE · YOUR COMMUNITY</span><h2>We rally together so no one stands alone.</h2><p>Find a place to connect at your own pace.</p><a href="?screen=groups" data-route="groups" data-return-focus="today-groups">Explore groups '+arrow+'</a></div></article>':'';
 const paused=v.paused.length?'<details class="deferred-panel"><summary>Saved for later <span>'+v.paused.length+'</span></summary>'+v.paused.map(x=>'<div class="deferred-item"><strong>'+esc(x.title)+'</strong>'+action(x,v)+'</div>').join('')+'</details>':'';
 const schedule=v.schedule.length?'<section class="coming" aria-label="Coming up">'+Signature.heading('Coming up','Your schedule')+'<div class="schedule">'+v.schedule.map(x=>'<a class="event" href="?screen='+(x.id==='group'?'groups':'team')+'" data-route="'+(x.id==='group'?'groups':'team')+'" data-return-focus="agenda-'+x.id+'"><div class="day">'+Signature.dateBadge(x.date)+'</div><div class="event-copy"><strong>'+esc(x.title)+'</strong><small>'+esc(x.detail)+'</small></div><span class="event-status '+(x.statusTone==='complete'?'complete':'')+'">'+esc(x.status)+'</span></a>').join('')+'</div></section>':'';
 let optional='';
 if(v.unavailable)optional='<aside class="utility" role="status"><span class="utility-icon">'+chat+'</span><div><strong>Conversation unavailable</strong><small>Your saved messages are not assumed read. <a data-route="connect" data-return-focus="today-unavailable" href="?screen=connect">Review Connect</a></small></div></aside>';
 else if(v.unknownTeam)optional='<aside class="utility" role="status"><span class="utility-icon">'+book+'</span><div><strong>Serving response unavailable</strong><small>No response inferred. <a data-route="team" data-return-focus="today-unknown-team" href="?screen=team">Review your schedule</a></small></div></aside>';
 else if(v.unread>0)optional=Widgets.utility({title:v.unread+' new group '+(v.unread===1?'message':'messages'),detail:'Optional · Open Connect',icon:'chat',href:'?screen=connect',route:'connect',focusId:'today-connect'});
 else if(v.reading)optional=Widgets.utility({title:'A moment with God',detail:v.passage+' · Optional Scripture and prayer',icon:'book',href:'?screen=read',route:'read',focusId:'today-read'});
 const heading='<section class="sig-today-cover sig-comp-cover"><div><header class="greeting"><div class="eyebrow">'+esc(v.date)+(v.campus==='unspecified'?'':' · '+esc(v.campus)+' campus')+'</div><p class="sig-serif sig-today-title">Today<span>.</span></p><div class="sig-greeting-line member-context"><h1>'+esc(v.greeting)+'</h1><button type="button" data-profile-entry data-return-focus="today-profile" aria-label="Edit profile for '+esc(v.name||'Friend')+'">'+esc(v.name||'Friend')+'</button></div><div class="sig-member-involvement"><span>'+esc(v.involvement||'')+'</span></div></header></div><img src="../assets/campuses/'+campusPhoto+'.jpg" alt="" width="220" height="120"></section>';
 const hasCommunity=v.member&&!schedulePreview&&!v.unavailable,communityOptional=hasCommunity&&v.unread>0;
 const community=hasCommunity?'<section class="sig-community-rail sig-comp-people" aria-label="Your fictional group contacts"><h2 class="sig-a11y-only">Your people</h2><div class="sig-community-people-line">'+faces+'<div class="sig-community-copy"><strong>Wednesday Group</strong>'+(communityOptional?optional:'<small>Fictional contacts</small>')+'</div><button type="button" class="sig-utility sig-community-people" data-rel-entry="people" data-return-focus="signature-people" aria-label="People" title="People and community">'+Signature.icon('plus')+'</button></div></section>':'';
 const ask=Signature.action({label:'Ask Rally',tone:'ink',split:true,icon:'arrow',className:'sig-today-ask',attrs:{'data-ask-entry':'','data-return-focus':'today-ask','aria-label':'Ask Rally about your next step'}});
 return '<div class="signature-surface signature-today sig-composition sig-composition--connected" data-composition="connected-day">'+heading+community+'<p class="receipt" role="status" aria-live="polite">'+esc(receipt)+'</p><div class="sig-comp-day-sheet">'+(p?'':'<p class="summary '+(v.calm?'complete':'')+'">'+esc(v.summary)+'</p>')+'<section class="sig-priority-domain" data-stack-size="'+remaining+'" aria-label="Your response plan">'+priorities+settled+welcome+'</section>'+paused+schedule+schedulePreview+'</div><div class="sig-context-dock">'+(communityOptional?'':optional)+ask+'</div></div>';
}
return Object.freeze({render});
});