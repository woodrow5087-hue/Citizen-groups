'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const G=require('../rallypoint-storage-guard.js');
const P=G.PRIMARY_KEY,T=G.TODAY_KEY,J=G.JOURNAL_KEY;
const initial={[P]:'{"role":"member","groupMessages":[]}',[T]:'{"campus":"central","memberships":{"group":true}}',unrelated:'keep'};
const unchanged={primaryRaw:initial[P],todayRaw:initial[T]};
function disk(seed=initial){
 const data=new Map(Object.entries(seed)),writes=[];
 let failWrites=false,failReads=false;
 return {getItem(k){if(failReads)throw Error('read blocked');return data.get(k)??null;},
 setItem(k,v){writes.push(['set',k]);if(failWrites)throw Error('write blocked');data.set(k,String(v));},
 removeItem(k){writes.push(['remove',k]);if(failWrites)throw Error('write blocked');data.delete(k);},
 writes,entries:()=>Object.fromEntries(data),blockWrites:()=>{failWrites=true;},blockReads:()=>{failReads=true;}};
}
test('exact unchanged transaction performs zero mutations even if writes are blocked',()=>{
 const s=disk(),g=G.create(s);s.blockWrites();
 assert.deepEqual(g.save(unchanged),{ok:true,reason:null});
 assert.deepEqual(s.writes,[]);assert.deepEqual(s.entries(),initial);assert.equal(g.status().ok,true);
});
test('two absent records are a no-op, not a journal or key deletion',()=>{
 const s=disk({unrelated:'keep'}),g=G.create(s);
 assert.equal(g.save({primaryRaw:null,todayRaw:null}).ok,true);
 assert.deepEqual(s.writes,[]);assert.deepEqual(s.entries(),{unrelated:'keep'});
});
test('exact no-op with one absent record preserves absence',()=>{
 const s=disk({[T]:initial[T]}),g=G.create(s);
 assert.equal(g.save({primaryRaw:null,todayRaw:initial[T]}).ok,true);
 assert.deepEqual(s.writes,[]);assert.equal(s.getItem(P),null);
});
test('unchanged save refuses an interrupted journal appearing after initialization',()=>{
 const s=disk(),g=G.create(s);s.setItem(J,'interrupted');s.writes.length=0;
 assert.equal(g.save(unchanged).ok,false);assert.match(g.status().reason,/interrupted save/);
 assert.deepEqual(s.writes,[]);assert.equal(s.getItem(J),'interrupted');
});
test('unchanged save still detects another tab changing either record',()=>{
 for(const key of [P,T]){
  const s=disk(),g=G.create(s);s.setItem(key,'{}');s.writes.length=0;
  assert.equal(g.save(unchanged).ok,false);assert.match(g.status().reason,/another tab/);
  assert.deepEqual(s.writes,[]);assert.equal(s.getItem(key),'{}');
 }
});
test('unchanged save refuses unreadable storage',()=>{
 const s=disk(),g=G.create(s);s.blockReads();
 assert.equal(g.save(unchanged).ok,false);assert.deepEqual(s.writes,[]);
});
test('invalid candidate or malformed original is not accepted as a no-op',()=>{
 const s=disk(),g=G.create(s);
 assert.equal(g.save({primaryRaw:'[]',todayRaw:initial[T]}).ok,false);
 assert.deepEqual(s.writes,[]);
 const bad=disk({[P]:'[]',[T]:initial[T]}),blocked=G.create(bad);
 assert.equal(blocked.save({primaryRaw:'[]',todayRaw:initial[T]}).ok,false);
 assert.deepEqual(bad.writes,[]);
});
test('different raw bytes retain the exact journal transaction even if JSON is equivalent',()=>{
 const s=disk(),g=G.create(s),next={...unchanged,primaryRaw:'{ "role":"member","groupMessages":[] }'};
 assert.equal(g.save(next).ok,true);
 assert.deepEqual(s.writes,[['set',J],['set',P],['set',T],['remove',J]]);
 assert.equal(s.getItem(P),next.primaryRaw);assert.equal(s.getItem(J),null);
 s.writes.length=0;assert.equal(g.save(next).ok,true);assert.deepEqual(s.writes,[]);
});
test('real single-record changes retain two-record transaction and absence semantics',()=>{
 const s=disk({[T]:initial[T]}),g=G.create(s);
 const next={primaryRaw:null,todayRaw:'{"campus":"north"}'};
 assert.equal(g.save(next).ok,true);
 assert.deepEqual(s.writes,[['set',J],['remove',P],['set',T],['remove',J]]);
 assert.equal(s.getItem(P),null);assert.equal(s.getItem(T),next.todayRaw);
});
