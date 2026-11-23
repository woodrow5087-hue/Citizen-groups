/* Rally One · Companion Care Flow v1
 * Pure, explainable projection of the EXISTING fictional group prayer fixture
 * and the existing companionCare.marcus local state. It never sends messages,
 * infers pastoral risk, identifies people from photos or writes to storage.
 */
(function(root,factory){
  'use strict';
  const api=factory();
  if(typeof module==='object'&&module.exports)module.exports=api;
  if(root)root.RallyCareFlow=api;
})(typeof window!=='undefined'?window:null,function(){
'use strict';
const escape=value=>String(value??'').replace(/[&<>"']/g,ch=>({
  '&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'
}[ch]));
const legitimateTime=value=>typeof value==='string'&&Number.isFinite(Date.parse(value));
function derive({state,member,now=new Date()}={}){
 if(member!==true||!state||!Array.isArray(state.prayers))return null;
 const request=state.prayers.find(item=>item?.name==='Marcus C.'&&typeof item.text==='string'&&item.text.trim());
 if(!request)return null;
 const care=state.companionCare?.marcus;
 const flags=care&&typeof care==='object'&&!Array.isArray(care)?care:{};
 const prayed=legitimateTime(flags.prayedAt);
 const completed=legitimateTime(flags.completedAt);
 const paused=!completed&&legitimateTime(flags.snoozedUntil)&&Date.parse(flags.snoozedUntil)>now.getTime();
 const stage=completed?'followed-up':paused?'paused':prayed?'prayed':'ready';
 return Object.freeze({
   id:'care-marcus',stage,prayed,completed,paused,
   source:'Named sample prayer request in the Wednesday Group',
   person:'Marcus C.',request:request.text.trim().slice(0,160),
   guidance:'You decide whether to pray, write a check-in, or leave this for later. Nothing is sent automatically.'
 });
}
const button=(label,action,kind)=>'<button type="button" class="ro-care-button ro-care-'+kind+
 '" data-action="'+action+'">'+escape(label)+'</button>';
function actionMarkup(m){
 if(m.completed)return button('Back to your group','care-open-groups','main');
 if(m.paused)return button('Resume when ready','care-resume','main');
 const first=m.prayed?button('Write a check-in','companion-encourage','main'):button('Read the request','care-open-prayer','main');
 const second=m.prayed?button('Review prayer','care-open-prayer','secondary'):button('I prayed','care-mark-prayed','secondary');
 return first+second+button('Later','companion-snooze','muted');
}
function render(m,{placement='today'}={}){
 if(!m)return '';
 if(!['today','group','prayer'].includes(placement))return '';
 const compact=placement==='group';
 const eyebrow='RALLY ONE · CARE IN ACTION';
 const title=m.completed?'You followed through.':m.paused?'Care, at your pace.':
   m.prayed?'A moment of care can continue.':'A small moment to care.';
 const detail=m.completed?'A fictional check-in was saved on this device. No real message was delivered.':
  m.paused?'You chose to revisit this local reminder later. Nothing was sent or marked complete.':
  m.prayed?'You marked that you prayed. A personal check-in is optional.':
  'A fictional member shared a prayer request in your Wednesday Group.';
 const steps='<ol class="ro-care-steps" aria-label="Care steps">'+
  '<li class="is-complete">Notice</li>'+
  '<li class="'+(m.prayed?'is-complete':'')+'">Pray</li>'+
  '<li class="'+(m.completed?'is-complete':'')+'">Connect</li>'+
  '</ol>';
 return '<section class="ro-care ro-care--'+placement+'" aria-label="Rally companion care path" data-care-stage="'+m.stage+'">'+
  '<div class="ro-care-header"><span class="ro-care-mark" aria-hidden="true">R<span>.</span></span>'+
  '<span class="ro-care-overline">'+eyebrow+'</span></div>'+
  '<div class="ro-care-copy"><h2>'+escape(title)+'</h2><p>'+escape(detail)+'</p></div>'+
  (!compact?'<blockquote class="ro-care-source"><span>FROM YOUR GROUP · SAMPLE REQUEST</span><p>'+escape(m.person)+': '+escape(m.request)+'</p></blockquote>':'')+
  steps+
  '<div class="ro-care-actions">'+actionMarkup(m)+'</div>'+
  (placement==='today'&&!m.paused?'<button type="button" class="ro-care-connect-link" data-go="group" data-pane="chat" aria-label="Open the existing Wednesday Group conversation in Connect">Open group conversation in Connect <span aria-hidden="true">↗</span></button>':'')+
  '<small class="ro-care-disclaimer">Fictional scenario · human-led · no automatic outreach</small>'+
  '</section>';
}
function renderDraftHint(m){
 if(!m||m.completed||m.paused)return '';
 return '<div class="ro-care-draft-hint" aria-label="Optional care message starter">'+
  '<div><strong>Make it personal.</strong><p>Consider a thoughtful response to the fictional prayer request. Only you decide what to write.</p></div>'+
  button('Use a sample starter','companion-starter','secondary')+
  '<small>Fills the local draft only. Nothing is sent until you choose to post.</small>'+
  '</div>';
}
return Object.freeze({derive,render,renderDraftHint});
});
