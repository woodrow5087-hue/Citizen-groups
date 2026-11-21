# Rally Point F-07 — Connected Groups experience (fictional v1)

**Status:** Separate review branch into `rally-point/develop`; **not production**.  
**Prerequisite:** PR #69 (F-06 shared read model), merged into Develop on November 21, 2026.

## Product outcome
Groups is a coherent community companion rather than four independent tabs. An editorial, high-contrast **Your Group, Together** panel combines *one contextual next action* with direct routes into Conversation, Gathering, Prayer, and People. Existing screens are preserved; content is derived from their existing demo data, not newly duplicated.

The order of a member's next step is deterministic:
1. If the modern conversation cannot be safely read, show **needs a look**, never an invented empty/read state.
2. If F-02 modern messages are unread, suggest **open conversation**, using its genuine per-user cursor.
3. If the group gathering has no local RSVP, suggest **respond to gathering**.
4. If already responded and within the explicitly fictional scoped leader view, suggest **review sample check-ins** (never infer a person needs pastoral intervention from app engagement).
5. Otherwise suggest **see your people**. This is a positive connection prompt, not a fabricated notification.

The four activity routes always reflect the same source state: F-02 modern unread / valid status, existing primary-state RSVP, number of existing fictional prayer posts, and fictional roster. The group hero and approved people rail remain intact.

## Connected journeys
- **Today → Groups/Conversation:** The same modern unread cursor is advanced *before* Groups paints its overview, so an opened conversation is not incorrectly shown as unread. Just visiting Today does **not** mark anything read.
- **Groups → Gathering:** RSVP's saved local state updates the overview; routes lead to Conversation and the existing Read passage. No sign-up is sent to church staff.
- **Groups → Prayer:** Saved fictional requests change the activity count; member may open People to check in without any automated care inference.
- **Groups → People:** The existing local-only direct-message demo remains available, and a return link leads to the group conversation.
- **Legacy:** Old `groupMessages` remain saved and writable in their original archive; they never change the modern unread count, are never assigned invented sender IDs or timestamps, and are not silently converted.

## Technical seam
- `rallypoint-group-experience.js`: small dependency-free pure projection of existing state; **no additional persistent keys**. `visible:false` for non-members.
- `rallypoint.js`: renders accessible navigation surfaces with escaped dynamic strings and links into existing feature handlers. Existing F-03 member/leader **fixture permissions** still gate visibility; **not production authorization**.
- `rallypoint-groups-v07.css`: scoped additions only; preserved red #E3002B, cream #F3E5D6 and charcoal #242322; 320–1280 px responsive with reduced-motion support.
- Existing F-02 snapshot and saved cursor, original `rallypoint-phase1-2026`, Today data and write journal, standalone Wednesday chat and other three primary tabs remain source-owned.

## Acceptance
- [ ] Node tests of read-only projection, unread prioritization, RSVP, prayer, leader and malformed/nonmember states.
- [ ] Existing all-suite Node tests and production asset build.
- [ ] Integrated browser/axe checks at 320, 390, 430, 1280 pixels.
- [ ] On 390-width fixture: conversation → RSVP → prayer → People → conversation, check persisted source data and unchanged legacy archive.
- [ ] Confirm no horizontal overflow, accessible buttons, valid focus, no console failures.
- [ ] iPhone owner review of safe areas, keyboard behavior and scrolling; preview only.
- [ ] PR owner acceptance before merging into Develop; **main/production not touched**.

**Non-goals:** real church users or messages; Planning Center/Church Center integration; new global inbox; a fifth primary tab; fabricated attendance/read receipts; migration of historical messages; notifications/push; live leader care; backend authorization or safeguarding claims.
