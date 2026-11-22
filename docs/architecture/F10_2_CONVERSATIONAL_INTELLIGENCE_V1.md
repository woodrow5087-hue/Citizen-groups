# F-10.2 · Conversational Intelligence v1 (review-only)

**Base:** integrated `rally-point/develop` (F-10/F-10.1, PR #73).  
**Branch:** `rally-point/f10-2-conversational-intelligence-v1`  
**Preview switch:** `/?f10=1&skipWelcome=1`  
**Release gate:** QA and owner review; do **not** merge to Develop or `main` automatically.

## Goal

Make **Ask Rally** less dependent on exact phrasing, without changing the approved Adaptive Today / Priority Board UI. This is a deliberate, narrowly scoped **deterministic local prototype**, not a generative assistant or connected church backend.

## Changes

1. **More natural question variants:** interpret common time questions ("When does Wednesday Group start?", "What day…?"), location questions ("Which campus…?", "What is the location…?"), and saved-response queries ("Did I RSVP?", "Have I replied to my serving shift?").
2. **Contextual next-step guidance:** "What should I do about that?" now uses the currently selected, authorized group or serving topic. It offers either the existing guarded action button or an existing detail route. Text alone never commits an action.
3. **Explicit mixed-topic clarification:** a question naming both Wednesday Group and Sunday serving cannot be forced into the previously selected subject; Ask Rally asks which commitment the person means.
4. **Uncertainty instead of fictional recurrence:** questions about "next week," "following week" or "week after next" explain that only the currently dated sample fixture is known. No future meetings or shifts are invented.
5. **Context reset after unsupported requests:** unknown questions disclose the limited scope and do not leave an unrelated prior subject active.
6. **Priority-rationale exception:** questions about why a board item appears first remain routed to the existing board explanation, not mistakenly treated as an ambiguous pronoun.

## Hard boundaries

- The **existing six topics, three-turn in-memory trail, source disclosure, four tabs, approved cream/red visual system, F-09 board and default Today** are unchanged.
- No LLM, API key, network calls, new storage fields, transcript persistence, remote data, new church integrations or deployment to production.
- Every response re-reads the current source-backed F-09 model; contextual focus is never proof of group/team membership.
- Group information requires current group membership; serving status requires current team membership. Guest and revoked-role prompts remain private.
- `rsvp` and `serve` remain the only direct completion action IDs. They still require explicit taps in the existing guarded handler.
- "Yes," "confirm," or "do it" by text never commits. Reading a response never marks a message read. Scripture and prayer remain optional.
- This phase improves *language interpretation* within a bounded prototype. A genuinely generative, church-connected assistant requires separate architecture, identity, consent, authorization, auditability and owner approval.

## Test and review matrix

- `test/f10-personal-companion.test.cjs`: natural time/location phrases; saved status questions; context switching; action-only-on-tap; multiple-subject ambiguity; next-week uncertainty; unknown-topic context reset; guest/team authorization.
- `test/rallypoint.test.cjs`: real typed multi-turn interaction in the Ask Rally sheet; no local record mutations; transcript clearing after close.
- Run the established full GitHub preview workflow, including Node unit/JSDOM, static build, Playwright 320/390/430, axe, source fixtures, onboarding, Groups/chat, and legacy games regression.
- Reviewer should manually ask the phrases above using the new **review preview**, check source accuracy and naturalness, and confirm the old F-09 board/default routes are unchanged.

## Acceptance criteria

All tests and preview checks green, no unauthorized disclosures, no automatic actions, no invented dates, no visual regression, and explicit owner approval before any Develop merge.
