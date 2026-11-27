'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Host=require('../foundation2/conversation-host.js');
const Store=require('../foundation2/state-store.js');
const Guard=require('../rallypoint-storage-guard.js');
const AppState=require('../rally-one-app-state.js');
function fixture({group=true,team=true,state:initial={directMessages:{}},saveFailure=false}={}){
 let state=structuredClone(initial),permissions={group,team},live=true,saves=0,prayerCalls=0;
 let care={person:'Marcus C.',request:'Explicit sample request',stage:'ready',prayed:false};
 const getSession=()=>({snapshot:{context:{permissions,identity:{name:'Local member'}},model:{serveLocation:'North Campus'},care}});
 const options={getState:()=>state,getSession,isCurrent:()=>live,save(next){saves++;if(saveFailure)return {ok:false,reason:'failed'};state=next;return {ok:true};},markPrayer(){prayerCalls++;care={...care,prayed:true,stage:'prayed'};return {ok:true};}};
 const host=Host.create(options);
 return {host,options,state:()=>state,saves:()=>saves,prayerCalls:()=>prayerCalls,setPermissions:p=>{permissions=p;},retire:()=>{live=false;},setCare:c=>{care=c;}};
}
test('host reads use existing primary fields with no writes or fabricated unread/delivery',()=>{
 const f=fixture({state:{directMessages:{jess:[{name:'Jess',time:'Local demo',text:'Existing message'}]},connectRoom:{messages:['Existing Room message'],rsvp:true}}});
 assert.deepEqual(f.host.messages('Jess'),[{name:'Jess',time:'Local demo',text:'Existing message'}]);
 assert.deepEqual(f.host.room(),{messages:['Existing Room message'],rsvp:true});
 assert.equal(f.host.draft('direct','Jess'),'');assert.equal(f.saves(),0);
 const clone=f.host.messages('Jess');clone[0].text='no mutation';assert.equal(f.host.messages('Jess')[0].text,'Existing message');
 assert.equal(f.host.metadata().name,'Local member');assert.equal(f.host.metadata().care.person,'Marcus C.');
});
test('per-recipient and Room drafts survive host recreation and isolate recipient switches',()=>{
 const f=fixture();assert.equal(f.host.saveDraft('direct','Jess','Jess draft'),true);
 assert.equal(f.host.saveDraft('direct','Anna','Anna draft'),true);
 assert.equal(f.host.saveDraft('direct','Alex Morgan','Alex draft'),true);
 assert.equal(f.host.saveDraft('room','','Room draft'),true);
 const reload=Host.create(f.options);
 assert.equal(reload.draft('direct','Jess'),'Jess draft');assert.equal(reload.draft('direct','Anna'),'Anna draft');
 assert.equal(reload.draft('direct','Alex Morgan'),'Alex draft');assert.equal(reload.draft('room',''),'Room draft');
 assert.deepEqual(f.state().connectDrafts,{version:1,direct:{jess:'Jess draft',anna:'Anna draft','connect-alex':'Alex draft'},room:'Room draft'});
});
test('local DM and Room sends atomically append histories and clear only their draft',()=>{
 const f=fixture();f.host.saveDraft('direct','Jess','Pending');f.host.saveDraft('direct','Anna','Keep Anna');f.host.saveDraft('room','','Pending Room');
 assert.equal(f.host.write('direct','Hello Jess','Jess'),true);
 assert.equal(f.host.draft('direct','Jess'),'');assert.equal(f.host.draft('direct','Anna'),'Keep Anna');
 assert.deepEqual(f.host.messages('Jess'),[{name:'You',time:'Just now',text:'Hello Jess'}]);
 assert.equal(f.host.write('room','Hello Room'),true);assert.equal(f.host.draft('room',''),'');assert.deepEqual(f.host.room().messages,['Hello Room']);
});
test('failed writes never mutate messages, draft or Room RSVP',()=>{
 const state={directMessages:{jess:[{name:'You',time:'Local demo',text:'before'}]},connectRoom:{rsvp:false,messages:['before']},connectDrafts:{version:1,direct:{jess:'preserved'},room:'preserved Room'}};
 const f=fixture({state,saveFailure:true});
 assert.equal(f.host.write('direct','failed','Jess'),false);assert.equal(f.host.write('room','failed'),false);assert.equal(f.host.write('rsvp',true),false);assert.equal(f.host.saveDraft('direct','Jess','failed'),false);
 assert.deepEqual(f.state(),state);
});
test('Room RSVP stays independent of dated serving availability and coverage',()=>{
 const state={directMessages:{},teamStatus:'declined',coverage:true,eventResponses:{version:1,records:{'existing-event':{kind:'team',value:'declined',coverage:true}}}};
 const f=fixture({state});assert.equal(f.host.write('rsvp',true),true);
 assert.equal(f.host.room().rsvp,true);assert.equal(f.state().teamStatus,'declined');assert.equal(f.state().coverage,true);assert.deepEqual(f.state().eventResponses,state.eventResponses);
 assert.equal(f.host.write('rsvp',false),true);assert.equal(f.host.room().rsvp,false);
});
test('known recipient permission follows existing demo group rule; team-only cannot DM',()=>{
 for(const [group,team] of [[true,false],[false,true],[true,true],[false,false]]){
  const f=fixture({group,team});
  assert.equal(f.host.write('direct','sample','Jess'),group);assert.equal(f.host.saveDraft('direct','Anna','sample'),group);
  assert.equal(f.host.write('room','sample'),team);assert.equal(f.host.write('rsvp',true),team);
  assert.equal(f.host.write('direct','unknown','Unknown member'),false);assert.equal(f.host.messages('Unknown member').length,0);
  if(!group)assert.equal(f.host.metadata().care,null);
 }
});
test('revocation and retired frame deny reads and writes against current context',()=>{
 const f=fixture();f.host.write('direct','known','Jess');f.host.write('room','known');f.setPermissions({group:false,team:false});
 assert.deepEqual(f.host.messages('Jess'),[]);assert.deepEqual(f.host.room(),{});assert.equal(f.host.write('direct','denied','Jess'),false);
 f.setPermissions({group:true,team:true});f.retire();assert.deepEqual(f.host.access(),{group:false,team:false});assert.equal(f.host.status().ok,false);assert.equal(f.host.saveDraft('room','','denied'),false);
});
test('malformed and future-version fields fail closed without erasure',()=>{
 const invalid=[{directMessages:[]},{directMessages:{jess:[{text:7}]}},{directMessages:{unknown:[]}},{connectRoom:null},{connectRoom:{rsvp:'true'}},{connectRoom:{messages:['x',{}]}},{connectDrafts:{version:2,direct:{},room:''}},{connectDrafts:{version:1,direct:{unknown:'x'},room:''}},{connectDrafts:{version:1,direct:{jess:'x'.repeat(701)},room:''}}];
 for(const state of invalid){const f=fixture({state});assert.equal(f.host.status().ok,false);assert.deepEqual(f.host.access(),{group:false,team:false});assert.equal(f.host.write('room','replacement'),false);assert.deepEqual(f.state(),state);assert.equal(f.saves(),0);}
});
test('invalid drafts/messages/actions reject without writes or unknown identities',()=>{
 const f=fixture();for(const value of [null,7,'x'.repeat(701)]){assert.equal(f.host.saveDraft('direct','Jess',value),false);assert.equal(f.host.write('direct',value,'Jess'),false);}
 assert.equal(f.host.write('direct','  ','Jess'),false);assert.equal(f.host.saveDraft('thread','Jess','wrong owner'),false);assert.equal(f.host.write('rsvp','true'),false);assert.equal(f.host.write('other','sample','Jess'),false);assert.equal(f.host.write('direct','sample','__proto__'),false);assert.equal(f.saves(),0);
});
test('prayer uses canonical explicit care owner and does not create connectPraying',()=>{
 const f=fixture();assert.equal(f.host.praying(),false);assert.equal(f.host.write('prayer',true),true);assert.equal(f.prayerCalls(),1);assert.equal(f.host.praying(),true);assert.equal(f.host.write('prayer',true),true);assert.equal(f.prayerCalls(),1);assert.equal(f.host.write('prayer',false),false);assert.equal(f.state().connectPraying,undefined);assert.equal(f.saves(),0);
 f.setCare(null);assert.equal(f.host.write('prayer',true),false);f.setCare({stage:'paused',prayed:false});assert.equal(f.host.write('prayer',true),false);f.setPermissions({group:false,team:true});assert.equal(f.host.write('prayer',true),false);
});
test('real guarded primary owner preserves conflicting external bytes and refuses host save',()=>{
 const map=new Map(),storage={getItem:k=>map.get(k)??null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k)};
 const owner=Store.create({storage,scenario:'connected',Guard,AppState});let state=owner.read().state;const ui=owner.read().ui;
 const f=fixture();const host=Host.create({...f.options,getState:()=>state,save(next){const result=owner.save(next,ui);if(result.ok)state=next;return result;}});
 assert.equal(host.saveDraft('direct','Jess','owned draft'),true);
 const primary=owner.namespace+'primary',before=map.get(primary),outside=JSON.stringify({...JSON.parse(before),question:'External update'});map.set(primary,outside);
 assert.equal(host.write('direct','conflict','Jess'),false);assert.equal(map.get(primary),outside);assert.equal(host.draft('direct','Jess'),'owned draft');
});
