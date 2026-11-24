'use strict';
// Reverse only the exact navigation extraction; previous state and launch hashes remain authoritative.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const prefix="/* Sprint 9B-R7: existing navigation transitions with injected controller effects. */\n(function(root,factory){\n'use strict';\nconst api=factory();\nif(typeof module==='object'&&module.exports)module.exports=api;\nif(root)root.RallyNavigation=api;\n})(typeof window!=='undefined'?window:null,function(){\n'use strict';\n",suffix="return Object.freeze({navigate});\n});\n",wrapper="function navigate(view,pane,reading){\n return window.RallyNavigation.navigate(view,pane,reading,{rallyOne,memberContext,openConnect,closeDialog,s,clearFeedback:()=>{f09Feedback='';},resetIndex:()=>{f09Index=0;},f09Preview,canLead,render,$});\n}\n";
const transforms=[["function navigate(view,pane,reading){","function navigate(view,pane,reading,{rallyOne,memberContext,openConnect,closeDialog,s,clearFeedback,resetIndex,f09Preview,canLead,render,$}){"],["if(view!=='today')f09Feedback='';","if(view!=='today')clearFeedback();"],["if(view==='today'&&f09Preview)f09Index=0;","if(view==='today'&&f09Preview)resetIndex();"]];
function once(s,a,b){assert.equal(s.split(a).length,2,'Unexpected source boundary: '+a);return s.replace(a,b);}
function restoreNavigationSource(){
 const module=read('rally-one-navigation.js');
 assert.ok(module.startsWith(prefix)&&module.endsWith(suffix),'Unexpected navigation wrapper');
 const block=transforms.reduce((s,[a,b])=>once(s,b,a),module.slice(prefix.length,-suffix.length));
 return once(read('rallypoint.js'),wrapper,block);
}
module.exports={restoreNavigationSource};
