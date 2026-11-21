'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const Storage=require('../rallypoint-storage-guard.js');
const Group=require('../rallypoint-group-view.js');
const {PRIMARY_KEY,TODAY_KEY,JOURNAL_KEY}=Storage;
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function store(initial={}){
 const data=new Map(Object.entries(initial));
 let fault=null;
 const api={
   getItem:key=>data.has(key)?data.get(key):null,
   setItem:(key,val)=>{
     if(fault?.key===key){const trigger=fault;fault=null;throw Error(trigger.message);}
     data.set(key,String(val));
   },
   removeItem:key=>{data.delete(key);},
   failNext:(key,message='simulated storage quota failure')=>{fault={key,message};},
   entries:()=>Object.fromEntries(data)
 };
 return api;
}
function fixtures(){
 return {
   primaryRaw:JSON.stringify({
      groupMessages:[{name:'Jess W.',time:'Yesterday',text:'Keep the original.'}],
      teamMessages:[],prayers:[],directMessages:{marcus:[{name:'You',time:'Today',text:'My original note'}]},
      memoryGames:{'sermon:solo':{slots:[0,2,4],solved:false}},
      rhythm:{text:'Read today'},aFutureField:{nested:{preserve:true}}
   }),
   todayRaw:JSON.stringify({name:'Fictional User',memberships:{group:true,team:true},seenGroupSignature:'old-signature'})
 };
}
function open(fixturesIn=fixtures()){
 const s=store({[PRIMARY_KEY]:fixturesIn.primaryRaw,[TODAY_KEY]:fixturesIn.todayRaw});
 return {s,guard:Storage.create(s)};
}
test('F-08 existing keys, versioned journal and exact raw preservation',()=>{
 assert.equal(Storage.VERSION,1);
 assert.equal(PRIMARY_KEY,'rallypoint-phase1-2026');
 assert.equal(TODAY_KEY,'rallypoint-today-ui-v1');
 const {s,guard}=open();const before=s.entries(),stamp=structuredClone(fixtures());
 assert.equal(guard.status().ok,true);
 assert.deepEqual(guard.readOriginals(),{primaryRaw:stamp.primaryRaw,todayRaw:stamp.todayRaw});
 const modified=JSON.parse(stamp.primaryRaw);
 modified.groupMessages.push({name:'You',time:'Just now',text:'Additional demo message'});
 const newPrimary=JSON.stringify(modified);
 assert.equal(guard.save({primaryRaw:newPrimary,todayRaw:stamp.todayRaw}).ok,true);
 assert.equal(s.getItem(PRIMARY_KEY),newPrimary);
 assert.equal(s.getItem(TODAY_KEY),stamp.todayRaw);
 assert.equal(s.getItem(JOURNAL_KEY),null,'journal removed after verified write');
 assert.equal(JSON.parse(s.getItem(PRIMARY_KEY)).aFutureField.nested.preserve,true);
 assert.equal(JSON.parse(s.getItem(PRIMARY_KEY)).memoryGames['sermon:solo'].slots[1],2);
 assert.equal(before[TODAY_KEY],s.getItem(TODAY_KEY),'existing UI signature untouched');
});
test('journal write failure never touches original values',()=>{
 const {s,guard}=open(),before=s.entries();
 s.failNext(JOURNAL_KEY);
 const r=guard.save({primaryRaw:JSON.stringify({groupMessages:[]}),todayRaw:fixtures().todayRaw});
 assert.equal(r.ok,false);
 assert.equal(s.getItem(PRIMARY_KEY),before[PRIMARY_KEY]);
 assert.equal(s.getItem(TODAY_KEY),before[TODAY_KEY]);
 assert.equal(s.getItem(JOURNAL_KEY),null);
});
test('failure between the two protected writes restores both exact originals',()=>{
 const {s,guard}=open(),before=s.entries();
 s.failNext(TODAY_KEY);
 const r=guard.save({primaryRaw:JSON.stringify({groupMessages:[{name:'You',text:'Change',time:'Now'}]}),
   todayRaw:JSON.stringify({name:'Other'})});
 assert.equal(r.ok,false);
 assert.equal(s.getItem(PRIMARY_KEY),before[PRIMARY_KEY]);
 assert.equal(s.getItem(TODAY_KEY),before[TODAY_KEY]);
 assert.equal(s.getItem(JOURNAL_KEY),null,'journal removed after successful rollback');
 assert.equal(guard.status().ok,false,'failed instance stops further writes until refresh');
});
test('corrupt or incompatible saved data refuses to overwrite all fields',()=>{
 const cases=[
   {[PRIMARY_KEY]:'{broken',[TODAY_KEY]:fixtures().todayRaw},
   {[PRIMARY_KEY]:JSON.stringify({groupMessages:{bad:true}}),[TODAY_KEY]:fixtures().todayRaw},
   {[PRIMARY_KEY]:fixtures().primaryRaw,[TODAY_KEY]:'{"memberships":[]}'},
   {[PRIMARY_KEY]:'[]',[TODAY_KEY]:fixtures().todayRaw}
 ];
 for(const initial of cases){
   const s=store(initial),before=s.entries(),guard=Storage.create(s);
   assert.equal(guard.status().ok,false);
   assert.equal(guard.save({primaryRaw:'{}',todayRaw:'{}'}).ok,false);
   assert.deepEqual(s.entries(),before,'no data destroyed by fallback');
 }
});
test('multi-tab source conflict halts instead of silently overwriting new saved progress',()=>{
 const {s,guard}=open();
 const newer=JSON.stringify({...JSON.parse(fixtures().primaryRaw),groupMessages:[{name:'Other tab',time:'Now',text:'Keep me'}]});
 s.setItem(PRIMARY_KEY,newer);
 const result=guard.save({primaryRaw:fixtures().primaryRaw,todayRaw:fixtures().todayRaw});
 assert.equal(result.ok,false);
 assert.match(result.reason,/another tab/);
 assert.equal(s.getItem(PRIMARY_KEY),newer);
 assert.equal(s.getItem(JOURNAL_KEY),null);
});
test('recovery requires explicit action, validates interrupted journal and restores originals',()=>{
 const start=fixtures();
 const s=store({
  [PRIMARY_KEY]:JSON.stringify({groupMessages:[{name:'New',time:'Now',text:'Uncommitted'}]}),
  [TODAY_KEY]:start.todayRaw,
  [JOURNAL_KEY]:JSON.stringify({
    version:1,before:{primaryRaw:start.primaryRaw,todayRaw:start.todayRaw},
    after:{primaryRaw:JSON.stringify({groupMessages:[{name:'New',time:'Now',text:'Uncommitted'}]}),todayRaw:JSON.stringify({name:'New user'})}
  })
 });
 const guard=Storage.create(s);
 assert.equal(guard.status().ok,false,'no automatic replacement of interrupted data');
 assert.equal(s.getItem(PRIMARY_KEY).includes('Uncommitted'),true);
 assert.equal(guard.recoverInterruptedSave().ok,true);
 assert.equal(s.getItem(PRIMARY_KEY),start.primaryRaw);
 assert.equal(s.getItem(TODAY_KEY),start.todayRaw);
 assert.equal(s.getItem(JOURNAL_KEY),null);
 assert.equal(guard.status().ok,true);
});
test('interrupted journal with conflicting later edits is not rolled back automatically',()=>{
 const start=fixtures(),newer=JSON.stringify({name:'Another tab wrote this'});
 const s=store({
   [PRIMARY_KEY]:start.primaryRaw,
   [TODAY_KEY]:newer,
   [JOURNAL_KEY]:JSON.stringify({version:1,
     before:{primaryRaw:start.primaryRaw,todayRaw:start.todayRaw},
     after:{primaryRaw:'{}',todayRaw:'{}'}})
 });
 const guard=Storage.create(s);
 assert.equal(guard.recoverInterruptedSave().ok,false);
 assert.equal(s.getItem(TODAY_KEY),newer);
 assert.notEqual(s.getItem(JOURNAL_KEY),null);
});
test('F-04 modular Groups rendering reproduces byte-identical old HTML and escaped content',()=>{
 const messages=[
   {name:'Jess W.',time:'Yesterday',text:'What stood out in John 15?'},
   {name:'Anna L.',time:'Today',text:'Thanks <everyone> & see you!'}
 ];
 const expected=messages.map(m=>`<div class="message"><div class="avatar">${esc(m.name.split(' ').map(x=>x[0]).join('').slice(0,2))}</div><div><div class="message-meta"><strong>${esc(m.name)}</strong><small>${esc(m.time)}</small></div><p>${esc(m.text)}</p></div></div>`).join('');
 const originalComposer=(type,title,placeholder)=>`<div class="composer"><label for="${type}-input">${title}</label><textarea id="${type}-input" rows="2" maxlength="700" placeholder="${placeholder}"></textarea><button type="button" class="btn red" data-action="send" data-value="${type}">Post to sample ${type==='group'?'group':type==='team'?'team':type==='direct'?'private demo conversation':'prayer board'} <span>➤</span></button></div>`;
 assert.equal(Group.legacyMessages(messages,esc),expected);
 assert.equal(Group.legacyComposer('group','Say something to your group','Share a thought or encouragement…'),
   originalComposer('group','Say something to your group','Share a thought or encouragement…'));
 assert.equal(Group.legacyGroupChat({messages,escape:esc}),
   '<div class="card group-conversation"><div class="kicker">GROUP CONVERSATION · SAMPLE</div>'+
   expected+originalComposer('group','Say something to your group','Share a thought or encouragement…')+'</div>');
 assert.match(Group.legacyMessages(messages,esc),/&lt;everyone&gt; &amp;/);
});
test('shared safe-save modules are loaded only in existing UI and do not import the separate chat lab',()=>{
 const root=path.resolve(__dirname,'..');
 const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
 const app=fs.readFileSync(path.join(root,'rallypoint.js'),'utf8');
 const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 for(const name of ['rallypoint-group-view.js','rallypoint-storage-guard.js']){
   assert.ok(index.includes('src="'+name+'"'));
   assert.ok(build.includes("'"+name+"'"));
 }
 assert.ok(index.indexOf('rallypoint-storage-guard.js')<index.indexOf('rallypoint.js'));
 assert.ok(index.indexOf('rallypoint-group-view.js')<index.indexOf('rallypoint.js'));
 assert.ok(app.includes('G.legacyGroupChat({messages:s.groupMessages,escape:e})'));
 assert.ok(app.includes('storageGuard.save('));
 assert.equal(index.includes('wednesday-chat-lab'),false);
 assert.equal(index.includes('mock-access-policy'),false,'client-side role toggle is NOT security');
});
