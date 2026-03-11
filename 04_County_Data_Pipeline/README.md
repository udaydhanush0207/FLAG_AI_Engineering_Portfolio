# 🔄 County Data Pipeline

<p align="center">
  <img src="https://img.shields.io/badge/Status-Planned-C9A84C?style=for-the-badge" alt="Status">
  <img src="https://img.shields.io/badge/Output-Power_BI_Ready-690A0A?style=for-the-badge" alt="Output">
</p>

## What It Does

Automatically normalizes incoming county data into FLAG's standard format and writes it directly to Excel Online, making it immediately available for Power BI dashboard refresh. Eliminates hours of manual data formatting.

## The Problem

FLAG works with multiple counties, each sending data in different formats — different column names, different structures, inconsistent naming conventions. Vanessa (FLAG's dashboard developer) spends hours reformatting data before it can feed Power BI dashboards.

## The Solution

1. County sends raw data (email attachment or shared folder)
2. Agent picks up the file automatically
3. Normalizes to FLAG's standard column structure
4. Validates data: checks missing fields, duplicates, impossible values
5. Writes directly to Excel Online via Microsoft Graph API
6. Power BI auto-refreshes with new data
7. Sends summary: "Updated Williamson County — 47 projects, 3 flagged"

## Tech Stack

| Component | Technology |
|-----------|-----------|
| File Detection | Watchdog (Python) or email trigger |
| Data Normalization | Python + Pandas + OpenAI |
| Excel Integration | Microsoft Graph API |
| Power BI Refresh | Power BI REST API |
| Orchestration | OpenClaw skill |

## Project Structure

```
04_County_Data_Pipeline/
├── README.md
├── backend/
│   ├── normalizer.py           ← Data normalization engine
│   ├── powerbi_connector.py    ← Power BI refresh trigger
│   ├── graph_api.py            ← Microsoft Graph API wrapper
│   └── requirements.txt
├── openclaw/
│   └── skills/
│       └── data-normalize/     ← OpenClaw skill config
└── demo/
    ├── sample_county_data.xlsx ← Raw county data (synthetic)
    └── normalized_output.xlsx  ← Cleaned output
```

---

*Part of the [FLAG AI Engineering Portfolio](../README.md)*
