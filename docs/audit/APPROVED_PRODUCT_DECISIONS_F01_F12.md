# Rally Point — Approved Product Decisions Register (F-01–F-12)

**Status:** All 12 **product-direction decisions approved by project sponsor** during the guided audit workshop, November 20, 2026. **Not** a claim of church-policy approval, integration feasibility, implementation completion, launch approval, or authorization to process real member data.

**Visual authority:** Rally Point **v0.8 Unified Experience**, immutable revision `84e489b86851e853948a7d4246475e83b7ddd085` ([locked snapshot PR #35](https://github.com/woodrow5087-hue/Citizen-groups/pull/35)). [Approved reference preview](https://deploy-preview-32--citizen-connect-test.netlify.app/?welcome=1). Do not change this snapshot.

**Scope:** Staff/leader demonstration with fictional data **first**, followed by a gated small real-member pilot. Any real-data integration needs church authorization, adequate controls, and technical confirmation.

| Finding | Approved decision | Staff demonstration | First real-member pilot | Follow-up / owner dependency |
|---|---|---|---|---|
| **F-01** · [#36](https://github.com/woodrow5087-hue/Citizen-groups/issues/36) | **C:** Staged identity and permissions | Fictional profiles, no real login | Verified accounts and server-enforced group/team/leader roles | Select identity integration and approve access model |
| **F-02** · [#37](https://github.com/woodrow5087-hue/Citizen-groups/issues/37) | **A:** Planning Center companion | Synthetic church records | Verified shared workflows where technically supported | Inventory Planning Center and Church Center data/actions; don't assume all APIs exist |
| **F-03** · [#38](https://github.com/woodrow5087-hue/Citizen-groups/issues/38) | **B:** Start with existing group members | Sample group discovery can be shown as demo | Do **not** require new-group joining | Complete discovery-to-joining later |
| **F-04** · [#39](https://github.com/woodrow5087-hue/Citizen-groups/issues/39) | **C:** Include serving teams with existing workflows | Sample shifts/requests | Show authorized team information; hand off unsupported actions to existing tools | Verify source links and member/assignment mapping |
| **F-05** · [#40](https://github.com/woodrow5087-hue/Citizen-groups/issues/40) | **A:** Read and VersePlay integrated | Default game to currently selected playable passage; other challenges available | Same continuity | Clear fallback for passages without a challenge |
| **F-06** · [#41](https://github.com/woodrow5087-hue/Citizen-groups/issues/41) | **C:** Full progress, streaks, badges and gamification | Passage/date-specific records, personal achievements | Persist to member account via F-07 | Forgiving streaks, private by default, no spiritual ranking |
| **F-07** · [#42](https://github.com/woodrow5087-hue/Citizen-groups/issues/42) | **C:** Local-first, cloud at real pilot | Unify local progress format; support test resets | Secure account synchronization; offline when feasible | Schema/migration/conflict policy |
| **F-08** · [#43](https://github.com/woodrow5087-hue/Citizen-groups/issues/43) | **B:** Verified schedules; existing workflow for unsupported actions | Clearly marked fixture schedule | Verified upcoming groups and serving activities only | Missing/stale/error state; authoritative updates |
| **F-09** · [#44](https://github.com/woodrow5087-hue/Citizen-groups/issues/44) | **B:** Limited human-led Leader Care | Fictional leader scenarios | Attendance context + manually managed check-ins **only if church privacy/access policy approved** | Least privilege, retention/deletion, oversight, no spiritual scoring |
| **F-10** · [#45](https://github.com/woodrow5087-hue/Citizen-groups/issues/45) | **B:** Structured two-stage usability testing | Moderated staff/leader task testing and accessibility | Moderated representative members, actual devices and accessibility | Log observations, resolve critical issues, retest |
| **F-11** · [#46](https://github.com/woodrow5087-hue/Citizen-groups/issues/46) | **B:** Protected fictional demo | Guided interactions; clear DEMO notice; complete reset | Approved storage, privacy and data handling | Church data-policy and security sign-off |
| **F-12** · [#47](https://github.com/woodrow5087-hue/Citizen-groups/issues/47) | **B:** Professional release workflow | Issue-linked branch, tests, visual checks, approvals, rollback | Staged releases and operational rollback | No automatic merge; protect baseline |

## Cross-cutting nonnegotiables

1. **Design lock:** approved v0.8 look, composition, navigation personality and visual assets are preserved. Fix actual friction narrowly, with an approved visual diff.
2. **Source of truth:** Planning Center / Church Center authoritative where supported. Rally Point manages its **own** game and devotion state, not independent shadow attendance or scheduling truth.
3. **Privacy:** member devotion/achievement data private by default. Leader care is human-led, never faith scoring, surveillance or involuntary pastoral diagnosis.
4. **Stage gates:** fictional staff demo ≠ secure live product. No real credentials, sensitive prayer requests, pastoral notes, or member data in current prototype.
5. **Evidence:** every accepted issue has measurable test outcomes. An apparent button click is not proof of delivery or a schedule write.
6. **Governance:** user approval here establishes product direction only; church leadership/security/integration owners must approve relevant real-world workflows and data policies.

## Decisions intentionally **not yet made**

- Which authentication provider and account-linking approach is permissible/available.
- Planning Center API endpoints, scopes and terms supporting read/write or direct messaging; validate with church administrators.
- Exact rollout cohort, designated ministry owner, operational support and response plan.
- Whether optional public/social achievement sharing belongs in product; not required by F-06.
- Privacy policy text, retention periods, incident management and leader access approval process.
- Dates/estimates: no schedule was approved, and technical feasibility remains to be verified.

## Decision implementation tracking

The permanent source of truth for work status is the [12 GitHub audit issues](https://github.com/woodrow5087-hue/Citizen-groups/issues?q=is%3Aissue+AUDIT+F-), not this approval table. The issues start **open**; approval of a finding is not completion. See [implementation backlog](./IMPLEMENTATION_BACKLOG.md) and [phased roadmap](./PHASED_IMPLEMENTATION_ROADMAP.md).
