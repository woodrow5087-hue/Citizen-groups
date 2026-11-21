# Verse Circuit — game design blueprint v0.1
**Working title:** Verse Circuit (a distinct new gameplay concept within Rally Point's VersePlay family)
**Status:** Codex implementation brief for a first playable vertical slice — *not* a signed-off final design.
**Source branch:** `rally-point/verse-circuit-spike-v01`, based on `rally-point/verseplay-modern-bsb` (PR #29).
**Product:** Rally Point / Citizen Church fictional local demo.

## 1. Why we're building this

The team liked the *game-style memorization* concept during the November 19 meeting. The current VersePlay prototype proved a tactile Bible game can work, but its "verse with blanks + bank of selectable words + check" loop resembles Sagebrush Church's BuddyCheck. We want a dramatically more distinct, higher-quality, highly playable experience — not just different icons, colors, or names.

**Design mandate:** The experience must immediately feel like a self-contained, polished, original *mobile puzzle game that teaches Scripture*, not a church content page wearing a game card.

**Not being copied:** third-party logo, layout, screenshots, word-bank mechanic, animations, assets, typography, sound or distinct expression. Familiar biblical ideas and common game primitives can be used, but original presentation and a substantively different core loop are required.

**Creative intent:** bold, tactile, kinetic, slightly surprising, but mature and well crafted. User strongly dislikes generic card stacks, AI-slop styling, decorative neon gradients, and nonfunctional UI.

## 2. Three core pillars

1. **Play first; learn while playing.** Every step requires meaningful physical interaction and retrieval of the verse; never a fake "Continue" animation with no gameplay.
2. **Sequence and recall, not filling blanks.** Entire *phrases* are connected into a visual pathway; the final stage involves unaided recall, not choosing from a list of five missing words.
3. **Delight with restraint.** Physical-feeling motion, clean feedback, deep ink, matte cream, Citizen red accents and an unexpected electric-lime energy signal. Motion explains state and rewards progress, rather than constantly moving.

## 3. The first vertical slice (ONE complete level)

**Level:** "Love One Another" — John 15:12, Berean Standard Bible (BSB).
**Exact source text already in repository:** "This is My commandment, that you love one another as I have loved you."
**Verbatim display and answer checks should rely on the existing BSB record in `rallypoint-memorize.js`, not invent Bible wording.** Do not import copyrighted NIV/ESV/NLT text without permission.

The first level has **three distinct playable stages** and a rewarding conclusion.

### Stage A — TRACE (orient yourself)
- A magnetic-looking "circuit" of 3 distinct, slightly offset nodes forms a visually unique pathway across the playfield.
- Each node contains a short *meaningful phrase*, from the authentic BSB verse:
  1. "This is My commandment,"
  2. "that you love one another"
  3. "as I have loved you."
- The player **touches/taps each node to energize it**. A connection draws to the next; this is a playful read-and-notice action, not a forced auto-advance. Tap order can follow the visible progression.
- The player may take as long as desired. An accessible, visible "Start connecting" control takes the player to the next stage once all nodes have been energized.
- The educational intent is chunking the verse into naturally meaningful phrases.

### Stage B — LINK (reconstruct the meaning)
- Three phrase *modules* appear in a new shuffled spatial layout, **not as an answer bank under missing words**. Think connected pieces of a device, not text chips.
- The player taps (or drag-drops if robustly implemented with equivalent tap and keyboard input) phrase modules in sequence to assemble the passage along a **curved, staggered circuit path**.
- Each valid connection draws an animated line/beam between modules, deposits the phrase into a node, and makes the next destination apparent.
- A mistake produces a gentle but unmistakable "not quite" pulse/shimmy, short friendly correction and no punitive lockout. Keep the placed correct connections.
- A clear "Hint" highlights the next *relationship/position*, not a missing word. Hints remain useful and non-shaming.
- On success, the circuit visibly powers up with a brief, intentionally crafted animation.
- Order should be randomized deterministically per new round; do not accidentally keep it sorted.

### Stage C — ECHO (real retrieval)
- Briefly display the full powered-up verse and allow the user to choose when to hide it.
- Present a simple recall prompt, **without a word-tile bank**. Default: ask the player to type or say via their device keyboard/dictation the concluding phrase, "as I have loved you." Leave a visible re-study/reveal affordance and a skip-without-shame option.
- Validate recall fairly: case-insensitive, punctuation-insensitive, normalize whitespace, and allow an explicit "Show me" hint. Do not silently accept unrelated text.
- The game should distinguish "completed with help" from "recalled independently" only as the player's own feedback. Never interpret this as spiritual performance.
- The player controls pacing (no forced countdown). Both keyboard and iPhone virtual keyboard must work without obscuring controls or trapping focus.

### Completion — CIRCUIT COMPLETE
- The full path connects and gently pulses; show the authentic verse and passage reference, a tasteful earned badge such as "Circuit complete", and a friendly "Play again" button.
- Show *game-level stats* only (e.g. nodes connected, hints used). No ranking of faith, prayer, maturity, attendance or member status.
- Optional small celebratory effect respects reduced-motion and can be disabled.
- A replay reshuffles the LINK stage; a page refresh reopens the exact saved stage or completed level.

## 4. Visual design / creative freedom

**Design language:** premium contemporary mobile puzzle arcade.
- Foundation: deep charcoal/ink, warm matte cream as readable Scripture surface, purposeful Citizen red #E3002B and energetic lime #E9FF27 used sparingly for circuitry/active state. This should feel like Rally Point, yet have its own recognized "Verse Circuit" game personality.
- The visual *hero* is the curved modular pathway and flowing connection signal — not a Bible verse printed on a card with five blank slots.
- Modules should feel physically tappable (depth via restrained directional shadows and layered surfaces).
- Nonstandard asymmetrical spatial rhythm, attractive typographic hierarchy and rich state transitions. Avoid generic dashboard cards, excessive bordered boxes, fake photos and decorative noise.
- Strong enough to be shared as a screenshot of its own game, but readable and calm enough for long-term use.
- On narrow phones, scale gracefully — no clipped headers, overlapping buttons, sideways scrolling or tiny tap targets.
- Distinct original animation is essential. Motion should be 150–400 ms and purposeful; avoid gratuitous continuous effects.
- The current VersePlay design is **inspiration for quality only**, not a visual template to re-skin.

## 5. Interaction, state and technical architecture

**IMPORTANT: Keep the existing VersePlay game untouched and reviewable.** The vertical slice is a separate experimental route, e.g. `verse-circuit-lab.html` with `verse-circuit-lab/engine.js`, `ui.js`, and `style.css`. Do not change Today, Groups, Team, Read, onboarding or production behavior as part of the first slice.

- Current app is vanilla HTML/CSS/JS with `scripts/build.cjs` explicitly packaging assets. Use existing stack; no new full UI framework and no heavy game engine.
- Pure state machine separate from DOM: `TRACE -> LINK -> ECHO -> COMPLETE`; type-safe-ish normalized input/state, deterministic puzzle shuffle, restart and resume.
- Use browser-local fictional data with a **new namespaced localStorage key**, e.g. `rallypoint-verse-circuit-lab-v1`. Never overwrite or migrate `rallypoint-phase1-2026` or other app state.
- Use existing BSB content; store exact reference and source version, and safely reset only lab state if verse text revision changes.
- Hints and reset must work, wrong answers must not corrupt correct connections, all controls perform their advertised action.
- Never imply real multiplayer, leader monitoring, backend sync, account sign-in or shared leaderboards.
- Input must work on iOS Safari, mouse, touch and keyboard; implement tap-first even if drag is later layered on.
- If adding haptics, only use a supported API and do not rely on it for meaning. Sound is **optional and OFF by default**; no copyrighted external effects.
- No server dependencies, API keys, third-party assets or new tracking.

## 6. Accessibility, performance and quality

- Reachable at 320×568, 375×667, 390×844, 430×932 and desktop. Proper safe areas and main-content scrolling; avoid hiding completion beneath the dock or keyboard.
- Touch targets >= 44×44 CSS px; visible keyboard focus; screen-reader labels for every active node, controls and progress.
- Announce stage changes and success/correction via accessible status region; never use color alone to communicate success or errors.
- Minimum WCAG AA contrast for all gameplay text.
- Prefer `transform` and `opacity` animations; avoid layout thrashing. Respect `prefers-reduced-motion` throughout.
- No "dead" controls or simulated backend. A single passage should run smoothly end-to-end and feel finished.

## 7. Exactly what Codex should deliver first

1. A functional standalone playable level at `/verse-circuit-lab.html`, built by the existing static build.
2. A distinct original UI with the TRACE / LINK / ECHO / COMPLETE loop, no five-blank word bank.
3. Deterministic pure game rules with unit tests for valid/invalid order, hints, reset, replay, refresh/resume, and recall normalization.
4. Automated browser/mobile tests: play through the entire level at 320px and 390px; keyboard-only route; axe accessibility; reduced-motion behavior; no overflow.
5. Screenshot artifacts from the real rendered game: stage TRACE, LINK, ECHO and COMPLETE at an iPhone-like viewport. No screenshot-only mockups.
6. A short developer README with launch steps, controls, known issues and decisions requiring design review.
7. A reviewable **draft** PR and Netlify deploy preview. Do not merge or publish production.

## 8. Acceptance: "feels like a game"

A reviewer should be able to say:
- "I interacted with distinct devices, not five empty words and a tray of answers."
- "Connecting phrases felt physical and gave immediate, comprehensible feedback."
- "The recall stage actually asked me to remember something."
- "The controls were obvious without a tutorial or my looking at the code."
- "I wanted to retry a round to make the full circuit flow."
- "It felt like a premium game made specifically for Rally Point, not a copy of BuddyCheck."

If a feature conflicts with any of these principles, revise it rather than shipping a generic placeholder.

## 9. Explicitly NOT in this first issue

Real member-vs-member battles, Church Center / Planning Center connections, leader dashboards, streaks, ranked competitions, paid licensing, multi-church settings, large Bible libraries, or any modification to the existing approved VersePlay prototype. Those require later product and safety decisions.

## 10. Development sequence after this first vertical slice

- **VC-01 (NOW):** one polished complete level and browser QA.
- **VC-02:** 3–5 verified BSB levels, adaptive difficulty and session design; only after first gameplay review.
- **VC-03:** satisfying sound/haptic preferences, richer motion, robust pause/resume and latency polish.
- **VC-04:** user-tested local friendly challenges; multiplayer architecture as a design proposal only.
- **VC-05:** opt-in async church-member challenges, subject to identity, privacy, moderation/minors, safeguarding and a church-approved backend.

**The first PR is an experiment. User visual/gameplay approval comes before integration into Read.**
