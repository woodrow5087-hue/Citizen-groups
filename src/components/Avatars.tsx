export const members = [
  { initial: "AL", name: "Alex L.", color: "red" },
  { initial: "JM", name: "Jordan M.", color: "peach" },
  { initial: "MC", name: "Morgan C.", color: "blue" },
  { initial: "TD", name: "Taylor D.", color: "olive" },
];
export function Avatars() {
  return (
    <div className="stacked-avatars" aria-label="Eight fictional group members">
      {members.map((m) => (
        <span
          key={m.initial}
          className={`member-avatar mv-${m.color}`}
          aria-hidden="true"
        >
          {m.initial}
        </span>
      ))}
      <span className="member-avatar more" aria-hidden="true">
        +4
      </span>
    </div>
  );
}
