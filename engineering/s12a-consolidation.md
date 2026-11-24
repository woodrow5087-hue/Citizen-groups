# Sprint 12A — consolidation and controlled pilot planning

## Acceptance and merge ledger

Canonical base: `199a4a4db417ac3e3f43932a1a6328eb4631e808`.
Owner attests all eight physical-device categories passed for PR #143 at
`05f1a900ca57b6c3a655963ded22ccc596f8042d`. That acceptance does not cover newer code.
Investigation found the standalone Verse Circuit brand was a noninteractive div;
its arcade Back actions never returned to Rally One. The correction makes the
existing brand a native, keyboard-focusable, named home link without changing
its appearance, gameplay, storage or history. Direct entry and reload work without
requiring browser Back. Automated regression now exercises keyboard activation.

Merge remains conditional on exact-head CI, preview provenance and renewed device
acceptance of the correction. Do not merge or claim a new canonical checkpoint
until those conditions pass. After authorized merge, record its actual SHA and
create an annotated tag `rally-one/checkpoints/2026-11-24-s12a-accepted` at that SHA
only if absent; never move an existing reference. Record tag target and merged
preview provenance in the PR handoff. A preview of the feature SHA is not evidence
of deploying the merge SHA. Production and all existing recovery refs stay fixed.

## Consolidated source of truth

- `s11a-authentication-architecture.md`: synthetic issuer/session/mapping boundary.
- `s11b-planning-center-integration.md`: minimized mapped Groups provider contract.
- `s11c-privacy-consent-security.md`: explicit purpose, consent, withdrawal and restrictions.
- `s11d-integration-resilience.md`: bounded retries, outage/freshness and isolation.
- `s11e-restricted-pilot-readiness.md`: fictional loopback lab, review protocol,
  stop/revoke/reset, operational and leadership HOLD gates.
- `qa-today-clock-remediation.md`: exact CI/provenance history and device checklist.
- `s8-architecture.md`, `s8-data-contracts.md`, `s8-intelligence.md`: application ownership.

These documents describe synthetic engineering evidence, not production approval.
No live credentials, member records, provider connection or real enrollment exists.
The loopback lab must never be packaged into public static output or exposed by tunnel.

## Current architecture and debt

Static allowlisted build; ordered deferred browser scripts; composition root and
existing navigation/focus controllers; guarded local profile/application state;
versioned conversation repository/read cursor; shared canonical context and
Today/Ask deterministic intelligence; independent VersePlay engine/content/storage/
rendering/sound. Server-only pilot modules compose synthetic auth, consent,
provider normalization and resilience. No browser profile confers real authorization.

Debt: oversized composition/rendering modules, ordered-global load coupling,
legacy archive coexistence, remaining direct persistence boundaries and clock/
initialization assumptions in browser fixtures. Extract only proven seams with
behavioral tests; no framework rewrite or new state owner. Dependencies include
Node >=22.12, npm lockfile, Playwright Chromium, axe, jsdom, pixelmatch/pngjs,
Netlify preview hosting and external Google Fonts. Comparison input controls do
not remove the product's external font dependency. Track action-runtime deprecation
warnings separately without changing release gates opportunistically.

## Prioritized 12B–12E proposal — planning only

| Stage | Smallest intended deliverable | Mandatory gate |
| --- | --- | --- |
| 12B | Leadership-approved pilot purpose, adult eligibility, scope, notice/retention, accountable operational and safeguarding owners; independent threat review plan | Written decisions, minimized data inventory, abuse cases and explicit implementation authorization |
| 12C | Approved server identity/session/consent and member-mapping design; deployment/isolation/deletion design before implementation | Security review, deny-by-default contract tests, consent withdrawal/isolation and expiry tests; no live access without separate approval |
| 12D | Approved provider adapter and operational resilience implementation proposal, evidence freshness and bounded failure handling | Synthetic interoperability, outage/empty/stale/malformed distinction, wrong-tenant rejection, incident/rollback rehearsal; separate least-privilege credential authorization |
| 12E | Controlled pilot go/no-go package, staff training, accessibility/device evidence and support/incident readiness | All automated suites and immutable visual comparison, exact-commit preview provenance, physical Safari/VoiceOver, independent security review and leadership written pilot authorization |

For every implementation milestone: inspect existing owners, narrow commit,
applicable unit/integration tests, full release browser/mobile/VersePlay suites,
zero unapproved visual differences, documentation and device acceptance for changed
journeys. A failed gate blocks continuation. No 12B–12E implementation is authorized.

## Leadership decisions and production HOLD

Citizen Church must name accountable product, privacy/security, pastoral safeguarding
and incident owners; approve audience/eligibility, exact purpose and permitted fields,
consent wording/withdrawal, retention/deletion/backups, participant support, success/
stop criteria and final pilot authority. Confirm content and asset rights. Technical
owners must resolve independently reviewed real identity/JWKS/session security,
TLS/BFF/CSRF, distributed rate limits, verified provider permissions/pagination,
durable consent/session deletion, monitoring without sensitive logs and recovery.
Synthetic tests do not prove those controls or real API interoperability.

Next action: revalidate the corrected VersePlay return path on physical iPhone
Safari and VoiceOver at its exact deployed commit, then satisfy the authorized
merge/checkpoint conditions. Do not advance to 12B implementation.
