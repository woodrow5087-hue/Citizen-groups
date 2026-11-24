/* Sprint 9B-R8: dialog lifecycle effects; state and content remain controller-owned. */
(function(root,factory){
'use strict';
const api=factory();
if(typeof module==='object'&&module.exports)module.exports=api;
if(root)root.RallyDialogLifecycle=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
function closeDialog(restore,{dialog,dialogTrigger,f10ClearSession,clearDialog,$,document}){
if(!dialog)return;if(dialog==='f10-companion')f10ClearSession();clearDialog();$('dialog-root').innerHTML='';document.querySelector('.phone-inner').inert=false;
if(restore){if(dialogTrigger?.isConnected)dialogTrigger.focus({preventScroll:true});else $('view').focus({preventScroll:true});}
}
function showDialog(type,trigger,{setTrigger,setDialog,renderDialog}){setTrigger(trigger);setDialog(type);renderDialog();}
function focusAfterRender(wasConversation,{$,document}){
document.querySelector('.phone-inner').inert=true;
if(wasConversation){
 const heading=$('dialog-root').querySelector('.f10-response h3');
 if(heading){heading.tabIndex=-1;heading.focus({preventScroll:true});heading.scrollIntoView?.({block:'nearest',behavior:'auto'});}
}else $('dialog-root').querySelector('[data-action="close-dialog"]').focus({preventScroll:true});
}
function handleKey(ev,{dialog,closeDialog,$,document}){
if(!dialog)return;if(ev.key==='Escape'){ev.preventDefault();closeDialog();return;}
if(ev.key==='Tab'){const nodes=[...$('dialog-root').querySelectorAll('button:not(:disabled),a[href],input,select,textarea')],first=nodes[0],last=nodes[nodes.length-1];if(ev.shiftKey&&document.activeElement===first){ev.preventDefault();last?.focus();}else if(!ev.shiftKey&&document.activeElement===last){ev.preventDefault();first?.focus();}}
}
return Object.freeze({closeDialog,showDialog,focusAfterRender,handleKey});
});
