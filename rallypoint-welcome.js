/* Rally Point onboarding v2. Browser-local preview only; authentication is unavailable. */
(function rallyPointWelcome(){
  'use strict';
  const gateway=document.getElementById('rp-gateway');if(!gateway)return;
  const entry=document.getElementById('rp-entry'),onboard=document.getElementById('rp-onboard'),actions=document.getElementById('rp-entry-actions');
  const rallyOne = new URLSearchParams(location.search).get('rallyOne') === '1';
  const brandName = rallyOne ? 'Rally One' : 'Rally Point';
  const theme=document.querySelector('meta[name="theme-color"]'),params=new URLSearchParams(location.search);
  // Reuse the shared header link so every entry screen opens the same playlist.
  const playlistLink=document.querySelector('.header .spotify-link')?.outerHTML||'';
  if (rallyOne) {
    gateway.classList.add('ro-welcome');
    gateway.setAttribute('aria-label', 'Welcome to Rally One');
    const brand = entry.querySelector('.rp-entry-brand');
    const titleCard = document.createElement('img');
    titleCard.className = 'ro-title-card';
    titleCard.src = 'assets/rally-one/title-card.jpg';
    titleCard.width = 1536;
    titleCard.height = 864;
    titleCard.alt = 'Rally One. We rally so no one stands alone. Citizen Church.';
    brand.removeAttribute('aria-label');
    brand.replaceChildren(titleCard);
    entry.querySelector('.rp-splash-tagline').hidden = true;
    entry.querySelector('[data-welcome="create"]').lastChild.textContent = 'Create account';
    entry.querySelector('[data-welcome="login"]').lastChild.textContent = 'Sign in';
    entry.querySelector('.rp-entry-note').textContent = 'Interactive demo';
  } else {
    entry.insertAdjacentHTML('afterbegin', playlistLink);
  }
  const SESSION_KEY='rallypoint-welcome-preview-session',UI_KEY='rallypoint-today-ui-v1',APP_KEY='rallypoint-phase1-2026';
  const reduced=window.matchMedia?.('(prefers-reduced-motion: reduce)').matches;
  const appTargets=[...document.querySelectorAll('.phone-inner > .header,.phone-inner > main,.phone-inner > nav,#dialog-root')];
  const html=s=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const campuses=[['central','Central','ALBUQUERQUE'],['north','North','ALBUQUERQUE'],['maui','Maui','HAWAI‘I'],['online','Online','WHEREVER YOU ARE']];
  const paths={arrow:'<path d="M5 12h14m-6-6 6 6-6 6"/>',back:'<path d="m14 5-7 7 7 7"/>',email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',lock:'<rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',eye:'<path d="M2 12s4-7 10-7 10 7 10 7-4 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',pin:'<path d="M19 9c0 5-7 13-7 13S5 14 5 9a7 7 0 1 1 14 0Z"/><circle cx="12" cy="9" r="2"/>',screen:'<rect x="2" y="3" width="20" height="14" rx="2"/><path d="M7 21h10m-5-4v4m-2-10 5-3-5-3z"/>',waves:'<path d="m2 6 4 2 4-2 4 2 4-2 4 2M2 11l4 2 4-2 4 2 4-2 4 2M2 16l4 2 4-2 4 2 4-2 4 2"/>',compass:'<circle cx="12" cy="12" r="9"/><path d="m15 9-2 5-4 1 2-5z"/>',group:'<circle cx="9" cy="8" r="3"/><path d="M3 20v-2a6 6 0 0 1 12 0v2M17 5a3 3 0 0 1 0 6m2 9v-2a6 6 0 0 0-3-5"/>',leader:'<path d="m12 2 8 4v6c0 5-3.5 8-8 10-4.5-2-8-5-8-10V6z"/><path d="m8 12 3 3 5-6"/>',team:'<path d="m12 3 10 5-10 5L2 8zM2 12l10 5 10-5M2 16l10 5 10-5"/>',check:'<path d="m4 12 5 5 11-11"/>'};
  const icon=name=>'<svg viewBox="0 0 24 24" aria-hidden="true">'+(paths[name]||paths.arrow)+'</svg>';
  function read(key){try{const v=JSON.parse(localStorage.getItem(key)||'null');return v&&typeof v==='object'&&!Array.isArray(v)?v:{};}catch{return {};}}
  const initial=read(UI_KEY);
  let flow='campus',campus=campuses.some(c=>c[0]===initial.campus)?initial.campus:'',kind='',name='',membership={group:false,team:false},editingCampus=false,opened=false,error='';
  function setAppInert(value){appTargets.forEach(el=>{el.inert=value;if(value)el.setAttribute('aria-hidden','true');else el.removeAttribute('aria-hidden');});}
  function themeEntry(){gateway.classList.remove('rp-gateway--exiting');gateway.hidden=false;setAppInert(true);document.body.classList.add('rp-welcome-active');if(theme)theme.content=rallyOne?'#242424':'#E3002B';}
  function welcome(){flow='campus';onboard.hidden=true;entry.hidden=false;gateway.dataset.screen='welcome';gateway.setAttribute('aria-label','Welcome to '+brandName);entry.querySelector('[data-welcome="create"]').focus({preventScroll:true});}
  function showApp(){
    if(opened)return;opened=true;
    try{sessionStorage.setItem(SESSION_KEY,'entered');}catch{}
    const next=new URL(location.href);next.searchParams.delete('welcome');history.replaceState(null,'',next.pathname+next.search+next.hash);
    gateway.classList.add('rp-gateway--exiting');
    setTimeout(()=>{gateway.hidden=true;setAppInert(false);document.body.classList.remove('rp-welcome-active');if(theme)theme.content='#E3002B';document.title=brandName+' — Today · Demo';document.querySelector('.brand-home')?.click();document.getElementById('view')?.focus({preventScroll:true});},reduced?0:240);
  }
  function begin(){
    if (rallyOne) document.title = 'Rally One — Today · Demo';
    let entered=false;try{entered=sessionStorage.getItem(SESSION_KEY)==='entered';}catch{}
    if(params.get('skipWelcome')==='1'||(entered&&params.get('welcome')!=='1')){gateway.hidden=true;if(theme)theme.content='#E3002B';return;}
    themeEntry();document.title=brandName+' — Welcome · Demo';actions.inert=true;gateway.dataset.screen='splash';
    const ready=()=>{gateway.classList.add('rp-gateway--ready');gateway.dataset.screen='welcome';actions.inert=false;};
    if(reduced){gateway.classList.add('rp-gateway--reveal');ready();return;}
    setTimeout(()=>gateway.classList.add('rp-gateway--reveal'),300);setTimeout(ready,1500);
  }
  function smallBrand(){return '<span class="rp-small-brand"><img src="assets/citizen-flag.svg" alt=""><span><b>'+(rallyOne?'RALLY <em>ONE.</em>':'RALLY POINT')+'</b><small>CITIZEN CHURCH</small></span></span>';}
  function header(){return '<div class="rp-onboard-top"><button class="rp-onboard-back" type="button" data-welcome="back" aria-label="Back">'+icon('back')+'</button>'+smallBrand()+'<span class="rp-onboard-tools">'+(rallyOne?'':playlistLink)+'<span class="rp-step-dots" role="img" aria-label="'+(flow==='login'?'Login preview':'Step '+({campus:1,choose:2,connect:3}[flow]||1)+' of 3')+'">'+[1,2,3].map(n=>'<i class="'+(n===({campus:1,choose:2,connect:3}[flow]||1)?'is-current':'')+'"></i>').join('')+'</span></span></div>';}
  function option(value,title,description,glyph,selected,attr='role'){return '<button type="button" class="rp-onboard-card" data-welcome-'+attr+'="'+value+'" aria-pressed="'+selected+'"><span class="rp-onboard-card-icon">'+icon(glyph)+'</span><span class="rp-onboard-card-copy"><strong>'+title+'</strong><small>'+description+'</small></span><span class="rp-onboard-card-check" aria-hidden="true">'+(selected?'✓':'')+'</span></button>';}
  function campusCards(){return '<div class="rp-campus-grid" role="group" aria-label="Choose your campus">'+campuses.map(([id,title,place])=>'<button type="button" class="rp-campus-card rp-campus-'+id+'" data-welcome-campus="'+id+'" aria-pressed="'+(campus===id)+'" aria-label="'+title+' Campus'+(id==='online'?', wherever you are':'')+'"><img src="assets/campuses/'+id+'.jpg" alt=""><span class="rp-campus-shade"></span><span class="rp-campus-copy"><strong>'+icon(id==='online'?'screen':id==='maui'?'waves':'pin')+title.toUpperCase()+'</strong><small>'+place+'</small></span><span class="rp-campus-check" aria-hidden="true">'+icon('check')+'</span></button>').join('')+'</div>';}
  function login(){return '<div class="rp-screen-heading"><p class="rp-kicker">'+(rallyOne?'SIGN IN':'LOG IN')+' <span></span></p><h2 tabindex="-1">Welcome<br>Back</h2><p>Explore the '+brandName+' sign-in preview.</p></div><div class="rp-login-fields"><div class="rp-login-field">'+icon('email')+'<label for="rp-login-email" class="rp-sr-only">Email preview, locked sample</label><input id="rp-login-email" type="email" value="alex@example.test" readonly autocomplete="off" aria-describedby="rp-auth-note"></div><div class="rp-login-field">'+icon('lock')+'<label for="rp-login-password" class="rp-sr-only">Password preview, locked sample</label><input id="rp-login-password" type="password" value="demo-only" readonly autocomplete="off" aria-describedby="rp-auth-note"><button type="button" data-welcome="show-password" aria-label="Show sample password" aria-pressed="false">'+icon('eye')+'</button></div><button type="button" class="rp-forgot" data-welcome="forgot">Forgot password?</button></div><p id="rp-auth-note" class="rp-auth-note">Prototype only. Fields are locked sample values.<br>Do not enter real credentials.</p><button type="button" class="rp-onboard-continue" disabled>LOG IN · UNAVAILABLE '+icon('lock')+'</button><p class="rp-auth-methods">Email, Apple and Google authentication are not connected in this prototype.</p><p id="rp-login-feedback" class="rp-login-feedback" role="status"></p><button type="button" class="rp-onboard-continue rp-button-charcoal" data-welcome="demo">Continue to demo '+icon('arrow')+'</button><button type="button" class="rp-create-link" data-welcome="create">New here? <u>Create a demo profile</u></button>';}
  function render(){
    entry.hidden=true;onboard.hidden=false;onboard.scrollTop=0;gateway.scrollTop=0;gateway.dataset.screen=flow;let main='';
    if(flow==='campus')main='<div class="rp-screen-heading"><p class="rp-kicker">YOUR CAMPUS <span></span></p><h2 tabindex="-1">Where do you<br>call home?</h2><p>We’ll bring your campus community<br>a little closer.</p></div>'+campusCards();
    else if(flow==='choose')main='<div class="rp-screen-heading"><p class="rp-kicker">YOUR CONNECTION <span></span></p><h2 tabindex="-1">Let’s find<br>your place.</h2><p>How are you connected to Citizen Church?</p></div><div class="rp-onboard-options" role="group" aria-label="Choose your connection type">'+option('guest','Exploring / Guest','Visiting or discovering community','compass',kind==='guest')+option('connected','Group Member / Serving Volunteer','A group, a team, or both','group',kind==='connected')+option('leader','Group or Team Leader','Leadership access requires verification','leader',kind==='leader')+'</div>';
    else if(flow==='connect'){
      main='<div class="rp-screen-heading"><p class="rp-kicker">YOUR COMMUNITY <span></span></p><h2 tabindex="-1">'+(kind==='guest'?'Make yourself<br>at home.':'Connected,<br>your way.')+'</h2><p>Groups and serving teams can be part of your life at the same time.</p></div>';
      if(kind!=='guest')main+='<div class="rp-onboard-options" role="group" aria-label="Your group and team preferences">'+option('group','Small group','Gatherings, conversations and connections','group',membership.group,'membership')+option('team','Serving team','Commitments and team communication','team',membership.team,'membership')+'</div>';
      else main+='<div class="rp-onboard-confirm"><strong>There’s room for you here.</strong><p>Start with Scripture and explore ways to connect. No group or team membership is required.</p></div>';
      main+='<label class="rp-onboard-field">What should we call you?<input id="rp-onboard-name" type="text" autocomplete="given-name" maxlength="24" placeholder="First name (optional)" value="'+html(name)+'"></label>';
      if(kind==='leader')main+='<div class="rp-onboard-confirm"><strong>Leadership needs verification</strong><p>Choosing Leader does not unlock private attendance or follow-up tools. A future church-authorized process must verify permissions. This preview opens as a member.</p></div>';
    }else if(flow==='login')main=login();
    if (rallyOne) main = main.replaceAll('<br>', ' ');
    if (rallyOne && flow === 'login') {
      main = main
        .replace('Welcome Back', 'Welcome back')
        .replace('<p>Explore the Rally One sign-in preview.</p>', '')
        .replace('Prototype only. Fields are locked sample values.<br>Do not enter real credentials.', 'Demo sign-in uses sample credentials.')
        .replace('<p class="rp-auth-methods">Email, Apple and Google authentication are not connected in this prototype.</p>', '');
    }
    const disabled=flow==='campus'?!campus:flow==='choose'?!kind:flow==='connect'&&kind!=='guest'&&!membership.group&&!membership.team;
    const footer=flow==='login'?'':'<div class="rp-onboard-spacer"></div>'+(error?'<p class="rp-save-error" role="alert">'+html(error)+'</p>':'')+'<button class="rp-onboard-continue" type="button" data-welcome="'+(flow==='connect'?'finish':'next')+'" '+(disabled?'disabled':'')+'>'+(flow==='connect'?'Open Today':'CONTINUE')+' '+icon('arrow')+'</button>'+(error?'<button type="button" class="rp-create-link" data-welcome="unsaved">Enter demo without saving</button>':'')+'<small class="rp-onboard-foot">Demo profile · saved on this device</small>';
    onboard.innerHTML=header()+main+footer;gateway.setAttribute('aria-label',flow==='login'?'Login preview':flow==='campus'?'Choose your campus':'Personalize your demo');
    const heading=onboard.querySelector('h2');heading?.focus({preventScroll:true});gateway.scrollTop=0;gateway.scrollLeft=0;
  }
  function returnToApp(){let stored=false;try{sessionStorage.setItem(SESSION_KEY,'entered');stored=true;}catch{}const next=new URL(location.href);next.searchParams.delete('welcome');if(!stored)next.searchParams.set('skipWelcome','1');window.location.replace(next.pathname+next.search+next.hash);}
  function savePreview(campusOnly=false){
    try{
      // Parse without fallback here: never replace an unreadable existing record silently.
      const ui=JSON.parse(localStorage.getItem(UI_KEY)||'null')||{};
      ui.campus=campus;
      if(!campusOnly){ui.name=name.trim()||ui.name||'Friend';ui.memberships={...ui.memberships,group:kind==='guest'?false:membership.group,team:kind==='guest'?false:membership.team};ui.seenGroupSignature='';ui.onboarding={version:2,connection:kind,completed:true};}
      const app=JSON.parse(localStorage.getItem(APP_KEY)||'null')||{};
      if(!campusOnly){app.role='member';app.view='today';app.groupPane='chat';app.teamPane='schedule';}
      localStorage.setItem(UI_KEY,JSON.stringify(ui));if(!campusOnly)localStorage.setItem(APP_KEY,JSON.stringify(app));
    }catch{error='This browser could not save your preferences. Existing demo data has not been reset. Try again, or enter without saving.';render();return;}
    returnToApp();
  }
  gateway.addEventListener('input',ev=>{if(ev.target.id==='rp-onboard-name')name=ev.target.value.slice(0,24);});
  gateway.addEventListener('click',ev=>{
    const btn=ev.target.closest('[data-welcome],[data-welcome-campus],[data-welcome-role],[data-welcome-membership]');if(!btn||!gateway.contains(btn))return;
    if(btn.dataset.welcomeCampus){const chosen=btn.dataset.welcomeCampus;if(!campuses.some(c=>c[0]===chosen))return;campus=chosen;error='';try{const ui=JSON.parse(localStorage.getItem(UI_KEY)||'null')||{};ui.campus=campus;localStorage.setItem(UI_KEY,JSON.stringify(ui));}catch{error='Campus selection is available for this visit; your browser could not save it.';}const pos=gateway.scrollTop;render();gateway.scrollTop=pos;onboard.querySelector('[data-welcome-campus="'+campus+'"]').focus({preventScroll:true});return;}
    if(btn.dataset.welcomeRole){kind=btn.dataset.welcomeRole;membership={group:kind!=='guest',team:false};render();onboard.querySelector('[data-welcome-role="'+kind+'"]').focus({preventScroll:true});return;}
    if(btn.dataset.welcomeMembership){const which=btn.dataset.welcomeMembership;if(which==='group'||which==='team')membership[which]=!membership[which];render();onboard.querySelector('[data-welcome-membership="'+which+'"]').focus({preventScroll:true});return;}
    switch(btn.dataset.welcome){
      case 'create':editingCampus=false;flow='campus';kind='';name='';error='';render();break;
      case 'login':flow='login';render();break;
      case 'show-password':{const input=onboard.querySelector('#rp-login-password'),show=input.type==='password';input.type=show?'text':'password';btn.setAttribute('aria-pressed',String(show));btn.setAttribute('aria-label',show?'Hide sample password':'Show sample password');break;}
      case 'forgot':onboard.querySelector('#rp-login-feedback').textContent='Password recovery is unavailable. No account or recovery email is created in this demo.';break;
      case 'demo':showApp();break;
      case 'back':back();break;
      case 'next':if(flow==='campus'&&campus){if(editingCampus)savePreview(true);else{flow='choose';render();}}else if(flow==='choose'&&kind){flow='connect';render();}break;
      case 'finish':if(flow==='connect'&&(kind==='guest'||membership.group||membership.team))savePreview();break;
      case 'unsaved':showApp();break;
    }
  });
  function back(){error='';if(flow==='connect'){flow='choose';render();}else if(flow==='choose'){flow='campus';render();}else if(flow==='campus'&&editingCampus)showApp();else welcome();}
  document.addEventListener('keydown',ev=>{
    if(gateway.hidden)return;
    if(ev.key==='Escape'&&!onboard.hidden){ev.preventDefault();back();return;}
    if(ev.key==='Tab'){const nodes=[...gateway.querySelectorAll('button:not(:disabled),input,a[href]')].filter(e=>!e.closest('[hidden],[inert]')&&getComputedStyle(e).visibility!=='hidden'),first=nodes[0],last=nodes[nodes.length-1];if(!nodes.length){ev.preventDefault();return;}if(ev.shiftKey&&(document.activeElement===first||!gateway.contains(document.activeElement))){ev.preventDefault();last.focus();}else if(!ev.shiftKey&&(document.activeElement===last||!gateway.contains(document.activeElement))){ev.preventDefault();first.focus();}}
  });
  // Add the campus preference to existing demo controls without changing the four-tab app.
  const dialogRoot=document.getElementById('dialog-root');
  function campusPreference(){if(!dialogRoot?.querySelector('#role')||dialogRoot.querySelector('[data-campus-settings]'))return;const ui=read(UI_KEY),current=campuses.find(c=>c[0]===ui.campus);const button=document.createElement('button');button.type='button';button.className='btn outline';button.dataset.campusSettings='true';button.textContent='Campus preference · '+(current?current[1]:'Choose a campus');dialogRoot.querySelector('.rp-sheet').append(button);}
  if(dialogRoot){new MutationObserver(campusPreference).observe(dialogRoot,{childList:true,subtree:true});dialogRoot.addEventListener('click',ev=>{if(!ev.target.closest('[data-campus-settings]'))return;dialogRoot.querySelector('[data-action="close-dialog"]')?.click();opened=false;editingCampus=true;campus=read(UI_KEY).campus||'';error='';themeEntry();flow='campus';render();});}
  begin();
})();
