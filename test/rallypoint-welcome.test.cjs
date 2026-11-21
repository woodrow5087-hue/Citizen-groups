const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'rallypoint-welcome.js'),'utf8');
const UI='rallypoint-today-ui-v1',APP='rallypoint-phase1-2026',SESSION='rallypoint-welcome-preview-session';
function mount({search='?welcome=1',reduced=true,ui,app,entered=false,clock=false}={}){
  const dom=new JSDOM(html,{url:'https://rallypoint.example/'+search,runScripts:'outside-only',pretendToBeVisual:true,virtualConsole:new VirtualConsole()});
  const w=dom.window;
  w.matchMedia=()=>({matches:reduced});
  if(ui)w.localStorage.setItem(UI,JSON.stringify(ui));
  if(app)w.localStorage.setItem(APP,JSON.stringify(app));
  if(entered)w.sessionStorage.setItem(SESSION,'entered');
  const timers=[];if(clock)w.setTimeout=(fn,ms)=>{timers.push({fn,ms});};
  w.eval(script);return {dom,w,d:w.document,timers,close:()=>w.close()};
}
const click=(x,selector)=>{const el=x.d.querySelector(selector);assert.ok(el,'Missing '+selector);el.click();};
const data=(x,key)=>JSON.parse(x.w.localStorage.getItem(key));
function campus(x,id='central'){
  click(x,'#rp-entry [data-welcome="create"]');
  assert.equal(x.d.querySelector('[data-welcome="next"]').disabled,true);
  click(x,'[data-welcome-campus="'+id+'"]');click(x,'[data-welcome="next"]');
}

test('authentic flag and red splash reveal at 300ms, continuous welcome starts at 1500ms',()=>{
  const x=mount({reduced:false,clock:true}),g=x.d.querySelector('#rp-gateway'),brand=x.d.querySelector('.rp-entry-brand');
  assert.equal(g.dataset.screen,'splash');assert.equal(g.classList.contains('rp-gateway--reveal'),false);
  assert.equal(x.d.querySelector('#rp-entry-actions').inert,true);
  assert.equal(x.d.querySelector('.rp-entry-logo').getAttribute('src'),'assets/citizen-flag.svg');
  assert.equal(x.d.querySelector('meta[name="theme-color"]').content,'#E3002B');
  assert.deepEqual(x.timers.map(t=>t.ms),[300,1500]);
  x.timers[0].fn();assert.ok(g.classList.contains('rp-gateway--reveal'));assert.equal(g.dataset.screen,'splash');
  x.timers[1].fn();assert.equal(g.dataset.screen,'welcome');assert.ok(g.classList.contains('rp-gateway--ready'));
  assert.equal(x.d.querySelector('.rp-entry-brand'),brand);assert.equal(x.d.querySelector('#rp-entry-actions').inert,false);x.close();
});
test('reduced motion shows the two welcome actions immediately and isolates underlying app',()=>{
  const x=mount(),g=x.d.querySelector('#rp-gateway');assert.equal(g.dataset.screen,'welcome');
  assert.equal(x.d.querySelectorAll('#rp-entry-actions button').length,2);
  assert.equal(x.d.querySelector('#view').inert,true);assert.equal(x.d.querySelector('#nav').getAttribute('aria-hidden'),'true');x.close();
});
test('campus cards use all supplied photographs and persist only the selected campus',()=>{
  const ui={name:'Jess',memberships:{group:true,team:true},encouraged:['marcus']},app={read:true,prayers:[{text:'Keep this'}],role:'member'};
  const x=mount({ui,app});click(x,'[data-welcome="create"]');
  for(const id of ['central','north','maui','online']){
    assert.equal(x.d.querySelector('[data-welcome-campus="'+id+'"] img').getAttribute('src'),'assets/campuses/'+id+'.jpg');
    click(x,'[data-welcome-campus="'+id+'"]');
    assert.equal(x.d.querySelectorAll('.rp-campus-card[aria-pressed="true"]').length,1);
    assert.deepEqual(data(x,UI),{...ui,campus:id});assert.deepEqual(data(x,APP),app);
  }x.close();
});
test('leader connection never grants leadership, preserves saved app data and allows both memberships',()=>{
  const app={role:'leader',read:true,prayed:true,rsvp:'going',groupMessages:[{text:'Keep my message'}],attendance:{marcus:'here'}},ui={name:'Jess',privateNote:'Keep private'};
  const x=mount({app,ui});campus(x,'north');click(x,'[data-welcome-role="leader"]');click(x,'[data-welcome="next"]');
  assert.match(x.d.querySelector('#rp-onboard').textContent,/Leadership needs verification/);
  assert.match(x.d.querySelector('#rp-onboard').textContent,/does not unlock private attendance/);
  click(x,'[data-welcome-membership="team"]');click(x,'[data-welcome="finish"]');
  const saved=data(x,APP);assert.equal(saved.role,'member');
  for(const k of ['read','prayed','rsvp','groupMessages','attendance'])assert.deepEqual(saved[k],app[k]);
  assert.deepEqual(data(x,UI).memberships,{group:true,team:true});assert.equal(data(x,UI).campus,'north');
  assert.equal(data(x,UI).privateNote,'Keep private');assert.equal(data(x,UI).onboarding.connection,'leader');
  assert.equal(x.w.sessionStorage.getItem(SESSION),'entered');x.close();
});
test('guest path works without membership; connection preferences can be corrected using Back',()=>{
  const x=mount();campus(x,'maui');click(x,'[data-welcome-role="connected"]');click(x,'[data-welcome="next"]');
  click(x,'[data-welcome-membership="group"]');assert.equal(x.d.querySelector('[data-welcome="finish"]').disabled,true);
  click(x,'[data-welcome="back"]');click(x,'[data-welcome-role="guest"]');click(x,'[data-welcome="next"]');
  assert.equal(x.d.querySelectorAll('[data-welcome-membership]').length,0);
  const input=x.d.querySelector('#rp-onboard-name');input.value='Alex';input.dispatchEvent(new x.w.Event('input',{bubbles:true}));
  click(x,'[data-welcome="finish"]');assert.equal(data(x,UI).name,'Alex');assert.deepEqual(data(x,UI).memberships,{group:false,team:false});x.close();
});
test('login preview cannot collect credentials; explicit demo entry preserves existing records',async()=>{
  const app={read:true,rsvp:'going',role:'member'},ui={name:'Jess',campus:'central'};
  const x=mount({app,ui});click(x,'[data-welcome="login"]');
  for(const id of ['email','password']){const input=x.d.querySelector('#rp-login-'+id);assert.equal(input.readOnly,true);assert.equal(input.name,'');}
  assert.equal(x.d.querySelector('#rp-onboard form'),null);
  assert.equal(x.d.querySelector('.rp-onboard-continue').disabled,true);
  click(x,'[data-welcome="show-password"]');assert.equal(x.d.querySelector('#rp-login-password').type,'text');
  click(x,'[data-welcome="show-password"]');assert.equal(x.d.querySelector('#rp-login-password').type,'password');
  click(x,'[data-welcome="forgot"]');assert.match(x.d.querySelector('#rp-login-feedback').textContent,/unavailable/);
  assert.equal(x.d.querySelector('#rp-gateway').hidden,false);
  click(x,'[data-welcome="demo"]');await new Promise(r=>setTimeout(r,10));
  assert.equal(x.d.querySelector('#rp-gateway').hidden,true);assert.equal(x.d.querySelector('#view').inert,false);
  assert.deepEqual(data(x,APP),app);assert.deepEqual(data(x,UI),ui);
  assert.equal(x.w.sessionStorage.getItem(SESSION),'entered');assert.equal(x.d.querySelector('meta[name="theme-color"]').content,'#E3002B');x.close();
});
test('campus can be changed later without resetting app, role or membership preferences',async()=>{
  const app={role:'leader',view:'team',read:true},ui={name:'Alex',memberships:{group:true,team:true},campus:'central'};
  const x=mount({app,ui,search:'?skipWelcome=1'});
  x.d.querySelector('#dialog-root').innerHTML='<div class="rp-sheet"><button id="role">Demo role</button></div>';
  await new Promise(r=>setTimeout(r,0));click(x,'[data-campus-settings]');
  assert.equal(x.d.querySelector('[data-welcome-campus="central"]').getAttribute('aria-pressed'),'true');
  click(x,'[data-welcome-campus="online"]');click(x,'[data-welcome="next"]');
  assert.deepEqual(data(x,APP),app);assert.deepEqual(data(x,UI),{...ui,campus:'online'});x.close();
});
test('corrupt saved records are not overwritten and offer an honest unsaved fallback',()=>{
  const x=mount();x.w.localStorage.setItem(UI,'corrupt record');click(x,'[data-welcome="create"]');click(x,'[data-welcome-campus="central"]');
  assert.match(x.d.querySelector('[role="alert"]').textContent,/could not save/);
  assert.equal(x.w.localStorage.getItem(UI),'corrupt record');assert.ok(x.d.querySelector('[data-welcome="unsaved"]'));x.close();
});
test('existing sessions bypass welcome while explicit replay remains available',()=>{
  for(const opts of [{search:'?skipWelcome=1'},{search:'',entered:true}]){const x=mount(opts);assert.equal(x.d.querySelector('#rp-gateway').hidden,true);x.close();}
  const replay=mount({entered:true});assert.equal(replay.d.querySelector('#rp-gateway').hidden,false);replay.close();
});

// The login route exits without reloading; settings must reopen the same overlay.
test('campus settings can reopen after entering through login preview',async()=>{
  const x=mount();click(x,'[data-welcome="login"]');click(x,'[data-welcome="demo"]');
  await new Promise(r=>setTimeout(r,10));
  x.d.querySelector('#dialog-root').innerHTML='<div class="rp-sheet"><button id="role">Demo role</button></div>';
  await new Promise(r=>setTimeout(r,0));click(x,'[data-campus-settings]');
  assert.equal(x.d.querySelector('#rp-gateway').hidden,false);
  assert.equal(x.d.querySelector('#rp-gateway').classList.contains('rp-gateway--exiting'),false);
  assert.equal(x.d.querySelector('#rp-gateway').dataset.screen,'campus');x.close();
});
