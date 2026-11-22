# F-10 · Ask Rally Personal Companion Lab (v0.1)

**Implementation:** review-only opt-in `/?f10=1&skipWelcome=1` on branch `rally-point/f10-personal-companion-lab-v1`, based on integrated `rally-point/develop` commit `e22adde`. It automatically presents the established F-09 Adaptive Today Priority Board; otherwise `?f09=board`, `?f09=1`, the default Today, and all four bottom tabs are unchanged. No merges, production releases, or Church Center integrations are authorized by this feature experiment.

## User experience

One compact, high-contrast **Ask Rally** entry below the Today greeting. It opens the existing accessible slide-up dialog, not a new navigation tab or full-screen rebrand.

The companion begins with “What's happening this week?” and provides six suggested questions. A user may also type a short question (up to 160 characters). The parser supports only **week / next / group / serve / scripture / why** intents. Unknown requests are honestly declined with a list of supported questions. This is **deterministic local interaction**, not an LLM/chatbot, a live AI model, persistent chat history, or any connected church assistant. Do not claim that the app can answer arbitrary questions or has seen real Church Center data.

Each response shows concise source-backed items, exact demo date/time/location where available, a collapsed “Why this?” rationale, and a single direct route or explicitly chosen action. The underlying state remains the source of truth.

- **Week:** next sample Wednesday gathering and Sunday Welcome Team shift, using `RallyToday.snapshot` via `RallySmartDashboard.model`; no invented events and no access without membership.
- **Next:** actionable source items from the F-09 Adaptive Today decision. Optional Scripture or prayer invitations are never labeled as failures/urgent. A caught-up state preserves unfinished optional rituals, rather than marking them completed.
- **Group:** actual fixture RSVP, membership, group meeting, and the **modern F-02 conversation read cursor**, never using legacy messages as unread evidence; a broken thread is described as unavailable, not empty.
- **Serve:** sample team membership, shift, confirmed/declined/pending response; no invented commitment for guests.
- **Scripture:** only the local reading and user-saved due intention; no invented spiritual-health scoring or tracking.
- **Why:** draws from the F-09 leader/RSVP/serving/message logic, showing the saved reason and explicitly explaining that no spiritual health can be inferred.

**Two one-tap completion actions:** after the person taps **RSVP · I'm in** or **Confirm serving**, the app updates existing source fields through the same guarded policy as F-09; no automated acceptance. The sheet refreshes with a factual local confirmation and the action disappears. Someone who wants to decline must visit the existing Group/Team screen. Visiting a companion answer never marks messages read. No other mutations, notifications, network requests, queued tasks, or new local storage keys.

## Privacy, authorization and boundaries

- All people, messages, calendars, RSVP and serving fixtures are fictional and browser-local.
- Member-only group information never appears to a guest or volunteer without group membership. Team details require explicit fixture membership. Leader scenarios only reflect the existing gated `RallyToday.snapshot` priority and existing leader route; an opened sheet itself conveys no backend authority.
- User-typed questions and the sheet's last selected intent are **ephemeral in-memory values**; they are HTML-escaped when displayed, not stored or transmitted.
- The existing consent/role checks run on all direct state changes. An unknown or unsupported prompt cannot execute a command. The only supported confirmation identifiers are `rsvp` and `serve` and require an actual user tap.
- Persisted keys and legacy chat archives remain untouched except for the existing RSVP/serving response fields intentionally changed by the person.
- Accessibility: modal focus, Escape/close, chip and CTA touch targets >=44px, accessible “Your question” input, live response region, source disclosure, iPhone 320/390/430 layouts and WCAG axe checks. Reduced motion is supported.

## Files

- `rallypoint-personal-companion.js`: pure `classify`, `answer`, `render`. No DOM or storage.
- `rallypoint-personal-companion.css`: accessible compact Today entry and warm premium sheet, opt-in scoped.
- `rallypoint-priority-board.js`: F-10 Today entry is present only when `f10Enabled`.
- `rallypoint.js`: F-10 preview URL, ephemeral question state, existing dialog integration, deliberate local confirmation handlers.
- `index.html`, `scripts/build.cjs`: adds static bundled assets only.
- `test/f10-personal-companion.test.cjs`: intent, rank, schedule, privacy, escaping, no mutation.
- `test/rallypoint.test.cjs`: click/form/dialog and actual storage assertions.
- `scripts/phase1-browser-check.mjs`: mobile and accessibility verification including guest/confirmation scenarios.

## Review and release gates

1. Tests/build must pass with no new storage keys and no unauthorized data exposure.
2. Actual browser QA screenshots and interactive Netlify preview at `deploy-preview-<PR>--citizen-connect-test.netlify.app/?f10=1&skipWelcome=1`.
3. Human visual/UX review of default question, response density, tone and direct confirmation.
4. Only after explicit owner approval, create the next Develop merge. **No automatic Develop or `main` merge, no production deployment**, no real church integration.
5. Later phases should define authentication/consent, Church Center data contracts and privacy controls before any real member personalization. A genuine generative assistant requires a separately approved architecture, explicit user consent and source authorization—not client-side API keys.
