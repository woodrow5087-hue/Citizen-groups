# Rally Companion 1.0 · RC1-B/C review

RC1 brings the approved Rally Point: Alive Today screen and Ask Rally into one fixture-based flow. A contextual entry opens the existing sheet. Ask Rally helps a viewer make sense of what needs a response, asks for clarification when needed, and offers a separate tap to save a sample RSVP or serving response. Groups, Team and Read remain the destinations for the full workflows. [Source and action contracts](../architecture/RALLY_COMPANION_1_0_CONTRACTS.md) · [Milestone #79](https://github.com/woodrow5087-hue/Citizen-groups/issues/79)

## Open the review

Open the Netlify Deploy Preview from the pull request with this query.

```text
?rc1=1&sampleWeek=1&skipWelcome=1&ntl-drawer-state=hidden
```

The labeled sample week starts November 23, 2026. It includes the Wednesday Group on November 25 at 6:30 p.m. Mountain Time at North Commons and Sunday Welcome Team on November 29 at 9 a.m. Mountain Time at North Campus. This fixed clock keeps those fictional occurrences reviewable on any day. Remove `sampleWeek=1` to exercise the current clock and see the unavailable date state once the occurrences pass. Use **Demo controls** to select memberships or change the fixture role.

The review branch is `rally-point/rc1-bc-integrated-companion-v1`. Its comparison base is `rally-point/rc1-a-authorized-source-v1` at `6d99538d2c47ead78dc05ce9c414390364db2005`. [RC1-A review](https://github.com/woodrow5087-hue/Citizen-groups/pull/84)

## Journey checklist

| Journey | Expected behavior | Evidence to inspect |
| --- | --- | --- |
| J1 · New visitor | Select no group or team membership and ask “Where do I start?” Explore Groups, Team or Read. Discovery leaves membership and responses alone. Private notes, locations and rosters stay outside the reply. | Browser visitor case, policy scope tests and `visitor-390.png`. |
| J2 · Wednesday Group | Ask to get ready for Wednesday, then “What time?” and “Where?” The reply includes the dated sample gathering, the saved RSVP and the modern unread status. One deliberate RSVP tap saves Going and offers the existing gathering route. Closing and reopening clears the conversation while keeping the saved response. | Browser group case, UI persistence tests, policy receipt tests and `group-saved-390.png`. |
| J3 · Serving | Ask “What do I need for Sunday?” Review the sample shift and status. Typing agreement leaves the response alone. A confirm tap saves the pending response and offers schedule review. Confirmed and declined shifts have no duplicate confirmation control. | Browser serving case, policy action tests and `serve-saved-390.png`. |
| J4 · Caught up | As a member, save both responses, open the group conversation, then ask “Am I all caught up?” The reply acknowledges completed responsibilities. Scripture stays optional. Unavailable read status gets an uncertainty message. | Browser caught-up and unavailable-source cases and `caught-up-390.png`. |
| J5 · Group leader or scope revoked | Ask about leader tasks while authorized and see an aggregate count with a route to existing leader tools. Switch role or lose group membership and reopen. The prior subject grants no private facts or actions. | Browser role/scope case, policy denial tests and `leader-390.png`. |
| J6 · Uncertainty and interruption | Ask about both commitments, an unsupported topic or next week. Clarify the subject and verify that later dates are unavailable. Close or navigate from the sheet to clear its context. Block storage and check that the preview avoids false save confirmations and false reassurance. | Browser interruption cases, UI tests, policy uncertainty tests and `uncertain-390.png`. |

Check `companion/results.json` and the named screenshots in the pull request's `rally-point-preview-qa` artifact once the run completes. The capture set includes Today and Ask Rally at 320, 390 and 430 CSS pixels. [Policy tests](../../test/companion-journeys.test.cjs) · [JSDOM interaction tests](../../test/rallypoint.test.cjs) · [Playwright check](../../scripts/companion-browser-check.mjs)

For local verification, start with `npm run verify:companion`. The full review runs `npm test`, `npm run build` and the browser suites for Today, onboarding, Groups, chat, Scripture and games. The responsive browser checks include keyboard focus and axe coverage. Confirm the final build and review status on the pull request.

## Review limits

Profiles, venues, dates, message counts and the leader aggregate come from fictional data. This release uses deterministic phrase handling and browser-local saves. A modern conversation cursor can be unavailable, and a one-off date can expire. The sample week is a presentation and testing aid, and the direct confirmation is a local fixture action. Physical iPhone Safari and VoiceOver remain manual review steps.

F-10.4 covers similar post-confirmation wording in its separate opt-in preview. Its eventual integration has its own approval decision and should reuse the RC1 receipt and dated-source rules described in the architecture. [F-10.4 review](https://github.com/woodrow5087-hue/Citizen-groups/pull/78)
