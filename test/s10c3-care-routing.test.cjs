'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const Engine=require('../rally-one-intelligence.js'),Ask=require('../rallypoint-personal-companion.js');
const {restoreApp,restoreAsk}=require('./helpers/s10c3-care-source.cjs');
const now=new Date('2026-11-25T12:00:00Z'),request={name:'Marcus C.',text:'Private synthetic request'};
function sources({flags={},group=true,prayers=[request]}={}){
 const r=Engine.derive({state:{role:'member',rsvp:'going',teamStatus:'confirmed',read:true,prayed:true,prayers,reached:[],rhythm:{},companionCare:{marcus:flags},companionChoices:{snoozedUntil:{}}},ui:{name:'Alex',campus:'central',memberships:{group,team:false}},conversation:{status:'ok',unreadCount:0},now});
 return {model:r.model,board:r.board,now};
}
for(const [stage,flags,id,label] of [['ready',{},'care-prayer','Read prayer'],['prayed',{prayedAt:now.toISOString()},'care-check-in','Write a check-in']])test('10C.3 '+stage+' care routes from next and why without performing an action',()=>{
 const s=sources({flags}),before=structuredClone(s);
 for(const intent of ['next','why']){
  const r=Ask.answer(intent,s);
  assert.deepEqual(r.items[0].action,{kind:'care-route',id,label});
  assert.match(Ask.render(r),new RegExp('data-action="f10-care-route" data-value="'+id+'"'));
  assert.ok(!JSON.stringify(r).includes(request.text));
 }
 assert.deepEqual(s,before);
});
for(const [name,opts] of [['guest',{group:false}],['paused',{flags:{snoozedUntil:'2026-11-26T12:00:00Z'}}],['completed',{flags:{completedAt:now.toISOString()}}],['missing request',{prayers:[]} ]])test('10C.3 '+name+' has no companion care route',()=>{
 const s=sources(opts);for(const intent of ['next','why'])assert.doesNotMatch(Ask.render(Ask.answer(intent,s)),/data-action="f10-care-route"/);
});
test('10C.3 forged or stale board cannot create a care route without current permission and stage',()=>{
 const ready=sources(),guest=sources({group:false}),paused=sources({flags:{snoozedUntil:'2026-11-26T12:00:00Z'}});
 for(const x of [guest,paused])assert.doesNotMatch(Ask.render(Ask.answer('next',{...x,board:ready.board})),/data-action="f10-care-route"/);
});
test('10C.3 renderer refuses unknown care action IDs',()=>{
 const r={heading:'Test',intro:'',note:'',items:[{title:'test',detail:'',reason:'',action:{kind:'care-route',id:'send',label:'send'}}]};
 assert.doesNotMatch(Ask.render(r),/data-action="f10-care-route"/);
});
test('10C.3 exact previous approved runtime source reconstruction',()=>{
 for(const [s,hash] of [[restoreApp(),'5315d652e5c36621fb9e99ef23f5150abaaaa546'],[restoreAsk(),'842397c5d7bd7d027240150adeafa2ba39045879']]){
 const b=Buffer.from(s);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),hash);
 }
});
