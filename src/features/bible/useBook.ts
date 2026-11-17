import { useEffect, useState } from "react";
import { loadBook, type BookText } from "./catalog";
export function useBook(id: string) {
  const [result, setResult] = useState<{
    id: string;
    data?: BookText;
    error?: string;
  }>({ id });
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    let active = true;
    setResult({ id });
    loadBook(id)
      .then((data) => {
        if (active) setResult({ id, data });
      })
      .catch(() => {
        if (active)
          setResult({
            id,
            error:
              "This Bible book could not be opened. Try again or reload the app.",
          });
      });
    return () => {
      active = false;
    };
  }, [id, attempt]);
  return {
    ...(result.id === id ? result : { id }),
    retry: () => setAttempt((n) => n + 1),
  };
}
