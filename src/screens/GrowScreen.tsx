import { Icon } from "../components/Icon";
import { BibleExperience } from "../features/bible/BibleExperience";
import type { BibleController } from "../features/bible/useBible";
import type { VersePreview } from "../features/bible/BibleReader";
import "../features/bible/bible.css";
import type { Step } from "./types";
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
    <section className="screen active" aria-label="Grow screen">
      {!bible.reading && (
        <div className="screen-heading">
          <p className="eyebrow">
            <span className="red-rule" />
            Grow in faith
          </p>
          <h1>
            One day
            <br />
            at a time<span className="accent">.</span>
          </h1>
          <p>A simple rhythm that fits your real life.</p>
        </div>
      )}
      <BibleExperience bible={bible} day={day} onPreview={onPreview} />
      {!bible.reading && (
        <button className="text-link" onClick={onGuide}>
          Open group discussion guide
        </button>
      )}
      {!bible.reading && (
        <>
          <div className="section-row">
            <h2>Today’s rhythm</h2>
            <span className="subtle-label">{done} of 3</span>
          </div>
          <div className="rhythm-list">
            {(
              [
                {
                  id: "reflect",
                  title: "Reflect",
                  sub: "What's on your heart?",
                },
                {
                  id: "pray",
                  title: "Pray",
                  sub: "Care for someone in your circle",
                },
                {
                  id: "connect",
                  title: "Connect",
                  sub: "Take a small step toward someone",
                },
              ] as const
            ).map((r, i) => (
              <button key={r.id} onClick={() => onStep(r.id)}>
                <span className="rhythm-no">0{i + 1}</span>
                <span>
                  <strong>{r.title}</strong>
                  <small>{r.sub}</small>
                </span>
                <Icon name="chevron" />
              </button>
            ))}
          </div>
          <p className="privacy-note">
            No competitive spiritual scores. Just a reminder to stay connected.
          </p>
        </>
      )}
    </section>
  );
}
