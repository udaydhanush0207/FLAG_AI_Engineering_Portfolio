"""
backend/routes/ingest.py
Knowledge base ingestion endpoint — accepts text content, chunks, embeds, stores.
"""

import structlog
from fastapi import APIRouter, HTTPException, Header
from pydantic import BaseModel

from backend.config import config
from backend.services.chunker import smart_chunk
from backend.services.vector_store import get_embedding, ingest_chunk

log = structlog.get_logger()
router = APIRouter()


class IngestRequest(BaseModel):
    source: str
    content: str
    topic: str = "general"
    metadata: dict = {}


class IngestResponse(BaseModel):
    status: str
    chunks_created: int
    source: str


@router.post("/ingest", response_model=IngestResponse)
async def ingest(
    req: IngestRequest,
    x_api_key: str = Header(default=""),
) -> IngestResponse:
    """Ingest text content into the FLAG knowledge base.

    Chunks the content, generates embeddings, stores in Supabase pgvector.
    Requires X-API-Key header matching INGEST_API_KEY env var.
    """
    if x_api_key != config.INGEST_API_KEY:
        raise HTTPException(status_code=401, detail="Invalid API key")

    if len(req.content.strip()) < 50:
        raise HTTPException(status_code=400, detail="Content too short (min 50 chars)")

    try:
        log.info("ingest_request", source=req.source, topic=req.topic, content_len=len(req.content))

        chunks = smart_chunk(req.content, source=req.source, topic=req.topic)
        if not chunks:
            raise HTTPException(status_code=400, detail="No chunks generated from content")

        for chunk in chunks:
            chunk["metadata"].update(req.metadata)
            embedding = await get_embedding(chunk["content"])
            await ingest_chunk(
                content=chunk["content"],
                embedding=embedding,
                source=chunk["source"],
                topic=chunk["topic"],
                metadata=chunk["metadata"],
                chunk_index=chunk["chunk_index"],
            )

        log.info("ingest_complete", source=req.source, chunks=len(chunks))
        return IngestResponse(status="ok", chunks_created=len(chunks), source=req.source)

    except HTTPException:
        raise
    except Exception as e:
        log.error("ingest_error", error=str(e), source=req.source)
        raise HTTPException(status_code=500, detail="Internal error")
