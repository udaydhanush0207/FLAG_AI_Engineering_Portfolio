# System Architecture — FLAG AI Intelligence Platform

**Version**: 2.0  
**Date**: March 19, 2026  

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    FRONTEND (Vercel)                         │
│              React 19 + TypeScript + Vite                    │
│  ┌──────────┬──────────┬──────────┬───────────┐             │
│  │Dashboard │ Chat UI  │ Leads    │ Agents    │             │
│  │ Page     │  Page    │  Page    │  Page     │             │
│  └────┬─────┴────┬─────┴────┬─────┴─────┬─────┘             │
│       │          │          │           │                    │
│       └──────────┴──────────┴───────────┘                    │
│                       │ HTTPS                                │
└───────────────────────┼──────────────────────────────────────┘
                        │
                        ▼
┌─────────────────────────────────────────────────────────────┐
│              DIGITALOCEAN DROPLET (Ubuntu 24.04)             │
│                                                              │
│  ┌──────────────────────────────────────────────┐           │
│  │              NGINX (Reverse Proxy)            │           │
│  │         SSL via Let's Encrypt                 │           │
│  └─────────────────────┬────────────────────────┘           │
│                        │ :8000                               │
│  ┌─────────────────────▼────────────────────────┐           │
│  │           FASTAPI BACKEND                     │           │
│  │                                               │           │
│  │  ┌─────────────────────────────────┐          │           │
│  │  │         API ROUTES              │          │           │
│  │  │  /api/ask      (chat)          │          │           │
│  │  │  /api/ingest   (add knowledge) │          │           │
│  │  │  /api/health   (status)        │          │           │
│  │  │  /api/leads    (lead gen)      │          │           │
│  │  │  /api/webhooks/whatsapp        │          │           │
│  │  │  /api/webhooks/telegram        │          │           │
│  │  │  /ws/dashboard (websocket)     │          │           │
│  │  └──────────┬──────────────────────┘          │           │
│  │             │                                  │           │
│  │  ┌──────────▼──────────────────────┐          │           │
│  │  │       LLM ROUTER               │          │           │
│  │  │  Classifies query → routes to   │          │           │
│  │  │  correct model + retrieval      │          │           │
│  │  └──┬──────────┬──────────┬────────┘          │           │
│  │     │          │          │                    │           │
│  │     ▼          ▼          ▼                    │           │
│  │  ┌──────┐  ┌──────┐  ┌──────────┐            │           │
│  │  │Claude│  │Gemini│  │Perplexity│            │           │
│  │  │Sonnet│  │Flash │  │sonar-pro │            │           │
│  │  └──────┘  └──────┘  └──────────┘            │           │
│  │                                               │           │
│  └───────────────────────────────────────────────┘           │
│                                                              │
└──────────────────────────────────────────────────────────────┘
          │                              │
          ▼                              ▼
┌─────────────────┐          ┌──────────────────────┐
│   SUPABASE      │          │  EXTERNAL SERVICES   │
│   (Hosted)      │          │                      │
│                 │          │  Twilio (WhatsApp)   │
│  knowledge_     │          │  Telegram Bot API    │
│    chunks       │          │  OpenAI (embeddings  │
│  conversations  │          │    + whisper)        │
│  leads          │          │                      │
│  agent_status   │          └──────────────────────┘
│                 │
│  pgvector index │
└─────────────────┘
```

---

## 2. Request Flow

### Chat Request (FLAG Knowledge Question)
```
User sends "What is the Travis County 2023 bond budget?"
        │
        ▼
Channel (WhatsApp/Telegram/Web)
        │
        ▼
FastAPI /api/ask or /api/webhooks/*
        │
        ▼
LLM Router → classify_query()
  → Detects "travis county", "bond", "budget"
  → Returns: QueryType.FLAG_KNOWLEDGE
        │
        ▼
Vector Store → search_knowledge(query, n=15)
  → Embeds query via OpenAI text-embedding-3-small
  → Supabase RPC match_chunks()
  → Returns 15 chunks, filtered by similarity > 0.7
        │
        ▼
Claude Service → ask_claude(question, context, history)
  → System prompt: BRICK persona + rules
  → Context: retrieved chunks with source attribution
  → Returns: answer + token count
        │
        ▼
Format response → send back to channel
```

### Chat Request (Industry Question)
```
User sends "What are the latest CIP trends in Texas?"
        │
        ▼
LLM Router → classify_query()
  → Detects "latest", "trends"
  → Returns: QueryType.INDUSTRY_TRENDS
        │
        ▼
Perplexity Service → ask_perplexity(question)
  → sonar-pro model with built-in web search
  → Returns: answer + citations
```

### Lead Generation Request
```
User clicks "Generate Leads" for Texas counties
        │
        ▼
FastAPI /api/leads/generate
        │
        ▼
Perplexity Service → research each county
  → "Who is the CIP program manager for [County]?"
  → "Does [County] have active bond programs?"
        │
        ▼
Claude Service → categorize and score leads
  → CIP vs MGO classification
  → 1-10 relevance score
        │
        ▼
Supabase → store in leads table
        │
        ▼
WebSocket → push update to dashboard
```

---

## 3. Database Schema

### knowledge_chunks
```sql
CREATE TABLE knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  source TEXT,
  topic TEXT,          -- 'programs', 'services', 'team', 'articles', 'bond_book', 'acronyms'
  chunk_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);
```

### conversations
```sql
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,        -- 'whatsapp', 'telegram', 'web'
  user_id TEXT NOT NULL,
  messages JSONB DEFAULT '[]',
  query_type TEXT,              -- 'flag_knowledge', 'industry_trends', 'general'
  model_used TEXT,
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### leads
```sql
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  county TEXT NOT NULL,
  state TEXT DEFAULT 'TX',
  category TEXT,                -- 'CIP', 'MGO', 'BOTH'
  score INTEGER DEFAULT 0,     -- 1-10 relevance
  research_notes TEXT,
  bond_programs JSONB,          -- known bond programs in their county
  status TEXT DEFAULT 'new',   -- 'new', 'contacted', 'meeting_set', 'converted'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

### agent_status
```sql
CREATE TABLE agent_status (
  id TEXT PRIMARY KEY,          -- 'brick', 'lead_gen', 'cip_intel'
  name TEXT NOT NULL,
  status TEXT DEFAULT 'offline', -- 'online', 'offline', 'processing', 'error'
  last_activity TIMESTAMPTZ,
  total_queries INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

---

## 4. API Endpoints

| Method | Path | Purpose | Auth |
|--------|------|---------|------|
| POST | /api/ask | Main chat endpoint | None (internal) |
| POST | /api/ingest | Add knowledge chunks | API key header |
| GET | /api/health | System health + stats | None |
| POST | /api/leads/generate | Start lead generation | API key header |
| GET | /api/leads | List all leads | None (internal) |
| PATCH | /api/leads/:id | Update lead status | API key header |
| GET | /api/leads/export | Export leads as CSV | None |
| POST | /api/webhooks/whatsapp | Twilio WhatsApp webhook | Twilio signature |
| POST | /api/webhooks/telegram | Telegram bot webhook | Telegram token |
| GET | /api/agents | Agent status overview | None |
| WS | /ws/dashboard | Real-time dashboard updates | None |
| GET | /api/conversations | Recent conversations | None |
| GET | /api/stats | Dashboard statistics | None |

---

## 5. Frontend Pages

### Dashboard (/)
- Agent status cards (BRICK, Lead Gen, CIP Intelligence)
- Conversation volume chart (last 7 days)
- Recent conversations list
- Lead pipeline summary
- System health indicators

### Chat (/chat)
- Chat interface with BRICK
- Message history
- Source citations panel
- Model used indicator
- Response time badge

### Leads (/leads)
- Lead table with search/filter
- Category filter (CIP / MGO / Both)
- Score-based sorting
- Status tracking (New → Contacted → Meeting Set → Converted)
- Export to CSV button
- "Generate New Leads" button

### Agents (/agents)
- Detailed agent cards
- Conversation logs per agent
- Error logs
- Token usage tracking
- Start/stop controls

---

## 6. Deployment Architecture

```
GitHub (main branch)
    │
    ▼ (push triggers)
GitHub Actions
    │
    ├── Backend → SSH deploy to DigitalOcean
    │     └── git pull → pip install → systemctl restart brick
    │
    └── Frontend → Vercel auto-deploy
          └── bun install → bun run build → deploy
```

### Server Setup
```
DigitalOcean Droplet
├── /opt/flag-ai-platform/       # Backend app
│   ├── backend/
│   ├── venv/
│   └── data/
├── /etc/nginx/sites-available/  # Nginx config
├── /etc/systemd/system/         # brick.service
└── /etc/letsencrypt/            # SSL certs
```

---

## 7. Security Considerations

| Concern | Solution |
|---------|---------|
| API keys in code | Environment variables in systemd, .env for local dev |
| Public endpoints | WhatsApp/Telegram webhooks verified by signature/token |
| Ingest endpoint | Protected by API key in X-API-Key header |
| Dashboard access | Internal tool, no auth for v1 (add later if needed) |
| SQL injection | Supabase client handles parameterization |
| CORS | FastAPI CORS middleware, restrict to Vercel domain |
| SSH | Key-only auth, no password login |
| Firewall | ufw: allow 22, 80, 443 only |
