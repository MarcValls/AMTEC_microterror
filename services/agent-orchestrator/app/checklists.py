from __future__ import annotations

DEFAULT_REPO_PLACEHOLDER = "/ruta/completa/a/AMTEC_microterror"


def resolve_local_deploy_checklist(repo_dir: str | None = None) -> dict:
    resolved_repo_dir = repo_dir or DEFAULT_REPO_PLACEHOLDER

    setup_command = f'bash "{resolved_repo_dir}/scripts/setup_local_env.sh"'
    api_command = f'bash "{resolved_repo_dir}/scripts/start_api_local.sh"'
    web_command = f'bash "{resolved_repo_dir}/scripts/start_web_local.sh"'
    run_command = f'bash "{resolved_repo_dir}/scripts/run_local_deploy_checklist.sh"'
    stop_command = f'bash "{resolved_repo_dir}/scripts/stop_local_deploy.sh"'
    env_file = f"{resolved_repo_dir}/.env.local"
    sqlite_file = f"{resolved_repo_dir}/data/local/amtec_microterror.dev.db"

    return {
        "checklistId": "local_deploy_executable_checklist",
        "goal": "levantar y validar el MVP del pasillo en local con SQLite, API y web conectados",
        "repoDir": resolved_repo_dir,
        "executionCommand": run_command,
        "shutdownCommand": stop_command,
        "steps": [
            {
                "step": 1,
                "agentId": "local_env_specialist",
                "title": "Preparar entorno local",
                "commands": [setup_command],
                "expectedArtifacts": [env_file],
                "successCheck": f'test -f "{env_file}"',
            },
            {
                "step": 2,
                "agentId": "sqlite_local_db_specialist",
                "title": "Preparar SQLite local",
                "commands": [setup_command],
                "expectedArtifacts": [sqlite_file],
                "successCheck": f'test -f "{sqlite_file}" || test -f "{env_file}"',
            },
            {
                "step": 3,
                "agentId": "api_boot_specialist",
                "title": "Levantar API local",
                "commands": [api_command],
                "expectedArtifacts": ["http://localhost:8000/health"],
                "successCheck": 'curl "http://localhost:8000/health"',
            },
            {
                "step": 4,
                "agentId": "web_runtime_specialist",
                "title": "Levantar frontend local",
                "commands": [web_command],
                "expectedArtifacts": ["http://localhost:5173"],
                "successCheck": 'curl "http://localhost:5173"',
            },
            {
                "step": 5,
                "agentId": "smoke_test_specialist",
                "title": "Validar salud y persistencia",
                "commands": [
                    'curl "http://localhost:8000/health"',
                    'curl "http://localhost:8000/telemetry/sessions"',
                ],
                "expectedArtifacts": [
                    "respuesta de healthcheck",
                    "respuesta de sesiones persistidas",
                ],
                "successCheck": 'curl "http://localhost:8000/health" && curl "http://localhost:8000/telemetry/sessions"',
            },
        ],
    }
