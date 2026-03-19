# Project Specification — FLAG AI Intelligence Platform

> This is the complete, authoritative specification. Claude Code: follow this exactly.

---

## What We Are Building

A unified AI platform for Front Line Advisory Group with 4 components:

1. **BRICK v2**: Multi-model RAG chatbot (WhatsApp + Telegram + Web + Voice)
2. **Lead Generation Agent**: County official contact finder for CIP/MGO outreach  
3. **Unified Dashboard**: React UI managing all agents with real-time updates
4. **CIP Intelligence Layer**: Natural language queries over project data

---

## Tech Stack (Final, Do Not Change)

### Backend
- **Language**: Python 3.12
- **Framework**: FastAPI (async)
- **Server**: uvicorn
- **Database**: Supabase (PostgreSQL + pgvector)
- **Embeddings**: OpenAI text-embedding-3-small (1536 dim)
- **Process Manager**: systemd
- **Reverse Proxy**: Nginx + Let's Encrypt

### Frontend
- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6+
- **Package Manager**: Bun (NOT npm)
- **Styling**: Tailwind CSS 4+
- **Animation**: Animate UI
- **Charts**: Recharts
- **State**: Zustand
- **Data Fetching**: TanStack Query
- **Routing**: React Router 7+
- **Icons**: Lucide React
- **Hosting**: Vercel (free tier)

### AI Models
| Model | API | Use |
|-------|-----|-----|
| claude-sonnet-4-20250514 | Anthropic | Primary RAG, reasoning |
| gemini-2.0-flash | Google AI | Long documents (2M ctx) |
| sonar-pro | Perplexity | Web search, lead research |
| text-embedding-3-small | OpenAI | Vector embeddings |
| whisper-1 | OpenAI | Speech-to-text |

### Infrastructure
| Component | Service |
|-----------|---------|
| Backend Server | DigitalOcean droplet (Ubuntu 24.04, 2GB/2vCPU) |
| Database + Vector Store | Supabase (free tier) |
| Frontend Hosting | Vercel (free tier) |
| CI/CD | GitHub Actions |
| SSL | Let's Encrypt |

---

## Build Order (Follow This Exactly)

### Phase 1: Foundation (Day 1)

#### Task 1.1: Initialize Project Structure
```bash
# On local machine
mkdir flag-ai-platform && cd flag-ai-platform
git init
mkdir -p backend/{routes,services,data} frontend scripts nginx systemd docs tasks .claude .github/workflows

# Create Python virtual environment
python3 -m venv backend/venv
source backend/venv/bin/activate  # or venv\Scripts\activate on Windows
pip install fastapi uvicorn anthropic google-generativeai openai supabase httpx python-telegram-bot twilio beautifulsoup4 pydantic structlog python-multipart python-dotenv
pip freeze > backend/requirements.txt
```

#### Task 1.2: Set Up Supabase
1. Go to supabase.com → New Project → Name: flag-ai-platform → Region: us-east-1
2. Run this SQL in SQL Editor:

```sql
-- Enable pgvector
CREATE EXTENSION IF NOT EXISTS vector;

-- Knowledge chunks
CREATE TABLE knowledge_chunks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  content TEXT NOT NULL,
  embedding VECTOR(1536),
  metadata JSONB DEFAULT '{}',
  source TEXT,
  topic TEXT,
  chunk_index INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX ON knowledge_chunks
  USING hnsw (embedding vector_cosine_ops)
  WITH (m = 16, ef_construction = 64);

-- Search function
CREATE OR REPLACE FUNCTION match_chunks(
  query_embedding VECTOR(1536),
  match_count INT DEFAULT 15,
  filter_topic TEXT DEFAULT NULL
) RETURNS TABLE (
  id UUID, content TEXT, metadata JSONB,
  source TEXT, topic TEXT, similarity FLOAT
) LANGUAGE plpgsql AS $$
BEGIN
  RETURN QUERY
  SELECT kc.id, kc.content, kc.metadata,
    kc.source, kc.topic,
    1 - (kc.embedding <=> query_embedding) AS similarity
  FROM knowledge_chunks kc
  WHERE (filter_topic IS NULL OR kc.topic = filter_topic)
  ORDER BY kc.embedding <=> query_embedding
  LIMIT match_count;
END; $$;

-- Conversations
CREATE TABLE conversations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  channel TEXT NOT NULL,
  user_id TEXT NOT NULL,
  question TEXT,
  answer TEXT,
  query_type TEXT,
  model_used TEXT,
  sources JSONB DEFAULT '[]',
  response_time_ms INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Leads
CREATE TABLE leads (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  title TEXT,
  email TEXT,
  phone TEXT,
  county TEXT NOT NULL,
  state TEXT DEFAULT 'TX',
  category TEXT,
  score INTEGER DEFAULT 0,
  research_notes TEXT,
  bond_programs JSONB,
  status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent status
CREATE TABLE agent_status (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT DEFAULT 'offline',
  last_activity TIMESTAMPTZ,
  total_queries INTEGER DEFAULT 0,
  error_count INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Insert default agents
INSERT INTO agent_status (id, name, status) VALUES
  ('brick', 'BRICK v2 Chatbot', 'offline'),
  ('lead_gen', 'Lead Generation Agent', 'offline'),
  ('cip_intel', 'CIP Intelligence Layer', 'offline');
```

#### Task 1.3: Create Backend Config
File: `backend/config.py`
```python
import os
from dataclasses import dataclass
from dotenv import load_dotenv

load_dotenv()

@dataclass
class Config:
    ANTHROPIC_API_KEY: str = os.getenv("ANTHROPIC_API_KEY", "")
    GOOGLE_API_KEY: str = os.getenv("GOOGLE_API_KEY", "")
    PERPLEXITY_API_KEY: str = os.getenv("PERPLEXITY_API_KEY", "")
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    SUPABASE_URL: str = os.getenv("SUPABASE_URL", "")
    SUPABASE_KEY: str = os.getenv("SUPABASE_SERVICE_KEY", "")
    TWILIO_ACCOUNT_SID: str = os.getenv("TWILIO_ACCOUNT_SID", "")
    TWILIO_AUTH_TOKEN: str = os.getenv("TWILIO_AUTH_TOKEN", "")
    TWILIO_WHATSAPP_NUMBER: str = os.getenv("TWILIO_WHATSAPP_NUMBER", "")
    TELEGRAM_BOT_TOKEN: str = os.getenv("TELEGRAM_BOT_TOKEN", "")
    INGEST_API_KEY: str = os.getenv("INGEST_API_KEY", "flag-ingest-2026")
    CLAUDE_MODEL: str = "claude-sonnet-4-20250514"
    GEMINI_MODEL: str = "gemini-2.0-flash"
    PERPLEXITY_MODEL: str = "sonar-pro"
    EMBEDDING_MODEL: str = "text-embedding-3-small"

config = Config()
```

#### Task 1.4: Create FastAPI Main App
File: `backend/main.py`
```python
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import structlog

structlog.configure(processors=[structlog.dev.ConsoleRenderer()])
logger = structlog.get_logger()

app = FastAPI(title="FLAG AI Platform", version="2.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Restrict to Vercel domain in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Import and include routers
from routes.health import router as health_router
from routes.chat import router as chat_router
from routes.ingest import router as ingest_router
from routes.leads import router as leads_router
from routes.webhooks import router as webhooks_router

app.include_router(health_router)
app.include_router(chat_router)
app.include_router(ingest_router)
app.include_router(leads_router)
app.include_router(webhooks_router)

@app.on_event("startup")
async def startup():
    logger.info("flag_ai_platform_started", version="2.0")
```

### Phase 2: BRICK v2 Core (Day 2)
- Implement services/vector_store.py (Supabase pgvector operations)
- Implement services/chunker.py (1200 char chunks, 200 overlap)
- Implement services/llm_router.py (query classification)
- Implement services/claude_service.py (BRICK persona)
- Implement services/perplexity_service.py (web search)
- Implement services/gemini_service.py (long docs)
- Implement routes/chat.py (POST /api/ask)
- Test: send 20 FLAG questions, verify <5% hallucination

### Phase 3: Knowledge Ingest (Day 3)
- Implement services/scraper.py (FLAG website scraper)
- Implement routes/ingest.py (POST /api/ingest)
- Create scripts/scrape_flag.py (one-time full scrape)
- Create scripts/ingest_all.py (load everything into Supabase)
- Process: website pages, Bond Book PDF, acronyms, team profiles
- Implement routes/webhooks.py (WhatsApp + Telegram)
- Implement services/voice.py (Whisper STT)
- Test: send WhatsApp message, get accurate response

### Phase 4: Lead Generation (Day 4)
- Implement services/lead_gen.py (Perplexity research + Claude categorization)
- Implement routes/leads.py (CRUD + generate + export)
- Generate initial batch of 50+ Texas county contacts
- Categorize: CIP vs MGO
- Score: 1-10 based on FLAG's target profile
- Test: verify lead quality and categorization

### Phase 5: Unified Dashboard (Day 5)
- Initialize React frontend with Vite + Bun
- Install: Tailwind, Animate UI, Recharts, TanStack Query, Zustand, React Router, Lucide
- Build pages: Dashboard, Chat, Leads, Agents
- Connect to backend API
- WebSocket for real-time updates
- FLAG branded (Navy #062052, Red #690A0A, Gold #C9A227)
- Deploy to Vercel

### Phase 6: Integration + Testing (Day 6)
- End-to-end testing all channels
- Error handling for all edge cases
- Response time optimization
- Voice message testing on WhatsApp + Telegram
- Dashboard real-time update verification
- Lead export verification

### Phase 7: Polish + Demo (Day 7)
- Update GitHub portfolio repo
- Write comprehensive README with screenshots
- Create demo script
- Bug fixes
- Deploy final version

---

## .env Template

```env
# AI APIs
ANTHROPIC_API_KEY=sk-ant-...
GOOGLE_API_KEY=AI...
PERPLEXITY_API_KEY=pplx-...
OPENAI_API_KEY=sk-...

# Supabase
SUPABASE_URL=https://xxx.supabase.co
SUPABASE_SERVICE_KEY=eyJ...

# Messaging
TWILIO_ACCOUNT_SID=AC...
TWILIO_AUTH_TOKEN=...
TWILIO_WHATSAPP_NUMBER=whatsapp:+14155238886
TELEGRAM_BOT_TOKEN=...

# Security
INGEST_API_KEY=flag-ingest-2026
```

---

## Deployment Commands

```bash
# Server setup (fresh Ubuntu 24.04)
apt update && apt upgrade -y
apt install -y python3 python3-pip python3-venv nginx certbot python3-certbot-nginx git ufw
ufw allow OpenSSH && ufw allow 'Nginx Full' && ufw --force enable

# Clone and setup
cd /opt && git clone https://github.com/udaydhanush0207/FLAG_AI_Engineering_Portfolio.git flag-ai-platform
cd flag-ai-platform
python3 -m venv venv && source venv/bin/activate
pip install -r backend/requirements.txt

# Systemd service
cp systemd/brick.service /etc/systemd/system/
# EDIT brick.service to add Environment= lines with your API keys
systemctl daemon-reload && systemctl enable brick && systemctl start brick

# Nginx
cp nginx/brick.conf /etc/nginx/sites-available/brick
ln -sf /etc/nginx/sites-available/brick /etc/nginx/sites-enabled/
rm -f /etc/nginx/sites-enabled/default
nginx -t && systemctl restart nginx

# SSL
certbot --nginx -d brick.flag-ai.com --non-interactive --agree-tos -m uday@email.com
```

---

## Quality Gates

Before marking ANY phase complete:

1. **Does it run?** Start the service, hit the endpoint, get a response
2. **Does it work correctly?** Test with 5+ real queries
3. **Does it handle errors?** Send bad input, verify graceful handling
4. **Is it logged?** Check structlog output for the operation
5. **Is it in todo.md?** Mark the task as complete

---

## KEY REMINDER

**You have 7 days. Ship working software, not perfect software.**

- P0 features (BRICK + Leads + Dashboard) = MUST ship
- P2 features (CIP Intelligence) = ONLY if time permits
- Every day ends with something deployable
- Demo > Documentation
- Working > Pretty
