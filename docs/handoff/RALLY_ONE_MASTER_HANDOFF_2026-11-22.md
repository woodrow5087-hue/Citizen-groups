# Rally One — Master Development Handoff & Continuity Contract
**Version:** 1.0 · **Prepared:** November 22, 2026 (Mountain Time)  
**Document status:** Product-owner review; documentation-only handoff, **not** authorization to merge or deploy.  
**Repository:** https://github.com/woodrow5087-hue/Citizen-groups  
**Working outward-facing identity:** **Rally One**, pending any formal Citizen Church brand/name signoff. Some repository files, source docs and branches still use the earlier working name **Rally Point**. Do not rename infrastructure broadly as cosmetic cleanup.

> **North star:** Once someone enters the Citizen Church community, how does the church continue caring for and connecting that person? Rally One should make relationships, relevant next actions, and community participation easier—not become the church website in a prettier container.

> **Non-negotiable continuity rule:** Implement the approved design **faithfully**. Preserve previously accepted layout, visual tone, user journeys, and functioning code unless a proposed change identifies its specific benefit, shows before/after evidence, and receives the product owner's approval. No silent redesign, wholesale styling reset, or feature sprawl.

## A. Read this first: evidence, authority, and confidence

This document reconciles the **original November 19, 2026 church leadership brainstorming meeting** (verified from the approximately 74-minute original Plaud recording transcript), subsequent product-owner feedback and approvals, and actual GitHub repository artifacts inspected on November 22. The transcript was used to distill product requirements; **it is not reproduced verbatim** because it contains sensitive church and personal discussion. Machine transcription has imperfect speaker separation; this handoff does not assert precise speaker ownership for every idea.

**Priority when evidence appears to conflict:**
1. Most recent **explicit user approval/correction** of a design or behavior, including approval of the live Connect review preview.
2. Specific **working review preview and exact PR diff** demonstrably approved for that component; compare actual mobile screenshots, not speculative image-generation outputs.
3. Earlier accepted integrated app components and stable **Develop** code.
4. Existing architecture and design decision records, especially D-10 and D-11.
5. November 19 meeting: **product motivation and candidate requirements**, not blanket signoff for every brainstorm.
6. Older mockups, consultant-style proposals, exploratory PRs, and AI-generated promo renderings: inspirations/comparators only.

**Important distinctions:** A product-owner-approved **design preview** is not a verified production feature. A meeting hypothesis is not a church-approved ministry policy. A completed Netlify deploy is not pilot-readiness. A successful browser-local demo message is not a message delivered to a member. Make these differences explicit in status reports.

### Source index: read these in the original, do not rely on this synopsis alone

**Integrated design and code**
- Shared development baseline: branch **rally-point/develop**, including merged Read visual unification **PR #97** and merged F-14 default Priority Board **PR #99**.
- **PR #101 — Rally One title, onboarding and integrated four-area app (DRAFT, unmerged):** https://github.com/woodrow5087-hue/Citizen-groups/pull/101 ; review start: https://deploy-preview-101--citizen-connect-test.netlify.app/?rallyOne=1&welcome=1 ; documentation on that branch: docs/rally-one/INTEGRATION.md. This is the preferred **Rally One onboarding/shared shell** starting reference.
- **PR #102 — Connect mobile messaging design lab (DRAFT, unmerged):** https://github.com/woodrow5087-hue/Citizen-groups/pull/102 ; review screen: https://deploy-preview-102--citizen-connect-test.netlify.app/connect-design-lab.html . The owner said **“Very nice. All of it.”** after reviewing the actual interactive design. This is the preferred **Connect visual/interaction** reference.
- **PR #100 — Rally One design proof (DRAFT, unmerged):** https://github.com/woodrow5087-hue/Citizen-groups/pull/100 . Helpful visual assets and source, **not** a branch to blindly merge alongside #101: #101 already incorporated design choices and assets from this work.
- Earlier explicitly preferred look **Rally Point v0.8 Unified Experience**, with earlier development preview and referenced checkpoint retained for comparison, **not** permission to overwrite #101/#102. The current accepted designs supersede earlier alternatives where they differ.
- Existing F-06 Wednesday Group lab in Develop: wednesday-chat-lab.html, wednesday-chat-lab.js, rallypoint-wednesday-integrated.css; reusable F-02 contracts and mock repository in lib/conversation-contracts.cjs and lib/mock-conversation-repository.cjs.
- Current Today and companion code: rallypoint-priority-board.js, rallypoint-personal-companion.js, rallypoint-group-experience.js, rallypoint.js. Read/team visual code is already in Develop.

**Governance, architecture and references**
- docs/RALLY_POINT_MASTER_BLUEPRINT_v1.0.md (November 19 base blueprint).
- docs/COMPANION_ARCHITECTURE_DECISION.md (**D-10**: distinct companion app; selective system-of-record integrations).
- docs/PALETTE_V2_COLOR_ONLY.md (**D-11**: exact Warm Editorial color guardrails; no whitewash/terracotta comeback).
- docs/V10_PILOT_READINESS.md (live pilot currently **blocked** until authorization, identity, scope, safeguarding, etc.).
- docs/architecture/F09_VISIBLE_PRIORITY_BOARD_V1.md, docs/architecture/F07_CONNECTED_GROUP_EXPERIENCE_V1.md, docs/architecture/F10_ASK_RALLY_COMPANION_LAB_V1.md, docs/architecture/F10_3_GOAL_ORIENTED_COMPANION_V1.md.
- docs/VERSE_CIRCUIT_GAME_BLUEPRINT.md, docs/VERSEPLAY_GAME_V1.md and existing VersePlay code for preserving scripture gameplay, not redesigning it in this effort.
- Visual references and actual assets: docs/assets/visual_reference_warm_editorial_v1.png; docs/assets/citizen_church_logo_reference.png; assets/citizen-flag.svg; assets/fonts/Manrope.ttf (license within repository); docs/onboarding-v2/approved-reference.jpg (earlier comparator); PR #101 branch assets/rally-one/title-card.jpg and its own portrait/community assets; PR #102 Connect design files.
- November 19 original Plaud recording: **“11-19 Brainstorming Meeting: Church Engagement App and Planning Center Integration.”** Reviewed full timestamped transcript (82 source segments, approx. 74 minutes). Do **not** commit its complete contents, private contact details, personal situations, or confidential leadership conversation to GitHub.

**Source freshness:** PR/branch statuses below were inspected on November 22, 2026. Re-query GitHub at execution; changes after this handoff supersede stale status claims.

## B. What the leadership meeting actually established

The November 19 session was a **brainstorm**, not a final implementation signoff. Distinguish the team's directional consensus from candidate features.

**Strong recurring mission and product themes (timestamp references are approximate):**
- **~3–14 min:** Small groups and serving teams should communicate between meetings. Inspired in part by Buddy Check/Sagebrush, Crossroads Anywhere, and existing group/team tools. The goal is strong relational connection and making it easier to notice when someone needs a human follow-up.
- **~9–10 min:** Direct concern that many “church apps” merely duplicate a church website; leadership wanted a **problem-solving community companion**, with easier pathways into people, groups, and serving.
- **~11–14 min:** Leadership discussed a **companion to doing ministry** that could help leaders see relevant tasks and coordinate with existing church systems. Flagging based on absence or inactivity was hypothesized, not an approved risk classification.
- **~24–26 min:** Defining question: **“Once someone is in, how do we pastor them? Take care of them?”** The conversation also invoked “for the one” / the 99-to-one concept as a possible **naming/mission metaphor**, not the definitive app name.
- **~25–36 min:** Minimize app fatigue; serve members through one clear front door, connecting with Planning Center/Church Center where permitted. Examples: group conversations, 1:1 encouragement, group discovery, schedules and team coordination. Discussed but did not verify two-way API support.
- **~37–47 min:** Today as a personal summary, Groups for communication and potential attendance records, Team for communication and schedules, Read for Scripture/questions/memorization with potentially curated leader options. One member experience with contextual leader capabilities is preferable to separate broad member/leader applications.
- **~47–52 min and ~62 min:** Staged delivery and “basic functionality with really good looking stuff.” February was floated as an ambitious possible launch opportunity, **not** an approved release deadline. A slimmer pilot might omit nonessential features.
- **~50–56 min:** Seek feedback from actual small-group and serve-team leaders and the person responsible for the church data/system workflow. Accurate attendance/participation data depends on real inputs; scheduled does not mean attended or served.
- **~59–65 min:** Read could include vetted plans, sermon series, Bible-in-a-year, questions and memorization; licensing, leader content approval and the actual role of Alpha/gathering cycles remain unresolved.
- **~63–68 min:** Multi-church use/white-label product was contemplated. Treat this as a **longer-horizon aspiration**, not a present requirement for multi-tenant infrastructure.

**Directional product judgment:** A compelling companion should help someone feel known, find their people, communicate, act on genuine group/team responsibilities, and return to community—not chase notification/streak numbers. This is an **interpretation of the meeting + subsequent owner direction**, not an additional unanimous leadership decision.

**Explicit open questions from the meeting / readiness record:** Which church systems are authoritative? Who records actual attendance? What does pastoral follow-up mean operationally? Who may see it? What are the permissions and safeguarding rules for minors and private messages? What first cohort and launch timing are authorized? Which features are phase one? Who owns ongoing support? Which Scripture translations/plan rights are permitted?

## C. Locked visual design language: the “do not drift” contract

**Owner-approved personality:** Premium, inviting, youthful without being childish, distinctly Citizen, energetic with restrained motion; feels like a social connection experience, not church administration software. Strong visual personality plus actual usability. The warm/cream+charcoal contrast and matte bright Citizen red should feel one coherent brand across opening, Today, Groups, Team, Read, and Connect.

**Grounded base tokens from D-11 / active code** (scope to components; inspect existing implementation before altering):
| Role | Approved token | Usage constraint |
| --- | --- | --- |
| Citizen accent red | **#E3002B** | Matte, bright primary emphasis; not burgundy, rust, orange, gradient red or generic coral. |
| Charcoal / ink | **#242322** | Structural depth, dark header/nav/sections, legible dark surfaces. |
| Warm cream | **#F3E5D6** | Substantial warm textured areas, **not whitewashed**. |
| Secondary parchment | **#E9D5C1** | Tactile secondary surfaces and contrast. |
| Pale paper | **#FCF7F0** | Selective lighter areas only; do not let full experience become a white card grid. |
| Defined borders | **#C5AA94** | Intentional contrast, not washed-out outlines. |
| Muted text | **#665E56** | Secondary text, while maintaining readable contrast. |
| Sage accent | **#5E7065** | Small/intentional only. |

**Typeface:** Existing bundled **Manrope** and related approved typography. Preserve original font licensing. Distinct confident display style; do not switch to Times New Roman, ultra-thin UI type, or unrelated fashionable fonts to “freshen” the app.

**Text/readability guidelines from latest explicit messaging feedback:** Approximate design targets; validate against phone settings and Dynamic Type/text zoom. Hero headings: 28–40+ px contextually, conversation titles 18–20 px, chat message bodies **17–18 px** (the approved Connect lab uses **18 px** with medium/normal weight), conversation previews 15–16 px where space permits, buttons 16+ px, supporting timestamps usually 13–14 px if practical. Avoid tiny 8–11 px critical content. Aim for at least 44x44 px touch targets. Do not make all chat messages ultra-bold—**large type is not the same as heavy type**.

**Core recognizable ingredients:**
- Instagram-style circular familiar faces/profile rail, with actual authorized/consented imagery in future real product; fictional approved assets in demo.
- Big editorial hierarchy with breathing room, occasional asymmetry and meaningful visual contrast.
- Warm tactile surfaces, bold active navigation treatment, Citizen flag assets and energetic matte red.
- Distinct but coherent **lighter Connect inbox + immersive charcoal conversation + rich team/group room**.
- Personalized Today priority card / action rows / read-only “Today at a Glance,” with Ask Rally as a contextual companion, not a floating novelty chatbot.
- Direct, human, short labels, action-oriented cards; clearly distinguish live content from fiction.
- Engaging subtle animation and expressive reactions where they help, honoring reduced motion.

**Known failure modes explicitly rejected by the product owner:**
- Generic corporate SaaS/dashboard styling; lots of plain white/gray, repetitive blank cards, dull icon nav.
- Replacing approved looks with generic AI-generated “professional UI” or incompatible screen templates.
- Automatic random mountain stock backdrops; D-11 protects original Citizen-branded graphic treatments, not generic photographic scenery. Use already-approved event, community and portrait imagery where intentionally part of a specific design.
- Miscolored rusty/dark red/terracotta as the primary brand color; avoid a broad color-replacement job that also removes warm neutral canvases.
- Overcrowded screens, double action surfaces, too many feature tiles or redundant cards.
- The **last extreme “even bigger” promo render** with billboard-sized, universally bold message bubbles: product owner called it borderline “AI slop.” **Do not use it as the accepted reference.** Use the previous balanced larger-type direction and especially the actual interactive PR #102 lab.
- Designing “three giant phones in a marketing image” and treating that as proof of mobile usability. Use device-scale browser previews.
- Breaking an approved component while “cleaning up” or migrating unrelated code. Absolutely no silent visual reset.

**Approval specificity:** The owner approved the actual working PR #102 Connect prototype (“Very nice. All of it.”). This approves its **visual/product direction**, not the fictional contents as real data and not unreviewed changes to the main app navigation.

## D. Screen contracts and interaction continuity

1. **Opening / account-demo flow** — PR #101 preferred implementation: Citizen flag/title card, charcoal/red identity; Create account or Log in, campus, connection/involvement, local demo profile and onward to Today. Do not promise real account creation or real sign-in. Preserve returning-user path, back navigation, small-phone safe areas, and original approved title artwork.
2. **Today** — A personal, role-aware front door, not a news page. Dynamic priority items and genuine source-owned next steps. Approved Priority Board is the Develop default (PR #99). Avoid duplicated interactive RSVP/serve actions inside read-only agenda. Ask Rally explains or guides using permitted *fictional* sources, does not imply real AI autonomy.
3. **Groups** — Discover/access one’s people, people circles, existing group conversation, gathering/RSVP, prayer, authorized leader tools where applicable. Preserve separate modern and legacy sample records without fabricated migration. One group's conversation should not create inconsistent unread counts on Today versus Groups.
4. **Team** — Member-specific serving information, existing sample confirmations and team communication. Attendance and scheduling are different. Leader-only controls require actual backend authorization before real deployment.
5. **Read** — Scripture, questions and existing VersePlay/Blank Battle puzzle functionality retained. Do not quietly remove/rewrite games or assume translations are licensed.
6. **Connect** — PR #102 working design is the visual baseline: personable light inbox with familiar profile rail, bold Connect heading, meaningful moment card, readable conversation list/search; dark message thread with 18 px comfortable bubbles, reactions, prayer card and composer; team “Rally Room” with Chat/Plans/People and sample RSVP; direct conversations. Existing demo interactions are **not network delivery**.
7. **Cross-screen flow** — Today -> new group message -> group conversation -> schedule or prayer -> return; Today -> serving request -> Team -> response -> Today updates; Read -> puzzle -> return; onboarding -> personalized member status. All use a consistent source of state.

**Critical open design decision — navigation:** The merged app and D-10 specify **four primary tabs: Today / Groups / Team / Read**. PR #102 *visual lab* depicts **five: Today / Groups / Connect / Team / Read**. Owner approved the messaging design but **has not explicitly approved replacing the global four-tab navigation**. Work MUST present at least two practical options (four tabs with contextual Connect entry; or five tabs with Connect as primary), show iPhone-scale evidence and tradeoffs, then request a decision **before changing the shared nav**. Do not bury or rename Read/Team, and do not unilaterally introduce a fifth tab.

## E. Current implementation reality: inspect, don't assume

As verified November 22:
- **Develop** includes merged **#97 Read** and **#99 F-14**; shell is still internally called Rally Point. Existing UI workflows and fixtures remain browser-local.
- **#101** is a clean, unmerged draft aimed at Develop. It integrates Rally One title/onboarding and shared app; its PR reports passing mobile/browser checks and 233 tests. Verify current status, CI and source at execution.
- **#102** is a clean, unmerged draft aimed at Develop. It creates an isolated standalone Connect lab: connect-design-lab.html/css/js and a test file; the build includes them without modifying main index.html. Its Netlify preview and GitHub preview QA were reported successful. It uses **in-memory DOM** interactions, not F-02 persistence or real messaging.
- **#100** is an earlier Rally One visual proof, separate draft and possible overlapping work with #101. **Do not merge both wholesale.**
- **#92** Planning Center read-only pilot draft is **unmerged and showed merge conflicts** at review. Keep separate. It does not authorize real data access.
- **Modern F-02** conversation modules exist, and F-06 group chat uses a versioned **fictional mock repository** and its own browser local storage. The original older sample group messages have incomplete author/timestamp metadata and must not be silently converted or lost.
- **Ask Rally** is a bounded deterministic/local prototype, not authenticated general-purpose AI; do not describe it otherwise.
- Current site is static JS/CSS/HTML built by scripts/build.cjs to a Netlify artifact. Do not introduce React, a new framework, schema migration or new backend solely to style the messaging component.

**Technical risk:** PR #101 and #102 both alter scripts/build.cjs; integrate at the file/feature level into a **fresh integration branch**, not via blind merge that can overwrite preview defaults or break assets. Compare with latest Develop before coding.

## F. The five-milestone execution chain

### Milestone 1 — One coherent Rally One app [first implementation priority]

**Objective:** Integrate owner-approved #101 onboarding/shared experience and #102 Connect visual experience into a dedicated **review-only** integration branch. Preserve the approved four-area code, title card, imagery, Today board, existing group/team/read flows.

**Actions:** inspect latest Develop and full PR diffs; inventory shared touched files; prepare conflict map; decide/present global navigation options (approval gate), then wire isolated Connect presentation to existing application route using supported paths. Reuse actual F-02 mock messaging model where it is appropriate; do not create a second authoritative chat data source or lose sample drafts/read state.

**Done when:** brand and onboarding are continuous; Today, Groups, Team, Read and Connect are all reachable; no duplicated messaging source or surprising state loss; consistent header/footer; no regressions; QA green; owner can review on phone.

**Must stop for approval:** shared bottom navigation architecture, visual deviations from #101/#102, merge to Develop, or any production deployment.

### Milestone 2 — One connected member journey

**Objective:** Unify the behavior, not just the CSS. Make linked actions open their actual owning screen with consistent membership and saved status.

**Test flows:** first visit with campus/connection choice -> personalized Today; Today group message -> Connect or Groups thread -> back -> accurate unread; group event RSVP -> source view and Today update; Team shift response -> same source on Today; Read -> Memorize/VersePlay -> back; leader/guest differences; nothing actionable shown if unauthorized; honest empty/unavailable/offline states. Explicitly test browser refresh, return navigation, and older demo storage.

**Done when:** screenshots and recorded path tests show no isolated “demo islands,” no duplicated response controls, and no fabricated data.

### Milestone 3 — Real mobile polish, QA and accessibility

**Test sizes:** at least 320, 390 and 430 CSS px, plus desktop/large viewport; small-height and keyboard-up modes. Check iOS safe areas, input composer focus and scroll-to-latest, dynamic text/zoom, minimum touch targets, dark/light contrast, motion sensitivity, semantic labels, legibility and no horizontal overflow. Run Node, Playwright, axe and existing onboarding/groups/team/read/companion/chat tests. Include screenshot comparisons to approved previews; manually inspect real iPhone Safari/VoiceOver with the owner as a separate acceptance gate.

**Done when:** reproducible browser/QA artifacts and regression report are clean (or documented remaining risks). This does **not** replace real device or usability testing.

### Milestone 4 — Guided human usability evaluation

**Objective:** Validate whether the app makes people feel known, understand the next step and complete real-world tasks, rather than just admiring screens.

**Design a moderated/unmoderated scripted test with fictional data** covering: first-time attendee, connected member, group participant, serving volunteer, and authorized leader fixture. Tasks: create fictional profile; find a group/person; open/respond to group conversation; RSVP/shift; find reading and puzzle; understand a prayer moment; recognize if an action is sample or real.

**Deliverables:** scenario sheet, test moderator questions, success/error criteria, observation form, prioritized findings register. **Actual human participants and data collection require product owner/leadership coordination**. Do not fabricate observed results, endorsements, or staff decisions.

**Done when:** plan is ready and owner-approved; human feedback captured only after authorized testing. If tests have not occurred, mark this milestone **planned**, not passed.

### Milestone 5 — Architecture and authorized pilot readiness

**Objective:** Prepare a secure, narrow, real-data path without claiming integrations already work.

**Decide with appropriate church owners:** supported Planning Center products/scopes, per-user login and identities, authoritative group/team roster, data owner for attendance, read/write API feasibility, secure messaging strategy (approved Church Center deep links if supported vs independently built secure backend), notifications policy, minors/1:1 messaging safeguards, prayer confidentiality, storage/retention/deletion/reporting and support/incident ownership.

**First live-scope preference:** small, authorized **adult** cohort testing **read-only My Groups / My Schedule**, consistent with docs/V10_PILOT_READINESS.md. Real messaging and human pastoral follow-up must pass their own additional gates. Never infer spiritual health or care status from no app activity. No live credentials in code, PR descriptions or prompts; no secrets client-side. Production remains untouched.

**Done when:** written feasibility matrix, identity/permissions contract, threat/privacy review, support/rollback plan and explicit leadership authorization exist. This milestone is **not** a live pilot deployment.

## G. Acceptance and anti-regression gates (mandatory)

Before modifying any code, Work must produce a short **Context Verification Report** that correctly:
- Names the current source-of-truth branches and identifies the exact PR #101 and #102 visual baselines; opens both previews and reviews **actual screens**, not only PR descriptions.
- Describes the approved palette, Manrope usage, large **readable** but not universally bold messaging typography, people rail, light inbox / dark conversations, and why the extreme all-bold promotional render was rejected.
- Explains the November 19 leadership question and avoids turning brainstormed automatic flags into shipped care/risk scoring.
- Documents the unresolved **four vs five tabs** decision, without changing navigation before owner approval.
- Identifies conflicting paths between PRs (especially scripts/build.cjs), the F-02 mock repository, legacy browser storage, and #92 separation.
- Lists preservation checks: current Today, Groups, Team, Read, VersePlay, Ask Rally, welcome, old sample data, and production behavior.
- Presents screenshot routes and specific deterministic browser journeys to be tested.
- Proposes a feature-level integration sequence with rollback and separate review PR; flags blockers rather than making unsupported claims.

**Development discipline:** Each milestone should have a clear task branch, narrow diff, preview URL, before/after screenshot evidence, tests including relevant regressions, unresolved issues and owner approval request at gate. Preserve the original approved branches as comparators. Do not mark any task complete without evidence. Avoid piling parallel review-only PR branches into Develop. Work may prepare plans, diffs and previews, but **must not merge to Develop or main, access real church accounts, or deploy production** without explicit authorization.

**If Work cannot access an original source:** state the gap and use the explicit repo reference, do not invent what that screenshot/transcript shows. This handoff is not a magical transfer of every historical chat image. The product owner remains the authority on fidelity.

## H. Decisions to request rather than silently make

1. **Global information architecture:** remain four tabs with contextual messaging vs introduce explicit fifth Connect tab; demonstrate both at iPhone scale.
2. **Name and official launch brand:** working identity Rally One, internal legacy Rally Point; formal church signoff still needs confirmation.
3. **Scope of direct messaging:** adults only, opt-in/discovery rules, minors safeguarding, reporting and boundaries.
4. **Church-system source ownership:** actual module usage and authorization; no assumed Planning Center chat write access.
5. **Attendance and care signals:** human-review process, data quality, consent, roles, visibility, nonpunitive correction and retention policy; not automatic “red/yellow spiritual score.”
6. **Content and Scripture:** translations, publication rights, vetted study defaults and pastor/leader editorial approvals.
7. **Live pilot timing, real participants and responsibility:** no launch commitment from a speculative February conversation.
8. **Potential multi-church productization:** defer until a Citizen-specific authorized pilot demonstrates value.

## I. Work mode startup contract

1. Open the **specific GitHub branch holding this handoff** and read this document, then follow all linked repos, PRs and architecture files. Do not assume the handoff is already on Develop while its review PR is open.
2. Audit current GitHub head and CI/Netlify statuses again; report material changes after November 22.
3. Deliver the Context Verification Report before implementation.
4. Do NOT code the global nav solution until owner has chosen how Connect appears. Other independent, noncontroversial safe inspection/tests may proceed.
5. After owner approves the navigation choice and the proposed conflict map, make a separate integration PR for Milestone 1 only, not a bundled five-milestone mega-merge.
6. Advance to each next milestone with tracked evidence and clear stop/approval gates. Never claim that simulated user testing is genuine human feedback.

**Success means:** members understand “my people, my next step”; a leader gains useful permitted coordination without surveillance; the app feels unmistakably Citizen, polished and readable; and the code integrates safely without repeating the redesign-and-rollback cycle.
