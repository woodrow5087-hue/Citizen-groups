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
