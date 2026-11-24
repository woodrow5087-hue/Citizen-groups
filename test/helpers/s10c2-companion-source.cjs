'use strict';
// Reverse only the authorized recommendation-copy and count-consumer changes.
// Keep the historical exact source hash for every unrelated byte.
const fs=require('node:fs'),assert=require('node:assert/strict');
const transforms=[["  if(b.taskCount>0)intro+=' You also have '+b.taskCount+' sample '+(b.taskCount===1?'item':'items')+' needing attention.';","  // Week retains the broader commitment overview; next uses the focused Today count.\n  const weeklyTaskCount=b.weeklyTaskCount??b.taskCount;\n  if(weeklyTaskCount>0)intro+=' You also have '+weeklyTaskCount+' sample '+(weeklyTaskCount===1?'item':'items')+' needing attention.';"],["  intro=b.taskCount>0?\n    'These are response-needed items from your existing fictional profile—not a measure of participation or spiritual health.':\n    'Nothing in your sample commitments needs a response right now. There’s no streak or pressure to create more tasks.';","  const includesCare=required.some(r=>['care-prayer','care-check-in'].includes(r.id));\n  intro=includesCare?\n    'These are the same current priorities shown on Today. Prayer and personal check-ins are optional; nothing is sent automatically.':b.taskCount>0?\n    'These are response-needed items from your existing fictional profile—not a measure of participation or spiritual health.':\n    'Nothing in your sample commitments needs a response right now. There’s no streak or pressure to create more tasks.';"]];
function restoreCompanionSource(){
 return transforms.reduce((s,[before,after])=>{
  assert.equal(s.split(after).length,2,'Unexpected companion source boundary');
  return s.replace(after,before);
 },fs.readFileSync(require.resolve('../../rallypoint-personal-companion.js'),'utf8'));
}
module.exports={restoreCompanionSource};
