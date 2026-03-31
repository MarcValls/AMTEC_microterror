#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_TEMPLATE_PATH="${REPO_DIR}/.env.local.example"
ENV_PATH="${REPO_DIR}/.env.local"
LOCAL_DATA_DIR="${REPO_DIR}/data/local"
LOCAL_SQLITE_PATH="${LOCAL_DATA_DIR}/amtec_microterror.dev.db"
LOCAL_SQLITE_URL="sqlite:///${LOCAL_SQLITE_PATH}"

mkdir -p "${LOCAL_DATA_DIR}"

if [ ! -f "${ENV_TEMPLATE_PATH}" ]; then
  echo "No existe ${ENV_TEMPLATE_PATH}" >&2
  exit 1
fi

if [ ! -f "${ENV_PATH}" ]; then
  sed "s|__LOCAL_SQLITE_URL__|${LOCAL_SQLITE_URL}|g" "${ENV_TEMPLATE_PATH}" > "${ENV_PATH}"
  echo "Archivo creado: ${ENV_PATH}"
else
  if grep -q "__LOCAL_SQLITE_URL__" "${ENV_PATH}"; then
    sed -i.bak "s|__LOCAL_SQLITE_URL__|${LOCAL_SQLITE_URL}|g" "${ENV_PATH}"
    rm -f "${ENV_PATH}.bak"
    echo "Archivo actualizado: ${ENV_PATH}"
  else
    echo "Archivo conservado: ${ENV_PATH}"
  fi
fi

echo "Ruta SQLite local: ${LOCAL_SQLITE_PATH}"
