const {test}=require('node:test');
const assert=require('node:assert/strict');
const F=require('../rallypoint-smart-dashboard.js');
const Today=require('../rallypoint-today.js');
const Companion=require('../rallypoint-companion-decision.js');
const now=new Date('2026-11-23T12:00:00Z');
const ui={name:'Jonathan',memberships:{group:true,team:true}};
const clean={teamStatus:'confirmed',rsvp:'going',read:true,prayed:true,prayers:[],
 groupMessages:[{name:'Jess',time:'Yesterday',text:'Historical legacy'}],
 companionChoices:{snoozedUntil:{}},companionCare:{},rhythm:{},role:'member',reached:[]};
const chat={status:'ok',unreadCount:3};
const make=(state=clean,user=ui,thread=chat,time=now)=>
 F.model({state,ui:user,conversation:thread,now:time,today:Today,
   companion:Companion,passage:'John 15:12'});
test('F-09 uses existing F-08 priority and exposes genuine independent cards with no writes',()=>{
 const source={...clean,teamStatus:'pending',rsvp:''};
 const before=structuredClone(source);
 const d=make(source);
 assert.equal(d.stack[0].id,'serve-response');
 assert.equal(d.stack[0].primary.name,'f09-serve');
 assert.equal(d.stack[1].id,'group-unread');
 assert.equal(d.stack[2].id,'group-rsvp');
 assert.equal(d.modules.length,4);
 assert.equal(d.modules[0].count,3);
 assert.deepEqual(d.tasks.map(x=>x.id),['chat-unread','rsvp','serve']);
 assert.equal(d.source,'existing fictional browser-local fixtures');
 assert.deepEqual(source,before);
 assert.ok(!Object.hasOwn(source,'dashboard'));
});
test('F-09 direct action projection reacts to a saved RSVP and serving choice',()=>{
 const initial=make({...clean,teamStatus:'pending',rsvp:''});
 assert.ok(initial.tasks.some(x=>x.id==='rsvp'&&x.control.name==='f09-rsvp'));
 assert.ok(initial.tasks.some(x=>x.id==='serve'&&x.control.name==='f09-serve'));
 const after=make({...clean,rsvp:'going',teamStatus:'confirmed'},ui,{status:'ok',unreadCount:0});
 assert.equal(after.tasks.length,0);
 assert.equal(after.modules[1].detail,'Confirmed on this device');
 assert.equal(after.modules[0].detail,'All caught up');
 assert.match(F.render(after),/You’re caught up on the sample actions/);
});
test('F-09 calendar labels are truthful; Group tonight only on the actual sample date',()=>{
 const monday=make({...clean,rsvp:''},ui,{status:'ok',unreadCount:0},
  new Date('2026-11-23T12:00:00'));
 const rsvp=monday.stack.find(x=>x.id==='group-rsvp');
 assert.ok(rsvp);
 assert.equal(rsvp.title,'Your Wednesday Group.');
 assert.doesNotMatch(rsvp.subtitle,/Tonight/);
 const wed=make({...clean,rsvp:''},ui,{status:'ok',unreadCount:0},
  new Date('2026-11-25T12:00:00'));
 assert.equal(wed.stack.find(x=>x.id==='group-rsvp').title,'Group tonight.');
 assert.match(wed.stack.find(x=>x.id==='group-rsvp').subtitle,/Tonight/);
 const thursday=make({...clean,rsvp:''},ui,{status:'ok',unreadCount:0},
  new Date('2026-11-26T12:00:00'));
 assert.doesNotMatch(thursday.meetingText,/Tonight/);
});
test('F-09 modern unread only; legacy conversation is preserved and not interpreted as unread',()=>{
 const s={...clean,groupMessages:[{name:'You',text:'Many old messages'}]};
 const d=make(s,ui,{status:'ok',unreadCount:0});
 assert.equal(d.modules[0].detail,'All caught up');
 assert.ok(!d.tasks.some(x=>x.id==='chat-unread'));
 assert.equal(s.groupMessages[0].text,'Many old messages');
 const error=make(s,ui,{status:'unavailable',unreadCount:100});
 assert.equal(error.modules[0].detail,'Conversation needs review');
 assert.ok(error.tasks.some(x=>x.id==='chat-unavailable'));
 assert.ok(!error.tasks.some(x=>x.id==='chat-unread'));
});
test('F-09 never leaks group-only content or serving records to an unjoined guest',()=>{
 const guest={name:'Guest',memberships:{group:false,team:false}};
 const s={...clean,prayers:[{name:'Marcus C.',text:'A private prayer'}],rsvp:'',teamStatus:'pending'};
 const d=make(s,guest,{status:'ok',unreadCount:3});
 assert.equal(d.unread,0);
 assert.ok(d.stack.every(x=>x.id!=='care-marcus'&&x.id!=='group-unread'&&x.id!=='group-rsvp'));
 assert.ok(d.tasks.every(x=>x.id!=='serve'&&x.id!=='rsvp'&&x.id!=='chat-unread'));
 assert.doesNotMatch(JSON.stringify(d),/A private prayer|Marcus/);
 assert.match(d.modules[0].detail,/Explore sample groups/);
});
test('F-09 escapes a malicious local nickname and Scripture text',()=>{
 const d=make(clean,{...ui,name:'<img src=x onerror=alert(1)>'},{status:'ok',unreadCount:0});
 const html=F.render({...d,passage:'<script>bad()</script>'});
 assert.doesNotMatch(html,/<img src=x onerror/);
 assert.doesNotMatch(html,/<script>bad/);
 assert.match(html,/&lt;img src=x/);
 assert.ok(!html.includes('onerror=alert(1)>'));
});
test('F-09 stack and modules are distinguishable routes, with no fake completion control',()=>{
 const d=make({...clean,teamStatus:'pending',rsvp:''});
 const html=F.render(d,1);
 assert.match(html,/data-active-card="group-unread"/);
 assert.match(html,/data-action="f09-stack" data-value="next"/);
 assert.match(html,/data-action="f09-stack" data-value="prev"/);
 assert.match(html,/data-action="f09-rsvp"/);
 assert.match(html,/data-action="f09-serve"/);
 assert.match(html,/data-go="group" data-pane="chat"/);
 assert.match(html,/data-go="read"/);
 assert.match(html,/data-go="team"/);
 assert.doesNotMatch(html,/data-action="mark-read"|data-action="send-notification"/);
 assert.match(html,/ILLUSTRATIVE LOCAL DEMO/);
});
