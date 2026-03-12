<p align="center">
  <img src="https://frontlineadvisorygroup.com/wp-content/uploads/2024/03/FLAG-Full-Logo-Gray.png" alt="FLAG Logo" width="300">
</p>

<h1 align="center">07 — Lead Gen & Verified Email Agent</h1>
<h3 align="center">Automated BD Prospecting for Capital Improvement Programs</h3>

<p align="center">
  <img src="https://img.shields.io/badge/Project-Lead_Gen_Agent-690A0A?style=for-the-badge">
  <img src="https://img.shields.io/badge/Status-In_Development-C9A84C?style=for-the-badge">
  <img src="https://img.shields.io/badge/Cost-~%240--6%2Fmonth-062052?style=for-the-badge">
</p>

<p align="center">
  <b>Built by <a href="https://www.linkedin.com/in/venkatsatyaudaydhanushkarri/">Uday Dhanush Karri</a></b> | MS Data Analytics & Information Systems, Texas State University<br>
  Graduate Intern at <a href="https://frontlineadvisorygroup.com">Front Line Advisory Group (FLAG)</a>
</p>

---

## 🎯 What It Does

Automates FLAG's business development pipeline by scraping publicly available contact data from **county government websites**, **Texas SmartBuy procurement portals**, and **public directories** — then verifying every email before it enters the CRM.

FLAG's BD team spends time **pitching, not prospecting.**

---

## 💼 Value to FLAG

| 🔴 Pain Point | ✅ What This Solves |
|---|---|
| BD team manually researches county contacts for hours | Auto-discovers decision-makers (CFOs, Capital PMs, Directors) by county in minutes |
| Unverified emails bounce and waste outreach budget | SMTP + API verification before any contact enters the CRM |
| No systematic, repeatable lead pipeline | Outputs clean CSV ready for LinkedIn campaign or email sequence |
| Roy's priority: *"cracking the code on confirming contacts and leads in the database"* | **This is exactly that system** |
| FLAG serves 6+ active programs across TX and NY | Scales to any new target county or state in minutes |

---

## ⚙️ How It Works
```
Input: Target county name or TX procurement portal URL
              ↓
🔍 Scraper: Pulls Name, Title, Department, Email (public sources only)
              ↓
✅ Verifier: SMTP handshake + deliverability check (no emails sent)
              ↓
📊 Output: Clean CSV → CRM / LinkedIn Campaign / BD Outreach
              ↓
🤖 OpenClaw: Daily scheduled run + Telegram alert to BD team
```

---

## 📊 Output Example

| Name | Title | County | Email | Verified | Source |
|---|---|---|---|---|---|
| Jane Smith | Capital Projects Director | Travis County | j.smith@traviscountytx.gov | ✅ | traviscountytx.gov |
| John Doe | CFO | Williamson County | j.doe@wilco.org | ✅ | wilco.org |
| Sarah Lee | Procurement Manager | City of Kyle | s.lee@cityofkyle.com | ✅ | cityofkyle.com |

---

## 🛠️ Tech Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Scraping** | Python, Playwright, BeautifulSoup | Extract contacts from county/gov sites |
| **Email Verification** | SMTP handshake + hunter.io API | Verify deliverability without sending |
| **Backend** | FastAPI | Trigger endpoint for manual or scheduled runs |
| **Orchestration** | OpenClaw | Daily scheduled run + Telegram alert to BD |
| **Output** | CSV / Google Sheets API | Clean lead list for CRM entry |

---

## 💰 Cost to FLAG

| Item | Monthly Cost |
|---|---|
| Scraping infra (shared VPS) | $0 additional |
| hunter.io free tier (25 verifications) | $0 |
| hunter.io starter (500 verifications) | ~$5 |
| OpenAI enrichment (optional title matching) | ~$1 |
| **Total** | **~$0–6/month** |

---

## 🗺️ Roadmap

- [x] Repo structure and README
- [ ] County website scraper (Travis, Williamson, Kyle)
- [ ] TX SmartBuy procurement portal scraper
- [ ] SMTP email verification module
- [ ] FastAPI trigger endpoint
- [ ] OpenClaw daily schedule + Telegram alert
- [ ] CSV / Google Sheets export

---

## ⚖️ Disclaimer

All scraping targets publicly available government data only. No private data, login-protected content, or proprietary databases are accessed.

---

<p align="center">
  <b>🏗️ Building Real Infrastructure & Construction Knowledge</b><br>
  <sub>Front Line Advisory Group | frontlineadvisorygroup.com</sub>
</p>
