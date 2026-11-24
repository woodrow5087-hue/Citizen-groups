# Sprint 8 coordinated continuation

The project owner supplied the recovered 8B.1–8E roadmap on 2026-11-24 and
explicitly authorized sequential implementation with validation between stages.
This supersedes the missing-plan blocker in the historical recovery report.
Work stays on PR #121, `rally-one/s8-foundation-consolidation`; no merge is authorized.

## 8B.1 — verified engineering checkpoint

- Starting head: `8ef33da30b7f2c92e25f5bfc9e28e14bf56057e0`.
- Canonical `rally-one/develop` and recovery checkpoint:
  `5aa88c93c3d4cd22902ef98af98c09b74ca436ce`; starting ancestry 0 behind/11 ahead.
- Production main: `32bed048a18d7bdd7e1ebb8b420736664a2521b2`, unchanged.
- Reconfirmed successful CI runs 45298652762 and 45298652852 for the exact head.
- Existing verified acceptance: 295 app tests, 172 VersePlay tests, full automated
  browser/mobile suites, 430 VersePlay assertions, 49 image pairs with zero raw
  pixel differences. CI remediation is complete and is not being reimplemented.
- Fresh `npm ci` passed. Two consecutive static builds produced identical bytes
  across all 179 files. Existing workflow requirements and engineering guidance
  remain intact.
- Physical iPhone Safari and VoiceOver acceptance remain outstanding.

## Planned bounded changes

8B.2 audits all owners and extracts the modern-conversation access boundary.
8C adds versioned provider-neutral contracts and explicit source-quality metadata
without adding storage, live adapters, or member records. 8D consolidates Today
and Ask Rally orchestration and the shared selection policy, with role and
completion/defer matrices. 8E runs the full acceptance suite, exact visual
comparisons, source/build privacy checks, and records a new development checkpoint.
Existing presentation, navigation, and VersePlay boundaries stay protected.

## 8B.2 — modular architecture gate

Dependency/ownership audit: `s8-architecture.md`. Moved four modern cursor access
sites and the read projection to `RallyConversationRead.createAccess`; no new
storage key, model, navigation behavior or framework. The composition root retains
DOM/focus/animation effects and existing pure modules retain their owners.

Gate: 297 unit tests passed; deploy-preview build passed; Groups v2 member,
portrait-return, guest and accessibility journeys passed at 320/390/430px. The new
visual runner compared 36 screen pairs directly against immutable PR #119:
welcome, login, Today, portrait, Groups, Team, Read, Ask Rally and all four roles,
with zero raw pixel differences and no page errors. The test runner first exposed
a paused-clock welcome-exit timer; advancing the virtual clock through the real
exit resolved the instrumentation issue without changing application code.

## 8C — unified data architecture gate

Added the provider-neutral member handoff alongside the existing conversation,
action and server-only pilot contracts, not a replacement store. Nine allowlisted
domains have explicit quality, source and observation metadata; invalid/stale data
has no payload, confirmed unread zero is distinct from unknown, and permissions
restrict private projections. The pure fixture format adapter reuses the existing
member context. No identity, storage version, live integration or UI was changed.
See `s8-data-contracts.md` for ownership, adapter, migration and freshness rules.

Gate: full app suite passed (302 tests at that run); the subsequent additional
cross-role contract case also passed (6/6 contract tests). Migration/source,
privacy, malformed, stale, missing and confirmed-zero scenarios passed. Static
build passed; 36 PR #119 visual pairs remained byte-identical, with zero page
errors. Server/tool-only contract is excluded from the build allowlist.
