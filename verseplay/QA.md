# Verse Circuit engineering and visual QA

Run date: 2026-11-23. Reference: approved prototype commit `3304a141270d3f1f912149f7a8c7af30f8b4de7f`, preserved unchanged at [reference/verse-circuit-original.html](reference/verse-circuit-original.html). Integration baseline: showcase checkpoint `9a0f878a3ad13f099cb8ca5e0bf9bb94f3ecf635`.

## Reproduce browser QA

Install dependencies with `npm ci`, then run a local server with `npm run dev`. In a second shell run:

```sh
node verseplay/tests/verse-circuit.browser.mjs http://127.0.0.1:8000
```

The script uses `BROWSER_PATH`, system Chromium if available, or the Playwright-installed browser. Install the latter using `npx playwright install chromium` when needed. It does not install another application framework or change production assets. Full screenshots and detailed results are written to the ignored `test-results/verseplay/` directory. `--baseline` captures only the approved reference; `VERSEPLAY_WIDTH=320` narrows diagnostic runs to one width. `--visual-only` skips the additional integration checks.

## Visual comparison method

The harness opens fresh browser contexts at 320, 375, 390 and 430 × 844 CSS pixels, using matching mobile/touch settings. It waits for all approved Google font weights, then drives both versions using actual buttons through arcade, introduction, TRACE, complete TRACE, LINK, incorrect LINK, complete LINK, ECHO, incorrect ECHO, complete ECHO, victory and Afterglow. It waits for two identical consecutive captures, then compares full-page PNG dimensions, raw pixels, detected antialias pixels and SHA-256 hashes. Pixelmatch runs at threshold `0`, with only detected antialiasing excluded for the visual gate; raw differences are always recorded. Final evidence happened to match byte for byte in all 49 pairs, so no exclusion or color tolerance was needed.

The 48 main pairs use the prototype's existing reduced-motion preference to compare settled gameplay states consistently. A separate normal-motion playthrough checks the original screen-entry timing and all eight victory particles, then pauses the real CSS animations at 900 ms and compares a matching victory screenshot. Browser raster settings disable GPU-dependent and subpixel font variability for reproducible comparisons. Axe scans run at identical points during reference and refactored captures; this avoids font rasterization side effects from unmatched instrumentation. Camera origin is matched before the paused normal-motion sample. The extracted CSS is also checked byte for byte against the original `<style>` block. These test settings do not modify the game stylesheet, assets, typography or animation definitions.

Evidence: [comparison report](qa/comparison-results.json), contact sheets at [320](qa/contact-320.png), [375](qa/contact-375.png), [390](qa/contact-390.png) and [430](qa/contact-430.png). Full-size before/after examples for the eight requested states are in [qa/screenshots/](qa/screenshots/).

## Browser reliability and accessibility coverage

The suite verifies horizontal bounds and rendered game content on every captured mobile screen. Actual interactions reach progression controls throughout tall scrolling screens, exercise hints and undo, reload introduction and every gameplay stage including victory and Afterglow, repeat playthroughs and preserve independent sound preferences. It checks repeated TRACE clicks, keyboard selection and stage advancement, focus preservation after rendering, visible focus, concept-dialog focus trapping and Escape restoration, and reduced motion.

Recovery fixtures cover corrupt JSON, malformed completion claims, unsupported schema versions, unavailable storage, quota failures after startup, sound-preference write failures, unrelated-data preservation, and content-load failure with a working retry. Recovery notices remain visible across gameplay rendering and ordinary announcements. Normal gameplay contexts are monitored for console/page errors and font request failures. The harness answers the browser-generated favicon request with 204 in both versions because the original prototype has no favicon; this is not a game asset failure. The deliberate content-fetch 503 is an explicit recovery fixture.

Axe is run against the same seven screens in both versions at 390 pixels. The approved prototype had an unnamed semantic role on the labelled stage meter and a skipped Afterglow heading level. Nonvisual role/heading-level attributes repair both while preserving all styling. The refactored screens must have zero axe violations. Contrast evaluation is incomplete on every tested screen because the preserved pseudo-element backgrounds prevent axe from determining text backgrounds; the report lists every affected target for manual review. No automated contrast-pass claim is made. Automated accessibility checks supplement keyboard testing; they do not replace assistive-technology review.

## Final Verse Circuit results

- **49/49 matched image pairs:** 48 gameplay-state pairs across the four mobile widths and one normal-motion victory pair; 98 screenshots, zero raw differing pixels and zero non-antialias differences. Dimensions match in every pair.
- **467 successful assertions across two verification passes:** 366 behavioral/recovery/geometry/font assertions from the final full interaction run, followed by 101 targeted assertions after aligning capture instrumentation and applying the nonvisual semantic repairs. The full run's original byte-only image assertion stopped on capture artifacts; the targeted pass and a fresh pure comparison of all final images resolved those artifacts. The committed report records both passes explicitly.
- **Seven final axe scans, zero reported violations:** the original had four semantic findings across TRACE/LINK/ECHO/Afterglow; meter roles and accessible heading levels repair them without changing visuals. Contrast remains a manual-review limitation described above.
- **Zero normal-game console/page errors or font request failures.** Both actual approved font families were loaded at every recorded viewport.

The normal-motion completion flow produces an inherited `.app-shell.scrollLeft` of 22 pixels in both original and refactored versions, while `window.scrollX` remains zero. The comparison records these offsets and resets both cameras to the same origin before sampling particles. This is existing focus/overflow behavior, not a new layout regression. A future reliability review can consider whether that internal horizontal focus scroll should be eliminated; the approved CSS remains unchanged here.

## Executed quality checks

| Check | Result |
| --- | --- |
| Existing repository unit tests (`npm test`) | 293 passed, 0 failed |
| VersePlay engine/content/storage tests | 172 passed, 0 failed: 83 engine, 89 content/storage |
| Combined unit total | 465 passed, 0 failed |
| Final Verse Circuit browser assertions | 467 successful assertions across the documented full and targeted passes |
| Final screenshot comparisons | 49/49 pairs matched byte for byte; 98 screenshots; 0 raw/non-antialias differences |
| Final Verse Circuit axe scans | 7 screens, 0 reported violations; contrast requires manual review because pseudo-element backgrounds prevent evaluation |
| Existing Phase 1 browser checks | 8 cases passed |
| Existing onboarding browser checks | 6 viewport cases; 30 axe scans passed |
| Existing Blank Battle browser checks | 2 viewport cases; 2 axe scans passed |
| Existing Groups safety, chat lab and integrated Groups checks | Passed; chat lab exercised 5 widths |
| Build and built-output complete game loop | Passed; parent engineer independently exercised a reduced-motion full loop against built output. Normal-motion validation is covered by this source-browser suite. |

The repository checks above were executed and reported by the parent engineer in the same workspace. The dedicated Verse Circuit browser result and screenshots are recorded by this suite.

## Limits and deferred review

Testing uses Chromium automation in Linux. Safari/WebKit, Firefox, physical phones, VoiceOver/TalkBack, sound listening quality and offline font delivery have not been verified. Google Fonts remains the prototype's external dependency. No theological or church editorial approval is implied by engineering source-text verification; Afterglow retains its illustrative/editorial-review caution.

Axe contrast checks were enabled. Passed-node counts and any incomplete contrast checks that require manual review are included per screen in the committed report. No color changes were made. There is no claim that automated contrast evaluation proves every decorative, disabled or transient element accessible.

## Deploy Preview re-trigger (2026-11-23)

After branch-deploy eligibility was updated for the approved showcase PR target, a documentation-only commit was made to prompt Netlify to reevaluate draft PR #118. This changes no executable code, CSS, images, fonts, copy shown in gameplay, or approved visual baseline. The actual Netlify deploy status and deployed commit must be checked separately; the existence of this note does not claim that Netlify generated a preview.
