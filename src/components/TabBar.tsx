import type { Screen } from "../screens/types";
import { Icon } from "./Icon";
const tabs = [
  { id: "today", label: "Today", icon: "home" },
  { id: "group", label: "My Group", icon: "group" },
  { id: "grow", label: "Grow", icon: "guide" },
  { id: "you", label: "You", icon: "user" },
] as const;
export function TabBar({
  screen,
  onNavigate,
  inert,
}: {
  screen: Screen;
  onNavigate: (s: Screen) => void;
  inert: boolean;
}) {
  return (
    <nav className="tabbar" aria-label="Main navigation" inert={inert}>
      {tabs.map((t) => (
        <button
          key={t.id}
          className={`tab ${screen === t.id ? "active" : ""}`}
          aria-current={screen === t.id ? "page" : undefined}
          onClick={() => onNavigate(t.id)}
        >
          <Icon name={t.icon} />
          <span>{t.label}</span>
        </button>
      ))}
    </nav>
  );
}
