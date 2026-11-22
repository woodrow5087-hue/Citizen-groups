# Pilot 1.2 — Guided Member Journey Lab

**Status:** Isolated, synthetic, read-only usability lab. Not a connected pilot.
**Parent:** Draft PR #92. Approved PR #90 Today design and all four app tabs are unchanged.

## What was built
- An independently accessible mobile page: /pilot-journey-lab.html
- Six controls for scenarios using **fictional** view data: verified member / no future gathering / access revoked / session expired / wrong organization / provider outage.
- The authorized flow demonstrates a group name, verified upcoming gathering, and a read-only details screen with an accurate timestamp and named *synthetic* source.
- Denial states remove ALL group/event details from the document rather than just hiding them with CSS.
- No external requests, credentials, local storage, cookie handling, contact data, write or RSVP actions, live sign-in, or tenant configuration.
- Automated jsdom assertions verify group-data removal on access loss, no accidental recurring event, controls and details navigation, output restrictions and separation from the actual app.
- The main app keeps its frozen PR #90 Today visual layout and navigation. This separate lab reuses brand typography/colors but does **not** claim to be a pixel-perfect integration into Today.

## Suggested volunteer study (with approved permission)
Use 3–5 consenting adult volunteers. Entirely fictional names and schedules, not member lists. Ask each person to use a phone at the published lab URL. Ask them to narrate their thoughts rather than offering instructions.

### Tasks
1. **Scenario 1 — Authorized member:** In 5 seconds, identify which group this sample person belongs to and what action they should take next. Open the gathering and locate its date/time and source.
2. **Scenario 2 — No event:** Determine whether there is definitely an upcoming weekly meeting. Correct interpretation: no future event is listed, and the app should not infer a recurrence.
3. **Scenario 3 — Access removed:** Observe the screen. Is any member-only group information left visible? Correct result: none.
4. **Scenario 4/5 — Expiry or wrong organization:** Notice whether the app displays a specific private reason or group name. Correct result: it does not.
5. **Scenario 6 — Outage:** Can the person distinguish temporary unavailability from a canceled gathering? Correct result: yes, the system does not make that inference.

### Observations and sign-off
Record only aggregate and voluntarily offered feedback; do not store identity, recordings, names, credentials, actual group memberships or spiritual/care information.

For each task: success without coaching (yes/no), seconds to first correct action, confidence rating (1–5), confusion points (one sentence), and suggested copy improvement. Proposed **usability** milestone: at least four of five adults independently find the next gathering in scenario 1 and correctly identify that access denied shows no private details. The engineering security test gate remains independent of user perception.

### Stop rules
If any denied state leaves private content visible, stop and fix it before continuing. If any tester mistakes the lab for actual authentication or a current church event, make the sample-only labeling clearer. No user test authorizes live church-data access.

## Next engineering milestone *after* a vendor / church-access decision
1. Confirm the group source, responsible data owner, minimum read scopes and written permission with Garrett and designated leaders.
2. Implement audited real server-side identity and OAuth in a nonproduction environment with independent security testing (do not treat the lab's simulated scenario controls as authentication).
3. Introduce the narrow read-only member view into the **existing** Today card behind a strict server-verified pilot gate.
4. Run revoked/non-member/source-failure tests against the authorized environment; then pilot with 3–5 approved adult participants.

**Never merge into Develop or deploy production main without owner approval.** The live-pilot readiness checklist remains false/pending.