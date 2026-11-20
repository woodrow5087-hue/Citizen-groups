/* DOM and focus behavior for the standalone Verse Circuit lab. */
(() => {
  'use strict';
  const circuit = window.VerseCircuit;
  const { PASSAGE, PHRASES, ECHO_TASKS, RECALL_LIMIT } = circuit;
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
  const echoCopy = {
    word: { label: 'Missing words', title: 'Bring back the words.', instructions: 'Type the missing words in order.', field: 'Missing words in order' },
    phrase: { label: 'Closing phrase', title: 'Recall the closing.', instructions: 'Type the whole phrase that ends the verse.', field: 'Closing phrase' },
    verse: { label: 'Full verse', title: 'Say it by heart.', instructions: 'Try recalling the entire verse. You can finish whenever you’re ready.', field: 'Full verse' }
  };
  const echoTask = () => ECHO_TASKS[state.echoLevel];
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

  const trackHeight = PHRASES.length * 100;
  const ports = PHRASES.map((_, index) => ({ x: index % 2 ? 25 : 11, y: 50 + index * 100 }));
  const segments = ports.map(({ x, y }, index) => {
    if (!index) return `M${x} 0V${y}`;
    const start = ports[index - 1];
    const middle = (y + start.y) / 2;
    return `M${start.x} ${start.y}V${start.y + 20}C${start.x} ${middle - 6} ${x} ${middle + 6} ${x} ${y - 20}V${y}`;
  });
  const lastPort = ports.at(-1);
  segments.push(`M${lastPort.x} ${lastPort.y}V${trackHeight}`);

  function track(powered, fresh) {
    const finished = powered === ports.length;
    return `<svg class="vc-track" viewBox="0 0 100 ${trackHeight}" preserveAspectRatio="none" aria-hidden="true">
      ${segments.map(path => `<path class="vc-rail" d="${path}" vector-effect="non-scaling-stroke"/>`).join('')}
      ${segments.map((path, index) => `<path class="vc-signal" d="${path}" pathLength="1" vector-effect="non-scaling-stroke"
        data-live="${index < powered || (index === ports.length && finished)}" ${fresh && (index === powered - 1 || index === ports.length && finished) ? 'data-fresh' : ''}/>`).join('')}
    </svg>`;
  }

  function board(stage, fresh = false) {
    const playing = stage === 'trace' || stage === 'link';
    const placed = stage === 'trace' ? state.trace.length : state.links.length;
    const countLabel = stage === 'trace' ? 'Verse path' : 'Connected';
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
      const ready = stage === 'trace' && status === 'ready';
      const phrase = PHRASES[id];
      const text = playing && (live || module) ? escape(phrase.text)
        : ready ? escape(phrase.prompt ?? 'Reveal the next phrase') : '';
      const body = `<span class="vc-jack" aria-hidden="true"></span><span class="vc-node-body">
        ${module ? '' : `<span class="vc-node-label">${escape(phrase.label ?? `Phrase ${id + 1}`)}</span>`}
        ${text ? `<span class="vc-node-text">${text}</span>` : ''}
        ${ready ? `<span class="vc-trace-arrow">${arrow}</span>` : ''}
      </span>`;
      const effect = fresh && index === placed - 1 ? 'data-fresh' : '';
      const studyFocus = stage === 'trace' && live
        ? ` tabindex="-1" role="group" aria-label="${escape(phrase.text)}"` : '';
      let node = `<div class="vc-node" data-module="${id}"${studyFocus}>${body}</div>`;
      if (ready) {
        node = `<button type="button" class="vc-node" data-module="${id}" data-vc-action="trace" data-vc-value="${id}">
          ${body}</button>`;
      }
      if (module) {
        node = `<button type="button" class="vc-node vc-module" data-module="${id}" data-vc-action="link" data-vc-value="${id}"
          ${state.linkHint && id === placed ? 'data-clue' : ''} ${state.mistake === id ? 'data-mistake' : ''}>${body}</button>`;
      }
      const dock = stage === 'link' && index === placed;
      const spotlight = stage === 'trace' && index === placed - 1;
      return `<li class="vc-stop" data-index="${index}" data-state="${status}" ${effect}
        ${index % 2 ? 'data-offset' : ''} ${spotlight ? 'data-spotlight' : ''} ${dock ? 'data-dock' : ''}>
        ${dock ? '<span class="vc-dock-marker" aria-hidden="true">Next</span>' : ''}${node}</li>`;
    }).join('');
    const pathwayLabel = stage === 'link' ? 'Circuit pathway with shuffled phrase modules' : 'Circuit pathway';
    return `<section class="vc-board" data-board="${stage}" aria-label="Scripture circuit" style="--vc-node-count:${PHRASES.length}">
      ${heading}<div class="vc-playfield">${track(placed, fresh)}
      <ol class="vc-nodes" role="list" aria-label="${playing ? pathwayLabel : 'The connected phrases'}">${nodes}</ol>
      </div>
    </section>`;
  }

  function verse() {
    return `<figure class="vc-verse">
      <blockquote>${escape(PASSAGE.text)}</blockquote>
      <figcaption>${reference}</figcaption>
    </figure>`;
  }

  function echoProgress() {
    return `<ol class="vc-echo-progress" role="list" aria-label="Recall steps">
      ${ECHO_TASKS.map((task, index) => {
        const done = Boolean(state.echoResults[task.id]);
        const current = index === state.echoLevel;
        const passed = index < state.echoLevel && !done;
        return `<li data-state="${done ? 'done' : current ? 'current' : passed ? 'passed' : 'next'}" ${current ? 'aria-current="step"' : ''}>
          ${echoCopy[task.id].label}${task.optional ? '<span class="vc-sr">, optional</span>' : ''}
          ${done ? '<span class="vc-sr">, completed</span>' : ''}
          ${passed ? '<span class="vc-sr">, skipped</span>' : ''}
        </li>`;
      }).join('')}
    </ol>`;
  }

  function recallCue(task) {
    if (task.id === 'verse') return board('echo');
    let quotation;
    let caption;
    if (task.id === 'word') {
      quotation = task.parts.map(part => typeof part === 'number'
        ? `<span class="vc-gap"><span aria-hidden="true">${part + 1}</span><span class="vc-sr">Missing word ${part + 1}</span></span>`
        : escape(part)).join('');
      caption = 'Use the words around each numbered gap.';
    } else {
      quotation = PHRASES.map(({ id, text }) => id === task.phraseId
        ? '<span class="vc-gap vc-gap-phrase">Closing phrase hidden</span>' : escape(text)).join(' ');
      caption = 'The opening is here to help you remember the ending.';
    }
    return `<figure class="vc-memory-text">
      <blockquote>${quotation}</blockquote>
      <figcaption>${caption}</figcaption>
    </figure>`;
  }

  function outcomes() {
    const entries = ECHO_TASKS.filter(task => state.echoResults[task.id]).map(task =>
      `<li><span>${echoCopy[task.id].label}</span><strong>${state.echoResults[task.id] === 'assisted' ? 'With help' : 'From memory'}</strong></li>`);
    return entries.length ? `<ul class="vc-outcomes" role="list" aria-label="Recall results">${entries.join('')}</ul>` : '';
  }

  function recallScene() {
    const task = echoTask();
    const copy = echoCopy[task.id];
    if (state.echo === 'reveal') {
      return intro('Echo', 'Read it once more.', 'Take your time. Your answer will be here when you return.') + echoProgress() + verse();
    }
    if (state.echo === 'solved') {
      const titles = { word: 'The words are back.', phrase: 'You recalled the closing.', verse: 'You recalled the full verse.' };
      const help = state.echoResults[task.id] === 'assisted';
      return intro('Echo', titles[task.id], help ? 'You remembered it with a little support.' : 'You brought it back from memory.') + echoProgress() + board('echo');
    }
    return intro('Echo', copy.title, copy.instructions) + echoProgress() + recallCue(task) +
      `<form class="vc-recall" id="vc-echo-form">
        <label for="vc-recall">${copy.field}</label>
        <textarea id="vc-recall" rows="${task.id === 'verse' ? 3 : 2}" maxlength="${RECALL_LIMIT}" aria-describedby="vc-instructions vc-recall-format"
          autocomplete="off" spellcheck="false" placeholder="Write what you remember…"></textarea>
        <p class="vc-recall-format" id="vc-recall-format">Capitalization and punctuation are optional.</p>
      </form>`;
  }

  function scene(fresh = false) {
    if (state.stage === 'trace') {
      const description = state.trace.length === PHRASES.length
        ? 'Read the phrases together once before you put them back in order.'
        : 'Start with the opening. Follow the questions to discover how the verse fits together.';
      return intro('Trace', `${escape(PASSAGE.title)}.`, description) + board('trace', fresh);
    }
    if (state.stage === 'link') {
      return intro('Link', 'Link the verse.', 'Choose the next phrase to dock it into the highlighted socket.') + board('link', fresh);
    }
    if (state.stage === 'complete') {
      const result = {
        independent: state.echoResults.verse ? 'You recalled the full verse from memory.' : 'You recalled the closing phrase from memory.',
        assisted: 'You connected the verse and strengthened your recall with help.',
        skipped: 'You connected the verse and finished with study.'
      }[state.outcome];
      return intro('Circuit complete', 'By heart.', result) + board('complete') + verse() + outcomes();
    }
    return recallScene();
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
    const task = echoTask();
    if (state.echo === 'reveal') {
      return primary('hide', 'Return to recall') + (task.optional
        ? `<div class="vc-secondary">${quiet('finish', 'Finish practice')}</div>` : '');
    }
    if (state.echo === 'solved') {
      if (task.id === 'word') return primary('continue', 'Recall the closing phrase');
      if (task.id === 'phrase') {
        return primary('continue', 'Try the full verse') + `<div class="vc-secondary">${quiet('finish', 'Finish practice')}</div>`;
      }
      return primary('continue', 'Finish practice');
    }
    const finish = task.optional ? quiet('finish', 'Finish practice') : quiet('skip', 'Finish with study');
    return `<button type="submit" class="vc-primary" form="vc-echo-form" data-vc-action="check">Check recall${arrow}</button>
      <div class="vc-secondary">
        ${quiet('hint', state.echoHint ? 'Hint shown' : 'Get a hint', state.echoHint ? 'disabled' : '')}
        ${quiet('reveal', 'Study the verse')}${finish}
      </div>`;
  }

  const errors = {
    'link-retry': 'That phrase comes later. Your connections are still in place.',
    'recall-empty': 'Enter what you remember, then check your recall.',
    'recall-retry': 'That wording is a little different. Try again, or read the verse once more.'
  };

  function status(action) {
    const error = errors[state.feedback];
    if (state.stage === 'link' && state.linkHint) {
      const hint = PHRASES[state.links.length]?.hint ?? 'Look for the highlighted phrase.';
      return error ? ['error', `${error} ${hint}`] : ['help', hint];
    }
    if (state.stage === 'echo' && state.echo === 'recall' && state.echoHint) {
      const hint = echoTask().hint;
      return error ? ['error', `${error} ${hint}`] : ['help', hint];
    }
    if (error) return ['error', error];
    if (action === 'trace' || action === 'link') {
      const count = action === 'trace' ? state.trace.length : state.links.length;
      if (count === PHRASES.length) return ['success', action === 'trace' ? 'The whole verse is revealed.' : 'Every phrase is connected.'];
      return ['success', `${count} of ${PHRASES.length} phrases ${action === 'trace' ? 'revealed' : 'connected'}.`];
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
    game.dataset.echoLevel = echoTask().id;
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

  function linkPositions() {
    return new Map([...game.querySelectorAll('.vc-node[data-module]')].map(module => [
      module.dataset.module, module.getBoundingClientRect()
    ]));
  }

  function settleModules(positions) {
    for (const module of game.querySelectorAll('.vc-node[data-module]')) {
      const from = positions.get(module.dataset.module);
      if (!from || !module.animate) continue;
      const to = module.getBoundingClientRect();
      if (from.x === to.x && from.y === to.y) continue;
      module.animate([
        { translate: `${from.x - to.x}px ${from.y - to.y}px` },
        { translate: '0 0' }
      ], { duration: 280, easing: 'cubic-bezier(.2,.75,.25,1)' });
    }
  }

  function handle(action, value, keyboard) {
    const previous = state;
    state = circuit.reduce(previous, { type: action, value });
    if (state === previous) return;
    saved = circuit.save(storage, state);
    if (action === 'input' || action === 'check' && state.stage === 'echo' && state.echo === 'recall') {
      updateStatus(action);
      return;
    }
    const changed = previous.stage !== state.stage || previous.echo !== state.echo
      || previous.echoLevel !== state.echoLevel || action === 'restart';
    const fresh = state.trace.length > previous.trace.length || state.links.length > previous.links.length;
    const positions = action === 'link' && fresh && !window.matchMedia('(prefers-reduced-motion: reduce)').matches
      ? linkPositions() : null;
    render({ changed, fresh, action });
    if (positions) settleModules(positions);

    if (changed) {
      document.getElementById('vc-title').focus({ preventScroll: true });
      window.scrollTo({ top: 0, behavior: 'instant' });
      return;
    }
    let target = find(action, value);
    if (action === 'trace' && fresh) target = game.querySelector('[data-spotlight] .vc-node');
    if (action === 'link' && fresh) target = find('link') || find('continue');
    if (action === 'hint') target = state.stage === 'link'
      ? find('link', state.links.length) : document.getElementById('vc-recall');
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
