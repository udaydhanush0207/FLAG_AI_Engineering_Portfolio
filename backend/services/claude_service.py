"""
backend/services/claude_service.py
Claude Sonnet 4 — primary RAG responses using BRICK persona.
"""

import structlog
from anthropic import AsyncAnthropic

from backend.config import config

log = structlog.get_logger()

MODEL = "claude-sonnet-4-20250514"

BRICK_SYSTEM_PROMPT = """You are BRICK, FLAG's AI Intelligence Assistant.
FLAG = Front Line Advisory Group, a CIP bond program management consulting firm based in Dripping Springs, TX.

RULES:
1. Answer ONLY from provided context. If context lacks the answer, say so honestly: "I don't have that information in my knowledge base."
2. Always expand acronyms on first use (e.g., CIP = Capital Improvement Program).
3. Include dollar amounts and project counts when available in context.
4. Cite sources by mentioning the document or page (e.g., "According to the Bond Book...").
5. Be concise but complete. FLAG staff are busy professionals.
6. Never make up data, names, or figures not in the provided context."""

DIRECT_SYSTEM_PROMPT = """You are BRICK, FLAG's AI Intelligence Assistant.
FLAG = Front Line Advisory Group, a CIP bond program management consulting firm.
Answer helpfully and concisely. Expand acronyms (CIP = Capital Improvement Program, MGO = Municipal General Obligation) on first use."""

_client: AsyncAnthropic | None = None


def _get_client() -> AsyncAnthropic:
    global _client
    if _client is None:
        _client = AsyncAnthropic(api_key=config.ANTHROPIC_API_KEY)
    return _client


def _build_context_block(chunks: list[dict]) -> str:
    """Format retrieved chunks into a readable context block."""
    if not chunks:
        return "No relevant context found in the FLAG knowledge base."

    parts = []
    for i, chunk in enumerate(chunks, 1):
        source = chunk.get("source", "Unknown")
        topic = chunk.get("topic", "general")
        similarity = chunk.get("similarity", 0)
        content = chunk.get("content", "")
        parts.append(f"[Source {i}: {source} | Topic: {topic} | Relevance: {similarity:.2f}]\n{content}")

    return "\n\n---\n\n".join(parts)


def _build_messages(history: list, user_question: str, context: str = "") -> list[dict]:
    """Build Anthropic messages array from history + current question."""
    messages = []

    # Add conversation history (last 10 turns max to keep context manageable)
    for turn in history[-10:]:
        if turn.get("role") in ("user", "assistant") and turn.get("content"):
            messages.append({"role": turn["role"], "content": turn["content"]})

    # Add current question with context
    if context:
        user_content = f"""Context from FLAG knowledge base:

{context}

---

Question: {user_question}"""
    else:
        user_content = user_question

    messages.append({"role": "user", "content": user_content})
    return messages


async def ask_claude(
    question: str,
    context_chunks: list[dict],
    history: list,
) -> str:
    """Ask BRICK (Claude Sonnet 4) with retrieved context chunks.

    Args:
        question: User's question
        context_chunks: Retrieved knowledge chunks from vector store
        history: Previous conversation turns

    Returns:
        BRICK's response string
    """
    client = _get_client()
    context = _build_context_block(context_chunks)
    messages = _build_messages(history, question, context)

    response = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=BRICK_SYSTEM_PROMPT,
        messages=messages,
    )

    answer = response.content[0].text
    log.info(
        "claude_rag_response",
        chunks_used=len(context_chunks),
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )
    return answer


async def ask_claude_direct(
    question: str,
    history: list,
    prefix: str = "",
) -> str:
    """Ask Claude directly without RAG context (general or fallback queries).

    Args:
        question: User's question
        history: Previous conversation turns
        prefix: Optional note to prepend to the response context

    Returns:
        Claude's response string
    """
    client = _get_client()
    messages = _build_messages(history, question)

    system = DIRECT_SYSTEM_PROMPT
    if prefix:
        system = f"{system}\n\n{prefix}"

    response = await client.messages.create(
        model=MODEL,
        max_tokens=1024,
        system=system,
        messages=messages,
    )

    answer = response.content[0].text
    log.info(
        "claude_direct_response",
        input_tokens=response.usage.input_tokens,
        output_tokens=response.usage.output_tokens,
    )
    return answer
