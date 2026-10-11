import subprocess
from pathlib import Path

from . import ProcessingError


def run(cmd: list[str], *, timeout: int = 240, cwd: Path | None = None) -> None:
    """Run a converter binary with a hard timeout. Never uses a shell."""
    try:
        subprocess.run(cmd, check=True, timeout=timeout, cwd=cwd, capture_output=True)
    except subprocess.TimeoutExpired as exc:
        raise ProcessingError("This file took too long to process. Try a smaller file.") from exc
    except subprocess.CalledProcessError as exc:
        raise ProcessingError("The file couldn't be processed. It may be damaged or unsupported.") from exc
    except FileNotFoundError as exc:
        raise ProcessingError("This tool's converter isn't installed on the engine.") from exc


def stem(p: Path, fallback: str = "file") -> str:
    return p.stem.removeprefix("in-") or fallback
