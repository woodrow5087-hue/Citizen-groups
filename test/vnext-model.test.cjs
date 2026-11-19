const {test}=require('node:test');
const assert=require('node:assert/strict');
const M=require('../experience/model.js');
function memory(seed={}){const data=new Map(Object.entries(seed));return {getItem:k=>data.get(k)||null,setItem:(k,v)=>data.set(k,v),data};}
const at=()=>new Date('2026-11-19T12:00:00');
const ctx={book:'Romans',chapter:8,verses:[26],reference:'Romans 8:26'};
test('legacy progress survives and legacy reflection is imported privately without rewriting storage',()=>{
 const old={...M.initial(at()),done:{read:true,share:true,memorize:false,pray:false},reflection:'A private old thought',prayerNote:'A preserved private prayer',joined:['food'],rsvp:'maybe',customFutureField:12};
 const raw=JSON.stringify(old),storage=memory({[M.LEGACY]:raw}),store=M.createStore(storage,at);
 assert.equal(storage.getItem(M.LEGACY),raw);assert.equal(storage.getItem(M.EXTRA),null);assert.equal(store.extra.reflections[0].shared,false);assert.equal(store.state.customFutureField,12);assert.equal(store.state.rsvp,'maybe');
 assert.equal(store.extra.prayers[0].text,old.prayerNote);assert.equal(store.extra.prayers[0].shared,false);
 store.complete('pray');assert.equal(JSON.parse(storage.getItem(M.LEGACY)).reflection,old.reflection);assert.deepEqual(store.state.joined,['food']);
});
test('reflection sharing is explicit, reversible and connected to context/history',()=>{
 const storage=memory(),store=M.createStore(storage,at),privateNote=store.reflect('A private thought',ctx);
 assert.equal(privateNote.shared,false);assert.equal(privateNote.reference,'Romans 8:26');assert.equal(store.state.done.share,true);
 store.shareReflection(privateNote.id,true);assert.equal(store.extra.reflections[0].shared,true);store.shareReflection(privateNote.id,false);assert.equal(store.extra.reflections[0].shared,false);
 const reload=M.createStore(storage,at);assert.equal(reload.extra.reflections[0].shared,false);assert.equal(reload.extra.reflections.length,1);
});
test('comments and deleting an owned reflection preserve other conversations',()=>{
 const store=M.createStore(memory(),at),r=store.reflect('My thought',ctx,true);const c=store.comment(r.id,'Follow-up');store.comment('jess','Thoughtful sample conversation');
 assert.equal(store.extra.comments[r.id][0].text,'Follow-up');store.removeComment(r.id,c.id);assert.deepEqual(store.extra.comments[r.id],[]);store.comment(r.id,'Another note');store.removeReflection(r.id);assert.equal(store.extra.comments[r.id],undefined);assert.equal(store.extra.comments.jess.length,1);assert.equal(store.state.reflection,'');
});
test('personal prayer defaults private, sharing is optional, acknowledgments are reversible',()=>{
 const store=M.createStore(memory(),at),p=store.pray('A private intention');assert.equal(p.shared,false);assert.equal(store.state.done.pray,false);
 const shared=store.pray('A group request',true);assert.equal(shared.shared,true);store.toggle('prayed','anna');assert.deepEqual(store.state.prayed,['anna']);store.toggle('prayed','anna');assert.deepEqual(store.state.prayed,[]);store.complete('pray');assert.equal(store.state.done.pray,true);store.removePrayer(shared.id);assert.equal(store.extra.prayers.length,1);assert.equal(store.state.prayerNote,'A private intention');
});
test('midnight preserves weekly history, notes and commitments while resetting daily practices',()=>{
 let now=new Date('2026-11-19T23:59:00');const store=M.createStore(memory(),()=>now);store.complete('read');store.reflect('Remember this',ctx);store.toggle('joined','food');store.pray('Private');store.toggle('prayed','anna');
 now=new Date('2026-11-20T00:01:00');store.rollover();assert.deepEqual(store.state.done,{read:false,share:false,memorize:false,pray:false});assert.equal(store.extra.history['2026-11-19'].read,true);assert.deepEqual(store.state.joined,['food']);assert.equal(store.extra.reflections.length,1);assert.equal(store.extra.prayers.length,1);assert.deepEqual(store.state.prayed,[]);assert.equal(store.weekly().find(d=>d.day==='2026-11-19').done.share,true);
});
test('RSVP is occurrence-specific and joining keeps the selected event date',()=>{
 let now=new Date('2026-11-18T12:00:00');const store=M.createStore(memory(),()=>now);store.rsvp('going');store.toggle('joined','food');const commitment=store.extra.commitmentDates.food;
 now=new Date('2026-11-25T12:00:00');store.rollover();assert.equal(store.state.rsvp,'');assert.equal(store.extra.rsvpHistory['2026-11-18'],'going');assert.equal(store.extra.commitmentDates.food,commitment);store.toggle('joined','food');assert.equal(store.extra.commitmentDates.food,undefined);
});
test('bookmarks, highlights and reading completion persist without duplicating counts',()=>{
 const storage=memory(),store=M.createStore(storage,at);store.bookmark(ctx);store.highlight(ctx);store.read(ctx);store.read(ctx);assert.equal(store.extra.readItems.length,1);assert.equal(store.count(),1);
 const reload=M.createStore(storage,at);assert.equal(reload.extra.bookmarks[0].reference,ctx.reference);assert.deepEqual(reload.extra.highlights,['Romans:8:26']);reload.bookmark(ctx);assert.deepEqual(reload.extra.bookmarks,[]);reload.highlight(ctx);assert.deepEqual(reload.extra.highlights,[]);
});
test('encouragement is a saved local preview and completes Share',()=>{
 const store=M.createStore(memory(),at);store.encourage('taylor','Welcome to our fictional group.');assert.equal(store.state.done.share,true);assert.equal(store.extra.encouragements[0].member,'taylor');assert.deepEqual(store.state.encouraged,['taylor']);
});
test('blank submissions fail without creating empty records, blocked storage is visible',()=>{
 const store=M.createStore({getItem(){throw Error('Blocked');},setItem(){throw Error('Blocked');}},at);
 assert.match(store.warning,/unavailable/);assert.throws(()=>store.reflect('  ',ctx));assert.equal(store.extra.reflections.length,0);assert.throws(()=>store.comment('jess',''));assert.throws(()=>store.pray(''));assert.throws(()=>store.encourage('anna',''));
 store.complete('read');assert.match(store.warning,/could not save/);assert.equal(store.state.done.read,true);
});
test('event labels reflect actual weekday and never say Tonight on another date',()=>{
 const now=new Date('2026-11-19T12:00:00'),d=M.eventDate('gathering',now);assert.equal(d.getDay(),3);assert.equal(M.dayKey(d),'2026-11-25');assert.match(M.when(d,now),/Wed, Nov 25/);assert.match(M.when(M.nextOccurrence(4,18,30,now),now),/^Today/);
 const after=M.nextOccurrence(3,18,30,new Date('2026-11-18T20:00:00'));assert.equal(M.dayKey(after),'2026-11-25');
});
