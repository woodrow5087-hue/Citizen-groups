# Foundation 2.0 — Gate 8 visual fixture reconciliation

Status: correction authorized; final acceptance and canonical promotion remain on HOLD.
Scope: PR #151, `rally-one/foundation-2` → `rally-one/develop` only.

## Recovery and change boundary

The owner authorized this narrowly scoped correction after the read-only investigation of
`e7a6e752a07eede2052b2ae4082b420277bd0f9a`. The annotated recovery tag
`rally-one/checkpoints/2026-11-26-f2-gate8-pre-correction` preserves that exact commit.
No existing recovery reference is moved. Application code, styling, assets, engines,
storage, navigation, Foundation 2 source, workflows and lockfile are unchanged.

Only the standalone strict WebKit visual fixture at 390×844, 200% text, direct-message
state normalizes `#direct-input` scroll offsets. It requires the existing focused
`Jess draft` fixture and 32px root text. It checks zero scroll offsets and unchanged
content, selection, focus, font size, scroll dimensions and rectangle immediately
after normalization and after capture. It does not blur, resize or edit the textarea.
All original functional/accessibility assertions still run. New negative controls reject
scroll drift and mutations to each preserved fixture property.

The approved `bb8f2446a71221148587f09bdf8192d5bde57d83` source manifest (10 files),
86-frame Connect comparison inventory, older historical references/source protections,
and zero-raw-pixel comparison requirements remain unchanged. The same fixture runs on
both immutable reference and candidate builds; no reference pixels or result-dependent
adjustments are used to select the pose.

## Root cause and controlled evidence

Protected QA run `45766945368`, attempt 1, failed only
`standalone/390-844-large-direct.png`: 1,431 raw pixels (637 non-AA, 794 AA), confined
to the draft glyphs at x26–170/y789–813. Attempt 2 passed all 86 pairs at the same head.
The native textarea has 66px client height and 68px scroll height after existing
autosizing. WebKit 27.2 can retain scrollTop 0 or 2 after focusing/filling the draft.
The glyphs are identical and displaced vertically by 2px; font faces/metrics are loaded
and identical. Waiting longer retains either pose, so timeout changes do not address it.

Before correction, 12 fresh local browser runs (six immutable reference, six candidate)
produced both poses. Four causal controls (two per source) set scrollTop 0→2→0:
each 0→2 produced exactly 1,431 differing pixels and each restored 0→0 produced zero.
Both source trees reproduce the behavior in one environment. This isolates native
textarea scroll pose, rather than an application, font-loading or deployment regression.
The two CI attempts used different Ubuntu image revisions; that may influence frequency
but is not necessary to reproduce the issue.

After correction, 12 fresh WebKit 27.2 runs alternate the two source builds and deliberately
start at both 0 and 2. Every normalized capture and later repeat has zero raw differences
from the first capture. Draft, selection, focus and geometry verification passes throughout.
All 186 files of the protected preview build are byte-identical to the pre-correction build.
Local Node is v24; CI's locked Node 22/browser environment remains an independent required gate.

## Official physical journeys and acceptance reconciliation

The authoritative three journeys are the visitor/group/team blocks in
`scripts/foundation2-browser-check.mjs`, with Gate 8's acceptance contract in
`engineering/foundation2-development-program.md`:

1. **Visitor discovery and Read/game return:** Visitor has no response commands;
   Today → Explore groups stays in Foundation; Safari Back restores the origin's focus.
   Today → Read → Jump to VersePlay reveals its heading above fixed navigation.
   Classic → Back to Read restores launch focus and scroll. Safari Forward/Back and
   return to Today preserve the intended route/focus. Check enlarged text/Reduce Motion.
2. **Group conversation return and RSVP consistency:** Group member has RSVP but no
   serving response. Today → Connect → Safari Back restores the message control.
   Groups → conversation → Back to Groups restores origin focus/scroll. Save Maybe in
   Groups; Today shows the same RSVP. Verify VoiceOver names and focus order.
3. **Volunteer decline, coverage and Today consistency:** Volunteer has serving response
   but no RSVP. Team → Can’t make it places coverage immediately after that assignment.
   Request sample coverage gives confirmation. Today becomes All Set with no serving
   response; Team retains the request. Verify VoiceOver, scrolling and fixed-nav clearance.

The owner explicitly reports previously confirmed **13/13 physical Safari/VoiceOver smoke
checks**. This is owner-reported evidence, not device testing performed by automation.
The accessible programme/PR evidence does not enumerate those 13 individual items or
device/iOS versions, so an item-by-item mapping to these three journeys cannot be certified.
Do not invent that mapping or conflate older Gates 5–7 device acceptance with Gate 8.

This correction changes tests/documentation only, with no runtime source/build changes.
Consequently, it creates **no new physical behavior requiring repetition**: prior device
acceptance can carry forward for the identical runtime. If the original 13/13 record did
not cover a journey above, that missing journey still requires owner confirmation/testing;
missing itemization/device details remain a documentation limitation. Final human Gate 8
acceptance and promotion require separate explicit authorization, regardless of CI success.

## Validation and governance

Focused tests: 9/9, including strict one-pixel/dimension/source mutation negative controls
and the new scroll/content/focus/geometry negative controls.
Locked dependency installation, 929/929 application tests, 172/172 VersePlay tests and
the protected preview build pass locally. Complete browser/visual and exact-head CI results
are recorded in the consolidated acceptance report after execution; a local pass never
substitutes for a failed or pending required CI context.

Verify Netlify provider metadata (`commit_ref`, branch, review 151, deploy-preview context,
ready state, unpublished production) and the served Foundation source against the exact new
head. The isolated application is `/foundation2/`; the root remains the protected legacy app.
New push/deploy must use the provider's native integration. Never post an invented GitHub
success status. A ready deploy alone does not clear a pending required Netlify check.

At investigation, main was `32bed048a18d7bdd7e1ebb8b420736664a2521b2`, canonical develop
was `d038fc6adfdbc7c9b5925fc91e475cb1f15c7467`, and PR #150 was draft/open at
`57409b8ceb573d092545906ca6738d6e19428ae3`. These and existing recovery refs must remain
unchanged. The visible reference ruleset protects historical refs, but main/develop branch
protection endpoints return 403 to the integration. Required contexts/reviews/bypass rights
therefore cannot be fully certified; administrator evidence is still needed before promotion.
PR #151 stays draft. No merge, production deployment or next sprint is authorized.
