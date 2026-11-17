import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it } from "vitest";
import App from "./App";
import { KEY } from "./state/storage";
describe("local demo journeys", () => {
  it("retains RSVP and a post on reload, renders input as text", async () => {
    const user = userEvent.setup();
    const view = render(<App />);
    await user.click(screen.getByRole("button", { name: /I.M GOING/i }));
    expect(screen.getByRole("button", { name: /GOING/i })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await user.click(screen.getByRole("button", { name: /Go to my group/i }));
    await user.click(screen.getByRole("button", { name: /Share something/i }));
    await user.type(
      screen.getByLabelText("Your thought"),
      "<img src=x onerror=alert(1)>",
    );
    await user.click(
      screen.getByRole("button", { name: /Post to demo group/i }),
    );
    expect(
      within(screen.getByRole("main"))
        .getAllByText("<img src=x onerror=alert(1)>")
        .find((el) => !el.closest("[hidden]"))!,
    ).toBeVisible();
    view.unmount();
    render(<App />);
    expect(
      within(screen.getByRole("main"))
        .getAllByText("<img src=x onerror=alert(1)>")
        .find((el) => !el.closest("[hidden]"))!,
    ).toBeVisible();
    expect(JSON.parse(localStorage.getItem(KEY)!).steps.reflect).toBe(true);
  });
  it("validates a request, traps focus, closes with Escape and restores focus", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(screen.getByRole("button", { name: "Prayer" }));
    const trigger = screen.getByRole("button", { name: /Add a request/i });
    await user.click(trigger);
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
    await user.click(screen.getByRole("button", { name: /I.M GOING/i }));
    await user.click(screen.getByRole("button", { name: /RESET DEMO/i }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(localStorage.getItem(KEY)).not.toBeNull();
    await user.click(screen.getByRole("button", { name: /RESET DEMO/i }));
    await user.click(screen.getByRole("button", { name: "Clear local demo" }));
    expect(localStorage.getItem(KEY)).toBeNull();
  });
  it("completes the dashboard rhythm through check-in, share and prayer", async () => {
    const user = userEvent.setup();
    render(<App />);
    await user.click(
      screen.getByRole("button", { name: /Check in\s*Reach out today/ }),
    );
    await user.click(screen.getByRole("button", { name: "I reached out" }));
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "1",
    );
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
    await user.click(
      screen.getByRole("button", { name: /Pray\s*Care for someone/ }),
    );
    await user.click(
      screen.getByRole("button", { name: "Mark prayer time complete" }),
    );
    expect(screen.getByRole("button", { name: "Prayer" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    await user.click(screen.getByRole("button", { name: "Home" }));
    expect(screen.getByRole("progressbar")).toHaveAttribute(
      "aria-valuenow",
      "3",
    );
  });
});
