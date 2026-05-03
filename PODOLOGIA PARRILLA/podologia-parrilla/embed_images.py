#!/usr/bin/env python3
"""
embed_images.py — Incrusta las fotos de podologiaparrilla.com en base64 dentro del index.html

Ejecutar UNA VEZ desde la carpeta raíz del proyecto (donde está public/):
    pip install requests
    python3 embed_images.py

Esto convierte las URLs externas de WordPress en data:image URIs embebidas,
lo que hace el HTML completamente autónomo (sin dependencias de internet para imágenes).
"""

import requests, base64, sys
from pathlib import Path

IMAGES = [
    (
        "https://www.podologiaparrilla.com/wp-content/uploads/2026/02/45E-scaled.jpg",
        "image/jpeg"
    ),
    (
        "https://www.podologiaparrilla.com/wp-content/uploads/2023/05/Historia-de-instagram-sobre-naturaleza-minimalista-verde-opaco-608x1080.png",
        "image/png"
    ),
    (
        "https://www.podologiaparrilla.com/wp-content/uploads/2023/05/huella-300x300.png",
        "image/png"
    ),
]

HEADERS = {
    "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 "
                  "(KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    "Referer": "https://www.podologiaparrilla.com/",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    "Accept-Language": "es-ES,es;q=0.9",
}

def embed(html_path: Path) -> None:
    html = html_path.read_text(encoding="utf-8")
    changed = 0

    for url, mime in IMAGES:
        if url not in html:
            print(f"  (ya embebida o no encontrada: {url.split('/')[-1]})")
            continue

        print(f"Descargando {url.split('/')[-1]} ...", end=" ", flush=True)
        try:
            r = requests.get(url, headers=HEADERS, timeout=30)
            r.raise_for_status()
            if not r.headers.get("content-type", "").startswith("image"):
                raise ValueError(f"Respuesta inesperada: {r.headers.get('content-type')}")
            b64 = base64.b64encode(r.content).decode()
            data_uri = f"data:{mime};base64,{b64}"
            html = html.replace(url, data_uri)
            changed += 1
            print(f"OK  ({len(r.content)//1024} KB)")
        except Exception as e:
            print(f"FALLO — {e}")
            print(f"  La URL original se mantiene (la imagen carga igualmente en el navegador).")

    if changed:
        html_path.write_text(html, encoding="utf-8")
        print(f"\n✓ {changed} imagen(es) embebida(s) en {html_path}")
    else:
        print("\nNo se realizaron cambios.")

if __name__ == "__main__":
    target = Path("public/index.html")
    if not target.exists():
        print(f"Error: no se encuentra {target}. Ejecuta el script desde la raíz del proyecto.")
        sys.exit(1)
    print(f"Procesando {target} ...\n")
    embed(target)
    print("\nListo. El index.html es ahora completamente autónomo.")
