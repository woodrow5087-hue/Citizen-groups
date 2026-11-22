/* F-09 Smart Dashboard Lab — model + presentation.
 * Preview-only, opt-in (?f09=1); the approved Today renderer is untouched.
 * Pure projection from canonical fictional source state. No new storage keys.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RallySmartDashboard=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>
 ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const validTime=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
const sameDay=(a,b)=>a.getFullYear()===b.getFullYear()&&a.getMonth()===b.getMonth()&&a.getDate()===b.getDate();
const arrow={go:'data-go',action:'data-action'};
const action=(name,verb,pane='',value='')=>Object.freeze({name,verb,pane,value});
const go=(dest,pane='')=>action(dest,'go',pane);
const act=(name,value='')=>action(name,'action','',value);
function model({state,ui,conversation,now=new Date(),today,companion,passage='John 15:12'}={}){
 const s=state&&typeof state==='object'?state:{},member=!!ui?.memberships?.group,team=!!ui?.memberships?.team;
 const chat=conversation&&typeof conversation==='object'?conversation:{status:'unavailable'};
 const sourceToday=today?.snapshot(s,ui,now,chat)||{upNext:null,events:[]};
 const result=companion?.choose({state:s,ui,conversation:chat,now})||{
   id:'explore-reading',title:'Your next step.',description:'Continue in Scripture.',
   action:'Open reading',why:'The daily reading is available.',dest:'read',pane:'',intent:'',
   alternatives:[],source:'fictional local data'
 };
 const unread=member&&chat.status==='ok'&&Number.isSafeInteger(chat.unreadCount)?
   Math.max(0,chat.unreadCount):0;
 const gathered=member&&sourceToday.events?.find(x=>x.id==='group');
 const serving=team&&sourceToday.events?.find(x=>x.id==='team');
 const due=validTime(s.rhythm?.followUpAt)&&!s.rhythm?.completedAt&&
    typeof s.rhythm?.text==='string'&&!!s.rhythm.text.trim()&&Date.parse(s.rhythm.followUpAt)<=now.getTime();
 const meetToday=!!(gathered&&sameDay(gathered.date,now));
 const meetingLabel=meetToday?'Tonight':'Wednesday';
 const meetingText=gathered?
   (meetToday?'Tonight · ':'Next gathering · ')+
   gathered.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'Explore a group';
 const scheduleLabel=serving?today.dateLabel(serving.date,now):'Explore serving';
 const words=readable=>{
   if(readable===1)return '1 new message';
   return readable+' new messages';
 };
 function feature(candidate){
   const d=candidate||result;
   let title=d.title,subtitle=d.description;
   let primary=d.intent?act(d.intent):go(d.dest||'read',d.pane||'');
   let secondary=null,hasPeople=false;
   switch(d.id){
    case 'care-marcus':
     title='Someone to encourage.';subtitle='A fictional prayer note from Marcus.';
     primary=act('companion-encourage');secondary=go('group','prayer');hasPeople=true;break;
    case 'serve-response':
     title='Serve this Sunday?';subtitle='Welcome Team · response needed';
     primary=act('f09-serve');secondary=go('team','schedule');break;
    case 'group-unread':
     title=words(unread)+'.';subtitle='Wednesday Group is talking.';
     primary=go('group','chat');secondary=go('group','people');hasPeople=true;break;
    case 'group-unavailable':
     title='Check your conversation.';subtitle='Your local thread needs review.';
     primary=go('group','chat');secondary=go('group','people');break;
    case 'group-rsvp':
     title=meetToday?'Group tonight.':'Your Wednesday Group.';
     subtitle=meetingText+' · RSVP still open';
     primary=act('f09-rsvp');secondary=go('group','gather');hasPeople=true;break;
    case 'scripture-step':
     title='Your next step.';subtitle='A saved Scripture intention is ready.';
     primary=go('read','');secondary=go('read','');break;
    case 'scripture-read':
     title='Make space for Scripture.';subtitle=passage+' · Today’s reading';
     primary=go('read','');break;
    case 'prayer':
     title='Make time for prayer.';subtitle='A quiet moment in your day.';
     primary=go(d.dest||'read',d.pane||'');break;
    case 'group-people':
     title='Your people. Your place.';subtitle='Keep the conversation going.';
     primary=go('group','people');hasPeople=true;break;
    case 'find-community':
     title='Find your people.';subtitle='Explore the sample community.';
     primary=go('group');break;
    default:
     title='Your next step.';subtitle='A moment to explore your reading.';
     primary=go('read');break;
   }
   return Object.freeze({id:d.id,title,subtitle,eyebrow:d.id==='group-rsvp'&&meetToday?'GROUP TONIGHT':'YOUR NEXT ACTION',
     primary,primaryLabel:d.id==='group-rsvp'?'RSVP · I’m in':d.id==='serve-response'?'Confirm my serve':d.action||'Open',
     secondary,secondaryLabel:d.id==='group-rsvp'?'View details':d.id==='serve-response'?'Review schedule':'See my people',
     why:d.why||'',hasPeople:hasPeople&&member});
 }
 const choices=[result,...(Array.isArray(result.alternatives)?result.alternatives:[])];
 const stack=Object.freeze(choices.slice(0,4).map(feature));
 const allPriorities=Object.freeze(choices.map(feature));
 const modules=Object.freeze([
  Object.freeze({id:'messages',kind:'rose',icon:'message',title:member?'Messages':'Find your people',
    detail:!member?'Explore sample groups':chat.status==='unavailable'?'Conversation needs review':unread?words(unread):'All caught up',
    count:unread,action:go('group',member?'chat':''),available:true}),
  Object.freeze({id:'serving',kind:'gold',icon:'team',title:team?'Serving':'Find a team',
    detail:!team?'See how to serve':s.teamStatus==='pending'?'Confirm your availability':
      s.teamStatus==='confirmed'?'Confirmed on this device':'No upcoming shift',
    action:go('team','schedule'),available:true}),
  Object.freeze({id:'scripture',kind:'blue',icon:'read',title:'Scripture',
    detail:due?'Your next step is due':s.read?'Read today · '+passage:passage,
    action:go('read'),available:true}),
  Object.freeze({id:'week',kind:'lilac',icon:'calendar',title:'This week',
    detail:sourceToday.upNext?sourceToday.upNext.title+' · '+today.dateLabel(sourceToday.upNext.date,now):
      'Explore your community',
    action:sourceToday.upNext?go(sourceToday.upNext.id,sourceToday.upNext.pane):go('group'),
    available:true})
 ]);
 const tasks=[];
 const addTask=(id,icon,label,detail,control,cta)=>tasks.push(Object.freeze({id,icon,label,detail,control,cta}));
 if(member&&chat.status==='unavailable'){
  addTask('chat-unavailable','message','Review group conversation','Local thread unavailable · earlier messages preserved',go('group','chat'),'Review');
 } else if(member&&unread>0){
  addTask('chat-unread','message','Catch up with your group',words(unread)+' · Wednesday Group',go('group','chat'),'Open');
 }
 if(member&&s.rsvp!=='going'&&s.rsvp!=='maybe'){
  addTask('rsvp','calendar','RSVP for Wednesday Group',meetingText,act('f09-rsvp'),'RSVP');
 }
 if(team&&s.teamStatus==='pending'){
  addTask('serve','team','Confirm Sunday serving','Welcome Team · '+scheduleLabel,act('f09-serve'),'Confirm');
 }
 if(due){
  addTask('intention','read','Review your Scripture step','Your saved intention is due',go('read'),'Review');
 }else if(!s.read){
  addTask('scripture','read','Read today’s Scripture',passage,go('read'),'Open');
 }
 // There is no fabricated activity score, streak or completion from viewing the page.
 return Object.freeze({
   stack,allPriorities,modules,tasks:Object.freeze(tasks.slice(0,4)),
   member,team,unread,meetingLabel,meetingText,
   groupDate:gathered?.date||null,serveDate:serving?.date||null,
   serveDateLabel:serving?'Welcome Team · '+today.dateLabel(serving.date,now):'Explore serving',
   serveStatus:team?s.teamStatus||'unknown':'none',
   readToday:!!s.read,rhythmDue:!!due,
   conversationStatus:member?chat.status:'not-joined',
   served:s.teamStatus==='confirmed',rsvp:s.rsvp==='going'?'going':s.rsvp==='maybe'?'maybe':'',
   greeting:now.getHours()<12?'Good morning':now.getHours()<17?'Good afternoon':'Good evening',
   nowLabel:now.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'}),
   name:String(ui?.name||'Friend').slice(0,20),passage:String(passage).slice(0,80),
   source:'existing fictional browser-local fixtures'
 });
}
function attr(a){
 if(!a||!arrow[a.verb])return '';
 return arrow[a.verb]+'="'+escape(a.name)+'"'+
   (a.pane?' data-pane="'+escape(a.pane)+'"':'')+
   (a.value?' data-value="'+escape(a.value)+'"':'');
}
function glyph(kind){
 const path={
  message:'<path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-7A8 8 0 1 1 21 11Z"/>',
  team:'<circle cx="9" cy="7" r="3"/><path d="M2 21v-2a7 7 0 0 1 14 0v2m2-13a3 3 0 0 1 0 6m-1 5c3 0 5 2 5 5"/>',
  read:'<path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 2v6m10-6v6M3 10h18"/>'
 };
 return '<svg viewBox="0 0 24 24" class="f09-icon" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">'+(path[kind]||path.calendar)+'</svg>';
}
function render(d,position=0,peopleRail='',portraits=[]){
 const stack=d.stack.length?d.stack:[],index=stack.length?Math.min(Math.max(0,position),stack.length-1):0,
   active=stack[index]||{},p=d.member;
 const dots=stack.length>1?
  '<div class="f09-stack-controls" role="group" aria-label="Priority cards">'+
  '<button type="button" data-action="f09-stack" data-value="prev" aria-label="Previous priority card">↑</button>'+
  '<div class="f09-stack-dots" aria-hidden="true">'+stack.map((v,i)=>'<i class="'+(index===i?'active':'')+'"></i>').join('')+'</div>'+
  '<button type="button" data-action="f09-stack" data-value="next" aria-label="Next priority card">↓</button></div>':'';
 const primary='<button type="button" class="f09-hero-primary" '+attr(active.primary)+'>'+
    escape(active.primaryLabel)+' <span aria-hidden="true">→</span></button>';
 const secondary=active.secondary?
   '<button type="button" class="f09-hero-secondary" '+attr(active.secondary)+'>'+escape(active.secondaryLabel)+
    ' <span aria-hidden="true">›</span></button>':'';
 const avatarList=Array.isArray(portraits)?portraits.slice(0,3):[];
 const faces=active.hasPeople?
  '<div class="f09-mini-faces" role="group" aria-label="Fictional Wednesday Group members">'+
  (avatarList.length?avatarList.map(person=>
    '<img src="'+escape(person.image)+'" alt="'+escape(person.name)+'" referrerpolicy="no-referrer" decoding="async">').join(''):
    '<span>AL</span><span>JW</span><span>MC</span>')+'</div>':'';
 const moduleHtml=d.modules.map(m=>'<button type="button" class="f09-module f09-'+escape(m.kind)+'" '+
   attr(m.action)+' aria-label="'+escape(m.title+': '+m.detail)+'">'+
   '<span class="f09-module-icon">'+glyph(m.icon)+'</span>'+
   (m.count?'<b class="f09-unread" aria-label="'+m.count+' unread">'+m.count+'</b>':'')+
   '<strong>'+escape(m.title)+'</strong><small>'+escape(m.detail)+'</small>'+
   '<span class="f09-module-arrow" aria-hidden="true">›</span></button>').join('');
 const taskHtml=d.tasks.length?d.tasks.map((t,i)=>'<div class="f09-task" data-task="'+escape(t.id)+'">'+
    '<span class="f09-task-icon f09-task-'+escape(t.icon)+'">'+glyph(t.icon)+'</span>'+
    '<div class="f09-task-copy"><strong>'+escape(t.label)+'</strong><small>'+escape(t.detail)+'</small></div>'+
    '<button type="button" '+attr(t.control)+' aria-label="'+escape(t.cta+' · '+t.label)+'">'+escape(t.cta)+'</button></div>').join(''):
   '<div class="f09-done" role="status">You’re caught up on the sample actions shown here. No streaks, no pressure.</div>';
 return '<section class="f09-dashboard" aria-label="F-09 Smart Dashboard preview">'+
  '<div class="f09-greeting"><span class="f09-preview-label">TODAY · SMART DASHBOARD LAB</span>'+
  '<h1>'+escape(d.greeting||'Welcome back')+',<br><em>'+escape(d.name)+'.</em></h1><span class="f09-date">'+escape(d.nowLabel)+'</span></div>'+
  '<div class="f09-hero-frame"><div class="f09-hero" data-active-card="'+escape(active.id)+'" '+
   'role="group" aria-roledescription="stacked card" aria-label="Priority '+(index+1)+' of '+stack.length+'">'+
   '<div class="f09-hero-content"><div class="f09-hero-overline">'+escape(active.eyebrow)+'</div>'+
   '<h2>'+escape(active.title)+'</h2><p>'+escape(active.subtitle)+'</p>'+faces+
   '<div class="f09-hero-actions">'+primary+secondary+'</div></div>'+dots+
   '<details class="f09-why"><summary>Why this?</summary><p>'+escape(active.why)+'</p></details>'+
   '</div></div>'+
  '<section class="f09-quick" aria-label="Quick actions">'+moduleHtml+'</section>'+
  '<section class="f09-glance" aria-label="Today at a Glance"><div class="f09-section-head"><h2>Today at a Glance</h2>'+
   '<span>'+d.tasks.length+' '+(d.tasks.length===1?'action':'actions')+'</span></div>'+taskHtml+'</section>'+
  '<button type="button" class="f09-mission" data-go="group" '+(p?'data-pane="people"':'')+
   ' aria-label="'+(p?'See your group community':'Explore community groups')+'">'+
   '<span class="f09-mission-kicker">CITIZEN CHURCH · COMMUNITY</span>'+
   '<strong>A people<br>on mission.</strong><span class="f09-mission-arrow" aria-hidden="true">↗</span></button>'+
  (peopleRail?peopleRail:'')+
  '<div class="f09-footer"><span>ILLUSTRATIVE LOCAL DEMO · NO LIVE CHURCH DATA</span>'+
   '<a href="./" aria-label="Return to the existing approved Today preview">Original Today ↗</a></div>'+
 '</section>';
}
return Object.freeze({model,render,attr});
});