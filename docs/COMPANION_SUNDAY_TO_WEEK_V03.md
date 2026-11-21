# Rally Point — Sunday → Midweek Follow-Through · Companion v0.3
**Date:** November 21, 2026  
**Status:** Draft product slice, preview-only; no production merger or real-member integration.

## Product hypothesis

Rally Point should help members carry a meaningful Scripture reflection into ordinary life, rather than making the church's sermon feed more attractive. Make the loop *Read → choose one action → gently revisit tomorrow → explicitly complete*, not a streak or social scoring feature.

## Approved visual chassis (unchanged)
- Pinned source: Companion v0.2 `741787ffff9f58a50b844e110e97b9055e1550ef`.
- Originally locked Premium ALIVE Hybrid v0.1 `e1b347528526aec62309d58774c712e52c56dbf8`.
- Red/black four-screen Premium Hybrid is still the primary template; ALIVE people circles remain the signature element.
- Four bottom tabs, original role-gated Leader Care, group conversation, serving and VersePlay routes unchanged.
- Only scoped portions of the existing warm Read reflection and Today companion card are enhanced.

## End-to-end fictional experience

1. Read: A short `Take it into the week` section appears under the existing reading question. The current selected sample passage (John 15, James, or Psalm 23) provides context.
2. Choose: Optionally enter a single 160-character **non-sensitive** action. Example: `Encourage someone in my group.`
3. Save: The intention is stored with its passage and due **next local calendar day** in the existing browser-local Rally Point state. No remote writes, notifications, email, SMS, or third-party API.
4. Remember: The existing cream Today companion card quietly shows the saved action with the passage reference. The current care/serving suggestion stays intact.
5. Revisit: On a later app open after the next local day starts, the intention is actionable with **I did it** or **Tomorrow instead**. Nothing is auto-completed.
6. Complete: The user explicitly marks it completed; the next visit remembers the action. The user can return to Read to start another intention, edit, or clear it.

## Safeguards
- The entire experience is fictional, local and unsynchronized. Local browser storage is not a protected space for sensitive personal or pastoral notes.
- No user tracking, inference about church attendance, automated spiritual judgment, streaks or pressure.
- User-entered text is HTML escaped before rendering. Existing messages and group/serving data are not altered.
- Current app visual components, navigation and storage key are preserved.

## QA
- Tests for saving, deferral, user-triggered completion, reload, escaping, and absence of side-effects on original local data.
- Full mobile Playwright QA at 320, 375, 390, 430 widths and desk, plus accessible interaction and existing tests.
- Deterministic test clock verifies a next-day return and explicitly completed state.

## Scope control
Draft canonical PR targets the **v0.2 development branch** so reviewers can inspect only this feature. A separate draft PR may target main *only* to trigger Netlify/Actions; it is a **preview bridge, never merge**. No production deployment or new user data source approved.
