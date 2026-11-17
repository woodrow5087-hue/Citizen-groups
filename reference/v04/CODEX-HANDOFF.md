# Paste into the existing Citizen Groups Codex conversation

The creative direction for Citizen Groups is now approved for **design implementation**. I am attaching `citizen-groups-design-v04.zip` containing `index.html`, `styles.css`, `app.js`, `assets/` and `DESIGN-SYSTEM.md`. Use these as the source-of-truth for **visual design, hierarchy, interaction patterns and component tokens**, not as a replacement for our React/TypeScript architecture.

Work in `woodrow5087-hue/Citizen-groups`. Preserve the Phase 1 React, TypeScript, Vite, tests and deploy preview setup already implemented on `development/phase-1-foundation` (currently in PR #1). Create a reviewable **design-system/v04** branch from the current PR head and open a PR targeting `development/phase-1-foundation`; do not merge anything or publish production.

**Deliverables**

1. Extract semantic design tokens into `src/styles/tokens.css` and create reusable components: BrandHeader, TabBar, GroupHero, ActionTile, EventCard, PostCard, GroupTabs, PrimaryPill, ActionSheet. Centralize icon sizes and control states.
2. Implement dark/charcoal UI with restrained hot-rod-red emphasis and strong contrast, matching the attached preview's **layout, spacing, hierarchy and general styling** rather than using image-generation approximations. Use Citizen's supplied flag mark only for this internal review preview; clearly mark it unofficial.
3. Implement screens Today, My Group (Feed/People/Plan/Resources), Grow and You. Keep a clean home flow: group first, Check in/Share/Pray, next event, one update. Move Leader tools out of universal member navigation but retain existing demo functionality through an explicitly labeled demo-only access route until role-based permissions are designed.
4. Preserve all existing functional demo interactions: local actions, posts, prayer acknowledgements, RSVP, discussion guide, leader followups and notes, reset, state validation and accessibility. Do not introduce accounts, database, network messaging or actual personal data.
5. Avoid AI-generated portraits, duplicate church marks, fake church artwork, mountains, generic 'church website' hero sections, oversized promotional headlines or excessive gradients/glow. Use text/initials in avatar circles.
6. Keep icons simple, consistent and hand-coded/SVG or an approved permissive icon library. Respect touch targets >=44px, focus indicators, safe-area bottom tabs and reduced motion.
7. Run `npm ci`, `npm test`, `npm run build`, Chromium mobile smoke at 320, 375, 390, 430, and 980px. Inspect screenshot hierarchy and fix overflows. Add tests for new navigation/subtabs and preserved flows.
8. Document design decisions and any known functionality differences. Provide the preview link and PR link. **Do not merge or deploy to production.**

Important: the attached prototype is not a secure multi-user app. It is solely an interface reference. Review all user-entered strings and preserve privacy-safe local behavior. No unapproved official brand usage for public release.
