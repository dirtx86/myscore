#!/usr/bin/env python3
"""Push actual FIFA World Cup 2026 data to MySCORE."""
import requests, sys

BASE = "http://localhost:3001"

def login():
    r = requests.post(f"{BASE}/auth/login",
        json={"email": "admin@myscore.local", "password": "xae6vodqMc2!"})
    r.raise_for_status()
    return r.json()["accessToken"]

def h(token):
    return {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}

def ok(r, label):
    if not r.ok:
        print(f"  ✗ {label}: {r.status_code} {r.text[:120]}")
    return r.ok

# ── Bootstrap ────────────────────────────────────────────────────────────────
print("Logging in...")
TOKEN = login()
H = h(TOKEN)

t = requests.get(f"{BASE}/tournaments/active", headers=H).json()
TID = t["id"]
print(f"Tournament: {t['name']} ({TID})")

raw = requests.get(f"{BASE}/tournaments/{TID}/teams", headers=H).json()
BY_CODE = {t["fifaCode"]: t for t in raw}
print(f"Existing teams: {len(BY_CODE)}")

# ── 1. Delete teams that didn't qualify ──────────────────────────────────────
print("\n── Removing non-qualifiers ──")
for code in ["JAM","CRC","ITA","HON","NGA","SRB","VEN","BHR","HUN","CMR","POL"]:
    if code in BY_CODE:
        r = requests.delete(f"{BASE}/teams/{BY_CODE[code]['id']}", headers=H)
        print(f"  {'✓' if r.ok else '✗'} Deleted {code} ({r.status_code})")
        if r.ok:
            del BY_CODE[code]

# ── 2. Re-assign groups for qualified teams ───────────────────────────────────
print("\n── Updating groups ──")
CORRECT_GROUPS = {
    # Group A
    "MEX": "A", "RSA": "A", "KOR": "A",
    # Group B
    "CAN": "B", "SUI": "B",
    # Group C
    "BRA": "C", "MAR": "C", "SCO": "C",
    # Group D
    "USA": "D", "AUS": "D", "TUR": "D",
    # Group E
    "GER": "E", "ECU": "E",
    # Group F
    "NED": "F", "JPN": "F",
    # Group G
    "BEL": "G", "EGY": "G", "IRN": "G", "NZL": "G",
    # Group H
    "ESP": "H", "KSA": "H", "URU": "H",
    # Group I
    "FRA": "I", "SEN": "I", "IRQ": "I",
    # Group J
    "ARG": "J", "ALG": "J", "AUT": "J", "JOR": "J",
    # Group K
    "POR": "K", "COD": "K", "UZB": "K", "COL": "K",
    # Group L
    "ENG": "L", "CRO": "L", "GHA": "L", "PAN": "L",
}
for code, grp in CORRECT_GROUPS.items():
    if code not in BY_CODE:
        print(f"  ! {code} not in DB, skipping group update")
        continue
    team = BY_CODE[code]
    if team["groupLabel"] == grp:
        continue
    r = requests.patch(f"{BASE}/teams/{team['id']}", headers=H, json={"groupLabel": grp})
    print(f"  {'✓' if r.ok else '✗'} {code}: {team['groupLabel']} → {grp}")
    if r.ok:
        BY_CODE[code]["groupLabel"] = grp

# ── 3. Add missing qualified teams ───────────────────────────────────────────
print("\n── Adding new teams ──")
NEW_TEAMS = [
    {"name": "Czech Republic",        "fifaCode": "CZE", "isoCode": "CZ", "groupLabel": "A"},
    {"name": "Bosnia and Herzegovina","fifaCode": "BIH", "isoCode": "BA", "groupLabel": "B"},
    {"name": "Qatar",                 "fifaCode": "QAT", "isoCode": "QA", "groupLabel": "B"},
    {"name": "Haiti",                 "fifaCode": "HAI", "isoCode": "HT", "groupLabel": "C"},
    {"name": "Paraguay",              "fifaCode": "PAR", "isoCode": "PY", "groupLabel": "D"},
    {"name": "Curacao",               "fifaCode": "CUW", "isoCode": "CW", "groupLabel": "E"},
    {"name": "Ivory Coast",           "fifaCode": "CIV", "isoCode": "CI", "groupLabel": "E"},
    {"name": "Sweden",                "fifaCode": "SWE", "isoCode": "SE", "groupLabel": "F"},
    {"name": "Tunisia",               "fifaCode": "TUN", "isoCode": "TN", "groupLabel": "F"},
    {"name": "Cape Verde",            "fifaCode": "CPV", "isoCode": "CV", "groupLabel": "H"},
    {"name": "Norway",                "fifaCode": "NOR", "isoCode": "NO", "groupLabel": "I"},
]
for team in NEW_TEAMS:
    r = requests.post(f"{BASE}/teams", headers=H, json={**team, "tournamentId": TID})
    print(f"  {'✓' if r.ok else '✗'} Created {team['fifaCode']} {team['name']} (Group {team['groupLabel']})")
    if r.ok:
        BY_CODE[team["fifaCode"]] = r.json()

print(f"\nTotal teams: {len(BY_CODE)}")

def tid(code):
    if code not in BY_CODE:
        sys.exit(f"ERROR: team code '{code}' not in DB")
    return BY_CODE[code]["id"]

# ── 4. Create all 72 group stage fixtures ────────────────────────────────────
# Kickoff times are UTC (ET + 4h; Mexico matches use Wikipedia local times)
print("\n── Creating fixtures ──")
FIXTURES = [
    # GROUP A
    ("MEX","RSA","2026-06-11T19:00:00Z","A","Mexico City, MEX"),
    ("KOR","CZE","2026-06-12T02:00:00Z","A","Zapopan, MEX"),
    ("CZE","RSA","2026-06-18T16:00:00Z","A","Atlanta, USA"),
    ("MEX","KOR","2026-06-18T23:00:00Z","A","Zapopan, MEX"),
    ("CZE","MEX","2026-06-25T01:00:00Z","A","Mexico City, MEX"),
    ("RSA","KOR","2026-06-25T01:00:00Z","A","Guadalupe, MEX"),
    # GROUP B
    ("CAN","BIH","2026-06-12T19:00:00Z","B","Toronto, CAN"),
    ("QAT","SUI","2026-06-12T22:00:00Z","B","Santa Clara, USA"),
    ("SUI","BIH","2026-06-18T19:00:00Z","B","Inglewood, USA"),
    ("CAN","QAT","2026-06-18T22:00:00Z","B","Vancouver, CAN"),
    ("SUI","CAN","2026-06-24T19:00:00Z","B","Vancouver, CAN"),
    ("BIH","QAT","2026-06-24T19:00:00Z","B","Seattle, USA"),
    # GROUP C
    ("HAI","SCO","2026-06-13T19:00:00Z","C","Foxborough, USA"),
    ("BRA","MAR","2026-06-13T22:00:00Z","C","East Rutherford, USA"),
    ("SCO","MAR","2026-06-19T22:00:00Z","C","Foxborough, USA"),
    ("BRA","HAI","2026-06-20T01:00:00Z","C","Philadelphia, USA"),
    ("SCO","BRA","2026-06-24T22:00:00Z","C","Miami Gardens, USA"),
    ("MAR","HAI","2026-06-24T22:00:00Z","C","Atlanta, USA"),
    # GROUP D
    ("USA","PAR","2026-06-12T20:00:00Z","D","Inglewood, USA"),
    ("AUS","TUR","2026-06-13T04:00:00Z","D","Vancouver, CAN"),
    ("USA","AUS","2026-06-19T19:00:00Z","D","Seattle, USA"),
    ("TUR","PAR","2026-06-19T04:00:00Z","D","Santa Clara, USA"),
    ("TUR","USA","2026-06-26T02:00:00Z","D","Inglewood, USA"),
    ("PAR","AUS","2026-06-26T02:00:00Z","D","Santa Clara, USA"),
    # GROUP E
    ("GER","CUW","2026-06-15T17:00:00Z","E","Houston, USA"),
    ("CIV","ECU","2026-06-15T23:00:00Z","E","Philadelphia, USA"),
    ("GER","CIV","2026-06-20T17:00:00Z","E","Toronto, CAN"),
    ("ECU","CUW","2026-06-21T00:00:00Z","E","Kansas City, USA"),
    ("ECU","GER","2026-06-25T20:00:00Z","E","East Rutherford, USA"),
    ("CUW","CIV","2026-06-25T20:00:00Z","E","Philadelphia, USA"),
    # GROUP F
    ("NED","JPN","2026-06-15T20:00:00Z","F","Arlington, USA"),
    ("SWE","TUN","2026-06-16T02:00:00Z","F","Guadalupe, MEX"),
    ("NED","SWE","2026-06-20T17:00:00Z","F","Houston, USA"),
    ("TUN","JPN","2026-06-20T04:00:00Z","F","Guadalupe, MEX"),
    ("JPN","SWE","2026-06-25T23:00:00Z","F","Arlington, USA"),
    ("TUN","NED","2026-06-25T23:00:00Z","F","Kansas City, USA"),
    # GROUP G
    ("BEL","EGY","2026-06-15T22:00:00Z","G","Seattle, USA"),
    ("IRN","NZL","2026-06-16T04:00:00Z","G","Inglewood, USA"),
    ("BEL","IRN","2026-06-21T19:00:00Z","G","Inglewood, USA"),
    ("NZL","EGY","2026-06-22T01:00:00Z","G","Vancouver, CAN"),
    ("EGY","IRN","2026-06-27T03:00:00Z","G","Seattle, USA"),
    ("NZL","BEL","2026-06-27T03:00:00Z","G","Vancouver, CAN"),
    # GROUP H
    ("ESP","CPV","2026-06-15T17:00:00Z","H","Atlanta, USA"),
    ("KSA","URU","2026-06-15T22:00:00Z","H","Miami Gardens, USA"),
    ("ESP","KSA","2026-06-21T16:00:00Z","H","Atlanta, USA"),
    ("URU","CPV","2026-06-21T22:00:00Z","H","Miami Gardens, USA"),
    ("CPV","KSA","2026-06-27T00:00:00Z","H","Houston, USA"),
    ("URU","ESP","2026-06-27T00:00:00Z","H","Zapopan, MEX"),
    # GROUP I
    ("FRA","SEN","2026-06-16T19:00:00Z","I","East Rutherford, USA"),
    ("IRQ","NOR","2026-06-16T22:00:00Z","I","Foxborough, USA"),
    ("FRA","IRQ","2026-06-22T21:00:00Z","I","Philadelphia, USA"),
    ("NOR","SEN","2026-06-23T00:00:00Z","I","East Rutherford, USA"),
    ("NOR","FRA","2026-06-26T19:00:00Z","I","Foxborough, USA"),
    ("SEN","IRQ","2026-06-26T19:00:00Z","I","Toronto, CAN"),
    # GROUP J
    ("ARG","ALG","2026-06-17T01:00:00Z","J","Kansas City, USA"),
    ("AUT","JOR","2026-06-17T04:00:00Z","J","Santa Clara, USA"),
    ("ARG","AUT","2026-06-22T17:00:00Z","J","Arlington, USA"),
    ("JOR","ALG","2026-06-23T03:00:00Z","J","Santa Clara, USA"),
    ("ALG","AUT","2026-06-28T02:00:00Z","J","Kansas City, USA"),
    ("JOR","ARG","2026-06-28T02:00:00Z","J","Arlington, USA"),
    # GROUP K
    ("POR","COD","2026-06-17T17:00:00Z","K","Houston, USA"),
    ("UZB","COL","2026-06-18T02:00:00Z","K","Mexico City, MEX"),
    ("POR","UZB","2026-06-23T17:00:00Z","K","Houston, USA"),
    ("COL","COD","2026-06-24T02:00:00Z","K","Zapopan, MEX"),
    ("COL","POR","2026-06-27T23:30:00Z","K","Miami Gardens, USA"),
    ("COD","UZB","2026-06-27T23:30:00Z","K","Atlanta, USA"),
    # GROUP L
    ("ENG","CRO","2026-06-17T20:00:00Z","L","Arlington, USA"),
    ("GHA","PAN","2026-06-17T23:00:00Z","L","Toronto, CAN"),
    ("ENG","GHA","2026-06-23T20:00:00Z","L","Foxborough, USA"),
    ("PAN","CRO","2026-06-23T23:00:00Z","L","Toronto, CAN"),
    ("PAN","ENG","2026-06-27T21:00:00Z","L","East Rutherford, USA"),
    ("CRO","GHA","2026-06-27T21:00:00Z","L","Philadelphia, USA"),
]

MATCH_IDS = {}  # "HOMEvAWAY" -> match id
created = 0
for home, away, kickoff, grp, venue in FIXTURES:
    payload = {
        "tournamentId": TID,
        "homeTeamId": tid(home),
        "awayTeamId": tid(away),
        "kickoffAt": kickoff,
        "stage": "group",
        "groupLabel": grp,
        "venue": venue,
    }
    r = requests.post(f"{BASE}/matches", headers=H, json=payload)
    key = f"{home}v{away}"
    if r.ok:
        MATCH_IDS[key] = r.json()["id"]
        created += 1
    else:
        print(f"  ✗ {home} vs {away}: {r.status_code} {r.text[:100]}")

print(f"  Created {created}/72 matches")

# ── 5. Publish results for completed matches ──────────────────────────────────
print("\n── Publishing results ──")
RESULTS = [
    # Group A (Jun 11)
    ("MEX","RSA", 2, 0),
    ("KOR","CZE", 2, 1),
    # Group B (Jun 12)
    ("CAN","BIH", 1, 1),
    ("QAT","SUI", 1, 1),
    # Group C (Jun 13)
    ("HAI","SCO", 0, 1),
    ("BRA","MAR", 1, 1),
    # Group D (Jun 12-13)
    ("USA","PAR", 4, 1),
    ("AUS","TUR", 2, 0),
]
for home, away, hs, aws in RESULTS:
    key = f"{home}v{away}"
    if key not in MATCH_IDS:
        print(f"  ! match {key} not found")
        continue
    r = requests.patch(f"{BASE}/matches/{MATCH_IDS[key]}/result", headers=H,
        json={"homeScore": hs, "awayScore": aws})
    print(f"  {'✓' if r.ok else '✗'} {home} {hs}–{aws} {away} ({r.status_code})")

print("\n✓ Done.")
