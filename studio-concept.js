/* RALLY POINT — STUDIO CONCEPT v0.9
 * A high-fidelity, functional demonstration of the approved four-screen
 * agency concept. All people, events, messages and activity are fictional.
 * No API, no authentication, no messaging service, no pastoral inference.
 */
(function(){
 'use strict';
 const slots=Array.from(document.querySelectorAll('.phone-slot'));
 const mobileNav=document.querySelector('.mobile-screen-nav');
 const toast=document.getElementById('studio-toast');
 const KEY='rally-point-studio-concept-v09';
 const initial=()=>({checkIn:false,prayed:false,teamConfirmed:true,helpOffered:false,readDone:false,messagesSent:0,reviewed:[],noticeCount:2});
 const views=['today','people','team','care'];
 let state=initial();
 try {
  const saved=JSON.parse(localStorage.getItem(KEY)||'null');
  if(saved&&typeof saved==='object') state={...initial(),...saved,reviewed:Array.isArray(saved.reviewed)?saved.reviewed:[]};
 }catch(e){}
 let activeMobile='today';
 let toastTimer;
 const iconPaths={
  home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
  people:'<path d="M16 20v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 20v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  team:'<path d="m12 2 10 5-10 5L2 7l10-5z"/><path d="m2 12 10 5 10-5M2 17l10 5 10-5"/>',
  book:'<path d="M12 7v14M3 5.5A2.5 2.5 0 0 1 5.5 3H12v18H5.5A2.5 2.5 0 0 0 3 23V5.5zM21 5.5A2.5 2.5 0 0 0 18.5 3H12v18h6.5a2.5 2.5 0 0 1 2.5 2V5.5z"/>',
  chat:'<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7A8.4 8.4 0 0 1 4 11.5 8.5 8.5 0 0 1 12.5 3 8.5 8.5 0 0 1 21 11.5z"/>',
  calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
  bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
  right:'<path d="m9 18 6-6-6-6"/>',
  check:'<path d="m5 12 4 4L19 6"/>',
  prayer:'<path d="M12 20.5c-1.2-2.5-3-5.2-3-8.5V3c1.7 0 3 2 3 4v2c0-2 1.3-4 3-4v9c0 1.4-1.1 2.6-3 6.5z"/><path d="M7 21c-3.5-2.7-5-6-5-9l4-6M17 21c3.5-2.7 5-6 5-9l-4-6"/>',
  arrow:'<path d="M5 12h14m-7-7 7 7-7 7"/>',
  search:'<circle cx="10.7" cy="10.7" r="7.7"/><path d="m16.4 16.4 5 5"/>',
  heart:'<path d="M20.8 5.8a5.5 5.5 0 0 0-7.8 0l-1 1-1-1a5.5 5.5 0 1 0-7.8 7.8l8.8 8.5 8.8-8.5a5.5 5.5 0 0 0 0-7.8z"/>',
  megaphone:'<path d="m3 11 14-6v14L3 13v-2zM7 15l2 6h3l-2-5M17 8l4-2M17 15l4 2"/>',
  game:'<path d="M6 12h4m-2-2v4m7-3h.01M18 13h.01M5 6h14c2.5 0 4 2 4 5l-1 6c-.5 2-2.5 3-4 1l-2-2H8l-2 2c-1.5 2-3.5 1-4-1l-1-6c0-3 1.5-5 4-5z"/>'
 };
 const ico=(name)=>'<svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linecap="round" stroke-linejoin="round">'+(iconPaths[name]||iconPaths.right)+'</svg>';
 const avatars=['JW','AL','MK','SR','CM','AN','JD'];
 const avatar=(i,extra='')=>{
  const idx=Math.abs(Number(i)||0)%avatars.length;
  const pos=(idx*100/(avatars.length-1)).toFixed(3);
  return '<span class="av '+extra+'"><img alt="" loading="eager" decoding="async" style="object-position:'+pos+'% center" src="assets/studio-people.svg"><span style="display:none">'+avatars[idx]+'</span></span>';
 };
 const avrow=(count=5)=>'<div class="avatars">'+Array.from({length:count},(_,i)=>avatar(i)).join('')+'<span class="av count">+'+(count===4?'12':'7')+'</span></div>';
 const shell=(content,view,index)=>{
   const dark=view==='people';
   const isCare=view==='care';
   const info=(dark?'<button class="top-icon" data-action="notice" aria-label="Search groups">'+ico('search')+'</button><button class="top-icon simple-top-icon" data-action="notice" aria-label="Explore more groups">+</button>':
      view==='team'?'<button class="top-icon simple-top-icon" data-action="notice" aria-label="Search teams">'+ico('search')+'</button>':
      '<button class="top-icon" data-action="notice" aria-label="Notifications">'+ico('bell')+'</button>');
   const logo='<div class="phone-logo"><img src="assets/citizen-flag.svg" alt=""><span><strong>RALLY POINT</strong><small>CITIZEN CHURCH</small></span></div>';
   return '<div class="phone-viewport"><div class="island" aria-hidden="true"></div><div class="phone-status"><span>9:41</span><span class="status-icons">▮▮▰ <i></i></span></div>'+
   '<div class="phone-scroller"><div class="'+(dark?'dark-screen':isCare?'care-screen':'red-screen')+'">'+
   '<div class="phone-top">'+logo+'<div class="phone-top-actions">'+(isCare?'<button class="leader-view-pill" data-action="nav" data-view="today" aria-label="Return to member Today view">♙ Leader View⌄</button>':info)+
    (view==='today'?'<button type="button" class="top-avatar" data-action="nav" data-view="care" aria-label="Open sample Leader Care view">JW</button>':'')+'</div></div>'+
   content+'</div></div>'+
   '<nav class="phone-bottom" aria-label="App navigation">'+
   [['today','home','Today'],['people','people','Groups'],['team','team','Team'],['read','book','Read']].map(([target,symbol,label])=>
    '<button type="button" data-action="nav" data-view="'+target+'" class="'+(target===view?'active':'')+'" '+(target===view?'aria-current="page"':'')+' aria-label="'+label+'">'+ico(symbol)+'<span>'+label+'</span></button>').join('')+
   '</nav></div>';
 };
 function today(){
  return '<div class="today-welcome"><strong>Good morning, Jonathan.</strong><div class="campus">YOUR CAMPUS · CENTRAL</div></div>'+
   '<section class="hero-card wave-hero"><h2>Your people.<br>Your place.</h2><p>A community to grow, serve, and follow Jesus.</p>'+avrow(4)+'</section>'+
   '<div class="today-stack">'+
    '<button class="tile-button white-tile" data-action="nav" data-view="people"><span class="tile-symbol">'+ico('chat')+'</span><span class="tile-body"><strong>Wednesday Group</strong><small>Anna: Looking forward to seeing everyone Wednesday!</small></span>'+ico('right')+'</button>'+
    '<div class="split-tiles"><button class="split-tile white-tile" data-action="nav" data-view="people"><span class="kicker">'+ico('calendar')+' NEXT GATHERING</span><strong>Wed 6:30</strong><small>Group gathering</small></button>'+
    '<button class="split-tile dark-tile" data-action="nav" data-view="team"><span class="kicker">'+ico('people')+' SERVING</span><strong>Sun 9:00</strong><small>Welcome Team</small></button></div>'+
    '<button class="tile-button white-tile today-read" data-action="nav" data-view="read">'+ico('book')+'<span class="tile-body"><small>TODAY’S READ</small><strong>John 15:9–12</strong></span>'+ico('right')+'</button>'+
   '</div>';
 }
 function people(){
  return '<div class="page-hero wave-hero"><h1>The people<br>who know you.</h1><p>Groups · Conversations · Prayer</p></div>'+
   '<div class="people-body"><div class="people-head">'+
    '<div class="section-row"><div class="section-title">'+ico('people')+'<div><strong>Wednesday Group</strong><small style="display:block">12 members</small></div></div><button class="section-chevron" type="button" data-action="notice" aria-label="Group information">'+ico('right')+'</button></div>'+
    avrow(5)+'<div class="divider"></div>'+
    '<div class="message-row">'+avatar(1)+'<div class="message"><strong>Anna</strong> <span class="message-time">· 1h</span><p>Looking forward to seeing everyone Wednesday!</p></div></div>'+
    '<div class="message-row">'+avatar(2)+'<div class="message"><strong>Mark</strong> <span class="message-time">· 3h</span><p>Can you pray for my dad’s procedure tomorrow?</p></div></div>'+
    (state.messagesSent?'<div class="message-row">'+avatar(0)+'<div class="message"><strong>You</strong> <span class="message-time">· just now</span><p>Looking forward to seeing everyone!</p></div></div>':'')+
    '<div class="divider"></div><div class="mini-label">'+ico('prayer')+' PRAYER REQUESTS</div>'+
    '<button class="prayer-item" data-action="pray">'+avatar(1)+'<span>'+(state.prayed?'You’re praying for Mark’s family':'Pray for Mark’s dad and a smooth recovery')+'</span>'+ico('right')+'</button>'+
    '<button class="cta-red" data-action="checkin">'+ico('chat')+(state.checkIn?'✓ CHECKED IN':'CHECK IN')+'</button>'+
    ''+
   '</div></div>';
 }
 function team(){
  return '<div class="page-hero wave-hero"><h1>Serve<br>together.</h1><p>Teams · Schedules · Updates</p></div>'+
   '<div class="team-body">'+
   '<section class="white-tile serve-card"><div class="eyebrow-row">'+ico('calendar')+' YOUR NEXT SERVE</div><h2>Sunday · 9:00 AM</h2><p>Welcome Team</p>'+
   '<button type="button" class="confirmed" data-action="confirm" aria-label="Change your demo serving response">'+(state.teamConfirmed?ico('check')+' Confirmed':'Response needed')+'</button>'+
   '</section>'+
   '<section class="dark-tile update-card"><div class="eyebrow-row">'+ico('megaphone')+' TEAM UPDATE</div><h2>Welcome Team</h2><p>Need one person for 11:00.<br>If you’re available, reply below and we’ll coordinate.</p>'+
    '<button class="cta-cream" data-action="help">'+ico('chat')+(state.helpOffered?'✓ RESPONSE RECORDED':'REPLY TO TEAM')+'</button></section>'+
   '</div>';
 }
 function leader(){
  const people=[{id:'jake',name:'Jake M.',detail:'No recorded attendance for 2 gatherings.',avatar:2},{id:'sarah',name:'Sarah K.',detail:'Group joined; first visit not recorded yet.',avatar:1}];
  const num=people.filter(p=>!state.reviewed.includes(p.id)).length;
  return '<div class="leader-head"><h1>Care for<br>your people.</h1><p>Stay connected · Notice needs · Follow up</p></div>'+
   '<div class="cream-screen"><div class="leader-body"><div class="leader-summary">'+ico('people')+' <span>'+num+' follow-up'+(num===1?'':'s')+' to review</span>'+ico('right')+'</div>'+
   people.map(p=>'<section class="leader-card"><div class="leader-person">'+avatar(p.avatar)+'<div><strong>'+p.name+'</strong><p>'+p.detail+'</p></div></div>'+
    '<div class="leader-actions"><button type="button" class="primary" data-action="reach" data-person="'+p.name+'">'+ico('chat')+' Reach out</button><button type="button" class="'+(state.reviewed.includes(p.id)?'reviewed':'')+'" data-action="review" data-id="'+p.id+'">'+ico('check')+' '+(state.reviewed.includes(p.id)?'Reviewed':'Mark reviewed')+'</button></div></section>').join('')+
   '<div style="font-size:9px;color:#75635a;line-height:1.6;padding:4px 4px 10px">Illustrative, permissioned leader view. Attendance context requires human review; it does not determine personal or spiritual well-being.</div></div></div>';
 }
 function read(){
  return '<div class="page-hero wave-hero"><h1>Grow<br>together.</h1><p>Scripture · Reflection · VersePlay</p></div><div class="read-body">'+
    '<section class="read-hero"><span>THIS WEEK’S PASSAGE</span><h2>John 15:9–12</h2><p>Remain in my love. Reflect and share with your group.</p>'+
    '<button type="button" class="cta-red" data-action="read">'+ico('check')+(state.readDone?'MARKED AS READ':'MARK AS READ')+'</button></section>'+
    '<button type="button" class="read-action" data-action="nav" data-view="people"><strong>Reflect together →</strong><small>What does loving one another look like this week?</small></button>'+
    '<button type="button" class="read-action game" data-action="game"><strong>VERSEPLAY · BLANK BATTLE →</strong><small>Play the polished memory game from the current prototype</small></button>'+
  '</div>';
 }
 const contents={today,people,team,care:leader,read};
 function draw(){
  slots.forEach((slot,i)=>{
   const article=slot.querySelector('.phone');
   const view=article.dataset.screen||slot.dataset.initial;
   article.querySelector('.phone-dynamic').innerHTML=shell((contents[view]||today)(),view,i);
   slot.classList.toggle('is-mobile-active',slot.dataset.initial===activeMobile);
  });
  document.querySelectorAll('[data-mobile-screen]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.mobileScreen===activeMobile)));
 }
 function persist(){try{localStorage.setItem(KEY,JSON.stringify(state))}catch(e){}}
 function notify(message){if(!toast)return;toast.hidden=false;toast.textContent=message;clearTimeout(toastTimer);toastTimer=setTimeout(()=>{toast.hidden=true},3500)}
 function goto(view,phone){
  if(!contents[view])return;
  if(matchMedia('(max-width:570px)').matches){
   if(views.includes(view)){activeMobile=view;slots.find(s=>s.dataset.initial===view).querySelector('.phone').dataset.screen=view}
   else slots.find(s=>s.dataset.initial===activeMobile).querySelector('.phone').dataset.screen=view;
  }else phone.dataset.screen=view;
  draw();
  const scroller=matchMedia('(max-width:570px)').matches?
    document.querySelector('.phone-slot.is-mobile-active .phone-scroller'):phone.querySelector('.phone-scroller');
  if(scroller)scroller.scrollTop=0;
 }
 document.addEventListener('click',event=>{
  const mobile=event.target.closest('[data-mobile-screen]');
  if(mobile){activeMobile=mobile.dataset.mobileScreen;const slot=slots.find(s=>s.dataset.initial===activeMobile);if(slot)slot.querySelector('.phone').dataset.screen=activeMobile;draw();return}
  const action=event.target.closest('button[data-action]');
  if(!action)return;
  const phone=action.closest('.phone');
  if(!phone)return;
  const a=action.dataset.action;
  if(a==='nav'){goto(action.dataset.view,phone);return}
  if(a==='game'){window.location.href='blank-battle.html';return}
  if(a==='checkin'){state.checkIn=!state.checkIn;persist();draw();notify(state.checkIn?'Demo group check-in recorded on this device.':'Demo check-in reset.');return}
  if(a==='pray'){state.prayed=!state.prayed;persist();draw();notify(state.prayed?'Prayer marked in this demo.':'Prayer marker removed.');return}
  if(a==='message'){state.messagesSent++;persist();draw();notify('Sample message added locally. Nothing was sent to a real group.');return}
  if(a==='confirm'){state.teamConfirmed=!state.teamConfirmed;persist();draw();notify('Sample serving response changed on this device.');return}
  if(a==='help'){state.helpOffered=!state.helpOffered;persist();draw();notify('Demo team reply recorded locally.');return}
  if(a==='review'){
    const id=action.dataset.id;state.reviewed=state.reviewed.includes(id)?state.reviewed.filter(x=>x!==id):[...state.reviewed,id];
    persist();draw();notify('Demo leader follow-up marked. No member was contacted.');return;
  }
  if(a==='reach'){notify('Demo only — no message sent to '+action.dataset.person+'.');return}
  if(a==='read'){state.readDone=!state.readDone;persist();draw();notify('Sample reading state updated.');return}
  if(a==='notice'){notify('Notifications, group search and permissions require real integrations.');return}
 });
 draw();
})();
