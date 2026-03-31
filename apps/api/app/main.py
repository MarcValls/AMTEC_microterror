from fastapi import FastAPI

app = FastAPI(
    title="AMTEC microterror API",
    version="0.1.0",
    description="API base para proyectos, plantillas y telemetría del MVP del pasillo.",
)


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "api"}


@app.get("/templates/corredor-v1")
def get_corridor_template() -> dict:
    return {
        "sceneId": "corredor_v1",
        "templateType": "hallway",
        "title": "Pasillo interminable",
        "threatType": "presencia_detras",
        "durationTargetSeconds": 240,
        "endings": ["escape", "loop", "caught"],
    }


@app.get("/telemetry/events")
def telemetry_events() -> dict[str, list[str]]:
    return {
        "events": [
            "session_started",
            "tutorial_completed",
            "look_back_used",
            "interaction_triggered",
            "event_seen",
            "threat_peak_reached",
            "ending_reached",
            "session_completed",
            "session_abandoned",
            "shared_link_opened",
        ]
    }
