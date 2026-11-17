import { Icon } from "../components/Icon";
import { PrimaryPill } from "../components/PrimaryPill";
import type { Step } from "./types";
export function GrowScreen({
  done,
  onStep,
  onGuide,
}: {
  done: number;
  onStep: (s: Step) => void;
  onGuide: () => void;
}) {
  return (
    <section className="screen active" aria-label="Grow screen">
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
      <article className="scripture-card">
        <span className="section-chip">THIS WEEK’S PASSAGE</span>
        <div className="scripture-art">
          <Icon name="guide" size="xl" />
        </div>
        <h2>Romans 12:9–13</h2>
        <p>What does sincere love look like in our ordinary relationships?</p>
        <PrimaryPill onClick={onGuide}>
          Read reflection <Icon name="arrow" size="tiny" />
        </PrimaryPill>
      </article>
      <div className="section-row">
        <h2>Today’s rhythm</h2>
        <span className="subtle-label">{done} of 3</span>
      </div>
      <div className="rhythm-list">
        {(
          [
            { id: "reflect", title: "Reflect", sub: "What's on your heart?" },
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
    </section>
  );
}
