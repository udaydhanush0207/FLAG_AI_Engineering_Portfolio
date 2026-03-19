"""
backend/routes/chat.py
BRICK chat endpoint — routes queries to appropriate LLM based on intent.
"""

import time
import structlog
from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from supabase import create_client

from backend.config import config
from backend.services import llm_router

log = structlog.get_logger()
router = APIRouter()


class ChatRequest(BaseModel):
    question: str
    history: list = []
    channel: str = "web"
    user_id: str = "anonymous"


class ChatResponse(BaseModel):
    answer: str
    source: str
    query_type: str
    model_used: str
    response_time_ms: int
    channel: str


@router.post("/ask", response_model=ChatResponse)
async def ask(req: ChatRequest) -> ChatResponse:
    """BRICK main chat endpoint.

    Routes the question to the correct LLM based on intent classification:
    - FLAG knowledge questions → Claude + pgvector RAG
    - Industry trends → Perplexity sonar-pro (or Claude fallback)
    - Long doc analysis → Gemini 2.0 Flash
    - General → Claude direct
    """
    start = time.monotonic()
    try:
        log.info(
            "chat_request",
            channel=req.channel,
            user_id=req.user_id,
            question_len=len(req.question),
        )

        result = await llm_router.route_query(req.question, req.history, req.channel)
        elapsed_ms = int((time.monotonic() - start) * 1000)

        # Persist conversation to Supabase (non-blocking best-effort)
        try:
            _persist_conversation(req, result, elapsed_ms)
        except Exception as persist_err:
            log.warning("conversation_persist_failed", error=str(persist_err))

        return ChatResponse(
            answer=result["answer"],
            source=result["source"],
            query_type=result["query_type"],
            model_used=result["model_used"],
            response_time_ms=elapsed_ms,
            channel=req.channel,
        )

    except Exception as e:
        log.error("chat_error", error=str(e), channel=req.channel)
        raise HTTPException(status_code=500, detail="Internal error — check server logs")


def _persist_conversation(req: ChatRequest, result: dict, elapsed_ms: int) -> None:
    """Save conversation turn to Supabase (synchronous, best-effort)."""
    if not config.SUPABASE_URL or not config.SUPABASE_SERVICE_KEY:
        return

    supabase = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)

    # Append new turn to messages
    new_messages = req.history + [
        {"role": "user", "content": req.question},
        {"role": "assistant", "content": result["answer"]},
    ]

    supabase.table("conversations").insert({
        "channel": req.channel,
        "user_id": req.user_id,
        "messages": new_messages,
        "query_type": result["query_type"],
        "model_used": result["model_used"],
        "response_time_ms": elapsed_ms,
    }).execute()

    # Update agent_status
    # Mark BRICK as online with latest activity timestamp
    supabase.table("agent_status").update({
        "status": "online",
        "last_activity": "now()",
        "updated_at": "now()",
    }).eq("id", "brick").execute()
