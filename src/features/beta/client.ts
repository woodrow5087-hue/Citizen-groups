import { createClient } from "@supabase/supabase-js";
import type { Database } from "./database.types";
export function createBetaClient(url: string, key: string) {
  return createClient<Database>(url, key, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: false,
      flowType: "pkce",
      storageKey: `citizen-beta-auth:${new URL(url).host}`,
    },
  });
}
export type BetaClient = ReturnType<typeof createBetaClient>;
