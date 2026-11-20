# Rally Point Phase 1 — implementation record

Base: `rally-point/phase1-today` at `e70eaa5`. The supplied blueprint and handoff
were read before application changes. Both exact source images were committed in
`3f473fc` before implementation, as requested by the handoff. No branch or app
from the separate Premium Experience vNext work is substituted here.

## Audit and scope

The existing app is `index.html`, `rallypoint.css` and `rallypoint.js`. Its
`rallypoint-phase1-2026` localStorage record holds messages, prayer posts, RSVP,
serving response/coverage, group discovery, sample leader attendance/check-ins,
reading-plan/question choices and read/prayer marks. Those interactions remain.
The prior Citizen Connect app is retained in `premium-hybrid-archive.html`.

The baseline test run had six passing archived tests and two test-file failures:
the old intro/Premium Hybrid harnesses still read the now-replaced `index.html`.
Their assertions will be retained and pointed at the existing archive, with
separate coverage for the actual Rally Point app.

Phase 1 changes Today and the shared shell: authentic Citizen flag shape,
provisional Rally Point wordmark, Warm Editorial tokens, graphic-led feature and
action components, four-tab charcoal navigation, source-aware Today items,
populated/empty fixture scenarios and contextual leader entry. Groups, Team and
Read keep their existing functional implementations; full tab redesigns remain
Phase 2. Existing sample leader controls are retained, not expanded into a new
attendance, flagging or reading-policy system.

## Fidelity and intentional differences

- Match the reference hierarchy, compact header, oversized but useful greeting,
  dark feature panel, paired asymmetric action surfaces, sage reading graphic,
  visible borders, matte texture and charcoal navigation with red selection.
- Reuse the actual flag pixels from the supplied Citizen Church reference through
  an SVG mask. Do not substitute the older Citizen Connect wordmark or invent a C.
- Use initials for fictional people; the reference portrait is not treated as
  authorized real member photography.
- Omit simulated iOS status bars, notch, home indicator and trademark symbols.
- Dates and Up Next come from the existing group/serving sources. Depending on the
  current day, the Sunday team commitment may precede Wednesday Group. Mockup
  names, times and copy are illustrative, not reasons to show a false schedule.
- Today does not host RSVP, message, schedule or reading workflows. It deep-links
  into the existing source views. The reading preview reflects the existing
  John 15 selection. Unbuilt Memorize is an explicitly labeled Phase 2 preview.
- Fixture role/scenario controls do not imply authentication or backend permission
  enforcement. No real accounts, member data or delivery is introduced.

Validation and comparison screenshots will be recorded after implementation.
