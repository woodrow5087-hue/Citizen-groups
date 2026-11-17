import flag from "../assets/citizen-flag-reference.png";
import { Icon } from "./Icon";
import { Avatars } from "./Avatars";
export function GroupHero({ onOpen }: { onOpen: () => void }) {
  return (
    <button
      className="group-hero"
      onClick={onOpen}
      aria-label="Open Wednesday Group"
    >
      <div className="hero-top">
        <span className="section-chip">
          <span className="live-dot" />
          Your circle
        </span>
        <span className="hero-arrow">
          <Icon name="upRight" size="small" />
        </span>
      </div>
      <div className="hero-content">
        <div className="hero-title">Wednesday Group<span className="accent">.</span></div>
      </div>
      <div className="hero-bottom">
        <Avatars />
        <span className="member-label">8 people</span>
      </div>
      <img className="hero-watermark" src={flag} alt="" />
    </button>
  );
}
