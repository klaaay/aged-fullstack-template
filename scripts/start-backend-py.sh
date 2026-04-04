#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/../backend"
uv run python -c "from app.main import run_dev; run_dev()"
