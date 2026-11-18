import { PrimaryPill } from "../../components/PrimaryPill";
import type { GroupSnapshot, Meeting } from "./types";
import type { BetaRepository } from "./repository";
import { memberName, type RunAction } from "./LiveFeed";
export function LiveMeetings({
  snapshot,
  userId,
  repository,
  run,
  busy,
  leader,
  onEdit,
}: {
  snapshot: GroupSnapshot;
  userId: string;
  repository: BetaRepository;
  run: RunAction;
  busy: boolean;
  leader: boolean;
  onEdit: (m?: Meeting) => void;
}) {
  return (
    <>
      {leader && (
        <PrimaryPill onClick={() => onEdit()}>Create gathering</PrimaryPill>
      )}
      {!snapshot.meetings.length && (
        <p className="privacy-note">No gatherings scheduled yet.</p>
      )}
      {snapshot.meetings.map((m) => {
        const going =
          snapshot.rsvps.find(
            (r) => r.meeting_id === m.id && r.user_id === userId,
          )?.status === "going";
        return (
          <article className="detail-card live-meeting" key={m.id}>
            <p className="eyebrow">{new Date(m.starts_at).toLocaleString()}</p>
            <h3>{m.title}</h3>
            {m.location && <p>{m.location}</p>}
            {m.description && <p>{m.description}</p>}
            <div className="plan-actions">
              <PrimaryPill
                disabled={busy}
                aria-pressed={going}
                onClick={() =>
                  void run(
                    () =>
                      repository.setRsvp(m.id, going ? "not_going" : "going"),
                    "RSVP saved for your group.",
                  )
                }
              >
                {going ? "✓ Going" : "I'm going"}
              </PrimaryPill>
              {leader && (
                <PrimaryPill secondary onClick={() => onEdit(m)}>
                  Edit gathering
                </PrimaryPill>
              )}
            </div>
            <details className="rsvp-list">
              <summary>
                Group RSVPs (
                {
                  snapshot.rsvps.filter(
                    (r) => r.meeting_id === m.id && r.status === "going",
                  ).length
                }{" "}
                going)
              </summary>
              {snapshot.rsvps
                .filter((r) => r.meeting_id === m.id)
                .map((r) => (
                  <p key={r.user_id}>
                    {memberName(snapshot, r.user_id)} ·{" "}
                    {r.status === "going" ? "Going" : "Not going"}
                  </p>
                ))}
            </details>
          </article>
        );
      })}
      <p className="privacy-note">
        Times use your device timezone. RSVPs are visible to this group.
      </p>
    </>
  );
}
