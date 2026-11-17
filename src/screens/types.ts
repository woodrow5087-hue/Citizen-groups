import type { Step } from "../state/storage";
export type { Step, DemoData } from "../state/storage";
export type Screen = "home" | "group" | "prayer" | "lead";
export const stepOptions: [Step, string, string, string][] = [
  ["connect", "↗", "Connect", "Reach out to someone today."],
  ["reflect", "✎", "Reflect", "Share one honest thought."],
  ["pray", "♡", "Pray", "Make room for someone else."],
];
