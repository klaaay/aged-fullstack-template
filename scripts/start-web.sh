#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"

if [ -f "$ROOT_DIR/.env" ]; then
  set -a
  # shellcheck disable=SC1090
  . "$ROOT_DIR/.env"
  set +a
fi

cd "$ROOT_DIR"
pnpm --filter @aged-template/web dev -- --host 127.0.0.1 --port "${WEB_PORT:-5173}"
