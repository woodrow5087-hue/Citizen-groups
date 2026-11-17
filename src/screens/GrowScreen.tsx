import { Icon } from "../components/Icon";
import { BibleExperience } from "../features/bible/BibleExperience";
import type { BibleController } from "../features/bible/useBible";
import type { VersePreview } from "../features/bible/BibleReader";
import "../features/bible/bible.css";
import type { Step } from "./types";

const rhythm = [
  { id: "reflect", title: "Reflect", sub: "Share a thought" },
  { id: "pray", title: "Pray", sub: "Care for someone" },
  { id: "connect", title: "Connect", sub: "Reach out today" },
] as const;

export function GrowScreen({
  done,
  onStep,
  onGuide,
  bible,
  day,
  onPreview,
}: {
  done: number;
  bible: BibleController;
  day: string;
  onPreview: (p: VersePreview) => void;
  onStep: (s: Step) => void;
  onGuide: () => void;
}) {
  return (
    <section
      className={`screen active ${bible.reading ? "reading-view" : "compact-screen compact-grow"}`}
      aria-label="Grow screen"
    >
      {!bible.reading && (
        <div className="screen-heading">
          <p className="eyebrow"><span className="red-rule" />Grow in faith</p>
          <h1>Grow<span className="accent">.</span></h1>
          <p>One day at a time, together.</p>
        </div>
      )}
      <BibleExperience bible={bible} day={day} onPreview={onPreview} />
      {!bible.reading && (
        <>
          <div className="compact-inline-head">
            <h2>Today’s rhythm</h2>
            <span className="subtle-label">{done} of 3</span>
          </div>
          <div className="compact-rhythm">
            {rhythm.map((item, i) => (
              <button key={item.id} onClick={() => onStep(item.id)}>
                <span className="rhythm-no">0{i + 1}</span>
                <strong>{item.title}</strong>
                <small>{item.sub}</small>
              </button>
            ))}
          </div>
          <button className="compact-guide-link" onClick={onGuide}>
            <Icon name="guide" size="small" />
            Group discussion guide
            <Icon name="chevron" size="tiny" />
          </button>
        </>
      )}
    </section>
  );
}
