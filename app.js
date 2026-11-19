/* CITIZEN CONNECT – UNOFFICIAL INTERACTIVE DEMO
   Static, dependency-free prototype. Everything saves only in this browser.
   Buddy names, activity, awards, history and group content are fictional examples.
*/
(() => {
  'use strict';
  // New, isolated demo storage namespace: start this preview from a clean slate once.
  // Subsequent activity continues to save and survive reloads as usual.
  const STORAGE = 'citizen-connect-demo-v038';
  const $ = id => document.getElementById(id);
  function todayKey(date = new Date()) {
    return [date.getFullYear(), String(date.getMonth() + 1).padStart(2, '0'),
      String(date.getDate()).padStart(2, '0')].join('-');
  }
  function freshDay(date = todayKey()) {
    return {date, done: {read:false, share:false, memorize:false, pray:false},
      prayed: [], encouraged: [], words: [], memoryResult: ''};
  }
  function fresh() {
    return {version: 2, daily: freshDay(), persistent: {
      reflections: {}, prayerRequest: '', prayerDraft: null, rsvp: '', reactions: [], totalComplete: 0
    }};
  }
  function load() {
    const initial = fresh();
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE));
      if (!saved) return initial;
      if (saved.version === 2 && saved.daily && saved.persistent) return saved;
      if (!saved.done) return initial;
      // Migrate before comparing dates so yesterday's notes and RSVP survive.
      const {date, done, prayed, encouraged, words, memoryResult} = initial.daily;
      initial.daily = {date: saved.date || date, done: {...done, ...saved.done},
        prayed: Array.isArray(saved.prayed) ? saved.prayed : prayed,
        encouraged: Array.isArray(saved.encouraged) ? saved.encouraged : encouraged,
        words: Array.isArray(saved.words) ? saved.words : words,
        memoryResult: saved.memoryResult || memoryResult};
      const data = initial.persistent;
      if (saved.reflection) data.reflections[initial.daily.date] = saved.reflection;
      data.prayerRequest = saved.prayerRequest || '';
      data.rsvp = saved.rsvp || '';
      data.reactions = Array.isArray(saved.reactions) ? saved.reactions : [];
      data.totalComplete = Number(saved.totalComplete) || 0;
    } catch { /* Storage can be unavailable in private browsing. */ }
    return initial;
  }
  let state = load();
  let reflectionDraft = null;
  let midnightTimer;
  let tab='today', growTab='read', profileTab='awards', sheet='', toastTimeout, celebrateTimeout;
  function save() {
    try { localStorage.setItem(STORAGE, JSON.stringify(state)); }
    catch { /* Keep the current session usable when storage is unavailable. */ }
  }
  function rollDay() {
    const date = todayKey();
    if (state.daily.date === date) return false;
    state.daily = freshDay(date);
    save();
    return true;
  }
  function scheduleMidnight() {
    clearTimeout(midnightTimer);
    const now = new Date();
    const next = new Date(now);
    next.setHours(24, 0, 0, 0);
    midnightTimer = setTimeout(resume, next - now);
  }
  function resume() {
    if (rollDay()) render(true);
    scheduleMidnight();
  }
  function reflectionText() {
    return reflectionDraft ?? state.persistent.reflections[state.daily.date] ?? '';
  }
  const esc=v=>String(v??'').replace(/[&<>"']/g,s=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[s]));
  const count=()=>Object.values(state.daily.done).filter(Boolean).length;
  const people=[
    {id:'anna',name:'Anna L.',initials:'AL',color:'#ff7379',progress:4,activity:'Completed all 4 habits today',time:'18 min ago'},
    {id:'james',name:'James M.',initials:'JM',color:'#f4c4af',progress:2,activity:'Shared a thought on Romans 8',time:'46 min ago'},
    {id:'marcus',name:'Marcus C.',initials:'MC',color:'#add0df',progress:3,activity:'Prayed for his circle',time:'2 hours ago'},
    {id:'taylor',name:'Taylor D.',initials:'TD',color:'#c2d69f',progress:1,activity:'Read today’s passage',time:'3 hours ago'}
  ];
  const names=['Read','Share','Memorize','Pray'], keys=['read','share','memorize','pray'];
  const icons={
    navToday:'<rect x="3" y="4.5" width="18" height="17" rx="4"/><path d="M7.5 2.5v4M16.5 2.5v4M3 10h18m-13 5 3 3 5-5"/>',
    navGrow:'<path d="M12 6v15M3 4.5c3.5-1 6.5-.5 9 1.5 2.5-2 5.5-2.5 9-1.5v15c-3.5-1-6.5-.5-9 1.5-2.5-2-5.5-2.5-9-1.5v-15Z"/><path d="m6.5 9 2 .5m-2 3.5 2 .5m7-4 2-.5"/>',
    navGroups:'<circle cx="12" cy="8.5" r="3.5"/><path d="M6 21v-1.5a6 6 0 0 1 12 0V21M4.5 5.5a3 3 0 0 0 0 6M19.5 5.5a3 3 0 0 1 0 6M3 15a4 4 0 0 0-1 3v1m19-4a4 4 0 0 1 1 3v1"/>',
    navYou:'<rect x="3" y="2.5" width="18" height="19" rx="5"/><circle cx="12" cy="9" r="3"/><path d="M7 18a5.2 5.2 0 0 1 10 0"/>',
    serveHands:'<path d="m3 16 4-2h4a2 2 0 0 1 0 4H8m5-1 5-3a2 2 0 0 1 2 3l-7 4H8l-5-2M2 14v7"/><path d="m14 11-3.5-3.5a2.5 2.5 0 0 1 3.5-3.6 2.5 2.5 0 0 1 3.5 3.6L14 11Z"/>',
    home:'<path d="m3 10 9-7 9 7v10a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1z"/>',
    book:'<path d="M12 7v14"/><path d="M3 18V4a2 2 0 0 1 2-2h3a6 6 0 0 1 4 2 6 6 0 0 1 4-2h3a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2h-3a6 6 0 0 0-4 2 6 6 0 0 0-4-2H5a2 2 0 0 0-2 2z"/>',
    users:'<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><path d="M20 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
    profile:'<circle cx="12" cy="8" r="4"/><path d="M4 22v-2a8 8 0 0 1 16 0v2"/>',
    chat:'<path d="M20 11.5a7.8 7.8 0 0 1-8 8 9.3 9.3 0 0 1-3-.5l-5 2 1.8-4.5A7.8 7.8 0 0 1 4 11.5a8 8 0 0 1 16 0z"/>',
    heart:'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.3l8.8-8.9a5.5 5.5 0 0 0 0-7.8z"/>',
    layers:'<path d="m12 2 9 5-9 5-9-5 9-5ZM3 12l9 5 9-5M3 17l9 5 9-5"/>',
    arrow:'<path d="M5 19 19 5M8 5h11v11"/>',
    right:'<path d="m9 18 6-6-6-6"/>',
    check:'<circle cx="12" cy="12" r="9"/><path d="m8 12 3 3 5-6"/>',
    tick:'<path d="m5 12 4 4L19 6"/>',
    flame:'<path d="M12 22c5 0 8-3 8-8 0-4-3-7-4-8 0 4-2 5-3 5 0-4-2-7-5-9 1 5-4 9-4 14a8 8 0 0 0 8 6Z"/>',
    award:'<path d="M8 21h8M12 17v4"/><path d="M7 2h10v6a5 5 0 0 1-10 0V2Z"/><path d="M7 4H3v3a4 4 0 0 0 4 4M17 4h4v3a4 4 0 0 1-4 4"/>',
    calendar:'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/>',
    reset:'<path d="M3 11a9 9 0 1 1 3 7M3 4v7h7"/>',
    lock:'<rect x="5" y="11" width="14" height="11" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/>',
    prayer:'<path d="M12 3v6M9 6l3 3 3-3"/><path d="m6 21-2-8 5-5 3 3-2 4 2 6M18 21l2-8-5-5-3 3 2 4-2 6"/>',
    sparkle:'<path d="m12 3 2.3 6.7L21 12l-6.7 2.3L12 21l-2.3-6.7L3 12l6.7-2.3z"/>',
    clock:'<circle cx="12" cy="12" r="9"/><path d="M12 7v5l4 2"/>',
    bell:'<path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/>',
    plus:'<path d="M12 5v14M5 12h14"/>',
    info:'<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 7h.01"/>',
    bars:'<path d="M4 20v-7M10 20V9M16 20V4M22 20v-12"/>',
    flag:'<path d="M4 21V4M4 5c6-4 10 4 16 0v11c-6 4-10-4-16 0"/>',
    send:'<path d="m22 2-7 20-4-9-9-4 20-7ZM22 2 11 13"/>',
    cross:'<path d="M10 3h4v7h7v4h-7v7h-4v-7H3v-4h7z"/>'
  };
  function icon(k,cls='ico'){return `<svg class="${cls}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.85" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${icons[k]||icons.sparkle}</svg>`}
  function avatar(p, extra='') {
    return `<img class="buddy-avatar ${extra}" src="assets/${p.id}.webp" alt="" width="40" height="40">`;
  }
  function progressRing() {
    const done = count();
    return `<div class="daily-ring" aria-label="${done} of 4 today">
      <svg viewBox="0 0 100 100" aria-hidden="true"><circle class="ring-track" cx="50" cy="50" r="44"/>
      <circle class="ring-fill" cx="50" cy="50" r="44" pathLength="4" stroke-dasharray="${done} 4" opacity="${done ? 1 : 0}"/></svg>
      <span class="ring-center"><strong>${done}/4</strong><span class="ring-label"><span>Daily</span><span>rhythm</span></span></span><span class="sr-only">${done} of 4 today</span></div>`;
  }
  function banner(title, label) {
    return `<header class="view-banner">${heading(label)}<h1>${title}</h1></header>`;
  }
  function heading(hint){return `<div class="eyebrow">${hint}</div>`}
  function groupCard() {
    return `<button class="group-photo" type="button" data-tab="groups" aria-label="Open Wednesday Group">
      <small>Your group · Sample</small><strong>Wednesday Group</strong>
      <span class="photo-avatars">${people.map(p=>avatar(p)).join('')}<b>+4</b></span>
      <span class="photo-gathering">${icon('calendar')}<span>Wednesday · 6:30 PM<small>North Commons · Sample gathering</small></span>${icon('right')}</span>
    </button>`;
  }
  const opportunities = [
    {id:'food-drive',name:'Food Drive',time:'Saturday · 9:00 AM',detail:'Pack pantry boxes alongside your group.'},
    {id:'park-cleanup',name:'Park Cleanup',time:'Saturday · 10:00 AM',detail:'Meet at the park entrance to collect litter and care for the walking paths.'},
    {id:'camp-prep',name:'Kids Camp Prep',time:'Saturday · 1:00 PM',detail:'Prepare activity kits for the next kids camp.'}
  ];
  function servePreview() {
    return `<p class="section-sub">Explore fictional opportunities with your group.</p>${opportunities.map(o=>`<details class="opportunity"><summary><img src="assets/${o.id}.webp" alt=""><span><b>${o.name}</b><small>${o.time}</small></span>${icon('right')}</summary><p>${o.detail}</p></details>`).join('')}`;
  }
  function habitTile(key, index) {
    const done = state.daily.done[key];
    const next = keys.find(habit => !state.daily.done[habit]) === key;
    return `<button class="habit-tile ${next ? 'featured' : ''} ${done ? 'complete' : ''}" type="button"
      data-grow="${key}" aria-label="${names[index]} ${done ? 'completed' : 'activity'}">
      <span class="habit-symbols">${icon(['book','chat','layers','heart'][index])}${icon(done ? 'check' : 'right')}</span>
      <span class="habit-name">${names[index]}</span><small class="habit-state">${done ? "Complete" : next ? "Up next" : "Ready"}</small>
    </button>`;
  }

  function nextStepView() {
    const next = keys.find(key => !state.daily.done[key]);
    if (!next) return `<div class="rhythm-nudge rhythm-finished" role="status" aria-label="Your daily rhythm">${icon('check')}<span><strong>All four, complete.</strong><em>Beautiful work making space for what matters.</em></span><button type="button" data-tab="groups">Visit your circle ${icon('right')}</button></div>`;
    const prompts = {
      read:['Begin with Scripture','A few minutes in Romans 8.'],
      share:['Share what stood out','Your reflection might encourage someone.'],
      memorize:['Make the verse yours','Practice Romans 8:28 one word at a time.'],
      pray:['Take a prayer moment','Remember someone in your circle today.']
    };
    const [label,description] = prompts[next];
    const activityIcon = {read:'book',share:'chat',memorize:'layers',pray:'prayer'}[next];
    return `<button class="rhythm-nudge" type="button" data-grow="${next}" aria-label="Your next step: ${label}">${icon(activityIcon)}<span><small>YOUR NEXT STEP <span aria-hidden="true">· ${keys.indexOf(next)+1} OF 4</span></small><strong>${label}</strong><em>${description}</em></span>${icon('right')}</button>`;
  }
  function todayView() {
    return `<div class="today-view">
      <header class="today-hero"><div>${heading('Today')}<h1>Keep growing<br>together.</h1></div>${progressRing()}</header>
      <div class="habit-grid" aria-label="Daily activities">${keys.map(habitTile).join('')}</div>
      ${groupCard()}
      ${nextStepView()}
      <div class="quick-cards">
        <button class="serve-card" type="button" data-action="serve">${icon('serveHands')}<span><b>Serve Together</b><small>Food Drive · Preview</small></span>${icon('right')}</button>
        <button class="event-card" type="button" data-action="gathering"><span class="event-calendar" aria-hidden="true"><small>WED</small>${icon('calendar')}</span><span><b>What’s Next</b><small>Wed · 6:30 PM</small></span></button>
      </div>
      <section class="today-circle" aria-label="Fictional group activity">
        <div class="section-heading"><div><h2>From your circle</h2><small class="example-caption">Fictional group activity · Preview</small></div><button type="button" data-tab="groups">See all →</button></div>
        ${people.slice(0,1).map(p => `<div class="buddy-row">${avatar(p)}<div class="buddy-copy"><b>${p.name} <small>${p.time}</small></b><p>${p.activity}</p></div><button type="button" class="round-react ${state.daily.encouraged.includes(p.id) ? 'selected' : ''}" data-action="encourage" data-id="${p.id}" aria-pressed="${state.daily.encouraged.includes(p.id)}" aria-label="${p.progress===4 ? 'Celebrate' : 'Nudge'} ${p.name}">${icon('heart')}</button></div>`).join('')}
      </section>
      <p class="today-demo-note">UNOFFICIAL DEMO · Fictional group information</p>
    </div>`;
  }
  function growView(){return `${banner('Grow', 'Daily practice')}<div class="seg-row">${keys.map(k=>`<button class="seg-btn ${growTab===k?'active':''}" type="button" data-grow="${k}">${k[0].toUpperCase()+k.slice(1)}${state.daily.done[k]?' ✓':''}</button>`).join('')}</div>${heading('Grow in God’s Word')}${growTab==='memorize'?memoryView():growTab==='read'?readView():growTab==='share'?shareView():prayView()}`}
  function readView(){return `<h1 class="section-large">Read<span class="dot">.</span></h1><p class="section-sub">A few intentional minutes in Scripture. One day at a time.</p><div class="panel padded"><div class="small-reference">TODAY’S PASSAGE · ROMANS 8:26–28 · KJV</div><p class="reading-verse"><sup>26</sup>Likewise the Spirit also helpeth our infirmities: for we know not what we should pray for as we ought: but the Spirit itself maketh intercession for us with groanings which cannot be uttered.</p><p class="reading-verse"><sup>27</sup>And he that searcheth the hearts knoweth what is the mind of the Spirit, because he maketh intercession for the saints according to the will of God.</p><p class="reading-verse"><sup>28</sup>And we know that all things work together for good to them that love God, to them who are the called according to his purpose.</p><button class="main-button" type="button" data-action="finish" data-key="read">${state.daily.done.read?'✓ Reading completed':'Mark reading complete'}</button></div><div class="panel"><div class="body-label">REFLECT</div><h3 style="margin-top:9px">What stands out?</h3><p>Where have you needed the Spirit’s help lately? What might this passage be inviting you to trust?</p><div style="height:13px"></div><button class="soft-button" type="button" data-grow="share">Share a thought ${icon('right')}</button></div>`}
  const expected=['know','good','love','called','purpose'];
  const bank=['purpose','called','know','faith','good','love','always'];
  function memoryView(){const slots=[0,1,2,3,4].map(i=>`<button class="blank ${state.daily.words[i]?'filled':''} ${state.daily.memoryResult==='incorrect'&&state.daily.words[i]!==expected[i]?'wrong':''}" data-action="remove-word" data-index="${i}" aria-label="${state.daily.words[i]||'Empty word'} blank ${i+1}, tap to remove">${esc(state.daily.words[i]||'_____')}</button>`);const correct=state.daily.memoryResult==='correct';return `<h1 class="section-large">Memorize<span class="dot">.</span></h1><p class="section-sub">Hide the words. Press in. Make the verse yours.</p><div class="memory-card"><div class="memory-card-head"><b>Romans 8:28</b><span class="small-pill">${state.daily.words.length} of 5 words</span></div><div class="verse-text">And we ${slots[0]} that all things work together for ${slots[1]} to them that ${slots[2]} God, to them who are the ${slots[3]} according to his ${slots[4]}.</div></div><div class="word-bank">${bank.map(w=>`<button class="word-chip ${state.daily.words.includes(w)?'used':''}" type="button" data-word="${w}" ${state.daily.words.includes(w)?'disabled':''}>${w}</button>`).join('')}</div>${state.daily.memoryResult==='correct'?`<p class="check-feedback good">${icon('check','inline-icon')} Perfect! You completed today’s memory practice.</p>`:state.daily.memoryResult==='incorrect'?`<p class="check-feedback bad">Not quite. Tap a filled blank to remove a word and try again.</p>`:''}<button class="main-button" type="button" data-action="check-memory">${correct?'✓ Memorization completed':'Check Answer'}</button><div style="height:9px"></div><button class="soft-button" style="width:100%" data-action="reset-memory">${icon('reset','inline-icon')} Reset words</button><div class="section-heading"><h2>Today’s Reading</h2></div><button class="reading-card" data-grow="read">${icon('book')}<div><strong>Romans 8</strong><small>Life in the Spirit</small></div>${icon('right')}</button><div class="section-heading"><h2>Your Group is Growing</h2><span>Today</span></div><div class="buddy-row"><span style="display:flex">${people.slice(0,3).map(p=>avatar(p)).join('')}</span><div class="buddy-copy"><b>You're in good company.</b><p>3 buddies practiced Scripture today.</p></div></div>`}
  function shareView(){return `<h1 class="section-large">Share<span class="dot">.</span></h1><p class="section-sub">Your insight might be just what a friend needs to hear.</p><div class="panel padded"><div class="body-label">YOUR REFLECTION · ROMANS 8</div><textarea id="reflection" class="reflection-input" maxlength="600" placeholder="A verse, a question, something that stood out…">${esc(reflectionText())}</textarea><div class="input-counter"><span id="reflection-counter">${reflectionText().length}</span>/600</div><button class="main-button" data-action="save-share">${state.daily.done.share?'Update your reflection':'Save reflection & complete Share'}</button><div style="height:11px"></div><p class="small-copy">Demo mode: your note is visible only in this browser. It is not sent to real buddies.</p></div><div class="section-heading"><h2>From your circle</h2><span>Sample activity</span></div><div class="panel"><div class="feed-story">${avatar(people[1])}<div class="feed-text"><h4>James M.</h4><p>“The part about the Spirit helping us when we don't know what to pray for really stayed with me.”</p><small>46 min ago</small></div></div><div class="feed-story">${avatar(people[0])}<div class="feed-text"><h4>Anna L.</h4><p>Reminded today that being consistent doesn't mean being perfect.</p><small>1 hour ago</small></div></div></div>`}
  function prayView(){return `<h1 class="section-large">Pray<span class="dot">.</span></h1><p class="section-sub">Carry one another's burdens. Even a short prayer counts.</p><div class="panel panel-highlight"><div class="body-label">TODAY’S PRAYER PROMPT</div><h3 style="margin-top:11px;font-size:17px">God, I want what You want in this area of my life...</h3><p style="margin-top:10px">Take a moment to pray for your own heart and someone in your circle.</p></div><div class="section-heading"><h2>Pray for your people</h2><span>Sample requests</span></div><div class="prayer-requests">${[{id:'alex',name:'Alex M.',note:'Wisdom for a big decision this week.'},{id:'morgan',name:'Morgan C.',note:'Peace and strength for their family.'}].map(p=>`<div class="prayer-request"><div class="request-top"><h3>${p.name}</h3><small>Shared with circle</small></div><p>${p.note}</p><button class="mini-button ${state.daily.prayed.includes(p.id)?'selected':''}" data-action="prayed" data-id="${p.id}">${state.daily.prayed.includes(p.id)?'✓ Prayed':'I prayed for them'}</button></div>`).join('')}</div><div class="section-heading"><h2>Your prayer request</h2><span>Optional</span></div><textarea class="prayer-input" maxlength="300" id="prayer-request" placeholder="What would you ask your buddies to pray for?">${esc(state.persistent.prayerDraft ?? state.persistent.prayerRequest)}</textarea><p class="small-copy" style="margin-bottom:13px">Saved privately on this device. No real group sharing in this demo.</p><button class="main-button" data-action="finish-pray">${state.daily.done.pray?'✓ Prayer time complete':'Finish prayer time'}</button>`}
  function groupsView(){return `${banner('My Group','Wednesday Group · Fictional circle')}<section class="group-invitation"><span class="group-invitation-label">YOUR PEOPLE · SAMPLE</span><h2>Better together.</h2><p>Catch up, make space for each other, and keep the conversation going between gatherings.</p><button type="button" data-action="discussion">Join the conversation ${icon('right')}</button></section><button class="reading-card" data-grow="read">${icon('book')}<div><strong>This week’s focus</strong><small>Romans 8:26–28</small></div>${icon('right')}</button>
      <div class="group-shortcuts"><button data-action="gathering">Gathering</button><button data-action="discussion">Discussion</button><button data-grow="pray">Prayer updates</button></div><div class="group-counts"><div><b>8</b><small>in your circle</small></div><div><b>3</b><small>active today</small></div><div><b>${count()}/4</b><small>your habits</small></div></div><div class="section-heading"><h2>Your Buddies</h2><span>Today's progress</span></div><div class="panel">${people.map(p=>`<div class="member-row">${avatar(p)}<div class="member-main"><b>${p.name}</b><small>${p.progress} of 4 habits completed</small><div class="member-dots">${keys.map((k,i)=>`<span class="${i<p.progress?'hit':''}"></span>`).join('')}</div></div><button class="mini-button ${state.daily.encouraged.includes(p.id)?'selected':''}" data-action="encourage" data-id="${p.id}">${state.daily.encouraged.includes(p.id)?'✓ Sent':p.progress===4?'Celebrate':'Nudge'}</button></div>`).join('')}</div><div class="section-heading"><h2 id="group-discussion" tabindex="-1">Circle activity</h2><span>Sample feed</span></div><div class="panel">${Object.entries(state.persistent.reflections).sort(([a],[b])=>b.localeCompare(a)).map(([date,text])=>`<div class="feed-story"><div class="buddy-avatar" style="background:#eb1542;color:white">JW</div><div class="feed-text"><h4>You · Demo reflection</h4><p>${esc(text)}</p><small>Saved locally ${date===state.daily.date?'today':esc(date)}</small></div></div>`).join('')}${people.slice(0,3).map(p=>`<div class="feed-story">${avatar(p)}<div class="feed-text"><h4>${p.name}</h4><p>${p.activity}</p><small>${p.time}</small></div><button class="round-react ${state.persistent.reactions.includes(p.id)?'selected':''}" data-action="react" data-id="${p.id}" aria-label="React to ${p.name}">${icon('heart')}</button></div>`).join('')}</div><div class="section-heading"><h2 id="group-gathering" tabindex="-1">Next gathering</h2><span>Wednesday · 6:30 PM</span></div><div class="panel"><div class="body-label">WEDNESDAY GROUP</div><h3 style="margin-top:10px">Let's talk about Romans 8.</h3><p>Where have you noticed God at work in a difficult situation?</p><div class="rsvp-row"><button class="soft-button ${state.persistent.rsvp==='going'?'selected':''}" data-action="rsvp" data-value="going">${state.persistent.rsvp==='going'?'✓ Going':'I’m going'}</button><button class="soft-button ${state.persistent.rsvp==='maybe'?'selected':''}" data-action="rsvp" data-value="maybe">${state.persistent.rsvp==='maybe'?'✓ Maybe':'Maybe'}</button></div></div><p class="footer-note">All group members, requests and activity shown here are fictional sample data. Nudges and reactions do not send notifications.</p>`}
  function awards(){const items=[['Reader','7 days','book',true],['Prayer Warrior','5 days','prayer',true],['Memorizer',state.daily.done.memorize?'Today':'1 verse','layers',state.daily.done.memorize],['Encourager','10 shares','chat',true],['Streak','5 days','flame',true],['Bible Builder','14 days','lock',false],['Verse Master','5 verses','lock',false],['Group Leader','Invite 3','lock',false]];return `${heading('Your journey')}<h1 class="section-large">Awards<span class="dot">.</span></h1><p class="section-sub">Milestones that mark a life of showing up.</p><div class="award-grid">${items.map(([name,detail,ic,unlocked])=>`<div class="award ${unlocked?'':'locked'}"><div class="award-emblem"><div class="award-core">${icon(ic)}</div></div><b>${name}</b><small>${detail}</small></div>`).join('')}</div><div class="section-heading"><h2>This Week</h2><span>Sample history</span></div>${weekGrid()}<div class="section-heading"><h2>Recent Activity</h2><button data-action="activity">See all →</button></div><div class="buddy-row">${avatar(people[2])}<div class="buddy-copy"><b>Marcus C.</b><p>Prayed for his circle · 2h ago</p></div>${icon('heart')}</div>`}
  function weekGrid(){const daynames=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];const now=new Date(),monday=new Date(now);monday.setDate(now.getDate()-((now.getDay()+6)%7));let html='<div class="weekly-grid">';for(let i=0;i<7;i++){const date=new Date(monday);date.setDate(monday.getDate()+i);const isToday=date.toDateString()===now.toDateString();const isPast=date<now&&!isToday;const checked=isToday?count()===4:(isPast&&[0,1,3,4].includes(i));html+=`<div class="week-day ${checked?'completed':''} ${isToday?'current':''}"><span>${daynames[date.getDay()]}</span><strong>${checked?'✓':isToday?'•':'○'}</strong></div>`}return html+'</div>'}
  function history(){return `${heading('Look how far you’ve come')}<h1 class="section-large">History<span class="dot">.</span></h1><p class="section-sub">The previous days are illustrative. Today's completion is real to this demo.</p><div class="panel"><h3>This week</h3>${weekGrid()}</div><div class="panel">${[['Today',`${count()} of 4 completed`],['Yesterday','4 of 4 · sample'],['Two days ago','4 of 4 · sample'],['Three days ago','2 of 4 · sample'],['Four days ago','4 of 4 · sample']].map(([a,b])=>`<div class="history-row"><b>${a}</b><small>${b}</small></div>`).join('')}</div>`}
  function stats(){return `${heading('Steady progress')}<h1 class="section-large">Your stats<span class="dot">.</span></h1><p class="section-sub">One step at a time adds up. Historical statistics below are illustrative.</p><div class="panel"><div class="history-row"><b>Current daily progress</b><span>${count()}/4</span></div><div class="history-row"><b>Sample 5-day streak</b><span>5 days</span></div><div class="history-row"><b>Sample active days</b><span>26</span></div><div class="history-row"><b>Today’s prayers acknowledged</b><span>${state.daily.prayed.length}</span></div><div class="history-row"><b>Buddies encouraged</b><span>${state.daily.encouraged.length}</span></div></div>`}
  function youView(){return `${banner("Your Journey","You")}<div class="journey-card">${progressRing()}<div class="journey-habits">${keys.map((k,i)=>`<span>${names[i]}<b>${state.daily.done[k]?"✓":"○"}</b></span>`).join("")}</div></div><div class="you-profile"><div class="large-avatar">JW</div><div><h2>Jonathan W.</h2><p>Wednesday Group · Demo profile</p></div><button class="mini-button" data-action="settings">${icon('info','inline-icon')} Demo</button></div><div class="profile-stats"><div>${icon('flame')}<b>5</b><small>Day streak*</small></div><div>${icon('check')}<b>26</b><small>Days active*</small></div><div>${icon('bars')}<b>${Math.round(count()/4*100)}%</b><small>Today</small></div></div><div class="profile-tabs">${['awards','history','stats'].map(p=>`<button class="${profileTab===p?'active':''}" data-profile="${p}">${p[0].toUpperCase()+p.slice(1)}</button>`).join('')}</div>${profileTab==='awards'?awards():profileTab==='history'?history():stats()}<div class="section-heading"><h2>Demo controls</h2></div><button class="settings-row" data-action="reset"><span>Reset today’s sample progress</span>${icon('reset')}</button><button class="settings-row" data-action="settings"><span>About this prototype</span>${icon('info')}</button><p class="footer-note">*Historical streak and activity totals are fictional examples, not real tracked data. This is an independent, unofficial concept—not an official Citizen Church app.</p>`}
  function render(preserve=false){const main=$('content');let y=preserve?main.scrollTop:0;main.innerHTML=tab==='today'?todayView():tab==='grow'?growView():tab==='groups'?groupsView():youView();$('bottom-nav').innerHTML=[['today','navToday','Today'],['grow','navGrow','Grow'],['groups','navGroups','My Group'],['you','navYou','You']].map(([id,ic,label])=>`<button class="nav-item ${tab===id?'active':''}" data-tab="${id}" aria-current="${tab===id?'page':'false'}">${icon(ic)}<span>${label}</span></button>`).join('');main.scrollTop=y;renderSheet()}
  function goto(t,sub){tab=t;if(sub)growTab=sub;else if(t==='grow')growTab='read';render();}
  function grow(sub){tab='grow';growTab=sub;render()}
  function notify(msg){const box=$('toast');box.textContent=msg;box.hidden=false;clearTimeout(toastTimeout);toastTimeout=setTimeout(()=>box.hidden=true,2950)}
  function celebrate(){const d=document.createElement('div');d.className='celebrate';d.innerHTML=`<div>${icon('award')}<h2>All four. Well done.</h2><p>You showed up for what matters today. Come back tomorrow and keep growing.</p></div>`;document.querySelector('.phone-shell').appendChild(d);clearTimeout(celebrateTimeout);celebrateTimeout=setTimeout(()=>d.remove(),2800)}
  function finish(key){const was=count();state.daily.done[key]=true;if(was!==4&&count()===4)state.persistent.totalComplete++;save();render(true);if(was!==4&&count()===4)celebrate();else notify(({read:'Reading complete. A little progress adds up.',share:'Reflection complete. Thanks for showing up.',memorize:'Verse practice complete. Well done.',pray:'Prayer time complete. Keep caring for your circle.'})[key]||'Daily activity complete.');}
  function renderSheet(){const root=$('sheet-root');if(!sheet){root.innerHTML='';return}let title='',inner='';if(sheet==='serve'){title='Serve Together';inner=servePreview()}else if(sheet==='activity'){title='Your circle, today';inner=`<p class="small-copy">These are fictional buddy updates for testing the prototype.</p><div class="panel">${people.map(p=>`<div class="feed-story">${avatar(p)}<div class="feed-text"><h4>${p.name}</h4><p>${p.activity}</p><small>${p.time}</small></div></div>`).join('')}</div><button class="main-button" data-tab="groups">View your group</button>`}else if(sheet==='settings'){title='About the demo';inner=`<div class="panel"><h3>What works now</h3><p>Four daily activities, an interactive Scripture memory game, completion tracking, a reflection journal, prayer acknowledgments, buddy nudges and reactions, awards, history, and a sample group RSVP.</p></div><div class="panel"><h3>What is simulated</h3><p>Members, their activity, the historic streak and awards, notifications, and group content. Nothing here creates an account, sends messages or connects to Church Center. Only your device stores your demo progress.</p></div><div class="panel"><h3>Branding note</h3><p>This is an unofficial, independently implemented design concept for discussion. It is not affiliated with or endorsed by Citizen Church or BuddyCheck.</p></div><button class="main-button" data-action="close-sheet">Back to the demo</button>`}root.innerHTML=`<div class="sheet-overlay" data-action="backdrop"><div class="sheet-card" role="dialog" aria-modal="true" aria-label="${esc(title)}"><div class="sheet-top"><h2>${title}</h2><button class="sheet-close" aria-label="Close" data-action="close-sheet">×</button></div>${inner}</div></div>`}
  document.addEventListener('input', e => {
    if (e.target.id === 'prayer-request') {
      state.persistent.prayerDraft = e.target.value;
      save();
    }
    if (e.target.id === 'reflection') {
      reflectionDraft = e.target.value;
      $('reflection-counter').textContent = reflectionDraft.length;
    }
  });
  document.addEventListener('click',e=>{
    const btn=e.target.closest('button,[data-action]');if(!btn)return;
    // A sleeping phone may deliver this tap before its overdue midnight timer.
    if (rollDay()) { render(true); scheduleMidnight(); }
    if(btn.dataset.tab){sheet='';goto(btn.dataset.tab);return}
    if(btn.dataset.grow){sheet='';grow(btn.dataset.grow);return}
    if(btn.dataset.profile){profileTab=btn.dataset.profile;render(true);return}
    if(btn.dataset.word){if(state.daily.words.length<5&&!state.daily.words.includes(btn.dataset.word)){state.daily.words.push(btn.dataset.word);state.daily.memoryResult='';save();render(true)}return}
    const action=btn.dataset.action;if(!action)return;
    if(action==='check-memory'){if(state.daily.memoryResult==='correct'){notify('Already completed. Great job!');return}if(state.daily.words.length!==5){notify(`Select ${5-state.daily.words.length} more word${5-state.daily.words.length===1?'':'s'} first.`);return}if(expected.every((w,i)=>state.daily.words[i]===w)){state.daily.memoryResult='correct';finish('memorize')}else{state.daily.memoryResult='incorrect';save();render(true)}return}
    if(action==='remove-word'){state.daily.words.splice(Number(btn.dataset.index),1);state.daily.memoryResult='';save();render(true);return}
    if(action==='reset-memory'){state.daily.words=[];state.daily.memoryResult='';save();render(true);notify('Words cleared. Try it again!');return}
    if(action==='finish'){finish(btn.dataset.key);return}
    if(action==='save-share'){const text=$('reflection').value.trim();if(!text){notify('Write a thought or verse before saving.');return}state.persistent.reflections[state.daily.date]=text;reflectionDraft=null;finish('share');notify('Reflection saved on this device.');return}
    if(action==='prayed'){if(!state.daily.prayed.includes(btn.dataset.id))state.daily.prayed.push(btn.dataset.id);save();render(true);notify('Prayer acknowledged for today.');return}
    if(action==='finish-pray'){state.persistent.prayerRequest=$('prayer-request').value.trim();state.persistent.prayerDraft=null;finish('pray');return}
    if(action==='encourage'){if(!state.daily.encouraged.includes(btn.dataset.id)){state.daily.encouraged.push(btn.dataset.id);save();render(true);notify('Encouragement recorded for demo. No message was sent.')}else notify('You already encouraged this buddy today.');return}
    if(action==='react'){if(!state.persistent.reactions.includes(btn.dataset.id))state.persistent.reactions.push(btn.dataset.id);else state.persistent.reactions=state.persistent.reactions.filter(x=>x!==btn.dataset.id);save();render(true);notify('Reaction updated in demo.');return}
    if(action==='rsvp'){state.persistent.rsvp=btn.dataset.value;save();render(true);notify('Sample RSVP updated.');return}
    if(action==='gathering'||action==='discussion'){
      if(tab!=='groups') goto('groups');
      $('group-'+action).focus();
      $('group-'+action).scrollIntoView({block:'start'});
      return;
    }
    if(action==='activity'||action==='settings'||action==='serve'){sheet=action;renderSheet();return}
    if(action==='close-sheet'){sheet='';renderSheet();return}
    if(action==='backdrop'){if(e.target===btn){sheet='';renderSheet()}return}
    if(action==='reset'){if(window.confirm('Reset all local demo data, including saved reflections, prayer text and RSVP?')){state=fresh();reflectionDraft=null;save();tab='today';growTab='read';profileTab='awards';render();notify('Demo activity reset.')}}
  });
  window.addEventListener('focus', resume);
  window.addEventListener('pageshow', resume);
  document.addEventListener('visibilitychange', () => {
    if (!document.hidden) resume();
  });
  rollDay();
  save();
  scheduleMidnight();
  render();
})();
