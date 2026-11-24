'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto');
const {navigate}=require('../rally-one-navigation.js');
const {restoreNavigationSource}=require('./helpers/s9br-navigation-source.cjs');
const root=path.resolve(__dirname,'..'),prior=restoreNavigationSource();
const start=prior.indexOf('function navigate(view,pane,reading){'),end=prior.indexOf('function closeDialog(restore=true){',start);
const legacy=prior.slice(start,end);
test('navigation extraction reconstructs exact accepted controller',()=>{
 const b=Buffer.from(prior);assert.equal(crypto.createHash('sha1').update('blob '+b.length+'\0').update(b).digest('hex'),'2296b28aa031e7681dc448c578a854c25ea60e56');
});
function execute(variant,args,options){
 const log=[],s={view:'today',discover:true,groupPane:'gather',teamPane:'chat'},flags={f09Feedback:'saved',f09Index:4};
 const target={tabIndex:0,focus:o=>log.push(['focus',o]),scrollIntoView:o=>log.push(['scrollIntoView',o])};
 const main={set scrollTop(v){log.push(['scrollTop',v]);},querySelector(sel){log.push(['querySelector',sel]);return options.missing?null:target;}};
 const ctx={s,rallyOne:options.rallyOne,f09Preview:options.f09Preview,
 memberContext:()=>{log.push('memberContext');return options.context===false?null:{permissions:{group:options.group}};},
 openConnect:x=>log.push(['connect',x]),closeDialog:x=>log.push(['closeDialog',x]),
 canLead:x=>{log.push(['canLead',x]);return options.leader;},render:()=>log.push(['render',s.view,s.groupPane,s.teamPane]),
 $:x=>{log.push(['get',x]);return x==='view'?main:options.missing?null:target;}};
 if(variant==='legacy'){
  Object.assign(ctx,flags);vm.runInNewContext(legacy+'\nnavigate(...args);',Object.assign(ctx,{args}));
  flags.f09Feedback=ctx.f09Feedback;flags.f09Index=ctx.f09Index;
 }else navigate(...args,{...ctx,clearFeedback:()=>{flags.f09Feedback='';},resetIndex:()=>{flags.f09Index=0;}});
 return JSON.stringify({s,flags,log,tabIndex:target.tabIndex});
}
const cases=[
 ['Rally One group chat redirect',['group','chat'],{rallyOne:true,group:true}],
 ['Rally One group chat without permission',['group','chat'],{rallyOne:true,group:false}],
 ['Rally One group chat with absent context',['group','chat'],{rallyOne:true,context:false}],
 ['Rally One group default',['group'],{rallyOne:true}],
 ['Legacy group default preserves pane',['group'],{rallyOne:false}],
 ['Rally One unauthorized leader',['group','leader'],{rallyOne:true,leader:false}],
 ['Legacy unauthorized leader',['group','leader'],{rallyOne:false,leader:false}],
 ['Authorized leader',['group','leader'],{rallyOne:true,leader:true}],
 ['Team pane',['team','schedule'],{rallyOne:true}],
 ['Today preview resets index',['today'],{rallyOne:true,f09Preview:true}],
 ['Today non-preview preserves index',['today'],{rallyOne:false,f09Preview:false}],
 ['Read heading',['read'],{rallyOne:true}],
 ['Read section focus and scroll',['read',null,'scripture'],{rallyOne:true}],
 ['Missing focus target',['read',null,'scripture'],{rallyOne:true,missing:true}]
];
for(const [name,args,options] of cases)test('navigation parity: '+name,()=>assert.equal(execute('new',args,options),execute('legacy',args,options)));
test('authorized group chat redirect performs no ordinary navigation or focus effects',()=>{
 const out=JSON.parse(execute('new',['group','chat'],{rallyOne:true,group:true}));
 assert.deepEqual(out.log,['memberContext',['connect','thread']]);assert.equal(out.s.view,'today');assert.equal(out.flags.f09Feedback,'saved');
});
test('Read section focus happens only after rendering and scroll reset',()=>{
 const out=JSON.parse(execute('new',['read',null,'scripture'],{rallyOne:true}));
 assert.deepEqual(out.log,[['closeDialog',false],['render','read','gather','chat'],['get','view'],['scrollTop',0],['get','reading-scripture'],['focus',{preventScroll:true}],['scrollIntoView',{block:'start',behavior:'auto'}]]);assert.equal(out.tabIndex,-1);
});
test('navigation module ships before controller in browser and build',()=>{
 const html=fs.readFileSync(path.join(root,'index.html'),'utf8'),build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
 assert.ok(html.includes('src="rally-one-navigation.js"'));assert.ok(html.indexOf('rally-one-navigation.js')<html.indexOf('src="rallypoint.js"'));assert.ok(build.includes("'rally-one-navigation.js'"));
});
