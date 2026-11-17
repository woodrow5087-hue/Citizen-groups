import { GroupHero } from "../components/GroupHero";
import { ActionTile } from "../components/ActionTile";
import { EventCard } from "../components/EventCard";
import { PostCard } from "../components/PostCard";
import { Icon } from "../components/Icon";
import { groupPosts, posts } from "../data/examples";
import type { DemoData, Step } from "./types";
export function TodayScreen({
  data,
  done,
  onGroup,
  onPlan,
  onStep,
  onEncourage,
  onReply,
}: {
  data: DemoData;
  done: number;
  onGroup: () => void;
  onPlan: () => void;
  onStep: (s: Step) => void;
  onEncourage: (id: string) => void;
  onReply: () => void;
}) {
  const recent = data.posts.length ? groupPosts(data.posts)[0] : posts[1];
  return (
    <section className="screen active" aria-label="Today screen">
      <div className="intro">
        <p className="eyebrow">
          <span className="red-rule" />
          Your community, today
        </p>
        <h1>
          Hey, Jonathan<span className="accent">.</span>
        </h1>
        <p>Good things happen when we show up for each other.</p>
      </div>
      <GroupHero onOpen={onGroup} />
      <div className="section-row">
        <h2>Keep connected</h2>
        <span className="subtle-label" role="status">
          {done} of 3 today
        </span>
      </div>
      <div className="action-grid">
        <ActionTile
          title="Check in"
          subtitle="Reach out"
          icon="check"
          primary
          completed={data.steps.connect}
          onClick={() => onStep("connect")}
        />
        <ActionTile
          title="Share"
          subtitle="Start a conversation"
          icon="message"
          completed={data.steps.reflect}
          onClick={() => onStep("reflect")}
        />
        <ActionTile
          title="Pray"
          subtitle="Care for someone"
          icon="prayer"
          completed={data.steps.pray}
          onClick={() => onStep("pray")}
        />
      </div>
      <div className="section-row">
        <h2>Coming up</h2>
        <button className="text-link" onClick={onPlan}>
          See details <Icon name="arrow" size="tiny" />
        </button>
      </div>
      <EventCard onOpen={onPlan} />
      <div className="section-row">
        <h2>From your circle</h2>
        <button className="text-link" onClick={onGroup}>
          Go to feed <Icon name="arrow" size="tiny" />
        </button>
      </div>
      <PostCard
        post={recent}
        preview
        encouraged={data.encouraged.includes(recent.id)}
        onEncourage={() => onEncourage(recent.id)}
        onReply={onReply}
      />
    </section>
  );
}
