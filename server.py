#!/usr/bin/env python3
"""
Simple HTTP server for Lily Unicorns game
Run this to serve the game files locally and avoid CORS issues
"""
import http.server
import socketserver
import os
import webbrowser
from pathlib import Path

# Set the directory to serve files from
os.chdir(Path(__file__).parent)

PORT = 8000

class NoCacheHTTPRequestHandler(http.server.SimpleHTTPRequestHandler):
    def end_headers(self):
        # Add no-cache headers for JSON files
        if self.path.endswith('.json'):
            self.send_header('Cache-Control', 'no-cache, no-store, must-revalidate')
            self.send_header('Pragma', 'no-cache')
            self.send_header('Expires', '0')
        super().end_headers()

if __name__ == "__main__":
    try:
        with socketserver.TCPServer(("", PORT), NoCacheHTTPRequestHandler) as httpd:
            print(f"✨ Lily Unicorns Server Starting...")
            print(f"🦄 Open your browser to: http://localhost:{PORT}")
            print(f"📁 Serving files from: {os.getcwd()}")
            print(f"🔄 Press Ctrl+C to stop the server")
            print()
            
            # Try to open browser automatically
            try:
                webbrowser.open(f'http://localhost:{PORT}')
                print("🌐 Browser opened automatically")
            except:
                print("💡 Please open the URL manually in your browser")
            
            print()
            httpd.serve_forever()
            
    except KeyboardInterrupt:
        print("\n👋 Server stopped. Thanks for playing!")
    except OSError as e:
        if e.errno == 98:  # Address already in use
            print(f"❌ Port {PORT} is already in use. Try a different port or stop the other server.")
        else:
            print(f"❌ Error starting server: {e}")
