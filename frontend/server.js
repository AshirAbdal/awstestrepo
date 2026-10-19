const http = require("http");
const fs = require("fs");
const path = require("path");

const PORT = process.env.PORT || 3000;
const ROOT = __dirname;

const MIME = {
    ".html": "text/html; charset=utf-8",
    ".css": "text/css; charset=utf-8",
    ".js": "text/javascript; charset=utf-8",
    ".json": "application/json",
    ".png": "image/png",
    ".svg": "image/svg+xml",
    ".ico": "image/x-icon",
};

http
    .createServer((req, res) => {
        let pathname = decodeURIComponent(new URL(req.url, "http://localhost").pathname);
        if (pathname === "/") pathname = "/index.html";

        const filePath = path.normalize(path.join(ROOT, pathname));
        if (!filePath.startsWith(ROOT)) {
            res.writeHead(403);
            res.end("Forbidden");
            return;
        }

        fs.readFile(filePath, (err, data) => {
            if (err) {
                res.writeHead(404, { "Content-Type": "text/plain" });
                res.end("Not found");
                return;
            }
            res.writeHead(200, { "Content-Type": MIME[path.extname(filePath)] || "application/octet-stream" });
            res.end(data);
        });
    })
    .listen(PORT, "0.0.0.0", () => console.log(`Frontend serving on http://0.0.0.0:${PORT}`));
