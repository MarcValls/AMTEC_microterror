# Equipo de agentes para despliegue local

## Objetivo

Definir un equipo pequeño y concreto para levantar el MVP del pasillo en entorno local sin introducir complejidad innecesaria.

La coordinación principal recae en un único agente:

- `local_deploy_manager`

Este agente no ejecuta todo por sí mismo. Orquesta especialistas concretos y cierra el resultado con un criterio verificable.

## Agente coordinador

### `local_deploy_manager`

Responsabilidades:

- validar que la ruta local del repositorio sea conocida
- comprobar que existe `.env.local` o activar su generación
- decidir el orden del arranque local
- asegurar que SQLite, API y web queden alineados
- cerrar con una verificación mínima de salud y persistencia

Criterio de éxito:

- `http://localhost:8000/health` responde correctamente
- `http://localhost:5173` carga la app
- la base SQLite local existe y puede persistir sesiones
- el runtime del pasillo puede iniciar sesión y registrar telemetría

## Especialistas delegados

### `local_env_specialist`

Se encarga de:

- generar `.env.local`
- comprobar `DATABASE_URL`
- validar `VITE_PUBLIC_API_BASE_URL`
- detectar huecos de prerequisitos

### `sqlite_local_db_specialist`

Se encarga de:

- verificar que la ruta SQLite local sea válida
- confirmar carpeta `data/local`
- revisar que la base local pueda crearse y reutilizarse
- comprobar tablas mínimas del MVP

### `api_boot_specialist`

Se encarga de:

- preparar `.venv-api`
- instalar dependencias de `apps/api`
- arrancar Uvicorn en local
- validar `GET /health`
- validar endpoints de sesiones y telemetría

### `web_runtime_specialist`

Se encarga de:

- instalar dependencias del workspace con pnpm
- arrancar Vite para `@amtec/web`
- validar conexión de la web con la API local
- confirmar que el runtime del pasillo puede iniciar una sesión

### `smoke_test_specialist`

Se encarga de:

- revisar el healthcheck de la API
- revisar sesiones persistidas
- comprobar tablas SQLite
- emitir veredicto final `go` o `no-go`

## Orden de trabajo

1. `local_env_specialist`
2. `sqlite_local_db_specialist`
3. `api_boot_specialist`
4. `web_runtime_specialist`
5. `smoke_test_specialist`

## Reglas del equipo

- no arrancar la web si la API no ha pasado healthcheck
- no dar por válido el despliegue si no existe persistencia real
- no usar PostgreSQL local para el flujo base del MVP
- no cerrar el trabajo sin un artefacto verificable

## Artefactos esperados

- `.env.local`
- archivo SQLite local
- API local escuchando en `localhost:8000`
- web local escuchando en `localhost:5173`
- lista de sesiones accesible en `/telemetry/sessions`

## Punto de integración con el orquestador

El catálogo de agentes y el playbook local se exponen desde:

- `services/agent-orchestrator/app/agent_catalog.py`
- `services/agent-orchestrator/app/playbooks.py`
- `services/agent-orchestrator/app/main.py`

Endpoints:

- `GET /agents`
- `GET /agents/{agent_id}`
- `GET /playbooks/local-deploy`
