# F-09 — Smart Dashboard Lab v1

**Status:** Review-only feature branch containing Companion F-08 PR #71 as its unmerged prerequisite. PR #72 targets `rally-point/develop` to trigger CI, but must **not** be merged before F-08 PR #71 is approved and integrated.  
**URL gate:** `/?f09=1` (use `/?skipWelcome=1&f09=1` to bypass the first-run welcome in a demo).  
**Production:** Unchanged. **Approved Today:** Unchanged on ordinary `/` views.  
**Design reference:** Owner-selected cream background / Citizen-red primary module / four distinct blush, golden, blue, lavender modules / compact task list / Sandia-inspired abstract mountain and mission banner. This isn't a direct copy of Apple proprietary visual assets.

## Product principle

The top of Today is a **personalized control surface, not another content feed**. One clear primary action, four familiar modules and an immediate-action list must always agree on source state. The hierarchy is deliberate: bright matte red for the prioritized action, blush for conversation, golden for serving, pale blue for Scripture, lavender for this week's actual demo activity, with legible charcoal text on cream.

## Architecture

- `rallypoint-smart-dashboard.js` is the pure F-09 projection and renderer; `model({state,ui,conversation,now,today,companion,passage})` derives its data solely from the saved primary fixture, Today snapshot, F-02 modern conversation read model and F-08 Companion decision.
- `rallypoint-companion-decision.js` still selects the same F-08 top recommendation but now also exposes an **immutable, ranked `alternatives` array**. F-09 uses it to show up to four actual alternatives in a paged vertical stack, without changing local storage just to browse. The old `todayPrompt` continues to use the first selection unchanged.
- `rallypoint-smart-dashboard.css` is gated under `.is-f09-dashboard`, which is added only to Today when `?f09=1`. No style changes to current Today, Groups, Team, Read, onboarding or classic game screens.
- The feature art is the locally hosted `assets/f09-mountain.svg`, a stylized illustration of a Sandia-like ridgeline; no personal photos, licensed church content or new external dependencies are required.
- The approved Instagram-like people rail is retained *beneath* the priority/tiles/task/mission area.
- The bottom navigation remains **Today / Groups / Team / Read**, exactly four tabs. A small demo footer links back to original Today.

## Single-source action semantics

| Control | Read source | Actual behavior |
| --- | --- | --- |
| Primary red stack | F-08 ranking with same local storage | Navigates to relevant existing screen or uses one of the explicit fixture actions |
| Stack pagination | F-08 `alternatives` | Changes ephemeral active index; no snooze, fake read, RSVP or event tracking |
| Messages tile | F-02 modern per-user cursor | Opens actual modern conversation in Groups; this *intentional visit* advances the cursor through F-02's existing handler |
| RSVP hero / task | `s.rsvp` | Idempotently saves `going` locally, immediately recomputes hero/tile/task; never sends church RSVP |
| Serve confirmation hero / task | `s.teamStatus` | Idempotently saves `confirmed` locally and follows existing coverage cleanup rule; never signs up for a real team |
| Scripture tile | Existing reading and rhythm | Opens existing Read screen, does not mark read/complete just by opening Today |
| This Week tile | `RallyToday.snapshot(...).upNext` | Navigates to actual member-scoped sample upcoming event; never invents published announcements |
| Mission banner | Local group membership | Opens existing group People/discovery; does not claim a real campaign or send anything |

**Note on urgency:** The mockup's “Group tonight” title only appears when the date of the *next fictional Wednesday gathering* is actually today. Other days display “Your Wednesday Group.” No invented schedule, campus-specific attendance, pastoral risk scores, streak counts, engagement badges or push alerts. The actual fixture times remain **Wednesday 6:30 PM** and **Sunday 9:00 AM**; the visual reference's Sunday 8:30 AM is not silently adopted.

**Fallbacks and safety:** Without membership, group-private care, unread messages and RSVP are omitted; without serving membership, no serving decision is shown. If modern chat is malformed, the dashboard displays a truthful recovery path rather than an invented zero unread count. The writable `groupMessages` archive remains untouched and never becomes a read receipt. All state-derived labels are escaped before HTML insertion. All actions use existing storage journaling; no new browser storage keys or API calls.

## Interaction

- Native focusable Previous and Next buttons browse the priority stack. Swiping vertically on the card's *noninteractive area* changes cards without persisting a preference.
- Buttons are minimum 44 px targets; focus state is visible. Reduced-motion styles remove animation.
- Updating an RSVP, serving confirmation, or modern read cursor immediately updates the model through the app's existing `render()` loop.
- The UI is deliberately an **experimental front-end**, not a live church assistant. Real care, identity, consent, integration, notifications, usage analytics and moderation require distinct approval.

## Acceptance criteria

- [ ] Pure projection unit tests: source priority, dates, member privacy, unread cursor, bad-store recovery, HTML escaping and no writes.
- [ ] JSDOM: URL gate, classic Today unchanged, four tabs, real actions persist exactly once, lower-level pages still function, no invented read receipts.
- [ ] Playwright across 320 / 390 / 430 px: responsive geometry, axe WCAG A/AA, priority card paging, RSVP/serving, message open, and legacy archive.
- [ ] Existing CI jobs for classic Today, Groups, Team, Read, onboarding and Blank Battle remain green.
- [ ] Netlify Deploy Preview succeeds.
- [ ] Owner compares with the selected visual reference on iPhone and reviews legibility, actual scrolling and action economy.
- [ ] **Do not merge** F-09 (or upstream PR #71) before explicit approval. Keep production `main` untouched.

## Next slices after v1 approval

1. Refine component measurements through side-by-side image review; no unrelated layout changes.
2. Add opt-in customization/reordering and a deterministic time-of-day priority policy only after confirming this foundation is genuinely useful.
3. Later: authenticated data, shared schedule, leader authorization and Church Center integration after church approval and data-governance decisions.
