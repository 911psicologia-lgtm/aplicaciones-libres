#!/usr/bin/env python3
"""PequeWorld v5 — mini servidor local sin dependencias.

Sirve la carpeta de la app en http://localhost:8080 y abre el navegador.
Un servidor local (localhost) permite usar la cámara del avatar y la voz
al 100% en todos los navegadores modernos.
"""
import http.server
import os
import socketserver
import threading
import webbrowser

PORT = 8080
ROOT = os.path.dirname(os.path.abspath(__file__))


class Handler(http.server.SimpleHTTPRequestHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, directory=ROOT, **kwargs)

    def end_headers(self):
        self.send_header("Cache-Control", "no-store")
        super().end_headers()


def find_free_port(start):
    port = start
    while port < start + 20:
        try:
            with socketserver.TCPServer(("127.0.0.1", port), Handler) as s:
                s.server_close()
                return port
        except OSError:
            port += 1
    return start


def main():
    port = find_free_port(PORT)
    url = f"http://localhost:{port}"
    print("=" * 46)
    print("  🌈 PequeWorld v5 - Ingles para Ninos")
    print(f"  Servidor local listo: {url}")
    print("  Mantén esta ventana abierta mientras juegas.")
    print("  Para detener: cierra esta ventana o pulsa Ctrl+C")
    print("=" * 46)
    threading.Timer(1.2, lambda: webbrowser.open(url)).start()
    socketserver.TCPServer.allow_reuse_address = True
    with socketserver.TCPServer(("127.0.0.1", port), Handler) as httpd:
        try:
            httpd.serve_forever()
        except KeyboardInterrupt:
            print("\n👋 ¡Hasta la próxima!")


if __name__ == "__main__":
    main()
