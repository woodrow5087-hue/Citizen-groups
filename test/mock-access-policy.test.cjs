'use strict';
const {test}=require('node:test');
const assert=require('node:assert/strict');
const {ACCESS_POLICY_VERSION,RESOURCE_ACTIONS,createMockAccessPolicy}=require('../lib/mock-access-policy.cjs');
const org='citizen_demo',foreign='other_church';
const actor=(id,role,organizationId=org,fixtureVerified=true)=>({id,organizationId,role,fixtureVerified});
const groupMember=(userId,status='active',scopeId='wed',organizationId=org)=>({userId,status,scopeId,organizationId});
const teamMember=(userId,status='active',scopeId='welcome',organizationId=org)=>({userId,status,scopeId,organizationId});
function policy(){
 return createMockAccessPolicy({
   actors:[actor('anna','member'),actor('jess','group-leader'),actor('sam','team-leader'),
     actor('admin','church-admin'),actor('outsider','member',foreign),actor('unverified','member',org,false)],
   groupMemberships:[groupMember('anna'),groupMember('jess'),groupMember('admin'),
     groupMember('unverified'),groupMember('sam','revoked')],
   teamMemberships:[teamMember('sam'),teamMember('admin'),teamMember('anna','revoked')],
   careGrants:[{organizationId:org,groupId:'wed',careTaskId:'care_anna',userId:'jess'}]
 });
}
const resource=(kind,extra={})=>({id:kind+'_1',organizationId:org,kind,...extra});
const allowed=(p,actorId,r,action)=>p.evaluate({actorId,resource:r,action}).allowed;
test('v1 access matrix is explicit and strictly deny-by-default',()=>{
 assert.equal(ACCESS_POLICY_VERSION,1);
 assert.deepEqual(Object.keys(RESOURCE_ACTIONS).sort(),
   ['attendance','care_task','direct_thread','group_thread','prayer_request','serving_shift','team_thread']);
 const p=policy();
 assert.equal(allowed(p,'anna',resource('group_thread',{groupId:'wed'}),'read'),true);
 assert.equal(allowed(p,'anna',resource('group_thread',{groupId:'wed'}),'write'),true);
 assert.equal(allowed(p,'anna',resource('group_thread',{groupId:'wed'}),'react'),true);
 assert.equal(allowed(p,'jess',resource('group_thread',{groupId:'wed'}),'read'),true);
 assert.equal(allowed(p,'sam',resource('team_thread',{teamId:'welcome'}),'write'),true);
 assert.equal(allowed(p,'sam',resource('serving_shift',{teamId:'welcome'}),'respond'),true);
 assert.equal(allowed(p,'sam',resource('serving_shift',{teamId:'welcome'}),'manage'),true);
});
test('unverified actors, absent/revoked membership and cross-org requests are denied',()=>{
 const p=policy(),g=resource('group_thread',{groupId:'wed'});
 for(const who of ['unverified','sam','outsider','missing']){
   assert.equal(allowed(p,who,g,'read'),false,who);
   assert.equal(allowed(p,who,g,'write'),false,who);
 }
 const other=resource('group_thread',{organizationId:foreign,groupId:'wed'});
 assert.equal(allowed(p,'anna',other,'read'),false);
 assert.equal(allowed(p,'anna',resource('group_thread',{groupId:'unknown'}),'read'),false);
 assert.equal(allowed(p,'anna',resource('team_thread',{teamId:'welcome'}),'read'),false);
 assert.equal(allowed(p,'jess',resource('team_thread',{teamId:'welcome'}),'write'),false);
 assert.equal(allowed(p,'anna',g,'delete'),false);
 assert.equal(allowed(p,'anna',resource('unknown',{groupId:'wed'}),'read'),false);
 assert.throws(()=>p.requireAccess({actorId:'sam',resource:g,action:'write'}),/Mock access denied/);
});
test('group and team leader privileges require distinct active scoped membership',()=>{
 const p=policy(),attendance=resource('attendance',{groupId:'wed'}),shift=resource('serving_shift',{teamId:'welcome'});
 assert.equal(allowed(p,'jess',attendance,'read'),true);
 assert.equal(allowed(p,'jess',attendance,'manage'),true);
 assert.equal(allowed(p,'anna',attendance,'manage'),false);
 assert.equal(allowed(p,'sam',attendance,'manage'),false);
 assert.equal(allowed(p,'admin',attendance,'manage'),true,'admin still has explicit group membership');
 assert.equal(allowed(p,'admin',shift,'manage'),true,'admin still has explicit team membership');
 assert.equal(allowed(p,'anna',shift,'respond'),false,'revoked team membership denied');
 assert.equal(allowed(p,'jess',shift,'read'),false,'group leader is not a team member');
});
test('sensitive care cannot be accessed by leader role alone; explicit grant and consent required',()=>{
 const p=policy();
 const care=resource('care_task',{id:'care_anna',groupId:'wed',consentGranted:true});
 assert.equal(allowed(p,'jess',care,'read'),true);
 assert.equal(allowed(p,'jess',care,'manage'),true);
 assert.equal(allowed(p,'admin',care,'read'),false,'admin cannot bypass missing care assignment');
 assert.equal(allowed(p,'anna',care,'read'),false,'no leader role or grant');
 assert.equal(allowed(p,'jess',{...care,consentGranted:false},'read'),false);
 assert.equal(allowed(p,'jess',{...care,id:'other_task'},'read'),false);
 assert.equal(allowed(p,'jess',{...care,minorRelated:true},'read'),false);
 assert.equal(allowed(p,'jess',{...care,groupId:'another'},'read'),false);
});
test('prayer sharing is consent-gated, direct messages denied, minors denied by default',()=>{
 const p=policy(),shared=resource('prayer_request',{groupId:'wed',consentGranted:true,audience:'group'});
 assert.equal(allowed(p,'anna',shared,'read'),true);
 assert.equal(allowed(p,'anna',shared,'write'),true);
 assert.equal(allowed(p,'sam',shared,'read'),false);
 assert.equal(allowed(p,'anna',{...shared,consentGranted:false},'read'),false);
 assert.equal(allowed(p,'anna',{...shared,audience:'staff'},'read'),false);
 assert.equal(allowed(p,'jess',{...shared,minorRelated:true},'read'),false);
 const direct=resource('direct_thread',{groupId:'wed'});
 assert.equal(allowed(p,'jess',direct,'read'),false);
 assert.equal(allowed(p,'anna',direct,'write'),false);
});
test('bad fixture imports fail instead of granting access',()=>{
 const base=[actor('anna','member')];
 assert.throws(()=>createMockAccessPolicy({actors:[...base,...base]}),/duplicate actor/);
 assert.throws(()=>createMockAccessPolicy({actors:base,groupMemberships:[groupMember('unknown')]}),/references missing/);
 assert.throws(()=>createMockAccessPolicy({actors:base,groupMemberships:[groupMember('anna','owner')]}),/status/);
 assert.throws(()=>createMockAccessPolicy({actors:base,groupMemberships:[groupMember('anna'),groupMember('anna')]}),/duplicate group/);
 assert.throws(()=>createMockAccessPolicy({actors:base,careGrants:[{userId:'missing',organizationId:org,groupId:'wed',careTaskId:'care'}]}),/missing/);
});
