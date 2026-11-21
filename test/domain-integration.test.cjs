'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const {emptyConversationSnapshot} = require('../lib/conversation-contracts.cjs');
const {blankActionSnapshot} = require('../lib/action-contracts.cjs');
const {createMockConversationRepository} = require('../lib/mock-conversation-repository.cjs');
const {DOMAIN_VERSION, blankDomainBundle, assertDomainBundle, composeDomainBundle} =
  require('../lib/domain-bundle.cjs');
const {
  REVIEW_VERSION, REHEARSAL_KEY, prepareMigrationReview, validateMigrationReview,
  verifyUnchangedSource, rehearseRollback, recoverOriginalStrings
} = require('../lib/migration-rehearsal.cjs');
const {PRIMARY_KEY, TODAY_UI_KEY} = require('../lib/legacy-fixture-migration.cjs');

const time = '2026-11-21T19:00:00.000Z';
function fixture() {
  const c=emptyConversationSnapshot();
  c.users.push(
    {id:'anna',organizationId:'citizen',displayName:'Anna L.'},
    {id:'jess',organizationId:'citizen',displayName:'Jess W.'},
    {id:'outsider',organizationId:'other',displayName:'External member'}
  );
  c.conversations.push({
    id:'wed',organizationId:'citizen',kind:'group',title:'Wednesday Group',createdAt:time
  });
  c.memberships.push({
    id:'membership_jess',conversationId:'wed',userId:'jess',role:'leader',status:'active'
  });
  const a=blankActionSnapshot();
  a.sourceReferences.push({id:'fixture1',organizationId:'citizen',system:'fixture',
    resourceType:'serving-shift',externalId:null,observedAt:null});
  a.servingShifts.push({id:'shift',organizationId:'citizen',teamId:'welcome',title:'Welcome Team',
    startsAt:time,status:'scheduled',sourceRefId:'fixture1'});
  a.gatherings.push({id:'gather',organizationId:'citizen',groupId:'wed',title:'Wednesday gathering',
    startsAt:time,status:'scheduled',sourceRefId:null});
  a.shiftResponses.push({id:'shift_response',shiftId:'shift',userId:'anna',response:'confirmed',
    recordedAt:time,sourceRefId:null});
  a.coverageRequests.push({id:'coverage',shiftId:'shift',requestedByUserId:'anna',
    status:'requested',requestedAt:time,sourceRefId:null});
  a.activityEvents.push({id:'read',organizationId:'citizen',userId:'anna',
    kind:'read',occurredAt:time,sourceRefId:null});
  a.careTasks.push({id:'care',organizationId:'citizen',subjectUserId:'anna',
    assignedToUserId:'jess',status:'review',provenance:'fictional-scenario',
    sourceRefId:null,reviewedAt:null});
  a.companionActions.push({id:'act_chat',organizationId:'citizen',kind:'conversation',
    targetType:'conversation',targetId:'wed',state:'available',sourceRefId:null});
  a.companionActions.push({id:'act_care',organizationId:'citizen',kind:'care',
    targetType:'careTask',targetId:'care',state:'available',sourceRefId:null});
  return {conversations:c,actions:a};
}
function rawLegacy() {
  const primary={groupMessages:[
    {name:'Jess W.',time:'Yesterday',text:'Which part of John 15 stood out?'},
    {name:'Anna L.',time:'Today',text:'Looking forward to Wednesday.'}
  ], teamMessages:[],directMessages:{anna:[{name:'You',time:'Just now',text:'Thanks!'}]},
  prayers:[],teamStatus:'confirmed',rsvp:'going',coverage:true,read:true,prayed:true,
  memoryGames:{'sermon:solo':{slots:[null,1,2,null,null],solved:false}},plan:'sermon',
  rhythm:{text:'Encourage someone tomorrow'},someNewSetting:{nested:1}};
  const today={name:'Jonathan',memberships:{group:true,team:true},seenGroupSignature:'old_signature'};
  return {primaryRaw:JSON.stringify(primary),todayRaw:JSON.stringify(today)};
}
test('v1 composed bundle validates both reviews and copies its sources',()=>{
  const parts=fixture(), snapshotBefore=structuredClone(parts);
  const domain=composeDomainBundle(parts);
  assert.equal(DOMAIN_VERSION,1);
  assert.equal(domain.domainVersion,1);
  assert.equal(assertDomainBundle(domain),domain);
  const local=createMockConversationRepository({seed:domain.conversations,clock:()=>time});
  assert.deepEqual(local.listConversationsForUser('jess').map(c=>c.id),['wed']);
  domain.actions.servingShifts[0].title='Changed';
  domain.conversations.users[0].displayName='Changed';
  assert.deepEqual(parts,snapshotBefore,'caller retains full original reference graph');
  assert.deepEqual(blankDomainBundle().conversations,emptyConversationSnapshot());
  assert.deepEqual(blankDomainBundle().actions,blankActionSnapshot());
});
test('composition fails for invalid domain versions, nonexistent users, and cross-org operations',()=>{
  const f=fixture();
  let value=composeDomainBundle(f);value.domainVersion=3;
  assert.throws(()=>assertDomainBundle(value),/unsupported domainVersion/);
  value=composeDomainBundle(f);value.actions.shiftResponses[0].userId='missing';
  assert.throws(()=>assertDomainBundle(value),/missing user/);
  value=composeDomainBundle(f);value.actions.coverageRequests[0].requestedByUserId='outsider';
  assert.throws(()=>assertDomainBundle(value),/organization boundary violation/);
  value=composeDomainBundle(f);value.actions.activityEvents[0].userId='outsider';
  assert.throws(()=>assertDomainBundle(value),/organization boundary violation/);
  value=composeDomainBundle(f);value.actions.careTasks[0].assignedToUserId='outsider';
  assert.throws(()=>assertDomainBundle(value),/organization boundary violation/);
});
test('companion conversation cross-references cannot point to missing or foreign conversations',()=>{
  let value=composeDomainBundle(fixture());
  value.actions.companionActions[0].targetId='unknown';
  assert.throws(()=>assertDomainBundle(value),/missing conversation/);
  value=composeDomainBundle(fixture());
  value.conversations.conversations[0].organizationId='other';
  // The existing membership becomes invalid before the companion boundary.
  assert.throws(()=>assertDomainBundle(value),/membership must remain within one organization/);
  value=composeDomainBundle(fixture());
  value.conversations.users.push({id:'outsider2',organizationId:'other',displayName:'Other'});
  value.conversations.conversations.push({id:'foreign',organizationId:'other',kind:'group',
    title:'Other Group',createdAt:time});
  value.conversations.memberships.push({id:'othermember',conversationId:'foreign',
    userId:'outsider2',role:'member',status:'active'});
  value.actions.companionActions[0].targetId='foreign';
  assert.throws(()=>assertDomainBundle(value),/target crosses organization boundary/);
});
test('review envelope quarantines legacy messages and preserves exact unknown dates and saved progress',()=>{
  const input=rawLegacy(),original=structuredClone(input);
  const review=prepareMigrationReview(input);
  assert.equal(REVIEW_VERSION,1);
  assert.equal(review.status,'ready');
  assert.equal(review.promotedLegacyRows,0);
  assert.equal(review.unknownDatesRemapped,0);
  assert.equal(review.verifiedIdentitiesInvented,0);
  assert.equal(review.actualWrites,0);
  assert.equal(review.requiresSeparateApproval,true);
  assert.deepEqual(review.blankNewDomain,blankDomainBundle());
  assert.equal(review.quarantine.messages.length,3);
  assert.ok(review.quarantine.messages.every(x=>x.occurredAt===null && x.authorId===null));
  assert.deepEqual(review.quarantine.legacyUi.convertedReadCursors,[]);
  assert.equal(validateMigrationReview(review),review);
  assert.deepEqual(recoverOriginalStrings(review),{
    [PRIMARY_KEY]: input.primaryRaw,
    [TODAY_UI_KEY]: input.todayRaw
  });
  assert.equal(JSON.parse(review.originalRaw[PRIMARY_KEY]).memoryGames['sermon:solo'].slots[1],1);
  assert.equal(JSON.parse(review.originalRaw[PRIMARY_KEY]).someNewSetting.nested,1);
  assert.deepEqual(input,original,'no caller mutations');
  assert.equal(verifyUnchangedSource(review,input),true);
  assert.deepEqual(prepareMigrationReview(input),review,'deterministic no IO');
});
test('fingerprint and staging tampering fail closed; data changes invalidate a review',()=>{
  const input=rawLegacy(), review=prepareMigrationReview(input);
  assert.equal(verifyUnchangedSource(review,{primaryRaw:input.primaryRaw+' ',todayRaw:input.todayRaw}),false);
  assert.equal(verifyUnchangedSource(review,{primaryRaw:input.primaryRaw,todayRaw:null}),false);
  let edited=structuredClone(review);edited.originalRaw[PRIMARY_KEY]+=' ';
  assert.throws(()=>validateMigrationReview(edited),/fingerprint mismatch/);
  edited=structuredClone(review);edited.quarantine.messages[0].body='Rewritten';
  assert.throws(()=>validateMigrationReview(edited),/staging does not match/);
  edited=structuredClone(review);edited.blankNewDomain.conversations.users.push({
    id:'fabricated',organizationId:'citizen',displayName:'Fake'
  });
  assert.throws(()=>validateMigrationReview(edited),/new-domain payload/);
  edited=structuredClone(review);edited.promotedLegacyRows=3;
  assert.throws(()=>validateMigrationReview(edited),/unsafe promotion/);
});
test('in-memory rehearsal retains both source strings and supports fault-injected rollback',()=>{
  const input=rawLegacy(),review=prepareMigrationReview(input);
  const initial=structuredClone(input);
  const successful=rehearseRollback(review);
  assert.equal(successful.status,'simulated-only');
  assert.equal(successful.originalUnchanged,true);
  assert.equal(successful.reviewKeyPresent,true);
  const serialized=JSON.parse(successful.entries[REHEARSAL_KEY]);
  assert.deepEqual(recoverOriginalStrings(serialized),{
    [PRIMARY_KEY]:input.primaryRaw,[TODAY_UI_KEY]:input.todayRaw
  });
  for(const failAt of ['before-publish','after-publish']){
    const failed=rehearseRollback(review,{failAt});
    assert.equal(failed.status,'rolled-back-in-memory');
    assert.equal(failed.restored,true);
    assert.equal(failed.originalUnchanged,true);
    assert.equal(failed.reviewKeyPresent,false);
    assert.deepEqual(failed.entries,{[PRIMARY_KEY]:input.primaryRaw,[TODAY_UI_KEY]:input.todayRaw});
  }
  assert.deepEqual(input,initial);
});
test('corrupted legacy JSON blocks simulation without losing original bytes',()=>{
  const input={primaryRaw:'{"groupMessages":[oops]',todayRaw:JSON.stringify({name:'Jane'})};
  const review=prepareMigrationReview(input);
  assert.equal(review.status,'blocked');
  assert.ok(review.issues.length>0);
  const result=rehearseRollback(review);
  assert.equal(result.status,'blocked');
  assert.equal(result.restored,true);
  assert.equal(result.reviewKeyPresent,false);
  assert.equal(result.entries[PRIMARY_KEY],input.primaryRaw);
  assert.deepEqual(recoverOriginalStrings(review),{
    [PRIMARY_KEY]:input.primaryRaw,[TODAY_UI_KEY]:input.todayRaw
  });
  const noData=prepareMigrationReview();
  assert.equal(noData.status,'empty');
  assert.equal(rehearseRollback(noData).status,'blocked');
});
test('all integration files remain outside runtime browser and build entrypoints',()=>{
  const root=path.resolve(__dirname,'..');
  const active=[
    fs.readFileSync(path.join(root,'index.html'),'utf8'),
    fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8'),
    fs.readFileSync(path.join(root,'rallypoint.js'),'utf8')
  ].join('\n');
  for(const file of ['domain-bundle.cjs','migration-rehearsal.cjs','legacy-fixture-migration.cjs',
    'action-contracts.cjs','conversation-contracts.cjs','mock-conversation-repository.cjs']){
    assert.equal(active.includes(file),false,file+' accidentally wired into live app');
  }
});
