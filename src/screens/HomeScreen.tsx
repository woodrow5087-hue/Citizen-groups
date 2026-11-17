import { Feed } from "../components/Feed";
import { stepOptions } from "./types";
import type { DemoData, Step, Screen } from "./types";
type Props = {
  data: DemoData;
  done: number;
  screen: Screen;
  page: (name: Screen) => void;
  step: (id: Step) => void;
  rsvp: () => void;
  openCheckin: () => void;
};
export function HomeScreen({
  data,
  done,
  screen,
  page,
  step,
  rsvp,
  openCheckin,
}: Props) {
  return (
    <section className="screen current" hidden={screen !== "home"} id="home">
      <div className="hero photo">
        <div className="hero-inner">
          <div className="line"></div>
          <div className="overline light">SMALL GROUPS · LOCAL CONCEPT</div>
          <h1>
            YOU
            <br />
            BELONG
            <br />
            HERE.
          </h1>
          <p>
            Real community doesn't end when the gathering does. Stay connected,
            grow together, and make room for everyone.
          </p>
          <button className="btn" onClick={() => page("group")}>
            GO TO MY GROUP <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Your community</span>
          <h2>Life happens together.</h2>
        </div>
        <span className="tag">Sample group</span>
      </div>
      <div className="two-col">
        <div className="panel">
          <span className="overline">UP NEXT</span>
          <h3>Tuesday Community</h3>
          <p>Tuesday · 6:30 PM · Albuquerque</p>
          <div className="people" aria-label="Fictional example group members">
            <div className="person">AL</div>
            <div className="person">JM</div>
            <div className="person">MC</div>
            <div className="person">TD</div>
            <div className="person">+4</div>
          </div>
          <div className="actionrow">
            <button
              className="btn small"
              onClick={() => rsvp()}
              id="rsvp-button"
              aria-pressed={data.rsvp}
            >
              {data.rsvp ? "✓ GOING" : "I’M GOING"}
            </button>
            <button className="btn small outline" onClick={() => page("group")}>
              GROUP DETAILS
            </button>
          </div>
        </div>
        <div className="red-card">
          <span className="subtext">THIS WEEK'S FOCUS</span>
          <h3>
            MAKE ROOM
            <br />
            FOR SOMEONE.
          </h3>
          <p>Connection starts with an intentional step.</p>
          <button className="btn small white" onClick={() => openCheckin()}>
            CHECK IN WITH YOUR GROUP →
          </button>
        </div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">A simple rhythm</span>
          <h2>Show up for each other.</h2>
        </div>
        <span className="dim" id="progress-caption">
          {done} of 3 steps
        </span>
      </div>
      <div className="tiles" id="steps">
        {stepOptions.map(([id, icon, title, desc]) => (
          <button
            key={id}
            className={data.steps[id] ? "tile is-done" : "tile"}
            aria-pressed={data.steps[id]}
            onClick={() => step(id)}
          >
            <span className="symbol" aria-hidden="true">
              {data.steps[id] ? "✓" : icon}
            </span>
            <strong>{title}</strong>
            <span>{data.steps[id] ? "Done today" : desc}</span>
          </button>
        ))}
      </div>
      <div
        className="progress-track"
        role="progressbar"
        aria-label="Daily check-in progress"
        aria-valuemin={0}
        aria-valuemax={3}
        aria-valuenow={done}
      >
        <div
          className="progress-fill"
          style={{ width: `${(done / 3) * 100}%` }}
        ></div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Join the conversation</span>
          <h2>Around the table.</h2>
        </div>
        <button className="btn small clear" onClick={() => page("group")}>
          VIEW GROUP →
        </button>
      </div>
      <div className="panel" id="home-feed">
        <Feed entries={data.posts} />
      </div>
    </section>
  );
}
