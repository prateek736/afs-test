const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = 3000;
const PAGES_DIR = path.join(__dirname, "pages");

const MIME_TYPES = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "application/javascript",
  ".json": "application/json",
  ".png": "image/png",
  ".ico": "image/x-icon",
};

// Route → file mapping
const ROUTES = {
  "/": "index.html",
  "/search": "search.html",
  "/search-force": "search-force.html",
  "/listing": "listing.html",
  "/detail": "detail.html",
  "/guide-search": "guide-search.html",
  "/guide-detail": "guide-detail.html",
  "/guide-detail-nocategory": "guide-detail-nocategory.html",
};

function serveFile(filePath, res) {
  const ext = path.extname(filePath);
  const mime = MIME_TYPES[ext] || "application/octet-stream";

  fs.readFile(filePath, (err, data) => {
    if (err) {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("404 Not Found");
      return;
    }
    res.writeHead(200, { "Content-Type": mime });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const pathname = url.pathname;

  // Serve static files from root
  if (pathname === "/shared.js") {
    return serveFile(path.join(__dirname, "shared.js"), res);
  }
  if (pathname === "/afs.js") {
    return serveFile(path.join(__dirname, "afs.js"), res);
  }
  if (pathname === "/style.css") {
    return serveFile(path.join(__dirname, "style.css"), res);
  }

  // Route to HTML pages
  const htmlFile = ROUTES[pathname];
  if (htmlFile) {
    return serveFile(path.join(PAGES_DIR, htmlFile), res);
  }

  // Fallback 404
  res.writeHead(404, { "Content-Type": "text/plain" });
  res.end("404 Not Found");
});

server.listen(PORT, () => {
  console.log(`\n  AFS Test Server running at:\n`);
  console.log(`  http://localhost:${PORT}/            → Index`);
  console.log(`  http://localhost:${PORT}/search?kw=marketing  → Search (kw param)`);
  console.log(`  http://localhost:${PORT}/search-force         → Search (forced)`);
  console.log(`  http://localhost:${PORT}/listing              → Listing`);
  console.log(`  http://localhost:${PORT}/detail               → Detail`);
  console.log(`\n  Press Ctrl+C to stop.\n`);
});
