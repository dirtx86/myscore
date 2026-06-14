# MySCORE — WC2026 Prediction League

An internal office football prediction app for the FIFA World Cup 2026. Players predict match scores, earn points, and compete on a live leaderboard.

## Features

- **Prediction entry** — submit home/away score predictions up to N minutes before kickoff; update them any time before the lock
- **Three-tier scoring** — Toto (correct result) 1pt · Full score (exact) +3pt · Goal difference bonus +1pt
- **Live leaderboard** — ranked by pts → full scores → correct results, updates automatically when the admin publishes a result
- **Stats page** — most-exact predictor, most-active, avg pts by stage, office consensus distribution
- **Admin panel** — create matches, set results, manage teams/scoring rules/users
- **Dark/light theme**, responsive layout, mobile tab bar
- **Self-service password recovery** — "Forgot password" generates a new one instantly (no email required)

## Stack

| Layer | Technology |
|---|---|
| Frontend | React 18, Vite, TanStack Query v5, React Router v6 |
| Backend | NestJS 10, TypeORM 0.3, Passport/JWT |
| Database | PostgreSQL 16 |
| Container | Docker, nginx (frontend static) |

---

## Quick Start (Docker)

### Prerequisites

- Docker ≥ 24 with Compose v2 (`docker compose` — note: no hyphen)
- Ports 3000, 3001, 5432 must be free

### 1. Clone and configure

```bash
git clone <repo-url> MySCORE
cd MySCORE
cp backend/.env.example .env
```

Edit `.env` and set **at minimum** a strong `JWT_SECRET`:

```dotenv
POSTGRES_USER=myscore
POSTGRES_PASSWORD=myscore_secret
POSTGRES_DB=myscore
JWT_SECRET=replace-with-a-long-random-secret
JWT_EXPIRES_IN=15d
FRONTEND_URL=http://localhost:3000
VITE_API_URL=http://localhost:3001
```

### 2. Build and run

```bash
docker compose up --build -d
```

This builds three images, runs the Postgres health check, applies migrations, seeds data, and starts all services.

### 3. Open the app

| Service | URL |
|---|---|
| App | http://localhost:3000 |
| API | http://localhost:3001 |
| Swagger | http://localhost:3001/api/docs |

### 4. Default admin credentials

```
Email:    admin@myscore.local
Password: changeme123
```

You will be prompted to change the password on first login.

---

## Scoring Rules

| Outcome | Points |
|---|---|
| Correct result (toto) | **1** |
| Exact score (full score) | +**3** (includes toto) |
| Correct goal difference, not exact (non-draw only) | +**1** (includes toto) |

**Examples** — result is 2–1:
- Predicted 2–1 → 4 pts (toto + full)
- Predicted 1–0 → 2 pts (toto + goal diff, both have diff=1)
- Predicted 3–1 → 1 pt (toto only; diff=2 ≠ 1)
- Predicted 0–2 → 0 pts (wrong winner)

For draws (e.g. result 1–1):
- Predicted 1–1 → 4 pts
- Predicted 0–0 → 1 pt (toto; goal diff bonus is not awarded for draws)
- Predicted 2–1 → 0 pts (wrong result)

Prediction lock closes `lockMinutes` before kickoff (default 15, configurable per tournament in Admin → Scoring).

---

## Stopping / resetting

```bash
# Stop containers
docker compose down

# Wipe database volume (full reset)
docker compose down -v
```

---

## License

Internal use only.
