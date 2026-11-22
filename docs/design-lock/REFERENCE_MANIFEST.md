# Rally Point — Reference Manifest (2026-11-21)

This manifest documents **the exact three owner-supplied design images** shown during the November 21, 2026 design-lock request. They are preserved byte-for-byte in the downloadable `Rally_Point_Design_Lock_2026-11-21.zip` companion archive provided in that conversation. They are not stored in GitHub by this commit; **do not silently substitute generated replacements**.

| Original source | Archive filename | Image size | Bytes | SHA-256 |
|---|---|---|---:|---|
| First image: four-phone Premium Hybrid concept: Today / My People / My Team / Leader Care | `references/01_premium_hybrid_four_views.jpeg` | 1448×1086 | 587323 | `00df6baa642f73ad11750d36b61e580afe7da4412319d9438b28ef499a231c92` |
| Second image: ALIVE Your People circular profiles, dark masthead, screenshot | `references/02_alive_people_story_rail.jpeg` | 1206×1158 | 183344 | `c5df7a7edfe56d8919ef74b13d003f7487da5d077280d2850119d306257dd767` |
| Third image: ALIVE four-screen storyboard, Today / Daily Rhythm / Groups / Community Action | `references/03_alive_four_screen_storyboard.jpeg` | 1206×789 | 215525 | `633a306761b262eccddadd1ab080320c2d96f6ad29ba7402d5c2f2f2fd4d1c4f` |

## Implementation source pinning

- **Approved v0.8 commit:** `84e489b86851e853948a7d4246475e83b7ddd085` (archival branch `rally-point/reference-v08-approved-2026-11-21`)
- **ALIVE × Citizen v02 commit:** `1da3bab388f85010e541b4ecb3c441b4431c5b81` (archival branch `rally-point/reference-alive-citizen-v02-2026-11-21`)
- **Written spec:** `docs/design-lock/RALLY_POINT_VISUAL_SPEC_v1.md` on the separate `rally-point/design-lock-2026-11-21` branch
- **Approved code root is not `main`:** choose a base deliberately for every new experiment.
- **Existing code-backed visual artifact:** `docs/assets/visual_reference_warm_editorial_v1.png` in the approved v0.8 snapshot.

## Review order

1. View all three original reference images at native resolution.
2. Compare implementation against its own exact pinned source code baseline.
3. Read `RALLY_POINT_VISUAL_SPEC_v1.md`.
4. Inspect screenshot diffs and accept or reject specific changes; no automatic redesign.

## Technical integrity note

An immutable Git commit SHA identifies preserved source content. A branch label is editable unless GitHub ruleset or branch protection prevents edits. Creating these snapshots does **not** enable such enforcement. Production is unaffected.
