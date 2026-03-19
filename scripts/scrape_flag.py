"""
scripts/scrape_flag.py
Scrape the FLAG website and save raw pages to backend/data/scraped_pages.json.

Usage:
    backend/venv/Scripts/python scripts/scrape_flag.py
"""

import asyncio
import json
import sys
from pathlib import Path

# Ensure project root is on the path
sys.path.insert(0, str(Path(__file__).parent.parent))

from dotenv import load_dotenv
load_dotenv()

import structlog
from backend.services.scraper import scrape_site

log = structlog.get_logger()
OUTPUT_FILE = Path("backend/data/scraped_pages.json")


async def main() -> None:
    log.info("starting_scrape", url="https://frontlineadvisorygroup.com")
    pages = await scrape_site(max_pages=60)

    OUTPUT_FILE.parent.mkdir(parents=True, exist_ok=True)
    with open(OUTPUT_FILE, "w", encoding="utf-8") as f:
        json.dump(pages, f, indent=2, ensure_ascii=False)

    log.info("scrape_complete", pages=len(pages), output=str(OUTPUT_FILE))
    print(f"\nScraped {len(pages)} pages -> {OUTPUT_FILE}")
    for p in pages:
        print(f"  [{len(p['text'])} chars] {p['url']}")


if __name__ == "__main__":
    asyncio.run(main())
