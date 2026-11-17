import { describe, it, expect } from "vitest";
import { readFileSync, readdirSync } from "node:fs";
import { createHash } from "node:crypto";
import {
  books,
  adjacent,
  dailyPassage,
  reference,
  loadBook,
  verseRange,
} from "./catalog";
describe("public-domain Bible content", () => {
  it("pins all 66 books and verifies every generated book, chapter and verse reference", () => {
    expect(books).toHaveLength(66);
    expect(readdirSync("src/data/web/books")).toHaveLength(66);
    let chapters = 0,
      verses = 0;
    for (const b of books) {
      const raw = readFileSync(`src/data/web/books/${b.id}.json`);
      expect(createHash("sha256").update(raw).digest("hex")).toBe(b.sha256);
      const content = JSON.parse(raw.toString()) as Record<
        string,
        { number: number; text: string }[]
      >;
      expect(Object.keys(content)).toHaveLength(b.chapters.length);
      b.chapters.forEach((numbers, i) => {
        expect(content[String(i + 1)].map((v) => v.number)).toEqual(numbers);
        for (const v of content[String(i + 1)]) {
          expect(v.text.trim()).toBe(v.text);
          expect(v.text.length).toBeGreaterThan(0);
        }
        verses += numbers.length;
      });
      chapters += b.chapters.length;
    }
    expect(chapters).toBe(1189);
    expect(verses).toBe(31098);
  });
  it("reproduces publisher wording and preserves source verse numbering gaps", async () => {
    const genesis = await loadBook("GEN");
    expect(genesis["1"][0].text).toBe(
      "In the beginning, God created the heavens and the earth.",
    );
    const john = await loadBook("JHN");
    expect(john["3"].find((v) => v.number === 16)?.text).toBe(
      "For God so loved the world, that he gave his only born Son, that whoever believes in him should not perish, but have eternal life.",
    );
    const luke = await loadBook("LUK");
    expect(luke["17"].some((v) => v.number === 36)).toBe(false);
  });
  it("navigates book boundaries without invalid chapters and formats selected references", () => {
    expect(adjacent({ book: "GEN", chapter: 1 }, -1)).toBeNull();
    expect(adjacent({ book: "GEN", chapter: 50 }, 1)).toEqual({
      book: "EXO",
      chapter: 1,
    });
    expect(adjacent({ book: "REV", chapter: 22 }, 1)).toBeNull();
    expect(verseRange([13, 9, 10, 11, 12])).toBe("9–13");
    expect(reference({ book: "ROM", chapter: 12 }, [9, 11])).toBe(
      "Romans 12:9, 11",
    );
  });
  it("selects deterministic valid daily passages", () => {
    expect(dailyPassage("2026-11-17")).toEqual(dailyPassage("2026-11-17"));
    expect(dailyPassage("2026-11-17")).not.toEqual(dailyPassage("2026-11-18"));
    for (let d = 10; d < 17; d++) {
      const p = dailyPassage(`2026-11-${d}`);
      expect(
        books.find((b) => b.id === p.book)?.chapters[p.chapter - 1],
      ).toEqual(expect.arrayContaining(p.verses));
    }
  });
});
