import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
export function localConfig() {
  const c = JSON.parse(readFileSync(".beta-local/connection.json", "utf8"));
  if (c.url !== "http://127.0.0.1:54321")
    throw Error("Tests only target the disposable localhost stack.");
  return c;
}
export function localClient(c, key = c.anonKey) {
  return createClient(c.url, key, {
    auth: {
      persistSession: false,
      flowType: "pkce",
      autoRefreshToken: false,
      detectSessionInUrl: false,
    },
  });
}
export async function mailFor(email, subject) {
  for (let n = 0; n < 100; n++) {
    const list = await fetch("http://127.0.0.1:54324/api/v1/messages").then(
      (r) => r.json(),
    );
    const item = list.messages?.find(
      (m) =>
        m.To?.some((t) => t.Address === email) &&
        (!subject || m.Subject?.includes(subject)),
    );
    if (item)
      return fetch(`http://127.0.0.1:54324/api/v1/message/${item.ID}`).then(
        (r) => r.json(),
      );
    await new Promise((r) => setTimeout(r, 100));
  }
  throw Error("Local test mail was not received.");
}
export function checked(result) {
  if (result.error)
    throw Error(
      `Local beta operation failed: ${result.error.code ?? result.error.status ?? "unknown"} ${result.error.message}`,
    );
  return result.data;
}
export async function createFixtures() {
  const c = localConfig(),
    admin = localClient(c, c.serviceKey);
  const run = Date.now().toString(36);
  const groupA = checked(
    await admin
      .from("groups")
      .insert({ name: `Fictional Group A ${run}` })
      .select()
      .single(),
  );
  const groupB = checked(
    await admin
      .from("groups")
      .insert({ name: `Fictional Group B ${run}` })
      .select()
      .single(),
  );
  async function invite(label, group, role = "member") {
    const email = `cg-${label}-${run}@example.test`;
    checked(
      await admin.rpc("provision_beta_invitation", {
        p_email: email,
        p_group: group.id,
        p_display_name: `Fictional ${label}`,
        p_role: role,
      }),
    );
    const user = checked(await admin.auth.admin.inviteUserByEmail(email)).user;
    const mail = await mailFor(email);
    const tokenHash = mail.HTML?.match(/token_hash=([^&"\s<]+)/)?.[1];
    if (!tokenHash)
      throw Error(
        "Configured invite template did not produce a token-hash link.",
      );
    const client = localClient(c);
    checked(
      await client.auth.verifyOtp({ token_hash: tokenHash, type: "invite" }),
    );
    return { email, id: user.id, client };
  }
  return {
    config: c,
    admin,
    groupA,
    groupB,
    leader: await invite("leader", groupA, "leader"),
    a: await invite("member-a", groupA),
    b: await invite("member-b", groupA),
    outsider: await invite("outsider", groupB),
  };
}
