'use strict';
const assert=require('node:assert/strict');
const changes=require('./ux03-changes.json');
module.exports=function restoreConnect(name,source){
 assert.ok(Object.hasOwn(changes,name),'Unrecognized Connect source');
 for(const [from,to] of changes[name]){
  assert.equal(source.split(from).length,2,'Exact UX03 boundary changed');
  source=source.replace(from,to);
 }
 return source;
};
