// Local test API adapter only. Email templates are served within the private Docker network.
import http from "node:http";
import { readFileSync } from "node:fs";
const api = http.createServer((req, res) => {
  const auth = req.url?.startsWith("/auth/v1/");
  const rest = req.url?.startsWith("/rest/v1/");
  if (!auth && !rest) {
    res.writeHead(404);
    return res.end();
  }
  if (req.method === "OPTIONS") {
    res.writeHead(204, {
      "access-control-allow-origin": "*",
      "access-control-allow-headers":
        "authorization,apikey,content-type,x-client-info,prefer,accept-profile,content-profile,x-supabase-api-version",
      "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
    });
    return res.end();
  }
  const path = req.url.slice(auth ? 8 : 8) || "/";
  const upstream = http.request(
    {
      hostname: "127.0.0.1",
      port: auth ? 54328 : 54329,
      path,
      method: req.method,
      headers: { ...req.headers, host: "127.0.0.1" },
    },
    (response) => {
      res.writeHead(response.statusCode ?? 502, {
        ...response.headers,
        "access-control-allow-origin": "*",
      });
      response.pipe(res);
    },
  );
  upstream.on("error", () => {
    res.writeHead(502);
    res.end("Local test service unavailable");
  });
  req.pipe(upstream);
});
api.listen(54321, "127.0.0.1");
