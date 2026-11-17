import { posts } from "../data/examples";
export function Feed({ entries }: { entries: string[] }) {
  return (
    <>
      {[
        ...entries.map((text) => ({ name: "You", initial: "YO", text })),
        ...posts,
      ].map((p, i) => (
        <div className="feeditem" key={i}>
          <div className="ava" aria-hidden="true">
            {p.initial}
          </div>
          <div>
            <strong>{p.name}</strong>{" "}
            <span className="chip">
              {p.name === "You" ? "Your demo post" : "Example post"}
            </span>
            <p>{p.text}</p>
          </div>
        </div>
      ))}
    </>
  );
}
