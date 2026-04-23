#!/usr/bin/env python3
"""
Run this to serve Qspeed locally and avoid CORS errors.
Usage: python3 serve.py
Then open: http://localhost:8080
"""
import http.server, socketserver, os

PORT = 8080
os.chdir(os.path.dirname(os.path.abspath(__file__)))

class Handler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Cache-Control', 'no-cache')
        super().end_headers()
    def log_message(self, fmt, *args):
        pass  # suppress request logs

with socketserver.TCPServer(('', PORT), Handler) as httpd:
    print(f'Qspeed running at http://localhost:{PORT}')
    print('Press Ctrl+C to stop.')
    httpd.serve_forever()
