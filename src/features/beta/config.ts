export type BackendConfig =
  | { mode: "demo" }
  | { mode: "beta"; url: string; key: string }
  | { mode: "error"; message: string };
function isPublicKey(key: string) {
  if (key.startsWith("sb_publishable_")) return true;
  try {
    const role = JSON.parse(
      atob(key.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")),
    ).role;
    return role === "anon";
  } catch {
    return false;
  }
}
export function readBackendConfig(
  env: Record<string, string | undefined>,
): BackendConfig {
  const mode = env.VITE_APP_MODE,
    url = env.VITE_SUPABASE_URL,
    key = env.VITE_SUPABASE_PUBLISHABLE_KEY;
  if (
    Object.keys(env).some(
      (name) => /^VITE_.*(?:SECRET|SERVICE_ROLE)/i.test(name) && env[name],
    )
  )
    return {
      mode: "error",
      message:
        "Server-only secrets must never use a VITE_ environment variable.",
    };
  if (key && !isPublicKey(key))
    return {
      mode: "error",
      message:
        "Only a Supabase public publishable or legacy anon key may be used in the frontend.",
    };
  if (mode === "demo") return { mode: "demo" };
  if (mode && mode !== "beta")
    return { mode: "error", message: "Choose demo or beta application mode." };
  if (!mode && !url && !key) return { mode: "demo" };
  if (!url || !key)
    return {
      mode: "error",
      message:
        "Beta configuration is incomplete. Both the Supabase URL and public publishable key are required.",
    };
  try {
    const parsed = new URL(url);
    if (
      (parsed.protocol !== "https:" &&
        !(
          parsed.protocol === "http:" &&
          ["127.0.0.1", "localhost"].includes(parsed.hostname)
        )) ||
      parsed.username ||
      parsed.password ||
      parsed.search ||
      parsed.hash ||
      !["", "/"].includes(parsed.pathname)
    )
      throw Error();
    return { mode: "beta", url: parsed.origin, key };
  } catch {
    return {
      mode: "error",
      message:
        "The Supabase URL must be an HTTPS project origin (HTTP localhost is permitted for local testing).",
    };
  }
}
