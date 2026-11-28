# Recommended next scope — Foundation 2.0 feature-parity and architecture audit

Planning recommendation only. No audit implementation or remediation sprint is started by the Gate 8 promotion.

Baseline: canonical merge `b7bb0687a498f2ba9ab1f2a244b187013ceea339`, tree-identical to accepted PR #151 head `3838aa87f6e8217c2b779bfcfa5976dda72dcb56`. Preserve production, PR #150, all recovery references, approved visual references and game engines. Use fictional data only.

## Objective and deliverables

Produce an evidence-backed gap map between the accepted legacy application and Foundation 2 before any replacement/cutover or substantial refactoring. A migrated route is not proof of feature parity, and a static fixture is not a live integration.

1. **Feature/acceptance matrix:** each journey or capability, legacy owner/reference, Foundation implementation and owner, permission, state/persistence contract, evidence/test, gap, risk and proposed next action. Distinguish working, read-only, explicitly unavailable, deliberately unmigrated and unverified behavior. Avoid unsupported completion percentages.
2. **Architecture/ownership map:** presentation, routes/history/focus, canonical member context, intelligence and action transitions, conversation domain/read cursor, guarded state/persistence, provider adapters, and each game engine. Record intentional isolation versus accidental duplication/coupling.
3. **Prioritized findings:** confirmed defects, parity gaps, documentation drift, governance/deployment limitations and optional improvements in separate categories. Each proposed correction needs the smallest coherent scope and applicable validation gates. No implementation is implied.
4. **Cutover decision paper:** what remains before Foundation 2 could become a canonical preview entry, followed eventually by production consideration under separate authorization. Include rollback/provenance, storage compatibility and owner acceptance requirements.

## Audit workstreams, in priority order

### P0 — Governance, deployment and validation applicability

- Record administrator-confirmed absence of classic branch protections and API-confirmed absence of applicable active main/develop rulesets as an existing governance risk. Source guards and manual validation do not enforce server-side review/merge/force-push/deletion policy. Recommend a separately authorized protection configuration; do not change settings as part of a read-only audit.
- Verify future Foundation branches receive the intended checks. The current Foundation mobile workflow is PR-only and conditioned on the exact `rally-one/foundation-2` head branch; the independent VersePlay workflow is PR/path filtered. Document coverage for subsequent branch names and shared-dependency changes before their implementation begins. Do not silently reduce validation or add a circular selection rule.
- Document that current build rules expose `/foundation2/` only for actual Netlify `deploy-preview` builds. The canonical `branch-deploy` preserves the existing root and does not publish that route. Propose an explicit owner decision about future canonical preview exposure without treating this accepted source promotion as a UI cutover.
- Reconcile historical PR/programme wording (draft, experiment, earlier migration status, earlier HOLD/no-merge statements) with this dated promotion report. Preserve historical evidence rather than rewriting acceptance history.

### P1 — Functional parity and shared state

- **Entry and shell:** title/tagline, onboarding, four primary tabs, Connect entry, deep links, history, return controls, focus/scroll restoration, persona changes and reload. Compare both roots explicitly.
- **Today and Ask Rally:** canonical member context, intelligence/ranking, Priority Board/Unified Focus compatibility, commitments versus optional actions, All Set/deferred/visitor/unavailable distinctions, unread signals, receipts and completion transitions. Identify any competing derivation or ordering rules; do not change ranking during the audit.
- **Groups and Team:** membership/campus/role gates, gatherings, RSVP/Maybe/clear consistency, conversation origin return, prayer/care context, serving confirmation/decline, coverage request/withdraw/reconfirm and persistence. Retain explicit fictional care requests and human-led follow-up.
- **Connect:** shared conversation repository, membership restrictions, read cursor/unread consistency, sending/local delivery disclosure, drafts/reload, replies/reactions, origin return. Explicitly inventory Foundation direct-message and Rally Room Chat/Plans/People parity instead of assuming the accepted group-thread integration supplies those capabilities.
- **Read and games:** Scripture/prayer/reflection and next-day transitions, authorized leader controls, Classic solo/Pass & Play progress, Blank Battle and Verse Circuit entry/return/progress. Document deliberately independent game stores; do not migrate or merge them during the audit.

### P1 — Ownership, persistence, permissions and degraded states

- Inventory every relevant key/store and read/write owner, scenario isolation, normalization, malformed/blocked/quota failure handling, concurrent writes, drafts/read cursors and restoration semantics.
- Trace presentation actions to existing domain handlers and permission decisions. Identify duplicate business logic, shared mutable state, direct storage dependencies and presentation/domain coupling, with evidence before proposing extraction.
- Separate local demonstration identity from authentication, and minimized provider rehearsal output from live provider access. Verify unavailable, unknown, empty, stale, malformed and confirmed states remain distinct where contracts require them.
- Keep server-only privacy/consent/identity/transport contracts out of static output. No live credentials, real member records, inferred distress, spiritual scores or automatic outreach.

### P2 — Accessibility, performance and maintainability

- Trace labels/roles, keyboard and VoiceOver focus restoration, screen-reader announcements, enlarged text, shorter viewports, reduced motion, contrast and target sizes through representative journeys.
- Measure bundle/module/dependency ownership and rendering/storage hot paths before proposing optimizations. Avoid wholesale rewrites, generic widget churn or CSS override layers.
- Preserve approved design identity and historical source protections. Separate an actual parity defect from an intentional accepted visual difference.

## Gates and human decisions

An audit-only document change does not require repeating all accepted physical journeys. Reuse verified evidence by exact source/tree, dependency/configuration and relevant environment identity. Add focused, non-mutating probes only for unresolved questions.

Before any subsequently authorized runtime correction: define acceptance criteria, affected dependencies and the required unit/browser/accessibility/visual suites. Security, persistence, shared infrastructure or canonical integration changes receive comprehensive validation. Preserve immutable historical sources, comparison inventories, zero-pixel thresholds and negative controls. Require new device acceptance only for materially affected behavior or genuinely uncovered assertions.

Owner decisions to surface: whether/when Foundation becomes the default preview, which parity gaps block cutover, intended boundaries for unmigrated messaging capabilities, storage migration/rollback policy, leadership permissions and care/privacy expectations, and separately authorized governance settings. No live integration or production-readiness claim follows from Gate 8 acceptance.
