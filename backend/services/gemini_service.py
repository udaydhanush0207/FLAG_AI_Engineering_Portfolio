"""
backend/services/gemini_service.py
Gemini 2.0 Flash — primary LLM for all BRICK queries (Claude has no credits).
Also handles long document analysis via 2M context window.
"""

import structlog
from google import genai
from google.genai import types

from backend.config import config

log = structlog.get_logger()

MODEL = "gemini-2.5-flash"

_client: genai.Client | None = None

BRICK_SYSTEM = """You are BRICK, FLAG's AI Intelligence Assistant.
FLAG = Front Line Advisory Group, a CIP bond program management consulting firm based in Dripping Springs, TX.

RULES:
1. Answer ONLY from provided context. If context lacks the answer, say so honestly.
2. Always expand acronyms on first use (CIP = Capital Improvement Program, MGO = Municipal General Obligation).
3. Include dollar amounts and project counts when available in context.
4. Cite sources when available (mention the URL or document name).
5. Be concise but complete. FLAG staff are busy professionals.
6. Never make up data, names, or figures not in the provided context."""

DIRECT_SYSTEM = """You are BRICK, FLAG's AI Intelligence Assistant.
FLAG = Front Line Advisory Group, a CIP bond program management consulting firm.
Answer helpfully and concisely. Expand acronyms on first use."""


def _get_client() -> genai.Client:
    global _client
    if _client is None:
        _client = genai.Client(api_key=config.GOOGLE_API_KEY)
    return _client


def _build_context_block(chunks: list[dict]) -> str:
    """Format retrieved chunks into a readable context block."""
    if not chunks:
        return "No relevant context found in the FLAG knowledge base."
    parts = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk.get("source", "Unknown")
        similarity = chunk.get("similarity", 0)
        content = chunk.get("content", "")
        parts.append(f"[Source {i}: {source} | Relevance: {similarity:.2f}]\n{content}")
    return "\n\n---\n\n".join(parts)


async def ask_gemini_rag(
    question: str,
    context_chunks: list[dict],
    history: list,
) -> str:
    """Ask BRICK (Gemini 2.0 Flash) with retrieved RAG context chunks."""
    client = _get_client()
    context = _build_context_block(context_chunks)

    # Build conversation history
    contents = []
    for turn in history[-8:]:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role == "user":
            contents.append(types.Content(role="user", parts=[types.Part(text=content)]))
        elif role == "assistant":
            contents.append(types.Content(role="model", parts=[types.Part(text=content)]))

    # Add current question with context
    user_message = f"""Context from FLAG knowledge base:

{context}

---

Question: {question}"""
    contents.append(types.Content(role="user", parts=[types.Part(text=user_message)]))

    response = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=BRICK_SYSTEM,
            max_output_tokens=1024,
            temperature=0.1,
        ),
    )

    answer = response.text
    log.info("gemini_rag_response", chunks_used=len(context_chunks), chars=len(answer))
    return answer


async def ask_gemini_direct(
    question: str,
    history: list,
    prefix: str = "",
) -> str:
    """Ask Gemini directly without RAG context (general or fallback queries)."""
    client = _get_client()

    contents = []
    for turn in history[-8:]:
        role = turn.get("role", "user")
        content = turn.get("content", "")
        if role == "user":
            contents.append(types.Content(role="user", parts=[types.Part(text=content)]))
        elif role == "assistant":
            contents.append(types.Content(role="model", parts=[types.Part(text=content)]))

    msg = f"{prefix}{question}" if prefix else question
    contents.append(types.Content(role="user", parts=[types.Part(text=msg)]))

    response = client.models.generate_content(
        model=MODEL,
        contents=contents,
        config=types.GenerateContentConfig(
            system_instruction=DIRECT_SYSTEM,
            max_output_tokens=1024,
            temperature=0.2,
        ),
    )

    answer = response.text
    log.info("gemini_direct_response", chars=len(answer))
    return answer


async def ask_gemini(question: str, document_text: str) -> str:
    """Analyze a long document using Gemini 2.0 Flash (2M context window)."""
    client = _get_client()

    if document_text:
        prompt = f"""Analyze this document for FLAG (Front Line Advisory Group, CIP bond management consulting).

Document:
{document_text}

Question: {question}

Answer thoroughly based solely on the document content."""
    else:
        prompt = question

    response = client.models.generate_content(
        model=MODEL,
        contents=prompt,
        config=types.GenerateContentConfig(
            system_instruction=DIRECT_SYSTEM,
            max_output_tokens=2048,
            temperature=0.1,
        ),
    )

    answer = response.text
    log.info("gemini_doc_response", doc_len=len(document_text), chars=len(answer))
    return answer
