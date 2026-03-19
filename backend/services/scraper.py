"""
backend/services/scraper.py
FLAG website scraper — crawl frontlineadvisorygroup.com for knowledge ingestion.
"""

import re
from urllib.parse import urljoin, urlparse

import httpx
import structlog
from bs4 import BeautifulSoup

log = structlog.get_logger()

FLAG_BASE_URL = "https://frontlineadvisorygroup.com"

# Skip these URL patterns (not useful knowledge)
SKIP_PATTERNS = [
    "/wp-", "/feed", "/tag/", "/author/", "/page/",
    "#", "javascript:", "mailto:", "tel:",
    ".pdf", ".jpg", ".png", ".gif", ".zip",
    "bdpp_page=",  # WordPress paginated article views — duplicates
    "?page=", "&page=",
]


async def scrape_page(url: str) -> dict:
    """Scrape a single page and return cleaned text content.

    Returns dict with: url, title, text, links
    """
    async with httpx.AsyncClient(timeout=20.0, follow_redirects=True) as client:
        headers = {"User-Agent": "FLAG-AI-Bot/2.0 (internal knowledge indexer)"}
        response = await client.get(url, headers=headers)
        response.raise_for_status()

    soup = BeautifulSoup(response.text, "html.parser")

    # Remove noise elements
    for tag in soup(["script", "style", "nav", "footer", "header",
                     "form", "iframe", "noscript", ".cookie-banner",
                     ".wp-block-navigation", ".site-footer", ".site-header"]):
        tag.decompose()

    title = soup.title.get_text(strip=True) if soup.title else url

    # Extract main content — prefer article/main/content divs
    content_el = (
        soup.find("article")
        or soup.find("main")
        or soup.find(class_=re.compile(r"content|entry|post|page", re.I))
        or soup.find("body")
    )
    raw_text = content_el.get_text(separator="\n", strip=True) if content_el else ""

    # Clean up excessive whitespace
    text = re.sub(r"\n{3,}", "\n\n", raw_text).strip()

    # Collect internal links for crawling
    links = []
    for a in soup.find_all("a", href=True):
        href = urljoin(url, a["href"])
        if _is_internal(href) and not _should_skip(href):
            links.append(href)

    log.info("page_scraped", url=url, text_len=len(text), links=len(links))
    return {"url": url, "title": title, "text": text, "links": links}


async def scrape_site(base_url: str = FLAG_BASE_URL, max_pages: int = 50) -> list[dict]:
    """Crawl all pages of a site starting from base_url.

    Returns list of page dicts with url, title, text fields.
    """
    visited: set[str] = set()
    queue = [base_url]
    pages = []

    while queue and len(pages) < max_pages:
        url = queue.pop(0)
        url = url.rstrip("/")

        if url in visited:
            continue
        visited.add(url)

        try:
            page = await scrape_page(url)
            if page["text"] and len(page["text"]) > 200:
                pages.append(page)
                log.info("crawled", n=len(pages), url=url)

            # Add new unvisited links to queue
            for link in page["links"]:
                link = link.rstrip("/")
                if link not in visited and link not in queue:
                    queue.append(link)

        except Exception as e:
            log.warning("scrape_failed", url=url, error=str(e))
            continue

    log.info("crawl_complete", total_pages=len(pages), visited=len(visited))
    return pages


def _is_internal(url: str) -> bool:
    parsed = urlparse(url)
    base = urlparse(FLAG_BASE_URL)
    return parsed.netloc == base.netloc or parsed.netloc == ""


def _should_skip(url: str) -> bool:
    return any(pattern in url.lower() for pattern in SKIP_PATTERNS)
