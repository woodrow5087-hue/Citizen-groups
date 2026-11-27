'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),{JSDOM}=require('jsdom');
const Read=require('../rallypoint-conversation-read-model.js');
const Domain={...require('../lib/conversation-contracts.cjs'),...require('../lib/mock-conversation-repository.cjs'),...require('../lib/mock-access-policy.cjs')};
const Connect=require('../foundation2/connect-adapter.js');
const View=require('../foundation2/connect-view.js');
function memory(seed={}){
 const map=new Map(Object.entries(seed)),writes=[];
 return {map,writes,
  getItem:k=>map.has(k)?map.get(k):null,
  setItem(k,v){writes.push(k);map.set(k,String(v));},
  removeItem(k){writes.push(k);map.delete(k);}
 };
}
const create=(storage,scenario='connected',member=true)=>Connect.create({storage,scenario,Read,Domain,isMember:()=>member});
const key='rally-one-foundation2-v1:connected:conversation';

test('Connect reads the original versioned F-02 fixture without creating any storage or reading legacy keys',()=>{
 const store=memory({[Read.STORAGE_KEY]:'original-do-not-touch'});
 const chat=create(store);
 const initial=chat.view();
 assert.equal(initial.status,'ok');
 assert.equal(initial.unreadCount,3);
 assert.equal(initial.messages.length,4);
 assert.equal(initial.lastMessage.body.length>0,true);
 assert.equal(store.writes.length,0);
 assert.equal(store.map.get(Read.STORAGE_KEY),'original-do-not-touch');
 assert.equal(store.map.has(key),false);
});
test('Opening the authorized thread marks only the canonical sent cursor read and survives reloading',()=>{
 const store=memory(),chat=create(store);
 assert.equal(chat.markRead().ok,true);
 assert.equal(chat.view().unreadCount,0);
 assert.ok(store.map.has(key));
 const saved=JSON.parse(store.map.get(key));
 Domain.assertConversationSnapshot(saved.snapshot);
 assert.equal(saved.snapshot.readCursors.length,1);
 assert.equal(saved.snapshot.readCursors[0].lastReadMessageId,'seed_you');
 assert.equal(create(store).view().unreadCount,0);
 assert.equal(store.map.has(Read.STORAGE_KEY),false);
});
test('Draft, sent messages and explicit replies use the original repository with no duplicate message store',()=>{
 const store=memory(),chat=create(store);
 assert.equal(chat.saveDraft('  Hello group  ').ok,true);
 assert.equal(create(store).view().draft,'  Hello group  ');
 assert.equal(chat.reply('seed_jess').ok,true);
 assert.equal(chat.send('Hello group').ok,true);
 const result=create(store).view();
 assert.equal(result.draft,'');
 assert.equal(result.replyTo,null);
 assert.equal(result.messages.length,5);
 const latest=result.messages.at(-1);
 assert.equal(latest.body,'Hello group');
 assert.equal(latest.mine,true);
 assert.equal(latest.status,'sent');
 assert.equal(latest.replyTo,'seed_jess');
 assert.equal(result.unreadCount,3,'self messages cannot create new unread activity');
 Domain.assertConversationSnapshot(JSON.parse(store.map.get(key)).snapshot);
 assert.equal(chat.send('  ').ok,false);
 assert.equal(chat.send('x'.repeat(701)).ok,false);
 assert.equal(create(store).view().messages.length,5);
});
test('No unauthorized participant, wrong scenario or invalid reply can edit the saved conversation',()=>{
 const store=memory(),guest=create(store,'visitor',false);
 assert.equal(guest.view().status,'no-access');
 assert.equal(guest.markRead().ok,false);
 assert.equal(guest.saveDraft('private draft').ok,false);
 assert.equal(guest.send('private message').ok,false);
 assert.equal(store.writes.length,0);
 const team=create(store,'team',false);
 assert.equal(team.send('also denied').ok,false);
 assert.equal(create(store).reply('not-a-message').ok,false);
 assert.equal(store.writes.length,0);
});
test('Malformed conversation refuses writes and never masquerades as an empty inbox',()=>{
 const raw='{"schemaVersion":1,"draft":"secret","snapshot":{"bad":"schema"}}';
 const store=memory({[key]:raw}),chat=create(store);
 assert.equal(chat.view().status,'unavailable');
 assert.equal(chat.view().unreadCount,null);
 assert.equal(chat.markRead().ok,false);
 assert.equal(chat.saveDraft('replacement').ok,false);
 assert.equal(chat.send('replacement').ok,false);
 assert.equal(store.map.get(key),raw);
 assert.equal(store.writes.length,0);
});
test('Storage failure keeps previous message and draft; concurrent edits fail closed',()=>{
 const base=memory(),chat=create(base);
 assert.equal(chat.saveDraft('saved before failure').ok,true);
 const raw=base.map.get(key);
 const refusing={getItem:k=>base.getItem(k),setItem(){throw Error('blocked');},removeItem(){throw Error('blocked');}};
 const blocked=create(refusing);
 assert.equal(blocked.send('do not persist').ok,false);
 assert.equal(base.map.get(key),raw);
 assert.equal(create(base).view().draft,'saved before failure');
 let calls=0;
 const racing={
  getItem(k){
   calls++;
   if(calls===2)base.map.set(key,JSON.stringify({...JSON.parse(base.map.get(key)),draft:'external change'}));
   return base.getItem(k);
  },
  setItem(k,v){base.setItem(k,v);},removeItem(k){base.removeItem(k);}
 };
 const race=create(racing);
 const result=race.saveDraft('my conflicting draft');
 assert.equal(result.ok,false);
 assert.equal(result.reason,'concurrent-change');
 assert.equal(JSON.parse(base.map.get(key)).draft,'external change');
});
test('Connect UI presents owned messages and local-only status with escaped content',()=>{
 const chat=create(memory()),doc=new JSDOM(View.render(chat.view(),{member:true,thread:true})).window.document;
 assert.equal(doc.querySelectorAll('.chat-message').length,4);
 assert.ok(doc.querySelector('#chat-compose textarea[maxlength="700"]'));
 assert.equal(doc.querySelector('.chat-send').disabled,true);
 assert.ok(doc.querySelector('a[data-thread=inbox]'));
 assert.match(doc.querySelector('.connect-disclaimer').textContent,/No messages are delivered/);
 const unsafe={...chat.view(),messages:[{id:'x',author:'<svg onload=alert(1)>',authorId:'u_you',
  body:'<img onerror=alert(1)>',createdAt:'2026-11-20T12:00:00.000Z',status:'sent',mine:true,replyTo:null}]};
 const unsafeDoc=new JSDOM(View.render(unsafe,{member:true,thread:true})).window.document;
 assert.equal(unsafeDoc.querySelector('[onerror],[onload]'),null);
 assert.match(unsafeDoc.querySelector('.chat-bubble').textContent,/img onerror/);
 assert.equal(new JSDOM(View.render(chat.view(),{member:false})).window.document.querySelector('#chat-compose'),null);
});

test('premium presentation storage reuses scoped canonical owner and preserves cursor/reply/draft',()=>{
 const store=memory({[Read.STORAGE_KEY]:'original untouched'}),chat=create(store),port=chat.presentationStorage();
 assert.equal(Read.peek({storage:port,domain:Domain,member:true}).unreadCount,3);assert.equal(store.writes.length,0);
 assert.equal(Read.markRead({storage:port,domain:Domain,member:true}),true);
 assert.equal(chat.view().unreadCount,0);assert.equal(chat.saveDraft('owned').ok,true);assert.equal(chat.reply('seed_jess').ok,true);
 const saved=Read.readSaved(port,Domain);assert.equal(saved.draft,'owned');assert.equal(saved.replyTo,'seed_jess');
 port.setItem(Read.STORAGE_KEY,JSON.stringify({...saved,draft:'premium draft'}));
 assert.equal(chat.view().draft,'premium draft');assert.equal(chat.view().replyTo,'seed_jess');assert.equal(store.map.get(Read.STORAGE_KEY),'original untouched');
 assert.throws(()=>port.getItem('rallypoint-phase1-2026'));assert.throws(()=>port.setItem('foreign','x'));assert.throws(()=>port.removeItem(Read.STORAGE_KEY));assert.throws(()=>port.clear());
});
test('presentation storage enforces read-before-write, current membership and raw concurrency',()=>{
 const store=memory();let member=true;const chat=Connect.create({storage:store,scenario:'connected',Read,Domain,isMember:()=>member}),port=chat.presentationStorage();
 const value=JSON.stringify({schemaVersion:1,snapshot:Read.fixture(Domain),draft:'',replyTo:null});
 assert.throws(()=>port.setItem(Read.STORAGE_KEY,value),/read before/);
 assert.equal(port.getItem(Read.STORAGE_KEY),null);store.map.set(key,value);assert.throws(()=>port.setItem(Read.STORAGE_KEY,value),/concurrent/);
 port.getItem(Read.STORAGE_KEY);member=false;assert.throws(()=>port.getItem(Read.STORAGE_KEY),/no-access/);assert.throws(()=>port.setItem(Read.STORAGE_KEY,value),/no-access/);
});
test('presentation storage validates source and proposed actor/org/reply/schema before write',()=>{
 const store=memory(),port=create(store).presentationStorage();
 assert.equal(port.getItem(Read.STORAGE_KEY),null);
 const saved={schemaVersion:1,snapshot:Read.fixture(Domain),draft:'',replyTo:null};
 for(const change of [x=>{x.schemaVersion=2;},x=>{x.snapshot.conversations[0].organizationId='wrong';},x=>{x.snapshot.memberships=x.snapshot.memberships.filter(m=>m.userId!==Read.SELF);},x=>{x.replyTo='missing';},x=>{x.draft='x'.repeat(701);}]){
  const value=structuredClone(saved);change(value);assert.throws(()=>port.setItem(Read.STORAGE_KEY,JSON.stringify(value)));assert.equal(store.writes.length,0);
 }
 store.map.set(key,'{"bad":"source"}');assert.throws(()=>port.getItem(Read.STORAGE_KEY));assert.equal(store.map.get(key),'{"bad":"source"}');
});
