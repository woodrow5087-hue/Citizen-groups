import { findBook, validLocation, type Location } from "./catalog";
export const BIBLE_KEY = "citizen-groups-bible-v05";
export const FONT_SIZES = [16, 18, 20, 22, 24] as const;
export type Reflection = { location: Location; verses: number[]; text: string };
export type BibleData = {
  version: 1;
  location: Location;
  fontSize: number;
  completed: { location: Location; day: string }[];
  reflections: Reflection[];
};
export function initialBible(): BibleData {
  return {
    version: 1,
    location: { book: "ROM", chapter: 12 },
    fontSize: 20,
    completed: [],
    reflections: [],
  };
}
export function validVerses(l: Location, verses: unknown): verses is number[] {
  return (
    Array.isArray(verses) &&
    verses.length <= 20 &&
    new Set(verses).size === verses.length &&
    verses.every(
      (n) =>
        Number.isInteger(n) &&
        findBook(l.book)!.chapters[l.chapter - 1].includes(n),
    )
  );
}
export function parseBible(raw: string): BibleData {
  const d = JSON.parse(raw);
  if (
    !d ||
    d.version !== 1 ||
    !validLocation(d.location) ||
    !FONT_SIZES.some((x) => x === d.fontSize) ||
    !Array.isArray(d.completed) ||
    d.completed.length > 1189 ||
    !d.completed.every(
      (c: { location: Location; day: string }) =>
        c &&
        validLocation(c.location) &&
        typeof c.day === "string" &&
        /^\d{4}-\d{2}-\d{2}$/.test(c.day),
    ) ||
    !Array.isArray(d.reflections) ||
    d.reflections.length > 100 ||
    !d.reflections.every(
      (r: Reflection) =>
        r &&
        validLocation(r.location) &&
        validVerses(r.location, r.verses) &&
        typeof r.text === "string" &&
        r.text.length > 0 &&
        r.text.length <= 2000,
    )
  )
    throw new Error("Invalid Bible state");
  return {
    version: 1,
    location: { ...d.location },
    fontSize: d.fontSize,
    completed: d.completed.map((c: { location: Location; day: string }) => ({
      location: { ...c.location },
      day: c.day,
    })),
    reflections: d.reflections.map((r: Reflection) => ({
      location: { ...r.location },
      verses: [...r.verses].sort((a, b) => a - b),
      text: r.text,
    })),
  };
}
export function loadBible() {
  try {
    const raw = localStorage.getItem(BIBLE_KEY);
    return { data: raw ? parseBible(raw) : initialBible(), warning: "" };
  } catch {
    return {
      data: initialBible(),
      warning:
        "Bible data could not be loaded. Using fresh reader settings; your group demo is unchanged.",
    };
  }
}
export function saveBible(data: BibleData) {
  try {
    localStorage.setItem(BIBLE_KEY, JSON.stringify(data));
    return "";
  } catch {
    return "Bible changes work for this session, but could not be saved on this device.";
  }
}
export function reflectionKey(location: Location, verses: number[]) {
  return `${location.book}:${location.chapter}:${[...verses].sort((a, b) => a - b).join(",")}`;
}
