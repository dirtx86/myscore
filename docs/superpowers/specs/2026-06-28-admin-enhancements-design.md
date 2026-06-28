# MySCORE Admin Enhancements — Design Spec
**Date:** 2026-06-28  
**Status:** Approved  
**Context:** WC2026 moves to knockout stage. Six admin/UX enhancements requested to support match-by-match announcement workflows and user management.

---

## Feature 1 — Color-Coded Prediction Review

**Path:** Admin → Predictions → Select User

### What changes
The existing BackfillTab (`frontend/src/components/admin/BackfillTab.tsx`) gains a richer prediction display. No new tab is needed — the same select-user → match-list view gets visual upgrades.

### Points badge color coding
| Points | Color | Meaning |
|--------|-------|---------|
| 4 pts | Green `#22863a` | Exact score |
| 2 pts | Orange `#e37c00` | Correct winner + correct goal difference |
| 1 pt | Light blue `#1a7ac4` | Correct winner/draw only |
| 0 pts | Grey (muted) | Wrong result |
| No prediction | Dashed border, faded | User did not predict this match |

### Exact score highlight
When `pred.homeScore === match.homeScore && pred.awayScore === match.awayScore`:
- Row gets a **gold border** (`#d4a017`, 2px)
- A `⭐ EXACT` gold pill badge appears above the points badge

### Per-row data shown
- Match: `{homeTeam.fifaCode} vs {awayTeam.fifaCode}`, result, date
- Predicted score (monospace)
- Actual score (monospace)
- Points badge (color-coded)
- Exact score badge (conditional)
- Edit / Add button (existing backfill functionality, unchanged)

### No backend changes required
`GET /predictions/admin/user` already returns `pointsEarned`. All badge logic is pure frontend derived from `pred.pointsEarned` and comparison of `pred.homeScore/awayScore` with `match.homeScore/awayScore`.

---

## Feature 2 — Exact Score Winners View

**Path:** Admin → Exact Scores (new tab)

### New backend endpoint
`GET /predictions/admin/exact-winners?tournamentId=<id>`

**Auth:** Admin-only (existing `AdminGuard`)

**Query logic:**
```sql
SELECT p.*, u.displayName, u.id as userId,
       m.homeScore, m.awayScore, m.kickoffAt, m.stage,
       ht.fifaCode as homeCode, at.fifaCode as awayCode
FROM prediction p
JOIN "user" u ON u.id = p."userId"
JOIN match m ON m.id = p."matchId"
JOIN team ht ON ht.id = m."homeTeamId"
JOIN team at ON at.id = m."awayTeamId"
WHERE m."tournamentId" = :tournamentId
  AND m.status = 'completed'
  AND p."homeScore" = m."homeScore"
  AND p."awayScore" = m."awayScore"
ORDER BY m."kickoffAt" DESC
```

**Response shape:**
```ts
{
  matches: [
    {
      matchId: string,
      homeTeam: string,   // fifaCode
      awayTeam: string,
      kickoffAt: string,
      stage: string,
      actualHome: number,
      actualAway: number,
      winners: [
        { userId: string, displayName: string, pointsEarned: number }
      ]
    }
  ],
  // completed matches with NO exact score winners are also included
  // with winners: []
}
```

Completed matches with zero winners are included so the admin sees a complete picture.

### New frontend tab
A new `ExactScoresTab.tsx` component added to `frontend/src/components/admin/`. New tab "Exact Scores" added to `AdminPage.tsx`.

**Layout per match:**
- Header row: match name, stage, date, actual score, winner count badge (gold) or "No winners" (grey)
- If winners: table with columns — Staff/User | Predicted | Points
- If no winners: "No one predicted the exact score for this match."
- Matches ordered newest first

### Files changed
- `backend/src/predictions/predictions.controller.ts` — new route
- `backend/src/predictions/predictions.service.ts` — new `getExactWinners()` method
- `frontend/src/components/admin/ExactScoresTab.tsx` — new component
- `frontend/src/pages/AdminPage.tsx` — add tab

---

## Feature 3 — Next Round Match Updates

**No new development required.**

The existing admin Matches tab already supports:
- **Import from API** — re-runs `POST /tournaments/:id/matches/import` against football-data.org; skips matches already in the DB by `externalId`; new knockout fixtures appear automatically as the tournament bracket is determined
- **Create Match** — manual fixture creation form for any stage/group/kickoff

Admin action tonight: click **Import** in the Matches tab to pull R32 fixtures.

---

## Feature 4 — Hide Stats Page from Navigation

**Path:** User-facing sidebar / mobile tab bar

### What changes
Remove the Stats navigation link from both nav components. The `/stats` route and `StatsPage` component are **not deleted** — the page remains accessible by direct URL if needed later.

### Files changed
- `frontend/src/components/layout/MobileTabBar.tsx` — remove Stats tab entry
- `frontend/src/components/layout/Topbar.tsx` — remove Stats link from sidebar

### Required verification (browser test)
After deploy:
1. Log in as a regular user
2. Confirm Stats link is absent from both mobile bottom nav and desktop sidebar
3. Navigate to `/stats` directly — page must still load (no broken route)

---

## Feature 5 — User Management

**Path:** Admin → Users (existing tab, extended)

### New backend endpoints

**`POST /users/admin/create`** (admin-only)
- Body: `{ email: string, displayName: string }`
- Generates a random 12-char temporary password
- Creates user with `mustChangePassword: true`, `isActive: true`, `role: 'user'`
- Returns: `{ id, email, displayName, temporaryPassword }` — password returned **once only**, never stored in plain text

**`PATCH /users/admin/:id`** (admin-only)
- Body: `{ displayName?: string, email?: string, department?: string }`
- Updates user profile fields
- Does not touch password, role, or isActive (separate flows for those)

### Frontend changes to UsersTab

**Add User flow:**
- "Add User" button in tab header
- Modal: email field + display name field + submit
- On success: modal shows the temporary password with a "Copy" button and a warning to note it down — closes and refreshes user list

**Edit User flow:**
- Edit icon per user row
- Inline expansion (same row expands) or small modal — shows display name, email, department fields
- Save / Cancel

**Remove User:**
- No hard delete. "Remove" = Disable (existing `POST /users/:id/disable`)
- Keeps all predictions and leaderboard data intact during active tournament
- Disabled users can be re-enabled

### Files changed
- `backend/src/users/users.controller.ts` — two new admin routes
- `backend/src/users/users.service.ts` — `adminCreate()` and `adminUpdateProfile()` methods
- `backend/src/users/dto/` — new `AdminCreateUserDto`, `AdminUpdateUserDto`
- `frontend/src/components/admin/UsersTab.tsx` — Add User button/modal, Edit per row

---

## Feature 6 — Admin Manual Prediction Entry

**Path:** Admin → Predictions → Select User → Add/Edit Prediction

### Database migration
Add `byAdmin` column to `prediction` table:
```sql
ALTER TABLE prediction ADD COLUMN "byAdmin" boolean NOT NULL DEFAULT false;
```
TypeORM migration file required. Runs automatically on deploy (`migrationsRun: true`).

### Backend changes

**`POST /predictions/admin/backfill`** (existing endpoint, extended):
- The backend already accepts any match status — there is no status restriction server-side. Only the frontend was filtering to completed matches.
- Add: sets `byAdmin = true` on create or update
- Existing behaviour unchanged: `pointsEarned` is calculated only when match is completed

**`GET /predictions/admin/user`** — include `byAdmin` field in response

**`GET /predictions/me`** — include `byAdmin` field in response (for user-facing badge)

### Frontend — BackfillTab changes
- Change match query in `BackfillTab.tsx` from `{ status: 'completed' }` to **all matches** (remove status filter)
- Group matches into sections: **Upcoming / Open**, **Locked / Live**, **Completed**
- Within each section, matches are ordered by `kickoffAt`
- Show **"Entered by Admin"** grey pill badge on predictions where `byAdmin === true`, both in the backfill view and the user's own prediction list

### "Entered by Admin" badge placement
- BackfillTab: next to the score display, small grey badge
- User-facing match card / prediction list: same small grey badge, so users see it on their own predictions

### Files changed
- `backend/src/predictions/entities/prediction.entity.ts` — add `byAdmin` field
- `backend/src/migrations/` — new migration file
- `backend/src/predictions/predictions.service.ts` — remove completed-only guard, set `byAdmin: true`
- `backend/src/predictions/predictions.controller.ts` — pass `byAdmin` through response DTO
- `frontend/src/components/admin/BackfillTab.tsx` — all-matches query, grouping, byAdmin badge
- `frontend/src/components/match/MatchCard.tsx` (or prediction list component) — byAdmin badge on user-facing view

---

## Summary of all file changes

| File | Change |
|------|--------|
| `backend/src/predictions/entities/prediction.entity.ts` | Add `byAdmin: boolean` |
| `backend/src/migrations/<timestamp>-add-by-admin.ts` | Migration for byAdmin column |
| `backend/src/predictions/predictions.service.ts` | `getExactWinners()`, extend backfill |
| `backend/src/predictions/predictions.controller.ts` | `GET /predictions/admin/exact-winners`, byAdmin in responses |
| `backend/src/users/users.controller.ts` | `POST /users/admin/create`, `PATCH /users/admin/:id` |
| `backend/src/users/users.service.ts` | `adminCreate()`, `adminUpdateProfile()` |
| `backend/src/users/dto/` | `AdminCreateUserDto`, `AdminUpdateUserDto` |
| `frontend/src/components/admin/BackfillTab.tsx` | All-match query, grouping, color badges, byAdmin badge |
| `frontend/src/components/admin/ExactScoresTab.tsx` | New — exact winners view |
| `frontend/src/pages/AdminPage.tsx` | Add Exact Scores tab |
| `frontend/src/components/layout/MobileTabBar.tsx` | Remove Stats link |
| `frontend/src/components/layout/Topbar.tsx` | Remove Stats link |
| `frontend/src/components/admin/UsersTab.tsx` | Add User modal, Edit per row |
| `frontend/src/components/match/MatchCard.tsx` | byAdmin badge on user-facing predictions |
