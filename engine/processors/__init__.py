"""
Processor registry: tool slug -> callable(inputs, options, workdir) -> Path.

Slugs match backend/apps/tools/registry.py. A slug that is missing here makes
the engine answer 501, and the Django job is marked failed with a clear message.
"""

from collections.abc import Callable
from pathlib import Path

Processor = Callable[[list[Path], dict, Path], Path]


class ProcessingError(Exception):
    """User-facing failure (bad file, wrong password, unsupported content)."""


registry: dict[str, Processor] = {}


def processor(*slugs: str):
    def wrap(fn: Processor) -> Processor:
        for s in slugs:
            registry[s] = fn
        return fn

    return wrap


# Import side effects register processors.
from . import ai, image, office, pdf  # noqa: E402,F401
