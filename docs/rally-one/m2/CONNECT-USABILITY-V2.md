# Connect Usability v2 — final UI refinement before Companion integration

## Baseline and intent
Start from the immutable [Graphite + Connect Alive v1 checkpoint](https://github.com/woodrow5087-hue/Citizen-groups/tree/rally-one/checkpoints/2026-11-22-connect-alive-v1), commit `5ef463824bd248184505d6d9f2734812213231a2`.

**Product direction stays fixed:** Today, Groups, Team, Read, Connect and onboarding retain the approved November graphite/Citizen-red/parchment presentation. This is the final focused conversation-*usability* milestone, not a redesign or a new messaging backend.

## Changes
- **Scroll context:** Preserve inbox/conversation reading positions while navigating, and open a never-viewed conversation at its newest activity instead of an arbitrary first message.
- **Input safety:** Soft-keyboard Return inserts a newline rather than unexpectedly sending. Desktop Enter sends, Shift+Enter adds newline, IME composition is never submitted. Send remains an explicit visible action.
- **Draft boundaries:** Unsent direct-message text stays distinct by person for the lifetime of the open Connect session. The existing versioned Wednesday Group draft/reply owner remains unchanged and survives reopening.
- **iPhone viewport:** The parent modal reacts to `visualViewport` resize/scroll and fits within its visible area so the composer does not sit beneath the software keyboard. A compact-height stylesheet avoids stealing space from messages. On navigation, blur off-screen active composers.
- **Reply/reaction continuity:** Keep the reader's scroll position when a reaction or reply re-renders the thread.
- **Three accessibility fixes:** Correct inherited small-text contrast in the 320px Groups discovery state without altering its layout or the checkpoint branch.

## Automated verification
- Source and jsdom tests cover per-person drafts, scroll restoration, mobile/desktop Enter behavior, layout scoping and preservation of the existing data owner.
- New mobile Chromium integration covers Today → Wednesday Group → reply → reaction → draft → back → inbox → DMs → return, plus a reduced-height viewport at 320, 390 and 430 CSS pixels, and accessibility audit.
- Existing standard suite remains active, including onboarding, Groups, shared conversations, preview Today and accessibility.
- **Important:** A Chromium mobile viewport is not a real iPhone Safari software keyboard. Physical iPhone acceptance is explicitly **not complete** until the owner checks it.

## Manual iPhone acceptance
1. Open the Netlify PR preview in Safari, sign in to the fictional connected demo, and open Wednesday Group directly from Today.
2. Tap message composer, type several lines, press iOS Return: it must not send. Tap Send: one message appears. Scroll up, react to a message, then confirm you stayed near the same message.
3. Reply to a message, leave Connect, reopen: reply target and draft should still be present; cancel reply and confirm prior text is intact.
4. Move from thread back to inbox and then direct Jess and Alex conversations. Draft text for one must not jump into the other. Verify the composer remains above the iPhone keyboard and Send stays tappable.
5. Close Connect; confirm the exact origin tab (Today, Groups, Team, or Read) is restored with no extra tab or surprise route. Repeat via phone browser Back.
6. Repeat at 320px simulated viewport, short-height landscape, and larger text. Confirm no horizontal scrolling and that VoiceOver announces headings, reply buttons, Send, prayer and current tabs clearly.

## Known scope limits and next stage
The existing iframe bridge and fictional local fixtures are retained; no real messaging, delivery status, real typing/online indicators, church contact sync, or push notifications. DM draft preservation is session-only; Wednesday draft is versioned and persisted already.

After this usability checkpoint is accepted, the next milestone should be **Companion Connection Flows**: choose one end-to-end human-centered scenario connecting a Today recommendation, an authorized group conversation, a prayer response and a real next action. Validate human judgment, permission boundaries and consent before any church-system data or outbound automation.

**Preview-only. Do not merge to Develop or production without owner approval.**
