import { prayers } from "../data/examples";
import { Icon } from "../components/Icon";
import type { DemoData, Screen } from "./types";
type Props = {
  data: DemoData;
  screen: Screen;
  openPrayer: () => void;
  prayFor: (id: string) => void;
};
export function PrayerScreen({ data, screen, openPrayer, prayFor }: Props) {
  return (
    <section className="screen" hidden={screen !== "prayer"} id="prayer">
      <div className="page-heading">
        <p className="eyebrow">Care & connection</p>
        <h1>Prayer</h1>
        <p>Hold a little space for one another.</p>
      </div>
      <button className="btn full" onClick={openPrayer}>
        <Icon name="plus" size={20} /> Add a request
      </button>
      <p className="context-note">
        Fictional prayer circle · Saved on this device only
      </p>
      <div className="prayer-list">
        {[...data.prayers.map((p) => ({ ...p, name: "You" })), ...prayers].map(
          (p) => {
            const prayed = data.prayed.includes(p.id);
            return (
              <article
                className={"prayer-card " + (prayed ? "acknowledged" : "")}
                key={p.id}
              >
                <div className="prayer-person">
                  <span className="ava">
                    {p.name === "You" ? "YO" : p.name.slice(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <strong>{p.name}</strong>
                    <small>Example request</small>
                  </div>
                  <Icon name="prayer" size={20} />
                </div>
                <p className="request">{p.text}</p>
                <button
                  className="btn outline"
                  aria-pressed={prayed}
                  aria-label={`I prayed for ${p.name}: ${p.text}`}
                  onClick={() => prayFor(p.id)}
                >
                  <Icon name={prayed ? "check" : "prayer"} size={18} />
                  {prayed ? "I prayed today" : "I prayed"}
                </button>
              </article>
            );
          },
        )}
      </div>
      <p className="quiet-note">
        An encouraging message. A meal. A call.
        <br />
        Care can continue beyond this screen.
      </p>
    </section>
  );
}
