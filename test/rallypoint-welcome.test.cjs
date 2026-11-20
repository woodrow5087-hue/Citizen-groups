const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM,VirtualConsole}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const script=fs.readFileSync(path.join(root,'rallypoint-welcome.js'),'utf8');

function mount(search='?welcome=1'){
  const dom=new JSDOM(html,{
    url:'https://rallypoint.example/'+search,
    runScripts:'outside-only',
    pretendToBeVisual:true,
    virtualConsole:new VirtualConsole()
  });
  dom.window.matchMedia=()=>({matches:true,addListener(){},removeListener(){}});
  dom.window.eval(script);
  return dom;
}
const click=(d,selector)=>{const el=d.window.document.querySelector(selector);assert.ok(el,'Missing '+selector);el.click();};

test('branded splash uses supplied Citizen flag, matte red and two entry actions',()=>{
  const dom=mount(),d=dom.window.document;
  assert.match(d.querySelector('.rp-entry-title').textContent,/RALLY POINT/);
  assert.equal(d.querySelector('.rp-entry-logo').getAttribute('src'),'assets/citizen-flag.svg');
  assert.equal(d.querySelector('meta[name="theme-color"]').content,'#E3002B');
  assert.equal(d.querySelectorAll('#rp-entry-actions button').length,2);
  assert.equal(d.querySelector('#rp-gateway').hidden,false);
  assert.ok(d.querySelector('#rp-gateway').classList.contains('rp-gateway--ready'));
  dom.window.close();
});
test('creating a preview starts role-based onboarding without unlocking leader permission',()=>{
  const dom=mount(),d=dom.window.document;
  click(d,'[data-welcome="create"]');
  assert.equal(d.querySelector('#rp-entry').hidden,true);
  click(d,'[data-welcome-role="leader"]');
  click(d,'[data-welcome="next"]');
  assert.match(d.querySelector('#rp-onboard').textContent,/Leadership needs verification/);
  assert.match(d.querySelector('#rp-onboard').textContent,/not unlock private attendance/i);
  click(d,'[data-welcome="next"]');
  assert.match(d.querySelector('#rp-onboard').textContent,/No real account has been created/);
  click(d,'[data-welcome="finish"]');
  const app=JSON.parse(dom.window.localStorage.getItem('rallypoint-phase1-2026'));
  const ui=JSON.parse(dom.window.localStorage.getItem('rallypoint-today-ui-v1'));
  assert.equal(app.role,'member');
  assert.equal(ui.memberships.group,true);
  assert.equal(ui.memberships.team,false);
  dom.window.close();
});
test('connected members can choose both group and team in onboarding',()=>{
  const dom=mount(),d=dom.window.document;
  click(d,'[data-welcome="create"]');
  click(d,'[data-welcome-role="connected"]');
  click(d,'[data-welcome="next"]');
  click(d,'[data-welcome-membership="team"]');
  assert.equal(d.querySelector('[data-welcome-membership="team"]').getAttribute('aria-pressed'),'true');
  assert.equal(d.querySelector('[data-welcome-membership="group"]').getAttribute('aria-pressed'),'true');
  click(d,'[data-welcome="next"]');
  click(d,'[data-welcome="finish"]');
  const ui=JSON.parse(dom.window.localStorage.getItem('rallypoint-today-ui-v1'));
  assert.deepEqual(ui.memberships,{group:true,team:true});
  dom.window.close();
});
test('returning member demo login opens existing Today without collecting passwords',async()=>{
  const dom=mount(),d=dom.window.document;
  click(d,'[data-welcome="login"]');
  await new Promise(resolve=>setTimeout(resolve,15));
  assert.equal(d.querySelector('#rp-gateway').hidden,true);
  assert.equal(d.querySelector('meta[name="theme-color"]').content,'#F3E5D6');
  assert.equal(dom.window.sessionStorage.getItem('rallypoint-welcome-preview-session'),'entered');
  assert.equal(d.querySelector('input[type="password"]'),null);
  dom.window.close();
});
test('regression path may skip onboarding for existing Today tests',()=>{
  const dom=mount('?skipWelcome=1'),d=dom.window.document;
  assert.equal(d.querySelector('#rp-gateway').hidden,true);
  dom.window.close();
});