# 🏗️ BRICK — Building Real Infrastructure & Construction Knowledge

<p align="center">
  <img src="https://img.shields.io/badge/Status-In_Development-C9A84C?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/RAG-ChromaDB-690A0A?style=for-the-badge" alt="RAG">
  <img src="https://img.shields.io/badge/LLM-GPT--4o-062052?style=for-the-badge" alt="LLM">
</p>

## What is BRICK?

BRICK is an AI-powered knowledge assistant for **Front Line Advisory Group (FLAG)**. It answers questions about CIP bond programs, FLAG services, project status, 200+ industry acronyms, and FLAG's consulting methodology — all grounded in verified organizational data.

### Two Deployment Modes

1. **Standalone Website** — Full FLAG-branded site with embedded BRICK chatbot
2. **Embeddable Widget** — One `<script>` tag adds BRICK to any existing website

## Architecture

```
User asks question
    ↓
Frontend (HTML/CSS/JS)
    ↓ POST /api/ask
Backend (Python FastAPI)
    ↓
ChromaDB Vector Search → finds relevant knowledge chunks
    ↓
OpenAI GPT-4o → generates grounded answer
    ↓
Response returned to user
    
OpenClaw (background):
  - Scrapes FLAG website for fresh content
  - Auto-indexes new articles into ChromaDB
  - Provides Telegram interface for FLAG team
```

## Knowledge Sources

| Source | Content | How Ingested |
|--------|---------|-------------|
| FLAG Website | All articles, service pages, project pages | OpenClaw web scraper |
| CIP Bond Book | Full handbook (300+ pages) | PDF extraction |
| Acronyms Doc | 218 CIP/construction acronyms | DOCX parsing |
| WILCO Projects | 45 project statuses, ILA tracking | Manual + structured data |
| Meeting Notes | Cash flow meeting templates | DOCX parsing |
| Pricing Doc | Dashboard tier pricing | Manual ingestion |

## Sample Questions BRICK Can Answer

- "What programs does FLAG manage?" → Lists all 8 programs with dollar values
- "What is TWAPS?" → Two Weeks Ahead Program Schedule - Hyeon's status tracker
- "Status of Ronald Reagan Boulevard?" → C1, C2, D1, D2 segment details
- "What are the 7 deadly sins of CIP management?" → Full article summary
- "Dashboard pricing tiers?" → Core/Advanced/Enterprise with pricing
- "What is WP3 (90%)?" → Construction docs ready for bid, detailed scope

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend API | Python 3.12, FastAPI |
| Vector Database | ChromaDB |
| LLM | OpenAI GPT-4o |
| Web Scraper | OpenClaw browser automation |
| Frontend | HTML, CSS, JavaScript |
| Animations | CSS transforms (60fps GPU-accelerated) |
| Deployment | Docker, Nginx, Let's Encrypt |

## Project Structure

```
01_BRICK_Knowledge_Bot/
├── README.md              ← You are here
├── backend/
│   ├── main.py            ← FastAPI server with /api/ask endpoint
│   ├── ingest.py          ← Data ingestion script for ChromaDB
│   ├── scraper.py         ← FLAG website scraper
│   ├── requirements.txt   ← Python dependencies
│   └── Dockerfile         ← Container config
├── frontend/
│   ├── index.html         ← Standalone BRICK website
│   ├── widget.js          ← Embeddable chatbot widget
│   ├── styles.css         ← FLAG branding + animations
│   └── chat.js            ← Chat logic
├── openclaw/
│   ├── SOUL.md            ← BRICK personality for OpenClaw
│   └── skills/
│       └── scrape-flag/   ← Auto-scraper skill
├── data/                  ← Knowledge base source files
│   ├── acronyms.txt
│   ├── handbook_excerpts.txt
│   └── wilco_projects.txt
├── demo/                  ← Screenshots and demo materials
├── docker-compose.yml     ← Run everything locally
└── nginx.conf             ← Web server config
```

## Embedding on Any Website

```html
<!-- Add this ONE line before </body> on any website -->
<script src="https://your-server/widget.js"></script>
```

Customizable:
```html
<script 
  src="https://your-server/widget.js"
  data-color="#690A0A"
  data-position="bottom-right"
  data-greeting="Ask me about FLAG's CIP programs!"
></script>
```

## Setup

See [../docs/setup-guide.md](../docs/setup-guide.md) for full deployment instructions.

## Brand Colors

| Color | Hex | Usage |
|-------|-----|-------|
| Deep Blue | `#062052` | Headers, primary |
| Deep Red | `#690A0A` | Accents, CTA buttons |
| Gold | `#C9A84C` | Highlights, badges |
| Charcoal | `#272727` | Body text |
| Light Gray | `#f4f4f4` | Backgrounds |

---

*Part of the [FLAG AI Engineering Portfolio](../README.md)*
