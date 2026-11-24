/* Sprint 9B-R6: existing demo-state initialization; no persistent writes. */
(function(root,factory){
'use strict';
const api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.RallyAppState=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
function initialize(readRaw,rallyOne){
const defaults=()=>({role:'member',groupPane:'chat',directPerson:'anna',directMessages:{},teamPane:'schedule',view:'today',discover:false,groupMessages:[{name:'Jess W.',time:'Yesterday',text:'What stood out to you in John 15 this week?'},{name:'Anna L.',time:'Today',text:'Looking forward to seeing everyone Wednesday.'}],teamMessages:[{name:'Sam R.',time:'Yesterday',text:'Welcome team — thank you for helping people feel at home!'}],prayers:[{name:'Marcus C.',time:'Yesterday',text:'Praying for wisdom with an upcoming decision.'}],rsvp:'',teamStatus:'pending',coverage:false,attendance:{anna:'here',jess:'here',marcus:'unknown',taylor:'unknown'},reached:[],interest:[],plan:'sermon',planQuestions:{},memoryTextRevision:'BSB-2026-1',memoryGames:{},memoryMode:'solo',memoryActive:null,memoryPassTurn:1,memoryTarget:null,question:'How can we love one another as Jesus has loved us?',read:false,prayed:false,companionCare:{},companionChoices:{snoozedUntil:{}},rhythm:{}});
let s;try{s={...defaults(),...JSON.parse(readRaw()||'null')}}catch(_){s=defaults()}
if(!s||!s.groupMessages||!Array.isArray(s.groupMessages))s=defaults();
// Sprint 7B: render malformed local fixtures safely while the storage guard
// preserves the ORIGINAL bytes and refuses writes until explicit recovery.
const validSampleMessage=m=>m&&typeof m==='object'&&!Array.isArray(m)&&
 typeof m.name==='string'&&typeof m.text==='string';
for(const field of ['groupMessages','teamMessages','prayers']){
 s[field]=Array.isArray(s[field])?s[field].filter(validSampleMessage):[];
}
s.reached=Array.isArray(s.reached)?s.reached.filter(id=>typeof id==='string'):[];
if(!s.attendance||typeof s.attendance!=='object'||Array.isArray(s.attendance))
 s.attendance=defaults().attendance;

if(rallyOne)s.view='today';
 if(!s.directMessages||typeof s.directMessages!=='object'||Array.isArray(s.directMessages))s.directMessages={};
 if(!s.planQuestions||typeof s.planQuestions!=='object'||Array.isArray(s.planQuestions))s.planQuestions={};
if(!s.companionCare||typeof s.companionCare!=='object'||Array.isArray(s.companionCare))s.companionCare={};
if(!s.companionChoices||typeof s.companionChoices!=='object'||Array.isArray(s.companionChoices))s.companionChoices={};
if(!s.companionChoices.snoozedUntil||typeof s.companionChoices.snoozedUntil!=='object'||
   Array.isArray(s.companionChoices.snoozedUntil))s.companionChoices.snoozedUntil={};
if(!s.rhythm||typeof s.rhythm!=='object'||Array.isArray(s.rhythm))s.rhythm={};
if(!s.memoryGames||typeof s.memoryGames!=='object'||Array.isArray(s.memoryGames))s.memoryGames={};
if(!['solo','pass'].includes(s.memoryMode))s.memoryMode='solo';
if(!['sermon','study','year','romans'].includes(s.memoryActive))s.memoryActive=null;
if(![1,2].includes(s.memoryPassTurn))s.memoryPassTurn=1;
if(!Number.isInteger(s.memoryTarget)||s.memoryTarget<0||s.memoryTarget>4)s.memoryTarget=null;
return s;
}
return Object.freeze({initialize});
});
