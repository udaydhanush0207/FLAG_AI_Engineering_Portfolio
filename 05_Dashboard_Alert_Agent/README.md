# 🚨 Dashboard Alert Agent

<p align="center">
  <img src="https://img.shields.io/badge/Status-Planned-C9A84C?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Type-Proactive_Monitoring-690A0A?style=for-the-badge" alt="Type">
</p>

## What It Does

Proactively monitors project budgets and schedules, and sends alerts when thresholds are exceeded — before anyone has to manually check dashboards.

## The Problem

Power BI dashboards show data, but nobody watches them 24/7. Budget overruns, schedule slips, and data quality issues only get noticed when someone manually reviews — often too late.

## The Solution

A scheduled agent that runs daily:
1. Queries project tracker data
2. Checks against configurable rules
3. Sends alerts via Telegram/email when thresholds are hit

## Alert Rules

| Rule | Trigger | Priority |
|------|---------|----------|
| Budget > 90% consumed | Spend approaching limit | 🔴 High |
| Schedule variance > 10% | Project slipping | 🟡 Medium |
| No status update in 30 days | Stale data | 🟡 Medium |
| Change order > $50K | Large scope change | 🔴 High |
| Missing required fields | Data quality issue | 🟢 Low |

## Alert Example

```
🚨 DAILY ALERT — March 10, 2026

HIGH PRIORITY:
  🔴 Oak Creek Drainage — Budget at 94% ($2.1M of $2.23M)
     Action: Schedule budget review with county
  
  🔴 CR 138 — Change order $67K submitted
     Action: Review and approve/reject

MEDIUM:
  🟡 Wyoming Springs — No status update since Feb 8
     Action: Follow up with Project Coordinator
  
  🟡 Bagdad Road — Schedule shows 15% variance
     Action: Request recovery schedule

All other projects: ✅ Within thresholds
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Data Source | Project tracker (Excel/SharePoint) |
| Rules Engine | Python (configurable YAML rules) |
| Scheduling | Cron via OpenClaw heartbeat |
| Notifications | Telegram + Email |
| Orchestration | OpenClaw skill |

## Project Structure

```
05_Dashboard_Alert_Agent/
├── README.md
├── backend/
│   ├── alert_rules.py       ← Configurable rule engine
│   ├── budget_monitor.py    ← Budget threshold checks
│   ├── schedule_monitor.py  ← Schedule variance checks
│   ├── rules.yaml           ← Alert thresholds config
│   └── requirements.txt
├── openclaw/
│   └── skills/
│       └── dashboard-alerts/ ← OpenClaw skill config
└── demo/
    └── sample_alert.md       ← Example alert output
```

---

*Part of the [FLAG AI Engineering Portfolio](../README.md)*
