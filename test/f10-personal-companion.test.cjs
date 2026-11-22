const {test}=require('node:test');
const assert=require('node:assert/strict');
const Companion=require('../rallypoint-personal-companion.js');
const Dashboard=require('../rallypoint-smart-dashboard.js');
const Board=require('../rallypoint-priority-board.js');
const Decision=require('../rallypoint-companion-decision.js');
const Today=require('../rallypoint-today.js');
const now=new Date('2026-11-25T12:00:00');
const ui=(group,team,name='Sample member')=>({name,memberships:{group,team}});
const state=()=>({role:'member',rsvp:'',teamStatus:'pending',read:false,prayed:false,
 prayers:[{name:'Marcus C.',text:'This is a private sample request'}],
 reached:[],groupMessages:[{name:'Jess',text:'Older archived message'}],rhythm:{},
 companionCare:{},companionChoices:{snoozedUntil:{}},teamMessages:[]});
function context(s=state(),user=ui(true,true),chat={status:'ok',unreadCount:3},date=now){
 const model=Dashboard.model({state:s,ui:user,conversation:chat,now:date,
  today:Today,companion:Decision,passage:'John 15:12'});
 const board=Board.derive(model,date);
 return {model,board,now:date};
}
test('Natural-language parser understands supported queries, never arbitrary commands',()=>{
 const cases={'What do I need to do this week?':'next','What do I need to take care of this week?':'next','What’s happening this week?':'week','What needs my attention?':'next',
  'Can you tell me about my group?':'group','Am I serving Sunday?':'serve',
  'Help with Scripture':'scripture','Why does this show first?':'why',
  'Call a taxi':'unknown','confirmation rsvp':'group'};
 for(const [question,intent] of Object.entries(cases))
   assert.equal(Companion.classify(question),intent,question);
 assert.deepEqual(Companion.prompts.map(p=>p.id),['week','next','group','serve','scripture','why']);
});
test('Weekly answer uses actual Wednesday and Sunday fixture schedule and open state',()=>{
 const c=context();
 const a=Companion.answer('week',c);
 assert.equal(a.intent,'week');
 assert.equal(a.items.length,2);
 assert.match(a.items[0].title,/Wed, Nov 25 · 6:30 PM/);
 assert.match(a.items[0].detail,/North Commons · RSVP open/);
 assert.match(a.items[1].title,/Sun, Nov 29 · 9:00 AM/);
 assert.match(a.items[1].detail,/North Campus · Response needed/);
 assert.equal(a.items[0].action.id,'group');
 assert.equal(a.items[1].action.id,'team');
 assert.match(a.note,/Fictional sample activity/);
});
test('Next actions use read-only board ranking, acknowledge optional activity is not required',()=>{
 const s=state();const original=structuredClone(s);
 const a=Companion.answer('What needs my attention?',context(s));
 assert.equal(a.intent,'next');
 assert.match(a.items[0].title,/Group tonight/);
 assert.equal(a.items[0].action.id,'rsvp');
 assert.equal(a.items[0].action.kind,'confirm');
 assert.ok(a.items.some(x=>x.action?.id==='serve'));
 assert.ok(a.items.some(x=>x.action?.id==='group'&&x.action.pane==='chat'));
 assert.deepEqual(s,original);
 const quiet={...s,rsvp:'going',teamStatus:'confirmed',read:false,prayed:false};
 const done=Companion.answer('What needs my attention?',context(quiet,ui(true,true),{status:'ok',unreadCount:0}));
 assert.match(done.intro,/Nothing in your sample commitments needs a response/);
 assert.equal(done.items.length,1);
 assert.match(done.items[0].title,/caught up/);
 assert.equal(quiet.read,false);
 assert.equal(quiet.prayed,false);
});
test('Guest never receives group notes, unread counts, or team assignment from unrelated local state',()=>{
 const s=state(),c=context(s,ui(false,false),{status:'ok',unreadCount:3});
 for(const question of ['week','next','group','serve','scripture','why','anything else']){
  const a=Companion.answer(question,c),html=Companion.render(a,'',s.prayers[0].text.replace('private','[redacted]'));
  assert.doesNotMatch(JSON.stringify(a),/Marcus|private sample request|3 unread/i,question);
  assert.ok(!a.items.some(x=>x.action?.id==='rsvp'||x.action?.id==='serve'),question);
  assert.match(html,/LOCAL PREVIEW/);
 }
 const group=Companion.answer('group',c);
 assert.match(group.intro,/not part of a sample group/);
 assert.equal(group.items[0].action.id,'group');
 assert.equal(Companion.answer('serve',c).items[0].action.id,'team');
});
test('Volunteers and leaders receive only their authorized sample context',()=>{
 let s=state();
 let c=context(s,ui(false,true),{status:'ok',unreadCount:5});
 assert.equal(Companion.answer('serve',c).items[0].action.kind,'confirm');
 assert.equal(Companion.answer('group',c).items[0].action.id,'group');
 assert.doesNotMatch(JSON.stringify(Companion.answer('next',c)),/Wednesday Group|5 unread/);
 s={...s,role:'leader',rsvp:'going',teamStatus:'confirmed',read:true,prayed:true};
 c=context(s,ui(true,true),{status:'ok',unreadCount:0});
 const a=Companion.answer('next',c);
 assert.match(a.items[0].title,/leader check-ins/);
 assert.equal(a.items[0].action.pane,'leader');
 c=context(s,ui(false,true),{status:'ok',unreadCount:0});
 assert.doesNotMatch(JSON.stringify(Companion.answer('next',c)),/leader check-ins/);
});
test('Unread status comes from modern read cursor; unavailable thread never claims zero unread',()=>{
 const s={...state(),teamStatus:'confirmed',rsvp:'going',read:true,prayed:true};
 const unavailable=Companion.answer('group',context(s,ui(true,true),{status:'unavailable',unreadCount:777}));
 assert.ok(unavailable.items.some(x=>/needs review/.test(x.title)));
 assert.doesNotMatch(JSON.stringify(unavailable),/777 unread|No unread updates/);
 const normal=Companion.answer('group',context(s,ui(true,true),{status:'ok',unreadCount:2}));
 assert.ok(normal.items.some(x=>/2 unread sample messages/.test(x.title)));
 assert.match(normal.items.find(x=>/unread/.test(x.title)).reason,/modern group read cursor/);
});
test('Serving decline is never presented as a confirmation required',()=>{
 const s={...state(),rsvp:'going',teamStatus:'declined'};
 const a=Companion.answer('serving',context(s,ui(true,true),{status:'ok',unreadCount:0}));
 assert.match(a.items[0].title,/Declined/);
 assert.equal(a.items[0].action.kind,'go');
 assert.doesNotMatch(JSON.stringify(a),/Confirm serving/);
});
test('Rationale uses existing board explanation, not a fabricated spiritual assessment',()=>{
 const a=Companion.answer('Why was this prioritized?',context());
 assert.equal(a.intent,'why');
 assert.match(a.intro,/RSVP/);
 assert.doesNotMatch(JSON.stringify(a),/engagement score|attendance risk|spiritual health assessment/i);
});
test('Unknown or HTML-looking questions return limited explanation, escaped output, no persistence',()=>{
 const s=state(),orig=structuredClone(s);
 const query='<img src=x onerror=alert(1)>';
 const a=Companion.answer(query,context(s));
 assert.equal(a.intent,'unknown');
 assert.match(a.intro,/does not generate open-ended AI/);
 const html=Companion.render(a,query,query);
 assert.doesNotMatch(html,/<img src=x onerror/);
 assert.match(html,/&lt;img src=x/);
 assert.equal((html.match(/data-action="f10-ask"/g)||[]).length,6);
 assert.equal((html.match(/data-action="f10-confirm"/g)||[]).length,0);
 assert.deepEqual(s,orig);
});

test('F-10.1 vague time question clarifies two separate current commitments',()=>{
 const sources=context();
 const week=Companion.respond('week',sources);
 assert.equal(week.response.intent,'week');
 assert.equal(week.context.focus,'');
 const ambiguous=Companion.respond('What time?',sources,week.context);
 assert.equal(ambiguous.response.heading,'Which one do you mean?');
 assert.equal(ambiguous.response.clarify,true);
 assert.equal(ambiguous.response.items.length,2);
 assert.ok(ambiguous.suggestions.includes('group-time'));
 assert.ok(ambiguous.suggestions.includes('serve-time'));
 assert.ok(!ambiguous.response.items.some(x=>x.action?.kind==='confirm'));
 const chose=Companion.respond('group-time',sources,ambiguous.context);
 assert.equal(chose.context.focus,'group');
 assert.equal(chose.response.heading,'Your Wednesday gathering.');
 assert.match(chose.response.intro,/Wed, Nov 25 · 6:30 PM/);
 assert.match(JSON.stringify(chose.response.items),/North Commons/);
});
test('F-10.1 Sunday follow-up can change topic, then confirmation is offered but never automatically committed',()=>{
 const s=state(),before=structuredClone(s),sources=context(s);
 const initial=Companion.respond('week',sources);
 const sunday=Companion.respond('And Sunday?',sources,initial.context);
 assert.equal(sunday.context.focus,'serve');
 assert.match(sunday.response.heading,/serving rhythm/);
 assert.match(JSON.stringify(sunday.response),/Sun, Nov 29 · 9:00 AM/);
 const next=Companion.respond('Can I confirm that?',sources,sunday.context);
 assert.equal(next.response.heading,'Your serving response.');
 assert.equal(next.response.items[0].action.kind,'confirm');
 assert.equal(next.response.items[0].action.id,'serve');
 const yes=Companion.respond('Yes',sources,next.context);
 assert.match(yes.response.intro,/typed “yes” is not enough/);
 assert.equal(yes.response.items[0].action.id,'serve');
 assert.deepEqual(s,before,'asking or agreeing cannot change source state');
 const saved=context({...s,teamStatus:'confirmed'});
 const after=Companion.respond('Can I confirm that?',saved,sunday.context);
 assert.equal(after.response.items[0].action.kind,'go');
 assert.match(after.response.intro,/already confirmed/);
});
test('F-10.1 short subject references honor context, and a new session forgets previous subject',()=>{
 const src=context();
 const group=Companion.respond('My group',src);
 const where=Companion.respond('Where?',src,group.context);
 assert.equal(where.context.focus,'group');
 assert.match(where.response.intro,/North Commons/);
 const why=Companion.respond('Why?',src,where.context);
 assert.match(why.response.heading,/Why your group/);
 const withoutHistory=Companion.respond('Where?',src,{});
 assert.equal(withoutHistory.response.heading,'Which one do you mean?');
 assert.equal(withoutHistory.context.focus,'week');
});
test('F-10.1 short input cannot cross guest membership boundaries or invoke a command',()=>{
 const s=state(),sources=context(s,ui(false,true),{status:'ok',unreadCount:77});
 const prior={intent:'group',focus:'group'};
 for(const word of ['What time?','Where?','Can I RSVP for my group?','Yes']){
  const a=Companion.respond(word,sources,prior);
  assert.equal(a.response.items.some(x=>x.action?.kind==='confirm'&&x.action.id==='rsvp'),false,word);
  assert.doesNotMatch(JSON.stringify(a),/Private sample|Marcus|77 unread|North Commons/);
 }
 const noTeam=context(s,ui(false,false),{status:'ok',unreadCount:5});
 const sunday=Companion.respond('And Sunday?',noTeam,prior);
 assert.doesNotMatch(JSON.stringify(sunday),/9:00 AM|Welcome Team · Response needed|Confirm serving/);
 assert.equal(sunday.response.items[0].action.kind,'go');
});
test('F-10.1 transcript rendering escapes all prior user messages and bounds history and follow-up controls',()=>{
 const s=context();
 const now=Companion.respond('serve-time',s);
 const history=Array.from({length:11},(_,i)=>({asked:i===8?'<img src=x onerror=alert(1)>':'Turn '+i,
  heading:'Answer '+i,intro:'Local result '+i}));
 const html=Companion.render(now.response,now.query,'',history,[
  'serve-where','serve-confirm','serve-time','serve-where','<script>']);
 assert.equal((html.match(/class="f10-earlier-turn"/g)||[]).length,3);
 assert.equal((html.match(/data-action="f10-followup"/g)||[]).length,3);
 assert.equal((html.match(/data-action="f10-ask"/g)||[]).length,6);
 assert.doesNotMatch(html,/<img src=x|<script>|data-value="<script>/);
 assert.match(html,/class="f10-topics"/);
 assert.match(html,/class="f10-conversation"/);
});
