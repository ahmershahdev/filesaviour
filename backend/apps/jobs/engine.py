"""
Thin client for the Flask processing engine (/engine).

The engine is a separate, network-isolated container that does the risky work:
parsing untrusted PDFs/Office docs/images with LibreOffice, Ghostscript,
qpdf, Tesseract, rembg, etc. Django never parses user files itself.
"""

import json
from pathlib import Path

import httpx
from django.conf import settings


class EngineError(Exception):
    pass


def process(tool: str, files: list[Path], options: dict, out_dir: Path) -> Path:
    headers = {"Authorization": f"Bearer {settings.ENGINE_TOKEN}"}
    handles = [("files", (p.name, p.open("rb"))) for p in files]
    try:
        with httpx.Client(base_url=settings.ENGINE_URL, timeout=httpx.Timeout(280, connect=5)) as client:
            resp = client.post(f"/v1/{tool}", files=handles, data={"options": json.dumps(options)}, headers=headers)
    except httpx.HTTPError as exc:
        raise EngineError("Processing service is unavailable. Please try again.") from exc
    finally:
        for _, (_, fh) in handles:
            fh.close()

    if resp.status_code != 200:
        try:
            message = resp.json().get("error", "")
        except ValueError:
            message = ""
        raise EngineError(message or f"Processing failed ({resp.status_code}).")

    name = _filename(resp.headers.get("content-disposition", "")) or f"result-{tool}"
    out = out_dir / name
    out.write_bytes(resp.content)
    return out


def _filename(disposition: str) -> str:
    for part in disposition.split(";"):
        part = part.strip()
        if part.startswith("filename="):
            return Path(part[9:].strip('"')).name  # basename only: no path traversal
    return ""
