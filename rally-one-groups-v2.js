/* Rally One Groups 2.0 — connected member overview and demo photo profiles.
 * Presentation only. No new membership, message, prayer, RSVP or people store.
 * Portrait tiles represent user-supplied photos, not connected church accounts.
 */
(function(root){
'use strict';
const profiles=Object.freeze([
  Object.freeze({id:'dustin',name:'Dustin'}),
  Object.freeze({id:'mandy',name:'Mandy'}),
  Object.freeze({id:'garrett',name:'Garrett'}),
  Object.freeze({id:'nick',name:'Nick'}),
  Object.freeze({id:'aiden',name:'Aiden'}),
  Object.freeze({id:'dom',name:'Dom'})
]);
const safe=v=>String(v??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function personPhoto(p){
 return '<span class="gv2-portrait gv2-photo-'+p.id+'" aria-hidden="true"></span>';
}
function peopleRail(includeMyGroup=true){
 const items=profiles.map(p=>'<li class="gv2-rail-item"><button type="button" class="gv2-rail-button" data-action="gv2-profile" data-person="'+p.id+'" aria-label="Open '+safe(p.name)+' demo profile">'+
 '<span class="gv2-ring gv2-ring-mint">'+personPhoto(p)+'</span><span class="gv2-rail-label">'+safe(p.name)+'</span></button></li>').join('');
 return '<nav class="gv2-rail-wrap" aria-label="'+(includeMyGroup?'Your group people':'Sample community portraits')+'"><ul class="gv2-rail">'+
 (includeMyGroup?'<li class="gv2-rail-item"><button type="button" class="gv2-rail-button" data-action="pane" data-area="group" data-value="people" aria-label="Open My group member directory">'+
 '<span class="gv2-ring gv2-ring-red"><img src="assets/rally-one/community.webp" alt="" loading="lazy"></span><span class="gv2-rail-label">My group</span></button></li>':'')+items+'</ul></nav>';
}
function renderDiscoveryRail(){
 return '<section class="gv2-public-rail" aria-label="Meet people in the Rally One demo">'+
 '<div class="gv2-overline">GET TO KNOW THE COMMUNITY · PREVIEW</div>'+
 '<div class="gv2-heading-row"><h2>Your people<span aria-hidden="true">✳</span></h2><small>PHOTO DEMO</small></div>'+
 peopleRail(false)+
 '<p class="gv2-public-note">Preview photos only. These are not verified group accounts or people you can privately contact in this demo.</p>'+
 '</section>';
}
function renderHome(data={}){
 const unread=Number.isFinite(data.unreadCount)?Math.max(0,Math.trunc(data.unreadCount)):0;
 const messageText=data.conversationStatus==='unavailable'
   ?'Saved thread needs review'
   :unread>0?(unread+' new '+(unread===1?'message':'messages')):'Your group conversation';
 const response=data.rsvp==='going'?'You are going':data.rsvp==='maybe'?'You responded Maybe':'RSVP when ready';
 const prayerCount=Number.isFinite(data.prayerCount)?Math.max(0,Math.trunc(data.prayerCount)):0;
 return '<section class="group-screen-v07 gv2-home" aria-label="Your Groups overview">'+
 '<div class="gv2-heading"><div class="gv2-overline">YOUR COMMUNITY</div><div class="gv2-heading-row"><h1>Your people<span aria-hidden="true">✳</span></h1><small>WEDNESDAY GROUP</small></div></div>'+
 peopleRail()+
 '<button type="button" class="gv2-group-hero" data-action="pane" data-area="group" data-value="people" aria-label="Open Wednesday Group details and people">'+
 '<span class="gv2-hero-brand"><img src="assets/citizen-flag.svg" alt="" aria-hidden="true"> YOUR SMALL GROUP</span>'+
 '<strong>Wednesday Group</strong><span class="gv2-hero-meta">8 demo members <b aria-hidden="true">·</b> '+safe(data.nextDate||'Wednesday')+' <b aria-hidden="true">·</b> 6:30 PM</span>'+
 '<span class="gv2-hero-copy">Your people, your gathering, and care in one place.</span><span class="gv2-hero-action">View group details <b aria-hidden="true">↗</b></span></button>'+
 '<div class="gv2-widgets" aria-label="Group shortcuts">'+
 '<button type="button" class="gv2-widget gv2-widget-chat" data-go="group" data-pane="chat" aria-label="Open Wednesday Group Connect messages">'+
 '<span class="gv2-widget-icon" aria-hidden="true">✉</span><strong>Conversation</strong><span>'+safe(messageText)+'</span><b class="gv2-widget-cta">View messages <i aria-hidden="true">↗</i></b></button>'+
 '<button type="button" class="gv2-widget gv2-widget-gather" data-action="pane" data-area="group" data-value="gather" aria-label="Open Wednesday Group gathering details and RSVP">'+
 '<span class="gv2-widget-icon" aria-hidden="true">▦</span><strong>This week</strong><span>'+safe(data.nextDate||'Wednesday')+' · 6:30 PM</span><b class="gv2-widget-cta"> '+safe(response)+' <i aria-hidden="true">↗</i></b></button></div>'+
 '<button type="button" class="gv2-care" data-action="pane" data-area="group" data-value="prayer" aria-label="Open group prayer and care"><span class="gv2-care-icon" aria-hidden="true">♡</span><span><strong>Prayer & care</strong><small>'+safe(prayerCount?prayerCount+' sample prayer '+(prayerCount===1?'request':'requests'):'Encourage someone in your circle')+'</small></span><b aria-hidden="true">↗</b></button>'+
 '<div class="gv2-more"><button type="button" data-action="pane" data-area="group" data-value="people">All members ↗</button><button type="button" data-action="browse">Explore groups ↗</button>'+
 (data.canLead?'<button type="button" data-action="pane" data-area="group" data-value="leader">Leader tools ↗</button>':'')+'</div>'+
 '<p class="gv2-safety-note">Demo portraits and group activity. No actual messages or invitations are sent.</p></section>';
}
function renderDirectory(){
 return '<section class="gv2-directory" aria-label="Group member photo gallery">'+
 '<p class="gv2-directory-intro">Get to know your people. These six photos are examples, not connected member accounts.</p>'+
 '<div class="gv2-directory-list">'+profiles.map(p=>
 '<button type="button" class="gv2-directory-person" data-action="gv2-profile" data-person="'+p.id+'" aria-label="View '+safe(p.name)+' demo profile">'+
 '<span class="gv2-directory-face">'+personPhoto(p)+'</span><span class="gv2-directory-name">'+safe(p.name)+'</span><span aria-hidden="true">↗</span></button>').join('')+'</div>'+
 '</section>';
}
function renderProfile(id,{member=true}={}){
 const p=profiles.find(item=>item.id===id);
 if(!p)return '';
 return '<section class="group-screen-v07 gv2-profile" aria-label="'+safe(p.name)+' demo profile">'+
 '<button class="gv2-back" type="button" '+(member?'data-action="pane" data-area="group" data-value="overview"':'data-action="gv2-back-discovery"')+' >← '+(member?'Your people':'Explore groups')+'</button>'+
 '<div class="gv2-profile-card"><span class="gv2-profile-ring">'+personPhoto(p)+'</span><div class="gv2-overline">COMMUNITY · DEMO PROFILE</div>'+
 '<h1>'+safe(p.name)+'</h1><p>This is a real photograph supplied for the prototype. It is not connected to an actual Rally One member account.</p>'+
 (member?'<button type="button" class="gv2-profile-primary" data-go="group" data-pane="chat">Go to group conversation ↗</button>'+ 
 '<button type="button" class="gv2-profile-secondary" data-action="pane" data-area="group" data-value="people">View member directory ↗</button>':'<button type="button" class="gv2-profile-secondary" data-action="gv2-back-discovery">Explore demo groups ↗</button>')+'</div></section>';
}
function detailHeading(pane,leader){
 const labels={people:'My group',gather:'Next gathering',prayer:'Prayer & care',leader:'Care for your people',direct:'Direct demo message',chat:'Group conversation'};
 return '<div class="gv2-detail-heading"><button type="button" class="gv2-back" data-action="pane" data-area="group" data-value="overview">← Your people</button>'+
 '<div class="gv2-overline">WEDNESDAY GROUP'+(leader?' · LEADER PREVIEW':'')+'</div><h1>'+safe(labels[pane]||'Your group')+'</h1></div>';
}
function detailTabs(active,leader){
 const entries=[['overview','Overview'],['people','People'],['gather','Gathering'],['prayer','Prayer']];
 if(leader)entries.push(['leader','Leader tools']);
 return '<div class="gv2-detail-tabs" role="group" aria-label="Group details">'+entries.map(([id,label])=>
 '<button type="button" data-action="pane" data-area="group" data-value="'+id+'" '+(active===id?'aria-current="page"':'')+'>'+label+'</button>').join('')+'</div>';
}
root.RallyGroupsV2=Object.freeze({profiles,renderHome,renderProfile,renderDiscoveryRail,renderDirectory,detailHeading,detailTabs});
})(typeof window!=='undefined'?window:globalThis);
