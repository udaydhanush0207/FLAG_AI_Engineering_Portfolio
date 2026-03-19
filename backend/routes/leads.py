"""
backend/routes/leads.py
Lead generation endpoints — list, generate, update, export.
"""

import csv
import io
import structlog
from fastapi import APIRouter, HTTPException, Header, BackgroundTasks
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from supabase import create_client

from backend.config import config
from backend.services.lead_gen import generate_leads_batch

log = structlog.get_logger()
router = APIRouter()


def _sb():
    return create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)


class LeadGenerateRequest(BaseModel):
    state: str = "Texas"
    category: str = "CIP"
    limit: int = 10


class LeadUpdateRequest(BaseModel):
    status: str  # new, contacted, meeting_set, converted


# ── List leads ───────────────────────────────────────────────────────────────
@router.get("/leads")
async def list_leads(limit: int = 100) -> dict:
    """List all generated leads sorted by score descending."""
    try:
        result = (
            _sb()
            .table("leads")
            .select("*")
            .order("score", desc=True)
            .limit(limit)
            .execute()
        )
        return {"leads": result.data, "total": len(result.data)}
    except Exception as e:
        log.error("leads_list_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")


# ── Generate leads ────────────────────────────────────────────────────────────
async def _run_generation(state: str, category: str, limit: int) -> None:
    """Background task: research leads and store in Supabase."""
    try:
        log.info("lead_gen_starting", state=state, category=category, limit=limit)
        leads = await generate_leads_batch(state=state, category=category, limit=limit)
        sb = _sb()
        for lead in leads:
            sb.table("leads").insert({
                "name":           lead["name"],
                "title":          lead.get("title", ""),
                "email":          lead.get("email", ""),
                "phone":          lead.get("phone", ""),
                "county":         lead["county"],
                "state":          lead.get("state", "TX"),
                "category":       lead.get("category", category),
                "score":          lead.get("score", 1),
                "research_notes": lead.get("research_notes", ""),
                "bond_programs":  lead.get("bond_programs", {}),
                "status":         "new",
            }).execute()
        log.info("lead_gen_complete", stored=len(leads))
    except Exception as e:
        log.error("lead_gen_background_error", error=str(e))


@router.post("/leads/generate")
async def generate_leads(
    req: LeadGenerateRequest,
    background_tasks: BackgroundTasks,
    x_api_key: str = Header(default=""),
) -> dict:
    """Kick off background lead generation for Texas counties.

    Each lead takes ~5-10s to research. Runs in background.
    Poll GET /api/leads to see results as they arrive.
    """
    if x_api_key != config.INGEST_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    if req.limit > 25:
        raise HTTPException(status_code=400, detail="Max 25 leads per batch (API rate limits)")

    background_tasks.add_task(_run_generation, req.state, req.category, req.limit)
    log.info("lead_gen_queued", state=req.state, category=req.category, limit=req.limit)
    return {
        "status": "generating",
        "message": f"Researching {req.limit} {req.state} counties for {req.category} leads. Poll GET /api/leads for results.",
        "estimated_seconds": req.limit * 8,
    }


# ── Update lead status ────────────────────────────────────────────────────────
@router.patch("/leads/{lead_id}")
async def update_lead(
    lead_id: str,
    req: LeadUpdateRequest,
    x_api_key: str = Header(default=""),
) -> dict:
    """Update lead status (new → contacted → meeting_set → converted)."""
    if x_api_key != config.INGEST_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    valid = {"new", "contacted", "meeting_set", "converted"}
    if req.status not in valid:
        raise HTTPException(status_code=400, detail=f"Status must be one of: {valid}")

    try:
        result = (
            _sb()
            .table("leads")
            .update({"status": req.status, "updated_at": "now()"})
            .eq("id", lead_id)
            .execute()
        )
        if not result.data:
            raise HTTPException(status_code=404, detail="Lead not found")
        return {"status": "updated", "lead": result.data[0]}
    except HTTPException:
        raise
    except Exception as e:
        log.error("lead_update_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")


# ── Export CSV ────────────────────────────────────────────────────────────────
@router.get("/leads/export")
async def export_leads() -> StreamingResponse:
    """Export all leads as a CSV file."""
    try:
        result = _sb().table("leads").select("*").order("score", desc=True).execute()
        leads = result.data

        output = io.StringIO()
        writer = csv.DictWriter(output, fieldnames=[
            "name", "title", "email", "phone", "county", "state",
            "category", "score", "status", "research_notes", "created_at",
        ])
        writer.writeheader()
        for lead in leads:
            writer.writerow({k: lead.get(k, "") for k in writer.fieldnames})

        output.seek(0)
        return StreamingResponse(
            iter([output.getvalue()]),
            media_type="text/csv",
            headers={"Content-Disposition": "attachment; filename=flag-leads.csv"},
        )
    except Exception as e:
        log.error("leads_export_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")
