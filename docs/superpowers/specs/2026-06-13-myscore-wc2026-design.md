# MySCORE WC2026 — Design Spec

_Date: 2026-06-13_

## Context

MySCORE WC2026 is an internal FIFA World Cup 2026 prediction competition system for company employees (20–100 users). It is not a public SaaS platform. Users self-register and predict match scores before kickoff. Points use a three-tier system: toto (correct result = 1 pt), goal difference bonus (+1 pt), and full score (exact score = +3 pts on top of toto). A leaderboard ranks all participants; tiebreaker is full score count, then toto count.

A fully interactive HTML prototype was produced in Claude Design and lives in `docs/design/sports-prediction-dashboard/`. The production app must match it visually.

---

## Architecture

### Project Layout

```
MySCORE/
├── frontend/              # React 18 + TypeScript + Vite + Tailwind CSS
├── backend/               # NestJS + TypeScript + TypeORM + PostgreSQL
├── docker-compose.yml     # postgres + backend + frontend
└── README.md
```

### Service Topology

| Service | Port | Tech |
|---|---|---|
| `postgres` | 5432 | PostgreSQL 16 |
| `backend` | 3001 | NestJS, TypeORM, JWT |
| `frontend` | 3000 | React 18, Vite, Tailwind |

**Auth flow:** email + password → backend issues JWT (15-day expiry) → frontend stores in `localStorage` → `Authorization: Bearer <token>` header on all API calls → NestJS `JwtAuthGuard` validates.

**Env:** single `.env` at project root shared by both services via Docker Compose.

---

## Backend

### NestJS Modules

| Module | Key responsibilities |
|---|---|
| `AuthModule` | Login, register (public), JWT strategy, `@Public()` decorator, change-password, generate-new-password (self-service) |
| `UsersModule` | Admin: list users, disable, force-reset password. All users: view/update own profile |
| `TournamentsModule` | Tournament CRUD, scoring rules CRUD |
| `TeamsModule` | Team CRUD (admin), read-all (all users) |
| `MatchesModule` | Match CRUD (admin), list/filter (all users), publish results → triggers leaderboard recalc |
| `PredictionsModule` | Submit / update predictions (pre-lock), list my predictions with earned points |
| `LeaderboardModule` | Read leaderboard; recalculate on every result publish |
| `StatsModule` | Aggregated office statistics |
| `SeedModule` | Idempotent seed on startup: tournament + all 48 WC2026 teams + default admin |

All modules use service/controller/dto/entity separation. `ValidationPipe` (global) enforces DTOs. A global `HttpExceptionFilter` returns `{ statusCode, error, message }` on all errors.

### Database Schema

```
users
  id uuid PK
  email varchar UNIQUE NOT NULL
  password_hash varchar NOT NULL
  display_name varchar NOT NULL
  role enum('user','admin') DEFAULT 'user'
  is_active boolean DEFAULT true
  must_change_password boolean DEFAULT false
  created_at timestamptz

tournaments
  id uuid PK
  name varchar NOT NULL
  year int NOT NULL
  is_active boolean DEFAULT true
  lock_minutes int DEFAULT 15  -- minutes before kickoff when predictions lock (server time)

teams
  id uuid PK
  tournament_id uuid FK → tournaments
  name varchar NOT NULL
  fifa_code varchar(3) NOT NULL
  iso_code varchar(6) NOT NULL  -- flagcdn code, e.g. 'gb-eng'
  group_label varchar(1)        -- A–H

matches
  id uuid PK
  tournament_id uuid FK → tournaments
  home_team_id uuid FK → teams
  away_team_id uuid FK → teams
  kickoff_at timestamptz NOT NULL
  stage enum('group','r32','r16','qf','sf','third_place','final') NOT NULL
  group_label varchar(1)
  venue varchar
  status enum('scheduled','locked','live','completed') DEFAULT 'scheduled'
  home_score int nullable
  away_score int nullable

predictions
  id uuid PK
  user_id uuid FK → users
  match_id uuid FK → matches
  home_score int NOT NULL
  away_score int NOT NULL
  points_earned int nullable      -- null until match result is published
  created_at timestamptz
  updated_at timestamptz
  UNIQUE (user_id, match_id)

score_rules
  id uuid PK
  tournament_id uuid FK → tournaments UNIQUE
  toto_pts int DEFAULT 1           -- correct winner or draw
  full_score_pts int DEFAULT 3     -- additional pts for exact score (stacks with toto)
  goal_diff_pts int DEFAULT 1      -- additional pts for correct goal diff, non-draw, non-exact (stacks with toto)

leaderboard_entries
  id uuid PK
  tournament_id uuid FK → tournaments
  user_id uuid FK → users
  total_pts int DEFAULT 0
  full_count int DEFAULT 0         -- exact scores (full score)
  toto_count int DEFAULT 0         -- correct results (toto only, not exact)
  goal_diff_count int DEFAULT 0    -- goal difference bonuses earned
  played_count int DEFAULT 0
  UNIQUE (tournament_id, user_id)
```

### Key REST Endpoints

```
POST   /auth/login                        public
POST   /auth/register                     public  (display_name + email + password)
POST   /auth/generate-password            public  (email → generates random pw, returns it once)
POST   /auth/change-password              authenticated

GET    /users                             admin
PATCH  /users/:id/disable                 admin
POST   /users/:id/reset-password          admin   (admin force-reset; returns new random pw)
GET    /users/me                          authenticated
PATCH  /users/me                          authenticated  (update display_name)

GET    /tournaments/active                authenticated
GET    /tournaments/:id/teams             authenticated
GET    /tournaments/:id/matches           authenticated  (query: group, status, search)
PATCH  /matches/:id/status               admin
PATCH  /matches/:id/result               admin  → recalculates leaderboard + updates predictions.points_earned
POST   /teams                             admin
PATCH  /teams/:id                         admin
DELETE /teams/:id                         admin

GET    /predictions/me                    authenticated
POST   /predictions                       authenticated  (enforces lock)
PATCH  /predictions/:id                   authenticated  (enforces lock)

GET    /leaderboard                       authenticated  (query: tournamentId)
GET    /stats                             authenticated
GET    /tournaments/:id/score-rules       authenticated
PATCH  /tournaments/:id/score-rules       admin
```

Swagger/OpenAPI at `/api/docs`.

### Prediction Lock Enforcement

A prediction is rejected (403) if `kickoff_at - lock_minutes * 60 seconds <= server_now()`. Default lock window is 15 minutes. Server time is authoritative — no client-side time is trusted. Frontend also enforces for UX (disabled inputs + countdown showing time remaining), but the backend is the single source of truth.

### Scoring Algorithm

```
computePoints(pred[ph,pa], result[rh,ra], rules) → int:
  pred_sign   = sign(ph - pa)   # −1=away win, 0=draw, +1=home win
  result_sign = sign(rh - ra)

  if pred_sign ≠ result_sign:
    return 0                              # Wrong result

  pts = rules.toto_pts                   # +1: correct winner or draw

  if ph == rh and pa == ra:
    pts += rules.full_score_pts          # +3: exact score
  elif result_sign ≠ 0 and (ph−pa) == (rh−ra):
    pts += rules.goal_diff_pts           # +1: correct goal diff (non-draw, non-exact only)

  return pts
```

**Knockout stage note:** for matches with stage ≠ `group`, the result entered by the admin must be the score at end of regulation + extra time. Penalty shootout goals are excluded. The admin enters the AET score explicitly; no separate penalty field is stored.

### Leaderboard Recalculation

When `PATCH /matches/:id/result` is called:
1. Set `match.home_score`, `match.away_score`, `match.status = 'completed'`.
2. Load all predictions for this match.
3. For each prediction: run `computePoints()`, write `prediction.points_earned`.
4. For each affected user: upsert `leaderboard_entries` — recalculate `total_pts`, `full_count`, `toto_count`, `goal_diff_count`, `played_count` from all scored predictions.
5. Leaderboard sort order: `total_pts DESC`, then `full_count DESC`, then `toto_count DESC`.
   - `full_count` = predictions where exact score was correct
   - `toto_count` = predictions where correct result (winner or draw) was predicted, **including** exact scores (a full score is also a toto)

---

## Frontend

### Routing

| Route | Page | Guard |
|---|---|---|
| `/login` | `LoginPage` | Public (redirect to `/` if authed) — includes "Forgot password?" and "Sign up" links |
| `/register` | `RegisterPage` | Public — display name + email + password form |
| `/forgot-password` | `ForgotPasswordPage` | Public — enter email, get new password displayed once |
| `/` | `DashboardPage` | User |
| `/matches` | `MatchesPage` | User |
| `/predictions` | `PredictionsPage` | User |
| `/leaderboard` | `LeaderboardPage` | User |
| `/stats` | `StatsPage` | User |
| `/admin` | `AdminPage` | Admin |

React Router v6. `<ProtectedRoute>` wraps user routes; `<AdminRoute>` additionally checks the `role` JWT claim.

### State Management

- **Server state** — TanStack Query v5 (`useQuery` / `useMutation`) with staleTime 30s. Optimistic updates on prediction save.
- **Auth state** — `AuthContext` (React Context) holding token, decoded user object, `login()`, `logout()`.
- **UI state** — local `useState` per component (filters, modals, theme).

### Pages & Key Components

**DashboardPage**
- Stat tiles: rank, total points, exact score count, prediction count
- Live match hero (when a match is live)
- "Predictions closing soon" list
- Recent results list
- Leaderboard snapshot (top 6)
- Activity feed (notifications)

**MatchesPage**
- Matches grouped by date
- Filter chips: All / Group A–H / To Predict / Live / Completed
- Search bar
- Each match card: teams + flags, kickoff time, status pill, inline prediction form (score stepper ×2 + submit)
- Locked/completed matches show result and earned points

**PredictionsPage**
- Tournament summary card (total pts, exact count, rank)
- Full list of user predictions with match result vs. pick and points earned

**LeaderboardPage**
- Podium (top 3) with rank medals
- Full standings table: rank, user avatar, name, total pts, full score count, toto count, played, rank delta
- Tiebreaker note visible in UI: "Tied players ranked by full scores, then toto scores"

**StatsPage**
- Office award cards: most exact, most predictions, highest-scoring round, biggest upset picked
- Points-by-matchday chart (SVG bar chart)
- Consensus bars (what % of office predicted each team to win)

**AdminPage** (tabbed)
- Matches tab: list all matches, create, edit, enter/update result (AET score for knockouts — note shown in form)
- Teams tab: CRUD teams
- Users tab: list users, disable, force-reset password (no create — users self-register)
- Scoring tab: edit toto_pts / full_score_pts / goal_diff_pts + lock_minutes; live preview showing example scores

### Component Tree

```
src/
  components/
    layout/       AppShell, Sidebar, Topbar, MobileTabBar
    ui/           Icon, Flag, Avatar, Badge, Card, Button, Input, Stepper,
                  Toast, ToastHost, StatusPill, PtsTag, TeamTag
    match/        MatchCard, PredictionForm, ScoreInput, LiveMatchHero, MiniMatch
    leaderboard/  PodiumRow, StandingsTable, RankMedal
  pages/          LoginPage, RegisterPage, ForgotPasswordPage,
                  DashboardPage, MatchesPage, PredictionsPage,
                  LeaderboardPage, StatsPage, AdminPage
  api/            auth.ts, users.ts, matches.ts, predictions.ts,
                  leaderboard.ts, stats.ts, teams.ts
  hooks/          useAuth, useToast, useMatches, usePredictions,
                  useLeaderboard, useStats
  styles/
    global.css    design tokens (--bg-0 … --accent, etc.) + base styles
    tailwind.css  Tailwind directives
  router.tsx      Route definitions
  main.tsx        App entry point
```

### Design System

The prototype's `styles.css` design tokens are ported as-is into `src/styles/global.css`. Tailwind handles layout utilities. The dark/light theme is toggled by setting `data-theme="dark|light"` on `<html>`.

**Accent colours** (selectable in prototype Tweaks, admin-configurable in production):
- Gold: `#ffd23f` (default)
- Green: `#19e08a`
- Blue: `#4aa8ff`
- Red: `#ff5b6e`

**Fonts** loaded from Google Fonts: Archivo (primary), JetBrains Mono (mono/numbers), Saira + Space Grotesk + Space Mono (alt font sets).

**Flags** served from `https://flagcdn.com/{iso}.svg`.

---

## Seed Data

`SeedService.onModuleInit()` is idempotent. If the active tournament already exists, it skips.

Creates:
1. One tournament: `FIFA World Cup 2026`
2. All 48 qualified nations (groups A–L, 12 groups × 4 teams) with FIFA codes and ISO flag codes
3. One admin user: `admin@myscore.local` / `changeme123` (must_change_password = true)

No matches are seeded — admins create them via the admin panel.

---

## DevOps

### Docker Compose

```yaml
services:
  postgres:
    image: postgres:16
    volumes: [pgdata:/var/lib/postgresql/data]
    healthcheck: pg_isready

  backend:
    build: ./backend
    depends_on: {postgres: {condition: service_healthy}}
    command: ["sh", "-c", "npm run migration:run && npm run start:prod"]
    ports: ["3001:3001"]

  frontend:
    build: ./frontend
    ports: ["3000:3000"]

volumes:
  pgdata:
```

`.env` at root (gitignored) — `POSTGRES_*`, `JWT_SECRET`, `VITE_API_URL=http://localhost:3001`.

### Migrations

TypeORM migrations committed to `backend/src/migrations/`. `synchronize: false` in production. `migration:generate` and `migration:run` scripts in `package.json`.

---

## Testing

**Backend (Jest)**
- Unit tests for `computePoints()` covering all cases:
  - Wrong result → 0
  - Correct winner, wrong goal diff → 1 (toto only)
  - Correct winner, correct goal diff, not exact → 2 (toto + goal diff)
  - Exact score → 4 (toto + full)
  - Draw predicted and correct (exact) → 4
  - Draw predicted and correct (not exact) → 1 (no goal diff bonus for draws)
  - Knockout: AET result treated same as group stage for scoring purposes
- Unit test for leaderboard recalculation: full_count, toto_count, goal_diff_count increment correctly
- Unit test for leaderboard sort: tiebreaker by full_count then toto_count
- Integration test: prediction lock enforcement (POST /predictions 15 min before kickoff → 403)
- Integration test: `POST /auth/register` creates user; duplicate email → 409

**Frontend (Vitest + React Testing Library)**
- `PredictionForm` — disabled inputs when locked, score stepper bounds (0–20), submit calls mutation

---

## Verification

End-to-end check after implementation:
1. `docker-compose up` — all three containers start cleanly
2. `GET /api/docs` renders Swagger UI
3. Register a new user at `/register` — succeeds; login with new credentials
4. Test "Forgot password" — enter email, receive new generated password, login with it
5. Login as `admin@myscore.local` / `changeme123` — forced password change flow
6. Admin creates a group-stage match; sets kickoff 14 minutes from now
7. Regular user submits a prediction — succeeds (within lock window)
8. Wait / mock time past lock → prediction attempt returns 403; UI shows disabled form
9. Admin publishes result (e.g., 2-0) — verify: prediction with 2-0 earns 4 pts (toto+full); prediction with 3-1 earns 2 pts (toto+goal diff); prediction with 1-0 earns 1 pt (toto only); prediction with 0-1 earns 0 pts
10. Leaderboard updates: sorted by pts → full_count → toto_count
11. Admin publishes a knockout result — verify AET note is visible in form; score saved correctly
