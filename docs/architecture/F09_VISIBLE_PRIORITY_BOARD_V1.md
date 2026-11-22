# F-09.1 — Visible Smart Priority Board (lead design candidate)

**Scope:** review-only alternative to the F-09 Smart Stack lab, opt-in at `?f09=board&skipWelcome=1`. Existing `?f09=1` remains a direct comparison; the default Today route stays approved and unchanged. Branch/PR #72 includes the unmerged prerequisite F-08 PR #71. Neither may merge without explicit approval. `main` / production stays untouched.

## Selected visual reference

The owner-selected white/cream iPhone concept: restrained Citizen-red flag branding and editorial greeting; dominant red Sandia-inspired hero; **three always-visible** pastel horizontal priority/action rows; cream Today-at-a-Glance agenda; circular fictional member profiles; local Citizen community/mission banner; **four permanent tabs: Today, Groups, Team, Read**. Aiming for crisp Apple-inspired information density and tactile finish, not trademark replication or speculative features. Full-bleed swiping between hidden cards is *not* part of this variant.

## Behavior contract

The board reuses `RallySmartDashboard.model`, `RallyToday.snapshot` and the F-08 `RallyCompanionDecision` ranking. A full, pure `allPriorities` projection avoids losing due items behind the Smart Stack's four-card cap; `stack` remains unchanged for the original experiment. `RallyPriorityBoard.derive` computes board-only prominence, **without persisting an invented ranking, score, or new storage key**.

The hero surfaces the nearest saved **explicit decision**, without mislabeling optional spiritual engagement as an emergency:
- Unanswered Wednesday RSVP when the fictional gathering is within 24 hours
- Unanswered Sunday serving availability when the fictional shift is within 48 hours
- Unavailable or unread modern group conversation (truthful recovery/read state)
- Other open group RSVP, then serving choice
- Saved due Scripture intention / unread personal reading
- Low-pressure F-08 companion fallback when no action requires a response

No action is called **“Group tonight”** unless the next sample gathering is actually today. A check-in suggestion is optional, not an assessment of emotional/spiritual health. A deliberate visit to real sample group chat marks modern read via the existing F-02 handler; merely viewing Today never advances its cursor. Legacy group messages remain independent and untouched. The central red CTA, rows, and glance all share the *same* RSVP and serving fields. The row set excludes the active hero ID and fills any remaining positions with clearly optional paths rather than manufactured tasks.

## Roles and trust

Group member-only actions never render for guests; serving response is team-membership scoped. No names, care notes, unread count or other role-limited context are shown to guests. On malformed modern chat storage, `group-unavailable` appears instead of an incorrect “all caught up.” Read/prayer/DM or serving state is never changed by browsing the priority board. Public-facing footer explicitly labels all activity fictional. Real community records, consent, authentication, notifications, and backend integrations are deferred.

## Interface architecture

- `rallypoint-priority-board.js`: pure, testable `derive(model,now)` and safe HTML `render(model,peopleRail,portraits,now)`; no DOM or storage writes.
- `rallypoint-priority-board.css`: isolated to `is-f09-board` and `f09b-*` selectors. Theme: warm white, matte Citizen-red, blush, soft gold, powder blue and lavender fallback. Dark typography, clear contrast, rounded translucent edges with restrained layering.
- `rallypoint.js`: `f09=board` preview branch only, maintains existing action routing `f09-rsvp`, `f09-serve`, `data-go`, group chat, Scripture and members. Keeps scroll position on updates.
- `rallypoint-smart-dashboard.js`: read-only additional status/date fields and full priority candidates; existing F-09 and F-08 selection behavior unchanged.
- Preview remains in the same Netlify PR deployment as the Smart Stack. It never automatically changes default Today.

## QA

Unit: time-sensitive ranking, no truncation, exactly three visible distinct actions, real state transitions, date honesty, guest privacy, malformed chat, HTML escaping.

Integration: preserve old Today, Smart Stack and four tabs; RSVP/serve update same local record with no duplicate storage; message cursor only marked in chat; guests receive discovery instead of sensitive actions.

Mobile browser: Playwright at 320 / 390 / 430 widths, no horizontal overflow, reachable 44px targets, WCAG axe A/AA, board screenshot and state changes; existing F-03/F-04/F-08 and F-09 regressions must still pass.

**Product decision after visual review:** keep the board's single lead action + three visible rows. Consider whether Today-at-a-Glance is primarily a schedule/status summary, to minimize repeated identical CTAs while remaining faithful to the selected visual reference.
