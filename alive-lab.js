/* Rally Point: Alive — isolated UX experiment.
   All people, stories, group meetings and actions are fictional fixtures.
   No Planning Center access, accounts or network writes. No impact on v0.8.
*/
(()=>{
'use strict';
const KEY='rallypoint-alive-lab-v1';
const state={tab:'today',groupTab:'mine',rsvp:false,prayed:false,read:false,hello:false,campus:'Central',reply:'',seen:{},saved:{}};
try{
  const stored=JSON.parse(localStorage.getItem(KEY)||'null');
  if(stored&&typeof stored==='object'){
    for(const name of ['rsvp','prayed','read','hello'])if(typeof stored[name]==='boolean')state[name]=stored[name];
    if(stored.campus==='North')state.campus='North';
    if(typeof stored.reply==='string')state.reply=stored.reply.slice(0,500);
    if(stored.seen && typeof stored.seen==='object')state.seen=stored.seen;
    if(stored.saved&&typeof stored.saved==='object')state.saved=stored.saved;
  }
}catch{}
const $=selector=>document.querySelector(selector);
const shell=$('#screen-scroll');
const sheet=$('#sheet-layer');
const content=$('#sheet-content');
const toast=$('#alive-toast');
let toastTimer=null,lastFocus=null;
const people={
  maya:{name:'Maya',headline:'A little joy goes a long way.',note:'Sample story: Maya brought dessert to group last week. Nobody left hungry.',image:'assets/recap/maya.jpg'},
  chris:{name:'Chris',headline:'Better when we show up.',note:'Sample story: Chris is bringing extra chairs for the next Wednesday gathering.',image:'assets/recap/chris.jpg'},
  nia:{name:'Nia',headline:'There’s room at the table.',note:'Sample story: Nia invited a friend to dinner. A simple invitation made a difference.',image:'assets/recap/nia.jpg'},
  james:{name:'James',headline:'Real people. Real moments.',note:'Sample story: James helped welcome someone new at church this Sunday.',image:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=600&q=80'}
};
const escapeHTML=value=>String(value).replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
const save=()=>{
  try{localStorage.setItem(KEY,JSON.stringify({rsvp:state.rsvp,prayed:state.prayed,read:state.read,hello:state.hello,saved:state.saved,campus:state.campus,reply:state.reply,seen:state.seen}));}catch{}
};
function notify(text){
  toast.textContent=text;
  toast.hidden=false;
  clearTimeout(toastTimer);
  toastTimer=setTimeout(()=>{toast.hidden=true},2900);
}
function view(tab,{groupTab}={}){
  if(tab==='read'){openSheet('scripture');return;}
  if(tab==='team'){openSheet('serving');return;}
  if(!['today','groups'].includes(tab))return;
  closeSheet(false);
  state.tab=tab;
  if(groupTab)state.groupTab=groupTab;
  $('#view-today').hidden=tab!=='today';
  $('#view-groups').hidden=tab!=='groups';
  document.querySelectorAll('[data-nav]').forEach(button=>{
    if(button.dataset.nav===tab)button.setAttribute('aria-current','page');
    else button.removeAttribute('aria-current');
  });
  document.querySelectorAll('[data-action="group-tab"]').forEach(button=>{
    const selected=button.dataset.value===state.groupTab;
    button.classList.toggle('is-selected',selected);
    button.setAttribute('aria-selected',String(selected));
  });
  $('#group-mine').hidden=state.groupTab!=='mine';
  $('#group-explore').hidden=state.groupTab!=='explore';
  const rsvp=$('#rsvp-label');rsvp.textContent=state.rsvp?"You're on the list ✓":'Count me in';
  $('#rsvp-icon').textContent=state.rsvp?'✓':'↗';
  $('.rsvp-button').classList.toggle('is-going',state.rsvp);
  shell.scrollTop=0;
}
function closeSheet(restore=true){
  if(sheet.hidden)return;
  sheet.hidden=true;
  content.innerHTML='';
  if(restore&&lastFocus?.isConnected)lastFocus.focus({preventScroll:true});
}
function openSheet(kind,detail){
  if(sheet.hidden)lastFocus=document.activeElement;
  toast.hidden=true;
  clearTimeout(toastTimer);
  let markup='';
  switch(kind){
    case 'info':
      markup='<span class="sheet-eyebrow">DESIGN EXPERIMENT · 01</span><h2>Less dashboard.<br><em>More life.</em></h2><p>Rally Point Alive is an isolated visual and interaction experiment. Member profiles and group activity are examples. Sunday’s recap, Prayer Room details and campus albums come from Citizen Church. Your approved v0.8 build remains unchanged.</p><p>Try the people stories, Wednesday group, sample RSVP, Scripture, prayer, and the Explore tab. Then decide how the experience feels.</p><button type="button" class="sheet-button" data-action="reset-lab">Start this concept over <span>↺</span></button><a class="sheet-button secondary" href="https://deploy-preview-32--citizen-connect-test.netlify.app/?welcome=1">Open approved v0.8 <span>↗</span></a><small class="sheet-note">Member portraits are illustrative. No real account or church messaging is connected.</small>';
      break;
    case 'person':{
      const p=people[detail];if(!p)return;
      markup='<span class="sheet-eyebrow">YOUR PEOPLE · SAMPLE STORY</span><h2>'+escapeHTML(p.headline)+'</h2><img class="sheet-photo" src="'+p.image+'" alt="Fictional sample profile photograph"><span class="sheet-pill">'+escapeHTML(p.name)+' · WEDNESDAY GROUP</span><p>'+escapeHTML(p.note)+'</p><button type="button" class="sheet-button" data-action="open-my-group">See the whole group <span>↗</span></button>';
      break;
    }
    case 'scripture':
      markup='<span class="sheet-eyebrow">01 / SCRIPTURE · DAILY RHYTHM</span><h2>Read it.<br><em>Live it.</em></h2><div class="sheet-verse">“This is My commandment, that you love one another as I have loved you.”</div><span class="sheet-pill">JOHN 15:12 · BSB</span><p>A short verse. A big way to live. Think of one person you can show love to today.</p>'+(state.read?'<span class="state-chip">✓ Marked read in this concept</span>':'')+'<button type="button" class="sheet-button" data-action="read-complete">'+(state.read?'Read again tomorrow':'Mark this reading complete')+' <span>✓</span></button><a class="sheet-button secondary" href="https://deploy-preview-32--citizen-connect-test.netlify.app/?welcome=1">Explore existing Read + VersePlay <span>↗</span></a><small class="sheet-note">Demo-only completion, saved to this browser. No live reading-plan integration is connected.</small>';
      break;
    case 'prayer':
      markup='<span class="sheet-eyebrow">02 / PRAYER · LOOK OUT FOR EACH OTHER</span><h2>Carry one<br><em>another.</em></h2><p>Some moments don’t need a big production. They just need someone who cares.</p><div class="sample-message"><strong>NIA · FICTIONAL SAMPLE</strong><p>“Praying for peace and energy as a busy week gets going.”</p></div><p>Take a few seconds to think of a friend you could encourage.</p>'+(state.prayed?'<span class="state-chip">✓ Prayer marked in this concept</span>':'')+'<button type="button" class="sheet-button" data-action="mark-prayed">'+(state.prayed?'Prayer remembered':'I prayed for this')+' <span>♡</span></button><small class="sheet-note">This is a fictional example. Never enter a real private prayer request into the concept lab.</small>';
      break;
    case 'serving':
      markup='<span class="sheet-eyebrow">03 / SERVE · SAMPLE OPPORTUNITY</span><h2>Be somebody’s<br><em>welcome.</em></h2><p>Sample Welcome Team shift: Sunday morning. This card demonstrates how serving could feel more like joining something meaningful.</p><div class="sample-message"><strong>WELCOME TEAM · FICTIONAL</strong><p>“A warm smile can change someone’s first five minutes.”</p></div><a class="sheet-button" href="https://citizenchurch.churchcenter.com/people/forms/359182">Join a serve team <span>↗</span></a><small class="sheet-note">No real shift, schedule confirmation, or Planning Center connection is represented here.</small>';
      break;
    case 'notes':
      markup=`<span class="sheet-eyebrow">SUNDAY RECAP · NOV 15</span><h2>Sermon notes</h2><p>This Is a House of Generosity · Pastor Dustin Woodward</p>
      <h3>1. Sees giving God’s way</h3><p>David recognized that everything he could offer had first come from God. What resources, gifts, or time have you received? · 1 Chronicles 29:10–16</p>
      <h3>2. Gives while it builds</h3><p>Even as the church in Antioch was growing, believers sent help to people facing famine in Judea. · Acts 11:27–30</p>
      <h3>3. Sends when God calls</h3><p>The church prayed and sent Barnabas and Saul. Generosity can mean releasing people for work beyond your own community. · Acts 13:1–4</p>
      <button class="sheet-button" data-action="discuss">Discuss with my group ↗</button>`;
      break;
    case 'chat': 
      markup=`<span class="sheet-eyebrow">WEDNESDAY GROUP · SUNDAY DISCUSSION</span><h2>This Is a House of Generosity</h2>
        <p>${escapeHTML($('.weekly-question').textContent)}</p>
        <div class="sample-message"><strong>MAYA · SAMPLE</strong><p>I could make an extra plate for my neighbor when we cook this week.</p></div>
        ${state.reply?'<div class="sample-message new"><strong>YOU</strong><p>'+escapeHTML(state.reply)+'</p></div>':''}
        <form id="reply-form"><label for="reply">Your reflection</label>
        <textarea id="reply" maxlength="500" required rows="3"></textarea>
        <small class="sheet-note">Preview discussion. Your reflection stays on this device.</small>
        <button class="sheet-button">Save reflection</button></form>`;
      break;
    case 'preview-group':{
      const groups={north:{name:'Northside Crew',detail:'Weeknights · Mixed ages',copy:'A fictional circle for good conversation, thoughtful questions, and shared meals.'},young:{name:'Young Adults',detail:'Sunday evenings · 20s and 30s',copy:'A fictional gathering of people figuring out life and faith together.'}};
      const g=groups[detail];if(!g)return;
      markup='<span class="sheet-eyebrow">EXPLORE · FICTIONAL GROUP PREVIEW</span><h2>'+escapeHTML(g.name)+'</h2><span class="sheet-pill">'+escapeHTML(g.detail)+'</span><p>'+escapeHTML(g.copy)+'</p>'+(state.saved[detail]?'<span class="state-chip">✓ Saved in this concept</span>':'')+'<button type="button" class="sheet-button" data-action="save-group" data-value="'+detail+'">'+(state.saved[detail]?'Remove saved sample':'Save this group to explore')+' <span>↗</span></button><small class="sheet-note">This is not a real group directory, expression of interest, or membership request.</small>';
      break;
    }
    default:return;
  }
  content.innerHTML='<div class="sheet-inner" id="sheet-title">'+markup+'</div>';
  sheet.hidden=false;
  $('.sheet-close').focus({preventScroll:true});
}
document.addEventListener('click',event=>{
  const nav=event.target.closest('[data-nav]');
  if(nav){view(nav.dataset.nav);return;}
  const target=event.target.closest('[data-action]');
  if(!target)return;
  const action=target.dataset.action,value=target.dataset.value;
  if(action==='close-sheet'){closeSheet();return;}
  if(action==='open-lab-info'){openSheet('info');return;}
  if(action==='reset-lab'){try{localStorage.removeItem(KEY)}catch{}location.reload();return;}
  if(action==='go-groups'||action==='open-my-group'){view('groups',{groupTab:'mine'});return;}
  if(action==='group-tab'){state.groupTab=value;view('groups');return;}
  if(action==='notes'){openSheet('notes');return;}
  if(action==='discuss'){view('groups',{groupTab:'mine'});$('.action-chat').focus({preventScroll:true});openSheet('chat');return;}
  if(action==='person'){state.seen[value]=true;save();refreshStories();openSheet('person',value);return;}
  if(action==='open-scripture'){openSheet('scripture');return;}
  if(action==='open-prayer'){openSheet('prayer');return;}
  if(action==='open-serving'){openSheet('serving');return;}
  if(action==='open-chat'){openSheet('chat');return;}
  if(action==='preview-group'){openSheet('preview-group',value);return;}
  if(action==='rsvp'){state.rsvp=!state.rsvp;save();view('groups');notify(state.rsvp?'Sample RSVP saved in this concept. No real reservation was made.':'Sample RSVP removed. Nothing was sent.');return;}
  if(action==='read-complete'){state.read=true;save();openSheet('scripture');notify('Marked read locally · fictional concept');return;}
  if(action==='mark-prayed'){state.prayed=!state.prayed;save();openSheet('prayer');notify(state.prayed?'A small moment, remembered locally.':'Sample prayer mark cleared.');return;}
  if(action==='post-hello'){state.hello=true;save();openSheet('chat');notify('Fictional hello saved in this browser only.');return;}
  if(action==='save-group'){state.saved[value]=!state.saved[value];save();openSheet('preview-group',value);return;}
});
document.addEventListener('keydown',event=>{
  if(event.key==='Escape'&&!sheet.hidden){event.preventDefault();closeSheet();}
  if(event.key==='Tab'&&!sheet.hidden){
    const focusable=[...sheet.querySelectorAll('button:not(:disabled),a[href],textarea')].filter(node=>node.getClientRects().length);
    if(!focusable.length)return;
    const first=focusable[0],last=focusable[focusable.length-1];
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}
    else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
const campuses={
  Central:{album:'https://citizenchurch.smugmug.com/AbqCampus/2026/Sermon-Series/This-is-A-House/WEEK-3',hours:'Mondays · 11 AM–1 PM · Kids Auditorium'},
  North:{album:'https://citizenchurch.smugmug.com/North-Campus/2026/SERMON-SERIES/THIS-IS-A-HOUSE-OF',hours:'Monday–Saturday · 6–9 AM · Main Auditorium'}
};
function refreshCampus(){
  const current=state.campus;
  $('#campus').value=current;
  $('#prayer-campus').textContent='Prayer Room · '+current;
  $('#prayer-hours').textContent=campuses[current].hours;
  $('#albums').innerHTML=[current,current==='North'?'Central':'North'].map(name=>
    `<a class="album" href="${campuses[name].album}"><img alt="" src="assets/recap/${name.toLowerCase()}.jpg"><span><strong>${name}</strong><small>View photos ↗</small></span></a>`).join('');
}
function refreshStories(){
  document.querySelectorAll('[data-action="person"]').forEach(button=>{
    const seen=Boolean(state.seen[button.dataset.value]);
    button.classList.toggle('seen',seen);
    button.setAttribute('aria-label',button.querySelector('.story-label').textContent+(seen?' · viewed sample story':' · new sample story'));
  });
}
$('#campus').addEventListener('change',event=>{state.campus=event.target.value;save();refreshCampus();});
document.addEventListener('submit',event=>{
  if(event.target.id!=='reply-form')return;
  event.preventDefault();
  const reply=$('#reply').value.trim();
  if(!reply){$('#reply').focus();return;}
  state.reply=reply;save();openSheet('chat');notify('Reflection saved on this device.');
});
refreshStories();
refreshCampus();
view('today');
})();
