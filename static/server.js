"use strict";

import http from "http";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const HOST = "127.0.0.1";
const PORT = parseInt(process.env.PORT || "3003", 10);

// --- in-memory store ---
const dictionary = new Map();

// --- helpers ---
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

function send(res, status, content, type = "text/html") {
  res.writeHead(status, { "Content-Type": type });
  res.end(content);
}

function serveStatic(req, res, pathname) {
  // Map url path to file in ./static
  const safePath = pathname === "/" ? "/store.html" : pathname; // default page
  const filePath = path.join(__dirname, "static", safePath.replace(/^\/+/, ""));

  // simple content-type mapping
  const ext = path.extname(filePath).toLowerCase();
  const types = {
    ".html": "text/html; charset=utf-8",
    ".js": "application/javascript; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".json": "application/json; charset=utf-8",
  };
  const ct = types[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err)
      return send(res, 404, "404 Not Found", "text/plain; charset=utf-8");
    send(res, 200, data, ct);
  });
}

// --- API handlers ---
function handleStore(url, res) {
  const term = url.searchParams.get("term")?.trim();
  const definition = url.searchParams.get("definition")?.trim();
  if (!term || !definition) {
    return send(
      res,
      400,
      "Missing 'term' or 'definition'",
      "text/plain; charset=utf-8"
    );
  }
  dictionary.set(term.toLowerCase(), definition);
  return send(
    res,
    200,
    `Stored: ${term} → ${definition}`,
    "text/plain; charset=utf-8"
  );
}

function handleSearch(url, res) {
  const term = url.searchParams.get("term")?.trim();
  if (!term)
    return send(res, 400, "Missing 'term'", "text/plain; charset=utf-8");

  const found = dictionary.get(term.toLowerCase());
  if (!found)
    return send(
      res,
      404,
      `No definition found for "${term}"`,
      "text/plain; charset=utf-8"
    );

  return send(res, 200, found, "text/plain; charset=utf-8");
}

// --- server ---
const server = http.createServer(async (req, res) => {
  try {

    if (req.method === "OPTIONS") {
      res.writeHead(204);
      return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host}`);
    const { pathname } = url;

    // API routes
    if (pathname === "/store/") return handleStore(url, res);
    if (pathname === "/search/") return handleSearch(url, res);

    // Static (HTML/JS/CSS)
    return serveStatic(req, res, pathname);
  } catch (err) {
    console.error(err);
    return send(
      res,
      500,
      "500 Internal Server Error",
      "text/plain; charset=utf-8"
    );
  }
});

server.listen(PORT, HOST, () => {
  console.log(`Server is running at http://${HOST}:${PORT}/`);
});
