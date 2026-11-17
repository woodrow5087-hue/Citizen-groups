# Reviewable development roadmap

## Phase 1 — local foundation (implemented)

1. Preserve the supplied source in `reference/`; audit features and limits.
2. Retain existing screens and styling in React/TypeScript; separate fixtures, persistence and reusable UI.
3. Add validated local state, errors, accessible dialog/forms/navigation and regression checks.
4. Verify production build and browser smoke; document Netlify setup. Stop before new product features.

Review the current interface and audit before expanding the product. Official assets are excluded from build output and church-name use remains provisional.

## Phase 2 — design and product validation

Agree group lifecycle, roles, consent, prayer visibility/retention, moderation, accessibility targets and support ownership. Obtain authorized brand assets or approve an independent identity. Review 320px to desktop layouts, touch targets, contrast, screen readers and keyboard journeys. Add URL navigation only if approved. The four screens already have separate typed modules; split dialog forms and state actions into feature folders as their behavior grows.

Exit: accepted design, role/visibility matrix, data-retention policy and prioritized user stories. Keep fixtures until these are agreed.

## Phase 3 — Supabase integration (future, separately authorized)

Introduce a repository interface for groups, posts, prayers and care actions, with local and Supabase adapters under `src/services/`. Keep display components independent of SDK calls. Model memberships and group roles explicitly; design and test row-level security before connecting UI to real data. Add authentication, consent and access-denied/session-expiry flows. Private prayer/care data requires explicit authorization rules, not client-side hiding. Never place service-role keys in Vite/client environment variables. Review whether leader notes should be stored at all.

Exit: isolated test environment with fictional fixtures, reviewed migrations, security/permission integration tests, deletion and recovery paths. No member data until approved.

## Phase 4 — controlled pilot and deployment

Use Netlify deploy previews and automated test/build checks. Validate CSP/response headers, authorized domains, secrets configuration, privacy notices, incident/support ownership, backups and restore procedures. Pilot with an agreed small cohort, explicit consent and feedback. Add observability without recording sensitive text. Assess performance, accessibility and operational readiness before release.

Each phase requires its own scope review. No invitation delivery, notifications, analytics, real authentication or database is part of this first phase.
