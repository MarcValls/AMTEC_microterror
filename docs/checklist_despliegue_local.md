# Checklist ejecutable de despliegue local

## Objetivo

Convertir el equipo de agentes de despliegue local en un flujo realmente utilizable desde dos sitios:

- el orquestador
- scripts locales del repositorio

## Piezas creadas

### Orquestador

- `services/agent-orchestrator/app/checklists.py`
- endpoint `GET /checklists/local-deploy`

Este endpoint devuelve un checklist machine-readable con:

- `repoDir`
- `executionCommand`
- `shutdownCommand`
- pasos con agente responsable
- comandos concretos
- artefactos esperados
- verificación por paso

## Scripts ejecutables locales

### Ejecutar checklist completo

```bash
REPO_DIR="/ruta/completa/a/AMTEC_microterror"
bash "${REPO_DIR}/scripts/run_local_deploy_checklist.sh"
```

### Detener servicios locales del checklist

```bash
REPO_DIR="/ruta/completa/a/AMTEC_microterror"
bash "${REPO_DIR}/scripts/stop_local_deploy.sh"
```

### Atajos con pnpm

```bash
cd "/ruta/completa/a/AMTEC_microterror"
pnpm run checklist:local
```

Parar:

```bash
cd "/ruta/completa/a/AMTEC_microterror"
pnpm run stop:local
```

## Qué hace el checklist ejecutable

1. detiene procesos previos del runtime local si existen
2. genera `.env.local` si falta
3. valida prerequisitos locales básicos
4. prepara `.venv-api`
5. instala dependencias de `apps/api`
6. arranca la API en background
7. espera `http://localhost:8000/health`
8. instala dependencias del workspace
9. arranca la web en background
10. espera `http://localhost:5173`
11. consulta healthcheck y sesiones persistidas
12. deja logs, pids y reporte final

## Artefactos generados por el checklist

Dentro del repositorio:

- `${REPO_DIR}/.local-runtime/api.log`
- `${REPO_DIR}/.local-runtime/web.log`
- `${REPO_DIR}/.local-runtime/api.pid`
- `${REPO_DIR}/.local-runtime/web.pid`
- `${REPO_DIR}/.local-runtime/local_deploy_report.txt`

## Endpoint del orquestador

Con placeholder:

```text
GET /checklists/local-deploy
```

Con ruta concreta:

```text
GET /checklists/local-deploy?repo_dir=/ruta/completa/a/AMTEC_microterror
```

## Qué agente queda realmente ejecutable

El agente que se materializa de forma más directa es:

- `local_deploy_manager`

Porque ahora tiene:

- catálogo
- playbook
- checklist machine-readable
- runner local real
- comando de parada

Los especialistas siguen siendo concretos y trazables por paso:

- `local_env_specialist`
- `sqlite_local_db_specialist`
- `api_boot_specialist`
- `web_runtime_specialist`
- `smoke_test_specialist`
