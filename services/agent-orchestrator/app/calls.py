from __future__ import annotations

from app.checklists import resolve_local_deploy_checklist

DEFAULT_REPO_PLACEHOLDER = "/ruta/completa/a/AMTEC_microterror"


def resolve_tu_flipao_inicia_la_app(repo_dir: str | None = None) -> dict:
    resolved_repo_dir = repo_dir or DEFAULT_REPO_PLACEHOLDER
    checklist = resolve_local_deploy_checklist(repo_dir=resolved_repo_dir)

    return {
        "callId": "tu_flipao_inicia_la_app",
        "spokenTrigger": "Tu flipao inicia la app",
        "agentId": "tu_flipao_inicia_la_app",
        "delegatesTo": "local_deploy_manager",
        "repoDir": resolved_repo_dir,
        "executionCommand": f'bash "{resolved_repo_dir}/scripts/tu_flipao_inicia_la_app.sh"',
        "shutdownCommand": checklist["shutdownCommand"],
        "logs": {
            "apiLog": f"{resolved_repo_dir}/.local-runtime/api.log",
            "webLog": f"{resolved_repo_dir}/.local-runtime/web.log",
            "report": f"{resolved_repo_dir}/.local-runtime/local_deploy_report.txt",
        },
        "checklist": checklist,
    }
