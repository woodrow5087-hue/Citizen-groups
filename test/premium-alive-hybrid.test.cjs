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
