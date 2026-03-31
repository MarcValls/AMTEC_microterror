#!/usr/bin/env bash
set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_DIR="$(cd "${SCRIPT_DIR}/.." && pwd)"
ENV_PATH="${REPO_DIR}/.env.local"

bash "${REPO_DIR}/scripts/setup_local_env.sh"

set -a
. "${ENV_PATH}"
set +a

cd "${REPO_DIR}"
pnpm install
pnpm --filter @amtec/web dev
