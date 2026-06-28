# Knockout Bracket Visual Tree Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add a `/bracket` page showing the full WC2026 single-elimination bracket as a left-mirrored visual tree with CSS connector lines.

**Architecture:** Two pure presentational components (`BracketMatchCard`, `BracketRound`) are built first, then a `BracketPage` composes them — fetching all matches, splitting into left/right halves by sort order, and rendering with fixed-height flex slots so CSS `::before`/`::after` connectors align precisely. No new backend endpoints.

**Tech Stack:** React 18 + Vite, TypeScript, TanStack Query v5, React Router v6.

## Global Constraints

- All components use CSS design tokens only — no hardcoded colours except `--live: #19e08a` for the live badge (already a token)
- `MatchStage` string-literal values: `'group' | 'r32' | 'r16' | 'qf' | 'sf' | 'third_place' | 'final'`
- `MatchStatus` values: `'scheduled' | 'locked' | 'live' | 'completed'`
- `Match.homeTeam.fifaCode` and `Match.awayTeam.fifaCode` are the team codes to display
- `matchesApi.getMatches(tournamentId, filters)` — no `stage` filter parameter exists; filter client-side
- Bracket slot counts per half: R32 = 8, R16 = 4, QF = 2, SF = 1. Total R32 = 16, R16 = 8, QF = 4, SF = 2
- SLOT_HEIGHT constant = 80px (height allocated per R32 card; all other rounds scale as multiples)
- ROUND_GAP constant = 24px (horizontal gap between rounds, used for connector line width)
- Card dimensions: width 160px, height 52px
- TypeScript must compile clean: `cd frontend && npx tsc --noEmit`
- Nav icon name for bracket: `'bracket'` — added to `Icon.tsx`'s `ICON_PATHS`

---

## File Structure

| File | Action | Responsibility |
|------|--------|----------------|
| `frontend/src/components/bracket/BracketMatchCard.tsx` | Create | Single match card (160×52px); placeholder when `match` is null |
| `frontend/src/components/bracket/BracketRound.tsx` | Create | One column of slots with CSS connector lines |
| `frontend/src/pages/BracketPage.tsx` | Create | Fetches matches, splits halves, composes full bracket + mobile fallback |
| `frontend/src/components/ui/Icon.tsx` | Modify | Add `bracket` icon path |
| `frontend/src/components/layout/AppShell.tsx` | Modify | Add Bracket entry to `NAV_ITEMS` |
| `frontend/src/router.tsx` | Modify | Add `/bracket` route inside `ProtectedRoute` |

---

## Task 1: BracketMatchCard and BracketRound components

**Files:**
- Create: `frontend/src/components/bracket/BracketMatchCard.tsx`
- Create: `frontend/src/components/bracket/BracketRound.tsx`
- Modify: `frontend/src/components/ui/Icon.tsx`

**Interfaces:**
- Produces:
  - `BracketMatchCard({ match: Match | null }): JSX.Element`
  - `BracketRound({ label, matches, slotHeight, side }): JSX.Element`

---

- [ ] **Step 1: Add the `bracket` icon to Icon.tsx**

Open `frontend/src/components/ui/Icon.tsx`. In `ICON_PATHS`, add one line after the `'info'` entry:

```typescript
  bracket: 'M3 5h4M3 19h4M7 5v7M7 19v-7M7 12h5M12 8h4v8h-4M16 12h4',
```

This draws a two-match-to-one-match bracket tree (left: two slots, horizontal connector, right: one slot).

- [ ] **Step 2: Create BracketMatchCard**

Create `frontend/src/components/bracket/BracketMatchCard.tsx`:

```typescript
import type { Match } from '../../types';

interface Props {
  match: Match | null;
}

function statusLabel(match: Match): string {
  if (match.status === 'completed') return 'FT';
  if (match.status === 'live') return 'LIVE';
  if (match.status === 'locked') return 'Soon';
  const d = new Date(match.kickoffAt);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function BracketMatchCard({ match }: Props) {
  if (!match) {
    return (
      <div style={{
        width: 160, height: 52,
        border: '1px dashed var(--line-2)',
        borderRadius: 'var(--r-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>TBD</span>
      </div>
    );
  }

  const hasScore = match.homeScore != null && match.awayScore != null;
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  return (
    <div style={{
      width: 160, height: 52,
      background: 'var(--bg-2)',
      border: `1px solid ${isLive ? 'var(--live)' : isCompleted ? 'var(--line-2)' : 'var(--line)'}`,
      borderRadius: 'var(--r-sm)',
      padding: '5px 8px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '.02em' }}>
          {match.homeTeam.fifaCode}
        </span>
        {hasScore && (
          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
            {match.homeScore}–{match.awayScore}
          </span>
        )}
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '.02em' }}>
          {match.awayTeam.fifaCode}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: isLive ? 'var(--live)' : 'var(--text-mute)',
          padding: isLive ? '1px 5px' : '0',
          background: isLive ? 'rgba(25,224,138,.12)' : 'transparent',
          borderRadius: 20,
        }}>
          {statusLabel(match)}
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create BracketRound**

Create `frontend/src/components/bracket/BracketRound.tsx`:

```typescript
import type { Match } from '../../types';
import { BracketMatchCard } from './BracketMatchCard';

interface Props {
  label: string;
  matches: (Match | null)[];
  slotHeight: number;
  side: 'left' | 'right' | 'center';
}

export function BracketRound({ label, matches, slotHeight, side }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-mute)',
        marginBottom: 8, letterSpacing: '.07em', textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {matches.map((match, i) => (
          <div
            key={match?.id ?? `empty-${i}`}
            className={`bk-slot bk-slot--${side}`}
            style={{ height: slotHeight, display: 'flex', alignItems: 'center' }}
          >
            <BracketMatchCard match={match} />
          </div>
        ))}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Verify TypeScript compiles**

```bash
cd /path/to/MySCORE/frontend && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 5: Commit**

```bash
git add frontend/src/components/bracket/BracketMatchCard.tsx \
        frontend/src/components/bracket/BracketRound.tsx \
        frontend/src/components/ui/Icon.tsx
git commit -m "feat: add BracketMatchCard and BracketRound components"
```

---

## Task 2: BracketPage, route, nav, and connector CSS

**Files:**
- Create: `frontend/src/pages/BracketPage.tsx`
- Modify: `frontend/src/components/layout/AppShell.tsx`
- Modify: `frontend/src/router.tsx`
- Modify: `frontend/src/styles/global.css`

**Interfaces:**
- Consumes: `BracketRound({ label, matches, slotHeight, side })` from Task 1
- Consumes: `matchesApi.getMatches(tournamentId)` — returns `Match[]`
- Consumes: `matchesApi.getActiveTournament()` — returns `Tournament`

---

- [ ] **Step 1: Add connector CSS to global.css**

Append to the end of `frontend/src/styles/global.css`:

```css
/* ── Knockout bracket connector lines ──────────────────────────────────── */

/* Shared: horizontal stub extending from the card edge into the gap */
.bk-slot--left::after,
.bk-slot--right::after {
  content: '';
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 24px;          /* must match ROUND_GAP in BracketPage */
  border-top: 1px solid var(--line-2);
  pointer-events: none;
}
.bk-slot--left::after  { right: -24px; }
.bk-slot--right::after { left: -24px; }

/* Vertical lines that bracket pairs (odd = top-of-pair, even = bottom-of-pair) */
.bk-slot--left::before,
.bk-slot--right::before {
  content: '';
  position: absolute;
  width: 0;
  border-right: 1px solid var(--line-2);
  pointer-events: none;
}
/* Top-of-pair: right border from centre downward */
.bk-slot--left:nth-child(odd)::before {
  right: -24px; top: 50%; height: 50%;
}
/* Bottom-of-pair: right border from centre upward */
.bk-slot--left:nth-child(even)::before {
  right: -24px; bottom: 50%; height: 50%;
}
/* Mirror for right side */
.bk-slot--right:nth-child(odd)::before {
  left: -24px; top: 50%; height: 50%;
}
.bk-slot--right:nth-child(even)::before {
  left: -24px; bottom: 50%; height: 50%;
}

/* Center and SF slots have no connectors — handled by explicit gap */
.bk-slot--center::before,
.bk-slot--center::after { display: none; }

/* Slots must be position: relative for pseudo-elements to work */
.bk-slot--left,
.bk-slot--right,
.bk-slot--center {
  position: relative;
}
```

- [ ] **Step 2: Create BracketPage**

Create `frontend/src/pages/BracketPage.tsx`:

```typescript
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { BracketRound } from '../components/bracket/BracketRound';
import type { Match, MatchStage } from '../types';

const SLOT_HEIGHT = 80;   // px — height of one R32 slot
const ROUND_GAP = 24;     // px — horizontal gap; must match CSS var
const CARD_WIDTH = 160;   // px

const KNOCKOUT_STAGES: MatchStage[] = ['r32', 'r16', 'qf', 'sf', 'third_place', 'final'];

function fillSlots(matches: Match[], count: number): (Match | null)[] {
  const slots = Array<Match | null>(count).fill(null);
  matches.slice(0, count).forEach((m, i) => { slots[i] = m; });
  return slots;
}

// Rounds on the left half of the bracket (converging to FINAL)
const LEFT_ROUNDS: { stage: MatchStage; label: string; halfCount: number }[] = [
  { stage: 'r32',  label: 'Round of 32', halfCount: 8 },
  { stage: 'r16',  label: 'Round of 16', halfCount: 4 },
  { stage: 'qf',   label: 'Quarter-finals', halfCount: 2 },
  { stage: 'sf',   label: 'Semi-finals', halfCount: 1 },
];

function MobileRound({ label, matches }: { label: string; matches: (Match | null)[] }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <h3 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mute)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 10 }}>
        {label}
      </h3>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
        {matches.map((m, i) => (
          <div key={m?.id ?? i} style={{
            background: 'var(--bg-2)', border: '1px solid var(--line)',
            borderRadius: 'var(--r-sm)', padding: '8px 12px', minWidth: 180,
          }}>
            {m ? (
              <>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--text)' }}>
                  <span>{m.homeTeam.fifaCode}</span>
                  {m.homeScore != null && m.awayScore != null && (
                    <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 800 }}>
                      {m.homeScore}–{m.awayScore}
                    </span>
                  )}
                  <span>{m.awayTeam.fifaCode}</span>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4 }}>
                  {m.status === 'live' ? '🔴 LIVE' : m.status === 'completed' ? 'FT' :
                    new Date(m.kickoffAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                </div>
              </>
            ) : (
              <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>TBD</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function BracketPage() {
  const { data: tournament } = useQuery({
    queryKey: ['tournament', 'active'],
    queryFn: matchesApi.getActiveTournament,
  });

  const { data: allMatches = [], isLoading } = useQuery({
    queryKey: ['matches', tournament?.id, 'knockout'],
    queryFn: () => matchesApi.getMatches(tournament!.id),
    enabled: !!tournament,
    select: (ms) =>
      ms
        .filter((m) => KNOCKOUT_STAGES.includes(m.stage))
        .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime()),
  });

  const byStage = (stage: MatchStage) => allMatches.filter((m) => m.stage === stage);

  // Left half: first N/2 matches of each round; right half: last N/2
  function halfSlots(stage: MatchStage, half: 'left' | 'right', halfCount: number): (Match | null)[] {
    const all = byStage(stage);
    const chunk = half === 'left' ? all.slice(0, halfCount) : all.slice(halfCount);
    return fillSlots(chunk, halfCount);
  }

  const finalMatches = fillSlots(byStage('final'), 1);
  const thirdMatches = fillSlots(byStage('third_place'), 1);

  // Total bracket height = 8 R32 slots per half × SLOT_HEIGHT
  const bracketHeight = 8 * SLOT_HEIGHT;

  if (isLoading) {
    return (
      <div style={{ color: 'var(--text-mute)', padding: 40, textAlign: 'center' }}>
        Loading bracket…
      </div>
    );
  }

  // ── Mobile fallback (≤880px via media query class) ──────────────────────
  const mobileView = (
    <div className="bracket-mobile">
      {LEFT_ROUNDS.map(({ stage, label, halfCount }) => (
        <MobileRound
          key={stage}
          label={label}
          matches={fillSlots(byStage(stage), halfCount * 2)}
        />
      ))}
      <MobileRound label="Semi-finals" matches={fillSlots(byStage('sf'), 2)} />
      <MobileRound label="3rd Place" matches={thirdMatches} />
      <MobileRound label="Final" matches={finalMatches} />
    </div>
  );

  // ── Desktop bracket tree ─────────────────────────────────────────────────
  const desktopView = (
    <div
      className="bracket-desktop"
      style={{
        display: 'flex',
        alignItems: 'center',
        gap: ROUND_GAP,
        overflowX: 'auto',
        paddingBottom: 16,
        minWidth: 'max-content',
      }}
    >
      {/* Left half: R32 → R16 → QF → SF (converging inward) */}
      {LEFT_ROUNDS.map(({ stage, label, halfCount }) => (
        <BracketRound
          key={`left-${stage}`}
          label={label}
          matches={halfSlots(stage, 'left', halfCount)}
          slotHeight={bracketHeight / halfCount}
          side="left"
        />
      ))}

      {/* Centre: FINAL + 3rd Place stacked */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>
        <div style={{ fontSize: 10, fontWeight: 700, color: 'var(--accent)', letterSpacing: '.07em', textTransform: 'uppercase', marginBottom: 4 }}>
          Final
        </div>
        {finalMatches.map((m, i) => (
          <div key={m?.id ?? i} className="bk-slot bk-slot--center" style={{ display: 'flex', alignItems: 'center' }}>
            {/* import BracketMatchCard inline for center */}
            {m ? (
              <div style={{
                width: CARD_WIDTH + 20, padding: '8px 12px',
                background: 'var(--bg-2)',
                border: `2px solid ${m.status === 'live' ? 'var(--live)' : m.status === 'completed' ? 'var(--accent)' : 'var(--line-2)'}`,
                borderRadius: 'var(--r)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 800, color: 'var(--text)' }}>
                  <span>{m.homeTeam.fifaCode}</span>
                  {m.homeScore != null && m.awayScore != null && (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{m.homeScore}–{m.awayScore}</span>
                  )}
                  <span>{m.awayTeam.fifaCode}</span>
                </div>
              </div>
            ) : (
              <div style={{
                width: CARD_WIDTH + 20, height: 52,
                border: '1px dashed var(--line-2)', borderRadius: 'var(--r)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>TBD</span>
              </div>
            )}
          </div>
        ))}
        <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-mute)', letterSpacing: '.06em', textTransform: 'uppercase', marginTop: 12 }}>
          3rd Place
        </div>
        {thirdMatches.map((m, i) => (
          <div key={m?.id ?? i} className="bk-slot bk-slot--center" style={{ display: 'flex', alignItems: 'center' }}>
            {m ? (
              <div style={{
                width: CARD_WIDTH + 20, padding: '8px 12px',
                background: 'var(--bg-2)',
                border: '1px solid var(--line-2)',
                borderRadius: 'var(--r)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 700, color: 'var(--text-dim)' }}>
                  <span>{m.homeTeam.fifaCode}</span>
                  {m.homeScore != null && m.awayScore != null && (
                    <span style={{ fontFamily: 'var(--font-mono)' }}>{m.homeScore}–{m.awayScore}</span>
                  )}
                  <span>{m.awayTeam.fifaCode}</span>
                </div>
              </div>
            ) : (
              <div style={{
                width: CARD_WIDTH + 20, height: 52,
                border: '1px dashed var(--line-2)', borderRadius: 'var(--r)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>TBD</span>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Right half: SF → QF → R16 → R32 (diverging outward) */}
      {[...LEFT_ROUNDS].reverse().map(({ stage, label, halfCount }) => (
        <BracketRound
          key={`right-${stage}`}
          label={label}
          matches={halfSlots(stage, 'right', halfCount)}
          slotHeight={bracketHeight / halfCount}
          side="right"
        />
      ))}
    </div>
  );

  return (
    <div>
      <h2 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)', marginBottom: 24 }}>
        Knockout Bracket
      </h2>
      {mobileView}
      {desktopView}
    </div>
  );
}
```

- [ ] **Step 3: Add mobile/desktop visibility CSS to global.css**

Append to `frontend/src/styles/global.css` (after the connector block added in Step 1):

```css
/* ── Bracket page responsive visibility ────────────────────────────────── */
.bracket-desktop { display: flex; }
.bracket-mobile  { display: none; }

@media (max-width: 880px) {
  .bracket-desktop { display: none; }
  .bracket-mobile  { display: block; }
}
```

- [ ] **Step 4: Add Bracket to AppShell NAV_ITEMS**

In `frontend/src/components/layout/AppShell.tsx`, change the `NAV_ITEMS` array to:

```typescript
const NAV_ITEMS = [
  { to: '/', label: 'Dashboard', icon: 'dashboard' },
  { to: '/matches', label: 'Matches', icon: 'matches' },
  { to: '/predictions', label: 'My Predictions', icon: 'predictions' },
  { to: '/bracket', label: 'Bracket', icon: 'bracket' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/profile', label: 'My Profile', icon: 'user' },
  { to: '/help', label: 'How it works', icon: 'info' },
];
```

Also add `'/bracket': 'Bracket'` to `PAGE_TITLES`:

```typescript
const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/matches': 'Matches',
  '/predictions': 'My Predictions',
  '/bracket': 'Bracket',
  '/leaderboard': 'Leaderboard',
  '/stats': 'Statistics',
  '/profile': 'My Profile',
  '/help': 'How it works',
  '/admin': 'Admin',
};
```

- [ ] **Step 5: Add /bracket route to router.tsx**

In `frontend/src/router.tsx`, add the import at the top:

```typescript
import BracketPage from './pages/BracketPage';
```

Inside the `ProtectedRoute` children, inside the `AppShell` children array, add:

```typescript
{ path: '/bracket', element: <BracketPage /> },
```

Full children array after change:
```typescript
children: [
  { path: '/', element: <DashboardPage /> },
  { path: '/matches', element: <MatchesPage /> },
  { path: '/predictions', element: <PredictionsPage /> },
  { path: '/bracket', element: <BracketPage /> },
  { path: '/leaderboard', element: <LeaderboardPage /> },
  { path: '/stats', element: <StatsPage /> },
  { path: '/profile', element: <ProfilePage /> },
  { path: '/help', element: <HelpPage /> },
],
```

- [ ] **Step 6: Verify TypeScript compiles**

```bash
cd /path/to/MySCORE/frontend && npx tsc --noEmit
```

Expected: no output (clean).

- [ ] **Step 7: Commit**

```bash
git add frontend/src/pages/BracketPage.tsx \
        frontend/src/components/layout/AppShell.tsx \
        frontend/src/router.tsx \
        frontend/src/styles/global.css
git commit -m "feat: add /bracket knockout bracket page with flex tree layout"
```

---

## Self-Review Notes

**Spec coverage:**
- ✅ `/bracket` route — Task 2 Step 5
- ✅ Static flex bracket — BracketPage desktop view
- ✅ CSS connector lines — Task 2 Step 1 global.css
- ✅ Left-mirror layout: L(R32→R16→QF→SF) | FINAL+3rd | (SF→QF→R16→R32)R — Task 2 Step 2
- ✅ Sorted by kickoffAt — `select` in useQuery
- ✅ Match card: fifaCode, score, status — BracketMatchCard Task 1 Step 2
- ✅ Empty placeholder slots — `fillSlots()` helper + TBD card in BracketMatchCard
- ✅ Mobile vertical list — MobileRound + CSS visibility — Task 2 Steps 2 & 3
- ✅ Nav link — Task 2 Step 4
- ✅ bracket icon — Task 1 Step 1
- ✅ No new backend endpoint

**Type consistency check:**
- `BracketRound` receives `matches: (Match | null)[]` — produced by `fillSlots()` which returns `(Match | null)[]` ✅
- `BracketMatchCard` receives `match: Match | null` — matches slot element type ✅
- `MatchStage` string literals used verbatim from types/index.ts ✅
- `halfSlots()` returns `(Match | null)[]` — passed directly to `BracketRound.matches` ✅
