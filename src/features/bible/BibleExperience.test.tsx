import { render, screen, within, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import App from "../../App";
import { BIBLE_KEY, initialBible } from "./storage";
import { KEY } from "../../state/storage";
async function openReader() {
  const user = userEvent.setup();
  await user.click(screen.getByRole("button", { name: "Grow" }));
  await user.click(screen.getByRole("button", { name: /Open Bible/ }));
  await screen.findByRole("list", { name: "Romans 12 verses" });
  return user;
}
describe("Bible reader journeys", () => {
  it("browses books/chapters, resizes text, selects verses, and persists reading and a personal reflection", async () => {
    const view = render(<App />);
    const user = await openReader();
    await user.click(
      screen.getByRole("button", { name: "Increase Bible font size" }),
    );
    expect(screen.getByText("22px")).toBeVisible();
    await user.selectOptions(screen.getByLabelText("Book"), "GEN");
    await screen.findByRole("list", { name: "Genesis 1 verses" });
    await user.selectOptions(screen.getByLabelText("Chapter"), "2");
    await screen.findByRole("list", { name: "Genesis 2 verses" });
    await user.click(screen.getByRole("button", { name: /^Verse 1\./ }));
    expect(screen.getByRole("button", { name: /^Verse 1\./ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.type(
      screen.getByRole("textbox", { name: "Personal reflection" }),
      "Fictional reflection",
    );
    await user.click(
      screen.getByRole("button", { name: "Save reflection locally" }),
    );
    await user.click(
      screen.getByRole("button", { name: "Mark chapter read today" }),
    );
    expect(
      screen.getByRole("button", { name: "✓ Read today" }),
    ).toHaveAttribute("aria-pressed", "true");
    view.unmount();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Grow" }));
    await user.click(screen.getByRole("button", { name: /Open Bible/ }));
    await screen.findByRole("list", { name: "Genesis 2 verses" });
    expect(screen.getByText("22px")).toBeVisible();
    await user.click(screen.getByRole("button", { name: /^Verse 1\./ }));
    expect(
      screen.getByRole("textbox", { name: "Personal reflection" }),
    ).toHaveValue("Fictional reflection");
  });
  it("previews selected Scripture without sharing notes or changing the group feed", async () => {
    render(<App />);
    const user = await openReader();
    await user.click(screen.getByRole("button", { name: /^Verse 9\./ }));
    await user.type(
      screen.getByRole("textbox", { name: "Personal reflection" }),
      "PRIVATE FICTIONAL NOTE",
    );
    await user.click(
      screen.getByRole("button", { name: "Save reflection locally" }),
    );
    const trigger = screen.getByRole("button", {
      name: "Preview with My Group",
    });
    await user.click(trigger);
    const sheet = screen.getByRole("dialog", {
      name: "My Group · Demo preview",
    });
    expect(
      within(sheet).getByText(/Nothing is posted to My Group/),
    ).toBeVisible();
    expect(within(sheet).getByText("Romans 12:9")).toBeVisible();
    expect(within(sheet).queryByText("PRIVATE FICTIONAL NOTE")).toBeNull();
    expect(localStorage.getItem(KEY)).toBeNull();
    await user.keyboard("{Escape}");
    expect(trigger).toHaveFocus();
    expect(
      screen.getByRole("textbox", { name: "Personal reflection" }),
    ).toHaveValue("PRIVATE FICTIONAL NOTE");
  });
  it("keeps unsaved reflection drafts across section and verse changes, and clears Bible data on confirmed demo reset", async () => {
    render(<App />);
    const user = await openReader();
    await user.type(
      screen.getByRole("textbox", { name: "Personal reflection" }),
      "Fictional unsaved draft",
    );
    await user.click(screen.getByRole("button", { name: "Today" }));
    await user.click(screen.getByRole("button", { name: "Grow" }));
    expect(
      screen.getByRole("textbox", { name: "Personal reflection" }),
    ).toHaveValue("Fictional unsaved draft");
    await user.click(screen.getByRole("button", { name: /^Verse 9\./ }));
    expect(
      screen.getByRole("textbox", { name: "Personal reflection" }),
    ).toHaveValue("");
    await user.click(screen.getByRole("button", { name: "Clear selection" }));
    expect(
      screen.getByRole("textbox", { name: "Personal reflection" }),
    ).toHaveValue("Fictional unsaved draft");
    await user.click(screen.getByRole("button", { name: "You" }));
    await user.click(screen.getByRole("button", { name: /Reset demo data/ }));
    await user.click(screen.getByRole("button", { name: "Clear local demo" }));
    expect(localStorage.getItem(BIBLE_KEY)).toBeNull();
  });
  it("enforces font bounds and handles corrupted Bible storage separately", async () => {
    const d = initialBible();
    d.fontSize = 24;
    localStorage.setItem(BIBLE_KEY, JSON.stringify(d));
    const view = render(<App />);
    const user = await openReader();
    expect(
      screen.getByRole("button", { name: "Increase Bible font size" }),
    ).toBeDisabled();
    view.unmount();
    localStorage.setItem(BIBLE_KEY, "{invalid");
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Grow" }));
    expect(screen.getByRole("alert")).toHaveTextContent(
      "Bible data could not be loaded",
    );
  });
  it("reports a failed reflection save while retaining session text", async () => {
    render(<App />);
    const user = await openReader();
    await user.type(
      screen.getByRole("textbox", { name: "Personal reflection" }),
      "Fictional session note",
    );
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw Error("quota");
    });
    await user.click(
      screen.getByRole("button", { name: "Save reflection locally" }),
    );
    await waitFor(() =>
      expect(screen.getByRole("alert")).toHaveTextContent("could not be saved"),
    );
    expect(
      screen.getByRole("textbox", { name: "Personal reflection" }),
    ).toHaveValue("Fictional session note");
  });
});
