/* Studio 13 Stage 1: presentation over the existing intelligence/board output.
 * No ranking, storage, fixture state, permissions or action dispatch ownership.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RallyStudioToday=api;})(typeof window==='undefined'?null:window,function(){
'use strict';
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
const messageIcon='<svg class="s13-message-glyph" viewBox="0 0 24 24" aria-hidden="true" focusable="false" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round"><path d="M6 4h12a3 3 0 0 1 3 3v8a3 3 0 0 1-3 3h-7l-5 3v-3a3 3 0 0 1-3-3V7a3 3 0 0 1 3-3Z"/><circle cx="8.5" cy="11" r=".85" fill="currentColor" stroke="none"/><circle cx="12" cy="11" r=".85" fill="currentColor" stroke="none"/><circle cx="15.5" cy="11" r=".85" fill="currentColor" stroke="none"/></svg>';
function render(html,{model:d,board:b,now,campus}={},doc=globalThis.document){
 if(!doc||!d||!b?.hero)return html;
 const template=doc.createElement('template');template.innerHTML=html;
 const root=template.content.querySelector('.f09-board');if(!root)return html;
 root.classList.add('s13-today');root.setAttribute('aria-label','Today');
 const node=(tag,cls,text)=>{const el=doc.createElement(tag);el.className=cls;if(text!==undefined)el.textContent=text;return el;};
 const h=b.hero,allSet=b.caughtUp===true;
 const requiredIds=new Set(b.responsibilityIds||[b.hero,...b.rows].filter(x=>['group-rsvp','serve-response','leader-checkins'].includes(x.id)).map(x=>x.id));
 const hasPending=!!(d.member&&!d.rsvp||d.team&&d.serveStatus==='pending'||d.member&&d.audience==='leader'&&d.leaderRemaining>0);
 const clearCommitments=!hasPending&&!!(d.member||d.team)&&['group-unread','care-prayer','care-check-in','scripture-step'].includes(h.id)&&!(d.member&&d.conversationStatus==='unavailable');
 const calm=allSet||clearCommitments;
 const head=root.querySelector('.f09-greeting');head.replaceChildren();
 head.append(node('span','s13-eyebrow',[d.nowLabel,campus&&campus+' campus'].filter(Boolean).join(' · ')));
 head.append(node('h1','',calm?'You’re all set.':h.id==='welcome-community'?'Glad you’re here.':h.id==='paused'?h.title:(d.greeting||'Welcome back')+'.'));
 const count=requiredIds.size;
 head.append(node('p','s13-summary'+(calm?' is-complete':''),calm?'Nothing needs your response.':h.id==='paused'?h.subtitle:h.id==='welcome-community'?'Explore at your pace.':count?count+' '+(count===1?'thing needs':'things need')+' your response':hasPending?'A commitment remains to review':'Your next step'));
 const priority=root.querySelector('.f09b-hero'),title=priority.querySelector('h2'),detail=priority.querySelector('.f09b-hero-main>p');
 const primary=priority.querySelector('.f09b-primary'),explain=priority.querySelector('.f09b-explain');
 const faces=priority.querySelector('.f09b-faces');
 // Compact controls replace the permanent bottom-of-page dashboard.
 const ask=root.querySelector('.f10-entry');
 if(ask){
  const askButton=ask.querySelector('[data-action="f10-open"]');
  if(askButton){askButton.className='s13-ask-trigger';askButton.textContent='Ask';askButton.setAttribute('aria-label','Ask Rally');head.append(askButton);}
  ask.remove();
 }
 if(explain){
  explain.classList.add('s13-info');
  const summary=explain.querySelector('summary');
  if(summary){summary.textContent='i';summary.setAttribute('aria-label','Why this priority?');summary.title='Why this priority?';}
 }
 const placeholder=(large=false)=>{
  const el=node('div','s13-image-placeholder'+(large?' is-wide':''));
  if((d.member&&large)||h.id==='group-rsvp'||h.id==='welcome-community'){
   const img=node('img','');img.src='assets/rally-one/community.webp';img.alt='';img.decoding='async';el.append(img);
  }else{
   el.setAttribute('aria-hidden','true');el.classList.add('s13-editorial-art');
   el.append(node('strong','',h.id==='serve-response'||d.team&&!d.member?'HERE TO SERVE.':'LIFE TOGETHER.'));
  }
  return el;
 };
 const dateFor=id=>id==='group-rsvp'?d.groupDate:id==='serve-response'?d.serveDate:null;
 const valid=date=>date instanceof Date&&Number.isFinite(date.valueOf());
 const dateLabel=date=>valid(date)?(date.toDateString()===now.toDateString()?'Today':date.toLocaleDateString('en-US',{weekday:'short'}))+' · '+date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}):'';
 if(calm){
  priority.classList.add('s13-settled');if(clearCommitments)priority.classList.add('s13-commitments-clear');
  title.textContent=d.member?'Life is better together.':'Small acts. Real impact.';
  detail.textContent=d.member?'Take a moment to connect with your people.':'Your serving community is here for you.';
  const body=node('div','s13-settled-copy');body.append(title,detail);priority.replaceChildren(placeholder(true),body);
  if(allSet&&explain)body.append(explain);
  // This is a presentation state only: never alter the canonical caught-up flag.
  if(clearCommitments)priority.removeAttribute('data-priority');
 }else{
  const top=node('div','s13-priority-meta');top.append(node('span','s13-kicker',h.eyebrow==='NEXT UP'?'UP NEXT':h.eyebrow),node('span','',dateLabel(dateFor(h.id))));
  const line=node('div','s13-priority-line'),copy=node('div','s13-priority-copy');
  if(h.id==='group-rsvp')title.textContent=b.agenda.find(a=>a.id==='group')?.title||h.title;
  if(h.id==='serve-response')title.textContent=b.agenda.find(a=>a.id==='serve')?.title||h.title;
  if(h.id==='group-rsvp'&&d.groupLocation)detail.textContent=d.groupLocation;
  if(h.id==='serve-response'&&d.serveLocation)detail.textContent=d.serveLocation;
  copy.append(title,detail);if(faces)copy.append(faces);line.append(copy,placeholder());
  const actionLabel=h.id==='group-rsvp'&&valid(d.groupDate)?'RSVP for '+(d.groupDate.toDateString()===now.toDateString()&&d.groupDate.getHours()>=17?'tonight':d.groupDate.toLocaleDateString('en-US',{weekday:'long'})):h.id==='serve-response'?'Confirm availability':h.heroLabel;
  primary.replaceChildren(doc.createTextNode(actionLabel),node('span','s13-arrow'));primary.lastChild.innerHTML=arrow;
  priority.replaceChildren(top,line,primary);
  if(explain)top.append(explain);
 }
 const priorities=root.querySelector('.f09b-priorities'),rows=root.querySelector('.f09b-row-stack');
 const responseRows=[...rows.querySelectorAll('.is-actionable')];
 const requiredRows=responseRows.filter(r=>requiredIds.has(r.dataset.row));
 // Non-commitment suggestions already have homes in Groups, Connect and Read.
 // Preserve an unavailable-conversation action rather than treating unknown data as read.
 const unavailableRow=responseRows.find(r=>r.dataset.row==='group-unavailable');
 for(const row of [...rows.children])if(!requiredRows.includes(row))row.remove();
 for(const row of responseRows){const item=b.agenda.find(a=>a.id===(row.dataset.row==='serve-response'?'serve':row.dataset.row==='group-rsvp'?'group':''));if(item)row.querySelector('.f09b-row-copy strong').textContent=item.title;}
 if(requiredRows.length){const label=node('div','s13-section-head');label.append(node('h2','','Also needs a response'),node('small','',requiredRows.length+' remaining here'));priorities.append(label,rows);}
 else rows.remove();
 const glance=root.querySelector('.f09b-glance');
 const agendaRows=[...glance.querySelectorAll('[data-agenda]')];
 const schedule=node('section','s13-coming');schedule.setAttribute('aria-label','Coming up');
 const label=node('div','s13-section-head');label.append(node('h2','','Coming up'),node('small','','Your schedule'));schedule.append(label);
 const list=node('div','s13-agenda');
 for(const row of agendaRows){
  const id=row.dataset.agenda;if(id==='scripture'||id==='group'&&!d.member||id==='serve'&&!d.team)continue;
  const date=id==='group'?d.groupDate:d.serveDate;
  const badge=node('span','s13-date');badge.setAttribute('aria-hidden','true');
  if(valid(date))badge.append(node('small','',date.toLocaleDateString('en-US',{weekday:'short'})),node('b','',date.getDate()));else badge.append(node('small','','—'));
  row.querySelector('.f09b-agenda-icon')?.remove();
  const link=node('button','s13-schedule-link');link.type='button';link.dataset.go=id==='group'?'group':'team';link.dataset.pane=id==='group'?'gather':'schedule';
  link.append(badge,...row.childNodes);row.replaceChildren(link);list.append(row);
 }
 if(list.children.length){schedule.append(list);priorities.append(schedule);}glance.remove();
 const utility=(title,sub,go,pane='',type='message')=>{
  const button=node('button','s13-utility');button.type='button';button.dataset.go=go;if(pane)button.dataset.pane=pane;
  const mark=node('span','s13-utility-icon');mark.setAttribute('aria-hidden','true');mark.innerHTML=type==='read'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/></svg>':messageIcon;
  const copy=node('span','s13-utility-copy');copy.append(node('strong','',title),node('small','',sub));const next=node('span','s13-arrow');next.setAttribute('aria-hidden','true');next.innerHTML=arrow;button.append(mark,copy,next);return button;
 };
 const optional=node('div','s13-optional');
 const messageNeeded=d.member&&(d.conversationStatus==='unavailable'||d.unread>0);
 const primaryIsMessage=!calm&&['group-unread','group-unavailable'].includes(h.id);
 if(messageNeeded&&!primaryIsMessage){
  if(unavailableRow&&d.conversationStatus==='unavailable')optional.append(unavailableRow);
  else optional.append(utility(d.conversationStatus==='unavailable'?'Review your conversation':d.unread+' new group '+(d.unread===1?'message':'messages'),d.conversationStatus==='unavailable'?'Conversation data unavailable':'Wednesday Group','group','chat'));
 }
 // Reading is an invitation, not a required response. A completed reading
 // never needs its own Today card; a saved due intention stays reachable in Read.
 if((calm||!optional.children.length)&&(!d.readToday||d.rhythmDue===true)&&!(h.id==='scripture-step'&&!calm)){
  optional.append(utility(d.rhythmDue===true?'Review your saved Scripture step':'A moment with God',d.passage||'Your Scripture reading','read','','read'));
 }
 if(optional.children.length)priorities.append(optional);
 // Member rail, community shortcut, and optional prayer suggestions live on
 // their existing destination screens; do not create duplicate Today's actions.
 root.querySelector('.gv2-today-people')?.remove();
 root.querySelector('.f09b-mission')?.remove();
 const footer=root.querySelector('.f09b-footer');
 if(footer){
  // Keep the local-demo disclosure, not the obsolete layout comparison shortcuts.
  footer.querySelectorAll('a').forEach(link=>link.remove());
 }

 return root.outerHTML;
}
// Studio 13 presentation transplant: rearrange existing authorized nodes, never copy
// the studio fixture state or introduce handlers. Existing renderers remain owners.
// ALIVE 01: shared presentation roles, applied to existing nodes only.
// This does not create actions, intercept events, or own member state.
const componentRoles=Object.freeze({
 's13-component-feature':'.gv2-group-hero,.gv2-widget-gather,.team-schedule-card,.s13-gather-card,.ux-reading-feature,.read-scripture-card',
 's13-component-row':'.gv2-widget-chat,.gv2-care,.team-message-preview,.s13-assignment-detail,.ux-disclosure,.s13-read-panel,.ux-circuit',
 's13-component-action':'.gv2-hero-action,.gv2-widget-cta,.team-shift-actions .btn,.s13-gather-actions .btn,.ux-reading-feature .ux-cta,.read-scripture-card .btn',
 's13-component-title':'.gv2-heading h1,.team-v08-hero h1,.ux-read-heading h1,.gv2-detail-heading h1',
 's13-component-section':'.s13-subhead',
 's13-component-icon':'.gv2-widget-icon,.gv2-care-icon'
});
function applyCraft(view){
 for(const [role,selector] of Object.entries(componentRoles)){
  view.querySelectorAll(selector).forEach(el=>el.classList.add(role));
 }
 // Use the same conventional chat mark in Team as in Today, Groups and the header.
 const teamChat=view.querySelector('.team-message-preview-top svg:first-child');
 if(teamChat){
  const mark=view.ownerDocument.createElement('span');mark.className='s13-component-icon';mark.setAttribute('aria-hidden','true');
  mark.innerHTML=messageIcon;teamChat.replaceWith(mark);
 }
}
function unify(view){
 const doc=view.ownerDocument;
 const node=(tag,cls,text)=>{const n=doc.createElement(tag);n.className=cls;if(text!==undefined)n.textContent=text;return n;};
 const group=view.querySelector('.gv2-home');
 if(group&&!group.classList.contains('s13-belong')){
  group.classList.add('s13-belong');
  const header=group.querySelector('.gv2-heading-row'),title=header?.querySelector('h1'),label=header?.querySelector('small');
  if(title)title.textContent='Your people.';
  if(header&&label){label.textContent='Life together.';header.after(label);}
  const rail=group.querySelector('.gv2-rail-wrap'),hero=group.querySelector('.gv2-group-hero'),widgets=group.querySelector('.gv2-widgets');
  const glyph=(name)=>'<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.75" stroke-linecap="round" stroke-linejoin="round">'+(name==='calendar'?'<rect x="3" y="5" width="18" height="16" rx="2"/><path d="M7 3v4m10-4v4M3 10h18"/>':name==='heart'?'<path d="M20.8 4.6a5.5 5.5 0 0 0-7.8 0L12 5.7l-1.1-1.1a5.5 5.5 0 0 0-7.8 7.8L12 21l8.8-8.6a5.5 5.5 0 0 0 0-7.8Z"/>':'<path d="m9 18 6-6-6-6"/>')+'</svg>';
  if(hero){
   const art=node('span','s13-group-cover');const img=node('img','');img.src='assets/rally-one/citizen-group-circle.jpg';img.alt='';img.decoding='async';img.loading='eager';art.append(img);hero.prepend(art);
   const groupAvatar=rail?.querySelector('.gv2-ring-red img');
   if(groupAvatar)groupAvatar.src=img.getAttribute('src');
   const caption=node('span','s13-group-caption'),identity=node('span','s13-group-identity');
   for(const part of hero.querySelectorAll('strong,.gv2-hero-meta'))identity.append(part);
   caption.append(identity);
   const action=hero.querySelector('.gv2-hero-action');if(action){action.textContent='';action.innerHTML=glyph('chevron');caption.append(action);}
   hero.querySelector('.gv2-hero-brand')?.remove();
   hero.append(caption);
  }
  if(widgets){
   const gather=widgets.querySelector('.gv2-widget-gather'),chat=widgets.querySelector('.gv2-widget-chat');
   if(gather){
    widgets.prepend(gather);
    const heading=gather.querySelector('strong');if(heading)heading.textContent='Next gathering';
    const mark=gather.querySelector('.gv2-widget-icon');if(mark)mark.innerHTML=glyph('calendar');
    const cta=gather.querySelector('.gv2-widget-cta i');if(cta)cta.innerHTML=glyph('chevron');
   }
   if(chat){
    const h=node('h2','s13-subhead','Stay connected');chat.before(h);
    const heading=chat.querySelector('strong');if(heading)heading.textContent='Group conversation';
    const mark=chat.querySelector('.gv2-widget-icon');if(mark)mark.innerHTML=messageIcon;
    const cta=chat.querySelector('.gv2-widget-cta i');if(cta)cta.innerHTML=glyph('chevron');
   }
  }
  if(rail&&widgets){const h=node('h2','s13-subhead','Your people');widgets.after(h,rail);}
  const care=group.querySelector('.gv2-care');
  if(care){
   const title=care.querySelector('strong');if(title)title.textContent='Pray for one another';
   const mark=care.querySelector('.gv2-care-icon');if(mark)mark.innerHTML=glyph('heart');
   const trailing=care.querySelector('b');if(trailing)trailing.innerHTML=glyph('chevron');
  }
 }
 const team=view.querySelector('.team-screen-v08:not(.team-empty-v08)');
 if(team){
  const header=team.querySelector('.team-v08-hero');
  if(header){
   const title=header.querySelector('h1'),kicker=header.querySelector('.team-v08-kicker');
   if(title)title.textContent='Your team.';
   if(kicker)kicker.textContent='SERVE TOGETHER';
  }
  const shift=team.querySelector('.team-schedule-card');
  const tabs=team.querySelector('.tabs');

  if(shift){
   header?.querySelector('.team-v08-hero-row')?.remove();
   const heading=shift.querySelector('h2'),name=shift.querySelector('.team-shift-info strong');
   if(heading&&name){heading.textContent=name.textContent;name.remove();}
   const over=shift.querySelector('.team-card-overline>span:first-child');if(over)over.textContent='NEXT ASSIGNMENT';
   const response=shift.querySelector('.team-shift-response');
   const coverage=response?.querySelector('.pill');
   if(coverage)shift.querySelector('.team-card-overline')?.append(coverage);
   response?.remove();

   const huddle=team.querySelector('.team-huddle');
   if(huddle){
    const details=node('details','s13-assignment-detail');
    const summary=node('summary','','Arrival & huddle');
    const timing=huddle.querySelector('.team-huddle-time');
    if(timing)summary.append(timing);
    details.append(summary,huddle);
    shift.after(details);
    huddle.querySelector('.kicker')?.remove();
    huddle.querySelector('h3')?.remove();
   }
   const chat=team.querySelector('.team-message-preview');
   if(chat){
    const preview=node('span','s13-team-chat-copy');
    const sender=chat.querySelector(':scope > strong'),message=chat.querySelector('.team-message-preview-text');
    if(sender&&message){preview.textContent=sender.textContent+' · ';preview.append(message);sender.replaceWith(preview);}
    const label=chat.querySelector('.team-message-preview-top>span:first-of-type');
    if(label)label.textContent='Team conversation';
    chat.querySelector('.team-message-preview-action')?.remove();
    const chatTab=tabs?.querySelector('button[data-value="chat"]');
    if(chatTab){
     tabs.classList.add('s13-team-schedule-nav');
     tabs.querySelector('button[data-value="schedule"]')?.remove();
     chatTab.replaceWith(chat);
     const role=node('figure','s13-team-role');
     const photo=node('img','');
     photo.src='assets/rally-one/citizen-serving.jpg';
     photo.alt='';
     photo.decoding='async';
     const caption=node('figcaption','');
     caption.append(node('strong','','What to expect'),node('span','','Welcome people as they arrive.'),node('small','','Sample serving role'));
     const photoFrame=node('span','s13-team-role-photo');
     photoFrame.append(photo);
     role.append(photoFrame,caption);
     (team.querySelector('.s13-assignment-detail')||shift).after(role,tabs);
    }
   }
  }
 }
 const read=view.querySelector('.ux-read-premium');
 if(read){
  const header=read.querySelector('.ux-read-heading');
  if(header){header.prepend(node('span','s13-page-eyebrow','DAILY RHYTHM'));header.querySelector('h1').textContent='Make space.';header.querySelector('p').textContent='Read, reflect and pray at your own pace.';}
  const feature=read.querySelector('.ux-reading-feature');
  const scripture=read.querySelector('#reading-scripture');
  const disclosure=read.querySelector('.ux-disclosure');
  const arcade=read.querySelector('.ux-arcade');
  if(scripture&&disclosure){
   // Surface the original BSB card and let the existing render cycle restore open panels.
   header?.after(scripture);
   const invitations=node('div','s13-read-invitations');
   const panels=[
    ['reflect','Reflect','Consider a question',read.querySelector('#reading-questions')],
    ['pray','Pray','Take a quiet moment',read.querySelector('.read-prayer-card')]
   ];
   for(const [id,title,description,content] of panels){
    if(!content)continue;
    const panel=node('details','s13-read-panel');
    panel.dataset.uxReadPanel=id;
    const summary=node('summary','');
    const text=node('span','s13-read-panel-copy');
    text.append(node('strong','',title),node('small','',description));
    summary.append(text);
    const glyph=content.querySelector('.icon')?.cloneNode(true);
    if(glyph)summary.prepend(glyph);
    panel.append(summary,content);invitations.append(panel);
   }
   if(invitations.childElementCount)scripture.after(node('h2','s13-subhead','Go a little deeper'),invitations);
   const prayer=read.querySelector('[data-action="pray"]');
   if(prayer)prayer.setAttribute('aria-pressed',String(prayer.classList.contains('done')));
   const summary=disclosure.querySelector('summary');
   if(summary)summary.textContent='Reading pathway';
   const jump=feature?.querySelector('button');
   if(jump){jump.textContent='Back to Scripture';disclosure.append(jump);}
   feature?.remove();
  }
  if(arcade){
   arcade.before(node('h2','s13-subhead','VersePlay'));
   const entry=arcade.querySelector('.ux-circuit');
   if(entry){
    const title=node('span','s13-circuit-copy');
    title.append(node('strong','','Verse Circuit'),node('small','','Practice a verse'));
    const mark=node('span','s13-circuit-mark','V');
    mark.setAttribute('aria-hidden','true');
    const trailing=node('span','s13-circuit-arrow');trailing.innerHTML=arrow;
    entry.replaceChildren(mark,title,trailing);
   }
   if(disclosure)arcade.after(disclosure);
  }
 }
}
function shell(view,icon){
 const phone=view.closest('.phone-inner'),doc=view.ownerDocument;
 const active=doc.body.classList.contains('rally-one')&&!!view.querySelector('.s13-today,.group-screen-v07,.team-screen-v08,.read-screen-v09')&&!phone?.classList.contains('is-play-v08');
 phone?.classList.toggle('s13-shell',active);
 const connect=doc.getElementById('connect-entry'),controls=phone?.querySelector('.header-controls'),profile=controls?.querySelector('.profile-avatar');
 const today=!!view.querySelector('.s13-today');
 // One notification-aware Connect entry. Keep the original activity command
 // for legacy views; its actual badge node stays owned by the controller.
 const bell=controls?.querySelector('[data-action="notifications"]'),dot=doc.getElementById('activity-dot');
 if(connect&&!connect.querySelector('.s13-connect-icon')){
  const mark=doc.createElement('span');mark.className='s13-connect-icon';mark.setAttribute('aria-hidden','true');mark.innerHTML=messageIcon;connect.append(mark);
 }
 if(bell&&connect){
  bell.hidden=active;
  // Anchor the sole existing badge to the glyph, not the 44px hit target.
  // The canonical controller still owns when the indicator is visible.
  const badgeHost=active?connect.querySelector('.s13-connect-icon'):bell;
  if(dot&&badgeHost&&dot.parentElement!==badgeHost)badgeHost.append(dot);
  connect.setAttribute('aria-label',active?'Connect messages and activity':'Connect messaging inbox');
 }
 // Reuse the original Ask action and keep focus stable on Today re-renders.
 const incoming=view.querySelector('.s13-ask-trigger'),previous=controls?.querySelector('.s13-ask-trigger');
 if(active&&today&&incoming&&controls){
  if(previous)incoming.remove();else controls.insertBefore(incoming,connect?.parentElement===controls?connect:profile||null);
 }else previous?.remove();
 phone?.classList.toggle('s13-ask-header',active&&today&&!!controls?.querySelector('.s13-ask-trigger'));
 if(!active){if(connect&&connect.parentElement!==phone&&phone)phone.insertBefore(connect,view);return;}
 // Move the same inbox control so its target/focus remains canonical.
 if(connect&&controls&&profile)controls.insertBefore(connect,profile);
 // The external music link remains accessible as a quiet optional utility.
 const music=controls?.querySelector('.spotify-link');
 if(music&&!today){const link=music.cloneNode(true);link.className='s13-music-link';link.removeAttribute('id');link.textContent='Citizen worship playlist ↗';view.append(link);}
 unify(view);
 applyCraft(view);
}
return Object.freeze({render,shell,unify,applyCraft});
});
