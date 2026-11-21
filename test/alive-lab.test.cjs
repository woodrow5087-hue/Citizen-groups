const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'alive-lab.html'),'utf8');
const code=fs.readFileSync(path.join(root,'alive-lab.js'),'utf8');
const styles=fs.readFileSync(path.join(root,'alive-lab.css'),'utf8');
function open(t){
  const dom=new JSDOM(html,{url:'https://rally.example/alive-lab.html',runScripts:'outside-only',pretendToBeVisual:true});
  const w=dom.window;
  t.after(()=>dom.window.close());
  w.eval(code);
  const click=selector=>{const element=w.document.querySelector(selector);assert.ok(element,'Not found: '+selector);element.click();};
  return {w,click,doc:w.document,active:()=>w.document.querySelector('.alive-view:not([hidden])')?.dataset.view};
}
test('Alive lab remains a standalone route, maintaining the existing approved app',()=>{
  const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
  for(const name of ['alive-lab.html','alive-lab.js','alive-lab.css','index.html','rallypoint-unified-v08.css'])assert.ok(build.includes("'"+name+"'"),name);
  assert.ok(html.includes('ALIVE CONCEPT'));
  assert.ok(html.includes('FICTIONAL'));
  assert.ok(html.includes('index.html?skipWelcome=1'));
});
test('Alive lab Today is photography-led, people-first, with real accessible content rails',()=>{
  for(const text of ['Your people','Life is better','Real life.','A little more','A SEAT AT THE TABLE','Wednesday Group'])assert.ok(html.includes(text),text);
  assert.ok((html.match(/data-action="person"/g)||[]).length>=4);
  assert.ok((html.match(/class="rhythm-card/g)||[]).length>=3);
  assert.ok(html.includes('role="tablist"'));
  assert.ok(html.includes('aria-label="Main concept navigation"'));
  assert.ok(styles.includes('prefers-reduced-motion'));
  assert.ok(styles.includes('scroll-snap-type'));
});
test('Sample group RSVP toggles and persists without modifying v0.8 storage',t=>{
  const {w,click,doc,active}=open(t);
  assert.equal(active(),'today');
  click('[data-action="open-my-group"]');
  assert.equal(active(),'groups');
  click('[data-action="rsvp"]');
  assert.equal(doc.querySelector('#rsvp-label').textContent,"You're on the list ✓");
  const state=JSON.parse(w.localStorage.getItem('rallypoint-alive-lab-v1'));
  assert.equal(state.rsvp,true);
  assert.equal(w.localStorage.getItem('rallypoint-phase1-2026'),null);
  click('[data-action="rsvp"]');
  assert.equal(JSON.parse(w.localStorage.getItem('rallypoint-alive-lab-v1')).rsvp,false);
});
test('People stories, prayer and Scripture create genuine small interactions',t=>{
  const {w,click,doc}=open(t);
  click('[data-value="maya"][data-action="person"]');
  assert.match(doc.querySelector('#sheet-content').textContent,/Maya/);
  assert.equal(doc.querySelector('#sheet-layer').hidden,false);
  click('[data-action="close-sheet"]');
  click('[data-action="open-scripture"]');
  assert.match(doc.querySelector('#sheet-content').textContent,/John 15:12/i);
  click('[data-action="read-complete"]');
  assert.match(doc.querySelector('#sheet-content').textContent,/Marked read/);
  click('[data-action="close-sheet"]');
  click('[data-action="open-prayer"]');
  click('[data-action="mark-prayed"]');
  assert.match(doc.querySelector('#sheet-content').textContent,/Prayer marked/);
  const state=JSON.parse(w.localStorage.getItem('rallypoint-alive-lab-v1'));
  assert.equal(state.prayed,true);assert.equal(state.read,true);
});
test('Group Explore stays independent of existing group; fictional chat saves only prewritten sample',t=>{
  const {w,click,doc}=open(t);
  click('[data-nav="groups"]');
  click('[data-action="group-tab"][data-value="explore"]');
  assert.equal(doc.querySelector('#group-mine').hidden,true);
  assert.equal(doc.querySelector('#group-explore').hidden,false);
  click('[data-action="preview-group"][data-value="north"]');
  assert.match(doc.querySelector('#sheet-content').textContent,/Northside Crew/);
  click('[data-action="save-group"][data-value="north"]');
  assert.match(doc.querySelector('#sheet-content').textContent,/Saved in this concept/);
  click('[data-action="close-sheet"]');
  click('[data-action="group-tab"][data-value="mine"]');
  click('[data-action="open-chat"]');
  click('[data-action="post-hello"]');
  assert.match(doc.querySelector('#sheet-content').textContent,/Looking forward to seeing everyone!/);
  const state=JSON.parse(w.localStorage.getItem('rallypoint-alive-lab-v1'));
  assert.equal(state.hello,true);
  assert.equal(state.saved.north,true);
  assert.equal(doc.querySelector('#group-explore').hidden,true);
});
test('The lab has no real authentication, messaging endpoint or member data APIs',()=>{
  for(const bad of ['fetch(','XMLHttpRequest','WebSocket','planningcenteronline','supabase.co','api.netlify.com'])assert.equal(code.includes(bad),false,bad);
  assert.ok(code.includes("All people, stories, group meetings and actions are fictional"));
});
