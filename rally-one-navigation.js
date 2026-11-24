/* Sprint 9B-R7: existing navigation transitions with injected controller effects. */
(function(root,factory){
'use strict';
const api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.RallyNavigation=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
function navigate(view,pane,reading,{rallyOne,memberContext,openConnect,closeDialog,s,clearFeedback,resetIndex,f09Preview,canLead,render,$}){
 if(rallyOne && view==='group' && pane==='chat' && memberContext()?.permissions.group===true){
   openConnect('thread');return;
 }
closeDialog(false);
s.view=view;
if(view!=='today')clearFeedback();
if(view==='today'&&f09Preview)resetIndex();
if(view==='group'){
s.discover=false;
if(rallyOne)s.groupPane=pane||'overview';
else if(pane)s.groupPane=pane;
if(pane==='leader'&&!canLead('group'))s.groupPane=rallyOne?'overview':'chat';
}
if(view==='team'&&pane)s.teamPane=pane;
render();$('view').scrollTop=0;
const focus=reading?$('reading-'+reading):$('view').querySelector('h1');
if(focus){if(reading){for(let parent=focus.parentElement;parent;parent=parent.parentElement){if(parent.tagName==='DETAILS')parent.open=true;}}focus.tabIndex=-1;focus.focus({preventScroll:true});if(reading)focus.scrollIntoView?.({block:'start',behavior:'auto'});}
}
return Object.freeze({navigate});
});
