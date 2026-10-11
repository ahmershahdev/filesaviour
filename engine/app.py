"""
FileSaviour processing engine (Flask).

A small, stateless HTTP service that does the dangerous work: parsing
untrusted files with LibreOffice, Ghostscript, qpdf/pikepdf, Tesseract,
gifsicle and rembg, and calling the AI provider. It runs in its own container:

  * no database, no user data at rest: input arrives in the request, the
    result goes back in the response, the temp dir is wiped either way
  * no inbound access except from Django (shared bearer token, private network)
  * no outbound network except the AI provider (egress allowlist)
  * read-only root filesystem, non-root user, CPU/memory/time limits

POST /v1/<tool-slug>   multipart: files[], options (JSON)  ->  result file
GET  /healthz
"""

import hmac
import json
import os
import shutil
import tempfile
import time
from pathlib import Path

from flask import Flask, abort, jsonify, request, send_file

from processors import ProcessingError, registry

MAX_BYTES = int(os.environ.get("ENGINE_MAX_MB", "220")) * 1024 * 1024
WORK_ROOT = Path(os.environ.get("ENGINE_TMP", tempfile.gettempdir())) / "filesaviour-engine"
SWEEP_AFTER_S = 600


def sweep() -> None:
    """Safety net: remove work dirs older than 10 minutes, whatever happened to their request."""
    cutoff = time.time() - SWEEP_AFTER_S
    for d in WORK_ROOT.glob("job-*"):
        try:
            if d.stat().st_mtime < cutoff:
                shutil.rmtree(d, ignore_errors=True)
        except FileNotFoundError:
            pass


def create_app() -> Flask:
    app = Flask(__name__)
    app.config["MAX_CONTENT_LENGTH"] = MAX_BYTES
    token = os.environ.get("ENGINE_TOKEN", "")
    if not token:
        raise RuntimeError("ENGINE_TOKEN must be set")

    @app.before_request
    def _auth():
        if request.path == "/healthz":
            return
        given = request.headers.get("Authorization", "").removeprefix("Bearer ")
        if not hmac.compare_digest(given, token):
            abort(401)
        return

    @app.get("/healthz")
    def healthz():
        return {"ok": True, "tools": sorted(registry.keys())}

    @app.post("/v1/<tool>")
    def run(tool: str):
        processor = registry.get(tool)
        if processor is None:
            return jsonify(error="This tool isn't available on the processing engine yet."), 501
        try:
            options = json.loads(request.form.get("options") or "{}")
        except ValueError:
            return jsonify(error="Invalid options."), 400

        if not request.files.getlist("files"):
            return jsonify(error="No file received."), 400

        WORK_ROOT.mkdir(parents=True, exist_ok=True)
        sweep()
        work = Path(tempfile.mkdtemp(prefix="job-", dir=WORK_ROOT))
        try:
            inputs = []
            for i, f in enumerate(request.files.getlist("files")):
                # Never use the client filename on disk.
                path = work / f"in-{i:03d}{Path(f.filename or '').suffix.lower()[:10]}"
                f.save(path)
                inputs.append(path)
            out = processor(inputs, options, work)
            # send_file streams from disk; the dir is removed once the response closes
            # (and by sweep() if the OS still holds a handle at that moment).
            response = send_file(out, as_attachment=True, download_name=out.name)
            response.call_on_close(lambda: shutil.rmtree(work, ignore_errors=True))
            return response
        except ProcessingError as exc:
            shutil.rmtree(work, ignore_errors=True)
            return jsonify(error=str(exc)), 422
        except Exception:
            shutil.rmtree(work, ignore_errors=True)
            app.logger.exception("processor %s crashed", tool)
            return jsonify(error="Processing failed."), 500

    return app


app = create_app() if os.environ.get("ENGINE_TOKEN") else None

if __name__ == "__main__":
    create_app().run(host="127.0.0.1", port=int(os.environ.get("PORT", "8100")), debug=False)
