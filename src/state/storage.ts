export const KEY = "citizen-groups-concept-v03";
export type Step = "connect" | "reflect" | "pray";
export interface DemoData {
  day: string;
  steps: Record<Step, boolean>;
  rsvp: boolean;
  posts: string[];
  prayers: { id: string; text: string }[];
  prayed: string[];
  followed: string[];
  notes: string;
  encouraged: string[];
}
export function today() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
export function initialData(): DemoData {
  return {
    day: today(),
    steps: { connect: false, reflect: false, pray: false },
    rsvp: false,
    posts: [],
    prayers: [],
    prayed: [],
    followed: [],
    notes: "",
    encouraged: [],
  };
}
function strings(v: unknown, limit: number): v is string[] {
  return (
    Array.isArray(v) &&
    v.length <= limit &&
    v.every((x) => typeof x === "string")
  );
}
export function parseData(raw: string): DemoData {
  const v = JSON.parse(raw);
  const base = initialData();
  if (
    !v ||
    typeof v !== "object" ||
    typeof v.day !== "string" ||
    typeof v.rsvp !== "boolean" ||
    !v.steps ||
    !(["connect", "reflect", "pray"] as const).every(
      (k) => typeof v.steps[k] === "boolean",
    ) ||
    (v.encouraged !== undefined &&
      (!strings(v.encouraged, 14) ||
        v.encouraged.some((x: string) => x.length > 610))) ||
    !strings(v.posts, 12) ||
    v.posts.some((x: string) => x.length > 600) ||
    !strings(v.prayed, 14) ||
    !strings(v.followed, 2) ||
    v.followed.some((x: string) => !["morgan", "taylor"].includes(x)) ||
    typeof v.notes !== "string" ||
    v.notes.length > 2500 ||
    !Array.isArray(v.prayers) ||
    v.prayers.length > 12 ||
    !v.prayers.every(
      (p: { id: unknown; text: unknown }) =>
        p &&
        typeof p.id === "string" &&
        /^p[\w-]+$/.test(p.id) &&
        typeof p.text === "string" &&
        p.text.length <= 400,
    )
  )
    throw new Error("Invalid demo data");
  const data: DemoData = {
    day: v.day,
    steps: {
      connect: v.steps.connect,
      reflect: v.steps.reflect,
      pray: v.steps.pray,
    },
    rsvp: v.rsvp,
    posts: v.posts,
    prayers: v.prayers,
    prayed: [...new Set<string>(v.prayed)],
    followed: [...new Set<string>(v.followed)],
    notes: v.notes,
    encouraged: [...new Set<string>(v.encouraged ?? [])],
  };
  return data.day === base.day
    ? data
    : { ...data, day: base.day, steps: base.steps, prayed: [] };
}
export function loadData(): { data: DemoData; warning: string } {
  try {
    const raw = localStorage.getItem(KEY);
    return { data: raw ? parseData(raw) : initialData(), warning: "" };
  } catch {
    return {
      data: initialData(),
      warning:
        "Saved demo data could not be loaded. Using fresh fictional examples.",
    };
  }
}
export function saveData(data: DemoData) {
  try {
    localStorage.setItem(KEY, JSON.stringify(data));
    return "";
  } catch {
    return "Changes work for this session, but could not be saved in this browser.";
  }
}
