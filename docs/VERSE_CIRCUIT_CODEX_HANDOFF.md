# Codex build handoff — VC-01: Verse Circuit playable vertical slice

**Authoritative game brief:** [VERSE_CIRCUIT_GAME_BLUEPRINT.md](./VERSE_CIRCUIT_GAME_BLUEPRINT.md)
**Exact base:** `rally-point/verse-circuit-spike-v01` (not `main`).
**Base source lineage:** this branch was created from `rally-point/verseplay-modern-bsb` (unmerged PR #29).

## Instructions for Codex

You are the implementation engineer for a **new experimental game**, not the product designer of the rest of the app. Use the creative brief as the target experience. Make thoughtful gameplay and engineering choices when details are unspecified. Build, test and screenshot the **real** working game. Be critical of your own work.

### Step 0 — inspect before coding
- Read `docs/VERSE_CIRCUIT_GAME_BLUEPRINT.md` completely.
- Read `docs/VERSEPLAY_GAME_V1.md` as background and `rallypoint-memorize.js` for BSB source text. **Do not reuse the existing five-blank mechanic.**
- Inspect `index.html`, `scripts/build.cjs`, package scripts, existing Playwright tests and the app's mobile viewport/safe-area conventions.
- Read `verse-circuit-lab/AGENTS.md`.
- Confirm branch name before modifying files. If your environment starts on `main`, fetch and check out `rally-point/verse-circuit-spike-v01` explicitly; never implicitly rebase on old `main`.

### Implementation constraint
- Create a new route `/verse-circuit-lab.html` (keep current Rally Point and VersePlay untouched).
- Use vanilla HTML/CSS/JS + a pure Node-testable engine; no heavy new packages, external art, new API calls or third-party services.
- First level only: authentic BSB John 15:12, meaningfully chunked into three phrases.
- Implement TRACE, LINK, ECHO and completed scene, with real working state transitions, focus/accessible feedback, hint, restart, replay and local resume.
- Preserve the UX difference from BuddyCheck's blanks/answer-bank pattern.
- All interactions must work with touch and keyboard; drag gestures, if implemented, must have a tap alternative.
- Let the player control pacing. No timer, streaks, spiritual scoring or real social accounts.

### Suggested files (adapt to good engineering)
- `verse-circuit-lab.html` — standalone static entry, no new app login.
- `verse-circuit-lab/engine.js` — pure state machine, deterministic shuffle, answers, normalization and persistence validation.
- `verse-circuit-lab/ui.js` — semantic DOM, accessible events and renderer.
- `verse-circuit-lab/style.css` — original game visuals and responsive animation.
- `test/verse-circuit.test.cjs` — pure mechanics tests.
- `scripts/verse-circuit-browser-check.mjs` — Playwright simulated iPhone / keyboard / axe / screenshots.
- `docs/VERSE_CIRCUIT_IMPLEMENTATION_NOTES.md` — controls, notes, tradeoffs, how to launch.

Also update `scripts/build.cjs` to package the new route/assets and `package.json` with `test:verse-circuit`; add the new browser check to the existing preview QA workflow. Avoid regressions.

### Quality thresholds
- Works end-to-end at 320×568 and 390×844; test at 375px and 430px if feasible.
- No horizontal overflow, headings clipped under iPhone notch, overlapping UI or keyboard-obscured ECHO input.
- Visible focus; logical screen reader labels and status changes; reduced motion; WCAG AA for text; touch targets >=44px.
- Interactive decisions are all meaningful. Animation must correspond to actual puzzle progression.
- The first 3-stage John 15:12 round must be completed with just the UI, not manual state edits.
- Maintain unit, browser and onboarding tests for the existing Rally Point app.
- Capture actual Playwright screenshots for all four stages; link or upload as PR artifacts if available.
- Do not ship a mockup disguised as a game.

### Build/test and review commands
```bash
npm ci
npm test
npm run build
npm run test:verse-circuit
npm run test:browser
npm run test:onboarding
```
Avoid running `npm run pilot:check` as an app feature test: it intentionally fails because live church-pilot approvals are pending.

### Deliverable
- Open a **draft PR** from `rally-point/verse-circuit-spike-v01` to `main` once the playable level exists, explicitly noting the unmerged PR dependencies (#19–#29). A draft PR gives us a Netlify Deploy Preview but is **not** authorization to merge.
- Show the playable URL `/verse-circuit-lab.html`, actual screenshots, complete test results, known limitations and what you deliberately did **not** build.
- Request creative review before adding extra passages, friend challenges or changing the integrated Read screen.

### Handoff protocol
Codex changes are reviewable through GitHub commits and PR comments. ChatGPT can read the PR and create specific review feedback afterward. This GitHub handoff **does not itself launch Codex** or enable automatic two-way chat between agents. The user must start the Codex coding task against this repository/branch (or explicitly configure an agent automation).

### Anti-patterns to avoid
1. Re-skinning the five-blank existing game in lime or red.
2. Flat corporate cards, generic 'AI dashboard' decoration or gratuitous glow.
3. Scripted fake success regardless of actual player choices.
4. Auto-advancing quickly before the player can learn the phrase.
5. Disabling keyboard interaction in favor of drag-only UX.
6. Redefining or copying unlicensed biblical text.
7. Real member identity, leader visibility, online scores or risky tracking.
8. Editing the approved app/navigation/animated onboarding to make the lab work.

**Definition of done: one polished, genuinely original, tested, playable level.**
