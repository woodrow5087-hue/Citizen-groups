# Sprint 8 developer handoff

## Start here

Read `AGENTS.md`, `s8-progress.md`, `s8-architecture.md`, `s8-data-contracts.md` and
`s8-intelligence.md`. PR #121 remains a draft against `rally-one/develop`.
Do not use legacy develop, merge to main, retarget the PR, or move the approved
recovery checkpoint. Engineering reference: `8ef33da`; visual reference: immutable
PR #119 SHA `5aa88c93c3d4cd22902ef98af98c09b74ca436ce`.

The app is a static ordered-script application. New runtime modules need a script
at the correct dependency position in `index.html` and an entry in the build
allowlist. Pure modules expose CommonJS exports for Node tests. Internal contracts
and engineering notes belong outside `docs` because that entire folder is public
in a static build. No new framework, package dependency or external AI was added.

## Reproduce locally

Use Node >=22.12 (CI uses 22), `npm ci`, and Playwright Chromium:

```sh
npx playwright install --with-deps chromium
npm test
npm run test:verseplay
npm run build
npm run test:browser
npm run test:onboarding
npm run test:blank-battle
npm run test:groups-safety
npm run test:chat-lab
npm run test:groups-integrated
CONTEXT=deploy-preview npm run build
python3 -m http.server 8514 --bind 127.0.0.1 --directory dist
```

In another shell run the leadership and complete preview chains against the same
build:

```sh
node scripts/leadership-demo-browser-check.mjs http://127.0.0.1:8514/
node scripts/preview-today-browser-check.mjs http://127.0.0.1:8514/
```

The standard build intentionally retains its old default experience; only the
existing deploy-preview build flag enables Rally One by default. Do not change
production configuration to manufacture a preview. `BROWSER_PATH` can select the
installed Chromium executable. VersePlay uses `VERSEPLAY_URL` (default port 8000):

```sh
python3 -m http.server 8000 --bind 127.0.0.1 --directory dist
npm run test:verseplay:browser
```

For exact app visual comparison, create an isolated approved build (never reset
or check out the working feature branch to the reference):

```sh
reference_dir=$(mktemp -d)
git archive 5aa88c93c3d4cd22902ef98af98c09b74ca436ce | tar -x -C "$reference_dir"
CONTEXT=deploy-preview node "$reference_dir/scripts/build.cjs"
CONTEXT=deploy-preview npm run build
node scripts/s8-visual-regression.mjs "$reference_dir/dist"
```

CI fetches that immutable SHA explicitly, performs the same comparison, and saves
all screenshots and JSON reports under its existing artifact upload. It compares
48 screen pairs at 320/390/430px and byte-checks 74 protected assets/runtime/style
files. Threshold zero is unchanged. There are no masks or saved replacement image
baselines. The title/tagline, full onboarding, four tabs, portrait, Ask Rally and
four roles are included. VersePlay independently compares 49 gameplay/motion
pairs using its controlled live font inputs; both suites remain mandatory.

## Source ownership and safe changes

- Main state/profile: existing keys and guarded writer only. Use explicit
  transitions and rollback; never infer completion from browsing or asking.
- Modern thread: use `RallyConversationRead.createAccess` from the application;
  lazy storage evaluation and current-membership checks belong inside the adapter.
  Do not derive unread from historical `groupMessages` or erase drafts on read.
- Personalization: change `RallyUnifiedFocus` facts/final selection and invoke the
  shared `RallyIntelligence.derive` service. Today and Ask Rally must consume its
  same decision. Maintain the four-role and privacy matrices.
- Provider contracts: member v1 is a read-only demonstration handoff, not a
  browser repository or auth grant. Existing action/conversation contracts and
  migration rehearsal are retained. No live integration is authorized.
- Navigation: retain original portrait destination, scroll and focus. Existing
  Connect overlays and classic routes remain supported.
- VersePlay: its existing engine/content/controller/storage/renderer/sound
  boundaries are independent; never interpret game progress as pastoral need.

## Remaining acceptance and risks

Linux Chromium automation is not physical iPhone Safari, VoiceOver, TalkBack,
Safari sound listening or church/editorial approval. Independent physical-device
acceptance must cover title timing/tagline, complete onboarding, Today/Groups/
Team/Read, portrait return/focus, Connect draft/reply/read behavior, RSVP/serve,
leader revocation, reduced motion, keyboard/VoiceOver focus and labels, and the
Verse Circuit full loop including Safari Back. Record device, OS/browser, build
SHA, reviewer, findings and evidence. Do not mark these checks complete from a
simulator, screenshot or Chromium run.

Axe cannot fully evaluate some decorative/pseudo-element contrast in the approved
VersePlay design; manual contrast review remains necessary. Google Fonts remains
a Verse Circuit runtime dependency; test input replay does not add product offline
support. Browser-local state is fictional, not secure church data or real identity.
Care consent/retention, production authorization and Scripture/asset approvals
remain independent gates. The composition root is still 1186 lines; bounded future
controller extractions need the same behavior/visual gate, not a wholesale rewrite.

Recommended next milestone: independent device/accessibility acceptance, followed
by a server-session, consent and scoped authorization design with synthetic
provider-adapter conformance tests. Do not begin live Planning Center access until
that separate security/product gate is approved.
