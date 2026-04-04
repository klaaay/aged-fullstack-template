#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/../.." && pwd)"

ENABLE_IMAGE_PUBLISH="${ENABLE_IMAGE_PUBLISH:-false}"
IMAGE_REGISTRY="${IMAGE_REGISTRY:-}"
IMAGE_NAMESPACE="${IMAGE_NAMESPACE:-aged-fullstack-template}"
IMAGE_TAG="${IMAGE_TAG:-$(git -C "$ROOT_DIR" rev-parse --short HEAD)}"
REGISTRY_USERNAME="${REGISTRY_USERNAME:-}"
REGISTRY_PASSWORD="${REGISTRY_PASSWORD:-}"

if [ "$ENABLE_IMAGE_PUBLISH" != "true" ]; then
  echo "Image publish is configured but disabled by default."
  exit 0
fi

if [ -z "$IMAGE_REGISTRY" ] || [ -z "$REGISTRY_USERNAME" ] || [ -z "$REGISTRY_PASSWORD" ]; then
  echo "Missing registry configuration for publish." >&2
  exit 1
fi

WEB_IMAGE="$IMAGE_REGISTRY/$IMAGE_NAMESPACE/web:$IMAGE_TAG"
API_IMAGE="$IMAGE_REGISTRY/$IMAGE_NAMESPACE/api:$IMAGE_TAG"

cd "$ROOT_DIR"

echo "$REGISTRY_PASSWORD" | docker login "$IMAGE_REGISTRY" -u "$REGISTRY_USERNAME" --password-stdin
docker build -f apps/web/Dockerfile -t "$WEB_IMAGE" .
docker build -f backend/Dockerfile -t "$API_IMAGE" ./backend
docker push "$WEB_IMAGE"
docker push "$API_IMAGE"
