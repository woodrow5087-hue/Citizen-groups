import { describe, expect, it, vi } from "vitest";
import { initialData, loadData, parseData, saveData, KEY } from "./storage";
describe("storage boundary", () => {
  it("rejects malformed and incorrectly shaped state", () => {
    localStorage.setItem(KEY, "{broken");
    expect(loadData().warning).toBeTruthy();
    expect(() =>
      parseData(JSON.stringify({ ...initialData(), steps: null })),
    ).toThrow();
    expect(() =>
      parseData(JSON.stringify({ ...initialData(), followed: ["outsider"] })),
    ).toThrow();
  });
  it("resets daily steps while retaining notes and RSVP", () => {
    const d = initialData();
    d.day = "2000-01-01";
    d.notes = "Fictional planning";
    d.rsvp = true;
    d.steps.connect = true;
    d.prayed = ["a"];
    const result = parseData(JSON.stringify(d));
    expect(result.steps.connect).toBe(false);
    expect(result.prayed).toEqual([]);
    expect(result.notes).toBe(d.notes);
    expect(result.rsvp).toBe(true);
  });
  it("reports unavailable storage without crashing", () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new Error("quota");
    });
    expect(saveData(initialData())).toContain("could not be saved");
  });
});
