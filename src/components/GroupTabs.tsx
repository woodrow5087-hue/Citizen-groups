import { useRef } from "react";
import type { GroupTab } from "../screens/types";
export const groupTabs = ["feed", "people", "plan", "resources"] as const;
export function GroupTabs({
  selected,
  onSelect,
}: {
  selected: GroupTab;
  onSelect: (t: GroupTab) => void;
}) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  return (
    <div className="segmented" role="tablist" aria-label="Group sections">
      {groupTabs.map((t, i) => (
        <button
          ref={(el) => {
            refs.current[i] = el;
          }}
          key={t}
          role="tab"
          id={`tab-${t}`}
          aria-controls={`panel-${t}`}
          aria-selected={selected === t}
          tabIndex={selected === t ? 0 : -1}
          className={selected === t ? "selected" : ""}
          onClick={() => onSelect(t)}
          onKeyDown={(e) => {
            const next =
              e.key === "ArrowRight"
                ? (i + 1) % 4
                : e.key === "ArrowLeft"
                  ? (i + 3) % 4
                  : e.key === "Home"
                    ? 0
                    : e.key === "End"
                      ? 3
                      : null;
            if (next !== null) {
              e.preventDefault();
              onSelect(groupTabs[next]);
              refs.current[next]?.focus();
            }
          }}
        >
          {t[0].toUpperCase() + t.slice(1)}
        </button>
      ))}
    </div>
  );
}
