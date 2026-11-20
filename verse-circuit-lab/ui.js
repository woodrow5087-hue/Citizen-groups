/* DOM and focus behavior for the standalone Verse Circuit lab. */
(() => {
  'use strict';
  const circuit = window.VerseCircuit;
  const { PASSAGE, PHRASES, RECALL_LIMIT } = circuit;
  const game = document.getElementById('vc-game');
  const content = game.querySelector('[data-vc-content]');
  const controls = game.querySelector('[data-vc-controls]');
  const feedback = document.getElementById('vc-feedback');
  const storageNotice = document.getElementById('vc-storage-notice');
  const storage = {
    getItem: key => localStorage.getItem(key),
    setItem: (key, value) => localStorage.setItem(key, value)
  };
  const initialSeed = new Uint32Array(1);
  window.crypto.getRandomValues(initialSeed);
  let state = circuit.load(storage, initialSeed[0]);
  let saved = true;

  const stages = ['Trace', 'Link', 'Echo'];
  const roles = ['The opening', 'The instruction', 'The closing'];
  const escape = value => String(value).replace(/[&<>"']/g, character => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[character]);
  const reference = `${escape(PASSAGE.reference)} <span aria-hidden="true">·</span> <abbr title="Berean Standard Bible">${escape(PASSAGE.translation)}</abbr>`;
  const arrow = '<svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 12h15m-6-6 6 6-6 6"/></svg>';
  const primary = (action, label) => `<button type="button" class="vc-primary" data-vc-action="${action}">${label}${arrow}</button>`;
  const quiet = (action, label, extra = '') => `<button type="button" class="vc-quiet" data-vc-action="${action}" ${extra}>${label}</button>`;

  document.getElementById('vc-reference').innerHTML = reference;

  function steps() {
    const current = state.stage === 'complete' ? stages.length : stages.findIndex(name => name.toLowerCase() === state.stage);
    document.getElementById('vc-steps').innerHTML = stages.map((name, index) => {
      const position = index < current ? 'done' : index === current ? 'current' : 'next';
      return `<li data-state="${position}" ${position === 'current' ? 'aria-current="step"' : ''}>
        <span class="vc-step-number" aria-hidden="true">0${index + 1}</span>
        <span class="vc-step-label">${name}${position === 'done' ? '<span class="vc-sr">, complete</span>' : ''}</span>
      </li>`;
    }).join('');
  }

  function intro(kicker, title, description) {
    return `<div class="vc-intro">
      <p class="vc-kicker">${kicker}</p>
      <h1 class="vc-title" id="vc-title" tabindex="-1">${title}</h1>
      <p class="vc-copy" id="vc-instructions">${description}</p>
    </div>`;
  }

  function track(powered, fresh) {
    const segments = [
      'M11 0V50',
      'M11 50V87Q11 98 15 105L21 120Q25 128 25 139V150',
      'M25 150V163Q25 174 21 181L15 198Q11 207 11 218V250',
      'M11 250V300'
    ];
    return `<svg class="vc-track" viewBox="0 0 100 300" preserveAspectRatio="none" aria-hidden="true">
      ${segments.map(path => `<path class="vc-rail" d="${path}" vector-effect="non-scaling-stroke"/>`).join('')}
      ${segments.map((path, index) => `<path class="vc-signal" d="${path}" pathLength="1" vector-effect="non-scaling-stroke"
        data-live="${index < powered || (index === 3 && powered === PHRASES.length)}" ${fresh && (index === powered - 1 || index === 3 && powered === PHRASES.length) ? 'data-fresh' : ''}/>`).join('')}
    </svg>`;
  }

  function board(stage, fresh = false) {
    const playing = stage === 'trace' || stage === 'link';
    const placed = stage === 'trace' ? state.trace.length : state.links.length;
    const countLabel = stage === 'trace' ? 'Activated' : 'Connected';
    const heading = playing
      ? `<div class="vc-board-head"><span>${countLabel}</span><span>${placed} / ${PHRASES.length}</span></div>`
      : '';
    const order = stage === 'link'
      ? [...state.links, ...circuit.linkOrder(state.seed).filter(id => !state.links.includes(id))]
      : PHRASES.map(phrase => phrase.id);
    const nodes = order.map((id, index) => {
      const live = index < placed;
      const status = live ? 'live' : stage === 'link' ? 'open' : index === placed ? 'ready' : 'locked';
      const module = stage === 'link' && !live;
      const body = `<span class="vc-jack" aria-hidden="true"></span><span class="vc-node-body">
        ${module ? '' : `<span class="vc-node-label">${roles[id]}</span>`}
        ${playing ? `<span class="vc-node-text">${escape(PHRASES[id].text)}</span>` : ''}
      </span>`;
      const effect = fresh && index === placed - 1 ? 'data-fresh' : '';
      let node = `<div class="vc-node">${body}</div>`;
      if (stage === 'trace') {
        node = `<button type="button" class="vc-node" data-vc-action="trace" data-vc-value="${id}"
          aria-pressed="${live}" ${live ? 'disabled' : ''}>${body}</button>`;
      }
      if (module) {
        node = `<button type="button" class="vc-node vc-module" data-vc-action="link" data-vc-value="${id}"
          ${state.linkHint && id === placed ? 'data-clue' : ''} ${state.mistake === id ? 'data-mistake' : ''}>${body}</button>`;
      }
      return `<li class="vc-stop" data-index="${index}" data-state="${status}" ${effect}
        ${state.mistake === id && stage === 'trace' ? 'data-mistake' : ''}>${node}</li>`;
    }).join('');
    const pathwayLabel = stage === 'link' ? 'Circuit pathway with shuffled phrase modules' : 'Circuit pathway';
    return `<section class="vc-board" data-board="${stage}" aria-label="Scripture circuit">
      ${heading}<div class="vc-playfield">${track(placed, fresh)}
      <ol class="vc-nodes" role="list" aria-label="${playing ? pathwayLabel : 'The three connected phrases'}">${nodes}</ol>
      </div>
    </section>`;
  }

  function verse() {
    return `<figure class="vc-verse">
      <blockquote>${escape(PASSAGE.text)}</blockquote>
      <figcaption>${reference}</figcaption>
    </figure>`;
  }

  function scene(fresh = false) {
    if (state.stage === 'trace') {
      return intro('Trace', 'Love one another.', 'Tap the phrases from top to bottom to power the path.') + board('trace', fresh);
    }
    if (state.stage === 'link') {
      return intro('Link', 'Make the connection.', 'Tap the phrases in verse order to lock them into the path.') + board('link', fresh);
    }
    if (state.stage === 'complete') {
      const result = {
        independent: 'You connected all three phrases and recalled the ending from memory.',
        assisted: 'You recalled the ending with help after connecting all three phrases.',
        skipped: 'You connected all three phrases and finished with a final reading.'
      }[state.outcome];
      return intro('Circuit complete', 'By heart.', result) + board('complete') + verse();
    }
    if (state.echo === 'reveal') {
      return intro('Echo', 'Read it once more.', 'Notice how the closing phrase completes the instruction. Hide the verse when you’re ready.') + board('echo') + verse();
    }
    return intro('Echo', 'Recall the closing.', 'Type just the last phrase. Capitalization and punctuation are optional.') +
      board('echo') + `<form class="vc-recall" id="vc-echo-form">
        <label for="vc-recall">Closing phrase</label>
        <textarea id="vc-recall" rows="2" maxlength="${RECALL_LIMIT}" aria-describedby="vc-instructions"
          autocomplete="off" spellcheck="false" placeholder="Write what you remember…"></textarea>
      </form>`;
  }

  function actionButtons() {
    if (state.stage === 'trace') {
      return state.trace.length === PHRASES.length ? primary('continue', 'Start connecting') : '';
    }
    if (state.stage === 'link') {
      return state.links.length === PHRASES.length
        ? primary('continue', 'Go to Echo')
        : quiet('hint', state.linkHint ? 'Hint active' : 'Get a hint', state.linkHint ? 'disabled' : '');
    }
    if (state.stage === 'complete') return primary('replay', 'Play again');
    if (state.echo === 'reveal') return primary('hide', 'Hide the verse');
    return `<button type="submit" class="vc-primary" form="vc-echo-form" data-vc-action="check">Check recall${arrow}</button>
      <div class="vc-secondary">${quiet('reveal', 'Show me the verse')}${quiet('skip', 'Finish with study')}</div>`;
  }

  const errors = {
    'trace-next': 'Follow the path from the top. Try the next unlit phrase.',
    'link-retry': 'That phrase comes later. Your connections stay in place.',
    'recall-empty': 'Enter the closing phrase, then check your recall.',
    'recall-retry': 'That wording is a little different. Try again, or read the verse once more.'
  };

  function status(action) {
    const error = errors[state.feedback];
    if (state.stage === 'link' && state.linkHint) {
      const hints = [
        'Start with the phrase that introduces Jesus’ commandment.',
        'Now choose the phrase that tells us what to do.',
        'Close with the phrase that describes how Jesus has loved us.'
      ];
      const hint = hints[state.links.length];
      return error ? ['error', `${error} ${hint}`] : ['help', hint];
    }
    if (error) return ['error', error];
    if (action === 'trace' || action === 'link') {
      const count = action === 'trace' ? state.trace.length : state.links.length;
      if (count === PHRASES.length) return ['success', action === 'trace' ? 'Path powered.' : 'All three phrases connected.'];
      return ['success', `${count} of ${PHRASES.length} phrases ${action === 'trace' ? 'activated' : 'connected'}.`];
    }
    if (state.stage === 'complete') return ['success', 'Circuit complete.'];
    return ['', ''];
  }

  function updateStatus(action) {
    const [tone, message] = status(action);
    feedback.dataset.tone = tone;
    feedback.classList.toggle('vc-sr', state.stage === 'complete');
    if (feedback.textContent !== message) feedback.textContent = message;
    const note = saved ? '' : 'This browser couldn’t save this round. You can keep playing here.';
    if (storageNotice.textContent !== note) storageNotice.textContent = note;
    const field = document.getElementById('vc-recall');
    if (field) {
      if (tone === 'error') field.setAttribute('aria-invalid', 'true');
      else field.removeAttribute('aria-invalid');
    }
  }

  function render({ changed = false, fresh = false, action } = {}) {
    if (changed) steps();
    game.dataset.stage = state.stage;
    game.dataset.echo = state.echo;
    game.querySelector('[data-vc-action="restart"]').hidden = state.stage === 'complete';
    content.innerHTML = scene(fresh);
    controls.innerHTML = actionButtons();
    const field = document.getElementById('vc-recall');
    if (field) field.value = state.draft;
    updateStatus(action);
  }

  function find(action, value) {
    return game.querySelector(`[data-vc-action="${action}"]${value === undefined ? '' : `[data-vc-value="${value}"]`}:not(:disabled)`);
  }

  function dockModule(from) {
    const module = game.querySelector('.vc-stop[data-fresh] .vc-node');
    if (!module?.animate) return;
    const to = module.getBoundingClientRect();
    if (from.x === to.x && from.y === to.y) return;
    module.animate([
      { translate: `${from.x - to.x}px ${from.y - to.y}px` },
      { translate: '0 0' }
    ], { duration: 230, easing: 'cubic-bezier(.2,.8,.3,1)' });
  }

  function handle(action, value, keyboard) {
    const previous = state;
    state = circuit.reduce(previous, { type: action, value });
    if (state === previous) return;
    saved = circuit.save(storage, state);
    if (action === 'input' || action === 'check' && state.stage === 'echo') {
      updateStatus(action);
      return;
    }
    const changed = previous.stage !== state.stage || previous.echo !== state.echo || action === 'restart';
    const fresh = state.trace.length > previous.trace.length || state.links.length > previous.links.length;
    const from = action === 'link' && fresh && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? find(action, value)?.getBoundingClientRect() : null;
    render({ changed, fresh, action });
    if (from) dockModule(from);

    if (changed) {
      document.getElementById('vc-title').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    let target = find(action, value);
    if (action === 'trace' && fresh) target = find('trace', state.trace.length) || find('continue');
    if (action === 'link' && fresh) target = find('link') || find('continue');
    if (action === 'hint') target = find('link', state.links.length);
    target?.focus({ preventScroll: !keyboard });
  }

  game.addEventListener('click', event => {
    const button = event.target.closest('button[data-vc-action]');
    if (!button || button.type === 'submit') return;
    const { vcAction, vcValue } = button.dataset;
    handle(vcAction, vcValue === undefined ? undefined : Number(vcValue), event.detail === 0);
  });
  game.addEventListener('input', event => {
    if (event.target.id === 'vc-recall') handle('input', event.target.value, false);
  });
  game.addEventListener('submit', event => {
    if (event.target.id !== 'vc-echo-form') return;
    event.preventDefault();
    handle('check', undefined, true);
  });

  render({ changed: true });
})();
