import { loadEnv } from "vite";
import { defineConfig } from "vitest/config";
import { configDefaults } from "vitest/config";
import react from "@vitejs/plugin-react";
import { readBackendConfig } from "./src/features/beta/config";
export default defineConfig(({ mode }) => {
  const config = readBackendConfig({
    ...process.env,
    ...loadEnv(mode, process.cwd(), "VITE_"),
  });
  if (config.mode === "error") throw Error(config.message);
  const connect = config.mode === "beta" ? `'self' ${config.url}` : "'self'";
  const csp = `default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src ${connect}; object-src 'none'; base-uri 'self'; frame-ancestors 'none'; form-action 'self'`;
  return {
    plugins: [
      react(),
      {
        name: "beta-csp",
        generateBundle() {
          this.emitFile({
            type: "asset",
            fileName: "_headers",
            source: `/*\n  Content-Security-Policy: ${csp}\n  X-Content-Type-Options: nosniff\n  Referrer-Policy: no-referrer\n`,
          });
        },
      },
    ],
    test: {
      environment: "jsdom",
      setupFiles: "./src/test-setup.ts",
      exclude: [...configDefaults.exclude, "tests/beta/**", "e2e/**"],
    },
  };
});
