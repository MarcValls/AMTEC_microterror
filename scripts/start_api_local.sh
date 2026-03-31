#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_PATH="${REPO_DIR}/.env.local"
VENV_DIR="${REPO_DIR}/.venv-api"
PYTHON_BIN="${VENV_DIR}/bin/python"
PIP_BIN="${VENV_DIR}/bin/pip"
UVICORN_BIN="${VENV_DIR}/bin/uvicorn"

bash "${REPO_DIR}/scripts/setup_local_env.sh"

set -a
. "${ENV_PATH}"
set +a

if [ ! -d "${VENV_DIR}" ]; then
  python3 -m venv "${VENV_DIR}"
fi

"${PYTHON_BIN}" -m pip install --upgrade pip
"${PIP_BIN}" install -e "${REPO_DIR}/apps/api"

"${UVICORN_BIN}" app.main:app \
  --app-dir "${REPO_DIR}/apps/api" \
  --host 0.0.0.0 \
  --port "${API_PORT}" \
  --reload
