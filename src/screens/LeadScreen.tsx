import { followups } from "../data/examples";
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
    <section className="screen current" hidden={screen !== "lead"} id="lead">
      <div className="hero compact">
        <div className="hero-inner">
          <div className="overline light">LEADER VIEW / SAMPLE DATA</div>
          <h1>
            PEOPLE
            <br />
            OVER NUMBERS.
          </h1>
          <p>
            Give group leaders practical tools without treating spiritual growth
            as a score.
          </p>
        </div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Your group at a glance</span>
          <h2>This week's pulse.</h2>
        </div>
        <span className="tag">Demo only</span>
      </div>
      <div className="stat-grid">
        <div className="stat">
          <strong>08</strong>
          <small>Members</small>
        </div>
        <div className="stat">
          <strong>01</strong>
          <small>Gathering</small>
        </div>
        <div className="stat">
          <strong id="followups-count">
            {String(2 - data.followed.length).padStart(2, "0")}
          </strong>
          <small>Follow-ups</small>
        </div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Care with intention</span>
          <h2>People to connect with.</h2>
        </div>
      </div>
      <div className="panel" id="followups">
        {followups.map((p) => (
          <div className="followup" key={p.id}>
            <div className="ava" aria-hidden="true">
              {p.name
                .split(" ")
                .map((n) => n[0])
                .join("")}
            </div>
            <div className="left">
              <div className="name">{p.name}</div>
              <div className="sub">{p.why} · Sample</div>
            </div>
            <button
              className="btn small black"
              aria-label={`Mark ${p.name} reached`}
              aria-pressed={data.followed.includes(p.id)}
              onClick={() => markFollowup(p.id)}
            >
              {data.followed.includes(p.id) ? "✓ DONE" : "MARK REACHED"}
            </button>
          </div>
        ))}
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Come prepared</span>
          <h2>Leader resources.</h2>
        </div>
      </div>
      <div className="panel">
        <h3>Tuesday's discussion</h3>
        <p>Belonging, community, and making space for others.</p>
        <div className="actionrow">
          <button className="btn small" onClick={() => openGuide()}>
            DISCUSSION GUIDE
          </button>
          <button className="btn small outline" onClick={() => openNotes()}>
            MY NOTES
          </button>
        </div>
      </div>
      <div className="demo-note">
        <b>Privacy first.</b> This leader dashboard is mock data. A real version
        must use consent, secure group permissions, and private-by-default
        prayer and care information. Leaders should not see someone's personal
        devotional history.
      </div>
    </section>
  );
}
