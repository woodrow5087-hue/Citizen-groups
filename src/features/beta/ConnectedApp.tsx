import { useMemo } from "react";
import { createBetaClient } from "./client";
import { betaRepository } from "./repository";
import { AuthGate } from "./AuthGate";
import LiveApp from "./LiveApp";
import "./beta.css";
export default function ConnectedApp({
  config,
}: {
  config: { url: string; key: string };
}) {
  const client = useMemo(
    () => createBetaClient(config.url, config.key),
    [config.url, config.key],
  );
  const repository = useMemo(() => betaRepository(client), [client]);
  return (
    <AuthGate client={client} repository={repository}>
      {(session, profile) => (
        <LiveApp
          key={session.user.id}
          client={client}
          repository={repository}
          userId={session.user.id}
          profile={profile}
        />
      )}
    </AuthGate>
  );
}
