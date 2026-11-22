# F-14 — Unified Launch and Member-Journey Audit

**Date:** November 22, 2026  
**Approved Develop checkpoint:** `4cd18507f756a42f830c1abde5360d08737add58`  
**Status:** Audit and implementation plan only; no application source modifications.  
**Protected:** production `main`, Planning Center pilot PR #92, approved Today / Groups / Team / Read visuals, full fixture state and permissions.

## Executive finding

**The visual unification phase is complete in the approved F-09/F-10 Today preview. The default entrypoint is not yet the same experience.**

Direct inspection of `rallypoint.js` on the post-F-13 Develop commit shows:

```js
const f10Preview=f103Preview||new URLSearchParams(window.location.search).get('f10')==='1';
const f09Mode=f10Preview?'board':new URLSearchParams(window.location.search).get('f09');
const f09Board=f09Mode==='board';
const f09Preview=f09Mode==='1'||f09Board;
// In render():
view.innerHTML=...+(s.view==='today'?(f09Preview?f09Today():today()):...);
```

Therefore, `/?skipWelcome=1` still displays the earlier Today layout, while `/?f09=board&skipWelcome=1` displays the approved Priority Board, and `/?f10=1&skipWelcome=1` displays that board with the experimental Ask Rally companion. F-09/F-10 are **URL-gated**, not the default app launch. This distinction matters before we ask real members to test four consistently designed tabs.

### What this is *not*

- Not a security or live-data launch blocker that can be solved with CSS. Real sign-in and data authorization are still absent.
- Not authorization to quietly make F-10 conversational behaviors, personal context, or any experimental assistant feature universally available.
- Not an invitation to redesign the unified screens or restart from an old branch.

## What now works and should be protected

| Destination | Established value | Main behavior to regression-test |
|---|---|---|
| Today | Approved F-09 editorial Priority Board, with optional F-10 companion | State-backed priority, accurate next action, menu-to-route handoff and no duplicates |
| Groups | Approved F-11 warm shell and people-focused content | Membership-gated chat, group panes, RSVPs, empty state and leader restrictions |
| Team | Approved F-12 serving shell and red Serve Together feature | Pending/confirmed/declined/coverage, Team chat, empty state and leader restrictions |
| Read | Approved F-13 contemplative warm shell and vivid VersePlay feature | Mark read, reflection, discussion, prayer, reading choices and Blank Battle |

**All four tabs are still a synthetic, local-browser experience.** Netlify deploy success and browser regression are not approval for use with actual church members or records.

## Proposed next product increment: F-14 — The default unified Today launch

### Recommendation: promote the approved F-09 Priority Board as the standard **development-preview Today**

Treat F-09 Priority Board as the default Today renderer **on preview/test builds only**, while preserving a clearly labeled route/flag for comparing the earlier Today design. This makes the first app experience reflect what leadership and owner actually approved. Retain F-10 Ask Rally behind its existing explicit flag until its own rollout criteria are met.

Rationale:

1. Member usability feedback is invalidated if the test URL inadvertently opens the old Today screen.
2. Moving between Today ↔ Groups ↔ Team ↔ Read should feel like one product without needing testers to remember query parameters.
3. The board uses the existing deterministic fixture source, avoiding new data storage, messaging, permissions or API coupling.
4. Keeping an explicit legacy comparison option preserves a rollback path and makes changes testable.

### Exact implementation boundary — **requires separate approval**

- Branch from the latest protected `rally-point/develop` SHA at approval time; do not merge PR #92, F-14 audit work, or historical RC branches.
- Touch only the Today view-flag selection in `rallypoint.js`, plus focused tests and a short preview documentation note. No broad CSS or markup rewrites.
- Retain explicit `?f09=1` Smart Stack comparison and `?f10=1`/`?f103=1` companion experiments. Add or retain an explicit non-default legacy Today comparison switch, documented for rollback.
- Preserve the established welcome/onboarding flow, local demo state, camera/notifications policy, the four tab destinations, date/source attribution, data permissions, and source-driven priority ordering.
- Do **not** make F-10 Ask Rally auto-open; do not introduce LLM calls, network requests, live sign-in, real notifications, new storage or new tracking.
- Keep production `main` unchanged. Draft PR, screenshots, green CI, and explicit separate owner approval before merging.

## End-to-end test design after F-14

Test real browser behavior on 320, 390 and 430 pixel phones; test more than static screenshots:

| Story | Expected behavior |
|---|---|
| Fresh first visit | Approved Priority Board is the default after existing welcome flow; no query flag needed; no actual account implied |
| Today → group RSVP → Today | Same fictional RSVP shows on Groups and Today; priority no longer asks for the same unanswered response |
| Today → Team serving confirmation → Today | Same local serving response, no duplicate task, and no inferred attendance |
| Today → group conversation → Today | Authorized read cursor updates only when the thread is opened, not merely from dashboard peeks |
| Today → Read → mark read → Today | One source of reading completion; no streak or urgency manufactured |
| Read → Blank Battle → Back | Game layout stays immersive and unchanged; correct return to Read |
| Member without memberships | No private group/team details or false commitments; meaningful exploration offered |
| Leader fixture | Role- and membership-scoped leader tools, no broad all-church people directory |
| Provider/source unavailable | Honest unavailable state, never invented scheduling or count |
| Refresh/local storage rejected | No data loss, repeated write, unauthorized action or false completion |
| Legacy comparison route | Old Today remains independently inspectable and can be used for visual rollback |

### Suggested first-guided usability test

Before real church integration, recruit 3–5 **consenting adult** volunteers (with church approval for the activity). Have each try the synthetic preview on their own phone. Ask: "What's important today?", "Where would you go to respond?", "How do you know it worked?", "What should you do when there is nothing pending?" Measure first useful action without coaching, number of misleading cues, confidence (1–5), and whether the tester recognizes that all people/commitments are fictional.

Proposed nonproduction acceptance threshold: at least 4/5 independently identify their next action and complete a Groups or Team handoff without help, with no privacy leakage or contradictory action status. Formal church security/pilot sign-off is a separate gate.

## Dependency split

**Can progress immediately:** F-14 default Today consistency; end-to-end navigation QA; guided synthetic usability; copy/contrast refinements driven by tests. 

**Blocked until Garrett / church data-owner decisions:** actual Planning Center or alternative provider identity, OAuth, organization membership, secure server session, permission scopes and consent. The `config/rallypoint-v10-readiness.json` live pilot checklist currently remains blocked with `approved_pilot: false`; do not change it to green.

## Approval checkpoint

This report is **not** implementation authorization. Proposed next explicit decision: **Approve F-14 default Priority Board on the nonproduction Develop preview with the old Today accessible for comparison, while F-10 stays opt-in.** Implement on its own branch, full QA and screenshots; merge Develop only after separate visual/functional approval. Never deploy production automatically.