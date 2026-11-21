# Output 1 — Rally Point Current Application & Architecture Map
**Foundation audit · November 21, 2026**  
**Read-only assessment. No application source, production deployment, or protected visual baseline altered.**

## 1. Verified source identities

| Artifact | Exact source | Status / role |
|---|---|---|
| Canonical functional working app examined | \`rally-point/companion-sunday-to-week-v03\` · \`01cce2801a15565d34b042304758ed73d9877449\` | Draft [PR #58](https://github.com/woodrow5087-hue/Citizen-groups/pull/58); functional app, demo state |
| Approved Premium ALIVE v0.1 checkpoint | \`e1b347528526aec62309d58774c712e52c56dbf8\` | Protected immutable visual/working reference, *not* the current app head |
| Governing visual design decision | [FINAL_VISUAL_DIRECTION_v1.md](https://github.com/woodrow5087-hue/Citizen-groups/blob/rally-point/design-lock-2026-11-21/docs/design-lock/FINAL_VISUAL_DIRECTION_v1.md) | Primary red/black four-phone visual direction + selected ALIVE personality |
| Future-state interactive lab | \`rally-point/future-state-consulting-demo-2026-11-21\` · \`eace4b617e08165341f8da5a06dd2c21965f4159\` | Draft [PR #60](https://github.com/woodrow5087-hue/Citizen-groups/pull/60), \`/future-state-lab.html\`; independent concept |
| Default branch | \`main\` | Different/older foundation. **Do not equate with v0.3 or merge preview bridge PRs.** |
| Review-only Netlify | [v0.3](https://deploy-preview-59--citizen-connect-test.netlify.app/?skipWelcome=1) · [future-state lab](https://deploy-preview-61--citizen-connect-test.netlify.app/future-state-lab.html) | Neither represents a production backend |
| Existing pilot gate | \`config/rallypoint-v10-readiness.json\` | \`"status":"blocked"\`, all live-pilot gates pending |

## 2. Actual source map

- \`index.html\` — branded phone shell; header/profile controls; \`<main id="view">\`, \`<nav id="nav">\`, onboarding portal and toast/dialog roots; loads **12 linked CSS files** and global scripts.
- \`rallypoint.js\` — **594 lines / ~55.9 kB** central controller; fixture defaults and local save, Today/Groups/Team/Read/Play render templates, navigation, dialog system, click/form/keydown listeners, and actions for group messages, direct messages, attendance, schedules, Scripture and companion state.
- \`rallypoint-today.js\` — event/date aggregation from fictional group and team state, attention indicators, unread signature, role-preview check-in suggestion. Hard-coded Wednesday 6:30 PM and Sunday 9 AM sample recurrence.
- \`rallypoint-premium-alive.js\` — people story rail, photo-led Today hero, contextual care suggestion, Scripture intention editor/follow-up HTML.
- \`rallypoint-ui.js\` — shared SVG icons and visual illustrations.
- \`rallypoint-memorize.js\`, \`rallypoint-verseplay-ui.js\`, \`blank-battle.js\` — memorization and local puzzle mechanics; Blank Battle mounted in a shadow root.
- \`rallypoint-welcome.js\` — local-demo onboarding/profile experience; the UI explicitly says no real accounts.
- CSS progression: \`rallypoint.css\` → \`rallypoint-phase1.css\` → \`rallypoint-welcome.css\` → \`rallypoint-today-fluid.css\` → \`rallypoint-dashboard-v06.css\` → \`rallypoint-groups-v07.css\` → \`rallypoint-team-v08.css\` → \`rallypoint-read-v09.css\` → \`rallypoint-verseplay.css\` → \`rallypoint-studio-finish-v07.css\` → \`rallypoint-unified-v08.css\` → \`rallypoint-premium-alive.css\`. These are ordered overrides, not yet one component token system.
- \`scripts/build.cjs\` — copies HTML/JS/CSS/assets/docs into \`dist\`; syntax-checks JS with \`vm.Script\`. \`netlify.toml\` publishes \`dist\`.
- \`test/*.test.cjs\` — **9** Node test files, including regression coverage for the current app, onboarding, memorization, premium design, pilot blockers and archived prototypes.
- Playwright browser scripts — \`scripts/phase1-browser-check.mjs\`, \`onboarding-browser-check.mjs\`, \`blank-battle-browser-check.mjs\`.
- \`.github/workflows/rally-point-preview-qa.yml\` — npm install, unit tests, static build, Chromium + axe, onboarding and Blank Battle browser checks, 7-day screenshot artifacts. Currently responds to PRs targeting \`main\` and pushes to \`rally-point/v10-pilot-readiness\`; does **not** directly run as a PR gate for the v0.3 canonical branch.

## 3. Working screen and flow inventory

| UI / route | Working implementation | Current data source | Readiness |
|---|---|---|---|
| Today | Greeting, photo hero, people rail, companion suggestion, Up Next, team action, reading, notifications | Local fixture \`rallypoint-today.js\` + \`rallypoint.js\` | Demo functional |
| Groups / My People | Discovery, story rail, member list, group conversation, direct messages, gathering RSVP, prayer, leader-only panel | Arrays and flags in browser state | Demo functional |
| My Team | Schedule, sample confirm/decline, coverage request, team messages; role-preview controls | Browser state and hardcoded shift | Demo functional |
| Read / VersePlay | Scripture excerpts, reflection, memorization, Blank Battle, optional local daily intention | Static passages + locally persisted progress | Demo functional |
| Leader Care | Sample attendance/check-in buttons and reviewed-state flags | Browser-selectable \`role\` and fixture membership | **Not secure authorization** |
| Notifications | Local attention dialog based on message-array signature and schedule state | Browser fixture | **Not push or real inbox** |
| Onboarding | Animated greeting and demo profile controls | Browser fixture | **Not login** |

## 4. Data & integration reality

**Existing browser keys:** \`rallypoint-phase1-2026\` contains roles, messages, RSVP/shift status, leader actions, reading and companion values. \`rallypoint-today-ui-v1\` contains name, group/team fixture flags and a group seen-signature.

- The current route-level \`canLead()\` checks only local state. This is **appropriate for a labeled demo**, never a server permission boundary.
- Messages have author label, sample relative time and text; no immutable IDs, server timestamps, per-user read cursor, delivery result, cross-device sync or membership authority.
- RSVP, prayer/read, and team response are single local flags; they are not keyed to a real scheduled event or day.
- The current application does **not** make real messaging, Planning Center, Church Center or notification-service calls.
- The pilot gate already correctly states that live identity, permissions, integrations, messaging safeguards, publishing rights, incident response and pilot acceptance are not approved.

## 5. Separate future-state lab

\`future-state-lab.html\` is a **~262 kB standalone HTML artifact** with inline CSS/JS and **8 embedded image assets**. It demonstrates bubbles, local send/reply/reactions, contextual actions, notifications, role-switched Leader Care, and home/people/team/read screens with its own \`rp-future-lab-01\` browser-local state. It does not import into \`index.html\`, and is not a reusable component library. PR #60 adds it as an additional build output while leaving the main app route intact.

## 6. As-built schematic

\`\`\`mermaid
flowchart TD
    A["index.html · branded phone shell"] --> B["rallypoint.js · controller / routing / templates"]
    B --> C["Today · Groups · Team · Read · Play"]
    B --> D["rallypoint-today.js · fixture aggregation"]
    B --> E["rallypoint-premium-alive.js · visual/companion HTML"]
    B --> F["VersePlay + Blank Battle modules"]
    B --> G[("localStorage · two demo keys")]
    H["12 layered CSS files"] --> A
    I["Netlify: npm build → dist"] --> A
    J["future-state-lab.html · separate concept"] --> K[("rp-future-lab-01 · local only")]
    I --> J
    L["Church Center / Planning Center / actual messaging"] -. "NOT CONNECTED" .-> B
\`\`\`

## 7. Intended ownership boundary (not yet built)

- **UI:** screen and reusable conversation components, with approved brand tokens.
- **Local UI state:** drafts, navigation, animations and previews.
- **Authoritative records:** verified user, group/team membership, conversation/message IDs, server time, schedule records and human-owned care tasks.
- **Data adapters:** a mock provider now; a specifically authorized provider in a later phase.
- **Companion engine:** a pure, explainable selection function consuming permitted facts; it does not infer spiritual or emotional status.
- **Permissions:** enforced by a service and data store, never a browser role toggle.

### Inspection limit
This is a source/configuration and existing-test-artifact audit, not an independent penetration test, backend load test, real-device Safari study, or fresh authorized live Planning Center test. Existing passing CI verifies prototype flows, not production security.
