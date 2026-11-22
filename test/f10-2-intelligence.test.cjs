const {test}=require('node:test');
const assert=require('node:assert/strict');
const Companion=require('../rallypoint-personal-companion.js');
const Dashboard=require('../rallypoint-smart-dashboard.js');
const Board=require('../rallypoint-priority-board.js');
const Decision=require('../rallypoint-companion-decision.js');
const Today=require('../rallypoint-today.js');
const now=new Date('2026-11-25T12:00:00');
const profile=(group=true,team=true,name='Sample Member')=>({name,memberships:{group,team}});
const fixture=()=>({
 role:'member',rsvp:'',teamStatus:'pending',read:false,prayed:false,
 prayers:[{name:'Marcus C.',text:'Private prayer note'}],
 reached:[],groupMessages:[{name:'Jess',text:'Legacy message'}],
 teamMessages:[],rhythm:{},companionCare:{},companionChoices:{snoozedUntil:{}}
});
function sources(s=fixture(),ui=profile(),chat={status:'ok',unreadCount:3},date=now,enableIntelligence=true){
 const model=Dashboard.model({state:s,ui,conversation:chat,now:date,today:Today,
  companion:Decision,passage:'John 15:12'});
 const board=Board.derive(model,date);
 return {model,board,now:date,enableIntelligence};
}
test('F-10.2 is explicit preview-only; original F-10.1 response path is unchanged',()=>{
 const src=sources();
 const old=Companion.respond('Help me get ready for Wednesday group',{...src,enableIntelligence:false});
 const guided=Companion.respond('Help me get ready for Wednesday group',src);
 assert.equal(old.response.intent,'group');
 assert.equal(guided.response.intent,'guided');
 assert.equal(guided.response.mode,'prepare');
 assert.ok(Companion.intelligenceGuides['get-ready-group']);
});
test('F-10.2 preparation uses only authorized group, modern unread count and voluntary Scripture',()=>{
 const s=fixture(),before=structuredClone(s);
 const r=Companion.respond('Help me get ready for Wednesday group',sources(s));
 assert.equal(r.response.mode,'prepare');
 assert.equal(r.response.heading,'Here’s a simple way to get ready.');
 assert.equal(r.response.items[0].action.id,'rsvp');
 assert.match(r.response.items[0].title,/Wed, Nov 25 · 6:30 PM/);
 assert.match(r.response.items[0].detail,/North Commons/);
 assert.ok(r.response.items.some(x=>x.action?.pane==='chat'&&/3 sample messages/.test(x.title)));
 assert.ok(r.response.items.some(x=>x.action?.id==='read'));
 assert.deepEqual(s,before,'a suggested checklist must never mark an item completed');
});
test('F-10.2 combined question includes group and Sunday independently, never silently commits',()=>{
 const s=fixture(),before=structuredClone(s);
 const r=Companion.respond('When is my group and my Sunday shift?',sources(s));
 assert.equal(r.response.mode,'combined');
 assert.equal(r.response.items.length,2);
 assert.match(r.response.items[0].title,/Wed, Nov 25 · 6:30 PM/);
 assert.match(r.response.items[1].title,/Sun, Nov 29 · 9:00 AM/);
 assert.deepEqual(r.response.items.map(x=>x.action?.id),['rsvp','serve']);
 assert.equal(r.response.items[0].action.kind,'confirm');
 assert.equal(r.response.items[1].action.kind,'confirm');
 assert.deepEqual(s,before);
});
test('F-10.2 negative Sunday availability never silently declines or confirms a shift',()=>{
 const s=fixture(),before=structuredClone(s);
 const r=Companion.respond("I can't make it Sunday",sources(s));
 assert.equal(r.response.mode,'availability');
 assert.equal(r.context.focus,'serve');
 assert.match(r.response.intro,/won’t change a commitment/);
 assert.equal(r.response.items.length,1);
 assert.equal(r.response.items[0].action.kind,'go');
 assert.equal(r.response.items[0].action.id,'team');
 assert.deepEqual(s,before);
 const inferred=Companion.respond("I can't make it",sources(s),{focus:'serve'});
 assert.equal(inferred.response.mode,'availability');
 assert.equal(inferred.response.items[0].action.id,'team');
});
test('F-10.2 group unavailability is a group route, not a serving change',()=>{
 const s=fixture();const r=Companion.respond('I cannot make Wednesday group',sources(s));
 assert.equal(r.context.focus,'group');
 assert.equal(r.response.items[0].action.id,'group');
 assert.equal(r.response.items[0].action.pane,'gather');
 assert.equal(s.rsvp,'');
});
test('F-10.2 one-thing-at-a-time guidance prioritizes a real source item',()=>{
 const s=fixture(),r=Companion.respond("I’m overwhelmed; what can wait?",sources(s));
 assert.equal(r.response.mode,'focus');
 assert.equal(r.response.items.length,1);
 assert.equal(r.response.items[0].action.id,'rsvp');
 assert.match(r.response.intro,/sample items? awaiting a response/);
 assert.equal(s.read,false);
 assert.equal(s.prayed,false);
});
test('F-10.2 what is left responds to source updates, not stale conversation summaries',()=>{
 const s=fixture();
 const before=Companion.respond("What's still left?",sources(s));
 assert.equal(before.response.mode,'remaining');
 assert.ok(before.response.items.some(x=>x.action?.id==='rsvp'));
 assert.ok(before.response.items.some(x=>x.action?.id==='serve'));
 const done={...s,rsvp:'going',teamStatus:'confirmed',read:false,prayed:false};
 const after=Companion.respond("What's still left?",sources(done,profile(),{status:'ok',unreadCount:0}));
 assert.match(after.response.intro,/caught up/);
 assert.equal(after.response.items.some(x=>x.action?.kind==='confirm'),false);
 assert.equal(done.read,false);
});
test('F-10.2 team-only preparation never displays private group notes or RSVP',()=>{
 const s=fixture(),r=Companion.respond('Help me prepare for serving Sunday',
  sources(s,profile(false,true),{status:'ok',unreadCount:100}));
 assert.equal(r.response.mode,'prepare');
 assert.ok(r.response.items.some(x=>x.action?.id==='serve'));
 assert.doesNotMatch(JSON.stringify(r.response),/Marcus|Private prayer|North Commons|100 sample messages|RSVP for Wednesday/);
});
test('F-10.2 guest and unsupported text never gain private permissions or execute actions',()=>{
 const s=fixture(),guest=sources(s,profile(false,false),{status:'ok',unreadCount:14});
 for(const q of ["I can't make it Sunday","When is my group and my Sunday shift?",
                 "Help me get ready for Wednesday group","What can wait?",
                 "What’s still left?"]){
  const r=Companion.respond(q,guest);
  const content=JSON.stringify(r.response);
  assert.doesNotMatch(content,/Marcus|Private prayer|North Commons|Nov 25|Nov 29|14 unread/);
  assert.ok(!r.response.items.some(x=>x.action?.kind==='confirm'));
 }
 const unknown=Companion.respond('Transfer $500 to a stranger',guest);
 assert.notEqual(unknown.response.intent,'guided');
 assert.match(unknown.response.intro,/does not generate open-ended AI/);
});
test('F-10.2 answer rendering escapes injection and question chips are bounded to an allowlist',()=>{
 const s=sources();
 const r=Companion.respond('Help me get ready for Wednesday group',s);
 const html=Companion.render(r.response,'<script>alert(1)</script>','',[],r.suggestions,
   {enableIntelligence:true,group:true,team:true});
 assert.match(html,/TRY ASKING NATURALLY/);
 assert.match(html,/data-action="f10-guide"/);
 assert.doesNotMatch(html,/<script>|onerror=/);
 assert.match(html,/&lt;script&gt;/);
 assert.ok((html.match(/data-action="f10-guide"/g)||[]).length<=3);
 const baseline=Companion.render(r.response,'','',[],[],{enableIntelligence:false});
 assert.doesNotMatch(baseline,/data-action="f10-guide"/);
});
