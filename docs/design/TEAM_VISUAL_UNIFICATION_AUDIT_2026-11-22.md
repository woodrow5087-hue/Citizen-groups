# F-12 · Team Visual Unification — Audit and Approval Contract

**Audit date:** November 22, 2026  
**Starting checkpoint:** `rally-point/develop` at `bacab6f534654eef9e79099830c63bbe78404bab` (approved Groups F-11 / PR #94).  
**Status:** DESIGN AUDIT ONLY. This document makes no application styling, markup, logic, or build changes.  
**Reference:** [F-11 original four-screen audit (draft PR #93)](https://github.com/woodrow5087-hue/Citizen-groups/pull/93) (available in separate unmerged draft PR #93); approved Today F-09/F-10 and approved Groups F-11.

## Goal

Make Team feel like the same Rally Point application as **approved Today + newly integrated Groups**, without reducing Team's serving energy or altering a single response, schedule, message, role, coverage, or state transition.

The Team screen should answer: **"Where am I needed, and what should I do next?"**

## Current reality — source review and visual baseline

Compared the actual existing Team screenshots from the successfully tested PR #94 / PR #90 browser QA with:
- `rallypoint-team-v08.css`: Team's full red header, charcoal `main`, dark `.team-screen-v08` background, red full-bleed hero, charcoal tabs and heavy-shadowed warm cream schedule card.
- `rallypoint-premium-alive.css`: intentional premium photo-backed charcoal team-message preview and red hero styling.
- `rallypoint.js` `team()`: connected Schedule, Team chat, and authorized Leader tools, plus an honest no-membership discovery state. Serving status is `pending` / `confirmed` / `declined`, with a separate `coverage` request flag. These are fictional browser-local fixtures, **not** church attendance or actual serving data.
- `rallypoint-visual-unification.css`: F-11 Groups styles are scoped entirely to `.premium-alive.is-groups-v07`. The Team pass must have equivalent isolation.

**The main visual discontinuity:** Team jumps from Today/Groups' cream header and soft light navigation into a full-red header, charcoal page, and dark bottom dock. The serving card/hero themselves are strong; the overall application frame is the inconsistent part.

### Preserve — do not redesign
- **The red “Serve together.” hero** and Welcome Team identity. Red is important here as an intentional energetic focal point, not a full-screen blanket.
- **The serving schedule** and clear status/response flow: Confirm serving, Can't make it, coverage request/withdrawal and source-disclaimers.
- **Team chat** and the photo-backed message preview. The charcoal contrast can remain as a deliberate featured surface.
- **Authorized leader tools**, role restrictions, and the distinction between confirmed assignment and actual attendance.
- **Empty/no-team discovery** and simulated “Try the connected demo” affordance, with no implication that a real assignment was created.
- Bottom-nav destinations, keyboard focus, safe-area sizing, source data models, localStorage behavior and every existing button/action.

## Proposed visual change order (only after approval)

1. **Global Team frame only:** match Today + Groups' light cream header, charcoal Rally Point identity, white circular profile/notification actions, warm cream `main`, and light four-item bottom dock. Preserve Spotify icon visibility on light header backgrounds.
2. **Team content container:** retain same hierarchy and spacing but change the black/charcoal page canvas to cream, with suitable text contrast in the surrounding shell.
3. **Intentional red hero:** preserve full matte Citizen red for the serving hero with a subtle editorial polish on corner treatment and surrounding spacing; retain contrasting white text and the Welcome Team row.
4. **Schedule card:** warm, softly elevated cream/white, rounded cards and Today-compatible button/pill treatments; preserve red Confirm serving CTA and unmistakable current confirmed/declined/pending status.
5. **Supporting sections:** retain the photographic/dark team conversation feature, but soften excessive hard shadows and unify tab and smaller-card treatments with the approved Groups/Today language.
6. **All non-default states:** empty membership, team chat, declined + coverage requested, confirmed, and authorized leader view must remain readable and operable in the new light shell.

## Exact proposed F-12 implementation boundary (not yet approved)

Start from the **current protected Develop tip at the moment of implementation**, which includes approved F-11 Groups. **Do not** start from historic F-08/RC1 preview branches, pilot PR #92, or audit-only PR #93.

Only four allowed files:

1. **NEW** `rallypoint-team-unification.css`. Every selector must be anchored under `.premium-alive.is-team-v08` (or a more restrictive same-route variant). No global `.header`, `.bottom`, `main`, `.card`, `body`, `.tabs`, or `.brand-home` selectors. No `!important` overrides or feature-flag CSS.
2. **MODIFY** `index.html` — append exactly one final stylesheet link for the Team-only CSS; no other DOM or JS alterations.
3. **MODIFY** `scripts/build.cjs` — add exactly the Team CSS filename to the static artifact allowlist. No new runtime dependencies or API requests.
4. **NEW** `test/rallypoint-team-unification.test.cjs` — verify Team-only selector scope and baseline hashes for core Today, Groups, Read, team behavior and role/state JS; validate display/keyboard/mobile requirements and build inclusion.

No changes permitted to `rallypoint-team-v08.css`, `rallypoint.js`, `rallypoint-visual-unification.css`, any Today CSS, Teams/Groups/Read markup, images, tests from F-11, authentication, data integration, or pilot code. Preserve production `main`.

## Required QA gates before visual review

- `npm test` and `npm run build`, full repository Playwright mobile/accessibility/navigation test pipeline and Groups/Team storage and messaging regression.
- Real before/after screen captures at **320, 390 and 430 px**, including connected Team schedule, Team chat, declined with/without coverage, confirmed, unassigned/no team, and authorized leader tools.
- Validate all touch targets and focus indication, sticky bottom dock, safe areas, text contrast, no clipped long labels and reduced-motion behavior.
- **Frozen comparator screenshots**: approved Today F-09/F-10, merged Groups F-11, Read, and Blank Battle should remain visually unchanged. Any change outside Team is an automatic stop.
- Verify source files/PR diff: only the exact four approved files; `rally-point/develop` untouched until explicit owner merge approval.
- Produce a **draft PR** with mobile screenshots and any fixes resulting from accessibility failures. No auto-merge; never deploy to production `main`.

## Risks to test explicitly

- Spotify source asset is a white glyph; if changing to a pale circular button, apply a Team-scoped dark filter so it never becomes invisible (learned from Groups F-11).
- Caption and badge contrast can fall below accessibility thresholds on blush/cream at 320 px; test `team-v08-kicker`, the small location/team labels, role/status pills, and empty state copy.
- Chat photographic card should retain clear readable message preview copy on its overlay.
- Status differentiation is behavioral, not merely color: preserve the existing words and pressed actions for confirmed, declined, pending and coverage cases.
- The group-only stylesheet must not be modified, and the new Team stylesheet must not leak selectors to Groups, Today or Read.

## Approval checkpoint

**Proposed next step:** approve this F-12 **Team-only four-file contract**. Only then implement in a new isolated branch with screenshots + QA, followed by separate merge approval. After Team is merged, perform Read audit and follow the same sequence.

This document is the entire deliverable of the present audit. No production or pilot work authorized.
