// Templates and original geometric SVG artwork extracted from the approved prototype.
const esc = (s) =>
  String(s).replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        c
      ],
  );

export function renderScreen(state, passage) {
  const selectedPhrase = (id) => state.trace.includes(id);
  const traceCopy = passage.traceTokens
    .map((token) => {
      if (Object.hasOwn(token, "text")) return esc(token.text);
      const phrase = passage.phrases.find(
        (phrase) => phrase.id === token.phraseId,
      );
      return `<button type="button" data-action="trace" data-value="${esc(phrase.id)}" class="anchor ${selectedPhrase(phrase.id) ? "selected" : ""}" aria-pressed="${selectedPhrase(phrase.id)}">${esc(phrase.text)}</button>`;
    })
    .join("");
  const echoCopy = passage.echoTokens
    .map((token) => {
      if (Object.hasOwn(token, "text")) return esc(token.text);
      const answer = passage.answers.find(
        (answer) => answer.id === token.answerId,
      );
      const index = passage.answerSequence.indexOf(answer.id);
      return `<span class="blank ${state.echo.includes(answer.id) ? "filled" : ""}">${state.echo.includes(answer.id) ? esc(answer.text) : `${String(index + 1).padStart(2, "0")} · ———`}</span>`;
    })
    .join("");
  const back = (label = "Back to arcade") =>
    `<button class="nav-back" data-action="home" type="button"><svg viewBox="0 0 24 24"><path d="m15 18-6-6 6-6"/></svg>${label}</button>`;
  const meter = (i) =>
    `<div class="progress-header"><div class="left"><span class="stage-chip">${["TRACE", "LINK", "ECHO"][i]}</span><span class="stage-count">STAGE ${String(i + 1).padStart(2, "0")} / 03</span></div><span class="overline">${esc(passage.ref)}</span></div><div class="meter" role="img" aria-label="Stage ${i + 1} of 3">${[0, 1, 2].map((j) => `<div class="${j < i ? "active" : j === i ? "current" : ""}"></div>`).join("")}</div>`;
  const iconCircuit = (color = "#D0F75B") =>
    `<svg viewBox="0 0 140 99" fill="none" aria-hidden="true"><path d="M14 58H57L82 23H126" stroke="#56B7F0" stroke-width="4" stroke-linecap="round"/><path d="M57 58L90 79H126" stroke="#CE8CF3" stroke-width="3" stroke-linecap="round" stroke-dasharray="5 6"/><circle cx="14" cy="58" r="9" fill="${color}" stroke="#252346" stroke-width="4"/><circle cx="57" cy="58" r="9" fill="#B399F7" stroke="#252346" stroke-width="4"/><circle cx="82" cy="23" r="9" fill="#25D7E5" stroke="#252346" stroke-width="4"/><circle cx="126" cy="23" r="9" stroke="#CCF65B" stroke-width="4"/><circle cx="90" cy="79" r="7" fill="#4B3A79" stroke="#A793E4" stroke-width="3"/></svg>`;
  function home() {
    return `<section class="screen" aria-label="VersePlay arcade"><div class="hero-heading"><div class="overline">THE SCRIPTURE ARCADE</div><h1 class="screen-title" tabindex="-1">VERSE<em>PLAY.</em></h1><p class="deck">Pick up a verse. Discover something new.<br>Find a game worth coming back to.</p></div><section class="featured" aria-label="Featured game: Verse Circuit"><span class="eyebrow">● FEATURED EXPERIENCE</span><div><h2>VERSE<br>CIRCUIT</h2><p>Restore the verse.<br>Complete the circuit.</p></div><div class="featured-inner"><div class="featured-art">${iconCircuit()}</div><button class="play-round" aria-label="Open Verse Circuit" data-action="launch">▶</button></div></section><div class="section-heading"><h2>THE COLLECTION</h2><span>IN DEVELOPMENT</span></div><div class="game-list"><button type="button" class="game-row" data-action="concept" data-value="rush"><span class="game-icon rush">ϟ</span><span><strong>WORD RUSH</strong><small>High-speed Scripture wordplay · Concept</small></span><span class="arrow" aria-hidden="true">›</span></button><button type="button" class="game-row" data-action="concept" data-value="cross"><span class="game-icon cross">▦</span><span><strong>CROSSROADS</strong><small>Calm, clever Bible puzzles · Concept</small></span><span class="arrow" aria-hidden="true">›</span></button><button type="button" class="game-row" data-action="concept" data-value="threads"><span class="game-icon threads">⌘</span><span><strong>THREADS</strong><small>Discover the connections · Concept</small></span><span class="arrow" aria-hidden="true">›</span></button></div><div class="home-foot"><p class="fineprint">Playable design study · Fictional local progression · No accounts, leaderboards, or real church data.</p></div></section>`;
  }
  function launch() {
    return `<section class="screen" aria-label="Verse Circuit game introduction">${back()}<div class="hero-heading"><div class="overline">SIGNATURE GAME / CHAPTER ONE</div><h1 class="screen-title" tabindex="-1">VERSE<br><em>CIRCUIT.</em></h1><p class="deck">Three short challenges. One verse worth remembering.</p></div><div class="launch-art">${iconCircuit("#d0f75b")}</div><div class="stage-cards"><div class="stage-card"><span>01</span><strong>TRACE</strong><small>Notice</small></div><div class="stage-card"><span>02</span><strong>LINK</strong><small>Restore</small></div><div class="stage-card"><span>03</span><strong>ECHO</strong><small>Remember</small></div></div><p class="instruction"><span class="symbol">✦</span><span>No timer. No penalties for taking your time. Just a satisfying puzzle that gradually helps you learn Scripture.</span></p><div class="bottom-space"></div><button class="primary-btn" type="button" data-action="start">START CIRCUIT <span aria-hidden="true">→</span></button><p class="bottom-caption">${esc(passage.ref)} · ${esc(passage.translation.caption)}</p></section>`;
  }
  function trace() {
    return `<section class="screen" aria-label="Trace stage">${meter(0)}<h1 class="game-title" tabindex="-1">FIND THE<br><span style="color:var(--cyan)">SIGNAL.</span></h1><p class="game-subtitle">Tap the three outlined phrases that form the heart of the verse.</p><div class="passage-ref">${esc(passage.ref)} · ${esc(passage.translation.id)}</div><div class="trace-card"><p class="verse-copy">${traceCopy}</p></div><p class="instruction"><span class="symbol">◎</span><span>The words you notice now become the pieces you reconnect in the next stage.</span></p><div class="bottom-space"></div><p class="status" role="status">${state.trace.length === 3 ? "All three anchors found. Ready to connect." : `${state.trace.length} of 3 anchor phrases found.`}</p><button class="primary-btn" type="button" data-action="next" ${state.trace.length !== 3 ? "disabled" : ""}>CONNECT THE PHRASES <span aria-hidden="true">→</span></button>${back()}</section>`;
  }
  function link() {
    const order = passage.linkOrder,
      n = state.link.length;
    return `<section class="screen" aria-label="Link stage">${meter(1)}<h1 class="game-title" tabindex="-1">RESTORE<br><span style="color:var(--violet)">THE VERSE.</span></h1><p class="game-subtitle">Choose the phrases in the order they appear in ${esc(passage.reference)}.</p><div class="circuit-box"><div class="step"><span>CIRCUIT CONNECTIONS</span><span>${n} / 3</span></div><svg viewBox="0 0 300 71" role="img" aria-label="${n} of 3 connections activated"><path d="M25 35H275" stroke="#424c78" stroke-width="6" stroke-linecap="round"/><path d="M25 35H${Math.min(275, 25 + n * 125)}" stroke="#26d6e7" stroke-width="6" stroke-linecap="round"/>${[25, 150, 275].map((x, i) => `<circle cx="${x}" cy="35" r="15" fill="${i < n ? "#d0f75b" : "#222b4e"}" stroke="${i < n ? "#d0f75b" : "#6b72a1"}" stroke-width="3"/>${i < n ? `<path d="M${x - 6} 35 l4 4 l8 -9" stroke="#15182a" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" fill="none"/>` : `<text x="${x}" y="40" fill="#b7bdd5" font-size="12" text-anchor="middle" font-family="system-ui">${i + 1}</text>`}`).join("")}</svg></div><div class="passage-ref">YOUR CIRCUIT</div><div>${[0, 1, 2].map((i) => (state.link.length > i ? `<div class="assembled"><span>${esc(passage.segments.find((segment) => segment.id === passage.sequence[i]).text)}</span><span class="check">✓</span></div>` : `<div class="assembled placeholder">${i + 1}. ${i === n ? "Choose a phrase" : "Waiting for connection"}</div>`)).join("")}</div><div class="passage-ref">AVAILABLE PHRASES</div><div class="phrase-options">${
      order
        .filter((id) => !state.link.includes(id))
        .map(
          (id) =>
            `<button type="button" class="phrase-btn" data-action="link" data-value="${esc(id)}"><span>${esc(passage.segments.find((segment) => segment.id === id).text)}</span><span class="number">↗</span></button>`,
        )
        .join("") ||
      '<p class="instruction"><span class="symbol">✓</span><span>The full verse is connected. One more stage.</span></p>'
    }</div><div class="bottom-space"></div><p class="status" role="status" id="link-feedback">${n === 3 ? "Circuit restored. Ready to remember?" : "Tap the phrase that belongs next."}</p><button type="button" class="primary-btn" data-action="next" ${n !== 3 ? "disabled" : ""}>TEST YOUR MEMORY <span aria-hidden="true">→</span></button><div class="minor-actions"><button class="secondary-btn" type="button" data-action="hint">HINT ${state.hints ? "· " + state.hints + " USED" : ""}</button><button class="secondary-btn" type="button" data-action="resetlink" ${n === 0 ? "disabled" : ""}>UNDO CONNECTION</button></div>${back()}</section>`;
  }
  function echo() {
    const bank = passage.echoOrder.map((id) =>
      [...passage.answers, ...passage.distractors].find(
        (option) => option.id === id,
      ),
    );
    return `<section class="screen" aria-label="Echo memory stage">${meter(2)}<h1 class="game-title" tabindex="-1">MAKE IT<br><span style="color:var(--lime)">STICK.</span></h1><p class="game-subtitle">Three words have faded. Find the words that bring the passage back.</p><div class="echo-panel"><div class="passage-ref" style="margin:0 0 10px">${esc(passage.ref)}</div><p class="echo-verse">${echoCopy}</p></div><p class="echo-guide">Select the next missing phrase. Unused options disappear as you go.</p><div class="answer-bank">${bank.map((x) => `<button class="answer" type="button" data-action="echo" data-value="${esc(x.id)}" ${state.echo.includes(x.id) ? "disabled" : ""}>${esc(x.text)}</button>`).join("")}</div><div class="bottom-space"></div><p class="status" role="status" id="echo-feedback">${state.echo.length === 3 ? "All the words are back. You did it." : `${state.echo.length} / 3 words remembered.`}</p><button type="button" class="primary-btn" data-action="next" ${state.echo.length !== 3 ? "disabled" : ""}>IGNITE THE CIRCUIT <span aria-hidden="true">✦</span></button><div class="minor-actions"><button type="button" class="secondary-btn" data-action="hint">HINT ${state.hints ? "· " + state.hints + " USED" : ""}</button><button type="button" class="secondary-btn" data-action="resetecho" ${state.echo.length === 0 ? "disabled" : ""}>UNDO WORD</button></div>${back()}</section>`;
  }
  function win() {
    return `<section class="screen" style="position:relative" aria-label="Circuit completion"><div class="confetti" aria-hidden="true">${Array.from({ length: 8 }, () => "<i></i>").join("")}</div><div style="margin-top:45px" class="overline" >ROUND COMPLETE / ${esc(passage.ref)}</div><div class="victory-mark"><svg viewBox="0 0 150 150" role="img" aria-label="Circuit complete"><path d="M75 8L133 41V108L75 142L17 108V41Z" fill="#1b3143" stroke="#39d9e4" stroke-width="5"/><path d="M46 76l20 18 37-43" stroke="#d0f75b" stroke-width="10" fill="none" stroke-linecap="round" stroke-linejoin="round"/><circle cx="75" cy="75" r="66" fill="none" stroke="#9873f0" stroke-width="2" stroke-dasharray="5 11"/></svg></div><h1 class="win-title" tabindex="-1">CIRCUIT<br><span>COMPLETE.</span></h1><p class="win-text">You traced it, rebuilt it, and remembered it. That's a pretty good way to spend a few minutes with Scripture.</p><div class="success-strip"><span></span><span></span><span></span></div>${passage.afterglow ? `<div class="discovery"><span class="eyebrow">✦ OPTIONAL DISCOVERY</span><strong>There’s a connection worth exploring.</strong><p>${esc(passage.afterglow.prompt)}</p></div>` : ""}<div class="bottom-space"></div><div class="stack">${passage.afterglow ? `<button type="button" class="primary-btn" data-action="afterglow">REVEAL AFTERGLOW <span aria-hidden="true">→</span></button>` : ""}<button type="button" class="secondary-btn" data-action="restart">PLAY AGAIN</button></div><p class="bottom-caption">No spiritual scores. Just progress you can feel.</p></section>`;
  }
  function afterglow() {
    return `<section class="screen" aria-label="Afterglow Scripture connection">${back("Back to arcade")}<div class="hero-heading"><div class="overline" style="color:var(--amber)">AFTERGLOW / DISCOVER</div><h1 tabindex="-1" class="afterglow-title">THE THREAD<br>CONTINUES<span style="color:var(--amber)">.</span></h1><p class="deck">A second passage illuminates a connection in Scripture.</p></div><div class="ref-card"><span class="ref-tag">YOUR COMPLETED PASSAGE</span><h3 role="heading" aria-level="2">${esc(passage.afterglow.completedReference)}</h3><p>${esc(passage.afterglow.completedSummary)}</p></div><div class="connection" aria-label="Scripture connection"><span></span> ${esc(passage.afterglow.label)} <span></span></div><div class="ref-card"><span class="ref-tag" style="color:var(--amber)">RELATED TEACHING</span><h3 role="heading" aria-level="2">${esc(passage.afterglow.relatedRef)}</h3><p>${esc(passage.afterglow.relatedSummary)}</p></div><div class="discovery"><span class="eyebrow">THE CONNECTION</span><strong>${esc(passage.afterglow.title)}</strong><p>${esc(passage.afterglow.body)}</p></div><p class="content-caution">${esc(passage.afterglow.caution)}</p><div class="bottom-space"></div><button type="button" class="primary-btn" data-action="restart">PLAY ANOTHER ROUND <span aria-hidden="true">→</span></button></section>`;
  }

  const screens = { home, launch, trace, link, echo, win, afterglow };
  return screens[state.screen]();
}
