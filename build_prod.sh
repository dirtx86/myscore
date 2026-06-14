#!/usr/bin/env bash
set -euo pipefail

VITE_API_URL="https://myscore.pacifictechnologies.mv/api"
VITE_ENVIRONMENT="production"
TAG="prod"

UI_IMAGE="dirtx86/scoreapp-ui:${TAG}"
BACKEND_IMAGE="dirtx86/scoreapp-backend:${TAG}"

echo "Building ${UI_IMAGE} (VITE_API_URL=${VITE_API_URL}, VITE_ENVIRONMENT=${VITE_ENVIRONMENT})"
docker build \
  --build-arg VITE_API_URL="${VITE_API_URL}" \
  --build-arg VITE_ENVIRONMENT="${VITE_ENVIRONMENT}" \
  -t "${UI_IMAGE}" \
  ./frontend
docker push "${UI_IMAGE}"

echo "Building ${BACKEND_IMAGE}"
docker build -t "${BACKEND_IMAGE}" ./backend
docker push "${BACKEND_IMAGE}"

echo "Done. Pull with:"
echo "  docker pull ${UI_IMAGE}"
echo "  docker pull ${BACKEND_IMAGE}"
