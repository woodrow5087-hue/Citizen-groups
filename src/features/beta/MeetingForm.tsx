import { useState } from "react";
import { PrimaryPill } from "../../components/PrimaryPill";
import type { Meeting } from "./types";
export function MeetingForm({
  initial,
  busy,
  onSave,
}: {
  initial?: Meeting;
  busy: boolean;
  onSave: (
    m: Pick<Meeting, "title" | "description" | "location" | "starts_at">,
  ) => Promise<boolean>;
}) {
  const [title, setTitle] = useState(initial?.title ?? "");
  const [description, setDescription] = useState(initial?.description ?? "");
  const [location, setLocation] = useState(initial?.location ?? "");
  const [time, setTime] = useState(() => {
    if (!initial) return "";
    const d = new Date(initial.starts_at);
    return new Date(d.getTime() - d.getTimezoneOffset() * 60000)
      .toISOString()
      .slice(0, 16);
  });
  const [error, setError] = useState("");
  return (
    <form
      className="beta-form"
      onSubmit={(e) => {
        e.preventDefault();
        const date = new Date(time);
        if (!title.trim() || !Number.isFinite(date.getTime())) {
          setError("Enter a title and a valid date and time.");
          return;
        }
        void onSave({
          title: title.trim(),
          description: description.trim(),
          location: location.trim(),
          starts_at: date.toISOString(),
        });
      }}
    >
      <label htmlFor="meeting-title">Gathering title</label>
      <input
        id="meeting-title"
        required
        maxLength={100}
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />
      <label htmlFor="meeting-time">Date and time (your device timezone)</label>
      <input
        id="meeting-time"
        required
        type="datetime-local"
        value={time}
        onChange={(e) => setTime(e.target.value)}
      />
      <label htmlFor="meeting-location">Location · Visible to this group</label>
      <input
        id="meeting-location"
        maxLength={160}
        value={location}
        onChange={(e) => setLocation(e.target.value)}
      />
      <label htmlFor="meeting-description">Gathering details</label>
      <textarea
        id="meeting-description"
        maxLength={2000}
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      {error && <p role="alert">{error}</p>}
      <PrimaryPill type="submit" disabled={busy}>
        {busy ? "Saving…" : "Save gathering"}
      </PrimaryPill>
    </form>
  );
}
