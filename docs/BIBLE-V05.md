# v0.5 Bible experience

Implemented on `feature/bible-v05`, branched from the current `design-system/v04` head (`8b2308b`). The PR targets `design-system/v04`; no merge or production deployment is authorized.

## Scope and architecture

Grow keeps the v0.4 palette, header, typography, navigation, cards and shared PrimaryPill/ActionSheet components. A featured passage rotates deterministically each local calendar day through seven curated passages. The card quotes its opening verse from the bundled WEBP source and opens the full chapter with the featured verses selected.

`src/features/bible/` contains the typed catalog/loader, reader, attribution, reflection editor, isolated local-state controller and tests. `src/data/web/` contains a small catalog and one JSON file per book. Vite emits 66 lazy book chunks; opening a book loads it from the same app origin. No third-party Bible API is called. Full offline installation/service-worker caching is not implemented; uncached book assets require connectivity to the app host. Asset failure shows an explicit retry action, and stale book responses are ignored.

All 66 books and their chapters are navigable with labeled native selects and Previous/Next controls that cross book boundaries and disable at Genesis 1/Revelation 22. Reader text size is adjustable from 16 to 24px in 2px steps and persists with the last chapter. Verses are keyboard/touch-selectable buttons with pressed states; selection is limited to 20 at a time and reset when navigating to another chapter. A compact selection toolbar offers Clear and the demo sharing preview.

See [World English Bible attribution and provenance](licenses/WORLD-ENGLISH-BIBLE.md) for publisher URLs, edition, public-domain status, source hashes, numbering conventions and re-import instructions. No copyrighted translation text is included.

## Local privacy and state

Bible preferences, last chapter, per-chapter last-read date and reflections use the separately validated `citizen-groups-bible-v05` key. Existing group data and its storage key are unchanged. Read completion records the local date for that chapter, with no streak or spiritual score. Repeating the action updates that record rather than inflating a count. The next day it becomes eligible to mark read again.

Personal reflections are explicitly saved for a chapter or the currently selected verses: up to 100 entries, 2,000 characters each. Re-saving the same reference replaces that entry. Saved reflections can be reopened/deleted from the reader; Grow lists them in a collapsed local-only section. Unsaved drafts survive navigation within the running app and changes in selected reference, but are not persisted across reload. The editor labels unsaved drafts. Do not use real private information: localStorage is unencrypted, browser/origin-specific and not an account or secure vault. No cross-tab synchronization or export is implemented.

Storage validation rejects unknown books, invalid chapters/verses, unsupported text sizes, excessive entries or malformed JSON. Corrupt Bible storage falls back with a visible warning independently of the group demo. Save failures retain session state and explicitly say it could not be persisted, without claiming a successful device save. Confirmed Reset Demo from You clears Bible state, drafts and the existing group demo; failure to clear storage is reported.

**Preview with My Group** opens a sheet labeled **My Group · Demo preview**. Its quotation is constructed only from the selected canonical verses, includes the WEBP attribution and never contains reflection text. It does not modify the group feed, claim delivery, create an account, send a message, or make a server write. Closing the sheet returns keyboard focus to its opener. Existing group post/check-in/prayer/RSVP/guide/leader functionality remains intact.

## Verification

- 25 Vitest/Testing Library checks pass, including the existing 11 regression cases, full generated-corpus integrity, source wording/gaps, chapter boundaries, daily passage selection, storage validation/failure, persisted reflections/read state, isolated sharing preview, draft retention, loading retry and stale-response handling.
- Production build includes strict TypeScript checks for app, tests and browser specs. Book text remains outside the initial app bundle as lazy chunks.
- Five committed Playwright journeys run at 320, 375, 390, 430 and 980px against the production build. They verify font sizing up to 24px, native selectors, selection, completion, reflection persistence, preview privacy and focus restoration, reload, chapter navigation, document overflow and visible control targets of at least 44×44px.
- Axe WCAG A/AA checks report no violations for the tested reader and preview-sheet states at all five widths. This is automated coverage, not a full accessibility conformance claim. iPhone Safari, VoiceOver, text enlargement and real keyboard/safe-area behavior remain device review items.
- Grow, reader and preview screenshots at 390px were visually inspected. The feature retains the approved dark design language without adding imagery or decorative branding.

## Reproduce checks

```sh
npm ci
npm test
npm run build
npx playwright install chromium
npm run test:browser
```

On machines using an existing Chromium, set `PLAYWRIGHT_CHROMIUM_EXECUTABLE` to its absolute path. Browser tests start Vite preview automatically unless a preview server is already running. To exercise an accessible Netlify preview instead, set `BIBLE_PREVIEW_URL` to its URL. Netlify-protected previews may require a signed-in session; no protection is bypassed by the app.

Publisher source downloads are unnecessary for ordinary tests/builds. Source import is a separate reviewed maintenance task. Browser artifacts are ignored by Git.
