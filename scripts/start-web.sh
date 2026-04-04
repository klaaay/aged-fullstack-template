#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."
pnpm --filter @aged-template/web dev -- --host 127.0.0.1 --port "${WEB_PORT:-5173}"
