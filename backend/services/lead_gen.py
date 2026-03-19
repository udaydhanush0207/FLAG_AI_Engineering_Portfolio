"""
backend/services/lead_gen.py
Lead generation — research Texas county officials for CIP/MGO outreach.
Uses Perplexity for web research (falls back to Gemini if no key).
"""

import json
import structlog
import httpx

from backend.config import config
from backend.services.gemini_service import ask_gemini_direct

log = structlog.get_logger()

PERPLEXITY_API_URL = "https://api.perplexity.ai/chat/completions"

TEXAS_COUNTIES = [
    "Travis", "Harris", "Bexar", "Tarrant", "Collin", "Denton", "Fort Bend",
    "Williamson", "Montgomery", "Hays", "Brazoria", "Galveston", "Bell",
    "Lubbock", "McLennan", "Jefferson", "Smith", "Webb", "El Paso",
    "Cameron", "Hidalgo", "Nueces", "Tom Green", "Ector", "Midland",
]


async def _research_with_perplexity(prompt: str) -> str:
    """Use Perplexity sonar-pro for web search research."""
    headers = {
        "Authorization": f"Bearer {config.PERPLEXITY_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": "sonar-pro",
        "messages": [{"role": "user", "content": prompt}],
        "max_tokens": 800,
        "temperature": 0.1,
        "return_citations": True,
    }
    async with httpx.AsyncClient(timeout=30.0) as client:
        r = await client.post(PERPLEXITY_API_URL, json=payload, headers=headers)
        r.raise_for_status()
        return r.json()["choices"][0]["message"]["content"]


async def _research_county(county: str, state: str = "Texas") -> str:
    """Research a county's CIP/bond program status."""
    prompt = f"""Research {county} County, {state} for CIP bond program management opportunities.
Find:
1. Who manages capital improvement programs (name, title, email if public)
2. Recent or upcoming bond elections (dollar amounts)
3. Active infrastructure projects
4. Whether they use third-party program management firms

Be specific with names, titles, and dollar amounts. If no info found, say so."""

    if config.PERPLEXITY_API_KEY:
        return await _research_with_perplexity(prompt)
    else:
        return await ask_gemini_direct(prompt, [])


async def _score_and_structure(county: str, raw_research: str, category: str) -> dict:
    """Use Gemini to extract structured lead data + score from raw research."""
    prompt = f"""You are analyzing research about {county} County, Texas for CIP bond program management sales leads.

Research data:
{raw_research}

Extract and return a JSON object with these exact fields:
{{
  "name": "Full name of the key contact (or 'Unknown' if not found)",
  "title": "Their job title",
  "email": "Email if found, else empty string",
  "phone": "Phone if found, else empty string",
  "county": "{county}",
  "state": "TX",
  "category": "{category}",
  "score": <integer 1-10 based on: active bond programs=+3, upcoming election=+2, large budget=+2, no current PM firm=+2, contact found=+1>,
  "research_notes": "2-3 sentence summary of CIP/bond opportunity",
  "bond_programs": {{"has_active": true/false, "recent_election": "description or null", "budget_estimate": "dollar amount or null"}}
}}

Return ONLY the JSON object, no other text."""

    response = await ask_gemini_direct(prompt, [])

    # Extract JSON from response
    try:
        # Strip markdown code fences if present
        clean = response.strip()
        if clean.startswith("```"):
            clean = clean.split("```")[1]
            if clean.startswith("json"):
                clean = clean[4:]
        return json.loads(clean.strip())
    except Exception as e:
        log.warning("lead_json_parse_failed", county=county, error=str(e))
        return {
            "name": "Unknown",
            "title": "Unknown",
            "email": "",
            "phone": "",
            "county": county,
            "state": "TX",
            "category": category,
            "score": 3,
            "research_notes": raw_research[:300],
            "bond_programs": {},
        }


async def research_lead(county: str, state: str = "Texas", category: str = "CIP") -> dict:
    """Research a single county and return a structured lead dict."""
    log.info("researching_lead", county=county, state=state)
    try:
        raw = await _research_county(county, state)
        lead = await _score_and_structure(county, raw, category)
        log.info("lead_researched", county=county, score=lead.get("score", 0))
        return lead
    except Exception as e:
        log.error("lead_research_failed", county=county, error=str(e))
        return {
            "name": "Research Failed",
            "title": "",
            "email": "",
            "phone": "",
            "county": county,
            "state": "TX",
            "category": category,
            "score": 1,
            "research_notes": f"Research failed: {str(e)[:100]}",
            "bond_programs": {},
        }


async def generate_leads_batch(
    state: str = "Texas",
    category: str = "CIP",
    limit: int = 10,
) -> list[dict]:
    """Generate a batch of researched + scored leads.

    Args:
        state: Target state
        category: "CIP", "MGO", or "BOTH"
        limit: Max counties to research (each takes ~5-10s)

    Returns:
        List of lead dicts sorted by score descending
    """
    counties = TEXAS_COUNTIES[:limit]
    leads = []

    for county in counties:
        lead = await research_lead(county, state, category)
        leads.append(lead)

    leads.sort(key=lambda x: x.get("score", 0), reverse=True)
    log.info("batch_complete", total=len(leads), state=state, category=category)
    return leads


def score_lead(lead_data: dict) -> int:
    """Score a lead 1-10 based on CIP/MGO relevance signals."""
    score = 3  # base
    bp = lead_data.get("bond_programs", {})
    if bp.get("has_active"):           score += 3
    if bp.get("recent_election"):      score += 2
    if bp.get("budget_estimate"):      score += 1
    if lead_data.get("email"):         score += 1
    return min(score, 10)
