(function rallyApp(){
'use strict';
const key='rallypoint-phase1-2026';
// Preview builds choose the default layout. Experiments remain explicit URL choices.
const previewParams=new URLSearchParams(window.location.search);
const f103Preview=previewParams.get('f103')==='1';
const f10Preview=f103Preview||previewParams.get('f10')==='1';
const defaultToday=document.documentElement.dataset.defaultToday;
const f09Mode=f10Preview?'board':(previewParams.get('f09')??defaultToday);
const f09Board=f09Mode==='board';
const f09Preview=f09Mode==='1'||f09Board;
let f09Index=0;
let f09Feedback='';
let f10Prompt='week',f10Asked='',f10Notice='';
let f10Turns=[],f10Prior={},f10Active=null;
// No transcripts, contextual focus, or typed questions are written to storage.
function f10ClearSession(){
 f10Prompt='week';f10Asked='';f10Notice='';f10Turns=[];f10Prior={};f10Active=null;
}
const defaults=()=>({role:'member',groupPane:'chat',directPerson:'anna',directMessages:{},teamPane:'schedule',view:'today',discover:false,groupMessages:[{name:'Jess W.',time:'Yesterday',text:'What stood out to you in John 15 this week?'},{name:'Anna L.',time:'Today',text:'Looking forward to seeing everyone Wednesday.'}],teamMessages:[{name:'Sam R.',time:'Yesterday',text:'Welcome team — thank you for helping people feel at home!'}],prayers:[{name:'Marcus C.',time:'Yesterday',text:'Praying for wisdom with an upcoming decision.'}],rsvp:'',teamStatus:'pending',coverage:false,attendance:{anna:'here',jess:'here',marcus:'unknown',taylor:'unknown'},reached:[],interest:[],plan:'sermon',planQuestions:{},memoryTextRevision:'BSB-2026-1',memoryGames:{},memoryMode:'solo',memoryActive:null,memoryPassTurn:1,memoryTarget:null,question:'How can we love one another as Jesus has loved us?',read:false,prayed:false,reflectionPrompt:'notice',reflectionResponses:{},readerPreferences:{size:'regular',highlighted:{}},readerNotes:{},companionCare:{},companionChoices:{snoozedUntil:{}},rhythm:{}});
let s;try{s={...defaults(),...JSON.parse(localStorage.getItem(key)||'null')}}catch(_){s=defaults()}
if(!s||!s.groupMessages||!Array.isArray(s.groupMessages))s=defaults();
 if(!s.directMessages||typeof s.directMessages!=='object'||Array.isArray(s.directMessages))s.directMessages={};
 if(!s.planQuestions||typeof s.planQuestions!=='object'||Array.isArray(s.planQuestions))s.planQuestions={};
if(!s.companionCare||typeof s.companionCare!=='object'||Array.isArray(s.companionCare))s.companionCare={};
if(!s.companionChoices||typeof s.companionChoices!=='object'||Array.isArray(s.companionChoices))s.companionChoices={};
if(!s.companionChoices.snoozedUntil||typeof s.companionChoices.snoozedUntil!=='object'||
   Array.isArray(s.companionChoices.snoozedUntil))s.companionChoices.snoozedUntil={};
if(!s.rhythm||typeof s.rhythm!=='object'||Array.isArray(s.rhythm))s.rhythm={};
if(!s.memoryGames||typeof s.memoryGames!=='object'||Array.isArray(s.memoryGames))s.memoryGames={};
if(!s.readerPreferences||typeof s.readerPreferences!=='object'||Array.isArray(s.readerPreferences))s.readerPreferences={size:'regular',highlighted:{}};
if(!['regular','large'].includes(s.readerPreferences.size))s.readerPreferences.size='regular';
if(!s.readerPreferences.highlighted||typeof s.readerPreferences.highlighted!=='object'||Array.isArray(s.readerPreferences.highlighted))s.readerPreferences.highlighted={};
if(!s.readerNotes||typeof s.readerNotes!=='object'||Array.isArray(s.readerNotes))s.readerNotes={};
if(!['notice','meaning','action'].includes(s.reflectionPrompt))s.reflectionPrompt='notice';
if(!s.reflectionResponses||typeof s.reflectionResponses!=='object'||Array.isArray(s.reflectionResponses))s.reflectionResponses={};
if(!['solo','pass'].includes(s.memoryMode))s.memoryMode='solo';
if(!['sermon','study','year','romans'].includes(s.memoryActive))s.memoryActive=null;
if(![1,2].includes(s.memoryPassTurn))s.memoryPassTurn=1;
if(!Number.isInteger(s.memoryTarget)||s.memoryTarget<0||s.memoryTarget>4)s.memoryTarget=null;
const T=window.RallyToday,U=window.RallyUI,M=window.RallyMemory,VP=window.RallyVersePlay,H=window.RallyHybrid,G=window.RallyGroupView,GX=window.RallyGroupExperience,icon=U.icon;
// Old KJV rounds cannot be carried into a new translation: preserve all other demo data.
if(s.memoryTextRevision!==M.textRevision){s.memoryGames={};s.memoryTextRevision=M.textRevision;s.memoryTarget=null;}
const storageGuard=window.RallyStorageGuard.create({getItem:k=>localStorage.getItem(k),setItem:(k,v)=>localStorage.setItem(k,v),removeItem:k=>localStorage.removeItem(k)});
 let todayUI=T.load({getItem:k=>localStorage.getItem(k)}),dialog=null,dialogTrigger=null,storageWarning=storageGuard.status().reason||'',drafts={},companionFocus=null;
const $=x=>document.getElementById(x), e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{const result=storageGuard.save({primaryRaw:JSON.stringify(s),todayRaw:JSON.stringify(todayUI)});storageWarning=result.ok?'':result.reason;};
const canLead=area=>s.role==='leader'&&!!todayUI.memberships[area];
// Shared read-only projection of the same F-02 snapshot mounted in Groups.
// Legacy groupMessages remain an independent historical archive.
const conversation=()=>{
  try{return window.RallyConversationRead?.peek({
    storage:localStorage,domain:window.RallyChatDomain,member:todayUI.memberships.group
  })||{status:'unavailable',lastMessage:null,unreadCount:0};}
  catch(_){return {status:'unavailable',lastMessage:null,unreadCount:0};}
};
const pill=(t,light=false)=>`<span class="pill ${light?'light':''}">${e(t)}</span>`;
const icons={home:'⌂',group:'♙',team:'♡',read:'▤',arrow:'↗'};
const sampleGroupPeople=[{id:'anna',name:'Anna L.',initials:'AL'},{id:'jess',name:'Jess W.',initials:'JW'},{id:'marcus',name:'Marcus C.',initials:'MC'},{id:'taylor',name:'Taylor D.',initials:'TD'}];
 if(!sampleGroupPeople.some(p=>p.id===s.directPerson))s.directPerson='anna';
const readingLibrary={
 sermon:{name:'Sermon Series',title:'Words of Jesus',passage:'John 15:12',excerpt:'This is My commandment, that you love one another as I have loved you.',question:'How can we love one another as Jesus has loved us?',description:'A sample series-linked reading from John'},
 study:{name:'Approved Book Study',title:'The Book of James',passage:'James 1:22',excerpt:'Be doers of the word, and not hearers only. Otherwise, you are deceiving yourselves.',question:'What is one way to put what you read into practice this week?',description:'A sample Scripture focus from James'},
 year:{name:'Bible in One Year',title:'Daily Bible Reading',passage:'Psalm 23:1–2',excerpt:'The LORD is my shepherd; I shall not want. He makes me lie down in green pastures; He leads me beside quiet waters.',question:'How does this passage speak to the care and guidance you need?',description:'Illustrative daily passage, not a licensed Bible reading calendar'}
};
const currentReading=()=>readingLibrary[s.plan]||readingLibrary.sermon;
const next=d=>T.nextEvent(d,d===3?18:9,d===3?30:0).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
const wed=()=>next(3),sun=()=>next(0);
const teamList=()=>s.teamMessages.map(m=>`<div class="message"><div class="avatar">${e(m.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><div class="message-meta"><strong>${e(m.name)}</strong><small>${e(m.time)}</small></div><p>${e(m.text)}</p></div></div>`).join('');
const prayerList=()=>s.prayers.map(m=>`<div class="message"><div class="avatar">${e(m.name[0])}</div><div><div class="message-meta"><strong>${e(m.name)}</strong><small>${e(m.time)}</small></div><p>${e(m.text)}</p></div></div>`).join('');
const tabs=(area,values,active)=>`<div class="tabs" role="group" aria-label="${area} sections">${values.map(([id,label])=>`<button type="button" data-action="pane" data-area="${area}" data-value="${id}" class="${active===id?'selected':''}">${label}</button>`).join('')}</div>`;
const compose=(type,title,placeholder)=>`<div class="composer"><label for="${type}-input">${title}</label><textarea id="${type}-input" rows="2" maxlength="700" placeholder="${placeholder}"></textarea><button type="button" class="btn red" data-action="send" data-value="${type}">Post to sample ${type==='group'?'group':type==='team'?'team':type==='direct'?'private demo conversation':'prayer board'} <span>➤</span></button></div>`;
const lead=()=>`<div class="card"><div class="kicker">LEADER TOOLS · PRIVATE DEMO</div><h3>Record attendance</h3><p>Track actual participation, not whether someone opened the app.</p>${[['anna','Anna L.'],['jess','Jess W.'],['marcus','Marcus C.'],['taylor','Taylor D.']].map(([id,name])=>`<div class="attendance"><strong>${name}</strong><div class="actions">${[['here','Here'],['excused','Excused'],['unknown','Not recorded']].map(([v,label])=>`<button type="button" class="mini ${s.attendance[id]===v?'selected':''}" data-action="attendance" data-person="${id}" data-value="${v}">${label}</button>`).join('')}</div></div>`).join('')}</div><div class="card"><div class="kicker">PEOPLE FIRST</div><h3>Thoughtful check-ins</h3><p>These are fictional scenarios, not judgments about someone's spiritual health.</p>${[['marcus','Marcus C.','Two recent sample gatherings missed'],['taylor','Taylor D.','Signed up but no sample gathering yet']].map(([id,name,reason])=>`<div class="followup"><div>${pill(s.reached.includes(id)?'Reviewed':'Suggested check-in')}<strong>${name}</strong><small>${reason}</small></div><button type="button" class="btn outline" data-action="reached" data-person="${id}">${s.reached.includes(id)?'Undo':'Mark reviewed'}</button></div>`).join('')}</div>`;
function renderPeople(snapshot,chat){
  if(!todayUI.memberships.group){
    return `<section class="today-people today-people--discover" aria-label="Your people">
      <div class="today-people-content">
        <div class="today-people-kicker"><span>YOUR PEOPLE</span><span>FIND COMMUNITY</span></div>
        <h2>Find your<br>people<span class="today-people-period">.</span></h2>
        <p class="today-people-subtitle">Your next connection can start here.</p>
        <button type="button" class="today-people-discover-link" data-go="group" aria-label="Explore sample groups">
          <span class="today-people-discover-icon">${icon('group')}</span>
          <span><strong>Explore groups</strong><small>Discover a community at Citizen</small></span>
          <span class="today-people-go">${icon('arrow')}</span>
        </button>
      </div>
    </section>`;
  }
  const roster=sampleGroupPeople.map((person,index)=>`<span role="img" aria-label="${e(person.name)}" class="today-people-avatar today-people-avatar--${index+1}">${e(person.initials)}</span>`).join('');
  const latest=chat.status==='ok'?chat.lastMessage:null;
  const author=latest?e(latest.author):chat.status==='unavailable'?'Preview unavailable':'Your group';
  const timestamp=latest?e(new Date(latest.createdAt).toLocaleString('en-US',{
    month:'short',day:'numeric',hour:'numeric',minute:'2-digit'
  })):chat.status==='unavailable'?'Review saved data':'Start the conversation';
  const preview=latest?e(latest.body):chat.status==='unavailable'
    ?'The new conversation could not be read. Earlier messages are still preserved in Groups.'
    :'No new messages yet. Your earlier saved messages remain in Groups.';
  return `<section class="today-people" aria-label="Your people">
    <div class="today-people-content">
      <div class="today-people-kicker"><span>YOUR PEOPLE</span><span>${canLead('group')?'LEADER VIEW · DEMO':'YOUR COMMUNITY'}</span></div>
      <div class="today-people-heading">
        <h2>Your community<span class="today-people-period">.</span></h2>
        <span class="today-people-constellation" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
      <div class="today-people-roster">
        <div class="today-people-avatars" aria-label="Sample group members">${roster}</div>
        <div class="today-people-group-name"><strong>Wednesday Group</strong><small>8 members · Fictional community</small></div>
        <button type="button" class="today-people-group-link" data-go="group" data-pane="chat" aria-label="Open Wednesday Group">${icon('arrow')}</button>
      </div>
      <button type="button" class="today-people-message ${snapshot.unread?'attention-tile':''}" data-go="group" data-pane="chat" aria-label="Open Wednesday Group conversation">
        <span class="today-people-message-head">${icon('message')} <span>LATEST CONVERSATION</span><small>${timestamp}</small></span>
        <span class="today-people-message-author">${author}</span>
        <span class="today-people-message-text">${preview}</span>
        <span class="today-people-message-action">OPEN CONVERSATION${snapshot.unreadCount?` · ${snapshot.unreadCount} UNREAD`:''} ${icon('arrow')}</span>
      </button>
      ${snapshot.leader?`<button type="button" class="leader-entry today-people-leader" data-go="group" data-pane="leader" aria-label="Open authorized sample group leader check-ins">${icon('leader')}<span><span class="today-label">LEADER FOLLOW-UP · DEMO</span><strong>${snapshot.leader.remaining.length} sample check-ins to review</strong><small>People first, not engagement scores</small></span>${icon('arrow')}</button>`:''}
    </div>
  </section>`;
}
function f09Today(){
 const now=new Date(),chat=conversation(),model=window.RallySmartDashboard.model({
   state:s,ui:todayUI,conversation:chat,now,today:T,
   companion:window.RallyCompanionDecision,passage:currentReading().passage
 });
 f09Index=Math.max(0,Math.min(f09Index,model.stack.length-1));
 if(f09Board){
   const portraits=H.portraits.map(person=>({...person,image:`assets/today-priority/${person.id}.webp`}));
   const peopleRail=H.peopleRail(todayUI,'today',portraits,'assets/today-priority/group.webp');
   return window.RallyPriorityBoard.render({...model,feedback:f09Feedback,f10Enabled:f10Preview},peopleRail,portraits,now);
 }
 return window.RallySmartDashboard.render(model,f09Index,H.peopleRail(todayUI,'today'),H.portraits);
}
function today(){
  const chat=conversation(),snapshot=T.snapshot(s,todayUI,new Date(),chat),event=snapshot.upNext;
  const campusLabel=({central:'Central',north:'North',maui:'Maui',online:'Online'})[todayUI.campus]||'';
  const day=event?.date.toLocaleDateString('en-US',{weekday:'short'})||'';
  const hour=event?.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})||'';
  const target=event?.id==='group'?'Groups':'My Schedule';
  const nextWidget=event
  ? `<button type="button" class="up-next dashboard-next" data-go="${event.id}" data-pane="${event.pane}" aria-label="Up next: ${event.title}, ${T.dateLabel(event.date)}. Open ${target}">
      <span class="dashboard-tile-head">${icon('calendar')}<span>UP NEXT</span><span class="dashboard-tile-arrow">${icon('arrow')}</span></span>
      <span class="dashboard-event-when">${day} <strong>${hour}</strong></span>
      <span class="dashboard-event-desc">${event.title}</span>
      <span class="dashboard-event-detail">${icon('pin')}${e(event.location)}</span>
      <span class="dashboard-curve" aria-hidden="true"></span>
    </button>`
  : `<button type="button" class="dashboard-next dashboard-next--empty" data-go="group" aria-label="Explore sample groups">
      <span class="dashboard-tile-head">${icon('group')}<span>UP NEXT</span><span class="dashboard-tile-arrow">${icon('arrow')}</span></span>
      <span class="dashboard-event-when">There’s room</span>
      <span class="dashboard-event-desc">for you here.</span>
      <span class="dashboard-event-detail">Explore Groups</span>
    </button>`;
  const teamWidget=todayUI.memberships.team
  ? `<button type="button" class="dashboard-team ${snapshot.pending?'attention-tile availability-action':''}" data-go="team" data-pane="schedule" aria-label="${snapshot.pending?'Confirm your Sunday serving availability':s.teamStatus==='confirmed'?'View your confirmed serving schedule':'View your serving schedule'}">
      <span class="dashboard-tile-head">${icon(s.teamStatus==='confirmed'?'check':'confirm')}<span>YOUR TEAM</span><span class="dashboard-tile-arrow">${icon('arrow')}</span></span>
      <span class="dashboard-team-title">${snapshot.pending?'Confirm':s.teamStatus==='confirmed'?'You’re in':'Schedule'}</span>
      <span class="dashboard-team-desc">${snapshot.pending?'Sunday availability':s.teamStatus==='confirmed'?'Sunday Welcome Team':s.teamStatus==='declined'?'No upcoming shift':'Your team schedule'}</span>
      <span class="dashboard-team-status"><i></i>${snapshot.pending?'RESPONSE NEEDED':s.teamStatus==='confirmed'?'CONFIRMED':'VIEW SCHEDULE'}</span>
      <span class="dashboard-team-curve" aria-hidden="true"></span>
    </button>`
  : `<button type="button" class="dashboard-team dashboard-team--discover" data-go="team" aria-label="Find a serving team">
      <span class="dashboard-tile-head">${icon('team')}<span>YOUR TEAM</span><span class="dashboard-tile-arrow">${icon('arrow')}</span></span>
      <span class="dashboard-team-title">Get involved</span>
      <span class="dashboard-team-desc">Find a place to serve.</span>
      <span class="dashboard-team-status"><i></i>EXPLORE TEAMS</span>
    </button>`;
  return `<section class="today-screen dashboard-v06" aria-label="Today">
    <div class="today-welcome">
      <div class="dashboard-identity">
        <h1>Good morning, <span>${e(todayUI.name||'Jonathan')}</span>.${campusLabel?`<small class="dashboard-campus-marker">YOUR CAMPUS · ${e(campusLabel.toUpperCase())}</small>`:''}</h1>
        <span class="dashboard-today-date">${new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span>
      </div>
      <span class="dashboard-welcome-wave" aria-hidden="true"></span>
      <span class="today-watermark" aria-hidden="true"></span>
    </div>
    ${H.todayHero(todayUI)}
    ${H.peopleRail(todayUI,'today')}
    ${H.todayPrompt(s,todayUI,chat)}
    ${renderPeople(snapshot,chat)}
    <div class="dashboard-twins" role="group" aria-label="Upcoming gathering and serving">${nextWidget}${teamWidget}</div>
    <div class="today-reading">
      <span class="fluid-read-curve" aria-hidden="true"></span>
      <span class="today-reading-flag" aria-hidden="true"></span>
      <span class="today-label">${icon('read')} TODAY’S READ <i></i></span>
      <h2>${e(currentReading().passage)}</h2>
      <div class="reading-actions">
        <button type="button" class="read-primary" data-go="read" data-reading="scripture">${s.read?icon('check'):icon('read')} ${s.read?'Read today':'Read'}</button>
        <button type="button" data-go="read" data-reading="questions">${icon('message')} Reflect</button>
        <button type="button" class="read-play-cta" data-go="play" aria-label="Play the new Blank Battle Scripture game">${icon('check')} Memorize</button>
      </div>
      <p class="reading-caption">${todayUI.memberships.group?'Your group’s selection':'Daily Scripture'} · Fictional reading fixture${s.read?' · Read today':''}</p>
    </div>
    ${!snapshot.attention&&!snapshot.leader&&chat.status!=='unavailable'?`<div class="today-empty dashboard-clear">${icon('check')}<div><h3>You’re all caught up.</h3><p>No group messages or serving responses need your attention.</p></div></div>`:''}
    <div class="fluid-week">
      <div class="fluid-week-heading"><span>THIS WEEK</span><small>YOUR RHYTHM</small></div>
      <div class="fluid-week-events">
        ${todayUI.memberships.group?`<button type="button" data-go="group" data-pane="gather"><span class="fluid-event-dot"></span><strong>GROUP</strong><small>${wed()}</small>${icon('arrow')}</button>`:''}
        ${todayUI.memberships.team?`<button type="button" data-go="team" data-pane="schedule"><span class="fluid-event-dot"></span><strong>SERVE</strong><small>${sun()}</small>${icon('arrow')}</button>`:''}
        ${!todayUI.memberships.group&&!todayUI.memberships.team?`<button type="button" data-go="group"><span class="fluid-event-dot"></span><strong>FIND YOUR PEOPLE</strong><small>Explore groups</small>${icon('arrow')}</button>`:''}
      </div>
    </div>
    <div class="today-demo-footer">
      <span><i class="demo-dot"></i>FICTIONAL LOCAL DEMO · v0.6</span>
      <button type="button" class="demo-controls-link" data-action="demo-controls">Demo controls</button>
    </div>
  </section>`;
}
function groupBrowse(){
 const sampleGroups=[['The Table','Community · Wednesday','Albuquerque'],['Weekend Hikers','Activity · Saturday','Northeast Heights'],['Young Families','Community · Sunday','North Campus']];
 return `<section class="group-screen-v07 group-discovery-v07" aria-label="Discover community">
  <div class="group-community-hero group-discovery-hero">
    <div class="group-hero-overline">FIND COMMUNITY · LOCAL DEMO</div>
    <h1>Find your<br>people<span>.</span></h1>
    <p class="group-discovery-intro">Browse a few sample group options.</p>
    <div class="group-discovery-hero-strip">${icon('group')}<span>Connection starts with showing up.</span>${icon('arrow')}</div>
  </div>
  <div class="group-discovery-body">
    <div class="group-discovery-head"><span>EXPLORE GROUPS</span><strong>Find your kind of community.</strong></div>
    ${todayUI.memberships.group?`<button type="button" class="group-discovery-back" data-action="browse">${icon('arrow')} Back to my group</button>`:`<p class="group-discovery-notice">Sample discovery only. Interest does not join a group or contact anyone.</p>`}
    <div class="group-discovery-grid">
      ${sampleGroups.map(([name,type,place],i)=>`<article class="card group-discovery-card group-discovery-card--${i+1}">
        <div class="group-discovery-card-head"><span class="group-discovery-category">${e(type)}</span><span class="group-discovery-card-index">0${i+1}</span></div>
        <h2>${e(name)}</h2>
        <p>${icon('pin')} ${e(place)}</p>
        <button type="button" class="group-discovery-interest ${s.interest.includes(String(i))?'is-selected':''}" data-action="interest" data-value="${i}" aria-pressed="${s.interest.includes(String(i))}">${s.interest.includes(String(i))?'✓ Interested':"I'm interested"} ${icon('arrow')}</button>
      </article>`).join('')}
    </div>
    ${!todayUI.memberships.group?`<div class="group-discovery-preview">
      <span>EXPLORE THE PROTOTYPE</span>
      <strong>See what being connected looks like.</strong>
      <p>Switch to fictional member data to explore conversations, people, and upcoming gatherings. This is not a real group sign-up.</p>
      <button type="button" data-action="scenario" data-value="connected">Try the connected demo ${icon('arrow')}</button>
    </div>`:''}
  </div>
  ${footer()}
</section>`;
}
function connectedGroup(){
  // A projection, never an extra inbox, attendance source, or read receipt.
  const x=GX.snapshot(s,todayUI.memberships.group,conversation());
  if(!x.visible)return '';
  const route=(pane,kind,title,detail)=>`<button type="button" class="group-pulse-route" data-action="pane" data-area="group" data-value="${pane}" aria-label="Open ${e(kind)}: ${e(detail)}">
    <span class="group-pulse-route-kind">${e(kind)}</span><strong>${e(title)}</strong><small>${e(detail)}</small><span class="group-pulse-route-arrow" aria-hidden="true">↗</span>
  </button>`;
  return `<section class="group-pulse" aria-label="Your Wednesday Group at a glance">
    <div class="group-pulse-top"><span>YOUR GROUP, TOGETHER.</span><span>LIVE FROM LOCAL SAMPLE DATA</span></div>
    <button type="button" class="group-pulse-feature" data-action="pane" data-area="group" data-value="${x.focus.pane}">
      <span class="group-pulse-eyebrow">${e(x.focus.eyebrow)}</span>
      <strong>${e(x.focus.title)}</strong><span class="group-pulse-detail">${e(x.focus.detail)}</span>
      <span class="group-pulse-feature-cta">${e(x.focus.action)} <span aria-hidden="true">↗</span></span>
    </button>
    <div class="group-pulse-routes" role="group" aria-label="Jump to group activity">
      ${route('chat','CONVERSATION',x.messageLabel,x.status==='unavailable'?'Earlier notes preserved':'Modern group thread')}
      ${route('gather','GATHERING',x.rsvpLabel,wed()+' · 6:30 PM')}
      ${route('prayer','PRAYER',x.prayerCount+' saved sample '+(x.prayerCount===1?'request':'requests'),'Support your people')}
      ${route('people','PEOPLE','8 fictional members','Find someone to encourage')}
    </div>
  </section>`;
}
function group(){
if(!todayUI.memberships.group)return groupBrowse();
if(s.discover)return groupBrowse();
const unreadGroup=s.groupPane==='chat'?0:conversation().unreadCount;
 const opts=[['chat',unreadGroup?`Conversation (${unreadGroup} unread)`:'Conversation'],['people','People'],...(s.groupPane==='direct'?[['direct','Direct message']]:[]),['gather','Gathering'],['prayer','Prayer'],...(canLead('group')?[['leader','Leader tools']]:[])];
let body='';
if(s.groupPane==='chat')body=G.integratedGroupChat({messages:s.groupMessages,escape:e});
if(s.groupPane==='people')body=`<div class="card group-people-card">
  <div class="kicker">YOUR PEOPLE · SAMPLE COMMUNITY</div>
  <h2>Stay connected.</h2>
  <p class="group-people-context">Find someone from your group, say hello, and keep the conversation going between gatherings.</p>
  <div class="group-member-directory">
    ${sampleGroupPeople.map((member,i)=>`<div class="group-member-row">
      <span class="group-member-avatar group-member-avatar--${i+1}" aria-hidden="true">${e(member.initials)}</span>
      <span class="group-member-info"><strong>${e(member.name)}</strong><small>Wednesday Group · fictional member</small></span>
      <button type="button" class="group-member-message" data-action="message-person" data-person="${member.id}" aria-label="Open sample direct conversation with ${e(member.name)}">${icon('message')}<span>Message</span></button>
    </div>`).join('')}
  </div>
  <button type="button" class="group-people-chat-link" data-action="pane" data-area="group" data-value="chat">Open your group conversation ${icon('arrow')}</button>
  <p class="fine-note">Profiles and direct messages here are fictional browser-only data. No messages leave your device.</p>
</div>`;
if(s.groupPane==='direct'){
  const person=sampleGroupPeople.find(p=>p.id===s.directPerson)||sampleGroupPeople[0];
  const messages=Array.isArray(s.directMessages[person.id])?s.directMessages[person.id]:[];
  body=`<div class="card group-direct">
    <div class="kicker">ONE-TO-ONE · LOCAL DEMO ONLY</div>
    <div class="group-direct-heading">
      <span class="group-member-avatar" aria-hidden="true">${e(person.initials)}</span>
      <span><h2>${e(person.name)}</h2><small>Sample direct conversation · never sent</small></span>
    </div>
    ${companionFocus===person.id?`<div class="pa-care-context"><strong>A thoughtful check-in</strong><p>Your companion noticed a fictional group prayer note. Write what feels natural; nothing will be sent to a real person.</p><button type="button" data-action="companion-starter" class="pa-care-starter">Suggest a message</button></div>`:''}
    ${messages.length?`<div class="group-direct-messages">${messages.map(msg=>`<div class="group-direct-bubble"><strong>${e(msg.name)}</strong><p>${e(msg.text)}</p><small>${e(msg.time)}</small></div>`).join('')}</div>`:`<div class="group-direct-empty">${icon('message')}<strong>Start a conversation.</strong><p>Keep in touch with people in your group. This is a private local fixture; no real person will receive it.</p></div>`}
    ${compose('direct','Your sample message','Write something encouraging…')}
    <button type="button" class="text-button group-back" data-action="pane" data-area="group" data-value="people">← Back to people</button>
  </div>`;
}
if(s.groupPane==='gather')body=`<div class="card"><div class="kicker">NEXT GROUP GATHERING · SAMPLE</div><h3>${wed()} · 6:30 PM</h3><p>${e(currentReading().passage)} · ${e(s.question)}</p><p class="group-gather-rsvp" role="status">${s.rsvp==='going'?'You’re going · saved on this device':s.rsvp==='maybe'?'Maybe · saved on this device':'Your response is still open'}</p><div class="actions"><button class="btn ${s.rsvp==='going'?'chosen':'outline'}" data-action="rsvp" data-value="going" aria-pressed="${s.rsvp==='going'}">I'm going</button><button class="btn ${s.rsvp==='maybe'?'chosen':'outline'}" data-action="rsvp" data-value="maybe" aria-pressed="${s.rsvp==='maybe'}">Maybe</button></div><div class="group-gather-next"><span>STAY CONNECTED</span><button type="button" data-action="pane" data-area="group" data-value="chat">Talk with your group ${icon('arrow')}</button><button type="button" data-go="read" data-reading="scripture">Read ${e(currentReading().passage)} ${icon('arrow')}</button></div></div><div class="card"><h3>Connected beyond the semester.</h3><p>Continuity is a proposed model, not an approved policy. Groups may continue through breaks, subject to church leadership decisions.</p></div>`;
if(s.groupPane==='prayer')body=`<div class="card"><div class="kicker">PEOPLE BEFORE POSTS · LOCAL DEMO</div><h3>Pray for one another.</h3><p>Use fictional examples here—do not enter private real requests into this demo.</p>${prayerList()}${compose('prayer','Add a sample prayer request','What can your group pray about?')}<div class="group-prayer-next"><span>CONTINUE THE CONVERSATION</span><button type="button" data-action="pane" data-area="group" data-value="people">Check in with someone ${icon('arrow')}</button></div></div>`;
if(s.groupPane==='leader')body=lead();
return `<section class="group-screen-v07">
  <div class="group-community-hero">
    <div class="group-hero-overline">MY COMMUNITY ${canLead('group')?pill('LEADER VIEW'):''}</div>
    <h1>${canLead('group')&&s.groupPane==='leader'?'Care for<br>your people.':'The people<br>who know you.'}</h1>
    <div class="group-hero-people">
      <span class="group-hero-faces">${sampleGroupPeople.map((member,i)=>`<span class="group-member-avatar group-member-avatar--${i+1}" aria-label="${e(member.name)}">${e(member.initials)}</span>`).join('')}</span>
      <span class="group-hero-count">8 fictional members</span>
      <button type="button" class="group-hero-people-button" data-action="pane" data-area="group" data-value="people" aria-label="See people in your group">${icon('arrow')}</button>
    </div>
    <div class="group-hero-next">${icon('calendar')} ${wed()} · 6:30 PM</div>
    <button type="button" class="group-hero-find" data-action="browse">Explore more groups ${icon('arrow')}</button>
  </div>
  ${H.peopleRail(todayUI,'group')}
  ${H.groupSummary()}
  ${connectedGroup()}
  ${tabs('group',opts,s.groupPane)}${body}${footer()}
</section>`;
}
function team(){
 if(!todayUI.memberships.team)return `<section class="team-screen-v08 team-empty-v08" aria-label="Discover serving">
  <div class="team-v08-hero team-empty-hero">
    <div class="team-v08-kicker">SERVE · CONNECT · BELONG</div>
    <h1>There's room<br>to serve<span>.</span></h1>
    <p class="team-empty-intro">Find a place to make a difference together.</p>
    <div class="team-empty-hero-strip">${icon('team')}<span>Your next step starts here.</span>${icon('arrow')}</div>
  </div>
  <div class="card team-empty-discover">
    <div class="kicker">FIND YOUR TEAM · LOCAL DEMO</div>
    <h2>Make room for connection.</h2>
    <p>No team or assignment belongs to this fixture. Team discovery and joining will be defined in a later phase.</p>
    <div class="team-empty-sample">
      <span>${icon('team')}</span>
      <span><strong>Welcome Team</strong><small>Example of a serving-team experience</small></span>
      ${icon('arrow')}
    </div>
    <button type="button" class="team-empty-try" data-action="scenario" data-value="connected">Try the connected demo ${icon('arrow')}</button>
    <button type="button" class="team-empty-about" data-action="team-preview">About this preview</button>
    <p class="fine-note">This activates fictional data on this device. It does not request a real serving assignment.</p>
  </div>
  ${footer()}
</section>`;
 const opts=[['schedule','My Schedule'],['chat','Team chat'],...(canLead('team')?[['leader','Leader tools']]:[])];let body='';
 const stateLabel=s.teamStatus==='confirmed'?'Confirmed':s.teamStatus==='declined'?'Unable to serve':'Awaiting response';
 const message=s.teamMessages.length?s.teamMessages[s.teamMessages.length-1]:null;
 if(s.teamPane==='schedule')body=`
  <div class="card team-schedule-card">
   <div class="team-card-overline"><span>MY SCHEDULE · SAMPLE</span>${pill(stateLabel)}</div>
   <h2>Your next serve.</h2>
   <div class="team-shift">
     <div class="team-shift-date"><strong>${T.nextEvent(0,9,0).getDate()}</strong><small>SUNDAY</small></div>
     <div class="team-shift-info"><strong>Welcome Team</strong><span>${sun()} · 9:00 AM</span><small>North Campus · demo shift</small></div>
   </div>
   <div class="team-shift-response">
     <span class="team-response-caption">YOUR RESPONSE</span>
     <strong>${stateLabel}</strong>
     <p>This represents a planned sample shift, not recorded attendance.</p>
     ${s.coverage?pill('Coverage requested'):''}
   </div>
   <div class="actions team-shift-actions">
     <button class="btn ${s.teamStatus==='confirmed'?'chosen':'red'}" data-action="shift" data-value="confirmed">${s.teamStatus==='confirmed'?'✓ Serving confirmed':'✓ Confirm serving'}</button>
     <button class="btn outline" data-action="shift" data-value="declined">Can't make it</button>
   </div>
   ${s.teamStatus==='declined'?`<div class="tinted"><p>Need someone to cover your scheduled shift?</p><button type="button" class="btn dark-btn" data-action="cover">${s.coverage?'Withdraw request':'Request coverage ↗'}</button></div>`:''}
  </div>
  <button type="button" class="team-message-preview" data-action="pane" data-area="team" data-value="chat" aria-label="Open Welcome Team conversation">
   <span class="team-message-preview-top">${icon('message')}<span>TEAM CONVERSATION</span>${icon('arrow')}</span>
   <strong>${message?e(message.name):'Your team'}</strong>
   <span class="team-message-preview-text">${message?e(message.text):'Start a conversation with your team.'}</span>
   <span class="team-message-preview-action">OPEN TEAM CHAT ${icon('arrow')}</span>
  </button>
  <div class="card team-huddle"><div class="kicker">THIS SUNDAY</div><h3>Team huddle</h3><p>Arrive at 8:40 AM; huddle begins at 8:45 AM. These are fictional example times.</p><button type="button" class="text-button" data-action="pane" data-area="team" data-value="chat">Coordinate with your team ↗</button></div>`;
 if(s.teamPane==='chat')body=`<div class="card team-chat-card"><div class="kicker">WELCOME TEAM · LOCAL DEMO</div><h2>Stay in the loop.</h2><p>Share relevant updates with the people serving alongside you. Messages stay in this browser.</p>${teamList()}${compose('team','Send a team update','Share an update with your team…')}</div>`;
 if(s.teamPane==='leader')body=`<div class="card team-leader-card"><div class="kicker">AUTHORIZED TEAM LEADER · FIXTURE</div><h2>Care for your team.</h2><p>Review the sample schedule and communication. A confirmed shift is not proof of attendance.</p><div class="team-leader-status"><strong>Coverage requests</strong><span>${s.coverage?'One sample coverage request':'No active sample requests'}</span></div><button type="button" class="btn red" data-action="pane" data-area="team" data-value="chat">Open team conversation ${icon('arrow')}</button></div><div class="card"><h3>Follow-up needs human judgment.</h3><p>The proposed future leader system requires approved definitions, actual participation records, restricted access, and a clear pastoral follow-up process before real alerts can be enabled.</p></div>`;
 return `<section class="team-screen-v08">
  <div class="team-v08-hero">
   <div class="team-v08-kicker">YOUR PEOPLE · YOUR PURPOSE</div>
   <h1>Serve<br>together<span>.</span></h1>
   <div class="team-v08-hero-row"><span>${icon('team')}</span><strong>Welcome Team</strong><small>North Campus · fictional team</small></div>
   <span class="team-v08-wave" aria-hidden="true"></span>
  </div>
  ${tabs('team',opts,s.teamPane)}${body}${footer()}
 </section>`;
}
function read(){
 const plan=currentReading();
 return `<section class="read-screen-v09">
   <div class="read-v09-hero"><div class="read-v09-overline">READ · REFLECT · REMEMBER · LIVE</div><h1>In the<br>Word<span>.</span></h1><p>Scripture for your heart, your everyday life, and the people around you.</p></div>
   <nav class="read-journey-nav" aria-label="Scripture journey">
     <button type="button" data-go="read" data-reading="scripture"><span>01</span><strong>Read</strong><small>Begin with the Word</small></button>
     <button type="button" data-go="read" data-reading="questions"><span>02</span><strong>Reflect</strong><small>Consider & connect</small></button>
     <button type="button" data-go="read" data-reading="memorize"><span>03</span><strong>Remember</strong><small>Practice the passage</small></button>
     <button type="button" data-go="read" data-reading="prayer"><span>04</span><strong>Live</strong><small>Put love in motion</small></button>
   </nav>
   <div class="read-focus-card">
     <div class="read-focus-head"><span>01 / READ · YOUR READING PATH · SAMPLE</span>${icon('read')}</div>
     <h2>Start with Scripture.</h2><p>${e(plan.title)} · ${e(plan.name)}</p><div class="read-focus-detail"><strong>${e(plan.passage)}</strong><small>${e(plan.description)}</small></div>
   </div>
   <section class="card read-scripture-card read-reader" id="reading-scripture" tabindex="-1" aria-label="Scripture reading">
     <div class="read-section-label">${icon('read')} <span>01 / READ · BEREAN STANDARD BIBLE</span><i></i></div>
     <div class="read-reader-top"><div><span class="read-reader-eyebrow">TODAY'S SCRIPTURE FOCUS</span><h2>${e(plan.passage)}</h2></div><span class="read-reader-translation">BSB</span></div>
     <div class="read-reader-controls" role="group" aria-label="Reading preferences">
       <button type="button" data-action="reader-size" aria-pressed="${s.readerPreferences.size==='large'}" aria-label="Toggle larger Scripture text">Aa <span>${s.readerPreferences.size==='large'?'Standard size':'Larger text'}</span></button>
       <button type="button" data-action="reader-highlight" aria-pressed="${!!s.readerPreferences.highlighted[s.plan]}" aria-label="Highlight this Scripture excerpt">${s.readerPreferences.highlighted[s.plan]?'★ Highlighted':'☆ Highlight'}</button>
     </div>
     <div class="read-reader-page ${s.readerPreferences.size==='large'?'read-reader-page--large':''} ${s.readerPreferences.highlighted[s.plan]?'read-reader-page--highlighted':''}">
       <span class="read-reader-verse-number">SCRIPTURE EXCERPT</span>
       <blockquote>${e(plan.excerpt)}</blockquote>
       <span class="read-reader-page-end" aria-hidden="true">✦</span>
     </div>
     <div class="read-reader-note">
       <label for="reader-note">Your private reflection <small>Saved on this device</small></label>
       <textarea id="reader-note" rows="3" maxlength="1200" placeholder="What stands out to you in these words?">${e(s.readerNotes[s.plan]||'')}</textarea>
       <div class="read-reader-note-actions"><button type="button" data-action="reader-save-note">Save reflection</button><button type="button" class="btn ${s.read?'chosen':'red'}" data-action="read">${s.read?'✓ Read today':'Mark as read'}</button></div>
     </div>
     <p class="fine-note">Berean Standard Bible excerpt · Sample reading, not a full chapter or assigned calendar. Notes remain in this browser; avoid sensitive information on shared devices.</p>
   </section>
   <section class="card read-question-card read-reflect" id="reading-questions" tabindex="-1">
     <div class="read-section-label">${icon('message')} <span>02 / REFLECT · GUIDED PRACTICE</span><i></i></div>
     <span class="read-reflect-eyebrow">FROM WORDS TO LIFE</span>
     <h2>Let it stay with you.</h2>
     <p class="read-reflect-question">${e(s.question)}</p>
     <div class="read-reflect-prompts" role="group" aria-label="Choose a reflection prompt">
       ${[['notice','NOTICE'],['meaning','CONSIDER'],['action','RESPOND']].map(([id,label])=>`<button type="button" data-action="reflect-prompt" data-value="${id}" aria-pressed="${s.reflectionPrompt===id}">${label}</button>`).join('')}
     </div>
     <div class="read-reflect-guidance">
       <span>YOUR REFLECTION PROMPT</span>
       <p>${e(({sermon:{notice:'Which words stand out to you?',meaning:'What does loving one another look like in this passage?',action:'Who could you encourage with a small act of love this week?'},study:{notice:'What instruction or contrast catches your attention?',meaning:'How does hearing differ from doing in this verse?',action:'What is one concrete step you can take today?'},year:{notice:'What image in this passage feels most vivid?',meaning:'What does this excerpt suggest about guidance and rest?',action:'Where might you make space for rest or offer care today?' }[s.plan]||{})[s.reflectionPrompt]||'What stands out to you in these words?')}</p>
     </div>
     <label class="read-reflect-label" for="reflection-response">Your response <small>Private · saved on this device</small></label>
     <textarea id="reflection-response" rows="3" maxlength="1200" placeholder="Write a thought, a prayer, or one small next step...">${e(s.reflectionResponses[s.plan]||'')}</textarea>
     <div class="read-reflect-actions">
       <button type="button" class="read-reflect-save" data-action="reflect-save">Save my reflection</button>
       <button type="button" class="read-discuss-action" data-go="group" data-pane="chat">${icon('group')} Open group conversation ${icon('arrow')}</button>
     </div>
     <p class="fine-note">Prompts are prewritten sample guidance, not AI-generated interpretation or official Citizen Church teaching. Your private response is never posted to the group automatically.</p>
     ${H.rhythmEditor(s,plan)}
   </section>
   ${canLead('group')?`<section class="card read-leader-card">
     <div class="read-section-label">${icon('leader')} <span>GROUP LEADER · LOCAL DEMO</span></div>
     <h2>Shape the conversation.</h2><p>Choose a sample pathway. Changes stay on your device; nothing is published to a real group or church.</p>
     <div class="read-plan-choices" role="group" aria-label="Reading pathway">
       ${[['sermon','Sermon Series'],['study','Book Study'],['year','Bible in One Year']].map(([id,label])=>`<button type="button" class="read-plan-button ${s.plan===id?'selected':''}" data-action="plan" data-value="${id}" aria-pressed="${s.plan===id}">${label}</button>`).join('')}
     </div>
     <label for="question">Sample group discussion question</label><textarea id="question" rows="3" maxlength="400">${e(s.question)}</textarea>
     <button type="button" class="btn dark-btn" data-action="question">Save local question</button>
     <p class="fine-note">Real publishing permissions, content review, group overrides, and licensing remain undecided.</p>
   </section>`:''}
   <div class="read-memory-heading" id="reading-memory-intro" tabindex="-1"><span>03 / REMEMBER</span><h2>Make it memorable.</h2><p>Practice the same Scripture you just read. Start with this week's passage, or explore a bonus verse.</p></div>
   <div class="read-memory-bridge">
     <span>YOUR READING → YOUR MEMORY CHALLENGE</span>
     <div><strong>${e(plan.passage)}</strong><small>${e(plan.title)}</small></div>
     <button type="button" data-action="read-practice-current">Practice this passage ${icon('arrow')}</button>
     <p>Opens the classic VersePlay word puzzle below. Blank Battle remains a separate featured game with its own sample verse.</p>
   </div>
   <section class="rp-game-entry" aria-label="VersePlay Blank Battle">
      <div class="rp-game-entry-top"><span>VERSEPLAY · FEATURED GAME</span><span aria-hidden="true">✳</span></div>
      <h2>Make the words<br><em>click.</em></h2>
      <p>Five missing words. One verse to remember. Play a quick round of Blank Battle.</p>
      <button type="button" class="rp-game-entry-play" data-go="play" aria-label="Play Blank Battle">${icon('check')} PLAY BLANK BATTLE ${icon('arrow')}</button>
      <small>Private, on-device puzzle · No online opponents</small>
   </section>
   <div class="rp-game-classic-label"><strong>MORE WAYS TO PRACTICE</strong><span>Classic &amp; two-player pass-and-play</span></div>
   ${VP.render(s,e,icon)}

   <div class="read-live-heading" id="reading-prayer" tabindex="-1"><span>04 / LIVE</span><h2>Take it beyond the page.</h2><p>Choose someone to encourage or take a quiet moment to pray. Small actions matter.</p></div>
   <div class="card read-prayer-card"><div>${icon('heart')}<h3>A moment to pray.</h3><p>Take a minute to pray for someone in your group.</p></div>
     <button type="button" class="round ${s.prayed?'done':''}" aria-label="Mark prayer time" data-action="pray">${s.prayed?'✓':'↗'}</button>
   </div>${footer()}
 </section>`;
}
function play(){
 return `<section class="rp-play-screen" aria-label="VersePlay Blank Battle game">
   <div class="rp-play-toolbar"><button type="button" class="rp-play-back" data-go="read" aria-label="Back to Read">← Back to Read</button><span>VERSEPLAY · SOLO GAME</span></div>
   <div id="rp-blankbattle-host" class="rp-blankbattle-host"></div>
   <p class="rp-play-note">This is a local game preview. Your puzzle progress is saved in this browser, separately from church activity.</p>
 </section>`;
}
function mountBlankBattle(){
 const host=$('rp-blankbattle-host');
 if(!host||!window.RallyBlankBattle)return;
 const shadow=host.attachShadow({mode:'open'});
 shadow.innerHTML=`<link rel="stylesheet" href="blank-battle.css">
 <style>
 :host{display:block;--night:#111219;--panel:#171922;--cream:#f9f7eb;--lime:#dfff00;--aqua:#24bcae;--muted:#a6a9b5;--line:#46515b;--red:#ed2850;color:var(--cream);font-family:Manrope,system-ui,-apple-system,sans-serif}
 .bb-app{font-family:Manrope,system-ui,-apple-system,sans-serif;color:var(--cream);background:transparent;padding:3px 0 20px;min-width:0;max-width:none}
 .bb-heading{margin:13px 0 14px}
 .bb-heading h1{font-size:clamp(36px,9.2vw,53px)}
 .bb-reset{font-size:11px;padding:7px 10px}
 .bb-identity{margin-bottom:13px}
 .bb-board{padding:17px 12px 19px;border-radius:22px}
 .bb-verse{font-size:clamp(16px,4.5vw,21px);line-height:2.75}
 .bb-slot{min-width:58px;min-height:41px;padding:4px 8px}
 .bb-ref{gap:6px;margin-bottom:12px;font-size:13px}
 .bb-ref strong{font-size:15px;padding:7px 12px}
 .bb-tiles{gap:12px 8px}
 .bb-tile{min-width:66px;min-height:48px;font-size:15px;padding:10px 14px}
 .bb-bank{margin-top:21px}
 .bb-actions{margin-top:21px}
 .bb-hint{min-width:83px;font-size:11px}
 .bb-footer{margin-bottom:0}
 @media(max-width:350px){.bb-verse{font-size:15px}.bb-tile{font-size:14px;padding:10px 11px;min-width:59px}.bb-slot{min-width:54px}.bb-heading h1{font-size:37px}}
 </style>
 <div class="bb-app" id="bb-app"><div class="bb-heading"><div><div class="bb-eyebrow"><span class="bb-live"></span> THE MEMORY ARCADE</div><h1>Memorize<span>.</span></h1></div><button type="button" class="bb-reset" data-action="reset" aria-label="Restart this round"><span aria-hidden="true">↺</span> Reset</button></div><div class="bb-identity" aria-label="Game mode"><strong>BLANK BATTLE</strong><span class="bb-identity-rule" aria-hidden="true"></span><span>WORD PUZZLE</span></div><section class="bb-game" aria-label="Fill in the Scripture"><div id="bb-screen"></div></section><p class="bb-footer">LOCAL PUZZLE · BEREAN STANDARD BIBLE</p></div>`;
 window.RallyBlankBattle.mount(shadow.querySelector('#bb-app'));
}
function footer(){return `<p class="disclaimer">RallyPoint Phase 1 · Interactive sample data only. Nothing is sent to other people, church systems, or notifications.</p>`}
function render(){
const view=$('view'),position=view.scrollTop;
view.querySelectorAll('textarea').forEach(field=>{drafts[field.id]=field.value});
if(!['today','group','team','read','play'].includes(s.view))s.view='today';
if(s.role!=='leader'){if(s.groupPane==='leader')s.groupPane='chat';if(s.teamPane==='leader')s.teamPane='schedule';}
save();
const hybridShell=document.querySelector('.phone-inner');
hybridShell.classList.add('premium-alive');
hybridShell.classList.toggle('is-f09-dashboard',f09Preview&&s.view==='today');
hybridShell.classList.toggle('is-f09-board',f09Board&&s.view==='today');
hybridShell.classList.toggle('is-f10-lab',f10Preview&&s.view==='today');
hybridShell.classList.toggle('is-leader-hybrid',s.view==='group'&&s.groupPane==='leader'&&canLead('group'));
document.querySelector('.phone-inner').classList.toggle('is-fluid-today',s.view==='today');
 document.querySelector('.phone-inner').classList.toggle('is-groups-v07',s.view==='group');
 document.querySelector('.phone-inner').classList.toggle('is-team-v08',s.view==='team');
 document.querySelector('.phone-inner').classList.toggle('is-read-v09',s.view==='read'||s.view==='play');
 document.querySelector('.phone-inner').classList.toggle('is-play-v08',s.view==='play');
 // Opening the actual thread advances its cursor before the shared overview is drawn.
// Today and other Group panes remain strictly read-only; malformed snapshots are refused.
if(s.view==='group'&&s.groupPane==='chat'&&todayUI.memberships.group){
  try{window.RallyConversationRead?.markRead({storage:localStorage,domain:window.RallyChatDomain,member:true});}catch(_){}
}
view.innerHTML=(storageWarning?`<p class="storage-notice" role="status">${e(storageWarning)}</p>`:'')+(s.view==='today'?(f09Preview?f09Today():today()):s.view==='group'?group():s.view==='team'?team():s.view==='play'?play():read());
if(s.view==='play')mountBlankBattle();
view.querySelectorAll('textarea').forEach(field=>{if(drafts[field.id]!==undefined)field.value=drafts[field.id]});
if(s.view==='group'&&s.groupPane==='chat'&&todayUI.memberships.group&&$('rpx-chat')){
  const root=$('rpx-chat'),Chat=window.RallyWednesdayChat,Domain=window.RallyChatDomain;
  if(Chat&&Domain&&typeof Domain.createMockAccessPolicy==='function'){
    // This is a demo-only access-policy fixture; NO production authentication.
    const policy=Domain.createMockAccessPolicy({
      actors:[{id:'u_you',organizationId:'citizen_demo',role:'member',fixtureVerified:true}],
      groupMemberships:[{userId:'u_you',organizationId:'citizen_demo',
        scopeId:'wed',status:todayUI.memberships.group?'active':'revoked'}]
    });
    const authorize=action=>!!todayUI.memberships.group&&policy.evaluate({
      actorId:'u_you',resource:{id:'group_wednesday',kind:'group_thread',
        organizationId:'citizen_demo',groupId:'wed'},action
    }).allowed===true;
    Chat.mount(root,{authorize});
    // A view visit is a read event even before a second chat rerender.
    // The shared adapter preserves draft/reply fields and refuses malformed storage.
    if(authorize('read')){
      window.RallyConversationRead?.markRead({
        storage:localStorage,domain:Domain,member:todayUI.memberships.group
      });
    }
  }else{
    const note=root.querySelector('#lab-error');
    if(note){note.hidden=false;note.textContent='The new fictional conversation could not load. Your earlier saved messages remain available below.';}
  }
}
$('nav').innerHTML=[['today','Today','home'],['group','Groups','group'],['team','Team','team'],['read','Read','read']].map(([id,label,glyph])=>`<button type="button" class="${s.view===id||(s.view==='play'&&id==='read')?'active':''}" data-go="${id}" ${s.view===id||(s.view==='play'&&id==='read')?'aria-current="page"':''}>${icon(glyph)}<small>${label}</small></button>`).join('');

$('profile-initials').textContent=(todayUI.name||'Jonathan').split(/\s+/).map(v=>v[0]).join('').slice(0,2).toUpperCase();
const snapshot=T.snapshot(s,todayUI,new Date(),conversation());$('activity-dot').hidden=!snapshot.attention&&!snapshot.leader;
view.scrollTop=position;
}
function navigate(view,pane,reading){
closeDialog(false);
s.view=view;
if(view!=='today')f09Feedback='';
if(view==='today'&&f09Preview)f09Index=0;
if(view==='group'){
s.discover=false;if(pane)s.groupPane=pane;
if(pane==='leader'&&!(s.role==='leader'&&todayUI.memberships.group))s.groupPane='chat';
}
if(view==='team'&&pane)s.teamPane=pane;
render();$('view').scrollTop=0;
const focus=reading?$('reading-'+reading):$('view').querySelector('h1');
if(focus){focus.tabIndex=-1;focus.focus({preventScroll:true});if(reading)focus.scrollIntoView?.({block:'start',behavior:'auto'});}
}
function closeDialog(restore=true){
if(!dialog)return;if(dialog==='f10-companion')f10ClearSession();dialog=null;$('dialog-root').innerHTML='';document.querySelector('.phone-inner').inert=false;
if(restore){if(dialogTrigger?.isConnected)dialogTrigger.focus({preventScroll:true});else $('view').focus({preventScroll:true});}
}
function showDialog(type,trigger=document.activeElement){dialogTrigger=trigger;dialog=type;renderDialog();}
function renderDialog(){
let title='',body='';const chat=conversation(),snapshot=T.snapshot(s,todayUI,new Date(),chat);
if(dialog==='f10-companion'&&f10Preview){
 title='Ask Rally.';
 const now=new Date(),model=window.RallySmartDashboard.model({
   state:s,ui:todayUI,conversation:chat,now,today:T,
   companion:window.RallyCompanionDecision,passage:currentReading().passage
 });
 const board=window.RallyPriorityBoard.derive(model,now);
 f10Active=window.RallyPersonalCompanion.respond(f10Prompt,{model,board,now,goalMode:f103Preview},f10Prior);
 body=window.RallyPersonalCompanion.render(
   f10Active.response,f10Asked,f10Notice,f10Turns,f10Active.suggestions
 );
}
if(dialog==='demo-controls'){
title='Your local preview';body=`<p><strong>Rally Point · Phase 1</strong><br>Fictional people, messages and schedules. No account or integration is connected.</p><form data-form="demo-name" class="rp-stack"><label class="demo-field" for="demo-name">First name for this demo<input id="demo-name" name="name" maxlength="20" value="${e(todayUI.name)}" autocomplete="nickname" required></label><button type="submit" class="btn red">Save local name</button></form><div class="demo-section"><h3>Role preview</h3><button type="button" id="role" class="role" aria-label="Toggle member or leader preview">${s.role==='leader'?'Leader demo · Switch to member':'Member demo · Try leader tools'}</button><p class="fine-note">This grants fixture permissions only for Wednesday Group and Welcome Team when you belong to them. It is not a real account, authority grant or secure backend.</p></div><div class="demo-section"><h3>Try a Today state</h3><div class="rp-stack"><button type="button" class="demo-option" data-action="scenario" data-value="connected"><span>${icon('group')}</span><span><strong>Connected & actionable</strong><small>Group update and a pending serving response.</small></span></button><button type="button" class="demo-option" data-action="scenario" data-value="caught-up"><span>${icon('check')}</span><span><strong>All caught up</strong><small>Acknowledge updates and confirm the sample schedule.</small></span></button><button type="button" class="demo-option" data-action="scenario" data-value="no-memberships"><span>${icon('heart')}</span><span><strong>No group or team yet</strong><small>Welcoming empty state with Scripture and discovery paths.</small></span></button></div><p class="fine-note">Fixture controls change your local sample response and Today memberships. Your messages, prayer posts, RSVP and saved leader/reading choices are kept.</p></div><div class="demo-section"><h3>Today dashboard experiment</h3><p class="fine-note">Explore F-09 with the same fictional people, group, serving and Scripture data. This preview does not replace the approved Today screen.</p><a href="?f10=1&skipWelcome=1">Open F-10 Ask Rally lab</a> · <a href="?f09=board&skipWelcome=1">Open Smart Priority Board</a> · <a href="?f09=1&skipWelcome=1">Compare Smart Stack</a> · <a href="./">Approved Today</a></div><div class="demo-section"><h3>Welcome experience</h3><a href="?welcome=1" class="activity-item rp-replay-welcome">${icon('arrow')}<span><strong>Replay animated welcome</strong><small>Splash → Welcome → Log In or Campus → your existing Rally Point demo</small></span>${icon('arrow')}</a><p class="fine-note">Replaying onboarding won’t erase saved fictional messages, reading progress or schedule responses. Real sign-in is not connected.</p></div><div class="demo-section"><p class="fine-note">The working name and branding remain provisional. Local browser storage is not secure member storage. Please use fictional content.</p><a href="premium-hybrid-archive.html">Open the preserved Citizen Connect demo</a></div>`;
}
if(dialog==='quick-actions'){
 title='Make your next move';body=`<p>Quick actions from your current Rally Point demo. Select one to open its existing feature.</p><div class="rp-stack">${todayUI.memberships.group?`<button type="button" class="activity-item" data-go="group" data-pane="chat">${icon('group')}<span><strong>Your group</strong><small>Open the Wednesday Group conversation</small></span>${icon('arrow')}</button>`:`<button type="button" class="activity-item" data-go="group">${icon('group')}<span><strong>Find a group</strong><small>Explore community</small></span>${icon('arrow')}</button>`}${todayUI.memberships.team?`<button type="button" class="activity-item" data-go="team" data-pane="schedule">${icon('team')}<span><strong>Your serving schedule</strong><small>See the upcoming sample shift</small></span>${icon('arrow')}</button>`:''}<button type="button" class="activity-item" data-go="read" data-reading="scripture">${icon('read')}<span><strong>Today’s Scripture</strong><small>Read John 15:9–12</small></span>${icon('arrow')}</button></div>`;
 }
 if(dialog==='notifications'){
title='What needs your attention';body=`<p>Activity from the same local group and schedule fixtures shown on Today. No real notifications are sent.</p><div class="rp-stack">${snapshot.unread?`<button type="button" class="activity-item" data-go="group" data-pane="chat">${icon('message')}<span><strong>A group update</strong><small>Open Wednesday Group’s conversation.</small></span>${icon('arrow')}</button>`:''}${snapshot.pending?`<button type="button" class="activity-item" data-go="team" data-pane="schedule">${icon('confirm')}<span><strong>Your serving response</strong><small>Let the Welcome Team know your availability.</small></span>${icon('arrow')}</button>`:''}${snapshot.leader?`<button type="button" class="activity-item" data-go="group" data-pane="leader">${icon('leader')}<span><strong>Group leader check-ins</strong><small>${snapshot.leader.remaining.length} sample entries are awaiting review.</small></span>${icon('arrow')}</button>`:''}${!snapshot.attention&&!snapshot.leader&&chat.status!=='unavailable'?`<div class="today-empty">${icon('check')}<div><h3>You’re all caught up.</h3><p>Nothing needs your response in this fixture.</p></div></div>`:''}${chat.status==='unavailable'?`<p role="status">The fictional group conversation could not be read. Open Groups to review your saved messages.</p>`:''}</div>`;
}
if(dialog==='memorize-preview'){
title='Memorize · Phase 2 preview';body=`<p>The memorization exercise is not part of this Today-screen phase. This is a labeled preview, not a completed practice or progress record.</p><div class="phase-placeholder"><strong>${e(currentReading().passage)} · BSB excerpt</strong><blockquote>“${e(currentReading().excerpt)}”</blockquote></div><button type="button" class="btn red" data-go="read" data-reading="scripture">Open the existing reading</button><p class="fine-note">KJV text is public domain in the United States. Translation choice and full reading-plan scope remain later-phase decisions.</p>`;
}
if(dialog==='team-preview'){
title='A place on a team';body=`<p>This fixture has no team membership or serving assignments. Team discovery and joining are later-phase work; no sign-up or request is sent here.</p><button type="button" class="btn red" data-go="today">Back to Today</button><p class="fine-note">Switch to the Connected fixture in Demo controls to try the existing schedule and team conversation.</p>`;
}
const wasConversation=dialog==='f10-companion'&&!!$('dialog-root').querySelector('.f10-panel');
$('dialog-root').innerHTML=`<div class="rp-backdrop" data-dismiss="dialog"><section class="rp-sheet" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><div class="rp-sheet-top"><h2 id="dialog-title">${title}</h2><button type="button" class="rp-close" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div>${body}</section></div>`;
document.querySelector('.phone-inner').inert=true;
if(wasConversation){
 const heading=$('dialog-root').querySelector('.f10-response h3');
 if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView?.({block:'nearest',behavior:'auto'});}
}else $('dialog-root').querySelector('[data-action="close-dialog"]').focus({preventScroll:true});
}
function f10Ask(question){
 if(!f10Preview||dialog!=='f10-companion'||s.view!=='today')return;
 const text=String(question||'').trim().slice(0,160);
 if(!text){f10Notice='Enter a question or select one of the suggestions.';renderDialog();return;}
 if(f10Active&&f10Asked){
   f10Turns.push({asked:f10Asked,heading:f10Active.response.heading,intro:f10Active.response.intro});
   f10Turns=f10Turns.slice(-3);
 }
 f10Prior=f10Active?.context||{};
 f10Prompt=text;f10Asked=window.RallyPersonalCompanion.followKeys[text]||text;f10Notice='';
 renderDialog();
}
function notify(text){const x=$('toast');x.textContent=text;x.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>x.hidden=true,2600)}
document.addEventListener('click',ev=>{
const b=ev.target.closest('button');if(!b)return;
if(b.type==='submit'&&b.form)return;
if(b.id==='role'){s.role=s.role==='leader'?'member':'leader';s.groupPane='chat';s.teamPane='schedule';render();renderDialog();notify(s.role==='leader'?'Scoped leader fixture enabled':'Member fixture enabled');return}
if(b.dataset.go){navigate(b.dataset.go,b.dataset.pane||((b.dataset.leader)?'leader':''),b.dataset.reading);return}
const a=b.dataset.action,v=b.dataset.value||'',person=b.dataset.person;
if(f09Preview&&!f09Board&&s.view==='today'&&a==='f09-stack'){
 const m=window.RallySmartDashboard.model({
   state:s,ui:todayUI,conversation:conversation(),now:new Date(),today:T,
   companion:window.RallyCompanionDecision,passage:currentReading().passage
 });
 if(!m.stack.length)return;
 f09Index=(f09Index+(v==='prev'?-1:1)+m.stack.length)%m.stack.length;
 render();return;
}
if(f09Preview&&s.view==='today'&&a==='f09-rsvp'){
 if(!todayUI.memberships.group)return;
 s.rsvp='going';f09Index=0;if(f09Board)f09Feedback='Sample group RSVP saved. The board has updated.';render();
 notify('Sample RSVP saved on this device.');return;
}
if(f09Preview&&s.view==='today'&&a==='f09-serve'){
 if(!todayUI.memberships.team)return;
 s.teamStatus='confirmed';s.coverage=false;
 s.teamMessages=s.teamMessages.filter(x=>!x.coverage);
 f09Index=0;if(f09Board)f09Feedback='Sample serving response saved. The board has updated.';render();
 notify('Sample serving availability confirmed locally.');return;
}
if(f10Preview&&s.view==='today'&&a==='f10-open'){
 f10ClearSession();showDialog('f10-companion',b);return;
}
if(f10Preview&&dialog==='f10-companion'&&a==='f10-ask'){
 if(!window.RallyPersonalCompanion.prompts.some(x=>x.id===v))return;
 f10Ask(v);return;
}
if(f10Preview&&dialog==='f10-companion'&&a==='f10-followup'){
 if(!Object.prototype.hasOwnProperty.call(window.RallyPersonalCompanion.followKeys,v))return;
 f10Ask(v);return;
}
if(f10Preview&&dialog==='f10-companion'&&a==='f10-confirm'&&s.view==='today'){
 if(v==='rsvp'&&todayUI.memberships.group&&!s.rsvp){
   s.rsvp='going';f10Notice='Your sample RSVP is now Going. Nothing was sent to a church system.';
 }else if(v==='serve'&&todayUI.memberships.team&&s.teamStatus==='pending'){
   s.teamStatus='confirmed';s.coverage=false;
   s.teamMessages=s.teamMessages.filter(x=>!x.coverage);
   f10Notice='Your sample serving availability is now Confirmed on this device.';
 }else{f10Notice='That sample action is already handled or unavailable for this profile.';}
 f09Feedback='';render();renderDialog();return;
}
if(a==='memorize-preview'){navigate('read',null,'memorize');return}
if(['notifications','demo-controls','team-preview','quick-actions'].includes(a)){showDialog(a,b);return}
if(a==='close-dialog'){closeDialog();return}
if(a==='scenario'){
f09Feedback='';
todayUI.memberships={group:v!=='no-memberships',team:v!=='no-memberships'};
if(v==='connected'){s.teamStatus='pending';}
if(v==='caught-up'){s.teamStatus='confirmed';s.coverage=false;s.teamMessages=s.teamMessages.filter(m=>!m.coverage);
  // The demo control acknowledges the real modern cursor; it does not touch legacy messages.
  try{window.RallyConversationRead?.markRead({storage:localStorage,domain:window.RallyChatDomain,member:todayUI.memberships.group});}catch(_){}
 }
s.view='today';closeDialog(false);render();$('view').scrollTop=0;notify('Local Today fixture updated. No data was sent.');return;
}
if(a==='read-practice-current'){s.memoryActive=s.plan;s.memoryMode='solo';s.memoryTarget=null;s.memoryPassTurn=1;render();const game=$('reading-memorize');if(game){game.focus({preventScroll:true});game.scrollIntoView({block:'start',behavior:'smooth'});}return;}
if(a==='memory-mode'){
 if(!['solo','pass'].includes(v))return;
 s.memoryMode=v;s.memoryPassTurn=1;s.memoryTarget=null;render();return;
}
if(a==='memory-challenge'){
 s.memoryActive=v==='romans'?'romans':s.plan;
 s.memoryTarget=null;s.memoryPassTurn=1;render();return;
}
if(a==='memory-slot'){
 const key=['sermon','study','year','romans'].includes(s.memoryActive)?s.memoryActive:s.plan;
 const scope=key+':'+(s.memoryMode==='pass'?'p'+s.memoryPassTurn:'solo'),slot=Number(v);
 const g=M.normalize(s.memoryGames[scope],key);
 if(g.solved)return;
 if(Number.isInteger(slot)&&slot>=0&&slot<5){
   if(g.slots[slot])s.memoryGames[scope]=M.clear(g,key,slot);
   s.memoryTarget=slot;render();
 }
 return;
}
if(['memory-pick','memory-check','memory-hint','memory-reset','memory-next-player','memory-new-duel'].includes(a)){
 const key=['sermon','study','year','romans'].includes(s.memoryActive)?s.memoryActive:s.plan;
 const scope=key+':'+(s.memoryMode==='pass'?'p'+s.memoryPassTurn:'solo');
 const g=M.normalize(s.memoryGames[scope],key);
 if(a==='memory-next-player'){
   if(s.memoryMode==='pass'&&s.memoryPassTurn===1&&g.solved){s.memoryPassTurn=2;s.memoryTarget=null;render();}
   return;
 }
 if(a==='memory-new-duel'){
   for(const who of [1,2]){const k=key+':p'+who;s.memoryGames[k]=M.reset(s.memoryGames[k],key)}
   s.memoryPassTurn=1;s.memoryTarget=null;render();return;
 }
 if(a==='memory-reset'){s.memoryGames[scope]=M.reset(g,key);s.memoryTarget=null;render();return;}
 if(a==='memory-hint'){s.memoryGames[scope]=M.hint(g,key);s.memoryTarget=null;render();return;}
 if(a==='memory-pick'){
   const target=Number.isInteger(s.memoryTarget)&&s.memoryTarget>=0&&s.memoryTarget<5?s.memoryTarget:undefined;
   const next=M.pick(g,key,v,target);
   s.memoryGames[scope]=next;s.memoryTarget=next.slots.indexOf(null);render();return;
 }
 if(a==='memory-check'){
   const outcome=M.check(g,key);s.memoryGames[scope]=outcome.state;s.memoryTarget=outcome.state.slots.indexOf(null);
   render();if(outcome.status==='complete')notify('Verse complete — nicely done!');return;
 }
}
if(a==='rhythm-save'){
 if(s.view!=='read')return;
 const text=$('rhythm-input')?.value.trim().slice(0,160)||'';
 if(!text){notify('Choose one small action before saving.');return;}
 const now=new Date(),next=new Date(now);
 next.setDate(next.getDate()+1);next.setHours(0,0,0,0);
 s.rhythm={text,passage:currentReading().passage,savedAt:now.toISOString(),followUpAt:next.toISOString(),completedAt:null};
 delete drafts['rhythm-input'];
 render();notify('Your step is saved locally for tomorrow.');return;
}
if(a==='rhythm-clear'){
 if(s.view!=='read')return;
 s.rhythm={};delete drafts['rhythm-input'];
 render();notify('Local step cleared.');return;
}
if(a==='rhythm-complete'){
 if(typeof s.rhythm?.text!=='string'||!s.rhythm.text.trim()||s.rhythm.completedAt)return;
 if(!Number.isFinite(Date.parse(s.rhythm.followUpAt))||Date.parse(s.rhythm.followUpAt)>Date.now())return;
 s.rhythm.completedAt=new Date().toISOString();
 render();notify('You marked your step complete.');return;
}
if(a==='rhythm-defer'){
 if(typeof s.rhythm?.text!=='string'||!s.rhythm.text.trim()||s.rhythm.completedAt)return;
 if(!Number.isFinite(Date.parse(s.rhythm.followUpAt))||Date.parse(s.rhythm.followUpAt)>Date.now())return;
 const now=new Date(),next=new Date(now);next.setDate(next.getDate()+1);next.setHours(0,0,0,0);
 s.rhythm.followUpAt=next.toISOString();render();notify('Your step will reappear next time you open Rally Point tomorrow.');return;
}
if(a==='companion-later'){
  // Only defer the currently displayed, source-backed fictional suggestion.
  // This does not mark unread as read, submit an RSVP, or alter anyone's data.
  const current=window.RallyCompanionDecision?.choose({
    state:s,ui:todayUI,conversation:conversation(),now:new Date()
  });
  if(!current?.deferable||current.id!==v)return;
  s.companionChoices.snoozedUntil[v]=new Date(Date.now()+24*60*60*1000).toISOString();
  render();notify('Idea deferred on this device for a day.');return;
}
if(a==='companion-snooze'){
  if(!todayUI.memberships.group)return;
  s.companionCare.marcus={...(s.companionCare.marcus||{}),snoozedUntil:new Date(Date.now()+24*60*60*1000).toISOString()};
  render();notify('This fictional suggestion will return in about a day.');return;
}
if(a==='companion-encourage'){
  if(!todayUI.memberships.group||!s.prayers.some(p=>p?.name==='Marcus C.'))return;
  companionFocus='marcus';s.directPerson='marcus';navigate('group','direct');return;
}
if(a==='companion-starter'){
  if(companionFocus!=='marcus'||s.groupPane!=='direct'||s.directPerson!=='marcus')return;
  const field=$('direct-input');
  if(field){field.value='Hey Marcus, I saw your note in our group. Thinking of you and praying for you.';field.focus();}
  return;
}
if(a==='hybrid-person'){if(!todayUI.memberships.group)return;const member=sampleGroupPeople.find(p=>p.id===person);if(!member)return;s.directPerson=member.id;navigate('group','direct');return;}
if(a==='message-person'){if(!todayUI.memberships.group)return;const member=sampleGroupPeople.find(p=>p.id===person);if(!member)return;s.directPerson=member.id;s.groupPane='direct';render();return}
 if(a==='pane'){if(v==='leader'&&!canLead(b.dataset.area))return;if(b.dataset.area==='group')s.groupPane=v;else s.teamPane=v;render();return}
if(a==='browse'){s.discover=!s.discover;render();return}
if(a==='rsvp'){s.rsvp=s.rsvp===v?'':v;render();notify('Sample RSVP updated');return}
if(a==='interest'){s.interest=s.interest.includes(v)?s.interest.filter(x=>x!==v):[...s.interest,v];render();notify('Interest saved locally, not submitted');return}
if(a==='send'){
 const x=$(v+'-input'),txt=x?.value.trim();if(!txt){notify('Write a message first');return}
 const item={name:'You',time:'Just now',text:txt};
 if(v==='group')s.groupMessages.push(item);
 else if(v==='team')s.teamMessages.push(item);
 else if(v==='direct'){
  if(!todayUI.memberships.group||!sampleGroupPeople.some(p=>p.id===s.directPerson))return;
  s.directMessages[s.directPerson]??=[];
  s.directMessages[s.directPerson].push(item);
  // The care loop remembers only that the optional action occurred; content remains in the existing local DM.
  if(s.directPerson==='marcus'&&s.prayers.some(p=>p?.name==='Marcus C.')){
   s.companionCare.marcus={completedAt:new Date().toISOString()};
  }
  companionFocus=null;
 }else s.prayers.push(item);
 x.value='';delete drafts[v+'-input'];render();notify('Saved to this device only');return;
}
if(a==='attendance'&&canLead('group')){s.attendance[person]=v;render();notify('Sample attendance updated');return}
if(a==='reached'&&canLead('group')){s.reached=s.reached.includes(person)?s.reached.filter(x=>x!==person):[...s.reached,person];render();return}
if(a==='shift'){s.teamStatus=v;if(v==='confirmed'){s.coverage=false;s.teamMessages=s.teamMessages.filter(x=>!x.coverage)}render();notify('Sample serving response saved');return}
if(a==='cover'){s.coverage=!s.coverage;s.teamMessages=s.teamMessages.filter(x=>!x.coverage);if(s.coverage)s.teamMessages.push({name:'You',time:'Just now',text:'Could someone cover my Sunday 9:00 AM shift?',coverage:true});render();notify(s.coverage?'Sample coverage request posted':'Sample request withdrawn');return}
if(a==='plan'&&canLead('group')&&readingLibrary[v]){s.planQuestions[s.plan]=s.question;s.plan=v;s.memoryActive=v;s.memoryTarget=null;s.question=s.planQuestions[v]||readingLibrary[v].question;render();notify('Sample reading pathway selected locally');return}
if(a==='question'&&canLead('group')){const txt=$('question')?.value.trim();if(!txt){notify('Enter a question first');return}s.question=txt;s.planQuestions[s.plan]=txt;render();notify('Sample group question updated locally');return}
if(a==='reflect-prompt'){s.reflectionResponses[s.plan]=($('reflection-response')?.value||'').slice(0,1200);s.reflectionPrompt=['notice','meaning','action'].includes(v)?v:'notice';render();return}
if(a==='reflect-save'){s.reflectionResponses[s.plan]=($('reflection-response')?.value||'').slice(0,1200);render();notify('Reflection saved privately on this device');return}
if(a==='reader-size'){s.readerNotes[s.plan]=($('reader-note')?.value||'').slice(0,1200);s.readerPreferences.size=s.readerPreferences.size==='large'?'regular':'large';render();return}
if(a==='reader-highlight'){s.readerNotes[s.plan]=($('reader-note')?.value||'').slice(0,1200);s.readerPreferences.highlighted[s.plan]=!s.readerPreferences.highlighted[s.plan];render();return}
if(a==='reader-save-note'){const note=$('reader-note')?.value||'';s.readerNotes[s.plan]=note.slice(0,1200);render();notify('Private reflection saved on this device');return}
if(a==='read'){s.read=!s.read;render();return}
if(a==='pray'){s.prayed=!s.prayed;render();return}
});
// F-09 priority cards can be browsed without mutating the F-08 snooze state.
// Dedicated previous/next buttons also work with touch, keyboard and assistive tech.
let f09Touch=null;
document.addEventListener('touchstart',ev=>{
 if(!f09Preview||s.view!=='today'||ev.touches.length!==1)return;
 const hero=ev.target.closest('.f09-hero');
 if(!hero||ev.target.closest('button,summary,a'))return;
 const t=ev.touches[0];f09Touch={x:t.clientX,y:t.clientY};
},{passive:true});
document.addEventListener('touchend',ev=>{
 if(!f09Touch||!f09Preview||s.view!=='today'||!ev.changedTouches.length)return;
 const {x,y}=f09Touch;f09Touch=null;
 const dx=ev.changedTouches[0].clientX-x,dy=ev.changedTouches[0].clientY-y;
 if(Math.abs(dy)<46||Math.abs(dy)<Math.abs(dx)*1.4)return;
 const m=window.RallySmartDashboard.model({
   state:s,ui:todayUI,conversation:conversation(),now:new Date(),today:T,
   companion:window.RallyCompanionDecision,passage:currentReading().passage
 });
 if(m.stack.length<2)return;
 f09Index=(f09Index+(dy<0?1:-1)+m.stack.length)%m.stack.length;
 render();
},{passive:true});
document.addEventListener('click',ev=>{if(ev.target.dataset.dismiss==='dialog')closeDialog();});
document.addEventListener('submit',ev=>{
if(ev.target.dataset.form==='f10-query'){
 ev.preventDefault();
 if(!f10Preview||dialog!=='f10-companion'||s.view!=='today')return;
 const query=String(new FormData(ev.target).get('question')||'').trim().slice(0,160);
 f10Ask(query);return;
}
if(ev.target.dataset.form!=='demo-name')return;ev.preventDefault();const value=String(new FormData(ev.target).get('name')||'').trim();
if(!value){notify('Add a first name for this local demo.');return;}todayUI.name=value.slice(0,20);render();closeDialog();notify('Your demo name is saved locally.');
});
document.addEventListener('keydown',ev=>{
if(!dialog)return;if(ev.key==='Escape'){ev.preventDefault();closeDialog();return;}
if(ev.key==='Tab'){const nodes=[...$('dialog-root').querySelectorAll('button:not(:disabled),a[href],input,select,textarea')],first=nodes[0],last=nodes[nodes.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last?.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first?.focus();}}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
// Browser-local updates from another tab refresh Today without disturbing an active chat composer.
window.addEventListener('storage',ev=>{
 if(ev.key===window.RallyConversationRead?.STORAGE_KEY&&
    (s.view==='today'||(s.view==='group'&&s.groupPane!=='chat')))render();
});
render();
})();
