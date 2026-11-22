# F-10.4 · Contextual Follow-Through (review-only)

**Base:** F-10.3 integrated `rally-point/develop` commit `a5f0e165`  
**Review branch:** `rally-point/f10-4-contextual-follow-through-v1`  
**New preview:** `/?f104=1&skipWelcome=1`  
**Comparators:** `?f103=1` (F-10.3), `?f10=1` (F-10.2), default Today unchanged

## Problem to solve
Once someone makes a **deliberate** choice in Ask Rally, the previous goal-oriented prototype immediately redraws the original plan. F-10.4 should recognize what the member just did and offer one helpful continuation, with no automatic second step.

## User experience
- **Group:** After a currently authorized member taps the existing `RSVP · I'm in` button and the saved response becomes Going, Ask Rally responds “You're in for Wednesday” (only if the current authorized fixture has an upcoming date). It displays the actual known location/date when available and an optional button to review the gathering. Follow-up chips ask about group time/location or current priorities.
- **Serving:** After an authorized team member taps the existing serving confirmation and the saved team response becomes Confirmed, Ask Rally acknowledges the saved sample shift, displays only the current known fixture schedule/location, and offers an optional route to Team. No second confirmation, no automatic navigation.
- **No supported upcoming date:** A saved response is acknowledged without inventing a future event. Date and location are withheld as unavailable rather than extrapolated.
- **No pressure:** It explicitly says that users can stop. No ongoing prompts, reminders, streaks, messages, attendance inference, or engagement scoring.

## Technical contract
1. **Opt in:** The new `f104=1` URL flag includes the existing F-10.3 goal mode. Existing `f103=1` and `f10=1` preserve their established behavior.
2. **Explicit UI event only:** `f10AfterAction` is an **in-memory** event token set only after the pre-existing guarded `f10-confirm` click succeeds. Entering text or pressing a suggested topic never sets the event. Only `rsvp` and `serve` values are recognized.
3. **Source revalidation:** The pure `RallyPersonalCompanion.respond()` re-reads live current model membership plus Going/Confirmed saved state before rendering any follow-through. A forged, stale or cross-membership event is ignored.
4. **No silent writes:** Response cards are `go` actions only, and navigation still requires a separate tap. The only state mutation is the original deliberate confirmation handler. No newly persisted fields, event logs, transcripts, telemetry or remote calls.
5. **Session-bound:** Event token clears when the user asks another question, navigates away or closes/reopens Ask Rally. No cross-session context. The existing three-turn bounded in-memory trail remains.
6. **Display and design:** Reuses the same Ask Rally sheet, response cards and follow-up chip styling, approved F-09 priority board, branded red/cream/charcoal visuals and four tabs. No new UI surface, animation, modal, menu or fifth tab.

## QA acceptance
- Unit source tests: post-RSVP/serving valid status, revoked or mismatched memberships, stale/downgraded saved state, unavailable dates, no extra confirmation, identical pre-F-10.4 behavior when opt-in absent.
- JSDOM interaction: genuine tap → response transition → optional route, next natural-language question, context clearing, unchanged archived chat, no unintended state mutation.
- Playwright at **320, 390 and 430px**, including accessibility audit, post-confirmation state, no auto-navigation or new storage, preserved archived messages, session reset and screenshot.
- Full previous build, tests, UI, games, source navigation and storage fallback regressions must pass.
- **Owner review and approval required** before any Develop merge; **production `main` is never touched** by this phase.
