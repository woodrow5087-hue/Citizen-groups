import { Icon } from "./Icon";
export function EventCard({ onOpen }: { onOpen: () => void }) {
  return (
    <button className="event-card" onClick={onOpen}>
      <span className="event-date">
        <span>WED</span>
        <strong>18</strong>
        <span>NOV</span>
      </span>
      <span className="event-main">
        <strong>Group gathering</strong>
        <span>7:00 PM · Example location</span>
      </span>
      <span className="event-chevron">
        <Icon name="chevron" />
      </span>
    </button>
  );
}
