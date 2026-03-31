from __future__ import annotations

from datetime import datetime
from typing import Any, Literal

from pydantic import BaseModel, Field

TelemetryEventName = Literal[
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

SessionStatus = Literal["active", "completed", "abandoned"]


class SessionStartRequest(BaseModel):
    sessionId: str
    sceneId: str = "corredor_v1"
    templateType: str = "hallway"
    metadata: dict[str, Any] = Field(default_factory=dict)


class TelemetryEventCreate(BaseModel):
    sessionId: str
    sceneId: str = "corredor_v1"
    name: TelemetryEventName
    payload: dict[str, Any] = Field(default_factory=dict)


class SessionCompleteRequest(BaseModel):
    status: SessionStatus = "completed"
    ending: str | None = None
    progress: int = 0
    eventsSeen: int = 0
    lookBacks: int = 0
    interactions: int = 0
    pressurePeak: float = 0.0


class SessionRead(BaseModel):
    sessionId: str
    sceneId: str
    templateType: str
    status: str
    startedAt: datetime
    completedAt: datetime | None
    ending: str | None
    progress: int
    eventsSeen: int
    lookBacks: int
    interactions: int
    pressurePeak: float
    metadata: dict[str, Any] = Field(default_factory=dict)


class TelemetryEventRead(BaseModel):
    eventId: int
    sessionId: str
    sceneId: str
    name: str
    createdAt: datetime
    payload: dict[str, Any] = Field(default_factory=dict)
