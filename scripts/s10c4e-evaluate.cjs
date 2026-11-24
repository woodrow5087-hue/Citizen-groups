'use strict';
// Pure fixture audit; runnable in Node and imported by the existing test runner.
const Ask=require('../rallypoint-personal-companion.js'),Engine=require('../rally-one-intelligence.js');
const corpus=require('../engineering/s10c4-evaluation-corpus.json'),stress=require('../engineering/s10c4e-stress-corpus.json');
const now=new Date('2026-11-25T12:00:00Z'),secret='AUDIT_PRIVATE_SYNTHETIC_PRAYER_BODY';
const req=[{name:'Marcus C.',text:secret}];
const fixtures={
 visitor:{group:false,team:false,extra:{role:'leader',prayers:req}},connected:{group:true,team:true},
 'care-ready':{group:true,extra:{prayers:req}},
 'care-prayed':{group:true,extra:{prayers:req,companionCare:{marcus:{prayedAt:now.toISOString()}}}},
 'care-paused':{group:true,extra:{prayers:req,companionCare:{marcus:{snoozedUntil:'2026-11-26T12:00:00Z'}}}},
 'care-completed':{group:true,extra:{prayers:req,companionCare:{marcus:{prayedAt:now.toISOString(),completedAt:now.toISOString()}}}},
 'care-absent':{group:true},'revoked-group':{extra:{role:'leader',prayers:req}},
 'volunteer-pending':{team:true,extra:{teamStatus:'pending'}},'volunteer-confirmed':{team:true},
 'dual-commitments':{group:true,team:true,extra:{rsvp:'',teamStatus:'pending',prayers:req},twoCommitmentDemo:true},
 'leader-request':{group:true,extra:{role:'leader',leaderRequest:'taylor-wednesday',reached:['marcus']},requestedCheckIn:true},
 'conversation-unavailable':{group:true,conversation:{status:'unavailable',unreadCount:0}}
};
function input(key){
 if(!Object.hasOwn(fixtures,key))throw Error('Unknown fixture '+key);
 const {group=false,team=false,extra={},conversation={status:'ok',unreadCount:0},twoCommitmentDemo=false,requestedCheckIn=false}=fixtures[key];
 return {state:{role:'member',rsvp:'going',teamStatus:'confirmed',read:true,prayed:true,prayers:[],reached:[],rhythm:{},companionCare:{},companionChoices:{snoozedUntil:{}},...structuredClone(extra)},ui:{name:'Alex',campus:'central',memberships:{group,team}},conversation:structuredClone(conversation),now:new Date(now),twoCommitmentDemo,requestedCheckIn};
}
function run(c){
 const a=input(c.fixture),before=JSON.stringify(a),r=Engine.derive(a),s={model:r.model,board:r.board,now:new Date(now),goalMode:true},sBefore=JSON.stringify(s),reply=Ask.respond(c.query,s,c.prior),b=reply.response,html=Ask.render(b,c.query);
 const obs={id:c.id,fixture:c.fixture,query:c.query,intent:b.intent,outcome:b.outcome??({clarify:'clarify-without-action',unsupported:'no-inferred-risk-or-write'}[b.intent]||null),routes:b.items.filter(x=>x.action).map(x=>x.action.kind==='go'?x.action.id+':'+(x.action.pane||''):x.action.id),mutates:before!==JSON.stringify(a)||sBefore!==JSON.stringify(s),disclosesRawPrayer:JSON.stringify(b).includes(secret)||html.includes(secret),heading:b.heading,intro:b.intro,items:b.items.map(x=>({title:x.title,detail:x.detail,reason:x.reason,action:x.action})),note:b.note,focus:reply.context.focus,selected:r.decision.selectedIds};
 const failures=Object.keys(c.expect).filter(k=>JSON.stringify(obs[k])!==JSON.stringify(c.expect[k]));
 if(obs.mutates&&!failures.includes('mutates'))failures.push('mutates');
 if(obs.disclosesRawPrayer&&!failures.includes('disclosesRawPrayer'))failures.push('disclosesRawPrayer');
 return {...obs,expected:c.expect,pass:failures.length===0,failures};
}
function evaluate(){
 const baseline=corpus.cases.map(run),unfamiliar=stress.cases.map(run);
 const summarize=rows=>({total:rows.length,pass:rows.filter(x=>x.pass).length,fail:rows.filter(x=>!x.pass).length,mutations:rows.filter(x=>x.mutates).length,rawPrayerDisclosures:rows.filter(x=>x.disclosesRawPrayer).length});
 return {fixtureCount:Object.keys(fixtures).length,baseline:{summary:summarize(baseline),cases:baseline},stress:{summary:summarize(unfamiliar),cases:unfamiliar}};
}
module.exports={evaluate,input,run};
if(require.main===module){
 const report=evaluate();
 process.stdout.write(JSON.stringify(report,null,2)+'\n');
 // Ordinary run is evidence collection, NOT acceptance. Strict mode is the
 // release-blocking check, with no known-failure whitelist.
 if(process.argv.includes('--strict')&&(report.baseline.summary.fail||report.stress.summary.fail))process.exitCode=1;
}
