/* Explicit local actions over the existing primary fields. No new data owner,
 * membership grants, inferred attendance, outreach or engagement scoring. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.FoundationRelationalDomain=api;})(typeof window!=='undefined'?window:null,()=>{
const contacts=Object.freeze([{id:'anna',name:'Anna L.',photo:'anna',premium:'Anna'},{id:'jess',name:'Jess W.',photo:'jess',premium:'Jess'},{id:'marcus',name:'Marcus C.',photo:'marcus'},{id:'taylor',name:'Taylor D.',photo:'taylor'}]);
function change({state,session,command,now=new Date()}){
 const p=session.snapshot.context.permissions,c=command,s=state,deny=reason=>({ok:false,reason,state});let next;
 if(c.type==='interest'){
  if(!['0','1','2'].includes(c.id)||!Array.isArray(s.interest))return deny('Unknown discovery option');
  next={...s,interest:s.interest.includes(c.id)?s.interest.filter(x=>x!==c.id):[...s.interest,c.id]};
 }else if(c.type==='attendance'){
  if(!p.groupLeader||!contacts.some(x=>x.id===c.id)||!['here','excused','unknown'].includes(c.value))return deny('Attendance action not permitted');
  if(!s.attendance||Object.values(s.attendance).some(v=>!['here','excused','unknown'].includes(v)))return deny('Saved attendance needs review');
  next={...s,attendance:{...s.attendance,[c.id]:c.value}};
 }else if(c.type==='prayer-post'){
  if(!p.group||typeof c.text!=='string'||!c.text.trim()||c.text.length>700||!Array.isArray(s.prayers))return deny('Prayer action not permitted');
  next={...s,prayers:[...s.prayers,{name:'You',time:'Just now',text:c.text.trim()}]};
 }else if(c.type==='care-pause'){
  const care=session.snapshot.care;if(!p.group||!care||care.paused||care.completed)return deny('Care action unavailable');
  next={...s,companionCare:{...s.companionCare,marcus:{...s.companionCare?.marcus,snoozedUntil:new Date(now.getTime()+86400000).toISOString()}}};
 }else return deny('Unknown action');
 return {ok:true,state:next,reason:'Saved locally; no outreach or membership changes'};
}
return Object.freeze({contacts,change});});
