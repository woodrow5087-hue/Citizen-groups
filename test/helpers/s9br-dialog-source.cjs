'use strict';
// Restore exact pre-R8 controller bytes and retain the previous frozen hash chain.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const prefix="/* Sprint 9B-R8: dialog lifecycle effects; state and content remain controller-owned. */\n(function(root,factory){\n'use strict';\nconst api=factory();\nif(typeof module==='object'&&module.exports)module.exports=api;\nif(root)root.RallyDialogLifecycle=api;\n})(typeof window!=='undefined'?window:null,function(){\n'use strict';\n",suffix="return Object.freeze({closeDialog,showDialog,focusAfterRender,handleKey});\n});\n";
const focusPrefix="function focusAfterRender(wasConversation,{$,document}){\n",keyPrefix="function handleKey(ev,{dialog,closeDialog,$,document}){\n",fnSuffix="}\n";
const wrappers=["function closeDialog(restore=true){\n return window.RallyDialogLifecycle.closeDialog(restore,{dialog,dialogTrigger,f10ClearSession,clearDialog:()=>{dialog=null;},$,document});\n}\n","function showDialog(type,trigger=document.activeElement){\n return window.RallyDialogLifecycle.showDialog(type,trigger,{setTrigger:value=>{dialogTrigger=value;},setDialog:value=>{dialog=value;},renderDialog});\n}\n","window.RallyDialogLifecycle.focusAfterRender(wasConversation,{$,document});\n","window.RallyDialogLifecycle.handleKey(ev,{dialog,closeDialog,$,document});\n"],transforms=[[["function closeDialog(restore=true){","function closeDialog(restore,{dialog,dialogTrigger,f10ClearSession,clearDialog,$,document}){"],["dialog=null;","clearDialog();"]],[["function showDialog(type,trigger=document.activeElement){","function showDialog(type,trigger,{setTrigger,setDialog,renderDialog}){"],["dialogTrigger=trigger;dialog=type;","setTrigger(trigger);setDialog(type);"]],[],[]];
function once(s,a,b){assert.equal(s.split(a).length,2,'Unexpected boundary: '+a);return s.replace(a,b);}
function restoreDialogSource(){
 const module=read('rally-one-dialog-lifecycle.js');
 assert.ok(module.startsWith(prefix)&&module.endsWith(suffix));
 const body=module.slice(prefix.length,-suffix.length);
 const show=body.indexOf('function showDialog('),focus=body.indexOf(focusPrefix),key=body.indexOf(keyPrefix);
 assert.ok(show>0&&focus>show&&key>focus);
 assert.equal(body.slice(key-fnSuffix.length,key),fnSuffix);
 assert.ok(body.endsWith(fnSuffix));
 const blocks=[body.slice(0,show),body.slice(show,focus),body.slice(focus+focusPrefix.length,key-fnSuffix.length),body.slice(key+keyPrefix.length,-fnSuffix.length)];
 return blocks.reduce((s,block,i)=>once(s,wrappers[i],transforms[i].reduce((b,[a,c])=>once(b,c,a),block)),require('./s9br-memory-actions-source.cjs').restoreMemoryActionsSource());
}
module.exports={restoreDialogSource};
