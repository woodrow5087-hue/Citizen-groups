import { prayers } from "../data/examples";
import { PrimaryPill } from "./PrimaryPill";
import type { DemoData } from "../state/storage";
export function PrayerCircle({
  data,
  onPray,
  onRequest,
  onComplete,
}: {
  data: DemoData;
  onPray: (id: string) => void;
  onRequest: () => void;
  onComplete: () => void;
}) {
  return (
    <>
      <p>
        Take a moment for someone in your circle. These are fictional requests,
        saved on this device only.
      </p>
      {[...data.prayers.map((p) => ({ ...p, name: "You" })), ...prayers].map(
        (p) => (
          <article className="prayer-example" key={p.id}>
            <strong>{p.name}</strong>
            <p>{p.text}</p>
            <PrimaryPill
              secondary
              aria-pressed={data.prayed.includes(p.id)}
              aria-label={`I prayed for ${p.name}: ${p.text}`}
              onClick={() => onPray(p.id)}
            >
              {data.prayed.includes(p.id)
                ? "✓ I prayed today"
                : `I prayed for ${p.name}`}
            </PrimaryPill>
          </article>
        ),
      )}
      <div className="plan-actions">
        <PrimaryPill onClick={onComplete}>
          Mark prayer time complete
        </PrimaryPill>
        <PrimaryPill secondary onClick={onRequest}>
          Share a request
        </PrimaryPill>
      </div>
    </>
  );
}
