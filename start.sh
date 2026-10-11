#!/usr/bin/env sh
# Set up and start FileSaviour (opens http://127.0.0.1:8000).
cd "$(dirname "$0")" && exec python3 run.py "$@"
