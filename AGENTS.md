# Rally Point · Repository Agent Instructions

## CRITICAL VISUAL DESIGN LOCK — read before changing any UI

The project has **owner-approved visual reference decisions** which are stronger than an assistant's general preference for a clean layout. This recovery branch includes the original design-lock documents, copied unchanged from `rally-point/design-lock-2026-11-21`:

- `docs/design-lock/FINAL_VISUAL_DIRECTION_v1.md`
- `docs/design-lock/RALLY_POINT_VISUAL_SPEC_v1.md`
- `docs/design-lock/PREMIUM_ALIVE_HYBRID_V01_CHECKPOINT.md`
- `docs/design-lock/REFERENCE_MANIFEST.md`
- `docs/design-lock/RECOVERY_REFERENCE_2026-11-22.md` — exact source checksums for three newly uploaded owner screenshots, supplied separately as a ZIP.
- Approved Premium ALIVE Hybrid code checkpoint: `e1b347528526aec62309d58774c712e52c56dbf8`. Keep snapshot branches intact.

**This rule supersedes generic “modernize/refine” styling suggestions:** Existing warm/cream, matte bright red, charcoal, bold type, red-led visual hierarchy, photo-backed contextual surfaces, named circular Your People profiles and premium navigation are **locked** unless the owner explicitly approves a visual change. The RC1 engine, authorization and action rules must fit the approved UI, not replace it. A smaller generic Ask Rally strip is **not** an acceptable substitute for the personalized premium assistant visual system.

**Visual work is blocked until the original screenshot references can actually be inspected** (the design-recovery ZIP and/or preserved image archive). Never pretend that the reference images were viewed just because the Markdown descriptions were read. For any UI implementation: screenshot the pre-change state, compare with exact reference images and preserved checkpoint, then screenshot the post-change version with identical 320/390/430px fixtures and prove preserved source functionality. Keep Today / Groups / Team / Read; never adopt a concept-only People/Profile tab bar.

Review-only work on `rally-point/rc1-visual-recovery-2026-11-22` is subject to issue #87 and **explicit owner signoff**. Do not merge PR #78, #83, #84, #85 or #86 automatically, and never deploy production.


Applies to the complete repository. Read `README.md`, `docs/RALLY_POINT_MASTER_BLUEPRINT_v1.0.md`, and `docs/roadmap/RALLY_COMPANION_1_0.md` before planning substantial Rally Companion work. The current milestone is tracked at GitHub issue #79.

## Product north star
Rally Point should feel like a warm, useful personal companion for Citizen Church community life—not a mobile copy of a church website, a menu of features, or a generic conversational bot. The member journey is **understand → choose → act deliberately → see truthful follow-through**. Preserve the approved Today / Groups / Team / Read four-tab architecture, “Rally Point: Alive” editorial feel, matte Citizen-red accents, charcoal header, cream backgrounds, contrasting contextual rows, and circular people rail. Never add bland corporate dashboard cards as a shortcut.

## Source of truth and privacy
- Work only with existing fictional fixture data until live identity, consent, permissions, integrations, retention and audit design receive separate approval. No fake real-world message, reservation, roster or church confirmation.
- Current memberships and authoritative saved state gate every answer and action. A conversation history entry is **not authorization**. Do not leak private group or team details to a guest, former member or unrelated leader.
- Do not invent recurring dates from one fixture, pretend to know what happened at church, or infer spiritual maturity, attendance, wellness or belonging from engagement.
- No text or LLM response can complete RSVP, volunteering, joining, messaging, attendance, or any stateful action. Require the existing explicit, guarded user click, then re-read state for follow-through.
- Keep transcripts and conversation focus ephemeral in the open sheet; do not persist new personal data, silently create storage keys, add network requests, or send notifications.
- If a source is unavailable, say so. If a request is ambiguous, clarify. Distinguish optional encouragement from required commitments.

## Existing technical surface
- Static HTML, CSS, JavaScript with Node 22+ and no production backend. `rallypoint.js` is the app controller; `rallypoint-personal-companion.js` exports the current Ask Rally pure model; `rallypoint-smart-dashboard.js` and `rallypoint-priority-board.js` derive source-backed Today choices; `rallypoint-conversation-read-model.js` handles the modern authorized group conversation projection. Preserve these public contracts while extracting modules.
- Existing opt-in lab URLs: `?f10=1&skipWelcome=1` (baseline Ask Rally), `?f103=1&skipWelcome=1` (goal mode). F-10.4 is under owner review in PR #78 at `?f104=1&skipWelcome=1`; do not merge or import it without separate approval.
- Default Today, Groups, Team, Read, onboarding, Scripture/VersePlay and Blank Battle, old chat archive and existing browser-local storage must continue to work.
- Keep the existing preview/build system. Do not introduce an app framework, backend, API keys, paid platform dependency, or broad package migration unless the owner authorizes it.

## Efficient development protocol
1. **Outcome first.** Select one complete milestone acceptance journey from `docs/roadmap/RALLY_COMPANION_1_0.md`. List the testable states and data/permission boundaries.
2. **Small commits, cohesive PR.** Prefer a few logical workstream PRs over a separate PR for each UI string. Keep branch work isolated from `main` and `rally-point/develop`; never write directly to protected branches.
3. **Parallelize only independent work.** Ownership lanes: (a) fixture/source contracts and pure adapters; (b) goal/intent/action policies after contract is defined; (c) sheet/Today UX after policy contract is defined; (d) tests/docs independent where no files overlap. Never let parallel workers edit `rallypoint.js` or `rallypoint-personal-companion.js` concurrently.
4. **Fast inner loop:** `npm ci` once, `npm run test:companion` for relevant logic, then `npm run build`. Address failures, not just report them. Keep app buildable.
5. **Full gate:** `npm test`, `npm run build`, `npm run test:browser` plus applicable existing onboarding/chat/groups/game checks and GitHub/Netlify PR checks. Test at 320/390/430px, keyboard/focus and accessibility. Add regression tests for guest/revoked membership, stale/unknown dates, duplicate actions, conversation close/reopen and unsupported input.
6. **Review handoff:** Provide a single mobile-friendly preview, a concise `What changed / What was preserved / What remains simulated / What passed` report and exact PR head SHA. Do not call incomplete QA green.
7. **Approval boundary:** The owner must explicitly authorize a Develop merge. Production `main` requires **separate explicit approval**. Do not trigger deploy/merge automatically, even if checks are green.

## Branch and acceptance policy
- Workstream PR base is `rally-point/develop` or an explicitly agreed temporary milestone integration branch. Do not quietly depend on PR #78 while it is open.
- Preserve approved visual references in `docs/assets/`, source-of-truth state and regression behavior. Prefer source-backed actions over placeholder buttons and decorative demos.
- The milestone is complete only when all acceptance journeys in `docs/roadmap/RALLY_COMPANION_1_0.md` work in one integrated review preview and the owner accepts them.