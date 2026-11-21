# Output 2 — Current App vs. Approved Future-State Design: Gap Matrix
**Foundation audit · November 21, 2026 · Design comparison, not new implementation approval**

## Source of truth

- **Primary visual reference:** Owner-approved four-phone Premium Hybrid red/charcoal/cream design; see [locked final visual direction](https://github.com/woodrow5087-hue/Citizen-groups/blob/rally-point/design-lock-2026-11-21/docs/design-lock/FINAL_VISUAL_DIRECTION_v1.md).
- **Secondary visual influence:** ALIVE colored-ring *Your People* circles and restrained editorial personality.
- **As-built app:** \`rally-point/companion-sunday-to-week-v03\` at \`01cce2801a15565d34b042304758ed73d9877449\`.
- **Future experience target:** [standalone future-state lab](https://deploy-preview-61--citizen-connect-test.netlify.app/future-state-lab.html), the exact consulting-firm HTML at PR #60.
- Screens reviewed from actual mobile captures: v0.3 Today, Group, Team, Leader Care; future-state Today, People, Chat, Team, Read, Leader Care. This is a **qualitative design audit**, not a pixel-diff claim.

## Executive visual verdict

**Preserve** the Premium Hybrid matte Citizen red, deep charcoal mass, warm cream panels, Citizen flag, compact four-tab navigation, energetic typography, and colored circular people profiles. The future-state lab makes conversations and contextual action cards more cohesive, but its strong opening hero still occupies much of the first mobile viewport. Neither existing design should be wholesale copied over the other.

## Screen-by-screen comparison

| Surface | v0.3 current app | Future-state concept | Specific gap | Decision |
|---|---|---|---|---|
| Today first viewport | Branded header + red greeting, large photo hero, circular people strip; companion card starts near viewport bottom | More compelling premium red hero and story strip; still hero-dominant | Meaningful user-specific next action is not fully visible without scrolling | **Refine hierarchy within approved shell**, not a redesign. One relevant action should be visible at 390×844 |
| People rail | Horizontal photo circles with ring colors, fictional direct-message navigation | Refined profile rhythm and stronger contextual group summary | In v0.3 member identifiers, photo fixtures and destination identities are tied to local constants; UI is not driven by a stable member model | Preserve circles exactly; later supply authorized, consented member data |
| Group conversation | A flat local list of \`.message\` rows plus large textarea/post button | Cream incoming/red outgoing bubbles, sender alignment, reactions, inline reply and sticky composer | Current app lacks shared message primitives, IDs, reply/reaction data, keyboard-scrolling contract and status model | **Highest near-term UI/engineering design target** |
| Direct message | Opens locally with fictional recipient, flat samples and one composer | Conversation visual treatment reusable across contexts | Distinct current template risks duplicate UI and inconsistent behavior | Use one Conversation component; distinguish access rules by conversation type |
| Team channel | Sample schedule, coverage and list-based team chat | Dark team update + contextual coverage/shift action in conversation | A shift/coverage action currently manipulates browser flags and a chat array; no stable event or completion protocol | Separate action cards from messages; preserve red/cream/dark Team identity |
| Read / VersePlay | Strong existing local game/reading/reflection and v0.3 intention | Cleaner passage/intent relationship; visually cohesive red lead | Current Read front-loads game content; daily intention is deep below it. Reading state is a lasting boolean labeled "today" | Preserve games; simplify path to the daily reading and date-scope completion |
| Leader Care | Local role toggle, attendance and reviewed flags; red-led design | Polished private task list and review actions with sensitive-status labels | No verified identity, provenance, task ownership, privacy consent, or server check | Preserve layout *concept*; stop before real-person data |
| Notifications | Modal derived from message signature + pending shift; no real notifications | More expressive fictional notification hub / contextual prompts | No notification identity, preferences, read state, deep-link delivery, quiet hours or secure body rules | Defer live delivery; formalize event/preference interface first |
| Navigation / shell | Four tabs Today / Groups / Team / Read, Leader Care gated inside Groups | Same four destinations with People wording, role-switched leader screen | Consistency of display labels and leader entry point requires explicit information architecture decision | Keep route IDs, use approved labels consistently; Leader Care **not** an unapproved public fifth tab |
| Messaging micro-interactions | Little visual feedback beyond local saved toast and changed card | More expressive reaction/reply patterns | Need predictable reduced-motion, error, retry, focus and feedback behavior | Prototype one thread deeply before cloning across other screens |

## Contrast and hierarchy principles to lock

1. **Shell:** Structural red/charcoal mass must remain strong; avoid turning Today/Team into mostly cream pages.
2. **People:** Individual faces lead; campuses, sermons and announcements never replace them as the primary story row.
3. **Messages:** Incoming cream / outgoing matte Citizen red; people names, time and contextual action cards distinguish meaning, not decorative badges everywhere.
4. **Typography:** Manrope for functional hierarchy; occasional selective italic, only when it improves emphasis and is readable.
5. **Navigation:** Four recognizable tabs, touch-friendly interaction, working screen-reader labels and keyboard state.
6. **No website clone:** Real sermon and campus materials are supporting context; do not form the principal navigation/feed.
7. **Trust:** A fictional role, prayer note, shift or completed action may never be visually passed off as a real synchronized record.

## Proposed messaging visual system (component target)

- \`ConversationHeader\`: verified group/team/DM title, participant count only when authorized, mute/preferences.
- \`MessageBubble\`: shared components with author identity, body, timestamp, delivery state, optional reply preview; align based on sender id.
- \`ReactionBar\`: keyboard and touch-accessible reaction chips tied to stable message ID.
- \`QuotedReply\`: contextual link to the original message, appropriate deleted-message fallback.
- \`MessageComposer\`: safe-area/keyboard handling, multiline input, draft persistence, send disabled when empty, visible pending/failure/retry states.
- \`ContextualActionCard\`: team shift / coverage / gathering / Scripture follow-up, separately authenticated and reconciled with authoritative sources.
- \`ConversationListRow\`: unread count from per-user cursor, meaningful preview, optional quiet status.

The future-state HTML is **a specification/example of these interactions**, not their reusable implementation.

## Prototype acceptance test for first messaging slice

A single fictional Wednesday Group thread will be visually and functionally accepted only when:

- App shell/circles/palette match the protected reference at 320, 375, 390, 430px mobile.
- Long message and 3-line composer work on an actual phone with the keyboard open.
- User can send, receive a locally simulated response, reply to a specific message, add/remove a reaction, and reopen thread with state intact.
- Messages carry unique IDs, timestamps, status and reply references even in mock storage.
- The UI displays sender/timestamp and delivery state accessibly, respects reduced motion, and never sends to actual people.
- Automated and screenshot regression confirms Team, Read, Leader Care and local storage have not changed unintentionally.

## UX judgment

We do **not** need another color/style exploration. The biggest design return now comes from **one outstanding messaging experience** plus improving Today’s first-viewport action hierarchy. The original red-and-black chassis remains the non-negotiable visual contract.
