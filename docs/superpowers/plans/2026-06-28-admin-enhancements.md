# Admin Enhancements Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Ship 5 admin/UX enhancements for WC2026 knockout stage: hide Stats from nav, color-coded prediction review, exact score winners view, admin manual prediction entry for any match with audit flag, and admin user CRUD.

**Architecture:** All backend changes are additive (new endpoints + one migration). Frontend changes extend existing admin tab components without restructuring. Tasks 1–4 are pure frontend or new backend endpoints with no DB changes; Tasks 5–9 build on each other but each is independently deployable.

**Tech Stack:** NestJS 10 · TypeORM 0.3 · PostgreSQL 16 · React 18 · Vite · TanStack Query v5 · TypeScript

## Global Constraints

- Migrations live in `backend/migrations/` — included by `tsconfig.json` `include: ["migrations/**/*"]`
- All new admin endpoints must use `@Roles(UserRole.ADMIN)` decorator (existing pattern)
- No `synchronize: true` — all schema changes require a migration file
- Run backend: `cd backend && npm run start:dev`; run frontend: `cd frontend && npm run dev`
- Run backend tests: `cd backend && npx jest`
- Scoring: 0/1/2/4 pts only — exact score = toto(1) + fullScorePts(3) = 4; goal diff bonus is else-if, never stacks with full score

---

### Task 1: Hide Stats Page from Navigation

**Files:**
- Modify: `frontend/src/components/layout/AppShell.tsx`

**Interfaces:**
- Produces: Stats link removed from both desktop sidebar and mobile tab bar; `/stats` route still works if accessed directly

- [ ] **Step 1: Remove Stats from NAV_ITEMS**

In `AppShell.tsx`, change `NAV_ITEMS` from:
```typescript
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/matches', label: 'Matches', icon: 'matches' },
  { to: '/predictions', label: 'My Predictions', icon: 'predictions' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/stats', label: 'Statistics', icon: 'stats' },
  { to: '/profile', label: 'My Profile', icon: 'user' },
  { to: '/help', label: 'How it works', icon: 'info' },
];
```
to:
```typescript
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/matches', label: 'Matches', icon: 'matches' },
  { to: '/predictions', label: 'My Predictions', icon: 'predictions' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/profile', label: 'My Profile', icon: 'user' },
  { to: '/help', label: 'How it works', icon: 'info' },
];
```

Note: `MobileTabBar` receives `NAV_ITEMS.slice(0, 5)`. After this change that becomes: Dashboard, Matches, My Predictions, Leaderboard, My Profile — correct. No other change needed.

- [ ] **Step 2: Start the frontend dev server and verify**

```bash
cd frontend && npm run dev
```

Open the app in browser. Check:
1. Desktop sidebar: "Statistics" link is gone
2. Mobile view (resize to < 880px): "Statistics" tab is gone from bottom bar
3. Navigate to `http://localhost:5173/stats` directly — page must load without error

- [ ] **Step 3: Commit**

```bash
git add frontend/src/components/layout/AppShell.tsx
git commit -m "feat: hide stats page from navigation"
```

---

### Task 2: Color-Coded Prediction Review in BackfillTab

**Files:**
- Modify: `frontend/src/components/admin/BackfillTab.tsx`

**Interfaces:**
- Consumes: `Prediction.pointsEarned: number | null`, `Match.homeScore`, `Match.awayScore` (already in existing data)
- Produces: Visual color-coded badges on each prediction row; gold border on exact score rows

- [ ] **Step 1: Add the points badge helper and exact score detection**

At the top of `BackfillTab.tsx`, after the imports, add:

```typescript
function ptsBadge(pts: number | null | undefined, isExact: boolean) {
  if (pts == null) return null;
  const map: Record<number, { bg: string; color: string }> = {
    4: { bg: '#22863a', color: '#fff' },
    2: { bg: '#e37c00', color: '#fff' },
    1: { bg: '#1a7ac4', color: '#fff' },
    0: { bg: 'var(--border)', color: 'var(--text-mute)' },
  };
  const s = map[pts] ?? { bg: 'var(--border)', color: 'var(--text-mute)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 70 }}>
      {isExact && (
        <span style={{
          background: '#d4a017', color: '#fff', fontSize: 10,
          fontWeight: 800, padding: '2px 7px', borderRadius: 20,
          whiteSpace: 'nowrap',
        }}>⭐ EXACT</span>
      )}
      <span style={{
        background: s.bg, color: s.color, fontSize: 12,
        fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      }}>{pts} pts</span>
    </div>
  );
}
```

- [ ] **Step 2: Update the row rendering to use colored badges**

In the match row map inside `BackfillTab`, locate the section that currently renders `pred.homeScore – pred.awayScore (N pts)`. Replace the `{/* Current prediction */}` block:

Find this block:
```typescript
{/* Current prediction */}
<div style={{ minWidth: 120 }}>
  {pred ? (
    <div style={{ fontSize: 13 }}>
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
        {pred.homeScore} – {pred.awayScore}
      </span>
      {pred.pointsEarned != null && (
        <span style={{ color: 'var(--text-mute)', fontSize: 11, marginLeft: 6 }}>
          ({pred.pointsEarned} pts)
        </span>
      )}
    </div>
  ) : (
    <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>No prediction</span>
  )}
</div>
```

Replace with:
```typescript
{/* Current prediction */}
<div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 }}>
  {pred ? (
    <>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 2 }}>Predicted</div>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
          {pred.homeScore} – {pred.awayScore}
        </span>
      </div>
      {match.homeScore != null && match.awayScore != null && (
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 2 }}>Actual</div>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
            {match.homeScore} – {match.awayScore}
          </span>
        </div>
      )}
      {ptsBadge(pred.pointsEarned, isExact)}
    </>
  ) : (
    <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>No prediction</span>
  )}
</div>
```

- [ ] **Step 3: Add isExact variable and gold border to the row**

Inside the `.map((match) => { ... })` callback, after the existing variable declarations (`pred`, `isEditing`, `isSaved`, `s`), add:

```typescript
const isExact = !!pred &&
  match.homeScore != null &&
  match.awayScore != null &&
  pred.homeScore === match.homeScore &&
  pred.awayScore === match.awayScore;
```

Then in the row container `<div>` style, change:
```typescript
border: '1px solid var(--line)',
```
to:
```typescript
border: isExact ? '2px solid #d4a017' : '1px solid var(--line)',
```

- [ ] **Step 4: Manually verify in browser**

Go to Admin → Predictions → select any user who has predictions on completed matches. Confirm:
- Exact score rows have a gold border and `⭐ EXACT` badge above the green `4 pts` badge
- 2-pt rows show orange badge
- 1-pt rows show light blue badge
- 0-pt rows show grey badge
- No-prediction rows are unchanged

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/admin/BackfillTab.tsx
git commit -m "feat: color-coded prediction review with exact score highlight"
```

---

### Task 3: Exact Score Winners — Backend Endpoint

**Files:**
- Modify: `backend/src/predictions/predictions.service.ts`
- Modify: `backend/src/predictions/predictions.controller.ts`

**Interfaces:**
- Produces: `GET /predictions/admin/exact-winners?tournamentId=<id>` returns `ExactWinnersMatchDto[]`
  ```typescript
  // Shape returned by the endpoint (raw JS objects, no class needed):
  {
    matchId: string;
    homeTeam: string;       // fifaCode
    awayTeam: string;       // fifaCode
    homeTeamName: string;
    awayTeamName: string;
    kickoffAt: Date;
    stage: string;
    actualHome: number;
    actualAway: number;
    winners: { userId: string; displayName: string; pointsEarned: number | null }[];
  }[]
  ```

- [ ] **Step 1: Add Match import to predictions.service.ts**

At the top of `predictions.service.ts`, add to the existing imports:
```typescript
import { Match } from '../matches/entities/match.entity';
```

- [ ] **Step 2: Add getExactWinners method to PredictionsService**

In `predictions.service.ts`, add this method after `findForUser`:

```typescript
async getExactWinners(tournamentId: string) {
  const completedMatches = await this.predRepo.manager
    .getRepository(Match)
    .createQueryBuilder('m')
    .leftJoinAndSelect('m.homeTeam', 'ht')
    .leftJoinAndSelect('m.awayTeam', 'at')
    .where('m.tournamentId = :tournamentId', { tournamentId })
    .andWhere('m.status = :status', { status: MatchStatus.COMPLETED })
    .andWhere('m.homeScore IS NOT NULL')
    .orderBy('m.kickoffAt', 'DESC')
    .getMany();

  const exactPreds = await this.predRepo
    .createQueryBuilder('p')
    .leftJoinAndSelect('p.user', 'u')
    .innerJoin('p.match', 'm')
    .where('m.tournamentId = :tournamentId', { tournamentId })
    .andWhere('m.status = :status', { status: MatchStatus.COMPLETED })
    .andWhere('p.homeScore = m.homeScore')
    .andWhere('p.awayScore = m.awayScore')
    .getMany();

  const predsByMatch = new Map<string, typeof exactPreds>();
  for (const p of exactPreds) {
    const list = predsByMatch.get(p.matchId) ?? [];
    list.push(p);
    predsByMatch.set(p.matchId, list);
  }

  return completedMatches.map((match) => ({
    matchId: match.id,
    homeTeam: match.homeTeam.fifaCode,
    awayTeam: match.awayTeam.fifaCode,
    homeTeamName: match.homeTeam.name,
    awayTeamName: match.awayTeam.name,
    kickoffAt: match.kickoffAt,
    stage: match.stage,
    actualHome: match.homeScore,
    actualAway: match.awayScore,
    winners: (predsByMatch.get(match.id) ?? []).map((p) => ({
      userId: p.userId,
      displayName: p.user.displayName,
      pointsEarned: p.pointsEarned,
    })),
  }));
}
```

- [ ] **Step 3: Add the route to PredictionsController**

In `predictions.controller.ts`, add after the `getForUser` route:

```typescript
@Get('admin/exact-winners')
@Roles(UserRole.ADMIN)
getExactWinners(@Query('tournamentId') tournamentId: string) {
  return this.predictionsService.getExactWinners(tournamentId);
}
```

- [ ] **Step 4: Start backend and smoke-test the endpoint**

```bash
cd backend && npm run start:dev
```

```bash
# Get a JWT token first (or use existing session), then:
curl -H "Authorization: Bearer <token>" \
  "http://localhost:3000/predictions/admin/exact-winners?tournamentId=<id>"
```

Expected: JSON array of matches, each with `winners` array (empty or populated). No 500 errors.

- [ ] **Step 5: Commit**

```bash
git add backend/src/predictions/predictions.service.ts \
        backend/src/predictions/predictions.controller.ts
git commit -m "feat: add GET /predictions/admin/exact-winners endpoint"
```

---

### Task 4: Exact Score Winners — Frontend Tab

**Files:**
- Modify: `frontend/src/types/index.ts`
- Modify: `frontend/src/api/predictions.ts`
- Create: `frontend/src/components/admin/ExactScoresTab.tsx`
- Modify: `frontend/src/pages/AdminPage.tsx`

**Interfaces:**
- Consumes: `GET /predictions/admin/exact-winners?tournamentId` from Task 3
- Produces: "Exact Scores" tab in admin panel listing per-match winners

- [ ] **Step 1: Add types to types/index.ts**

After the `Prediction` interface, add:

```typescript
export interface ExactWinner {
  userId: string;
  displayName: string;
  pointsEarned: number | null;
}

export interface ExactWinnersMatch {
  matchId: string;
  homeTeam: string;
  awayTeam: string;
  homeTeamName: string;
  awayTeamName: string;
  kickoffAt: string;
  stage: MatchStage;
  actualHome: number;
  actualAway: number;
  winners: ExactWinner[];
}
```

- [ ] **Step 2: Add API function to predictions.ts**

In `frontend/src/api/predictions.ts`, add to the `predictionsApi` object:

```typescript
adminGetExactWinners: async (tournamentId: string): Promise<ExactWinnersMatch[]> => {
  const res = await apiClient.get<ExactWinnersMatch[]>(
    '/predictions/admin/exact-winners',
    { params: { tournamentId } },
  );
  return res.data;
},
```

Also add to the imports at the top:
```typescript
import type {
  Prediction,
  CreatePredictionRequest,
  UpdatePredictionRequest,
  ExactWinnersMatch,
} from '../types';
```

- [ ] **Step 3: Create ExactScoresTab.tsx**

Create `frontend/src/components/admin/ExactScoresTab.tsx`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { predictionsApi } from '../../api/predictions';
import type { ExactWinnersMatch } from '../../types';

const STAGE_LABELS: Record<string, string> = {
  group: 'Group Stage', r32: 'Round of 32', r16: 'Round of 16',
  qf: 'Quarter-final', sf: 'Semi-final', third_place: 'Third Place', final: 'Final',
};

interface ExactScoresTabProps {
  tournamentId: string;
}

export function ExactScoresTab({ tournamentId }: ExactScoresTabProps) {
  const { data: matches = [], isLoading } = useQuery<ExactWinnersMatch[]>({
    queryKey: ['exact-winners', tournamentId],
    queryFn: () => predictionsApi.adminGetExactWinners(tournamentId),
    enabled: !!tournamentId,
  });

  if (isLoading) return <p style={{ color: 'var(--text-dim)' }}>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Exact Score Winners</h2>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>
        Users who predicted the exact score for each completed match.
      </p>

      {matches.length === 0 && (
        <p style={{ color: 'var(--text-mute)', fontSize: 13 }}>No completed matches yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {matches.map((m) => (
          <div key={m.matchId} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            {/* Match header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', background: 'var(--bg-2)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                  {m.homeTeamName} vs {m.awayTeamName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>
                  {STAGE_LABELS[m.stage] ?? m.stage}
                  {' · '}
                  {new Date(m.kickoffAt).toLocaleDateString()}
                  {' · Actual: '}
                  <strong>{m.actualHome} – {m.actualAway}</strong>
                </div>
              </div>
              {m.winners.length > 0 ? (
                <span style={{
                  background: '#d4a017', color: '#fff',
                  fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                }}>
                  {m.winners.length} winner{m.winners.length !== 1 ? 's' : ''}
                </span>
              ) : (
                <span style={{
                  background: 'var(--bg-2)', color: 'var(--text-mute)',
                  border: '1px solid var(--line)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                }}>
                  No winners
                </span>
              )}
            </div>

            {/* Winners table */}
            {m.winners.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-1)' }}>
                    {['Staff / User', 'Predicted', 'Points'].map((h) => (
                      <th key={h} style={{
                        textAlign: h === 'Points' ? 'center' : 'left',
                        padding: '7px 16px', fontSize: 11,
                        color: 'var(--text-mute)', fontWeight: 600,
                        borderTop: '1px solid var(--line)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m.winners.map((w) => (
                    <tr key={w.userId} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '9px 16px', fontWeight: 600, color: 'var(--text)' }}>
                        {w.displayName}
                      </td>
                      <td style={{ padding: '9px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {m.actualHome} – {m.actualAway}
                      </td>
                      <td style={{ padding: '9px 16px', textAlign: 'center' }}>
                        <span style={{
                          background: '#22863a', color: '#fff',
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        }}>
                          {w.pointsEarned ?? 4} pts
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-mute)', fontStyle: 'italic' }}>
                No one predicted the exact score for this match.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Add Exact Scores tab to AdminPage.tsx**

In `AdminPage.tsx`:

Change the `TabId` type:
```typescript
type TabId = 'matches' | 'teams' | 'users' | 'scoring' | 'backfill' | 'exact-scores';
```

Add to `TABS` array:
```typescript
const TABS: { id: TabId; label: string }[] = [
  { id: 'matches', label: 'Matches' },
  { id: 'teams', label: 'Teams' },
  { id: 'users', label: 'Users' },
  { id: 'scoring', label: 'Scoring' },
  { id: 'backfill', label: 'Predictions' },
  { id: 'exact-scores', label: 'Exact Scores' },
];
```

Add import at top:
```typescript
import { ExactScoresTab } from '../components/admin/ExactScoresTab';
```

Add render in the `tournament ?` block after the backfill line:
```typescript
{activeTab === 'exact-scores' && <ExactScoresTab tournamentId={tournament.id} />}
```

- [ ] **Step 5: Verify in browser**

Go to Admin panel. Confirm "Exact Scores" tab appears. Click it — matches with exact score winners show a table; matches with no winners show the "No one predicted…" message.

- [ ] **Step 6: Commit**

```bash
git add frontend/src/types/index.ts \
        frontend/src/api/predictions.ts \
        frontend/src/components/admin/ExactScoresTab.tsx \
        frontend/src/pages/AdminPage.tsx
git commit -m "feat: exact score winners admin tab"
```

---

### Task 5: Admin Prediction Entry — Database Migration

**Files:**
- Modify: `backend/src/predictions/entities/prediction.entity.ts`
- Create: `backend/migrations/1782604800000-AddByAdminToPrediction.ts`
- Modify: `frontend/src/types/index.ts`

**Interfaces:**
- Produces: `byAdmin` boolean column on `predictions` table (default false); `Prediction.byAdmin?: boolean` in frontend types

- [ ] **Step 1: Add byAdmin column to prediction entity**

In `backend/src/predictions/entities/prediction.entity.ts`, add after the `pointsEarned` column:

```typescript
@Column({ default: false })
byAdmin: boolean;
```

Full file after change:
```typescript
import {
  Entity, PrimaryGeneratedColumn, Column, ManyToOne, JoinColumn,
  CreateDateColumn, UpdateDateColumn, Unique,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Match } from '../../matches/entities/match.entity';

@Entity('predictions')
@Unique(['userId', 'matchId'])
export class Prediction {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (u) => u.predictions)
  @JoinColumn()
  user: User;

  @Column()
  userId: string;

  @ManyToOne(() => Match)
  @JoinColumn()
  match: Match;

  @Column()
  matchId: string;

  @Column({ type: 'int' })
  homeScore: number;

  @Column({ type: 'int' })
  awayScore: number;

  @Column({ nullable: true, type: 'int' })
  pointsEarned: number;

  @Column({ default: false })
  byAdmin: boolean;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
```

- [ ] **Step 2: Create the migration file**

Create `backend/migrations/1782604800000-AddByAdminToPrediction.ts`:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class AddByAdminToPrediction1782604800000 implements MigrationInterface {
  async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "predictions" ADD COLUMN IF NOT EXISTS "byAdmin" boolean NOT NULL DEFAULT false`,
    );
  }

  async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `ALTER TABLE "predictions" DROP COLUMN IF EXISTS "byAdmin"`,
    );
  }
}
```

- [ ] **Step 3: Add byAdmin to frontend Prediction type**

In `frontend/src/types/index.ts`, update the `Prediction` interface:

```typescript
export interface Prediction {
  id: string;
  userId: string;
  matchId: string;
  homeScore: number;
  awayScore: number;
  pointsEarned?: number;
  byAdmin?: boolean;
  createdAt: string;
  updatedAt: string;
  match?: Match;
}
```

- [ ] **Step 4: Verify migration runs on backend start**

```bash
cd backend && npm run start:dev
```

Watch the logs — should see migration `AddByAdminToPrediction1782604800000` executed. No errors.

Optionally verify in DB:
```bash
docker exec myscore-postgres-1 psql -U myscore myscore -c "\d predictions"
```
Expected: `byAdmin` column present with default `false`.

- [ ] **Step 5: Commit**

```bash
git add backend/src/predictions/entities/prediction.entity.ts \
        backend/migrations/1782604800000-AddByAdminToPrediction.ts \
        frontend/src/types/index.ts
git commit -m "feat: add byAdmin column to predictions table"
```

---

### Task 6: Admin Prediction Entry — Set byAdmin in Backend

**Files:**
- Modify: `backend/src/predictions/predictions.service.ts`

**Interfaces:**
- Consumes: `byAdmin: boolean` on `Prediction` entity (from Task 5)
- Produces: `adminBackfill()` now sets `byAdmin = true`; any prediction created/updated via admin backfill is flagged

- [ ] **Step 1: Update adminBackfill to set byAdmin = true**

In `predictions.service.ts`, find the `adminBackfill` method. Change:

```typescript
if (pred) {
  pred.homeScore = homeScore;
  pred.awayScore = awayScore;
} else {
  pred = this.predRepo.create({ userId, matchId, homeScore, awayScore });
}
```

to:

```typescript
if (pred) {
  pred.homeScore = homeScore;
  pred.awayScore = awayScore;
  pred.byAdmin = true;
} else {
  pred = this.predRepo.create({ userId, matchId, homeScore, awayScore, byAdmin: true });
}
```

- [ ] **Step 2: Verify via backend logs**

Restart backend. Use the existing Backfill tab in the admin panel to add/edit a prediction on a completed match. Check the database:

```bash
docker exec myscore-postgres-1 psql -U myscore myscore \
  -c "SELECT id, \"userId\", \"byAdmin\" FROM predictions LIMIT 5;"
```

The prediction you just saved should show `byAdmin = true`.

- [ ] **Step 3: Commit**

```bash
git add backend/src/predictions/predictions.service.ts
git commit -m "feat: mark admin-entered predictions with byAdmin flag"
```

---

### Task 7: Admin Prediction Entry — Frontend (All Matches + byAdmin Badge)

**Files:**
- Modify: `frontend/src/components/admin/BackfillTab.tsx`
- Modify: `frontend/src/components/match/MatchCard.tsx`

**Interfaces:**
- Consumes: `Prediction.byAdmin?: boolean` (from Task 5); match query without status filter
- Produces: BackfillTab shows all matches grouped by status; "Entered by Admin" badge on flagged predictions in both admin and user views

- [ ] **Step 1: Update BackfillTab to fetch all matches grouped by status**

In `BackfillTab.tsx`, change the matches query:

From:
```typescript
const { data: matches = [] } = useQuery<Match[]>({
  queryKey: ['matches', tournamentId, 'completed'],
  queryFn: () => matchesApi.getMatches(tournamentId, { status: 'completed' }),
  enabled: !!tournamentId,
});
```

To:
```typescript
const { data: matches = [] } = useQuery<Match[]>({
  queryKey: ['matches', tournamentId, 'all'],
  queryFn: () => matchesApi.getMatches(tournamentId),
  enabled: !!tournamentId,
});
```

- [ ] **Step 2: Group matches by status and add byAdmin badge**

Replace the match list rendering section (from `{selectedUserId && (` through the closing `)}`) with:

```typescript
{selectedUserId && (() => {
  const completed = matches.filter((m) => m.status === 'completed');
  const active = matches.filter((m) => m.status === 'live' || m.status === 'locked');
  const upcoming = matches.filter((m) => m.status === 'scheduled');

  const renderMatch = (match: Match) => {
    const pred = predsByMatchId.get(match.id);
    const isEditing = editingMatch === match.id;
    const isSaved = saved === match.id;
    const s = scores[match.id];
    const isExact = !!pred &&
      match.homeScore != null &&
      match.awayScore != null &&
      pred.homeScore === match.homeScore &&
      pred.awayScore === match.awayScore;

    return (
      <div
        key={match.id}
        style={{
          display: 'flex', alignItems: 'center', gap: 16,
          padding: '12px 16px',
          background: 'var(--bg-1)',
          border: isExact ? '2px solid #d4a017' : '1px solid var(--line)',
          borderRadius: 'var(--r)', flexWrap: 'wrap',
        }}
      >
        <div style={{ flex: '1 1 200px', minWidth: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
            {match.homeTeam.fifaCode} vs {match.awayTeam.fifaCode}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>
            {match.homeScore != null ? `Result: ${match.homeScore} – ${match.awayScore} · ` : ''}
            {new Date(match.kickoffAt).toLocaleDateString()}
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 }}>
          {pred ? (
            <>
              <div style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 2 }}>Predicted</div>
                <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
                  {pred.homeScore} – {pred.awayScore}
                </span>
              </div>
              {match.homeScore != null && match.awayScore != null && (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 2 }}>Actual</div>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
                    {match.homeScore} – {match.awayScore}
                  </span>
                </div>
              )}
              {ptsBadge(pred.pointsEarned, isExact)}
              {pred.byAdmin && (
                <span style={{
                  fontSize: 10, color: 'var(--text-mute)',
                  background: 'var(--bg-2)', border: '1px solid var(--line)',
                  padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap',
                }}>Entered by Admin</span>
              )}
            </>
          ) : (
            <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>No prediction</span>
          )}
        </div>

        {isEditing ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <input
              type="number" min={0} max={99} style={fieldStyle}
              value={s?.home ?? ''}
              onChange={(e) => setScores((prev) => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
            />
            <span style={{ color: 'var(--text-mute)' }}>–</span>
            <input
              type="number" min={0} max={99} style={fieldStyle}
              value={s?.away ?? ''}
              onChange={(e) => setScores((prev) => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
            />
            <button
              className="btn-primary"
              style={{ padding: '6px 14px', fontSize: 13 }}
              disabled={backfill.isPending}
              onClick={() => submit(match.id)}
            >
              {backfill.isPending && backfill.variables?.matchId === match.id ? '…' : 'Save'}
            </button>
            <button
              onClick={() => setEditingMatch(null)}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: '6px 10px' }}
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => startEdit(match.id, pred)}
            style={{
              background: 'var(--bg-2)', border: '1px solid var(--line)',
              borderRadius: 'var(--r-sm)', padding: '6px 14px', fontSize: 13,
              cursor: 'pointer', color: isSaved ? 'var(--live)' : 'var(--text-dim)',
              fontWeight: isSaved ? 700 : 500,
            }}
          >
            {isSaved ? '✓ Saved' : (pred ? 'Edit' : 'Add')}
          </button>
        )}
      </div>
    );
  };

  const Section = ({ title, items }: { title: string; items: Match[] }) =>
    items.length === 0 ? null : (
      <div style={{ marginBottom: 24 }}>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
          {title}
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {items.map(renderMatch)}
        </div>
      </div>
    );

  return (
    <div>
      <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-dim)' }}>
        {loadingPreds ? 'Loading…' : `${matches.length} matches for ${selectedUser?.displayName}`}
      </h3>
      <Section title="Upcoming" items={upcoming} />
      <Section title="Locked / Live" items={active} />
      <Section title="Completed" items={completed} />
      {matches.length === 0 && (
        <p style={{ color: 'var(--text-mute)', fontSize: 13 }}>No matches found.</p>
      )}
    </div>
  );
})()}
```

Also add `matchesApi` to the imports at the top of BackfillTab if not already present:
```typescript
import { matchesApi } from '../../api/matches';
```

- [ ] **Step 3: Add byAdmin badge to user-facing MatchCard**

In `frontend/src/components/match/MatchCard.tsx`, find the completed prediction block:

```typescript
{match.status === 'completed' && prediction ? (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
    <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Your pick:</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
      {prediction.homeScore} – {prediction.awayScore}
    </span>
    <PtsTag pts={prediction.pointsEarned} rules={rules} />
  </div>
```

Replace with:
```typescript
{match.status === 'completed' && prediction ? (
  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
    <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Your pick:</span>
    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
      {prediction.homeScore} – {prediction.awayScore}
    </span>
    <PtsTag pts={prediction.pointsEarned} rules={rules} />
    {prediction.byAdmin && (
      <span style={{
        fontSize: 10, color: 'var(--text-mute)',
        background: 'var(--bg-2)', border: '1px solid var(--line)',
        padding: '2px 7px', borderRadius: 20,
      }}>Entered by Admin</span>
    )}
  </div>
```

- [ ] **Step 4: Verify in browser**

1. Go to Admin → Predictions → select a user → confirm you can see all match sections (Upcoming / Locked-Live / Completed)
2. Add a prediction for a scheduled/locked match (not completed) — it should save and show with "Entered by Admin" badge
3. Go to the user's match list page (or Predictions page) — the prediction should show with "Entered by Admin" badge

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/admin/BackfillTab.tsx \
        frontend/src/components/match/MatchCard.tsx
git commit -m "feat: admin prediction entry for all match statuses with byAdmin badge"
```

---

### Task 8: User Management — Backend

**Files:**
- Create: `backend/src/users/dto/admin-create-user.dto.ts`
- Create: `backend/src/users/dto/admin-update-user.dto.ts`
- Modify: `backend/src/users/users.service.ts`
- Modify: `backend/src/users/users.controller.ts`

**Interfaces:**
- Produces:
  - `POST /users/admin/create` body: `{ email: string, displayName: string }` → returns `{ id, email, displayName, temporaryPassword }`
  - `PATCH /users/admin/:id` body: `{ displayName?, email?, department? }` → returns `204` (no content)

- [ ] **Step 1: Create AdminCreateUserDto**

Create `backend/src/users/dto/admin-create-user.dto.ts`:

```typescript
import { IsEmail, IsString, MaxLength, MinLength } from 'class-validator';

export class AdminCreateUserDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(2)
  @MaxLength(60)
  displayName: string;
}
```

- [ ] **Step 2: Create AdminUpdateUserDto**

Create `backend/src/users/dto/admin-update-user.dto.ts`:

```typescript
import { IsOptional, IsEmail, IsString, MaxLength } from 'class-validator';

export class AdminUpdateUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(60)
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  department?: string;
}
```

- [ ] **Step 3: Add service methods to users.service.ts**

Add these two methods to `UsersService` in `users.service.ts`, after `forceResetPassword`:

```typescript
async adminCreate(
  email: string,
  displayName: string,
): Promise<{ id: string; email: string; displayName: string; temporaryPassword: string }> {
  const existing = await this.findByEmail(email);
  if (existing) throw new ConflictException('Email already in use');
  const temporaryPassword = Math.random().toString(36).slice(-10) + 'A1!';
  const passwordHash = await bcrypt.hash(temporaryPassword, 12);
  const user = await this.userRepo.save(
    this.userRepo.create({
      email,
      displayName,
      passwordHash,
      mustChangePassword: true,
      role: this.roleForEmail(email),
    }),
  );
  return { id: user.id, email: user.email, displayName: user.displayName, temporaryPassword };
}

async adminUpdateUser(id: string, dto: { displayName?: string; email?: string; department?: string }): Promise<void> {
  const user = await this.userRepo.findOne({ where: { id } });
  if (!user) throw new NotFoundException('User not found');
  if (dto.email && dto.email !== user.email) {
    const existing = await this.findByEmail(dto.email);
    if (existing) throw new ConflictException('Email already in use');
  }
  await this.userRepo.update(id, dto);
}
```

- [ ] **Step 4: Add routes to users.controller.ts**

Add the two new imports at the top of `users.controller.ts`:
```typescript
import { AdminCreateUserDto } from './dto/admin-create-user.dto';
import { AdminUpdateUserDto } from './dto/admin-update-user.dto';
```

Add these routes after `resetPassword`:

```typescript
@Post('admin/create')
@Roles(UserRole.ADMIN)
@HttpCode(HttpStatus.CREATED)
@ApiOperation({ summary: 'Admin create a new user account' })
adminCreate(@Body() dto: AdminCreateUserDto) {
  return this.usersService.adminCreate(dto.email, dto.displayName);
}

@Patch('admin/:id')
@Roles(UserRole.ADMIN)
@HttpCode(HttpStatus.OK)
@ApiOperation({ summary: 'Admin update user profile fields' })
adminUpdate(@Param('id') id: string, @Body() dto: AdminUpdateUserDto) {
  return this.usersService.adminUpdateUser(id, dto);
}
```

- [ ] **Step 5: Smoke-test the endpoints**

```bash
# Restart backend
cd backend && npm run start:dev

# Create user (replace <token> with admin JWT)
curl -X POST http://localhost:3000/users/admin/create \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","displayName":"Test User"}'
# Expected: { id, email, displayName, temporaryPassword }

# Update user (replace <id> with the returned id)
curl -X PATCH http://localhost:3000/users/admin/<id> \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Updated Name"}'
# Expected: 200 OK
```

- [ ] **Step 6: Commit**

```bash
git add backend/src/users/dto/admin-create-user.dto.ts \
        backend/src/users/dto/admin-update-user.dto.ts \
        backend/src/users/users.service.ts \
        backend/src/users/users.controller.ts
git commit -m "feat: add admin create and update user endpoints"
```

---

### Task 9: User Management — Frontend

**Files:**
- Modify: `frontend/src/api/users.ts`
- Modify: `frontend/src/components/admin/UsersTab.tsx`

**Interfaces:**
- Consumes: `POST /users/admin/create` and `PATCH /users/admin/:id` from Task 8
- Produces: "Add User" button + modal in Users tab; inline edit per row

- [ ] **Step 1: Add API functions to users.ts**

In `frontend/src/api/users.ts`, add to `usersApi`:

```typescript
enableUser: async (id: string): Promise<void> => {
  await apiClient.post(`/users/${id}/enable`);
},

adminCreateUser: async (data: {
  email: string;
  displayName: string;
}): Promise<{ id: string; email: string; displayName: string; temporaryPassword: string }> => {
  const res = await apiClient.post('/users/admin/create', data);
  return res.data;
},

adminUpdateUser: async (
  id: string,
  data: { displayName?: string; email?: string; department?: string },
): Promise<void> => {
  await apiClient.patch(`/users/admin/${id}`, data);
},
```

- [ ] **Step 2: Replace UsersTab.tsx with the extended version**

Replace the entire content of `frontend/src/components/admin/UsersTab.tsx` with:

```typescript
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { useToast } from '../../hooks/useToast';
import type { User } from '../../types';

export function UsersTab() {
  const qc = useQueryClient();
  const { toast } = useToast();

  // Existing state
  const [resetResult, setResetResult] = useState<{ userId: string; password: string } | null>(null);

  // Add user state
  const [showAddModal, setShowAddModal] = useState(false);
  const [addForm, setAddForm] = useState({ email: '', displayName: '' });
  const [addResult, setAddResult] = useState<{ id: string; email: string; displayName: string; temporaryPassword: string } | null>(null);

  // Edit state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ displayName: '', email: '', department: '' });

  const { data: users = [], isLoading } = useQuery<User[]>({
    queryKey: ['admin-users'],
    queryFn: () => usersApi.listUsers(),
  });

  const disableMutation = useMutation({
    mutationFn: (id: string) => usersApi.disableUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast('User disabled', 'success'); },
    onError: () => toast('Failed to disable user', 'error'),
  });

  const enableMutation = useMutation({
    mutationFn: (id: string) => usersApi.enableUser(id),
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['admin-users'] }); toast('User enabled', 'success'); },
    onError: () => toast('Failed to enable user', 'error'),
  });

  const resetMutation = useMutation({
    mutationFn: (id: string) => usersApi.resetUserPassword(id),
    onSuccess: (data, userId) => setResetResult({ userId, password: data.password }),
    onError: () => toast('Failed to reset password', 'error'),
  });

  const addMutation = useMutation({
    mutationFn: () => usersApi.adminCreateUser(addForm),
    onSuccess: (data) => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setShowAddModal(false);
      setAddForm({ email: '', displayName: '' });
      setAddResult(data);
    },
    onError: () => toast('Failed to create user', 'error'),
  });

  const editMutation = useMutation({
    mutationFn: (id: string) => usersApi.adminUpdateUser(id, {
      displayName: editForm.displayName || undefined,
      email: editForm.email || undefined,
      department: editForm.department || undefined,
    }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['admin-users'] });
      setEditingId(null);
      toast('User updated', 'success');
    },
    onError: () => toast('Failed to update user', 'error'),
  });

  function startEdit(user: User) {
    setEditingId(user.id);
    setEditForm({
      displayName: user.displayName,
      email: user.email,
      department: user.department ?? '',
    });
  }

  const inputStyle: React.CSSProperties = {
    padding: '6px 10px', fontSize: 13, width: '100%',
    background: 'var(--bg-inset)', border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-sm)', color: 'var(--text)',
  };

  const modalOverlay: React.CSSProperties = {
    position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)',
    display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999,
  };

  const modalBox: React.CSSProperties = {
    background: 'var(--bg-1)', border: '1px solid var(--line)',
    borderRadius: 'var(--r-lg)', padding: 32, maxWidth: 420, width: '90%',
    display: 'flex', flexDirection: 'column', gap: 16,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>

      {/* Reset password result modal */}
      {resetResult && (
        <div style={modalOverlay} onClick={() => setResetResult(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>New Password Generated</h3>
            <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>Shown once. Copy and share securely.</p>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.05em', userSelect: 'all' }}>
              {resetResult.password}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => { navigator.clipboard.writeText(resetResult!.password); toast('Password copied', 'success'); }}>Copy Password</Button>
              <Button variant="ghost" onClick={() => setResetResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* New user temp password modal */}
      {addResult && (
        <div style={modalOverlay} onClick={() => setAddResult(null)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>User Created</h3>
            <p style={{ margin: 0, color: 'var(--text-dim)', fontSize: 13 }}>{addResult.displayName} · {addResult.email}</p>
            <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>Temporary password shown once. Share securely.</p>
            <div style={{ background: 'var(--bg-2)', border: '1px solid var(--line)', borderRadius: 'var(--r-sm)', padding: '12px 16px', fontFamily: 'monospace', fontSize: 16, letterSpacing: '0.05em', userSelect: 'all' }}>
              {addResult.temporaryPassword}
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button variant="primary" onClick={() => { navigator.clipboard.writeText(addResult!.temporaryPassword); toast('Password copied', 'success'); }}>Copy Password</Button>
              <Button variant="ghost" onClick={() => setAddResult(null)}>Close</Button>
            </div>
          </div>
        </div>
      )}

      {/* Add user modal */}
      {showAddModal && (
        <div style={modalOverlay} onClick={() => setShowAddModal(false)}>
          <div style={modalBox} onClick={(e) => e.stopPropagation()}>
            <h3 style={{ margin: 0, fontSize: 18 }}>Add New User</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Email</label>
                <input
                  type="email"
                  style={inputStyle}
                  value={addForm.email}
                  onChange={(e) => setAddForm((f) => ({ ...f, email: e.target.value }))}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Display Name</label>
                <input
                  type="text"
                  style={inputStyle}
                  value={addForm.displayName}
                  onChange={(e) => setAddForm((f) => ({ ...f, displayName: e.target.value }))}
                  placeholder="Full name"
                />
              </div>
            </div>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                disabled={!addForm.email || !addForm.displayName || addMutation.isPending}
                onClick={() => addMutation.mutate()}
              >
                {addMutation.isPending ? 'Creating…' : 'Create User'}
              </Button>
              <Button variant="ghost" onClick={() => setShowAddModal(false)}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h2 style={{ fontSize: 18, fontWeight: 700, margin: 0 }}>Users</h2>
        <Button variant="primary" onClick={() => setShowAddModal(true)}>+ Add User</Button>
      </div>

      {isLoading ? <p style={{ color: 'var(--text-dim)' }}>Loading…</p> : (
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                {['', 'Name', 'Email', 'Dept', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {users.map((user) => (
                <>
                  <tr key={user.id} style={{ borderBottom: editingId === user.id ? 'none' : '1px solid var(--line)', opacity: user.isActive ? 1 : 0.5 }}>
                    <td style={{ padding: '10px 12px', width: 40 }}><Avatar displayName={user.displayName} size={32} /></td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontWeight: 500 }}>{user.displayName}</span>
                      {!user.isActive && <span style={{ marginLeft: 8, fontSize: 11, color: 'var(--danger)', background: 'color-mix(in srgb, var(--danger) 15%, transparent)', padding: '2px 6px', borderRadius: 4 }}>[Disabled]</span>}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{user.email}</td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>{user.department ?? '—'}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: user.role === 'admin' ? 'color-mix(in srgb, var(--accent) 20%, transparent)' : 'var(--bg-2)', color: user.role === 'admin' ? 'var(--accent)' : 'var(--text-dim)' }}>
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontSize: 12, padding: '2px 8px', borderRadius: 4, background: user.isActive ? 'color-mix(in srgb, #22c55e 15%, transparent)' : 'var(--bg-2)', color: user.isActive ? '#22c55e' : 'var(--text-mute)' }}>
                        {user.isActive ? 'active' : 'disabled'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>{new Date(user.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        <Button variant="ghost" onClick={() => startEdit(user)}>Edit</Button>
                        {user.isActive
                          ? <Button variant="danger" onClick={() => disableMutation.mutate(user.id)} disabled={disableMutation.isPending}>Disable</Button>
                          : <Button variant="ghost" onClick={() => enableMutation.mutate(user.id)} disabled={enableMutation.isPending}>Enable</Button>
                        }
                        <Button variant="ghost" onClick={() => resetMutation.mutate(user.id)} disabled={resetMutation.isPending}>Reset Pwd</Button>
                      </div>
                    </td>
                  </tr>
                  {editingId === user.id && (
                    <tr key={`${user.id}-edit`} style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-inset)' }}>
                      <td colSpan={8} style={{ padding: '12px 16px' }}>
                        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Display Name</label>
                            <input style={{ ...inputStyle, width: 180 }} value={editForm.displayName} onChange={(e) => setEditForm((f) => ({ ...f, displayName: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Email</label>
                            <input type="email" style={{ ...inputStyle, width: 220 }} value={editForm.email} onChange={(e) => setEditForm((f) => ({ ...f, email: e.target.value }))} />
                          </div>
                          <div>
                            <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 4 }}>Department</label>
                            <input style={{ ...inputStyle, width: 160 }} value={editForm.department} onChange={(e) => setEditForm((f) => ({ ...f, department: e.target.value }))} />
                          </div>
                          <div style={{ display: 'flex', gap: 8, paddingBottom: 1 }}>
                            <Button variant="primary" disabled={editMutation.isPending} onClick={() => editMutation.mutate(user.id)}>
                              {editMutation.isPending ? 'Saving…' : 'Save'}
                            </Button>
                            <Button variant="ghost" onClick={() => setEditingId(null)}>Cancel</Button>
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 3: Verify Add User flow**

1. Go to Admin → Users → click "Add User"
2. Fill in email + display name → click Create User
3. Confirm temp password modal appears with Copy button
4. Close modal — new user appears in table

- [ ] **Step 4: Verify Edit User flow**

1. Click "Edit" on any user row
2. Inline edit row expands — change display name or department
3. Click Save — row collapses, updated data appears

- [ ] **Step 5: Commit**

```bash
git add frontend/src/api/users.ts \
        frontend/src/components/admin/UsersTab.tsx
git commit -m "feat: user management — add user modal and inline edit"
```

---

## Deploy Checklist

After all tasks complete, deploy to staging first:

```bash
bash rollout_staging.sh
```

Then verify in browser on staging:
1. Stats link gone from sidebar and mobile nav; `/stats` still loads
2. Admin → Predictions → color badges visible on completed predictions
3. Admin → Exact Scores → tab present, matches shown
4. Admin → Predictions → all match statuses visible (not just completed)
5. Admin → Users → Add User button works, Edit row works

Then deploy to production:
```bash
bash rollout_prod.sh
```
