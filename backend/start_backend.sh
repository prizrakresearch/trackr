#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

VENV_PYTHON="$SCRIPT_DIR/.venv/bin/python"
PORT="9696"

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  echo "Usage: ./start_backend.sh [--restart]"
  echo "  --restart   Kill process using port $PORT, then start backend"
  exit 0
fi

if [[ ! -x "$VENV_PYTHON" ]]; then
  echo "Error: Python executable not found at $VENV_PYTHON"
  echo "Create the virtual environment first: python3 -m venv .venv"
  exit 1
fi

existing_pid="$(lsof -ti tcp:"$PORT" || true)"

if [[ -n "$existing_pid" ]]; then
  if [[ "${1:-}" == "--restart" ]]; then
    echo "Port $PORT is in use by PID(s): $existing_pid"
    echo "Stopping existing process(es)..."
    kill $existing_pid
    sleep 1
  else
    echo "Port $PORT is already in use by PID(s): $existing_pid"
    echo "If this is your running backend, use it directly:"
    echo "  curl http://localhost:$PORT/health"
    echo "If you want to restart, run:"
    echo "  ./start_backend.sh --restart"
    exit 0
  fi
fi

exec "$VENV_PYTHON" -m uvicorn main:app --host 0.0.0.0 --port "$PORT"
