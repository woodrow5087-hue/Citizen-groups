const {test}=require('node:test');
const assert=require('node:assert/strict');
const Dashboard=require('../rallypoint-smart-dashboard.js');
const Board=require('../rallypoint-priority-board.js');
const Today=require('../rallypoint-today.js');
const Companion=require('../rallypoint-companion-decision.js');
const monday=new Date('2026-11-23T12:00:00');
const wed=new Date('2026-11-25T12:00:00');
const saturday=new Date('2026-11-21T12:00:00');
const base=()=>({
 role:'member',rsvp:'',teamStatus:'pending',read:false,prayed:false,
 prayers:[],reached:[],groupMessages:[{name:'Jess',text:'Historical local archive'}],
 teamMessages:[],companionChoices:{snoozedUntil:{}},companionCare:{},rhythm:{}
});
const who=(group,team,name='Member')=>({name,memberships:{group,team}});
const chat=n=>({status:'ok',unreadCount:n});
const view=(date,state,user,conversation=chat(0))=>{
 const d=Dashboard.model({state,ui:user,conversation,now:date,today:Today,
  companion:Companion,passage:'John 15:12'});
 return {d,b:Board.derive(d,date),html:Board.render(d,'',[],date)};
};
test('F-09.3 newcomer: welcoming discovery, no fabricated urgent work or private people',()=>{
 const state=base();state.prayers=[{name:'Marcus C.',text:'Hidden note'}];
 const {d,b,html}=view(monday,state,who(false,false,'Guest'),chat(3));
 assert.equal(d.audience,'newcomer');
 assert.equal(b.audience,'newcomer');
 assert.equal(b.taskCount,0);
 assert.equal(b.hero.id,'welcome-community');
 assert.equal(b.hero.primary.id,'group');
 assert.equal(b.rows.length,3);
 assert.deepEqual(b.rows.map(x=>x.id),['scripture-read','find-people','find-team']);
 assert.ok(b.rows.every(x=>x.requiresResponse===false));
 assert.doesNotMatch(html,/Marcus|Hidden note|3 new messages|leader check-ins/);
 assert.match(html,/data-audience="newcomer"/);
});
test('F-09.3 group-only member: unread conversation leads; no team assignment leaks',()=>{
 const s=base();s.teamStatus='pending';s.rsvp='going';
 const {d,b,html}=view(monday,s,who(true,false),chat(2));
 assert.equal(d.audience,'group-member');
 assert.equal(b.hero.id,'group-unread');
 assert.equal(b.taskCount,1);
 assert.ok(!b.rows.some(x=>x.id==='serve-response'||x.id==='serving-overview'));
 assert.ok(b.rows.some(x=>x.id==='find-team'));
 assert.match(html,/2 new messages/);
 assert.ok(!html.includes('Welcome Team · availability needed'));
});
test('F-09.3 volunteer-only member: serving response leads, no group-specific content',()=>{
 const s=base();s.prayers=[{name:'Marcus C.',text:'Private note'}];
 const {d,b,html}=view(saturday,s,who(false,true),chat(3));
 assert.equal(d.audience,'volunteer');
 assert.equal(b.hero.id,'serve-response');
 assert.equal(b.hero.primary.id,'f09-serve');
 assert.equal(b.taskCount,1);
 assert.doesNotMatch(html,/Private note|Marcus|3 new messages|Wednesday Group is talking/);
 assert.ok(b.rows.some(x=>x.id==='find-people'));
});
test('F-09.3 scoped leader: existing unreviewed check-ins lead without invented scoring',()=>{
 const s=base();s.role='leader';s.rsvp='going';s.teamStatus='confirmed';s.read=true;s.prayed=true;
 const {d,b,html}=view(monday,s,who(true,true),chat(0));
 assert.equal(d.audience,'leader');
 assert.equal(d.leaderRemaining,2);
 assert.equal(b.taskCount,1);
 assert.equal(b.hero.id,'leader-checkins');
 assert.equal(b.hero.primary.id,'group');
 assert.equal(b.hero.primary.pane,'leader');
 assert.match(html,/2 leader check-ins/);
 assert.match(html,/LEADER FOLLOW-UP/);
 assert.doesNotMatch(html,/attendance score|spiritual risk/i);
 const reviewed={...s,reached:['marcus','taylor']};
 const after=view(monday,reviewed,who(true,true),chat(0));
 assert.equal(after.d.leaderRemaining,0);
 assert.equal(after.b.hero.id,'caught-up');
 assert.equal(after.b.taskCount,0);
 const downgraded=view(monday,s,who(false,true),chat(0));
 assert.equal(downgraded.d.leaderRemaining,0,'leader role does not bypass group membership');
 assert.doesNotMatch(downgraded.html,/check-ins|Marcus/);
});
test('F-09.3 caught-up is truly quiet, while unread optional Scripture remains uncompleted',()=>{
 const s=base();s.teamStatus='confirmed';s.rsvp='going';s.read=false;s.prayed=false;
 const before=structuredClone(s);
 const {d,b,html}=view(monday,s,who(true,true),chat(0));
 assert.equal(b.hero.id,'caught-up');
 assert.equal(b.caughtUp,true);
 assert.equal(b.taskCount,0);
 assert.equal(b.hero.calm,true);
 assert.equal(b.hero.eyebrow,'A MOMENT TO BREATHE');
 assert.ok(b.rows.every(x=>!x.requiresResponse));
 assert.equal(b.agenda.find(x=>x.id==='scripture').status,'To read');
 assert.match(html,/class="f09b-hero is-settled"/);
 assert.match(html,/data-caught-up="true"/);
 assert.deepEqual(s,before,'render never marks optional reading or prayer complete');
});
test('F-09.3 open RSVP and Sunday serve have real deadline precedence',()=>{
 const s=base();
 let x=view(wed,s,who(true,true),chat(3));
 assert.equal(x.b.hero.id,'group-rsvp');
 assert.match(x.b.hero.subtitle,/6:30 PM/);
 assert.equal(x.b.taskCount,3);
 x=view(saturday,s,who(true,true),chat(3));
 assert.equal(x.b.hero.id,'serve-response');
 x=view(monday,s,who(true,true),chat(3));
 assert.equal(x.b.hero.id,'group-unread');
 assert.deepEqual(x.b.rows.filter(r=>r.requiresResponse).map(r=>r.id),['group-rsvp','serve-response']);
});
test('F-09.3 snoozed nonurgent suggestion remains discoverable but not forcibly re-promoted',()=>{
 const s=base();s.rsvp='going';s.teamStatus='confirmed';s.read=true;s.prayed=true;
 s.companionChoices.snoozedUntil['group-unread']='2026-11-24T14:00:00';
 const first=view(monday,s,who(true,true),chat(3));
 assert.ok(first.d.deferredIds.includes('group-unread'));
 assert.equal(first.b.taskCount,1);
 assert.equal(first.b.hero.id,'paused');
 assert.ok(first.b.rows.some(x=>x.id==='group-unread'&&x.deferred===true));
 assert.equal(first.b.caughtUp,false,'deferred is not identical to complete');
 const after=view(wed,s,who(true,true),chat(3));
 assert.equal(after.b.hero.id,'group-unread','expired snooze no longer suppresses priority');
});
test('F-09.3 near-term RSVP returns to top even if nonurgent reminder was deferred',()=>{
 const s=base();s.teamStatus='confirmed';s.read=true;s.prayed=true;
 s.companionChoices.snoozedUntil['group-rsvp']='2026-11-29T00:00:00';
 const {b}=view(wed,s,who(true,true),chat(3));
 assert.equal(b.hero.id,'group-rsvp');
 assert.equal(b.hero.title,'Group tonight.');
});
test('F-09.3 malformed thread is not falsely marked caught up, and no cursor changes on render',()=>{
 const s=base();s.rsvp='going';s.teamStatus='confirmed';s.read=true;s.prayed=true;
 const before=structuredClone(s);
 const {b,html}=view(monday,s,who(true,true),{status:'unavailable',unreadCount:777});
 assert.equal(b.hero.id,'group-unavailable');
 assert.equal(b.taskCount,1);
 assert.doesNotMatch(html,/777 new messages|all caught up/);
 assert.deepEqual(s,before);
});
test('F-09.3 transient confirmation is escaped and not embedded in the persistent source',()=>{
 const s=base();const {d}=view(monday,s,who(true,true),chat(0));
 const html=Board.render({...d,feedback:'<img src=x onerror=alert(1)>'},'',[],monday);
 assert.match(html,/role="status" aria-live="polite"/);
 assert.match(html,/&lt;img src=x/);
 assert.doesNotMatch(html,/<img src=x onerror=/);
 assert.ok(!Object.hasOwn(s,'feedback'));
});
