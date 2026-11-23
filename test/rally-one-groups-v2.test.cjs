'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const crypto=require('node:crypto');
const vm=require('node:vm');
const {JSDOM}=require('jsdom');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
function api(){
 const ctx={};vm.runInNewContext(read('rally-one-groups-v2.js'),ctx);
 return ctx.RallyGroupsV2;
}
const parse=html=>new JSDOM(html).window.document;
test('home is one people-first view, without the old duplicate hero and four tiles',()=>{
 const document=parse(api().renderHome({unreadCount:3,conversationStatus:'ok',nextDate:'Wednesday, Nov 25',prayerCount:2,rsvp:'going'}));
 assert.equal(document.querySelectorAll('.gv2-rail-item').length,7);
 assert.deepEqual([...document.querySelectorAll('.gv2-rail-label')].map(x=>x.textContent),
 ['My group','Dustin','Mandy','Garrett','Nick','Aiden','Dom']);
 assert.equal(document.querySelectorAll('.gv2-group-hero').length,1);
 assert.equal(document.querySelectorAll('.gv2-widget').length,2);
 assert.equal(document.querySelectorAll('.gv2-care').length,1);
 assert.equal(document.querySelectorAll('.group-pulse,.group-community-hero,.pa-group-summary').length,0);
 assert.match(document.querySelector('.gv2-widget-chat').textContent,/3 new messages/);
 assert.match(document.querySelector('.gv2-widget-gather').textContent,/You are going/);
 assert.match(document.querySelector('.gv2-care').textContent,/2 sample prayer requests/);
});
test('every main action routes through an existing function and does not invent chat state',()=>{
 const document=parse(api().renderHome({canLead:false}));
 const one=(selector,expected)=>{const button=document.querySelector(selector);assert.ok(button,selector);for(const [k,v] of Object.entries(expected))assert.equal(button.dataset[k],v,selector+' '+k);};
 one('.gv2-rail-item:first-child button',{action:'pane',area:'group',value:'people'});
 one('.gv2-group-hero',{action:'pane',area:'group',value:'people'});
 one('.gv2-widget-chat',{go:'group',pane:'chat'});
 one('.gv2-widget-gather',{action:'pane',value:'gather'});
 one('.gv2-care',{action:'pane',value:'prayer'});
 assert.equal(document.querySelector('[data-value="leader"]'),null);
 assert.ok(parse(api().renderHome({canLead:true})).querySelector('[data-value="leader"]'));
});
test('uploaded photos are exact user images, not AI portrait placeholders',()=>{
 const asset=fs.readFileSync(path.join(root,'assets/rally-one/groups-v2-people.webp'));
 const blob=crypto.createHash('sha1').update(Buffer.concat([Buffer.from('blob '+asset.length+'\0'),asset])).digest('hex');
 assert.equal(blob,'829546ab1f3cb4e50d78afdbb2fad250e54b0776');
 assert.ok(asset.length>5000&&asset.length<16000);
 const css=read('rally-one-groups-v2.css');
 assert.match(css,/groups-v2-people\.webp/);
 for(const name of ['dustin','mandy','garrett','nick','aiden','dom']){
   assert.match(css,new RegExp('\\.gv2-photo-'+name));
 }
});
test('real picture tap opens a profile, never a fake private account or delivery',()=>{
 const module=api();
 for(const name of ['dustin','mandy','garrett','nick','aiden','dom']){
   const doc=parse(module.renderProfile(name));
   assert.equal(doc.querySelector('h1').textContent.toLowerCase(),name);
   assert.ok(doc.querySelector('.gv2-photo-'+name));
   assert.match(doc.body.textContent,/not connected to an actual Rally One member account/);
   assert.equal(doc.querySelector('button[data-go="group"][data-pane="chat"]')?.textContent.includes('group conversation'),true);
 }
 assert.equal(module.renderProfile('unknown'),'');
});
test('nonmembers see real-photo sample rail without My group or private actions',()=>{
 const module=api(),doc=parse(module.renderDiscoveryRail());
 assert.equal(doc.querySelectorAll('.gv2-rail-button[data-person]').length,6);
 assert.equal(doc.querySelector('.gv2-rail [data-value="people"]'),null,
   'Nonmembers cannot be shown a My group membership');
 assert.match(doc.body.textContent,/not verified group accounts/);
 const publicProfile=parse(module.renderProfile('aiden',{member:false}));
 assert.ok(publicProfile.querySelector('.gv2-photo-aiden'));
 assert.ok(publicProfile.querySelector('[data-action="gv2-back-discovery"]'));
 assert.equal(publicProfile.querySelector('[data-go="group"][data-pane="chat"]'),null);
 assert.equal(publicProfile.querySelector('[data-value="people"]'),null);
 const src=read('rallypoint.js');
 assert.match(src,/if\(!todayUI\.memberships\.group\)return groupBrowse\(\)/);
 assert.match(src,/renderDiscoveryRail\(\)/);
 assert.match(src,/renderProfile\(groupsV2ActiveProfile,\{member:false\}\)/);
 assert.match(src,/if\(a==='gv2-back-discovery'/);
 const welcome=read('rallypoint-welcome.js');
 assert.match(welcome,/app\.groupPane=rallyOne\?'overview':'chat'/);
});
test('Today and Groups use identical six real-photo demo profiles',()=>{
 const module=api();
 const member=parse(module.renderTodayRail(true));
 const publicPreview=parse(module.renderTodayRail(false));
 const group=parse(module.renderHome({}));
 const readNames=doc=>[...doc.querySelectorAll('.gv2-rail-button[data-person]')].map(b=>b.dataset.person);
 assert.deepEqual(readNames(member),readNames(group));
 assert.deepEqual(readNames(publicPreview),readNames(group));
 assert.deepEqual(readNames(member),['dustin','mandy','garrett','nick','aiden','dom']);
 assert.ok(member.querySelector('[data-go="group"][data-pane="people"]'));
 assert.equal(publicPreview.querySelector('[data-value="people"]'),null);
 assert.equal(publicPreview.querySelector('[data-pane="people"]'),null);
 assert.match(publicPreview.body.textContent,/no connected group account/);
 const source=read('rallypoint.js');
 assert.match(source,/renderTodayRail\(todayUI\.memberships\.group\)/);
 assert.match(source,/navigate\('group','profile'\)/);
 const css=read('rally-one-m5-mobile-parity.css');
 assert.match(css,/groups-v2-people\.webp/);
 assert.match(css,/\.gv2-photo-aiden/);
 assert.match(css,/\.gv2-photo-dom/);
});
test('member permission and discovery guards remain before Groups home',()=>{
 const source=read('rallypoint.js');
 const check=source.indexOf('if(!todayUI.memberships.group)return groupBrowse();');
 const overview=source.indexOf("s.groupPane==='overview'");
 assert.ok(check>0&&overview>check);
 assert.match(source,/groupPane:'chat'/); // Legacy default remains intact.
 assert.match(source,/if\(rallyOne\)s\.groupPane=pane\|\|'overview'/);
 assert.match(source,/if\(a==='gv2-profile'&&rallyOne&&/);
 assert.match(source,/openConnect\('thread'\);return;/);
 assert.doesNotMatch(read('rally-one-groups-v2.js'),/localStorage|sessionStorage|fetch\s*\(|WebSocket/);
});
test('HTML escapes interpolated fixture text; CSS honors touch/accessibility',()=>{
 const src=api().renderHome({nextDate:'<img src=x onerror=alert(1)>'});
 assert.match(src,/&lt;img/);assert.doesNotMatch(src,/<img src=x/);
 const css=read('rally-one-groups-v2.css');
 assert.match(css,/overflow-x:auto/);assert.match(css,/scroll-snap-type:x proximity/);
 assert.match(css,/min-height:44px/);assert.match(css,/focus-visible/);
 assert.match(css,/prefers-reduced-motion:no-preference/);
 const index=read('index.html'),build=read('scripts/build.cjs');
 for(const file of ['rally-one-groups-v2.js','rally-one-groups-v2.css']){assert.ok(index.includes(file));assert.ok(build.includes("'"+file+"'"));}
});
