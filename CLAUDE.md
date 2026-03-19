# CLAUDE.md — Master Instructions for FLAG AI Platform

> Claude Code: Read this file FIRST before doing anything. Then read docs/ and tasks/.

---

## Identity

You are building the **FLAG AI Intelligence Platform** — a unified system of AI agents for Front Line Advisory Group (FLAG), a CIP bond program management consulting firm.

- **Company**: Front Line Advisory Group (FLAG)
- **Website**: https://frontlineadvisorygroup.com
- **Industry**: Capital Improvement Program (CIP) bond management, municipal consulting
- **Location**: 4207 US-290 Suite 108, Dripping Springs, TX 78620
- **Developer**: Uday Dhanush — AI Engineering Intern (7 days left, must demo for full-time offer)

---

## Project Goal

Build a production-ready AI platform with:
1. **BRICK v2** — RAG chatbot (WhatsApp + Telegram + Web + Voice)
2. **CIP Intelligence Dashboard** — Real-time project data queries
3. **Lead Generation Agent** — County official contacts for CIP/MGO outreach
4. **Unified Dashboard** — Single UI to manage all agents, view status, real-time updates
5. **Portfolio showcase** — GitHub repo demonstrating all of the above

---

## Architecture Rules (NEVER VIOLATE)

### Infrastructure
- **Single server**: DigitalOcean Ubuntu 24.04 (student credits)
- **Frontend hosting**: Vercel (free tier) for the dashboard
- **Vector store**: Supabase pgvector (hosted, free tier)
- **NO** ChromaDB, NO OpenClaw, NO Hetzner, NO Doppler, NO Docker

### Backend
- Python 3.12 + FastAPI
- Async-first, type hints on everything
- Pydantic models for all schemas
- structlog for logging (JSON output, no print statements)
- Error handling on every endpoint

### Frontend  
- React 19 + TypeScript + Vite
- Bun for package management (NOT npm)
- Tailwind CSS + Animate UI for components
- SOLID principles for React components
- Deploy to Vercel

### Multi-Model LLM Strategy
| Model | Use Case | API |
|-------|----------|-----|
| Claude Sonnet 4 | Primary RAG, reasoning, report generation | Anthropic API |
| Gemini 2.0 Flash | Long document analysis (2M context) | Google AI API |
| Perplexity sonar-pro | Industry trends, web search, lead research | Perplexity API |

### Channels
- Web chat (React dashboard)
- WhatsApp (Twilio API)
- Telegram (python-telegram-bot)
- Voice (OpenAI Whisper STT)

---

## Workflow Orchestration

### 1. Plan First (MANDATORY)
- Enter plan mode for ANY non-trivial task (3+ steps or architectural decisions)
- Write plan to `tasks/todo.md` with checkable items
- If something goes sideways, STOP and re-plan immediately
- Write detailed specs upfront to reduce ambiguity

### 2. Subagent Strategy
- Use subagents to keep main context window clean
- Offload research, exploration, and parallel analysis to subagents
- One task per subagent for focused execution
- Complex problems = more compute via subagents

### 3. Self-Improvement Loop
- After ANY correction from user → update `tasks/lessons.md` with the pattern
- Write rules that prevent the same mistake
- Review lessons at session start for relevant project
- Ruthlessly iterate until mistake rate drops

### 4. Verification Before Done
- Never mark a task complete without PROVING it works
- Run tests, check logs, demonstrate correctness
- Ask yourself: "Would a staff engineer approve this?"
- Diff behavior between main and your changes when relevant

### 5. Demand Elegance (Balanced)
- For non-trivial changes: pause and ask "is there a more elegant way?"
- Skip this for simple, obvious fixes — don't over-engineer
- Challenge your own work before presenting it

### 6. Autonomous Bug Fixing
- When given a bug report: just fix it. Don't ask for hand-holding
- Point at logs, errors, failing tests — then resolve them
- Zero context switching required from user

---

## Task Management Protocol

1. **Plan First**: Write plan to `tasks/todo.md` with checkable items
2. **Verify Plan**: Check in before starting implementation
3. **Track Progress**: Mark items complete as you go
4. **Explain Changes**: High-level summary at each step
5. **Document Results**: Add review section to `tasks/todo.md`
6. **Capture Lessons**: Update `tasks/lessons.md` after corrections

---

## Code Standards

### Python (Backend)
```python
# Every function: type hints + docstring
async def search_knowledge(query: str, n: int = 15) -> list[dict]:
    """Search FLAG knowledge base using vector similarity."""
    ...

# Every schema: Pydantic
class ChatRequest(BaseModel):
    question: str
    history: list = []
    channel: str = "web"

# Every error: handled
@router.post("/api/ask")
async def ask(req: ChatRequest):
    try:
        ...
    except Exception as e:
        logger.error("chat_error", error=str(e))
        raise HTTPException(status_code=500, detail="Internal error")
```

### React (Frontend)
```typescript
// SOLID principles
// Single file components with clear responsibility
// Props interface for every component
// Custom hooks for shared logic
// No prop drilling — use context or state management

interface AgentCardProps {
  name: string;
  status: "online" | "offline" | "processing";
  lastActivity: Date;
}

export function AgentCard({ name, status, lastActivity }: AgentCardProps) {
  // ...
}
```

### Package Management
```bash
# ALWAYS use bun, never npm
bun install
bun add react
bun run dev
bun run build
```

---

## FLAG Brand Standards

### Colors
```css
--flag-navy: #062052;
--flag-red: #690A0A;
--flag-gold: #C9A227;
--flag-dark: #0A1628;
--flag-light: #F0F2F5;
```

### BRICK System Prompt
```
You are BRICK, FLAG's AI Intelligence Assistant.
FLAG = Front Line Advisory Group, a CIP bond program management consulting firm.

RULES:
1. Answer ONLY from provided context. If context lacks the answer, say so honestly.
2. Always expand acronyms on first use.
3. Include dollar amounts and project counts when available.
4. Cite sources by mentioning the document or page.
5. Be concise but complete. FLAG staff are busy professionals.
```

---

## Chunking Rules (Fixes Hallucination)

| Parameter | Value | Why |
|-----------|-------|-----|
| Chunk size | 1200 characters | Preserves paragraph context |
| Overlap | 200 characters | Prevents info loss at boundaries |
| Split on | Paragraph boundaries | Never mid-sentence |
| Results retrieved | 15 | More candidates = better answers |
| Similarity threshold | 0.7 | Filter weak matches |

---

## Environment Variables

| Variable | Source |
|----------|--------|
| `ANTHROPIC_API_KEY` | Anthropic enterprise account |
| `GOOGLE_API_KEY` | Google AI Studio (free) |
| `PERPLEXITY_API_KEY` | Perplexity Pro |
| `OPENAI_API_KEY` | OpenAI ($5 credits — embeddings + Whisper only) |
| `SUPABASE_URL` | Supabase project |
| `SUPABASE_SERVICE_KEY` | Supabase service role key |
| `TWILIO_ACCOUNT_SID` | Twilio console |
| `TWILIO_AUTH_TOKEN` | Twilio console |
| `TELEGRAM_BOT_TOKEN` | @BotFather |

---

## What NOT To Do

- ❌ ChromaDB (use Supabase pgvector)
- ❌ GPT-4o-mini as primary (use Claude Sonnet)
- ❌ Doppler for secrets (use .env + systemd)
- ❌ Hetzner (use DigitalOcean only)
- ❌ OpenClaw (removed)
- ❌ npm (use bun)
- ❌ 500-char chunks (use 1200)
- ❌ 8 retrieval results (use 15)
- ❌ Docker for this project
- ❌ Skip metadata on chunks
- ❌ print() statements (use structlog)

---

## File Structure

```
flag-ai-platform/
├── .claude/
│   └── settings.local.json
├── CLAUDE.md                          ← YOU ARE HERE
├── tasks/
│   ├── todo.md
│   └── lessons.md
├── docs/
│   ├── PROBLEM_STATEMENT.md
│   ├── PRD.md
│   ├── TRD.md
│   ├── ARCHITECTURE.md
│   └── PROJECT_SPEC.md
├── backend/
│   ├── main.py
│   ├── config.py
│   ├── routes/
│   │   ├── chat.py
│   │   ├── ingest.py
│   │   ├── health.py
│   │   ├── webhooks.py
│   │   └── leads.py
│   ├── services/
│   │   ├── llm_router.py
│   │   ├── claude_service.py
│   │   ├── gemini_service.py
│   │   ├── perplexity_service.py
│   │   ├── vector_store.py
│   │   ├── scraper.py
│   │   ├── chunker.py
│   │   ├── voice.py
│   │   └── lead_gen.py
│   ├── data/
│   └── requirements.txt
├── frontend/
│   ├── package.json
│   ├── src/
│   │   ├── App.tsx
│   │   ├── pages/
│   │   │   ├── Dashboard.tsx
│   │   │   ├── ChatPage.tsx
│   │   │   ├── LeadsPage.tsx
│   │   │   └── AgentsPage.tsx
│   │   ├── components/
│   │   └── hooks/
│   └── vite.config.ts
├── scripts/
│   ├── setup_server.sh
│   ├── deploy.sh
│   ├── scrape_flag.py
│   └── ingest_all.py
├── nginx/
│   └── brick.conf
├── systemd/
│   └── brick.service
└── .github/
    └── workflows/
        └── deploy.yml
```
