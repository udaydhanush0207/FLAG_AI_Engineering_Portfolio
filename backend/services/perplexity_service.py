"""
backend/services/perplexity_service.py
Perplexity sonar-pro — industry trends, web search, lead research.
Optional: if PERPLEXITY_API_KEY is empty, llm_router falls back to Claude.
"""

import httpx
import structlog

from backend.config import config

log = structlog.get_logger()

PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"
MODEL = "sonar-pro"


async def ask_perplexity(question: str) -> str:
    """Search the web using Perplexity sonar-pro for real-time industry info.

    Raises RuntimeError if PERPLEXITY_API_KEY is not set.
    The router checks config.PERPLEXITY_API_KEY before calling this function.

    Args:
        question: Industry/trend/research question

    Returns:
        Perplexity's answer with web citations
    """
    if not config.PERPLEXITY_API_KEY:
        raise RuntimeError("PERPLEXITY_API_KEY not configured")

    payload = {
        "model": MODEL,
        "messages": [
            {
                "role": "system",
                "content": (
                    "You are a CIP (Capital Improvement Program) and municipal bond industry expert. "
                    "Provide current, accurate information with sources. "
                    "Focus on Texas municipalities when relevant."
                ),
            },
            {"role": "user", "content": question},
        ],
        "max_tokens": 1024,
        "temperature": 0.2,
        "return_citations": True,
    }

    headers = {
        "Authorization": f"Bearer {config.PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }

    async with httpx.AsyncClient(timeout=30.0) as client:
        response = await client.post(PERPLEXITY_API_URL, json=payload, headers=headers)
        response.raise_for_status()
        data = response.json()

    answer = data["choices"][0]["message"]["content"]
    log.info("perplexity_response", model=MODEL, chars=len(answer))
    return answer
