<p align="center">
  <img src="https://frontlineadvisorygroup.com/wp-content/uploads/2024/03/FLAG-Full-Logo-Gray.png" alt="FLAG Logo" width="300">
</p>

<h1 align="center">FLAG AI Engineering Portfolio</h1>
<h3 align="center">Applied AI Solutions for Capital Improvement Programs</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Portfolio-$6.5B+_Managed-690A0A?style=for-the-badge" alt="Portfolio">
  <img src="https://img.shields.io/badge/Projects-6_AI_Tools-062052?style=for-the-badge" alt="Projects">
  <img src="https://img.shields.io/badge/Status-In_Development-C9A84C?style=for-the-badge" alt="Status">
</p>

<p align="center">
  <b>Built by <a href="https://www.linkedin.com/in/venkatsatyaudaydhanushkarri/">Uday Dhanush Karri</a></b> | MS Data Analytics & Information Systems, Texas State University<br>
  Graduate Intern at <a href="https://frontlineadvisorygroup.com">Front Line Advisory Group (FLAG)</a>
</p>

---

## 🏗️ About This Repository

Six AI-powered tools built for **Front Line Advisory Group (FLAG)**, a capital improvement consulting firm managing **$6.5B+ in public infrastructure programs** across Texas and New York.

FLAG helps cities, counties, and public agencies deliver bond-funded infrastructure projects (roads, bridges, drainage, parks) on time, on budget, and with full transparency to taxpayers.

**FLAG's Active Programs:**
| Program | Value | Projects |
|---------|-------|----------|
| NY Reconstruction Program | $4.2B | 11,000+ |
| NY Storm Recovery | $284M | 3,000+ |
| Travis County CIP 2017 | $307M | 60 |
| Travis County CIP 2023 | $509M | 17 |
| Williamson County CIP 2023 | $825M | 45 |
| City of Kyle CIP 2022 | $294M | 10 |

---

## 📦 Projects

| # | Project | What It Does | Tech | Status |
|---|---------|-------------|------|--------|
| 1 | [**BRICK**](./01_BRICK_Knowledge_Bot) | RAG-powered knowledge bot that answers questions about FLAG's CIP programs, bond management, 200+ acronyms, and project status | FastAPI, ChromaDB, OpenAI, OpenClaw | 🔨 Building |
| 2 | [**Procore Invoice Agent**](./02_Procore_Invoice_Agent) | Auto-classifies incoming Procore invoices, extracts data, flags budget concerns | FastAPI, Gmail API, OpenAI, OpenClaw | 📋 Planned |
| 3 | [**P6 Schedule Monitor**](./03_P6_Schedule_Monitor) | Parses P6 Primavera exports, generates Weekly Status Reports, flags schedule slips | Python, P6 Parser, OpenAI, OpenClaw | 📋 Planned |
| 4 | [**County Data Pipeline**](./04_County_Data_Pipeline) | Auto-normalizes county data into FLAG's standard format for Power BI dashboards | Python, MS Graph API, OpenClaw | 📋 Planned |
| 5 | [**Dashboard Alert Agent**](./05_Dashboard_Alert_Agent) | Monitors project budgets and schedules, sends proactive alerts when thresholds are exceeded | Python, Power BI API, OpenClaw | 📋 Planned |
| 6 | [**CIP Intelligence Assistant**](./06_CIP_Intelligence_Assistant) | County-facing AI assistant for bond program transparency — instant answers about project status | FastAPI, ChromaDB, OpenAI | 📋 Planned |

---

## 🏛️ Architecture

All six projects share **one server** and **one OpenClaw instance**. Each project is an OpenClaw "skill" that can be triggered via Telegram, web interface, or scheduled automation.

```
┌─────────────────────────────────────────────┐
│              VPS ($4-6/month)                │
│                                              │
│  ┌────────────────────────────────────────┐  │
│  │            OPENCLAW GATEWAY            │  │
│  │     (routes to project skills)         │  │
│  └──────────────┬─────────────────────────┘  │
│     ┌───────────┼───────────────┐            │
│     v           v               v            │
│  ┌──────┐  ┌────────┐  ┌──────────┐        │
│  │BRICK │  │Procore │  │P6 Monitor│        │
│  │Bot   │  │Agent   │  │Agent     │        │
│  └──────┘  └────────┘  └──────────┘        │
│     ┌───────────┼───────────────┐            │
│     v           v               v            │
│  ┌──────┐  ┌────────┐  ┌──────────┐        │
│  │County│  │Dashboard│  │CIP Intel │        │
│  │Data  │  │Alerts  │  │Assistant │        │
│  └──────┘  └────────┘  └──────────┘        │
│                                              │
│  ┌──────────────────────────────────────┐   │
│  │  ChromaDB | FastAPI | Nginx | Docker  │   │
│  └──────────────────────────────────────┘   │
└──────────────────────────────────────────────┘
```

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|-------|-----------|---------|
| **AI/LLM** | OpenAI GPT-4o | Natural language generation |
| **RAG** | ChromaDB | Vector database for knowledge retrieval |
| **Backend** | Python, FastAPI | API server |
| **Agent** | OpenClaw | Orchestration, web scraping, Telegram bot |
| **Frontend** | HTML, CSS, JavaScript | BRICK chat interface + FLAG website |
| **Infra** | Docker, Nginx, Let's Encrypt | Containerization, web server, SSL |
| **Hosting** | Hetzner CX22 (or Hostinger/DigitalOcean) | $4-6/month VPS |
| **Tools** | Procore, P6 Primavera, Power BI, MGO | FLAG's operational tools |

---

## 💰 Cost

| Item | Monthly Cost |
|------|-------------|
| VPS Hosting | $4-6 |
| OpenAI API | $2-5 |
| Everything else | $0 (open source) |
| **Total** | **$6-11/month** |

---

## 🚀 Quick Start

```bash
# Clone the repo
git clone https://github.com/udaydhanush0207/FLAG_AI_Engineering_Portfolio.git
cd FLAG_AI_Engineering_Portfolio

# Set up your VPS (see docs/setup-guide.md)
# Then run:
cd infrastructure
cp .env.example .env
# Edit .env with your API keys
docker compose up -d
```

See [docs/setup-guide.md](./docs/setup-guide.md) for detailed instructions.

---

## 📄 Documentation

- [Setup Guide](./docs/setup-guide.md) — Full deployment instructions
- [Hetzner Setup](./docs/hetzner-setup.md) — Hetzner-specific steps
- [Hostinger Setup](./docs/hostinger-setup.md) — Hostinger-specific steps
- [DigitalOcean Setup](./docs/digitalocean-setup.md) — DigitalOcean-specific steps

---

## 👨‍💻 About the Author

**Uday Karri** (Venkat Satya Uday Dhanush Karri)
- MS Data Analytics & Information Systems — Texas State University (May 2026)
- Graduate Intern at Front Line Advisory Group (FLAG)
- Focus: AI Engineering, Agentic AI, LLM Systems, RAG Pipelines

[![LinkedIn](https://img.shields.io/badge/LinkedIn-Connect-062052?style=flat-square&logo=linkedin)](https://www.linkedin.com/in/uday-karri/)
[![GitHub](https://img.shields.io/badge/GitHub-Follow-272727?style=flat-square&logo=github)](https://github.com/udaydhanush0207)

---

## ⚖️ Disclaimer

This repository contains demonstration code and sample data for portfolio purposes. All sensitive client data has been anonymized or replaced with synthetic data. FLAG's proprietary information, client data, and internal processes are not included in this repository.

---

<p align="center">
  <b>🏗️ Building Real Infrastructure & Construction Knowledge</b><br>
  <sub>Front Line Advisory Group | frontlineadvisorygroup.com</sub>
</p>
