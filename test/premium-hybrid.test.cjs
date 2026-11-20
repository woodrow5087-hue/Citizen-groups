// The current preview runs the inline Premium Hybrid app, not legacy app.js.
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {readFileSync}=require('node:fs');
const {join}=require('node:path');
const {JSDOM}=require('jsdom');
const html=readFileSync(join(__dirname,'..','index.html'),'utf8');
const script=html.match(/<script>([\s\S]*?)<\/script>/)[1];
const key='citizen-premium-hybrid-demo-v1';
function open(t,saved){
 const dom=new JSDOM(html,{url:'https://preview.test',runScripts:'outside-only'});t.after(()=>dom.window.close());
 const {window}=dom,doc=window.document;
 const NativeDate=window.Date;window.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:['2026-11-19T12:00:00']))}};
 if(saved)window.localStorage.setItem(key,JSON.stringify(saved));
 window.eval(script);
 const click=selector=>{const el=doc.querySelector(selector);assert.ok(el,selector);el.click();};
 return {doc,window,click,nav:id=>click('[data-nav="'+id+'"]'),action:id=>click('[data-action="'+id+'"]'),saved:()=>JSON.parse(window.localStorage.getItem(key)),text:()=>doc.querySelector('#app-content').textContent};
}
test('current Premium Hybrid retains all five destinations and local completion/group/serving interactions',t=>{
 const ui=open(t);
 for(const tab of ['today','group','read','serve','progress']){ui.nav(tab);assert.equal(ui.doc.querySelector('#nav [aria-current="page"]').dataset.nav,tab);}
 ui.nav('today');ui.action('continue');ui.action('finish-read');
 ui.nav('today');ui.action('continue');ui.doc.querySelector('#reflection-input').value='A fictional reflection';ui.action('save-reflection');
 ui.nav('today');ui.action('continue');for(const word of ['know','good','love','called','purpose'])ui.click('[data-word="'+word+'"]');ui.action('check-memory');
 ui.nav('today');ui.action('continue');ui.click('[data-pray-for="anna"]');ui.doc.querySelector('#prayer-note').value='Private fictional prayer';ui.action('finish-pray');
 assert.deepEqual(Object.values(ui.saved().done),[true,true,true,true]);
 ui.nav('group');assert.match(ui.text(),/A fictional reflection/);ui.click('[data-rsvp="going"]');ui.click('[data-action="react"]');
 ui.nav('serve');ui.click('[data-join="food"]');assert.deepEqual(ui.saved().joined,['food']);
 const saved=ui.saved(),again=open(t,saved);assert.deepEqual(again.saved(),saved);
 again.nav('group');assert.match(again.doc.querySelector('[data-rsvp="going"]').textContent,/Going/);
 again.nav('serve');again.click('[data-join="food"]');assert.deepEqual(again.saved().joined,[]);
 assert.equal(again.saved().reflection,'A fictional reflection');assert.equal(again.saved().prayerNote,'Private fictional prayer');
});
test('saved Premium Hybrid demo data survives rendering/navigation and reversible acknowledgments',t=>{
 const saved={day:'2026-11-19',done:{read:true,share:true,memorize:false,pray:false},reflection:'Existing local note',prayerNote:'Existing prayer',prayed:['anna'],encouraged:['marcus'],reactions:['jess'],rsvp:'maybe',joined:['food','meals'],memoryWords:['know'],memoryFeedback:'',emailReminders:true};
 const ui=open(t,saved);for(const tab of ['today','group','read','serve','progress'])ui.nav(tab);assert.deepEqual(ui.saved(),saved);
 ui.nav('group');ui.click('[data-encourage="marcus"]');assert.deepEqual(ui.saved().encouraged,[]);ui.click('[data-encourage="marcus"]');
 ui.click('[data-rsvp="going"]');assert.equal(ui.saved().rsvp,'going');ui.click('[data-rsvp="maybe"]');assert.deepEqual(ui.saved(),saved);
});
