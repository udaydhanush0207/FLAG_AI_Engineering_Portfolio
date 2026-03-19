"""
backend/services/vector_store.py
Supabase pgvector operations: embed, store, and retrieve knowledge chunks.
"""

import structlog
from openai import AsyncOpenAI
from supabase import create_client, Client

from backend.config import config

log = structlog.get_logger()

_openai: AsyncOpenAI | None = None
_supabase: Client | None = None

EMBEDDING_MODEL = "text-embedding-3-small"
EMBEDDING_DIMS = 1536


def _get_openai() -> AsyncOpenAI:
    global _openai
    if _openai is None:
        _openai = AsyncOpenAI(api_key=config.OPENAI_API_KEY)
    return _openai


def _get_supabase() -> Client:
    global _supabase
    if _supabase is None:
        _supabase = create_client(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY)
    return _supabase


async def get_embedding(text: str) -> list[float]:
    """Generate embedding using OpenAI text-embedding-3-small (1536 dims)."""
    client = _get_openai()
    # Truncate to avoid token limit (8191 tokens max)
    text = text[:8000]
    response = await client.embeddings.create(
        model=EMBEDDING_MODEL,
        input=text,
    )
    return response.data[0].embedding


async def search_knowledge(
    query: str,
    n: int = 15,
    threshold: float = 0.7,
) -> list[dict]:
    """Search FLAG knowledge base using vector similarity.

    Returns top-n chunks with similarity >= threshold, sorted by relevance.
    """
    embedding = await get_embedding(query)
    supabase = _get_supabase()

    result = supabase.rpc(
        "match_chunks",
        {
            "query_embedding": embedding,
            "match_threshold": threshold,
            "match_count": n,
        },
    ).execute()

    chunks = result.data or []
    log.info("knowledge_search", query_len=len(query), chunks_found=len(chunks))
    return chunks


async def ingest_chunk(
    content: str,
    embedding: list[float],
    source: str,
    topic: str,
    metadata: dict,
    chunk_index: int = 0,
) -> str:
    """Insert a knowledge chunk into Supabase knowledge_chunks table.

    Returns the UUID of the inserted row.
    """
    supabase = _get_supabase()
    result = supabase.table("knowledge_chunks").insert({
        "content": content,
        "embedding": embedding,
        "source": source,
        "topic": topic,
        "metadata": metadata,
        "chunk_index": chunk_index,
    }).execute()

    row_id = result.data[0]["id"]
    log.info("chunk_ingested", id=row_id, source=source, topic=topic)
    return row_id


async def verify_connection() -> bool:
    """Check that Supabase connection is working."""
    try:
        supabase = _get_supabase()
        result = supabase.table("agent_status").select("id").limit(1).execute()
        log.info("supabase_connection_ok", rows=len(result.data))
        return True
    except Exception as e:
        log.error("supabase_connection_failed", error=str(e))
        return False
