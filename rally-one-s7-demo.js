/* Sprint 7C · Repeatable leadership scenes, separate from authentication.
 * No new persistent keys, no network, no implicit Connect read cursor reset.
 * The app saves via its existing write guard; 'Restore starting state' is only
 * available in the current page session. This is NOT an access-control layer.
 */
(function(root,factory){
 'use strict';const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.RallySprint7Demo=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const scenarios=Object.freeze([
 Object.freeze({id:'visitor',label:'01 · First-time visitor',detail:'Welcome, discovery, no private membership'}),
 Object.freeze({id:'group-member',label:'02 · Small-group member',detail:'Wednesday RSVP, group and optional care'}),
 Object.freeze({id:'serving',label:'03 · Serving volunteer',detail:'Sunday response, no group access'}),
 Object.freeze({id:'leader',label:'04 · Leader fixture',detail:'Explicit sample leader tools; never church authority'}),
 Object.freeze({id:'group-serving',label:'05 · Group + Serving',detail:'Two commitments and one contextual Today'})
]);
const copy=value=>JSON.parse(JSON.stringify(value));
const obj=value=>value&&typeof value==='object'&&!Array.isArray(value)?value:{};
function create(baseState,baseUI){
 const baseline=Object.freeze({state:copy(obj(baseState)),ui:copy(obj(baseUI))});
 let active=null;
 function prepare(id){
  const scene=scenarios.find(p=>p.id===id);
  if(!scene)return Object.freeze({ok:false,reason:'unknown-demo-scene'});
  const state=copy(baseline.state),ui=copy(baseline.ui);
  const group=['group-member','leader','group-serving'].includes(id);
  const team=['serving','group-serving'].includes(id);
  ui.memberships={group,team};
  ui.name=id==='visitor'?'Jamie':id==='leader'?'Jordan':'Alex';
  ui.onboarding={version:2,connection:id==='visitor'?'guest':id==='leader'?'leader':'connected',completed:true};
  state.role=id==='leader'?'leader':'member';
  state.view='today';state.groupPane='overview';state.teamPane='schedule';state.discover=false;
  state.rsvp='';state.teamStatus='pending';state.coverage=false;
  state.leaderRequest=id==='leader'?'taylor-wednesday':null;
  state.reached=[];state.companionCare={...obj(state.companionCare),marcus:{}};
  state.companionChoices={...obj(state.companionChoices),snoozedUntil:{}};
  state.read=false;
  // Preserve existing fictional conversation messages, drafts, Bible progress
  // and the versioned Connect storage untouched: this scene is not a purge.
  return Object.freeze({ok:true,id,scene,state,ui});
 }
 function restore(){
  return {ok:true,state:copy(baseline.state),ui:copy(baseline.ui)};
 }
 return Object.freeze({prepare,restore,active:()=>active,setActive:id=>{
  if(id!==null&&!scenarios.some(s=>s.id===id))return false;
  active=id;return true;
 }});
}
return Object.freeze({scenarios,create});
});
