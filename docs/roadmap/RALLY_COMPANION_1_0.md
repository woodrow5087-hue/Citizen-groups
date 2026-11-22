# Rally Companion 1.0 · Integrated Development Blueprint

**Tracking issue:** [#79](https://github.com/woodrow5087-hue/Citizen-groups/issues/79)  
**Kickoff base:** `rally-point/develop` at `a5f0e16526608f722d41ef6370c3ce1e28d11723` (F-10.3 completed)  
**Preceding feature:** [F-10.4 PR #78](https://github.com/woodrow5087-hue/Citizen-groups/pull/78) is **separately under review**; never assume its merge is approved.  
**Integration:** review PRs into Develop only with explicit owner approval. `main` is a separately approved production boundary.

## Product promise
**“Rally helps me know what matters, feel connected, and follow through—without making me search through five unrelated menus.”**

A companion, not a church website. Website, Church Center, sermon recaps, existing community messages, event content and photos supply supporting context only; they are not the product's primary navigation or daily value.

### Definition of a successful integrated milestone
A mobile member can naturally move through **context → understanding → choice → confirmed action → thoughtful next step** within Today + Ask Rally. They can switch subjects, decline, stop or leave with no unwanted action. The app responds honestly to what is known, unknown, optional and already completed.

## User journeys that must work end to end

### J1 · New here / not connected yet
- Enter Today as an unjoined fixture account and ask “I’m new. Where should I start?”
- See optional introductions to community, serving exploration and Scripture with no pressure and no hidden personal data.
- Explore a group without being marked as enrolled; have the option to stop.
- No unsolicited group message, prayer, saved membership, or manufactured “overdue” item.

### J2 · Current Wednesday Group member
- “Help me get ready for Wednesday” opens authorized fixture time/place, RSVP and modern unread state (only when source available).
- “What time?” and “Where?” retain correct current subject within the session.
- One explicit RSVP click changes local fixture state and yields an updated confirmation with the actual known gathering details and optional route to Groups.
- After close/reopen, in-memory history is forgotten. Current saved RSVP is still reflected; private prior turns aren't.

### J3 · Sunday serving member
- “What should I know before I serve?” shows only the assigned, current sample shift and pending/confirmed/declined response.
- A pending response can be confirmed *only* by tapping its guarded action; no text agreement or automatic action.
- A confirmed or declined response never generates a duplicate confirmation CTA.
- Follow-through offers optional schedule/location review, not a new obligation or auto-navigation.

### J4 · Everything handled
- “Am I all caught up?” correctly distinguishes required, optional and unknown items using current authoritative state.
- Do not push Scripture, attendance, prayer or engagement “for completion” and do not invent a new task to maintain activity.
- Do not show falsely reassuring confirmation when a required source is unavailable.

### J5 · Leader-scope and membership revocation
- A scoped group leader sees only existing authorized check-ins in the current model.
- A guest or revoked member cannot access private message details, attendance lists, other people's needs, group locations restricted by membership, or action controls—even if a previous conversational subject referred to those.
- Session and role changes clear inherited context. Source revalidation is mandatory.

### J6 · Unknown future and interruptions
- Ask about “next week” with only a one-off fixture; no fabricated recurring date or time.
- Mixed Wednesday and Sunday questions clarify instead of guessing.
- Switch subject, reopen, reload, encounter unavailable conversation source, or operate with blocked storage; app remains truthful and responsive.

## Workstreams (larger batches; small commits)

| Lane | Main owner files | Deliverables | Depends on |
| --- | --- | --- | --- |
| **A. Authorized source projection** | New pure source adapter + tests; no global UI | Normalized `ViewerContext`, `AuthorizedFacts`, availability state, provenance and a non-mutating fixture adapter | Existing F-09/F-10 contracts |
| **B. Intent, goals and action policy** | `rallypoint-personal-companion.js` and focused tests | Clear follow-up/intent/goal interfaces, ambiguity handling, action proposal policy and receipt-aware continuation | A |
| **C. Integrated Today/Ask Rally UX** | `rallypoint.js`, small scoped CSS, JSDOM and Playwright | One coherent journey, explicit confirmation, graceful “you can stop”, source-backed follow-through | B |
| **D. Operational hardening** | Independent docs, test fixtures, QA scripts | Permission matrix, automated scenario coverage, accessibility, branch/release and API-readiness specifications | Parallel to A; full gate after C |

### Parallel work that is actually safe
- A + D can work concurrently with **disjoint files**.
- B starts after A contract is fixed.
- C can prototype from agreed mock contract but should merge only after B passes.
- Do not have multiple agents write `rallypoint.js` or `rallypoint-personal-companion.js` concurrently.
- F-10.4 may be integrated into the milestone **only if separately approved and merged into Develop**. Otherwise preserve it as an independent comparator and build against the stable F-10.3 base.

## Suggested milestone PR boundaries
1. **RC1-A: Source and policy contracts** — fixture source adapter, authorization tests, action semantics, characterization tests. Mostly pure modules, no visual redesign.
2. **RC1-B: Cohesive user journeys** — J1–J4 and bounded turn context using the new adapter, reusing existing guarded actions. Real app behavior, not a document-only feature.
3. **RC1-C: Interaction polish and release gate** — J5–J6, reviewable integrated UX with regression coverage, keyboard/VoiceOver considerations, final mobile screenshots. F-10.4 integration only after its explicit approval.
4. **RC1-Review: One milestone demo** — consolidated PR/preview and evidence. Present the whole journey, not a sequence of tiny feature previews.

Each PR can contain several commits and multiple tightly coupled features; only complete, independently testable slices are requested for review. The owner signs off on meaningful milestone UX, not routine test fixes.

## Architectural principles
Read [companion contracts](../architecture/RALLY_COMPANION_1_0_CONTRACTS.md) before altering the conversation engine.

- **Strict source boundary:** A source snapshot is built from existing authorized models; a text prompt selects an intent, never grants a permission or creates a fact.
- **Observe before action:** Every suggested mutation is a proposal; a deliberate user click and current-context revalidation are required for action.
- **Truthful follow-through:** An action receipt must derive from the action actually committed, then reread the model to generate any follow-up.
- **Session-scoped conversational state:** Keep bounded, ephemeral context; never write transcripts or private topic memory to persistent storage.
- **No dependency trap:** Do not introduce new backend, API keys, production integrations, commercial AI inference, storage migration or frameworks in this milestone.
- **Future-ready adapters:** Define identity, consent and data provenance interfaces now. Real integrations require independent review and security measures later.

## Visual contract
Preserve **Rally Point: Alive**: rich charcoal header, welcoming cream background, matte bright Citizen red, lively but not cartoony contrasting contextual sections, bold editorial type, circular people rail and approved role-aware Today / Groups / Team / Read. Avoid dull white boxes, duplicate “today” content, generic dashboard widgets and a fifth tab.

Any change beyond modest companion interaction refinements requires a new reviewed screenshot comparison to the approved reference designs.

## Validation strategy
**Fast per-commit loop**
```sh
npm ci
npm run test:companion
npm run build
```
**Full milestone verification**
```sh
npm test
npm run build
npm run test:browser
npm run test:onboarding
npm run test:blank-battle
npm run test:groups-safety
npm run test:chat-lab
npm run test:groups-integrated
```
Follow the repo's GitHub Actions and Netlify preview checks; no green badge for an in-progress run. Include a Playwright scenario matrix at 320, 390 and 430 pixels, axe A/AA, focus restoration, rejected state-changing text, permission-denied, missing source, pending/confirmed/declined, stored state unchanged unless explicitly clicked, and saved state round-trip tests.

**Acceptance evidence**: for J1–J6 give `scenario | expected | observed | test reference | screenshot/preview`, list any not implemented honestly.

## Out of scope / next gates
- Real church account and permissions, Church Center/Citizen website or email integrations, live mobile notifications, real prayer or leader communications, server-side persistence, analytics/marketing data, AI-assisted text inference with external processors.
- These require a separate architecture review for consent, tenancy, identity, least privilege, auditing and retention, as well as church leadership approval. A local fixture prototype is not a real multiuser product.

## Milestone checkpoint rule
Do not merge any RC1 or F-10.4 changes into `rally-point/develop` without explicit owner approval. Production `main` remains untouched. The outcome isn't “many commits,” but **one complete, reliable, delightful community-companion experience**.