/* Rally Intelligence application service: one deterministic decision snapshot for
 * Today and Ask Rally. No IO, storage, rendering, external AI or implicit action.
 * Legacy presentation modes retain their existing model/board policy.
 */
(function(root,factory){
 'use strict';
 const deps=typeof module==='object'&&module.exports?{
  Context:require('./rally-one-member-context.js'),Smart:require('./rallypoint-smart-dashboard.js'),
  Board:require('./rallypoint-priority-board.js'),Focus:require('./rally-one-unified-focus.js'),
  Care:require('./rally-one-care-flow.js'),Today:require('./rallypoint-today.js'),
  Companion:require('./rallypoint-companion-decision.js')
 }:{Context:root.RallyMemberContext,Smart:root.RallySmartDashboard,Board:root.RallyPriorityBoard,
  Focus:root.RallyUnifiedFocus,Care:root.RallyCareFlow,Today:root.RallyToday,Companion:root.RallyCompanionDecision};
 const api=factory(deps);
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RallyIntelligence=api;
})(typeof window!=='undefined'?window:null,function({Context,Smart,Board,Focus,Care,Today,Companion}){
 function derive({state,ui,conversation,now=new Date(),passage='John 15:12',enabled=true,requestedCheckIn=false,twoCommitmentDemo=false}={}){
  const context=enabled?Context.snapshot({state,ui,conversation,now}):null;
  const model=Smart.model({state,ui,conversation,context,now,today:Today,companion:Companion,passage});
  const baselineBoard=Board.derive(model,now);
  const care=Care.derive({state,member:enabled?context.permissions.group:ui?.memberships?.group===true,now});
  const focus=enabled?Focus.focus({board:baselineBoard,model:{...model,requestedCheckIn,twoCommitmentDemo},care,now}):null;
  // Focused actions and the broader weekly commitment overview are distinct.
  const board=focus?.hero?Object.freeze({...baselineBoard,hero:focus.hero,rows:focus.rows,
   taskCount:focus.actionCount,responsibilityIds:focus.responsibilityIds,weeklyTaskCount:baselineBoard.taskCount,
   caughtUp:focus.hero.id==='caught-up'}):baselineBoard;
  const decision=focus?Object.freeze({selectedIds:focus.selectedIds,actionCount:focus.actionCount,
   deferredIds:model.deferredIds,explanation:focus.explanation,
   reasons:Object.freeze([board.hero,...board.rows].filter(x=>focus.selectedIds.includes(x.id))
    .map(x=>Object.freeze({id:x.id,why:x.why})))
  }):null;
  return Object.freeze({context,model,baselineBoard,care,focus,board,decision});
 }
 return Object.freeze({derive});
});
