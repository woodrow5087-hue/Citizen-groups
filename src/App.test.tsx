import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { KEY } from "./state/storage";
describe("local demo journeys", () => {
  it("keeps primary actions visible as compact entry points into deeper screens", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(screen.getByRole("article", { name: "Latest group update" })).toBeVisible();
    expect(screen.getByRole("button", { name: /Check in\\s*Reach out/ })).toBeVisible();
    await user.click(screen.getByRole("button", { name: /Go to feed/ }));
    expect(screen.getByRole("tab", { name: "Feed" })).toHaveAttribute("aria-selected", "true");
    await user.click(screen.getByRole("button", { name: "Grow" }));
    expect(screen.getByRole("button", { name: /Open Bible/ })).toBeVisible();
    await user.click(screen.getByRole("button", { name: "You" }));
    expect(screen.getByRole("button", { name: /Leader tools/ })).toBeVisible();
  });
  it("retains RSVP and a post on reload, renders input as text", async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await user.click(screen.getByRole("button", { name: /See details/ }));
    await user.click(screen.getByRole("button", { name: "I'm going" }));
    expect(screen.getByRole("button", { name: /Going/ })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("tab", { name: "Feed" }));
    await user.click(screen.getByRole("button", { name: /Share something/ }));
    await user.type(
      screen.getByLabelText("Your thought"),
      "<img src=x onerror=alert(1)>",
    );
    await user.click(
      screen.getByRole("button", { name: "Post to demo group" }),
    );
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeVisible();
    view.unmount();
    render(<App />);
    expect(screen.getByText("<img src=x onerror=alert(1)>")).toBeVisible();
    expect(JSON.parse(localStorage.getItem(KEY)!).steps.reflect).toBe(true);
  });
  it("validates a request, traps focus, closes with Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<App />);
    const trigger = screen.getByRole("button", {
      name: /Pray\s*Care for someone/,
    });
    await user.click(trigger);
    await user.click(screen.getByRole("button", { name: "Share a request" }));
    const dialog = screen.getByRole("dialog");
    await user.click(
      within(dialog).getByRole("button", { name: "Save in demo" }),
    );
    expect(screen.getByRole("alert")).toHaveTextContent("Please write");
    await user.tab();
    expect(
      within(dialog).getByRole("button", { name: "Close dialog" }),
    ).toHaveFocus();
    await user.keyboard("{Escape}");
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();
  });
  it("confirms reset before clearing entries", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: /See details/ }));
    await user.click(screen.getByRole("button", { name: "I'm going" }));
    await user.click(screen.getByRole("button", { name: "You" }));
    await user.click(screen.getByRole("button", { name: /Reset demo data/ }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(localStorage.getItem(KEY)).not.toBeNull();
    await user.click(screen.getByRole("button", { name: /Reset demo data/ }));
    await user.click(screen.getByRole("button", { name: "Clear local demo" }));
    expect(localStorage.getItem(KEY)).toBeNull();
  });
  it("completes the daily rhythm from Today and Grow", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /Check in\s*Reach out/ }),
    );
    await user.click(screen.getByRole("button", { name: "I reached out" }));
    await user.click(
      screen.getByRole("button", { name: /Share\s*Start a conversation/ }),
    );
    await user.type(
      screen.getByLabelText("Your thought"),
      "Fictional encouragement",
    );
    await user.click(
      screen.getByRole("button", { name: "Post to demo group" }),
    );
    await user.click(screen.getByRole("button", { name: "Grow" }));
    await user.click(screen.getByRole("button", { name: /02.*Pray/ }));
    await user.click(
      screen.getByRole("button", { name: "Mark prayer time complete" }),
    );
    await user.click(screen.getByRole("button", { name: "Today" }));
    expect(screen.getByText("3 of 3 today")).toBeVisible();
  });
  it("keeps subtabs across member navigation and supports arrow keys", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "My Group" }));
    const feed = screen.getByRole("tab", { name: "Feed" });
    feed.focus();
    await user.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "People" })).toHaveFocus();
    expect(screen.getByRole("tabpanel")).toHaveAccessibleName("People");
    await user.click(screen.getByRole("button", { name: "Grow" }));
    await user.click(screen.getByRole("button", { name: "My Group" }));
    expect(screen.getByRole("tab", { name: "People" })).toHaveAttribute(
      "aria-selected",
      "true",
    );
    await user.click(screen.getByRole("tab", { name: "Resources" }));
    await user.click(
      screen.getByRole("button", { name: /Discussion guide\s*Belonging/ }),
    );
    expect(screen.getByRole("dialog")).toHaveAccessibleName("Discussion guide");
  });
  it("persists encouragement shared by Today and the group feed", async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await user.click(screen.getByRole("button", { name: "Encourage" }));
    expect(screen.getByRole("button", { name: "Encouraged" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: /Go to feed/ }));
    const jordan = within(screen.getByRole("tabpanel"))
      .getByText("Jordan M.")
      .closest("article")!;
    expect(
      within(jordan).getByRole("button", { name: "Encouraged" }),
    ).toHaveAttribute("aria-pressed", "true");
    view.unmount();
    render(<App />);
    expect(screen.getByRole("button", { name: "Encouraged" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });
  it("retains prayer acknowledgements and leader tools outside primary navigation", async () => {
    const user = userEvent.setup();
    render(<App />);
    expect(
      within(screen.getByRole("navigation")).queryByRole("button", {
        name: /Leader/,
      }),
    ).toBeNull();
    await user.click(screen.getByRole("button", { name: "You" }));
    await user.click(screen.getByRole("button", { name: /Prayer circle/ }));
    const prayer = screen.getByRole("button", {
      name: /I prayed for Jordan M\.:/,
    });
    await user.click(prayer);
    expect(prayer).toHaveAttribute("aria-pressed", "true");
    await user.keyboard("{Escape}");
    await user.click(screen.getByRole("button", { name: /Leader tools/ }));
    await user.click(
      screen.getByRole("button", { name: "Mark Morgan C. reached" }),
    );
    expect(
      screen.getByRole("button", { name: "Mark Morgan C. reached" }),
    ).toHaveAttribute("aria-pressed", "true");
    await user.click(screen.getByRole("button", { name: /My notes/ }));
    await user.type(screen.getByLabelText("Planning notes"), "Fictional plan");
    await user.click(
      screen.getByRole("button", { name: "Save notes locally" }),
    );
    expect(JSON.parse(localStorage.getItem(KEY)!).notes).toBe("Fictional plan");
  });
});
