const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const html=fs.readFileSync(path.join(root,'alive-lab.html'),'utf8');
const base=fs.readFileSync(path.join(root,'alive-lab.js'),'utf8');
const addon=fs.readFileSync(path.join(root,'alive-citizen-v02.js'),'utf8');
const css=fs.readFileSync(path.join(root,'alive-citizen-v02.css'),'utf8');
function open(t){
  const dom=new JSDOM(html,{url:'https://rally.example/alive-lab.html',runScripts:'outside-only',pretendToBeVisual:true});
  t.after(()=>dom.window.close());
  dom.window.eval(base);
  dom.window.eval(addon);
  return {w:dom.window,doc:dom.window.document,click:q=>{
    const btn=dom.window.document.querySelector(q);assert.ok(btn,q+' was not found');btn.click();
  }};
}
test('ALIVE Citizen v02 retains instagram-like story profiles and adds four real Citizen contexts',()=>{
  const labels=[...html.matchAll(/class="story-label">([^<]*)/g)].map(x=>x[1]);
  for(const label of ['My group','Maya','Chris','Central','North','This week','Serve'])assert.ok(labels.includes(label),label);
  for(const key of ['recap','central','north','serve'])assert.ok(html.includes('data-citizen-story="'+key+'"'));
  assert.ok(html.includes('role="list"'));assert.ok(html.includes('aria-label="Fictional community stories"'));
});
test('Sunday recap, campuses and Church Center use verified real public destinations',()=>{
  const links=[
    'citizenchurchpodcast.com/messages/this-is-a-house-of-generosity/',
    'www.citizen.church/sermons',
    'www.citizen.church/subscribe',
    'citizenchurch.churchcenter.com/groups/albuquerque',
    'citizenchurch.churchcenter.com/people/forms/359182',
    'citizenchurch.smugmug.com/AbqCampus/2026/Sermon-Series/This-is-A-House/WEEK-3',
    'citizenchurch.smugmug.com/North-Campus/2026/SERMON-SERIES/THIS-IS-A-HOUSE-OF'
  ];
  for(const link of links)assert.ok(html.includes(link),link);
  assert.ok(/Nov 2026 example/.test(html));
  assert.ok(/not live-synced/i.test(html));
  assert.ok(!/tonight at 6:30.*men.s night/i.test(html),'No stale upcoming event claims');
});
test('Campus selection changes only demo locale, persists, never modifies Rally Point v0.8 state',t=>{
  const {w,doc,click}=open(t);
  assert.match(doc.querySelector('#citizen-campus-name').textContent,/CENTRAL/);
  click('#citizen-campus-button');
  assert.match(doc.querySelector('#citizen-campus-name').textContent,/NORTH/);
  assert.equal(w.localStorage.getItem('rallypoint-alive-citizen-campus-v02'),'North');
  assert.equal(doc.querySelector('[data-citizen-campus-card="North"]').classList.contains('is-campus-active'),true);
  assert.equal(w.localStorage.getItem('rallypoint-phase1-2026'),null);
  click('#citizen-campus-button');
  assert.equal(w.localStorage.getItem('rallypoint-alive-citizen-campus-v02'),'Central');
});
test('Story controls open real Citizen photo previews and preserve clear external handoffs',t=>{
  const {doc,click}=open(t);
  click('[data-citizen-story="recap"]');
  assert.ok(doc.querySelector('.citizen-story-overlay')&&!doc.querySelector('.citizen-story-overlay').hidden);
  assert.match(doc.querySelector('#citizen-story-title').textContent,/House of Generosity/);
  assert.match(doc.querySelector('.citizen-story-pop a').href,/citizenchurchpodcast.com/);
  click('.citizen-story-close');
  assert.equal(doc.querySelector('.citizen-story-overlay').hidden,true);
  click('[data-citizen-story="central"]');
  assert.match(doc.querySelector('#citizen-story-title').textContent,/Central Campus/);
  click('.citizen-story-set-campus');
  assert.equal(doc.querySelector('#citizen-campus-name').textContent,'CENTRAL CAMPUS');
});
test('v02 is an additive layer; no API, private profiles or implied live church messaging',()=>{
  for(const bad of ['fetch(','XMLHttpRequest','WebSocket','planningcenteronline/api','api.netlify.com'])assert.ok(!addon.includes(bad),bad);
  assert.ok(css.includes('.citizen-week'));
  assert.ok(css.includes('.citizen-campus-cards'));
  assert.ok(html.includes('No demo requests are submitted here.'));
  assert.ok(html.includes('No real-time'));
});
