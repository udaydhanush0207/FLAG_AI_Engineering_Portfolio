# 🏛️ CIP Intelligence Assistant

<p align="center">
  <img src="https://img.shields.io/badge/Status-Planned-C9A84C?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Audience-County_Officials-690A0A?style=for-the-badge" alt="Audience">
  <img src="https://img.shields.io/badge/Revenue-Add--on_Product-062052?style=for-the-badge" alt="Revenue">
</p>

## What It Does

A county-facing AI assistant that gives elected officials, county staff, and the public instant answers about their bond program — project status, budget health, timeline, and taxpayer transparency — 24/7.

## The Business Case

FLAG's dashboard pricing includes tiers ($36K-$72K/year). This assistant is a **premium add-on** ($6K-$12K/year per county) that:
- Reduces FLAG's support burden (fewer ad-hoc data requests)
- Adds a differentiated feature competitors don't have
- Enables public transparency (county can share with taxpayers)
- Positions FLAG as the most innovative CIP consulting firm

## How County Officials Use It

Instead of waiting for the next status meeting or emailing FLAG:

```
Commissioner: "How much of the 2023 bond has been spent?"
CIP Assistant: "As of March 2026, $312M of $825M (37.8%) has 
been obligated across the Williamson County 2023 Road Bond. 
12 projects are in design, 2 are under construction (Toro 
Grande Blvd and CR 460), and 1 has been terminated (Bagdad 
Road). The next major milestone is the CR 258 bid opening 
on February 5, 2026."

Resident: "When will the Ronald Reagan extension be done?"
CIP Assistant: "The Ronald Reagan Boulevard project consists 
of 4 segments. Segment D1 is furthest along — the Final PS&E 
is expected February 20, 2026. Segments C1 and C2 are 
addressing final comments. Full construction timeline depends 
on ROW acquisition and utility coordination."
```

## Architecture

Same backend as BRICK, but with county-specific data:
- BRICK = FLAG's internal + general knowledge
- CIP Intelligence = specific county's project data + public-safe answers

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Backend | Same FastAPI as BRICK |
| Knowledge | County-specific ChromaDB collection |
| LLM | OpenAI GPT-4o with county-safe prompts |
| Frontend | Embeddable widget or standalone page |
| Access | Can be public (transparency) or staff-only |

## Project Structure

```
06_CIP_Intelligence_Assistant/
├── README.md
├── backend/
│   ├── county_assistant.py   ← County-specific query handler
│   ├── safety_filter.py      ← Ensures only public-safe answers
│   └── requirements.txt
├── openclaw/
│   └── skills/
│       └── cip-assistant/    ← OpenClaw skill config
└── demo/
    └── sample_queries.md     ← Example Q&A pairs
```

---

*Part of the [FLAG AI Engineering Portfolio](../README.md)*
