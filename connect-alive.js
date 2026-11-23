/* Connect Alive v1 — presentation behavior only.
 * Message starters prepare a draft, never send. The member bridge owns all persistence.
 */
(function(){
  'use strict';
  const input=document.querySelector('#thread-input');
  if(!input)return;
  const cues=Array.from(document.querySelectorAll('[data-care-cue]'));
  for(const button of cues){
    button.addEventListener('click',()=>{
      if(!document.querySelector('#screen-thread')?.hidden){
        const suggestion=button.dataset.careCue||'';
        if(!suggestion)return;
        const before=input.value.trim();
        const next=before?(before+'\n'+suggestion):suggestion;
        input.value=next.slice(0,input.maxLength||700);
        // The original composer input listener saves the draft in the same
        // versioned Wednesday conversation; no new storage owner is created.
        input.dispatchEvent(new Event('input',{bubbles:true}));
        input.focus({preventScroll:true});
      }
    });
  }
  // Keyboard users arrive at a meaningful heading after changing the
  // embedded Connect screen; no extra navigation stack is introduced.
  document.addEventListener('click',event=>{
    const target=event.target.closest('[data-open]');
    if(!target)return;
    const name=target.dataset.open;
    const screen=document.querySelector('#screen-'+name);
    if(!screen)return;
    queueMicrotask(()=>{
      if(screen.hidden)return;
      const heading=screen.querySelector('.inbox-headline h2,.chat-header-title h2,.room-identity h2');
      if(heading){
        heading.tabIndex=-1;
        heading.focus({preventScroll:true});
      }
    });
  });
})();
