/* Visual renderer for the local Scripture word puzzle. */
window.RallyVersePlay={render:function render(s,e,icon){
  const M=window.RallyMemory;
  const key=['sermon','study','year','romans'].includes(s.memoryActive)?s.memoryActive:(s.plan||'sermon');
  const mode=s.memoryMode==='pass'?'pass':'solo';
  const turn=mode==='pass'&&s.memoryPassTurn===2?2:1;
  const scope=key+':'+(mode==='pass'?'p'+turn:'solo');
  const c=M.challenge(key),g=M.normalize(s.memoryGames[scope],key);
  s.memoryGames[scope]=g;
  const p1=mode==='pass'?M.normalize(s.memoryGames[key+':p1'],key):null;
  const p2=mode==='pass'?M.normalize(s.memoryGames[key+':p2'],key):null;
  const bothDone=mode==='pass'&&p1.solved&&p2.solved;
  const progress=M.filled(g),target=Number.isInteger(s.memoryTarget)&&g.slots[s.memoryTarget]===null?s.memoryTarget:g.slots.indexOf(null);
  const at=new Map(c.indexes.map((index,slot)=>[index,slot]));
  const words=c.parts.map((raw,index)=>{
    const slot=at.get(index);
    if(slot===undefined)return `<span class="vp-word">${e(raw)}</span>`;
    const parts=M.split(raw),token=g.slots[slot],entry=c.bank.find(w=>w.id===token);
    const visible=entry?entry.label:'_____';
    const a11y=entry?'selected '+entry.label+', tap to clear':'empty, tap to choose this blank';
    return `<span class="vp-phrase">${e(parts.prefix)}<button type="button" data-action="memory-slot" data-value="${slot}" ${g.solved?'disabled':''} class="vp-blank ${entry?'is-filled':''} ${target===slot?'is-target':''}" aria-label="Blank ${slot+1}: ${e(a11y)}">${e(visible)}</button>${e(parts.suffix)}</span>`;
  }).join(' ');
  const tiles=M.bank(key,g.round).map(w=>`<button type="button" class="vp-tile ${g.slots.includes(w.id)?'is-used':''}" data-action="memory-pick" data-value="${w.id}" ${g.solved||g.slots.includes(w.id)?'disabled':''} aria-label="Choose ${e(w.label)}">${e(w.label)}</button>`).join('');
  let results='';
  if(g.solved){
    const points=M.score(g);
    results=`<div class="vp-victory" role="status">
      <span class="vp-victory-mark">${icon('check')}</span>
      <small>QUEST COMPLETE</small>
      <h4>${mode==='pass'?'Great work, Player '+turn+'!':'You got every word!'}</h4>
      <p><strong>${points}</strong> puzzle points${g.hints?' · '+g.hints+' hint'+(g.hints>1?'s':''):''}</p>
      ${mode==='pass'&&turn===1?`<button type="button" class="vp-next" data-action="memory-next-player">Hand the phone to Player 2 ${icon('arrow')}</button>`:''}
      ${bothDone?`<div class="vp-duel-result"><small>FRIENDLY MATCH</small><div><span>PLAYER 1</span><b>${M.score(p1)}</b></div><div><span>PLAYER 2</span><b>${M.score(p2)}</b></div><p>${M.score(p1)===M.score(p2)?'It’s a tie!':(M.score(p1)>M.score(p2)?'Player 1':'Player 2')+' takes the round!'}</p></div><button type="button" class="vp-next" data-action="memory-new-duel">New friendly round ${icon('arrow')}</button>`:''}
      ${mode==='solo'?`<button type="button" class="vp-next" data-action="memory-reset">Play again ${icon('arrow')}</button>`:''}
    </div>`;
  }
  const feedback=g.feedback||(g.solved?'Verse complete! Try a fresh round anytime.':'Tap a word to fill the next blank, or tap a blank to choose its position.');
  return `<section id="reading-memorize" class="verseplay" tabindex="-1" aria-label="VersePlay Scripture memory game">
    <div class="vp-top"><div class="vp-logo"><span class="vp-logo-tile">V<span>✳</span></span><span>VERSEPLAY<small>THE MEMORY ARCADE</small></span></div><span class="vp-top-status">${mode==='pass'?'2 PLAYER · LOCAL':'SOLO QUEST'}</span></div>
    <div class="vp-heading"><h2>Make the<br>words <em>click.</em></h2><div class="vp-orbit" aria-hidden="true"><i></i><i></i><i></i></div></div>
    <p class="vp-description">A little Scripture puzzle with a big “aha!” moment. Fill the blanks with the tiles below.</p>
    <div class="vp-mode" role="group" aria-label="Choose game mode">
      <button type="button" data-action="memory-mode" data-value="solo" class="${mode==='solo'?'selected':''}" aria-pressed="${mode==='solo'}">SOLO PLAY</button>
      <button type="button" data-action="memory-mode" data-value="pass" class="${mode==='pass'?'selected':''}" aria-pressed="${mode==='pass'}">PASS & PLAY <span>2P</span></button>
    </div>
    <div class="vp-challenges" role="group" aria-label="Choose verse challenge">
      <button type="button" data-action="memory-challenge" data-value="current" class="${key!=='romans'?'selected':''}" aria-pressed="${key!=='romans'}">THIS WEEK</button>
      <button type="button" data-action="memory-challenge" data-value="romans" class="${key==='romans'?'selected':''}" aria-pressed="${key==='romans'}">BONUS · ROMANS 8:28</button>
    </div>
    ${mode==='pass'?`<div class="vp-turn"><strong>PLAYER ${turn} OF 2</strong><span>${bothDone?'Round complete':turn===1?'First up!':'Your turn!'} · Same phone, no online opponent</span></div>`:''}
    <div class="vp-board">
      <div class="vp-board-title"><div><small>WORD QUEST · ${e(c.title)}</small><h3>${e(c.reference)} <span>KJV</span></h3></div><div class="vp-count"><strong>${progress}</strong><span>OF 5</span></div></div>
      <div class="vp-progress" role="progressbar" aria-label="Words filled" aria-valuemin="0" aria-valuemax="5" aria-valuenow="${progress}"><span style="width:${progress*20}%"></span></div>
      <div class="vp-scripture">${words}</div>
      ${g.solved?results:`<div class="vp-word-bank"><div class="vp-bank-caption"><strong>WORD TILES</strong><span>Tap to place · Tap a blank to edit</span></div><div class="vp-tiles" role="group" aria-label="Available word tiles">${tiles}</div></div>
      <div class="vp-actions">
        <button type="button" class="vp-check" data-action="memory-check">${icon('check')} CHECK WORDS ${icon('arrow')}</button>
        <button type="button" class="vp-hint" data-action="memory-hint" ${progress===5?'disabled':''}>HINT</button>
        <button type="button" class="vp-reset" data-action="${mode==='pass'?'memory-new-duel':'memory-reset'}" aria-label="Reset the verse puzzle">RESET</button>
      </div>`}
      <p class="vp-feedback" role="status" aria-live="polite">${e(feedback)}</p>
    </div>
    <div class="vp-together"><span class="vp-people-icon">${icon('group')}</span><div><strong>Better together.</strong><p>Try a friendly Pass & Play match. Online challenges with church members are a future opt-in feature, not connected yet.</p></div></div>
    <p class="vp-disclaimer">Local fictional game · Public-domain KJV · Puzzle points describe game accuracy, not spiritual growth.</p>
  </section>`;
}};
