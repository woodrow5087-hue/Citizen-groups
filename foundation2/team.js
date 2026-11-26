/* Foundation 2 Gate 5B/C — Team.
 * Availability AND coverage use only canonical RallyMemberContext transitions.
 * These write browser-local fictional state; no staff notifications, attendance
 * or real coverage requests are implied.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root)root.FoundationTeam=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function project(snapshot){
 const c=snapshot.context,m=snapshot.model;
 const member=c.permissions.team;
 const response=member?c.team.response:'not-joined';
 return Object.freeze({
  member,response,authorizedLeader:member&&c.permissions.teamLeader,
  shift:member&&m.serveDate instanceof Date&&Number.isFinite(m.serveDate.valueOf())?m.serveDate:null,
  location:m.serveLocation||'North Campus',teamName:'Welcome Team',
  campus:c.identity.campus,coverage:member&&c.team.coverage,
  hasUnreadGroup:c.group.status==='ok'&&c.group.unreadCount>0
 });
}
function commandFor(kind,value){
 if(kind==='serving-response'&&['confirmed','declined'].includes(value))
  return {type:'serving-response',value};
 if(kind==='serving-coverage'&&['request','withdraw'].includes(value))
  return {type:'serving-coverage',value};
 return null;
}
function render(vm,{feedback='',blocked=false,servingPreview=''}={}){
 const header='<section class="team-page" aria-labelledby="route-title"><span class="eyebrow">TEAM · SERVE TOGETHER</span>'+
  '<h1 id="route-title" tabindex="-1">'+(vm.member?'Your team.':'Find your team.')+'</h1>';
 if(servingPreview)return header+servingPreview+'</section>';
 if(!vm.member)return header+'<p class="route-lead">You have not joined a fictional serving team in this demo scenario.</p>'+
  '<div class="route-preview-card"><span class="route-stage-label">NO SERVING MEMBERSHIP</span>'+
  '<p>Explore serving opportunities in the existing full demo. Browsing never creates a membership.</p>'+
  '<a class="route-full-app" href="../index.html">Explore the existing demo <span aria-hidden="true">↗</span></a></div></section>';
 const status=vm.response==='confirmed'?'Confirmed':
  vm.response==='declined'?'Unable to serve':
  vm.response==='pending'?'Response needed':'Response unavailable';
 const date=vm.shift?vm.shift.toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric'})+' · '+
  vm.shift.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):
  vm.response==='declined'?'You marked that you cannot serve.':'No verified upcoming shift';
 const text='<section class="team-assignment" aria-labelledby="team-assignment-title">'+
  '<span class="group-overline">NEXT ASSIGNMENT · SAMPLE</span>'+
  '<h2 id="team-assignment-title">'+esc(vm.teamName)+'</h2>'+
  '<p>'+esc(date)+' · '+esc(vm.location)+'</p>'+
  '<div class="team-availability"><span>Availability</span><strong class="'+(vm.response==='confirmed'?'is-confirmed':'')+'">'+esc(status)+'</strong></div>'+
  '<p class="team-disclosure">A response represents availability in the fictional schedule, not recorded attendance.</p>'+
  (vm.response==='unknown'||blocked?'<p class="team-blocked">Saved availability cannot be changed safely until this data is resolved.</p>':
  '<div class="team-actions">'+
   '<button type="button" data-team-action="serving-response" data-value="confirmed" aria-pressed="'+String(vm.response==='confirmed')+'"'+(vm.response==='confirmed'?' class="is-selected"':'')+'>Confirm serving</button>'+
   '<button type="button" data-team-action="serving-response" data-value="declined" aria-pressed="'+String(vm.response==='declined')+'"'+(vm.response==='declined'?' class="is-selected"':'')+'>Can’t make it</button>'+
   '</div>')+'</section>';
 const image='<section class="team-identity"><div class="team-identity-copy"><span class="group-overline">SERVING TOGETHER</span>'+
  '<h2>Small acts. Real impact.</h2><p>Welcome people as they arrive. Your time and presence help create a place to belong.</p></div>'+
  '<img src="../assets/campuses/north.jpg" alt="Citizen Church North Campus building" width="440" height="185" decoding="async"></section>';
 const coverage='<section class="team-coverage" aria-labelledby="team-coverage-title">'+
  '<h2 id="team-coverage-title">Coverage and coordination</h2>'+
  '<p>'+(vm.coverage?'You have a fictional local coverage request saved for this declined serving shift.':
    vm.response==='declined'?'If you cannot serve, you can save a fictional coverage request on this device.':
    'Coverage requests are available after you mark that you cannot serve.')+'</p>'+
  (vm.response==='declined'&&!blocked?'<button type="button" class="team-coverage-action" data-team-action="serving-coverage" data-value="'+(vm.coverage?'withdraw':'request')+'">'+
    (vm.coverage?'Withdraw sample coverage request':'Request sample coverage')+'</button>':'')+
  '<p class="team-coverage-note">This is only a local scheduling fixture. No coverage message is delivered to teammates or church staff.</p>'+
  '<a class="route-full-app" href="../index.html">Open serving tools in the existing full demo <span aria-hidden="true">↗</span></a></section>';
 const leader=vm.authorizedLeader?'<p class="team-leader-notice">Authorized team-leader scenario · no attendance inferred from confirmations.</p>':'';
 return header+(feedback?'<p class="group-feedback" role="status">'+esc(feedback)+'</p>':'')+
  text+image+coverage+leader+'</section>';
}
return Object.freeze({project,commandFor,render});
});