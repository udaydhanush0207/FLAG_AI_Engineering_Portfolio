# Product Requirements Document (PRD)
# FLAG AI Intelligence Platform

**Version**: 2.0  
**Date**: March 19, 2026  
**Author**: Uday Dhanush  
**Status**: Active Development  

---

## 1. Product Overview

The FLAG AI Intelligence Platform is a unified system of AI agents serving Front Line Advisory Group's consulting operations. It combines a RAG chatbot, lead generation agent, CIP intelligence layer, and management dashboard into one platform.

---

## 2. User Personas

### Persona 1: FLAG Consultant (Field User)
- **Name**: Allen (CIP Program Manager)
- **Context**: In the field at county offices, needs quick answers
- **Needs**: Text a question on WhatsApp, get accurate answer in seconds
- **Pain Point**: Currently digs through documents or calls colleagues

### Persona 2: FLAG Leadership
- **Name**: Jessy (President)
- **Context**: Needs high-level visibility into programs and AI tools
- **Needs**: Dashboard showing agent status, conversation volume, lead pipeline
- **Pain Point**: No visibility into what AI tools are doing

### Persona 3: Business Development
- **Name**: BD Team Member
- **Context**: Setting meetings with county officials for new business
- **Needs**: Categorized list of CIP/MGO contacts with research notes
- **Pain Point**: Manual research taking hours per contact

---

## 3. Features

### Feature 1: BRICK v2 RAG Chatbot

**Priority**: P0 (Must Have)  
**Description**: Multi-model RAG chatbot with accurate FLAG knowledge retrieval

#### Requirements:
| ID | Requirement | Acceptance Criteria |
|----|-------------|-------------------|
| BR-01 | Answer FLAG knowledge questions accurately | <5% hallucination rate on test set of 20 questions |
| BR-02 | Support WhatsApp channel | Send/receive messages via Twilio WhatsApp sandbox |
| BR-03 | Support Telegram channel | Send/receive messages via Telegram Bot API |
| BR-04 | Support web chat interface | Embedded in dashboard, functional chat UI |
| BR-05 | Support voice messages | Transcribe voice via Whisper, respond with text |
| BR-06 | Expand acronyms automatically | First use of any CIP acronym includes expansion |
| BR-07 | Include dollar amounts and project counts | Financial data cited when available in context |
| BR-08 | Route industry questions to web search | Perplexity handles "what's happening in CIP" type queries |
| BR-09 | Route document analysis to Gemini | Large PDFs processed via Gemini's 2M context |
| BR-10 | Respond within 5 seconds | 95th percentile response time under 5 seconds |

### Feature 2: Lead Generation Agent

**Priority**: P0 (Must Have)  
**Description**: AI agent that researches and categorizes county official contacts

#### Requirements:
| ID | Requirement | Acceptance Criteria |
|----|-------------|-------------------|
| LG-01 | Find county official contacts | Name, title, email, phone for CIP/MGO roles |
| LG-02 | Categorize leads by type | CIP (Capital Improvement), MGO (Municipal General Obligation) |
| LG-03 | Research context for each lead | County population, recent bond programs, budget info |
| LG-04 | Score leads by relevance | 1-10 score based on FLAG's target profile |
| LG-05 | Export to CSV/spreadsheet | Downloadable lead list for BD team |
| LG-06 | Cover Texas counties primarily | Focus on Texas with expansion capability |
| LG-07 | Display leads in dashboard | Searchable, filterable table in the UI |

### Feature 3: Unified Dashboard

**Priority**: P1 (Should Have)  
**Description**: React dashboard showing all agents, conversations, leads, and system health

#### Requirements:
| ID | Requirement | Acceptance Criteria |
|----|-------------|-------------------|
| UD-01 | Agent status overview | Show BRICK, Lead Gen, CIP Intelligence status (online/offline/processing) |
| UD-02 | Conversation log viewer | Recent conversations across all channels with timestamps |
| UD-03 | Lead pipeline view | Table of leads with filtering by category, score, status |
| UD-04 | Real-time updates | Dashboard updates without page refresh (WebSocket or polling) |
| UD-05 | Chat interface embedded | Can chat with BRICK directly from dashboard |
| UD-06 | System health metrics | API response times, error rates, token usage |
| UD-07 | Mobile responsive | Usable on tablet/phone for field demos |
| UD-08 | FLAG branded | Navy/Red/Gold color scheme, professional look |

### Feature 4: CIP Intelligence Layer

**Priority**: P2 (Nice to Have)  
**Description**: Natural language queries over project budget/schedule data

#### Requirements:
| ID | Requirement | Acceptance Criteria |
|----|-------------|-------------------|
| CI-01 | Query project data in natural language | "What's the budget for Williamson County Precinct 3?" |
| CI-02 | Generate stakeholder report summaries | AI-written status update from project data |
| CI-03 | Track budget variance | Flag projects over/under budget |

---

## 4. Technical Constraints

| Constraint | Detail |
|-----------|--------|
| Budget | $0 incremental (student credits + free tiers) |
| LLM Budget | ~$100 remaining on Claude enterprise for March |
| Server | Single DigitalOcean droplet |
| Timeline | 7 days to demo |
| Developer | 1 person (Uday) |

---

## 5. Out of Scope (For This Sprint)

- Gmail/Drive integration
- Procore invoice automation
- P6 schedule monitoring
- Automated email outreach (leads are for manual outreach)
- Multi-tenant support
- User authentication (internal tool only)

---

## 6. Timeline

| Day | Focus | Deliverable |
|-----|-------|-------------|
| Day 1 | Infrastructure + Backend skeleton | Server setup, Supabase schema, FastAPI routes |
| Day 2 | BRICK v2 core (RAG pipeline) | Working chat API with vector retrieval |
| Day 3 | Knowledge ingest + WhatsApp/Telegram | Channels live, knowledge base loaded |
| Day 4 | Lead generation agent | Working lead research + categorization |
| Day 5 | Unified dashboard (React) | Dashboard deployed to Vercel |
| Day 6 | Integration + testing | All components connected, end-to-end tests |
| Day 7 | Polish + demo prep | Bug fixes, demo script, portfolio README |

---

## 7. Risks

| Risk | Likelihood | Impact | Mitigation |
|------|-----------|--------|-----------|
| Claude API rate limits | Medium | High | Use Gemini as fallback, cache common queries |
| Twilio WhatsApp sandbox limitations | Low | Medium | Telegram as primary demo channel |
| 7-day timeline too aggressive | High | Critical | Prioritize P0 features only, skip P2 if needed |
| Token budget runs out | Medium | High | Use cost-reducer patterns, cache embeddings |
