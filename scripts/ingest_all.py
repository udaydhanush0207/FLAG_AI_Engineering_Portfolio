"""
scripts/ingest_all.py
Process scraped pages + any local files → chunk → embed → store in Supabase.

Usage:
    backend/venv/Scripts/python scripts/ingest_all.py

Expects: backend/data/scraped_pages.json (run scrape_flag.py first)
Optional: backend/data/*.txt files for Bond Book, acronyms, team profiles
"""

import asyncio
import json
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

import structlog
from backend.services.chunker import smart_chunk
from backend.services.vector_store import get_embedding, ingest_chunk

log = structlog.get_logger()

# Map filenames to topics
TOPIC_MAP = {
    "scraped_pages": "website",
    "bond_book": "bond_book",
    "acronyms": "acronyms",
    "team": "team",
    "programs": "programs",
    "services": "services",
}


async def ingest_chunks_batch(chunks: list[dict]) -> int:
    """Embed and store a list of chunks. Returns count ingested."""
    ingested = 0
    for chunk in chunks:
        try:
            embedding = await get_embedding(chunk["content"])
            await ingest_chunk(
                content=chunk["content"],
                embedding=embedding,
                source=chunk["source"],
                topic=chunk["topic"],
                metadata=chunk["metadata"],
                chunk_index=chunk["chunk_index"],
            )
            ingested += 1
            if ingested % 10 == 0:
                log.info("ingest_progress", ingested=ingested, total=len(chunks))
        except Exception as e:
            log.warning("chunk_ingest_failed", error=str(e), source=chunk.get("source"))
    return ingested


async def ingest_scraped_pages() -> int:
    """Load scraped pages JSON and ingest all pages."""
    scraped_file = Path("backend/data/scraped_pages.json")
    if not scraped_file.exists():
        log.warning("no_scraped_pages", hint="Run: backend/venv/Scripts/python scripts/scrape_flag.py")
        return 0

    with open(scraped_file, encoding="utf-8") as f:
        pages = json.load(f)

    # Deduplicate: skip paginated variants (?bdpp_page=, ?page=)
    seen_base_urls: set[str] = set()
    deduped_pages = []
    for page in pages:
        base_url = page["url"].split("?")[0].rstrip("/")
        if base_url not in seen_base_urls:
            seen_base_urls.add(base_url)
            deduped_pages.append(page)
    log.info("deduped_pages", before=len(pages), after=len(deduped_pages))
    pages = deduped_pages

    all_chunks = []
    for page in pages:
        if not page.get("text") or len(page["text"]) < 200:
            continue
        # Determine topic from URL
        url = page["url"].lower()
        topic = "website"
        if "service" in url:
            topic = "services"
        elif "team" in url or "about" in url or "staff" in url:
            topic = "team"
        elif "program" in url or "project" in url:
            topic = "programs"
        elif "contact" in url:
            topic = "contact"

        chunks = smart_chunk(
            text=page["text"],
            source=page["url"],
            topic=topic,
        )
        all_chunks.extend(chunks)

    log.info("scraped_pages_chunked", pages=len(pages), chunks=len(all_chunks))
    ingested = await ingest_chunks_batch(all_chunks)
    return ingested


async def ingest_text_files() -> int:
    """Ingest any .txt files in backend/data/."""
    data_dir = Path("backend/data")
    txt_files = list(data_dir.glob("*.txt"))
    if not txt_files:
        return 0

    total = 0
    for txt_file in txt_files:
        stem = txt_file.stem.lower()
        topic = next((v for k, v in TOPIC_MAP.items() if k in stem), "general")

        text = txt_file.read_text(encoding="utf-8", errors="replace")
        chunks = smart_chunk(text=text, source=txt_file.name, topic=topic)

        log.info("ingesting_file", file=txt_file.name, topic=topic, chunks=len(chunks))
        ingested = await ingest_chunks_batch(chunks)
        total += ingested

    return total


async def main() -> None:
    print("FLAG AI Platform — Knowledge Ingestion")
    print("=" * 45)

    web_count = await ingest_scraped_pages()
    print(f"Website pages: {web_count} chunks ingested")

    file_count = await ingest_text_files()
    print(f"Local files:   {file_count} chunks ingested")

    total = web_count + file_count
    print(f"\nTotal: {total} chunks now in Supabase knowledge base")
    log.info("ingest_complete", total_chunks=total)


if __name__ == "__main__":
    asyncio.run(main())
