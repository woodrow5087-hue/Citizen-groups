# v0.4 design implementation

## Source and scope

Read the supplied CODEX-HANDOFF.md and DESIGN-SYSTEM.md before implementation; inspected the HTML/CSS/JS and Today/My Group screenshots. The documents are archived in `reference/v04/`. Branched `design-system/v04` from `development/phase-1-foundation` at `ecdd279`. This is an implementation of that approved reference, not a new design concept or architecture replacement.

The approved tokens live in `src/styles/tokens.css`. Shared React components implement the supplied hierarchy, 468px shell, 20px gutters, charcoal cards, group hero with red edge and supplied flag watermark, compact initials avatars, red/dark action tiles, date rail, post cards, group tabs, primary/secondary pills and safe-area navigation. Sheet focus containment, restore-on-close, Escape/backdrop dismissal and background inertness retain the Phase 1 implementation. User text remains React text, never injected HTML.

## Navigation and retained functionality

| Entry | Behavior |
| --- | --- |
| Today hero / Go to feed | Opens My Group → Feed |
| Today event / See details | Opens My Group → Plan |
| Check in | Original local connect completion sheet |
| Share / Grow Reflect | Original validated local post composer |
| Pray / You Prayer circle | All example and locally saved requests, acknowledgements, prayer-time completion and request composer |
| My Group | Feed, People, Plan, Resources; subtab retained in session; arrow/Home/End keyboard support |
| Plan | Persisted RSVP and original discussion guide |
| Post Encourage | Reversible local reaction, shared between Today and Feed |
| Reply | Explains unavailable threaded replies; offers standalone Share, never claims delivery |
| People Encourage | Opens check-in; no fake message delivery |
| Grow | Scripture reflection and existing daily rhythm actions |
| You | Local activity summary, About, prayer circle, confirmed reset, demo-only Leader access |
| Leader | Preserved fictional follow-ups, guide and notes; reachable through You, with Back to You |

The existing storage key and fields remain. Optional `encouraged` defaults to an empty array when older saves load, is runtime-validated, and is capped at 14. Reaction identity is based on post content or sample ID so prepending a post does not shift reactions onto unrelated posts; identical local post text shares an encouragement state. No new service, database, login or messaging code is included.

## Intentional differences from static prototype

- Header says UNOFFICIAL. No unread notification dot because the demo has no messages. The message control explains its empty state.
- All prayers remain separate from conversation, preserving existing private-to-device semantics. The Pray sheet exposes the complete example/local circle rather than one hard-coded request.
- No invented reaction total. Encouraged/Encourage clearly indicates only local state. Acknowledging one request twice does not inflate counters.
- You uses **My activity** with accurately scoped labels rather than pretending local daily/total values are weekly analytics.
- Existing 12-item caps, 600-character posts, 400-character prayer requests and 2500-character notes remain rather than importing the standalone prototype's smaller limits.
- Metadata is lightened and red control backgrounds slightly deepened where small white text requires greater contrast. Original token red remains `#EF1635`; accessible action red is `#DF1231` and the bright end of selected gradients is `#E21937`.
- Reference touch targets of 40–43px are raised to 44px; narrow-phone tile subtitles may wrap rather than overflow. Reduced motion, visible focus and 16px input text are retained. No loading/skeleton state is shown for synchronous local operations.
- Supplied flag is the only mark, bundled for internal review only. No generated portraits, external imagery or replacement church artwork.

## Verification and limits

`npm ci`, eleven Vitest/Testing Library checks, strict TypeScript and production Vite build pass. Tests retain storage corruption/failure/date rollover, escaped text, RSVP/post persistence, form validation, sheet keyboard/focus behavior and confirmed reset; add storage upgrade/reactions, four-section navigation, group subtab keyboard/persistence, daily rhythm, prayer acknowledgement and demo-only leader notes/follow-ups.

Chromium production-build checks at 320, 375, 390, 430 and 980px cover all four screens, all four group panels and Leader. No document horizontal overflow, no runtime page errors, and all visible buttons measure at least 44×44px. Browser flows exercise check-in, share, requests, acknowledgements, reactions, reply explanation, RSVP, guide, subtab retention, follow-ups, notes and reload persistence. Today/My Group screenshots were compared against the supplied references; Leader and narrow layouts were also inspected. Screen navigation focuses main without scrolling the compact header away.

Netlify preview is built from the new PR; production publication and merging are excluded. Automated browser/device emulation does not replace iPhone Safari/VoiceOver review. Full accessibility and long-form content review remain manual checks. localStorage remains unencrypted, origin-specific and last-writer-wins across tabs. The flag is not licensed for public use; church approval and an authorized pilot remain required.

## Review on iPhone

Open the PR's Netlify preview (sign into Netlify if protection is enabled). Check Today → group, each subtab, a local post, prayer acknowledgement, Plan RSVP/guide, Grow, You → Leader notes, and reload. Inspect safe-area navigation, text enlargement, sheet keyboard interaction and scrolling at the bottom. Enter fictional data only.
