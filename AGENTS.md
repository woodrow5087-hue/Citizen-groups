# Rally One — repository guidance

## Start here
Read `engineering/foundation2-development-program.md` first. It is the single authoritative tracker for current exact sources, acceptance, roadmap, state owners, evidence and restrictions. Historical sprint notes and audits are evidence, not current authorization.

Fetch and verify remote HEADs, ancestry, PR status and working tree before editing. The canonical branch is **rally-one/develop**; `main` is production and `rally-point/develop` is legacy. New work normally starts from canonical. An explicitly owner-authorized isolated lane may instead continue directly from a recorded accepted, unmerged candidate: follow the tracker, preserve that ancestry and do not restart from canonical or create a competing lane. Never reset, force-push, mass-merge stacked PRs or move recovery refs.

Current EXPERIENCE work is on `rally-one/experience-e2b-e3a`, PR #158. E1/E2 is owner-accepted; E2B/E3A is an automated-passing review candidate, not yet physically/visually accepted. Do not infer acceptance or permission for another sprint from a handoff request.

## Product and architecture safeguards
- Preserve matte charcoal/cream/Citizen red, readable typography, approved title/tagline, portraits, onboarding, four tabs (Today/Groups/Team/Read) and consistent Connect access. Preserve accepted premium messaging and VersePlay identities. Intentional design changes need the recorded owner review; no silent reference replacement.
- Reuse existing engines and one authoritative owner per field: member context/intelligence, guarded Foundation records, conversation repository/read cursor and game progress. Presentation/widgets/motion never create another decision engine, store or authority. At most two response-needed Today actions; optional messages/Scripture are not obligations.
- All data/communications remain fictional, synthetic or local. No real member records, credentials, external messages, inferred pastoral risk or automated outreach. Local personas are not authenticated users. Server-only pilot contracts stay outside static publication.
- Foundation remains opt-in at `/foundation2/`; preserve legacy entry/defaults. No production publication, default cutover, destructive migration, direct canonical change, merge or protection-setting change without separate explicit authorization. Preserve PR #150 and all accepted source/recovery references.

## Execution and validation
- Continue autonomously within the current authorized scope through coherent implementation, focused tests, routine corrections and preview preparation. Stop for material product/architecture/security decisions, irreversible operations, unresolved material regressions and the recorded human acceptance/promotion gate.
- Define scope, affected dependencies, owners and acceptance criteria first. Use current verified evidence; do not repeat accepted gates or physical testing without a relevant change/new regression. Run focused checks between changes and complete applicable protected suites at the final product candidate.
- Commands: `npm ci`, `npm test`, `npm run build`, `npm run test:verseplay`, `npm run test:verseplay:browser`, and the existing workflow browser suites. A local Foundation preview requires `NETLIFY=true CONTEXT=deploy-preview npm run build`, then serve `dist/`; this is a local build, not production publication. Follow workflow server/browser setup for regression commands.
- Check 320/375/390/430 CSS px, short screens, enlarged text, keyboard/focus, VoiceOver and reduced motion as applicable. Automated WebKit is not physical Safari acceptance.
- Preserve every historical source guard, visual inventory, functional assertion and comparison threshold. Never bypass gates, manufacture provider statuses, mask pixels, relax tolerances or repin references to conceal a failure. Earlier canonical visual failures remain promotion blockers despite later candidate passes. No standalone historical rendering investigation or issue #153 work is authorized.
- Verify exact-commit Netlify metadata and independently built served bytes; a green deployment is not full QA. Report exact SHA, checks, preview, limitations and next human gate in the existing tracker/PR. Documentation-only handoffs require source/build equivalence and link/archive checks; prior-head checks must remain labeled with their exact head. Do not suppress normal CI.

## References and recovery
The tracker indexes durable evidence under `engineering/reference-evidence/`, approved source/design references and recovery hashes. Keep engineering/evidence outside the public `docs` build. Original Studio 13 photo-bearing HTML/screens require owner-approved private transfer; their presence in an old conversation or temporary path is not fresh-workspace access or photo clearance. Do not publish them. Preserve the written handoff and use accepted repository source/assets for current continuity.

Sprint 8 architecture/contracts/release documents (`engineering/s8-*.md`) remain historical technical references. They do not supersede the current tracker or owner authorization.
