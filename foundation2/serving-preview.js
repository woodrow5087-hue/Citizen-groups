/* One read-only serving preview projection shared by Today and Team. */
(function(root,factory){
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 else root.FoundationServing=api;
})(globalThis,function(){
'use strict';
const modes=Object.freeze({
 'serving-ready':'ready','serving-denied':'denied','serving-outage':'outage','serving-stale':'stale'
});
const isActive=selection=>Object.hasOwn(modes,selection);
const localScenario=selection=>isActive(selection)?'team':selection;
const messages=Object.freeze({
 restricted:'This volunteer’s sample schedule is restricted.',
 unavailable:'The sample schedule is unavailable. Your next shift is unknown.',
 stale:'The sample schedule is out of date. Your next shift is unknown.'
});
const esc=value=>String(value).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const dateFormat=new Intl.DateTimeFormat('en-US',{
 weekday:'long',month:'short',day:'numeric',hour:'numeric',minute:'2-digit',timeZone:'America/Denver',timeZoneName:'short'
});

function project(selection,context,fixtures){
 if(!isActive(selection))return null;
 if(context.permissions.team!==true||context.identity.campus!=='north')return {state:'restricted'};

 const outcome=fixtures?.[modes[selection]];
 if(outcome&&Object.hasOwn(messages,outcome.state))return {state:outcome.state};
 const assignment=outcome?.assignment;
 const time=Date.parse(assignment?.startsAt);
 if(outcome?.state!=='ready'||assignment?.campus!==context.identity.campus||
    typeof assignment.title!=='string'||!assignment.title.trim()||!Number.isFinite(time))return {state:'unavailable'};

 return {
  state:'ready',title:assignment.title,campus:'North Campus',startsAt:assignment.startsAt,date:dateFormat.format(time)
 };
}

function render(preview){
 if(!preview)return '';
 const assignment=preview.state==='ready'?
  '<h2 id="serving-preview-title">'+esc(preview.title)+'</h2><p><time datetime="'+esc(preview.startsAt)+'">'+
  esc(preview.date)+'</time> · '+esc(preview.campus)+'</p><p>Read-only sample assignment.</p>':
  '<h2 id="serving-preview-title">Serving schedule</h2><p role="status">'+esc(messages[preview.state])+'</p>';
 return '<section class="coming route-preview-card" aria-labelledby="serving-preview-title" data-serving-preview="'+
  esc(preview.state)+'"><span class="route-stage-label">PLANNING CENTER · SYNTHETIC</span>'+assignment+'</section>';
}

return Object.freeze({isActive,localScenario,project,render});
});
