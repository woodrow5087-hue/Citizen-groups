# Rally Point — continuous development track, v0.6 → v1.0
Date: 2026-11-20
Basis: November 19 Citizen Church meeting (complete 74-minute transcript), reviewed design references, and previously implemented working fixtures.

## Product north star
Help people build lasting community and help authorized leaders notice when someone may benefit from human follow-up. NOT a substitute for the entire church website or Planning Center.

## Shared rules
1. Start every stage from the prior accepted stage's development branch; preserve its data and features.
2. Implement real demo interactions rather than dead buttons or static image-only screens.
3. Keep approved Citizen red (#E3002B), cream (#F3E5D6), charcoal (#242322) and sculpted matte shapes. Avoid neon, glassy AI-style gradients, and generic white corporate boxes.
4. No automatic production merges. Each stage gets an isolated PR/deploy preview for review.
5. Use only fictional local fixture data until real member accounts, messaging safety, authorization, data ownership, and integration permission are agreed.
6. Preserve separate labels: meeting consensus, later product decision, developer recommendation, and unresolved dependency.
7. Regression gates: npm test, npm run build, npm run test:browser and npm run test:onboarding where execution is available; show the actual state of verification.

## Stage sequence

### v0.6 — Connected Dashboard (PR #22 BUILT; browser visual review required)
- Objective: turn approved mobile dashboard visual into working Today interface.
- One dominant red Your People panel from existing fictional roster and latest conversation.
- Two-column cream Up Next / charcoal Your Team modules; data derives from RallyToday source snapshot and current team response.
- Larger cream reading widget with Read, Reflect, Memorize (memorization remains explicitly labeled preview).
- Preserve group/leader/guest states, bottom dock, current four tabs, demo data, and onboarding.
- Check 320–430px layouts, touch target sizes, legibility, keyboard focus, and scroll behavior.

### v0.7 — Groups (PR #23 BUILT; fixture-based member and 1:1 prototype)
- More personable group conversation display; role-restricted leader controls remain distinct from member chat.
- Participant visibility, group discussion, 1:1 communication prototype only when safely scoped with clear local-fixture labeling.
- Group lifecycle across semesters and leader transfer remain *unresolved ministry policy*, not forced in code.

### v0.8 — Team (PR #24 BUILT; fixture-based schedule and communication)
- Put team communication and My Schedule together with clear pending/confirmed/declined response states.
- Guard demo-only leader review, avoid mistaking scheduled serving for actual attendance.
- Do not claim Planning Center synchronization until tested and authorized.

### v0.9 — Read (PR #25 BUILT; 3 sample content pathways)
- Consolidate Scripture, questions, and honest memorization preview.
- Scaffold 3 reviewed reading-plan modes from meeting: Bible in One Year, approved biblical book, sermon-series content.
- Admin/editor permissions, theological review, copyrighted plan licensing, group overrides remain open.

### v1.0 — Integrated pilot readiness gate (PR #26 DOCUMENTATION/RELEASE BLOCKER, NOT A LIVE PILOT)
- A real integrated pilot is conditional, **not** an automatic extension of mock data:
  - authenticated identities and authorized role grants;
  - approved group/member messaging and safeguarding;
  - verified, permissioned integration with existing church systems and source-of-truth ownership;
  - attendance/flagging policy and privacy controls;
  - monitoring, rollback, support owner, and realistic launch cohort.
- Until these gates pass, label the result **local prototype with a documented pilot-readiness gate**, not a pilot-ready or live integrated product.

## Known unresolved decisions from meeting
- Automatic follow-up thresholds, recipient and resolution workflow.
- Who records real attendance; source of scheduling data.
- Which member/group/team communication system owns real messages.
- Group continuity through semesters and Alpha exception.
- Reading-plan default ownership and overrides.
- Multi-church provisioning, commercialization, and fundraising.
- February 2027 was aspirational, not a committed delivery date.

## v0.6 source changes
- rallypoint.js Today layout: people-first, linked Up Next/Team widgets, source-dependent states, reading actions.
- rallypoint-dashboard-v06.css: scoped premium widget system, stacked mobile scroll layout, responsive twin cards.
- index.html + scripts/build.cjs: stylesheet and distribution.
- test/rallypoint.test.cjs: regression expectations and v0.6 state transitions.

## v1.0 readiness documentation
- `docs/V10_PILOT_READINESS.md` — official public API feasibility and exact blockers.
- `config/rallypoint-v10-readiness.json` — all production gates pending by default.
- `npm run pilot:check` — intentionally fails when an approval or its evidence is absent.
- Netlify build success is not an integrated-pilot readiness assertion.
