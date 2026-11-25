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
  // Screen focus and origin restoration are owned by connect-design-lab.js.
})();
