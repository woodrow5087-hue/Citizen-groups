import { Icon, type IconName } from "../components/Icon";
import type { DemoData } from "./types";
export function YouScreen({
  data,
  onAbout,
  onReset,
  onLeader,
  onPrayer,
}: {
  data: DemoData;
  onAbout: () => void;
  onReset: () => void;
  onLeader: () => void;
  onPrayer: () => void;
}) {
  const tools: {
    title: string;
    sub: string;
    icon: IconName;
    action: () => void;
  }[] = [
    {
      title: "About this concept",
      sub: "What works and what is fictional",
      icon: "info",
      action: onAbout,
    },
    {
      title: "Prayer circle",
      sub: "Example requests & local acknowledgements",
      icon: "prayer",
      action: onPrayer,
    },
    {
      title: "Leader tools · Demo only",
      sub: "Fictional follow-ups and local planning notes",
      icon: "lead",
      action: onLeader,
    },
    {
      title: "Reset demo data",
      sub: "Clear local actions, posts and notes",
      icon: "reset",
      action: onReset,
    },
  ];
  return (
    <section className="screen active" aria-label="You screen">
      <div className="profile-top">
        <span className="avatar profile-large">JW</span>
        <div>
          <p className="eyebrow">Your space</p>
          <h1>
            Jonathan<span className="accent">.</span>
          </h1>
          <p>Fictional member · Local demo</p>
        </div>
      </div>
      <div className="section-row">
        <h2>My activity</h2>
      </div>
      <div className="my-week">
        <div>
          <strong>{Number(data.steps.connect)}</strong>
          <small>Check-in today</small>
        </div>
        <div>
          <strong>{data.posts.length}</strong>
          <small>Saved reflections</small>
        </div>
        <div>
          <strong>{data.prayed.length}</strong>
          <small>Prayers today</small>
        </div>
      </div>
      <div className="section-row">
        <h2>Settings & tools</h2>
      </div>
      {tools.map((t) => (
        <button className="resource-card" key={t.title} onClick={t.action}>
          <span className="resource-icon">
            <Icon name={t.icon} />
          </span>
          <span>
            <strong>{t.title}</strong>
            <small>{t.sub}</small>
          </span>
          <Icon name="chevron" />
        </button>
      ))}
      <p className="privacy-note">
        Unofficial internal concept. Use fictional details only. No real
        accounts or secure prayer storage.
      </p>
    </section>
  );
}
