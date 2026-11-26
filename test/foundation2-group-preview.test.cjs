'use strict';

const assert=require('node:assert/strict');
const {test}=require('node:test');
const {createGroupRehearsal,makeGroupPreviewBundle}=require('../scripts/build-group-preview.cjs');
const Group=require('../foundation2/group-preview.js');

const time=Date.parse('2026-11-26T00:45:00Z');
const member={permissions:{group:true},identity:{campus:'north'}};

test('the synthetic consent and scoped reader chain publishes only the minimized group and gathering',async()=>{
 const outcomes=await createGroupRehearsal(time);
 assert.deepEqual(outcomes,{
  ready:{state:'ready',name:'North Campus Group',nextGathering:{title:'Community gathering',startsAt:'2026-11-28T18:00:00.000Z'}},
  empty:{state:'ready',name:'North Campus Group',nextGathering:null},
  denied:{state:'restricted'},
  outage:{state:'unavailable'},
  stale:{state:'unavailable'}
 });
 assert.doesNotMatch(await makeGroupPreviewBundle(time),/sample-person|sample-citizen|sample-north-group|token|checkedAt|Fixture-only/);
});

test('the shared projection distinguishes confirmed empty from unknown and never shows out-of-scope data',async()=>{
 const outcomes=await createGroupRehearsal(time);
 assert.equal(Group.project('group',member,outcomes),null);
 assert.deepEqual(Group.project('group-ready',{...member,permissions:{group:false}},outcomes),{state:'restricted'});
 assert.deepEqual(Group.project('group-ready',{...member,identity:{campus:'maui'}},outcomes),{state:'restricted'});
 assert.deepEqual(Group.project('group-ready',member,undefined),{state:'unavailable'});
 const ready=Group.project('group-ready',member,outcomes);
 assert.match(ready.date,/^Saturday, Nov 28(?:,| at) 11:00 AM MST$/);
 assert.match(Group.render(ready),/North Campus Group.*Community gathering/);
 assert.match(Group.render(Group.project('group-empty',member,outcomes)),/No upcoming gathering is scheduled/);
 for(const mode of ['denied','outage','stale']){
  const markup=Group.render(Group.project('group-'+mode,member,outcomes));
  assert.doesNotMatch(markup,/North Campus Group|Community gathering|<time|No upcoming/);
 }
});

test('group preview rejects bad gathering data and renders safe text',()=>{
 const bad={ready:{state:'ready',name:'Group',nextGathering:{title:'Gathering',startsAt:'not a date'}}};
 assert.deepEqual(Group.project('group-ready',member,bad),{state:'unavailable'});
 bad.ready.nextGathering={title:'<script>escape</script>',startsAt:'2026-11-28T18:00:00.000Z'};
 assert.match(Group.render(Group.project('group-ready',member,bad)),/&lt;script&gt;escape&lt;\/script&gt;/);
});
