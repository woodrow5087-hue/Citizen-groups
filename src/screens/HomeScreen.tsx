import { Icon, type IconName } from "../components/Icon";
import { MeetingCard } from "../components/MeetingCard";
import type { DemoData, Step, Screen } from "./types";
type Props = {
  data: DemoData;
  done: number;
  screen: Screen;
  page: (name: Screen) => void;
  step: (id: Step) => void;
  rsvp: () => void;
};
const actions: { id: Step; icon: IconName; title: string; sub: string }[] = [
  { id: "connect", icon: "connect", title: "Check in", sub: "Reach out today" },
  { id: "reflect", icon: "share", title: "Share", sub: "Start a conversation" },
  { id: "pray", icon: "prayer", title: "Pray", sub: "Care for someone" },
];
export function HomeScreen({ data, done, screen, page, step, rsvp }: Props) {
  return (
    <section className="screen" hidden={screen !== "home"} id="home">
      <div className="page-heading">
        <p className="eyebrow">Your everyday community</p>
        <h1>Good to see you.</h1>
        <p>A little connection goes a long way.</p>
      </div>
      <MeetingCard
        going={data.rsvp}
        onRsvp={rsvp}
        onDetails={() => page("group")}
      />
      <div className="section-heading">
        <h2>Make a little room</h2>
        <span className="dim">{done} of 3 today</span>
      </div>
      <div className="quick-actions">
        {actions.map((a) => (
          <button
            key={a.id}
            className={"quick-action " + (data.steps[a.id] ? "is-done" : "")}
            aria-pressed={data.steps[a.id]}
            onClick={() => step(a.id)}
          >
            <span className="action-icon">
              <Icon name={data.steps[a.id] ? "check" : a.icon} size={25} />
            </span>
            <strong>{a.title}</strong>
            <span>{data.steps[a.id] ? "Done today" : a.sub}</span>
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
        />
      </div>
      <div className="focus-card">
        <span className="focus-art" aria-hidden="true">
          <span />
          <span />
          <span />
        </span>
        <div>
          <span className="eyebrow">This week’s intention</span>
          <h2>Make room for someone.</h2>
          <p>A simple invitation can mean a lot.</p>
        </div>
      </div>
      <div className="section-heading">
        <h2>At the table</h2>
        <button className="text-button" onClick={() => page("group")}>
          View group <Icon name="arrow" size={16} />
        </button>
      </div>
      <button className="conversation-preview" onClick={() => page("group")}>
        <span className="ava">{data.posts.length ? "YO" : "AL"}</span>
        <span>
          <strong>
            {data.posts.length ? "You" : "Alex L."}
            <small>Group conversation</small>
          </strong>
          <span className="preview-text">
            {data.posts[0] ||
              "This week I’m thinking about how a simple invitation can change somebody’s day."}
          </span>
        </span>
        <Icon name="arrow" size={18} />
      </button>
    </section>
  );
}
