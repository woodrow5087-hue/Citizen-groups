import flag from "../assets/citizen-flag-reference.png";
import { Icon } from "./Icon";
export function BrandHeader({
  onMessages,
  onProfile,
}: {
  onMessages: () => void;
  onProfile: () => void;
}) {
  return (
    <header className="app-header">
      <div
        className="brand-lockup"
        aria-label="Citizen Groups unofficial concept"
      >
        <img
          className="flag-logo"
          src={flag}
          alt="Citizen flag, internal concept use"
        />
        <div className="brand-text">
          <strong>CITIZEN</strong>
          <span>
            GROUPS <b>· UNOFFICIAL</b>
          </span>
        </div>
      </div>
      <div className="header-actions">
        <button
          className="round-button"
          onClick={onMessages}
          aria-label="Show demo messages"
        >
          <Icon name="message" />
        </button>
        <button
          className="avatar avatar-button"
          onClick={onProfile}
          aria-label="My profile"
        >
          JW
        </button>
      </div>
    </header>
  );
}
