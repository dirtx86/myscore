# MySCORE — Developer Guide

## Table of Contents

1. [Architecture](#architecture)
2. [Local Development (without Docker)](#local-development-without-docker)
3. [Environment Variables](#environment-variables)
4. [Backend](#backend)
5. [Frontend](#frontend)
6. [API Reference](#api-reference)
7. [Database & Migrations](#database--migrations)
8. [Seed Data](#seed-data)
9. [Testing](#testing)
10. [Deployment](#deployment)

---

## Architecture

```
┌─────────────────────────────────────────────┐
│  Browser                                    │
│  React 18 · Vite · TanStack Query v5        │
│  Served by nginx on :3000                   │
└──────────────────────┬──────────────────────┘
                       │ HTTP (Axios)
                       ▼
┌─────────────────────────────────────────────┐
│  NestJS 10 API                              │
│  :3001                                      │
│  JWT auth · TypeORM · class-validator        │
└──────────────────────┬──────────────────────┘
                       │ TypeORM
                       ▼
┌─────────────────────────────────────────────┐
│  PostgreSQL 16                              │
│  :5432  volume: pgdata                      │
└─────────────────────────────────────────────┘
```

All three services run as Docker containers; `docker-compose.yml` wires them together with health checks.

---

## Local Development (without Docker)

You need Node 20+ and a running PostgreSQL 16 instance.

### Database

```bash
psql -U postgres -c "CREATE USER myscore WITH PASSWORD 'myscore_secret';"
psql -U postgres -c "CREATE DATABASE myscore OWNER myscore;"
```

### Backend

```bash
cd backend
cp .env.example .env          # edit as needed
npm install
npm run start:dev             # hot-reload on :3001
```

The app runs migrations automatically on startup (`migrationsRun: true`). Seed data (48 teams, admin user) is inserted via `SeedModule` on `OnModuleInit`.

### Frontend

```bash
cd frontend
npm install
VITE_API_URL=http://localhost:3001 npm run dev   # hot-reload on :5173
```

> The Vite dev server runs on port 5173, not 3000. Use http://localhost:5173 during local development.

---

## Environment Variables

Copy `backend/.env.example` to `.env` in the project root for Docker Compose, or into `backend/.env` for local dev.

| Variable | Default | Description |
|---|---|---|
| `POSTGRES_HOST` | `localhost` | DB hostname (set to `postgres` in Docker) |
| `POSTGRES_PORT` | `5432` | DB port |
| `POSTGRES_USER` | `myscore` | DB user |
| `POSTGRES_PASSWORD` | `myscore_secret` | DB password |
| `POSTGRES_DB` | `myscore` | DB name |
| `JWT_SECRET` | `change_me_in_production` | **Must be changed in production** |
| `JWT_EXPIRES_IN` | `15d` | Token lifetime |
| `PORT` | `3001` | Backend listen port |
| `FRONTEND_URL` | `http://localhost:3000` | CORS allowed origin |

Frontend build-time variable:

| Variable | Default | Description |
|---|---|---|
| `VITE_API_URL` | `http://localhost:3001` | Backend base URL baked into the static build |

---

## Backend

### Module structure

```
backend/src/
├── app.module.ts          Global module wiring, global guards
├── main.ts                Bootstrap: CORS, validation, serializer, Swagger
├── database.config.ts     TypeORM connection factory
├── data-source.ts         CLI DataSource for migration generation
│
├── auth/                  JWT login, register, change-password, generate-password
├── users/                 User CRUD, admin enable/disable/reset
├── tournaments/           Tournament settings, score rules
├── teams/                 Team CRUD (seeded for WC2026)
├── matches/               Match lifecycle, result publishing → triggers scoring
├── predictions/           User predictions, lock enforcement
├── leaderboard/           Entry upsert, rank computation
├── stats/                 Aggregated stats: most exact, consensus, points by round
├── seed/                  Idempotent seed: WC2026 teams + admin user
└── common/                Guards, decorators, exception filter
```

### Auth flow

1. `POST /auth/login` → returns `{ accessToken }` (JWT, HS256)
2. All endpoints except `/auth/*` require `Authorization: Bearer <token>`
3. JWT payload: `{ sub, email, role, displayName }`
4. Global `JwtAuthGuard` validates every request; `@Public()` decorator opts out
5. Global `RolesGuard` enforces `@Roles(UserRole.ADMIN)` on admin routes

### Scoring pipeline (triggered on `PATCH /matches/:id/result`)

```
publishResult()
  → matchesService.publishResult()  sets homeScore/awayScore, status=completed
  → leaderboardService.recalculateForMatch()
      for each prediction on the match:
        scoringService.computePoints(pred, result, rules)
        predRepo.save(pred.pointsEarned)
        rebuildUserEntry() — upserts leaderboard_entries totals
```

`ScoringService.computePoints` is a pure function; unit-tested in `scoring.service.spec.ts`.

### Circular dependency

`MatchesModule ↔ LeaderboardModule ↔ PredictionsModule` form a cycle, resolved with NestJS `forwardRef()` at all three injection points.

---

## Frontend

### Directory structure

```
frontend/src/
├── api/              Axios wrappers (one file per resource)
├── components/
│   ├── admin/        MatchesTab, TeamsTab, UsersTab, ScoringTab, ResultForm
│   ├── layout/       AppShell, Sidebar, Topbar, MobileTabBar
│   ├── leaderboard/  StandingsTable, PodiumRow, RankMedal
│   ├── match/        MatchCard, MiniMatch, LiveMatchHero, PredictionForm, ScoreInput
│   └── ui/           Avatar, Button, Card, Flag, Icon, Input, PtsTag, Skeleton, Toast
├── context/          AuthContext (JWT decode → user state)
├── hooks/            useAuth, useMatches, usePredictions, useLeaderboard, useStats
├── pages/            One file per route
├── router.tsx        createBrowserRouter, protected/guest/admin route wrappers
├── styles/           global.css (CSS custom properties for theming)
└── types/index.ts    All shared TypeScript interfaces
```

### Data fetching

All server state is managed by TanStack Query v5. Keys follow the pattern:

| Key | Data |
|---|---|
| `['tournament', 'active']` | Active tournament |
| `['matches', tournamentId, filters]` | Match list |
| `['predictions', 'me']` | My predictions |
| `['leaderboard', tournamentId]` | Leaderboard entries |
| `['stats']` | Aggregated stats |
| `['users']` | User list (admin) |

### Theme

Two themes (dark/light) are toggled via `data-theme` on `<html>`. CSS custom properties are defined in `styles/global.css`. Preference is persisted to `localStorage` under key `myscore-theme`.

---

## API Reference

Base URL: `http://localhost:3001`

Interactive docs: `http://localhost:3001/api/docs` (Swagger UI)

### Auth `(public)`

| Method | Path | Body | Description |
|---|---|---|---|
| POST | `/auth/register` | `{ displayName, email, password }` | Create account, returns `{ accessToken, user }` |
| POST | `/auth/login` | `{ email, password }` | Login, returns `{ accessToken, user }` |
| POST | `/auth/generate-password` | `{ email }` | Self-service: generate new password, returns `{ password }` |
| POST | `/auth/change-password` | `{ currentPassword, newPassword }` | 🔒 Change own password |

### Users `🔒`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/users/me` | any | Current user profile |
| GET | `/users` | admin | All users |
| POST | `/users/:id/disable` | admin | Disable user account |
| POST | `/users/:id/enable` | admin | Enable user account |
| POST | `/users/:id/reset-password` | admin | Force-reset password, returns `{ password }` |

### Tournaments `🔒`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tournaments/active` | any | Active tournament |
| GET | `/tournaments/:id/score-rules` | any | Score rules for tournament |
| PATCH | `/tournaments/:id` | admin | Update `lockMinutes` |
| PATCH | `/tournaments/:id/score-rules` | admin | Update `totoPts`, `fullScorePts`, `goalDiffPts` |

### Teams `🔒`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/tournaments/:id/teams` | any | All teams in tournament |
| POST | `/teams` | admin | Create team |
| PATCH | `/teams/:id` | admin | Update team |
| DELETE | `/teams/:id` | admin | Delete team |

### Matches `🔒`

| Method | Path | Auth | Query params | Description |
|---|---|---|---|---|
| GET | `/tournaments/:id/matches` | any | `group`, `status`, `search` | Match list (filtered) |
| GET | `/matches/:id` | any | — | Single match |
| POST | `/matches` | admin | — | Create match |
| PATCH | `/matches/:id` | admin | — | Update match fields |
| DELETE | `/matches/:id` | admin | — | Delete match |
| PATCH | `/matches/:id/result` | admin | — | Set score → triggers scoring |
| PATCH | `/matches/:id/status` | admin | — | Set status (`scheduled`/`locked`/`live`/`completed`) |

### Predictions `🔒`

| Method | Path | Auth | Description |
|---|---|---|---|
| GET | `/predictions/me` | any | My predictions (auto-resolves active tournament) |
| POST | `/predictions` | any | Create prediction `{ matchId, homeScore, awayScore }` |
| PATCH | `/predictions/:id` | any | Update prediction — rejected if match is locked |

### Leaderboard `🔒`

| Method | Path | Auth | Query params | Description |
|---|---|---|---|---|
| GET | `/leaderboard` | any | `tournamentId` | Ranked leaderboard with `rank` field |

### Stats `🔒`

| Method | Path | Auth | Query params | Description |
|---|---|---|---|---|
| GET | `/stats` | any | `tournamentId` (optional) | Returns `{ mostExact, mostPredictions, consensusByMatch, pointsByRound }` |

---

## Database & Migrations

Schema is managed by TypeORM migrations (not `synchronize`).

### Tables

| Table | Description |
|---|---|
| `users` | Accounts, roles, password hashes (excluded from JSON via `@Exclude()`) |
| `tournaments` | Tournament settings (`lockMinutes`) |
| `score_rules` | Scoring point values, 1:1 with tournaments |
| `teams` | 48 WC2026 teams with FIFA code and ISO country code |
| `matches` | Fixtures with kickoff, stage, group, status, result |
| `predictions` | `UNIQUE(userId, matchId)`, stores `pointsEarned` after result |
| `leaderboard_entries` | `UNIQUE(tournamentId, userId)`, upserted on each result |

### Running migrations manually

```bash
cd backend

# Generate a new migration after entity changes
npm run migration:generate -- migrations/YourMigrationName

# Apply pending migrations
npm run migration:run

# Revert last migration
npm run migration:revert
```

Migrations run automatically on container start (`migrationsRun: true` in `database.config.ts`). The CLI DataSource is in `src/data-source.ts`.

---

## Seed Data

`SeedModule` runs on `OnModuleInit` and is idempotent (safe to run multiple times):

- **Tournament**: "FIFA World Cup 2026", year 2026, active, lockMinutes=15
- **Teams**: All 48 WC2026 teams across 12 groups (A–L)
- **Admin user**: `admin@myscore.local` / `changeme123` (`mustChangePassword: true`)

To re-seed a clean database just restart the backend — seed checks for existing records before inserting.

---

## Testing

### Backend unit tests

```bash
cd backend
npm test                    # run all tests once
npm run test:watch          # watch mode
```

Key test files:
- `src/predictions/scoring.service.spec.ts` — 14 tests covering all scoring scenarios
- `src/leaderboard/leaderboard.service.spec.ts` — leaderboard rebuild logic

### Frontend component tests

```bash
cd frontend
npm test                    # Vitest
npm run test:watch
```

Key test files:
- `src/__tests__/components/ScoreInput.test.tsx`
- `src/__tests__/components/StatusPill.test.tsx`
- `src/components/match/PredictionForm.test.tsx`

---

## Deployment

### Docker Compose (recommended)

The `docker-compose.yml` in the project root is production-ready with one change: **set real secrets in `.env`**.

```bash
# On the server
git clone <repo> myscore && cd myscore
cp backend/.env.example .env
# Edit .env — set JWT_SECRET, POSTGRES_PASSWORD, FRONTEND_URL, VITE_API_URL
docker compose up --build -d
```

The Postgres volume (`pgdata`) persists across restarts and re-deploys. To upgrade:

```bash
git pull
docker compose up --build -d   # rolling replacement, data preserved
```

### Reverse proxy (nginx / Caddy)

If you want HTTPS and a domain, put nginx or Caddy in front and proxy:
- `https://yourdomain/` → `http://localhost:3000`
- `https://yourdomain/api/` → `http://localhost:3001/` (strip `/api` prefix), **or** expose the backend on its own subdomain

Example Caddyfile snippet:

```
myscore.example.com {
    reverse_proxy localhost:3000
}

api.myscore.example.com {
    reverse_proxy localhost:3001
}
```

Then update `.env`:
```dotenv
FRONTEND_URL=https://myscore.example.com
VITE_API_URL=https://api.myscore.example.com
```

Rebuild the frontend image after changing `VITE_API_URL` (it's baked in at build time):

```bash
docker compose build frontend
docker compose up -d frontend
```

### Security checklist before going live

- [ ] `JWT_SECRET` — long random string (e.g. `openssl rand -hex 48`)
- [ ] `POSTGRES_PASSWORD` — not the default
- [ ] Admin password changed from `changeme123`
- [ ] HTTPS enabled (Caddy or certbot)
- [ ] Postgres port 5432 not exposed publicly (remove the `ports` mapping from `docker-compose.yml`)
- [ ] `FRONTEND_URL` set to the actual domain (restricts CORS)

### Backend-only rebuild (e.g. bug fix)

```bash
docker compose build backend
docker compose up -d backend
# No data loss; migrations run on startup but are idempotent
```

### Viewing logs

```bash
docker compose logs -f backend
docker compose logs -f frontend
docker compose logs -f postgres
```
