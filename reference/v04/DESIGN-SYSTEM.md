# Citizen Groups — UI system v0.4

**Status:** Unofficial internal design exploration, not a production product or endorsed Citizen Church app. Citizen flag logo asset is supplied by the user as a visual reference and requires church permission for distribution.

## Product thesis

A small-group app that helps people notice, encourage and connect with the people in their own group. Make one next action unmistakable; never frame spiritual growth as a competitive performance metric. App-first, not a mobile church website.

## Identity principles

- Citizen's **actual flag** is the sole brand mark in the interface. Do not invent seals, alternate C logos, mountains, crosses, brushstroke textures or illustrated member portraits.
- Nearly black canvas and quiet charcoal surfaces, **hot-rod red** used on primary actions, active states, subtle borders and small status accents. Off-white text, muted gray metadata.
- Crisp, restrained, decidedly human product design: natural language, generous tap targets, a consistent icon family, proper empty/success/error states, and intentional spacing.
- Real approved community photography may be added later only with consent; for now, use **initial avatars** rather than made-up people.
- All names, posts, gatherings and dates are fictitious in the reference implementation.

## Tokens

| Token | Value | Usage |
|---|---|---|
| `--bg` | `#08090C` | App canvas |
| `--surface` | `#111318` | Standard cards |
| `--surface-2` | `#191B21` | Elevated interactive surfaces |
| `--surface-3` | `#22252B` | Selected/hover structural surfaces |
| `--line` | `#343840` | Default 1 px borders |
| `--red` | `#EF1635` | Primary actions/active nav |
| `--red-hot` | `#FB233D` | Highlights/contrast emphasis |
| `--red-soft` | `#38171F` | Very limited low-emphasis red fields |
| `--text` | `#F4F4F5` | Primary text |
| `--muted` | `#A7AAB3` | Secondary text |
| `--quiet` | `#7D828E` | Tertiary metadata; audit contrast |
| `--radius-sm` | `12px` | Controls |
| `--radius` | `18px` | Cards |
| `--radius-lg` | `24px` | Featured cards |

System font stack for stability: San Francisco → Segoe UI → Arial. Typography: headline 32–39px, section heading 18px, body 14–15px, labels 10–12px. Main canvas capped at 468px on desktop. Mobile side gutters 20px. Primary touch targets >=44px in both dimensions. Respect reduced-motion settings and iOS safe areas.

## UI kit contracts

1. **BrandHeader:** official user-supplied flag logo, wordmark, message button and avatar. Do not duplicate other brand badges.
2. **GroupHero:** one dominant dark featured card with 3px red edge, group's name, up to four initials avatars, group size and a clear arrow; tapping goes to the group's Feed.
3. **ActionTile:** three direct choices: Check in (hot-rod red), Share, Pray. Clear short labels with small supportive subtitles. Check in shows a checkmark when completed.
4. **EventCard:** compact date rail, event title, time and destination. Tapping opens My Group → Plan.
5. **PostCard:** person, time, brief text, Encourage and Reply; restrained border. Use initials, no artificial portraits.
6. **TabBar:** Today / My Group / Grow / You. Fixed bottom with safe-area padding; active tab is red. Leader administration is **not** a universal primary tab.
7. **GroupTabs:** Feed / People / Plan / Resources; one active solid-red tab. Preserve selected tab as the user navigates within My Group.
8. **ActionSheet:** accessible dialog for Check in / Share / Pray / Invite / About. Focus managed, Esc/backdrop dismiss, never store real personal details in this demo.
9. **PrimaryPill:** hot-rod red with accessible white text; **SecondaryPill:** neutral charcoal with visible border.
10. **States:** loading, empty, success, error, disabled, pressed and keyboard focus must each have intentional styles when implemented in React.

## Screen hierarchy

**Today:** greeting → group hero → three actions → next gathering → one recent group update. Show social context, not a long dashboard.

**My Group:** title + members → Feed/People/Plan/Resources → content. Feed composer at top. Plan holds RSVP and guide.

**Grow:** one Scripture reflection, short rhythm actions, no streak competition.

**You:** personal settings and summary; not a leader dashboard. Leader tools belong behind explicit role-based access in a future, separate surface.

## Interaction model in this preview

Tabs and group subtabs navigate. Check in marks local completion; Share adds a fictional example post to local feed; Pray shows a fictional request and records a local prayer moment (with an option to draft a fictional request); Encourage toggles local reaction; RSVP toggles local status. No remote calls, real group data, accounts or notifications.

## Codex migration guardrails

- Treat this HTML/CSS/JS as a **design specification and interaction reference, not new production app architecture**. Implement equivalent reusable **React + TypeScript components** in the existing repository. Preserve its Vite, tests, local storage validation, docs and Netlify preview infrastructure.
- Avoid copying the static HTML wholesale into React with `dangerouslySetInnerHTML`; avoid rebuilding the whole project.
- Keep original features (including notes and group prayer state) even if they live behind a future accessible route or modal.
- Existing PR #1 is on `development/phase-1-foundation` and targets `main`; create a separate design branch from the PR head to preserve the foundation, and a new PR to `development/phase-1-foundation`, or update the existing PR intentionally after review. **Do not merge main or deploy production automatically.**
- No real member data. No Netlify production publication before branding permission, privacy review and an authorized pilot.
- Conduct a visual comparison using actual Chromium screenshots at widths 320, 375, 390, 430 and 980px. Keep tests/build green. Check text wrapping, scroll, touch targets, focus, keyboard, contrast and reduced motion.

## Acceptance criteria

- On an iPhone-sized screen, user immediately sees their group and the three actions without searching through marketing text.
- Tab bar remains visible without obscuring content. The active tab is obvious.
- All buttons do what their labels claim; no dead controls, impossible numbers or false account/message indicators.
- Cards share the same token system; visual hierarchy relies on content, not redundant decoration.
- Functional parity with the previous React demo is preserved or explicitly noted in PR.
- Public copyright/trademark permission is not assumed from having user-supplied images.
