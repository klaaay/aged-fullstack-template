#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> check web"
cd "$ROOT_DIR"

pnpm test:web
pnpm build:web
