# VersePlay engineering foundation

Verse Circuit is a standalone, mobile-first Scripture game: notice three phrases in TRACE, restore their sequence in LINK, recall missing words in ECHO, then optionally explore Afterglow. This sprint preserves the approved John 15:12 experience while separating its rules, content, persistence, and presentation.

The approved visual source is retained unchanged at [`reference/verse-circuit-original.html`](reference/verse-circuit-original.html). The playable refactor is [`../verse-circuit-playground.html`](../verse-circuit-playground.html). No Rally One member screen or navigation integration is added.

## Requirements and local development

Use Node.js 22.12 or later, npm, and Python 3. Install the repository's locked development dependencies from the repository root:

```sh
npm ci
npm run dev
```

Open `http://localhost:8000/verse-circuit-playground.html`. The unchanged original is available at `http://localhost:8000/verseplay/reference/verse-circuit-original.html`. Use HTTP rather than opening the HTML as a local file: native module loading and content fetching require it.

The game has no runtime framework or package dependencies. Playwright, axe, and Node tests provide verification; two small development-only image tools (`pngjs` and `pixelmatch`) distinguish actual screenshot changes from browser text antialiasing.

## Tests and build

Run these commands from the repository root:

```sh
npm run test:verseplay
npm test
npm run build
```

The static build writes `dist/` and copies the VersePlay directory alongside the standalone page. There is no new bundler, transpiler, or framework. To inspect the actual build:

```sh
python3 -m http.server 8000 --directory dist
```

For Verse Circuit browser QA, leave either development server or built-output server running in another terminal, then run:

```sh
npx playwright install chromium
npm run test:verseplay:browser
```

The browser suite defaults to `http://127.0.0.1:8000`. Override `VERSEPLAY_URL` for a different running server, and `BROWSER_PATH` if Chromium lives elsewhere. It captures the original and refactored game at matching sizes and states, compares screenshot pixels (recording byte identity and excluding only detected antialiasing), checks geometry, exercises reloads and keyboard interactions, and records axe findings. Output is written under the ignored `test-results/verseplay/` directory. A font/network failure or missing browser must be investigated rather than counted as a pass.

For each run, the browser captures the first successful live Google Fonts response per URL and replays those exact bytes to both comparison sides. The report records response hashes and asserts identical inputs. Google can return different stylesheet/font formats for the same URL; comparing those different inputs produces text raster differences even against the unchanged reference. This is test-only input control, not a production font replacement or a saved visual baseline. Error-state screenshots wait for the real 300ms flash to clear; separate assertions observe the flash appearing and clearing and retain the persistent error-message check.

The existing repository browser suites remain available as `npm run test:browser`, `npm run test:onboarding`, `npm run test:blank-battle`, `npm run test:groups-safety`, `npm run test:chat-lab`, and `npm run test:groups-integrated`. They build and exercise their existing Rally One surfaces. See [QA](QA.md) for the commands actually executed, current counts, screenshot evidence, intentional accessibility repairs, pre-existing findings, and remaining limits; the availability of a script alone is not evidence that it passed.

## Where to work

| Responsibility | Files |
| --- | --- |
| Pure rules and action effects | [`core/circuit-engine.js`](core/circuit-engine.js) |
| State version, fields, and reachability invariants | [`core/state-schema.js`](core/state-schema.js) |
| Saved progress, legacy migration, sound preference | [`core/storage.js`](core/storage.js) |
| Content validation and passage reconstruction | [`core/content-schema.js`](core/content-schema.js) |
| Verified sample text and illustrative discovery | [`content/john-15-12.json`](content/john-15-12.json) |
| DOM event handling, navigation, focus, effects | [`games/verse-circuit/controller.js`](games/verse-circuit/controller.js) |
| Screen markup and original geometric artwork | [`games/verse-circuit/renderer.js`](games/verse-circuit/renderer.js) |
| Approved styles extracted without redesign | [`games/verse-circuit/verse-circuit.css`](games/verse-circuit/verse-circuit.css) |
| Optional synthesized audio | [`games/verse-circuit/sounds.js`](games/verse-circuit/sounds.js) |
| Unit and real-browser regressions | [`tests/`](tests/) |

Start with [architecture](ARCHITECTURE.md) for the public contracts, state machine, and extension rules; [content guide](content/CONTENT_GUIDE.md) for adding another verified passage; and [baseline audit](BASELINE_AUDIT.md) for exact Git provenance and isolation decisions.

## Known limits and deferred production work

This is an engineering foundation for one approved prototype, not a production-readiness claim. It is local-first: no account, synchronization, analytics, multiplayer, or server-owned progress. Storage availability and browser quota determine whether progress survives closing the page. A missing or invalid passage produces a retry screen rather than gameplay based on unsafe content.

The original Google Fonts URLs remain in place to honor the visual freeze. Typography therefore depends on network access and font caching; replacing or self-hosting those fonts requires a separately reviewed asset/licensing and visual-parity change. No offline service worker is introduced.

John 15:12 is source-verified against the cited BSB text, with rights metadata recorded in the content file. Source verification is not church editorial approval. The Afterglow copy remains explicitly illustrative and requires editorial review before church-wide release. The architecture does not supply a content-management system or a large passage library.

Future production milestones include editorial sign-off, manual accessibility validation, a real-device/Safari matrix, reliable approved-branch preview CI, and separately scoped Rally One integration. Authentication, member-data access, cloud saves, analytics, payments, deployment, and game-library expansion remain outside this sprint.
