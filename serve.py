#!/usr/bin/env python3
"""Static file server for local preview that disables all caching.

Plain `python3 -m http.server` sends Last-Modified but no Cache-Control
header, so browsers apply heuristic caching and can serve stale HTML/CSS/JS
after edits even on a normal reload. This wrapper adds explicit no-store
headers to every response so the preview always reflects the files on disk.
"""
import sys
from http.server import HTTPServer, SimpleHTTPRequestHandler


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store, no-cache, must-revalidate, max-age=0")
        self.send_header("Pragma", "no-cache")
        self.send_header("Expires", "0")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8899
    HTTPServer(("", port), NoCacheHandler).serve_forever()
