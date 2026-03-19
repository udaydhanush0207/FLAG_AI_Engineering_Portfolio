"""
backend/services/llm_router.py
Classify queries and route them to the correct LLM service.

Query types:
  - flag_knowledge: questions about FLAG programs, team, services → Claude + RAG
  - industry_trends: CIP/bond industry news, trends → Perplexity (or Claude fallback)
  - doc_analysis: long document analysis requested → Gemini
  - general: anything else → Claude direct (no RAG)
"""

import structlog

from backend.config import config

MODEL_PRIMARY = "gemini-2.5-flash"

log = structlog.get_logger()

# Keywords that signal FLAG-specific knowledge questions
FLAG_KEYWORDS = {
    "flag", "frontline", "front line", "advisory group",
    "brick", "cip", "bond", "program", "project", "budget",
    "county", "district", "municipal", "twaps", "bond book",
    "team", "staff", "services", "clients", "portfolio",
    "travis", "dallas", "harris", "bexar", "tarrant",
    "dripping springs", "austin", "san antonio",
}

# Keywords that signal real-time industry/trends questions
INDUSTRY_KEYWORDS = {
    "latest", "recent", "trend", "news", "update", "current",
    "market", "industry", "nationwide", "state-wide", "legislation",
    "inflation", "interest rate", "2024", "2025", "2026",
    "what's happening", "whats happening",
}

# Keywords that signal long document analysis
DOC_KEYWORDS = {
    "analyze this", "summarize this", "read this", "review this",
    "document", "report", "pdf", "full text", "entire",
}


def classify_query(question: str) -> str:
    """Classify the query to determine routing destination.

    Returns one of: flag_knowledge, industry_trends, doc_analysis, general
    Uses keyword heuristics — fast, no LLM call needed for classification.
    """
    q_lower = question.lower()

    # Doc analysis takes priority if user is pasting a document
    if any(kw in q_lower for kw in DOC_KEYWORDS) and len(question) > 500:
        return "doc_analysis"

    # Industry trends — real-time web search needed
    has_industry = any(kw in q_lower for kw in INDUSTRY_KEYWORDS)
    has_flag = any(kw in q_lower for kw in FLAG_KEYWORDS)

    if has_industry and not has_flag:
        return "industry_trends"

    # FLAG-specific knowledge — use RAG
    if has_flag:
        return "flag_knowledge"

    # Default: general question answered by Claude directly
    return "general"


async def route_query(question: str, history: list, channel: str) -> dict:
    """Route query to appropriate service and return answer + metadata.

    Returns dict with keys: answer, source, query_type, model_used
    """
    from backend.services import gemini_service, perplexity_service, vector_store

    query_type = classify_query(question)
    log.info("query_routed", query_type=query_type, channel=channel)

    if query_type == "flag_knowledge":
        chunks = await vector_store.search_knowledge(
            question,
            n=config.RETRIEVAL_LIMIT,
            threshold=config.SIMILARITY_THRESHOLD,
        )
        answer = await gemini_service.ask_gemini_rag(question, chunks, history)
        return {"answer": answer, "source": "BRICK (Gemini + RAG)", "query_type": query_type, "model_used": MODEL_PRIMARY}

    elif query_type == "industry_trends":
        if config.PERPLEXITY_API_KEY:
            answer = await perplexity_service.ask_perplexity(question)
            return {"answer": answer, "source": "Perplexity sonar-pro", "query_type": query_type, "model_used": "sonar-pro"}
        else:
            answer = await gemini_service.ask_gemini_direct(
                question,
                history,
                prefix="Note: answering from training data (no live web access). ",
            )
            return {"answer": answer, "source": "Gemini (no live web access)", "query_type": query_type, "model_used": MODEL_PRIMARY}

    elif query_type == "doc_analysis":
        answer = await gemini_service.ask_gemini(question, "")
        return {"answer": answer, "source": "Gemini 2.0 Flash", "query_type": query_type, "model_used": MODEL_PRIMARY}

    else:  # general
        answer = await gemini_service.ask_gemini_direct(question, history)
        return {"answer": answer, "source": "Gemini 2.0 Flash", "query_type": query_type, "model_used": MODEL_PRIMARY}
