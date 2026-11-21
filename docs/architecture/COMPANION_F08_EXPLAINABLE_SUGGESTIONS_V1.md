# Companion F-08 — Explainable, source-backed personalization v1

**Status:** Draft review slice targeting `rally-point/develop` only; **no production deployment**.  
**Naming note:** This is the **companion product phase** called F-08 in the November 21 conversation. It does **not** replace or redefine the earlier **F-08 non-destructive storage protection** milestone. Both remain in force.

## Product promise

The Today companion advances from a hardcoded sequence to a small, explainable suggestion policy: **one relevant next step, grounded in existing fictional activity, with an explicit reason and a voluntary option to defer.** This is deterministic client-side prioritization, *not AI inference, predictive analytics, notification delivery, or actual church member engagement monitoring*. The design stays inside the existing approved Premium ALIVE cream card with matte bright Citizen red, dark charcoal and preserved four-tab shell, visual hierarchy, and profile rail.

## Inputs and source of truth

| Source | Allowed use | Guardrail |
| --- | --- | --- |
| Explicit sample group prayer from Marcus | Optional check-in suggestion | Existing named fictional note only; no content classification or sentiment/welfare inference, and no access without sample group membership |
| Existing team schedule response | Review outstanding sample serving availability | Does not confirm a shift, notify anyone, or treat an app open as serving |
| F-02 modern Wednesday conversation `peek` | Suggest catching up on *actual sent/unread* count | Shared per-user read cursor only. No legacy array/signature receipt, no counting own/pending messages |
| Versioned modern conversation unavailable | Suggest reviewing saved local thread | Never claim unread=0; never rewrite corrupt snapshot |
| Existing saved Scripture follow-through | Surface a due personal intention | Uses explicit timestamp/choice and existing complete/defer controls; never automatically completes |
| Existing sample Wednesday RSVP | Suggest answering if blank | No new RSVP store or provider submission |
| Existing local Read/prayer flags | Offer voluntary next step | Never imply spiritual maturity or performance based on completion |
| Fixture group membership | Offer People or discovery | No private group details exposed to nonmembers |

This policy runs through `rallypoint-companion-decision.js`, whose exported `choose({state,ui,conversation,now})` is a **pure function**: it returns a stable `id`, source explanation, action and destination, never changes localStorage or sends a network request. `rallypoint-premium-alive.js` renders that result within the existing Today companion card. `rallypoint.js` supplies the same modern conversation projection already used by Today and Groups.

## Priority and behavior

1. Explicitly saved sample Marcus prayer note, if the user has sample group access and has not already checked in or snoozed it.
2. Unanswered serving response for a sample member of the Welcome Team.
3. Modern Wednesday conversation unread sent messages (same cursor as F-06 and F-07).
4. Modern conversation error/recovery prompt (not a fabricated all-caught-up).
5. An explicitly saved Scripture intention once its follow-up date arrives.
6. Unanswered sample Wednesday group RSVP.
7. Uncompleted local daily Scripture or prayer action.
8. General low-pressure invitation to People, group discovery, or reading.

**Rationale:** The existing card now has a concise `WHY THIS?` line tied to the actual fictional source. It does not need a second inbox or invent new church activity.

**Agency:** In addition to the earlier optional Marcus check-in snooze, any normal actionable prompt has **Not right now · show another idea**. This stores a 24-hour deferral by stable suggestion ID within the existing primary fixture's `companionChoices.snoozedUntil` object, using the already-reviewed primary storage journal. It **does not** send a message, mark a thread read, mark prayer complete, confirm a shift, or change RSVP. Expiration brings the same suggestion back if the source still warrants it. The final supportive fallback is not deceptively labeled a task and cannot be deferred.

**Privacy and consent:** This app is still a sample local-only prototype. No real account identity, church-owned member data, direct-message consent, leader/minder inference, or AI automation is wired up. There are no background scheduled tasks or push notifications. Only sample group members can see group-specific suggestions. The earlier legacy group archive remains intact, writable, and unmigrated.

## Verification
- [ ] `npm test` covers pure ranking, read state, privacy, malformed/unsupported modern messages, snooze expiry and existing feature retention.
- [ ] `npm run build` verifies the policy is included in `dist`.
- [ ] `npm run test:browser` checks accessible phone render at 320–1280 px; a full sample modern-unread → defer → RSVP → People journey; archive untouched.
- [ ] Existing onboarding, Blank Battle, F-03/F-04/F-08 legacy storage guard, standalone Wednesday chat, Groups integration and WCAG checks stay green.
- [ ] Netlify Deploy Preview succeeds and owner reviews on a physical iPhone.
- [ ] Merge into Develop only after explicit owner signoff. Keep `main` / production unchanged.

## Deliberately deferred
Real recommendation ranking experiments, account preferences, role-linked access control, production server-side validation, church data connectors, opt-in notification policy, moderation and minor safeguards all require church-owned governance and a separate approved integration phase. We cannot claim this client-side prototype secures personal care information.
