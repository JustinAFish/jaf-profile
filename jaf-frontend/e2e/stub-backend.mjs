/**
 * Minimal HTTP stub for POST /api/chat/message (Playwright E2E).
 * Playwright waits on GET / returning 200 before running tests.
 */
import http from "node:http";

const port = Number(process.env.STUB_CHAT_PORT || 9999);

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

const server = http.createServer((req, res) => {
  if (req.method === "OPTIONS") {
    res.writeHead(204, cors);
    res.end();
    return;
  }

  if (req.method === "GET" && (req.url === "/" || req.url === "")) {
    res.writeHead(200, { "Content-Type": "text/plain", ...cors });
    res.end("ok");
    return;
  }

  if (req.method === "POST" && req.url === "/api/chat/message") {
    let body = "";
    req.on("data", (c) => {
      body += c;
    });
    req.on("end", () => {
      res.writeHead(200, { "Content-Type": "application/json", ...cors });
      res.end(
        JSON.stringify({
          response: "E2E stub reply",
          sources: [],
          escalate_to_hypercare: false,
        }),
      );
    });
    return;
  }

  res.writeHead(404);
  res.end();
});

server.listen(port, "127.0.0.1", () => {
  console.error(`stub-backend listening on ${port}`);
});
