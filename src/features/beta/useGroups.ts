import { useCallback, useEffect, useRef, useState } from "react";
import type { BetaRepository } from "./repository";
import type { Group, GroupSnapshot } from "./types";
export function useGroups(repository: BetaRepository) {
  const [groups, setGroups] = useState<Group[]>([]);
  const [snapshot, setSnapshot] = useState<GroupSnapshot | null>(null);
  const [selected, setSelected] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [updated, setUpdated] = useState("");
  const selection = useRef("");
  const generation = useRef(0);
  const refresh = useCallback(async () => {
    const ticket = ++generation.current;
    setLoading(true);
    try {
      const available = await repository.groups();
      if (ticket !== generation.current) return;
      const id =
        available.find((g) => g.id === selection.current)?.id ??
        available[0]?.id ??
        "";
      const next = id ? await repository.snapshot(id) : null;
      if (ticket !== generation.current) return;
      selection.current = id;
      setSelected(id);
      setGroups(available);
      setSnapshot(next);
      setError("");
      setUpdated(
        new Date().toLocaleTimeString([], {
          hour: "2-digit",
          minute: "2-digit",
        }),
      );
    } catch {
      if (ticket === generation.current) {
        setSnapshot(null);
        setError(
          "Group data could not be refreshed. Check your connection and membership, then try again.",
        );
      }
    } finally {
      if (ticket === generation.current) setLoading(false);
    }
  }, [repository]);
  useEffect(() => {
    void refresh();
    const check = () => {
      if (document.visibilityState === "visible") void refresh();
    };
    const timer = window.setInterval(check, 15000);
    window.addEventListener("focus", check);
    document.addEventListener("visibilitychange", check);
    return () => {
      generation.current++;
      clearInterval(timer);
      window.removeEventListener("focus", check);
      document.removeEventListener("visibilitychange", check);
    };
  }, [refresh]);
  function choose(id: string) {
    generation.current++;
    selection.current = id;
    setSelected(id);
    setSnapshot(null);
    void refresh();
  }
  return {
    groups,
    snapshot,
    selected,
    choose,
    loading,
    error,
    updated,
    refresh,
  };
}
