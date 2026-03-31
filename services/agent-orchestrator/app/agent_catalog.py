from __future__ import annotations

AGENT_CATALOG = [
    {
        "agentId": "local_deploy_manager",
        "title": "Local Deploy Manager",
        "role": "coordina el despliegue local completo del monorepo y decide el orden de ejecución",
        "scope": [
            "validar precondiciones locales",
            "orquestar setup de entorno",
            "coordinar arranque API + web",
            "activar verificación mínima de salud",
            "dejar estado final verificable",
        ],
        "inputs": [
            "ruta absoluta del repositorio",
            "estado de .env.local",
            "estado de la BD SQLite local",
            "disponibilidad de Python 3.11+ y pnpm",
        ],
        "outputs": [
            "plan de despliegue local",
            "secuencia ordenada de comandos",
            "reporte de validación final",
        ],
        "delegatesTo": [
            "local_env_specialist",
            "sqlite_local_db_specialist",
            "api_boot_specialist",
            "web_runtime_specialist",
            "smoke_test_specialist",
        ],
        "successCriteria": [
            "API disponible en /health",
            "web disponible en localhost:5173",
            "SQLite local creada o reutilizable",
            "flujo del pasillo arrancable sin errores bloqueantes",
        ],
    },
    {
        "agentId": "local_env_specialist",
        "title": "Local Environment Specialist",
        "role": "garantiza .env.local, rutas absolutas y prerequisitos del entorno local",
        "scope": [
            "generar .env.local desde plantilla",
            "comprobar variables críticas",
            "detectar huecos de entorno antes del arranque",
        ],
        "inputs": [".env.local.example", "scripts/setup_local_env.sh"],
        "outputs": [".env.local validado", "lista de prerequisitos faltantes"],
    },
    {
        "agentId": "sqlite_local_db_specialist",
        "title": "SQLite Local DB Specialist",
        "role": "asegura la disponibilidad y coherencia de la base SQLite para desarrollo local",
        "scope": [
            "verificar DATABASE_URL",
            "crear carpeta data/local",
            "confirmar tablas mínimas del MVP",
        ],
        "inputs": ["DATABASE_URL", "apps/api/app/db.py", "apps/api/app/models.py"],
        "outputs": ["ruta SQLite validada", "estado de tablas locales"],
    },
    {
        "agentId": "api_boot_specialist",
        "title": "API Boot Specialist",
        "role": "levanta FastAPI en local y valida que la persistencia y CORS estén operativos",
        "scope": [
            "crear venv local de API",
            "instalar dependencias",
            "arrancar Uvicorn con reload",
            "verificar /health y endpoints base",
        ],
        "inputs": ["scripts/start_api_local.sh", "apps/api"],
        "outputs": ["API local arrancada", "reporte de healthcheck"],
    },
    {
        "agentId": "web_runtime_specialist",
        "title": "Web Runtime Specialist",
        "role": "levanta la app React y valida su conexión con la API local",
        "scope": [
            "instalar dependencias del workspace",
            "arrancar Vite",
            "verificar VITE_PUBLIC_API_BASE_URL",
            "comprobar que el runtime del pasillo puede iniciar sesión",
        ],
        "inputs": ["scripts/start_web_local.sh", "apps/web"],
        "outputs": ["web local arrancada", "verificación básica de integración"],
    },
    {
        "agentId": "smoke_test_specialist",
        "title": "Smoke Test Specialist",
        "role": "ejecuta la comprobación mínima extremo a extremo del flujo local",
        "scope": [
            "consultar /health",
            "consultar /telemetry/sessions",
            "verificar que la sesión del pasillo se puede persistir",
            "reportar bloqueos críticos",
        ],
        "inputs": ["API local", "web local", "SQLite local"],
        "outputs": ["checklist de humo", "resultado final go/no-go"],
    },
]

AGENT_INDEX = {agent["agentId"]: agent for agent in AGENT_CATALOG}
