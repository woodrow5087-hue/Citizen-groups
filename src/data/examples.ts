import type { Post } from "../components/PostCard";
export const posts: Post[] = [
  {
    id: "alex",
    name: "Alex L.",
    initial: "AL",
    color: "red",
    time: "Yesterday",
    text: "Our conversation last night really encouraged me. Appreciate this group.",
  },
  {
    id: "jordan",
    name: "Jordan M.",
    initial: "JM",
    color: "peach",
    time: "2h ago",
    text: "Had a meaningful conversation today. Grateful for the people who show up and listen.",
  },
];
export function groupPosts(entries: string[]): Post[] {
  return [
    ...entries.map((text) => ({
      id: "post:" + text,
      name: "You",
      initial: "JW",
      color: "red",
      time: "Saved locally",
      text,
    })),
    ...posts,
  ];
}
export const prayers = [
  {
    id: "a",
    name: "Alex L.",
    text: "Wisdom and peace during a busy season with family.",
  },
  {
    id: "b",
    name: "Jordan M.",
    text: "Praying for courage to have an important conversation.",
  },
];
export const followups = [
  { id: "morgan", name: "Morgan C.", why: "Opted in to a friendly follow-up" },
  { id: "taylor", name: "Taylor D.", why: "New member welcome" },
];
