import { useRef } from "react";
import { PrimaryPill } from "../../components/PrimaryPill";
import {
  books,
  findBook,
  adjacent,
  reference,
  locationKey,
  type Location,
} from "./catalog";
import { FONT_SIZES } from "./storage";
import { useBook } from "./useBook";
import { BibleAttribution } from "./BibleAttribution";
import { ReflectionEditor } from "./ReflectionEditor";
import type { BibleController } from "./useBible";
export type VersePreview = { reference: string; text: string };
export function BibleReader({
  bible,
  day,
  onPreview,
}: {
  bible: BibleController;
  day: string;
  onPreview: (p: VersePreview) => void;
}) {
  const { location, fontSize } = bible.data;
  const book = findBook(location.book)!;
  const content = useBook(location.book);
  const chapter = content.data?.[String(location.chapter)];
  const heading = useRef<HTMLHeadingElement>(null);
  const sorted = [...bible.selected].sort((a, b) => a - b);
  const previous = adjacent(location, -1),
    next = adjacent(location, 1);
  const complete =
    bible.data.completed.find(
      (c) => locationKey(c.location) === locationKey(location),
    )?.day === day;
  function go(l: Location) {
    bible.navigate(l);
    window.scrollTo({ top: 0, behavior: "instant" });
    heading.current?.focus({ preventScroll: true });
  }
  function select(number: number) {
    bible.setSelected((selected) =>
      selected.includes(number)
        ? selected.filter((n) => n !== number)
        : selected.length < 20
          ? [...selected, number]
          : selected,
    );
  }
  function preview() {
    if (!chapter || !sorted.length) return;
    onPreview({
      reference: reference(location, sorted),
      text: chapter
        .filter((v) => sorted.includes(v.number))
        .map((v) => `${v.number} ${v.text}`)
        .join("\n\n"),
    });
  }
  const scale = FONT_SIZES.indexOf(fontSize as (typeof FONT_SIZES)[number]);
  return (
    <section className="bible-reader" aria-label="Bible reader">
      <button className="text-link" onClick={() => bible.setReading(false)}>
        ← Back to Grow
      </button>
      <div className="reader-heading">
        <p className="eyebrow">
          <span className="red-rule" />
          World English Bible
        </p>
        <h1 ref={heading} tabIndex={-1}>
          {reference(location)}
        </h1>
        <p>WEBP · 66-book edition</p>
      </div>
      <div className="bible-selectors">
        <label>
          Book
          <select
            value={location.book}
            onChange={(e) => go({ book: e.target.value, chapter: 1 })}
          >
            {books.map((b, i) => (
              <option key={b.id} value={b.id}>
                {b.name}
                {i === 0
                  ? " · Old Testament"
                  : i === 39
                    ? " · New Testament"
                    : ""}
              </option>
            ))}
          </select>
        </label>
        <label>
          Chapter
          <select
            value={location.chapter}
            onChange={(e) =>
              go({ ...location, chapter: Number(e.target.value) })
            }
          >
            {book.chapters.map((_, i) => (
              <option value={i + 1} key={i}>
                {i + 1}
              </option>
            ))}
          </select>
        </label>
      </div>
      <div className="reader-preferences">
        <span>
          Text size <output aria-live="polite">{fontSize}px</output>
        </span>
        <div>
          <button
            aria-label="Decrease Bible font size"
            disabled={scale === 0}
            onClick={() =>
              bible.update((d) => ({ ...d, fontSize: FONT_SIZES[scale - 1] }))
            }
          >
            A−
          </button>
          <button
            aria-label="Increase Bible font size"
            disabled={scale === FONT_SIZES.length - 1}
            onClick={() =>
              bible.update((d) => ({ ...d, fontSize: FONT_SIZES[scale + 1] }))
            }
          >
            A+
          </button>
        </div>
      </div>
      <div className="chapter-navigation" aria-label="Chapter navigation">
        <PrimaryPill
          secondary
          disabled={!previous}
          onClick={() => previous && go(previous)}
        >
          ← Previous
        </PrimaryPill>
        <PrimaryPill
          secondary
          disabled={!next}
          onClick={() => next && go(next)}
        >
          Next →
        </PrimaryPill>
      </div>
      <p className="privacy-note">
        Tap verses to select them. Select up to 20 for a personal reflection or
        sharing preview.
      </p>
      {sorted.length > 0 && (
        <div className="verse-actions">
          <p role="status">
            {sorted.length} selected · {reference(location, sorted)}
          </p>
          <div className="plan-actions">
            <PrimaryPill disabled={!chapter} onClick={preview}>
              Preview with My Group
            </PrimaryPill>
            <PrimaryPill secondary onClick={() => bible.setSelected([])}>
              Clear selection
            </PrimaryPill>
          </div>
          <small>Demo preview only. Nothing will be posted or delivered.</small>
        </div>
      )}
      <div aria-busy={!content.data && !content.error}>
        {content.error ? (
          <div className="warning" role="alert">
            <p>{content.error}</p>
            <PrimaryPill secondary onClick={content.retry}>
              Try loading again
            </PrimaryPill>
          </div>
        ) : !chapter ? (
          <p role="status" className="privacy-note">
            Opening Bible text…
          </p>
        ) : (
          <ol
            className="bible-verses"
            style={{ fontSize: `${fontSize}px` }}
            aria-label={`${reference(location)} verses`}
          >
            {chapter.map((v) => (
              <li key={v.number}>
                <button
                  className="bible-verse"
                  aria-pressed={bible.selected.includes(v.number)}
                  aria-label={`Verse ${v.number}. ${v.text}`}
                  disabled={sorted.length >= 20 && !sorted.includes(v.number)}
                  onClick={() => select(v.number)}
                >
                  <span className="verse-number" aria-hidden="true">
                    {v.number}
                  </span>
                  <span>{v.text}</span>
                </button>
              </li>
            ))}
          </ol>
        )}
      </div>
      {chapter && (
        <>
          <PrimaryPill
            className="reading-complete"
            aria-pressed={complete}
            onClick={() => bible.complete(day)}
          >
            {complete ? "✓ Read today" : "Mark chapter read today"}
          </PrimaryPill>
          <ReflectionEditor bible={bible} />
        </>
      )}
      <BibleAttribution />
    </section>
  );
}
