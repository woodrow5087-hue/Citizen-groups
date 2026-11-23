/* Preview-only Verse Circuit entry. Protect the frozen Rally One renderer. */
(function(){
  'use strict';
  const view=document.getElementById('view');
  if(!view)return;
  function inject(){
    const read=view.querySelector('.read-screen-v09');
    if(!read||read.querySelector('[data-verse-circuit-entry]'))return;
    const label=read.querySelector('.rp-game-classic-label');
    if(!label)return;
    const section=document.createElement('section');
    section.className='card read-verse-circuit-entry';
    section.dataset.verseCircuitEntry='';
    section.setAttribute('aria-labelledby','read-verse-circuit-heading');
    section.innerHTML=
      '<div class="read-section-label"><span>VERSEPLAY · NEW GAME</span><i></i></div>'+
      '<h2 id="read-verse-circuit-heading">Verse Circuit</h2>'+
      '<p>Trace the phrases, reconnect the verse, and recall it from memory.</p>'+
      '<a class="btn red" href="verse-circuit-playground.html" aria-label="Play Verse Circuit, standalone game">PLAY VERSE CIRCUIT ↗</a>'+
      '<p class="fine-note">John 15:12 · Mobile game preview · Progress stays in this browser.</p>';
    label.before(section);
  }
  const observer=new MutationObserver(inject);
  observer.observe(view,{childList:true});
  inject();
})();
