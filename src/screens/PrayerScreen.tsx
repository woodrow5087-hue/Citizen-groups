import { prayers } from "../data/examples";
import type { DemoData, Screen } from "./types";
type Props = {
  data: DemoData;
  screen: Screen;
  openPrayer: () => void;
  prayFor: (id: string) => void;
};
export function PrayerScreen({ data, screen, openPrayer, prayFor }: Props) {
  return (
    <section
      className="screen current"
      hidden={screen !== "prayer"}
      id="prayer"
    >
      <div className="hero compact">
        <div className="hero-inner">
          <div className="overline light">CARE / CONNECTION</div>
          <h1>
            PRAY FOR
            <br />
            ONE ANOTHER.
          </h1>
          <p>Behind every prayer request is a person—not a metric.</p>
        </div>
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Community care</span>
          <h2>Prayer requests.</h2>
        </div>
        <button className="btn small" onClick={() => openPrayer()}>
          + REQUEST
        </button>
      </div>
      <div id="prayer-list">
        {[...prayers, ...data.prayers.map((p) => ({ ...p, name: "You" }))].map(
          (p) => (
            <article className="prayer-card" key={p.id}>
              <div className="flex-row">
                <strong>{p.name}</strong>
                <span className="chip red">Example prayer circle</span>
              </div>
              <p className="request">{p.text}</p>
              <button
                className="btn small black"
                aria-pressed={data.prayed.includes(p.id)}
                aria-label={`I prayed for ${p.name}: ${p.text}`}
                onClick={() => prayFor(p.id)}
              >
                {data.prayed.includes(p.id) ? "✓ I PRAYED" : "♡ I PRAYED"}
              </button>
            </article>
          ),
        )}
      </div>
      <div className="section-top">
        <div>
          <span className="eyed">Go beyond the app</span>
          <h2>Show up in real life.</h2>
        </div>
      </div>
      <div className="red-card">
        <span className="subtext">THE HEART BEHIND IT</span>
        <h3>
          WE LIVE
          <br />
          TO GIVE.
        </h3>
        <p>
          Pray. Encourage. Bring a meal. Make a call. Sometimes the smallest act
          of care makes the biggest difference.
        </p>
      </div>
    </section>
  );
}
