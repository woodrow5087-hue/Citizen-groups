# Rally One — Groups 2.0 design and navigation contract
**Status:** design-only, pending visual review. No production/interface changes.
**Baseline:** exact working graphite + Connect Usability v2 PR #108, SHA `ee9d9f8a2447d41b000ced801ec4f2b701f0901d`.
**Visual anchor:** the owner-supplied screenshot from the earlier `deploy-preview-52` iteration showing a charcoal background, “Your people ✳”, horizontally scrolling large portrait circles with colored rings, and “My group” in first position. Preserve the familiar social warmth without copying an Instagram Story product model.

## Governing product distinction
**Today:** What matters to me today? Personalized companion and next actions.
**Groups:** Where do I belong, who are my people, and what are we doing together?
**Connect:** The actual conversation surface; one source of truth for messages/drafts/reactions/read cursor.
**Team:** Where am I serving?
**Read:** Scripture learning and engagement.

Leadership's key question (Nov 19): “Once someone is in, how do we pastor them? Take care of them?” Groups should support belonging, not become a second inbox or digital events bulletin.

## Connected-member screen — single clear hierarchy (mobile 390x844 first)
1. **Compact heading and people rail** on graphite (#222120), with “Your people ✳”, a modest Wednesday Group label, and horizontal edge-to-edge portrait rings. First ring is “My group” (Citizen red). Sample member portraits use mint/other purposeful accent rings, **not fabricated online/unread/story status**. Preserve accessible names, 44px minimum tap targets, keyboard/VoiceOver traversal and horizontal swiping. Existing `RallyHybrid.peopleRail(...,'group')` is the source of this UI; move/recompose it, **do not duplicate** it.
2. **Primary group identity + next meaningful action** in one premium matte Citizen-red/graphite widget, clearly titled “Wednesday Group” (fixture name), member count and next fixture gathering status. Show one useful action/state drawn from the existing model (unread conversation, RSVP, prayer/care). Avoid a static inspirational banner as the primary feature. “Open group” should lead to the group details or correct current primary action rather than an invented destination.
3. **Two compact supporting widgets**, not four competing grid cards:
   - **Conversation:** messages/unread count from the existing `RallyConversationRead` projection, opens the **existing Connect Wednesday Group thread**, not a second chat owner.
   - **Next gathering:** localized sample time + current RSVP, opens existing `groupPane='gather'` controls, no fabricated external event source.
4. **Prayer & care row:** concise, calm and actionable; opens existing `groupPane='prayer'` with its actual local fixture and allowed actions. Make it prominent but not another dominating hero.
5. **Details / explore / leader tools** as secondary actions: People directory, Explore more groups, and role-gated Leader tools remain reachable. Do not delete their behavior or hide them without an alternate reachable route.

### Information architecture
- **Groups home is an overview**, not the whole full-length conversation by default. The existing `group()` currently mounts: oversized `.group-community-hero`, `RallyHybrid.peopleRail`, `RallyHybrid.groupSummary`, `connectedGroup()` pulse with four tiles, `tabs()`, and the `groupPane` body. This causes the repeated, flat layout the owner disliked.
- Consolidate overlapping summaries into a **single group home**; remove *visual duplication*, not data/features. Preserve existing `groupPane` details for gathering, prayer, people, and leader actions.
- People portrait taps: honor existing fixture permissions. Jess and Anna can open existing authorized Connect direct demo; other fixture people may open the existing local group-directory/direct fixture where no matching Connect persona exists. **Never claim real contact or direct messaging where there is only local sample data.**
- My group ring: opens Connect Wednesday Group or group overview explicitly; pick one consistent behavior and label it correctly.
- Conversation widget: opens existing Connect Wednesday Group via the already established parent `openConnect('thread')` path, keeping read marker, drafts, replies, reactions, and navigation.
- Returning from Connect must restore Groups tab and viewport/focus; switching Groups detail views must preserve existing state/permissions and back behavior.
- Leader tools remain gated by existing `canLead('group')`; not visible to nonleaders.
- **Guest/no membership** continues to show `groupBrowse()`/discovery; do not display private people rail or faux group chats. Interest is local-only and must not imply joining.

## Visual direction / constraints
- Keep graphite canvas, neutral premium raised panels, purposeful Citizen red, parchment contrast, bold editorial text and existing dark tab dock from approved #104–#108.
- Use the real existing portrait rail styles as a basis; restore the screenshot's visual strength without oversized circles that consume the entire first viewport. Make the top 390px phone composition immediately communicate **people + belonging + next action**.
- Reduce large empty title/hero area. No generic white corporate cards, excessive glass effects, novelty emoji badges, artificial status indicators or “AI slop”.
- Respect actual 320px, 390px, 430px layouts, safe areas, reduced motion, text enlargement, visible focus and WCAG AA label contrast.
- Do not change Today, Connect, Team, Read, onboarding, message repository, schema, storage, app-wide navigation or production.

## Implementation sequence and gates
**Gate A — approve visual layout before integration:** Create a faithful high-fidelity 390x844 Groups screen mockup using the live approved #108 styles/available fixtures, not invented church members. Inspect the existing connected and guest states. The design must preserve the portrait circles at the top.
**Gate B — isolated implementation:** Work in a new branch based on #108, with a dedicated `rally-one-groups-v2.css` and a narrowly scoped Groups markup/view adapter. Do not rewrite `rallypoint.js` wholesale. If core `group()` must change, document exact seam and rebaseline only intentional source-fingerprint guards. Preserve the existing message/contact permissions.
**Gate C — Netlify phone preview:** New draft PR targeting `rally-point/develop` for preview only; never merge to Develop/main without owner approval. Inspect connected (unread, caught up), guest/discover, and leader profile at 320/390/430px.
**Gate D — functional acceptance:** My group and person taps; Conversation -> correct existing thread -> back to Groups; gathering RSVP; prayer; people directory; Explore more groups; leader permissions; all four tab states; screenshots; axe; Safari/VoiceOver. No broken, misleading or decorative-only controls.

## Acceptance question
When a connected member opens Groups for the first time, **can they identify their people, tell what matters with their group, and take one meaningful action in under a glance?** If yes, stop polishing the layout and proceed toward Companion Connection Flows.
