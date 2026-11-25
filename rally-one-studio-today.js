/* Studio 13 Stage 1: presentation over the existing intelligence/board output.
 * No ranking, storage, fixture state, permissions or action dispatch ownership.
 */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;if(root)root.RallyStudioToday=api;})(typeof window==='undefined'?null:window,function(){
'use strict';
const arrow='<svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h16m-6-6 6 6-6 6"/></svg>';
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
 head.append(node('h1','',allSet?'You’re all set.':clearCommitments?'Commitments handled.':h.id==='welcome-community'?'Glad you’re here.':h.id==='paused'?h.title:(d.greeting||'Welcome back')+'.'));
 const count=requiredIds.size;
 head.append(node('p','s13-summary'+(calm?' is-complete':''),allSet?'No outstanding responsibilities':clearCommitments?'No outstanding commitment responses':h.id==='paused'?h.subtitle:h.id==='welcome-community'?'Explore at your pace.':count?count+' '+(count===1?'thing needs':'things need')+' your response':hasPending?'A commitment remains to review':'Your next step'));
 const priority=root.querySelector('.f09b-hero'),title=priority.querySelector('h2'),detail=priority.querySelector('.f09b-hero-main>p');
 const primary=priority.querySelector('.f09b-primary'),explain=priority.querySelector('.f09b-explain');
 const faces=priority.querySelector('.f09b-faces');
 const context=node('section','s13-context');context.setAttribute('aria-label','Priority context');
 if(explain)context.append(explain);
 const ask=root.querySelector('.f10-entry');if(ask)context.append(ask);
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
 let readAction=primary;
 if(allSet){
  priority.classList.add('s13-settled');title.textContent=d.member?'Life is better together.':'Small acts. Real impact.';
  detail.textContent=d.member?'Take a moment to connect with your people.':'Your serving community is here for you.';
  const body=node('div','s13-settled-copy');body.append(title,detail);priority.replaceChildren(placeholder(true),body);
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
 }
 const priorities=root.querySelector('.f09b-priorities'),rows=root.querySelector('.f09b-row-stack');
 const responseRows=[...rows.querySelectorAll('.is-actionable')];
 const requiredRows=responseRows.filter(r=>requiredIds.has(r.dataset.row));
 const optionalRows=[...rows.children].filter(r=>!requiredRows.includes(r));
 const optionalStack=node('div','f09b-row-stack');
 for(const row of optionalRows)optionalStack.append(row);
 if(clearCommitments){
  const settled=node('article','f09b-hero s13-settled s13-commitments-clear');
  const body=node('div','s13-settled-copy');
  body.append(node('h2','',d.member?'Life is better together.':'Small acts. Real impact.'),node('p','','Your commitments remain on your schedule.'));
  settled.append(placeholder(true),body);priority.before(settled);
  priority.classList.add('s13-optional-hero');
 }
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
  const mark=node('span','s13-utility-icon');mark.setAttribute('aria-hidden','true');mark.innerHTML=type==='read'?'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M12 6C9 4 6 4 2 4v15c4 0 7 0 10 2 3-2 6-2 10-2V4c-4 0-7 0-10 2Zm0 0v15"/></svg>':'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6"><path d="M21 11a8 8 0 0 1-8 8H8l-5 3 1-7A8 8 0 1 1 21 11Z"/></svg>';
  const copy=node('span','s13-utility-copy');copy.append(node('strong','',title),node('small','',sub));const next=node('span','s13-arrow');next.setAttribute('aria-hidden','true');next.innerHTML=arrow;button.append(mark,copy,next);return button;
 };
 if(clearCommitments)priorities.append(priority);
 if(optionalStack.children.length)priorities.append(optionalStack);
 if(d.member&&h.id!=='group-unread'&&!optionalRows.some(r=>r.dataset.row==='group-unread'||r.dataset.row==='group-unavailable'||r.dataset.row==='community')&&h.id!=='group-unavailable')priorities.append(utility(d.conversationStatus==='unavailable'?'Review your conversation':d.unread>0?d.unread+' new group '+(d.unread===1?'message':'messages'):'Group conversation',d.conversationStatus==='unavailable'?'Conversation data unavailable':'Wednesday Group','group','chat'));
 const reading=utility(d.readToday?'Reading complete':'A moment with God',d.passage||'Your Scripture reading','read','','read');
 if(allSet){reading.classList.add('f09b-primary');reading.dataset.go=readAction.dataset.go||'read';}
 if(h.id!=='scripture-step'&&!optionalRows.some(r=>['scripture-step','scripture-read','scripture-overview'].includes(r.dataset.row)))priorities.append(reading);
 const mission=root.querySelector('.f09b-mission');if(mission){mission.classList.add('s13-community-link');mission.replaceChildren(doc.createTextNode(d.member?'View your community':'Explore community'),node('span','s13-arrow'));mission.lastChild.innerHTML=arrow;}
 priorities.after(context);
 return root.outerHTML;
}
function shell(view,icon){
 const active=!!view.querySelector('.s13-today'),phone=view.closest('.phone-inner');phone?.classList.toggle('s13-shell',active);
 const connect=view.ownerDocument.getElementById('connect-entry');
 if(connect&&!connect.querySelector('.s13-connect-icon')){const mark=view.ownerDocument.createElement('span');mark.className='s13-connect-icon';mark.setAttribute('aria-hidden','true');mark.innerHTML=icon('message');connect.append(mark);}
}
return Object.freeze({render,shell});
});
