'use strict';
// Reconstruct the prior accepted controller exactly, so existing hash locks remain unchanged.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');
const prefix="/* Sprint 9B-R6: existing demo-state initialization; no persistent writes. */\n(function(root,factory){\n'use strict';\nconst api=factory();\nif(typeof module==='object'&&module.exports)module.exports=api;\nif(root)root.RallyAppState=api;\n})(typeof window!=='undefined'?window:null,function(){\n'use strict';\nfunction initialize(readRaw,rallyOne){\n";
const suffix="return s;\n}\nreturn Object.freeze({initialize});\n});\n";
const call="let s=window.RallyAppState.initialize(()=>localStorage.getItem(key),rallyOne);\n";
function once(source,find,replacement){
 assert.equal(source.split(find).length,2,'Expected exactly one source boundary: '+find);
 return source.replace(find,replacement);
}
function restoreStateSource(){
 const extracted=read('rally-one-app-state.js');
 assert.ok(extracted.startsWith(prefix)&&extracted.endsWith(suffix),'Unexpected module wrapper');
 const block=once(extracted.slice(prefix.length,-suffix.length),'readRaw()','localStorage.getItem(key)');
 return once(read('rallypoint.js'),call,block);
}
module.exports={restoreStateSource};
