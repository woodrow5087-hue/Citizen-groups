import { PrimaryPill } from "../../components/PrimaryPill";
import { Icon } from "../../components/Icon";
import { dailyPassage, reference } from "./catalog";
import { useBook } from "./useBook";
import { BibleReader, type VersePreview } from "./BibleReader";
import { BibleAttribution } from "./BibleAttribution";
import type { BibleController } from "./useBible";
export function BibleExperience({
  bible,
  day,
  onPreview,
}: {
  bible: BibleController;
  day: string;
  onPreview: (p: VersePreview) => void;
}) {
  const featured = dailyPassage(day);
  const content = useBook(featured.book);
  const verse = content.data?.[String(featured.chapter)]?.find(
    (v) => v.number === featured.verses[0],
  );
  return (
    <div className="bible-experience">
      {bible.warning && (
        <p className="warning" role="alert">
          {bible.warning}
        </p>
      )}
      <p className="bible-status" role="status">
        {bible.status}
      </p>
      {bible.reading ? (
        <BibleReader bible={bible} day={day} onPreview={onPreview} />
      ) : (
        <>
          <article className="daily-passage">
            <p className="eyebrow">Today’s passage · {day}</p>
            <h2>{reference(featured, featured.verses)}</h2>
            {verse ? (
              <blockquote>{verse.text}</blockquote>
            ) : (
              <p>
                {content.error
                  ? "Open the reader to try loading this passage."
                  : "Opening today’s passage…"}
              </p>
            )}
            <span className="passage-translation">
              Opening verse · WEBP · Public domain
            </span>
            <PrimaryPill
              onClick={() =>
                bible.navigate(
                  { book: featured.book, chapter: featured.chapter },
                  featured.verses,
                )
              }
            >
              Read today’s passage <Icon name="arrow" size="tiny" />
            </PrimaryPill>
          </article>
          <button
            className="resource-card"
            onClick={() => bible.navigate(bible.data.location)}
          >
            <span className="resource-icon">
              <Icon name="guide" />
            </span>
            <span>
              <strong>Open Bible</strong>
              <small>
                Continue {reference(bible.data.location)} · 66 books
              </small>
            </span>
            <Icon name="chevron" />
          </button>
          <details className="saved-reflections">
            <summary>
              Personal reflections{" "}
              <span>{bible.data.reflections.length} saved locally</span>
            </summary>
            {bible.data.reflections.length ? (
              bible.data.reflections.map((r, i) => (
                <article key={i}>
                  <h3>{reference(r.location, r.verses)}</h3>
                  <p>{r.text}</p>
                  <PrimaryPill
                    secondary
                    onClick={() => bible.navigate(r.location, r.verses)}
                  >
                    Open reflection
                  </PrimaryPill>
                </article>
              ))
            ) : (
              <p className="privacy-note">
                No reflections yet. Open a chapter or select verses to write a
                fictional personal reflection. It stays on this device.
              </p>
            )}
          </details>
          <BibleAttribution />
        </>
      )}
    </div>
  );
}
