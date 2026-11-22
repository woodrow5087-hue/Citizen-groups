const {test}=require('node:test');
const assert=require('node:assert/strict');
const Board=require('../rallypoint-priority-board.js');
const Dashboard=require('../rallypoint-smart-dashboard.js');
const Companion=require('../rallypoint-companion-decision.js');
const Today=require('../rallypoint-today.js');
const ui={name:'Jonathan',memberships:{group:true,team:true}};
const base={role:'member',teamStatus:'pending',rsvp:'',read:false,prayed:false,prayers:[],
 groupMessages:[{name:'Jess',text:'An old preserved archive'}],
 companionChoices:{snoozedUntil:{}},companionCare:{},rhythm:{},reached:[]};
function projection(now,state=base,user=ui,chat={status:'ok',unreadCount:3}){
 return Dashboard.model({state,ui:user,conversation:chat,now,today:Today,companion:Companion,passage:'John 15:12'});
}
test('Visible board uses actual calendar urgency while never truncating relevant F-08 candidates',()=>{
 const wednesday=new Date('2026-11-25T12:00:00');
 const source=structuredClone(base);
 const d=projection(wednesday,source);
 assert.equal(d.stack[0].id,'serve-response'); // F-08's standalone policy remains unchanged.
 assert.ok(d.allPriorities.some(x=>x.id==='group-rsvp'));
 const b=Board.derive(d,wednesday);
 assert.equal(b.hero.id,'group-rsvp');
 assert.equal(b.hero.title,'Group tonight.');
 assert.equal(b.hero.heroLabel,'RSVP · I’m in');
 assert.equal(b.rows.length,3);
 assert.deepEqual(b.rows.map(x=>x.id),['group-unread','serve-response','scripture-read']);
 assert.deepEqual(source,base,'ranking does not modify the stored fixture');
 assert.equal(d.stack.length,4,'the earlier Smart Stack comparator remains limited to four cards');
});
test('Saturday approaching Sunday uses serving action as hero, not fictional Group tonight',()=>{
 const saturday=new Date('2026-11-21T12:00:00');
 const d=projection(saturday);
 const b=Board.derive(d,saturday);
 assert.equal(b.hero.id,'serve-response');
 assert.match(b.hero.subtitle,/Welcome Team/);
 assert.notEqual(b.hero.title,'Group tonight.');
 assert.ok(b.rows.some(x=>x.id==='group-unread'));
});
test('Board displays three distinct compact actions without duplicate hero task',()=>{
 const monday=new Date('2026-11-23T12:00:00');
 const d=projection(monday);
 const b=Board.derive(d,monday);
 assert.equal(b.hero.id,'group-unread');
 assert.equal(b.rows.length,3);
 assert.deepEqual(b.rows.map(x=>x.id),['group-rsvp','serve-response','scripture-read']);
 assert.equal(new Set([b.hero.id,...b.rows.map(x=>x.id)]).size,4);
 assert.equal(b.rows.find(x=>x.id==='group-rsvp').action.id,'f09-rsvp');
 assert.equal(b.rows.find(x=>x.id==='serve-response').action.id,'f09-serve');
 const html=Board.render(d,'',[],monday);
 assert.equal((html.match(/class="f09b-row f09b-/g)||[]).length,3);
 assert.doesNotMatch(html,/f09-stack|f09-stack-controls|data-active-card=/);
 assert.match(html,/data-row="group-rsvp"/);
 assert.match(html,/data-action="f09-rsvp"/);
 assert.match(html,/data-action="f09-serve"/);
 assert.match(html,/Today at a Glance/);
 assert.match(html,/SCHEDULE &amp; STATUS/);
 assert.equal((html.match(/class="f09b-status /g)||[]).length,3);
 const glance=html.match(/<section class="f09b-glance"[\s\S]*?<\/section>/)?.[0]||'';
 assert.doesNotMatch(glance,/<button|data-action=|data-go=/,'at-a-glance has zero duplicate CTAs');
 assert.match(html,/Compare Smart Stack/);
});
test('Source-backed RSVP and serving status never claim ongoing tasks after completion',()=>{
 const date=new Date('2026-11-25T12:00:00');
 const s={...base,teamStatus:'confirmed',rsvp:'going',read:true,prayed:true};
 const d=projection(date,s,ui,{status:'ok',unreadCount:0});
 const b=Board.derive(d,date);
 assert.equal(b.agenda.find(x=>x.id==='group').status,'Going');
 assert.equal(b.agenda.find(x=>x.id==='serve').status,'Confirmed');
 assert.ok(b.rows.every(x=>!x.requiresResponse));
 assert.ok(!['group-rsvp','serve-response','group-unread'].includes(b.hero.id));
 assert.match(Board.render(d,'',[],date),/No live church activity/i);
});
test('Malformed modern conversation is never treated as caught-up; legacy archive is untouched',()=>{
 const date=new Date('2026-11-23T12:00:00');
 const s=structuredClone(base);
 const d=projection(date,s,ui,{status:'unavailable',unreadCount:900});
 const b=Board.derive(d,date);
 assert.equal(b.hero.id,'group-unavailable');
 assert.equal(b.hero.heroLabel,'Review conversation');
 assert.equal(d.unread,0);
 assert.deepEqual(s,base);
 assert.ok(!Board.render(d,'',[],date).includes('900 new messages'));
});
test('No membership: no group-private faces, RSVP, serving, or care prompts can render',()=>{
 const date=new Date('2026-11-23T12:00:00');
 const guest={name:'Guest',memberships:{group:false,team:false}};
 const s={...base,prayers:[{name:'Marcus C.',text:'Private sample prayer'}]};
 const d=projection(date,s,guest,{status:'ok',unreadCount:3});
 const b=Board.derive(d,date);
 assert.equal(b.hasPeople,false);
 assert.notEqual(b.hero.id,'group-rsvp');
 assert.ok(b.rows.every(x=>!['group-unread','group-rsvp','serve-response','care-marcus'].includes(x.id)));
 assert.deepEqual(b.agenda.map(x=>x.title),['Community','Serving','Scripture rhythm']);
 const html=Board.render(d,'',[{name:'Secret',image:'https://images.unsplash.com/photo-123'}],date);
 assert.doesNotMatch(html,/Marcus|Private sample prayer|Secret|3 new messages|RSVP for Wednesday Group/);
});
test('User-controlled names, source details and portrait URLs are escaped before HTML',()=>{
 const date=new Date('2026-11-25T12:00:00');
 const d=projection(date,base,{...ui,name:'<img src=x onerror=1>'},{status:'ok',unreadCount:2});
 const html=Board.render(d,'',[{id:'anna',name:'"><script>',image:'javascript:alert(1)'}],date);
 assert.doesNotMatch(html,/<script>|src="javascript:|onerror=1>/);
 assert.match(html,/&lt;img/);
 assert.match(html,/&lt;script&gt;/);
});

test('At a Glance remains source-backed schedule/status only, while actions live in the priority board',()=>{
 const wed=new Date('2026-11-25T12:00:00');
 const d=projection(wed);
 const b=Board.derive(d,wed);
 const group=b.agenda.find(x=>x.id==='group'),serve=b.agenda.find(x=>x.id==='serve'),scripture=b.agenda.find(x=>x.id==='scripture');
 assert.match(group.detail,/Wed · 6:30 PM · North Commons/);
 assert.equal(group.status,'RSVP open');
 assert.match(serve.detail,/Sun · 9:00 AM · North Campus/);
 assert.equal(serve.status,'Needs reply');
 assert.equal(scripture.status,'To read');
 assert.ok(b.agenda.every(x=>!('action' in x)&&!('cta' in x)));
 const after=Board.derive(projection(wed,{...base,rsvp:'going',teamStatus:'confirmed',read:true,prayed:true},ui,{status:'ok',unreadCount:0}),wed);
 assert.deepEqual(after.agenda.map(x=>x.status),['Going','Confirmed','Read']);
 assert.equal(after.agenda.length,3);
});
