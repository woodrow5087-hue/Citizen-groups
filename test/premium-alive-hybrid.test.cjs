const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const path=require('node:path');
const root=path.resolve(__dirname,'..');
function helpers(){
  const sandbox={window:{}};
  vm.runInNewContext(fs.readFileSync(path.join(root,'rallypoint-premium-alive.js'),'utf8'),sandbox);
  return sandbox.window.RallyHybrid;
}
const connected={memberships:{group:true,team:true}};
const disconnected={memberships:{group:false,team:false}};
test('Premium ALIVE visual layer uses existing red-black four-tab app without taking over main or changing local data keys',()=>{
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/rallypoint-premium-alive\.css/);
  assert.match(html,/rallypoint-premium-alive\.js/);
  assert.ok(html.indexOf('rallypoint-premium-alive.js')<html.indexOf('src="rallypoint.js"'));
  const controller=fs.readFileSync(path.join(root,'rallypoint.js'),'utf8');
  assert.match(controller,/hybridShell\.classList\.add\('premium-alive'\)/);
  assert.match(controller,/if\(a==='hybrid-person'\)/);
  assert.match(controller,/navigate\('group','direct'\)/);
  assert.match(controller,/const key='rallypoint-phase1-2026'/);
  assert.match(controller,/\['today','Today','home'\],\['group','Groups','group'\],\['team','Team','team'\],\['read','Read','read'\]/);
});
test('people circles represent real functional demo destinations, not decorative avatars',()=>{
  const h=helpers();
  const rail=h.peopleRail(connected,'group');
  assert.match(rail,/Your people/);
  assert.equal((rail.match(/class="pa-person-trigger"/g)||[]).length,5);
  for(const id of ['anna','jess','marcus','taylor'])assert.match(rail,new RegExp('data-action="hybrid-person" data-person="'+id+'"'));
  assert.match(rail,/data-go="group" data-pane="chat"/);
  assert.match(rail,/FICTIONAL|fictional|DEMO/);
  assert.equal(h.peopleRail(disconnected,'today'),'');
});
test('Today hero remains personal and companion prompt adapts to meaningful source state',()=>{
  const h=helpers();
  assert.match(h.todayHero(connected),/Your people/);
  assert.match(h.todayHero(disconnected),/Explore fictional groups/);
  assert.match(h.todayPrompt({teamStatus:'pending'},connected),/Review my serve/);
  assert.match(h.todayPrompt({teamStatus:'confirmed',groupMessages:[{name:'Anna L.'}]},connected),/Catch up with my group/);
  assert.match(h.todayPrompt({teamStatus:'confirmed',read:false,prayed:false},disconnected),/Open today’s reading/);
  assert.match(h.todayPrompt({teamStatus:'confirmed',read:true,prayed:false},disconnected),/Open prayer/);
  assert.match(h.todayPrompt({teamStatus:'confirmed',read:true,prayed:true},disconnected),/There’s no streak to protect/);
});
test('group summary routes to existing gathering rather than inventing attendance or messages',()=>{
 const h=helpers();
 assert.match(h.groupSummary(),/data-go="group" data-pane="gather"/);
 assert.match(h.groupSummary(),/fictional members/);
 const code=fs.readFileSync(path.join(root,'rallypoint-premium-alive.js'),'utf8');
 for(const forbidden of ['fetch(', 'XMLHttpRequest', 'localStorage.setItem(', 'navigator.sendBeacon(', 'WebSocket('])
   assert.ok(!code.includes(forbidden),'No writeback or network operations in visual helpers: '+forbidden);
});


test('optional care companion uses only a fictional source note and remembers completion',()=>{
 const h=helpers();
 const ui=connected;
 const state={teamStatus:'pending',prayers:[{name:'Marcus C.',text:'A fictional request'}]};
 const before=h.todayPrompt(state,ui);
 assert.match(before,/Check in with Marcus/);
 assert.match(before,/data-action="companion-encourage"/);
 assert.match(before,/companion-snooze/);
 const after=h.todayPrompt({...state,companionCare:{marcus:{completedAt:'2026-11-21T16:00:00Z'}}},ui);
 assert.match(after,/checked in with Marcus/);
 assert.match(after,/Review my serve/);
 assert.doesNotMatch(after,/data-action="companion-encourage"/);
 const noSource=h.todayPrompt({...state,prayers:[]},ui);
 assert.doesNotMatch(noSource,/Check in with Marcus/);
});


test('private Scripture step uses existing reflection and Today cards with no added navigation',()=>{
 const h=helpers();
 const reading={passage:'John 15:12'};
 const editor=h.rhythmEditor({},reading);
 assert.match(editor,/Take it into the week/);
 assert.match(editor,/data-action="rhythm-save"/);
 assert.match(editor,/No notifications are sent/);
 const item={rhythm:{text:'Help a neighbor',passage:'John 15:12',followUpAt:'2026-11-24T08:00:00Z',completedAt:null}};
 const initial=h.rhythmFollowup(item,new Date('2026-11-23T10:00:00Z'));
 assert.match(initial,/A SMALL STEP FOR TOMORROW/);
 assert.doesNotMatch(initial,/data-action="rhythm-complete"/);
 const due=h.rhythmFollowup(item,new Date('2026-11-25T10:00:00Z'));
 assert.match(due,/data-action="rhythm-complete"/);
 assert.match(due,/data-action="rhythm-defer"/);
 const done=h.rhythmFollowup({rhythm:{...item.rhythm,completedAt:'2026-11-25T12:00:00Z'}},new Date('2026-11-26T10:00:00Z'));
 assert.match(done,/YOU FOLLOWED THROUGH/);
 assert.doesNotMatch(done,/data-action="rhythm-complete"/);
 assert.match(h.todayPrompt({rhythm:item.rhythm,teamStatus:'pending',prayers:[]},connected),/pa-rhythm-followup/);
});
