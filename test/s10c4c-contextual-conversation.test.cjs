'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const Ask=require('../rallypoint-personal-companion.js'),Engine=require('../rally-one-intelligence.js');
const corpus=require('../engineering/s10c4-evaluation-corpus.json');
const {restoreAsk,restoreApp}=require('./helpers/s10c4c-context-source.cjs');
const now=new Date('2026-11-25T12:00:00Z'),secret='PRIVATE SYNTHETIC PRAYER BODY';
const fixtures={
 'care-ready':{},'care-prayed':{flags:{prayedAt:now.toISOString()}},
 'care-paused':{flags:{snoozedUntil:'2026-11-26T12:00:00Z'}},
 'care-completed':{flags:{prayedAt:now.toISOString(),completedAt:now.toISOString()}},
 'care-absent':{request:false},'revoked-group':{group:false}
};
function source({flags={},request=true,group=true,team=false,role='member'}={}){
 const r=Engine.derive({state:{role,rsvp:'going',teamStatus:'confirmed',read:true,prayed:true,prayers:request?[{name:'Marcus C.',text:secret}]:[],reached:[],rhythm:{},companionCare:{marcus:flags},companionChoices:{snoozedUntil:{}}},ui:{name:'Alex',campus:'central',memberships:{group,team}},conversation:{status:'ok',unreadCount:0},now});
 return {model:r.model,board:r.board,now};
}
for(const c of corpus.cases.filter(x=>Object.hasOwn(fixtures,x.fixture)&&['care','care-status'].includes(x.expect.intent)))test('10C.4C '+c.id+' '+c.query,()=>{
 const s=source(fixtures[c.fixture]),before=structuredClone(s),r=Ask.respond(c.query,s,c.prior);
 assert.equal(r.response.intent,c.expect.intent);assert.equal(r.response.outcome,c.expect.outcome);
 assert.deepEqual(r.response.items.filter(x=>x.action).map(x=>x.action.id),c.expect.routes);
 assert.ok(!JSON.stringify(r).includes(secret));assert.deepEqual(s,before);
});
test('10C.4C same referent, current prayer and completion facts',()=>{
 const initial=Ask.respond('Who could I encourage?',source());
 assert.equal(initial.context.focus,'care');
 const no=Ask.respond("Haven't I already done that?",source(),initial.context);
 assert.equal(no.response.outcome,'no-recorded-completion');
 const prayed=Ask.respond("Haven't I already done that?",source(fixtures['care-prayed']),initial.context);
 assert.equal(prayed.response.outcome,'recorded-prayer');
 const next=Ask.respond('What can I do next?',source(fixtures['care-prayed']),prayed.context);
 assert.equal(next.response.items[0].action.id,'care-check-in');
 const done=Ask.respond('Did I send it?',source(fixtures['care-completed']),next.context);
 assert.equal(done.response.outcome,'recorded-local-completion');
 assert.match(done.response.intro,/No real message was delivered/);assert.equal(done.response.items.length,0);
});
test('10C.4C request detail is not copied, permission loss clears referent',()=>{
 const first=Ask.respond('Who could I encourage?',source());
 const details=Ask.respond('What did he ask for prayer about?',source(),first.context);
 assert.match(details.response.intro,/original fictional request/);assert.ok(!JSON.stringify(details).includes(secret));
 const revoked=Ask.respond('What about that?',source({group:false}),first.context);
 assert.equal(revoked.response.outcome,'no-group-access');assert.equal(revoked.context.focus,'');
 assert.doesNotMatch(JSON.stringify(revoked),/Marcus|care-check-in|care-prayer/);
});
test('10C.4C explicit new topic wins; typed consent cannot complete care',()=>{
 const s=source(),initial=Ask.respond('Who could I encourage?',s);
 const changed=Ask.respond('What Scripture should I read?',s,initial.context);
 assert.equal(changed.context.focus,'scripture');
 const before=structuredClone(s);
 for(const q of ['Yes','Please send Marcus a message','Can you do that?']){
  const r=Ask.respond(q,s,initial.context);assert.ok(!r.response.items.some(x=>x.action?.kind==='care-route'||x.action?.kind==='confirm'));
 }
 assert.deepEqual(s,before);
});
test('10C.4C scope changes on membership, role or source visibility, not completion',()=>{
 const scope=s=>Ask.conversationScope(s.model);
 assert.equal(scope(source()),scope(source(fixtures['care-prayed'])));
 assert.notEqual(scope(source()),scope(source({group:false})));
 assert.notEqual(scope(source()),scope(source({role:'leader'})));
 assert.notEqual(scope(source()),scope(source({request:false})));
 assert.notEqual(scope(source()),scope(source({team:true})));
});
test('10C.4C historical source bytes remain protected',()=>{
 for(const [s,hash] of [[restoreAsk(),'bbfd9dccddf6325eeba2d2882e4e5c6220bf31c0'],[restoreApp(),'69d766731d8e4b4122c9134f8ad951e60890a197']]){
 const b=Buffer.from(s);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),hash);
 }
});
