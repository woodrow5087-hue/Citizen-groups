# Rally Point — Future-State Consulting Demo (Netlify Preview)

**Source:** Exact self-contained HTML concept delivered in the November 21, 2026 fictional consultancy presentation.

**Route:** `/future-state-lab.html` inside a review-only Netlify Deploy Preview.

**Scope:** Non-destructive static preview only. The existing Rally Point application stays at `/`; future-state concept is a separate lab route. It is not a production backend or an upgrade of the active working app.

**What works in the standalone concept:** Today and My People navigation, conversation bubbles, local fictional message sending, group replies/reactions, team action demo, notifications, Scripture follow-through, campus selection and role-switched Leader Care demo. Illustrative graphics are embedded directly inside the HTML.

**What does NOT work with live church systems:** No login/identity, real-time synchronized messages, member lookup, Planning Center/Church Center integration, push notifications, server-side role checking, actual attendance/leader tasks or production message delivery. Everything remains fictional, local, and browser-only. No real person should enter confidential or private prayer information in the lab.

**Required next steps before production:**
- Authentication and server-side authorization.
- Messaging backend with group/team membership enforcement.
- Verify church-approved system integrations.
- Privacy, minors, record retention and pastoral review policies.
- Operational monitoring, accessibility and security assessment.
- Real-world authorized pilot testing.

**Deployment control:** Branch `rally-point/future-state-consulting-demo-2026-11-21` is deliberately separate. Do not merge its main-targeted preview-bridge PR. Do not replace existing `index.html`, protected references, or Netlify production.
