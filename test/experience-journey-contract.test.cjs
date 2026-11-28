const {test}=require('node:test'),assert=require('node:assert/strict');
const Model=require('../foundation2/today-model.js'),View=require('../foundation2/today-view.js'),Intelligence=require('../rally-one-intelligence.js'),Context=require('../rally-one-member-context.js');
const now=new Date('2026-11-26T12:00:00Z');
test('experience presentation retains accepted responsibility/optional/deferred/unavailable decisions',()=>{
 for(const [group,team,role] of [[false,false,'member'],[true,false,'member'],[false,true,'member'],[true,true,'leader']])for(const variant of ['pending','completed','deferred','unavailable']){
  const ui={name:'Alex',campus:'north',memberships:{group,team}},conversation=variant==='unavailable'?{status:'unavailable'}:{status:'ok',unreadCount:3};let state={role,rsvp:'',teamStatus:'pending',prayers:[],rhythm:{},teamMessages:[],reached:[]};
  if(variant==='completed')for(const command of [{type:'group-rsvp',value:'going'},{type:'serving-response',value:'confirmed'},{type:'leader-review',person:'marcus'},{type:'leader-review',person:'taylor'}]){const r=Context.transition({state,ui,conversation,command,now});if(r.ok)state=r.state;}
  if(variant==='deferred')state.companionChoices={snoozedUntil:{'group-rsvp':'2026-11-27T12:00:00Z'}};
  const snapshot=Intelligence.derive({state,ui,conversation,now}),before=JSON.stringify(snapshot),current=Model.project(snapshot,now);
  const expected=variant==='completed'?[]:[...(team?['serve-response']:[]),...(group&&variant!=='deferred'?['group-rsvp']:[]),...(group&&role==='leader'?['leader-checkins']:[])];
  assert.deepEqual([current.primary,...current.secondary].filter(Boolean).map(x=>x.id),expected);assert.equal(current.name,'Alex');assert.equal(current.unread,group&&variant!=='unavailable'?3:null);assert.equal(current.calm,variant==='completed'&&(group||team));assert.equal(JSON.stringify(snapshot),before,'Presentation must not mutate its context');
 }
});
test('Today schedule entries are native in-app routes, and name/context remain escaped',()=>{
 const {JSDOM}=require('jsdom'),s=Intelligence.derive({state:{role:'member',rsvp:'',teamStatus:'pending'},ui:{name:'Alex',campus:'north',memberships:{group:true,team:true}},conversation:{status:'ok',unreadCount:3},now}),p=Model.project(s,now),doc=new JSDOM(View.render({...p,name:'<img onerror=x>',involvement:'<script>no</script>'})).window.document;
 assert.equal(doc.querySelectorAll('.schedule a.event[data-route]').length,2);assert.equal(doc.querySelector('[data-return-focus=agenda-serve]').getAttribute('href'),'?screen=team');assert.equal(doc.querySelector('[data-return-focus=agenda-group]').getAttribute('href'),'?screen=groups');assert.equal(doc.querySelector('[onerror],script'),null);assert.match(doc.querySelector('.member-context').textContent,/img onerror/);
});
