/* Reuse accepted photo/profile renderers and legacy message rendering. All IO
 * delegates to the shared controller/guard and the existing primary owner. */
(function(){
'use strict';const esc=x=>String(x??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function create(api){
 const dialog=document.createElement('dialog');dialog.className='relational-dialog';dialog.setAttribute('aria-label','People and care');document.body.append(dialog);
 let opener=null,owner=null,mode='',person=null;
 const current=()=>owner===api.owner(),local=()=>api.local()&&!api.blocked();
 const close=()=>{dialog.close();const target=opener?.isConnected?opener:api.root.querySelector('[data-return-focus="'+(opener?.dataset.returnFocus||'none')+'"]');target?.focus();};dialog.addEventListener('cancel',e=>{e.preventDefault();close();});
 function shell(title,html){dialog.innerHTML='<button type="button" data-rel="close">Back</button><h2 tabindex="-1">'+esc(title)+'</h2>'+html+'<p role="status" class="rel-status"></p>';if(!dialog.open)dialog.showModal();dialog.querySelector('h2').focus();}
 function status(text){const node=dialog.querySelector('.rel-status');if(node)node.textContent=text;}
 function start(button){opener=button;owner=api.owner();}
 function people(){
  mode='people';const group=local()&&api.session().snapshot.context.permissions.group;
  shell('Your people','<p>Photo examples are not connected member accounts. Known group fixture contacts are listed separately.</p><div class="rally-one"><div class="premium-alive is-groups-v07">'+RallyGroupsV2.renderDirectory()+'</div></div>'+(group?'<h3>Fictional group contacts</h3>'+FoundationRelationalDomain.contacts.map(p=>'<button data-rel="contact" data-id="'+p.id+'"><img class="rel-portrait" src="../assets/rally-one/'+p.photo+'.webp" alt="">'+esc(p.name)+'</button>').join(''):'<p>No private roster is available for this scenario.</p>')+'<button data-rel="discovery">Explore sample groups</button>');
 }
 function photo(id){mode='photo';shell('Community photo profile','<div class="rally-one"><div class="premium-alive is-groups-v07">'+RallyGroupsV2.renderProfile(id,{member:local()&&api.session().snapshot.context.permissions.group})+'</div></div>');}
 function contact(id){
  if(!local()||!api.session().snapshot.context.permissions.group)return;person=FoundationRelationalDomain.contacts.find(p=>p.id===id);if(!person)return;mode='contact';
  shell(person.name,'<img class="rel-profile" src="../assets/rally-one/'+person.photo+'.webp" alt=""><p>Known fictional Wednesday Group contact. No live account or presence is claimed.</p><button data-rel="message">Open local conversation</button><button data-rel="group">Open group conversation</button><button data-rel="people">Member directory</button>');
 }
 function direct(care=false){
  if(!person||!local()||!api.session().snapshot.context.permissions.group)return;
  if(person.premium&&!care){close();api.navigate('connect','?screen=connect&person='+encodeURIComponent(person.premium),opener);return;}
  mode=care?'followup':'direct';const host=api.host();
  shell((care?'Human-led check-in · ':'Local conversation · ')+person.name,'<div class="rel-direct">'+RallyGroupView.legacyMessages(host.messages(person.name),esc)+RallyGroupView.legacyComposer('direct','Fictional local message','Write what feels natural…')+'</div><p>No external delivery. '+(care?'Saving this explicit check-in also records the optional follow-up as complete.':'A generic message never completes a care action.')+'</p>');
  const field=dialog.querySelector('#direct-input');field.value=host.draft('direct',person.name);
  field.addEventListener('input',()=>{if(!current()||!api.host().saveDraft('direct',person.name,field.value))status('Draft could not be saved; keep this screen open. Earlier saved data is preserved.');});
 }
 function discovery(){mode='discovery';const names=[['The Table','Community · Wednesday · Albuquerque'],['Weekend Hikers','Activity · Saturday · Northeast Heights'],['Young Families','Community · Sunday · North Campus']];shell('Discover community','<p>Sample interest stays on this device. It does not join a group or contact anyone.</p>'+names.map(([name,detail],i)=>'<article><h3>'+name+'</h3><p>'+detail+'</p><button data-rel="interest" data-id="'+i+'" aria-pressed="'+(Array.isArray(api.state().interest)?api.state().interest:[]).includes(String(i))+'">'+((Array.isArray(api.state().interest)?api.state().interest:[]).includes(String(i))?'Interested · undo':'I’m interested')+'</button></article>').join(''));}
 function prayer(){if(!local()||!api.session().snapshot.context.permissions.group)return;mode='prayer';shell('Prayer and human care','<p>Fictional requests only. Nothing is sent automatically.</p>'+(Array.isArray(api.state().prayers)?api.state().prayers:[]).map(p=>'<blockquote><strong>'+esc(p.name)+'</strong><p>'+esc(p.text)+'</p></blockquote>').join('')+'<label>Fictional request<textarea id="rel-prayer" maxlength="700"></textarea></label><button data-rel="post">Save local prayer request</button>'+(api.session().snapshot.care?.completed?'<p>Optional follow-up recorded on this device. No external delivery.</p>':api.session().snapshot.care?.paused?'<p>You paused this optional reminder.</p><button data-rel="review-care">Revisit from Groups when ready</button>':api.session().snapshot.care?'<button data-rel="pause">Leave care reminder for tomorrow</button><button data-rel="followup">Write an optional check-in for Marcus</button>':''));}
 function leader(){if(!local()||!api.session().snapshot.context.permissions.groupLeader)return;mode='leader';shell('Human-led group responsibilities','<p>Undated sample attendance ledger, preserved from the accepted fixture. These are not observations for the next gathering. RSVP and serving confirmations never determine attendance.</p>'+FoundationRelationalDomain.contacts.map(p=>'<fieldset><legend>'+esc(p.name)+'</legend>'+[['here','Here'],['excused','Excused'],['unknown','Not recorded']].map(([v,label])=>'<button data-rel="attendance" data-id="'+p.id+'" data-value="'+v+'" aria-pressed="'+(api.state().attendance?.[p.id]===v)+'">'+label+'</button>').join('')+'</fieldset>').join('')+'<p>Review is distinct from contact and attendance. No automated pastoral alerts or scores.</p>');}
 dialog.addEventListener('click',e=>{
  const b=e.target.closest('button');if(!b)return;
  if(b.dataset.rel==='close'){close();return;}if(!current()){close();return;}
  if(b.dataset.action==='gv2-profile'){photo(b.dataset.person);return;}
  if(b.dataset.go==='group'){close();api.navigate('connect','?screen=connect&thread=group',opener);return;}
  if(b.dataset.action==='gv2-back-discovery'){discovery();return;}
  if(b.dataset.action==='pane'){people();return;}
  const action=b.dataset.rel;
  if(action==='people')people();if(action==='contact')contact(b.dataset.id);if(action==='message')direct();if(action==='discovery')discovery();if(action==='prayer')prayer();if(action==='leader')leader();
  if(action==='review-care'){close();api.navigate('groups',null,opener);}
  if(action==='group'){close();api.navigate('connect','?screen=connect&thread=group',opener);}
  if(['interest','attendance','post','pause'].includes(action)){
   const r=api.perform({type:({interest:'interest',attendance:'attendance',post:'prayer-post',pause:'care-pause'})[action],id:b.dataset.id,value:b.dataset.value,text:dialog.querySelector('#rel-prayer')?.value});
   if(r.ok){if(action==='interest')discovery();else if(action==='attendance')leader();else prayer();}status(r.ok?'Saved only on this device. No outreach.':r.reason);
  }
  if(action==='followup'){person=FoundationRelationalDomain.contacts.find(p=>p.id==='marcus');direct(true);}
  if(b.dataset.action==='send'){
   const text=dialog.querySelector('#direct-input').value;const ok=mode==='followup'?api.host().followup(text):api.host().write('direct',text,person.name);
   if(ok){direct(false);if(dialog.open)status('Saved only on this device.');}else status('Not saved. Earlier conversation and saved draft preserved.');
  }
 });
 api.root.addEventListener('click',e=>{const b=e.target.closest('[data-rel-entry]');if(!b)return;start(b);({people,discovery,prayer,leader,room:()=>api.navigate('connect','?screen=connect&channel=room',b)})[b.dataset.relEntry]?.();});
 return {enhance(){if(dialog.open&&!current())close();if(api.root.querySelector('.relational-actions'))return;
 if(local()&&api.session().snapshot.context.permissions.group){const rail=api.root.querySelector('.faces');if(rail){rail.removeAttribute('aria-hidden');rail.setAttribute('role','group');rail.setAttribute('aria-label','Your fictional group contacts');rail.querySelectorAll('img').forEach((img,i)=>{const p=FoundationRelationalDomain.contacts[i],b=document.createElement('button');b.type='button';b.className='rel-circle';b.setAttribute('aria-label','Open '+p.name+' profile');b.dataset.returnFocus='circle-'+p.id;img.replaceWith(b);b.append(img);b.onclick=()=>{start(b);contact(p.id);};});}}
const route=api.route();if(!['today','groups','team'].includes(route))return;const p=api.session().snapshot.context.permissions;
 const section=document.createElement('section');section.className='relational-actions'+(route==='today'?' relational-actions--compact':'');section.innerHTML='<h2>Your community</h2><button data-rel-entry="people">People</button><button data-rel-entry="discovery">Explore groups</button>'+(local()&&p.group?'<button data-rel-entry="prayer">Prayer & care</button>':'')+(local()&&p.groupLeader?'<button data-rel-entry="leader">Attendance</button>':'')+(route!=='today'&&local()&&p.teamLeader?'<p>Authorized team responsibility: review the existing dated schedule and local coverage status; confirmation is not attendance.</p><button data-rel-entry="room">Open team coordination</button>':'');
 section.querySelectorAll('[data-rel-entry]').forEach(b=>b.dataset.returnFocus='rel-'+b.dataset.relEntry);
 if(route==='team'&&local()&&p.team){const huddle=document.createElement('section');huddle.className='team-huddle';huddle.innerHTML='<h2>Team huddle</h2><p>Fictional example: arrive at 8:40 AM; huddle begins at 8:45 AM. These are not live schedule observations.</p><button type="button" data-return-focus="huddle-connect">Coordinate with your team</button>';huddle.querySelector('button').onclick=e=>api.navigate('connect','?screen=connect&channel=room',e.currentTarget);section.append(huddle);}
 if(local()&&p.teamLeader){const status=document.createElement('p');status.className='rel-leader-coverage';const session=api.session();status.textContent='Coverage review: '+(!session.valid||session.snapshot.context.team.response==='unknown'?'Dated response data unavailable; review saved state.':session.snapshot.context.team.coverage?'One sample coverage request for the current fictional shift.':'No active sample coverage request for the current fictional shift.')+' Confirmations do not prove attendance; follow-up requires human judgment.';section.append(status);}api.root.append(section);
 }};
}
window.FoundationRelational=Object.freeze({create});
})();
