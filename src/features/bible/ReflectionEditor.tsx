import { PrimaryPill } from "../../components/PrimaryPill";
import { reflectionKey, type Reflection } from "./storage";
import { reference } from "./catalog";
import type { BibleController } from "./useBible";
export function ReflectionEditor({ bible }: { bible: BibleController }) {
  const { location } = bible.data;
  const verses = [...bible.selected].sort((a, b) => a - b);
  const key = reflectionKey(location, verses);
  const saved = bible.data.reflections.find(
    (r) => reflectionKey(r.location, r.verses) === key,
  );
  const text = bible.drafts[key] ?? saved?.text ?? "";
  const dirty = text !== (saved?.text ?? "");
  function save() {
    if (text.trim()) {
      const reflection: Reflection = { location, verses, text: text.trim() };
      bible.saveReflection(reflection);
    }
  }
  return (
    <section className="reflection-editor" aria-label="Personal reflection">
      <div className="section-row">
        <h2>Your reflection</h2>
        <span className="subtle-label">Device only</span>
      </div>
      <p className="privacy-note">
        For {reference(location, verses)}. Private to this browser, not secure
        storage. Use fictional demo notes; nothing here is shared.
      </p>
      <label htmlFor="bible-reflection">Personal reflection</label>
      <textarea
        id="bible-reflection"
        maxLength={2000}
        value={text}
        placeholder="What stands out to you?"
        onChange={(e) =>
          bible.setDrafts((d) => ({ ...d, [key]: e.target.value }))
        }
      />
      <div className="reflection-meta">
        <span>{text.length}/2000</span>
        <span>
          {dirty
            ? "Draft · not saved"
            : saved
              ? bible.warning
                ? "Session only · save unavailable"
                : "Saved on this device"
              : "No reflection yet"}
        </span>
      </div>
      <div className="plan-actions">
        <PrimaryPill onClick={save} disabled={!text.trim() || !dirty}>
          Save reflection locally
        </PrimaryPill>
        {saved && (
          <PrimaryPill secondary onClick={() => bible.deleteReflection(key)}>
            Delete saved reflection
          </PrimaryPill>
        )}
      </div>
    </section>
  );
}
