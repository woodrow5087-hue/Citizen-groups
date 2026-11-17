import { describe, it, expect, vi } from "vitest";
import {
  BIBLE_KEY,
  initialBible,
  parseBible,
  loadBible,
  saveBible,
} from "./storage";
describe("private local Bible state", () => {
  it("loads valid settings, progress and reflections independently of group data", () => {
    const d = initialBible();
    d.fontSize = 24;
    d.completed = [{ location: d.location, day: "2026-11-17" }];
    d.reflections = [
      { location: d.location, verses: [9], text: "Fictional personal note" },
    ];
    localStorage.setItem(BIBLE_KEY, JSON.stringify(d));
    expect(loadBible().data).toEqual(d);
  });
  it("rejects corrupted data, unknown books, invalid chapters, verses, font sizes and long notes", () => {
    expect(() => parseBible("{bad")).toThrow();
    for (const change of [
      { location: { book: "FAKE", chapter: 1 } },
      { location: { book: "GEN", chapter: 51 } },
      { fontSize: 30 },
      {
        reflections: [
          {
            location: { book: "LUK", chapter: 17 },
            verses: [36],
            text: "Absent source verse",
          },
        ],
      },
      {
        reflections: [
          {
            location: { book: "GEN", chapter: 1 },
            verses: [1],
            text: "a".repeat(2001),
          },
        ],
      },
    ])
      expect(() =>
        parseBible(JSON.stringify({ ...initialBible(), ...change })),
      ).toThrow();
    localStorage.setItem(BIBLE_KEY, "null");
    expect(loadBible().warning).toContain("could not be loaded");
  });
  it("warns about unavailable browser storage without crashing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("quota");
    });
    expect(saveBible(initialBible())).toContain("could not be saved");
  });
});
