const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const T=require('../rallypoint-today.js');
const root=path.resolve(__dirname,'..'),key='rallypoint-phase1-2026';
function open(t,{saved,ui,blocked=false,now='2026-11-23T12:00:00'}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:'https://rally.test',runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window,d=w.document;
 const NativeDate=w.Date;w.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return new NativeDate(now).getTime();}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)w.localStorage.setItem(key,JSON.stringify(saved));if(ui)w.localStorage.setItem(T.UI_KEY,JSON.stringify(ui));
 const other='{"reflection":"An existing Citizen Connect note"}';w.localStorage.setItem('citizen-premium-hybrid-demo-v1',other);
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('Blocked storage');}});
 for(const name of ['rallypoint-today.js','rallypoint-ui.js','rallypoint.js'])w.eval(fs.readFileSync(path.join(root,name),'utf8'));
 const click=selector=>{const el=d.querySelector(selector);assert.ok(el,selector);el.click();};
 const type=(id,value)=>{const el=d.getElementById(id);assert.ok(el,id);el.value=value;el.dispatchEvent(new w.Event('input',{bubbles:true}));};
 return {w,d,click,type,action:a=>click('[data-action="'+a+'"]'),go:v=>click('#nav [data-go="'+v+'"]'),saved:()=>JSON.parse(w.localStorage.getItem(key)),ui:()=>JSON.parse(w.localStorage.getItem(T.UI_KEY)),text:()=>d.getElementById('view').textContent,other};
}
test('Today ranks actual fixture events, handles same-day times and excludes declined service',()=>{
 const state={teamStatus:'pending',role:'member',groupMessages:[],prayers:[],reached:[]},ui=T.initial();
 assert.equal(T.snapshot(state,ui,new Date('2026-11-20T12:00:00')).upNext.id,'team');
 assert.equal(T.snapshot(state,ui,new Date('2026-11-23T12:00:00')).upNext.id,'group');
 assert.equal(T.snapshot({...state,teamStatus:'declined'},ui,new Date('2026-11-20T12:00:00')).upNext.id,'group');
 const same=T.nextEvent(3,18,30,new Date('2026-11-25T12:00:00'));assert.equal(same.getDate(),25);assert.match(T.dateLabel(same,new Date('2026-11-25T12:00:00')),/^Today/);
 assert.equal(T.nextEvent(3,18,30,new Date('2026-11-25T19:00:00')).getDate(),2);
});
test('attention and leader entry come from source state and contextual fixture permission',()=>{
 const state={teamStatus:'confirmed',role:'member',groupMessages:[{text:'A sample note'}],prayers:[],reached:[]},ui=T.initial();
 ui.seenGroupSignature=T.signature(state);assert.equal(T.snapshot(state,ui).attention,0);assert.equal(T.snapshot(state,ui).leader,null);
 assert.equal(T.snapshot({...state,role:'leader'},ui).leader.remaining.length,2);
 assert.equal(T.snapshot({...state,role:'leader',reached:['marcus','taylor']},ui).leader,null);
 ui.memberships.group=false;assert.equal(T.snapshot({...state,role:'leader'},ui).leader,null);
 ui.memberships.team=false;assert.equal(T.snapshot(state,ui).upNext,null);
});
test('four tabs retain source destinations and Today links directly to conversation, schedule and reading',t=>{
 const app=open(t);assert.deepEqual([...app.d.querySelectorAll('#nav [data-go]')].map(b=>b.textContent.trim()),['Today','Groups','Team','Read']);
 assert.equal(app.d.querySelectorAll('#nav button').length,5);
 assert.ok(app.d.querySelector('#nav .fluid-quick'));
 for(const tab of ['group','team','read','today']){app.go(tab);assert.equal(app.d.querySelector('#nav [aria-current="page"]').dataset.go,tab);}
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="connected"]');
 app.click('.up-next');assert.equal(app.saved().view,'group');assert.equal(app.saved().groupPane,'gather');assert.ok(app.d.querySelector('[data-action="rsvp"]'));
 app.go('today');app.click('.attention-tile[data-go="group"]');assert.equal(app.saved().groupPane,'chat');assert.ok(app.d.getElementById('group-input'));
 app.go('today');app.click('.availability-action');assert.equal(app.saved().view,'team');assert.equal(app.saved().teamPane,'schedule');
 app.go('today');app.click('[data-reading="scripture"]');assert.equal(app.d.activeElement.id,'reading-scripture');app.go('today');app.click('[data-reading="questions"]');assert.equal(app.d.activeElement.id,'reading-questions');
 assert.equal(app.w.localStorage.getItem('citizen-premium-hybrid-demo-v1'),app.other);
});
test('fluid Today uses connected visual modules and keeps quick actions functional',t=>{
 const app=open(t);
 assert.ok(app.d.querySelector('.phone-inner').classList.contains('is-fluid-today'));
 assert.ok(app.d.querySelector('.today-welcome .today-watermark'));
 assert.ok(app.d.querySelector('.fluid-week-events [data-go="group"]'));
 assert.ok(app.d.querySelector('.fluid-week-events [data-go="team"]'));
 app.action('quick-actions');
 const menu=app.d.querySelector('#dialog-root [role="dialog"]');
 assert.ok(menu);
 assert.match(menu.textContent,/Make your next move/);
 app.click('#dialog-root [data-go="read"]');
 assert.equal(app.saved().view,'read');
 assert.ok(!app.d.querySelector('.phone-inner').classList.contains('is-fluid-today'));
 app.go('today');
 assert.ok(app.d.querySelector('.phone-inner').classList.contains('is-fluid-today'));
});
test('Today settles into a real caught-up state after opening the source and confirming serving',t=>{
 const app=open(t);app.click('.attention-tile[data-go="group"]');app.go('today');app.click('.availability-action');app.click('[data-action="shift"][data-value="confirmed"]');app.go('today');assert.match(app.text(),/You’re all caught up/);assert.equal(app.d.querySelector('.attention-tile'),null);
 app.action('notifications');assert.match(app.d.querySelector('#dialog-root [role="dialog"]').textContent,/You’re all caught up/);app.action('close-dialog');
 const again=open(t,{saved:app.saved(),ui:app.ui()});assert.match(again.text(),/You’re all caught up/);
});
test('existing messages, prayer posts, RSVP, team coverage and reading remain functional after reload',t=>{
 const app=open(t);app.go('group');app.type('group-input','A local group thought.');app.click('[data-action="send"][data-value="group"]');assert.equal(app.d.getElementById('group-input').value,'');
 app.click('[data-area="group"][data-value="prayer"]');app.type('prayer-input','A fictional prayer.');app.click('[data-action="send"][data-value="prayer"]');
 app.click('[data-area="group"][data-value="gather"]');app.click('[data-action="rsvp"][data-value="going"]');
 app.go('team');app.click('[data-action="shift"][data-value="declined"]');app.action('cover');assert.equal(app.saved().coverage,true);app.click('[data-area="team"][data-value="chat"]');app.type('team-input','A local team note.');app.click('[data-action="send"][data-value="team"]');
 app.go('read');app.action('read');app.action('pray');const saved=app.saved();const again=open(t,{saved,ui:app.ui()});assert.deepEqual(again.saved(),saved);assert.ok(saved.groupMessages.some(m=>m.text==='A local group thought.'));assert.ok(saved.prayers.some(m=>m.text==='A fictional prayer.'));assert.ok(saved.teamMessages.some(m=>m.text==='A local team note.'));assert.equal(saved.rsvp,'going');assert.equal(saved.read,true);assert.equal(saved.prayed,true);
});
test('leader tools remain contextual, are denied to members and disappear when check-ins are reviewed',t=>{
 const app=open(t);app.action('demo-controls');app.click('#role');app.action('close-dialog');assert.ok(app.d.querySelector('.leader-entry'));app.click('.leader-entry');assert.equal(app.saved().groupPane,'leader');
 for(const id of ['marcus','taylor'])app.click('[data-action="reached"][data-person="'+id+'"]');app.go('today');assert.equal(app.d.querySelector('.leader-entry'),null);
 app.action('demo-controls');app.click('#role');app.action('close-dialog');app.go('group');assert.equal(app.d.querySelector('[data-area="group"][data-value="leader"]'),null);
 const injected=app.d.createElement('button');injected.dataset.action='pane';injected.dataset.area='group';injected.dataset.value='leader';app.d.body.append(injected);injected.click();assert.notEqual(app.saved().groupPane,'leader');
});
test('leader attendance, review and reading configuration persist without a new workflow',t=>{
 const app=open(t);app.action('demo-controls');app.click('#role');app.action('close-dialog');app.go('group');app.click('[data-area="group"][data-value="leader"]');app.click('[data-action="attendance"][data-person="marcus"][data-value="here"]');app.go('read');app.click('[data-action="plan"][data-value="study"]');app.type('question','An updated fictional discussion question.');app.action('question');assert.equal(app.saved().attendance.marcus,'here');assert.equal(app.saved().plan,'study');assert.equal(app.saved().question,'An updated fictional discussion question.');
});
test('empty and caught-up fixture controls keep messages, RSVP and reading choices',t=>{
 const app=open(t);app.go('group');app.type('group-input','Keep this note.');app.click('[data-action="send"][data-value="group"]');const messages=app.saved().groupMessages;
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');assert.match(app.text(),/There’s room/);assert.match(app.text(),/TODAY’S READING/);assert.equal(app.d.querySelector('.leader-entry'),null);assert.equal(app.d.querySelector('.up-next'),null);
 app.go('group');assert.match(app.text(),/Browse a few sample group options/);app.go('team');assert.match(app.text(),/No team or assignment/);app.action('team-preview');assert.match(app.d.querySelector('#dialog-root [role="dialog"]').textContent,/later-phase work/);app.action('close-dialog');
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="caught-up"]');assert.match(app.text(),/You’re all caught up/);assert.deepEqual(app.saved().groupMessages,messages);
});
test('Memorize is an honest phase preview, not a fake completion action',t=>{
 const app=open(t),before=app.saved();app.action('memorize-preview');assert.match(app.d.querySelector('#dialog-root [role="dialog"]').textContent,/not part of this Today-screen phase/);assert.deepEqual(app.saved(),before);app.action('close-dialog');
});
test('demo name is escaped, saved independently and modal keyboard dismissal restores focus',t=>{
 const app=open(t);app.click('.profile-avatar');assert.equal(app.d.querySelector('.phone-inner').inert,true);app.type('demo-name','<img src=x>');app.click('form button[type="submit"]');assert.equal(app.d.querySelector('img[src="x"]'),null);assert.match(app.text(),/<img src=x>/);assert.equal(app.ui().name,'<img src=x>');
 app.click('.profile-avatar');app.d.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(app.d.querySelector('#dialog-root [role="dialog"]'),null);assert.equal(app.d.activeElement.className,'profile-avatar');
});
test('storage failure is disclosed while the demo stays usable',t=>{
 const app=open(t,{blocked:true});assert.match(app.text(),/could not save/);app.go('group');app.type('group-input','An in-memory sample');app.click('[data-action="send"][data-value="group"]');assert.match(app.text(),/An in-memory sample/);
});
