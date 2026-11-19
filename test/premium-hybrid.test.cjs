// Original Premium Hybrid flows retained against the current modular application.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {open}=require('./helpers.cjs');
test('current Premium Hybrid retains all five destinations and local completion/group/serving interactions',t=>{
 const ui=open(t);
 for(const tab of ['today','group','read','serve','progress']){ui.nav(tab);assert.equal(ui.doc.querySelector('#nav [aria-current="page"]').dataset.nav,tab);}
 ui.nav('today');ui.action('continue');ui.action('finish-read');
 ui.nav('today');ui.action('continue');ui.type('reflection-input','A fictional reflection');ui.doc.querySelector('[name="share"]').checked=true;ui.action('save-reflection');
 ui.nav('today');ui.action('continue');for(const word of ['know','good','love','called','purpose'])ui.click('[data-word="'+word+'"]');ui.action('check-memory');
 ui.nav('today');ui.action('continue');ui.click('[data-pray-for="anna"]');ui.doc.querySelector('#prayer-note').value='Private fictional prayer';ui.action('finish-pray');
 assert.deepEqual(Object.values(ui.saved().done),[true,true,true,true]);
 ui.nav('group');assert.match(ui.text(),/A fictional reflection/);ui.click('[data-action="react"]');ui.click('[data-event="gathering"]');ui.click('[data-rsvp="going"]');
 ui.nav('serve');ui.click('[data-event="food"]');ui.click('[data-join="food"]');assert.deepEqual(ui.saved().joined,['food']);
 const saved=ui.saved(),again=open(t,saved,ui.extra());assert.deepEqual(again.saved(),saved);
 again.nav('group');again.click('[data-event="gathering"]');assert.equal(again.doc.querySelector('[data-rsvp="going"]').getAttribute('aria-pressed'),'true');
 again.nav('serve');again.click('[data-event="food"]');again.click('[data-join="food"]');assert.deepEqual(again.saved().joined,[]);
 assert.equal(again.saved().reflection,'A fictional reflection');assert.equal(again.saved().prayerNote,'Private fictional prayer');
});
test('saved Premium Hybrid demo data survives rendering/navigation and reversible acknowledgments',t=>{
 const saved={day:'2026-11-19',done:{read:true,share:true,memorize:false,pray:false},reflection:'Existing local note',prayerNote:'Existing prayer',prayed:['anna'],encouraged:['marcus'],reactions:['jess'],rsvp:'maybe',joined:['food','meals'],memoryWords:['know'],memoryFeedback:'',emailReminders:true};
 const ui=open(t,saved);for(const tab of ['today','group','read','serve','progress'])ui.nav(tab);assert.deepEqual(ui.saved(),saved);
 ui.nav('group');assert.doesNotMatch(ui.text(),/Existing local note/);ui.click('[data-action="react"]');assert.deepEqual(ui.saved().reactions,[]);ui.click('[data-action="react"]');ui.click('[data-event="gathering"]');
 ui.click('[data-rsvp="going"]');assert.equal(ui.saved().rsvp,'going');ui.click('[data-rsvp="maybe"]');assert.deepEqual(ui.saved(),saved);
});
