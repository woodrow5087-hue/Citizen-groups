import { useEffect, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { PrimaryPill } from "../../components/PrimaryPill";
import type { BetaClient } from "./client";
import type { BetaRepository } from "./repository";
import type { Profile } from "./types";
export function AuthGate({
  client,
  repository,
  children,
}: {
  client: BetaClient;
  repository: BetaRepository;
  children: (session: Session, profile: Profile) => ReactNode;
}) {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [checking, setChecking] = useState(true);
  const [email, setEmail] = useState("");
  const [token, setToken] = useState("");
  const [phase, setPhase] = useState<"email" | "code">("email");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    const {
      data: { subscription },
    } = client.auth.onAuthStateChange((_event, next) => {
      if (active) {
        setSession(next);
        setProfile(null);
        setChecking(!!next);
      }
    });
    async function restore() {
      try {
        const params = new URLSearchParams(window.location.search);
        const hash = params.get("token_hash");
        if (hash) {
          const type = params.get("type");
          window.history.replaceState(null, "", window.location.pathname);
          if (type !== "invite") throw Error();
          const { error } = await client.auth.verifyOtp({
            token_hash: hash,
            type: "invite",
          });
          if (error) throw error;
        }
        const { data, error } = await client.auth.getSession();
        if (error) throw error;
        if (active) {
          setSession(data.session);
          setChecking(!!data.session);
        }
      } catch {
        if (active) {
          setError(
            "The session or invitation could not be opened. Request a new sign-in code or contact the beta administrator.",
          );
          setChecking(false);
        }
      }
    }
    void restore();
    return () => {
      active = false;
      subscription.unsubscribe();
    };
  }, [client]);
  useEffect(() => {
    let active = true;
    if (!session) {
      setProfile(null);
      return;
    }
    setChecking(true);
    void (async () => {
      try {
        const verified = await client.auth.getUser();
        if (verified.error || verified.data.user?.id !== session.user.id)
          throw Error();
        const result = await repository.profile(session.user.id);
        if (active) {
          setProfile(result);
          setChecking(false);
          if (!result)
            setError(
              "Beta access is unavailable. Ask the beta administrator to check your invitation and membership.",
            );
        }
      } catch {
        if (active) {
          setProfile(null);
          setChecking(false);
          setError(
            "Beta access could not be verified. Check your connection or sign out and try again.",
          );
        }
      }
    })();
    return () => {
      active = false;
    };
  }, [session, repository, client]);
  async function requestCode(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      await client.auth.signInWithOtp({
        email: email.trim(),
        options: {
          shouldCreateUser: false,
          emailRedirectTo: window.location.origin + "/",
        },
      });
      setPhase("code");
      setMessage(
        "If this email has an invited account, a sign-in code will arrive shortly.",
      );
    } catch {
      setError("The sign-in request could not be completed. Try again.");
    } finally {
      setBusy(false);
    }
  }
  async function verify(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    try {
      const { error } = await client.auth.verifyOtp({
        email: email.trim(),
        token: token.trim(),
        type: "email",
      });
      if (error) throw error;
      setToken("");
    } catch {
      setError(
        "The code is invalid or expired. Request a new code and try again.",
      );
    } finally {
      setBusy(false);
    }
  }
  async function signOut() {
    setBusy(true);
    const { error } = await client.auth.signOut({ scope: "local" });
    if (error)
      setError(
        "Sign-out could not finish. Check your connection and try again.",
      );
    setBusy(false);
  }
  if (checking)
    return (
      <main className="app-shell auth-screen">
        <p role="status">Checking private beta access…</p>
      </main>
    );
  if (session && profile) return children(session, profile);
  return (
    <main className="app-shell auth-screen">
      <p className="eyebrow">
        <span className="red-rule" />
        Citizen Groups · Private beta
      </p>
      <h1>
        Your community,
        <br />
        by invitation.
      </h1>
      <p>
        Sign in with the email approved by your beta administrator. Public
        sign-up is closed.
      </p>
      {error && (
        <p className="warning" role="alert">
          {error}
        </p>
      )}
      {message && <p role="status">{message}</p>}
      {session ? (
        <PrimaryPill disabled={busy} onClick={() => void signOut()}>
          Sign out
        </PrimaryPill>
      ) : (
        <>
          <form onSubmit={phase === "email" ? requestCode : verify}>
            <label htmlFor="beta-email">Email address</label>
            <input
              id="beta-email"
              type="email"
              autoComplete="email"
              maxLength={254}
              required
              value={email}
              readOnly={phase === "code"}
              onChange={(e) => setEmail(e.target.value)}
            />
            {phase === "code" && (
              <>
                <label htmlFor="beta-code">Six-digit sign-in code</label>
                <input
                  id="beta-code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  pattern="[0-9]{6}"
                  maxLength={6}
                  required
                  value={token}
                  onChange={(e) => setToken(e.target.value)}
                />
              </>
            )}
            <PrimaryPill type="submit" disabled={busy}>
              {busy
                ? "Please wait…"
                : phase === "email"
                  ? "Email a sign-in code"
                  : "Verify code"}
            </PrimaryPill>
          </form>
          {phase === "code" && (
            <button
              className="text-link"
              disabled={busy}
              onClick={() => {
                setPhase("email");
                setToken("");
                setMessage("");
              }}
            >
              Use another email or request a new code
            </button>
          )}
        </>
      )}
      <p className="privacy-note">
        Only group members can access shared content. Use a private device and
        sign out when finished. Personal Bible reflections remain in this
        browser.
      </p>
    </main>
  );
}
