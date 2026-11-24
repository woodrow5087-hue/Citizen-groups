/* Sprint 9B-R9: classic Scripture memory action handlers; no independent state. */
(function(root,factory){
'use strict';
const api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.RallyMemoryActions=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const actions=Object.freeze(['memory-mode','memory-challenge','memory-slot','memory-pick','memory-check','memory-hint','memory-reset','memory-next-player','memory-new-duel']);
function handles(action){return actions.includes(action);}
function run(a,v,{s,M,render,notify}){
if(a==='memory-mode'){
 if(!['solo','pass'].includes(v))return;
 s.memoryMode=v;s.memoryPassTurn=1;s.memoryTarget=null;render();return;
}
if(a==='memory-challenge'){
 s.memoryActive=v==='romans'?'romans':s.plan;
 s.memoryTarget=null;s.memoryPassTurn=1;render();return;
}
if(a==='memory-slot'){
 const key=['sermon','study','year','romans'].includes(s.memoryActive)?s.memoryActive:s.plan;
 const scope=key+':'+(s.memoryMode==='pass'?'p'+s.memoryPassTurn:'solo'),slot=Number(v);
 const g=M.normalize(s.memoryGames[scope],key);
 if(g.solved)return;
 if(Number.isInteger(slot)&&slot>=0&&slot<5){
   if(g.slots[slot])s.memoryGames[scope]=M.clear(g,key,slot);
   s.memoryTarget=slot;render();
 }
 return;
}
if(['memory-pick','memory-check','memory-hint','memory-reset','memory-next-player','memory-new-duel'].includes(a)){
 const key=['sermon','study','year','romans'].includes(s.memoryActive)?s.memoryActive:s.plan;
 const scope=key+':'+(s.memoryMode==='pass'?'p'+s.memoryPassTurn:'solo');
 const g=M.normalize(s.memoryGames[scope],key);
 if(a==='memory-next-player'){
   if(s.memoryMode==='pass'&&s.memoryPassTurn===1&&g.solved){s.memoryPassTurn=2;s.memoryTarget=null;render();}
   return;
 }
 if(a==='memory-new-duel'){
   for(const who of [1,2]){const k=key+':p'+who;s.memoryGames[k]=M.reset(s.memoryGames[k],key)}
   s.memoryPassTurn=1;s.memoryTarget=null;render();return;
 }
 if(a==='memory-reset'){s.memoryGames[scope]=M.reset(g,key);s.memoryTarget=null;render();return;}
 if(a==='memory-hint'){s.memoryGames[scope]=M.hint(g,key);s.memoryTarget=null;render();return;}
 if(a==='memory-pick'){
   const target=Number.isInteger(s.memoryTarget)&&s.memoryTarget>=0&&s.memoryTarget<5?s.memoryTarget:undefined;
   const next=M.pick(g,key,v,target);
   s.memoryGames[scope]=next;s.memoryTarget=next.slots.indexOf(null);render();return;
 }
 if(a==='memory-check'){
   const outcome=M.check(g,key);s.memoryGames[scope]=outcome.state;s.memoryTarget=outcome.state.slots.indexOf(null);
   render();if(outcome.status==='complete')notify('Verse complete — nicely done!');return;
 }
}
}
return Object.freeze({handles,run});
});
