# F-10.3 · Goal-Oriented Ask Rally (review lab)

**Branch:** `rally-point/f10-3-goal-oriented-companion-lab-v1`  
**Base:** F-10.2 integrated `rally-point/develop` commit `072aafc`  
**Preview:** `/?f103=1&skipWelcome=1`  
**Comparator:** `/?f10=1&skipWelcome=1` (F-10.2 unchanged)  
**Release status:** Review-only. Do not merge to Develop or production until the owner approves.

## Intent
Move from merely answering a supported question to helping a member accomplish a clear, personally relevant goal using only already-authorized sample data. Preserve the approved Today / Groups / Team / Read visual language and single Ask Rally sheet. No fifth tab, rebrand, floating agent, large checklist UI or simulated AI personality.

## Four supported goals
1. **Get ready for Wednesday.** Derive current member-only group gathering date/location, recorded RSVP, and authorized modern chat unread status. Offer a separate RSVP tap *only* if the fixture has an upcoming date, the member is currently joined, and no RSVP is saved. Never read old archive messages as unread or infer recurring meetings.
2. **Get ready to serve.** Derive team-member-only upcoming shift and existing confirmed/declined/pending state. Offer a separate confirmation *only* for a dated upcoming pending shift. Do not invent assignments or automatically enroll volunteers.
3. **Get connected.** For guests, show only group discovery, optional serving exploration, and optional Scripture. For current members, open only their existing group. These are possibilities, not a required task list or spiritual engagement score.
4. **Am I caught up?** Reuse the current F-09 priority model's required-response determination. Do not infer spiritual health, force prayers or readings, or manufacture things to do when caught up.

## Conversation and boundaries
- Opt-in **`f103=1`** enables goal language and relevant follow-up suggestions. The F-10.2 `f10=1` comparator, original six topic chips and approved app experience remain unchanged.
- Goal prompts include “Help me get ready for Wednesday,” “Prepare me for Sunday serving,” “How can I get connected?” and “Am I all caught up?”. “Help me prepare for that” may inherit a subject **only inside the current open Ask Rally session**.
- Mixed Wednesday+Sunday requests prompt clarification, not a guessed commitment. Next-week requests remain explicitly unsupported, not extrapolated from one local date.
- Every response recomputes from the current role/membership and saved fixture state. Prior conversational context never conveys permissions.
- Existing deliberate `f10-confirm` action IDs `rsvp` and `serve` are the only possible completion side effects, and still require a tap plus their existing membership/status checks.
- Questions, focus and recent turns are ephemeral; close/navigation clears them. No keys, transcripts, remote APIs, live church data, background behavior, outreach, notifications, new storage, or AI models.
- This is *goal guidance*, not autonomous task execution. A real church-connected assistant needs separately approved identity, consent, source permissions, audit and data contracts.

## Verification
- Unit: `test/f10-personal-companion.test.cjs` goal opt-in, membership, response status, dated fixture, unknown future date, mixed subjects, XSS escaping, no mutation.
- JSDOM: `test/rallypoint.test.cjs` actual Ask Rally question-to-goal flow and guest data denial, preserved four tabs/storage/session reset.
- Browser: `scripts/phase1-browser-check.mjs` opt-in mode across 320/390/430px, axe, source fidelity, zero side effects and screenshots.
- Preserve existing F-08/F-09/F-10/F-10.1/F-10.2, Groups, legacy chat archives, onboarding, games, and default Today regression runs.

## Merge gate
Full CI and Netlify checks green; manual iPhone review; exact-head diff checked; owner explicitly authorizes Develop-only integration. Never merge or deploy to production `main` without separate approval.
