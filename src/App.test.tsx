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
    await user.click(screen.getByRole("button", { name: /GO TO MY GROUP/ }));
    await user.click(screen.getByRole("button", { name: /SHARE/ }));
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
    await user.click(screen.getByRole("button", { name: "PRAYER" }));
    const trigger = screen.getByRole("button", { name: /REQUEST/ });
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
    await user.click(screen.getByRole("button", { name: /I.M GOING/ }));
    await user.click(screen.getByRole("button", { name: /RESET DEMO/i }));
    await user.click(screen.getByRole("button", { name: "Cancel" }));
    expect(localStorage.getItem(KEY)).not.toBeNull();
    await user.click(screen.getByRole("button", { name: /RESET DEMO/i }));
    await user.click(screen.getByRole("button", { name: "Clear local demo" }));
    expect(localStorage.getItem(KEY)).toBeNull();
  });
});
