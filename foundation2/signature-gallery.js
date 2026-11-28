/* Isolated Signature specimens. All choices are ephemeral presentation state;
 * no member context, application stores, navigation or domain engines exist here. */
(function(){
 'use strict';
 const S=window.FoundationSignature,mount=document.getElementById('gallery-components');
 if(!S){mount.innerHTML='<p role="alert">The component gallery could not open. Return to Today and try again.</p>';return;}
 const esc=value=>String(value??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
 const icon=name=>S.icon(name),announce=text=>{document.getElementById('gallery-announcement').textContent=text;};
 const state={stack:0,segment:'all',rsvp:null,confirmed:false,week:new Date(2026,10,30,12),selected:new Date(2026,11,5,12),navigation:'today',saved:false};
 const portraits=[{name:'Anna L.',file:'anna'},{name:'Jess W.',file:'jess'},{name:'Marcus',file:'marcus'},{name:'Taylor',file:'taylor'}];
 const samples=[
  {kicker:'Your community',title:'Find your<br>people.',detail:'Wednesday Group · fictional example',photo:'../assets/rally-one/community.webp'},
  {kicker:'Next opportunity',title:'A place to<br>serve.',detail:'Welcome Team · fictional example',photo:'../assets/campuses/central.jpg'},
  {kicker:'Make space',title:'A moment<br>to Read.',detail:'Optional Scripture · visual specimen',photo:'../assets/today-priority/sandia-ridge.webp'}
 ];
 const events=[{date:new Date(2026,11,5,18),title:'Wednesday Group',detail:'North Commons · sample gathering'},{date:new Date(2026,11,6,9),title:'Welcome Team',detail:'North Campus · sample assignment'}];
 // S3 composition choices are local specimen selections, never app state.
 // Both studies consume the same two supplied sample facts and keep optional
 // unread unchanged. These booleans cannot read or command a member engine.
 const compositions={brief:{serve:false,rsvp:false},connected:{serve:false,rsvp:false}};
 let compositionView='compare';
 const compositionFacts=[
  {id:'serve',title:'Welcome Team',detail:'North Campus',date:new Date(2026,10,29,9),label:'Confirm availability',short:'Confirm',photo:'../assets/today-priority/group.webp'},
  {id:'rsvp',title:'Wednesday Group',detail:'North Commons',date:new Date(2026,11,2,18,30),label:'RSVP · I’m in',short:'RSVP',photo:'../assets/rally-one/community.webp'}
 ];
 const action=(label,kind,options={})=>S.action({label,attrs:{'data-sig-action':kind},...options});
 function family(id,title,detail,content,extra=''){
  return '<section id="'+id+'" class="gallery-family '+extra+'" aria-labelledby="'+id+'-title"><header class="gallery-family-head"><h2 id="'+id+'-title">'+esc(title)+'</h2><p>'+esc(detail)+'</p></header>'+content+'</section>';
 }
 function stackMarkup(){
  const sample=samples[state.stack];
  return S.stack('<article class="gallery-stack-primary"><img src="'+sample.photo+'" alt="" width="450" height="225"><div class="gallery-stack-copy"><span class="gallery-eyebrow">'+sample.kicker+'</span><h3 class="sig-serif">'+sample.title+'</h3><p>'+sample.detail+'</p></div><button type="button" class="sig-utility gallery-stack-next" data-sig-action="stack-next" aria-label="Next Smart Stack specimen">'+icon('arrow')+'</button></article>',{className:'gallery-stack',tone:'ink'})+'<p class="gallery-caption" id="stack-caption">Specimen '+(state.stack+1)+' of '+samples.length+' · A shape study, not a priority engine.</p>';
 }
 function weekMarkup(){
  const end=new Date(state.week);end.setDate(end.getDate()+6);
  const title=end.toLocaleDateString('en-US',{month:'long',year:'numeric'});
  return '<div class="gallery-calendar-head"><button class="sig-utility gallery-week-prev" type="button" data-sig-action="week-prev" aria-label="Previous specimen week">'+icon('arrow')+'</button><h3 id="calendar-week-title">'+esc(title)+'</h3><button class="sig-utility" type="button" data-sig-action="week-next" aria-label="Next specimen week">'+icon('arrow')+'</button></div>'+
   '<div class="gallery-week" role="group" aria-label="Specimen week dates">'+Array.from({length:7},(_,index)=>{const d=new Date(state.week);d.setDate(d.getDate()+index);const value=d.toISOString();return '<button type="button" data-sig-action="date" data-sig-value="'+value+'" aria-pressed="'+String(d.toDateString()===state.selected.toDateString())+'" aria-label="'+esc(d.toLocaleDateString('en-US',{weekday:'short'}))+' '+d.getDate()+', '+esc(d.toLocaleDateString('en-US',{month:'long',day:'numeric',year:'numeric'}))+'"><small>'+esc(d.toLocaleDateString('en-US',{weekday:'short'}))+'</small> <strong>'+d.getDate()+'</strong></button>';}).join('')+'</div><p class="gallery-calendar-selection" id="calendar-selection">Selected '+esc(state.selected.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}))+'</p>';
 }
 function agendaMarkup(){
  const end=new Date(state.week);end.setDate(end.getDate()+7);
  const shown=events.filter(e=>e.date>=state.week&&e.date<end);
  return '<div class="sig-agenda gallery-agenda" aria-label="Fictional specimen agenda for shown week">'+(shown.length?shown.map(e=>'<article class="'+(e.date.toDateString()===state.selected.toDateString()?'is-selected':'')+'"><div>'+S.dateBadge(e.date)+'</div><div><h3>'+esc(e.title)+'</h3><p>'+esc(e.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}))+' · '+esc(e.detail)+'</p></div><button class="sig-utility" type="button" data-sig-action="event-detail" data-sig-value="'+esc(e.title)+'" aria-label="Inspect '+esc(e.title)+' specimen">'+icon('arrow')+'</button></article>').join(''):'<p class="gallery-empty-agenda">No fictional sample events in this week.</p>')+'</div><h4 class="gallery-timeline-title">In order</h4>'+S.timeline({label:'Fictional event timeline',items:shown.map(e=>({date:e.date,title:e.title,detail:e.detail,selected:e.date.toDateString()===state.selected.toDateString(),attrs:{'data-sig-action':'event-detail','data-sig-value':e.title}}))});
 }
 function completionMarkup(){
  const remaining=Number(state.rsvp===null)+Number(!state.confirmed);
  return S.completion({complete:remaining===0,title:remaining===0?'All Set!':'Your response.',detail:remaining===0?'Both specimen choices are selected.':'Choose the sample RSVP and commitment states.',remaining})+'<p class="gallery-caption">Only your two selections drive this specimen. No member progress or attendance is inferred.</p>';
 }
 function compositionAction(mode,item,compact=false){
  return S.action({label:compact?item.short:item.label,tone:compact?'paper':'red',split:!compact,icon:compact?null:'arrow',className:'sig-comp-response-action'+(compact?' sig-comp-response-action--compact':''),attrs:{'data-sig-action':'composition-response','data-composition':mode,'data-sig-value':item.id,'aria-label':item.label+' for the fictional '+item.title}});
 }
 function compositionPeople(mode){
  return '<section class="sig-comp-people" aria-label="'+mode+' fictional community"><div class="sig-comp-people-main"><div class="sig-portraits sig-comp-portraits" role="group" aria-label="Fictional contacts Anna, Jess and Marcus">'+portraits.slice(0,3).map(p=>'<button type="button" data-sig-action="composition-person" data-composition="'+mode+'" data-sig-value="'+p.file+'" aria-label="Inspect '+esc(p.name)+' fictional portrait"><img src="../assets/rally-one/'+p.file+'.webp" alt="" width="150" height="150"></button>').join('')+'</div><div class="sig-comp-group"><strong>Wednesday Group</strong><button type="button" class="sig-comp-unread" data-sig-action="composition-detail" data-composition="'+mode+'" data-sig-value="Connect"><span class="sig-comp-unread-dot" aria-hidden="true"></span>3 new messages</button></div><button type="button" class="sig-utility sig-comp-people-control" data-sig-action="composition-detail" data-composition="'+mode+'" data-sig-value="People" aria-label="People and community">'+icon('plus')+'</button></div></section>';
 }
 function compositionAgenda(mode){
  const choices=compositions[mode];
  return '<section class="sig-comp-agenda" aria-label="'+mode+' fictional upcoming schedule"><div class="sig-comp-section-line"><h4>Coming up</h4><span>Your schedule</span></div><div class="sig-comp-agenda-list">'+compositionFacts.map(item=>'<button type="button" class="sig-comp-event" data-sig-action="composition-event" data-composition="'+mode+'" data-sig-value="'+item.id+'"><time datetime="'+item.date.toISOString()+'" class="sig-comp-event-date"><span>'+esc(item.date.toLocaleDateString('en-US',{month:'short'}))+'</span><strong>'+item.date.getDate()+'</strong></time><span class="sig-comp-event-copy"><strong>'+item.title+'</strong><small>'+esc(dateLabelForStudy(item.date))+' · '+item.detail+'</small></span><span class="sig-comp-event-state '+(choices[item.id]?'is-saved':'')+'">'+(choices[item.id]?icon('check')+'<span>Saved</span>':'Needs reply')+'</span></button>').join('')+'</div></section>';
 }
 function dateLabelForStudy(date){return date.toLocaleDateString('en-US',{weekday:'short'})+' · '+date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'});}
 function compositionResponses(mode){
  const pending=compositionFacts.filter(item=>!compositions[mode][item.id]),primary=pending[0],secondary=pending[1];
  const header='<div class="sig-comp-section-line"><h4>'+(pending.length?'Your next step':'Responses saved')+'</h4><span>'+pending.length+' '+(pending.length===1?'response':'responses')+'</span></div>';
  if(!primary)return '<section class="sig-comp-responses" aria-label="'+mode+' fictional response selections">'+header+'<div class="sig-comp-response-surface sig-comp-allset"><span class="sig-comp-allset-mark" aria-hidden="true">'+icon('check')+'</span><div><h4 class="sig-serif sig-comp-allset-title" tabindex="-1">All Set.</h4><p>Both sample responses are saved.<br>Connection stays optional.</p></div></div></section>';
  const top=mode==='brief'?'<span class="sig-comp-priority-kicker">UP NEXT</span><time datetime="'+primary.date.toISOString()+'">'+esc(dateLabelForStudy(primary.date))+'</time>':'<div class="sig-comp-priority-date">'+S.dateBadge(primary.date)+'</div>';
  return '<section class="sig-comp-responses" aria-label="'+mode+' fictional response selections" data-pending="'+pending.length+'">'+header+'<div class="sig-comp-folds '+(secondary?'has-secondary':'')+'"><article class="sig-comp-response-surface sig-comp-primary">'+(mode==='brief'?'<img class="sig-comp-priority-photo" src="'+primary.photo+'" alt="" width="440" height="220">':'')+'<div class="sig-comp-priority-meta">'+top+'</div><div class="sig-comp-priority-copy">'+(mode==='connected'?'<span class="sig-comp-priority-kicker">UP NEXT</span>':'')+'<h4 class="sig-serif">'+primary.title+'</h4><p>'+primary.detail+'</p></div>'+compositionAction(mode,primary)+'</article>'+(secondary?'<article class="sig-comp-secondary"><div><h4>'+secondary.title+'</h4><p>'+secondary.detail+'</p></div>'+compositionAction(mode,secondary,true)+'</article>':'')+'</div></section>';
 }
 function compositionHeader(mode){
  return '<header class="sig-comp-header"><span class="sig-comp-brand"><img src="../assets/citizen-flag.svg" alt="" width="24" height="24"><strong>RALLY<span>ONE.</span></strong></span><div><button type="button" class="sig-utility" data-sig-action="composition-detail" data-composition="'+mode+'" data-sig-value="Connect" aria-label="Open Connect specimen">'+icon('chat')+'</button><button type="button" class="sig-comp-avatar" data-sig-action="composition-detail" data-composition="'+mode+'" data-sig-value="Jordan" aria-label="Inspect Jordan fictional profile">J</button></div></header>';
 }
 function compositionNav(mode){
  return '<nav class="sig-nav sig-comp-nav" aria-label="'+(mode==='brief'?'Folded Brief':'Connected Day')+' four-destination navigation specimen">'+[['Today','calendar'],['Groups','people'],['Team','heart'],['Read','book']].map(([label,glyph])=>'<button type="button" data-sig-action="composition-detail" data-composition="'+mode+'" data-sig-value="'+label+'"'+(label==='Today'?' aria-current="page"':'')+'>'+icon(glyph)+'<span>'+label+'</span></button>').join('')+'</nav>';
 }
 function compositionPhone(mode){
  const choices=compositions[mode],count=Number(!choices.serve)+Number(!choices.rsvp);
  const greeting='<p class="sig-comp-greeting">Good morning, <button type="button" data-sig-action="composition-detail" data-composition="'+mode+'" data-sig-value="Jordan">Jordan.</button></p>';
  const masthead=mode==='brief'?'<header class="sig-comp-masthead"><div><p class="sig-comp-dateline">THU, NOV 26 · NORTH CAMPUS</p><h3 class="sig-serif">Today<span>.</span></h3>'+greeting+'</div><img src="../assets/campuses/north.jpg" alt="" width="180" height="180"></header>':'<header class="sig-comp-cover"><img src="../assets/rally-one/community.webp" alt="" width="440" height="220"><div><p class="sig-comp-dateline">THU, NOV 26 · NORTH CAMPUS</p><h3 class="sig-serif">Today<span>.</span></h3>'+greeting+'</div></header>';
  const ask=S.action({label:'Ask Rally',tone:'ink',split:true,icon:'arrow',className:'sig-comp-ask',attrs:{'data-sig-action':'composition-detail','data-composition':mode,'data-sig-value':'Ask Rally'}});
  return compositionHeader(mode)+masthead+(mode==='connected'?compositionPeople(mode):'')+'<div class="sig-comp-day-sheet" data-response-count="'+count+'">'+compositionResponses(mode)+compositionAgenda(mode)+'</div>'+(mode==='brief'?compositionPeople(mode):'')+'<div class="sig-comp-footer">'+ask+'</div>'+compositionNav(mode);
 }
 function compositionStudy(mode,title,detail){
  return '<article class="gallery-composition-study" data-study="'+mode+'"><header class="gallery-study-heading"><div><span class="gallery-eyebrow">Study '+(mode==='brief'?'A':'B')+'</span><h3>'+title+'</h3><p>'+detail+'</p></div><button type="button" class="gallery-reset" data-sig-action="composition-reset" data-composition="'+mode+'">Reset study '+(mode==='brief'?'A':'B')+'</button></header><div id="composition-'+mode+'" class="sig-composition sig-composition--'+mode+'" data-sig-composition="'+mode+'" data-s3-study="'+(mode==='brief'?'a':'b')+'">'+compositionPhone(mode)+'</div><p class="gallery-study-caption">Jordan · North Campus · fictional local study. Anna, Jess and Marcus are sample contacts. Choices clear on reload; 3 optional messages remain unchanged.</p></article>';
 }
 function compositionStudies(){
  return '<section id="composition-studies" class="gallery-family-wide gallery-composition-studies" aria-labelledby="composition-studies-title"><header class="gallery-family-head"><h2 id="composition-studies-title">S3 · Two ways to shape Today</h2><p>Matched facts. Different compositions. Try both responses, then compare the one-response and All Set states.</p></header><p class="gallery-study-reference">The four owner-supplied boards remain the primary art direction. Exact original PNG embedding is deferred until supplied; no reference image has been redrawn or approximated.</p><div class="gallery-study-selector sig-segments" role="group" aria-label="Composition study display">'+[['compare','Compare both'],['brief','A · Folded Brief'],['connected','B · Connected Day']].map(([value,label])=>'<button type="button" data-sig-action="composition-view" data-sig-value="'+value+'" aria-pressed="'+String(compositionView===value)+'">'+label+'</button>').join('')+'</div><div class="gallery-study-grid">'+compositionStudy('brief','The Folded Brief','An ivory editorial page. Priorities form one layered folio; dates and people follow in compact rails.')+compositionStudy('connected','The Connected Day','A photographic charcoal cover. People cross its seam; a dated, interlocking day sheet brings the next steps together.')+'</div><a class="gallery-study-anchor" href="#actions">Continue to the original component families '+icon('arrow')+'</a></section>';
 }
 function updateCompositionView(){
  mount.querySelectorAll('[data-study]').forEach(study=>{study.hidden=compositionView!=='compare'&&study.dataset.study!==compositionView;});
  mount.querySelectorAll('[data-sig-action=composition-view]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sigValue===compositionView)));
  mount.querySelector('.gallery-study-grid').classList.toggle('is-single',compositionView!=='compare');
 }
 function updateComposition(mode){
  const phone=document.getElementById('composition-'+mode);phone.innerHTML=compositionPhone(mode);
  const next=phone.querySelector('[data-sig-action=composition-response]')||phone.querySelector('.sig-comp-allset-title');
  next?.focus({preventScroll:true});
  if(!matchMedia('(prefers-reduced-motion: reduce)').matches){
   phone.querySelector('.sig-comp-response-surface')?.animate([{transform:'translateY(6px)',opacity:.7},{transform:'translateY(0)',opacity:1}],{duration:180,easing:'ease-out'});
  }
 }
 function build(){
  mount.innerHTML=compositionStudies()+family('actions','Signature actions','A decisive shape. A clear next step.',
   '<div class="gallery-action-collection">'+action('Ask Rally','ask',{icon:'spark',split:true})+action('RSVP','focus-rsvp',{icon:'check',tone:'ink',split:true})+action('Request coverage','coverage',{icon:'calendar',tone:'paper'})+'<div class="gallery-paired-actions">'+action('Not this time','decline',{tone:'paper',icon:'close'})+action('Confirm','confirm',{icon:'check'})+'</div><p id="action-feedback" class="gallery-inline-feedback" role="status">Try an action to inspect its feedback.</p><details class="gallery-component-states"><summary>Inspect disabled, busy and retry states</summary><div>'+S.action({label:'Unavailable example',tone:'paper',attrs:{disabled:true}})+S.action({label:'Saving example…',tone:'ink',attrs:{disabled:true,'aria-busy':'true'}})+action('Try again','retry',{tone:'paper'})+'</div></details></div>')+
   family('smart-stack','Smart Stack','Sculptural layers, one deliberate focus.','<div id="stack-specimen">'+stackMarkup()+'</div>')+
   family('calendar','Calendar, agenda & timeline','Compact dates. One integrated sequence.','<div class="gallery-calendar"><div id="calendar-week">'+weekMarkup()+'</div>'+'<div id="calendar-agenda">'+agendaMarkup()+'</div></div>')+
   family('editorial','Editorial panels','Photography with a distinctive seam.','<article class="sig-editorial gallery-editorial"><img src="../assets/rally-one/community.webp" alt="Approved fictional community photograph example" width="450" height="225"><div><span class="gallery-eyebrow">Your community</span><h3 class="sig-serif">Life,<br>together<span>.</span></h3></div><button type="button" class="sig-utility" data-sig-action="photo-detail" aria-label="Inspect editorial photo treatment">'+icon('arrow')+'</button></article><p class="gallery-caption">Accepted repository imagery, a charcoal field and a red cut. No generated or private prototype photos.</p>')+
   family('community','People & community','Overlapping portraits. Human-led controls.',
    '<div class="gallery-community"><div class="sig-portraits gallery-portraits" role="group" aria-label="Fictional portrait specimens">'+portraits.map(p=>'<button type="button" data-sig-action="person" data-sig-value="'+p.file+'" aria-label="Inspect '+esc(p.name)+' fictional portrait"><img src="../assets/rally-one/'+p.file+'.webp" alt="" width="150" height="150"></button>').join('')+'</div><div class="gallery-community-heading"><div><span class="gallery-eyebrow">A familiar circle</span><h3 class="sig-serif">Your people.</h3></div><button class="sig-utility" type="button" data-sig-action="community" aria-expanded="false" aria-controls="community-controls" aria-label="Expand community controls">'+icon('plus')+'</button></div><div id="community-controls" class="gallery-community-controls" hidden>'+action('Prayer','care',{icon:'heart',tone:'paper'})+action('A local conversation','conversation',{icon:'chat',tone:'ink'})+'<p>These controls open specimen details only. No outreach, presence or roster is claimed.</p></div></div>')+
   family('controls','Circular & segmented controls','Distinctive in shape. Familiar to operate.',
    '<div class="gallery-utilities" role="group" aria-label="Utility control specimens">'+[['calendar','Schedule'],['chat','Connect'],['book','Read'],['heart','Care']].map(([glyph,label])=>'<div><button class="sig-utility '+(glyph==='heart'?'gallery-utility-red':'')+'" type="button" data-sig-action="utility" data-sig-value="'+label+'" aria-label="Inspect '+label+' utility">'+icon(glyph)+'</button><span>'+label+'</span></div>').join('')+'</div><div class="sig-segments gallery-segments" role="group" aria-label="Component category selector">'+[['all','All'],['groups','My groups'],['serving','Serving']].map(([value,label])=>'<button type="button" data-sig-action="segment" data-sig-value="'+value+'" aria-pressed="'+String(value===state.segment)+'">'+label+'</button>').join('')+'</div><p id="segment-detail" class="gallery-selection-note" role="status">All specimen categories shown.</p>')+
   family('commitment','RSVP & commitment','Real control states, never fabricated attendance.',
    '<article class="gallery-commitment"><header>'+S.dateBadge(new Date(2026,11,6,9))+'<div><span class="gallery-eyebrow">Fictional opportunity</span><h3 class="sig-serif">Welcome<br>Team.</h3><p>North Campus · sample shift</p></div></header><fieldset class="gallery-rsvp"><legend>Sample RSVP</legend><div>'+[['going','I’m in'],['maybe','Maybe'],['declined','Can’t make it']].map(([value,label])=>'<button type="button" data-sig-action="rsvp" data-sig-value="'+value+'" aria-pressed="false">'+label+'</button>').join('')+'</div></fieldset><button type="button" class="gallery-confirm-state" data-sig-action="commitment" aria-pressed="false">'+icon('check')+'<span>Confirm sample commitment</span></button><p id="commitment-feedback" class="gallery-inline-feedback" role="status">No specimen response selected.</p></article>')+
   family('completion','Completion & All Set','The finish follows an explicit choice.','<div id="completion-output">'+completionMarkup()+'</div><button type="button" class="gallery-reset gallery-reset-small" data-sig-action="reset-choices">Reset response choices</button>')+
   family('navigation','Four destinations. Always connected.','Premium navigation with one consistent Connect control.',
    '<div class="gallery-navigation-top"><p class="sig-serif">Church, together.</p><button type="button" class="sig-utility" data-sig-action="connect" aria-label="Inspect separate Connect access">'+icon('chat')+'</button></div><nav class="sig-nav gallery-nav" aria-label="Four-destination navigation specimen">'+[['today','Today','calendar'],['groups','Groups','people'],['team','Team','heart'],['read','Read','book']].map(([value,label,glyph])=>'<button type="button" data-sig-action="nav" data-sig-value="'+value+'"'+(value===state.navigation?' aria-current="page"':'')+'>'+icon(glyph)+'<span>'+label+'</span></button>').join('')+'</nav><p id="navigation-feedback" class="gallery-selection-note" role="status">Today selected. This specimen does not navigate or alter the application.</p>','gallery-family-wide');
  updateCompositionView();
 }
 const dialog=document.getElementById('gallery-dialog');let dialogOrigin=null;
 function openDetail(title,content,origin){
  dialogOrigin=origin;document.getElementById('gallery-dialog-content').innerHTML='<h2 id="gallery-dialog-title" class="sig-serif" tabindex="-1">'+esc(title)+'</h2>'+content;
  dialog.showModal();dialog.querySelector('h2').focus({preventScroll:true});
 }
 function closeDetail(){dialog.close();if(dialogOrigin?.isConnected)dialogOrigin.focus({preventScroll:true});}
 dialog.addEventListener('cancel',event=>{event.preventDefault();closeDetail();});
 function updateChoices(){
  mount.querySelectorAll('[data-sig-action=rsvp]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.sigValue===state.rsvp)));
  const button=mount.querySelector('[data-sig-action=commitment]');button.setAttribute('aria-pressed',String(state.confirmed));button.querySelector('span').textContent=state.confirmed?'Sample commitment confirmed · undo':'Confirm sample commitment';
  document.getElementById('commitment-feedback').textContent=state.rsvp===null?'No specimen response selected.':({going:'I’m in',maybe:'Maybe',declined:'Can’t make it'})[state.rsvp]+' selected for this page only.';
  document.getElementById('completion-output').innerHTML=completionMarkup();
 }
 document.addEventListener('click',event=>{
  const button=event.target.closest('[data-sig-action]');if(!button)return;
  const kind=button.dataset.sigAction,value=button.dataset.sigValue;
  if(kind==='dialog-close'){closeDetail();return;}
  if(kind==='reset'){
   Object.assign(state,{stack:0,segment:'all',rsvp:null,confirmed:false,week:new Date(2026,10,30,12),selected:new Date(2026,11,5,12),navigation:'today',saved:false});Object.values(compositions).forEach(choices=>{choices.serve=false;choices.rsvp=false;});compositionView='compare';build();announce('All component specimens reset. No application data was changed.');return;
  }
  if(kind==='composition-view'){compositionView=value;updateCompositionView();return;}
  if(kind==='composition-reset'||kind==='composition-response'){
   const mode=button.dataset.composition;if(!compositions[mode])return;
   if(kind==='composition-reset'){compositions[mode].serve=false;compositions[mode].rsvp=false;}else if(value==='serve'||value==='rsvp')compositions[mode][value]=true;
   updateComposition(mode);const remaining=Number(!compositions[mode].serve)+Number(!compositions[mode].rsvp);
   announce((mode==='brief'?'Study A':'Study B')+': '+(remaining?remaining+' sample '+(remaining===1?'response remains.':'responses remain.'):'All Set. Both sample responses selected.')+' Optional unread stays at 3.');return;
  }
  if(kind==='composition-person'){
   const person=portraits.find(person=>person.file===value);if(person)openDetail(person.name,'<img class="gallery-dialog-portrait" src="../assets/rally-one/'+person.file+'.webp" alt="" width="150" height="150"><p>Fictional contact in the matched Jordan / North Campus composition study. No presence, attendance or live membership is inferred.</p>',button);return;
  }
  if(kind==='composition-event'){
   const item=compositionFacts.find(item=>item.id===value);if(item)openDetail(item.title,'<p>'+esc(item.date.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'}))+' · '+esc(item.date.toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'}))+' · '+item.detail+'</p><p>Fictional event detail. No application schedule or response is read or changed.</p>',button);return;
  }
  if(kind==='composition-detail'){
   const content=value==='Jordan'?'Jordan · North Campus · Group + serving team. This profile is a fixed fictional presentation fixture.':value==='Connect'?'Three optional sample messages remain unread. Opening this local detail does not mark them read or create a conversation.':value==='People'?'Anna, Jess and Marcus are fictional portrait examples. Community actions stay human-led; nothing is sent or inferred.':value==='Ask Rally'?'A local Signature action specimen. The working application keeps its established Ask Rally owner and permissions.':'The four destinations remain Today, Groups, Team and Read. This composition control opens a local detail; it does not add an application route.';
   openDetail(value,'<p>'+esc(content)+'</p>',button);return;
  }
  if(kind==='stack-next'){
   state.stack=(state.stack+1)%samples.length;document.getElementById('stack-specimen').innerHTML=stackMarkup();document.querySelector('[data-sig-action=stack-next]').focus({preventScroll:true});announce('Smart Stack specimen '+(state.stack+1)+' of '+samples.length+'.');return;
  }
  if(kind==='week-prev'||kind==='week-next'){
   state.week.setDate(state.week.getDate()+(kind==='week-prev'?-7:7));state.selected=new Date(state.week);document.getElementById('calendar-week').innerHTML=weekMarkup();document.getElementById('calendar-agenda').innerHTML=agendaMarkup();document.querySelector('[data-sig-action='+kind+']').focus({preventScroll:true});announce('Specimen calendar week changed.');return;
  }
  if(kind==='date'){
   state.selected=new Date(value);mount.querySelectorAll('[data-sig-action=date]').forEach(b=>b.setAttribute('aria-pressed',String(new Date(b.dataset.sigValue).toDateString()===state.selected.toDateString())));document.getElementById('calendar-selection').textContent='Selected '+state.selected.toLocaleDateString('en-US',{weekday:'long',month:'long',day:'numeric'});document.getElementById('calendar-agenda').innerHTML=agendaMarkup();return;
  }
  if(kind==='segment'){
   state.segment=value;mount.querySelectorAll('[data-sig-action=segment]').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.sigValue===value)));document.getElementById('segment-detail').textContent=({all:'All specimen categories shown.',groups:'Group controls selected for this specimen.',serving:'Serving controls selected for this specimen.'})[value];return;
  }
  if(kind==='community'){
   const expanded=button.getAttribute('aria-expanded')!=='true';button.setAttribute('aria-expanded',String(expanded));document.getElementById('community-controls').hidden=!expanded;return;
  }
  if(kind==='rsvp'){state.rsvp=value;updateChoices();announce('Sample RSVP selected. Only this page changed.');return;}
  if(kind==='commitment'){state.confirmed=!state.confirmed;updateChoices();return;}
  if(kind==='reset-choices'){state.rsvp=null;state.confirmed=false;updateChoices();announce('Response specimen choices reset.');return;}
  if(kind==='nav'){
   state.navigation=value;mount.querySelectorAll('[data-sig-action=nav]').forEach(b=>{if(b.dataset.sigValue===value)b.setAttribute('aria-current','page');else b.removeAttribute('aria-current');});document.getElementById('navigation-feedback').textContent=button.textContent.trim()+' selected. This specimen does not navigate or alter the application.';return;
  }
  if(kind==='person'){
   const p=portraits.find(p=>p.file===value);if(!p)return;openDetail(p.name,'<img class="gallery-dialog-portrait" src="../assets/rally-one/'+p.file+'.webp" alt="" width="150" height="150"><p>Fictional portrait specimen using an accepted repository image. No live account, presence, membership or activity is inferred.</p>',button);return;
  }
  if(kind==='focus-rsvp'){document.getElementById('commitment').scrollIntoView({block:'start'});mount.querySelector('[data-sig-action=rsvp]').focus({preventScroll:true});return;}
  if(kind==='confirm'){state.saved=!state.saved;document.getElementById('action-feedback').textContent=state.saved?'Confirmation feedback shown. This is an unsaved component specimen.':'Confirmation specimen reset.';button.setAttribute('aria-pressed',String(state.saved));return;}
  if(kind==='retry'){document.getElementById('action-feedback').textContent='Retry feedback specimen selected. No application request was made.';return;}
  if(kind==='decline'){document.getElementById('action-feedback').textContent='Decline feedback shown. No application commitment changed.';return;}
  const details={
   ask:['Ask Rally','The Signature action retains one clear label and a distinctive angled red field. This specimen opens a local detail; the working Today experience uses its existing Ask Rally owner.'],
   coverage:['Coverage control','An ivory action can carry a useful secondary decision without becoming another promotional card. This specimen does not create a coverage request.'],
   care:['Human-led care','An expandable community control keeps optional care close to the people. Nothing is sent, inferred or saved by this specimen.'],
   conversation:['A conversation entry','A familiar circular icon remains distinct from the four primary destinations. The working application retains its existing message engine, drafts, permissions and unread owner.'],
   connect:['Consistent Connect access','Connect is separate from the four-destination bar. This is a local control specimen, not a fifth navigation destination.'],
   utility:[value+' utility','A circular touch target with one recognizable icon and an explicit accessible name. This local specimen does not navigate or save data.'],
   'event-detail':[value,'A compact date badge and an integrated timeline row share one information hierarchy. These are explicitly fictional specimen events, not member attendance or live schedules.'],
   'photo-detail':['An editorial seam','The accepted community image meets a matte charcoal field and a deliberate red corner. The photograph remains an example; no private prototype photographs are used.']
  };
  if(details[kind])openDetail(details[kind][0],'<p>'+esc(details[kind][1])+'</p>',button);
 });
 build();
})();
