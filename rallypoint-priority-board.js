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
function derive(d,now=new Date()){
 const features=Array.isArray(d?.stack)?d.stack:[];
 const find=id=>features.find(f=>f.id===id);
 const whenGroup=millis(d?.groupDate)-now.getTime();
 const whenServe=millis(d?.serveDate)-now.getTime();
 const pendingGroup=!!d?.member&&!d.rsvp;
 const pendingServe=!!d?.team&&d.serveStatus==='pending';
 const hasUnread=!!d?.member&&d.unread>0;
 const isUnavailable=!!d?.member&&d.conversationStatus==='unavailable';
 // Time-sensitive action ranking belongs to this board, not the optional F-08
 // care invitation. A fixture event is shown as "tonight" only on its actual date.
 const candidates=[
  {id:'group-rsvp',when:pendingGroup&&whenGroup>=0&&whenGroup<=24*3600000,score:100},
  {id:'serve-response',when:pendingServe&&whenServe>=0&&whenServe<=48*3600000,score:95},
  {id:'group-unavailable',when:isUnavailable,score:80},
  {id:'group-unread',when:hasUnread,score:75},
  {id:'group-rsvp',when:pendingGroup,score:70},
  {id:'serve-response',when:pendingServe,score:65},
  {id:'scripture-step',when:!!d?.rhythmDue,score:55},
  {id:'scripture-read',when:!d?.readToday,score:45}
 ];
 const choice=candidates.filter(x=>x.when).sort((a,b)=>b.score-a.score).find(x=>find(x.id));
 const hero=choice?find(choice.id):features[0]||Object.freeze({
   id:'explore-reading',title:'Your next step.',subtitle:'Continue your Scripture rhythm.',
   primary:{name:'read',verb:'go'},primaryLabel:'Open reading',hasPeople:false,why:'A reading is available.'
 });
 const route=a=>a?.verb==='action'?act(a.name):go(a?.name||'read',a?.pane||'');
 const primary=route(hero.primary);
 const heroType=hero.id==='group-rsvp'?'calendar':hero.id==='serve-response'?'team':
   hero.id==='group-unread'||hero.id==='group-unavailable'?'message':
   hero.id==='scripture-read'||hero.id==='scripture-step'?'read':'people';
 const heroLabel=hero.id==='group-rsvp'?'RSVP · I’m in':
   hero.id==='serve-response'?'Confirm':
   hero.id==='group-unread'?'View messages':
   hero.id==='group-unavailable'?'Review conversation':
   hero.id==='care-marcus'?'Reach out':hero.primaryLabel||'Open';
 const rows=[];
 const add=(id,tone,icon,title,detail,action,label,requiresResponse=true)=>{
   if(rows.some(r=>r.id===id)||id===hero.id)return;
   rows.push(Object.freeze({id,tone,icon,title,detail,action,label,requiresResponse}));
 };
 if(d?.member){
  if(isUnavailable)add('group-unavailable','rose','message','Check your messages','Local conversation needs review',go('group','chat'),'Review');
  else if(hasUnread)add('group-unread','rose','message',d.unread===1?'1 new message':d.unread+' new messages','Your group is talking.',go('group','chat'),'View messages');
  if(pendingGroup)add('group-rsvp','rose','calendar','Wednesday Group','Your RSVP is still open',act('f09-rsvp'),'RSVP');
 }
 if(pendingServe)add('serve-response','gold','team','Serve Sunday?','Welcome Team · response needed',act('f09-serve'),'Confirm');
 if(d?.rhythmDue)add('scripture-step','blue','read','Carry it into the week','Your saved step is due',go('read'),'Review');
 else if(!d?.readToday)add('scripture-read','blue','read','Today’s Scripture',d?.passage||'Read today',go('read'),'Read');
 if(d?.member&&find('care-marcus'))add('care-marcus','rose','people','Someone to encourage','Fictional prayer note from Marcus',act('companion-encourage'),'Reach out',false);
 // Fill the remaining visual slots with *clearly optional* navigation,
 // not fabricated deadlines or duplicate "to-do" records.
 if(d?.member&&d?.unread===0&&!isUnavailable)add('community','rose','message','Your people','Open your group conversation',go('group','chat'),'Open',false);
 if(d?.team&&!pendingServe)add('serving-overview','gold','team','Your serving','Review the Welcome Team schedule',go('team','schedule'),'Open',false);
 add('scripture-overview','blue','read','Carry it into the week',d?.passage||'Explore the reading',go('read'),'Review',false);
 add('this-week','lilac','calendar','This week','See what’s coming up',d?.member?go('group','gather'):go('group'),'Explore',false);
 if(!d?.member)add('find-people','rose','people','Find your people','Explore fictional groups',go('group'),'Explore',false);
 if(!d?.team)add('find-team','gold','team','Find a place to serve','See serving possibilities',go('team'),'Explore',false);
 // Need three *distinct* visible items; don't accidentally show a pending
 // task twice when the same source also appears in the hero.
 const displayed=Object.freeze(rows.slice(0,3));
 const agenda=[];
 if(d?.member)agenda.push(Object.freeze({
    id:'group',icon:'calendar',tone:'rose',title:'Group Gathering',
    detail:d.meetingText||'Next Wednesday',
    cta:pendingGroup?'RSVP':d.rsvp==='going'?'Going':'Maybe',
    action:pendingGroup?act('f09-rsvp'):go('group','gather'),
    done:!pendingGroup
 }));
 else agenda.push(Object.freeze({id:'group',icon:'people',tone:'rose',
   title:'Find a group',detail:'Explore community',cta:'Explore',action:go('group'),done:false}));
 if(d?.team)agenda.push(Object.freeze({
    id:'serve',icon:'team',tone:'gold',title:'Serve',
    detail:d.serveDateLabel||'Welcome Team',
    cta:pendingServe?'Confirm':d.serveStatus==='confirmed'?'Confirmed':d.serveStatus==='declined'?'Declined':'Details',
    action:pendingServe?act('f09-serve'):go('team','schedule'),done:!pendingServe
 }));
 else agenda.push(Object.freeze({id:'serve',icon:'team',tone:'gold',
   title:'Serving',detail:'Explore how to serve',cta:'Explore',action:go('team'),done:false}));
 agenda.push(Object.freeze({
   id:'scripture',icon:'read',tone:'blue',title:'Scripture',
   detail:d?.rhythmDue?'Your step is ready':d?.passage||'Daily reading',
   cta:d?.readToday&&!d?.rhythmDue?'Read':'Review',action:go('read'),done:!!d?.readToday&&!d?.rhythmDue
 }));
 return Object.freeze({hero:Object.freeze({
   ...hero,primary:primary,heroType,heroLabel,eyebrow:choice?.score>=90?'NEXT UP':'YOUR NEXT ACTION'
 }),rows:displayed,agenda:Object.freeze(agenda),
   taskCount:rows.filter(r=>r.requiresResponse).length+Number(choice&&choice.score>=45),
   hasPeople:!!d?.member,summary:d?.source||'fictional local data'
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
  '<section class="f09b-hero" aria-labelledby="f09b-hero-title" data-priority="'+esc(h.id)+'">'+
   '<div class="f09b-hero-symbol">'+svg(h.heroType)+'</div>'+
   '<div class="f09b-hero-main">'+
    '<span class="f09b-overline">'+esc(h.eyebrow)+'</span>'+
    '<h2 id="f09b-hero-title">'+esc(h.title)+'</h2>'+
    '<p>'+esc(h.subtitle)+'</p>'+
    '<div class="f09b-hero-bottom">'+faces+
     '<button type="button" class="f09b-primary" '+attr(h.primary)+'>'+esc(h.heroLabel)+' <span aria-hidden="true">›</span></button>'+
    '</div>'+
   '</div>'+
   (h.why?'<details class="f09b-explain"><summary>Why this?</summary><p>'+esc(h.why)+'</p></details>':'')+
  '</section>';
 const rows=b.rows.map(r=>
  '<div class="f09b-row f09b-'+esc(r.tone)+'" data-row="'+esc(r.id)+'">'+
    '<span class="f09b-row-icon">'+svg(r.icon)+'</span>'+
    '<div class="f09b-row-copy"><strong>'+esc(r.title)+'</strong><small>'+esc(r.detail)+'</small></div>'+
    '<button type="button" class="f09b-row-cta" '+attr(r.action)+
     ' aria-label="'+esc(r.label+' · '+r.title)+'">'+esc(r.label)+' <span aria-hidden="true">›</span></button>'+
   '</div>').join('');
 const glance=b.agenda.map(row=>
  '<div class="f09b-agenda-row" data-agenda="'+esc(row.id)+'">'+
   '<span class="f09b-agenda-icon f09b-'+esc(row.tone)+'">'+svg(row.icon)+'</span>'+
   '<div class="f09b-agenda-copy"><strong>'+esc(row.title)+'</strong><small>'+esc(row.detail)+'</small></div>'+
   '<button type="button" class="f09b-agenda-cta f09b-'+esc(row.tone)+(row.done?' is-done':'')+'" '+
    attr(row.action)+' aria-label="'+esc(row.cta+' · '+row.title)+'">'+esc(row.cta)+'</button>'+
  '</div>').join('');
 return '<section class="f09-dashboard f09-board" aria-label="F-09 Smart Priority Board preview">'+
  '<header class="f09-greeting"><span class="f09-preview-label">TODAY · PRIORITY BOARD LAB</span>'+
    '<h1>'+esc(d.greeting||'Welcome back')+',<br><em>'+esc(d.name||'Friend')+'.</em></h1>'+
    '<span class="f09-date">'+esc(d.nowLabel||'')+'</span></header>'+
  '<div class="f09b-priorities" aria-label="Visible priorities">'+hero+
   '<div class="f09b-row-stack">'+rows+'</div></div>'+
  '<section class="f09b-glance" aria-label="Today at a Glance">'+
   '<div class="f09b-glance-heading"><h2>Today at a Glance</h2>'+
    '<span>'+ (b.hasPeople?'YOUR RHYTHM':'GET CONNECTED')+'</span></div>'+
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