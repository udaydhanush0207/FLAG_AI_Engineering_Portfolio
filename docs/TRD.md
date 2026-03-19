# Tool Requirements Document (TRD)
# FLAG AI Intelligence Platform

**Version**: 2.0  
**Date**: March 19, 2026  
**Author**: Uday Dhanush  

---

## 1. Development Tools

| Tool | Version | Purpose | License/Cost |
|------|---------|---------|-------------|
| Claude Code | Latest | AI-assisted development (primary dev tool) | Enterprise plan |
| VS Code | Latest | IDE | Free |
| Git | Latest | Version control | Free |
| Bun | 1.1+ | Package manager + JS runtime | Free |
| Python | 3.12 | Backend runtime | Free |
| Node.js | 20 LTS | Build tooling | Free |

---

## 2. Cloud Infrastructure

| Service | Tier | Purpose | Cost |
|---------|------|---------|------|
| DigitalOcean | $18/mo droplet | Backend server (Ubuntu 24.04, 2GB/2vCPU) | $200 student credits |
| Supabase | Free tier | PostgreSQL + pgvector (500MB) | Free |
| Vercel | Free tier | Frontend hosting (React dashboard) | Free |
| GitHub | Student Pack | Repository, Actions CI/CD | Free |
| Let's Encrypt | Free | SSL certificates | Free |

---

## 3. AI/ML APIs

| Service | Model | Purpose | Cost |
|---------|-------|---------|------|
| Anthropic API | claude-sonnet-4-20250514 | Primary RAG, reasoning, reports | Enterprise (~$100 remaining) |
| Google AI | gemini-2.0-flash | Long document analysis (2M context) | Free tier |
| Perplexity API | sonar-pro | Web search, industry trends, lead research | Pro subscription |
| OpenAI API | text-embedding-3-small | Vector embeddings (1536 dim) | ~$5 credits (sufficient) |
| OpenAI API | whisper-1 | Speech-to-text for voice messages | Included in $5 credits |

---

## 4. Backend Framework & Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| FastAPI | 0.115+ | Web framework |
| uvicorn | 0.30+ | ASGI server |
| anthropic | 0.40+ | Claude API client |
| google-generativeai | 0.8+ | Gemini API client |
| openai | 1.50+ | Embeddings + Whisper |
| supabase | 2.0+ | Supabase Python client |
| httpx | 0.27+ | Async HTTP client |
| python-telegram-bot | 21.0+ | Telegram bot framework |
| twilio | 9.0+ | WhatsApp via Twilio |
| beautifulsoup4 | 4.12+ | Web scraping |
| pydantic | 2.0+ | Data validation |
| structlog | 24.0+ | Structured logging |
| python-multipart | 0.0.9+ | File upload handling |
| python-dotenv | 1.0+ | Environment variable loading |

---

## 5. Frontend Framework & Libraries

| Library | Version | Purpose |
|---------|---------|---------|
| React | 19 | UI framework |
| TypeScript | 5.5+ | Type safety |
| Vite | 6+ | Build tool |
| Tailwind CSS | 4+ | Utility-first styling |
| Animate UI | Latest | Animation components |
| Lucide React | Latest | Icons |
| Recharts | 2.0+ | Dashboard charts |
| TanStack Query | 5+ | Data fetching + caching |
| React Router | 7+ | Client-side routing |
| Zustand | 5+ | Lightweight state management |

---

## 6. DevOps & Deployment

| Tool | Purpose |
|------|---------|
| Nginx | Reverse proxy (port 80/443 → uvicorn 8000) |
| systemd | Process manager for backend service |
| certbot | SSL certificate management |
| GitHub Actions | CI/CD pipeline (deploy on push to main) |
| ufw | Firewall (allow 22, 80, 443 only) |

---

## 7. Messaging & Communication

| Service | Purpose | Setup |
|---------|---------|-------|
| Twilio | WhatsApp Business API | Sandbox for testing, production requires approval |
| Telegram Bot API | Telegram channel | Create bot via @BotFather |
| WebSocket | Real-time dashboard updates | FastAPI WebSocket endpoint |

---

## 8. Data & Storage

| Component | Technology | Details |
|-----------|-----------|---------|
| Vector store | Supabase pgvector | HNSW index, 1536 dimensions, cosine similarity |
| Embeddings | OpenAI text-embedding-3-small | 1536 dimensions, ~$0.02 per million tokens |
| Knowledge base | Supabase table (knowledge_chunks) | UUID pk, content, embedding, metadata JSONB, source, topic |
| Conversations | Supabase table (conversations) | Channel, user_id, messages JSONB, timestamps |
| Leads | Supabase table (leads) | Name, title, email, county, category, score, research notes |

---

## 9. Monitoring (Post-Launch)

| Tool | Purpose | Available Via |
|------|---------|--------------|
| Datadog | APM + logs | GitHub Student Pack (free) |
| Honeybadger | Error tracking | GitHub Student Pack (free) |
| systemd journal | Service logs | `journalctl -u brick.service -f` |
| Supabase dashboard | Database monitoring | Built-in |
| Vercel analytics | Frontend performance | Free tier |

---

## 10. Student Developer Pack Services (Available)

| Service | Relevance | Use |
|---------|-----------|-----|
| DigitalOcean | Critical | Server hosting ($200 credits) |
| GitHub Copilot | Nice to have | Code completion in VS Code |
| MongoDB Atlas | Not needed | Using Supabase instead |
| Azure | Not needed | Using DigitalOcean instead |
| Datadog | Post-launch | Monitoring |
| Bootstrap Studio | Not needed | Using Tailwind + Animate UI |
| Polypane | Nice to have | Cross-browser testing |
| GitLens | Nice to have | Git history in VS Code |
