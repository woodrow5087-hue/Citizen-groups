# Rally Point — Companion Architecture Decision
**Decision ID:** D-10  
**Status:** Locked product direction (integration details unverified)  
**Adopted:** November 20, 2026  
**Applies to:** Rally Point mobile-first experience, Phase 1 and later

## 1. The decision

**Build Rally Point as a distinct, premium Citizen Church companion app that selectively integrates with existing church systems instead of rebuilding their system-of-record functions.**

- **Rally Point owns the member experience:** personalized Today, recognizable Warm Editorial visual identity, four-tab navigation (Today / Groups / Team / Read), curated content, and only the workflows that add clear value.
- **Planning Center / Church Center remains the candidate system of record** for existing church operations: group membership and attendance, volunteer scheduling, events, and other functions **only where Citizen Church confirms the relevant product is used and the authorized integration supports the workflow**.
- **Read is the primary first-party differentiator:** Scripture presentation, questions, memorization, and leader-selected reading defaults, subject to content rights and access controls.
- This is a **product-direction decision**, **not** approval to access real church accounts, copy member records, use credentials, or deploy an integration.

## 2. Integration strategy: reuse, enhance, or build

| Rally Point area | Intended user experience | Candidate source of truth | First working approach | Status |
|---|---|---|---|---|
| Today | Unified schedule, relevant actions/messages, reading | Presentation aggregate of authorized sources | Clearly marked fixture data and navigation | Approved prototype |
| Groups | My groups, group updates, 1:1 communication | Planning Center Groups for existing group records, if authorized | Demo lists; eventually verified deep links or supported API endpoints | Integration discovery |
| Team | My serving assignments, team updates and availability | Planning Center Services for schedules, if used and authorized | Fixture schedules, link-out where appropriate | Integration discovery |
| Read | Scripture, questions, memorize, selected plans | Rally Point content and user progress (unless a future source is approved) | First-party demo with clearly identified sample content | Product build |
| Leader — Groups | Attendance and follow-up flags | Existing group attendance if available; new follow-up workflow only if approved | Role-aware demo tools, no real member data | Definition required |
| Leader — Team | Attendance / missing volunteer follow-up | Services and/or Check-Ins, pending product and endpoint verification | Role-aware demo tools, no real attendance or flags | Definition required |
| Leader — Read | Choose group/organization default plan | Rally Point configuration, with hierarchy to be decided | Demo selection | Definition required |
| Events / Giving | Relevant entry points later | Existing church systems | Verified deep links first; no duplicate payment flows | Deferred |

**Important:** A feature existing inside Church Center does **not** mean its data or actions are available through the public Planning Center API. Confirm individual endpoints and permission behavior, especially for chat/direct messages, notifications, schedule responses, and attendance writes. Do not claim two-way synchronization where none has been verified.

## 3. UX contract: make integration invisible where useful, explicit where necessary

1. Preserve the approved visual direction (high-contrast warm editorial design, Citizen brand, charcoal, terracotta, sage, textured neutrals). Do not redesign the UI to resemble Church Center.
2. Give Today clear priority: **what matters to me now?** Link to the most relevant full workflow.
3. Show whether an action opens Church Center or stays in Rally Point. Use intentional transition labels instead of surprising context switches.
4. Do not create parallel member profiles, schedules, attendance ledgers, or chat history when an existing authoritative system should own them.
5. A temporarily unavailable integration must never present sample church data as live. Provide honest unavailable/linked/demo states.
6. Preserve four primary tabs and permission-aware leader capabilities; no separate administrative app for the member experience by default.

## 4. Technical and trust guardrails

- Use only documented, supported endpoints and verified link destinations, with authorized church administrator consent and appropriate permitted scopes.
- Keep API keys, OAuth secrets, and access tokens **server-side**, never in JavaScript bundles, static Netlify assets, prompts, screenshots, or public git commits.
- Evaluate OAuth on behalf of users versus a church-approved service integration based on the required tasks. **Never use a broad church-admin token as a shortcut to expose private information to ordinary members.**
- Enforce leader permissions server-side and scoped to the relevant group/team. Hiding buttons in the UI is not authorization.
- Minimize stored member data, encrypt protected records, limit retention, and define audit trails and deletion requirements before a real pilot.
- Define special protection for minors, 1:1 messaging, prayer requests, and pastoral follow-up. Do not expose an individual's attendance/flag status broadly.
- Define flag meaning, owner, visibility, consent, resolution process, and escalation policy with church leadership *before* storing flags for real people.
- Use mock data for the early prototype, never live or scraped Church Center account data without authorization.

## 5. Implementation sequence (no restart)

**Now — Keep the current Phase 1 work.** The existing `rally-point/phase1-today` branch includes the Today-screen implementation and review artifacts in `docs/phase1/`. Do not throw it away or redesign it because of this decision. Continue mobile visual review and approval.

**Next — Integration discovery spike (no credentials yet).**
- Confirm which Planning Center modules Citizen Church uses for **Groups, Services, Check-Ins, People, Calendar, and Publishing**, and which workflows/permissions are enabled.
- Ask an authorized church administrator whether third-party companion-app access may be considered.
- Map actual user journeys: open personal schedule, respond to serving, see group, message safely, mark attendance, trigger private follow-up.
- For each journey, verify: available official endpoint or deep link, authorization scope, read/write ability, data owner, fallback, and any documented limitation.
- Produce an integration feasibility matrix before constructing a production connector.

**Then — Select the smallest integration pilot.** Prefer a read-only, low-risk personal schedule or my-groups view if the verified API supports the needed authorization; otherwise pilot a verified link-out. Do not begin with bulk member import, 1:1 chat storage, write-back attendance, or automated flagging.

**Later — Add secure integration incrementally**, then test with a small church-approved user cohort. No production deployment or merge without explicit approval.

## 6. Questions requiring a church decision

- Who owns integration authorization and security review at Citizen Church?
- What are the exact member/leader definitions and group/team roles?
- Are messaging and scheduling features already enabled and used in Church Center?
- Must actions open Church Center, or is in-app action required for adoption?
- What counts as an attendance absence or a follow-up flag? Who can view and resolve it?
- What is the appropriate launch audience, age policy, and data retention policy?
- Who controls Read defaults (organization vs leader) and may members opt out/change them?

## 7. Phase 1 acceptance criteria remain unchanged

This architecture decision **does not expand the current Today-screen scope** or license any access to real Planning Center records. Phase 1 stays a polished, accessible, mobile-first prototype using fixture data. The eventual integration boundary should be reflected in naming and code seams only, not implemented prematurely.

## 8. Decision effect

This document governs future implementation alongside `RALLY_POINT_MASTER_BLUEPRINT_v1.0.md`. When they differ on **whether Rally Point duplicates church operations**, this newer D-10 decision controls. No other locked visual, navigation, or functional decision is replaced.
