# 🎓 CampusCare (CampusSetu) — Smart Campus Problem Solver

> **"Bridging Campus Voices with Verified Solutions"**  
> A college hackathon prototype built with pure HTML5, CSS3, and JavaScript — no paid services, no external backend required, 100% offline-ready, and privacy-preserving.

---

## 🌟 Core CampusCare Capabilities Implemented

1. **Direct Issue Submission to Hub:**
   - Submitting an issue instantly queues it into the local triage store and renders it in the **Smart Issue Hub**.
2. **Duplicate Detection Engine (Area + Category Heuristic):**
   - Automatically cross-checks incoming submissions against active reports in the **same area / building** and **same category**.
   - Flags possible duplicates, displays a prominent duplicate notice strip, and lets students upvote existing parent tickets.
3. **Category & Status Filtering + Search:**
   - Instant multi-category filter pills (*IT & Wi-Fi*, *Sanitation & Water*, *Campus Safety*, *Hostel & Mess*, *Academic & Labs*, *Transport & Parking*).
   - Status filtering by **Submitted**, **In Progress**, **Resolved**, and **Flagged for Review**.
   - Full keyword search across title, description, location, and issue ID.
4. **Interactive Status Lifecycle Transitions:**
   - Evaluators and student moderators can change issue statuses dynamically to **Submitted**, **In Progress**, or **Resolved** via card selectors or the detailed timeline modal.
   - Status updates are appended to the transparent timeline audit log in real time.
5. **Human Review Flagging for Sensitive / Inappropriate Content:**
   - Scans submissions for raw phone numbers, email addresses, student roll numbers, or abusive / accusatory keywords.
   - Automatically masks private data (`[PHONE REDACTED]`, `[ROLL NUMBER REDACTED]`) and flags the report as **"Flagged for Human Review"**.
6. **Reactive Community Insights Dashboard:**
   - Dynamic KPIs (*Submitted*, *In Progress*, *Resolved*, *Flagged for Review*, *Duplicates Linked*).
   - Pure SVG interactive status donut chart, category breakdown bars, and campus zone hotspot heat maps that update instantly when issues are created or when their statuses change.
7. **Export-to-CSV Option:**
   - Includes a 1-click **"📥 Export CSV"** button in the Issue Hub to export all current reports into a clean `.csv` spreadsheet with explicit `DEMO DATA` labeling.
8. **Strict Ethics & DEMO DATA Transparency:**
   - Every mock record and statistic is labeled with visible **DEMO DATA** markers.
   - Strictly states that issues in this local prototype are **not claimed to have reached college management or been resolved** without physical verification.

---

## 🧪 Automated Test Suite Results

An automated PowerShell verification test suite (`verify_core.ps1`) was executed against the codebase:

| Feature / Requirement | Automated Check | Result |
| :--- | :--- | :--- |
| **1. Submitting an issue adds to Issue Hub** | Form bindings, `unshift` logic, local persistence | **PASS** ✅ |
| **2. Duplicate detection (same area & category)** | Area extraction, category matching, live UI alert | **PASS** ✅ |
| **3. Category & status search & filter** | Search bar input, category pills, status filter | **PASS** ✅ |
| **4. Status change (Submitted, In Progress, Resolved)** | `changeIssueStatus` lifecycle engine & card selector | **PASS** ✅ |
| **5. Personal info / inappropriate content review flag** | Regex scanners, phone/roll redaction, human review flag | **PASS** ✅ |
| **6. Dynamic Insights updates** | Reactive re-render of KPIs, category bars & SVG donut | **PASS** ✅ |
| **7. Export-to-CSV functionality** | In-browser CSV generator & Blob download trigger | **PASS** ✅ |
| **8. DEMO DATA transparency** | Verified tags across headers, cards, and export files | **PASS** ✅ |
| **9. Ethical management notice** | No false claims regarding college management receipt | **PASS** ✅ |
| **10. DOM ID Cross-Check** | All 43 element IDs in `app.js` confirmed in `index.html` | **PASS** ✅ |

**Summary: 10 / 10 Tests Passed.**

---

## 🚀 How to Preview & Test Locally

### Quickest Way (Double-Click):
1. Open Windows File Explorer.
2. Go to: `C:\Users\miki_\OneDrive\Desktop\campussetuindex.html`
3. Double-click on `index.html`. It opens directly in your browser with zero setup.

### How to Test the New Features:
- **Change Status:** On any card in the Issue Hub, find the "Change Status" dropdown and switch it between *Submitted*, *In Progress*, and *Resolved*. Notice the badge and timeline change immediately.
- **Export CSV:** In the Issue Hub, click **"📥 Export CSV"** to download `campuscare_issues_DEMO_DATA.csv`.
- **Duplicate Test:** On the Report page, click **"Test Duplicate Detection"** to see same-area & category detection in action.
- **Privacy Test:** Click **"Test Privacy Guard"** to see automatic phone masking and the *Flagged for Human Review* tag.
- **Check Insights:** Switch to the **Community Insights** tab to watch all KPI counters and SVG charts reflect the current status distribution.
