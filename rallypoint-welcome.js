/* Rally Point welcome and onboarding prototype. This deliberately does not implement authentication. */
(function rallyPointWelcome(){
  'use strict';
  const gateway=document.getElementById('rp-gateway');
  if(!gateway)return;
  const entry=document.getElementById('rp-entry');
  const onboard=document.getElementById('rp-onboard');
  const actions=document.getElementById('rp-entry-actions');
  const theme=document.querySelector('meta[name="theme-color"]');
  const params=new URLSearchParams(location.search);
  const SESSION_KEY='rallypoint-welcome-preview-session';
  const UI_KEY='rallypoint-today-ui-v1';
  const APP_KEY='rallypoint-phase1-2026';
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  const appTargets=[...document.querySelectorAll('.phone-inner > .header, .phone-inner > main, .phone-inner > nav, #dialog-root')];
  const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const icon=(name)=>{
    const paths={
      arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',
      back:'<path d="M19 12H5m6 6-6-6 6-6"/>',
      compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-4 1 2-5z"/>',
      group:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m2 9v-2a6 6 0 0 0-3-5"/>',
      leader:'<path d="m12 2 8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/>',
      team:'<path d="M12 3v18M3 12h18M5 5l14 14M19 5 5 19"/>',
      check:'<path d="m4 12 5 5 11-11"/>'
    };
    return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||paths.arrow)+'</svg>';
  };
  let flow='choose',kind='',name='',membership={group:false,team:false};
  let opened=false;

  function setAppInert(value){
    appTargets.forEach(el=>{el.inert=value;el.setAttribute('aria-hidden',value?'true':'false')});
  }
  function showApp(){
    if(opened)return;
    opened=true;
    try{sessionStorage.setItem(SESSION_KEY,'entered')}catch(_){}
    if(params.get('welcome')==='1'){
      const next=new URL(location.href);
      next.searchParams.delete('welcome');
      history.replaceState(null,'',next.pathname+next.search+next.hash);
    }
    gateway.classList.add('rp-gateway--exiting');
    window.setTimeout(()=>{
      gateway.hidden=true;
      setAppInert(false);
      document.body.classList.remove('rp-welcome-active');
      if(theme)theme.content='#F3E5D6';
      document.title='Rally Point — Today · Demo';
      const view=document.getElementById('view');
      if(view)view.focus({preventScroll:true});
    },reduced?0:240);
  }
  function begin(){
    const autoSkip=params.get('skipWelcome')==='1';
    let alreadyEntered=false;
    try{alreadyEntered=sessionStorage.getItem(SESSION_KEY)==='entered'}catch(_){}
    if(autoSkip||(alreadyEntered&&params.get('welcome')!=='1')){
      gateway.hidden=true;
      if(theme)theme.content='#F3E5D6';
      return;
    }
    setAppInert(true);
    document.body.classList.add('rp-welcome-active');
    if(theme)theme.content='#E3002B';
    document.title='Rally Point — Welcome · Demo';
    actions.inert=true;
    if(reduced){
      gateway.classList.add('rp-gateway--reveal','rp-gateway--ready');
      actions.inert=false;
      return;
    }
    window.setTimeout(()=>gateway.classList.add('rp-gateway--reveal'),300);
    window.setTimeout(()=>{
      gateway.classList.add('rp-gateway--ready');
      actions.inert=false;
    },1500);
  }
  function option(value,title,description,glyph,selected,attr='role'){
    return '<button type="button" class="rp-onboard-card" data-welcome-'+attr+'="'+value+'" aria-pressed="'+String(selected)+'">'+
      '<span class="rp-onboard-card-icon">'+icon(glyph)+'</span>'+
      '<span class="rp-onboard-card-copy"><strong>'+title+'</strong><small>'+description+'</small></span>'+
      '<span class="rp-onboard-card-check" aria-hidden="true">'+(selected?'✓':'')+'</span></button>';
  }
  function render(){
    entry.hidden=true;
    onboard.hidden=false;
    const step=flow==='choose'?1:flow==='connect'?2:3;
    let main='';
    if(flow==='choose'){
      main='<h2 tabindex="-1">Let’s find your place.</h2>'+
        '<p>How are you connected to Citizen Church? You can always explore more later.</p>'+
        '<div class="rp-onboard-options" role="group" aria-label="Choose your starting experience">'+
        option('guest','I’m exploring','I’m visiting or looking for a group','compass',kind==='guest')+
        option('connected','I’m connected','I attend a group, serve on a team, or both','group',kind==='connected')+
        option('leader','I help lead','I serve in a group or ministry leadership role','leader',kind==='leader')+'</div>';
    }else if(flow==='connect'){
      main='<h2 tabindex="-1">'+(kind==='guest'?'Welcome in.':kind==='leader'?'Where do you lead?':'Where are you connected?')+'</h2>'+
        '<p>'+(kind==='guest'?'We’ll start with an inviting Today page and ways to discover community.':'Pick what applies to you. You can belong to a group and serve on a team at the same time.')+'</p>';
      if(kind!=='guest'){
        main+='<div class="rp-onboard-options" role="group" aria-label="Your connections">'+
          option('group','Small group','Gatherings, group conversations and connections','group',membership.group,'membership')+
          option('team','Serving team','Upcoming commitments and team communication','team',membership.team,'membership')+
          '</div>';
      }
      main+='<label class="rp-onboard-field">What should we call you?<input id="rp-onboard-name" type="text" autocomplete="given-name" maxlength="24" placeholder="First name (optional)" value="'+html(name)+'"></label>';
      if(kind==='leader')main+='<div class="rp-onboard-confirm"><strong>Leadership needs verification</strong><p>Choosing this path will not unlock private attendance or follow-up tools. A church-approved account or administrator will need to confirm your role.</p></div>';
    }else{
      const title=kind==='guest'?'There’s a place for you.':kind==='leader'?'You’re ready to explore.':'You’re connected.';
      main='<div class="rp-onboard-done">'+icon('check')+'</div>'+
        '<h2 tabindex="-1">'+title+'</h2>'+
        '<p>See a personalized preview of Rally Point’s Today screen. You can return to your community and reading at any time.</p>'+
        '<div class="rp-onboard-confirm"><strong>Your preview</strong><p>'+
        (kind==='guest'?'Guest discovery experience':kind==='leader'?'Member experience while leadership verification is pending':'Group and/or serving experience')+
        '. No real account has been created, and all activity is sample data.</p></div>';
    }
    const disable=flow==='choose'?!kind:(flow==='connect'&&kind!=='guest'&&!membership.group&&!membership.team);
    onboard.innerHTML=
      '<div class="rp-onboard-top"><button class="rp-onboard-back" type="button" data-welcome="back">'+icon('back')+' Back</button>'+
      '<span class="rp-onboard-mark"><img src="assets/citizen-flag.svg" alt="">RALLY POINT</span></div>'+
      '<div class="rp-onboard-progress" aria-label="Step '+step+' of 3">'+[1,2,3].map(n=>'<span class="'+(n<=step?'current':'')+'"></span>').join('')+'</div>'+
      main+'<div class="rp-onboard-spacer"></div>'+
      '<button class="rp-onboard-continue" type="button" data-welcome="'+(flow==='done'?'finish':'next')+'" '+(disable?'disabled':'')+'>'+
      (flow==='done'?'Open my Today preview':'Continue')+'</button>'+
      '<small class="rp-onboard-foot">DESIGN PREVIEW · NO ACCOUNT OR CHURCH SYSTEM CONNECTED</small>';
    const heading=onboard.querySelector('h2');if(heading)heading.focus({preventScroll:true});
  }
  function savePreview(){
    try{
      const current=JSON.parse(localStorage.getItem(UI_KEY)||'null')||{};
      const currentMemberships=current.memberships||{};
      current.name=name||current.name||'Friend';
      current.memberships={
        ...currentMemberships,
        group:kind==='guest'?false:membership.group,
        team:kind==='guest'?false:membership.team
      };
      current.seenGroupSignature='';
      localStorage.setItem(UI_KEY,JSON.stringify(current));
      const state=JSON.parse(localStorage.getItem(APP_KEY)||'null')||{};
      state.role='member'; // Never grant leadership based on a self-selection.
      state.view='today';
      state.groupPane='chat';
      state.teamPane='schedule';
      localStorage.setItem(APP_KEY,JSON.stringify(state));
    }catch(_){
      // The live prototype can still open with existing fixtures if storage is blocked.
    }
    try{sessionStorage.setItem(SESSION_KEY,'entered')}catch(_){}
    const next=new URL(location.href);
    next.searchParams.delete('welcome');
    window.location.replace(next.pathname+next.search+next.hash);
  }
  gateway.addEventListener('input',evt=>{
    if(evt.target?.id==='rp-onboard-name')name=evt.target.value.trimStart().slice(0,24);
  });
  gateway.addEventListener('click',evt=>{
    const btn=evt.target.closest('[data-welcome],[data-welcome-role],[data-welcome-membership]');
    if(!btn||!gateway.contains(btn))return;
    if(btn.hasAttribute('data-welcome-role')){
      kind=btn.dataset.welcomeRole;
      membership={group:kind==='connected'||kind==='leader',team:false};
      render();return;
    }
    if(btn.hasAttribute('data-welcome-membership')){
      const which=btn.dataset.welcomeMembership;
      if(which==='group'||which==='team')membership[which]=!membership[which];
      if(flow==='connect'){
        const input=onboard.querySelector('#rp-onboard-name');
        if(input)name=input.value.trimStart().slice(0,24);
      }
      render();return;
    }
    switch(btn.dataset.welcome){
      case 'create': flow='choose';kind='';name='';render();break;
      case 'login': showApp();break; // Preview-only returning member path, no credential collection.
      case 'back':
        if(flow==='choose'){onboard.hidden=true;entry.hidden=false;}
        else if(flow==='connect'){flow='choose';render();}
        else if(flow==='done'){flow='connect';render();}
        break;
      case 'next':
        if(flow==='choose'&&kind){flow='connect';render();}
        else if(flow==='connect'&&(kind==='guest'||membership.group||membership.team)){
          const input=onboard.querySelector('#rp-onboard-name');
          if(input)name=input.value.trim().slice(0,24);
          flow='done';render();
        }
        break;
      case 'finish':if(flow==='done')savePreview();break;
    }
  });
  document.addEventListener('keydown',event=>{
    if(gateway.hidden||event.key!=='Escape'||onboard.hidden)return;
    event.preventDefault();
    if(flow==='done'){flow='connect';render();}
    else if(flow==='connect'){flow='choose';render();}
    else{onboard.hidden=true;entry.hidden=false;}
  });
  begin();
})();