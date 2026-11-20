const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../rallypoint-memorize.js');

test('Each challenge is real KJV content with exactly five uniquely addressable words',()=>{
 for(const key of ['sermon','study','year','romans']){
  const c=M.challenge(key);
  assert.equal(c.indexes.length,5);
  assert.equal(c.bank.filter(x=>x.answerIndex>=0).length,5);
  assert.equal(new Set(c.indexes).size,5);
  assert.equal(c.bank.length,7,'five answers plus two decoys');
  assert.equal(M.normalize(null,key).slots.length,5);
 }
 assert.match(M.challenge('romans').text,/we know that all things work together/);
});
test('Tap tiles, pick a specific blank, remove placements, retry without losing correct answers',()=>{
 let state=M.initial();
 state=M.pick(state,'sermon','d0');
 state=M.pick(state,'sermon','a1');
 state=M.pick(state,'sermon','a2');
 state=M.pick(state,'sermon','a3');
 state=M.pick(state,'sermon','a4');
 assert.equal(M.filled(state),5);
 let checked=M.check(state,'sermon');
 assert.equal(checked.status,'try-again');
 assert.equal(checked.wrong,1);
 assert.equal(checked.state.slots[0],null);
 assert.equal(checked.state.slots[1],'a1');
 assert.equal(checked.state.misses,1);
 state=M.pick(checked.state,'sermon','a0',0);
 checked=M.check(state,'sermon');
 assert.equal(checked.status,'complete');
 assert.equal(checked.state.solved,true);
 assert.equal(M.score(checked.state),91);
 assert.equal(checked.state.best,91);
 assert.equal(M.clear(checked.state,'sermon',0).solved,true,'completed results are stable');
 state=M.reset(checked.state,'sermon');
 assert.equal(state.best,91);
 assert.equal(state.round,1);
 assert.equal(state.solved,false);
 assert.equal(M.filled(state),0);
});
test('Hints fill the right slot and charge only puzzle points, not spiritual progress',()=>{
 let s=M.initial();
 s=M.pick(s,'year','a2');
 s=M.pick(s,'year','a1');
 s=M.hint(s,'year');
 assert.equal(s.slots[2],'a2','hint moves a wrongly placed correct word to its own position');
 assert.equal(s.slots[0],null);
 assert.equal(s.hints,1);
 assert.ok(M.score(s)<100);
 assert.equal(M.check(s,'year').status,'incomplete');
});
test('Only valid nonduplicate tokens survive local-storage normalization',()=>{
 const raw={slots:['a0','a0','<svg>','d0','a4'],solved:true,misses:-2,hints:'100',round:3,best:900,feedback:'A'};
 const s=M.normalize(raw,'sermon');
 assert.deepEqual(s.slots,['a0',null,null,'d0','a4']);
 assert.equal(s.solved,false);
 assert.equal(s.misses,0);
 assert.equal(s.hints,0);
 assert.equal(s.best,null);
 assert.equal(s.feedback,'A');
 const invalid=M.pick(s,'sermon','<script>');
 assert.deepEqual(invalid.slots,s.slots);
});
test('Bank order is stable within a round and changes without changing correct slots',()=>{
 const a=M.bank('sermon',0),b=M.bank('sermon',0);
 assert.deepEqual(a,b);
 assert.deepEqual(new Set(a.map(x=>x.id)),new Set(M.bank('sermon',1).map(x=>x.id)));
});
