import { useState } from "react";
import {
  initialBible,
  loadBible,
  saveBible,
  BIBLE_KEY,
  reflectionKey,
  type BibleData,
  type Reflection,
} from "./storage";
import { locationKey, type Location } from "./catalog";
export function useBible() {
  const [loaded] = useState(loadBible);
  const [data, setData] = useState(loaded.data);
  const [warning, setWarning] = useState(loaded.warning);
  const [status, setStatus] = useState("");
  const [reading, setReading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  function update(change: (d: BibleData) => BibleData, message = "") {
    const next = change(data);
    setData(next);
    const error = saveBible(next);
    setWarning(error);
    setStatus(
      error
        ? "Updated for this session only; device storage is unavailable."
        : message,
    );
  }
  function navigate(location: Location, verses: number[] = []) {
    update((d) => ({ ...d, location }));
    setSelected(verses);
    setReading(true);
  }
  function complete(day: string) {
    update(
      (d) => ({
        ...d,
        completed: [
          ...d.completed.filter(
            (c) => locationKey(c.location) !== locationKey(d.location),
          ),
          { location: d.location, day },
        ],
      }),
      "Reading marked complete on this device.",
    );
  }
  function saveReflection(reflection: Reflection) {
    const key = reflectionKey(reflection.location, reflection.verses);
    if (
      !data.reflections.some(
        (r) => reflectionKey(r.location, r.verses) === key,
      ) &&
      data.reflections.length >= 100
    ) {
      setStatus(
        "You have 100 saved reflections. Delete one before adding another.",
      );
      return;
    }
    update(
      (d) => ({
        ...d,
        reflections: [
          reflection,
          ...d.reflections.filter(
            (r) => reflectionKey(r.location, r.verses) !== key,
          ),
        ],
      }),
      "Reflection saved on this device only.",
    );
    setDrafts((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
  }
  function deleteReflection(key: string) {
    update(
      (d) => ({
        ...d,
        reflections: d.reflections.filter(
          (r) => reflectionKey(r.location, r.verses) !== key,
        ),
      }),
      "Reflection deleted from this device.",
    );
    setDrafts((d) => {
      const next = { ...d };
      delete next[key];
      return next;
    });
  }
  function reset() {
    let message = "";
    try {
      localStorage.removeItem(BIBLE_KEY);
    } catch {
      message =
        "Bible reset for this session; saved Bible storage could not be cleared.";
    }
    setData(initialBible());
    setSelected([]);
    setDrafts({});
    setReading(false);
    setStatus("");
    setWarning(message);
    return message;
  }
  return {
    data,
    warning,
    status,
    reading,
    setReading,
    selected,
    setSelected,
    drafts,
    setDrafts,
    update,
    navigate,
    complete,
    saveReflection,
    deleteReflection,
    reset,
  };
}
export type BibleController = ReturnType<typeof useBible>;
