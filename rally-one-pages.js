window.createRallyPages=function({s,e,icon,render,navigate,todayUI}){
 let mode='', person='anna', campus='Central', question='', answer='', previous='', replyAsMorgan=false;
 const names={anna:'Anna',jess:'Jess',marcus:'Marcus',taylor:'Taylor',morgan:'Morgan'};
 const avatar=id=>`<img class="ro-avatar" alt="" src="assets/rally-one/${id}.webp">`;
 const button=(action,label,cls='ro-primary')=>`<button class="${cls}" data-one="${action}">${label}</button>`;
 const head=()=>`<header><b>RALLY <em>ONE.</em></b><button data-one="ask">${icon('message')} Ask Rally</button></header>`;
 const bar=title=>`<header class="ro-bar">${button('back','‹','ro-back')}${title}</header>`;
 const people=ids=>`<div class="one-people">${ids.map(id=>`<button data-one="profile" data-person="${id}">${avatar(id)}${names[id]}</button>`).join('')}</div>`;
 const wrap=body=>`<section class="one-page ro-page">${body}</section>`;
 const heading=title=>head()+'<h1>'+title+'</h1>';
 const chatSeeds=[{name:'Anna',text:'Anyone have a dinner idea for Wednesday? I can bring something if needed!'},{name:'Jess',text:'How about a taco dinner? I can bring the fixings!'}];
 function group(){
  if(!todayUI.memberships.group||mode==='find')return heading('Find a group')+'<h2>Wednesday Group</h2><p>Central · Wednesday at 6:30 PM</p>'+button('interest',s.interest.includes('0')?'Interest saved':'Express interest');
  return heading('Groups')+`<div class="ro-photo dinner"><strong>Wednesday Group</strong>Central · 12 members</div><div class="ro-next">${icon('calendar')}<span><b>Next gathering</b><br>Wednesday · 6:30 PM</span><button class="ro-primary" data-action="rsvp" data-value="going">${s.rsvp==='going'?'✓ Going':'RSVP'}</button></div><h2>Conversation</h2>`+chatSeeds.map((x,i)=>`<div class="ro-snippet">${avatar(i?'jess':'anna')}<p><b>${x.name}</b><br>${x.text}</p></div>`).join('')+button('groupchat','Open group chat')+button('find','Find a group','ro-link');
 }
 function team(){return heading('Team')+`<p>Welcome Team · Central</p><article class="ro-shift"><b>${icon('calendar')} Your next shift</b><h2>Sunday · 9 AM</h2><p>Meet at the Welcome Desk</p><button class="ro-primary" data-action="shift" data-value="confirmed">${s.teamStatus==='confirmed'?'✓ Confirmed':'Confirm shift'}</button></article><h2>Serving with you</h2>`+people(['morgan','jess','marcus'])+'<button class="ro-photo welcome" data-one="setup"><strong>Sunday setup</strong>Read update →</button>'}
 function read(){return heading('Read')+`<article class="ro-verse"><b>${icon('read')}　THIS WEEK</b><h2>Love one another</h2>John 15:12<blockquote>This is My commandment, that you love one another as I have loved you.</blockquote><small>BSB</small><img alt="" src="assets/rally-one/verse.webp"></article><article class="ro-practice"><h2>Practice this verse</h2>Build the verse one phrase at a time.<button class="ro-primary" data-go="play">Start recall</button></article>`+button('saved','Saved passages　›','ro-outline')}
 function ask(){let body='';
 if(answer==='campus')body='<p>Which campus would you like to connect with?</p>'+['Central','North'].map(x=>button('campus-'+x,x,'ro-outline')).join('');
 if(answer==='contact')body=`<p>Morgan helps welcome new people at ${campus}.</p><article class="ro-outline">${avatar('morgan')} <b>Morgan</b><p>Welcome Team · ${campus}</p>${button('intro','Message Morgan')}</article>`;
 if(answer==='time')body='<p>Wednesday Group meets at 6:30 PM.</p><article class="ro-outline"><b>Wednesday Group</b><p>Wednesday · 6:30 PM</p>'+button('today','View on Today')+'</article>';
 if(answer==='help'||!answer)body='<p>How can I help?</p>'+button('time','What time is group tonight?','ro-outline')+button('new','Who can help me get connected?','ro-outline');
 return bar('Ask Rally')+`<div class="ro-thread">${question?'<p class="ro-bubble">'+e(question)+'</p>':''}${body}</div>`+composer('Ask Rally…');
 }
 function composer(label){return `<form class="ro-compose"><input required maxlength="700" aria-label="${label}" placeholder="${label}"><button class="ro-primary">Send</button></form>`}
 function thread(){const groupChat=mode==='groupchat', title=groupChat?'Wednesday Group':replyAsMorgan?'Alex':names[person];
 const items=groupChat?[...chatSeeds,...s.groupMessages.filter(x=>x.name==='You')]:s.directMessages[person]||[];
 return bar((groupChat||replyAsMorgan?'':avatar(person))+title)+`<div class="ro-thread">${items.map(x=>`<p class="${(replyAsMorgan?x.name==='Morgan':x.name==='You')?'ro-bubble':'ro-incoming'}">${e(x.text)}</p>`).join('')}${items.length&&!groupChat?'<small>Sent</small>':''}</div>`+composer('Message '+title+'…')+(person==='morgan'&&!groupChat&&items.length?button('switch',replyAsMorgan?'View as Alex':'Demo · Reply as Morgan','ro-link'):'');
 }
 function page(today){
 document.body.classList.toggle('ro-detail',['dm','ask','groupchat','setup','saved'].includes(mode));
 if(mode==='ask')return wrap(ask());
 if(mode==='dm'||mode==='groupchat')return wrap(thread());
 if(mode==='setup')return wrap(bar('Sunday setup')+'<h2>Welcome Team</h2><p>Meet at the Welcome Desk at 9 AM for Sunday setup.</p>');
 if(mode==='saved')return wrap(bar('Saved passages')+'<h2>John 15:12</h2>'+button('back','Read passage'));
 let html=s.view==='today'?today():wrap(s.view==='group'?group():s.view==='team'?team():read());
 if(mode==='profile')html+=`<dialog class="ro-sheet" aria-label="${names[person]}">${button('close','×','ro-close')}${avatar(person)}<h2>${names[person]}</h2><p>${person==='anna'?'Your Wednesday Group leader':person==='morgan'?'Welcome Team · '+campus:'Wednesday Group member'}</p>${button('message','Message '+names[person])}${button('group','View Wednesday Group','ro-link')}</dialog>`;
 return html;
 }
 function reset(){mode='';replyAsMorgan=false}
 function click(b){let action=b.dataset.one;
 if(b.closest('.one-chat'))action='groupchat';
 if(!action)return false;
 if(action==='profile'){person=b.dataset.person;mode='profile'}
 else if(action==='close'){reset()}
 else if(action==='ask'){mode='ask';question='';answer=''}
 else if(action==='new'||action==='time'){question=b.textContent;answer=action==='new'?'campus':'time'}
 else if(action.startsWith('campus-')){campus=action.slice(7);question=campus;answer='contact'}
 else if(action==='intro'||action==='message'){previous=mode;if(action==='intro')person='morgan';mode='dm';replyAsMorgan=false}
 else if(action==='switch'){replyAsMorgan=!replyAsMorgan}
 else if(action==='back'){mode=mode==='dm'?previous:'';replyAsMorgan=false}
 else if(action==='group'||action==='today'){reset();navigate(action);return true}
 else if(action==='interest'){if(!s.interest.includes('0'))s.interest.push('0')}
 else mode=action;
 render();document.querySelector('.ro-sheet')?.showModal();return true;
 }
 document.addEventListener('cancel',ev=>{if(ev.target.matches('.ro-sheet')){reset();render()}},true);
 document.addEventListener('submit',ev=>{if(!ev.target.matches('.ro-compose'))return;ev.preventDefault();const text=ev.target.querySelector('input').value.trim();if(!text)return;
 if(mode==='ask'){question=text;answer=/new|connect|meet people|welcome/i.test(text)?'campus':/group|time|tonight|when/i.test(text)?'time':'help'}
 else{const items=mode==='groupchat'?s.groupMessages:(s.directMessages[person]??=[]);items.push({name:replyAsMorgan?'Morgan':'You',time:'Just now',text})}
 render();document.querySelector('.ro-compose input')?.focus();
 });
 return {page,click,reset};
};
