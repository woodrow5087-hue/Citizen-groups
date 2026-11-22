/* F-09 Priority Board — the approved visible-action alternative to Smart Stack.
 * No additional records or storage. Uses the same F-09/F-08 projection.
 * Preview only: ?f09=board. Classic ?f09=1 remains available.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RallyPriorityBoard=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;','\'':'&#39;'}[c]));
const call=(kind,id,pane='')=>Object.freeze({kind,id,pane});
const go=(id,pane='')=>call('go',id,pane);
const act=id=>call('action',id);
const face=(id,name,src)=>{
 const safe=String(src||'');
 return safe&&(/^(?:assets\/|https:\/\/images\.unsplash\.com\/photo-[A-Za-z0-9-]+\?|data:image\/(?:png|jpeg|webp);base64,)/).test(safe)?
  '<img src="'+esc(safe)+'" alt="'+esc(name)+'" loading="lazy" decoding="async">':
  '<span aria-label="'+esc(name)+'">'+esc(String(name||'').split(/\s+/).map(s=>s[0]).join('').slice(0,2).toUpperCase())+'</span>';
};
const attr=a=>a?
  (a.kind==='action'?'data-action="':'data-go="')+esc(a.id)+'"'+
  (a.pane?' data-pane="'+esc(a.pane)+'"':''):'';
const svg=type=>{
 const paths={
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 10h18"/>',
  message:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-7A8 8 0 1 1 21 11Z"/>',
  team:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-2a7 7 0 0 1 14 0v2m2-13a3 3 0 0 1 0 6m-1 5c3 0 5 2 5 5"/>',
  read:'<path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/>',
  people:'<circle cx="12" cy="7" r="3"/><path d="M6 21v-3a6 6 0 0 1 12 0v3M4 6a3 3 0 0 0 0 6m16-6a3 3 0 0 1 0 6"/>'
 };
 return '<svg class="f09b-icon" viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+(paths[type]||paths.people)+'</svg>';
};
const millis=d=>d instanceof Date&&!Number.isNaN(d.valueOf())?d.valueOf():Infinity;
const asCount=n=>Number.isSafeInteger(n)&&n>0?Math.min(n,99):0;
function derive(d,now=new Date()){
 // Read-only adaptive ranking: explicit fixture responsibilities have priority;
 // Scripture and relationship invitations never masquerade as deadlines.
 // Do not alter the F-08 companion's own recommendation or snooze behavior.
 const features=Array.isArray(d?.allPriorities)?d.allPriorities:Array.isArray(d?.stack)?d.stack:[];
 const find=id=>features.find(f=>f.id===id);
 const upcoming=(date,hours)=>{
   const remaining=millis(date)-now.getTime();
   return remaining>=0&&remaining<=hours*3600000;
 };
 const pendingGroup=!!d?.member&&!d.rsvp;
 const groupSoon=pendingGroup&&upcoming(d.groupDate,24);
 const groupTonight=groupSoon&&d.groupDate.toDateString()===now.toDateString();
 const pendingServe=!!d?.team&&d.serveStatus==='pending';
 const hasUnread=!!d?.member&&asCount(d?.unread)>0;
 const isUnavailable=!!d?.member&&d.conversationStatus==='unavailable';
 const leaderCount=d?.member&&d?.audience==='leader'?asCount(d?.leaderRemaining):0;
 const rhythmDue=!!d?.rhythmDue;
 const words=n=>n===1?'1 new message':n+' new messages';
 const deferred=new Set(Array.isArray(d?.deferredIds)?d.deferredIds:[]);
 const task=(id,score,tone,icon,title,detail,action,label,why,family=id)=>{
   const isDeferred=deferred.has(id)&&score<90;
   return Object.freeze({id,score:isDeferred?30:score,tone,icon,title,detail,
     action,label,why,family,deferred:isDeferred,requiresResponse:true});
 };
 const pending=[];
 if(pendingGroup)pending.push(task('group-rsvp',groupSoon?100:70,
   'rose','calendar',groupTonight?'Group tonight.':'Your Wednesday Group.',
   d?.groupDate instanceof Date?'Wednesday Group · '+d.groupDate.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):
   'Respond to the next sample gathering',act('f09-rsvp'),'RSVP · I’m in',
   'Your saved group RSVP is still open; the gathering is from the fictional schedule.','gather'));
 if(pendingServe)pending.push(task('serve-response',upcoming(d.serveDate,48)?95:65,
   'gold','team','Serve this Sunday?','Welcome Team · availability needed',
   act('f09-serve'),'Confirm','Your sample Welcome Team availability has not been saved.','serve'));
 if(isUnavailable)pending.push(task('group-unavailable',88,'rose','message',
   'Review your conversation.','The saved sample thread needs review',
   go('group','chat'),'Review conversation','The modern conversation could not be read. An unread count is not assumed.','messages'));
 else if(hasUnread)pending.push(task('group-unread',75,'rose','message',words(asCount(d.unread))+'.',
   'Wednesday Group is talking.',go('group','chat'),'View messages',
   'The local modern conversation has '+asCount(d.unread)+' unread messages. Opening the thread marks them read.','messages'));
 if(leaderCount>0)pending.push(task('leader-checkins',74,'lilac','people',
   leaderCount===1?'A check-in to review.':leaderCount+' leader check-ins.',
   'Fictional group leader follow-ups',go('group','leader'),'Review',
   'You are viewing the authorized leader fixture; these are unreviewed sample check-ins, not engagement scores.','leader'));
 if(rhythmDue)pending.push(task('scripture-step',55,'blue','read','Carry it into the week.',
   'Review your saved Scripture intention',go('read'),'Review',
   'A Scripture step you saved on this device has reached its follow-up date.','reading'));
 // Tie-break consistently; do not reorder cards based on clicks or viewing time.
 pending.sort((a,b)=>b.score-a.score||a.id.localeCompare(b.id));
 const lead=pending.find(r=>!r.deferred);
 const hasDeferredOnly=!lead&&pending.length>0;
 const hasCommunity=!!d?.member,hasTeam=!!d?.team;
 const guest=!hasCommunity&&!hasTeam;
 let hero;
 if(lead){
   const source=find(lead.id);
   hero=Object.freeze({id:lead.id,title:lead.title,subtitle:lead.detail,
     primary:lead.action,heroType:lead.icon,heroLabel:lead.label,
     eyebrow:lead.score>=90?'NEXT UP':lead.id==='leader-checkins'?'LEADER FOLLOW-UP':'YOUR NEXT ACTION',
     why:lead.why||source?.why||'Based on your saved fictional activity.',
     hasPeople:hasCommunity&&['group-rsvp','group-unread','leader-checkins'].includes(lead.id),
     calm:false});
 }else if(hasDeferredOnly){
   hero=Object.freeze({id:'paused',title:'Nothing pressing right now.',
     subtitle:'You chose to revisit a sample action later. It remains available below.',
     primary:go('read'),heroType:'read',heroLabel:'Explore Scripture',
     eyebrow:'AT YOUR OWN PACE',
     why:'The only outstanding sample items have been deferred in the existing companion preference.',
     hasPeople:false,calm:true});
 }else if(guest){
   hero=Object.freeze({id:'welcome-community',title:'There’s room for you.',
     subtitle:'Explore the sample church community at your own pace.',
     primary:go('group'),heroType:'people',heroLabel:'Find your people',
     eyebrow:'WELCOME TO RALLY POINT',why:'No group or team is selected in your local demo.',
     hasPeople:false,calm:false});
 }else{
   hero=Object.freeze({id:'caught-up',title:'You’re all caught up.',
     subtitle:'Nothing in your sample commitments needs a response right now.',
     primary:go('read'),heroType:'read',heroLabel:'Explore Scripture',
     eyebrow:'A MOMENT TO BREATHE',
     why:'No unanswered sample RSVP, team confirmation, unread group message, leader follow-up, or due saved Scripture step remains.',
     hasPeople:false,calm:true});
 }
 const rows=[];
 const usedFamilies=new Set(lead?[lead.family]:[]);
 function add(r){
   if(rows.length>=3||!r||r.id===hero.id||usedFamilies.has(r.family))return;
   usedFamilies.add(r.family);rows.push(Object.freeze({...r}));
 }
 // Show the actual next commitments, not three duplicated versions of the hero.
 for(const r of pending.filter(item=>item.id!==hero.id))add(r);
 const optional=(id,family,tone,icon,title,detail,action,label)=>{
   add(Object.freeze({id,family,tone,icon,title,detail,action,label,requiresResponse:false}));
 };
 // Optional paths are clearly labeled, not counted as "to do".
 if(hasCommunity&&!hasUnread&&!isUnavailable)optional('community','messages','rose','message',
   'Your people','Your sample group is here when you need them',go('group','chat'),'Open');
 if(hasTeam&&!pendingServe)optional('serving-overview','serve','gold','team',
   'Your team','Review the Welcome Team schedule',go('team','schedule'),'See team');
 if(!d?.readToday&&!rhythmDue)optional('scripture-read','reading','blue','read',
   'Today’s Scripture',d?.passage||'Your local reading',go('read'),'Read');
 if(hasCommunity&&find('care-marcus'))optional('care-marcus','care','rose','people',
   'Someone to encourage','A fictional group prayer note',act('companion-encourage'),'Reach out');
 if(!hasCommunity)optional('find-people','community','rose','people',
   'Find your people','Explore fictional community groups',go('group'),'Explore');
 if(!hasTeam)optional('find-team','serve','gold','team',
   'Find a place to serve','Explore serving in the sample app',go('team'),'Explore');
 if(rows.length<3)optional('scripture-overview','reading','blue','read',
   'Carry it into the week',d?.passage||'Explore a Scripture reading',go('read'),'Review');
 if(rows.length<3&&hasCommunity)optional('this-week','week','lilac','calendar',
   'This week','See the sample group gathering',go('group','gather'),'Details');
 if(rows.length<3&&!hasCommunity)optional('explore-groups','week','lilac','calendar',
   'Community life','See what sample groups are like',go('group'),'Explore');
 // Existing schedule/status digest deliberately never duplicates a button.
 const agenda=[];
 const schedule=(date,fallback)=>{
   if(!(date instanceof Date)||!Number.isFinite(date.valueOf()))return fallback;
   return date.toLocaleDateString('en-US',{weekday:'short'})+' · '+
     date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});
 };
 if(hasCommunity)agenda.push(Object.freeze({
    id:'group',icon:'calendar',tone:'rose',title:'Wednesday Group',
    detail:schedule(d.groupDate,'Next gathering')+(d.groupLocation?' · '+d.groupLocation:''),
    status:pendingGroup?'RSVP open':d.rsvp==='going'?'Going':'Maybe',
    statusTone:pendingGroup?'attention':'complete'
 }));
 else agenda.push(Object.freeze({
    id:'group',icon:'people',tone:'rose',title:'Community',
    detail:'No sample group membership',status:'Explore',statusTone:'neutral'
 }));
 if(hasTeam)agenda.push(Object.freeze({
    id:'serve',icon:'team',tone:'gold',title:'Welcome Team',
    detail:millis(d.serveDate)<Infinity?
      schedule(d.serveDate,'Upcoming shift')+(d.serveLocation?' · '+d.serveLocation:''):
      'Sample serving schedule',
    status:pendingServe?'Needs reply':d.serveStatus==='confirmed'?'Confirmed':
      d.serveStatus==='declined'?'Declined':'View schedule',
    statusTone:pendingServe?'attention':d.serveStatus==='confirmed'?'complete':'neutral'
 }));
 else agenda.push(Object.freeze({
    id:'serve',icon:'team',tone:'gold',title:'Serving',
    detail:'No sample team membership',status:'Explore',statusTone:'neutral'
 }));
 agenda.push(Object.freeze({
   id:'scripture',icon:'read',tone:'blue',title:'Scripture rhythm',
   detail:rhythmDue?'Saved step · '+(d?.passage||'Reading'):(d?.passage||'Daily reading'),
   status:rhythmDue?'Step due':d?.readToday?'Read':'To read',
   statusTone:rhythmDue?'attention':d?.readToday?'complete':'neutral'
 }));
 return Object.freeze({hero,rows:Object.freeze(rows),
   agenda:Object.freeze(agenda),taskCount:pending.length,
   hasPeople:hasCommunity,audience:d?.audience||'newcomer',
   caughtUp:hero.id==='caught-up',
   summary:d?.source||'fictional local data'
 });
}
function render(d,peopleRail='',portraits=[],now=new Date()){
 const b=derive(d,now),h=b.hero;
 const faces=h.hasPeople&&b.hasPeople?
  '<div class="f09b-faces" role="group" aria-label="Fictional group members">'+
   (Array.isArray(portraits)?portraits.slice(0,3).map(p=>face(p.id,p.name,p.image)).join(''):'')+
   (Array.isArray(portraits)&&portraits.length>3?'<span aria-label="'+(portraits.length-3)+' additional fictional group member">+'+(portraits.length-3)+'</span>':'')+
  '</div>':'';
 const hero=
  '<section class="f09b-hero'+(h.calm?' is-settled':'')+'" aria-labelledby="f09b-hero-title" data-priority="'+esc(h.id)+'">'+
   '<div class="f09b-hero-symbol">'+svg(h.heroType)+'</div>'+
   '<div class="f09b-hero-main">'+
    '<span class="f09b-overline"><svg viewBox="0 0 24 24" aria-hidden="true" fill="currentColor"><path d="M13.4 1.5 4.8 12h6.7l-1 10.5L20 10.2h-7.1L13.4 1.5Z"/></svg>'+esc(h.eyebrow)+'</span>'+
    '<h2 id="f09b-hero-title">'+esc(h.title)+'</h2>'+
    '<p>'+esc(h.subtitle)+'</p>'+
    '<div class="f09b-hero-bottom">'+faces+
     '<button type="button" class="f09b-primary" '+attr(h.primary)+'>'+esc(h.heroLabel)+' <span aria-hidden="true">›</span></button>'+
    '</div>'+
   '</div>'+
   (h.why?'<details class="f09b-explain"><summary>Why this?</summary><p>'+esc(h.why)+'</p></details>':'')+
  '</section>';
 const rows=b.rows.map(r=>
  '<div class="f09b-row f09b-'+esc(r.tone)+(r.requiresResponse?' is-actionable':' is-invitation')+'" data-row="'+esc(r.id)+'">'+
    '<span class="f09b-row-icon">'+svg(r.icon)+'</span>'+
    '<div class="f09b-row-copy"><strong>'+esc(r.title)+'</strong><small>'+esc(r.detail)+'</small></div>'+
    '<button type="button" class="f09b-row-cta" '+attr(r.action)+
     ' aria-label="'+esc(r.label+' · '+r.title)+'">'+esc(r.label)+' <span aria-hidden="true">›</span></button>'+
   '</div>').join('');
 const glance=b.agenda.map(row=>
  '<div class="f09b-agenda-row" data-agenda="'+esc(row.id)+'">'+
   '<span class="f09b-agenda-icon f09b-'+esc(row.tone)+'">'+svg(row.icon)+'</span>'+
   '<div class="f09b-agenda-copy"><strong>'+esc(row.title)+'</strong><small>'+esc(row.detail)+'</small></div>'+
   '<span class="f09b-status '+esc(row.statusTone)+'" aria-label="'+esc(row.title+': '+row.status)+'">'+
    esc(row.status)+'</span>'+
  '</div>').join('');
 const feedback=typeof d?.feedback==='string'&&d.feedback.trim()?
  '<div class="f09b-feedback" role="status" aria-live="polite">'+esc(d.feedback.slice(0,120))+'</div>':'';
 const companionEntry=d?.f10Enabled?
  '<aside class="f10-entry" aria-label="Ask Rally companion">'+
   '<span class="f10-entry-mark" aria-hidden="true">R.</span>'+
   '<span class="f10-entry-copy"><strong>Ask Rally.</strong><small>Your week. Your people. Your next step.</small></span>'+
   '<button type="button" class="f10-entry-button" data-action="f10-open" aria-label="Ask Rally about your sample week">Ask <span aria-hidden="true">›</span></button>'+
   '</aside>':'';
 return '<section class="f09-dashboard f09-board" data-audience="'+esc(b.audience)+'" data-caught-up="'+b.caughtUp+'" aria-label="F-09 Smart Priority Board preview">'+
  '<header class="f09-greeting"><span class="f09-preview-label">TODAY · YOUR PRIORITIES</span>'+
    '<h1>'+esc(d.greeting||'Welcome back')+',<br><em>'+esc(d.name||'Friend')+'.</em></h1>'+
    '<span class="f09-date">'+esc(d.nowLabel||'')+'</span></header>'+feedback+companionEntry+
  '<div class="f09b-priorities" aria-label="Visible priorities">'+hero+
   '<div class="f09b-row-stack">'+rows+'</div></div>'+
  '<section class="f09b-glance" aria-label="Today at a Glance">'+
   '<div class="f09b-glance-heading"><h2>Today at a Glance</h2>'+
    '<span>SCHEDULE &amp; STATUS</span></div>'+
   glance+'</section>'+
  (peopleRail||'')+
  '<button class="f09b-mission" type="button" data-go="group" '+(d.member?'data-pane="people"':'')+
   ' aria-label="'+(d.member?'See your group community':'Explore community groups')+'">'+
   '<span class="f09b-mission-content"><strong>A People<br>On Mission.</strong>'+
    '<small>CITIZEN CHURCH · ALBUQUERQUE</small></span>'+
   '<span class="f09b-mission-arrow" aria-hidden="true">›</span></button>'+
  '<footer class="f09b-footer"><span>FICTIONAL LOCAL DEMO · NO LIVE CHURCH ACTIVITY</span>'+
   '<a href="?f09=1&skipWelcome=1">Compare Smart Stack</a>'+
   '<a href="./">Original Today</a></footer></section>';
}
return Object.freeze({derive,render});
});
