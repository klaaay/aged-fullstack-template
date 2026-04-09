#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

echo "==> check docker"
cd "$ROOT_DIR"

docker build -f backend/Dockerfile -t aged-fullstack-template-api:ci ./backend
docker build -f frontend/Dockerfile -t aged-fullstack-template-web:ci .

docker compose config >/tmp/aged-fullstack-template-compose.runtime.yaml
docker compose -f docker-compose.yml -f docker-compose.dev.yml config >/tmp/aged-fullstack-template-compose.dev.yaml
