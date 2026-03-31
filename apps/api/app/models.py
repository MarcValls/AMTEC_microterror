from __future__ import annotations

from datetime import datetime
from typing import Any

from sqlalchemy import JSON, DateTime, Float, ForeignKey, Integer, String, func
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.db import Base


class GameSession(Base):
    __tablename__ = "game_sessions"

    id: Mapped[str] = mapped_column(String(64), primary_key=True)
    scene_id: Mapped[str] = mapped_column(String(64), index=True)
    template_type: Mapped[str] = mapped_column(String(64), default="hallway")
    status: Mapped[str] = mapped_column(String(32), default="active", index=True)
    started_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    completed_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)
    ending: Mapped[str | None] = mapped_column(String(32), nullable=True)
    progress: Mapped[int] = mapped_column(Integer, default=0)
    events_seen: Mapped[int] = mapped_column(Integer, default=0)
    look_backs: Mapped[int] = mapped_column(Integer, default=0)
    interactions: Mapped[int] = mapped_column(Integer, default=0)
    pressure_peak: Mapped[float] = mapped_column(Float, default=0.0)
    session_context: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    telemetry_events: Mapped[list["TelemetryEvent"]] = relationship(
        back_populates="session",
        cascade="all, delete-orphan",
    )


class TelemetryEvent(Base):
    __tablename__ = "telemetry_events"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    session_id: Mapped[str] = mapped_column(ForeignKey("game_sessions.id", ondelete="CASCADE"), index=True)
    scene_id: Mapped[str] = mapped_column(String(64), index=True)
    name: Mapped[str] = mapped_column(String(64), index=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    event_context: Mapped[dict[str, Any]] = mapped_column(JSON, default=dict)

    session: Mapped[GameSession] = relationship(back_populates="telemetry_events")
