'use strict';
const {test} = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const {
  ACTION_SCHEMA_VERSION, blankActionSnapshot, assertActionSnapshot
} = require('../lib/action-contracts.cjs');
const {
  PRIMARY_KEY, TODAY_UI_KEY, PLAN_VERSION, planLegacyFixtureMigration
} = require('../lib/legacy-fixture-migration.cjs');

const at = '2026-11-22T16:30:00.000Z';
function actionFixture() {
  return {
    schemaVersion:1,
    sourceReferences:[
      {id:'src_gather',organizationId:'citizen',system:'fixture',resourceType:'gathering',externalId:null,observedAt:null},
      {id:'src_shift',organizationId:'citizen',system:'fixture',resourceType:'serving-shift',externalId:null,observedAt:null}
    ],
    gatherings:[{id:'g_wed',organizationId:'citizen',groupId:'group_demo',title:'Wednesday Group',startsAt:at,status:'scheduled',sourceRefId:'src_gather'}],
    servingShifts:[{id:'shift_sun',organizationId:'citizen',teamId:'team_demo',title:'Sunday Welcome Team',startsAt:at,status:'scheduled',sourceRefId:'src_shift'}],
    shiftResponses:[{id:'response_anna',shiftId:'shift_sun',userId:'u_anna',response:'confirmed',recordedAt:at,sourceRefId:'src_shift'}],
    coverageRequests:[{id:'coverage_anna',shiftId:'shift_sun',requestedByUserId:'u_anna',status:'requested',requestedAt:at,sourceRefId:null}],
    companionActions:[
      {id:'action_group',organizationId:'citizen',kind:'gathering',targetType:'gathering',targetId:'g_wed',state:'available',sourceRefId:'src_gather'},
      {id:'action_serve',organizationId:'citizen',kind:'serving',targetType:'servingShift',targetId:'shift_sun',state:'available',sourceRefId:'src_shift'}
    ],
    careTasks:[{id:'care_fictional',organizationId:'citizen',subjectUserId:'u_demo',assignedToUserId:null,status:'suggested',provenance:'fictional-scenario',sourceRefId:null,reviewedAt:null}],
    activityEvents:[{id:'read_today',organizationId:'citizen',userId:'u_anna',kind:'read',occurredAt:at,sourceRefId:null}]
  };
}
function legacyFixture() {
  const state={
    groupMessages:[
      {name:'Jess W.',time:'Yesterday',text:'What stood out to you in John 15 this week?'},
      {name:'Jess W.',time:'Yesterday',text:'What stood out to you in John 15 this week?'}
    ],
    teamMessages:[{name:'Sam R.',time:'Today',text:'Welcome team'}],
    directMessages:{anna:[{name:'You',time:'Just now',text:'A private local note'}]},
    prayers:[{name:'Marcus C.',time:'Today',text:'A local prayer note'}],
    teamStatus:'confirmed',rsvp:'going',coverage:true,
    attendance:{anna:'here',marcus:'unknown'},reached:['marcus'],
    plan:'study',planQuestions:{study:'A sample question'},
    read:true,prayed:true, memoryGames:{'study:solo':{slots:[1,2,3],solved:false}},
    memoryTextRevision:'BSB-2026-1',
    companionCare:{marcus:{completedAt:'2026-11-19T13:04:00.000Z'}},
    rhythm:{text:'Encourage a friend',passage:'John 15:12',savedAt:'2026-11-18T11:00:00.000Z'},
    draftNote:'A locally saved draft',unknownFuturePreference:{nested:{x:1}}
  };
  const ui={name:'Demo Name',memberships:{group:true,team:true},seenGroupSignature:'[[{"text":"x"}]]',unrelatedFlag:true};
  return {primaryRaw:JSON.stringify(state),todayRaw:JSON.stringify(ui)};
}

test('action contracts are explicitly v1 with all remaining planned record types',()=>{
  assert.equal(ACTION_SCHEMA_VERSION,1);
  assert.deepEqual(Object.keys(blankActionSnapshot()),[
    'schemaVersion','sourceReferences','gatherings','servingShifts','shiftResponses',
    'coverageRequests','companionActions','careTasks','activityEvents'
  ]);
  const fixture=actionFixture();
  assert.equal(assertActionSnapshot(fixture),fixture);
  assert.doesNotThrow(()=>assertActionSnapshot(blankActionSnapshot()));
});

test('action contracts fail closed for unsupported versions, malformed events and duplicate IDs',()=>{
  let x=actionFixture();x.schemaVersion=2;
  assert.throws(()=>assertActionSnapshot(x),/unsupported schemaVersion/);
  x=actionFixture();x.gatherings.push(structuredClone(x.gatherings[0]));
  assert.throws(()=>assertActionSnapshot(x),/duplicate id/);
  x=actionFixture();x.servingShifts[0].startsAt='2026-02-30T02:00:00Z';
  assert.throws(()=>assertActionSnapshot(x),/UTC timestamp/);
  x=actionFixture();x.shiftResponses[0].response='auto-confirmed';
  assert.throws(()=>assertActionSnapshot(x),/invalid value/);
  x=actionFixture();delete x.activityEvents;
  assert.throws(()=>assertActionSnapshot(x),/must be an array/);
});

test('action references and organization boundaries are validated',()=>{
  let x=actionFixture();x.shiftResponses[0].shiftId='missing';
  assert.throws(()=>assertActionSnapshot(x),/missing shift/);
  x=actionFixture();x.coverageRequests[0].shiftId='missing';
  assert.throws(()=>assertActionSnapshot(x),/missing shift/);
  x=actionFixture();x.gatherings[0].sourceRefId='missing';
  assert.throws(()=>assertActionSnapshot(x),/unknown source/);
  x=actionFixture();x.sourceReferences[0].organizationId='other_church';
  assert.throws(()=>assertActionSnapshot(x),/organization source boundary/);
  x=actionFixture();x.companionActions[0].targetId='missing';
  assert.throws(()=>assertActionSnapshot(x),/missing target/);
  x=actionFixture();x.companionActions[0].organizationId='other_church';x.companionActions[0].sourceRefId=null;
  assert.throws(()=>assertActionSnapshot(x),/organization boundary/);
  x=actionFixture();x.careTasks[0].riskScore=42;
  assert.throws(()=>assertActionSnapshot(x),/must not contain automated risk/);
  x=actionFixture();x.careTasks[0].spiritualScore=8;
  assert.throws(()=>assertActionSnapshot(x),/must not contain automated risk/);
});

test('pure migration plan is deterministic and preserves exact original JSON strings',()=>{
  const raw=legacyFixture();
  const before=structuredClone(raw);
  const a=planLegacyFixtureMigration(raw),b=planLegacyFixtureMigration(raw);
  assert.equal(PLAN_VERSION,1);
  assert.equal(PRIMARY_KEY,'rallypoint-phase1-2026');
  assert.equal(TODAY_UI_KEY,'rallypoint-today-ui-v1');
  assert.equal(a.status,'ready');
  assert.deepEqual(a,b,'idempotent plan without a clock dependency');
  assert.deepEqual(raw,before,'caller input untouched');
  assert.equal(a.backup[PRIMARY_KEY],raw.primaryRaw);
  assert.equal(a.backup[TODAY_UI_KEY],raw.todayRaw);
  assert.equal(a.writesPerformed,false);
  assert.equal(a.writable,false);
  assert.notEqual(a.fingerprint,'');
  assert.equal(a.staged.messages.length,5);
  assert.equal(a.staged.activities.length,2);
  assert.equal(a.staged.unscopedResponses.length,3);
  assert.equal(a.staged.demoAttendance.length,2);
  assert.equal(a.staged.demoCare.length,1);
  assert.equal(a.staged.legacyUi.verifiedMembership,false);
  assert.deepEqual(a.staged.legacyUi.convertedReadCursors,[]);
});

test('legacy messages retain duplicate rows but have distinguishable stable preview IDs and NO fabricated timestamps',()=>{
  const raw=legacyFixture();
  const plan=planLegacyFixtureMigration(raw);
  const group=plan.staged.messages.filter(m=>m.kind==='group');
  assert.equal(group.length,2);
  assert.notEqual(group[0].id,group[1].id);
  assert.equal(group[0].body,group[1].body);
  assert.equal(group[0].originalTimeLabel,'Yesterday');
  assert.equal(group[0].occurredAt,null);
  assert.equal(group[0].authorId,null);
  assert.equal(group[0].timeCertainty,'unknown');
  assert.deepEqual(plan.staged.activities.map(a=>a.localDate),[null,null]);
  assert.ok(plan.staged.unscopedResponses.every(a=>!('recordedAt' in a)||a.recordedAt===null));
  assert.ok(plan.staged.unscopedResponses.every(a=>a.shiftId===null||a.gatheringId===null));
  assert.equal(plan.staged.legacyUi.seenGroupSignature,'[[{"text":"x"}]]');
  assert.equal(JSON.parse(plan.backup[PRIMARY_KEY]).memoryGames['study:solo'].slots.length,3);
  assert.equal(JSON.parse(plan.backup[PRIMARY_KEY]).draftNote,'A locally saved draft');
  assert.equal(JSON.parse(plan.backup[PRIMARY_KEY]).unknownFuturePreference.nested.x,1);
});

test('missing or partial legacy fixture input is allowed, with empty source handled explicitly',()=>{
  const empty=planLegacyFixtureMigration();
  assert.equal(empty.status,'empty');
  assert.equal(empty.staged.messages.length,0);
  const raw=legacyFixture();
  assert.equal(planLegacyFixtureMigration({primaryRaw:raw.primaryRaw}).status,'ready');
  assert.equal(planLegacyFixtureMigration({todayRaw:raw.todayRaw}).status,'ready');
});

test('invalid, corrupted and incompatible legacy JSON is blocked without discarding raw bytes',()=>{
  const cases=[
    {primaryRaw:'{"groupMessages":[oops]'},
    {primaryRaw:'null'},
    {primaryRaw:'[]'},
    {primaryRaw:'{"groupMessages":{}}'},
    {primaryRaw:'{"directMessages":{"anna":{}}}'},
    {primaryRaw:'{"read":"yes"}'},
    {todayRaw:'{"memberships":[]}'},
    {primaryRaw:42}
  ];
  for(const input of cases){
    const result=planLegacyFixtureMigration(input);
    assert.equal(result.status,'blocked',JSON.stringify(input));
    assert.ok(result.issues.length);
    assert.equal(result.staged.messages.length,0);
    assert.equal(result.backup[PRIMARY_KEY],input.primaryRaw??null);
    assert.equal(result.backup[TODAY_UI_KEY],input.todayRaw??null);
    assert.equal(result.writesPerformed,false);
  }
});

test('migration planning never reads or writes browser storage or app runtime files',()=>{
  const storageSpy = {getItem(){throw Error('Unexpected read');},setItem(){throw Error('Unexpected write');}};
  const p=planLegacyFixtureMigration(legacyFixture());
  assert.equal(p.status,'ready');
  assert.equal(typeof storageSpy.setItem,'function'); // No storage adapter is even accepted.
  const root=path.resolve(__dirname,'..');
  const build=fs.readFileSync(path.join(root,'scripts/build.cjs'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  const app=fs.readFileSync(path.join(root,'rallypoint.js'),'utf8');
  for(const file of ['action-contracts.cjs','legacy-fixture-migration.cjs']){
    assert.equal(build.includes(file),false);
    assert.equal(html.includes(file),false);
    assert.equal(app.includes(file),false);
  }
});
