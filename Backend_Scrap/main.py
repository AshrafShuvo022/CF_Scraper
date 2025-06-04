from fastapi import FastAPI, Query
from fastapi.responses import StreamingResponse
from datetime import datetime, timedelta
import io
import csv
import requests

app = FastAPI()

from fastapi.middleware.cors import CORSMiddleware

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "https://cf-scraper-beryl.vercel.app"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Fetch the specified problem from a contest
def fetch_problem(contest_id, problem_index):
    url = f"https://codeforces.com/api/contest.standings?contestId={contest_id}&from=1&count=10"
    response = requests.get(url)
    if response.status_code == 200 and response.json()["status"] == "OK":
        problems = response.json()["result"]["problems"]
        for problem in problems:
            if problem["index"] == problem_index:
                return {
                    "index": problem["index"],
                    "name": problem["name"],
                    "rating": problem.get("rating", "N/A"),
                    "tags": ", ".join(problem.get("tags", [])),
                    "link": f"https://codeforces.com/contest/{contest_id}/problem/{problem['index']}"
                }
    return None

# Helper functions to compare index position
def is_index_ge(index, target):
    return ord(index.upper()) >= ord(target.upper())

def is_index_le(index, target):
    return ord(index.upper()) <= ord(target.upper())

# Match contest by division rules
def match_div(contest_name, selected_div, index):
    name = contest_name.lower()
    if selected_div == "div. 1":
        if "div. 1" in name:
            return True
        if "div. 1 + div. 2" in name or "div. 2 + div. 1" in name:
            return is_index_ge(index, "E")
        return False
    elif selected_div == "div. 2":
        if "div. 2" in name or "educational" in name:
            return True
        if "div. 1 + div. 2" in name or "div. 2 + div. 1" in name:
            return is_index_le(index, "D")
        return False
    elif selected_div == "div. 3":
        return "div. 3" in name
    elif selected_div == "div. 4":
        return "div. 4" in name
    return False

# API endpoint to fetch preview data (no pagination)
@app.get("/preview_csv")
def preview_csv(
    division: str = Query(..., description="e.g., div. 2"),
    index: str = Query(..., description="e.g., A"),
    days: int = Query(..., description="e.g., 365")
):
    url = "https://codeforces.com/api/contest.list"
    response = requests.get(url)
    if response.status_code != 200 or response.json()["status"] != "OK":
        return {"error": "Failed to fetch contests."}

    now = datetime.now()
    from_date = now - timedelta(days=days)
    results = []

    for contest in response.json()["result"]:
        if contest["id"] >= 100000 or "startTimeSeconds" not in contest:
            continue

        contest_name = contest["name"]
        start_time = datetime.fromtimestamp(contest["startTimeSeconds"])
        if not (from_date <= start_time <= now):
            continue

        if not match_div(contest_name, division.lower(), index.upper()):
            continue

        problem = fetch_problem(contest["id"], index.upper())
        if problem:
            results.append({
                "contest_name": contest_name,
                "problem_name": problem["name"],
                "rating": problem["rating"],
                "tags": problem["tags"],
                "link": problem["link"],
                "complete": ""
            })

    return {"data": results, "total_count": len(results)}

# API endpoint to download CSV
@app.get("/download_csv")
def download_csv(
    division: str = Query(..., description="e.g., div. 2"),
    index: str = Query(..., description="e.g., A"),
    days: int = Query(..., description="e.g., 365")
):
    url = "https://codeforces.com/api/contest.list"
    response = requests.get(url)
    if response.status_code != 200 or response.json()["status"] != "OK":
        return {"error": "Failed to fetch contests."}

    now = datetime.now()
    from_date = now - timedelta(days=days)
    results = []

    for contest in response.json()["result"]:
        if contest["id"] >= 100000 or "startTimeSeconds" not in contest:
            continue

        contest_name = contest["name"]
        start_time = datetime.fromtimestamp(contest["startTimeSeconds"])
        if not (from_date <= start_time <= now):
            continue

        if not match_div(contest_name, division.lower(), index.upper()):
            continue

        problem = fetch_problem(contest["id"], index.upper())
        if problem:
            results.append({
                "contest_name": contest_name,
                "problem_name": problem["name"],
                "rating": problem["rating"],
                "tags": problem["tags"],
                "link": problem["link"],
                "complete": ""
            })

    # Prepare in-memory CSV file
    output = io.StringIO()
    writer = csv.DictWriter(output, fieldnames=["contest_name", "problem_name", "rating", "tags", "link", "complete"])
    writer.writeheader()
    for row in results:
        writer.writerow(row)

    output.seek(0)
    filename = f"cf_{division.replace('.', '').replace(' ', '')}_problem_{index.lower()}.csv"
    return StreamingResponse(output, media_type="text/csv", headers={"Content-Disposition": f"attachment; filename={filename}"})
