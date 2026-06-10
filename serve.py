#!/usr/bin/env python3
"""Simple static server for local development."""
import http.server
import socketserver
import os

PORT = int(os.environ.get("PORT", "8080"))
DIR = os.path.join(os.path.dirname(__file__), "_site")

os.chdir(DIR)

class Handler(http.server.SimpleHTTPRequestHandler):
    extensions_map = {
        **http.server.SimpleHTTPRequestHandler.extensions_map,
        ".js": "application/javascript",
    }

with socketserver.TCPServer(("", PORT), Handler) as httpd:
    print(f"Serving {DIR} at http://localhost:{PORT}")
    httpd.serve_forever()
