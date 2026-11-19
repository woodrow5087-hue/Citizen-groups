/* Citizen Connect — Attract → Connect → Activate concept.
   All data is fictional and actions are local to this browser. */
(() => {
  "use strict";
  const STORAGE = "citizen-connect-journey-v1";
  const keys = ["read", "share", "memorize", "pray"];
  const groups = [
    {id:"wednesday",name:"Wednesday Group",tag:"ALL AGES",time:"Wednesday · 6:30 PM",place:"North Commons",image:"assets/sandia-sunset.webp",description:"Relaxed conversation, Scripture, and genuine friendships."},
    {id:"young",name:"Young Adults",tag:"YOUNG ADULTS",time:"Tuesday · 7:00 PM",place:"Northeast Heights",image:"assets/mountain.webp",description:"Find your people and build community in your season of life."},
    {id:"family",name:"Family Circle",tag:"FAMILIES",time:"Sunday · 5:00 PM",place:"Community Room",image:"assets/sandia-sunset.webp",description:"A welcoming space to grow and connect as families."}
  ];
  const opportunities = [
    {id:"food-drive",name:"Community Food Drive",tag:"CARE FOR OUR CITY",when:"Saturday · 9:00 AM",desc:"Pack food boxes and encourage neighbors alongside your group.",who:"Anna and James are interested",img:"assets/food-drive.webp"},
    {id:"camp-prep",name:"Kids Camp Prep",tag:"NEXT GENERATION",when:"Saturday · 1:00 PM",desc:"Help prepare fun, welcoming activity kits for kids.",who:"Taylor is interested",img:"assets/camp-prep.webp"},
    {id:"park-cleanup",name:"Neighborhood Cleanup",tag:"LOCAL OUTREACH",when:"Saturday · 10:00 AM",desc:"Care for our neighborhood together, one small step at a time.",who:"Marcus is interested",img:"assets/park-cleanup.webp"}
  ];
  const paths = {
    arrow:"m9 18 6-6-6-6",
    heart:"M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21.3l8.8-8.9a5.5 5.5 0 0 0 0-7.8z",
    check:"m5 12 4 4L19 6",
    book:"M12 7v14M3 18V4a2 2 0 0 1 2-2h3a6 6 0 0 1 4 2 6 6 0 0 1 4-2h3a2 2 0 0 1 2 2v14a2 2 0 0 0-2-2h-3a6 6 0 0 0-4 2 6 6 0 0 0-4-2H5a2 2 0 0 0-2 2z",
    chat:"M20 11.5a7.8 7.8 0 0 1-8 8 9.3 9.3 0 0 1-3-.5l-5 2 1.8-4.5A7.8 7.8 0 0 1 4 11.5a8 8 0 0 1 16 0z",
    hands:"M12 3v6M9 6l3 3 3-3m-9 9 4-5 5 2 3 7m6-9-4-2-5 2-2 7",
    people:"M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2M8.5 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM20 21v-2a4 4 0 0 0-3-3.87",
    sun:"M12 3v2m0 14v2M3 12h2m14 0h2m-15-6 1.5 1.5m9 9L18 18M6 18l1.5-1.5m9-9L18 6M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8",
    spark:"m12 2 2.2 7.8L22 12l-7.8 2.2L12 22l-2.2-7.8L2 12l7.8-2.2z"
  };
  const $ = selector => document.querySelector(selector);
  const esc = v => String(v == null ? "" : v).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
  const svg = k => '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="' + (paths[k] || paths.spark) + '"/></svg>';
  const avatar = id => '<img src="assets/' + id + '.webp" alt="">';
  const blank = () => ({group:"wednesday",prayed:false,encouraged:false,rsvp:"",interested:[],habits:[]});
  function load() {
    try {
      const saved = JSON.parse(localStorage.getItem(STORAGE));
      if (!saved || typeof saved !== "object") return blank();
      return {
        group:groups.some(g=>g.id===saved.group)?saved.group:"wednesday",
        prayed: saved.prayed === true,
        encouraged: saved.encouraged === true,
        rsvp: ["going","maybe"].includes(saved.rsvp) ? saved.rsvp : "",
        interested: Array.isArray(saved.interested)?saved.interested.filter(id=>opportunities.some(o=>o.id===id)):[],
        habits: Array.isArray(saved.habits)?saved.habits.filter(id=>keys.includes(id)):[]
      };
    } catch { return blank(); }
  }
  let state = load();
  let persona = "new";
  let stage = window.location.hash === "#serve" ? "activate" : "attract";
  let feedbackTimer;
  function save() { try { localStorage.setItem(STORAGE, JSON.stringify(state)); } catch {} }
  const chosen = () => groups.find(g=>g.id===state.group) || groups[0];
  function hero(type,eyebrow,title,description,tail) {
    return '<section class="stage-hero ' + type + '-hero"><div><div class="hero-eyebrow">' + eyebrow + '</div><h2>' + title + '</h2><p>' + description + '</p></div>' + (tail || "") + '</section>';
  }
  function groupOption(g) {
    const selected = g.id === state.group;
    return '<article class="group-option' + (selected?' selected':'') + '">' +
      '<img class="group-image" src="' + g.image + '" alt="">' +
      '<div class="group-content"><span class="group-tag">' + g.tag + '</span><h4>' + g.name + '</h4>' +
      '<p>' + g.time + '<br>' + g.place + '</p>' +
      '<button class="group-action" type="button" data-choose-group="' + g.id + '">' +
      (selected?'Explore this group':'Meet this group') + ' ' + (selected?'→':'↗') +
      '</button></div></article>';
  }
  function attractView() {
    if (persona === "member") {
      return hero("attract","01 / ATTRACT","Small moments.<br>Shared purpose.","A few minutes of Scripture and prayer can open the door to a conversation that lasts.") +
        '<div class="content-heading"><h3>Your Daily Rhythm</h3><span>Sample practice</span></div>' +
        '<p class="section-desc">Try these four small habits. Checkmarks stay on this device and do not affect your original Today progress.</p>' +
        '<div class="habit-samples">' + keys.map(k => '<button type="button" data-habit="' + k + '" aria-pressed="' + state.habits.includes(k) + '">' +
          svg(({read:"book",share:"chat",memorize:"spark",pray:"heart"})[k]) +
          '<b>' + k[0].toUpperCase() + k.slice(1) + '</b><small>' + (state.habits.includes(k)?"✓ Sample done":"Try it") + '</small></button>').join("") + '</div>' +
        '<div class="verse-callout"><div class="verse-icon">' + svg("people") + '</div><div><strong>Growth is better together.</strong><p>Your next step is to connect what you are learning with someone who knows you.</p></div></div>';
    }
    return hero("attract","01 / ATTRACT","There’s a place<br>for you here.","New to Citizen? Explore a small group where names become friendships.") +
      '<div class="content-heading"><h3>Find your people</h3><span>3 sample groups</span></div>' +
      '<p class="section-desc">Choose a group to see what belonging could feel like. These are fictional examples, not live church listings.</p>' +
      '<div class="group-list">' + groups.map(groupOption).join("") + '</div>';
  }
  function connectView() {
    const g = chosen();
    const title = persona === "new" ? "Now you know<br>some names." : "Your people.<br>All week long.";
    return hero("connect","02 / CONNECT",title,
      "A group becomes more meaningful when the conversation continues between gatherings.",
      '<div class="hero-avatars">' + ["anna","james","marcus","taylor"].map(avatar).join("") + '<b>' + g.name + ' · Sample circle</b></div>') +
      '<div class="content-heading"><h3>From your circle</h3><span>Fictional updates</span></div>' +
      '<section class="story-card"><div class="story-head">' + avatar("anna") +
      '<div><h4>Anna L.</h4><small>A moment shared with your group</small></div><span class="story-pill">PRAYER</span></div>' +
      '<p>“Starting a new job this week. Excited, nervous, and grateful for people who will pray with me.”</p>' +
      '<div class="story-actions">' +
        '<button type="button" data-toggle="prayed" aria-pressed="' + state.prayed + '">' +
          svg("hands") + (state.prayed?"✓ Prayed for Anna":"I prayed for Anna") + '</button>' +
        '<button type="button" data-toggle="encouraged" aria-pressed="' + state.encouraged + '">' +
          svg("heart") + (state.encouraged?"✓ Encouraged":"Send encouragement") + '</button>' +
      '</div></section>' +
      '<div class="gather-card"><div class="date-tile"><b>6:30</b><small>WED</small></div>' +
      '<div class="gather-copy"><b>Next ' + esc(g.name) + ' gathering</b><p>' + esc(g.place) + ' · Sample RSVP</p>' +
      '<div class="rsvp-actions"><button type="button" class="' + (state.rsvp==="going"?"selected":"") + '" data-rsvp="going" aria-pressed="' + (state.rsvp==="going") + '">I’m going</button>' +
      '<button type="button" class="' + (state.rsvp==="maybe"?"selected":"") + '" data-rsvp="maybe" aria-pressed="' + (state.rsvp==="maybe") + '">Maybe</button></div></div></div>' +
      '<div class="verse-callout"><div class="verse-icon">' + svg("chat") + '</div><div><strong>Something deeper than a feed.</strong><p>Even a small check-in can lead to a meaningful in-person conversation.</p></div></div>';
  }
  function serviceCard(o) {
    const interested = state.interested.includes(o.id);
    return '<article class="service-card">' +
      '<img class="service-photo" src="' + o.img + '" alt="Fictional community-service opportunity">' +
      '<div class="service-info"><div class="service-topline"><span>' + o.tag + '</span><small>' + o.when + '</small></div>' +
      '<h4>' + o.name + '</h4><p>' + o.desc + '</p>' +
      '<div class="service-together">' + svg("people") + o.who + '</div>' +
      '<button class="serve-btn" type="button" data-serve="' + o.id + '" aria-pressed="' + interested + '">' +
      (interested?"✓ Interest saved — tap to undo":"I’m interested in serving together") + '</button></div></article>';
  }
  function activateView() {
    const n = state.interested.length;
    return hero("activate","03 / ACTIVATE","Belonging becomes<br>doing good.","The first step into serving feels easier when you can take it with people you know.") +
      '<div class="content-heading"><h3>Serve Together</h3><span>Sample opportunities</span></div>' +
      '<p class="section-desc">Explore an opportunity with your circle. Expressing interest here only changes the demo; a real registration would use an approved church system.</p>' +
      '<div class="service-grid">' + opportunities.map(serviceCard).join("") + '</div>' +
      (n ? '<div class="serve-summary">' + svg("check") + '<div><strong>Interest noted for ' + n + ' sample ' + (n===1?"opportunity":"opportunities") + '.</strong><p>In a real app, the next step would be a clear, opt-in church registration or organizer follow-up. Nothing has been submitted.</p></div></div>' : '') +
      '<div class="verse-callout"><div class="verse-icon">' + svg("heart") + '</div><div><strong>From belonging to purpose.</strong><p>Imagine serving alongside the people who already know your story.</p></div></div>';
  }
  function render() {
    document.querySelectorAll("[data-persona]").forEach(btn => btn.setAttribute("aria-pressed",String(btn.dataset.persona===persona)));
    document.querySelectorAll("[data-stage]").forEach(btn => btn.setAttribute("aria-selected",String(btn.dataset.stage===stage)));
    const view = $("#journey-view");
    view.innerHTML = stage==="attract"?attractView():stage==="connect"?connectView():activateView();
    view.setAttribute("aria-labelledby","stage-"+stage);
    const descriptions = {
      attract: persona==="new"?"Find your people":"Grow together",
      connect:"Keep the connection going",
      activate:"Discover your purpose together"
    };
    const labels = {
      attract: persona==="new"?"See your circle":"Meet your circle",
      connect:"Find a way to serve",
      activate:"Start the journey again"
    };
    $("#footer-descriptor").textContent = descriptions[stage];
    const next=$("#next-stage");
    next.innerHTML = labels[stage] + ' ' + svg("arrow");
    next.setAttribute("aria-label",labels[stage]);
  }
  function setStage(next) {
    if (!["attract","connect","activate"].includes(next)) return;
    stage=next;render();$(".scroll-area").scrollTop=0;
  }
  function notice(text) {
    const el=$("#feedback");
    el.textContent=text;el.hidden=false;clearTimeout(feedbackTimer);
    feedbackTimer=setTimeout(()=>{el.hidden=true},2400);
  }
  document.addEventListener("click",event => {
    const btn=event.target.closest("button");
    if (!btn) return;
    if (btn.dataset.stage) { setStage(btn.dataset.stage);return; }
    if (btn.dataset.persona) {
      persona=btn.dataset.persona;
      setStage(persona==="new"?"attract":"connect");
      return;
    }
    if (btn.dataset.chooseGroup) {
      state.group=btn.dataset.chooseGroup;save();
      setStage("connect");
      notice("You’re previewing the " + chosen().name + " circle.");
      return;
    }
    if (btn.dataset.toggle) {
      const key=btn.dataset.toggle;
      if (key!=="prayed"&&key!=="encouraged")return;
      state[key]=!state[key];save();render();
      notice(state[key] ? (key==="prayed"?"Prayer acknowledged in this demo.":"Encouragement saved locally; no message sent.") : "Sample response cleared.");
      return;
    }
    if (btn.dataset.rsvp) {
      state.rsvp=state.rsvp===btn.dataset.rsvp?"":btn.dataset.rsvp;
      save();render();notice("Sample RSVP updated locally.");
      return;
    }
    if (btn.dataset.habit) {
      const key=btn.dataset.habit;
      if (!keys.includes(key))return;
      state.habits=state.habits.includes(key)?state.habits.filter(x=>x!==key):state.habits.concat(key);
      save();render();notice("Sample daily rhythm updated.");
      return;
    }
    if (btn.dataset.serve) {
      const id=btn.dataset.serve;
      if (!opportunities.some(o=>o.id===id))return;
      state.interested=state.interested.includes(id)?state.interested.filter(x=>x!==id):state.interested.concat(id);
      save();render();
      notice(state.interested.includes(id)?"Interest noted on this device — no signup submitted.":"Sample interest cleared.");
      return;
    }
    if (btn.id==="restart") {
      state=blank();persona="new";save();setStage("attract");notice("Journey reset to the beginning.");return;
    }
    if (btn.id==="next-stage") {
      setStage(stage==="attract"?"connect":stage==="connect"?"activate":"attract");
      return;
    }
  });
  window.addEventListener("hashchange",()=>{if(location.hash==="#serve")setStage("activate")});
  render();
})();