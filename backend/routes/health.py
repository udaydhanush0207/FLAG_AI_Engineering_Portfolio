"""
backend/routes/health.py
Health check endpoint — verifies service status and Supabase connection.
"""

from datetime import datetime

import structlog
from fastapi import APIRouter
from pydantic import BaseModel

from backend.services.vector_store import verify_connection

log = structlog.get_logger()
router = APIRouter()


class HealthResponse(BaseModel):
    status: str
    version: str
    timestamp: str
    supabase: str


@router.get("/api/health", response_model=HealthResponse)
async def health_check() -> HealthResponse:
    """Return service health status including Supabase connectivity."""
    log.info("health_check")

    supabase_ok = await verify_connection()

    return HealthResponse(
        status="ok",
        version="2.0.0",
        timestamp=datetime.utcnow().isoformat(),
        supabase="connected" if supabase_ok else "disconnected",
    )
