from __future__ import annotations

import os
from datetime import datetime, timezone
from typing import Any

from fastapi import Depends, FastAPI, HTTPException, Query
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import desc, select
from sqlalchemy.orm import Session

from app.db import get_db, initialize_database
from app.models import GameSession, TelemetryEvent
from app.schemas import SessionCompleteRequest, SessionRead, SessionStartRequest, TelemetryEventCreate, TelemetryEventRead

app = FastAPI(
    title="AMTEC microterror API",
    version="0.2.0",
    description="API para plantillas, telemetría persistente y sesiones del MVP del pasillo.",
)

allowed_origins = [
    origin.strip()
    for origin in os.getenv(
        "CORS_ALLOW_ORIGINS",
        "http://localhost:5173,http://127.0.0.1:5173",
    ).split(",")
    if origin.strip()
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup() -> None:
    initialize_database()


def serialize_session(session: GameSession) -> SessionRead:
    return SessionRead(
        sessionId=session.id,
        sceneId=session.scene_id,
        templateType=session.template_type,
        status=session.status,
        startedAt=session.started_at,
        completedAt=session.completed_at,
        ending=session.ending,
        progress=session.progress,
        eventsSeen=session.events_seen,
        lookBacks=session.look_backs,
        interactions=session.interactions,
        pressurePeak=session.pressure_peak,
        metadata=session.session_context or {},
    )


def serialize_event(event: TelemetryEvent) -> TelemetryEventRead:
    return TelemetryEventRead(
        eventId=event.id,
        sessionId=event.session_id,
        sceneId=event.scene_id,
        name=event.name,
        createdAt=event.created_at,
        payload=event.event_context or {},
    )


def apply_session_metrics(session: GameSession, payload: dict[str, Any]) -> None:
    progress = payload.get("progress")
    if isinstance(progress, (int, float)):
        session.progress = max(session.progress, int(progress))

    pressure_peak = payload.get("pressurePeak", payload.get("pressure"))
    if isinstance(pressure_peak, (int, float)):
        session.pressure_peak = max(session.pressure_peak, float(pressure_peak))


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


@app.post("/sessions/start", response_model=SessionRead)
def start_session(payload: SessionStartRequest, db: Session = Depends(get_db)) -> SessionRead:
    session = db.get(GameSession, payload.sessionId)

    if session is None:
        session = GameSession(
            id=payload.sessionId,
            scene_id=payload.sceneId,
            template_type=payload.templateType,
            status="active",
            session_context=payload.metadata,
        )
        db.add(session)
    else:
        session.scene_id = payload.sceneId
        session.template_type = payload.templateType
        session.status = "active"
        session.completed_at = None
        session.ending = None
        session.session_context = payload.metadata

    db.commit()
    db.refresh(session)
    return serialize_session(session)


@app.post("/telemetry/events", response_model=TelemetryEventRead)
def create_telemetry_event(payload: TelemetryEventCreate, db: Session = Depends(get_db)) -> TelemetryEventRead:
    session = db.get(GameSession, payload.sessionId)

    if session is None:
        session = GameSession(
            id=payload.sessionId,
            scene_id=payload.sceneId,
            template_type="hallway",
            status="active",
            session_context={"source": "telemetry_fallback"},
        )
        db.add(session)
        db.flush()

    event = TelemetryEvent(
        session_id=payload.sessionId,
        scene_id=payload.sceneId,
        name=payload.name,
        event_context=payload.payload,
    )
    db.add(event)

    if payload.name == "event_seen":
        session.events_seen += 1
    elif payload.name == "look_back_used":
        session.look_backs += 1
    elif payload.name == "interaction_triggered":
        session.interactions += 1
    elif payload.name == "ending_reached":
        ending = payload.payload.get("ending")
        session.ending = str(ending) if ending is not None else session.ending

    apply_session_metrics(session, payload.payload)
    db.commit()
    db.refresh(event)
    return serialize_event(event)


@app.post("/sessions/{session_id}/complete", response_model=SessionRead)
def complete_session(
    session_id: str,
    payload: SessionCompleteRequest,
    db: Session = Depends(get_db),
) -> SessionRead:
    session = db.get(GameSession, session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    session.status = payload.status
    session.completed_at = datetime.now(timezone.utc)
    session.ending = payload.ending
    session.progress = max(session.progress, payload.progress)
    session.events_seen = max(session.events_seen, payload.eventsSeen)
    session.look_backs = max(session.look_backs, payload.lookBacks)
    session.interactions = max(session.interactions, payload.interactions)
    session.pressure_peak = max(session.pressure_peak, payload.pressurePeak)

    db.commit()
    db.refresh(session)
    return serialize_session(session)


@app.get("/sessions/{session_id}", response_model=SessionRead)
def get_session(session_id: str, db: Session = Depends(get_db)) -> SessionRead:
    session = db.get(GameSession, session_id)

    if session is None:
        raise HTTPException(status_code=404, detail="Session not found")

    return serialize_session(session)


@app.get("/telemetry/sessions", response_model=list[SessionRead])
def list_recent_sessions(
    limit: int = Query(default=20, ge=1, le=100),
    db: Session = Depends(get_db),
) -> list[SessionRead]:
    sessions = db.scalars(
        select(GameSession).order_by(desc(GameSession.started_at)).limit(limit)
    ).all()
    return [serialize_session(session) for session in sessions]
