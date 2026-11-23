# Rally One · Groups 2.0 — implementation and acceptance

**Source:** owner-approved premium charcoal mockup and six user-supplied photographs (Dustin, Mandy, Garrett, Nick, Aiden, Dom). Uses existing Citizen flag asset and approved #108 graphite visual language. Starts from #108 head `ee9d9f8a2447d41b000ced801ec4f2b701f0901d`.

## Scope
- New **connected member Groups overview** with large horizontally scrolling portrait rings, one Wednesday Group identity card, one Connect shortcut, gathering/RSVP, prayer & care and discreet People/Explore/Leader navigation.
- Portrait asset `assets/rally-one/groups-v2-people.webp` is a compact 6-frame crop of the **user's original photos**, without image generation. Git blob integrity SHA `829546ab1f3cb4e50d78afdbb2fad250e54b0776`. CSS shows each tile with a purposeful mint ring; "My group" has a Citizen-red ring. No fictitious online/presence/story indicator.
- Tapping a user-supplied portrait opens an **honest demo photo profile**, clearly marked as **not connected to a real member account**. It does not falsely deliver a DM to that person. Existing fictional local messaging contacts remain in an optional disclosure under People and in Connect.
- **Conversation** invokes the existing authorized `openConnect('thread')` via `data-go="group" data-pane="chat"`. No duplicate chat UI, storage, read marker, or membership source introduced.
- **This week** uses existing fixture gathering and RSVP. **Prayer & care** enters existing group prayer pane and uses the saved local request list. Existing People/discovery/leader panes remain reachable.
- Guest/no membership goes directly to existing discovery. Role-gated Leader tools remain role gated. Core Today, Connect, Team, Read, welcome, and other source files are untouched beyond the narrowly scoped Groups routing seam in `rallypoint.js`.
- Preserve app's approved Citizen flag + Rally One wordmark header, dock and four primary tabs.

## Deliberate data limits
All fixture group activity is demo-only. These six supplied photos identify examples in the demo rail, **not verified connected accounts**. Do not infer attendance, prayers, online presence, affiliation or a message relationship from the photos. Public preview may be accessible by link; obtain permission from pictured people before any public pilot/marketing/production use. Remove images before wider distribution if permissions are not established.

## Review checklist
1. Connected member / 390px: rail shows "My group" + six exact portraits, scrolls horizontally and never shrinks faces into tiny circles. No oversized old hero/duplicated pulse board.
2. Portrait: tap each profile, verify exact image, back to overview; no fabricated direct messaging.
3. Wednesday Group hero: opens existing People/detail view; profile gallery and optional legacy fictional demo contacts are available.
4. Conversation: takes user directly into existing Connect Wednesday conversation, supports replies/drafts/reactions, Back returns to Groups without losing state.
5. This Week: opens gathering/RSVP, saved choice updates overview; Prayer & care opens existing prayer actions; Explore and member directory remain reachable.
6. Leader: relevant tools shown only when `canLead('group')` is true. Guest: no portrait rail or member-only conversation, only discovery.
7. 320px, 390px, 430px: no horizontal overflow except intended portrait rail; visible focus, 44px targets, axe WCAG AA, reduced-motion support, screenshot comparison. Physical iPhone Safari/VoiceOver acceptance is still a manual gate.

## Change-control
All changes live in the **draft preview branch/PR only**. Do not merge to `rally-point/develop` or `main` without explicit owner approval. Previously preserved `rally-one/checkpoints/2026-11-22-connect-alive-v1` and PR #108 remain unchanged.

## Next step
After the owner validates the layout and actual photo placement on iPhone, save a named **Groups 2.0 checkpoint** and then proceed to Companion Connection Flows without restarting the visual design.
