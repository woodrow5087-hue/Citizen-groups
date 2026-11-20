# Rally Point Phase 1 — Codex Handoff

Branch: `rally-point/phase1-today`. Base: `main`. Do not merge or deploy production.

The complete product/design baseline is in `docs/RALLY_POINT_MASTER_BLUEPRINT_v1.0.md`. This branch deliberately does not modify application code.

**Required visual references:** The original `Rally_Point_Blueprint_v1.0_Repo_Package.zip` contains `docs/assets/visual_reference_warm_editorial_v1.png` and `docs/assets/citizen_church_logo_reference.png`. These reference images are not yet in GitHub; ask for the ZIP to be attached to your Codex task, extract its `docs/assets/` files, and commit them to this branch **before** implementing. Do not silently replace the approved screenshot with a generic template. The repo already has some older assets under `assets/`; check whether any are approved for reuse, and don't assume the existing Citizen Connect mark is interchangeable with the supplied Citizen Church logos.

**First implementation only:** Today screen, four-tab navigation shell, role-aware UI demo states, fixture data, responsive behavior, and fidelity to the supplied visual reference. Read section 12 of the blueprint for the full acceptance criteria. Preserve existing functionality. Build on the branch and return screenshots and a preview (if available). No merge or production deploy.

**Checklist**
- [x] Branch created from main
- [x] Blueprint committed
- [x] Two visual reference images committed
- [x] Codex Today-screen work
- [ ] Mobile review / approval

**Implementation update — November 20, 2026:** Both exact images are now in
`docs/assets/` (committed before application work in `3f473fc`). The Phase 1
implementation, automated verification and actual comparison captures are in
`docs/phase1/`. Human iPhone review/approval remains open; no merge or production
deployment is authorized. The original instructions above are retained as the
handoff record.

## Companion app direction — November 20, 2026

**New decision D-10:** Read `docs/COMPANION_ARCHITECTURE_DECISION.md` before subsequent implementation. Rally Point is a separate Warm Editorial companion to existing church systems, not a replacement for Planning Center / Church Center. Keep existing Today, Groups, Team, Read structure and approved visual references. Treat scheduling, group membership, and attendance as potential integrations only after church approval and endpoint-by-endpoint verification; Read is the first-party experience. **No real church data, credentials, chat synchronization, member import, or live integration in Phase 1.**

**Important current state:** Phase 1 application code and verification artifacts already exist on this branch. Do **not** restart the Today implementation or revert current changes due to D-10. The next required action is mobile review/approval of the current preview. After approval, conduct the integration discovery gate while continuing UI refinement on the approved baseline.
