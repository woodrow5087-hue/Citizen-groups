/*
 * Pilot Journey Lab — synthetic UX acceptance walkthrough.
 * Deliberately separate from the approved Rally Point app and pilot server.
 * No accounts, login, provider calls, storage, cookies, tracking, or writes.
 */
(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 if(root&&root.document){
  if(root.document.readyState==='loading')root.document.addEventListener('DOMContentLoaded',()=>api.mount(root.document),{once:true});
  else api.mount(root.document);
 }
})(typeof window!=='undefined'?window:null,function(){
 'use strict';
 const scenarioIds=Object.freeze(['ready','no-event','revoked','expired','wrong-organization','unavailable']);
 const restrictedIds=new Set(['revoked','expired','wrong-organization']);
 function makeSnapshot(id='ready',at=new Date()){
  if(!scenarioIds.includes(id))throw new RangeError('Unknown synthetic scenario');
  if(!(at instanceof Date)||!Number.isFinite(at.getTime()))throw new TypeError('Date required');
  if(restrictedIds.has(id))return Object.freeze({state:'restricted',group:null,nextGathering:null,checkedAt:null,source:null});
  if(id==='unavailable')return Object.freeze({state:'unavailable',group:null,nextGathering:null,checkedAt:null,source:null});
  const next=new Date(at.getTime()+3*24*60*60*1000);
  next.setHours(18,30,0,0);
  const nextGathering=id==='no-event'?null:Object.freeze({
   title:'Sample group gathering',
   startsAt:next.toISOString()
  });
  return Object.freeze({
   state:'ready',
   group:Object.freeze({name:'Sample Wednesday Group'}),
   nextGathering,
   checkedAt:at.toISOString(),
   source:'Synthetic group connector'
  });
 }
 const when=(value)=>new Date(value).toLocaleDateString('en-US',{weekday:'long',month:'short',day:'numeric',hour:'numeric',minute:'2-digit'});
 function mount(doc){
  const display=doc.getElementById('member-view');
  const options=doc.getElementById('scenario-options');
  const statusText=doc.getElementById('preview-status');
  if(!display||!options||!statusText)return null;
  let active='ready',details=false;
  const node=(tag,cls,copy)=>{
   const out=doc.createElement(tag);
   if(cls)out.className=cls;
   if(copy!==undefined)out.textContent=copy;
   return out;
  };
  const append=(parent,...children)=>{for(const child of children)parent.appendChild(child);return parent};
  function pill(textValue){return node('span','hero-overline',textValue)}
  function line(key,value){
   return append(node('div','detail-row'),node('span','key',key),node('strong','value',value));
  }
  function sectionHeading(title,body){
   return append(node('div',''),
    node('div','screen-kicker','PILOT MEMBER EXPERIENCE · FICTIONAL'),
    append(node('h1','screen-greeting'),doc.createTextNode(title),node('em','',body)),
    node('p','screen-description','This preview models a future read-only connection. No church account is connected.'));
  }
  function availabilityCard(title,description){
   const panel=node('section','state-card');
   panel.append(
    node('div','state-symbol','!'),
    node('div','state-label','PROTECTED MEMBER INFORMATION'),
    node('h2','',title),
    node('p','',description),
    node('p','','Try another scenario to inspect how this experience responds.')
   );
   return panel;
  }
  function verifiedCard(data){
   const box=node('section','group-hero');
   box.append(
    pill('YOUR VERIFIED GROUP · SAMPLE'),
    node('h2','hero-title',data.group.name),
    node('p','hero-subtitle',data.nextGathering?'Your next gathering is ready to view.':'You belong to this sample group. No upcoming gathering is currently listed.')
   );
   if(data.nextGathering){
    const b=node('button','hero-cta','See next gathering  →');
    b.type='button';
    b.setAttribute('data-action','open-details');
    box.appendChild(b);
   }
   return box;
  }
  function render(){
   const snapshot=makeSnapshot(active);
   statusText.textContent=snapshot.state==='ready'?'SIMULATED / PERMITTED':snapshot.state==='restricted'?'SIMULATED / RESTRICTED':'SIMULATED / UNAVAILABLE';
   for(const btn of options.querySelectorAll('button[data-scenario]')){
    btn.setAttribute('aria-pressed',String(btn.dataset.scenario===active));
   }
   display.replaceChildren();
   const root=node('div','pilot-content');
   if(snapshot.state==='ready'){
    if(details&&snapshot.nextGathering){
     const back=node('button','back-button','←  Back to Today');
     back.type='button';
     back.setAttribute('data-action','back');
     root.append(back,
      node('div','screen-kicker','YOUR GROUP · SYNTHETIC'),
      node('h1','screen-greeting','Next gathering.'),
      node('p','screen-description','These details illustrate the approved read-only data contract—not a live church calendar.')
     );
     const panel=node('section','view-details');
     panel.append(node('h3','',snapshot.group.name),
      line('Gathering',snapshot.nextGathering.title),
      line('When',when(snapshot.nextGathering.startsAt)),
      line('Connection','Simulated, read only'),
      line('Data source',snapshot.source),
      line('Last sample check',new Date(snapshot.checkedAt).toLocaleTimeString('en-US',{hour:'numeric',minute:'2-digit'})));
     root.append(panel,node('p','source-note','This lab intentionally does not offer RSVP, messages, attendance, or other changes.'));
    }else{
     root.append(
      sectionHeading('Good morning, ','Sample Member.'),
      append(node('div','status-strip'),node('span','status-dot good'),node('span','', 'SIMULATED ACCESS VERIFIED · READ ONLY')),
      verifiedCard(snapshot)
     );
     const panel=node('section','view-details');
     panel.append(
      node('h3','', 'Today at a Glance'),
      line('Your group',snapshot.group.name),
      line('Next gathering',snapshot.nextGathering?when(snapshot.nextGathering.startsAt):'None currently listed'),
      line('Data source',snapshot.source),
      line('Status','Sample snapshot, just checked')
     );
     root.append(panel,node('p','source-note',snapshot.nextGathering?
      'The gathering appears only when there is an authorized, verified future event.':
      'No invented recurring dates. Your group remains visible, but no gathering is claimed.'));
    }
   }else if(snapshot.state==='restricted'){
    details=false;
    root.append(
      sectionHeading('Your people. ','Safely protected.'),
      append(node('div','status-strip'),node('span','status-dot warning'),node('span','', 'MEMBER DATA NOT AVAILABLE')),
      availabilityCard('We can’t show your group right now.',
       'For your privacy, Rally Point only shows group information when access has been verified. A secure sign-in may be needed later.')
    );
    const panel=append(node('div','recap'),node('h3','', 'What this protects'),node('p','', 'Group names, times, and other member details never remain visible after access is denied.'));
    root.append(panel);
   }else{
    details=false;
    root.append(
     sectionHeading('Your people. ','Still matter.'),
     append(node('div','status-strip'),node('span','status-dot warning'),node('span','', 'SOURCE TEMPORARILY UNAVAILABLE')),
     availabilityCard('Group information is temporarily unavailable.',
      'Rally Point won’t guess your next gathering or show outdated information. You can try again once your connection is available.')
    );
    root.append(append(node('div','recap'),node('h3','', 'What this protects'),node('p','', 'An outage is not interpreted as an RSVP, a canceled gathering, or a loss of membership.')));
   }
   display.appendChild(root);
  }
  options.addEventListener('click',event=>{
   const button=event.target.closest('button[data-scenario]');
   if(!button||!options.contains(button))return;
   if(!scenarioIds.includes(button.dataset.scenario))return;
   active=button.dataset.scenario;
   details=false;
   display.scrollTop=0;
   render();
  });
  display.addEventListener('click',event=>{
   const button=event.target.closest('button[data-action]');
   if(!button)return;
   if(button.dataset.action==='open-details'&&makeSnapshot(active).nextGathering){
    details=true;
    display.scrollTop=0;
    render();
   }else if(button.dataset.action==='back'){
    details=false;
    display.scrollTop=0;
    render();
   }
  });
  render();
  return Object.freeze({
   scenario:()=>active,
   isDetails:()=>details,
   chooseScenario:id=>{
    if(!scenarioIds.includes(id))throw new RangeError('Unknown synthetic scenario');
    active=id;details=false;render();
   }
  });
 }
 return Object.freeze({scenarioIds,makeSnapshot,mount});
});
