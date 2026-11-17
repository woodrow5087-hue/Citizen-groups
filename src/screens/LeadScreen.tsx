import { PrimaryPill } from "../components/PrimaryPill";
import { followups } from "../data/examples";
import { Icon } from "../components/Icon";
import type { DemoData, Screen } from "./types";
type Props = {
  data: DemoData;
  screen: Screen;
  openGuide: () => void;
  openNotes: () => void;
  markFollowup: (id: string) => void;
};
export function LeadScreen({
  data,
  screen,
  openGuide,
  openNotes,
  markFollowup,
}: Props) {
  return (
    <section
      className="screen active leader-screen"
      hidden={screen !== "lead"}
      id="lead"
    >
      <div className="leader-heading">
        <span className="leader-badge">
          <Icon name="lead" size="large" />
        </span>
        <div>
          <p className="eyebrow">Leader workspace · Fictional data</p>
          <h1>Lead with care.</h1>
          <p>Wednesday Group</p>
        </div>
      </div>
      <div className="stat-grid">
        <div className="stat">
          <strong>8</strong>
          <small>Members</small>
        </div>
        <div className="stat">
          <strong>1</strong>
          <small>Gathering</small>
        </div>
        <div className="stat">
          <strong>{2 - data.followed.length}</strong>
          <small>Follow-ups</small>
        </div>
      </div>
      <div className="section-heading">
        <h2>People to connect with</h2>
      </div>
      <div className="panel followups">
        {followups.map((p) => (
          <div className="followup" key={p.id}>
            <div className="followup-person">
              <span className="ava">
                {p.name
                  .split(" ")
                  .map((n) => n[0])
                  .join("")}
              </span>
              <div>
                <strong>{p.name}</strong>
                <small>{p.why}</small>
              </div>
            </div>
            <PrimaryPill
              secondary={data.followed.includes(p.id)}
              aria-label={`Mark ${p.name} reached`}
              aria-pressed={data.followed.includes(p.id)}
              onClick={() => markFollowup(p.id)}
            >
              <Icon
                name={data.followed.includes(p.id) ? "check" : "connect"}
                size="small"
              />
              {data.followed.includes(p.id) ? "Reached" : "Mark reached"}
            </PrimaryPill>
          </div>
        ))}
      </div>
      <div className="section-heading">
        <h2>Ready for Wednesday</h2>
      </div>
      <div className="stack">
        <button className="resource-row" onClick={openGuide}>
          <span className="action-icon">
            <Icon name="guide" />
          </span>
          <span>
            <strong>Discussion guide</strong>
            <small>Belonging & making space</small>
          </span>
          <Icon name="arrow" size="small" />
        </button>
        <button className="resource-row" onClick={openNotes}>
          <span className="action-icon">
            <Icon name="note" />
          </span>
          <span>
            <strong>My notes</strong>
            <small>Your local planning space</small>
          </span>
          <Icon name="arrow" size="small" />
        </button>
      </div>
      <p className="context-note">
        Demo workspace, visible to everyone. Use fictional notes only.
      </p>
    </section>
  );
}
