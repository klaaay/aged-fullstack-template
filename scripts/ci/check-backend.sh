#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> check backend"
cd "$ROOT_DIR"

pnpm test:backend
