import { Icon, type IconName } from "./Icon";
export function ActionTile({
  title,
  subtitle,
  icon,
  primary = false,
  completed = false,
  onClick,
}: {
  title: string;
  subtitle: string;
  icon: IconName;
  primary?: boolean;
  completed?: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className={`action-tile ${primary ? "action-red" : "action-dark"} ${completed ? "completed" : ""}`}
      aria-pressed={completed}
      onClick={onClick}
    >
      <Icon name={icon} size="large" />
      <strong>{title}</strong>
      <small>{subtitle}</small>
      <span className="tile-tick" aria-hidden="true" />
    </button>
  );
}
