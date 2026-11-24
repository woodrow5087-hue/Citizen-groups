const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {JSDOM}=require('jsdom');
const T=require('../rallypoint-today.js');
const {makeChatDomainBundle}=require('../scripts/build-chat-lab.cjs');
const root=path.resolve(__dirname,'..'),key='rallypoint-phase1-2026';
function open(t,{previewBuild=false,saved,ui,modern,blocked=false,f09=false,f10=false,f103=false,now='2026-11-23T12:00:00'}={}){
 const dom=new JSDOM(fs.readFileSync(path.join(root,'index.html'),'utf8'),{url:f103?'https://rally.test/?f103=1':f10?'https://rally.test/?f10=1':f09?'https://rally.test/?f09='+(f09===true?'1':f09):'https://rally.test',runScripts:'outside-only',pretendToBeVisual:true});t.after(()=>dom.window.close());const w=dom.window,d=w.document;
 if(previewBuild)d.documentElement.dataset.defaultToday='board';
 const NativeDate=w.Date;w.Date=class extends NativeDate{constructor(...args){super(...(args.length?args:[now]));}static now(){return new NativeDate(now).getTime();}};
 w.HTMLElement.prototype.scrollIntoView=function(){};
 if(saved)w.localStorage.setItem(key,JSON.stringify(saved));if(ui)w.localStorage.setItem(T.UI_KEY,JSON.stringify(ui));
  if(modern!==undefined)w.localStorage.setItem('rallypoint-wednesday-chat-lab-v1',modern);
 const other='{"reflection":"An existing Citizen Connect note"}';w.localStorage.setItem('citizen-premium-hybrid-demo-v1',other);
 if(blocked)Object.defineProperty(w,'localStorage',{get(){throw Error('Blocked storage');}});
 w.structuredClone=structuredClone;
  w.eval(makeChatDomainBundle());
  for(const name of ['rallypoint-today.js','rallypoint-ui.js','rallypoint-memorize.js','rallypoint-verseplay-ui.js','rallypoint-companion-decision.js','rallypoint-premium-alive.js','rallypoint-smart-dashboard.js','rallypoint-priority-board.js','rallypoint-personal-companion.js','rally-one-member-context.js','rally-one-care-flow.js','rally-one-unified-focus.js','rally-one-intelligence.js','rallypoint-group-view.js','rallypoint-group-experience.js','rallypoint-storage-guard.js','rallypoint-conversation-read-model.js','wednesday-chat-lab.js','rally-one-launch-mode.js','rallypoint.js'])w.eval(fs.readFileSync(path.join(root,name),'utf8'));
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
 assert.equal(app.d.querySelectorAll('#nav button').length,4);
 assert.ok(app.d.querySelector('.pa-companion-more'));
 for(const tab of ['group','team','read','today']){app.go(tab);assert.equal(app.d.querySelector('#nav [aria-current="page"]').dataset.go,tab);}
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="connected"]');
 app.click('.up-next');assert.equal(app.saved().view,'group');assert.equal(app.saved().groupPane,'gather');assert.ok(app.d.querySelector('[data-action="rsvp"]'));
 app.go('today');app.click('.today-people-message[data-go="group"]');assert.equal(app.saved().groupPane,'chat');assert.ok(app.d.getElementById('group-input'));
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
test('Connected Dashboard uses source state for side-by-side schedule and team widgets',t=>{
 const app=open(t);
 const row=app.d.querySelector('.dashboard-twins');
 assert.ok(row);
 assert.equal(row.querySelectorAll('button').length,2);
 assert.match(row.querySelector('.dashboard-next').textContent,/Wed/);
 assert.match(row.querySelector('.dashboard-team').textContent,/Confirm/);
 assert.ok(row.querySelector('.availability-action'));
 app.click('.availability-action');
 app.click('[data-action="shift"][data-value="confirmed"]');
 app.go('today');
 assert.match(app.d.querySelector('.dashboard-team-title').textContent,/You’re in/);
 assert.equal(app.d.querySelector('.availability-action'),null);
 assert.ok(app.d.querySelector('.today-people-message'));
 assert.equal(app.d.querySelector('.reading-actions [data-reading="questions"]').textContent.includes('Reflect'),true);
});
test('Your People reads the modern conversation, not the preserved writable legacy archive',t=>{
  const app=open(t);
  const panel=app.d.querySelector('.today-people');
  assert.ok(panel);
  const sections=[...app.d.querySelector('.today-screen').children];
  assert.equal(sections[0].classList.contains('today-welcome'),true);
  assert.equal(sections[1].classList.contains('pa-today-hero'),true);
  assert.equal(sections[2].classList.contains('pa-people-rail'),true);
  assert.equal(sections[3].classList.contains('pa-companion'),true);
  assert.equal(sections[4],panel);
  assert.equal(sections[5].classList.contains('dashboard-twins'),true);
  assert.equal(panel.querySelectorAll('.today-people-avatar').length,4);
  assert.equal(panel.querySelector('.today-people-message-author').textContent,'You');
  assert.match(panel.querySelector('.today-people-message-text').textContent,/Love that. Looking forward/);
  assert.match(panel.querySelector('.today-people-message-action').textContent,/3 UNREAD/);
  app.click('.today-people-message');
  assert.equal(app.saved().view,'group');
  assert.equal(app.saved().groupPane,'chat');
  assert.ok(app.d.getElementById('rpx-chat'),'modern conversation is opened');
  app.type('group-input','A preserved legacy thought.');
  app.click('[data-action="send"][data-value="group"]');
  app.go('today');
  assert.equal(app.d.querySelector('.today-people-message-author').textContent,'You');
  assert.match(app.d.querySelector('.today-people-message-text').textContent,/Love that. Looking forward/);
  assert.ok(app.saved().groupMessages.some(m=>m.text==='A preserved legacy thought.'));
  assert.doesNotMatch(app.d.querySelector('.today-people-message-text').textContent,/preserved legacy/);
  assert.equal(app.d.querySelector('.attention-tile[data-go="group"]'),null);
  assert.equal(app.d.querySelector('.today-people-avatars [aria-label="Jess W."]').textContent,'JW');

  // The same F-02 store receives another fictional member's sent message.
  const key='rallypoint-wednesday-chat-lab-v1',saved=JSON.parse(app.w.localStorage.getItem(key));
  const repo=app.w.RallyChatDomain.createMockConversationRepository({
    seed:saved.snapshot,clock:()=>new Date('2026-11-23T12:00:01.000Z')
  });
  const message=repo.sendMessage({conversationId:'group_wednesday',userId:'u_anna',
    body:'A fresh modern conversation update.'});
  repo.setDeliveryStatus({messageId:message.id,userId:'u_anna',status:'sent'});
  saved.snapshot=repo.getSnapshot();
  app.w.localStorage.setItem(key,JSON.stringify(saved));
  app.go('team');app.go('today');
  assert.equal(app.d.querySelector('.today-people-message-author').textContent,'Anna L.');
  assert.match(app.d.querySelector('.today-people-message-text').textContent,/fresh modern conversation/);
  assert.match(app.d.querySelector('.today-people-message-action').textContent,/1 UNREAD/);
  app.click('.today-people-message');app.go('today');
  assert.equal(app.d.querySelector('.attention-tile[data-go="group"]'),null);
  assert.equal(app.w.RallyConversationRead.peek({storage:app.w.localStorage,
    domain:app.w.RallyChatDomain}).unreadCount,0);
});
test('Your People adapts to authorized leaders and group discovery without inventing membership',t=>{
 const app=open(t);
 assert.equal(app.d.querySelector('.today-people-leader'),null);
 app.action('demo-controls');app.click('#role');app.action('close-dialog');
 assert.ok(app.d.querySelector('.today-people-leader'));
 assert.match(app.d.querySelector('.today-people-kicker').textContent,/LEADER VIEW/);
 app.click('.today-people-leader');
 assert.equal(app.saved().view,'group');
 assert.equal(app.saved().groupPane,'leader');
 app.action('demo-controls');
 app.click('[data-action="scenario"][data-value="no-memberships"]');
 assert.ok(app.d.querySelector('.today-people--discover'));
 assert.equal(app.d.querySelector('.pa-people-rail'),null,'No fictional personal network without a demo group membership');
 assert.ok(app.d.querySelector('.today-screen .pa-today-hero'));
 assert.ok(app.d.querySelector('.today-screen .pa-companion'));
 assert.equal(app.d.querySelector('.today-people-avatar'),null);
 assert.equal(app.d.querySelector('.today-people-message'),null);
 assert.equal(app.d.querySelector('.today-people-leader'),null);
 app.click('.today-people-discover-link');
 assert.equal(app.saved().view,'group');
 assert.match(app.text(),/Browse a few sample group options/);
});
test('Your People safely escapes the modern message body and preserves legacy HTML-looking text',t=>{
  const app=open(t,{saved:{groupMessages:[{name:'<img src=x>',time:'Today',text:'Legacy <b>record</b>'}]}});
  const modern=app.w.RallyConversationRead.fixture(app.w.RallyChatDomain);
  modern.messages.at(-1).body='<script>not markup</script>';
  app.w.localStorage.setItem('rallypoint-wednesday-chat-lab-v1',
    JSON.stringify({schemaVersion:1,snapshot:modern,draft:'',replyTo:null}));
  app.go('team');app.go('today');
  const preview=app.d.querySelector('.today-people-message');
  assert.equal(preview.textContent.includes('<script>not markup</script>'),true);
  assert.equal(preview.querySelector('script'),null);
  app.click('.today-people-message');
  assert.match(app.d.querySelector('.rpx-legacy-records').textContent,/Legacy <b>record<\/b>/);
  assert.equal(app.d.querySelector('.rpx-legacy-records img'),null);
});
test('Today settles into a real caught-up state after opening the source and confirming serving',t=>{
 const app=open(t);app.click('.attention-tile[data-go="group"]');
  const modernKey='rallypoint-wednesday-chat-lab-v1';
  assert.ok(app.w.localStorage.getItem(modernKey),'modern chat must persist after opening');
  assert.equal(app.w.RallyConversationRead.peek({
    storage:app.w.localStorage,domain:app.w.RallyChatDomain
  }).unreadCount,0,'reading the embedded thread must clear its cursor');
  const unread=()=>app.w.RallyConversationRead.peek({
    storage:app.w.localStorage,domain:app.w.RallyChatDomain
  }).unreadCount;
  app.go('today');assert.equal(unread(),0,'after leaving chat');
  app.click('.availability-action');assert.equal(unread(),0,'after opening serving schedule');
  app.click('[data-action="shift"][data-value="confirmed"]');
  assert.equal(unread(),0,'after confirming serving');
  app.go('today');assert.equal(unread(),0,'after returning to Today');
  assert.equal(app.saved().view,'today','current saved view is Today');
  const current=app.w.RallyConversationRead.peek({storage:app.w.localStorage,domain:app.w.RallyChatDomain});
  assert.equal(current.status,'ok','the modern read projection remains valid');
  assert.equal(app.w.RallyToday.snapshot(app.saved(),app.ui(),new Date('2026-11-23T12:00:00'),current).unreadCount,0);
  assert.equal(app.d.querySelector('.today-people-message-action').textContent.includes('UNREAD'),false,
    'DOM should reflect read cursor after serving response');
  assert.match(app.text(),/You’re all caught up/);assert.equal(app.d.querySelector('.attention-tile'),null);
 app.action('notifications');assert.match(app.d.querySelector('#dialog-root [role="dialog"]').textContent,/You’re all caught up/);app.action('close-dialog');
 const again=open(t,{saved:app.saved(),ui:app.ui(),modern:app.w.localStorage.getItem(modernKey)});
  assert.match(again.text(),/You’re all caught up/);
  assert.equal(again.w.RallyConversationRead.peek({storage:again.w.localStorage,domain:again.w.RallyChatDomain}).unreadCount,0);
});
test('existing messages, prayer posts, RSVP, team coverage and reading remain functional after reload',t=>{
 const app=open(t);app.go('group');app.type('group-input','A local group thought.');app.click('[data-action="send"][data-value="group"]');assert.equal(app.d.getElementById('group-input').value,'');
 app.click('[data-area="group"][data-value="prayer"]');app.type('prayer-input','A fictional prayer.');app.click('[data-action="send"][data-value="prayer"]');
 app.click('[data-area="group"][data-value="gather"]');app.click('[data-action="rsvp"][data-value="going"]');
 app.go('team');app.click('[data-action="shift"][data-value="declined"]');app.action('cover');assert.equal(app.saved().coverage,true);app.click('[data-area="team"][data-value="chat"]');app.type('team-input','A local team note.');app.click('[data-action="send"][data-value="team"]');
 app.go('read');app.action('read');app.action('pray');const saved=app.saved();const again=open(t,{saved,ui:app.ui()});assert.deepEqual(again.saved(),saved);assert.ok(saved.groupMessages.some(m=>m.text==='A local group thought.'));assert.ok(saved.prayers.some(m=>m.text==='A fictional prayer.'));assert.ok(saved.teamMessages.some(m=>m.text==='A local team note.'));assert.equal(saved.rsvp,'going');assert.equal(saved.read,true);assert.equal(saved.prayed,true);
});
test('Read v0.9 pathway changes the Scripture and question without claiming shared publishing',t=>{
 const app=open(t);app.go('read');
 assert.ok(app.d.querySelector('.read-screen-v09'));
 assert.match(app.d.querySelector('.read-scripture-card h2').textContent,/John 15:12/);
 assert.match(app.d.querySelector('.read-section-label').textContent,/BSB/);
 assert.equal(app.d.querySelector('[data-action="plan"]'),null);
 app.action('demo-controls');app.click('#role');app.action('close-dialog');
 app.click('[data-action="plan"][data-value="study"]');
 assert.equal(app.saved().plan,'study');
 assert.match(app.d.querySelector('.read-scripture-card h2').textContent,/James 1:22/);
 assert.match(app.d.querySelector('.read-question-card p').textContent,/put what you read into practice/);
 app.type('question','A thoughtful book study question.');app.action('question');
 assert.equal(app.saved().question,'A thoughtful book study question.');
 app.click('[data-action="plan"][data-value="year"]');
 assert.match(app.d.querySelector('.read-scripture-card h2').textContent,/Psalm 23:1–2/);
 assert.match(app.d.querySelector('.verseplay .vp-board-title h3').textContent,/Psalm 23:1–2/);
 assert.equal(app.d.querySelectorAll('.verseplay .vp-blank').length,5);
 assert.equal(app.d.querySelectorAll('.verseplay .vp-tile').length,7);
 app.click('[data-action="plan"][data-value="study"]');
 assert.equal(app.saved().question,'A thoughtful book study question.');
 app.go('today');
 assert.match(app.d.querySelector('.today-reading h2').textContent,/James 1:22/);
});
test('BSB update resets old KJV game slots while preserving group messages and reading selections',t=>{
 const oldGame={slots:['a0','a1','a2','a3','a4'],misses:0,hints:0,solved:true,best:100,round:1};
 const app=open(t,{saved:{memoryTextRevision:'KJV-legacy',memoryMode:'solo',memoryActive:'study',
   memoryGames:{'study:solo':oldGame},plan:'study',read:true,
   groupMessages:[{name:'Anna L.',text:'Saved conversation remains.',time:'Yesterday'}]}});
 assert.equal(app.saved().memoryTextRevision,'BSB-2026-1');
 assert.equal(app.saved().memoryGames['study:solo'],undefined);
 assert.equal(app.saved().read,true);
 assert.equal(app.saved().plan,'study');
 assert.equal(app.saved().groupMessages[0].text,'Saved conversation remains.');
 app.go('read');
 assert.match(app.d.querySelector('.vp-board-title h3').textContent,/James 1:22/);
 assert.match(app.d.querySelector('.vp-board-title h3').textContent,/BSB/);
});
test('VersePlay completes a scripture puzzle using five word tiles and saves local progress',t=>{
 const app=open(t);app.go('read');
 const c=app.w.RallyMemory.challenge('sermon');
 for(let i=0;i<5;i++)app.click('[data-action="memory-pick"][data-value="a'+i+'"]');
 assert.equal(app.d.querySelector('.vp-count strong').textContent,'5');
 app.click('[data-action="memory-check"]');
 assert.match(app.d.querySelector('.vp-victory').textContent,/QUEST COMPLETE/);
 assert.equal(app.saved().memoryGames['sermon:solo'].solved,true);
 assert.equal(app.saved().memoryGames['sermon:solo'].best,100);
 const next=open(t,{saved:app.saved(),ui:app.ui()});next.go('read');
 assert.match(next.d.querySelector('.vp-victory').textContent,/QUEST COMPLETE/);
 next.click('[data-action="memory-reset"]');
 assert.equal(next.saved().memoryGames['sermon:solo'].solved,false);
 assert.equal(next.d.querySelectorAll('.vp-tile').length,7);
});
test('VersePlay pass-and-play lets both players finish on one device, without real member accounts',t=>{
 const app=open(t);app.go('read');app.click('[data-action="memory-mode"][data-value="pass"]');
 assert.match(app.d.querySelector('.vp-turn').textContent,/PLAYER 1/);
 for(let i=0;i<5;i++)app.click('[data-action="memory-pick"][data-value="a'+i+'"]');
 app.click('[data-action="memory-check"]');
 app.click('[data-action="memory-next-player"]');
 assert.equal(app.saved().memoryPassTurn,2);
 assert.match(app.d.querySelector('.vp-turn').textContent,/PLAYER 2/);
 for(let i=0;i<5;i++)app.click('[data-action="memory-pick"][data-value="a'+i+'"]');
 app.click('[data-action="memory-check"]');
 assert.match(app.d.querySelector('.vp-duel-result').textContent,/FRIENDLY MATCH/);
 assert.match(app.d.querySelector('.vp-duel-result').textContent,/tie/);
 app.click('[data-action="memory-new-duel"]');
 assert.equal(app.saved().memoryPassTurn,1);
 assert.equal(app.saved().memoryGames['sermon:p1'].solved,false);
 assert.equal(app.saved().memoryGames['sermon:p2'].solved,false);
});
test('Read v0.9 retains the original read, prayer and group discussion destinations',t=>{
 const app=open(t);app.go('read');
 app.action('read');app.action('pray');
 assert.equal(app.saved().read,true);
 assert.equal(app.saved().prayed,true);
 app.click('.read-discuss-action');
 assert.equal(app.saved().view,'group');
 assert.equal(app.saved().groupPane,'chat');
});
test('Team v0.8 keeps a source-driven schedule and conversation preview with honest statuses',t=>{
 const app=open(t);app.go('team');
 assert.ok(app.d.querySelector('.team-screen-v08'));
 assert.match(app.d.querySelector('.team-shift-response').textContent,/Awaiting response/);
 assert.match(app.d.querySelector('.team-shift-response').textContent,/not recorded attendance/);
 assert.match(app.d.querySelector('.team-message-preview').textContent,/Sam R\./);
 app.click('.team-message-preview');
 assert.equal(app.saved().teamPane,'chat');
 app.type('team-input','Thanks for serving this weekend!');
 app.click('[data-action="send"][data-value="team"]');
 app.click('[data-action="pane"][data-area="team"][data-value="schedule"]');
 assert.match(app.d.querySelector('.team-message-preview').textContent,/Thanks for serving/);
 app.click('[data-action="shift"][data-value="confirmed"]');
 assert.equal(app.saved().teamStatus,'confirmed');
 assert.match(app.d.querySelector('.team-shift-response').textContent,/Confirmed/);
 app.go('today');
 assert.match(app.d.querySelector('.dashboard-team').textContent,/You’re in/);
});
test('Team v0.8 coverage and leader access remain contextual to its fixture role',t=>{
 const app=open(t);app.go('team');
 assert.equal(app.d.querySelector('[data-area="team"][data-value="leader"]'),null);
 app.click('[data-action="shift"][data-value="declined"]');
 app.click('[data-action="cover"]');
 assert.equal(app.saved().coverage,true);
 app.action('demo-controls');app.click('#role');app.action('close-dialog');
 app.click('[data-action="pane"][data-area="team"][data-value="leader"]');
 assert.match(app.text(),/One sample coverage request/);
 assert.match(app.text(),/not proof of attendance/);
});
test('Unjoined Groups uses the new designed discovery shell without replacing the existing group workflow',t=>{
 const app=open(t);
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');
 app.go('group');
 assert.ok(app.d.querySelector('.group-screen-v07.group-discovery-v07'));
 assert.ok(app.d.querySelector('.group-discovery-hero h1'));
 assert.equal(app.d.querySelectorAll('.group-discovery-card').length,3);
 assert.match(app.d.querySelector('.group-discovery-hero').textContent,/Find your/);
 app.click('.group-discovery-card [data-action="interest"][data-value="0"]');
 assert.ok(app.d.querySelector('.group-discovery-interest.is-selected'));
 assert.equal(app.ui().memberships.group,false,'Interest must not grant membership');
 app.click('.group-discovery-preview [data-action="scenario"][data-value="connected"]');
 assert.ok(app.ui().memberships.group);
 app.go('group');
 assert.ok(app.d.querySelector('.group-community-hero:not(.group-discovery-hero)'));
 assert.ok(app.d.querySelector('.group-conversation'));
 app.click('[data-action="browse"]');
 assert.ok(app.d.querySelector('.group-discovery-v07'));
 app.click('.group-discovery-back');
 assert.ok(app.d.querySelector('.group-conversation'));
});
test('Unjoined Team uses the new full-layout invitation and retains its honest preview',t=>{
 const app=open(t);
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');
 app.go('team');
 assert.ok(app.d.querySelector('.team-screen-v08.team-empty-v08'));
 assert.match(app.d.querySelector('.team-empty-hero h1').textContent,/room/);
 assert.match(app.d.querySelector('.team-empty-discover').textContent,/No team or assignment/);
 app.action('team-preview');
 assert.match(app.d.querySelector('#dialog-root').textContent,/later-phase work/);
 app.action('close-dialog');
 assert.equal(app.ui().memberships.team,false);
 app.click('.team-empty-try');
 assert.equal(app.ui().memberships.team,true);
 app.go('team');
 assert.ok(app.d.querySelector('.team-schedule-card'));
});
test('Groups People directory opens scoped one-to-one local messaging and persists it',t=>{
 const app=open(t);app.go('group');
 app.click('[data-action="pane"][data-area="group"][data-value="people"]');
 assert.equal(app.d.querySelectorAll('.group-member-row').length,4);
 assert.match(app.d.querySelector('.group-people-card').textContent,/No messages leave your device/);
 app.click('[data-action="message-person"][data-person="anna"]');
 assert.equal(app.saved().groupPane,'direct');
 assert.match(app.text(),/Anna L\./);
 app.type('direct-input','I appreciate your encouragement this week.');
 app.click('[data-action="send"][data-value="direct"]');
 assert.deepEqual(app.saved().directMessages.anna.map(x=>x.text),['I appreciate your encouragement this week.']);
 assert.match(app.d.querySelector('.group-direct-bubble').textContent,/I appreciate your encouragement/);
 app.go('today');app.go('group');
 assert.match(app.text(),/I appreciate your encouragement/);
 const reloaded=open(t,{saved:app.saved(),ui:app.ui()});
 assert.match(reloaded.text(),/I appreciate your encouragement/);
 assert.equal(reloaded.saved().directMessages.anna.length,1);
});
test('Groups direct messaging escapes text and offers no real delivery without membership',t=>{
 const app=open(t);app.go('group');
 app.click('[data-action="pane"][data-area="group"][data-value="people"]');
 app.click('[data-action="message-person"][data-person="jess"]');
 app.type('direct-input','<img src=x onerror=alert(1)>');
 app.click('[data-action="send"][data-value="direct"]');
 assert.equal(app.d.querySelector('.group-direct-bubble img'),null);
 assert.equal(app.d.querySelector('.group-direct-bubble').textContent.includes('<img src=x onerror=alert(1)>'),true);
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');
 app.go('group');
 assert.equal(app.d.querySelector('[data-action="message-person"]'),null);
 assert.equal(app.d.querySelector('.group-direct'),null);
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
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');assert.match(app.text(),/There’s room/);assert.match(app.text(),/TODAY’S READ/);assert.equal(app.d.querySelector('.leader-entry'),null);assert.equal(app.d.querySelector('.up-next'),null);
 app.go('group');assert.match(app.text(),/Browse a few sample group options/);app.go('team');assert.match(app.text(),/No team or assignment/);app.action('team-preview');assert.match(app.d.querySelector('#dialog-root [role="dialog"]').textContent,/later-phase work/);app.action('close-dialog');
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="caught-up"]');assert.match(app.text(),/You’re all caught up/);assert.deepEqual(app.saved().groupMessages,messages);
});
test('Today Memorize opens the unified Blank Battle route and preserves classic Pass & Play',t=>{
 const app=open(t);app.click('.read-play-cta');
 assert.equal(app.saved().view,'play');
 assert.ok(app.d.querySelector('.rp-play-screen'));
 assert.ok(app.d.querySelector('.rp-play-back'));
 assert.equal(app.d.querySelector('#nav [data-go="read"]').getAttribute('aria-current'),'page');
 app.click('.rp-play-back');
 assert.equal(app.saved().view,'read');
 assert.ok(app.d.querySelector('.rp-game-entry-play'));
 assert.ok(app.d.querySelector('.verseplay'));
 assert.equal(app.d.querySelectorAll('.vp-blank').length,5);
 assert.equal(app.d.querySelectorAll('.vp-tile').length,7);
 app.click('[data-action="memory-check"]');
 assert.match(app.d.querySelector('.vp-feedback').textContent,/Fill all five/);
 app.click('[data-action="memory-hint"]');
 assert.equal(app.saved().memoryGames['sermon:solo'].hints,1);
 assert.match(app.d.querySelector('.vp-count').textContent,/1/);
 app.click('.rp-game-entry-play');
 assert.equal(app.saved().view,'play');
});
test('demo name is escaped, saved independently and modal keyboard dismissal restores focus',t=>{
 const app=open(t);app.click('.profile-avatar');assert.equal(app.d.querySelector('.phone-inner').inert,true);app.type('demo-name','<img src=x>');app.click('form button[type="submit"]');assert.equal(app.d.querySelector('img[src="x"]'),null);assert.match(app.text(),/<img src=x>/);assert.equal(app.ui().name,'<img src=x>');
 app.click('.profile-avatar');app.d.dispatchEvent(new app.w.KeyboardEvent('keydown',{key:'Escape',bubbles:true}));assert.equal(app.d.querySelector('#dialog-root [role="dialog"]'),null);assert.equal(app.d.activeElement.className,'profile-avatar');
});
test('storage failure is disclosed while the demo stays usable',t=>{
 const app=open(t,{blocked:true});const errors=[];app.w.addEventListener('error',event=>errors.push(event.error));assert.match(app.text(),/could not save/);app.go('group');app.type('group-input','An in-memory sample');app.click('[data-action="send"][data-value="group"]');assert.match(app.text(),/An in-memory sample/);assert.deepEqual(errors,[],'blocked storage must not escape the read-cursor boundary');
});

test('Premium ALIVE people circles open existing fictional direct conversations and preserve local replies',t=>{
 const app=open(t);
 assert.ok(app.d.querySelector('.phone-inner').classList.contains('premium-alive'));
 assert.equal(app.d.querySelectorAll('.pa-people-rail--today .pa-person-trigger').length,5);
 app.click('.pa-people-rail--today [data-action="hybrid-person"][data-person="marcus"]');
 assert.equal(app.saved().view,'group');
 assert.equal(app.saved().groupPane,'direct');
 assert.equal(app.saved().directPerson,'marcus');
 assert.match(app.text(),/ONE-TO-ONE · LOCAL DEMO ONLY/);
 app.type('direct-input','Thanks for being part of this fictional group.');
 app.click('[data-action="send"][data-value="direct"]');
 assert.ok(app.saved().directMessages.marcus.some(m=>m.text==='Thanks for being part of this fictional group.'));
 app.go('today');
 app.click('.pa-people-rail--today [data-action="hybrid-person"][data-person="marcus"]');
 assert.match(app.text(),/Thanks for being part of this fictional group/);
 app.go('group');
 assert.ok(app.d.querySelector('.pa-people-rail--group'));
 assert.ok(app.d.querySelector('.pa-group-summary'));
 app.click('.pa-group-summary');
 assert.equal(app.saved().groupPane,'gather');
});


test('companion care loop suggests, drafts, saves and remembers a fictional check-in',t=>{
 const app=open(t);
 assert.match(app.d.querySelector('.pa-companion').textContent,/Marcus shared a fictional prayer request/);
 app.click('.pa-companion [data-action="companion-encourage"]');
 assert.equal(app.saved().view,'group');
 assert.equal(app.saved().groupPane,'direct');
 assert.equal(app.saved().directPerson,'marcus');
 assert.ok(app.d.querySelector('.pa-care-context'));
 app.click('[data-action="companion-starter"]');
 assert.match(app.d.getElementById('direct-input').value,/Hey Marcus/);
 assert.equal(app.saved().companionCare.marcus,undefined,'Drafting alone must not mark complete');
 app.click('[data-action="send"][data-value="direct"]');
 assert.equal(app.saved().directMessages.marcus.length,1);
 assert.ok(app.saved().companionCare.marcus.completedAt);
 app.go('today');
 assert.match(app.d.querySelector('.pa-companion .pa-care-memory').textContent,/checked in with Marcus/);
 assert.equal(app.d.querySelector('[data-action="companion-encourage"]'),null);
 assert.match(app.d.querySelector('.pa-companion').textContent,/Review my serve/);
 const restored=open(t,{saved:app.saved(),ui:app.ui()});
 assert.match(restored.d.querySelector('.pa-companion .pa-care-memory').textContent,/checked in/);
 assert.equal(restored.saved().directMessages.marcus.length,1);
});
test('companion care nudge is voluntary and snoozes without changing messages or roles',t=>{
 const app=open(t);
 const before=app.saved();
 app.click('.pa-companion [data-action="companion-snooze"]');
 assert.equal(app.d.querySelector('[data-action="companion-encourage"]'),null);
 assert.ok(Date.parse(app.saved().companionCare.marcus.snoozedUntil)>new Date('2026-11-23T12:00:00').getTime());
 assert.deepEqual(app.saved().directMessages,before.directMessages);
 assert.equal(app.saved().role,before.role);
 assert.match(app.d.querySelector('.pa-companion').textContent,/Review my serve/);
 const restored=open(t,{saved:app.saved(),ui:app.ui()});
 assert.equal(restored.d.querySelector('[data-action="companion-encourage"]'),null);
});
test('companion care does not show private group prompts when group membership is off',t=>{
 const app=open(t);
 app.action('demo-controls');
 app.click('[data-action="scenario"][data-value="no-memberships"]');
 assert.equal(app.d.querySelector('[data-action="companion-encourage"]'),null);
 assert.equal(app.d.querySelector('.pa-care-memory'),null);
 assert.equal(app.d.querySelector('[data-action="companion-snooze"]'),null,'guest never receives a private care snooze');
});


test('Sunday-to-week companion saves one private step and resurfaces it on a later day',t=>{
 const app=open(t,{now:'2026-11-23T12:00:00'});
 app.go('read');
 assert.ok(app.d.querySelector('.pa-rhythm-editor'),'Read keeps the intention editor inside the existing reflection card');
 app.type('rhythm-input','Encourage someone who needs a friend.');
 app.click('[data-action="rhythm-save"]');
 const saved=app.saved();
 assert.equal(saved.rhythm.text,'Encourage someone who needs a friend.');
 assert.equal(saved.rhythm.passage,'John 15:12');
 assert.ok(Date.parse(saved.rhythm.followUpAt)>new Date('2026-11-23T12:00:00').getTime());
 assert.equal(saved.rhythm.completedAt,null,'Saving does not mark action done');
 app.go('today');
 assert.match(app.d.querySelector('.pa-rhythm-followup').textContent,/A SMALL STEP FOR TOMORROW/);
 assert.equal(app.d.querySelector('[data-action="rhythm-complete"]'),null,'No completion control until a future visit');
 const later=open(t,{saved,ui:app.ui(),now:'2026-11-25T12:00:00'});
 later.go('today'); // The saved fixture was captured while Read was active.
 assert.match(later.d.querySelector('.pa-rhythm-followup').textContent,/YOUR STEP FOR TODAY/);
 later.click('[data-action="rhythm-complete"]');
 assert.ok(later.saved().rhythm.completedAt);
 assert.match(later.d.querySelector('.pa-rhythm-followup').textContent,/YOU FOLLOWED THROUGH/);
 const restored=open(t,{saved:later.saved(),ui:later.ui(),now:'2026-11-26T12:00:00'});
 assert.match(restored.d.querySelector('.pa-rhythm-followup').textContent,/YOU FOLLOWED THROUGH/);
 assert.equal(restored.d.querySelectorAll('#nav button').length,4);
 assert.ok(restored.d.querySelector('.pa-people-rail--today'));
});
test('Sunday-to-week step is voluntary, deferrable, editable and clearable without changing other flows',t=>{
 const app=open(t,{now:'2026-11-23T12:00:00'});
 const before=app.saved();
 app.go('read');
 app.click('[data-action="rhythm-save"]');
 assert.deepEqual(app.saved().rhythm,{},'Empty reflections are not saved');
 app.type('rhythm-input','Offer to help with the gathering.');
 app.click('[data-action="rhythm-save"]');
 const due=app.saved().rhythm.followUpAt;
 app.go('today');
 const later=open(t,{saved:app.saved(),ui:app.ui(),now:'2026-11-25T12:00:00'});
 later.click('[data-action="rhythm-defer"]');
 assert.ok(Date.parse(later.saved().rhythm.followUpAt)>Date.parse(due));
 assert.equal(later.d.querySelector('[data-action="rhythm-complete"]'),null);
 later.go('read');
 later.type('rhythm-input','Invite somebody to join me.');
 later.click('[data-action="rhythm-save"]');
 assert.equal(later.saved().rhythm.text,'Invite somebody to join me.');
 later.click('[data-action="rhythm-clear"]');
 assert.deepEqual(later.saved().rhythm,{});
 later.go('today');
 assert.equal(later.d.querySelector('.pa-rhythm-followup'),null);
 assert.deepEqual(later.saved().groupMessages,before.groupMessages);
 assert.deepEqual(later.saved().prayers,before.prayers);
 assert.deepEqual(later.saved().directMessages,before.directMessages);
});
test('Sunday-to-week private text is HTML-escaped in Read and Today, never published to group',t=>{
 const app=open(t);
 app.go('read');
 app.type('rhythm-input','<img src=x onerror=alert(1)>');
 app.click('[data-action="rhythm-save"]');
 app.go('today');
 assert.match(app.d.querySelector('.pa-rhythm-followup').textContent,/<img src=x onerror=alert\(1\)>/);
 assert.equal(app.d.querySelector('.pa-rhythm-followup img'),null);
 app.go('read');
 assert.equal(app.d.querySelector('.pa-rhythm-editor img'),null);
 assert.match(app.d.getElementById('rhythm-input').value,/<img src=x/);
 assert.equal(app.saved().groupMessages.length,2);
});

test('F-07 connects Groups conversation, gathering, prayer, People and Today without duplicate storage',t=>{
  const app=open(t),before=app.saved().groupMessages;
  app.go('group');
  assert.ok(app.d.querySelector('.group-pulse'),'Group activity overview exists');
  assert.equal(app.d.querySelectorAll('.group-pulse-route').length,4);
  assert.match(app.d.querySelector('.group-pulse-feature').textContent,/See you Wednesday/);
  assert.match(app.d.querySelector('.group-pulse-route[data-value="chat"]').textContent,/caught up/);
  app.click('.group-pulse-route[data-value="gather"]');
  assert.equal(app.saved().groupPane,'gather');
  assert.match(app.d.querySelector('.group-gather-rsvp').textContent,/still open/);
  app.click('[data-action="rsvp"][data-value="going"]');
  assert.equal(app.saved().rsvp,'going');
  assert.equal(app.d.querySelector('[data-action="rsvp"][data-value="going"]').getAttribute('aria-pressed'),'true');
  assert.match(app.d.querySelector('.group-pulse-route[data-value="gather"]').textContent,/Going/);
  assert.match(app.d.querySelector('.group-pulse-feature').textContent,/Keep the connection/);
  app.click('.group-pulse-route[data-value="prayer"]');
  assert.match(app.d.querySelector('.group-pulse-route[data-value="prayer"]').textContent,/1 saved sample request/);
  app.type('prayer-input','Fictional request for encouragement.');
  app.click('[data-action="send"][data-value="prayer"]');
  assert.equal(app.saved().prayers.at(-1).text,'Fictional request for encouragement.');
  assert.match(app.d.querySelector('.group-pulse-route[data-value="prayer"]').textContent,/2 saved sample requests/);
  app.click('.group-prayer-next button');
  assert.equal(app.saved().groupPane,'people');
  app.click('.group-member-message[data-person="anna"]');
  assert.equal(app.saved().groupPane,'direct');
  app.type('direct-input','Hi Anna — local demo only.');
  app.click('[data-action="send"][data-value="direct"]');
  assert.equal(app.saved().directMessages.anna.at(-1).text,'Hi Anna — local demo only.');
  app.click('.group-pulse-route[data-value="chat"]');
  assert.ok(app.d.getElementById('rpx-chat'));
  app.go('today');
  assert.ok(app.d.querySelector('.today-people-message'),'Today still uses its prior modern preview');
  assert.deepEqual(app.saved().groupMessages,before,'old messages remain byte-equivalent data');
});
test('F-07 withheld for non-members and corrupted modern data keeps legacy intact',t=>{
  const app=open(t,{modern:'{untouched-corrupt-conversation'});
  app.go('group');
  assert.match(app.d.querySelector('.group-pulse-feature').textContent,/needs a look/);
  assert.match(app.d.querySelector('.group-pulse-route[data-value="chat"]').textContent,/Preview unavailable/);
  assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),'{untouched-corrupt-conversation');
  assert.ok(app.d.querySelector('.rpx-legacy-records'));
  app.go('today');app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');
  app.go('group');
  assert.equal(app.d.querySelector('.group-pulse'),null);
  assert.equal(app.d.getElementById('rpx-chat'),null);
});

test('F-08 companion explains actual modern unread, then advances to unanswered group RSVP',t=>{
  const app=open(t,{saved:{prayers:[],teamStatus:'confirmed',rsvp:'',read:true,prayed:true}});
  const panel=()=>app.d.querySelector('.pa-companion');
  assert.equal(panel().dataset.suggestion,'group-unread');
  assert.match(panel().querySelector('.pa-companion-why').textContent,/modern group read cursor/);
  assert.match(panel().textContent,/3 unread fictional group messages/);
  assert.equal(app.d.querySelectorAll('.pa-companion').length,1);
  const prior=app.saved().groupMessages;
  app.click('.pa-companion [data-go="group"][data-pane="chat"]');
  assert.equal(app.saved().groupPane,'chat');
  app.go('today');
  assert.equal(panel().dataset.suggestion,'group-rsvp');
  assert.match(panel().querySelector('.pa-companion-why').textContent,/no saved response/);
  app.click('.pa-companion [data-go="group"][data-pane="gather"]');
  app.click('[data-action="rsvp"][data-value="going"]');
  app.go('today');
  assert.equal(panel().dataset.suggestion,'group-people');
  assert.deepEqual(app.saved().groupMessages,prior,'F-08 does not rewrite older group messages');
});
test('F-08 local deferral preserves read cursors, messages and serving response; restores after reload',t=>{
  const app=open(t,{saved:{prayers:[],teamStatus:'pending',rsvp:'going',read:true,prayed:true},now:'2026-11-23T12:00:00'});
  assert.equal(app.d.querySelector('.pa-companion').dataset.suggestion,'serve-response');
  const before=app.saved();
  const priorModern=app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1');
  app.click('.pa-companion [data-action="companion-later"]');
  assert.equal(app.d.querySelector('.pa-companion').dataset.suggestion,'group-unread');
  assert.equal(app.saved().teamStatus,'pending','deferring suggestion cannot auto-confirm serving');
  assert.deepEqual(app.saved().groupMessages,before.groupMessages);
  assert.deepEqual(app.saved().prayers,before.prayers);
  assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),priorModern,
    'deferral never advances modern read cursor');
  assert.ok(Date.parse(app.saved().companionChoices.snoozedUntil['serve-response'])>new Date('2026-11-23T12:00:00').getTime());
  const next=open(t,{saved:app.saved(),ui:app.ui(),modern:app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1')??undefined,
    now:'2026-11-23T13:00:00'});
  assert.equal(next.d.querySelector('.pa-companion').dataset.suggestion,'group-unread');
  const expired=open(t,{saved:app.saved(),ui:app.ui(),now:'2026-11-25T13:00:00'});
  assert.equal(expired.d.querySelector('.pa-companion').dataset.suggestion,'serve-response');
});
test('F-08 refuses to invent a read state on corrupt modern store and hides group-private detail for guests',t=>{
  const app=open(t,{saved:{prayers:[],teamStatus:'confirmed',rsvp:'going',read:true,prayed:true},
    modern:'{bad-unmodified'});
  assert.equal(app.d.querySelector('.pa-companion').dataset.suggestion,'group-unavailable');
  assert.match(app.d.querySelector('.pa-companion-why').textContent,/no read status is assumed/);
  app.click('.pa-companion [data-go="group"]');
  assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),'{bad-unmodified');
  app.go('today');
  app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');
  assert.equal(app.d.querySelector('.pa-companion').dataset.suggestion,'find-community');
  assert.doesNotMatch(app.d.querySelector('.pa-companion').textContent,/group thread could not|Earlier saved messages/);
  assert.equal(app.d.querySelector('.pa-care-memory'),null);
});

test('F-09 opt-in preview preserves original Today visual path and the four-tab shell',t=>{
 const classic=open(t);
 assert.ok(classic.d.querySelector('.today-screen.dashboard-v06'));
 assert.equal(classic.d.querySelector('.f09-dashboard'),null);
 const app=open(t,{f09:true});
 assert.ok(app.d.querySelector('.phone-inner').classList.contains('is-f09-dashboard'));
 assert.equal(app.d.querySelectorAll('#nav button').length,4);
 assert.deepEqual([...app.d.querySelectorAll('#nav button small')].map(x=>x.textContent),
   ['Today','Groups','Team','Read']);
 assert.ok(app.d.querySelector('.f09-hero'));
 assert.equal(app.d.querySelectorAll('.f09-module').length,4);
 assert.ok(app.d.querySelector('.f09-glance'));
 assert.ok(app.d.querySelector('.f09-mission'));
 assert.ok(app.d.querySelector('.pa-people-rail--today'),'preserves approved circular people presentation');
 assert.equal(app.d.querySelector('.pa-companion'),null,'F-09 does not duplicate old Today cards');
 app.go('group');assert.ok(app.d.querySelector('.group-screen-v07'));
 assert.equal(app.d.querySelector('.phone-inner').classList.contains('is-f09-dashboard'),false);
 app.go('today');assert.ok(app.d.querySelector('.f09-dashboard'));
});
test('F-09 RSVP and serving buttons update the shared source once and immediately remove pending tasks',t=>{
 const app=open(t,{f09:true,saved:{prayers:[],teamStatus:'pending',rsvp:'',read:true,prayed:true}});
 const old=structuredClone(app.saved().groupMessages);
 const oldTeam=structuredClone(app.saved().teamMessages);
 const oldChat=app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1');
 assert.equal(app.d.querySelector('.f09-hero').dataset.activeCard,'serve-response');
 assert.ok(app.d.querySelector('.f09-task[data-task="rsvp"]'));
 assert.ok(app.d.querySelector('.f09-task[data-task="serve"]'));
 app.click('.f09-glance [data-action="f09-rsvp"]');
 assert.equal(app.saved().rsvp,'going');
 assert.equal(app.d.querySelector('.f09-task[data-task="rsvp"]'),null);
 assert.ok(app.d.querySelector('.f09-task[data-task="serve"]'));
 app.click('.f09-glance [data-action="f09-serve"]');
 assert.equal(app.saved().teamStatus,'confirmed');
 assert.equal(app.d.querySelector('.f09-task[data-task="serve"]'),null);
 assert.match(app.d.querySelector('.f09-gold').textContent,/Confirmed on this device/);
 assert.deepEqual(app.saved().groupMessages,old);
 assert.deepEqual(app.saved().teamMessages,oldTeam);
 assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),oldChat);
 app.click('.f09-rose');
 assert.equal(app.saved().view,'group');
 assert.equal(app.saved().groupPane,'chat');
 app.go('today');
 assert.equal(app.d.querySelector('.f09-rose .f09-unread'),null);
 assert.match(app.d.querySelector('.f09-glance').textContent,/caught up/);
 const restored=open(t,{f09:true,saved:app.saved(),ui:app.ui()});
 assert.equal(restored.saved().rsvp,'going');
 assert.equal(restored.saved().teamStatus,'confirmed');
});
test('F-09 priority paging is reversible, accessible and never snoozes F-08 suggestions',t=>{
 const app=open(t,{f09:true});
 const before=app.saved().companionChoices;
 const first=app.d.querySelector('.f09-hero').dataset.activeCard;
 assert.equal(first,'care-marcus');
 const nav=app.d.querySelector('.f09-stack-controls');
 assert.ok(nav);
 app.click('[data-action="f09-stack"][data-value="next"]');
 assert.notEqual(app.d.querySelector('.f09-hero').dataset.activeCard,first);
 app.click('[data-action="f09-stack"][data-value="prev"]');
 assert.equal(app.d.querySelector('.f09-hero').dataset.activeCard,first);
 assert.deepEqual(app.saved().companionChoices,before);
 app.click('.f09-why summary');
 assert.match(app.d.querySelector('.f09-why').textContent,/named fictional group prayer/);
});
test('F-09 preview gate never reveals group-private cards for a guest',t=>{
 const app=open(t,{f09:true,saved:{prayers:[{name:'Marcus C.',text:'Private sample prayer'}],teamStatus:'pending'}});
 app.action('demo-controls');
 app.click('[data-action="scenario"][data-value="no-memberships"]');
 assert.ok(app.d.querySelector('.f09-dashboard'));
 assert.doesNotMatch(app.d.querySelector('.f09-dashboard').textContent,/Marcus|3 new messages|Confirm Sunday serving/);
 assert.equal(app.d.querySelector('.f09-task[data-task="chat-unread"]'),null);
 assert.equal(app.d.querySelector('.f09-task[data-task="rsvp"]'),null);
 assert.equal(app.d.querySelector('.f09-task[data-task="serve"]'),null);
 assert.equal(app.d.querySelector('.f09-mini-faces'),null);
});

test('Preview Today defaults to the board, preserves comparisons and keeps Ask Rally opt-in',t=>{
 const preview=options=>open(t,{previewBuild:true,...options});
 const app=preview();
 for(const view of ['group','team','read','today'])app.go(view);
 assert.ok(app.d.querySelector('.f09-board'));
 assert.equal(app.d.querySelector('.f10-entry'),null);
 assert.ok(preview({f09:'legacy'}).d.querySelector('.pa-companion'));
 assert.ok(preview({f09:true}).d.querySelector('.f09-stack-controls'));
 for(const flag of ['f10','f103']){
  const lab=preview({[flag]:true});
  assert.ok(lab.d.querySelector('.f10-entry'));
  assert.equal(lab.d.querySelector('.f10-panel'),null);
 }
});
test('F-09 Smart Priority Board is separately gated; original Today and the Smart Stack remain unchanged',t=>{
 const classic=open(t);assert.equal(classic.d.querySelector('.f09-board'),null);
 const stacked=open(t,{f09:true});assert.ok(stacked.d.querySelector('.f09-stack-controls'));
 assert.equal(stacked.d.querySelector('.f09-board'),null);
 const app=open(t,{f09:'board'});
 assert.ok(app.d.querySelector('.phone-inner.is-f09-board'),'new board is explicit opt-in');
 assert.ok(app.d.querySelector('.f09-board'));
 assert.equal(app.d.querySelector('.f09-stack-controls'),null,'no hidden carousel');
 assert.equal(app.d.querySelectorAll('.f09b-row').length,3);
 assert.equal(app.d.querySelectorAll('.f09b-agenda-row').length,3);
 assert.equal(app.d.querySelectorAll('.f09b-glance button').length,0,'glance displays read-only status instead of repeating controls');
 assert.match(app.d.querySelector('.f09b-glance').textContent,/SCHEDULE & STATUS/);
 assert.ok(app.d.querySelector('.pa-people-rail--today'),'same approved fictional people rail');
 assert.ok(app.d.querySelector('.f09b-mission'));
 assert.deepEqual([...app.d.querySelectorAll('#nav button small')].map(x=>x.textContent),
   ['Today','Groups','Team','Read']);
 app.go('team');assert.equal(app.d.querySelector('.phone-inner').classList.contains('is-f09-board'),false);
 app.go('today');assert.ok(app.d.querySelector('.phone-inner.is-f09-board'));
});
test('F-09 board leads with real Wednesday RSVP, immediately updates agenda and other actions',t=>{
 const app=open(t,{f09:'board',now:'2026-11-25T12:00:00',saved:{
   role:'member',prayers:[],teamStatus:'pending',rsvp:'',read:false,prayed:false
 }});
 assert.equal(app.d.querySelector('.f09b-hero').dataset.priority,'group-rsvp');
 assert.match(app.d.querySelector('.f09b-hero').textContent,/Group tonight/);
 const before=structuredClone(app.saved().groupMessages);
 const modern=app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1');
 app.click('.f09b-primary[data-action="f09-rsvp"]');
 assert.equal(app.saved().rsvp,'going');
 assert.equal(app.d.querySelector('.f09b-hero').dataset.priority,'group-unread');
 assert.equal(app.d.querySelector('.f09b-agenda-row[data-agenda="group"] .f09b-status').textContent,'Going');
 assert.equal(app.d.querySelector('.f09b-row[data-row="group-rsvp"]'),null);
 app.click('.f09b-row[data-row="serve-response"] [data-action="f09-serve"]');
 assert.equal(app.saved().teamStatus,'confirmed');
 assert.equal(app.d.querySelector('.f09b-row[data-row="serve-response"]'),null);
 assert.equal(app.d.querySelector('.f09b-agenda-row[data-agenda="serve"] .f09b-status').textContent,'Confirmed');
 assert.deepEqual(app.saved().groupMessages,before);
 assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),modern);
 app.click('.f09b-hero .f09b-primary[data-go="group"]');
 assert.equal(app.saved().groupPane,'chat');
 app.go('today');
 assert.equal(app.d.querySelector('.f09b-row[data-row="group-unread"]'),null);
 assert.match(app.d.querySelector('.f09-board').textContent,/Your people|Your serving|Carry it into the week/);
 const saved=app.saved();
 const restored=open(t,{f09:'board',saved,ui:app.ui()});
 assert.equal(restored.saved().rsvp,'going');
 assert.equal(restored.saved().teamStatus,'confirmed');
});
test('F-09 board guest view never exposes gated group conversation, prayer or serving',t=>{
 const app=open(t,{f09:'board',saved:{role:'member',prayers:[{name:'Marcus C.',text:'Private'}],teamStatus:'pending'}});
 app.action('demo-controls');app.click('[data-action="scenario"][data-value="no-memberships"]');
 assert.equal(app.d.querySelector('.f09b-faces'),null);
 assert.doesNotMatch(app.d.querySelector('.f09-board').textContent,/Marcus|Private|3 new messages|RSVP for Wednesday Group/);
 assert.equal(app.d.querySelector('.f09b-agenda-row[data-agenda="group"] .f09b-agenda-copy strong').textContent,'Community');
 assert.equal(app.d.querySelector('.f09b-agenda-row[data-agenda="serve"] .f09b-agenda-copy strong').textContent,'Serving');
 assert.equal(app.d.querySelector('.f09b-row[data-row="group-rsvp"]'),null);
 assert.equal(app.d.querySelector('.f09b-row[data-row="serve-response"]'),null);
});

test('F-09.3 novice fixture gets welcoming, private-data-free discovery with unchanged tabs',t=>{
 const app=open(t,{f09:'board',saved:{role:'member',prayers:[{name:'Marcus C.',text:'Private request'}],teamStatus:'pending'},
  ui:{...T.initial(),name:'Newcomer',memberships:{group:false,team:false}}});
 assert.equal(app.d.querySelector('.f09-board').dataset.audience,'newcomer');
 assert.equal(app.d.querySelector('.f09b-hero').dataset.priority,'welcome-community');
 assert.match(app.d.querySelector('.f09b-hero').textContent,/There.s room for you/);
 assert.equal(app.d.querySelectorAll('.f09b-row').length,3);
 assert.doesNotMatch(app.d.querySelector('.f09-board').textContent,/Marcus|Private request|leader check-ins/);
 assert.equal(app.d.querySelector('.f09b-row[data-row="serve-response"]'),null);
 assert.equal(app.d.querySelectorAll('#nav button').length,4);
 app.click('.f09b-primary[data-go="group"]');assert.equal(app.saved().view,'group');
});
test('F-09.3 leader uses authorized review only, and naturally becomes caught-up after source review',t=>{
 const app=open(t,{f09:'board',saved:{role:'leader',rsvp:'going',teamStatus:'confirmed',read:true,prayed:true,prayers:[]}});
 // Opening and acknowledging the existing conversation is not an unrelated task completion.
 app.go('group');app.go('today');
 assert.equal(app.d.querySelector('.f09-board').dataset.audience,'leader');
 assert.equal(app.d.querySelector('.f09b-hero').dataset.priority,'leader-checkins');
 assert.equal(app.d.querySelector('.f09b-hero [data-go="group"]').dataset.pane,'leader');
 app.click('.f09b-primary[data-go="group"][data-pane="leader"]');
 assert.equal(app.saved().groupPane,'leader');
 app.click('[data-action="reached"][data-person="marcus"]');
 app.click('[data-action="reached"][data-person="taylor"]');
 app.go('today');
 assert.equal(app.d.querySelector('.f09b-hero').dataset.priority,'caught-up');
 assert.equal(app.d.querySelector('.f09-board').dataset.caughtUp,'true');
 assert.match(app.d.querySelector('.f09b-hero').textContent,/Nothing in your sample commitments needs a response/);
 assert.deepEqual(app.saved().reached.sort(),['marcus','taylor']);
});
test('F-09.3 confirms source actions with transient live feedback and no extra browser state',t=>{
 const app=open(t,{f09:'board',saved:{role:'member',rsvp:'',teamStatus:'pending',read:true,prayed:true,prayers:[]},
  now:'2026-11-25T12:00:00'});
 const archived=structuredClone(app.saved().groupMessages);
 const modern=app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1');
 app.click('.f09b-hero [data-action="f09-rsvp"]');
 assert.match(app.d.querySelector('.f09b-feedback[role="status"]').textContent,/Sample group RSVP saved/);
 assert.equal(app.saved().f09Feedback,undefined);
 app.click('.f09b-row [data-action="f09-serve"]');
 assert.match(app.d.querySelector('.f09b-feedback').textContent,/Sample serving response saved/);
 assert.equal(app.saved().teamStatus,'confirmed');
 assert.deepEqual(app.saved().groupMessages,archived);
 assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),modern);
 app.go('read');app.go('today');
 assert.equal(app.d.querySelector('.f09b-feedback'),null,'feedback does not survive navigation');
});
test('F-09.3 volunteer-only member sees team priority, not group-private content',t=>{
 const app=open(t,{f09:'board',now:'2026-11-21T12:00:00',
 saved:{role:'member',prayers:[{name:'Marcus C.',text:'Not for a volunteer without group'}],teamStatus:'pending',rsvp:''},
 ui:{...T.initial(),name:'Volunteer',memberships:{group:false,team:true}}});
 assert.equal(app.d.querySelector('.f09-board').dataset.audience,'volunteer');
 assert.equal(app.d.querySelector('.f09b-hero').dataset.priority,'serve-response');
 assert.doesNotMatch(app.d.querySelector('.f09-board').textContent,/Marcus|Not for a volunteer|3 new group messages/);
 app.click('.f09b-primary[data-action="f09-serve"]');
 assert.equal(app.saved().teamStatus,'confirmed');
 assert.equal(app.d.querySelector('.f09b-hero').dataset.priority,'caught-up');
});

test('F-10 opt-in Ask Rally sheet keeps the approved Today, Stack and four-tab interface unchanged',t=>{
 const classic=open(t);assert.equal(classic.d.querySelector('.f10-entry'),null);
 const board=open(t,{f09:'board'});assert.equal(board.d.querySelector('.f10-entry'),null);
 const lab=open(t,{f10:true});
 assert.ok(lab.d.querySelector('.phone-inner.is-f10-lab'));
 assert.ok(lab.d.querySelector('.f10-entry'));
 assert.equal(lab.d.querySelectorAll('.f09b-row').length,3);
 assert.equal(lab.d.querySelectorAll('#nav button').length,4);
 lab.click('.f10-entry-button');
 assert.ok(lab.d.querySelector('.f10-panel'));
 assert.equal(lab.d.querySelectorAll('[data-action="f10-ask"]').length,6);
 assert.match(lab.d.querySelector('.f10-response').textContent,/Your week, at a glance/);
 assert.match(lab.d.querySelector('.f10-disclosure').textContent,/No church accounts/);
 lab.click('[data-action="close-dialog"]');
 assert.equal(lab.d.querySelector('.f10-panel'),null);
 lab.go('team');assert.equal(lab.d.querySelector('.phone-inner').classList.contains('is-f10-lab'),false);
 lab.go('today');assert.ok(lab.d.querySelector('.f10-entry'));
});
test('F-10 Ask Rally answers questions from shared fixtures without marking messages as read',t=>{
 const app=open(t,{f10:true,now:'2026-11-25T12:00:00',saved:{
  role:'member',rsvp:'',teamStatus:'pending',read:false,prayed:false,
  groupMessages:[{name:'Jess',text:'Archived content must survive'}],prayers:[]
 }});
 const original=structuredClone(app.saved().groupMessages);
 const modern=app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1');
 const keysBefore=Array.from({length:app.w.localStorage.length},(_,i)=>app.w.localStorage.key(i)).sort();
 app.click('.f10-entry-button');
 app.click('.f10-chip[data-value="next"]');
 assert.match(app.d.querySelector('.f10-response').textContent,/What needs your attention/);
 assert.ok(app.d.querySelector('[data-action="f10-confirm"][data-value="rsvp"]'));
 assert.ok(app.d.querySelector('[data-action="f10-confirm"][data-value="serve"]'));
 assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),modern,
   'opening the companion does not mark source messages read');
 app.click('[data-action="f10-confirm"][data-value="rsvp"]');
 assert.equal(app.saved().rsvp,'going');
 assert.match(app.d.querySelector('.f10-notice').textContent,/sample RSVP is now Going/);
 assert.equal(app.d.querySelectorAll('[data-action="f10-confirm"][data-value="rsvp"]').length,0);
 app.click('[data-action="f10-confirm"][data-value="serve"]');
 assert.equal(app.saved().teamStatus,'confirmed');
 assert.match(app.d.querySelector('.f10-notice').textContent,/serving availability is now Confirmed/);
 assert.deepEqual(app.saved().groupMessages,original);
 assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),modern);
 const keysAfter=Array.from({length:app.w.localStorage.length},(_,i)=>app.w.localStorage.key(i)).sort();
 assert.deepEqual(keysAfter,keysBefore,'no new companion transcript or persistent preferences');
 app.click('.f10-chip[data-value="next"]');
 assert.match(app.d.querySelector('.f10-response').textContent,/still|unread|caught up/i);
});
test('F-10 handwritten question is supported only for stated intents and escaped in UI',t=>{
 const app=open(t,{f10:true});app.click('.f10-entry-button');
 const el=app.d.getElementById('f10-query');
 el.value='What is my serving schedule?';
 el.form.dispatchEvent(new app.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.match(app.d.querySelector('.f10-response').textContent,/Your serving rhythm/);
 assert.match(app.d.querySelector('.f10-question').textContent,/What is my serving schedule/);
 app.d.getElementById('f10-query').value='<img src=x onerror=alert(1)>';
 app.d.querySelector('[data-form="f10-query"]').dispatchEvent(new app.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.match(app.d.querySelector('.f10-response').textContent,/prototype understands a few specific questions/);
 assert.equal(app.d.querySelector('.f10-question img'),null);
 assert.ok(!app.saved().f10Prompt);
});
test('F-10 guest sees only discovery; no private chat, RSVP, team response or leader access',t=>{
 const app=open(t,{f10:true,saved:{
  role:'leader',rsvp:'',teamStatus:'pending',prayers:[{name:'Marcus C.',text:'Confidential fictional prayer'}],
  groupMessages:[{name:'Jess',text:'Older private archive'}],reached:[]
 },ui:{...T.initial(),name:'Guest',memberships:{group:false,team:false}}});
 app.click('.f10-entry-button');
 for(const id of ['week','next','group','serve','why']){
   app.click('.f10-chip[data-value="'+id+'"]');
   const txt=app.d.querySelector('.f10-response').textContent;
   assert.doesNotMatch(txt,/Marcus|Confidential|Older private archive|leader check-ins|3 unread/i,id);
   assert.equal(app.d.querySelector('[data-action="f10-confirm"]'),null);
 }
 assert.match(app.d.querySelector('.f10-disclosure').textContent,/fictional|local/i);
 app.click('.f10-chip[data-value="group"]');
 app.click('.f10-route[data-go="group"]');
 assert.equal(app.saved().view,'group');
 assert.equal(app.d.querySelector('.f10-panel'),null);
});

test('F-10.1 actual conversation follows week → ambiguous time → Wednesday → Sunday → explicit serving confirmation',t=>{
 const app=open(t,{f10:true,now:'2026-11-25T12:00:00',saved:{
  role:'member',rsvp:'',teamStatus:'pending',read:false,prayed:false,
  prayers:[],reached:[],groupMessages:[{name:'Jess',text:'Original archive'}]
 }});
 const before=JSON.stringify(app.saved().groupMessages);
 const chat=app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1');
 app.click('.f10-entry-button');
 function ask(question){
  const input=app.d.getElementById('f10-query');
  input.value=question;
  input.form.dispatchEvent(new app.w.Event('submit',{bubbles:true,cancelable:true}));
 }
 ask('What time?');
 assert.match(app.d.querySelector('.f10-response h3').textContent,/Which one do you mean/);
 assert.ok(app.d.querySelector('[data-action="f10-followup"][data-value="group-time"]'));
 assert.equal(app.d.querySelector('.f10-route[data-action="f10-confirm"]'),null);
 app.click('[data-action="f10-followup"][data-value="group-time"]');
 assert.match(app.d.querySelector('.f10-response').textContent,/Wed, Nov 25 · 6:30 PM/);
 assert.ok(app.d.querySelectorAll('.f10-earlier-turn').length>=1);
 ask('And Sunday?');
 assert.match(app.d.querySelector('.f10-response').textContent,/Sun, Nov 29 · 9:00 AM/);
 ask('Can I confirm that?');
 assert.match(app.d.querySelector('.f10-response h3').textContent,/Your serving response/);
 assert.equal(app.saved().teamStatus,'pending','typing cannot confirm');
 assert.ok(app.d.querySelector('.f10-route[data-action="f10-confirm"][data-value="serve"]'));
 ask('Yes');
 assert.equal(app.saved().teamStatus,'pending','yes cannot confirm');
 app.click('.f10-route[data-action="f10-confirm"][data-value="serve"]');
 assert.equal(app.saved().teamStatus,'confirmed');
 assert.match(app.d.querySelector('.f10-response').textContent,/already confirmed/);
 assert.ok(app.d.querySelectorAll('.f10-earlier-turn').length<=3);
 assert.equal(app.w.localStorage.getItem('rallypoint-wednesday-chat-lab-v1'),chat);
 assert.equal(JSON.stringify(app.saved().groupMessages),before);
 app.click('[data-action="close-dialog"]');
 app.click('.f10-entry-button');
 assert.equal(app.d.querySelectorAll('.f10-earlier-turn').length,0,'chat history resets on close');
 assert.equal(app.d.querySelector('.f10-question'),null,'last typed question is ephemeral');
 assert.match(app.d.querySelector('.f10-response').textContent,/week, at a glance/);
});
test('F-10.1 changed membership never grants historical conversational context to a new guest',t=>{
 const guest=open(t,{f10:true,ui:{...T.initial(),name:'Guest',memberships:{group:false,team:false}},
  saved:{role:'leader',rsvp:'',teamStatus:'pending',prayers:[{name:'Marcus C.',text:'Sample private prayer'}],
    groupMessages:[{name:'Jess',text:'Archived private message'}]}});
 guest.click('.f10-entry-button');
 const input=guest.d.getElementById('f10-query');
 input.value='What time is Wednesday Group?';
 input.form.dispatchEvent(new guest.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.doesNotMatch(guest.d.querySelector('.f10-response').textContent,/North Commons|Marcus|Archived private/);
 assert.equal(guest.d.querySelector('[data-action="f10-confirm"]'),null);
 const next=guest.d.getElementById('f10-query');
 next.value='Can I RSVP for my group?';
 next.form.dispatchEvent(new guest.w.Event('submit',{bubbles:true,cancelable:true}));
 assert.equal(guest.d.querySelector('[data-action="f10-confirm"]'),null);
 assert.match(guest.d.querySelector('.f10-response').textContent,/no sample group membership|no group membership/i);
 assert.equal(guest.saved().rsvp,'');
});

test('F-10.2 typed natural questions keep session context, visible guardrails and saved state intact',t=>{
 const app=open(t,{f10:true,now:'2026-11-25T12:00:00',saved:{
  role:'member',rsvp:'',teamStatus:'pending',read:false,prayed:false,
  prayers:[],reached:[],groupMessages:[{name:'Jess',text:'Archive unchanged'}]
 }});
 const initial=JSON.stringify(app.saved());
 app.click('.f10-entry-button');
 function ask(q){
  const input=app.d.getElementById('f10-query');
  input.value=q;input.form.dispatchEvent(new app.w.Event('submit',{bubbles:true,cancelable:true}));
  return app.d.querySelector('.f10-response').textContent;
 }
 assert.match(ask('When does Wednesday Group start?'),/Wed, Nov 25 · 6:30 PM/);
 assert.match(ask('What should I do about that?'),/RSVP is still open/);
 assert.equal(app.saved().rsvp,'','answering never accepts an RSVP');
 assert.match(ask('When is my Sunday serving shift?'),/Sun, Nov 29 · 9:00 AM/);
 assert.match(ask('Did I reply to my serving shift?'),/typed “yes” is not enough/);
 assert.equal(app.saved().teamStatus,'pending');
 assert.match(ask('When is Wednesday Group and Sunday serving?'),/Which one do you mean/);
 assert.match(ask('What about next week?'),/does not have a recurring church schedule|not a recurring church schedule/);
 assert.equal(app.d.querySelector('.f10-route[data-action="f10-confirm"]'),null);
 assert.equal(JSON.stringify(app.saved()),initial,'F-10.2 questions must not mutate any local record');
 app.click('[data-action="close-dialog"]');
 app.click('.f10-entry-button');
 assert.equal(app.d.querySelectorAll('.f10-earlier-turn').length,0);
});

test('F-10.3 opt-in goal experience is source-grounded, accessible through existing sheet, and non-mutating',t=>{
 const app=open(t,{f103:true,now:'2026-11-25T12:00:00',saved:{
   role:'member',rsvp:'',teamStatus:'pending',read:false,prayed:false,
   prayers:[],reached:[],groupMessages:[{name:'Jess',text:'Do not overwrite the archive'}]
 }});
 const before=JSON.stringify(app.saved());
 const oldKeys=Object.keys(app.w.localStorage).sort();
 assert.equal(app.d.querySelectorAll('#nav button').length,4);
 app.click('.f10-entry-button');
 assert.equal(app.d.querySelectorAll('.f10-chip').length,6);
 assert.ok(app.d.querySelector('[data-action="f10-followup"][data-value="goal-group"]'));
 assert.ok(app.d.querySelector('[data-action="f10-followup"][data-value="goal-serve"]'));
 const ask=q=>{
   const input=app.d.getElementById('f10-query');
   input.value=q;input.form.dispatchEvent(new app.w.Event('submit',{bubbles:true,cancelable:true}));
   return app.d.querySelector('.f10-response').textContent;
 };
 assert.match(ask('Help me get ready for Wednesday'),/Get ready for Wednesday/);
 assert.ok(app.d.querySelector('[data-action="f10-confirm"][data-value="rsvp"]'));
 assert.equal(app.saved().rsvp,'');
 assert.match(ask('Did I already RSVP?'),/Your group RSVP/);
 assert.match(ask('And Sunday?'),/Welcome Team/);
 assert.match(ask('Help me prepare for that'),/Get ready to serve/);
 assert.ok(app.d.querySelector('[data-action="f10-confirm"][data-value="serve"]'));
 assert.equal(app.saved().teamStatus,'pending');
 assert.match(ask('What about next week?'),/recurring church schedule/);
 assert.equal(JSON.stringify(app.saved()),before,'conversation and goals remain read-only');
 assert.deepEqual(Object.keys(app.w.localStorage).sort(),oldKeys);
 app.click('[data-action="close-dialog"]');
 app.click('.f10-entry-button');
 assert.equal(app.d.querySelectorAll('.f10-earlier-turn').length,0);
});
test('F-10.3 guest goal route stays private and offers no forbidden confirmations',t=>{
 const app=open(t,{f103:true,now:'2026-11-25T12:00:00',
  ui:{...T.initial(),name:'Guest',memberships:{group:false,team:false}},
  saved:{role:'leader',teamStatus:'pending',rsvp:'',prayers:[{name:'Marcus C.',text:'Private prayer note'}],
    groupMessages:[{name:'Jess',text:'Old private archive'}]}});
 app.click('.f10-entry-button');
 for(const prompt of ['goal-group','goal-serve','goal-connect']){
  const chip=app.d.querySelector('[data-action="f10-followup"][data-value="'+prompt+'"]');
  if(chip)chip.click();else{
   const input=app.d.getElementById('f10-query');input.value=prompt;
   input.form.dispatchEvent(new app.w.Event('submit',{bubbles:true,cancelable:true}));
  }
  const result=app.d.querySelector('.f10-response').textContent;
  assert.doesNotMatch(result,/North Commons|North Campus|Private prayer note|Old private archive|leader check-ins/);
  assert.equal(app.d.querySelector('[data-action="f10-confirm"]'),null);
 }
});
