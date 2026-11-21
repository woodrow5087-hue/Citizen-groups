'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const R=require('../rallypoint-conversation-read-model.js');
const T=require('../rallypoint-today.js');
const domain={
  ...require('../lib/conversation-contracts.cjs'),
  ...require('../lib/mock-conversation-repository.cjs')
};
function store(initial={}){
 const values=new Map(Object.entries(initial));
 return {getItem:k=>values.get(k)??null,setItem:(k,v)=>values.set(k,v),
   removeItem:k=>values.delete(k),entries:()=>Object.fromEntries(values)};
}
function persisted(snapshot,draft='',replyTo=null){
 return {schemaVersion:1,snapshot,draft,replyTo};
}
test('fresh Today preview shares the Groups seed and does not create or change stored data',()=>{
 const legacy=JSON.stringify({groupMessages:[{name:'Old name',time:'Yesterday',text:'Keep verbatim'}]});
 const storage=store({'rallypoint-phase1-2026':legacy});
 const before=storage.entries();
 const result=R.peek({storage,domain});
 assert.equal(result.status,'ok');
 assert.equal(result.lastMessage.author,'You');
 assert.match(result.lastMessage.body,/Love that/);
 assert.equal(result.lastMessage.createdAt,'2026-11-20T16:21:00.000Z');
 assert.equal(result.unreadCount,3,'only other members sent three messages');
 assert.deepEqual(storage.entries(),before,'preview never writes either storage key');
 const snap=T.snapshot({teamStatus:'confirmed',role:'member',groupMessages:[],prayers:[],reached:[]},
   T.initial(),new Date('2026-11-21T18:00:00Z'),result);
 assert.equal(snap.unread,true);
 assert.equal(snap.unreadCount,3);
 assert.equal(snap.attention,1);
});
test('marking modern conversation read leaves drafts, replies and all legacy records intact',()=>{
 const original=JSON.stringify({groupMessages:[{name:'Jess',time:'Yesterday',text:'Original note'}]});
 const snapshot=R.fixture(domain);
 const storage=store({'rallypoint-phase1-2026':original,
   [R.STORAGE_KEY]:JSON.stringify(persisted(snapshot,'Unsent draft','seed_jess'))});
 assert.equal(R.markRead({storage,domain}),true);
 const saved=JSON.parse(storage.getItem(R.STORAGE_KEY));
 assert.equal(saved.draft,'Unsent draft');
 assert.equal(saved.replyTo,'seed_jess');
 assert.equal(R.peek({storage,domain}).unreadCount,0);
 assert.equal(storage.getItem('rallypoint-phase1-2026'),original);
 assert.equal(saved.snapshot.messages.length,4,'no legacy messages imported');
 assert.equal(saved.snapshot.readCursors.length,1);
 assert.equal(saved.snapshot.readCursors[0].lastReadMessageId,'seed_you');
});
test('sent-only preview and read count ignore pending/failed and own messages, preserve cursor',()=>{
 const storage=store();
 assert.equal(R.markRead({storage,domain}),true);
 const saved=JSON.parse(storage.getItem(R.STORAGE_KEY));
 const repo=domain.createMockConversationRepository({
   seed:saved.snapshot,clock:()=>new Date('2026-11-23T12:30:00.000Z')
 });
 const pending=repo.sendMessage({conversationId:R.CONVERSATION,userId:'u_anna',body:'Not delivered'});
 const failed=repo.sendMessage({conversationId:R.CONVERSATION,userId:'u_anna',body:'Failed delivery'});
 repo.setDeliveryStatus({messageId:failed.id,userId:'u_anna',status:'failed'});
 const mine=repo.sendMessage({conversationId:R.CONVERSATION,userId:R.SELF,body:'My sent note'});
 repo.setDeliveryStatus({messageId:mine.id,userId:R.SELF,status:'sent'});
 saved.snapshot=repo.getSnapshot();
 storage.setItem(R.STORAGE_KEY,JSON.stringify(saved));
 let result=R.peek({storage,domain});
 assert.equal(result.lastMessage.body,'My sent note');
 assert.equal(result.unreadCount,0);
 repo.setDeliveryStatus({messageId:pending.id,userId:'u_anna',status:'sent'});
 saved.snapshot=repo.getSnapshot();
 storage.setItem(R.STORAGE_KEY,JSON.stringify(saved));
 result=R.peek({storage,domain});
 assert.equal(result.unreadCount,1);
 assert.equal(result.lastMessage.author,'You','latest by actual sent timestamp and message id, not array order');
 assert.equal(R.markRead({storage,domain}),true);
 assert.equal(R.peek({storage,domain}).unreadCount,0);
});
test('malformed modern storage is neither overwritten nor falsely marked read',()=>{
 for(const bad of ['{broken','{"schemaVersion":99}','[]']){
   const storage=store({[R.STORAGE_KEY]:bad,'rallypoint-phase1-2026':'legacy'});
   assert.equal(R.peek({storage,domain}).status,'unavailable');
   assert.equal(R.markRead({storage,domain}),false);
   assert.equal(storage.getItem(R.STORAGE_KEY),bad);
   assert.equal(storage.getItem('rallypoint-phase1-2026'),'legacy');
 }
});
test('member revocation suppresses preview and cursor writes without deleting saved content',()=>{
 const snapshot=R.fixture(domain);
 const data=JSON.stringify(persisted(snapshot));
 const storage=store({[R.STORAGE_KEY]:data});
 assert.equal(R.peek({storage,domain,member:false}).status,'no-access');
 assert.equal(R.peek({storage,domain,member:false}).lastMessage,null);
 assert.equal(R.markRead({storage,domain,member:false}),false);
 assert.equal(storage.getItem(R.STORAGE_KEY),data);
 const saved=JSON.parse(data);
 saved.snapshot.memberships.find(row=>row.userId===R.SELF).status='revoked';
 const revoked=JSON.stringify(saved);
 storage.setItem(R.STORAGE_KEY,revoked);
 assert.equal(R.peek({storage,domain}).status,'unavailable');
 assert.equal(R.markRead({storage,domain}),false);
 assert.equal(storage.getItem(R.STORAGE_KEY),revoked);
});
test('legacy signature changes cannot invent a modern unread receipt',()=>{
 const ui=T.initial(),state={role:'member',teamStatus:'confirmed',
   groupMessages:[{name:'Jess',time:'Yesterday',text:'Legacy'}],prayers:[],reached:[]};
 const fresh=R.peek({storage:store(),domain});
 let result=T.snapshot(state,ui,new Date('2026-11-21'),fresh);
 assert.equal(result.unread,true);
 ui.seenGroupSignature=T.signature(state);
 result=T.snapshot(state,ui,new Date('2026-11-21'),fresh);
 assert.equal(result.unread,true,'legacy signature cannot acknowledge modern updates');
 state.groupMessages.push({name:'You',time:'Now',text:'Legacy only'});
 const readStore=store();
 R.markRead({storage:readStore,domain});
 const read=R.peek({storage:readStore,domain});
 result=T.snapshot(state,ui,new Date('2026-11-21'),read);
 assert.equal(result.unread,false,'legacy posts cannot generate modern unread counts');
});
