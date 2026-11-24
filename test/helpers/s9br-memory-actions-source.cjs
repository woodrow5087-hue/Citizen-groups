'use strict';
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),read=name=>fs.readFileSync(path.join(root,name),'utf8');
const prefix="/* Sprint 9B-R9: classic Scripture memory action handlers; no independent state. */\n(function(root,factory){\n'use strict';\nconst api=factory();\nif(typeof module==='object'&&module.exports)module.exports=api;\nif(root)root.RallyMemoryActions=api;\n})(typeof window!=='undefined'?window:null,function(){\n'use strict';\nconst actions=Object.freeze(['memory-mode','memory-challenge','memory-slot','memory-pick','memory-check','memory-hint','memory-reset','memory-next-player','memory-new-duel']);\nfunction handles(action){return actions.includes(action);}\nfunction run(a,v,{s,M,render,notify}){\n",suffix="}\nreturn Object.freeze({handles,run});\n});\n",wrapper="if(window.RallyMemoryActions.handles(a)){\n window.RallyMemoryActions.run(a,v,{s,M,render,notify});return;\n}\n";
function restoreMemoryActionsSource(){
 const module=read('rally-one-memory-actions.js'),app=read('rallypoint.js');
 assert.ok(module.startsWith(prefix)&&module.endsWith(suffix));
 assert.equal(app.split(wrapper).length,2);
 return app.replace(wrapper,module.slice(prefix.length,-suffix.length));
}
module.exports={restoreMemoryActionsSource};
