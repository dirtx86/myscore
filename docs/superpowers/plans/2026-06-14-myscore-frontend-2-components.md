# MySCORE Frontend — Part 2: Layout & Components

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the AppShell layout, all shared UI components, match components, and leaderboard components.

**Architecture:** Components are pure presentational where possible; data-fetching hooks are co-located in `src/hooks/`. CSS custom properties from `src/styles/global.css` handle theming; Tailwind handles layout utilities. The `ToastContext` is wired at the app root so any component can trigger toasts without prop drilling. TanStack Query v5 manages all server state; optimistic updates are applied directly to the query cache.

**Tech Stack:** React 18, TypeScript 5, TanStack Query v5, CSS custom properties

**Prerequisites:** Part 1 (Foundation) must be complete. Types from `src/types/index.ts` are available. `src/styles/global.css` with all design tokens is in place. The Vite + Tailwind build pipeline is working.

---

## File Map

Files created or modified in this part:

| File | Responsibility |
|---|---|
| `src/components/layout/AppShell.tsx` | Root layout: sidebar + topbar + mobile tab bar wiring |
| `src/components/layout/Sidebar.tsx` | 244 px fixed sidebar with nav items, logo, user chip |
| `src/components/layout/Topbar.tsx` | Sticky header: page title, theme toggle, user avatar |
| `src/components/layout/MobileTabBar.tsx` | Fixed bottom nav for ≤880 px |
| `src/components/ui/Icon.tsx` | SVG icon wrapper, named paths |
| `src/components/ui/Flag.tsx` | Country flag via flagcdn |
| `src/components/ui/Avatar.tsx` | Initials-based avatar, deterministic color |
| `src/components/ui/StatusPill.tsx` | Match status pill (scheduled/locked/live/completed) |
| `src/components/ui/PtsTag.tsx` | Colored points badge |
| `src/components/ui/TeamTag.tsx` | Flag + FIFA code inline chip |
| `src/components/ui/Button.tsx` | Multi-variant button with loading spinner |
| `src/components/ui/Input.tsx` | Labeled input with error state |
| `src/components/ui/Card.tsx` | Base card container |
| `src/components/ui/Toast.tsx` | Toast renderer + `ToastContext` + `useToast` hook |
| `src/components/ui/Skeleton.tsx` | Shimmer skeleton (`Skel`) |
| `src/components/match/ScoreInput.tsx` | Stepper + number input, keyboard-friendly |
| `src/components/match/PredictionForm.tsx` | Prediction entry form with lock/countdown logic |
| `src/components/match/MatchCard.tsx` | Full match card with prediction/result display |
| `src/components/match/LiveMatchHero.tsx` | Prominent live-match card |
| `src/components/match/MiniMatch.tsx` | Compact match row for lists |
| `src/components/leaderboard/RankMedal.tsx` | Gold/silver/bronze badge |
| `src/components/leaderboard/PodiumRow.tsx` | Top-3 podium display card |
| `src/components/leaderboard/StandingsTable.tsx` | Full standings table |
| `src/hooks/useToast.ts` | Re-export of `useToast` from Toast.tsx |
| `src/hooks/useMatches.ts` | TanStack Query hook for match list |
| `src/hooks/usePredictions.ts` | Hooks for prediction list + optimistic save mutation |
| `src/hooks/useLeaderboard.ts` | TanStack Query hook for leaderboard |
| `src/hooks/useStats.ts` | TanStack Query hook for user stats |
| `src/api/client.ts` | Axios instance (created here if not done in Part 1) |
| `src/types/index.ts` | `ScoreRules` + `Stats` type additions |
| `src/__tests__/components/ScoreInput.test.tsx` | ScoreInput unit tests |
| `src/__tests__/components/StatusPill.test.tsx` | StatusPill unit tests |
| `src/__tests__/components/StandingsTable.test.tsx` | StandingsTable unit tests |
| `src/__tests__/hooks/usePredictions.test.tsx` | useSavePrediction optimistic-update tests |

---

## Task 1: AppShell + Sidebar + Topbar + MobileTabBar

**Files:**
- Create: `src/components/layout/AppShell.tsx`
- Create: `src/components/layout/Sidebar.tsx`
- Create: `src/components/layout/Topbar.tsx`
- Create: `src/components/layout/MobileTabBar.tsx`

- [ ] **Step 1.1: Add `ScoreRules` and `Stats` types to `src/types/index.ts`**

Open `src/types/index.ts` and append at the end:

```typescript
export interface ScoreRules {
  totoPts: number;       // points for correct outcome (win/draw/loss)
  goalDiffPts: number;   // additional pts for correct goal difference
  fullScorePts: number;  // additional pts for exact scoreline
}

export interface Stats {
  totalPredictions: number;
  fullScoreCount: number;
  goalDiffCount: number;
  totoCount: number;
  zeroCount: number;
  totalPts: number;
  rank: number;
  playedMatches: number;
}
```

- [ ] **Step 1.2: Create `src/components/layout/Sidebar.tsx`**

```tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

interface NavItem {
  to: string;
  label: string;
  icon: string;
  badge?: number;
}

interface SidebarProps {
  navItems: NavItem[];
  onLogout: () => void;
}

export function Sidebar({ navItems, onLogout }: SidebarProps) {
  const location = useLocation();
  const user = useAuthStore((s) => s.user);

  return (
    <aside className="sidebar">
      {/* Logo */}
      <div className="brand">
        <div className="brand-mark">
          <Icon name="trophy" size={20} fill />
        </div>
        <div>
          <div className="brand-name">MySCORE</div>
          <div className="brand-sub">WC2026</div>
        </div>
      </div>

      {/* Nav */}
      <nav className="nav" aria-label="Main navigation">
        {navItems.map((item) => {
          const isActive = location.pathname === item.to ||
            (item.to !== '/' && location.pathname.startsWith(item.to));
          return (
            <NavLink
              key={item.to}
              to={item.to}
              className={`nav-item${isActive ? ' active' : ''}`}
              aria-current={isActive ? 'page' : undefined}
            >
              <Icon name={item.icon} size={19} className="ico" />
              {item.label}
              {item.badge != null && item.badge > 0 && (
                <span className="nav-badge" aria-label={`${item.badge} pending`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* User chip at bottom */}
      {user && (
        <div className="nav-foot">
          <div className="userchip">
            <Avatar displayName={user.displayName} size={34} />
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 700, fontSize: 13.5, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user.displayName}
              </div>
              <div className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {user.role}
              </div>
            </div>
            <button
              className="btn btn-ghost btn-sm"
              style={{ padding: 7 }}
              title="Log out"
              onClick={onLogout}
              aria-label="Log out"
            >
              <Icon name="logout" size={16} />
            </button>
          </div>
        </div>
      )}
    </aside>
  );
}
```

- [ ] **Step 1.3: Create `src/components/layout/Topbar.tsx`**

```tsx
import React from 'react';
import { Icon } from '../ui/Icon';
import { Avatar } from '../ui/Avatar';
import { useAuthStore } from '../../store/authStore';

interface TopbarProps {
  title: string;
  theme: 'dark' | 'light';
  onToggleTheme: () => void;
}

export function Topbar({ title, theme, onToggleTheme }: TopbarProps) {
  const user = useAuthStore((s) => s.user);

  return (
    <header className="topbar" role="banner">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <span style={{ fontWeight: 800, fontSize: 15 }}>{title}</span>
      </div>

      <div style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10 }}>
        <button
          className="btn btn-ghost btn-sm"
          style={{ padding: 9 }}
          onClick={onToggleTheme}
          title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
          aria-label={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
        >
          <Icon name={theme === 'dark' ? 'sun' : 'moon'} size={18} />
        </button>

        {user && (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <Avatar displayName={user.displayName} size={32} />
            <span style={{ fontSize: 13.5, fontWeight: 600, color: 'var(--text-dim)' }} className="hide-mobile">
              {user.displayName}
            </span>
          </div>
        )}
      </div>
    </header>
  );
}
```

- [ ] **Step 1.4: Create `src/components/layout/MobileTabBar.tsx`**

```tsx
import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { Icon } from '../ui/Icon';

interface TabItem {
  to: string;
  label: string;
  icon: string;
}

interface MobileTabBarProps {
  tabs: TabItem[];
}

export function MobileTabBar({ tabs }: MobileTabBarProps) {
  const location = useLocation();

  return (
    <nav className="mobile-tab" aria-label="Mobile navigation">
      {tabs.map((tab) => {
        const isActive = location.pathname === tab.to ||
          (tab.to !== '/' && location.pathname.startsWith(tab.to));
        return (
          <NavLink
            key={tab.to}
            to={tab.to}
            className={isActive ? 'active' : ''}
            aria-current={isActive ? 'page' : undefined}
          >
            <Icon name={tab.icon} size={20} />
            <span>{tab.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );
}
```

- [ ] **Step 1.5: Create `src/components/layout/AppShell.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { MobileTabBar } from './MobileTabBar';
import { useAuthStore } from '../../store/authStore';

const NAV_ITEMS = [
  { to: '/dashboard', label: 'Dashboard', icon: 'dashboard' },
  { to: '/matches',   label: 'Matches',   icon: 'matches' },
  { to: '/predictions', label: 'My Predictions', icon: 'predictions' },
  { to: '/leaderboard', label: 'Leaderboard', icon: 'leaderboard' },
  { to: '/stats',     label: 'Statistics', icon: 'stats' },
];

const ADMIN_NAV = { to: '/admin', label: 'Admin', icon: 'admin' };

const MOBILE_TABS = NAV_ITEMS.slice(0, 5);

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':   'Dashboard',
  '/matches':     'Matches',
  '/predictions': 'My Predictions',
  '/leaderboard': 'Leaderboard',
  '/stats':       'Statistics',
  '/admin':       'Admin',
};

function getThemePreference(): 'dark' | 'light' {
  try {
    return (localStorage.getItem('myscore-theme') as 'dark' | 'light') || 'dark';
  } catch {
    return 'dark';
  }
}

export function AppShell() {
  const [theme, setTheme] = useState<'dark' | 'light'>(getThemePreference);
  const location = useLocation();
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);

  // Apply theme attribute to html element
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    try { localStorage.setItem('myscore-theme', theme); } catch { /* ignore */ }
  }, [theme]);

  const toggleTheme = () => setTheme((t) => (t === 'dark' ? 'light' : 'dark'));

  const currentPath = '/' + location.pathname.split('/')[1];
  const pageTitle = PAGE_TITLES[currentPath] || 'MySCORE';

  const navItems = user?.role === 'admin'
    ? [...NAV_ITEMS, ADMIN_NAV]
    : NAV_ITEMS;

  return (
    <div className="app">
      <Sidebar navItems={navItems} onLogout={logout} />

      <div className="main">
        <Topbar title={pageTitle} theme={theme} onToggleTheme={toggleTheme} />
        <main className="page" id="main-content">
          <Outlet />
        </main>
      </div>

      <MobileTabBar tabs={MOBILE_TABS} />
    </div>
  );
}
```

- [ ] **Step 1.6: Verify the build compiles**

```bash
cd /path/to/project && npm run build 2>&1 | tail -20
```

Expected: no TypeScript errors. If `useAuthStore` or `react-router-dom` aren't set up yet (Part 1 concern), the import errors are expected and will be fixed when those pieces land. The component logic itself must be error-free.

- [ ] **Step 1.7: Commit**

```bash
git add src/components/layout/ src/types/index.ts
git commit -m "feat: add AppShell, Sidebar, Topbar, MobileTabBar layout components"
```

---

## Task 2: UI Atoms — Icon, Flag, Avatar, StatusPill, PtsTag, TeamTag

**Files:**
- Create: `src/components/ui/Icon.tsx`
- Create: `src/components/ui/Flag.tsx`
- Create: `src/components/ui/Avatar.tsx`
- Create: `src/components/ui/StatusPill.tsx`
- Create: `src/components/ui/PtsTag.tsx`
- Create: `src/components/ui/TeamTag.tsx`
- Create: `src/__tests__/components/StatusPill.test.tsx`

- [ ] **Step 2.1: Create `src/components/ui/Icon.tsx`**

```tsx
import React from 'react';

const ICON_PATHS: Record<string, string> = {
  home:         'M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z M9 22V12h6v10',
  trophy:       'M8 21h8m-4-4v4M7 4h10v5a5 5 0 0 1-10 0V4ZM7 4H4v2a3 3 0 0 0 3 3m10-5h3v2a3 3 0 0 1-3 3',
  calendar:     'M8 2v4M16 2v4M3 10h18M5 4h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2Z',
  'chart-bar':  'M4 20h4v-7H4v7Zm6 0h4V4h-4v16Zm6 0h4v-11h-4v11Z',
  settings:     'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z',
  user:         'M20 21a8 8 0 1 0-16 0M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z',
  check:        'M20 6L9 17l-5-5',
  x:            'M18 6 6 18M6 6l12 12',
  'chevron-up': 'M18 15l-6-6-6 6',
  'chevron-down':'M6 9l6 6 6-6',
  lock:         'M19 11H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2ZM7 11V7a5 5 0 0 1 10 0v4',
  star:         'M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2Z',
  shield:       'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z',
  // Layout / nav
  dashboard:    'M3 13h8V3H3v10Zm0 8h8v-6H3v6Zm10 0h8V11h-8v10Zm0-18v6h8V3h-8Z',
  matches:      'M12 3v18M3 8h3a3 3 0 0 0 0 6H3m18-6h-3a3 3 0 0 1 0 6h3M3 6v12m18-12v12',
  predictions:  'M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11',
  leaderboard:  'M4 20h4v-7H4v7Zm6 0h4V4h-4v16Zm6 0h4v-11h-4v11Z',
  stats:        'M3 3v18h18M7 14l3-4 3 3 5-7',
  admin:        'M12 15a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.1a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.1a1.6 1.6 0 0 0 1.1-2.7l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 2.7-1.1V3a2 2 0 1 1 4 0v.1a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0 1.1 2.7H21a2 2 0 1 1 0 4h-.1a1.6 1.6 0 0 0-1.5 1Z',
  // Status / misc
  bell:         'M18 8a6 6 0 1 0-12 0c0 7-3 9-3 9h18s-3-2-3-9M13.7 21a2 2 0 0 1-3.4 0',
  logout:       'M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9',
  sun:          'M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10ZM12 1v2m0 18v2M4.2 4.2l1.4 1.4m12.8 12.8 1.4 1.4M1 12h2m18 0h2M4.2 19.8l1.4-1.4M18.4 5.6l1.4-1.4',
  moon:         'M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z',
  plus:         'M12 5v14M5 12h14',
  minus:        'M5 12h14',
  search:       'M21 21l-4.3-4.3M11 19a8 8 0 1 0 0-16 8 8 0 0 0 0 16Z',
  'arrow-up':   'M12 19V5M5 12l7-7 7 7',
  'arrow-down': 'M12 5v14M19 12l-7 7-7-7',
  dash:         'M5 12h14',
  filter:       'M22 3H2l8 9.5V19l4 2v-8.5L22 3Z',
  edit:         'M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z',
  trash:        'M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2m2 0v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6',
  clock:        'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20ZM12 6v6l4 2',
  target:       'M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20Zm0-4a6 6 0 1 0 0-12 6 6 0 0 0 0 12Zm0-4a2 2 0 1 0 0-4 2 2 0 0 0 0 4Z',
};

export interface IconProps {
  name: string;
  size?: number;
  className?: string;
  fill?: boolean;
  style?: React.CSSProperties;
}

export function Icon({ name, size = 20, className, fill = false, style }: IconProps) {
  const d = ICON_PATHS[name] ?? '';
  return (
    <svg
      className={className}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill={fill ? 'currentColor' : 'none'}
      stroke={fill ? 'none' : 'currentColor'}
      strokeWidth="1.9"
      strokeLinecap="round"
      strokeLinejoin="round"
      style={style}
      aria-hidden="true"
    >
      {d.split(' M').map((seg, i) => (
        <path key={i} d={(i ? 'M' : '') + seg} />
      ))}
    </svg>
  );
}
```

- [ ] **Step 2.2: Create `src/components/ui/Flag.tsx`**

```tsx
import React from 'react';

export interface FlagProps {
  isoCode: string;
  size?: number;
  className?: string;
}

export function Flag({ isoCode, size = 24, className }: FlagProps) {
  return (
    <img
      src={`https://flagcdn.com/${isoCode.toLowerCase()}.svg`}
      width={size}
      height={size}
      alt={isoCode.toUpperCase()}
      className={`rounded-sm object-cover flag${className ? ` ${className}` : ''}`}
      loading="lazy"
    />
  );
}
```

- [ ] **Step 2.3: Create `src/components/ui/Avatar.tsx`**

```tsx
import React from 'react';

const AVATAR_COLORS = [
  '#ff8a3d',
  '#5b8def',
  '#19c08a',
  '#c45bef',
  '#ef5b7a',
  '#e0a619',
  '#3dd6c4',
  '#8d6bef',
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash * 31 + str.charCodeAt(i)) >>> 0;
  }
  return hash;
}

function getInitials(displayName: string): string {
  return displayName
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('');
}

function getAvatarColor(displayName: string): string {
  const index = hashString(displayName) % AVATAR_COLORS.length;
  return AVATAR_COLORS[index];
}

export interface AvatarProps {
  displayName: string;
  size?: number;
  className?: string;
}

export function Avatar({ displayName, size = 36, className }: AvatarProps) {
  const initials = getInitials(displayName);
  const bg = getAvatarColor(displayName);

  return (
    <div
      className={`avatar${className ? ` ${className}` : ''}`}
      style={{
        width: size,
        height: size,
        fontSize: Math.round(size * 0.38),
        background: `linear-gradient(145deg, ${bg}, color-mix(in oklab, ${bg} 55%, #000))`,
        fontFamily: 'var(--font-mono)',
      }}
      aria-label={displayName}
      role="img"
    >
      {initials}
    </div>
  );
}
```

- [ ] **Step 2.4: Create `src/components/ui/StatusPill.tsx`**

```tsx
import React from 'react';
import type { MatchStatus } from '../../types';
import { Icon } from './Icon';

export interface StatusPillProps {
  status: MatchStatus;
  minute?: number;
}

export function StatusPill({ status, minute }: StatusPillProps) {
  if (status === 'live') {
    return (
      <span className="pill pill-live">
        <span className="dot" aria-hidden="true" />
        LIVE
        {minute != null && <span aria-label={`${minute} minutes`}>{minute}'</span>}
      </span>
    );
  }
  if (status === 'locked') {
    return (
      <span className="pill pill-locked">
        <Icon name="lock" size={11} />
        Locked
      </span>
    );
  }
  if (status === 'completed') {
    return <span className="pill pill-done">FT</span>;
  }
  // scheduled
  return <span className="pill pill-scheduled">Scheduled</span>;
}
```

- [ ] **Step 2.5: Create `src/components/ui/PtsTag.tsx`**

```tsx
import React from 'react';
import type { ScoreRules } from '../../types';

export interface PtsTagProps {
  pts: number | null | undefined;
  rules: ScoreRules;
}

export function PtsTag({ pts, rules }: PtsTagProps) {
  if (pts == null) {
    return (
      <span className="tag-pts" style={{ background: 'var(--bg-3)', color: 'var(--text-mute)' }}>
        —
      </span>
    );
  }

  const { totoPts, fullScorePts, goalDiffPts } = rules;
  const fullScore = totoPts + fullScorePts;
  const goalDiff = totoPts + goalDiffPts;

  let style: React.CSSProperties;
  let label: string;

  if (pts === fullScore) {
    // Perfect prediction
    style = {
      background: 'color-mix(in oklab, var(--accent) 22%, transparent)',
      color: 'var(--accent)',
    };
    label = `+${pts} pts`;
  } else if (pts === goalDiff) {
    // Correct goal difference
    style = {
      background: 'color-mix(in oklab, var(--info) 20%, transparent)',
      color: 'var(--info)',
    };
    label = `+${pts} pts`;
  } else if (pts === totoPts) {
    // Correct outcome only
    style = {
      background: 'var(--bg-3)',
      color: 'var(--text-dim)',
    };
    label = `+${pts} pts`;
  } else if (pts === 0) {
    style = {
      background: 'color-mix(in oklab, var(--danger) 18%, transparent)',
      color: 'var(--danger)',
    };
    label = '0 pts';
  } else {
    // Partial / unexpected value
    style = { background: 'var(--bg-3)', color: 'var(--text-dim)' };
    label = `+${pts} pts`;
  }

  return (
    <span className="tag-pts" style={style}>
      {label}
    </span>
  );
}
```

- [ ] **Step 2.6: Create `src/components/ui/TeamTag.tsx`**

```tsx
import React from 'react';
import type { Team } from '../../types';
import { Flag } from './Flag';

export interface TeamTagProps {
  team: Team;
}

export function TeamTag({ team }: TeamTagProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Flag isoCode={team.isoCode} size={16} />
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em' }}>
        {team.fifaCode}
      </span>
    </span>
  );
}
```

- [ ] **Step 2.7: Write tests for `StatusPill`**

Create `src/__tests__/components/StatusPill.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StatusPill } from '../../components/ui/StatusPill';

describe('StatusPill', () => {
  it('renders "Scheduled" for scheduled status', () => {
    render(<StatusPill status="scheduled" />);
    expect(screen.getByText('Scheduled')).toBeInTheDocument();
  });

  it('renders "Locked" for locked status', () => {
    render(<StatusPill status="locked" />);
    expect(screen.getByText('Locked')).toBeInTheDocument();
  });

  it('renders "FT" for completed status', () => {
    render(<StatusPill status="completed" />);
    expect(screen.getByText('FT')).toBeInTheDocument();
  });

  it('renders "LIVE" for live status without minute', () => {
    render(<StatusPill status="live" />);
    expect(screen.getByText('LIVE')).toBeInTheDocument();
  });

  it('renders live minute when provided', () => {
    render(<StatusPill status="live" minute={67} />);
    expect(screen.getByText("67'")).toBeInTheDocument();
  });

  it('applies pill-live class for live status', () => {
    const { container } = render(<StatusPill status="live" />);
    expect(container.firstChild).toHaveClass('pill-live');
  });

  it('applies pill-locked class for locked status', () => {
    const { container } = render(<StatusPill status="locked" />);
    expect(container.firstChild).toHaveClass('pill-locked');
  });
});
```

- [ ] **Step 2.8: Run tests**

```bash
npm test -- --testPathPattern="StatusPill" --watchAll=false 2>&1 | tail -20
```

Expected: 7 tests pass.

- [ ] **Step 2.9: Commit**

```bash
git add src/components/ui/Icon.tsx src/components/ui/Flag.tsx src/components/ui/Avatar.tsx \
        src/components/ui/StatusPill.tsx src/components/ui/PtsTag.tsx src/components/ui/TeamTag.tsx \
        src/__tests__/components/StatusPill.test.tsx
git commit -m "feat: add Icon, Flag, Avatar, StatusPill, PtsTag, TeamTag atoms"
```

---

## Task 3: UI Primitives — Button, Input, Card, Toast, Skeleton

**Files:**
- Create: `src/components/ui/Button.tsx`
- Create: `src/components/ui/Input.tsx`
- Create: `src/components/ui/Card.tsx`
- Create: `src/components/ui/Toast.tsx`
- Create: `src/components/ui/Skeleton.tsx`
- Create: `src/hooks/useToast.ts`

- [ ] **Step 3.1: Create `src/components/ui/Button.tsx`**

```tsx
import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
  children: React.ReactNode;
}

const VARIANT_CLASS: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary:   'btn btn-primary',
  secondary: 'btn',
  ghost:     'btn btn-ghost',
  danger:    'btn btn-danger',
};

const SIZE_CLASS: Record<NonNullable<ButtonProps['size']>, string> = {
  sm: 'btn-sm',
  md: '',
  lg: 'btn-lg',
};

export function Button({
  variant = 'secondary',
  size = 'md',
  loading = false,
  disabled,
  children,
  className,
  ...rest
}: ButtonProps) {
  const classes = [
    VARIANT_CLASS[variant],
    SIZE_CLASS[size],
    loading ? 'btn-loading' : '',
    className ?? '',
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      className={classes}
      disabled={disabled || loading}
      aria-busy={loading}
      {...rest}
    >
      {loading && (
        <span
          aria-hidden="true"
          style={{
            display: 'inline-block',
            width: '1em',
            height: '1em',
            border: '2px solid currentColor',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.7s linear infinite',
          }}
        />
      )}
      {children}
    </button>
  );
}
```

Add the `spin` keyframe once in `src/styles/global.css` (append, do not replace existing content):

```css
@keyframes spin { to { transform: rotate(360deg); } }
.btn-danger { background: var(--danger); color: #fff; border-color: transparent; }
.btn-danger:hover { filter: brightness(1.08); }
```

- [ ] **Step 3.2: Create `src/components/ui/Input.tsx`**

```tsx
import React from 'react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ label, error, className, id, ...rest }, ref) => {
    const inputId = id ?? (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

    const inputStyle: React.CSSProperties = {
      background: 'var(--bg-inset)',
      border: `1px solid ${error ? 'var(--danger)' : 'var(--line-2)'}`,
      borderRadius: 'var(--r-sm)',
      padding: '10px 14px',
      color: 'var(--text)',
      fontFamily: 'var(--font-sans)',
      fontSize: 14,
      width: '100%',
      outline: 'none',
      transition: 'border-color 0.14s, box-shadow 0.14s',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
        {label && (
          <label
            htmlFor={inputId}
            className="label"
          >
            {label}
          </label>
        )}
        <input
          ref={ref}
          id={inputId}
          className={`input${className ? ` ${className}` : ''}`}
          style={inputStyle}
          aria-invalid={error ? 'true' : undefined}
          aria-describedby={error ? `${inputId}-error` : undefined}
          {...rest}
        />
        {error && (
          <span
            id={`${inputId}-error`}
            role="alert"
            style={{ fontSize: 12, color: 'var(--danger)', marginTop: -3 }}
          >
            {error}
          </span>
        )}
      </div>
    );
  },
);

Input.displayName = 'Input';
```

- [ ] **Step 3.3: Create `src/components/ui/Card.tsx`**

```tsx
import React from 'react';

export interface CardProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  padding?: boolean;
}

export function Card({ children, className, style, padding = true }: CardProps) {
  return (
    <div
      className={`card${padding ? ' card-pad' : ''}${className ? ` ${className}` : ''}`}
      style={style}
    >
      {children}
    </div>
  );
}
```

- [ ] **Step 3.4: Create `src/components/ui/Toast.tsx`**

```tsx
import React, { useState, useCallback, useContext, createContext } from 'react';
import { Icon } from './Icon';

export type ToastType = 'success' | 'error' | 'info';

interface ToastItem {
  id: number;
  message: string;
  type: ToastType;
}

interface ToastContextValue {
  toast: (message: string, type?: ToastType) => void;
}

export const ToastContext = createContext<ToastContextValue>({
  toast: () => {},
});

const TOAST_DURATION_MS = 3000;
const MAX_TOASTS = 3;

const TYPE_CONFIG: Record<ToastType, { icon: string; color: string; borderColor: string }> = {
  success: { icon: 'check',   color: 'var(--live)',   borderColor: 'var(--live)'   },
  error:   { icon: 'x',      color: 'var(--danger)', borderColor: 'var(--danger)' },
  info:    { icon: 'bell',   color: 'var(--info)',   borderColor: 'var(--info)'   },
};

export function ToastHost({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((message: string, type: ToastType = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => {
      const next = [...prev, { id, message, type }];
      // Keep max 3 toasts; drop oldest if over limit
      return next.length > MAX_TOASTS ? next.slice(next.length - MAX_TOASTS) : next;
    });
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, TOAST_DURATION_MS);
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        className="toast-wrap"
        aria-live="polite"
        aria-label="Notifications"
      >
        {toasts.map((t) => {
          const cfg = TYPE_CONFIG[t.type];
          return (
            <div
              key={t.id}
              className="toast"
              role="status"
              style={{ borderLeftColor: cfg.borderColor }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <Icon name={cfg.icon} size={17} style={{ color: cfg.color, flexShrink: 0 }} />
                <span style={{ fontWeight: 700, fontSize: 13.5 }}>{t.message}</span>
              </div>
            </div>
          );
        })}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast(): ToastContextValue {
  return useContext(ToastContext);
}
```

- [ ] **Step 3.5: Create `src/hooks/useToast.ts`**

```typescript
// Re-export from the UI component so hooks dir is the canonical import path
export { useToast } from '../components/ui/Toast';
export type { ToastType } from '../components/ui/Toast';
```

- [ ] **Step 3.6: Create `src/components/ui/Skeleton.tsx`**

```tsx
import React from 'react';

export interface SkelProps {
  width?: string;
  height?: string;
  className?: string;
  style?: React.CSSProperties;
}

export function Skel({ width = '100%', height = '16px', className, style }: SkelProps) {
  return (
    <div
      className={`skel${className ? ` ${className}` : ''}`}
      style={{ width, height, ...style }}
      aria-hidden="true"
    />
  );
}
```

- [ ] **Step 3.7: Append spin keyframe and danger button style to `src/styles/global.css`**

Open `src/styles/global.css` and append at the very end:

```css
/* ============================================================
   Button extras
   ============================================================ */
@keyframes spin { to { transform: rotate(360deg); } }
.btn-danger { background: var(--danger); color: #fff; border-color: transparent; }
.btn-danger:hover { filter: brightness(1.08); }
```

- [ ] **Step 3.8: Verify build still passes**

```bash
npm run build 2>&1 | grep -E "(error|warning)" | head -20
```

Expected: no new errors.

- [ ] **Step 3.9: Commit**

```bash
git add src/components/ui/Button.tsx src/components/ui/Input.tsx src/components/ui/Card.tsx \
        src/components/ui/Toast.tsx src/components/ui/Skeleton.tsx \
        src/hooks/useToast.ts src/styles/global.css
git commit -m "feat: add Button, Input, Card, Toast/ToastHost, Skel primitives"
```

---

## Task 4: Match Components — ScoreInput, PredictionForm, MatchCard, LiveMatchHero, MiniMatch

**Files:**
- Create: `src/components/match/ScoreInput.tsx`
- Create: `src/components/match/PredictionForm.tsx`
- Create: `src/components/match/MatchCard.tsx`
- Create: `src/components/match/LiveMatchHero.tsx`
- Create: `src/components/match/MiniMatch.tsx`
- Create: `src/__tests__/components/ScoreInput.test.tsx`

- [ ] **Step 4.1: Write failing tests for `ScoreInput`**

Create `src/__tests__/components/ScoreInput.test.tsx`:

```tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { ScoreInput } from '../../components/match/ScoreInput';

describe('ScoreInput', () => {
  it('renders current value', () => {
    render(<ScoreInput value={3} onChange={jest.fn()} />);
    expect(screen.getByDisplayValue('3')).toBeInTheDocument();
  });

  it('increment button calls onChange with value + 1', async () => {
    const onChange = jest.fn();
    render(<ScoreInput value={2} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase score'));
    expect(onChange).toHaveBeenCalledWith(3);
  });

  it('decrement button calls onChange with value - 1', async () => {
    const onChange = jest.fn();
    render(<ScoreInput value={2} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease score'));
    expect(onChange).toHaveBeenCalledWith(1);
  });

  it('does not go below 0', async () => {
    const onChange = jest.fn();
    render(<ScoreInput value={0} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Decrease score'));
    expect(onChange).toHaveBeenCalledWith(0);
  });

  it('does not go above 20', async () => {
    const onChange = jest.fn();
    render(<ScoreInput value={20} onChange={onChange} />);
    await userEvent.click(screen.getByLabelText('Increase score'));
    expect(onChange).toHaveBeenCalledWith(20);
  });

  it('ArrowUp key increments', async () => {
    const onChange = jest.fn();
    render(<ScoreInput value={5} onChange={onChange} />);
    const input = screen.getByDisplayValue('5');
    fireEvent.keyDown(input, { key: 'ArrowUp' });
    expect(onChange).toHaveBeenCalledWith(6);
  });

  it('ArrowDown key decrements', async () => {
    const onChange = jest.fn();
    render(<ScoreInput value={5} onChange={onChange} />);
    const input = screen.getByDisplayValue('5');
    fireEvent.keyDown(input, { key: 'ArrowDown' });
    expect(onChange).toHaveBeenCalledWith(4);
  });

  it('disabled state disables all controls', () => {
    render(<ScoreInput value={0} onChange={jest.fn()} disabled />);
    expect(screen.getByLabelText('Increase score')).toBeDisabled();
    expect(screen.getByLabelText('Decrease score')).toBeDisabled();
    expect(screen.getByRole('spinbutton')).toBeDisabled();
  });

  it('rejects non-digit input and keeps previous value', async () => {
    const onChange = jest.fn();
    render(<ScoreInput value={3} onChange={onChange} />);
    const input = screen.getByDisplayValue('3') as HTMLInputElement;
    // Type 'a' — should not call onChange
    await userEvent.type(input, 'a');
    expect(onChange).not.toHaveBeenCalled();
  });
});
```

- [ ] **Step 4.2: Run tests — expect failures**

```bash
npm test -- --testPathPattern="ScoreInput" --watchAll=false 2>&1 | tail -10
```

Expected: fails with "Cannot find module '../../components/match/ScoreInput'".

- [ ] **Step 4.3: Create `src/components/match/ScoreInput.tsx`**

```tsx
import React, { useCallback } from 'react';

export interface ScoreInputProps {
  value: number;
  onChange: (v: number) => void;
  disabled?: boolean;
}

const clamp = (v: number) => Math.max(0, Math.min(20, v));

export function ScoreInput({ value, onChange, disabled = false }: ScoreInputProps) {
  const increment = useCallback(() => onChange(clamp(value + 1)), [value, onChange]);
  const decrement = useCallback(() => onChange(clamp(value - 1)), [value, onChange]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowUp') {
      e.preventDefault();
      onChange(clamp(value + 1));
    } else if (e.key === 'ArrowDown') {
      e.preventDefault();
      onChange(clamp(value - 1));
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value;
    // Accept only digit characters, max 2 chars
    if (!/^\d{0,2}$/.test(raw)) return;
    if (raw === '') return; // Keep current value if cleared
    const num = parseInt(raw, 10);
    if (!isNaN(num)) onChange(clamp(num));
  };

  return (
    <div
      className="stepper"
      style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 4, opacity: disabled ? 0.5 : 1 }}
    >
      <button
        type="button"
        className="step-btn"
        onClick={increment}
        disabled={disabled}
        aria-label="Increase score"
      >
        ▲
      </button>

      <input
        type="number"
        inputMode="numeric"
        className="score-input"
        value={value}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        min={0}
        max={20}
        aria-label="Score"
        style={{ MozAppearance: 'textfield' } as React.CSSProperties}
      />

      <button
        type="button"
        className="step-btn"
        onClick={decrement}
        disabled={disabled}
        aria-label="Decrease score"
      >
        ▼
      </button>
    </div>
  );
}
```

- [ ] **Step 4.4: Run tests — expect all pass**

```bash
npm test -- --testPathPattern="ScoreInput" --watchAll=false 2>&1 | tail -15
```

Expected: 9 tests pass.

- [ ] **Step 4.5: Create `src/components/match/PredictionForm.tsx`**

```tsx
import React, { useState, useEffect } from 'react';
import type { Match, Prediction, ScoreRules } from '../../types';
import { ScoreInput } from './ScoreInput';
import { Flag } from '../ui/Flag';
import { Icon } from '../ui/Icon';
import { Button } from '../ui/Button';
import { PtsTag } from '../ui/PtsTag';
import { useToast } from '../../hooks/useToast';

export interface PredictionFormProps {
  match: Match;
  prediction?: Prediction;
  rules: ScoreRules;
  onSave: (home: number, away: number) => Promise<void>;
  isLocked: boolean;
}

function computePts(
  homeGuess: number,
  awayGuess: number,
  homeResult: number,
  awayResult: number,
  rules: ScoreRules,
): number {
  const guessOutcome = Math.sign(homeGuess - awayGuess);
  const realOutcome  = Math.sign(homeResult - awayResult);
  if (guessOutcome !== realOutcome) return 0;

  let pts = rules.totoPts;
  const guessDiff = homeGuess - awayGuess;
  const realDiff  = homeResult - awayResult;
  if (guessDiff === realDiff) pts += rules.goalDiffPts;
  if (homeGuess === homeResult && awayGuess === awayResult) pts += rules.fullScorePts;
  return pts;
}

function getLockedCountdown(kickoffAt: string): string {
  const ms = new Date(kickoffAt).getTime() - Date.now();
  if (ms <= 0) return 'Locked';
  const minutes = Math.ceil(ms / 60000);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
}

export function PredictionForm({
  match,
  prediction,
  rules,
  onSave,
  isLocked,
}: PredictionFormProps) {
  const { toast } = useToast();
  const [homeScore, setHomeScore] = useState<number>(prediction?.homeScore ?? 0);
  const [awayScore, setAwayScore] = useState<number>(prediction?.awayScore ?? 0);
  const [saving, setSaving] = useState(false);

  // Sync local state when prediction prop changes (e.g. after optimistic update resolves)
  useEffect(() => {
    setHomeScore(prediction?.homeScore ?? 0);
    setAwayScore(prediction?.awayScore ?? 0);
  }, [prediction?.homeScore, prediction?.awayScore]);

  const isDirty =
    homeScore !== (prediction?.homeScore ?? null) ||
    awayScore !== (prediction?.awayScore ?? null);

  // Points preview if match is completed
  const ptsPreview =
    match.status === 'completed' &&
    match.homeScore != null &&
    match.awayScore != null
      ? computePts(homeScore, awayScore, match.homeScore, match.awayScore, rules)
      : null;

  const handleSave = async () => {
    setSaving(true);
    try {
      await onSave(homeScore, awayScore);
      toast(
        `Prediction saved: ${match.homeTeam.fifaCode} ${homeScore}–${awayScore} ${match.awayTeam.fifaCode}`,
        'success',
      );
    } catch {
      toast('Failed to save prediction. Try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLocked) {
    const countdown = match.status === 'locked' ? getLockedCountdown(match.kickoffAt) : null;
    return (
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, padding: '16px 0' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          {/* Home team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
            <Flag isoCode={match.homeTeam.isoCode} size={32} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>{match.homeTeam.fifaCode}</span>
          </div>

          {/* Locked score display */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            {prediction ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="score-big">{prediction.homeScore}</span>
                <span style={{ color: 'var(--text-mute)', fontWeight: 800, fontSize: 22 }}>:</span>
                <span className="score-big">{prediction.awayScore}</span>
              </div>
            ) : (
              <span className="score-big" style={{ color: 'var(--text-mute)' }}>–:–</span>
            )}
            <div style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--warn)', fontSize: 11 }}>
              <Icon name="lock" size={12} />
              <span className="mono" style={{ letterSpacing: '0.06em', textTransform: 'uppercase', fontWeight: 700 }}>
                {prediction ? 'Locked' : 'No pick — locked'}
              </span>
            </div>
            {countdown && (
              <span style={{ fontSize: 11, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
                Kickoff in {countdown}
              </span>
            )}
          </div>

          {/* Away team */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
            <Flag isoCode={match.awayTeam.isoCode} size={32} />
            <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-dim)' }}>{match.awayTeam.fifaCode}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16, padding: '16px 0' }}>
      {/* Team headers */}
      <div style={{ display: 'flex', alignItems: 'flex-end', gap: 24, width: '100%', justifyContent: 'center' }}>
        {/* Home team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
          <Flag isoCode={match.homeTeam.isoCode} size={36} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{match.homeTeam.name}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em' }}>
            {match.homeTeam.fifaCode}
          </span>
        </div>

        {/* Score inputs */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <ScoreInput value={homeScore} onChange={setHomeScore} disabled={isLocked} />
          <span style={{ color: 'var(--text-mute)', fontWeight: 800, fontSize: 24, lineHeight: 1 }}>:</span>
          <ScoreInput value={awayScore} onChange={setAwayScore} disabled={isLocked} />
        </div>

        {/* Away team */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 80 }}>
          <Flag isoCode={match.awayTeam.isoCode} size={36} />
          <span style={{ fontSize: 13, fontWeight: 700 }}>{match.awayTeam.name}</span>
          <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.06em' }}>
            {match.awayTeam.fifaCode}
          </span>
        </div>
      </div>

      {/* Points preview */}
      {ptsPreview != null && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--text-dim)', fontSize: 12.5 }}>
          <span>Preview:</span>
          <PtsTag pts={ptsPreview} rules={rules} />
        </div>
      )}

      {/* Save button */}
      <Button
        variant="primary"
        size="md"
        onClick={handleSave}
        loading={saving}
        disabled={!isDirty && prediction != null}
      >
        {prediction ? 'Update Prediction' : 'Save Prediction'}
      </Button>

      {prediction && !isDirty && (
        <span style={{ fontSize: 12, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6 }}>
          <Icon name="check" size={14} style={{ color: 'var(--live)' }} />
          Saved — edit anytime before kickoff
        </span>
      )}
    </div>
  );
}
```

- [ ] **Step 4.6: Create `src/components/match/MatchCard.tsx`**

```tsx
import React from 'react';
import type { Match, Prediction, ScoreRules } from '../../types';
import { Card } from '../ui/Card';
import { StatusPill } from '../ui/StatusPill';
import { PtsTag } from '../ui/PtsTag';
import { Flag } from '../ui/Flag';
import { Icon } from '../ui/Icon';
import { PredictionForm } from './PredictionForm';

export interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  rules: ScoreRules;
  onPredictionSave: (home: number, away: number) => Promise<void>;
}

const STAGE_LABEL: Record<string, string> = {
  group:       'Group Stage',
  r32:         'Round of 32',
  r16:         'Round of 16',
  qf:          'Quarter-final',
  sf:          'Semi-final',
  third_place: 'Third Place',
  final:       'Final',
};

function formatKickoff(kickoffAt: string): string {
  const d = new Date(kickoffAt);
  const months = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${months[d.getMonth()]} ${d.getDate()} · ${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

const isLocked = (match: Match) => match.status === 'locked' || match.status === 'live' || match.status === 'completed';

export function MatchCard({ match, prediction, rules, onPredictionSave }: MatchCardProps) {
  const locked = isLocked(match);

  return (
    <Card padding={false} style={{ overflow: 'hidden' }}>
      {/* Card header */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 10,
          padding: '11px 16px',
          borderBottom: '1px solid var(--line)',
          background: 'var(--bg-2)',
        }}
      >
        {match.stage !== 'group' && (
          <span className="chip" style={{ fontSize: 11 }}>
            {STAGE_LABEL[match.stage]}
          </span>
        )}
        {match.groupLabel && (
          <span className="chip" style={{ fontSize: 11 }}>
            Group {match.groupLabel}
          </span>
        )}
        <span
          className="mono"
          style={{ fontSize: 11.5, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap' }}
        >
          <Icon name="calendar" size={13} />
          {formatKickoff(match.kickoffAt)}
        </span>
        {match.venue && (
          <span
            className="hide-mobile"
            style={{ fontSize: 12, color: 'var(--text-mute)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', flex: 1 }}
          >
            {match.venue}
          </span>
        )}
        <span style={{ marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: 10, flexShrink: 0 }}>
          <StatusPill status={match.status} />
        </span>
      </div>

      {/* Completed / live result display */}
      {(match.status === 'completed' || match.status === 'live') && (
        <div style={{ padding: '20px 18px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 14 }}>
            {/* Home */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'flex-end' }}>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{match.homeTeam.name}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-mute)', letterSpacing: '0.08em' }}>
                  {match.homeTeam.fifaCode}
                </div>
              </div>
              <Flag isoCode={match.homeTeam.isoCode} size={34} />
            </div>

            {/* Score */}
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 5 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span className="score-big">{match.homeScore ?? '–'}</span>
                <span className="score-big" style={{ color: 'var(--text-mute)', fontSize: 22 }}>:</span>
                <span className="score-big">{match.awayScore ?? '–'}</span>
              </div>
              {match.status === 'live' ? (
                <StatusPill status="live" />
              ) : (
                <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em' }}>
                  FULL-TIME
                </span>
              )}
            </div>

            {/* Away */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <Flag isoCode={match.awayTeam.isoCode} size={34} />
              <div>
                <div style={{ fontWeight: 800, fontSize: 16 }}>{match.awayTeam.name}</div>
                <div className="mono" style={{ fontSize: 12, color: 'var(--text-mute)', letterSpacing: '0.08em' }}>
                  {match.awayTeam.fifaCode}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Prediction form (all statuses) */}
      <div style={{ padding: '0 18px' }}>
        <PredictionForm
          match={match}
          prediction={prediction}
          rules={rules}
          onSave={onPredictionSave}
          isLocked={locked}
        />
      </div>

      {/* Footer: points earned (completed only) */}
      {match.status === 'completed' && prediction && (
        <div
          style={{
            padding: '10px 18px 14px',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            borderTop: '1px solid var(--line)',
          }}
        >
          <span style={{ fontSize: 12.5, color: 'var(--text-dim)' }}>
            Your pick:{' '}
            <b className="mono" style={{ color: 'var(--text)' }}>
              {prediction.homeScore}–{prediction.awayScore}
            </b>
          </span>
          <span style={{ marginLeft: 'auto' }}>
            <PtsTag pts={prediction.pointsEarned ?? null} rules={rules} />
          </span>
        </div>
      )}
    </Card>
  );
}
```

- [ ] **Step 4.7: Create `src/components/match/LiveMatchHero.tsx`**

```tsx
import React from 'react';
import type { Match, Prediction } from '../../types';
import { Flag } from '../ui/Flag';
import { StatusPill } from '../ui/StatusPill';

export interface LiveMatchHeroProps {
  match: Match;
  prediction?: Prediction;
}

export function LiveMatchHero({ match, prediction }: LiveMatchHeroProps) {
  return (
    <div
      style={{
        background: 'var(--field-grad)',
        border: '1px solid var(--line)',
        borderRadius: 'var(--r-xl)',
        padding: '28px 24px 24px',
        marginBottom: 20,
      }}
    >
      {/* Status + match info */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
        <StatusPill status="live" />
        {match.venue && (
          <span style={{ fontSize: 12.5, color: 'var(--text-mute)', fontFamily: 'var(--font-mono)' }}>
            {match.venue}
          </span>
        )}
      </div>

      {/* Main scoreboard */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', alignItems: 'center', gap: 16 }}>
        {/* Home */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <Flag isoCode={match.homeTeam.isoCode} size={56} />
          <div style={{ textAlign: 'right' }}>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{match.homeTeam.name}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.1em' }}>
              {match.homeTeam.fifaCode}
            </div>
          </div>
        </div>

        {/* Score */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, minWidth: 110 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <span
              className="score-big"
              style={{ fontSize: 52, letterSpacing: '-0.04em' }}
            >
              {match.homeScore ?? '–'}
            </span>
            <span
              className="score-big"
              style={{ fontSize: 36, color: 'var(--text-mute)' }}
            >
              :
            </span>
            <span
              className="score-big"
              style={{ fontSize: 52, letterSpacing: '-0.04em' }}
            >
              {match.awayScore ?? '–'}
            </span>
          </div>
          <span
            className="mono"
            style={{ fontSize: 11, color: 'var(--live)', letterSpacing: '0.1em', fontWeight: 700 }}
          >
            LIVE
          </span>
        </div>

        {/* Away */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: 10 }}>
          <Flag isoCode={match.awayTeam.isoCode} size={56} />
          <div>
            <div style={{ fontWeight: 800, fontSize: 18, letterSpacing: '-0.02em' }}>{match.awayTeam.name}</div>
            <div className="mono" style={{ fontSize: 11, color: 'var(--text-mute)', letterSpacing: '0.1em' }}>
              {match.awayTeam.fifaCode}
            </div>
          </div>
        </div>
      </div>

      {/* User prediction */}
      {prediction && (
        <div
          style={{
            marginTop: 20,
            paddingTop: 16,
            borderTop: '1px solid var(--line)',
            display: 'flex',
            alignItems: 'center',
            gap: 10,
            color: 'var(--text-dim)',
            fontSize: 13,
          }}
        >
          <span>Your pick:</span>
          <b className="mono" style={{ color: 'var(--text)' }}>
            {prediction.homeScore}–{prediction.awayScore}
          </b>
          <span style={{ color: 'var(--text-mute)', fontSize: 11.5 }}>· points settle at full-time</span>
        </div>
      )}
    </div>
  );
}
```

- [ ] **Step 4.8: Create `src/components/match/MiniMatch.tsx`**

```tsx
import React from 'react';
import type { Match, Prediction } from '../../types';
import { Flag } from '../ui/Flag';
import { StatusPill } from '../ui/StatusPill';

export interface MiniMatchProps {
  match: Match;
  prediction?: Prediction;
  compact?: boolean;
  onClick?: () => void;
}

function formatTime(kickoffAt: string): string {
  const d = new Date(kickoffAt);
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export function MiniMatch({ match, prediction, compact = false, onClick }: MiniMatchProps) {
  const isCompleted = match.status === 'completed';
  const isLive = match.status === 'live';
  const showScore = isCompleted || isLive;

  return (
    <button
      onClick={onClick}
      style={{
        width: '100%',
        textAlign: 'left',
        background: 'none',
        border: 'none',
        cursor: onClick ? 'pointer' : 'default',
        padding: compact ? '8px 10px' : '12px 14px',
        borderRadius: 'var(--r-sm)',
        display: 'flex',
        alignItems: 'center',
        gap: 12,
        color: 'var(--text)',
        transition: 'background 0.12s',
      }}
      onMouseEnter={(e) => {
        if (onClick) (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-2)';
      }}
      onMouseLeave={(e) => {
        (e.currentTarget as HTMLButtonElement).style.background = 'none';
      }}
      disabled={!onClick}
    >
      {/* Status column */}
      <div style={{ width: 54, flexShrink: 0 }}>
        {isLive ? (
          <StatusPill status="live" />
        ) : (
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-dim)' }}>
            {isCompleted ? 'FT' : formatTime(match.kickoffAt)}
          </span>
        )}
        {!compact && match.groupLabel && (
          <span className="mono" style={{ display: 'block', fontSize: 10, color: 'var(--text-mute)', marginTop: 2 }}>
            GRP {match.groupLabel}
          </span>
        )}
      </div>

      {/* Teams column */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: 7 }}>
        {/* Home */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Flag isoCode={match.homeTeam.isoCode} size={18} />
          <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{match.homeTeam.name}</span>
          {showScore && (
            <span className="mono" style={{ fontSize: 15, fontWeight: 800 }}>
              {match.homeScore}
            </span>
          )}
        </div>
        {/* Away */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
          <Flag isoCode={match.awayTeam.isoCode} size={18} />
          <span style={{ fontSize: 13.5, fontWeight: 700, flex: 1 }}>{match.awayTeam.name}</span>
          {showScore && (
            <span className="mono" style={{ fontSize: 15, fontWeight: 800 }}>
              {match.awayScore}
            </span>
          )}
        </div>
      </div>

      {/* Prediction column */}
      <div style={{ flexShrink: 0, textAlign: 'right' }}>
        {prediction ? (
          <>
            <span className="mono" style={{ fontSize: 12.5, fontWeight: 700, color: 'var(--text-dim)' }}>
              {prediction.homeScore}–{prediction.awayScore}
            </span>
            {!compact && (
              <div className="mono" style={{ fontSize: 9.5, color: 'var(--text-mute)', marginTop: 3, letterSpacing: '0.06em' }}>
                YOUR PICK
              </div>
            )}
          </>
        ) : match.status === 'scheduled' ? (
          <span className="chip" style={{ fontSize: 10.5, color: 'var(--accent)', borderColor: 'var(--accent)' }}>
            Predict
          </span>
        ) : (
          <span className="mono" style={{ fontSize: 11, color: 'var(--text-mute)' }}>—</span>
        )}
      </div>
    </button>
  );
}
```

- [ ] **Step 4.9: Run ScoreInput tests again to confirm nothing regressed**

```bash
npm test -- --testPathPattern="ScoreInput" --watchAll=false 2>&1 | tail -10
```

Expected: 9 tests pass.

- [ ] **Step 4.10: Commit**

```bash
git add src/components/match/
git add src/__tests__/components/ScoreInput.test.tsx
git commit -m "feat: add ScoreInput, PredictionForm, MatchCard, LiveMatchHero, MiniMatch"
```

---

## Task 5: Leaderboard Components — RankMedal, PodiumRow, StandingsTable

**Files:**
- Create: `src/components/leaderboard/RankMedal.tsx`
- Create: `src/components/leaderboard/PodiumRow.tsx`
- Create: `src/components/leaderboard/StandingsTable.tsx`
- Create: `src/__tests__/components/StandingsTable.test.tsx`

- [ ] **Step 5.1: Write failing tests for `StandingsTable`**

Create `src/__tests__/components/StandingsTable.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { StandingsTable } from '../../components/leaderboard/StandingsTable';
import type { LeaderboardEntry } from '../../types';

const makeEntry = (overrides: Partial<LeaderboardEntry> = {}): LeaderboardEntry => ({
  userId: 'u1',
  tournamentId: 't1',
  user: {
    id: 'u1',
    email: 'alice@test.com',
    displayName: 'Alice Smith',
    role: 'user',
    isActive: true,
    mustChangePassword: false,
    createdAt: '2026-01-01T00:00:00Z',
  },
  totalPts: 42,
  fullCount: 5,
  totoCount: 8,
  goalDiffCount: 3,
  playedCount: 12,
  rank: 1,
  prevRank: 2,
  ...overrides,
});

describe('StandingsTable', () => {
  it('renders player names', () => {
    const entries = [
      makeEntry({ userId: 'u1', user: { ...makeEntry().user, id: 'u1', displayName: 'Alice Smith' }, rank: 1 }),
      makeEntry({ userId: 'u2', user: { ...makeEntry().user, id: 'u2', displayName: 'Bob Jones' }, rank: 2, prevRank: 1 }),
    ];
    render(<StandingsTable entries={entries} currentUserId="u1" />);
    expect(screen.getByText('Alice Smith')).toBeInTheDocument();
    expect(screen.getByText('Bob Jones')).toBeInTheDocument();
  });

  it('highlights current user row with "me" class', () => {
    const entries = [makeEntry({ userId: 'u1', rank: 1 })];
    const { container } = render(<StandingsTable entries={entries} currentUserId="u1" />);
    const row = container.querySelector('tr.me');
    expect(row).toBeTruthy();
  });

  it('does not apply "me" class to other rows', () => {
    const entries = [
      makeEntry({ userId: 'u1', rank: 1 }),
      makeEntry({ userId: 'u2', user: { ...makeEntry().user, id: 'u2', displayName: 'Bob' }, rank: 2 }),
    ];
    const { container } = render(<StandingsTable entries={entries} currentUserId="u2" />);
    const meRows = container.querySelectorAll('tr.me');
    // Only the current user row (u2) should have "me" class
    expect(meRows).toHaveLength(1);
  });

  it('shows rank delta up arrow when rank improved', () => {
    // prevRank 3 → rank 1 = improved (went up the table)
    const entries = [makeEntry({ rank: 1, prevRank: 3 })];
    const { container } = render(<StandingsTable entries={entries} currentUserId="u1" />);
    // delta-up class should be present
    expect(container.querySelector('.delta-up')).toBeTruthy();
  });

  it('shows rank delta down arrow when rank worsened', () => {
    // prevRank 1 → rank 3 = worsened
    const entries = [makeEntry({ rank: 3, prevRank: 1 })];
    const { container } = render(<StandingsTable entries={entries} currentUserId="u1" />);
    expect(container.querySelector('.delta-down')).toBeTruthy();
  });

  it('renders total points', () => {
    const entries = [makeEntry({ totalPts: 99 })];
    render(<StandingsTable entries={entries} currentUserId="u1" />);
    expect(screen.getByText('99')).toBeInTheDocument();
  });
});
```

- [ ] **Step 5.2: Run tests — expect failure**

```bash
npm test -- --testPathPattern="StandingsTable" --watchAll=false 2>&1 | tail -10
```

Expected: fails with "Cannot find module".

- [ ] **Step 5.3: Create `src/components/leaderboard/RankMedal.tsx`**

```tsx
import React from 'react';

export interface RankMedalProps {
  rank: number;
}

export function RankMedal({ rank }: RankMedalProps) {
  if (rank <= 3) {
    return (
      <span
        className={`rank-medal rank-${rank}`}
        style={{ width: 32, height: 32, display: 'grid', placeItems: 'center', fontSize: 14, fontFamily: 'var(--font-mono)', fontWeight: 800 }}
        aria-label={`Rank ${rank}`}
      >
        {rank}
      </span>
    );
  }

  return (
    <span
      className="mono"
      style={{ fontWeight: 800, color: 'var(--text-dim)', paddingLeft: 7, fontSize: 14 }}
      aria-label={`Rank ${rank}`}
    >
      {rank}
    </span>
  );
}
```

- [ ] **Step 5.4: Create `src/components/leaderboard/PodiumRow.tsx`**

```tsx
import React from 'react';
import type { LeaderboardEntry } from '../../types';
import { Avatar } from '../ui/Avatar';
import { RankMedal } from './RankMedal';

export interface PodiumRowProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  isMe: boolean;
}

const PODIUM_HEIGHTS: Record<1 | 2 | 3, number> = {
  1: 116,
  2: 88,
  3: 70,
};

export function PodiumRow({ entry, rank, isMe }: PodiumRowProps) {
  const avatarSize = rank === 1 ? 58 : 48;
  const podiumHeight = PODIUM_HEIGHTS[rank];
  const podiumBg =
    rank === 1
      ? 'linear-gradient(180deg, color-mix(in oklab, var(--accent) 35%, var(--bg-2)), var(--bg-2))'
      : 'var(--bg-2)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 20 }}>
      <Avatar displayName={entry.user.displayName} size={avatarSize} />

      <div style={{ textAlign: 'center' }}>
        <div style={{ fontWeight: 800, fontSize: 14 }}>
          {isMe ? 'You' : entry.user.displayName}
        </div>
        <div className="mono" style={{ fontSize: 12, color: 'var(--text-dim)', whiteSpace: 'nowrap' }}>
          {entry.fullCount} exact · {entry.totoCount} correct
        </div>
      </div>

      <div
        style={{
          width: '100%',
          height: podiumHeight,
          borderRadius: '12px 12px 0 0',
          background: podiumBg,
          border: '1px solid var(--line)',
          borderBottom: 'none',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          position: 'relative',
        }}
      >
        <span
          style={{
            position: 'absolute',
            top: -13,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <RankMedal rank={rank} />
        </span>
        <span
          className="score-big"
          style={{ fontSize: 30, color: rank === 1 ? 'var(--accent)' : 'var(--text)' }}
        >
          {entry.totalPts}
        </span>
        <span className="mono" style={{ fontSize: 10, color: 'var(--text-mute)', letterSpacing: '0.1em' }}>
          POINTS
        </span>
      </div>
    </div>
  );
}
```

- [ ] **Step 5.5: Create `src/components/leaderboard/StandingsTable.tsx`**

```tsx
import React from 'react';
import type { LeaderboardEntry } from '../../types';
import { Avatar } from '../ui/Avatar';
import { RankMedal } from './RankMedal';
import { Icon } from '../ui/Icon';

export interface StandingsTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

export function StandingsTable({ entries, currentUserId }: StandingsTableProps) {
  return (
    <div className="card" style={{ overflow: 'hidden' }}>
      <table className="tbl">
        <thead>
          <tr>
            <th style={{ width: 56 }}>Rank</th>
            <th>Player</th>
            <th style={{ textAlign: 'right' }}>Pts</th>
            <th style={{ textAlign: 'right' }} className="hide-mobile">Full</th>
            <th style={{ textAlign: 'right' }} className="hide-mobile">Toto</th>
            <th style={{ textAlign: 'right' }} className="hide-mobile">Played</th>
            <th style={{ textAlign: 'center', width: 52 }}>Δ</th>
          </tr>
        </thead>
        <tbody>
          {entries.map((entry) => {
            const isMe = entry.userId === currentUserId;
            const delta =
              entry.prevRank != null ? entry.prevRank - entry.rank : 0;

            return (
              <tr key={entry.userId} className={isMe ? 'me' : ''}>
                <td>
                  <RankMedal rank={entry.rank} />
                </td>
                <td>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 11 }}>
                    <Avatar displayName={entry.user.displayName} size={32} />
                    <div>
                      <div style={{ fontWeight: 700, fontSize: 14 }}>
                        {isMe ? 'You' : entry.user.displayName}
                      </div>
                      <div
                        className="mono hide-mobile"
                        style={{ fontSize: 10.5, color: 'var(--text-mute)' }}
                      >
                        {entry.fullCount} exact · {entry.totoCount} correct
                      </div>
                    </div>
                  </div>
                </td>
                <td style={{ textAlign: 'right' }}>
                  <span className="mono" style={{ fontWeight: 800, fontSize: 16 }}>
                    {entry.totalPts}
                  </span>
                </td>
                <td style={{ textAlign: 'right' }} className="hide-mobile mono">
                  {entry.fullCount}
                </td>
                <td style={{ textAlign: 'right' }} className="hide-mobile mono">
                  {entry.totoCount}
                </td>
                <td
                  className="hide-mobile mono"
                  style={{ textAlign: 'right', color: 'var(--text-dim)' }}
                >
                  {entry.playedCount}
                </td>
                <td style={{ textAlign: 'center' }}>
                  {delta === 0 ? (
                    <Icon name="dash" size={14} style={{ color: 'var(--text-mute)' }} />
                  ) : delta > 0 ? (
                    <span
                      className="delta-up"
                      style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 800, fontSize: 12.5 }}
                    >
                      <Icon name="arrow-up" size={12} />
                      {Math.abs(delta)}
                    </span>
                  ) : (
                    <span
                      className="delta-down"
                      style={{ display: 'inline-flex', alignItems: 'center', fontWeight: 800, fontSize: 12.5 }}
                    >
                      <Icon name="arrow-down" size={12} />
                      {Math.abs(delta)}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 5.6: Run StandingsTable tests**

```bash
npm test -- --testPathPattern="StandingsTable" --watchAll=false 2>&1 | tail -15
```

Expected: 6 tests pass.

- [ ] **Step 5.7: Commit**

```bash
git add src/components/leaderboard/
git add src/__tests__/components/StandingsTable.test.tsx
git commit -m "feat: add RankMedal, PodiumRow, StandingsTable leaderboard components"
```

---

## Task 6: Data Hooks — useMatches, usePredictions, useSavePrediction, useLeaderboard, useStats

**Files:**
- Create: `src/api/client.ts` (if not yet created in Part 1)
- Create: `src/hooks/useMatches.ts`
- Create: `src/hooks/usePredictions.ts`
- Create: `src/hooks/useLeaderboard.ts`
- Create: `src/hooks/useStats.ts`
- Create: `src/__tests__/hooks/usePredictions.test.tsx`

- [ ] **Step 6.1: Ensure `src/api/client.ts` exists**

If Part 1 did not create it, create it now:

```typescript
import axios from 'axios';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:3001';

export const apiClient = axios.create({
  baseURL: API_BASE,
  timeout: 10_000,
  headers: { 'Content-Type': 'application/json' },
});

// Attach JWT token from localStorage before each request
apiClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('myscore_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// On 401, clear token (force re-login)
apiClient.interceptors.response.use(
  (res) => res,
  (err) => {
    if (err.response?.status === 401) {
      localStorage.removeItem('myscore_token');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);
```

- [ ] **Step 6.2: Create `src/hooks/useMatches.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Match } from '../types';

export interface MatchFilters {
  group?: string;
  status?: string;
  search?: string;
}

export function useMatches(
  tournamentId: string,
  filters?: MatchFilters,
): UseQueryResult<Match[]> {
  return useQuery({
    queryKey: ['matches', tournamentId, filters],
    queryFn: async () => {
      const params: Record<string, string> = { tournamentId };
      if (filters?.group)  params.group  = filters.group;
      if (filters?.status) params.status = filters.status;
      if (filters?.search) params.search = filters.search;
      const { data } = await apiClient.get<Match[]>('/matches', { params });
      return data;
    },
    staleTime: 30_000, // 30 s — matches don't change very often
  });
}
```

- [ ] **Step 6.3: Create `src/hooks/usePredictions.ts`**

```typescript
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { UseQueryResult, UseMutationResult } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Prediction } from '../types';

// ---- Query ----

export function usePredictions(): UseQueryResult<Prediction[]> {
  return useQuery({
    queryKey: ['predictions'],
    queryFn: async () => {
      const { data } = await apiClient.get<Prediction[]>('/predictions');
      return data;
    },
    staleTime: 60_000,
  });
}

// ---- Mutation ----

export interface SavePredictionArgs {
  matchId: string;
  homeScore: number;
  awayScore: number;
  existingPredictionId?: string; // undefined → POST, defined → PATCH
}

export function useSavePrediction(): UseMutationResult<
  Prediction,
  Error,
  SavePredictionArgs
> {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ matchId, homeScore, awayScore, existingPredictionId }) => {
      if (existingPredictionId) {
        const { data } = await apiClient.patch<Prediction>(
          `/predictions/${existingPredictionId}`,
          { homeScore, awayScore },
        );
        return data;
      }
      const { data } = await apiClient.post<Prediction>('/predictions', {
        matchId,
        homeScore,
        awayScore,
      });
      return data;
    },

    onMutate: async ({ matchId, homeScore, awayScore, existingPredictionId }) => {
      // Cancel in-flight queries for predictions
      await queryClient.cancelQueries({ queryKey: ['predictions'] });

      // Snapshot current data for rollback
      const previousPredictions = queryClient.getQueryData<Prediction[]>(['predictions']);

      // Optimistically update the cache
      queryClient.setQueryData<Prediction[]>(['predictions'], (old = []) => {
        if (existingPredictionId) {
          return old.map((p) =>
            p.id === existingPredictionId
              ? { ...p, homeScore, awayScore, updatedAt: new Date().toISOString() }
              : p,
          );
        }
        // New prediction — append a provisional entry
        const provisional: Prediction = {
          id: `optimistic-${Date.now()}`,
          userId: '',   // filled by server; irrelevant for UI
          matchId,
          homeScore,
          awayScore,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };
        return [...old, provisional];
      });

      return { previousPredictions };
    },

    onError: (_err, _vars, context) => {
      // Roll back optimistic update
      if (context?.previousPredictions) {
        queryClient.setQueryData(['predictions'], context.previousPredictions);
      }
    },

    onSuccess: () => {
      // Replace optimistic cache entry with server truth and refresh leaderboard
      queryClient.invalidateQueries({ queryKey: ['predictions'] });
      queryClient.invalidateQueries({ queryKey: ['leaderboard'] });
    },
  });
}
```

- [ ] **Step 6.4: Create `src/hooks/useLeaderboard.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { LeaderboardEntry } from '../types';

export function useLeaderboard(tournamentId: string): UseQueryResult<LeaderboardEntry[]> {
  return useQuery({
    queryKey: ['leaderboard', tournamentId],
    queryFn: async () => {
      const { data } = await apiClient.get<LeaderboardEntry[]>('/leaderboard', {
        params: { tournamentId },
      });
      return data;
    },
    staleTime: 60_000,
  });
}
```

- [ ] **Step 6.5: Create `src/hooks/useStats.ts`**

```typescript
import { useQuery } from '@tanstack/react-query';
import type { UseQueryResult } from '@tanstack/react-query';
import { apiClient } from '../api/client';
import type { Stats } from '../types';

export function useStats(): UseQueryResult<Stats> {
  return useQuery({
    queryKey: ['stats'],
    queryFn: async () => {
      const { data } = await apiClient.get<Stats>('/stats');
      return data;
    },
    staleTime: 120_000,
  });
}
```

- [ ] **Step 6.6: Write tests for `useSavePrediction` optimistic updates**

Create `src/__tests__/hooks/usePredictions.test.tsx`:

```tsx
import React from 'react';
import { renderHook, act, waitFor } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { useSavePrediction, usePredictions } from '../../hooks/usePredictions';
import { apiClient } from '../../api/client';
import type { Prediction } from '../../types';

jest.mock('../../api/client');

const mockApiClient = apiClient as jest.Mocked<typeof apiClient>;

function makeWrapper(queryClient: QueryClient) {
  return function Wrapper({ children }: { children: React.ReactNode }) {
    return (
      <QueryClientProvider client={queryClient}>
        {children}
      </QueryClientProvider>
    );
  };
}

const EXISTING_PREDICTION: Prediction = {
  id: 'pred-1',
  userId: 'u1',
  matchId: 'm1',
  homeScore: 1,
  awayScore: 0,
  createdAt: '2026-06-10T10:00:00Z',
  updatedAt: '2026-06-10T10:00:00Z',
};

describe('useSavePrediction', () => {
  let queryClient: QueryClient;

  beforeEach(() => {
    queryClient = new QueryClient({
      defaultOptions: { queries: { retry: false }, mutations: { retry: false } },
    });
    jest.clearAllMocks();
  });

  it('PATCH calls /predictions/:id for existing prediction', async () => {
    const updated: Prediction = { ...EXISTING_PREDICTION, homeScore: 2, awayScore: 1 };
    (mockApiClient.patch as jest.Mock).mockResolvedValueOnce({ data: updated });

    const wrapper = makeWrapper(queryClient);
    const { result } = renderHook(() => useSavePrediction(), { wrapper });

    await act(async () => {
      result.current.mutate({
        matchId: 'm1',
        homeScore: 2,
        awayScore: 1,
        existingPredictionId: 'pred-1',
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiClient.patch).toHaveBeenCalledWith('/predictions/pred-1', {
      homeScore: 2,
      awayScore: 1,
    });
  });

  it('POST calls /predictions for new prediction', async () => {
    const newPred: Prediction = { ...EXISTING_PREDICTION, id: 'pred-new' };
    (mockApiClient.post as jest.Mock).mockResolvedValueOnce({ data: newPred });

    const wrapper = makeWrapper(queryClient);
    const { result } = renderHook(() => useSavePrediction(), { wrapper });

    await act(async () => {
      result.current.mutate({
        matchId: 'm2',
        homeScore: 0,
        awayScore: 0,
      });
    });

    await waitFor(() => expect(result.current.isSuccess).toBe(true));
    expect(mockApiClient.post).toHaveBeenCalledWith('/predictions', {
      matchId: 'm2',
      homeScore: 0,
      awayScore: 0,
    });
  });

  it('optimistically updates cache before server response', async () => {
    // Seed cache with one existing prediction
    queryClient.setQueryData<Prediction[]>(['predictions'], [EXISTING_PREDICTION]);

    // Make API call take a noticeable amount of time
    let resolveApi!: (v: { data: Prediction }) => void;
    (mockApiClient.patch as jest.Mock).mockReturnValueOnce(
      new Promise((resolve) => { resolveApi = resolve; }),
    );

    const wrapper = makeWrapper(queryClient);
    const { result } = renderHook(() => useSavePrediction(), { wrapper });

    act(() => {
      result.current.mutate({
        matchId: 'm1',
        homeScore: 3,
        awayScore: 2,
        existingPredictionId: 'pred-1',
      });
    });

    // Before API resolves, cache should already reflect new scores
    const cached = queryClient.getQueryData<Prediction[]>(['predictions']);
    const optimisticEntry = cached?.find((p) => p.id === 'pred-1');
    expect(optimisticEntry?.homeScore).toBe(3);
    expect(optimisticEntry?.awayScore).toBe(2);

    // Clean up
    resolveApi({ data: { ...EXISTING_PREDICTION, homeScore: 3, awayScore: 2 } });
    await waitFor(() => expect(result.current.isSuccess).toBe(true));
  });

  it('rolls back cache on error', async () => {
    queryClient.setQueryData<Prediction[]>(['predictions'], [EXISTING_PREDICTION]);
    (mockApiClient.patch as jest.Mock).mockRejectedValueOnce(new Error('Server error'));

    const wrapper = makeWrapper(queryClient);
    const { result } = renderHook(() => useSavePrediction(), { wrapper });

    await act(async () => {
      result.current.mutate({
        matchId: 'm1',
        homeScore: 5,
        awayScore: 0,
        existingPredictionId: 'pred-1',
      });
    });

    await waitFor(() => expect(result.current.isError).toBe(true));

    // Cache should be back to original
    const cached = queryClient.getQueryData<Prediction[]>(['predictions']);
    expect(cached?.find((p) => p.id === 'pred-1')?.homeScore).toBe(1);
  });
});
```

- [ ] **Step 6.7: Run hook tests**

```bash
npm test -- --testPathPattern="usePredictions" --watchAll=false 2>&1 | tail -20
```

Expected: 4 tests pass. If `apiClient` mock setup requires a `__mocks__` file, create `src/api/__mocks__/client.ts`:

```typescript
export const apiClient = {
  get:    jest.fn(),
  post:   jest.fn(),
  patch:  jest.fn(),
  delete: jest.fn(),
  interceptors: { request: { use: jest.fn() }, response: { use: jest.fn() } },
};
```

Then re-run the tests.

- [ ] **Step 6.8: Run full test suite to confirm nothing is broken**

```bash
npm test -- --watchAll=false 2>&1 | tail -20
```

Expected: all tests pass (StatusPill: 7, ScoreInput: 9, StandingsTable: 6, usePredictions: 4 = 26 total).

- [ ] **Step 6.9: Commit**

```bash
git add src/api/client.ts src/hooks/useMatches.ts src/hooks/usePredictions.ts \
        src/hooks/useLeaderboard.ts src/hooks/useStats.ts \
        src/__tests__/hooks/usePredictions.test.tsx
git commit -m "feat: add useMatches, usePredictions, useSavePrediction (optimistic), useLeaderboard, useStats hooks"
```

---

## Verification Checklist

After all tasks are complete, run through this checklist:

- [ ] `npm run build` exits 0 with no TypeScript errors
- [ ] `npm test -- --watchAll=false` shows all 26 tests passing
- [ ] `npm run dev` starts the dev server without errors in the console
- [ ] At ≤880 px viewport, sidebar is hidden and mobile tab bar is visible
- [ ] At >880 px viewport, sidebar is visible and mobile tab bar is hidden
- [ ] Theme toggle switches `data-theme` attribute on `<html>` and persists across page reload
- [ ] `ScoreInput` accepts only digits 0–20, rejects letters, responds to ArrowUp/Down
- [ ] `PredictionForm` submit button is disabled while `isLocked === true`
- [ ] `ToastHost` shows a success toast after a successful `useSavePrediction` call
- [ ] `StandingsTable` highlights the current user's row with `.me` class
- [ ] `RankMedal` renders gold/silver/bronze styles for ranks 1, 2, 3 and plain numbers for 4+
- [ ] `PtsTag` renders correct colors: accent for full score, info for goal diff, dim for toto, danger for 0

---

## Component Index (for Part 3 & Part 4 reference)

All exports from this part. Import paths are relative to `src/`:

```
components/layout/AppShell         → AppShell
components/layout/Sidebar          → Sidebar
components/layout/Topbar           → Topbar
components/layout/MobileTabBar     → MobileTabBar

components/ui/Icon                 → Icon, IconProps
components/ui/Flag                 → Flag, FlagProps
components/ui/Avatar               → Avatar, AvatarProps
components/ui/StatusPill           → StatusPill, StatusPillProps
components/ui/PtsTag               → PtsTag, PtsTagProps
components/ui/TeamTag              → TeamTag, TeamTagProps
components/ui/Button               → Button, ButtonProps
components/ui/Input                → Input, InputProps
components/ui/Card                 → Card, CardProps
components/ui/Toast                → ToastHost, useToast, ToastContext, ToastType
components/ui/Skeleton             → Skel, SkelProps

components/match/ScoreInput        → ScoreInput, ScoreInputProps
components/match/PredictionForm    → PredictionForm, PredictionFormProps
components/match/MatchCard         → MatchCard, MatchCardProps
components/match/LiveMatchHero     → LiveMatchHero, LiveMatchHeroProps
components/match/MiniMatch         → MiniMatch, MiniMatchProps

components/leaderboard/RankMedal      → RankMedal, RankMedalProps
components/leaderboard/PodiumRow      → PodiumRow, PodiumRowProps
components/leaderboard/StandingsTable → StandingsTable, StandingsTableProps

hooks/useToast                     → useToast, ToastType
hooks/useMatches                   → useMatches, MatchFilters
hooks/usePredictions               → usePredictions, useSavePrediction, SavePredictionArgs
hooks/useLeaderboard               → useLeaderboard
hooks/useStats                     → useStats

types/index (additions)            → ScoreRules, Stats
```
