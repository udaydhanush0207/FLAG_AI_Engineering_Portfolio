# 📅 P6 Schedule Monitor

<p align="center">
  <img src="https://img.shields.io/badge/Status-Planned-C9A84C?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Tool-P6_Primavera-690A0A?style=for-the-badge" alt="Tool">
</p>

## What It Does

Parses P6 Primavera Professional schedule exports, compares current vs baseline, identifies slipping projects, and auto-generates Weekly Status Reports (WSR) for the CIP team.

## The Problem

FLAG's CIP team uses P6 Primavera Professional (local, not cloud) for project scheduling. Someone must manually export schedules, compare against baselines, identify delays, and write WSR reports. P6 has no API — data extraction requires manual exports.

## The Solution

An export-based automation pipeline:
1. CIP team exports P6 schedule (XER/XML/CSV) to a shared folder
2. Agent detects new file automatically
3. Parses schedule: activities, dates, durations, % complete
4. Compares against previous export — identifies slips
5. Generates WSR summary with Critical Path Events (CPE)
6. Sends to team via Telegram or email

## WSR Output Example

```
📊 WEEKLY STATUS REPORT — Week of March 10, 2026

SCHEDULE HEALTH SUMMARY:
  ✅ On Track: 18 projects
  ⚠️ At Risk: 3 projects  
  🔴 Behind: 2 projects

CRITICAL PATH EVENTS:
├─ Parmer Lane at SH 45
│   CPE: 90% TxDOT District Review
│   Status: Scheduled mid-March (on track)
│
├─ Ronald Reagan D1
│   CPE: Final PS&E submittal
│   Status: Expected 02/20/26 (on track)
│
└─ CR 138
    CPE: Joint bid utility relocations
    Status: ⚠️ Delayed — city coordination issues

MILESTONE CHANGES THIS WEEK:
  - SH 195: Kick-off moved to 02/17/26 ✅
  - CR 458: PS&E pushed to 02/20/26 (was 02/05)
```

## Tech Stack

| Component | Technology |
|-----------|-----------|
| Schedule Parsing | Python (XER/XML/CSV parser) |
| Comparison Engine | Custom diff algorithm |
| Report Generation | OpenAI GPT-4o |
| File Monitoring | Watchdog (Python) |
| Orchestration | OpenClaw skill |

## Project Structure

```
03_P6_Schedule_Monitor/
├── README.md
├── backend/
│   ├── schedule_parser.py    ← Parse XER/XML/CSV exports
│   ├── schedule_compare.py   ← Baseline vs current comparison
│   ├── wsr_generator.py      ← Auto-generate WSR reports
│   └── requirements.txt
├── openclaw/
│   └── skills/
│       └── p6-monitor/       ← OpenClaw skill config
└── demo/
    ├── sample_p6_export.csv  ← Sample schedule data
    └── sample_wsr.md         ← Example output
```

---

*Part of the [FLAG AI Engineering Portfolio](../README.md)*
