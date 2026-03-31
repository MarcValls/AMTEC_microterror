#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
RUNTIME_DIR="${REPO_DIR}/.local-runtime"
API_PID_FILE="${RUNTIME_DIR}/api.pid"
WEB_PID_FILE="${RUNTIME_DIR}/web.pid"

stop_pid_if_running() {
  local pid_file_path="$1"

  if [ -f "${pid_file_path}" ]; then
    local process_id
    process_id="$(cat "${pid_file_path}")"

    if [ -n "${process_id}" ] && kill -0 "${process_id}" >/dev/null 2>&1; then
      kill "${process_id}" >/dev/null 2>&1 || true
      wait "${process_id}" 2>/dev/null || true
    fi

    rm -f "${pid_file_path}"
  fi
}

mkdir -p "${RUNTIME_DIR}"
stop_pid_if_running "${API_PID_FILE}"
stop_pid_if_running "${WEB_PID_FILE}"

echo "Servicios locales detenidos si estaban activos."
