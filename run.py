#!/usr/bin/env python3
"""
FileSaviour: one command to set up and run everything locally.

    python run.py            set up (first time / when deps change), then start the site
    python run.py --engine   also start the processing engine (server + AI tools)
    python run.py setup      only install / migrate / build
    python run.py admin      create your admin (superuser) account
    python run.py build      production frontend build
    python run.py test       backend tests + lint + frontend typecheck

Stdlib only, so it runs before anything is installed. Windows, macOS, Linux.
"""

from __future__ import annotations

import hashlib
import os
import shutil
import signal
import socket
import subprocess
import sys
import threading
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
BACKEND, FRONTEND, ENGINE = ROOT / "backend", ROOT / "frontend", ROOT / "engine"
WIN = os.name == "nt"
BIN = "Scripts" if WIN else "bin"
PY = BACKEND / ".venv" / BIN / ("python.exe" if WIN else "python")
ENGINE_PY = ENGINE / ".venv" / BIN / ("python.exe" if WIN else "python")
NPM = shutil.which("npm") or "npm"
URL = "http://127.0.0.1:8000"

COLORS = {"web": "\033[94m", "vite": "\033[95m", "engine": "\033[93m", "run": "\033[92m"}
RESET = "\033[0m"
if WIN:
    os.system("")  # enable ANSI colours in the Windows console
for _stream in (sys.stdout, sys.stderr):
    _stream.reconfigure(encoding="utf-8", errors="replace")  # cp1252 consoles can't print arrows


def say(msg: str, who: str = "run") -> None:
    print(f"{COLORS.get(who, '')}[{who:>6}]{RESET} {msg}", flush=True)


def sh(cmd: list, cwd: Path, **kw) -> None:
    subprocess.run([str(c) for c in cmd], cwd=cwd, check=True, **kw)


def changed(stamp: Path, *sources: Path) -> bool:
    """True when the sources' content differs from the last successful install."""
    digest = hashlib.sha256(b"".join(s.read_bytes() for s in sources if s.exists())).hexdigest()
    if stamp.exists() and stamp.read_text() == digest:
        return False
    stamp.parent.mkdir(parents=True, exist_ok=True)
    stamp.write_text(digest)  # rolled back below if the install fails
    return True


def check_tools() -> None:
    if sys.version_info < (3, 12):
        sys.exit("FileSaviour needs Python 3.12+ (3.13 recommended). Get it from https://python.org")
    if not shutil.which("node"):
        sys.exit("FileSaviour needs Node.js 22+. Get it from https://nodejs.org")


def setup_backend() -> None:
    if not PY.exists():
        say("Creating Python virtual environment (backend/.venv)…")
        sh([sys.executable, "-m", "venv", ".venv"], BACKEND)
    stamp = BACKEND / ".venv" / ".installed"
    reqs = [BACKEND / "requirements" / f for f in ("base.txt", "dev.txt")]
    if changed(stamp, *reqs):
        say("Installing Python packages…")
        try:
            sh([PY, "-m", "pip", "install", "-q", "--disable-pip-version-check", "-r", "requirements/dev.txt"], BACKEND)
        except subprocess.CalledProcessError:
            stamp.unlink(missing_ok=True)
            raise
    say("Applying database migrations…")
    sh([PY, "manage.py", "migrate", "-v", "0"], BACKEND)
    if not any((BACKEND / "var" / "og").glob("*.png")):
        say("Rendering social preview images…")
        sh([PY, "manage.py", "build_brand_assets"], BACKEND, stdout=subprocess.DEVNULL)


def setup_frontend(build: bool = False) -> None:
    stamp = FRONTEND / "node_modules" / ".installed"
    if not (FRONTEND / "node_modules").exists() or changed(stamp, FRONTEND / "package-lock.json"):
        say("Installing JavaScript packages (npm ci)…")
        try:
            sh([NPM, "ci", "--no-audit", "--no-fund"], FRONTEND, shell=WIN)
        except subprocess.CalledProcessError:
            stamp.unlink(missing_ok=True)
            raise
        changed(stamp, FRONTEND / "package-lock.json")
    if build or not (FRONTEND / "dist" / "manifest.json").exists():
        say("Building the frontend (fallback bundle)…")
        sh([NPM, "run", "build:client"], FRONTEND, shell=WIN, stdout=subprocess.DEVNULL)


def setup_engine() -> None:
    if not ENGINE_PY.exists():
        say("Creating engine virtual environment…")
        sh([sys.executable, "-m", "venv", ".venv"], ENGINE)
    if changed(ENGINE / ".venv" / ".installed", ENGINE / "requirements.txt"):
        say("Installing engine packages (first time takes a few minutes)…")
        sh([ENGINE_PY, "-m", "pip", "install", "-q", "--disable-pip-version-check", "-r", "requirements.txt"], ENGINE)


def stream(proc: subprocess.Popen, who: str) -> None:
    for line in iter(proc.stdout.readline, ""):
        line = line.rstrip()
        if line:
            say(line, who)


def port_open(port: int) -> bool:
    try:
        with socket.create_connection(("127.0.0.1", port), timeout=0.3):
            return True
    except OSError:
        return False


def wait_for(port: int, seconds: float = 40) -> bool:
    end = time.time() + seconds
    while time.time() < end:
        if port_open(port):
            return True
        time.sleep(0.3)
    return False


def start(name: str, cmd: list, cwd: Path, env: dict | None = None, shell: bool = False) -> subprocess.Popen:
    flags = subprocess.CREATE_NEW_PROCESS_GROUP if WIN else 0
    proc = subprocess.Popen(
        [str(c) for c in cmd], cwd=cwd, env={**os.environ, "PYTHONUNBUFFERED": "1", **(env or {})},
        stdout=subprocess.PIPE, stderr=subprocess.STDOUT, text=True, encoding="utf-8", errors="replace",
        shell=shell, creationflags=flags, start_new_session=not WIN,
    )
    threading.Thread(target=stream, args=(proc, name), daemon=True).start()
    return proc


def stop(procs: list[subprocess.Popen]) -> None:
    for p in procs:
        if p.poll() is None:
            if WIN:
                subprocess.run(["taskkill", "/F", "/T", "/PID", str(p.pid)], capture_output=True)
            else:
                os.killpg(p.pid, signal.SIGTERM)


def serve(with_engine: bool) -> None:
    for port, what in ((8000, "Django"), (5173, "Vite")):
        if port_open(port):
            sys.exit(f"Port {port} is already in use (another {what} running?). Stop it and try again.")
    procs: list[subprocess.Popen] = []
    try:
        procs.append(start("vite", [NPM, "run", "dev"], FRONTEND, shell=WIN))
        if not wait_for(5173):
            say("Vite didn't start; Django will serve the last build instead.")
        env = {}
        if with_engine:
            token = "dev-engine-token"
            procs.append(start("engine", [ENGINE_PY, "app.py"], ENGINE, env={"ENGINE_TOKEN": token, "PORT": "8100"}))
            env["ENGINE_TOKEN"] = token
        procs.append(start("web", [PY, "manage.py", "runserver", "127.0.0.1:8000"], BACKEND, env=env))
        if wait_for(8000):
            say(f"FileSaviour is running → {URL}   (Ctrl+C to stop)")
            say(f"Admin console → {URL}/console   ·   SEO files → {URL}/sitemap.xml  {URL}/llms.txt")
            if not os.environ.get("NO_BROWSER"):
                webbrowser.open(URL)
        while all(p.poll() is None for p in procs):
            time.sleep(0.5)
        say("A process exited; shutting down.")
    except KeyboardInterrupt:
        say("Stopping…")
    finally:
        stop(procs)


def main() -> None:
    os.chdir(ROOT)
    args = sys.argv[1:]
    command = next((a for a in args if not a.startswith("-")), "dev")
    check_tools()
    try:
        if command in ("dev", "setup"):
            setup_backend()
            setup_frontend()
            if "--engine" in args:
                setup_engine()
            if command == "dev":
                serve("--engine" in args)
            else:
                say("Setup complete. Start with: python run.py")
        elif command == "admin":
            setup_backend()
            sh([PY, "manage.py", "createsuperuser"], BACKEND)
        elif command == "build":
            setup_frontend(build=True)
            sh([NPM, "run", "build"], FRONTEND, shell=WIN)
        elif command == "test":
            setup_backend()
            setup_frontend()
            sh([PY, "manage.py", "test", "apps"], BACKEND)
            sh([BACKEND / ".venv" / BIN / "ruff", "check", "backend", "engine/app.py", "engine/processors"], ROOT)
            sh([NPM, "run", "typecheck"], FRONTEND, shell=WIN)
            say("All checks passed.")
        else:
            print(__doc__)
    except subprocess.CalledProcessError as exc:
        sys.exit(f"\nStep failed: {' '.join(map(str, exc.cmd)) if isinstance(exc.cmd, list) else exc.cmd}")


if __name__ == "__main__":
    main()
