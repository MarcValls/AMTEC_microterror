from __future__ import annotations

LOCAL_DEPLOY_PLAYBOOK = {
    "playbookId": "local_deploy_hallway_mvp",
    "owner": "local_deploy_manager",
    "goal": "levantar el MVP del pasillo en local con SQLite, API FastAPI y frontend React conectados",
    "sequence": [
        {
            "step": 1,
            "agentId": "local_env_specialist",
            "action": "generar y validar .env.local desde la plantilla local",
            "expectedArtifact": ".env.local listo y coherente",
        },
        {
            "step": 2,
            "agentId": "sqlite_local_db_specialist",
            "action": "confirmar DATABASE_URL SQLite y preparar la ruta local de la BD",
            "expectedArtifact": "archivo SQLite local disponible o reusable",
        },
        {
            "step": 3,
            "agentId": "api_boot_specialist",
            "action": "levantar la API local y verificar /health",
            "expectedArtifact": "API escuchando en http://localhost:8000",
        },
        {
            "step": 4,
            "agentId": "web_runtime_specialist",
            "action": "levantar Vite y validar integración con la API",
            "expectedArtifact": "web escuchando en http://localhost:5173",
        },
        {
            "step": 5,
            "agentId": "smoke_test_specialist",
            "action": "ejecutar comprobación mínima del flujo sesión + telemetría",
            "expectedArtifact": "reporte go/no-go de desarrollo local",
        },
    ],
    "hardGates": [
        "no continuar si .env.local no existe",
        "no continuar si DATABASE_URL no apunta a SQLite local en desarrollo",
        "no continuar si /health falla",
        "no cerrar el playbook sin una verificación de persistencia",
    ],
    "verification": [
        "curl http://localhost:8000/health",
        "curl http://localhost:8000/telemetry/sessions",
        "sqlite3 <ruta_db> .tables",
    ],
}
