// Disposable, localhost-only fictional test stack. Never targets a hosted project.
import { execFileSync, spawn } from "node:child_process";
import { randomBytes, createHmac } from "node:crypto";
import {
  readFileSync,
  writeFileSync,
  mkdirSync,
  existsSync,
  readdirSync,
  rmSync,
  openSync,
} from "node:fs";
const dir = ".beta-local",
  network = "cg-v06-tests";
const names = [
  "cg-v06-gateway",
  "cg-v06-rest",
  "cg-v06-auth",
  "cg-v06-mail",
  "cg-v06-db",
];
const docker = (args, options = {}) => {
  try {
    return execFileSync("docker", args, {
      encoding: "utf8",
      stdio: ["pipe", "pipe", "pipe"],
      ...options,
    });
  } catch (e) {
    throw Error(e.stderr?.toString() || "Local Docker command failed");
  }
};
const sql = (query) =>
  docker(
    [
      "exec",
      "-i",
      "cg-v06-db",
      "psql",
      "-U",
      "postgres",
      "-v",
      "ON_ERROR_STOP=1",
    ],
    { input: query },
  );
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
async function ready(check) {
  for (let i = 0; i < 90; i++) {
    try {
      if (await check()) return;
    } catch {}
    await sleep(1000);
  }
  throw Error(
    "Test service did not become ready. Inspect the named test container logs.",
  );
}
if (process.argv[2] === "stop") {
  if (existsSync(`${dir}/proxy.pid`)) {
    try {
      process.kill(Number(readFileSync(`${dir}/proxy.pid`, "utf8")));
    } catch {}
  }
  for (const name of names) {
    try {
      const label = docker([
        "inspect",
        "--format",
        '{{index .Config.Labels "citizen.beta-test"}}',
        name,
      ]).trim();
      if (label === "true") docker(["rm", "-f", "-v", name]);
    } catch {}
  }
  try {
    docker(["network", "rm", network]);
  } catch {}
  if (existsSync(dir)) rmSync(dir, { recursive: true });
  console.log("Stopped only the Citizen Groups local test containers.");
  process.exit(0);
}
if (existsSync(`${dir}/connection.json`))
  throw Error(
    "Local test state exists. Run npm run beta:stop before starting a clean stack.",
  );
mkdirSync(dir, { recursive: true, mode: 0o700 });
const secret = randomBytes(40).toString("hex"),
  password = randomBytes(24).toString("hex");
function jwt(role) {
  const enc = (v) => Buffer.from(JSON.stringify(v)).toString("base64url");
  const value =
    enc({ alg: "HS256", typ: "JWT" }) +
    "." +
    enc({
      role,
      iss: "supabase-local",
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 86400,
    });
  return (
    value + "." + createHmac("sha256", secret).update(value).digest("base64url")
  );
}
const config = {
  url: "http://127.0.0.1:54321",
  anonKey: jwt("anon"),
  serviceKey: jwt("service_role"),
  dbPassword: password,
  network,
};
writeFileSync(`${dir}/connection.json`, JSON.stringify(config), {
  mode: 0o600,
});
try {
  docker(["network", "create", network]);
} catch {}
function run(name, image, env = [], ports = [], command = []) {
  return docker([
    "run",
    "-d",
    "--label",
    "citizen.beta-test=true",
    "--name",
    name,
    "--network",
    network,
    ...env.flatMap((e) => ["-e", e]),
    ...ports.flatMap((p) => ["-p", `127.0.0.1:${p}`]),
    image,
    ...command,
  ]);
}
console.log(
  "Starting disposable PostgreSQL 17 and Supabase Auth/API test services…",
);
run(
  "cg-v06-db",
  "postgres:17.6-alpine3.22",
  [`POSTGRES_PASSWORD=${password}`],
  ["54326:5432"],
);
await ready(() => {
  docker(["exec", "cg-v06-db", "pg_isready", "-U", "postgres"]);
  return true;
});
sql(`create role anon nologin; create role authenticated nologin; create role service_role nologin bypassrls;
create role authenticator noinherit login password '${password}'; grant anon,authenticated,service_role to authenticator;
create role supabase_auth_admin login password '${password}'; create schema auth authorization supabase_auth_admin;
create schema extensions; create extension if not exists pgcrypto with schema extensions;
grant usage on schema auth,public,extensions to anon,authenticated,service_role,supabase_auth_admin;
grant create on database postgres to supabase_auth_admin;
alter role supabase_auth_admin set search_path=auth,public,extensions;
create function auth.uid() returns uuid language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),(nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'sub'))::uuid $$;
alter function auth.uid() owner to supabase_auth_admin;
grant execute on function auth.uid() to anon,authenticated,service_role;
`);
run(
  "cg-v06-mail",
  "public.ecr.aws/supabase/mailpit:v1.31.3",
  [],
  ["54324:8025"],
);
const proxy = spawn(process.execPath, ["scripts/beta-proxy.mjs"], {
  detached: true,
  stdio: [
    "ignore",
    openSync(`${dir}/proxy.log`, "a"),
    openSync(`${dir}/proxy.log`, "a"),
  ],
});
proxy.unref();
writeFileSync(`${dir}/proxy.pid`, String(proxy.pid));
// Static templates are served inside the Docker test network, never from a public URL.
if (existsSync("/etc/ssl/certs/ca-certificates.crt"))
  docker([
    "cp",
    "/etc/ssl/certs/ca-certificates.crt",
    "cg-v06-db:/etc/ssl/certs/ca-certificates.crt",
  ]);
docker(["exec", "cg-v06-db", "apk", "add", "--no-cache", "busybox-extras"]);
docker(["exec", "cg-v06-db", "mkdir", "-p", "/tmp/beta-templates"]);
for (const file of ["invite", "code"])
  docker([
    "cp",
    `supabase/templates/${file}.html`,
    `cg-v06-db:/tmp/beta-templates/${file}`,
  ]);
docker([
  "exec",
  "cg-v06-db",
  "chmod",
  "644",
  "/tmp/beta-templates/invite",
  "/tmp/beta-templates/code",
]);
docker([
  "exec",
  "-d",
  "cg-v06-db",
  "busybox-extras",
  "httpd",
  "-f",
  "-p",
  "54327",
  "-h",
  "/tmp/beta-templates",
]);
run(
  "cg-v06-auth",
  "public.ecr.aws/supabase/gotrue:v2.198.0",
  [
    "GOTRUE_API_HOST=0.0.0.0",
    "GOTRUE_API_PORT=9999",
    `API_EXTERNAL_URL=${config.url}/auth/v1`,
    "GOTRUE_SITE_URL=http://127.0.0.1:4180",
    "GOTRUE_URI_ALLOW_LIST=http://127.0.0.1:4180/",
    "GOTRUE_DB_DRIVER=postgres",
    `GOTRUE_DB_DATABASE_URL=postgres://supabase_auth_admin:${password}@cg-v06-db:5432/postgres`,
    "GOTRUE_DB_NAMESPACE=auth",
    `GOTRUE_JWT_SECRET=${secret}`,
    "GOTRUE_JWT_EXP=3600",
    "GOTRUE_JWT_AUD=authenticated",
    "GOTRUE_JWT_DEFAULT_GROUP_NAME=authenticated",
    "GOTRUE_JWT_ADMIN_ROLES=service_role",
    "GOTRUE_MAILER_SUBJECTS_INVITE=Your Citizen Groups invitation",
    "GOTRUE_MAILER_SUBJECTS_MAGIC_LINK=Your Citizen Groups sign-in code",
    "GOTRUE_DISABLE_SIGNUP=true",
    "GOTRUE_EXTERNAL_EMAIL_ENABLED=true",
    "GOTRUE_MAILER_AUTOCONFIRM=false",
    "GOTRUE_EXTERNAL_ANONYMOUS_USERS_ENABLED=false",
    "GOTRUE_SMTP_HOST=cg-v06-mail",
    "GOTRUE_SMTP_PORT=1025",
    "GOTRUE_SMTP_ADMIN_EMAIL=beta@example.test",
    "GOTRUE_SMTP_SENDER_NAME=Citizen Groups Local Test",
    "GOTRUE_RATE_LIMIT_EMAIL_SENT=1000",
    "GOTRUE_RATE_LIMIT_VERIFY=1000",
    "GOTRUE_RATE_LIMIT_TOKEN_REFRESH=1000",
    "GOTRUE_SMTP_MAX_FREQUENCY=1s",
    "GOTRUE_MAILER_OTP_EXP=600",
    "GOTRUE_MAILER_TEMPLATES_INVITE=http://cg-v06-db:54327/invite",
    "GOTRUE_MAILER_TEMPLATES_MAGIC_LINK=http://cg-v06-db:54327/code",
    "NO_PROXY=cg-v06-db,cg-v06-mail,localhost,127.0.0.1",
    "no_proxy=cg-v06-db,cg-v06-mail,localhost,127.0.0.1",
  ],
  ["54328:9999"],
);
await ready(async () => {
  const r = await fetch(`${config.url}/auth/v1/health`);
  return r.ok;
});
sql(
  `create or replace function auth.jwt() returns jsonb language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claims',true),'')::jsonb,'{}'::jsonb) $$; grant execute on function auth.jwt() to anon,authenticated,service_role; create or replace function auth.uid() returns uuid language sql stable as $$ select coalesce(nullif(current_setting('request.jwt.claim.sub',true),''),(nullif(current_setting('request.jwt.claims',true),'')::jsonb ->> 'sub'))::uuid $$; grant execute on function auth.uid() to anon,authenticated,service_role;`,
);
for (const migration of readdirSync("supabase/migrations")
  .filter((p) => p.endsWith(".sql"))
  .sort())
  sql(readFileSync(`supabase/migrations/${migration}`, "utf8"));
run(
  "cg-v06-rest",
  "public.ecr.aws/supabase/postgrest:v16.5",
  [
    `PGRST_DB_URI=postgres://authenticator:${password}@cg-v06-db:5432/postgres`,
    "PGRST_DB_SCHEMAS=public",
    "PGRST_DB_ANON_ROLE=anon",
    `PGRST_JWT_SECRET=${secret}`,
    "PGRST_DB_EXTRA_SEARCH_PATH=public,extensions",
  ],
  ["54329:3000"],
);
await ready(async () => {
  const r = await fetch(`${config.url}/rest/v1/`);
  return r.ok;
});
console.log(
  "Local test stack ready. Keys were generated locally and saved only in ignored .beta-local/connection.json; no email leaves the local mail catcher.",
);
