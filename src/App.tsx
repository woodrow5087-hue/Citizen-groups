import "./features/beta/beta.css";
import { lazy, Suspense } from "react";
import DemoApp from "./DemoApp";
import { readBackendConfig } from "./features/beta/config";
const ConnectedApp = lazy(() => import("./features/beta/ConnectedApp"));
export default function App() {
  const config = readBackendConfig({
    VITE_APP_MODE: import.meta.env.VITE_APP_MODE,
    VITE_SUPABASE_URL: import.meta.env.VITE_SUPABASE_URL,
    VITE_SUPABASE_PUBLISHABLE_KEY: import.meta.env
      .VITE_SUPABASE_PUBLISHABLE_KEY,
  });
  if (config.mode === "error")
    return (
      <main className="app-shell">
        <h1>Beta configuration needs attention</h1>
        <p role="alert">{config.message}</p>
        <p>The beta stays closed until configuration is fixed.</p>
      </main>
    );
  if (config.mode === "demo")
    return (
      <>
        <div className="mode-banner" role="note">
          Fictional demo · This device only
        </div>
        <DemoApp />
      </>
    );
  return (
    <Suspense
      fallback={
        <main className="app-shell">
          <p role="status">Opening private beta…</p>
        </main>
      }
    >
      <ConnectedApp config={config} />
    </Suspense>
  );
}
