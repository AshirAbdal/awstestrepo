"""Simple JSON API backend for the api-server project.

Zero dependencies (Python standard library only).

Run:  python3 app.py [--host 0.0.0.0] [--port 8000]
"""

import argparse
import json
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer

ITEMS = [
    {"id": 1, "name": "Apple", "price": 1.25},
    {"id": 2, "name": "Banana", "price": 0.75},
]


def send_json(handler, data, status=200):
    body = json.dumps(data).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def ok(handler, data=None, message="OK", status=200):
    send_json(handler, {"success": True, "status": status, "message": message, "data": data}, status)


def fail(handler, message, status=400):
    send_json(handler, {"success": False, "status": status, "message": message, "data": None}, status)


class APIHandler(BaseHTTPRequestHandler):

    def do_GET(self):
        if self.path == "/health":
            ok(self, {"status": "ok"}, "Server is healthy")
        elif self.path == "/api/items":
            ok(self, {"items": ITEMS, "count": len(ITEMS)}, "Items fetched")
        else:
            fail(self, "Route not found", 404)

    def do_POST(self):
        if self.path == "/api/items":
            try:
                length = int(self.headers.get("Content-Length", 0))
                data = json.loads(self.rfile.read(length)) if length else {}
            except (json.JSONDecodeError, ValueError):
                fail(self, "Request body must be valid JSON", 400)
                return
            new_id = max((item["id"] for item in ITEMS), default=0) + 1
            item = {"id": new_id, **data}
            ITEMS.append(item)
            ok(self, item, "Item created", 201)
        else:
            fail(self, "Route not found", 404)

    def do_DELETE(self):
        if self.path.startswith("/api/items/"):
            try:
                item_id = int(self.path.rsplit("/", 1)[1])
            except ValueError:
                fail(self, "Invalid item id", 400)
                return
            for i, item in enumerate(ITEMS):
                if item["id"] == item_id:
                    ITEMS.pop(i)
                    ok(self, None, "Item deleted")
                    return
            fail(self, "Item not found", 404)
        else:
            fail(self, "Route not found", 404)

    def log_message(self, format, *args):
        print(f"[{self.log_date_time_string()}] {format % args}")


def main():
    parser = argparse.ArgumentParser(description="JSON API backend")
    parser.add_argument("--host", default="0.0.0.0", help="Bind address")
    parser.add_argument("--port", type=int, default=8000, help="Bind port")
    args = parser.parse_args()

    server = ThreadingHTTPServer((args.host, args.port), APIHandler)
    print(f"API listening on http://{args.host}:{args.port}")
    server.serve_forever()


if __name__ == "__main__":
    main()
