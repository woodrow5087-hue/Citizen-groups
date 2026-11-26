'use strict';
const test=require('node:test'),assert=require('node:assert/strict');
const Board=require('../rallypoint-priority-board.js'),Focus=require('../rally-one-unified-focus.js');
const now=new Date('2026-11-25T12:00:00Z');
const model={member:true,team:true,audience:'connected',rsvp:'',serveStatus:'pending',conversationStatus:'ok',unread:3,groupDate:new Date('2026-11-25T18:30:00Z'),serveDate:new Date('2026-11-29T09:00:00Z')};
function derive(d){return Focus.focus({board:Board.derive(d,now),model:d,now});}
test('Pending commitment outranks ordinary unread activity even outside immediate time window',()=>{
 const a=derive(model);assert.equal(a.hero.id,'group-rsvp');assert.deepEqual(a.responsibilityIds,['group-rsvp','serve-response']);
 const b=derive({...model,rsvp:'going'});assert.equal(b.hero.id,'serve-response');assert.deepEqual(b.responsibilityIds,['serve-response']);
 const c=derive({...model,rsvp:'going',serveStatus:'confirmed'});assert.equal(c.hero.id,'group-unread');assert.deepEqual(c.responsibilityIds,[]);
});
test('No fabricated responsibility for visitor',()=>{assert.deepEqual(derive({...model,member:false,team:false}).responsibilityIds,[]);});
