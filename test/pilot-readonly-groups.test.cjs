'use strict';
const test=require('node:test');
const assert=require('node:assert/strict');
const {createReadOnlyGroupClient,PilotReadError}=require('../pilot/planning-center-readonly-groups.cjs');

const org='111',group='222',person='333';
const frozen=new Date('2026-11-22T12:00:00Z');
const validSession=()=>({authenticated:true,organizationId:org,subject:person,
 accessToken:'secret-should-never-appear',scopes:['groups','openid'],
 expiresAt:Date.now()+60000});
const reply=(data,status=200)=>({
 status,headers:{get:()=>null},text:async()=>JSON.stringify(data)
});
const membership=({groupId=group,role='member'}={})=>({
 data:{id:'888',type:'Membership',attributes:{role},relationships:{
 group:{data:{type:'Group',id:groupId}},person:{data:{type:'Person',id:'444'}}
 }}
});
const groupRecord={data:{id:group,type:'Group',attributes:{
 name:'Wednesday Group',description:'Private leader plans',
 chat_enabled:true,secret_field:'Do not reveal'
}}};
const events={data:[
 {type:'Event',id:'4',attributes:{name:'Canceled event',starts_at:'2026-11-25T18:00:00Z',canceled:true},relationships:{group:{data:{id:group}}}},
 {type:'Event',id:'5',attributes:{name:'Historic event',starts_at:'2026-11-20T18:00:00Z'},relationships:{group:{data:{id:group}}}},
 {type:'Event',id:'6',attributes:{name:'Private other group meeting',starts_at:'2026-11-23T18:00:00Z'},relationships:{group:{data:{id:'999'}}}},
 {type:'Event',id:'2',attributes:{name:'Next Wednesday gathering',starts_at:'2026-11-25T18:30:00Z',notes:'Private'},relationships:{group:{data:{id:group}}}},
 {type:'Event',id:'3',attributes:{name:'Later event',starts_at:'2026-12-02T18:30:00Z'},relationships:{group:{data:{id:group}}}}
]};
const standard={
 '/oauth/userinfo':{sub:person,organization_id:org,email:'private@example.test'},
 '/groups/v2/groups/222/my_membership':membership(),
 '/groups/v2/groups/222':groupRecord,
 '/groups/v2/groups/222/events':events
};
function harness(overrides={}){
 const calls=[];
 const request=async(url,opts)=>{
  const u=new URL(url);
  calls.push({url,method:opts.method,headers:opts.headers,cache:opts.cache,redirect:opts.redirect});
  const key=u.pathname;
  const result=Object.hasOwn(overrides,key)?overrides[key]:standard[key];
  if(result instanceof Error)throw result;
  if(typeof result==='number')return reply({errors:[{title:'permission'}]},result);
  if(result===undefined)throw new Error('Unrecognized test request: '+key);
  return reply(result);
 };
 return {calls,client:createReadOnlyGroupClient({fetchImpl:request,organizationId:org,groupId:group,now:()=>frozen})};
}
const failure=async(promise,code)=>assert.rejects(promise,e=>e instanceof PilotReadError&&e.code===code);
test('Pilot adapter is inert until explicitly invoked; no live source is connected',()=>{
 const {calls}=harness();
 assert.deepEqual(calls,[]);
});
test('Authorized per-user read returns only group name, next future gathering and source metadata',async()=>{
 const {client,calls}=harness();
 const actual=await client.readForServerSession(validSession());
 assert.deepEqual(actual,{
  source:'planning-center-groups',mode:'read-only',group:{name:'Wednesday Group'},
  nextGathering:{title:'Next Wednesday gathering',startsAt:'2026-11-25T18:30:00Z'},
  asOf:frozen.toISOString()
 });
 assert.deepEqual(calls.map(c=>new URL(c.url).pathname),[
  '/oauth/userinfo','/groups/v2/groups/222/my_membership',
  '/groups/v2/groups/222','/groups/v2/groups/222/events'
 ]);
 assert.ok(calls.every(c=>c.method==='GET'&&c.cache==='no-store'&&c.redirect==='error'));
 const eventRequest=new URL(calls[3].url);
 assert.equal(eventRequest.searchParams.get('filter'),'not_canceled');
 assert.equal(eventRequest.pathname,'/groups/v2/groups/222/events');
 assert.equal(eventRequest.searchParams.get('group_id'),null);
 assert.ok(calls.every(c=>c.headers['User-Agent'].includes('Rally Point Pilot')));
 const output=JSON.stringify(actual);
 for(const secret of ['secret-should-never-appear','private@example.test','Private leader plans',
  'Private other group','Historic event','Canceled event','notes','leader'])
  assert.equal(output.includes(secret),false,secret);
});
test('Rejects unauthenticated, expired, wrong-tenant or underscoped sessions before any network call',async()=>{
 for(const change of [
  {authenticated:false},{accessToken:''},{organizationId:'999'},
  {scopes:['people']},{scopes:['groups']},{expiresAt:Date.now()-1000},{scopes:null},
  {subject:'something-injected'}, {accessToken:null}
 ]){
  const {client,calls}=harness();
  const s={...validSession(),...change};
  await failure(client.readForServerSession(s),'access-denied');
  assert.equal(calls.length,0,JSON.stringify(change));
 }
});
test('Cross-tenant OAuth claims and substituted user are rejected before group lookup',async()=>{
 for(const identity of [
  {sub:person,organization_id:'999'},
  {sub:'444',organization_id:org},
  {organization_id:org}
 ]){
  const {client,calls}=harness({'/oauth/userinfo':identity});
  await failure(client.readForServerSession(validSession()),'access-denied');
  assert.equal(calls.length,1);
 }
});
test('No current group membership is denied; never fetches group name or event schedule',async()=>{
 for(const denied of [null,{data:null},membership({groupId:'999'}),membership({role:'visitor'})]){
  const {client,calls}=harness({'/groups/v2/groups/222/my_membership':denied});
  await failure(client.readForServerSession(validSession()),denied===null?'source-unavailable':
    denied.data===null?'not-a-member':'access-denied');
  assert.deepEqual(calls.map(c=>new URL(c.url).pathname),[
   '/oauth/userinfo','/groups/v2/groups/222/my_membership'
  ]);
 }
});
test('Provider 404 membership is denied even when other records would be available',async()=>{
 const {client,calls}=harness({'/groups/v2/groups/222/my_membership':404});
 await failure(client.readForServerSession(validSession()),'not-a-member');
 assert.equal(calls.length,2);
});
test('Upstream 401 and 403 never fall back to fixture data or disclose details',async()=>{
 for(const code of [401,403]){
  const {client,calls}=harness({'/oauth/userinfo':code});
  await failure(client.readForServerSession(validSession()),'access-denied');
  assert.equal(calls.length,1);
 }
});
test('Source timeout, rate limit and malformed JSON fail closed without a retry or cached payload',async()=>{
 for(const result of [429,500,new Error('Network failed'),{wrong:'shape'}]){
  const {client,calls}=harness({'/groups/v2/groups/222/events':result});
  await failure(client.readForServerSession(validSession()),'source-unavailable');
  assert.equal(calls.length,4);
 }
});
test('No future gathering is distinct from no group membership; never invents weekly recurrence',async()=>{
 const {client}=harness({'/groups/v2/groups/222/events':{data:[
  {type:'Event',id:'1',attributes:{name:'Old',starts_at:'2025-11-25T18:00:00Z'},relationships:{group:{data:{id:group}}}}
 ]}});
 const snapshot=await client.readForServerSession(validSession());
 assert.equal(snapshot.group.name,'Wednesday Group');
 assert.equal(snapshot.nextGathering,null);
});
test('Unexpected scope and malicious configuration values fail before any network calls',()=>{
 assert.throws(()=>createReadOnlyGroupClient({fetchImpl:async()=>reply({}),organizationId:org,groupId:'222/../333'}),TypeError);
 assert.throws(()=>createReadOnlyGroupClient({fetchImpl:async()=>reply({}),organizationId:'evil',groupId:group}),TypeError);
});
test('Provider-returned markup is removed from the presentation-safe allowlisted fields',async()=>{
 const {client}=harness({
  '/groups/v2/groups/222':{data:{id:group,type:'Group',attributes:{name:'<script>alert(1)</script> Wednesday Group'}}},
  '/groups/v2/groups/222/events':{data:[{id:'1',type:'Event',attributes:{name:'<img onerror=x>Welcome',starts_at:'2026-11-30T18:00:00Z'},relationships:{group:{data:{id:group}}}}]}
 });
 const view=await client.readForServerSession(validSession());
 assert.equal(view.group.name,'alert(1) Wednesday Group');
 assert.equal(view.nextGathering.title,'Welcome');
 assert.doesNotMatch(JSON.stringify(view),/[<>]/);
});

test('Pagination is not silently misreported as no future events',async()=>{
 const {client}=harness({'/groups/v2/groups/222/events':{
  data:[],links:{next:'https://api.planningcenteronline.com/groups/v2/groups/222/events?offset=100'}
 }});
 await failure(client.readForServerSession(validSession()),'source-unavailable');
});
test('Group-only request, current membership and OIDC scope remain mandatory in adapter',async()=>{
 const {client,calls}=harness();
 await client.readForServerSession(validSession());
 const paths=calls.map(c=>new URL(c.url).pathname);
 assert.ok(paths.every(p=>p==='/oauth/userinfo'||p.startsWith('/groups/v2/groups/222')));
 assert.ok(!paths.includes('/groups/v2/events'),'never read organization-wide events');
 assert.ok(!paths.includes('/groups/v2/groups/222/memberships'),'never read the entire group roster');
 const denied=harness();
 await failure(denied.client.readForServerSession({...validSession(),scopes:['groups']}),'access-denied');
 assert.equal(denied.calls.length,0);
});

test('Nested group event listings remain scoped even if an individual event omits group relationship',async()=>{
 const {client,calls}=harness({'/groups/v2/groups/222/events':{data:[
  {id:'101',type:'Event',attributes:{name:'Known group event',starts_at:'2026-11-25T18:30:00Z'}},
  {id:'102',type:'Event',attributes:{name:'Explicitly different group',starts_at:'2026-11-24T18:30:00Z'},
   relationships:{group:{data:{id:'999'}}}}
 ]}});
 const result=await client.readForServerSession(validSession());
 assert.equal(result.nextGathering.title,'Known group event');
 assert.ok(calls.every(c=>!new URL(c.url).pathname.startsWith('/groups/v2/events')));
});
