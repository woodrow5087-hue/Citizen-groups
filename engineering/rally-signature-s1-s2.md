# Rally Signature S1/S2 — creative implementation contract

Exact base: E3B7756470c5d4a056ec311614a55f22b1d56bfe1db / frozen draft PR159. E3B physical acceptance remains pending. This document explains implementation/evidence; `foundation2-development-program.md` remains the sole authoritative tracker.

## Art direction translated into components

The four owner-supplied boards govern shapes, proportions, composition, typography and layering. Their illustrated data, extra controls and five-item navigation examples do not override the existing product contract.

| Reference | Design characteristics carried into S1/S2 |
|---|---|
| Rally Signature / Concept07 | Architectural charcoal masthead, selective serif, decisive diagonal red actions, layered priorities, compact agenda and a black/red Ask Rally action |
| Human Connection | Overlapping photographic circles, integrated person/utility controls, asymmetric editorial/photo seams, explicit RSVP and community disclosure |
| Component Library | Ivory stack layers, expressive dates, integrated agenda rows, a state-derived All Set marker and reusable action/selector primitives |
| Design System | Warm ivory/charcoal/Rally red tokens, slanted split actions, circular utilities, segmented selections and four-destination floating navigation |

`signature-components.js` is pure escaped markup: icon, heading, angled action, stack, date badge and completion. Its trusted stack slot accepts only renderer-owned escaped markup. Actions reject event/style attributes and external URLs. Cut geometry belongs to decorative paint, preserving complete hit areas/focus rings. `signature.css` owns scoped component tokens and states; `signature-today.css` owns the bounded Today composition. No new engine, router or storage owner exists.

Signature red is **#DF272B**, matching the explicit palette on the design-system board. Small labels on red use pure white for contrast; warm ivory remains the surface. Existing approved Manrope supplies functional typography. Locally hosted, OFL-licensed Fraunces supplies selective editorial display; license/source/SHA256 are under `foundation2/signature-assets/`. Existing approved Citizen photos are used; no photo was extracted from a concept board or private Studio13 source.

## Working Today contract

The existing `FoundationMemberSession.decision(...).view` supplies every fact. Today preserves the primary/secondary actions, dated schedule, leader review disclosure, profile, optional messages/reading, unavailable/deferred/provider states and truthful calm condition. It does not manufacture a percentage, attendance, presence, audio feature or reading obligation.

Existing selectors/actions remain: `.greeting h1`, `article.priority`, `.responsibility`, `.coming/.schedule .event`, `data-command`, `data-person`, `data-route` and return-focus IDs. Existing motion consumes the same successful-save/real-transition receipts. The new Ask entry delegates to the original member-panel owner and restores its own focus. Portraits are upgraded by the original relational owner; the circular People control delegates to that same owner. The native community disclosure preserves all existing actions.

Signature shell/header/navigation is active only while Today is active. Groups, Team, Connect and Read retain E3B; a bounded before/after comparison at320/390 verifies those eight destination scenes at zero raw differing pixels. This is scope evidence, not an approved Foundation reference or clearance of historical failures. Four primary tabs remain Today/Groups/Team/Read; Connect remains the existing header route. Gallery is never a fifth destination.

## Isolated interactive gallery

Direct document: `/foundation2/signature-gallery.html`. All specimen interactions are ephemeral and clearly fictional. RSVP/commitment selections drive only the specimen's derived completion; month/week navigation, selectors, stack examples, portrait dialogs and disclosure use no application state. Native Storage instrumentation verifies no reads, writes, removals, clearing or key enumeration. Reload resets specimens. The gallery provides accessible normal/pressed/disabled/busy/retry/confirmation states, keyboard controls, minimum touch targets and reduced motion.

## Validation and evidence

Existing tests/assertions, protected files, inventories and zero-pixel thresholds are retained. Additive component tests cover escaping, URL/attribute validation, dates, decorative semantics and contradictory completion. Additive Chromium/genuine WebKit journeys cover320/375/390/430, short screens,200% text, real Today responses→dated persisted All Set, optional unread, roles/provider/unknown state, focus, gallery interactions/Storage isolation and axe/page errors.

Development findings were corrected before candidate freeze: selected labels on new Rally red needed white for contrast; WebKit200% agenda/status/community/nav content needed intrinsic reflow rather than clipping; provider/Ask notices needed dark text on ivory. Visual review also required enlarged navigation to reflow into two rows rather than split words, the Today display to retain an ink backing over photography, and enlarged priority copy to consume the decorative photo column so Welcome stays whole. Normal-size navigation remains four across. Raw development failures remain distinct from final validation. No protected comparison was weakened and no historical SVG investigation occurred.

`scripts/signature-review-capture.mjs` creates nine matched current-E3B/implemented Today pairs, gallery captures, actual Today/gallery motion recordings, PDF/HTML and manifests using a fixed Nov26 noonUTC/America-Denver clock and actual local actions. It accepts exact owner-board files through `SIGNATURE_REFERENCE_DIR`; those originals are copied unchanged into the private review package, never into public runtime. When unavailable, the reference column explicitly says so and shows the mapping above; it does not generate or approximate a board. Downloadable originals were requested because the conversation images are visible to the assistant but no image bytes/file IDs were exposed in this workspace. `--references-only` can complete that media column without a runtime change or CI rerun.

## Creative/physical review gate

Review actual shapes, sculptural layering, type/photography balance, density, action/nav character and fidelity/originality against all four supplied boards. Review real member, leader, visitor, volunteer, unavailable/deferred and All Set states, plus the interactive gallery and recordings. Target physical Safari/VoiceOver, larger text, keyboard/focus and reduced motion for the changed Today/gallery surfaces. E3B message-scroll physical verification remains a separate pending gate; unchanged completed checks need no blanket repeat.

Stop after S1/S2 for owner creative acceptance before Groups/Team/Connect/Read rollout. Final E4 showcase approval remains owner-reserved. Canonical/main, older PRs, recovery refs, protected references and accepted evidence remain unchanged. Earlier canonical/2D failures and deferred153 reliability remain promotion blockers. No live data, credentials, external messages, migration, merge/default cutover, protection change or production deployment.
