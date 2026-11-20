(function rallyApp(){
'use strict';
const key='rallypoint-phase1-2026';
const defaults=()=>({role:'member',groupPane:'chat',teamPane:'schedule',view:'today',discover:false,groupMessages:[{name:'Jess W.',time:'Yesterday',text:'What stood out to you in John 15 this week?'},{name:'Anna L.',time:'Today',text:'Looking forward to seeing everyone Wednesday.'}],teamMessages:[{name:'Sam R.',time:'Yesterday',text:'Welcome team — thank you for helping people feel at home!'}],prayers:[{name:'Marcus C.',time:'Yesterday',text:'Praying for wisdom with an upcoming decision.'}],rsvp:'',teamStatus:'pending',coverage:false,attendance:{anna:'here',jess:'here',marcus:'unknown',taylor:'unknown'},reached:[],interest:[],plan:'sermon',question:'How can we love one another as Jesus has loved us?',read:false,prayed:false});
let s;try{s={...defaults(),...JSON.parse(localStorage.getItem(key)||'null')}}catch(_){s=defaults()}
if(!s||!s.groupMessages||!Array.isArray(s.groupMessages))s=defaults();
const T=window.RallyToday,U=window.RallyUI,icon=U.icon;
let todayUI=T.load({getItem:k=>localStorage.getItem(k)}),dialog=null,dialogTrigger=null,storageWarning='',drafts={};
const $=x=>document.getElementById(x), e=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const save=()=>{try{localStorage.setItem(key,JSON.stringify(s));localStorage.setItem(T.UI_KEY,JSON.stringify(todayUI));storageWarning='';}catch(_){storageWarning='This browser could not save your demo changes. They may be lost on refresh.';}};
const canLead=area=>s.role==='leader'&&!!todayUI.memberships[area];
const pill=(t,light=false)=>`<span class="pill ${light?'light':''}">${e(t)}</span>`;
const icons={home:'⌂',group:'♙',team:'♡',read:'▤',arrow:'↗'};
const sampleGroupPeople=[{id:'anna',name:'Anna L.',initials:'AL'},{id:'jess',name:'Jess W.',initials:'JW'},{id:'marcus',name:'Marcus C.',initials:'MC'},{id:'taylor',name:'Taylor D.',initials:'TD'}];
const next=d=>T.nextEvent(d,d===3?18:9,d===3?30:0).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'});
const wed=()=>next(3),sun=()=>next(0);
const groupList=()=>s.groupMessages.map(m=>`<div class="message"><div class="avatar">${e(m.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><div class="message-meta"><strong>${e(m.name)}</strong><small>${e(m.time)}</small></div><p>${e(m.text)}</p></div></div>`).join('');
const teamList=()=>s.teamMessages.map(m=>`<div class="message"><div class="avatar">${e(m.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><div class="message-meta"><strong>${e(m.name)}</strong><small>${e(m.time)}</small></div><p>${e(m.text)}</p></div></div>`).join('');
const prayerList=()=>s.prayers.map(m=>`<div class="message"><div class="avatar">${e(m.name[0])}</div><div><div class="message-meta"><strong>${e(m.name)}</strong><small>${e(m.time)}</small></div><p>${e(m.text)}</p></div></div>`).join('');
const tabs=(area,values,active)=>`<div class="tabs" role="group" aria-label="${area} sections">${values.map(([id,label])=>`<button type="button" data-action="pane" data-area="${area}" data-value="${id}" class="${active===id?'selected':''}">${label}</button>`).join('')}</div>`;
const compose=(type,title,placeholder)=>`<div class="composer"><label for="${type}-input">${title}</label><textarea id="${type}-input" rows="2" maxlength="700" placeholder="${placeholder}"></textarea><button type="button" class="btn red" data-action="send" data-value="${type}">Post to sample ${type==='group'?'group':type==='team'?'team':'prayer board'} <span>➤</span></button></div>`;
const lead=()=>`<div class="card"><div class="kicker">LEADER TOOLS · PRIVATE DEMO</div><h3>Record attendance</h3><p>Track actual participation, not whether someone opened the app.</p>${[['anna','Anna L.'],['jess','Jess W.'],['marcus','Marcus C.'],['taylor','Taylor D.']].map(([id,name])=>`<div class="attendance"><strong>${name}</strong><div class="actions">${[['here','Here'],['excused','Excused'],['unknown','Not recorded']].map(([v,label])=>`<button type="button" class="mini ${s.attendance[id]===v?'selected':''}" data-action="attendance" data-person="${id}" data-value="${v}">${label}</button>`).join('')}</div></div>`).join('')}</div><div class="card"><div class="kicker">PEOPLE FIRST</div><h3>Thoughtful check-ins</h3><p>These are fictional scenarios, not judgments about someone's spiritual health.</p>${[['marcus','Marcus C.','Two recent sample gatherings missed'],['taylor','Taylor D.','Signed up but no sample gathering yet']].map(([id,name,reason])=>`<div class="followup"><div>${pill(s.reached.includes(id)?'Reviewed':'Suggested check-in')}<strong>${name}</strong><small>${reason}</small></div><button type="button" class="btn outline" data-action="reached" data-person="${id}">${s.reached.includes(id)?'Undo':'Mark reviewed'}</button></div>`).join('')}</div>`;
function renderPeople(snapshot){
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
  const lastMessage=s.groupMessages.length?s.groupMessages[s.groupMessages.length-1]:null;
  const author=lastMessage?e(lastMessage.name):'Your group';
  const timestamp=lastMessage?e(lastMessage.time):'Start the conversation';
  const preview=lastMessage?e(lastMessage.text):'No sample messages yet. Say hello to your group.';
  return `<section class="today-people" aria-label="Your people">
    <div class="today-people-content">
      <div class="today-people-kicker"><span>BETTER TOGETHER</span><span>${canLead('group')?'LEADER VIEW · DEMO':'YOUR COMMUNITY'}</span></div>
      <div class="today-people-heading">
        <h2>Your people<span class="today-people-period">.</span></h2>
        <span class="today-people-constellation" aria-hidden="true"><i></i><i></i><i></i></span>
      </div>
      <div class="today-people-roster">
        <div class="today-people-avatars" aria-label="Sample group members">${roster}</div>
        <div class="today-people-group-name"><strong>Wednesday Group</strong><small>8 members · Fictional community</small></div>
        <button type="button" class="today-people-group-link" data-go="group" data-pane="chat" aria-label="Open Wednesday Group">${icon('arrow')}</button>
      </div>
      <button type="button" class="today-people-message" data-go="group" data-pane="chat" aria-label="Open Wednesday Group conversation">
        <span class="today-people-message-head">${icon('message')} <span>LATEST CONVERSATION</span><small>${timestamp}</small></span>
        <span class="today-people-message-author">${author}</span>
        <span class="today-people-message-text">${preview}</span>
        <span class="today-people-message-action">OPEN CONVERSATION ${icon('arrow')}</span>
      </button>
      ${snapshot.leader?`<button type="button" class="leader-entry today-people-leader" data-go="group" data-pane="leader" aria-label="Open authorized sample group leader check-ins">${icon('leader')}<span><span class="today-label">LEADER FOLLOW-UP · DEMO</span><strong>${snapshot.leader.remaining.length} sample check-ins to review</strong><small>People first, not engagement scores</small></span>${icon('arrow')}</button>`:''}
    </div>
  </section>`;
}
function today(){
const snapshot=T.snapshot(s,todayUI),event=snapshot.upNext;
const title=event?.id==='group'?'Wednesday<br>Group':'Sunday<br>Welcome Team';
const upNext=event?`<button type="button" class="up-next" data-go="${event.id}" data-pane="${event.pane}" aria-label="Up next: ${event.title}, ${T.dateLabel(event.date)}. Open ${event.id==='group'?'Groups':'My Schedule'}"><span class="today-label">UP NEXT</span><h2>${title}</h2><span class="up-next-meta"><span>${icon('calendar')}${T.dateLabel(event.date)}</span><span>${icon('pin')}${event.location}</span></span><span class="source-note">${event.kind} · DEMO</span><span class="fluid-orbit" aria-hidden="true"><b></b><i></i></span><span class="up-next-arrow">${icon('arrow')}</span></button>`:`<div class="today-empty discovery"><span class="today-label">A PLACE TO BEGIN</span><h2>There’s room<br>for you here.</h2><p>No group or team is assigned in this sample. Explore where you could connect.</p><div class="discovery-actions"><button type="button" class="btn" data-go="group">Explore Groups ${icon('arrow')}</button><button type="button" class="btn" data-go="team">Find a Team ${icon('arrow')}</button></div></div>`;
const attention=[];
if(snapshot.unread)attention.push(`<button type="button" class="attention-tile ${snapshot.attention===1?'full':''}" data-go="group" data-pane="chat" aria-label="Open group update and conversation">${icon('group')}<h3>Group<br>Update</h3><p>${s.prayers.length?'New notes & a prayer request':'A note from your group'}</p><span class="tile-arrow">${icon('arrow')}</span>${U.contours()}</button>`);
if(snapshot.pending)attention.push(`<button type="button" class="attention-tile availability-action ${snapshot.attention===1?'full':''}" data-go="team" data-pane="schedule" aria-label="Confirm availability in My Schedule">${icon('confirm')}<h3>Confirm<br>Availability</h3><p>Let your team know you’re in this week</p><span class="tile-arrow">${icon('arrow')}</span>${U.contours()}</button>`);
return `<section class="today-screen" aria-label="Today"><div class="today-welcome"><div class="fluid-hero-overline">CITIZEN CHURCH <span class="fluid-hero-rule"></span> YOUR DAY</div><h1>Good morning,<br><span>${e(todayUI.name||'Jonathan')}.</span></h1><p class="welcome-line">CONNECT <i>·</i> GROW <i>·</i> SERVE</p><span class="today-date">${new Date().toLocaleDateString('en-US',{weekday:'short',month:'short',day:'numeric'})}</span><span class="today-watermark" aria-hidden="true"></span><span class="welcome-graphic">${U.contours()}</span></div>${renderPeople(snapshot)}${upNext}
${attention.length?`<div class="fluid-activity-head"><span>IN YOUR CIRCLE</span><small>YOUR NEXT STEPS</small></div><div class="attention-grid" aria-label="Needs your attention">${attention.join('')}</div>`:`<div class="today-empty">${icon('check')}<div><h3>${snapshot.leader?'Your member updates are clear.':'You’re all caught up.'}</h3><p>${todayUI.memberships.group||todayUI.memberships.team?'No group updates or serving responses need your attention.':'Your daily reading is ready whenever you are.'}</p></div></div>`}
<div class="today-reading"><span class="fluid-read-curve" aria-hidden="true"></span><span class="today-label">TODAY’S READING</span><h2>John 15:9–12</h2><div class="reading-actions"><button type="button" class="read-primary" data-go="read" data-reading="scripture">${s.read?icon('check'):''}${s.read?'Read today':'Abide'}</button><button type="button" data-go="read" data-reading="questions">Reflect</button><button type="button" data-action="memorize-preview">Memorize</button></div>${U.leaves()}<p class="reading-caption">${todayUI.memberships.group?'Your group’s selection':'Daily Scripture'} · Fictional reading fixture</p></div>

<div class="fluid-week"><div class="fluid-week-heading"><span>THIS WEEK</span><small>YOUR RHYTHM</small></div><div class="fluid-week-events">${todayUI.memberships.group?`<button type="button" data-go="group" data-pane="gather"><span class="fluid-event-dot"></span><strong>GROUP</strong><small>${wed()}</small>${icon('arrow')}</button>`:'' }${todayUI.memberships.team?`<button type="button" data-go="team" data-pane="schedule"><span class="fluid-event-dot"></span><strong>SERVE</strong><small>${sun()}</small>${icon('arrow')}</button>`:'' }${!todayUI.memberships.group&&!todayUI.memberships.team?`<button type="button" data-go="group"><strong>FIND YOUR PEOPLE</strong><small>Explore groups</small>${icon('arrow')}</button>`:''}</div></div><div class="today-demo-footer"><span><i class="demo-dot"></i>FICTIONAL LOCAL DEMO · PHASE 1</span><button type="button" class="demo-controls-link" data-action="demo-controls">Demo controls</button></div></section>`;
}
function groupBrowse(){return `<div class="eyebrow">FIND COMMUNITY</div><h1>Find your<br><em>people.</em></h1><p class="intro">Browse a few sample group options.</p>${todayUI.memberships.group?'<button class="text-button" data-action="browse">← Back to my group</button>':'<p class="demo-notice">Sample discovery only. Interest does not join a group or contact anyone.</p>'}${[['The Table','Community · Wednesday','Albuquerque'],['Weekend Hikers','Activity · Saturday','Northeast Heights'],['Young Families','Community · Sunday','North Campus']].map(([name,type,place],i)=>`<div class="card browse">${pill(type)}<h3>${name}</h3><p>${place}</p><button class="btn outline" data-action="interest" data-value="${i}">${s.interest.includes(String(i))?'✓ Interested':"I'm interested"}</button></div>`).join('')}${footer()}`}
function group(){
if(!todayUI.memberships.group)return groupBrowse();
if(s.discover)return groupBrowse();
const opts=[['chat','Conversation'],['gather','Gathering'],['prayer','Prayer'],...(canLead('group')?[['leader','Leader tools']]:[])];
let body='';
if(s.groupPane==='chat')body=`<div class="card"><div class="kicker">CONVERSATION · SAMPLE</div>${groupList()}${compose('group','Say something to your group','Share a thought or encouragement…')}</div>`;
if(s.groupPane==='gather')body=`<div class="card"><div class="kicker">NEXT GROUP GATHERING</div><h3>${wed()} · 6:30 PM</h3><p>John 15:9–12 · ${e(s.question)}</p><div class="actions"><button class="btn ${s.rsvp==='going'?'chosen':'outline'}" data-action="rsvp" data-value="going">I'm going</button><button class="btn ${s.rsvp==='maybe'?'chosen':'outline'}" data-action="rsvp" data-value="maybe">Maybe</button></div></div><div class="card"><h3>Connected beyond the semester.</h3><p>Groups can remain active through breaks. People can change or leave their group when needed.</p></div>`;
if(s.groupPane==='prayer')body=`<div class="card"><h3>Pray for one another.</h3><p>Use fictional examples here—do not enter private real requests into this demo.</p>${prayerList()}${compose('prayer','Add a sample prayer request','What can your group pray about?')}</div>`;
if(s.groupPane==='leader')body=lead();
return `<div class="eyebrow">MY GROUP ${canLead('group')?pill('LEADER VIEW'):''}</div><h1>Wednesday<br><em>Group.</em></h1><div class="face-row ink"><span class="faces">${sampleGroupPeople.map(person=>`<b title="${e(person.name)}">${e(person.initials)}</b>`).join('')}</span><small>8 members · Sample</small></div><div class="meta">▦ ${wed()} · 6:30 PM</div><button class="text-button" data-action="browse">♙ Explore groups ↗</button>${tabs('group',opts,s.groupPane)}${body}${footer()}`}
function team(){
if(!todayUI.memberships.team)return `<div class="eyebrow">TEAM · DEMO EMPTY STATE</div><h1>A place to<br><em>serve.</em></h1><div class="empty-tab"><h2>Your next step starts here.</h2><p>No team or assignment belongs to this fixture. Team discovery and joining will be defined in a later phase.</p><button type="button" class="btn red" data-action="team-preview">About this preview</button></div>${footer()}`;
const opts=[['schedule','Schedule'],['chat','Team chat'],...(canLead('team')?[['leader','Leader tools']]:[])];let body='';
if(s.teamPane==='schedule')body=`<div class="card"><div class="kicker">NEXT SERVING · SAMPLE</div><h3>Sunday Welcome Team</h3><p>${sun()} · 9:00 AM · North Campus</p>${pill(s.teamStatus==='confirmed'?'Confirmed':s.teamStatus==='declined'?'Unable to serve':'Awaiting response')}${s.coverage?pill('Coverage requested'):''}<div class="actions"><button class="btn red" data-action="shift" data-value="confirmed">✓ Confirm serving</button><button class="btn outline" data-action="shift" data-value="declined">Can't make it</button></div>${s.teamStatus==='declined'?`<div class="tinted"><p>Need someone to take your shift?</p><button class="btn dark-btn" data-action="cover">${s.coverage?'Withdraw request':'Request coverage ↗'}</button></div>`:''}</div><div class="card"><h3>Team huddle</h3><p>Arrive at 8:40 AM; huddle begins at 8:45 AM.</p><button class="text-button" data-action="pane" data-area="team" data-value="chat">Open team conversation ↗</button></div>`;
if(s.teamPane==='chat')body=`<div class="card"><div class="kicker">WELCOME TEAM CHAT · SAMPLE</div>${teamList()}${compose('team','Send a team update','Share an update with your team…')}</div>`;
if(s.teamPane==='leader')body=`<div class="card"><div class="kicker">LEADER TOOLS · PRIVATE DEMO</div><h3>Sunday coverage</h3><p>${s.coverage?'There is one sample coverage request for the 9 AM shift.':'No active sample coverage requests.'}</p><button class="btn outline" data-action="pane" data-area="team" data-value="chat">Open team chat ↗</button></div><div class="card"><h3>Look after the people serving.</h3><p>Future Planning Center integration can help spot gaps and overscheduling using actual schedules and attendance, with safeguards for privacy.</p></div>`;
return `<div class="eyebrow">MY TEAM ${canLead('team')?pill('LEADER VIEW'):''}</div><h1>Serve<br><em>together.</em></h1><p class="intro">Your team, your schedule, your conversations.</p><div class="team-banner">${pill('WELCOME TEAM',true)}<h2>Make every<br>person feel seen.</h2><small>North Campus · Sample</small><span>♡</span></div>${tabs('team',opts,s.teamPane)}${body}${footer()}`}
function read(){
const plans={sermon:['Jesus Series','The words of Jesus'],study:['Approved book study','The Gospel of John'],year:['Bible in a year','Daily Bible reading']};const plan=plans[s.plan];
return `<div class="eyebrow">GROW TOGETHER</div><h1>In the<br><em>Word.</em></h1><p class="intro">Read, reflect, and bring something meaningful to your group.</p><div class="card"><div class="kicker">${todayUI.memberships.group?"YOUR GROUP’S READING":"TODAY’S READING"} · SAMPLE</div><h3>${plan[1]}</h3><p>${plan[0]} · John 15:9–12</p><div class="quote" id="reading-questions" tabindex="-1"><small>DISCUSSION QUESTION</small><strong>${e(s.question)}</strong></div>${canLead('group')?`<div class="edit-plan"><label>Choose a reading plan</label><div class="actions">${[['sermon','Sermon'],['study','Book study'],['year','Bible/year']].map(([id,label])=>`<button class="btn mini ${s.plan===id?'chosen':'outline'}" data-action="plan" data-value="${id}">${label}</button>`).join('')}</div><label for="question">Group discussion question</label><textarea id="question" rows="2" maxlength="400">${e(s.question)}</textarea><button class="btn dark-btn" data-action="question">Save question</button></div>`:''}</div><div class="card" id="reading-scripture" tabindex="-1"><div class="kicker">SCRIPTURE · KJV</div><h3>John 15:12</h3><p class="verse">“This is my commandment, That ye love one another, as I have loved you.”</p><button class="btn ${s.read?'chosen':'red'}" data-action="read">${s.read?'✓ Read today':'Mark as read'}</button></div><div class="card compact"><div><h3>A moment to pray.</h3><p>Take a minute to pray for someone in your group.</p></div><button class="round ${s.prayed?'done':''}" aria-label="Mark prayer time" data-action="pray">${s.prayed?'✓':'↗'}</button></div>${footer()}`}
function footer(){return `<p class="disclaimer">RallyPoint Phase 1 · Interactive sample data only. Nothing is sent to other people, church systems, or notifications.</p>`}
function render(){
const view=$('view'),position=view.scrollTop;
view.querySelectorAll('textarea').forEach(field=>{drafts[field.id]=field.value});
if(!['today','group','team','read'].includes(s.view))s.view='today';
if(s.view==='group'&&todayUI.memberships.group&&['chat','prayer'].includes(s.groupPane))todayUI.seenGroupSignature=T.signature(s);
if(s.role!=='leader'){if(s.groupPane==='leader')s.groupPane='chat';if(s.teamPane==='leader')s.teamPane='schedule';}
save();
document.querySelector('.phone-inner').classList.toggle('is-fluid-today',s.view==='today');
 view.innerHTML=(storageWarning?`<p class="storage-notice" role="status">${e(storageWarning)}</p>`:'')+(s.view==='today'?today():s.view==='group'?group():s.view==='team'?team():read());
view.querySelectorAll('textarea').forEach(field=>{if(drafts[field.id]!==undefined)field.value=drafts[field.id]});
$('nav').innerHTML=[['today','Today','home'],['group','Groups','group'],['team','Team','team'],['read','Read','read']].map(([id,label,glyph])=>`<button type="button" class="${s.view===id?'active':''}" data-go="${id}" ${s.view===id?'aria-current="page"':''}>${icon(glyph)}<small>${label}</small></button>`).join('');
 if(s.view==='today')$('nav').children[1].insertAdjacentHTML('afterend',`<button type="button" class="fluid-quick" data-action="quick-actions" aria-label="Quick actions">${icon('plus')}<small>Quick</small></button>`);
$('profile-initials').textContent=(todayUI.name||'Jonathan').split(/\s+/).map(v=>v[0]).join('').slice(0,2).toUpperCase();
const snapshot=T.snapshot(s,todayUI);$('activity-dot').hidden=!snapshot.attention&&!snapshot.leader;
view.scrollTop=position;
}
function navigate(view,pane,reading){
closeDialog(false);
s.view=view;
if(view==='group'){
s.discover=false;if(pane)s.groupPane=pane;
if(pane==='leader'&&!(s.role==='leader'&&todayUI.memberships.group))s.groupPane='chat';
if((pane==='chat'||pane==='prayer'||!pane)&&todayUI.memberships.group)todayUI.seenGroupSignature=T.signature(s);
}
if(view==='team'&&pane)s.teamPane=pane;
render();$('view').scrollTop=0;
const focus=reading?$('reading-'+reading):$('view').querySelector('h1');
if(focus){focus.tabIndex=-1;focus.focus({preventScroll:true});if(reading)focus.scrollIntoView?.({block:'start',behavior:'auto'});}
}
function closeDialog(restore=true){
if(!dialog)return;dialog=null;$('dialog-root').innerHTML='';document.querySelector('.phone-inner').inert=false;
if(restore){if(dialogTrigger?.isConnected)dialogTrigger.focus({preventScroll:true});else $('view').focus({preventScroll:true});}
}
function showDialog(type,trigger=document.activeElement){dialogTrigger=trigger;dialog=type;renderDialog();}
function renderDialog(){
let title='',body='';const snapshot=T.snapshot(s,todayUI);
if(dialog==='demo-controls'){
title='Your local preview';body=`<p><strong>Rally Point · Phase 1</strong><br>Fictional people, messages and schedules. No account or integration is connected.</p><form data-form="demo-name" class="rp-stack"><label class="demo-field" for="demo-name">First name for this demo<input id="demo-name" name="name" maxlength="20" value="${e(todayUI.name)}" autocomplete="nickname" required></label><button type="submit" class="btn red">Save local name</button></form><div class="demo-section"><h3>Role preview</h3><button type="button" id="role" class="role" aria-label="Toggle member or leader preview">${s.role==='leader'?'Leader demo · Switch to member':'Member demo · Try leader tools'}</button><p class="fine-note">This grants fixture permissions only for Wednesday Group and Welcome Team when you belong to them. It is not a real account, authority grant or secure backend.</p></div><div class="demo-section"><h3>Try a Today state</h3><div class="rp-stack"><button type="button" class="demo-option" data-action="scenario" data-value="connected"><span>${icon('group')}</span><span><strong>Connected & actionable</strong><small>Group update and a pending serving response.</small></span></button><button type="button" class="demo-option" data-action="scenario" data-value="caught-up"><span>${icon('check')}</span><span><strong>All caught up</strong><small>Acknowledge updates and confirm the sample schedule.</small></span></button><button type="button" class="demo-option" data-action="scenario" data-value="no-memberships"><span>${icon('heart')}</span><span><strong>No group or team yet</strong><small>Welcoming empty state with Scripture and discovery paths.</small></span></button></div><p class="fine-note">Fixture controls change your local sample response and Today memberships. Your messages, prayer posts, RSVP and saved leader/reading choices are kept.</p></div><div class="demo-section"><p class="fine-note">The working name and branding remain provisional. Local browser storage is not secure member storage. Please use fictional content.</p><a href="premium-hybrid-archive.html">Open the preserved Citizen Connect demo</a></div>`;
}
if(dialog==='quick-actions'){
 title='Make your next move';body=`<p>Quick actions from your current Rally Point demo. Select one to open its existing feature.</p><div class="rp-stack">${todayUI.memberships.group?`<button type="button" class="activity-item" data-go="group" data-pane="chat">${icon('group')}<span><strong>Your group</strong><small>Open the Wednesday Group conversation</small></span>${icon('arrow')}</button>`:`<button type="button" class="activity-item" data-go="group">${icon('group')}<span><strong>Find a group</strong><small>Explore community</small></span>${icon('arrow')}</button>`}${todayUI.memberships.team?`<button type="button" class="activity-item" data-go="team" data-pane="schedule">${icon('team')}<span><strong>Your serving schedule</strong><small>See the upcoming sample shift</small></span>${icon('arrow')}</button>`:''}<button type="button" class="activity-item" data-go="read" data-reading="scripture">${icon('read')}<span><strong>Today’s Scripture</strong><small>Read John 15:9–12</small></span>${icon('arrow')}</button></div>`;
 }
 if(dialog==='notifications'){
title='What needs your attention';body=`<p>Activity from the same local group and schedule fixtures shown on Today. No real notifications are sent.</p><div class="rp-stack">${snapshot.unread?`<button type="button" class="activity-item" data-go="group" data-pane="chat">${icon('message')}<span><strong>A group update</strong><small>Open Wednesday Group’s conversation.</small></span>${icon('arrow')}</button>`:''}${snapshot.pending?`<button type="button" class="activity-item" data-go="team" data-pane="schedule">${icon('confirm')}<span><strong>Your serving response</strong><small>Let the Welcome Team know your availability.</small></span>${icon('arrow')}</button>`:''}${snapshot.leader?`<button type="button" class="activity-item" data-go="group" data-pane="leader">${icon('leader')}<span><strong>Group leader check-ins</strong><small>${snapshot.leader.remaining.length} sample entries are awaiting review.</small></span>${icon('arrow')}</button>`:''}${!snapshot.attention&&!snapshot.leader?`<div class="today-empty">${icon('check')}<div><h3>You’re all caught up.</h3><p>Nothing needs your response in this fixture.</p></div></div>`:''}</div>`;
}
if(dialog==='memorize-preview'){
title='Memorize · Phase 2 preview';body=`<p>The memorization exercise is not part of this Today-screen phase. This is a labeled preview, not a completed practice or progress record.</p><div class="phase-placeholder"><strong>John 15:12 · KJV excerpt</strong><blockquote>“This is my commandment, That ye love one another, as I have loved you.”</blockquote></div><button type="button" class="btn red" data-go="read" data-reading="scripture">Open the existing reading</button><p class="fine-note">KJV text is public domain in the United States. Translation choice and full reading-plan scope remain later-phase decisions.</p>`;
}
if(dialog==='team-preview'){
title='A place on a team';body=`<p>This fixture has no team membership or serving assignments. Team discovery and joining are later-phase work; no sign-up or request is sent here.</p><button type="button" class="btn red" data-go="today">Back to Today</button><p class="fine-note">Switch to the Connected fixture in Demo controls to try the existing schedule and team conversation.</p>`;
}
$('dialog-root').innerHTML=`<div class="rp-backdrop" data-dismiss="dialog"><section class="rp-sheet" role="dialog" aria-modal="true" aria-labelledby="dialog-title" tabindex="-1"><div class="rp-sheet-top"><h2 id="dialog-title">${title}</h2><button type="button" class="rp-close" data-action="close-dialog" aria-label="Close dialog">${icon('close')}</button></div>${body}</section></div>`;
document.querySelector('.phone-inner').inert=true;$('dialog-root').querySelector('[data-action="close-dialog"]').focus({preventScroll:true});
}
function notify(text){const x=$('toast');x.textContent=text;x.hidden=false;clearTimeout(notify.timer);notify.timer=setTimeout(()=>x.hidden=true,2600)}
document.addEventListener('click',ev=>{
const b=ev.target.closest('button');if(!b)return;
if(b.type==='submit'&&b.form)return;
if(b.id==='role'){s.role=s.role==='leader'?'member':'leader';s.groupPane='chat';s.teamPane='schedule';render();renderDialog();notify(s.role==='leader'?'Scoped leader fixture enabled':'Member fixture enabled');return}
if(b.dataset.go){navigate(b.dataset.go,b.dataset.pane||((b.dataset.leader)?'leader':''),b.dataset.reading);return}
const a=b.dataset.action,v=b.dataset.value||'',person=b.dataset.person;
if(['notifications','demo-controls','memorize-preview','team-preview','quick-actions'].includes(a)){showDialog(a,b);return}
if(a==='close-dialog'){closeDialog();return}
if(a==='scenario'){
todayUI.memberships={group:v!=='no-memberships',team:v!=='no-memberships'};
if(v==='connected'){s.teamStatus='pending';todayUI.seenGroupSignature='';}
if(v==='caught-up'){s.teamStatus='confirmed';s.coverage=false;todayUI.seenGroupSignature=T.signature(s);s.teamMessages=s.teamMessages.filter(m=>!m.coverage);}
s.view='today';closeDialog(false);render();$('view').scrollTop=0;notify('Local Today fixture updated. No data was sent.');return;
}
if(a==='pane'){if(v==='leader'&&!canLead(b.dataset.area))return;if(b.dataset.area==='group')s.groupPane=v;else s.teamPane=v;render();return}
if(a==='browse'){s.discover=!s.discover;render();return}
if(a==='rsvp'){s.rsvp=s.rsvp===v?'':v;render();notify('Sample RSVP updated');return}
if(a==='interest'){s.interest=s.interest.includes(v)?s.interest.filter(x=>x!==v):[...s.interest,v];render();notify('Interest saved locally, not submitted');return}
if(a==='send'){const x=$(v+'-input'),txt=x?.value.trim();if(!txt){notify('Write a message first');return}const item={name:'You',time:'Just now',text:txt};if(v==='group')s.groupMessages.push(item);else if(v==='team')s.teamMessages.push(item);else s.prayers.push(item);x.value='';delete drafts[v+'-input'];render();notify('Saved to this device only');return}
if(a==='attendance'&&canLead('group')){s.attendance[person]=v;render();notify('Sample attendance updated');return}
if(a==='reached'&&canLead('group')){s.reached=s.reached.includes(person)?s.reached.filter(x=>x!==person):[...s.reached,person];render();return}
if(a==='shift'){s.teamStatus=v;if(v==='confirmed'){s.coverage=false;s.teamMessages=s.teamMessages.filter(x=>!x.coverage)}render();notify('Sample serving response saved');return}
if(a==='cover'){s.coverage=!s.coverage;s.teamMessages=s.teamMessages.filter(x=>!x.coverage);if(s.coverage)s.teamMessages.push({name:'You',time:'Just now',text:'Could someone cover my Sunday 9:00 AM shift?',coverage:true});render();notify(s.coverage?'Sample coverage request posted':'Sample request withdrawn');return}
if(a==='plan'&&canLead('group')){s.plan=v;render();return}
if(a==='question'&&canLead('group')){const txt=$('question')?.value.trim();if(!txt){notify('Enter a question first');return}s.question=txt;render();notify('Sample group question updated');return}
if(a==='read'){s.read=!s.read;render();return}
if(a==='pray'){s.prayed=!s.prayed;render();return}
});
document.addEventListener('click',ev=>{if(ev.target.dataset.dismiss==='dialog')closeDialog();});
document.addEventListener('submit',ev=>{
if(ev.target.dataset.form!=='demo-name')return;ev.preventDefault();const value=String(new FormData(ev.target).get('name')||'').trim();
if(!value){notify('Add a first name for this local demo.');return;}todayUI.name=value.slice(0,20);render();closeDialog();notify('Your demo name is saved locally.');
});
document.addEventListener('keydown',ev=>{
if(!dialog)return;if(ev.key==='Escape'){ev.preventDefault();closeDialog();return;}
if(ev.key==='Tab'){const nodes=[...$('dialog-root').querySelectorAll('button:not(:disabled),a[href],input,select,textarea')],first=nodes[0],last=nodes[nodes.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last?.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first?.focus();}}
});
document.addEventListener('visibilitychange',()=>{if(!document.hidden)render();});
render();
})();
