'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom');
const fs=require('node:fs'),path=require('node:path');
const Route=require('../foundation2/navigation.js');
const Intelligence=require('../rally-one-intelligence.js');
const root=path.join(__dirname,'..');
const ui={name:'Friend',campus:'north',memberships:{group:true,team:true}};
const model={role:'member',rsvp:'',teamStatus:'pending',reached:[],prayers:[],rhythm:{},teamMessages:[]};
const at=new Date('2026-11-26T12:00:00Z');
const context=(state=model,user=ui,conversation={status:'ok',unreadCount:3})=>Intelligence.derive({state,ui:user,conversation,now:at});

test('Foundation 2 navigation resolves deep links and invalid routes deterministically',()=>{
 for(const id of ['today','groups','team','read','connect']){
  assert.equal(Route.resolve(id==='today'?'':Route.href(id)),id);
  assert.equal(Route.names[id].length>0,true);
 }
 assert.equal(Route.resolve('?screen=%3Cscript%3E'),'today');
 assert.equal(Route.resolve('?screen=unknown'),'today');
 assert.equal(Route.resolve('?screen=groups&screen=team'),'groups');
 assert.deepEqual(Route.tabs,['today','groups','team','read']);
});
test('Foundation 2 shell has four real links and one consistent Connect entry',()=>{
 const doc=new JSDOM(fs.readFileSync(path.join(root,'foundation2/index.html'),'utf8')).window.document;
 assert.ok(doc.querySelector('nav#primary-nav[aria-label="Primary navigation"]'));
 assert.equal(doc.querySelectorAll('.header-connect[data-route=connect]').length,1);
 assert.ok(doc.querySelector('.brand[data-route=today]'));
 const scripts=[...doc.querySelectorAll('script[src]')].map(x=>x.getAttribute('src'));
 assert.ok(scripts.indexOf('navigation.js')>=0&&scripts.indexOf('app.js')>scripts.indexOf('navigation.js'));
 assert.equal(doc.querySelectorAll('link[rel=stylesheet]').length,1);
});
test('Four tabs render accessible current page state and unique route destinations',()=>{
 for(const id of [...Route.tabs,'connect']){
  const doc=new JSDOM('<nav>'+Route.renderTabs(id)+'</nav>').window.document;
  const anchors=[...doc.querySelectorAll('a[data-route]')];
  assert.equal(anchors.length,4);
  assert.deepEqual(anchors.map(a=>a.dataset.route),Route.tabs);
  assert.equal(anchors.filter(a=>a.hasAttribute('aria-current')).length,id==='connect'?0:1);
  assert.equal(anchors.filter(a=>a.getAttribute('aria-current')==='page')[0]?.dataset.route,id==='connect'?undefined:id);
  assert.ok(anchors.every(a=>a.getAttribute('href')===Route.href(a.dataset.route)));
  assert.ok(anchors.every(a=>a.querySelector('svg[aria-hidden=true]')));
 }
});
test('Navigation enforces one presentation owner for Groups, Team and Connect',()=>{
 const connected=context(),guest=context(model,{...ui,memberships:{group:false,team:false}});
 for(const id of ['groups','team']){
  assert.throws(()=>Route.summary(id,connected),/dedicated Gate 5 presentation owner/);
  assert.throws(()=>Route.renderRoute(id,connected),/dedicated presentation owner/);
 }
 assert.throws(()=>Route.renderRoute('connect',connected),/dedicated presentation owner/);
 assert.match(Route.summary('read',connected).detail,/Scripture/);
 assert.match(Route.summary('connect',connected).detail,/Wednesday Group/);
 assert.match(Route.summary('connect',guest).detail,/No group conversation/);
});
test('Unmigrated destination views are explicit and escaped',()=>{
 const snapshot=context();
 for(const route of ['read']){
  const markup=Route.renderRoute(route,snapshot),doc=new JSDOM(markup).window.document;
  assert.equal(doc.querySelector('h1#route-title[tabindex="-1"]')?.textContent,Route.summary(route,snapshot).title);
  assert.match(doc.querySelector('.route-stage-label').textContent,/NOT YET MIGRATED/);
  assert.equal(doc.querySelector('.route-full-app').getAttribute('href'),'../index.html');
  assert.equal(doc.querySelectorAll('[data-command]').length,0);
 }
 const input={...snapshot,model:{...snapshot.model,passage:'<img src=x onerror=alert(1)>'}};
 const html=Route.renderRoute('read',input),doc=new JSDOM(html).window.document;
 assert.equal(doc.querySelector('[onerror]'),null);
 assert.match(doc.querySelector('.route-lead').textContent,/img src/);
});
