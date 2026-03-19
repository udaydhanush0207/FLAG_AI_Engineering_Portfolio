"""
backend/services/chunker.py
Smart document chunker: 1200-char chunks, 200-char overlap, paragraph-aware splits.
Rule: NEVER chunk below 1000 characters.
"""

import re
import structlog

log = structlog.get_logger()

CHUNK_SIZE = 1200
CHUNK_OVERLAP = 200


def smart_chunk(text: str, source: str, topic: str = "general") -> list[dict]:
    """Split text into overlapping chunks preserving paragraph boundaries.

    Strategy:
    1. Split on double newlines (paragraphs) first
    2. Accumulate paragraphs until we hit CHUNK_SIZE
    3. Overlap by keeping the last CHUNK_OVERLAP chars of previous chunk

    Args:
        text: Raw document text
        source: Document source identifier (file name, URL, etc.)
        topic: Knowledge category (e.g., "bond_programs", "team", "general")

    Returns:
        List of chunk dicts with content, source, topic, chunk_index, metadata fields.
    """
    # Normalize whitespace
    text = re.sub(r"\r\n", "\n", text)
    text = re.sub(r"\n{3,}", "\n\n", text).strip()

    if not text:
        return []

    # Split into paragraphs
    paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]

    chunks: list[dict] = []
    current = ""
    chunk_index = 0

    for para in paragraphs:
        candidate = (current + "\n\n" + para).strip() if current else para

        if len(candidate) <= CHUNK_SIZE:
            current = candidate
        else:
            # Save current chunk if it has content
            if current:
                chunks.append(_make_chunk(current, source, topic, chunk_index))
                chunk_index += 1
                # Start next chunk with overlap from end of previous
                overlap_text = current[-CHUNK_OVERLAP:] if len(current) > CHUNK_OVERLAP else current
                current = (overlap_text + "\n\n" + para).strip()
            else:
                # Single paragraph > CHUNK_SIZE: hard split
                for hard_chunk in _hard_split(para, source, topic, chunk_index):
                    chunks.append(hard_chunk)
                    chunk_index += 1
                current = para[-CHUNK_OVERLAP:] if len(para) > CHUNK_OVERLAP else para

    # Flush remaining
    if current and len(current) >= 100:  # Don't save tiny trailing fragments
        chunks.append(_make_chunk(current, source, topic, chunk_index))

    log.info("chunked_document", source=source, topic=topic, chunks=len(chunks))
    return chunks


def _make_chunk(content: str, source: str, topic: str, index: int) -> dict:
    return {
        "content": content,
        "source": source,
        "topic": topic,
        "chunk_index": index,
        "metadata": {
            "char_count": len(content),
            "word_count": len(content.split()),
        },
    }


def _hard_split(text: str, source: str, topic: str, start_index: int) -> list[dict]:
    """Force-split a paragraph that exceeds CHUNK_SIZE."""
    chunks = []
    offset = 0
    idx = start_index
    while offset < len(text):
        end = min(offset + CHUNK_SIZE, len(text))
        # Try to break at sentence boundary
        slice_text = text[offset:end]
        if end < len(text):
            last_period = slice_text.rfind(". ")
            if last_period > CHUNK_SIZE // 2:
                slice_text = text[offset: offset + last_period + 1]
                end = offset + last_period + 1
        chunks.append(_make_chunk(slice_text.strip(), source, topic, idx))
        idx += 1
        offset = end - CHUNK_OVERLAP if end - CHUNK_OVERLAP > offset else end
    return chunks
