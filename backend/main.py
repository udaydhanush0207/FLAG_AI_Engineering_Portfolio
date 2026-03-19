"""
backend/main.py
FastAPI application entry point for FLAG AI Intelligence Platform.
"""

import structlog
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from backend.config import config
from backend.routes.health import router as health_router
from backend.routes.chat import router as chat_router
from backend.routes.ingest import router as ingest_router
from backend.routes.leads import router as leads_router
from backend.routes.webhooks import router as webhooks_router
from backend.routes.agents import router as agents_router

log = structlog.get_logger()

app = FastAPI(
    title="FLAG AI Intelligence Platform",
    description="Unified AI agent system for Front Line Advisory Group",
    version="2.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(health_router, tags=["health"])
app.include_router(chat_router, prefix="/api", tags=["chat"])
app.include_router(ingest_router, prefix="/api", tags=["ingest"])
app.include_router(leads_router, prefix="/api", tags=["leads"])
app.include_router(webhooks_router, prefix="/api/webhooks", tags=["webhooks"])
app.include_router(agents_router, prefix="/api", tags=["agents"])


@app.on_event("startup")
async def startup():
    missing = config.validate()
    if missing:
        log.warning("missing_env_keys", keys=missing)
    else:
        log.info("flag_ai_platform_started", version="2.0.0")
