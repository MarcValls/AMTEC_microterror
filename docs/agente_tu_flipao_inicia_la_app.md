# Agente alias: Tu flipao inicia la app

## Objetivo

Convertir la frase:

```text
Tu flipao inicia la app
```

en una entrada técnica real de una sola llamada para levantar el entorno local jugable.

## Qué se ha añadido

### Agente alias

- `agentId`: `tu_flipao_inicia_la_app`
- `title`: `Tu flipao inicia la app`

Este agente no sustituye al coordinador principal. Lo encapsula.

Delegación:

- `tu_flipao_inicia_la_app` → `local_deploy_manager`

## Punto de entrada técnico

### Endpoint del orquestador

```text
GET /calls/tu-flipao-inicia-la-app
```

Con ruta concreta del repositorio:

```text
GET /calls/tu-flipao-inicia-la-app?repo_dir=/ruta/completa/a/AMTEC_microterror
```

Este endpoint devuelve:

- `executionCommand`
- `shutdownCommand`
- logs esperados
- checklist local resuelto

## Punto de entrada local

### Script directo

```bash
REPO_DIR="/ruta/completa/a/AMTEC_microterror"
bash "${REPO_DIR}/scripts/tu_flipao_inicia_la_app.sh"
```

### Atajo con pnpm

```bash
cd "/ruta/completa/a/AMTEC_microterror"
pnpm run tu:flipao:inicia:app
```

## Qué hace realmente

El alias ejecuta internamente:

- `scripts/run_local_deploy_checklist.sh`

Eso implica:

- preparar `.env.local`
- validar SQLite local
- levantar la API
- levantar la web
- esperar healthchecks
- dejar logs y reporte final

## Archivos implicados

- `services/agent-orchestrator/app/agent_catalog.py`
- `services/agent-orchestrator/app/calls.py`
- `services/agent-orchestrator/app/main.py`
- `scripts/tu_flipao_inicia_la_app.sh`
- `package.json`

## Resultado esperado

Tras la llamada, el objetivo es dejar disponible:

- API en `http://localhost:8000`
- web en `http://localhost:5173`
- reporte en `.local-runtime/local_deploy_report.txt`
