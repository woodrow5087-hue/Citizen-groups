'use strict';
const {test}=require('node:test'),assert=require('node:assert/strict');
const {JSDOM}=require('jsdom'),fs=require('node:fs'),vm=require('node:vm');
const Team=require('../foundation2/team.js'),Widgets=require('../foundation2/widgets.js');
const member={member:true,response:'pending',authorizedLeader:false,shift:new Date('2026-11-29T09:00:00Z'),
 location:'North Campus',teamName:'Welcome Team',campus:'north',coverage:false,hasUnreadGroup:false};
const doc=(model=member,options)=>JSDOM.fragment(Team.render(model,options));

test('Team form retains response meanings, pressed controls and blocked mutation boundaries',()=>{
 for(const [response,label] of [['pending','Response needed'],['confirmed','Confirmed'],['declined','Unable to serve'],['unknown','Response unavailable']]){
  for(const blocked of [false,true]){
   const page=doc({...member,response},{blocked});
   assert.equal(page.querySelector('.team-availability strong').textContent,label);
   const controls=[...page.querySelectorAll('[data-team-action=serving-response]')];
   assert.equal(controls.length,blocked||response==='unknown'?0:2);
   for(const control of controls){
    assert.equal(control.getAttribute('aria-pressed'),String(control.dataset.value===response));
    assert.deepEqual(Team.commandFor(control.dataset.teamAction,control.dataset.value),{type:'serving-response',value:control.dataset.value});
   }
   assert.equal(page.querySelectorAll('[data-team-action=serving-coverage]').length,response==='declined'&&!blocked?1:0);
   assert.match(page.querySelector('.team-disclosure').textContent,/not recorded attendance/);
  }
 }
});

test('declined coverage remains first after assignment and the Room handoff remains native',()=>{
 for(const coverage of [false,true]){
  const page=doc({...member,response:'declined',coverage});
  const assignment=page.querySelector('.team-assignment');
  assert.equal(assignment.nextElementSibling,page.querySelector('.team-coverage'));
  const action=page.querySelector('[data-team-action=serving-coverage]');
  assert.equal(action.dataset.value,coverage?'withdraw':'request');
  if(coverage)assert.match(page.querySelector('.team-coverage').textContent,/fictional local coverage request saved/);
  assert.match(page.querySelector('.team-coverage-note').textContent,/No coverage message is delivered/);
  const room=page.querySelector('[data-return-focus=team-connect]');
  assert.equal(room.getAttribute('href'),'?screen=connect&channel=room');
  assert.equal(room.dataset.route,'connect');
  assert.equal(room.classList.contains('route-full-app'),true);
  assert.equal(room.classList.contains('utility-link'),true);
  assert.equal(room.querySelector('button,[data-team-action]'),null);
 }
});

test('membership and explicit authority alone expose Team and leader context',()=>{
 const guest=doc({...member,member:false,response:'not-joined',authorizedLeader:false,shift:null});
 assert.equal(guest.querySelector('.team-assignment,[data-team-action],[data-route=connect],.team-leader-panel'),null);
 assert.match(guest.querySelector('.route-preview-card').textContent,/Browsing never creates a membership/);
 assert.equal(guest.querySelector('.route-full-app').getAttribute('href'),'../index.html');
 assert.equal(doc({...member,response:'confirmed'}).querySelector('.team-leader-panel'),null);
 const leader=doc({...member,authorizedLeader:true});
 assert.equal(leader.querySelectorAll('.team-leader-panel').length,1);
 assert.match(leader.querySelector('.team-leader-notice').textContent,/Authorized team-leader scenario.*no attendance inferred/);
});

test('Team form escapes source text and leaves provider preview content unchanged',()=>{
 const unsafe='<img src=x onerror="bad()">';
 const page=doc({...member,teamName:unsafe,location:unsafe},{feedback:unsafe});
 assert.equal(page.querySelector('[onerror]'),null);
 assert.equal(page.querySelector('#team-assignment-title').textContent,unsafe);
 assert.match(page.querySelector('.team-assignment').textContent,/img src/);
 assert.equal(page.querySelector('[role=status]').textContent,unsafe);
 const preview='<aside class="provider-test">Source unavailable</aside>';
 const provider=doc(member,{servingPreview:preview});
 assert.equal(provider.querySelector('.provider-test').outerHTML,preview);
 assert.equal(provider.querySelector('.team-assignment,.team-identity,[data-team-action],.team-leader-panel'),null);
});

test('browser Team uses the shared Widgets port without persistence or IO',()=>{
 const sandbox={window:{FoundationWidgets:Widgets}};
 for(const target of [sandbox,sandbox.window])for(const name of ['document','localStorage','sessionStorage','fetch','XMLHttpRequest'])
  Object.defineProperty(target,name,{get(){throw Error('Unexpected IO: '+name);}});
 vm.runInNewContext(fs.readFileSync(require.resolve('../foundation2/team.js'),'utf8'),sandbox);
 const markup=sandbox.window.FoundationTeam.render(member);
 assert.match(markup,/utility utility-link route-full-app team-room-link/);
 assert.match(markup,/data-return-focus="team-connect"/);
});
