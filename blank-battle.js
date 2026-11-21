/* Blank Battle — standalone, browser-local casual game using the existing VersePlay engine. */
(function () {
  'use strict';
  const M = window.RallyMemory;
  function mountGame(root) {
    const mount = root?.querySelector('#bb-screen');
    if (!root || !mount || !M) return;
    if (root.dataset.blankBattleReady === 'true') return;
    root.dataset.blankBattleReady = 'true';
  const STORAGE_KEY = 'rallypoint-blank-battle-v1';
  const verseIds = ['romans', 'sermon', 'study', 'year'];
  const validId = value => verseIds.includes(value);
  const escape = value => String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let verseId = 'romans';
  let games = {};
  let activeSlot = null;
  let notice = '';
  let noticeTone = '';
  let justPlaced = -1;

  function load() {
    try {
      const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY));
      if (!parsed || parsed.revision !== M.textRevision || typeof parsed.games !== 'object') return;
      verseId = validId(parsed.verseId) ? parsed.verseId : 'romans';
      for (const id of verseIds) if (parsed.games[id]) games[id] = M.normalize(parsed.games[id], id);
    } catch (_) {
      // Private browsing and malformed state should never block play.
    }
  }
  function save() {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({revision:M.textRevision,verseId:verseId,games:games}));
    } catch (_) {
      // The current session remains playable without storage.
    }
  }
  function game() {
    if (!games[verseId]) games[verseId] = M.initial();
    return games[verseId];
  }
  function setGame(value) {
    games[verseId] = value;
    save();
  }
  function setNotice(message, tone) {
    notice = message;
    noticeTone = tone || '';
  }
  function starsFor(points) {
    return points >= 90 ? 3 : points >= 65 ? 2 : 1;
  }
  function currentTarget(g) {
    if (Number.isInteger(activeSlot) && g.slots[activeSlot] === null) return activeSlot;
    return g.slots.indexOf(null);
  }
  function referenceMarkup(c) {
    const m = c.reference.match(/^(.*)\s+(\S+)$/);
    return '<div class="bb-ref"><span>' + escape(m ? m[1] : c.reference) +
      '</span><strong>' + escape(m ? m[2] : '') + '</strong><span>(BSB)</span></div>';
  }
  function scriptureMarkup(c, g) {
    const slots = new Map(c.indexes.map((partIndex, i) => [partIndex, i]));
    const target = currentTarget(g);
    const rendered = c.parts.map((raw, wordIndex) => {
      const i = slots.get(wordIndex);
      if (i === undefined) return '<span class="bb-word">' + escape(raw) + '</span>';
      const parts = M.split(raw);
      const token = g.slots[i];
      const bankWord = c.bank.find(w => w.id === token);
      const filled = Boolean(bankWord);
      const label = filled ? bankWord.label : '_____';
      const classes = 'bb-slot' + (filled ? ' is-filled' : '') + (justPlaced === i ? ' just-placed' : '') + (target === i && !g.solved ? ' is-active' : '');
      const title = filled ? 'Filled with ' + bankWord.label + '. Tap to remove.' : 'Empty blank ' + (i + 1) + '. Tap to select.';
      return '<span class="bb-phrase">' + escape(parts.prefix) +
        '<button type="button" class="' + classes + '" data-action="slot" data-value="' + i +
        '" aria-label="' + escape(title) + '" aria-pressed="' + String(target === i && !g.solved) +
        '"' + (g.solved ? ' disabled' : '') + '>' + escape(label) + '</button>' +
        escape(parts.suffix) + '</span>';
    });
    return '<p class="bb-verse">' + rendered.join(' ') + '</p>';
  }
  function meterMarkup(count) {
    let cells = '';
    for (let i = 0; i < 5; i++) cells += '<i class="' + (i < count ? 'filled' : '') + '"></i>';
    return '<div class="bb-meter" role="progressbar" aria-label="Blanks filled" aria-valuemin="0" aria-valuemax="5" aria-valuenow="' + count + '">' + cells + '</div>';
  }
  function bankMarkup(c, g) {
    const words = M.bank(verseId, g.round).map(w => {
      const used = g.slots.includes(w.id);
      return '<button type="button" class="bb-tile' + (used ? ' is-used' : '') +
        '" data-action="tile" data-value="' + escape(w.id) + '" aria-label="Place ' +
        escape(w.label) + '"' + (used ? ' disabled' : '') + '>' + escape(w.label) + '</button>';
    }).join('');
    return '<div class="bb-bank"><div class="bb-bank-caption"><span>WORD BANK</span><span>Tap a tile to fill a blank</span></div>' +
      '<div class="bb-tiles" role="group" aria-label="Words to choose from">' + words + '</div></div>';
  }
  function resultMarkup(c, g) {
    const points = M.score(g);
    const stars = starsFor(points);
    const rating = Array.from({length:3}, (_,i) =>
      '<span class="' + (i < stars ? '' : 'empty') + '" aria-hidden="true">★</span>').join('');
    const perfect = g.misses === 0 && g.hints === 0;
    return '<div class="bb-board bb-results" role="status" aria-label="Round complete">' +
      '<div class="bb-win-emblem" aria-hidden="true">★</div>' +
      '<div class="bb-kicker">VERSE COMPLETE</div><h2>Nicely done!</h2>' +
      '<div class="bb-stars" aria-label="' + stars + ' out of 3 stars">' + rating + '</div>' +
      '<div class="bb-score">' + points + '</div><div class="bb-score-label">PUZZLE POINTS</div>' +
      '<div class="bb-reward' + (perfect ? '' : ' is-normal') + '">' +
      (perfect ? '✦ Perfect Round earned' : '✓ Verse complete') + '</div>' +
      '<div class="bb-result-stats"><span>Corrections <b>' + g.misses + '</b></span>' +
      '<span>Hints <b>' + g.hints + '</b></span>' +
      '<span>Best <b>' + (g.best === null ? points : g.best) + '</b></span></div>' +
      '<div class="bb-full-verse">“' + escape(c.text) + '”<br><strong>' + escape(c.reference) + ' · BSB</strong></div>' +
      '<div class="bb-result-buttons">' +
      '<button type="button" class="bb-again" data-action="reset">Play again ↺</button>' +
      '<button type="button" class="bb-another" data-action="next">Another verse →</button>' +
      '</div></div>';
  }
  function render(focusAction) {
    const c = M.challenge(verseId);
    const g = game();
    const versePosition = verseIds.indexOf(verseId) + 1;
    const strap = '<div class="bb-game-strap"><span class="bb-round-label">VERSE ' +
      String(versePosition).padStart(2, '0') + ' / ' +
      String(verseIds.length).padStart(2, '0') + '</span>' +
      '<span class="bb-best">PERSONAL BEST <b>' + (g.best === null ? '—' : g.best) +
      '</b></span></div>';
    if (g.solved) {
      mount.innerHTML = strap + resultMarkup(c, g);
    } else {
      const filled = M.filled(g);
      const body = '<div class="bb-board">' + referenceMarkup(c) +
        '<div class="bb-board-head"><span>FILL THE MISSING WORDS</span><b>' + filled + ' / 5</b></div>' +
        meterMarkup(filled) + scriptureMarkup(c, g) +
        '<p class="bb-instruction">Fill all five blanks. You can change a word anytime.</p></div>' +
        bankMarkup(c, g) +
        '<div class="bb-actions"><button type="button" class="bb-check" data-action="check">CHECK WORDS ✓</button>' +
        '<button type="button" class="bb-hint" data-action="hint"' + (filled === 5 ? ' disabled' : '') + '>HINT · −12</button></div>' +
        '<p class="bb-message" data-tone="' + escape(noticeTone) + '" role="status" aria-live="polite">' +
        escape(notice || 'Tap a word tile. Tap a filled blank to change it.') + '</p>';
      mount.innerHTML = strap + body;
    }
    justPlaced = -1;
    if (focusAction) {
      const target = mount.querySelector(focusAction);
      if (target) target.focus({preventScroll:true});
    }
  }
  function act(action, value) {
    const g = game();
    if (action === 'tile') {
      if (g.solved) return;
      const target = currentTarget(g);
      if (target < 0) { setNotice('All blanks are filled. Tap Check Words!', 'good'); render(); return; }
      const next = M.pick(g, verseId, value, target);
      setGame(next);
      justPlaced = target;
      activeSlot = null;
      setNotice(M.filled(next) === 5 ? 'All set! Check your verse.' : 'Nice! Keep filling the blanks.', 'good');
      render('[data-action="tile"]:not(:disabled)');
      return;
    }
    if (action === 'slot') {
      const slot = Number(value);
      if (!Number.isInteger(slot) || slot < 0 || slot >= 5 || g.solved) return;
      if (g.slots[slot] !== null) {
        setGame(M.clear(g, verseId, slot));
        activeSlot = slot;
        justPlaced = -1;
        setNotice('Word returned to the bank. Choose a replacement.');
      } else {
        activeSlot = slot;
        justPlaced = -1;
        setNotice('Choose a word for blank ' + (slot + 1) + '.');
      }
      render();
      return;
    }
    if (action === 'check') {
      const answer = M.check(g, verseId);
      setGame(answer.state);
      activeSlot = null;
      justPlaced = -1;
      if (answer.status === 'complete') {
        setNotice('', 'good');
        render('[data-action="reset"]');
      } else {
        setNotice(answer.state.feedback, answer.status === 'try-again' ? 'error' : '');
        render('[data-action="tile"]:not(:disabled)');
      }
      return;
    }
    if (action === 'hint') {
      if (g.solved) return;
      const next = M.hint(g, verseId);
      setGame(next);
      justPlaced = -1;
      activeSlot = null;
      setNotice(next.feedback, 'good');
      render('[data-action="tile"]:not(:disabled)');
      return;
    }
    if (action === 'reset') {
      setGame(M.reset(g, verseId));
      justPlaced = -1;
      activeSlot = null;
      setNotice('Fresh round, same verse. You got this!');
      render();
      return;
    }
    if (action === 'next') {
      verseId = verseIds[(verseIds.indexOf(verseId) + 1) % verseIds.length];
      justPlaced = -1;
      activeSlot = null;
      save();
      setNotice('Next verse. Fresh challenge!', 'good');
      render();
    }
  }
  root.addEventListener('click', function (event) {
    const button = event.target.closest('button[data-action]');
    if (!button || button.disabled) return;
    act(button.dataset.action, button.dataset.value);
  });
  load();
  render();
  }
  window.RallyBlankBattle = {mount: mountGame};
  const standalone = document.getElementById('bb-app');
  if (standalone) mountGame(standalone);
})();
