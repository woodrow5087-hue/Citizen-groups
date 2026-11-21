# Rally Point — 14 Approved Decisions & Recommended Implementation Roadmap
**Audit review finalized:** November 21, 2026  
**Decision status:** 14/14 owner-approved, all Option B. **Execution status (November 21, 2026):** Milestone 0.1 is completed and accepted; the **F-02 domain foundation (12 contracts/tests/docs files) was independently owner-approved and merged into `rally-point/develop` via [PR #65](https://github.com/woodrow5087-hue/Citizen-groups/pull/65)**. This does **not** include an actual browser-data migration, messaging UI, live data, `main`, or production changes. Separate authorization is required for further implementation; see the [decision register](DECISION_REGISTER.md).  
**Roadmap status:** Assistant recommendation for the next implementation authorization; the sequencing below is **not itself permission to build, merge or deploy**.  
**Audit source:** [01 Current Application Map](01_CURRENT_APPLICATION_MAP.md) · [02 Visual Gap Matrix](02_DESIGN_GAP_MATRIX.md) · [03 Ranked Foundation Backlog](03_RANKED_FOUNDATION_BACKLOG.md) · [Official Decision Register](DECISION_REGISTER.md)

## Execution checkpoint — integrated F-02 development foundation

- The combined versioned conversation, serving, companion-action, care, source-reference and uncertainty-aware migration **rehearsal** code is now on `rally-point/develop` at merge commit `3550e442d5e253b5dedd4e6f32a0463eafcbfc12`.
- All 12 approved file contents were verified intact after merging; CI and Netlify PR preview passed beforehand. `main` was confirmed unchanged.
- [PR #63](https://github.com/woodrow5087-hue/Citizen-groups/pull/63) and [PR #64](https://github.com/woodrow5087-hue/Citizen-groups/pull/64) were closed as superseded. GitHub marks #63 as merged by commit ancestry; no separate merge was invoked. #64 is closed unmerged.
- No browser-local `localStorage` data was migrated and no real persistent backup was written. The application still runs the original fictional demo. Further migration, permission enforcement and Wednesday Group UI implementation are **not authorized by this checkpoint**.

## Executive conclusion

**Build the Citizen Church companion, not a generic church website or replacement Church Center.** Preserve the primary four-phone Premium Hybrid red/charcoal/cream design and the secondary ALIVE colored-ring **Your People** portraits. Preserve the working four-tab Today / Groups / Team / Read navigation and role-scoped Leader Care. Implement focused, tested capabilities inside the actual application; use the standalone future-state lab as a visual/behavior reference, **not** as a drop-in replacement.

The highest-impact next visible product improvement is **one excellent fictional Wednesday Group messaging experience**. But the first authorized implementation should be the **canonical development branch and direct CI/Netlify preview workflow**, followed by versioned contracts and safe migration, because otherwise feature delivery creates avoidable risk.

Current working app candidate: `rally-point/companion-sunday-to-week-v03` at `01cce2801a15565d34b042304758ed73d9877449`. Future-state concept remains separate; reference visual decisions live on protected branches. The current application is browser-local and uses fictional fixtures. The machine-readable live-pilot readiness state remains **blocked**.

## Approved decision digest — all 14

| Finding | Approved Option B decision | Practical implication |
| --- | --- | --- |
| **F-01 — Canonical development baseline** | Designate `rally-point/develop` based on the audited v0.3 commit after a divergence check, and provide direct CI/Netlify previews | No more routine main-targeted never-merge preview bridges; production and locked visual references untouched |
| **F-02 — Domain contracts** | Versioned User, Membership, Conversation, Message, Reply, Reaction, ReadCursor, ServingShift, CoverageRequest, CompanionAction, CareTask, SourceReference and mock repository | Stable identities, timestamps and relationships before rich chat or real services |
| **F-03 — Identity and permissions** | Define identity/membership/role-action matrix, mock access-denial and revocation tests, and real server-enforcement requirements | Local demo role toggles never grant access to live information; minors and DM rules need church approval |
| **F-04 — Modularity** | Incrementally extract repository, models, conversation UI, composer, permissions, Today selector from central controller | No wholesale framework migration; preserve existing routes and saved demo state |
| **F-05 — Pastoral care governance** | Church-owned provenance, privacy, human review, scoped task ownership, retention and resolution | No inferred spiritual-risk scoring, automatic attendance surveillance or broad visibility into private content |
| **F-06 — Messaging experience** | Build one expressive and reusable mock Wednesday Group conversation, with bubbles, replies/reactions, keyboard-safe composer, drafts and delivery states | Approve on real phone before extending to Team and DM |
| **F-07 — Today hierarchy** | Present one relevant, permitted next action in the first 390×844 viewport | Keep vivid hero, photo warmth, Instagram-style people rail and four-tab shell |
| **F-08 — Persistence** | Versioned local records and reversible, tested legacy migration; day/event IDs and per-conversation read cursors | Existing demo messages, settings, reading, VersePlay and other progress must not disappear |
| **F-09 — Protected styling** | Gradually extract brand tokens and component-scoped styles from the 12 CSS stylesheets | Preserve `#E3002B`, `#242322`, `#F3E5D6` and distinctive visual character; no whitewashed UI kit |
| **F-10 — Quality gates** | Automated contract/browser tests, permanent visual baselines and manual real iPhone/Safari/VoiceOver signoff for significant UI changes | Passing CI is not substitute for product-owner visual/experience approval |
| **F-11 — Product consistency** | One truthful build/version source and coherent labels/header priorities | Rally Point remains a *working name*; current four tabs persist; review Spotify header placement, do not remove silently |
| **F-12 — Church integration** | Church-authorized discovery and verified narrow read-only or safe-deep-link adult pilot before real messaging/writeback/care | Planning Center/Church Center capabilities, consent, scopes and data ownership require direct confirmation; live pilot blocked |
| **F-13 — Notifications** | Design event categories, opt-in preferences, quiet hours, redaction and mock notification behavior; defer real push | Never treat browser simulations as delivered push notifications or expose private lock-screen details |
| **F-14 — Future expansion** | Citizen-first value validation; keep sensible tenant and adapter boundaries | No multi-church admin/billing/commercialization yet; review church branding, IP and licensing if expansion becomes justified |

**Status:** These are accepted architectural/product choices, **not implemented features**.

## Recommended implementation roadmap — proposed sequence, separately authorize each slice

### Stage 0 — Stabilize delivery and protect the reference design
**Primary findings:** F-01, F-10; references: F-09, F-11  
**First implementation milestone:** Create `rally-point/develop` based on an explicit fresh branch-divergence check against audited v0.3. Adjust supported CI and Netlify preview configuration to test PRs against that branch. Run a **docs-only canary PR** to prove direct test/preview behavior. Establish frozen reference captures and record exact baseline commit and build identifier.

**Exit criteria:** Feature PR checks run against the intended branch; a direct review preview works without a main-targeted bridge; all production/main and reference branches untouched. Document tested flow and rollback. **Do not assume Netlify settings are already configured.**

**Risk:** Workflow provider behavior/settings must be verified in the actual repo/site when implementation is authorized.

### Stage 1 — Define data, access, and migration contracts
**Findings:** F-02, F-03, F-05, F-08; tenant boundary from F-14  
- Author versioned entity schemas and a `ConversationRepository` mock contract.
- Write an explicit role × resource × action authorization matrix, fictional allow/deny/revoke scenarios; do not misrepresent mock checks as production security.
- Write the pastoral data/source/consent checklist for later church review, explicitly distinguishing missing data from inferred behavior.
- Specify legacy `rallypoint-phase1-2026` and `rallypoint-today-ui-v1` migration; preserve old fixture values and handle unknown historical timestamps honestly.
- Add deterministic contract/migration tests before connecting the UI to the new model.

**Exit criteria:** Mock records have stable IDs/time/relations, read-state and shift-event semantics, positive/negative access tests, legacy-preservation tests and a reviewed module interface; existing demo use remains intact. No real user accounts or external service calls.

### Stage 2 — Build the first flagship experience: Wednesday Group chat
**Findings:** F-04, F-06, F-09, F-10; depends on Stage 1  
- Extract just the reusable conversation view, bubble, reply, reaction, composer, contextual action and local state adapters; avoid refactoring the whole app.
- Implement **one** fictional Wednesday Group thread within the current app, visually matching the approved future-state design *inside* the Premium ALIVE shell.
- Verify stable quoted references, reversible reactions, retained drafts, pending/sent/failed/retry states, deduplication and ordering.
- Validate actual mobile keyboard, safe areas, long threads, reduced motion, touch targets and screen-reader labels.

**Exit criteria:** Approved screenshots at 320/375/390/430px, relevant automated tests green, working review-only preview, manual iPhone Safari/VoiceOver usability evidence, **explicit owner visual signoff**, and no regression in Team/Read/Leader Care.

**Deliberately defer:** Team/DM rollout, production messaging backend, real people and push delivery.

### Stage 3 — Make Today action-first without redesigning it
**Findings:** F-07, F-02, F-03, F-10  
- Implement a deterministic, explainable `today-selector` using allowed mock facts.
- Surface one relevant action within the first 390×844 viewport.
- Preserve brand-red/charcoal hero structure, authentic-feeling photography, prominent colored-ring individual people portraits, readable typography and the exact four-tab navigation.
- Include gentle neutral empty state rather than inventing urgency.

**Exit criteria:** Before/after mobile visual comparison, alternate mock user states, screen-reader/keyboard review, no unrelated redesign, explicit owner approval.

### Stage 4 — Extend carefully and clean up truthful prototype surfaces
**Findings:** F-06 (follow-on), F-08, F-09, F-11, F-13  
- **After** Stage 2 signoff, adapt the same conversation component to Team and approved *fictional* direct-message scenarios, with their distinct access rules.
- Complete the tested versioned fixture migration and per-event/day accuracy.
- Normalize build/version/demo labels, navigation headings and review header priorities without changing public brand commitments.
- Establish mock notification categories/preferences and privacy examples; do not send push.
- Continue style-token consolidation only in actively modified components.

**Exit criteria:** Feature parity with existing demo, consistent chat behaviors, accurate migration, no surprising notifications, visual/product-owner approval and passing targeted regression checks.

### Stage 5 — Church decision and technical feasibility track (can be planned in parallel)
**Findings:** F-03, F-05, F-12, F-13, F-14  
**Not an authorization to access church systems.** Prepare a discovery package for authorized Citizen leadership:
1. Name accountable church owner and define adult cohort, campus scope and safeguarding/DM policies.
2. Confirm which actual Planning Center/Church Center products and workflows are used.
3. Map My Groups, My Schedule, schedule responses, attendance, messaging, content, notifications and care to record owners.
4. Investigate exact official endpoint or authorized deep-link feasibility with scopes and whether each workflow supports reading or writing.
5. Define support/incident handling, deletion/retention, content rights, audit, fallback and rollback.
6. Decide separate messaging link-out versus secure messaging backend only after user, church and technical review.

**Exit criteria:** Written church approvals and evidenced feasibility matrix. No account access, secrets, real messages, record imports or production toggles before separate authorization.

### Stage 6 — Authorized narrow live pilot (gated; not scheduled or approved)
Only if all relevant gates of `config/rallypoint-v10-readiness.json` independently pass and the church and product owner explicitly give go-ahead:
- Prefer read-only My Groups / My Schedule or verified safe link-outs for a small approved **adult** cohort.
- Server-side sessions and per-user permissions; no broad administrative token shortcuts.
- Test denial/revocation, confidentiality, device security, accessibility, recoverability, monitoring, support, backups and deletion.
- Keep fictional chat separate until a real messaging strategy and safeguards are explicitly approved.
- Capture opt-in/opt-out and useful-journey feedback without spiritual-engagement risk scoring.

**Exit criteria:** Auditable go/no-go signoff. Successful Netlify build is **not** a release readiness signal.

## Recommended exact next implementation request (future; NOT executed)

> Establish the canonical `rally-point/develop` development branch from audited v0.3 after checking current refs. Configure GitHub Actions and Netlify to validate and preview PRs against this branch. Prove it with a documentation-only canary PR. Keep main, production, all visual references and the separate future-state lab unchanged. Do not merge or deploy to production. Provide the resulting branch/PR/preview URLs, test results, diff summary, and any environment limitation. Stop for product-owner approval before beginning the versioned data-contract work.

## Implementation discipline

- One small, independently reviewable PR/slice at a time; no cascading changes or unsupervised merge.
- Every slice has: exact before state; targeted requirements; tests; mobile screenshot or interaction evidence when visual; list of unchanged screens; known limitations; explicit owner decision.
- Separate **approved direction**, **implemented**, **tested**, **product-owner accepted**, and **live-pilot authorized** states. Never equate them.
- Preserve the locked visual hierarchy: **Premium Hybrid is the chassis; ALIVE is the personality; companion is the purpose.**
- No false claims of server permissions, synced accounts, push, actual church data, or production readiness.

## Open decisions not resolved by the 14 approvals

- Actual Citizen Church owners, pilot cohort and permission to conduct integrations.
- Real authentication and source-of-truth provider choice, per-endpoint capabilities and chat solution.
- Minors/DM safeguards, prayer and pastoral-care privacy/retention policy.
- Scripture rights and publishing workflow, service support/incident response.
- Final public product name, branding/licensing and any eventual commercial rights.
- Review and explicit authorization of **each** future code-delivery slice, beginning with Stage 0.

**At the close of the decision review:** 14/14 Option-B approvals. After the user authorized starting Stage 0, `rally-point/develop` was created, the GitHub Actions PR target was updated and [draft docs-only canary PR #62](https://github.com/woodrow5087-hue/Citizen-groups/pull/62) was opened; GitHub Actions run #44945286190 triggered. The latest [GitHub Actions run #44947503441](https://github.com/woodrow5087-hue/Citizen-groups/actions/runs/44947503441) passed, and GitHub recorded a successful [Netlify Deploy Preview #62](https://deploy-preview-62--citizen-connect-test.netlify.app). The owner confirmed the preview looks good, meeting the Stage 0 acceptance gates; PR #62 remains unmerged. No application JS/CSS/UI, church accounts, member data, production deployment or `main` changed. This roadmap document is documentation-only on the isolated audit branch.
