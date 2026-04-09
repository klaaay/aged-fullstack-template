#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

IMAGE_REGISTRY="${IMAGE_REGISTRY:-registry.example.invalid}"
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-aged-fullstack-template}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"

WEB_IMAGE="$IMAGE_REGISTRY/$IMAGE_NAMESPACE/web:$IMAGE_TAG"
API_IMAGE="$IMAGE_REGISTRY/$IMAGE_NAMESPACE/api:$IMAGE_TAG"

echo "==> build images"
cd "$ROOT_DIR"

docker build -f frontend/Dockerfile -t "$WEB_IMAGE" .
docker build -f backend/Dockerfile -t "$API_IMAGE" ./backend

printf 'WEB_IMAGE=%s\n' "$WEB_IMAGE"
printf 'API_IMAGE=%s\n' "$API_IMAGE"
