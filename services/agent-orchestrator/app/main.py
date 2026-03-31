from fastapi import FastAPI

app = FastAPI(
    title="AMTEC microterror agent orchestrator",
    version="0.1.0",
    description="Servicio base para coordinar agentes de producto, frontend, backend, audio y QA.",
)

AGENTS = [
    {
        "agentId": "product_owner",
        "role": "prioriza backlog del MVP del pasillo",
    },
    {
        "agentId": "architect",
        "role": "mantiene contratos, ADRs y límites entre paquetes",
    },
    {
        "agentId": "frontend_react",
        "role": "desarrolla editor, runtime y experiencia jugable",
    },
    {
        "agentId": "backend_data",
        "role": "API, persistencia y telemetría",
    },
    {
        "agentId": "audio_synth",
        "role": "presets y reglas de audio procedural",
    },
    {
        "agentId": "qa",
        "role": "pruebas de flujo crear, jugar y publicar",
    },
]


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agent-orchestrator"}


@app.get("/agents")
def list_agents() -> dict[str, list[dict[str, str]]]:
    return {"agents": AGENTS}
