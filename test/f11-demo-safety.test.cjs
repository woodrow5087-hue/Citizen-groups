const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');

function demo(t,{loadApp=false}={}){
  const w=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{
    url:'https://rally.test/?skipWelcome=1',runScripts:'outside-only',pretendToBeVisual:true
  }).window;
  t.after(()=>w.close());
  w.HTMLElement.prototype.scrollIntoView=function(){};
  const files=loadApp?['rallypoint-today.js','rallypoint-ui.js','rallypoint-memorize.js','rallypoint-verseplay-ui.js','rallypoint-demo-safety.js','rallypoint.js']:['rallypoint-demo-safety.js'];
  for(const f of files)w.eval(fs.readFileSync(path.join(root,f),'utf8'));
  return w;
}
test('F-11 reset clears every Rally Point-owned local and session key, including future achievements, without wiping other apps',t=>{
  const w=demo(t),local=w.localStorage,session=w.sessionStorage;
  const fixture={
    'rallypoint-phase1-2026':'{"view":"group"}',
    'rallypoint-today-ui-v1':'{"name":"Alex"}',
    'rallypoint-blank-battle-v1':'{"progress":99}',
    'rallypoint-achievements-v2':'{"streak":8}',
    'rally-point-future-demo-keys':'test'
  };
  for(const [key,value] of Object.entries(fixture))local.setItem(key,value);
  session.setItem('rallypoint-welcome-preview-session','entered');
  local.setItem('citizen-premium-hybrid-demo-v1','keep-this');
  local.setItem('other-service','keep-that');
  session.setItem('unrelated-session','preserve');
  const result=w.RallyDemoSafety.resetAll({navigate:false});
  assert.deepEqual({ok:result.ok,removedLocal:result.removedLocal,removedSession:result.removedSession},{ok:true,removedLocal:5,removedSession:1});
  for(const key of Object.keys(fixture))assert.equal(local.getItem(key),null,key);
  assert.equal(session.getItem('rallypoint-welcome-preview-session'),null);
  assert.equal(local.getItem('citizen-premium-hybrid-demo-v1'),'keep-this');
  assert.equal(local.getItem('other-service'),'keep-that');
  assert.equal(session.getItem('unrelated-session'),'preserve');
});
test('F-11 personal contact examples are blocked and fictional samples are available',t=>{
  const w=demo(t),a=w.RallyDemoSafety;
  for(const content of ['alex@gmail.com','Email me at test@example.org','Call 505-555-1234','https://example.com/my-profile','www.example.com','123-45-6789','4111 1111 1111 1111'])assert.equal(a.checkText(content).ok,false,content);
  for(const id of ['group','team','prayer','direct'])assert.equal(a.checkText(a.samples[id]).ok,true,id);
  assert.equal(a.checkText(' ').ok,false);
});
test('F-11 demo controls present irreversible-reset confirmation, a cancel path and fictional example insertion',t=>{
  const w=demo(t,{loadApp:true}),d=w.document;
  assert.ok(d.querySelector('.rp-demo-chip'));
  d.querySelector('.profile-avatar').click();
  assert.ok(d.querySelector('[data-action="reset-demo"]'),'reset is discoverable in profile controls');
  d.querySelector('[data-action="reset-demo"]').click();
  assert.match(d.querySelector('#dialog-root').textContent,/This clears Rally Point data saved in this browser/);
  assert.ok(d.querySelector('[data-action="confirm-demo-reset"]'));
  d.querySelector('[data-action="demo-controls"]').click();
  assert.ok(d.querySelector('[data-action="reset-demo"]'),'cancel returns safely');
  d.querySelector('[data-action="close-dialog"]').click();
  d.querySelector('#nav [data-go="group"]').click();
  d.querySelector('[data-action="fill-demo-example"][data-value="group"]').click();
  const field=d.getElementById('group-input');
  assert.equal(field.value,w.RallyDemoSafety.samples.group);
  d.querySelector('[data-action="send"][data-value="group"]').click();
  const state=JSON.parse(w.localStorage.getItem('rallypoint-phase1-2026'));
  assert.ok(state.groupMessages.some(m=>m.text===w.RallyDemoSafety.samples.group));
  d.querySelector('[data-action="fill-demo-example"][data-value="group"]').click();
  const nextField=d.getElementById('group-input');
  nextField.value='Send private details to alex@example.org';
  nextField.dispatchEvent(new w.Event('input',{bubbles:true}));
  d.querySelector('[data-action="send"][data-value="group"]').click();
  const later=JSON.parse(w.localStorage.getItem('rallypoint-phase1-2026'));
  assert.equal(later.groupMessages.length,state.groupMessages.length,'blocked content is not stored');
});
