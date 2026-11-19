const {test}=require('node:test');
const assert=require('node:assert/strict');
const {open}=require('./helpers.cjs');
test('reading completion connects Today and Progress, Scripture is attributed and navigable',t=>{
 const ui=open(t);ui.nav('read');assert.match(ui.text(),/World English Bible/i);assert.equal(ui.doc.querySelectorAll('[data-verse]').length,3);
 ui.action('finish-read');ui.nav('today');assert.match(ui.doc.querySelector('.rhythm-item[data-grow="read"]').getAttribute('aria-label'),/completed/);ui.nav('progress');assert.match(ui.text(),/Scripture moments/);assert.equal(ui.extra().readItems.length,1);
 ui.nav('read');ui.action('chapters');ui.click('[data-book="Psalms"][data-chapter="23"]');assert.equal(ui.doc.querySelectorAll('[data-verse]').length,6);assert.match(ui.text(),/Yahweh is my shepherd/);
 ui.click('[data-font="1"]');assert.equal(ui.extra().reader.font,23);
});
test('verse selection saves a highlight and bookmark, and opens a private reflection in verse context',t=>{
 const ui=open(t);ui.nav('read');ui.click('[data-verse="26"]');ui.action('highlight');assert.equal(ui.doc.querySelector('[data-verse="26"]').classList.contains('highlighted'),true);ui.action('bookmark-passage');ui.action('reflect-passage');
 assert.match(ui.text(),/Romans 8:26 · WEB/);assert.equal(ui.doc.querySelector('[name="share"]').checked,false);ui.type('reflection-input','This is private by default.');ui.action('save-reflection');
 assert.equal(ui.extra().reflections[0].shared,false);assert.deepEqual(ui.extra().reflections[0].verses,[26]);ui.nav('group');assert.doesNotMatch(ui.text(),/This is private by default/);
 ui.click('[data-screen="profile"]');ui.click('[data-screen="saved"]');assert.match(ui.text(),/This is private by default/);assert.match(ui.text(),/Saved Scripture/);
});
test('sharing, discussion, contextual reading and unsharing stay connected',t=>{
 const ui=open(t);ui.nav('read');ui.click('[data-grow="share"]');ui.type('reflection-input','A shared sample thought.');ui.doc.querySelector('[name="share"]').checked=true;ui.action('save-reflection');const id=ui.extra().reflections[0].id;
 ui.nav('group');assert.match(ui.text(),/A shared sample thought/);ui.click('[data-reflection="'+id+'"]');ui.type('comment-input','A follow-up in the local conversation.');ui.click('form[data-form="comment"] button[type="submit"]');assert.match(ui.text(),/A follow-up in the local conversation/);
 ui.click('[data-read-context="'+id+'"]');assert.match(ui.text(),/Room to listen/);ui.nav('group');ui.click('[data-reflection="'+id+'"]');const box=ui.doc.querySelector('[data-share-reflection]');box.checked=false;box.dispatchEvent(new ui.window.Event('change',{bubbles:true}));ui.nav('group');assert.doesNotMatch(ui.text(),/A shared sample thought/);
 const reload=open(t,ui.saved(),ui.extra());reload.click('[data-screen="profile"]');reload.click('[data-screen="saved"]');assert.match(reload.text(),/A shared sample thought/);
});
test('private and group prayer intentions respect their chosen audience',t=>{
 const ui=open(t);ui.nav('read');ui.click('[data-grow="pray"]');ui.type('prayer-note','A private family intention.');ui.action('save-prayer');assert.equal(ui.extra().prayers[0].shared,false);ui.nav('group');assert.doesNotMatch(ui.text(),/A private family intention/);
 ui.nav('read');ui.click('[data-grow="pray"]');ui.type('prayer-note','A shared demo request.');ui.doc.querySelector('[name="sharePrayer"]').checked=true;ui.action('save-prayer');ui.action('finish-pray');ui.nav('group');assert.match(ui.text(),/A shared demo request/);const p=ui.extra().prayers.find(p=>p.shared);ui.click('[data-remove-prayer="'+p.id+'"]');assert.doesNotMatch(ui.text(),/A shared demo request/);
});
test('member encouragement has a real composer, local confirmation and progress connection',t=>{
 const ui=open(t);ui.click('[data-member="taylor"]');assert.match(ui.doc.querySelector('[role="dialog"]').textContent,/Taylor/);assert.equal(ui.doc.querySelector('.phone-screen').inert,true);ui.click('[data-compose="taylor"]');ui.type('encourage-input','So glad you are here, Taylor.');ui.click('form[data-form="encourage"] button[type="submit"]');assert.equal(ui.doc.querySelector('[role="dialog"]'),null);assert.equal(ui.saved().done.share,true);assert.equal(ui.extra().encouragements[0].text,'So glad you are here, Taylor.');assert.match(ui.doc.querySelector('#toast').textContent,/nothing was sent/i);
});
test('opportunities have details, requirements, join/leave and persistent commitments',t=>{
 const ui=open(t);ui.nav('serve');ui.click('[data-event="food"]');assert.match(ui.text(),/closed-toe shoes/);ui.click('[data-join="food"]');assert.match(ui.text(),/You’re on the demo team/);ui.nav('serve');assert.match(ui.text(),/Your commitments/);ui.action('my-serving');assert.match(ui.doc.querySelector('[role="dialog"]').textContent,/Community food drive/);
 const reload=open(t,ui.saved(),ui.extra());reload.nav('serve');reload.click('[data-event="food"]');reload.click('[data-join="food"]');assert.deepEqual(reload.saved().joined,[]);
});
test('Explore search/categories have complete original articles and save to personal space',t=>{
 const ui=open(t);ui.click('[data-screen="explore"]');ui.type('content-search','quiet');ui.click('form[data-form="search"] button[type="submit"]');assert.match(ui.text(),/Try another thought/);ui.type('content-search','Romans');ui.click('form[data-form="search"] button[type="submit"]');assert.ok(ui.doc.querySelector('[data-content="table-guide"]'));ui.click('[data-content="table-guide"]');assert.match(ui.text(),/Keep personal details within the group/);ui.click('[data-save-content="table-guide"]');ui.click('[data-screen="profile"]');ui.click('[data-screen="saved"]');assert.ok(ui.doc.querySelector('[data-content="table-guide"]'));
});
test('notifications route to the relevant reflection and gathering',t=>{
 const ui=open(t);ui.click('[data-screen="notifications"]');ui.click('[data-notification="notice-reflection"]');assert.match(ui.text(),/prayer doesn’t have to be perfect/);assert.ok(ui.doc.querySelector('form[data-form="comment"]'));ui.click('[data-screen="notifications"]');ui.click('[data-notification="notice-gathering"]');assert.ok(ui.doc.querySelector('[data-rsvp="going"]'));ui.click('[data-rsvp="going"]');assert.equal(ui.saved().rsvp,'going');assert.deepEqual(ui.extra().notificationReads,['notice-reflection','notice-gathering']);
});
test('untrusted notes are rendered as text and no cross-user delivery is implied',t=>{
 const ui=open(t);ui.nav('read');ui.click('[data-grow="share"]');ui.type('reflection-input','<img src=x onerror="alert(1)"> <script>bad()</script>');ui.doc.querySelector('[name="share"]').checked=true;ui.action('save-reflection');ui.nav('group');assert.equal(ui.doc.querySelector('img[src="x"]'),null);assert.match(ui.text(),/<script>bad/);assert.match(ui.text(),/No messages or registrations are sent/);
});
