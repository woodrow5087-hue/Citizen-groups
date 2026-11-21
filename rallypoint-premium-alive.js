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
  function peopleRail(ui, placement){
    if(!ui || !ui.memberships || !ui.memberships.group) return '';
    const items=portraits.map(function(person){
      return '<li class="pa-person"><button type="button" class="pa-person-trigger" data-action="hybrid-person" data-person="'+person.id+'" aria-label="Open fictional private demo conversation with '+person.name+'">'+
        '<span class="pa-story-ring pa-ring-'+person.ring+'"><span class="pa-story-initials">'+person.initials+'</span><img src="'+person.image+'" alt="" loading="lazy" referrerpolicy="no-referrer"></span>'+
        '<span class="pa-person-name">'+person.name+'</span></button></li>';
    }).join('');
    return '<section class="pa-people-rail pa-people-rail--'+placement+'" aria-label="Your People, fictional profiles">'+
      '<div class="pa-people-heading"><h2>Your people<span class="pa-star" aria-hidden="true">✳</span></h2><span>YOUR CIRCLE · DEMO</span></div>'+
      '<ul class="pa-people-scroll" aria-label="Fictional group members"><li class="pa-person">'+
      '<button type="button" class="pa-person-trigger" data-go="group" data-pane="chat" aria-label="Open fictional Wednesday Group conversation">'+
      '<span class="pa-story-ring pa-ring-primary"><img src="https://images.unsplash.com/photo-1543269865-cbf427effbad?auto=format&fit=crop&w=220&q=78" alt="" loading="lazy" referrerpolicy="no-referrer"></span><span class="pa-person-name">My group</span></button></li>'+items+'</ul>'+
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
  function todayPrompt(s,ui){
    let overline='YOUR COMPANION · TODAY',title='',desc='',action='',dest='',pane='',intent='';
    // A care suggestion is based on a real source *within the fictional local fixture*.
    // No inference from absence, app usage, or unapproved people records.
    const care=s.companionCare?.marcus||{};
    const source=ui.memberships?.group && Array.isArray(s.prayers) &&
      s.prayers.some(p=>p?.name==='Marcus C.' && typeof p.text==='string' && p.text.trim());
    const snoozed=Number.isFinite(Date.parse(care.snoozedUntil)) &&
      Date.parse(care.snoozedUntil)>Date.now();
    const needsCare=source && !care.completedAt && !snoozed;
    if(needsCare){
      overline='A MOMENT TO CONNECT · SAMPLE';
      title='Someone to encourage.';
      desc='Marcus shared a fictional prayer request with your group. Want to send a thoughtful check-in?';
      action='Check in with Marcus';
      intent='companion-encourage';
    }else if(ui.memberships?.team && s.teamStatus==='pending'){
      title='Your team is counting on you.';desc='Review your sample Sunday availability.';action='Review my serve';dest='team';pane='schedule';
    }else if(ui.memberships?.group && s.groupMessages?.length){
      title='A little more life, together.';desc='Your Wednesday Group conversation is ready when you are.';action='Catch up with my group';dest='group';pane='chat';
    }else if(!s.read){
      title='Take a moment in the Word.';desc='Continue your Scripture rhythm with John 15.';action='Open today’s reading';dest='read';
    }else if(!s.prayed){
      title='Carry one another.';desc='Make space for a small moment of prayer today.';action='Open prayer';dest=ui.memberships?.group?'group':'read';pane=ui.memberships?.group?'prayer':'';
    }else{
      title='You showed up today.';desc='Small moments add up. There’s no streak to protect.';action='Explore my reading';dest='read';
    }
    const primary=intent?'data-action="'+intent+'" data-person="marcus"':
      'data-go="'+dest+'"'+(pane?' data-pane="'+pane+'"':'');
    const memory=ui.memberships?.group&&care.completedAt?
      '<p class="pa-care-memory" role="status">✓ You checked in with Marcus · saved in this local demo</p>':'';
    const skip=needsCare?'<button class="pa-care-later" type="button" data-action="companion-snooze">Not now — remind me tomorrow</button>':'';
    return '<section class="pa-companion" aria-label="Personalized companion suggestion">'+
      '<div class="pa-companion-top"><span class="pa-pulse" aria-hidden="true"></span>'+overline+'<button type="button" class="pa-companion-more" data-action="quick-actions" title="More ways to connect" aria-label="Open companion quick actions">✳</button></div>'+
      '<h2>'+title+'</h2><p>'+desc+'</p>'+
      '<button type="button" class="pa-companion-link" '+primary+'>'+action+' <span aria-hidden="true">↗</span></button>'+
      skip+memory+rhythmFollowup(s)+
      '</section>';
  }
  function groupSummary(){
    return '<button type="button" class="pa-group-summary" data-go="group" data-pane="gather" aria-label="View next fictional Wednesday Group gathering">'+
      '<span class="pa-summary-mark" aria-hidden="true">♧</span><span class="pa-summary-body"><strong>Wednesday Group</strong><small>8 fictional members · Next gathering Wednesday at 6:30 PM</small></span><span class="pa-summary-arrow" aria-hidden="true">›</span></button>';
  }
  window.RallyHybrid=Object.freeze({peopleRail,todayHero,todayPrompt,groupSummary,rhythmEditor,rhythmFollowup});
})();