import { Avatars, members } from "../components/Avatars";
import { GroupTabs, groupTabs } from "../components/GroupTabs";
import { PrimaryPill } from "../components/PrimaryPill";
import { PostCard } from "../components/PostCard";
import { Icon } from "../components/Icon";
import { groupPosts } from "../data/examples";
import type { DemoData, GroupTab } from "./types";
type Props = {
  data: DemoData;
  tab: GroupTab;
  onTab: (t: GroupTab) => void;
  rsvp: () => void;
  openGuide: () => void;
  openPost: () => void;
  openInvite: () => void;
  onEncourage: (id: string) => void;
  onReply: () => void;
  onConnect: () => void;
};
export function GroupScreen({
  data,
  tab,
  onTab,
  rsvp,
  openGuide,
  openPost,
  openInvite,
  onEncourage,
  onReply,
  onConnect,
}: Props) {
  return (
    <section className="screen active compact-group" aria-label="My Group screen">
      <div className="screen-heading">
        <p className="eyebrow">
          <span className="red-rule" />
          My circle
        </p>
        <h1>My Group<span className="accent">.</span></h1>
        <p>Wednesday Group · 8 fictional members</p>
      </div>
      <div className="group-members">
        <Avatars />
        <button className="small-btn" onClick={openInvite}>
          <Icon name="plus" size="tiny" />
          Invite
        </button>
      </div>
      <GroupTabs selected={tab} onSelect={onTab} />
      {groupTabs.map((t) => (
        <div
          key={t}
          id={`panel-${t}`}
          role="tabpanel"
          aria-labelledby={`tab-${t}`}
          tabIndex={0}
          hidden={tab !== t}
        >
          {t === "feed" ? (
            <>
              <button className="compose" onClick={openPost}>
                <span className="avatar small">JW</span>
                <span>Share something with your group...</span>
                <Icon name="plus" />
              </button>
              {groupPosts(data.posts).map((p, i) => (
                <PostCard
                  key={`${p.id}-${i}`}
                  post={p}
                  encouraged={data.encouraged.includes(p.id)}
                  onEncourage={() => onEncourage(p.id)}
                  onReply={onReply}
                />
              ))}
            </>
          ) : t === "people" ? (
            <>
              <div className="section-row">
                <h2>Your people</h2>
                <span className="subtle-label">Demo members</span>
              </div>
              <div className="people-list">
                {members.map((m) => (
                  <div className="person-row" key={m.initial}>
                    <span className={`member-avatar mv-${m.color}`}>
                      {m.initial}
                    </span>
                    <span>
                      <strong>{m.name}</strong>
                      <small>Group member</small>
                    </span>
                    <button
                      className="tiny-action"
                      aria-label={`Encourage ${m.name}`}
                      onClick={onConnect}
                    >
                      Encourage
                    </button>
                  </div>
                ))}
              </div>
              <p className="privacy-note">
                Four of eight fictional members shown.
              </p>
            </>
          ) : t === "plan" ? (
            <>
              <div className="section-row">
                <h2>Next gathering</h2>
              </div>
              <article className="detail-card">
                <span className="eyebrow">
                  WED · NOV 18 · 7:00 PM · FICTIONAL
                </span>
                <h3>Showing up together.</h3>
                <p>Example location · Albuquerque</p>
                <div className="plan-actions">
                  <PrimaryPill aria-pressed={data.rsvp} onClick={rsvp}>
                    {data.rsvp ? "✓ Going" : "I'm going"}
                  </PrimaryPill>
                  <PrimaryPill secondary onClick={openGuide}>
                    View discussion guide
                  </PrimaryPill>
                </div>
              </article>
              <p className="privacy-note">
                Demo RSVP only. No invitations or messages are sent.
              </p>
            </>
          ) : (
            <>
              <div className="section-row">
                <h2>Resources</h2>
              </div>
              <button className="resource-card" onClick={openGuide}>
                <span className="resource-icon">
                  <Icon name="guide" />
                </span>
                <span>
                  <strong>Discussion guide</strong>
                  <small>Belonging, listening, and making room</small>
                </span>
                <Icon name="chevron" />
              </button>
              <button className="resource-card" onClick={openInvite}>
                <span className="resource-icon">
                  <Icon name="group" />
                </span>
                <span>
                  <strong>Invite a friend</strong>
                  <small>How group invitations could work</small>
                </span>
                <Icon name="chevron" />
              </button>
            </>
          )}
        </div>
      ))}
    </section>
  );
}
