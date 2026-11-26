/* Experiment controller: memory-only synthetic fixtures; existing transition owner. */
(function(){
'use strict';
const root=document.getElementById('today'),select=document.getElementById('scenario');
let state,ui,conversation,receipt='';
function reset(id){
 ui={name:'Friend',campus:'north',memberships:{group:!['visitor','team'].includes(id),team:['connected','leader','team'].includes(id)}};
 state={role:id==='leader'?'leader':'member',rsvp:'',teamStatus:'pending',reached:[],prayers:[],rhythm:{},teamMessages:[]};
 conversation=id==='unavailable'?{status:'unavailable'}:{status:'ok',unreadCount:3};
 receipt='';
}
function draw(focus=false){
 const now=new Date(),snapshot=RallyIntelligence.derive({state,ui,conversation,now});
 root.innerHTML=FoundationView.render(FoundationToday.project(snapshot,now),receipt);
 if(focus)root.focus({preventScroll:true});
}
select.addEventListener('change',()=>{reset(select.value);draw();});
root.addEventListener('click',event=>{
 const button=event.target.closest('button[data-command]');if(!button||!root.contains(button))return;
 const command=FoundationToday.commandFor(button.dataset.command,button.dataset.person);if(!command)return;
 const result=RallyMemberContext.transition({state,ui,conversation,command,now:new Date()});
 if(result.ok){state=result.state;receipt=command.type==='group-rsvp'?'Sample RSVP saved for this session.':command.type==='serving-response'?'Sample serving response saved for this session.':'Sample review updated for this session.';}else receipt='No change: '+result.reason+'.';
 draw(true);
});
reset(select.value);draw();
})();