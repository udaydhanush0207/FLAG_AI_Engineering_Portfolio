# 📧 Procore Invoice Agent

<p align="center">
  <img src="https://img.shields.io/badge/Status-Planned-C9A84C?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Integration-Gmail_+_Procore-690A0A?style=for-the-badge" alt="Integration">
</p>

## What It Does

Automatically processes incoming Procore invoice emails for FLAG's CIP team. The agent classifies invoices by county and project, extracts key financial data, flags budget concerns, and generates daily digest summaries.

## The Problem

FLAG's CIP team receives 100+ Procore invoice emails daily from multiple counties. Each email must be manually opened, reviewed, classified into the correct project folder, and checked against project budgets. This takes 1-2 hours daily.

## The Solution

An AI agent that:
1. **Monitors Gmail** for incoming Procore notification emails
2. **Extracts** invoice details: vendor, project, amount, line items, dates
3. **Classifies** by county and project automatically
4. **Cross-references** against project budgets — flags if over 90% consumed
5. **Generates daily digest** sent to the CIP team via Telegram/email

## Daily Output Example

```
📧 DAILY INVOICE DIGEST — March 10, 2026

WILLIAMSON COUNTY (3 invoices, $147,200 total)
├─ FM 1431 Bridge — $89,000 — ABC Construction
│   → 78% of budget consumed ✅
├─ Oak Creek Drainage — $45,200 — XYZ Civil
│   → ⚠️ 94% of budget consumed. Review recommended.
└─ Park Pavilion — $13,000 — Smith Builders
    → Within budget ✅

ACTION NEEDED: Oak Creek Drainage approaching budget limit.
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Email Integration | Gmail API via Python |
| Invoice Parsing | OpenAI GPT-4o (structured extraction) |
| Budget Tracking | SQLite database |
| Orchestration | OpenClaw skill |
| Notifications | Telegram via OpenClaw |

## Project Structure

```
02_Procore_Invoice_Agent/
├── README.md
├── backend/
│   ├── invoice_classifier.py    ← Main processing logic
│   ├── gmail_connector.py       ← Gmail API integration
│   ├── budget_tracker.py        ← Budget cross-reference
│   └── requirements.txt
├── openclaw/
│   └── skills/
│       └── procore-invoices/    ← OpenClaw skill config
└── demo/
    └── sample_invoices/         ← Sample Procore emails for testing
```

---

*Part of the [FLAG AI Engineering Portfolio](../README.md)*
