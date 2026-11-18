import { describe, it, expect } from "vitest";
import { readBackendConfig } from "./config";
const publicEnv = {
  VITE_APP_MODE: "beta",
  VITE_SUPABASE_URL: "https://example.supabase.co",
  VITE_SUPABASE_PUBLISHABLE_KEY: "sb_publishable_unit_fixture",
};
describe("explicit demo/live boundary", () => {
  it("defaults to the fictional demo only when unconfigured or explicitly selected", () => {
    expect(readBackendConfig({})).toEqual({ mode: "demo" });
    expect(readBackendConfig({ ...publicEnv, VITE_APP_MODE: "demo" })).toEqual({
      mode: "demo",
    });
  });
  it("fails closed for partial or invalid live configuration", () => {
    expect(readBackendConfig({ VITE_APP_MODE: "beta" }).mode).toBe("error");
    expect(
      readBackendConfig({ VITE_SUPABASE_URL: publicEnv.VITE_SUPABASE_URL })
        .mode,
    ).toBe("error");
    expect(
      readBackendConfig({ ...publicEnv, VITE_APP_MODE: "unknown" }).mode,
    ).toBe("error");
  });
  it("rejects server credentials even in an explicit demo build", () => {
    for (const key of [
      "sb_secret_unit_fixture",
      "x." + btoa(JSON.stringify({ role: "service_role" })) + ".unit",
    ]) {
      expect(
        readBackendConfig({ ...publicEnv, VITE_SUPABASE_PUBLISHABLE_KEY: key })
          .mode,
      ).toBe("error");
      expect(
        readBackendConfig({
          ...publicEnv,
          VITE_APP_MODE: "demo",
          VITE_SUPABASE_PUBLISHABLE_KEY: key,
        }).mode,
      ).toBe("error");
    }
    expect(
      readBackendConfig({
        VITE_APP_MODE: "demo",
        VITE_SUPABASE_SERVICE_ROLE_KEY: "unit-fixture",
      }).mode,
    ).toBe("error");
  });
  it("accepts a public key over HTTPS or localhost and rejects remote HTTP, credentials and query strings", () => {
    expect(readBackendConfig(publicEnv).mode).toBe("beta");
    expect(
      readBackendConfig({
        ...publicEnv,
        VITE_SUPABASE_URL: "http://127.0.0.1:54321",
      }).mode,
    ).toBe("beta");
    for (const url of [
      "http://example.supabase.co",
      "https://user:password@example.supabase.co",
      "https://example.supabase.co/?token=x",
      "https://example.supabase.co/path",
    ])
      expect(
        readBackendConfig({ ...publicEnv, VITE_SUPABASE_URL: url }).mode,
      ).toBe("error");
  });
});
