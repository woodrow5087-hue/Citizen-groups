'use strict';
// Engineering-only probe; no runtime modifications or gate changes.
// Run with node engineering/s9br-storage-noop-prototype.cjs
const {execFileSync}=require('node:child_process');
const {test}=require('node:test');
const assert=require('node:assert/strict');
const original=execFileSync('git',['show','1be48f9ca6784e2c2767565eddd7b536d644f9f1:rallypoint-storage-guard.js'],{encoding:'utf8'});
const marker="      const before=cloneRaw(baseline);\n      const record=JSON.stringify({version:VERSION,before,after:cloneRaw(candidate)});";
const candidate=original.replace(marker,"      // Validation and stale-baseline checks must run even on identical saves.\n      if(equal(candidate,baseline))return {ok:true,reason:null};\n"+marker);
assert.notEqual(candidate,original);
function load(s){const m={exports:{}};new Function("module",s)(m);return m.exports}
const old=load(original),G=load(candidate);
function disk(initial,fail=()=>false){const map=new Map(Object.entries(initial));const ops=[];return {getItem:k=>map.get(k)??null,setItem(k,v){ops.push(['set',k]);if(fail(k,ops.length))throw Error('simulated write error');map.set(k,String(v));},removeItem(k){ops.push(['remove',k]);if(fail(k,ops.length))throw Error('simulated remove error');map.delete(k);},external(k,v){map.set(k,v)},ops,snapshot:()=>JSON.stringify([...map.entries()].sort())}}
const P=G.PRIMARY_KEY,U=G.TODAY_KEY,J=G.JOURNAL_KEY,primaryRaw="{\"groupMessages\":[],\"role\":\"member\"}",todayRaw="{\"memberships\":{\"group\":true,\"team\":false}}",initial={[P]:primaryRaw,[U]:todayRaw,unrelated:'unchanged'},same={primaryRaw,todayRaw},changed={...same,primaryRaw:"{\"groupMessages\":[],\"role\":\"leader\"}"};
test("identical saves skip all writes",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);return g.save(same).ok&&g.save(same).ok&&d.ops.length===0})()));
test("changed save still uses journal",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);return g.save(changed).ok&&JSON.stringify(d.ops)===JSON.stringify([['set',J],['set',P],['set',U],['remove',J]])&&d.getItem(P)===changed.primaryRaw})()));
test("repeat changed save becomes no-op",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);return g.save(changed).ok&&g.save(changed).ok&&d.ops.length===4})()));
test("stale baseline rejects even identical candidate",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);d.external(P,changed.primaryRaw);return !g.save(same).ok&&d.ops.length===0&&d.getItem(P)===changed.primaryRaw})()));
test("interrupted journal still blocks identical save",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);d.external(J,'interrupted');return !g.save(same).ok&&d.ops.length===0&&d.getItem(J)==='interrupted'})()));
test("malformed persisted data still blocks",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);d.external(U,'{bad');return !g.save(same).ok&&d.ops.length===0&&d.getItem(U)==='{bad'})()));
test("invalid candidate still rejected",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);return !g.save({...same,todayRaw:'{bad'}).ok&&d.ops.length===0})()));
test("changed write failure still restores original bytes",()=>assert.ok((()=>{const d=disk(initial,(k,n)=>n===3),g=G.create(d),before=d.snapshot();return !g.save(changed).ok&&d.snapshot()===before})()));
test("existing blocked guard stays blocked",()=>assert.ok((()=>{const d=disk({...initial,[J]:'interrupted'}),g=G.create(d);return !g.status().ok&&!g.save(same).ok&&d.ops.length===0})()));
test("unrelated storage remains unchanged",()=>assert.ok((()=>{const d=disk(initial),g=G.create(d);return g.save(changed).ok&&g.save(changed).ok&&d.getItem('unrelated')==='unchanged'})()));
test('ten identical saves: 40 storage mutations before, zero after',()=>{
 const a=disk(initial),b=disk(initial),ga=old.create(a),gb=G.create(b);
 for(let i=0;i<10;i++){assert.ok(ga.save(same).ok);assert.ok(gb.save(same).ok);}
 assert.equal(a.ops.length,40);assert.equal(b.ops.length,0);
});
// Synthetic adapter counts, not device latency or measured app performance.
// Integrate only after prior gates, with real storage/browser characterization.
