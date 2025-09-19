# Codeforces Problem Scraper 🎯

A web application to **download filtered Codeforces contest problems as CSV files**, built with **Next.js 14**, **FastAPI**, and **Tailwind CSS**.

---

## Features ✨

- Filter problems by **division** (Div. 1-4) and **problem index** (A, B, C, etc.)  
- Choose **contest date range**  
- **Preview** problem table  
- **Download CSV** with problem metadata  
- **Dark/Light mode** support  
- Track solved problems directly in CSV  

---

## Tech Stack 🛠

**Frontend:** Next.js 14, TypeScript, React 18, Tailwind CSS, Sonner  
**Backend:** FastAPI, Python, Uvicorn, Requests  

---

## Setup & Installation 📦

### Backend
```bash
cd Backend_Scrap
pip install -r requirements.txt
bash start.sh

Usage

Select division, problem index, and date range.

Filter by contest type (Rated / Unrated).

Preview problems in the table.

Download as CSV and track progress.

CSV Contents

Each row includes:

Contest name

Problem name

Problem rating

Tags

Direct problem link

Column to mark as complete
