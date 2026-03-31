# Desarrollo local con SQLite

## Objetivo

Dejar el proyecto listo para desarrollar el MVP del pasillo en local sin levantar PostgreSQL local.

La estrategia de desarrollo queda así:

- **frontend local:** Vite en `http://localhost:5173`
- **API local:** FastAPI en `http://localhost:8000`
- **BD local:** SQLite en un archivo dentro del repositorio

## Ruta de la base de datos local

El flujo local genera una base SQLite en:

```text
${REPO_DIR}/data/local/amtec_microterror.dev.db
```

## Archivos implicados

- `${REPO_DIR}/.env.local.example`
- `${REPO_DIR}/.env.local`
- `${REPO_DIR}/scripts/setup_local_env.sh`
- `${REPO_DIR}/scripts/start_api_local.sh`
- `${REPO_DIR}/scripts/start_web_local.sh`

## Preparación inicial

### 1. Definir la ruta local del repositorio

```bash
REPO_DIR="/ruta/completa/a/AMTEC_microterror"
cd "${REPO_DIR}"
```

### 2. Generar el entorno local

```bash
bash "${REPO_DIR}/scripts/setup_local_env.sh"
```

Este comando:

- crea `${REPO_DIR}/data/local`
- crea `${REPO_DIR}/.env.local` si no existe
- fija `DATABASE_URL` con una ruta SQLite absoluta

## Arranque de la API local

En una terminal:

```bash
REPO_DIR="/ruta/completa/a/AMTEC_microterror"
bash "${REPO_DIR}/scripts/start_api_local.sh"
```

Este comando:

- asegura `.env.local`
- crea `${REPO_DIR}/.venv-api` si no existe
- instala las dependencias de `apps/api`
- arranca Uvicorn con recarga automática

## Arranque del frontend local

En otra terminal:

```bash
REPO_DIR="/ruta/completa/a/AMTEC_microterror"
bash "${REPO_DIR}/scripts/start_web_local.sh"
```

Este comando:

- asegura `.env.local`
- exporta `VITE_PUBLIC_API_BASE_URL`
- ejecuta `pnpm install`
- levanta Vite para `@amtec/web`

## Comandos alternativos desde la raíz

Una vez dentro del repositorio:

```bash
cd "/ruta/completa/a/AMTEC_microterror"
pnpm run setup:local
```

API:

```bash
cd "/ruta/completa/a/AMTEC_microterror"
pnpm run dev:api
```

Web:

```bash
cd "/ruta/completa/a/AMTEC_microterror"
pnpm run dev:web
```

## Variables principales

El archivo `${REPO_DIR}/.env.local` queda con estos valores base:

```dotenv
API_PORT=8000
AGENT_ORCHESTRATOR_PORT=8100
DATABASE_URL=sqlite:////ruta/completa/a/AMTEC_microterror/data/local/amtec_microterror.dev.db
CORS_ALLOW_ORIGINS=http://localhost:5173,http://127.0.0.1:5173
PUBLIC_API_BASE_URL=http://localhost:8000
VITE_PUBLIC_API_BASE_URL=http://localhost:8000
VITE_DEFAULT_SCENE_ID=corredor_v1
```

## Comprobaciones rápidas

### Verificar el healthcheck de la API

```bash
curl "http://localhost:8000/health"
```

### Verificar sesiones persistidas

```bash
curl "http://localhost:8000/telemetry/sessions"
```

### Inspeccionar la base SQLite

```bash
REPO_DIR="/ruta/completa/a/AMTEC_microterror"
sqlite3 "${REPO_DIR}/data/local/amtec_microterror.dev.db" ".tables"
```

## Cambio posterior a Render PostgreSQL

Cuando quieras salir de SQLite local, solo tendrás que reemplazar `DATABASE_URL` en el entorno del servicio por la cadena PostgreSQL de Render.

La capa ORM ya queda preparada para ese cambio.
