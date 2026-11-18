import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, it, expect, vi } from "vitest";
import type { Session, AuthChangeEvent } from "@supabase/supabase-js";
import { AuthGate } from "./AuthGate";
import type { BetaClient } from "./client";
import type { BetaRepository } from "./repository";
const session = {
  user: { id: "fictional-user" },
  access_token: "unit-test-only",
} as Session;
function fixture(initial: Session | null = null, allowed = true) {
  let callback:
    ((event: AuthChangeEvent, s: Session | null) => void) | undefined;
  const auth = {
    getSession: vi
      .fn()
      .mockResolvedValue({ data: { session: initial }, error: null }),
    onAuthStateChange: vi.fn((cb) => {
      callback = cb;
      return { data: { subscription: { unsubscribe: vi.fn() } } };
    }),
    getUser: vi
      .fn()
      .mockResolvedValue({ data: { user: session.user }, error: null }),
    signInWithOtp: vi.fn().mockResolvedValue({ error: null }),
    verifyOtp: vi.fn().mockImplementation(async () => {
      callback?.("SIGNED_IN", session);
      return { error: null };
    }),
    signOut: vi.fn().mockImplementation(async () => {
      callback?.("SIGNED_OUT", null);
      return { error: null };
    }),
  };
  const repository = {
    profile: vi.fn().mockResolvedValue(
      allowed
        ? {
            id: session.user.id,
            display_name: "Fictional Test",
            created_at: "",
          }
        : null,
    ),
  } as unknown as BetaRepository;
  return { client: { auth } as unknown as BetaClient, auth, repository };
}
function mount(f: ReturnType<typeof fixture>) {
  return render(
    <AuthGate client={f.client} repository={f.repository}>
      {() => <p>Protected group application</p>}
    </AuthGate>,
  );
}
describe("email authentication gate", () => {
  it("keeps signed-out users out and requests OTP without creating accounts", async () => {
    const f = fixture();
    mount(f);
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText("Email address"),
      "fictional@example.test",
    );
    expect(screen.queryByText("Protected group application")).toBeNull();
    await user.click(
      screen.getByRole("button", { name: "Email a sign-in code" }),
    );
    expect(f.auth.signInWithOtp).toHaveBeenCalledWith(
      expect.objectContaining({
        email: "fictional@example.test",
        options: expect.objectContaining({ shouldCreateUser: false }),
      }),
    );
    await user.type(screen.getByLabelText("Six-digit sign-in code"), "123456");
    await user.click(screen.getByRole("button", { name: "Verify code" }));
    expect(
      await screen.findByText("Protected group application"),
    ).toBeVisible();
  });
  it("restores a session only after server user and beta profile checks", async () => {
    const f = fixture(session);
    mount(f);
    expect(
      await screen.findByText("Protected group application"),
    ).toBeVisible();
    expect(f.auth.getUser).toHaveBeenCalled();
    expect(f.repository.profile).toHaveBeenCalledWith(session.user.id);
  });
  it("does not open the application for authenticated accounts lacking admission", async () => {
    const f = fixture(session, false);
    mount(f);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Beta access is unavailable",
    );
    expect(screen.queryByText("Protected group application")).toBeNull();
    await userEvent
      .setup()
      .click(screen.getByRole("button", { name: "Sign out" }));
    await waitFor(() =>
      expect(f.auth.signOut).toHaveBeenCalledWith({ scope: "local" }),
    );
    expect(await screen.findByLabelText("Email address")).toBeVisible();
  });
  it("rejects invalid codes without displaying protected content", async () => {
    const f = fixture();
    f.auth.verifyOtp.mockResolvedValue({ error: Error("expired") });
    mount(f);
    const user = userEvent.setup();
    await user.type(
      await screen.findByLabelText("Email address"),
      "fictional@example.test",
    );
    await user.click(
      screen.getByRole("button", { name: "Email a sign-in code" }),
    );
    await user.type(screen.getByLabelText("Six-digit sign-in code"), "000000");
    await user.click(screen.getByRole("button", { name: "Verify code" }));
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "invalid or expired",
    );
    expect(screen.queryByText("Protected group application")).toBeNull();
  });
});
