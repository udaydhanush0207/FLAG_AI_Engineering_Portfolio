# Lessons Learned — FLAG AI Intelligence Platform

> Claude Code: Update this file every time you make a mistake or learn something.
> Review this file at the START of every session.

---

## Format

```
### [DATE] - [Category] - [Short Title]
**Mistake**: What went wrong
**Root Cause**: Why it happened
**Fix**: What was done to fix it
**Rule**: The rule to prevent it from happening again
```

---

## Known Rules from BRICK v1 (Pre-loaded)

### 2026-03-19 - Retrieval - Small chunks cause hallucination
**Mistake**: BRICK v1 used 500-character chunks with 50 overlap and only retrieved 8 results
**Root Cause**: Small chunks lose paragraph context, and 8 results isn't enough for a large knowledge base
**Fix**: Changed to 1200-char chunks, 200 overlap, 15 results, similarity threshold 0.7
**Rule**: NEVER chunk below 1000 characters. ALWAYS retrieve 15+ results. ALWAYS filter by similarity > 0.7.

### 2026-03-19 - Architecture - Two servers create confusion
**Mistake**: BRICK v1 had a DigitalOcean server AND a Hetzner server, causing deployment confusion
**Root Cause**: Started with one, added another without migrating
**Fix**: Single DigitalOcean server for everything
**Rule**: ONE server. ONE source of truth. If you need more compute, scale up the droplet, don't add another server.

### 2026-03-19 - Dependencies - OpenClaw added complexity without value
**Mistake**: OpenClaw was partially configured but never worked, adding confusion
**Root Cause**: Middleware that wasn't needed for the actual use case
**Fix**: Removed entirely. Direct API integration is simpler and more reliable.
**Rule**: Don't add middleware or agent frameworks unless they solve a specific, proven problem. Direct API calls > framework wrappers.

### 2026-03-19 - Ingest - Manual SSH ingest is unsustainable
**Mistake**: BRICK v1 required SSH + doppler run to ingest new knowledge
**Root Cause**: No API endpoint for ingest
**Fix**: Added POST /api/ingest endpoint with API key auth
**Rule**: Every operation that might need to happen more than once MUST have an API endpoint.

### 2026-03-19 - Secrets - Doppler was overkill
**Mistake**: Used Doppler for secret management on a simple single-server setup
**Root Cause**: Over-engineering
**Fix**: Environment variables in systemd service file + .env for local dev
**Rule**: For single-server deployments, Environment= in systemd is sufficient. Don't add tools you don't need.

---

## Session Lessons (Add new ones below)

### 2026-03-19 - Embeddings - text-embedding-3-small uses lower similarity scores
**Mistake**: Set SIMILARITY_THRESHOLD=0.7 (the lesson from BRICK v1 with a different model)
**Root Cause**: text-embedding-3-small produces cosine similarity scores in the 0.5-0.65 range, not 0.7+
**Fix**: Lowered threshold to 0.5 — now retrieves 13-15 relevant chunks per query
**Rule**: When using text-embedding-3-small, set similarity threshold to 0.5. For ada-002 use 0.7.

### 2026-03-19 - APIs - Anthropic and Gemini 2.0 Flash quota issues
**Mistake**: Primary (Claude Sonnet 4) and first fallback (Gemini 2.0 Flash) both failed at test time
**Root Cause**: Anthropic key has no credits; Gemini 2.0 Flash free tier limit = 0 for this project
**Fix**: Switched to gemini-2.5-flash which works on this API key
**Rule**: Always test API keys before building around them. gemini-2.5-flash works; 2.0-flash free tier is blocked.

### 2026-03-19 - Scraper - WordPress pagination creates duplicate pages
**Mistake**: FLAG site scraper hit ?bdpp_page=2,3,25 variants of each article (3x duplicates)
**Root Cause**: WordPress paginated view plugin creates separate URLs for each page chunk
**Fix**: Added 'bdpp_page=' to SKIP_PATTERNS + deduplication in ingest_all.py by base URL
**Rule**: Always skip query-param pagination URLs in scrapers. Deduplicate by base URL before ingesting.
