"""Serve the Reveal.js deck without letting the browser cache it.

Plain `python3 -m http.server` sends no cache headers, so browsers reuse stale
CSS and JS after an edit. Usage: python3 serve.py PORT DIRECTORY
"""
import sys
from functools import partial
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


class NoCacheHandler(SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


if __name__ == "__main__":
    port = int(sys.argv[1]) if len(sys.argv) > 1 else 8173
    directory = sys.argv[2] if len(sys.argv) > 2 else "reveal"
    handler = partial(NoCacheHandler, directory=directory)
    ThreadingHTTPServer(("", port), handler).serve_forever()
