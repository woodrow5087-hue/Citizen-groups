'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),fs=require('node:fs');
const {JSDOM}=require('jsdom'),Board=require('../rallypoint-priority-board.js'),Focus=require('../rally-one-unified-focus.js'),Studio=require('../rally-one-studio-today.js');
function fixture(overrides={}){
 const now=new Date('2026-12-02T12:00:00Z'),model={member:true,team:true,audience:'connected',greeting:'Good afternoon',nowLabel:'Wednesday, Dec 2',groupDate:new Date('2026-12-02T18:30:00Z'),serveDate:new Date('2026-12-06T09:00:00Z'),groupLocation:'Actual group fixture location',serveLocation:'Actual serving fixture location',conversationStatus:'ok',unread:3,rsvp:'',serveStatus:'pending',passage:'John 15:12',twoCommitmentDemo:true,...overrides};
 const baseline=Board.derive(model,now),focus=Focus.focus({board:baseline,model,now});
 const board={...baseline,hero:focus.hero,rows:focus.rows,taskCount:focus.actionCount,responsibilityIds:focus.responsibilityIds,caughtUp:focus.hero.id==='caught-up'};
 const html=Board.render({...model,unifiedFocus:focus,f10Enabled:true},'',[],now),doc=new JSDOM().window.document;
 return {html,model,board,now,doc};
}
const actions=root=>new Set([...root.querySelectorAll('button[data-action],button[data-go]')].map(e=>[e.dataset.action||'',e.dataset.go||'',e.dataset.pane||''].join('|')));
test('Studio Today preserves commitment actions, Ask and schedule destinations while removing duplicate shortcuts',()=>{
 const f=fixture(),before=JSON.stringify({model:f.model,board:f.board});const old=f.doc.createElement('div');old.innerHTML=f.html;const out=f.doc.createElement('div');out.innerHTML=Studio.render(f.html,f,f.doc);
 for(const key of ['f09-rsvp||','f09-serve||','f10-open||','|group|gather','|team|schedule'])assert.ok(actions(out).has(key),'Lost required action '+key);
 assert.equal(out.querySelector('.f09b-mission'),null);
 assert.equal(out.querySelector('.f10-entry'),null);
 assert.equal(out.querySelectorAll('.s13-optional>*').length,1);
 assert.match(out.querySelector('.s13-optional').textContent,/3 new group messages/);
 assert.equal(out.querySelector('.f09b-explain').closest('.f09b-hero'),out.querySelector('.f09b-hero'));
 assert.equal(out.querySelector('[data-priority]').dataset.priority,f.board.hero.id);
 assert.deepEqual([...out.querySelectorAll('[data-row].is-actionable')].map(e=>e.dataset.row),f.board.rows.filter(r=>f.board.responsibilityIds.includes(r.id)).map(r=>r.id));
 assert.equal(JSON.stringify({model:f.model,board:f.board}),before);assert.match(out.textContent,/Wednesday, Dec 2/);assert.match(out.textContent,/Actual group fixture location/);
 assert.equal(out.querySelector('[data-action=f09-rsvp]').textContent.includes('tonight'),true);
});
test('only canonical caught-up becomes All Set; guest, unavailable and deferred remain distinct',()=>{
 for(const [overrides,expected]of [[{rsvp:'going',serveStatus:'confirmed',unread:0},true],[{member:false,team:false},false],[{conversationStatus:'unavailable',rsvp:'going',serveStatus:'confirmed'},false],[{member:false,serveStatus:'pending',deferredIds:['serve-response']},false]]){
  const f=fixture(overrides),out=f.doc.createElement('div');out.innerHTML=Studio.render(f.html,f,f.doc);assert.equal(!!out.querySelector('.s13-settled'),expected);assert.equal(out.querySelector('h1').textContent==='You’re all set.',expected);
 }
});
test('source text is escaped and missing schedule dates never acquire fabricated dates or campus',()=>{
 const f=fixture({groupDate:null,serveDate:null,groupLocation:'<img src=x onerror=alert(1)>'});const out=f.doc.createElement('div');out.innerHTML=Studio.render(f.html,f,f.doc);assert.equal(out.querySelector('[onerror]'),null);assert.equal(out.querySelectorAll('.s13-date b').length,0);assert.ok(!out.textContent.includes('North campus'));
});
test('presentation owns no storage, listeners, network, rankings or supplied photography',()=>{
 const source=fs.readFileSync('rally-one-studio-today.js','utf8');assert.doesNotMatch(source,/localStorage|sessionStorage|addEventListener|fetch\(|data:image|studioPhotos|\.sort\(/);
});

test('With commitments handled the warm settled layout retains schedule, never fabricates canonical caught-up, and omits completed reading',()=>{
 const f=fixture({rsvp:'going',serveStatus:'confirmed',readToday:true,unread:3}),out=f.doc.createElement('div');out.innerHTML=Studio.render(f.html,f,f.doc);
 assert.equal(f.board.caughtUp,false);assert.equal(out.querySelector('.s13-today').dataset.caughtUp,'false');
 assert.ok(out.querySelector('.s13-commitments-clear'));assert.equal(out.querySelector('h1').textContent,'You’re all set.');
 assert.match(out.querySelector('.s13-summary').textContent,/Nothing needs your response\./);
 assert.equal(out.querySelectorAll('.s13-schedule-link').length,2);
 assert.equal(out.querySelectorAll('.s13-optional>*').length,1);assert.match(out.querySelector('.s13-optional').textContent,/3 new group messages/);
 assert.doesNotMatch(out.textContent,/Reading complete|View your community|Why this\?/);
});
test('Busy Today shows at most one optional row, prefers new messages, and drops optional care and completed reading',()=>{
 const f=fixture({rsvp:'going',readToday:true,unread:3}),out=f.doc.createElement('div');out.innerHTML=Studio.render(f.html,f,f.doc);
 assert.equal(out.querySelector('[data-priority]').dataset.priority,'serve-response');
 assert.equal(out.querySelectorAll('.s13-optional>*').length,1);
 assert.match(out.querySelector('.s13-optional').textContent,/3 new group messages/);assert.doesNotMatch(out.textContent,/Reading complete/);
 const noUnread=fixture({rsvp:'going',readToday:true,unread:0});out.innerHTML=Studio.render(noUnread.html,noUnread,noUnread.doc);
 assert.equal(out.querySelector('.s13-optional'),null);
});
