import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { useBook } from "./useBook";
import { loadBook, type BookText } from "./catalog";
vi.mock("./catalog", async (importOriginal) => {
  const actual = await importOriginal<typeof import("./catalog")>();
  return { ...actual, loadBook: vi.fn() };
});
describe("book loading boundary", () => {
  it("offers retry after an asset failure", async () => {
    vi.mocked(loadBook)
      .mockRejectedValueOnce(Error("network"))
      .mockResolvedValueOnce({ "1": [{ number: 1, text: "Fixture verse" }] });
    const { result } = renderHook(() => useBook("GEN"));
    await waitFor(() =>
      expect(result.current.error).toContain("could not be opened"),
    );
    act(() => result.current.retry());
    await waitFor(() =>
      expect(result.current.data?.["1"][0].text).toBe("Fixture verse"),
    );
  });
  it("ignores a late response after switching books", async () => {
    let finishFirst!: (text: BookText) => void;
    vi.mocked(loadBook)
      .mockImplementationOnce(
        () =>
          new Promise((resolve) => {
            finishFirst = resolve;
          }),
      )
      .mockResolvedValueOnce({ "1": [{ number: 1, text: "Current book" }] });
    const { result, rerender } = renderHook(({ book }) => useBook(book), {
      initialProps: { book: "GEN" },
    });
    rerender({ book: "EXO" });
    await waitFor(() =>
      expect(result.current.data?.["1"][0].text).toBe("Current book"),
    );
    await act(async () =>
      finishFirst({ "1": [{ number: 1, text: "Stale book" }] }),
    );
    expect(result.current.id).toBe("EXO");
    expect(result.current.data?.["1"][0].text).toBe("Current book");
  });
});
