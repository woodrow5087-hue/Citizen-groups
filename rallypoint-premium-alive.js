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
  function todayPrompt(s,ui){
    let overline='YOUR COMPANION · TODAY',title='',desc='',action='',dest='',pane='';
    if(ui.memberships?.team && s.teamStatus==='pending'){
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
    return '<section class="pa-companion" aria-label="Personalized companion suggestion">'+
      '<div class="pa-companion-top"><span class="pa-pulse" aria-hidden="true"></span>'+overline+'<span class="pa-companion-mark" aria-hidden="true">✳</span></div>'+
      '<h2>'+title+'</h2><p>'+desc+'</p>'+
      '<button type="button" class="pa-companion-link" data-go="'+dest+'"'+(pane?' data-pane="'+pane+'"':'')+'>'+action+' <span aria-hidden="true">↗</span></button>'+
      '</section>';
  }
  function groupSummary(){
    return '<button type="button" class="pa-group-summary" data-action="pane" data-area="group" data-value="gather" aria-label="View next fictional Wednesday Group gathering">'+
      '<span class="pa-summary-mark" aria-hidden="true">♧</span><span class="pa-summary-body"><strong>Wednesday Group</strong><small>8 fictional members · Next gathering Wednesday at 6:30 PM</small></span><span class="pa-summary-arrow" aria-hidden="true">›</span></button>';
  }
  window.RallyHybrid=Object.freeze({peopleRail,todayHero,todayPrompt,groupSummary});
})();