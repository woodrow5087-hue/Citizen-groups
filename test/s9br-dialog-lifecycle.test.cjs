'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const D=require('../rally-one-dialog-lifecycle.js');
const {restoreDialogSource}=require('./helpers/s9br-dialog-source.cjs');
const root=path.resolve(__dirname,'..'),prior=restoreDialogSource();
const oldClose=prior.slice(prior.indexOf('function closeDialog(restore=true){'),prior.indexOf('function renderDialog(){'));
const oldFocus=prior.slice(prior.indexOf("document.querySelector('.phone-inner').inert=true;"),prior.indexOf('\n}\nfunction f10Ask'));
const oldKey=prior.slice(prior.indexOf("if(!dialog)return;if(ev.key==='Escape')"),prior.indexOf('\n});',prior.indexOf("if(!dialog)return;if(ev.key==='Escape')")));
test('dialog extraction reconstructs the exact accepted controller',()=>{
 const b=Buffer.from(prior);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),'1fbde8f6eb6bfc95f1944c7aa330c3cab07db8a6');
});
function execute(variant,op,o={}){
 const log=[];
 const node=id=>({isConnected:true,tabIndex:0,focus:x=>log.push(['focus',id,x]),scrollIntoView:x=>log.push(['scroll',id,x])});
 const trigger=node('trigger'),view=node('view'),heading=node('heading'),close=node('close'),first=node('first'),last=node('last');
 trigger.isConnected=o.connected!==false;
 const nodes=o.empty?[]:[first,last];
 const main={set inert(x){log.push(['inert',x]);}};
 const dialogRoot={set innerHTML(x){log.push(['html',x]);},querySelector:s=>s==='.f10-response h3'?(o.noHeading?null:heading):close,querySelectorAll:()=>nodes};
 const document={activeElement:o.active==='last'?last:o.active==='first'?first:trigger,querySelector:()=>main};
 const ctx={dialog:o.dialog===undefined?'f10-companion':o.dialog,dialogTrigger:o.noTrigger?null:trigger,document,$:s=>s==='view'?view:dialogRoot,
 f10ClearSession:()=>log.push('clearSession'),renderDialog:()=>log.push('render'),
 wasConversation:!!o.conversation,ev:{key:o.key,shiftKey:!!o.shift,preventDefault:()=>log.push('prevent')},
 closeDialog:()=>log.push('closeDialog'),restore:o.restore,type:'notifications'};
 if(variant==='legacy'){
  if(op==='close'||op==='show')vm.runInNewContext(oldClose+(op==='close'?'\ncloseDialog(restore);':'\nshowDialog(type);'),ctx);
  else if(op==='focus')vm.runInNewContext(oldFocus,ctx);
  else vm.runInNewContext('(function(){'+oldKey+'})();',ctx);
 }else{
  if(op==='close')D.closeDialog(o.restore===undefined?true:o.restore,{...ctx,clearDialog:()=>{ctx.dialog=null;}});
  else if(op==='show')D.showDialog(ctx.type,document.activeElement,{setTrigger:v=>{ctx.dialogTrigger=v;},setDialog:v=>{ctx.dialog=v;},renderDialog:ctx.renderDialog});
  else if(op==='focus')D.focusAfterRender(ctx.wasConversation,ctx);
  else D.handleKey(ctx.ev,ctx);
 }
 return JSON.stringify({log,dialog:ctx.dialog,trigger:ctx.dialogTrigger===trigger?'trigger':ctx.dialogTrigger===null?null:'other',headingTab:heading.tabIndex});
}
const cases=[
 ['close Ask Rally and restore trigger','close',{}],['close non-companion','close',{dialog:'notifications'}],['close without restoring focus','close',{restore:false}],['close missing trigger','close',{noTrigger:true}],['close disconnected trigger','close',{connected:false}],['no dialog','close',{dialog:null}],
 ['open with active element','show',{}],['initial close-button focus','focus',{}],['conversation heading focus','focus',{conversation:true}],['missing conversation heading','focus',{conversation:true,noHeading:true}],
 ['Escape closes','key',{key:'Escape'}],['Escape with no dialog','key',{key:'Escape',dialog:null}],['Tab wraps last to first','key',{key:'Tab',active:'last'}],['Shift Tab wraps first to last','key',{key:'Tab',active:'first',shift:true}],['ordinary Tab','key',{key:'Tab'}],['empty focusables','key',{key:'Tab',empty:true}],['other key','key',{key:'Enter'}]
];
for(const [name,op,o] of cases)test('dialog parity: '+name,()=>assert.equal(execute('new',op,o),execute('legacy',op,o)));
test('companion cleanup precedes clearing markup and restoring focus',()=>{
 const r=JSON.parse(execute('new','close'));
 assert.deepEqual(r.log,['clearSession',['html',''],['inert',false],['focus','trigger',{preventScroll:true}]]);assert.equal(r.dialog,null);
});
test('dialog dependency is loaded before controller and included in build',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 assert.ok(html.includes('src="rally-one-dialog-lifecycle.js"'));assert.ok(html.indexOf('rally-one-dialog-lifecycle.js')<html.indexOf('src="rallypoint.js"'));assert.ok(build.includes("'rally-one-dialog-lifecycle.js'"));
});
