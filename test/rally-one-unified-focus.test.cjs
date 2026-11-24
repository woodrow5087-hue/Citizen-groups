'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const Focus=require('../rally-one-unified-focus.js');
const Board=require('../rallypoint-priority-board.js');
const Care=require('../rally-one-care-flow.js');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const now=new Date('2026-11-25T10:00:00');
function model(overrides={}){
 return {
  member:true,team:true,audience:'connected',name:'Friend',greeting:'Good morning',
  groupDate:new Date('2026-11-25T18:30:00'),serveDate:new Date('2026-11-26T09:00:00'),
  unread:3,conversationStatus:'ok',rsvp:'',serveStatus:'pending',
  leaderRemaining:0,readToday:false,rhythmDue:false,passage:'John 15:12',
  deferredIds:[],...overrides
 };
}
function care(stage='ready'){
 const state={prayers:[{name:'Marcus C.',text:'Praying for wisdom with an upcoming decision.'}],
  companionCare:{marcus:{}}};
 if(stage==='prayed')state.companionCare.marcus.prayedAt=now.toISOString();
 if(stage==='paused')state.companionCare.marcus.snoozedUntil='2026-11-30T00:00:00.000Z';
 if(stage==='completed')state.companionCare.marcus.completedAt=now.toISOString();
 return Care.derive({state,member:true,now});
}
function select(d,careState=care()){
 const board=Board.derive(d,now);
 return Focus.focus({board,model:d,care:careState,now});
}
function html(d,careState=care()){
 const focus=select(d,careState);
 return new JSDOM(Board.render({...d,unifiedFocus:focus},'',[],now)).window.document;
}
test('connected member: prioritize real RSVP and serving before optional care; cap at two',()=>{
 const f=select(model());
 assert.equal(f.selectedIds.length,2);
 assert.deepEqual(f.selectedIds,['group-rsvp','serve-response']);
 const dom=html(model());
 assert.equal(dom.querySelectorAll('.f09b-hero').length,1);
 assert.equal(dom.querySelectorAll('.f09b-row').length,1);
 assert.equal(dom.querySelector('[data-priority="group-rsvp"] .f09b-primary')?.dataset.action,'f09-rsvp');
 assert.equal(dom.querySelector('[data-row="serve-response"] .f09b-row-cta')?.dataset.action,'f09-serve');
 assert.equal(dom.querySelectorAll('.ro-care--today').length,0);
});
test('responding changes next actions, and reading actual conversation clears unread priority',()=>{
 const pending=model();
 assert.deepEqual(select(pending).selectedIds,['group-rsvp','serve-response']);
 const served=model({rsvp:'going',serveStatus:'confirmed'});
 assert.equal(select(served).selectedIds[0],'group-unread');
 assert.equal(select(model({rsvp:'going',serveStatus:'confirmed',unread:0})).selectedIds[0],'care-prayer');
 const prayed=select(model({rsvp:'going',serveStatus:'confirmed',unread:0}),care('prayed'));
 assert.deepEqual(prayed.selectedIds,['care-check-in']);
 assert.equal(prayed.hero.primary.id,'companion-encourage');
});
test('completed, snoozed and absent care never return as an overdue priority',()=>{
 const d=model({rsvp:'going',serveStatus:'confirmed',unread:0,readToday:true});
 for(const state of ['paused','completed']){
  const f=select(d,care(state));
  assert.equal(f.selectedIds.length,0);
  assert.ok(['caught-up','paused'].includes(f.hero.id));
 }
 const noGroup=model({member:false,team:false,audience:'newcomer',unread:0,rsvp:'',serveStatus:'none'});
 const f=select(noGroup,care());
 assert.equal(f.hero.id,'welcome-community');
 assert.equal(f.selectedIds.length,0);
 assert.ok(f.rows.length<=1);
 assert.ok(!f.rows.some(x=>x.id==='group-unread'||x.id==='care-marcus'));
});
test('serving-only gets a serving next step, never private group or care details',()=>{
 const d=model({member:false,team:true,audience:'volunteer',unread:0,conversationStatus:'not-joined'});
 const f=select(d,care());
 assert.deepEqual(f.selectedIds,['serve-response']);
 assert.equal(f.hero.primary.id,'f09-serve');
 assert.equal(f.rows.length,0);
 const after=select({...d,serveStatus:'confirmed'},care());
 assert.equal(after.selectedIds.length,0);
 assert.ok(!/group|care/i.test(after.hero.id));
});
test('authorized leader gets genuine pending leader fixture, not inferred participation risk',()=>{
 const d=model({member:true,team:false,audience:'leader',rsvp:'going',unread:0,serveStatus:'none',leaderRemaining:2});
 const f=select(d,care('completed'));
 assert.deepEqual(f.selectedIds,['leader-checkins']);
 assert.equal(f.hero.primary.id,'group');
 assert.equal(f.hero.primary.pane,'leader');
 assert.match(f.hero.why,/fixture|unreviewed/i);
 const notLeader=select({...d,audience:'group-member'},care('completed'));
 assert.ok(!notLeader.selectedIds.includes('leader-checkins'));
});
test('source-backed care is human-led and does not create storage or send an action',()=>{
 const d=model({member:true,team:false,audience:'group-member',rsvp:'going',unread:0,serveStatus:'none'});
 const f=select(d,care());
 assert.deepEqual(f.selectedIds,['care-prayer']);
 assert.equal(f.hero.primary.kind,'action');
 assert.equal(f.hero.primary.id,'care-open-prayer');
 assert.match(f.hero.why,/named fictional prayer request/i);
 assert.equal(Focus.focus({board:Board.derive(d,now),model:d,care:null}).selectedIds.length,0);
 const source=read('rally-one-unified-focus.js');
 assert.doesNotMatch(source,/localStorage|sessionStorage|fetch\s*\(|WebSocket|Date\.now\(\)|sendMessage/);
});
test('Rally One uses unified priority board with no extra Today card',()=>{
 const js=read('rallypoint.js');
 assert.match(js,/window\.RallyIntelligence\.derive/);
 assert.match(read('rally-one-intelligence.js'),/Focus\.focus/);
 assert.match(js,/if\(s\.view==='group'&&s\.groupPane==='overview'\)/);
 assert.doesNotMatch(js,/window\.RallyCareFlow\.render\(care,\{placement:'today'\}\)/);
 const board=read('rallypoint-priority-board.js');
 assert.match(board,/unifiedFocus/);
 const html=read('index.html'),build=read('scripts/build.cjs');
 assert.ok(html.includes('rally-one-unified-focus.js'));
 assert.ok(build.includes("'rally-one-unified-focus.js'"));
});
