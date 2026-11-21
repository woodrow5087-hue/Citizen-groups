/* ALIVE × Citizen v02 — verified public handoffs, local campus personalization,
 * and a campus story reel layered onto the separate ALIVE concept.
 * No login, church API, private information or writeback.
 */
(()=>{
  'use strict';
  const KEY='rallypoint-alive-citizen-campus-v02';
  const campusButton=document.getElementById('citizen-campus-button');
  const campusLabel=document.getElementById('citizen-campus-name');
  if(!campusButton||!campusLabel)return;
  let campus='Central';
  try{campus=localStorage.getItem(KEY)==='North'?'North':'Central';}catch{}
  const sources={
    central:{
      title:'Central Campus',
      image:'https://images.squarespace-cdn.com/content/v1/690989b0c6f2f33fc8c52aa9/706209f1-a2b9-4d2c-b382-e3ee5f2947ac/CENTRAL-v2.jpg',
      caption:'A real Citizen Church campus photograph. Set Central as your sample campus or explore the gallery from the church.',
      url:'https://citizenchurch.smugmug.com/AbqCampus/2026/Sermon-Series/This-is-A-House/WEEK-3',
      action:'Explore Central photos'
    },
    north:{
      title:'North Campus',
      image:'https://images.squarespace-cdn.com/content/v1/690989b0c6f2f33fc8c52aa9/0ac63731-1ec4-441f-84e5-57210ea398fa/tempImageOrJFK6.png',
      caption:'A real Citizen Church North Campus photograph. Set North as your sample campus or explore the gallery from the church.',
      url:'https://citizenchurch.smugmug.com/North-Campus/2026/SERMON-SERIES/THIS-IS-A-HOUSE-OF',
      action:'Explore North photos'
    },
    recap:{
      title:'This Is a House of Generosity',
      image:'https://images.squarespace-cdn.com/content/v1/690989b0c6f2f33fc8c52aa9/8681229e-f16c-4b8d-9d15-63531715b4b8/CG-57.jpg',
      caption:'Citizen’s November 15, 2026 message with Pastor Dustin Woodward. Three themes: see giving God’s way, give while building, and send when God calls.',
      url:'https://citizenchurchpodcast.com/messages/this-is-a-house-of-generosity/',
      action:'Watch or listen'
    },
    serve:{
      title:'This is our Welcome Team',
      image:'https://images.squarespace-cdn.com/content/v1/690989b0c6f2f33fc8c52aa9/d470e9b0-d253-42aa-b176-9bdd954f97a5/JR-26.jpg?format=2500w',
      caption:'An authentic Citizen Church photo. Explore real opportunities to serve using the church’s existing Church Center form.',
      url:'https://citizenchurch.churchcenter.com/people/forms/359182',
      action:'See serving opportunities'
    }
  };
  function setCampus(next){
    campus=next==='North'?'North':'Central';
    campusLabel.textContent=campus.toUpperCase()+' CAMPUS';
    campusButton.setAttribute('aria-label','Sample campus: '+campus+'. Activate to switch to '+(campus==='Central'?'North':'Central')+'.');
    campusButton.setAttribute('aria-pressed',String(campus==='North'));
    document.querySelectorAll('[data-citizen-campus-card]').forEach(card=>{
      card.classList.toggle('is-campus-active',card.dataset.citizenCampusCard===campus);
    });
    try{localStorage.setItem(KEY,campus)}catch{}
  }
  setCampus(campus);
  campusButton.addEventListener('click',()=>setCampus(campus==='Central'?'North':'Central'));
  const overlay=document.createElement('div');
  overlay.className='citizen-story-overlay';
  overlay.hidden=true;
  overlay.innerHTML='<button type="button" class="citizen-story-backdrop" aria-label="Close Citizen story"></button><section class="citizen-story-panel" role="dialog" aria-modal="true" aria-labelledby="citizen-story-title"><button type="button" class="citizen-story-close" aria-label="Close Citizen story">×</button><div class="citizen-story-pop" id="citizen-story-content"></div></section>';
  const css=document.createElement('style');
  css.textContent='.citizen-story-overlay{position:absolute;z-index:35;inset:0;display:flex;align-items:end}.citizen-story-overlay[hidden]{display:none!important}.citizen-story-backdrop{position:absolute;inset:0;background:#0b1714b9;border:0}.citizen-story-panel{position:relative;width:100%;max-height:86%;overflow-y:auto;background:#fff8eb;color:#213331;padding:23px;border-radius:25px 25px 0 0}.citizen-story-close{position:absolute;top:10px;right:14px;width:38px;height:38px;border-radius:50%;border:0;background:#e7ded1;color:#1b2b2b;font-size:24px;z-index:2}.citizen-story-pop{padding:7px 0 20px}.citizen-story-pop>a:focus-visible{outline:3px solid #1866b0;outline-offset:4px}.citizen-story-set-campus{display:block;border:1px solid #354c43;background:#fbf4e8;border-radius:8px;padding:11px;margin:14px 0 0;font-size:12px;font-weight:900}';
  document.head.appendChild(css);
  document.querySelector('.lab-phone').appendChild(overlay);
  let lastFocused=null;
  function close(){
    overlay.hidden=true;
    if(lastFocused&&lastFocused.isConnected)lastFocused.focus({preventScroll:true});
  }
  function open(key){
    const data=sources[key];if(!data)return;
    lastFocused=document.activeElement;
    const root=overlay.querySelector('#citizen-story-content');
    root.replaceChildren();
    const image=document.createElement('img');image.src=data.image;image.alt=data.title+' — photo from Citizen Church';image.loading='lazy';
    const heading=document.createElement('h3');heading.id='citizen-story-title';heading.textContent=data.title;
    const text=document.createElement('p');text.textContent=data.caption;
    const link=document.createElement('a');link.href=data.url;link.target='_blank';link.rel='noopener noreferrer';link.textContent=data.action+' ↗';
    root.append(image,heading,text,link);
    if(key==='central'||key==='north'){
      const choose=document.createElement('button');choose.className='citizen-story-set-campus';choose.type='button';
      choose.textContent='Make '+data.title+' my sample campus';
      choose.addEventListener('click',()=>{setCampus(key==='north'?'North':'Central');close()});
      root.appendChild(choose);
    }
    overlay.hidden=false;
    overlay.querySelector('.citizen-story-close').focus({preventScroll:true});
  }
  document.querySelectorAll('[data-citizen-story]').forEach(button=>button.addEventListener('click',()=>open(button.dataset.citizenStory)));
  overlay.querySelector('.citizen-story-backdrop').addEventListener('click',close);
  overlay.querySelector('.citizen-story-close').addEventListener('click',close);
  document.addEventListener('keydown',event=>{
    if(overlay.hidden)return;
    if(event.key==='Escape'){event.preventDefault();close()}
    if(event.key==='Tab'){
      const focus=[...overlay.querySelectorAll('button,a[href]')].filter(x=>x.getClientRects().length);
      const first=focus[0],last=focus[focus.length-1];
      if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus()}
      else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus()}
    }
  });
})();