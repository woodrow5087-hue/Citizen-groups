import { Feed } from "../components/Feed";
import { Icon } from "../components/Icon";
import { MeetingCard } from "../components/MeetingCard";
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
    <section className="screen" hidden={screen !== "group"} id="group">
      <div className="page-heading">
        <p className="eyebrow">My group</p>
        <h1>Tuesday Community</h1>
        <p>A place to belong. People to do life with.</p>
      </div>
      <div className="members-strip">
        <div className="people" aria-label="Eight fictional members">
          {["AL", "JM", "MC", "TD", "+4"].map((n) => (
            <span className="person" key={n}>
              {n}
            </span>
          ))}
        </div>
        <button className="text-button" onClick={openInvite}>
          Invite info <Icon name="plus" size={16} />
        </button>
      </div>
      <MeetingCard going={data.rsvp} onRsvp={rsvp} />
      <button className="resource-row" onClick={openGuide}>
        <span className="action-icon">
          <Icon name="guide" />
        </span>
        <span>
          <strong>A place to belong</strong>
          <small>This week’s discussion guide</small>
        </span>
        <Icon name="arrow" size={18} />
      </button>
      <div className="section-heading">
        <h2>Conversation</h2>
        <span className="tag">Local only</span>
      </div>
      <button className="compose-button" onClick={openPost}>
        <span className="ava self">YO</span>
        <span>Share something with your group</span>
        <Icon name="share" size={20} />
      </button>
      <div className="panel feed" id="feed">
        <Feed entries={data.posts} />
      </div>
    </section>
  );
}
