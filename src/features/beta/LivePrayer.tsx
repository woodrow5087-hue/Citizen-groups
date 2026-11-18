import { PrimaryPill } from "../../components/PrimaryPill";
import type { GroupSnapshot } from "./types";
import type { BetaRepository } from "./repository";
import { memberName, type RunAction } from "./LiveFeed";
export function LivePrayer({
  snapshot,
  userId,
  repository,
  run,
  busy,
  onCompose,
}: {
  snapshot: GroupSnapshot;
  userId: string;
  repository: BetaRepository;
  run: RunAction;
  busy: boolean;
  onCompose: () => void;
}) {
  return (
    <>
      <p className="privacy-note">
        Requests and acknowledgements are visible to authorized members of{" "}
        {snapshot.group.name}. This is shared group information, not
        confidential counseling. Get consent before sharing another person’s
        details.
      </p>
      <PrimaryPill onClick={onCompose}>Add a prayer request</PrimaryPill>
      {!snapshot.prayers.length && (
        <p className="privacy-note">No prayer requests yet.</p>
      )}
      {snapshot.prayers.map((p) => {
        const acknowledged = snapshot.acknowledgements.some(
          (a) => a.request_id === p.id && a.user_id === userId,
        );
        return (
          <article className="prayer-example" key={p.id}>
            <strong>{memberName(snapshot, p.author_id)}</strong>
            <p>{p.body}</p>
            <div className="plan-actions">
              <PrimaryPill
                secondary
                disabled={busy || acknowledged}
                aria-pressed={acknowledged}
                onClick={() =>
                  void run(
                    () => repository.acknowledge(p.group_id, p.id),
                    "Prayer acknowledgement shared with this group.",
                  )
                }
              >
                {acknowledged ? "✓ You prayed" : "I prayed"}
              </PrimaryPill>
              {p.author_id === userId && (
                <button
                  className="text-link"
                  disabled={busy}
                  onClick={() => {
                    if (
                      window.confirm(
                        "Remove your prayer request from the shared group?",
                      )
                    )
                      void run(
                        () => repository.removeContent("prayer_requests", p.id),
                        "Prayer request removed.",
                      );
                  }}
                  aria-label={`Remove your prayer request: ${p.body}`}
                >
                  Remove request
                </button>
              )}
            </div>
            <small>
              {
                snapshot.acknowledgements.filter((a) => a.request_id === p.id)
                  .length
              }{" "}
              group acknowledgements
            </small>
          </article>
        );
      })}
    </>
  );
}
