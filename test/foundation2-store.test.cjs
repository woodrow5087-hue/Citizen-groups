'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const Store=require('../foundation2/state-store.js');
const Guard=require('../rallypoint-storage-guard.js');
const AppState=require('../rally-one-app-state.js');
const Context=require('../rally-one-member-context.js');
const now=new Date('2026-11-26T12:00:00Z');
function storage(seed={}){
 const map=new Map(Object.entries(seed)),writes=[];
 return {
  map,writes,
  getItem:key=>map.has(key)?map.get(key):null,
  setItem:(key,value)=>{writes.push(['set',key]);map.set(key,String(value));},
  removeItem:key=>{writes.push(['remove',key]);map.delete(key);}
 };
}
const create=(storage,scenario='connected')=>Store.create({storage,scenario,Guard,AppState});
const next=(state,ui,command)=>Context.transition({state,ui,conversation:{status:'ok',unreadCount:3},command,now});

test('Foundation 2 reads clean defaults without a write and cannot touch canonical application keys',()=>{
 const primary='{"original":"must-stay"}',today='{"member":"unchanged"}';
 const mem=storage({[Guard.PRIMARY_KEY]:primary,[Guard.TODAY_KEY]:today});
 const store=create(mem),loaded=store.read();
 assert.equal(loaded.ok,true);assert.equal(loaded.state.rsvp,'');
 assert.deepEqual(loaded.ui.memberships,{group:true,team:true});
 assert.equal(mem.writes.length,0,'Opening Today must be read-only');
 const r=next(loaded.state,loaded.ui,{type:'group-rsvp',value:'going'});
 assert.equal(r.ok,true);assert.equal(store.save(r.state,loaded.ui).ok,true);
 assert.equal(mem.map.get(Guard.PRIMARY_KEY),primary);
 assert.equal(mem.map.get(Guard.TODAY_KEY),today);
 assert.equal(mem.map.has(Guard.JOURNAL_KEY),false);
 assert.equal(mem.map.has('rally-one-foundation2-v1:connected:journal'),false);
 assert.equal(JSON.parse(mem.map.get('rally-one-foundation2-v1:connected:primary')).rsvp,'going');
});
test('RSVP, serving confirmation and leader review survive reloading guarded Foundation 2 fixtures',()=>{
 const mem=storage(),store=create(mem,'leader');
 let {state,ui}=store.read();
 for(const command of [
  {type:'group-rsvp',value:'going'},{type:'serving-response',value:'confirmed'},
  {type:'leader-review',person:'marcus'},{type:'leader-review',person:'taylor'}
 ]){
  const changed=next(state,ui,command);assert.equal(changed.ok,true);
  assert.equal(store.save(changed.state,ui).ok,true);state=changed.state;
 }
 const reloaded=create(mem,'leader').read();
 assert.equal(reloaded.ok,true);
 assert.equal(reloaded.state.rsvp,'going');assert.equal(reloaded.state.teamStatus,'confirmed');
 assert.deepEqual(reloaded.state.reached,['marcus','taylor']);
 assert.equal(reloaded.state.role,'leader');
 assert.equal(mem.map.has('rally-one-foundation2-v1:leader:journal'),false);
});
test('Separate preview scenarios never inherit each others memberships, actions or stored state',()=>{
 const mem=storage();
 const leader=create(mem,'leader'),l=leader.read();
 const response=next(l.state,l.ui,{type:'group-rsvp',value:'going'});
 assert.equal(leader.save(response.state,l.ui).ok,true);
 const guest=create(mem,'visitor').read();
 assert.equal(guest.state.rsvp,'');
 assert.deepEqual(guest.ui.memberships,{group:false,team:false});
 assert.equal(guest.state.role,'member');
 assert.equal(next(guest.state,guest.ui,{type:'group-rsvp',value:'going'}).ok,false);
 const group=create(mem,'group').read();
 assert.deepEqual(group.ui.memberships,{group:true,team:false});
 assert.equal(group.state.rsvp,'');
 assert.equal(create(mem,'leader').read().state.rsvp,'going');
 assert.throws(()=>create(mem,'../../invalid'),RangeError);
});
test('Corrupt isolated state and interruption journals block writes without deleting saved bytes',()=>{
 for(const [key,raw] of [
  ['primary','{"prayers":true}'],
  ['journal','{"version":1,"before":{},"after":{}}']
 ]){
  const name='rally-one-foundation2-v1:connected:'+key;
  const mem=storage({[name]:raw});
  const store=create(mem);
  const blocked=store.read();
  assert.equal(blocked.ok,false);
  assert.match(blocked.reason,/recovery|interrupted/i);
  const writes=mem.writes.length;
  assert.equal(store.save(blocked.state,blocked.ui).ok,false);
  assert.equal(mem.writes.length,writes);
  assert.equal(mem.map.get(name),raw);
 }
});
test('Concurrent external changes refuse a stale transaction; no silent overwrite',()=>{
 const mem=storage(),store=create(mem),loaded=store.read();
 mem.setItem('rally-one-foundation2-v1:connected:primary','{"rsvp":"maybe"}');
 const r=next(loaded.state,loaded.ui,{type:'group-rsvp',value:'going'});
 const writes=mem.writes.length;
 const result=store.save(r.state,loaded.ui);
 assert.equal(result.ok,false);
 assert.match(result.reason,/another tab/i);
 assert.equal(mem.writes.length,writes);
 assert.equal(mem.map.get('rally-one-foundation2-v1:connected:primary'),'{"rsvp":"maybe"}');
});
test('Invalid action never enters persistence and default member context remains immutable',()=>{
 const mem=storage(),store=create(mem,'visitor'),loaded=store.read(),writes=mem.writes.length;
 assert.equal(next(loaded.state,loaded.ui,{type:'serving-response',value:'confirmed'}).ok,false);
 assert.equal(next(loaded.state,loaded.ui,{type:'leader-review',person:'marcus'}).ok,false);
 assert.equal(mem.writes.length,writes);
 assert.equal(loaded.state.teamStatus,'pending');
});
