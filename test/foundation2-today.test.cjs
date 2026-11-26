'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Intelligence=require('../rally-one-intelligence.js'),Context=require('../rally-one-member-context.js'),Model=require('../foundation2/today-model.js'),View=require('../foundation2/today-view.js');
const now=new Date('2026-11-26T12:00:00Z'),ui={name:'Friend',campus:'north',memberships:{group:true,team:true}},conversation={status:'ok',unreadCount:3};
const initial=()=>({role:'leader',rsvp:'',teamStatus:'pending',reached:[],prayers:[],rhythm:{},teamMessages:[]});
const project=(state,u=ui,c=conversation)=>Model.project(Intelligence.derive({state,ui:u,conversation:c,now}),now);
test('Foundation 2 shows every leader responsibility and chronological dates',()=>{const v=project(initial());assert.equal(v.primary.id,'serve-response');assert.deepEqual(v.secondary.map(x=>x.id),['group-rsvp','leader-checkins']);assert.deepEqual(v.schedule.map(x=>x.id),['serve','group']);assert.match(View.render(v),/data-command="leader"/);});
test('Foundation 2 uses canonical transitions and preserves optional unread activity',()=>{let s=initial();const original=s;for(const command of [Model.commandFor('serve'),Model.commandFor('rsvp'),Model.commandFor('leader','marcus'),Model.commandFor('leader','taylor')]){const r=Context.transition({state:s,ui,conversation,command,now});assert.equal(r.ok,true);s=r.state;}const v=project(s);assert.equal(v.calm,true);assert.equal(v.unread,3);assert.equal(original.rsvp,'');assert.equal(original.teamStatus,'pending');assert.equal(project(s,ui,{status:'unavailable'}).calm,false);});
test('Foundation 2 guest cannot perform member actions; escaped direct markup',()=>{const guest={...ui,memberships:{group:false,team:false}},s=initial();const v=project(s,guest);assert.equal(v.guest,true);assert.equal(v.primary,null);assert.equal(Context.transition({state:s,ui:guest,conversation,command:Model.commandFor('rsvp'),now}).ok,false);assert.doesNotMatch(View.render({...v,greeting:'<img onerror=x>'}),/<img onerror=x>/);});
test('Foundation 2 adds no files to the protected GitHub visual build',()=>{
 const fs=require('node:fs'),path=require('node:path');
 // The existing strict visual file-inventory gate performs the actual build check.
 const build=fs.readFileSync(path.join(__dirname,'../scripts/build.cjs'),'utf8');
 assert.match(build,/process\.env\.NETLIFY==='true'&&process\.env\.CONTEXT==='deploy-preview'/);
 assert.match(build,/fs\.cpSync\(path\.join\(root,'foundation2'\),path\.join\(out,'foundation2'\)/);
});

test('Foundation 2 direct Today matches the approved hierarchy without legacy markup transformations',()=>{
 const {JSDOM}=require('jsdom');
 const v=project(initial()),doc=new JSDOM('<main>'+View.render(v)+'</main>').window.document;
 assert.ok(doc.querySelector('.greeting h1'));
 assert.equal(doc.querySelectorAll('article.priority').length,1);
 assert.equal(doc.querySelectorAll('.responsibility').length,2);
 assert.equal(doc.querySelectorAll('.coming .event').length,2);
 assert.equal(doc.querySelectorAll('[data-command="leader"]').length,2);
 const groupOnly=project(initial(),{...ui,memberships:{group:true,team:false}});
 const groupDoc=new JSDOM('<main>'+View.render(groupOnly)+'</main>').window.document;
 assert.ok(groupDoc.querySelector('.priority-photo img[src$="/community.webp"]'));
 assert.equal(groupDoc.querySelectorAll('.faces img').length,3);
 assert.match(doc.querySelector('.utility strong').textContent,/3 new group messages/);
 assert.equal(doc.querySelector('[data-command="serve"]').tagName,'BUTTON');
});
test('Foundation 2 displays a truthful All Set, guest and unavailable state',()=>{
 const {JSDOM}=require('jsdom');
 let s=initial();
 for(const command of [Model.commandFor('serve'),Model.commandFor('rsvp'),Model.commandFor('leader','marcus'),Model.commandFor('leader','taylor')]){
  const r=Context.transition({state:s,ui,conversation,command,now});assert.equal(r.ok,true);s=r.state;
 }
 const parse=x=>new JSDOM('<main>'+View.render(x)+'</main>').window.document;
 const calm=parse(project(s));assert.equal(calm.querySelector('h1').textContent,'You’re all set.');
 assert.ok(calm.querySelector('.settled-photo img'));assert.equal(calm.querySelectorAll('[data-command]').length,0);
 assert.match(calm.querySelector('.utility').textContent,/Sample activity/);
 const guest=parse(project(initial(),{...ui,memberships:{group:false,team:false}}));
 assert.ok(guest.querySelector('.welcome-card a[href="../index.html"]'));
 assert.equal(guest.querySelector('.priority'),null);
 const unavailable=parse(project(s,ui,{status:'unavailable'}));
 assert.match(unavailable.querySelector('[role=status].utility').textContent,/Conversation unavailable/);
 assert.notEqual(unavailable.querySelector('h1').textContent,'You’re all set.');
});
test('Foundation 2 uses a recessed, accessible fixture selector and a single stylesheet',()=>{
 const fs=require('node:fs'),path=require('node:path'),{JSDOM}=require('jsdom');
 const root=path.join(__dirname,'..'),doc=new JSDOM(fs.readFileSync(path.join(root,'foundation2/index.html'),'utf8')).window.document;
 assert.equal(doc.querySelector('#preview-tools').tagName,'DETAILS');
 assert.equal(doc.querySelector('#preview-tools').hasAttribute('open'),false);
 assert.ok(doc.querySelector('#preview-tools summary[aria-label]'));
 assert.ok(doc.querySelector('#scenario option[value="leader"]'));
 assert.ok(doc.querySelector('.preview-footer a[href="../index.html"]'));
 assert.equal(doc.querySelectorAll('link[rel=stylesheet]').length,1);
 const css=fs.readFileSync(path.join(root,'foundation2/design.css'),'utf8');
 for(const rule of ['.priority-body','.responsibility','.schedule','.settled-photo','@media(max-width:360px)','prefers-reduced-motion:reduce'])assert.ok(css.includes(rule),rule);
 assert.doesNotMatch(css,/rally-one-studio-today|rallypoint-phase1/);
});
test('Foundation 2 escapes source-backed responsibility, status and optional texts',()=>{
 const {JSDOM}=require('jsdom'),v=project(initial());
 const corrupted={...v,primary:{...v.primary,title:'<svg onload=alert(1)>',detail:'<img src=x onerror=alert(1)>'},
  secondary:[{...v.secondary[0],label:'<img src=x onerror=alert(1)>'}],
  schedule:[{...v.schedule[0],status:'<script>alert(1)</script>'}],passage:'<svg onload=alert(1)>'};
 const doc=new JSDOM('<main>'+View.render(corrupted)+'</main>').window.document;
 assert.equal(doc.querySelector('script'),null);
 assert.equal(doc.querySelector('[onerror],[onload]'),null);
 assert.match(doc.querySelector('.priority h2').textContent,/svg onload/);
});
