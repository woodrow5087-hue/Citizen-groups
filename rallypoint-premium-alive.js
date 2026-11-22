/* Rally Point Premium ALIVE Hybrid — first-party presentation helpers.
 * Visual target: red/charcoal Premium Hybrid 4-screen reference.
 * All personas, group events and responses are fictional local demo fixtures.
 * No external writes, access tokens, account lookups or new storage keys. */
(function attachPremiumAlive(){
  'use strict';
  const portraits = [
    {id:'anna', name:'Anna', initials:'AL', image:'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=78',ring:'rose'},
    {id:'jess', name:'Jess', initials:'JW', image:'https://images.unsplash.com/photo-1531123897727-8f129e1688ce?auto=format&fit=crop&w=200&q=78',ring:'mint'},
    {id:'marcus', name:'Marcus', initials:'MC', image:'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=78',ring:'blue'},
    {id:'taylor', name:'Taylor', initials:'TD', image:'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=200&q=78',ring:'amber'}
  ];
  function peopleRail(ui, placement, people=portraits, groupImage='https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=220&q=78'){
    if(!ui || !ui.memberships || !ui.memberships.group) return '';
    const items=people.map(function(person){
      return '<li class="pa-person"><button type="button" class="pa-person-trigger" data-action="hybrid-person" data-person="'+person.id+'" aria-label="Open fictional private demo conversation with '+person.name+'">'+
        '<span class="pa-story-ring pa-ring-'+person.ring+'"><span class="pa-story-initials">'+person.initials+'</span><img src="'+person.image+'" alt="" loading="lazy" referrerpolicy="no-referrer"></span>'+
        '<span class="pa-person-name">'+person.name+'</span></button></li>';
    }).join('');
    return '<section class="pa-people-rail pa-people-rail--'+placement+'" aria-label="Your People, fictional profiles">'+
      '<div class="pa-people-heading"><h2>Your people<span class="pa-star" aria-hidden="true">✳</span></h2><span>YOUR CIRCLE · DEMO</span></div>'+
      '<ul class="pa-people-scroll" aria-label="Fictional group members"><li class="pa-person">'+
      '<button type="button" class="pa-person-trigger" data-go="group" data-pane="chat" aria-label="Open fictional Wednesday Group conversation">'+
      '<span class="pa-story-ring pa-ring-primary"><img src="'+groupImage+'" alt="" loading="lazy" referrerpolicy="no-referrer"></span><span class="pa-person-name">My group</span></button></li>'+items+'</ul>'+
      '</section>';
  }
  function todayHero(ui){
    const hasGroup=!!ui?.memberships?.group;
    return '<button type="button" class="pa-today-hero" data-go="group" data-pane="'+(hasGroup?'chat':'')+'" aria-label="'+(hasGroup?'Open fictional Wednesday Group':'Explore fictional groups')+'">'+
      '<img class="pa-hero-photo" alt="" src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=1000&q=82" referrerpolicy="no-referrer">'+
      '<span class="pa-hero-scrim"></span><span class="pa-hero-heading"><strong>Your people.<br>Your place.</strong><small>A community to grow, serve, and follow Jesus.</small></span>'+
      '<span class="pa-hero-bottom">'+(hasGroup?'WEDNESDAY GROUP · OPEN CONVERSATION':'FIND YOUR PEOPLE · EXPLORE GROUPS')+' <span aria-hidden="true">↗</span></span>'+
      '</button>';
  }
  const escapeNote=value=>String(value??'').replace(/[&<>"']/g,ch=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  const rhythmData=s=>{
    const v=s?.rhythm;
    return v&&typeof v==='object'&&!Array.isArray(v)&&typeof v.text==='string'?v:null;
  };
  function rhythmEditor(s,plan){
    const item=rhythmData(s),note=item?.text||'';
    return '<div class="pa-rhythm-editor" aria-label="Carry the reading into your week">'+
      '<div class="pa-rhythm-overline">SUNDAY → EVERYDAY · YOUR NEXT STEP</div>'+
      '<h3>Take it into the week.</h3><p>Based on '+escapeNote(plan.passage)+', name one small, meaningful action you could take.</p>'+
      '<label for="rhythm-input">One thing I want to do</label>'+
      '<textarea id="rhythm-input" rows="2" maxlength="160" placeholder="Example: Encourage someone in my group…">'+escapeNote(note)+'</textarea>'+
      '<div class="pa-rhythm-editor-actions"><button type="button" data-action="rhythm-save" class="pa-rhythm-save">'+(note?'Update my step':'Save for tomorrow')+'</button>'+
      (note?'<button type="button" data-action="rhythm-clear" class="pa-rhythm-remove">Clear</button>':'')+'</div>'+
      '<p class="pa-rhythm-privacy">This fictional demo keeps your note on this device only. It will reappear when you open Rally Point tomorrow. No notifications are sent.</p>'+
      '</div>';
  }
  function rhythmFollowup(s,now=new Date()){
    const item=rhythmData(s);
    if(!item?.text)return '';
    const due=Number.isFinite(Date.parse(item.followUpAt))&&Date.parse(item.followUpAt)<=now.getTime();
    const done=!!item.completedAt;
    const label=done?'YOU FOLLOWED THROUGH':due?'YOUR STEP FOR TODAY':'A SMALL STEP FOR TOMORROW';
    const buttons=done?
      '<button type="button" data-go="read" data-reading="questions" class="pa-rhythm-link">Choose another step ↗</button>':
      due?'<div class="pa-rhythm-buttons"><button type="button" data-action="rhythm-complete" class="pa-rhythm-complete">I did it ✓</button>'+
        '<button type="button" data-action="rhythm-defer" class="pa-rhythm-defer">Tomorrow instead</button></div>':
      '<button type="button" data-go="read" data-reading="questions" class="pa-rhythm-link">Edit my step ↗</button>';
    return '<div class="pa-rhythm-followup" aria-label="Your private Scripture follow-through">'+
      '<div class="pa-rhythm-small-head"><span aria-hidden="true">✳</span>'+label+'</div>'+
      '<p class="pa-rhythm-note">'+escapeNote(item.text.slice(0,160))+'</p>'+
      '<small>From '+escapeNote(item.passage||'your reading')+' · private local demo</small>'+
      buttons+'</div>';
  }
  function todayPrompt(s,ui,conversation){
    // All priorities come from one explainable, read-only F-08 decision.
    // The same modern F-02 cursor used by Today and Groups is passed through.
    const d=window.RallyCompanionDecision.choose({state:s,ui,conversation,now:new Date()});
    const care=s.companionCare?.marcus||{};
    const primary=d.intent?'data-action="'+d.intent+'" data-person="marcus"':
      'data-go="'+d.dest+'"'+(d.pane?' data-pane="'+d.pane+'"':'');
    const memory=ui.memberships?.group&&care.completedAt?
      '<p class="pa-care-memory" role="status">✓ You checked in with Marcus · saved in this local demo</p>':'';
    const skip=d.id==='care-marcus'?
      '<button class="pa-care-later" type="button" data-action="companion-snooze">Not now — remind me tomorrow</button>':
      d.deferable?'<button class="pa-care-later" type="button" data-action="companion-later" data-value="'+d.id+'">Not right now · show another idea</button>':'';
    return '<section class="pa-companion" aria-label="Personalized companion suggestion" data-suggestion="'+d.id+'">'+
      '<div class="pa-companion-top"><span class="pa-pulse" aria-hidden="true"></span>'+escapeNote(d.overline)+
      '<button type="button" class="pa-companion-more" data-action="quick-actions" title="More ways to connect" aria-label="Open companion quick actions">✳</button></div>'+
      '<h2>'+escapeNote(d.title)+'</h2><p>'+escapeNote(d.description)+'</p>'+
      '<button type="button" class="pa-companion-link" '+primary+'>'+escapeNote(d.action)+' <span aria-hidden="true">↗</span></button>'+
      '<p class="pa-companion-why"><strong>WHY THIS?</strong> '+escapeNote(d.why)+'</p>'+
      skip+memory+rhythmFollowup(s)+
      '</section>';
  }
  function groupSummary(){
    return '<button type="button" class="pa-group-summary" data-go="group" data-pane="gather" aria-label="View next fictional Wednesday Group gathering">'+
      '<span class="pa-summary-mark" aria-hidden="true">♧</span><span class="pa-summary-body"><strong>Wednesday Group</strong><small>8 fictional members · Next gathering Wednesday at 6:30 PM</small></span><span class="pa-summary-arrow" aria-hidden="true">›</span></button>';
  }
  window.RallyHybrid=Object.freeze({peopleRail,todayHero,todayPrompt,groupSummary,rhythmEditor,rhythmFollowup,portraits:Object.freeze(portraits.map(person=>Object.freeze({...person})))});
})();
