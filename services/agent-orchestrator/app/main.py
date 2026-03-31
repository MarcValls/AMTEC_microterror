from fastapi import FastAPI, HTTPException

from app.agent_catalog import AGENT_CATALOG, AGENT_INDEX
from app.playbooks import LOCAL_DEPLOY_PLAYBOOK

app = FastAPI(
    title="AMTEC microterror agent orchestrator",
    version="0.2.0",
    description="Servicio base para coordinar agentes de producto, runtime y despliegue local.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "agent-orchestrator"}


@app.get("/agents")
def list_agents() -> dict[str, list[dict]]:
    return {"agents": AGENT_CATALOG}


@app.get("/agents/{agent_id}")
def get_agent(agent_id: str) -> dict:
    agent = AGENT_INDEX.get(agent_id)
    if agent is None:
        raise HTTPException(status_code=404, detail="Agent not found")
    return agent


@app.get("/playbooks/local-deploy")
def get_local_deploy_playbook() -> dict:
    return LOCAL_DEPLOY_PLAYBOOK
