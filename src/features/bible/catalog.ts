import catalog from "../../data/web/catalog.json";
export const books = catalog;
export type Location = { book: string; chapter: number };
export type Verse = { number: number; text: string };
export type BookText = Record<string, Verse[]>;
export function findBook(id: string) {
  return books.find((b) => b.id === id);
}
export function validLocation(value: unknown): value is Location {
  if (!value || typeof value !== "object") return false;
  const l = value as Location;
  const book = findBook(l.book);
  return (
    !!book &&
    Number.isInteger(l.chapter) &&
    l.chapter >= 1 &&
    l.chapter <= book.chapters.length
  );
}
export function locationKey(l: Location) {
  return `${l.book}:${l.chapter}`;
}
export function verseRange(verses: number[]) {
  const sorted = [...new Set(verses)].sort((a, b) => a - b);
  const parts: string[] = [];
  for (let i = 0; i < sorted.length; i++) {
    const start = sorted[i];
    let end = start;
    while (sorted[i + 1] === end + 1) end = sorted[++i];
    parts.push(start === end ? String(start) : `${start}–${end}`);
  }
  return parts.join(", ");
}
export function reference(l: Location, verses: number[] = []) {
  return `${findBook(l.book)?.name ?? l.book} ${l.chapter}${verses.length ? ":" + verseRange(verses) : ""}`;
}
export function adjacent(l: Location, direction: -1 | 1): Location | null {
  const i = books.findIndex((b) => b.id === l.book);
  const chapter = l.chapter + direction;
  if (chapter >= 1 && chapter <= books[i].chapters.length)
    return { ...l, chapter };
  const book = books[i + direction];
  return book
    ? { book: book.id, chapter: direction === 1 ? 1 : book.chapters.length }
    : null;
}
const passages = [
  { book: "ROM", chapter: 12, verses: [9, 10, 11, 12, 13] },
  { book: "PSA", chapter: 23, verses: [1, 2, 3, 4, 5, 6] },
  { book: "MAT", chapter: 5, verses: [14, 15, 16] },
  { book: "JHN", chapter: 15, verses: [9, 10, 11, 12] },
  { book: "PHP", chapter: 4, verses: [4, 5, 6, 7] },
  { book: "MIC", chapter: 6, verses: [8] },
  { book: "1CO", chapter: 13, verses: [4, 5, 6, 7] },
];
export function dailyPassage(day: string) {
  const index = Math.floor(Date.parse(day + "T00:00:00Z") / 86400000);
  return passages[
    ((index % passages.length) + passages.length) % passages.length
  ];
}
const loaders = import.meta.glob<{ default: BookText }>(
  "../../data/web/books/*.json",
);
export async function loadBook(id: string): Promise<BookText> {
  if (!findBook(id)) throw new Error("Unknown Bible book");
  const loader = loaders[`../../data/web/books/${id}.json`];
  if (!loader) throw new Error("Book unavailable");
  return (await loader()).default;
}
