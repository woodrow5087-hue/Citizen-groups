/* Shared, read-only group preview for Today and Groups. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationGroupPreview=api;
})(globalThis,function(){
'use strict';
const modes=Object.freeze({
 'group-ready':'ready','group-empty':'empty','group-denied':'denied','group-outage':'outage','group-stale':'stale'
});
const isActive=selection=>Object.hasOwn(modes,selection);
const status=Object.freeze({
 restricted:'This sample group is restricted.',
 unavailable:'The sample group schedule is unavailable. The next gathering is unknown.'
});
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const text=value=>typeof value==='string'&&value.trim().length>0&&value.length<=100;
const dateFormat=new Intl.DateTimeFormat('en-US',{
 weekday:'long',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/Denver',timeZoneName:'short'
});

function project(selection,context,fixtures){
 if(!isActive(selection))return null;
 if(context.permissions.group!==true||context.identity.campus!=='north')return {state:'restricted'};
 const outcome=fixtures?.[modes[selection]];
 if(outcome?.state==='restricted')return {state:'restricted'};
 if(outcome?.state!=='ready'||!text(outcome.name))return {state:'unavailable'};
 if(outcome.nextGathering===null)return {state:'empty',name:outcome.name};

 const gathering=outcome.nextGathering;
 const time=typeof gathering?.startsAt==='string'?Date.parse(gathering.startsAt):NaN;
 if(!text(gathering?.title)||!Number.isFinite(time))return {state:'unavailable'};
 return {state:'ready',name:outcome.name,title:gathering.title,startsAt:gathering.startsAt,date:dateFormat.format(time)};
}

function render(view){
 if(!view)return '';
 const details=view.state==='ready'?
  '<p>'+esc(view.title)+' · <time datetime="'+esc(view.startsAt)+'">'+esc(view.date)+'</time></p>':
  '<p role="status">'+esc(view.state==='empty'?'No upcoming gathering is scheduled.':status[view.state])+'</p>';
 return '<section class="coming route-preview-card" aria-labelledby="group-preview-title" data-group-preview="'+esc(view.state)+
  '"><span class="route-stage-label">PLANNING CENTER · SYNTHETIC</span><h2 id="group-preview-title">'+
  esc(view.name??'Group schedule')+'</h2>'+details+'<p>Read-only sample group schedule.</p></section>';
}
return Object.freeze({isActive,project,render});
});
