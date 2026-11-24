# 11C — Privacy, consent and security (synthetic pilot)
Canonical base 3c8d3a068b7f22be98bf1eff4415677237f20068. PR #140 accepted, 790/790 unit/fixture and 42/42 provider tests, device accepted by user, production and ten checkpoints unchanged. User authorizes synthetic 11C.1–11C.6 only. No live credentials, real records, HTTP endpoint or deployment. This is a proposed privacy control design, not legal advice, a final church policy or production certification.

## 11C.1 classification and purpose limitation
| Class | Pilot purpose | Handling |
|---|---|---|
| Public church content | public discovery | existing public/demo experience separate; no member linkage |
| Restricted identity and eligibility | verify adult opt-in tenant subject and mapping | server only, not a profile feed; existing 11A session owner and approved mapping owner |
| Restricted group/gathering | show member own authorized group name and next gathering title/start | validated 11B GET and 7D projection only, transient, never mixed with fictional content |
| Highly sensitive care, health, prayer, messages, household/minor, attendance, giving, roster/contact/location | none | no retrieval, storage, AI or disclosure in pilot |
| Credentials/session secrets | authenticate only | no logging or client JS access; real BFF/secure cookies/secrets store not implemented |
| Operational counts | measure system failure, not people | coarse hourly fixed enum counts; no individual correlation or raw logs |

Permitted purpose member-group-view, destination own-member-view, exactly three member content fields. No advertising, model training, AI personalization with real data, automated outreach, leadership monitoring, spiritual/attendance risk scores. Policy helper documents allowlist; actual read path enforces minimum existing projection. No AI/leader endpoint exists. A string label can never grant access.

## 11C.2 consent lifecycle
Trusted administration capability receives independently verified member decision in future; this rehearsal takes explicit fixture attestation only, never browser claims. Exact purpose + notice version + explicit opt-in, active approved adult mapping and internal groups:read. Consent state owned only by privacy composition; existing identity mapping remains authoritative. Candidate expiry 30 days or earlier withdrawal, mapping/notice change, or pilot shutdown; group/person/version bound by digest. Renewal requires new explicit opt-in and session. Withdrawal removes consent and invalidates all matching sessions; conservative cancellation of pending exchanges (identity unknown before verification). Other existing identities' sessions preserved. Mapping changes detected by lookup, revocation and expiry proactively swept on operations. No self-service consent UI, legal identity proof, or guardian workflow yet. Withdrawal/delete does not delete Planning Center records; no provider writes.

## 11C.3 retention proposals (leadership/security approval required)
- Consent record: minimum identity key, mapping fingerprint, generation, accepted/expiry timestamps; in memory, max 1000 by default, 30 days maximum; remove on withdrawal, local deletion, mapping change, expiry, kill switch. Session records retain 11A maximum 8h absolute/30m idle or earlier credential expiry; remove on revoke/logout/sweep. No recurring job or durable data; future server store needs scheduled sweeps, deletion/backups policy and tested restoration. Explicitly distinguish local consent deletion from provider deletion and legal recordkeeping; if legal evidence retention required approve separately before live.
- Member payload transient only, no cache, localStorage or AI transcript. Existing 60s freshness bound. No stored profile from provider, no message, prayer, pastoral data. Current provider request may continue after withdrawal; late response is discarded; upstream cancellation remains 11D work.
- Synthetic audit counts by hour, fixed action/outcome enums, capped at 168 buckets and at most 7 days, no member/group/subject IDs, IP, tokens, raw text or errors. No individual audit trail, no claim of production incident forensics. No durable logs or background cleanup. Production redacted audit/incident evidence, access/retention and deletion controls require review.

## 11C.4 threat and control review
| Threat | Implemented rehearsal control | Live blocker |
|---|---|---|
| Forged browser identity, role or consent | 11A exact server grant, 11C trusted capability separate | vetted OIDC signature/JWKS, secure BFF session/cookie/CSRF, admin authorization |
| Cross-tenant/group or account mixup | 11A scope/identity, 11B membership before/after | real member token permission & mapping verification |
| Consent withdrawal, change, stale request | version-bound grant, proactive session invalidate, late response denial | distributed atomic storage/coordination, provider cancellation |
| Oversharing or logs | minimized projection, coarse aggregate, no live sink | inventory all telemetry, test browser/cache headers and hosting logs |
| Resource exhaustion or failure | bounded in-memory stores, provider limits, no retries | distributed quotas, rate limit, total deadline, resilience rehearsal |
| Compromised operator | capability separation only, deny-by-default | RBAC, MFA, least privilege, audit/incident process, secrets rotation |
| Fake provider/trust flags | simulation not deployed, no credentials | real OIDC library and independent security review |
| Sensitive or minors data | adult only, exact fields, no care or AI integration | explicit safeguarding/guardian and pastoral consent policies before expansion |

Kill switch disables new login and removes consent; reenable requires fresh opt-in. Existing in-flight provider work may complete but cannot release protected payload. No production access until reviewed incident runbook (disable, contain, preserve approved redacted evidence, notify responsible church/security personnel, assess applicable obligations, recover with new grants). Designated owners and escalation/contact process still to be assigned by church; no invented legal deadline.

## 11C.5 pastoral/AI/minors boundaries
Rally One is not a counselor, emergency monitor, attendance evaluator or substitute for pastor. Current synthetic companion remains separate from any future live data view. No prayer request or private pastoral note retrieval, AI ingestion/training, risk inference, automated message, minor account or guardian mapping. Church leadership must independently approve purpose/consent language, adult eligibility, safeguarding, retention, incident response, authorized roles and future use cases. No policy claim of compliance; independent legal/privacy/security assessment required before real deployment.

## 11C.6 implementation and gate
pilot/s11c-synthetic-privacy.cjs composes the accepted 11A and 11B modules, keeps administrative capabilities separate from member surface, owns consent/aggregate audit, enforces kill switch and minimal response. 11A gains internal invalidateIdentity and sweep; no existing tests removed/weakened. Tests cover explicit consent, invalid notices/purpose, minors, mapping changes, revocation and races, reconsent, deletion, expiry, audit minimization/caps, kill switch, integration and static exclusion. Node/browser CI not yet executed at authoring, exact-head full QA and device gate remain. The current fictional browser UI and immutable reference unchanged; no live provider or deployment. Next 11D resilience; actual HTTP identity/session security, durable storage, real-provider mapping, legal and pastoral review, independently reviewed pilot and explicit authorization remain blockers.
