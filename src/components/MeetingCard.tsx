import { Icon } from "./Icon";
export function MeetingCard({
  going,
  onRsvp,
  onDetails,
}: {
  going: boolean;
  onRsvp: () => void;
  onDetails?: () => void;
}) {
  return (
    <article className="meeting-card">
      <div className="meeting-top">
        <span className="date-icon">
          <Icon name="calendar" size={26} />
        </span>
        <div>
          <span className="eyebrow">Next gathering</span>
          <h2>Tuesday Community</h2>
          <p>Tuesday · 6:30 PM</p>
        </div>
        <span className="live-dot" aria-label="Fictional gathering" />
      </div>
      <div className="meeting-meta">
        <span>Albuquerque</span>
        <span>8 example members</span>
      </div>
      <div className="actionrow">
        <button
          className={"btn " + (going ? "outline" : "")}
          aria-pressed={going}
          onClick={onRsvp}
        >
          {going ? (
            <>
              <Icon name="check" size={18} /> Going
            </>
          ) : (
            "I’m going"
          )}
        </button>
        {onDetails && (
          <button className="btn outline" onClick={onDetails}>
            Go to my group <Icon name="arrow" size={16} />
          </button>
        )}
      </div>
    </article>
  );
}
