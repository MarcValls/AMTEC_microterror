#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_PATH="${REPO_DIR}/.env.local"
RUNTIME_DIR="${REPO_DIR}/.local-runtime"
API_LOG_PATH="${RUNTIME_DIR}/api.log"
WEB_LOG_PATH="${RUNTIME_DIR}/web.log"
REPORT_PATH="${RUNTIME_DIR}/local_deploy_report.txt"
API_PID_FILE="${RUNTIME_DIR}/api.pid"
WEB_PID_FILE="${RUNTIME_DIR}/web.pid"
VENV_DIR="${REPO_DIR}/.venv-api"
PYTHON_BIN="${VENV_DIR}/bin/python"
PIP_BIN="${VENV_DIR}/bin/pip"
UVICORN_BIN="${VENV_DIR}/bin/uvicorn"

require_command() {
  local command_name="$1"
  if ! command -v "${command_name}" >/dev/null 2>&1; then
    echo "Falta el comando requerido: ${command_name}" >&2
    exit 1
  fi
}

wait_for_url() {
  local target_url="$1"
  local attempts="$2"
  local sleep_seconds="$3"

  local index=1
  while [ "${index}" -le "${attempts}" ]; do
    if curl --silent --fail "${target_url}" >/dev/null 2>&1; then
      return 0
    fi
    sleep "${sleep_seconds}"
    index="$((index + 1))"
  done

  return 1
}

bash "${REPO_DIR}/scripts/stop_local_deploy.sh"
bash "${REPO_DIR}/scripts/setup_local_env.sh"

require_command "python3"
require_command "pnpm"
require_command "curl"

set -a
. "${ENV_PATH}"
set +a

mkdir -p "${RUNTIME_DIR}"
: > "${API_LOG_PATH}"
: > "${WEB_LOG_PATH}"
: > "${REPORT_PATH}"

if [ ! -d "${VENV_DIR}" ]; then
  python3 -m venv "${VENV_DIR}"
fi

"${PYTHON_BIN}" -m pip install --upgrade pip >> "${API_LOG_PATH}" 2>&1
"${PIP_BIN}" install -e "${REPO_DIR}/apps/api" >> "${API_LOG_PATH}" 2>&1

nohup "${UVICORN_BIN}" app.main:app \
  --app-dir "${REPO_DIR}/apps/api" \
  --host 0.0.0.0 \
  --port "${API_PORT}" \
  --reload >> "${API_LOG_PATH}" 2>&1 &

echo "$!" > "${API_PID_FILE}"

if ! wait_for_url "http://localhost:${API_PORT}/health" 40 1; then
  echo "API no disponible en http://localhost:${API_PORT}/health" | tee -a "${REPORT_PATH}" >&2
  exit 1
fi

cd "${REPO_DIR}"
pnpm install >> "${WEB_LOG_PATH}" 2>&1
nohup pnpm --filter @amtec/web dev >> "${WEB_LOG_PATH}" 2>&1 &

echo "$!" > "${WEB_PID_FILE}"

if ! wait_for_url "http://localhost:5173" 40 1; then
  echo "Web no disponible en http://localhost:5173" | tee -a "${REPORT_PATH}" >&2
  exit 1
fi

curl --silent --fail "http://localhost:${API_PORT}/health" >> "${REPORT_PATH}"
printf '\n' >> "${REPORT_PATH}"
curl --silent --fail "http://localhost:${API_PORT}/telemetry/sessions" >> "${REPORT_PATH}"
printf '\n' >> "${REPORT_PATH}"

SQLITE_PATH=""
if [[ "${DATABASE_URL}" == sqlite:///* ]]; then
  SQLITE_PATH="${DATABASE_URL#sqlite:///}"
fi

if [ -n "${SQLITE_PATH}" ]; then
  if [ -f "${SQLITE_PATH}" ]; then
    echo "SQLite detectada en ${SQLITE_PATH}" >> "${REPORT_PATH}"
  else
    echo "SQLite todavía no creada en ${SQLITE_PATH}. Se creará al persistir la primera sesión si aún no existe." >> "${REPORT_PATH}"
  fi

  "${PYTHON_BIN}" - <<'PY' >> "${REPORT_PATH}" 2>&1
import os
import sqlite3

database_url = os.environ.get("DATABASE_URL", "")
if database_url.startswith("sqlite:///"):
    database_path = database_url.replace("sqlite:///", "", 1)
    if os.path.exists(database_path):
        connection = sqlite3.connect(database_path)
        try:
            cursor = connection.execute("SELECT name FROM sqlite_master WHERE type='table' ORDER BY name")
            table_names = [row[0] for row in cursor.fetchall()]
            print("SQLite tables:", ", ".join(table_names) if table_names else "sin tablas")
        finally:
            connection.close()
    else:
        print(f"SQLite path not created yet: {database_path}")
PY
fi

echo "Checklist local completado." >> "${REPORT_PATH}"
echo "API log: ${API_LOG_PATH}"
echo "Web log: ${WEB_LOG_PATH}"
echo "Report: ${REPORT_PATH}"
