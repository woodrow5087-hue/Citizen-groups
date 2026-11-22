# F-09.3 — Adaptive Today, review-only policy and QA contract

**Status:** F-09 PR #72 is based on F-08 PR #71, now squash-merged into `rally-point/develop`. **Route:** `/?f09=board&skipWelcome=1`. No changes to approved default Today, the independent `?f09=1` Smart Stack experiment, or `main`. No merge without explicit owner approval.

## Product principle: responses versus invitations

The selected cream/white Citizen-red Priority Board design is locked. The red hero and the three immediately visible pastel rows are **the only priority action surface**. The At-a-Glance panel remains a **read-only schedule and status** summary. Everything uses existing fictional, browser-local fixture records and existing handlers.

**Needs a response** (ranked): unanswered same-day group RSVP; unanswered Sunday serving within 48h; local thread unavailable; unread modern group messages; authorized leader's *existing unreviewed* sample check-ins; open but not imminent group/serve responses; due user-saved Scripture intention. In implementation these are scored deterministically; no model inference or engagement scoring. The date thresholds apply to the actual next recurring fixture events from `RallyToday.snapshot`; "Group tonight" is used only for the true sample Wednesday. No made-up announcements, schedules, private information or deadlines.

**Worth exploring** (not urgent): reading Scripture, prayer or care invitations, visiting existing group conversations, reviewing a team schedule, discovering groups or serving. Optional items may fill otherwise open pastel slots but never count as an outstanding task or change state upon viewing the dashboard.

**Already handled:** The hero reads "You’re all caught up" when no known response, unread group message, due intention or authorized unreviewed leader check-in remains. This does **not** mark Scripture, prayer or anything else as completed. An overdue saved Scripture step remains actionable until the user completes or defers it in the existing Read screen. On a temporary read failure, the board presents a recovery action, not a false zero-unread state.

**Not right now:** Existing F-08 snoozed IDs are projected read-only. Deferred nonurgent tasks stay accessible in the visible rows but are not forcibly repromoted as the hero. If only deferred responses remain, a calm "Nothing pressing right now" hero replaces the false urgent message; this is **not** represented as task completion. A source-confirmed fixture deadline within 24h (RSVP) or 48h (serve) can become the lead action again. F-08's stored choices are untouched; no new keys are introduced.

## Explicit persona matrix

| Local sample state | Headline behavior | Scope boundary |
| --- | --- | --- |
| Newcomer, no group/team | Welcoming group discovery; Scripture and team discovery are optional | No group unread counts, prayer/care notes, RSVP or leader content |
| Group-only member | Actual group response/unread first; service discovery can appear as optional | No fictional team assignment |
| Team-only volunteer | Real fixture pending Welcome Team availability first | No private group data, conversations or prayers |
| Group + Team member | Deterministic scheduling and inbox priority | Only those memberships |
| Group leader | Unreviewed sample check-ins exposed through authorized leader route; after review they disappear | **Never** infer that someone is spiritually at risk; leader priority is a count of actual fixture review states |
| Fully caught-up | Soft cream/rose hero, optional exploration, truthful glance statuses | Doesn't fabricate streaks, make prayer mandatory or claim Scripture read |

The `audience` and `leaderRemaining` model fields derive solely from existing `todayUI.memberships`, `s.role`, and the gated `RallyToday.snapshot(...).leader.remaining`. The app's normal `canLead` guard still controls entry. This is a **fixture visualization**, not actual authentication or authorization.

## Changes and data safety

- `rallypoint-smart-dashboard.js`: adds read-only `audience`, `leaderRemaining`, and `deferredIds` to the same F-09 projection, preserving F-08 top suggestion and the Smart Stack behavior.
- `rallypoint-priority-board.js`: pure deterministic adaptive decision and rendering; no storage/DOM mutation, no extra tab, no additional network calls. Exposes `taskCount`, `caughtUp`, `audience`, source-backed priorities and explicit optional row metadata.
- `rallypoint-priority-board.css`: a quiet completed-state hero with sufficient contrast, subtle layer treatment, 44px actions, reduced-motion alternative, and restrained confirmation feedback.
- `rallypoint.js`: only the existing RSVP and serving demo action handlers gain transient, accessible success feedback; it clears on navigation and never enters localStorage. Existing app toast remains.
- `test/f09-adaptive-today.test.cjs`: source policy, dates, new member, privacy, leader, deferrals and no-write matrix.
- Existing JSDOM and mobile Playwright/axe integration checks extended at 320/390/430 widths, including a caught-up screenshot and isolated newcomer and leader flows.
- Unchanged saved keys: `rallypoint-phase1-2026`, `rallypoint-today-ui-v1`, `rallypoint-wednesday-chat-lab-v1`; legacy `groupMessages` archive remains untouched and independent of F-02 modern conversation read cursor.

## Merge gate

1. All unit, build, JSDOM, mobile, accessibility, onboarding, gameplay, group privacy/identity and integrated conversation QA green; Netlify preview successful.
2. Owner reviews the actual iPhone visual hierarchy and adaptive newcomer/leader/caught-up behavior.
3. **F-08 PR #71 was merged into `rally-point/develop` first.** F-09's ancestry was reconciled with the resulting squash commit without changing the feature tree. Verify the F-09-only diff and fresh CI before merging **F-09** into Develop. **Production `main` is not touched.**
4. The owner approved integrating F-08 then F-09 into **Develop only**. No production release or real church-system integration is authorized.
