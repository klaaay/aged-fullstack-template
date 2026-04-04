#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> setup node"
cd "$ROOT_DIR"

corepack enable
pnpm install --frozen-lockfile
