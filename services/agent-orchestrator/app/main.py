from fastapi import FastAPI, HTTPException, Query

from app.agent_catalog import AGENT_CATALOG, AGENT_INDEX
from app.calls import resolve_tu_flipao_inicia_la_app
from app.checklists import resolve_local_deploy_checklist
from app.playbooks import LOCAL_DEPLOY_PLAYBOOK

app = FastAPI(
    title="AMTEC microterror agent orchestrator",
    version="0.4.0",
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


@app.get("/checklists/local-deploy")
def get_local_deploy_checklist(repo_dir: str | None = Query(default=None)) -> dict:
    return resolve_local_deploy_checklist(repo_dir=repo_dir)


@app.get("/calls/tu-flipao-inicia-la-app")
def tu_flipao_inicia_la_app(repo_dir: str | None = Query(default=None)) -> dict:
    return resolve_tu_flipao_inicia_la_app(repo_dir=repo_dir)
