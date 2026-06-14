#!/usr/bin/env bash
set -euo pipefail

# Usage:
# ./build.sh https://api.example.com v1.0.0

VITE_API_URL="${1:?API URL required}"
TAG="${2:-latest}"

IMAGE="dirtx86/frontend:${TAG}"

echo "Building ${IMAGE}"
echo "VITE_API_URL=${VITE_API_URL}"

docker build \
  --build-arg VITE_API_URL="${VITE_API_URL}" \
  -t "${IMAGE}" \
  ./frontend

docker push "${IMAGE}"

echo "Done."
echo "Pull with:"
echo "  docker pull ${IMAGE}"
