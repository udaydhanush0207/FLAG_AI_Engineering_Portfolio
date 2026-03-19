# Problem Statement — FLAG AI Intelligence Platform

## Date: March 2026
## Author: Uday Dhanush, AI Engineering Intern
## Company: Front Line Advisory Group (FLAG)

---

## The Problem

Front Line Advisory Group (FLAG) is a CIP bond program management consulting firm managing **$6.3B+ in capital improvement programs** across Texas and New York. FLAG's operations face several critical inefficiencies:

### 1. Knowledge Access is Slow and Manual
FLAG's institutional knowledge — spanning CIP programs, bond details, project controls methodologies, 200+ acronyms, team expertise, and 83+ published articles — lives in scattered documents, web pages, and people's heads. When a consultant needs to answer a question about Travis County's 2023 bond program details, they dig through files or ask a colleague. This costs **hours per week** across the team.

### 2. No AI-Powered Client Communication Channel
FLAG has no way for staff to quickly get answers about their own programs via modern channels. Staff are in the field, at county offices, in meetings — they need answers on WhatsApp or Telegram, not by opening a laptop and searching files.

### 3. Lead Generation is Manual
FLAG needs to identify and reach county officials responsible for CIP and MGO (Municipal General Obligation) programs to set meetings and grow business. Currently this is done by manually researching county websites, LinkedIn, and public records. There is no automated system to find, categorize, and organize these contacts.

### 4. No Unified Visibility Across AI Initiatives
As FLAG explores AI-powered tools (chatbot, dashboard analytics, automated reporting, lead generation), there's no single place to see what's running, what's working, and what needs attention. Each tool is siloed.

### 5. Reporting is Manual and Time-Consuming
Stakeholder reports, budget variance summaries, and project status updates are compiled manually by consultants. This takes 4-6 hours per week that could be spent on higher-value work.

---

## The Solution

Build a **unified AI Intelligence Platform** that solves all five problems with four integrated components:

| Component | Solves Problem | How |
|-----------|---------------|-----|
| **BRICK v2 Chatbot** | #1, #2 | Multi-model RAG chatbot on WhatsApp + Telegram + Web with voice. Accurate answers from FLAG's knowledge base with zero hallucination. |
| **Lead Generation Agent** | #3 | AI-powered research agent that finds county officials, categorizes them by CIP/MGO relevance, and organizes contacts for outreach. |
| **Unified Dashboard** | #4 | Real-time React dashboard showing all agent statuses, conversation logs, lead pipeline, and system health. |
| **CIP Intelligence Layer** | #5 | Natural language queries over project data + AI-generated stakeholder reports. |

---

## Success Criteria

1. BRICK v2 answers FLAG knowledge questions with **<5% hallucination rate** (down from ~30% in v1)
2. WhatsApp and Telegram channels are live and responding within **3 seconds**
3. Lead generation agent produces a categorized list of **50+ county contacts** for CIP/MGO outreach
4. Unified dashboard shows real-time status of all agents
5. At least **2 meetings set** with potential clients using the lead pipeline
6. Full system demo-ready within **7 days**

---

## Constraints

- **Budget**: $0 incremental (using student credits + free tiers + existing subscriptions)
- **Timeline**: 7 days to production demo
- **Team size**: 1 developer (Uday)
- **Hardware**: Lenovo Yoga Pro 9i (RTX 4060, 32GB RAM)
- **Server**: Single DigitalOcean droplet ($200 student credits)

---

## Stakeholders

| Stakeholder | Interest | What They Need to See |
|-------------|----------|----------------------|
| FLAG Leadership (Jessy, Roy) | Business value of AI | Working demo: "Ask BRICK about our Williamson County program" on WhatsApp |
| FLAG Consultants | Daily workflow improvement | Fast, accurate answers to CIP questions from their phone |
| Potential Clients (County Officials) | Seeing FLAG's tech capability | Professional outreach backed by AI research |
| Uday (Developer) | Full-time job offer | Portfolio of 4 working AI systems with real business impact |
