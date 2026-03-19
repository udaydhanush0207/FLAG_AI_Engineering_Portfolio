"""
backend/routes/agents.py
Agent status + dashboard stats endpoints.
"""

import structlog
from fastapi import APIRouter, HTTPException
from supabase import create_client

from backend.config import config

log = structlog.get_logger()
router = APIRouter()


def _sb():
    return create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)


@router.get("/agents")
async def list_agents() -> dict:
    """Return live status for all AI agents."""
    try:
        result = _sb().table("agent_status").select("*").order("id").execute()
        return {"agents": result.data}
    except Exception as e:
        log.error("agents_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")


@router.get("/stats")
async def get_stats() -> dict:
    """Return dashboard statistics: conversation count, chunk count, lead count."""
    try:
        sb = _sb()
        convs = sb.table("conversations").select("id", count="exact").execute()
        chunks = sb.table("knowledge_chunks").select("id", count="exact").execute()
        leads = sb.table("leads").select("id", count="exact").execute()
        agents = sb.table("agent_status").select("*").execute()

        online_count = sum(1 for a in agents.data if a.get("status") == "online")

        return {
            "total_conversations": convs.count or 0,
            "knowledge_chunks": chunks.count or 0,
            "total_leads": leads.count or 0,
            "agents_online": online_count,
            "agents_total": len(agents.data),
        }
    except Exception as e:
        log.error("stats_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")


@router.get("/conversations")
async def list_conversations(limit: int = 20) -> dict:
    """Return recent conversations across all channels."""
    try:
        result = (
            _sb()
            .table("conversations")
            .select("id,channel,user_id,query_type,model_used,response_time_ms,created_at,messages")
            .order("created_at", desc=True)
            .limit(limit)
            .execute()
        )
        # Summarize: extract last user question from messages array
        rows = []
        for row in result.data:
            msgs = row.get("messages", [])
            last_q = next((m["content"] for m in reversed(msgs) if m.get("role") == "user"), "")
            last_a = next((m["content"] for m in reversed(msgs) if m.get("role") == "assistant"), "")
            rows.append({
                "id": row["id"],
                "channel": row["channel"],
                "query_type": row.get("query_type", "unknown"),
                "model_used": row.get("model_used", ""),
                "response_time_ms": row.get("response_time_ms", 0),
                "created_at": row["created_at"],
                "question": last_q[:120],
                "answer_preview": last_a[:200],
            })
        return {"conversations": rows, "total": len(rows)}
    except Exception as e:
        log.error("conversations_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")
