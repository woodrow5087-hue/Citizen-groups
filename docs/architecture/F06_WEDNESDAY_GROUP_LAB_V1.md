# Rally Point — F-06 Wednesday Group Conversation Lab v1

**Status:** Isolated implementation for owner review; not integrated into current four-tab app.  
**Branch:** `rally-point/f06-wednesday-conversation-lab-v1` → draft PR targeting `rally-point/develop`.  
**Preview route:** `/wednesday-chat-lab.html`.  
**Date:** November 21, 2026.

## Purpose

Produce the first **visible, genuinely interactive** version of the approved Wednesday Group messaging experience using the actual F-02 conversation model and mock repository. This is one intentionally narrow slice of F-06, **not** a replacement of the existing Groups tab, an actual member messaging service, or execution of F-08 browser-data migration.

The entire current app `index.html` and `rallypoint.js` are untouched; other screens, existing verse games, saved reflection data, browser storage, and onboarding continue to work exactly as before. The current app's `Today / Groups / Team / Read` navigation is unchanged. All chat participants in this lab are **fictional**. It deliberately omits pastoral care and real direct messages.

## The experience

- Strong Citizen red `#E3002B`, charcoal `#242322` and warm cream `#F3E5D6` within a premium mobile conversation experience.
- Prominent, ringed people circles and expressive editorial heading.
- Context for an illustrative John 15:12 conversation; no live sermon feed.
- Sender-aligned matte-red outgoing and cream incoming bubbles, stable IDs, real UTC fixture timestamps, date grouping, quoted replies.
- Accessible reversible `❤️`, `🙏` and `🙌` reactions, persistent drafts (including reply selection), and an adaptive sticky composer with iPhone-sized controls.
- Local `pending → sent` state and an explicit **Fail next send** simulation that demonstrates `pending → failed → retry → sent`. Retry does **not** duplicate a message.
- One fictional active group; no private-care data, actual Church Center access, server permissions, notifications or external delivery.
- Responsive 320/375/390/430-pixel mobile and desktop frames; focus styles, screen-reader labels and reduced motion.
- A clear exit back to the original app. The lab's ornamental bottom nav is not represented as functioning navigation to Team/Read: the existing app remains the active source for those screens.

## Real F-02 implementation, not a duplicate data engine

The Node-based F-02 modules `lib/conversation-contracts.cjs` and `lib/mock-conversation-repository.cjs` were merged previously via PR #65. They are the **only model/repository source** used by the lab.

The new `scripts/build-chat-lab.cjs` creates a small browser wrapper directly from the existing CommonJS source files at **build time**. It exposes `window.RallyChatDomain` **only** on the lab page. No dynamic `eval`, backend, additional third-party bundle dependency, or reimplementation of schema/reaction/reply/retry behavior is needed. The wrapper validates JavaScript syntax with Node's `vm.Script` before publication. The root app does not load or ship these APIs on its existing page.

`scripts/build.cjs` copies the lab HTML/CSS/JS and emits `dist/rallypoint-chat-domain.browser.js` as a supplemental asset. It does not modify, include scripts in, or restructure the existing `index.html`.

## Storage and identity isolation

The lab uses **only** `rallypoint-wednesday-chat-lab-v1`, with `{schemaVersion:1,snapshot,draft,replyTo}` saved using the browser's `localStorage`. That is a **new, lab-specific key**. The existing keys `rallypoint-phase1-2026` and `rallypoint-today-ui-v1` are never read or written by the lab. The earlier F-02 uncertainty-aware legacy planner remains inactive.

A malformed lab snapshot is **not overwritten**. Instead, the lab shows a notice and blocks sending until the user explicitly resets this lab key. Reset asks for confirmation and removes only the lab key. When browser storage is unavailable, the app shows an explanatory notice rather than claiming persistence.

Every user in the lab is a fabricated fixture with an explicit active mock membership, including the viewer. This **does not represent real authentication, authorization or verified church membership**; F-03 and a sanctioned backend are separate prerequisites for any live operation.

## Testing

`npm test` includes `test/chat-lab-bundle.test.cjs`, which confirms the wrapper provides the exact shared domain exports, and that the existing app has not imported the lab.

`npm run test:chat-lab` builds the preview and exercises `scripts/chat-lab-browser-check.mjs`: 320/375/390/430/1280 widths, visual screenshots, contrast/accessibility (axe), no horizontal clipping, initial messages, reaction toggles, reply/draft persistence, simulated failure and retry, exact legacy-key isolation, reset and clean browser console.

The canonical develop-targeted GitHub Actions workflow also runs the full existing unit/build/mobile/onboarding/Blank Battle suite and this additional lab regression before a successful PR review.

### Acceptance checklist

- [ ] GitHub Actions complete successfully with all existing and new tests.
- [ ] Netlify returns an actual successful **Deploy Preview** for the draft PR.
- [ ] Owner reviews **both** `/` (existing app) and `/wednesday-chat-lab.html` (new experience) on iPhone.
- [ ] New lab demonstrates reactions, replies, draft persistence, real pending/failed/sent/retry states.
- [ ] No changes to `index.html`, `rallypoint.js`, existing CSS, data migrations, protected visual references, production or `main`.

## Explicitly deferred

**Do not merge this PR or update production automatically.** Connecting the lab's conversation UI inside the canonical Groups view requires a separately scoped follow-up with an F-03 permissions review, F-04 incremental modularization and F-08 non-destructive legacy read/migration design. In particular, **do not** replace old message arrays or treat relative `Today`/`Yesterday` labels as real UTC dates. Team, direct messages, push and leader care remain excluded.

This lab is a product interaction experiment. It is not yet evidence of reliable mobile keyboard behavior across real iPhone models or VoiceOver signoff; device acceptance is a separate manual gate.
