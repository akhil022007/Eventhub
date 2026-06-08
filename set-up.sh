#!/usr/bin/env bash
#
# Brings up EventHub (Next.js app + PostgreSQL) locally with Docker Compose.
# Builds the image, applies migrations, and waits until the app is reachable.
#
set -euo pipefail
cd "$(dirname "$0")"

# --- prerequisites ---------------------------------------------------------
if ! command -v docker >/dev/null 2>&1; then
  echo "Docker is not installed. Install Docker Desktop first." >&2
  exit 1
fi

if ! docker compose version >/dev/null 2>&1; then
  echo "'docker compose' is not available. Update Docker to a recent version." >&2
  exit 1
fi

# --- ensure a session secret exists (compose substitutes ${SESSION_SECRET}) -
if [ ! -f .env ] || ! grep -q '^SESSION_SECRET=' .env; then
  echo "Generating SESSION_SECRET into .env"
  if command -v openssl >/dev/null 2>&1; then
    SECRET="$(openssl rand -hex 32)"
  else
    SECRET="$(head -c 32 /dev/urandom | od -An -tx1 | tr -d ' \n')"
  fi
  echo "SESSION_SECRET=\"$SECRET\"" >> .env
fi

# Make SESSION_SECRET available for compose variable substitution.
set -a
# shellcheck disable=SC1091
. ./.env
set +a

# --- build image if missing ------------------------------------------------
# Reuses the eventhub:dev image if it already exists (e.g. from `make
# docker-build`). To force a rebuild after code changes, run `make rebuild`.
if docker image inspect eventhub:dev >/dev/null 2>&1; then
  echo "Using existing eventhub:dev image (run 'make docker-build' to rebuild)."
else
  echo "Building eventhub:dev image..."
  docker build -t eventhub:dev .
fi

# --- start -----------------------------------------------------------------
echo "Starting app + postgres..."
docker compose up -d

# --- wait for readiness ----------------------------------------------------
echo "Waiting for EventHub at http://localhost:3000 ..."
for _ in $(seq 1 60); do
  if curl -sf -o /dev/null http://localhost:3000/login; then
    echo ""
    echo " EventHub is running at http://localhost:3000"
    echo "   Register a user at http://localhost:3000/register"
    echo "   Logs:  docker compose logs -f app"
    echo "   Stop:  docker compose down"
    exit 0
  fi
  sleep 2
done

echo "App did not become ready in time. Check logs with: docker compose logs -f app" >&2
exit 1
