#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

"$ROOT_DIR/scripts/ensure-infra.sh"

cleanup() {
  kill 0
}

trap cleanup EXIT INT TERM

"$ROOT_DIR/scripts/start-backend-py.sh" &
"$ROOT_DIR/scripts/start-web.sh" &

wait
