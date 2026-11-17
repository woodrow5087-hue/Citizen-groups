import { Feed } from "../components/Feed";
import type { DemoData, Screen } from "./types";
type Props = {
  data: DemoData;
  screen: Screen;
  rsvp: () => void;
  openGuide: () => void;
  openPost: () => void;
  openInvite: () => void;
};
export function GroupScreen({
  data,
  screen,
  rsvp,
  openGuide,
  openPost,
  openInvite,
}: Props) {
  return (
    <section className="screen current" hidden={screen !== "group"} id="group">
      <div className="hero compact">
        <span className="corner">+</span>
        <div className="hero-inner">
          <div className="overline light">MY COMMUNITY / DEMO GROUP</div>
          <h1>
            BETTER
            <br />
            TOGETHER.
          </h1>
          <p>Tuesday Community · 8 example members</p>
        </div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Next gathering</span>
          <h2>You're invited in.</h2>
        </div>
        <span className="tag">Tuesday · 6:30</span>
      </div>
      <div className="panel">
        <span className="overline">THIS WEEK AT CITIZEN</span>
        <h3>A place to belong.</h3>
        <p>
          Theme: Making room for people. Open with one question: When did you
          last feel truly welcomed?
        </p>
        <div className="rsvp" id="rsvp-message">
          {data.rsvp
            ? "You marked yourself as going. Demo only—no real RSVP was sent."
            : "RSVP not selected · This is a demo gathering."}
        </div>
        <div className="actionrow" style={{ marginTop: "14px" }}>
          <button className="btn small" onClick={() => openGuide()}>
            DISCUSSION GUIDE
          </button>
          <button
            className="btn small outline"
            onClick={() => rsvp()}
            id="rsvp-group-button"
            aria-pressed={data.rsvp}
          >
            {data.rsvp ? "✓ GOING" : "I’M GOING"}
          </button>
        </div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Stay connected</span>
          <h2>Group conversation.</h2>
        </div>
        <button className="btn small" onClick={() => openPost()}>
          + SHARE
        </button>
      </div>
      <div className="panel" id="feed">
        <Feed entries={data.posts} />
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">The people</span>
          <h2>You're not alone.</h2>
        </div>
        <span className="tag">Example members</span>
      </div>
      <div className="panel">
        <div className="people">
          <div className="person">AL</div>
          <div className="person">JM</div>
          <div className="person">MC</div>
          <div className="person">TD</div>
          <div className="person">+4</div>
        </div>
        <p>
          Eight fictional group members. Invite features and membership
          permissions will be added after we establish secure accounts.
        </p>
        <button className="btn outline small" onClick={() => openInvite()}>
          HOW INVITATIONS COULD WORK
        </button>
      </div>
    </section>
  );
}
