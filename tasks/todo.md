# Task Tracker — FLAG AI Intelligence Platform

> Claude Code: Update this file as you complete tasks. Check items off with [x].

---

## Phase 1: Foundation (Day 1)

- [x] Create project directory structure
- [x] Initialize git repository
- [x] Set up Python virtual environment
- [x] Install backend dependencies
- [x] Create .env file with all API keys
- [x] Create Supabase project
- [x] Run database schema SQL (knowledge_chunks, conversations, leads, agent_status)
- [x] Verify Supabase connection from Python
- [x] Create backend/config.py
- [x] Create backend/main.py (FastAPI app skeleton)
- [x] Create all route files (health, chat, ingest, leads, webhooks) with placeholder endpoints
- [x] Create all service files with placeholder classes
- [x] Verify server starts: `uvicorn backend.main:app --reload`
- [x] GET /api/health returns 200

## Phase 2: BRICK v2 Core (Day 2)

- [x] Implement services/vector_store.py (get_embedding, search_knowledge, ingest_chunk)
- [x] Implement services/chunker.py (smart_chunk with 1200/200 config)
- [x] Implement services/llm_router.py (classify_query with FLAG/industry/doc/general types)
- [x] Implement services/claude_service.py (BRICK persona, system prompt, ask_claude)
- [x] Implement services/perplexity_service.py (optional — fallback to Claude when key missing)
- [x] Implement services/gemini_service.py (ask_gemini for long docs)
- [x] Implement routes/chat.py (POST /api/ask with full routing logic)
- [x] Test: "What programs does FLAG manage?" → $3.5B / 127 projects cited ✓
- [ ] Test: "What is TWAPS?" → correct acronym expansion (needs TWAPS content ingested)
- [x] Test: "What's happening in the CIP industry?" → answered from scraped articles ✓

## Phase 3: Knowledge Ingest + Channels (Day 3)

- [ ] Implement services/scraper.py (FLAG website scraper)
- [ ] Create scripts/scrape_flag.py (scrape all pages)
- [ ] Create scripts/ingest_all.py (process + ingest everything)
- [ ] Implement routes/ingest.py (POST /api/ingest)
- [ ] Scrape frontlineadvisorygroup.com (all pages)
- [ ] Process and ingest Bond Book PDF
- [ ] Process and ingest acronyms data
- [ ] Process and ingest team profiles
- [ ] Verify: 20-question test, <5% hallucination rate
- [ ] Implement services/voice.py (Whisper transcription)
- [ ] Implement WhatsApp webhook (routes/webhooks.py)
- [ ] Set up Twilio WhatsApp sandbox
- [ ] Test: Send WhatsApp message → get response
- [ ] Implement Telegram webhook
- [ ] Create Telegram bot via @BotFather
- [ ] Test: Send Telegram message → get response
- [ ] Test: Send voice message → transcribed and answered

## Phase 4: Lead Generation (Day 4)

- [ ] Implement services/lead_gen.py (research + categorize + score)
- [ ] Implement routes/leads.py (generate, list, update, export endpoints)
- [ ] Generate Texas county contacts batch (50+ leads)
- [ ] Verify categorization: CIP vs MGO
- [ ] Verify scoring: 1-10 relevance
- [ ] Test CSV export
- [ ] Identify top 10 leads for immediate outreach

## Phase 5: Unified Dashboard (Day 5)

- [x] Initialize React project: `bun create vite frontend --template react-ts`
- [x] Install dependencies: Tailwind v4, Recharts, TanStack Query, Zustand, React Router 7, Lucide
- [x] Set up Tailwind v4 with FLAG brand colors (Navy/Red/Gold dark theme)
- [x] Create layout component (sidebar + topbar)
- [x] Build Dashboard page (stats, area chart, agent pills, recent convs)
- [x] Build Chat page (BRICK interface, source citations, model badge, response time)
- [x] Build Leads page (sortable table, filters, CSV export, placeholder data)
- [x] Build Agents page (detailed cards, metrics, capabilities, system info)
- [x] Connect all pages to backend API via TanStack Query
- [ ] Add WebSocket for real-time updates (deferred)
- [x] Deploy to Vercel → https://flag-ai-platform.vercel.app
- [x] Fix Vercel → DO connection: vercel.json rewrites /api/* → http://198.199.88.122 (fixes HTTPS/HTTP mixed content)
- [x] Remove VITE_API_URL, use relative paths everywhere (vite proxy for local, vercel rewrites for prod)
- [x] Leads page: 30s refetchInterval + "Last synced: Xs ago" indicator
- [ ] ⚠️ NEEDS MANUAL STEP: Vercel CLI token expired. Go to vercel.com → flag-ai-platform → Deployments → Redeploy latest (master push: c4a418d)

## Phase 6: Integration + Testing (Day 6)

- [x] End-to-end test: Web chat → correct answer with sources ✓ (DO direct: "FLAG manages $3.5B / 127 projects")
- [ ] End-to-end test: WhatsApp → correct answer
- [ ] End-to-end test: Telegram → correct answer
- [ ] End-to-end test: Voice message → transcribed + answered
- [ ] End-to-end test: Lead generation → leads in dashboard
- [ ] End-to-end test: Dashboard real-time updates
- [ ] Error handling: bad input on all endpoints
- [ ] Response time check: 95th percentile < 5 seconds
- [ ] Fix all bugs found

## Phase 7: Polish + Demo (Day 7)

- [ ] Update GitHub portfolio README with screenshots
- [ ] Add architecture diagrams to README
- [ ] Write demo script (what to show, in what order)
- [ ] Practice demo run-through
- [ ] Final bug fixes
- [ ] Deploy final version to production
- [ ] Verify all channels working on production

---

## Monday Tasks (From FLAG)

- [ ] Task 1: (TO BE ADDED when FLAG assigns)
- [ ] Task 2: (TO BE ADDED when FLAG assigns)

---

## Review Notes

_Add notes here after each phase completion._
