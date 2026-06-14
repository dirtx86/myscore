# MySCORE Frontend — Part 1: Foundation

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Scaffold the Vite + React 18 + TypeScript frontend with design system tokens, typed API client, AuthContext, and React Router setup.

**Architecture:** Single-page app with Vite dev server (port 3000), TanStack Query for server state, AuthContext for JWT auth, React Router v6 for navigation. All CSS variables from the prototype are ported into global.css; Tailwind provides layout utilities.

**Tech Stack:** React 18, TypeScript 5, Vite 5, Tailwind CSS 3, TanStack Query v5, React Router v6, axios, jwt-decode

---

## Task 1: Scaffold Vite project and install dependencies

- [ ] From the `MySCORE/` root, scaffold the frontend project:

  ```bash
  npm create vite@latest frontend -- --template react-ts
  ```

- [ ] Enter the frontend directory and install runtime dependencies:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  npm install react react-dom react-router-dom@^6 @tanstack/react-query@^5 axios jwt-decode
  ```

- [ ] Install dev dependencies:

  ```bash
  npm install -D typescript vite @vitejs/plugin-react tailwindcss postcss autoprefixer @types/react @types/react-dom vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom
  ```

- [ ] Initialize Tailwind CSS:

  ```bash
  npx tailwindcss init -p
  ```

  This generates `tailwind.config.js` and `postcss.config.js`. We will replace tailwind.config.js with a `.ts` file in Task 2.

- [ ] Write `vite.config.ts` (replace any scaffold default):

  ```typescript
  // frontend/vite.config.ts
  import { defineConfig } from 'vite';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    server: {
      port: 3000,
    },
  });
  ```

- [ ] Write `tsconfig.json` (replace scaffold default to ensure strict mode and path aliases work):

  ```json
  {
    "compilerOptions": {
      "target": "ES2020",
      "useDefineForClassFields": true,
      "lib": ["ES2020", "DOM", "DOM.Iterable"],
      "module": "ESNext",
      "skipLibCheck": true,
      "moduleResolution": "bundler",
      "allowImportingTsExtensions": true,
      "resolveJsonModule": true,
      "isolatedModules": true,
      "noEmit": true,
      "jsx": "react-jsx",
      "strict": true,
      "noUnusedLocals": true,
      "noUnusedParameters": true,
      "noFallthroughCasesInSwitch": true
    },
    "include": ["src"],
    "references": [{ "path": "./tsconfig.node.json" }]
  }
  ```

- [ ] Write `tsconfig.node.json`:

  ```json
  {
    "compilerOptions": {
      "composite": true,
      "skipLibCheck": true,
      "module": "ESNext",
      "moduleResolution": "bundler",
      "allowSyntheticDefaultImports": true
    },
    "include": ["vite.config.ts", "tailwind.config.ts"]
  }
  ```

- [ ] Write `index.html` (replace scaffold default):

  ```html
  <!DOCTYPE html>
  <html lang="en" data-theme="dark">
    <head>
      <meta charset="UTF-8" />
      <link rel="icon" type="image/svg+xml" href="/favicon.svg" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      <title>MySCORE — WC2026</title>
    </head>
    <body>
      <div id="root"></div>
      <script type="module" src="/src/main.tsx"></script>
    </body>
  </html>
  ```

- [ ] Verify the dev server starts without errors:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend && npm run dev -- --port 3000
  ```

  Expect output: `Local: http://localhost:3000/`. Press Ctrl+C to stop.

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add -A
  git commit -m "feat: scaffold Vite React TypeScript frontend with deps"
  ```

---

## Task 2: Port design system — CSS tokens, Tailwind config

- [ ] Create the styles directory:

  ```bash
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/styles
  ```

- [ ] Write `src/styles/global.css` with all design tokens and component classes:

  ```css
  /* frontend/src/styles/global.css */
  @import url('https://fonts.googleapis.com/css2?family=Archivo:wght@400;500;600;700&family=JetBrains+Mono:wght@400;600&display=swap');

  :root {
    --font-sans: "Archivo", system-ui, sans-serif;
    --font-mono: "JetBrains Mono", ui-monospace, monospace;
    --accent: #ffd23f;
    --accent-2: #ffb020;
    --accent-ink: #15120a;
    --live: #19e08a;
    --live-ink: #042315;
    --danger: #ff4d5e;
    --warn: #ffb020;
    --info: #4aa8ff;
    --r-xs: 6px;
    --r-sm: 9px;
    --r: 13px;
    --r-lg: 18px;
    --r-xl: 24px;
    --maxw: 1240px;
  }

  [data-theme="dark"] {
    --bg-0: #070a0f;
    --bg-1: #0e131b;
    --bg-2: #161d27;
    --bg-3: #1f2834;
    --bg-inset: #0a0e14;
    --line: rgba(255, 255, 255, 0.08);
    --line-2: rgba(255, 255, 255, 0.14);
    --text: #eef3f9;
    --text-dim: #97a4b5;
    --text-mute: #5d6b7c;
    --shadow: 0 1px 0 rgba(255, 255, 255, 0.04) inset,
      0 18px 40px -20px rgba(0, 0, 0, 0.8);
    --shadow-sm: 0 8px 24px -16px rgba(0, 0, 0, 0.8);
    --grain: rgba(255, 255, 255, 0.02);
    --field-grad: radial-gradient(
      120% 120% at 50% -10%,
      #11202a 0%,
      #070a0f 60%
    );
  }

  [data-theme="light"] {
    --bg-0: #eef1f6;
    --bg-1: #ffffff;
    --bg-2: #f3f6fa;
    --bg-3: #e7ecf3;
    --bg-inset: #f7f9fc;
    --line: rgba(13, 22, 38, 0.1);
    --line-2: rgba(13, 22, 38, 0.18);
    --text: #0d1622;
    --text-dim: #54647a;
    --text-mute: #8a99ac;
    --shadow: 0 1px 0 rgba(255, 255, 255, 0.7) inset,
      0 18px 40px -24px rgba(20, 30, 50, 0.35);
    --shadow-sm: 0 10px 24px -18px rgba(20, 30, 50, 0.3);
  }

  *,
  *::before,
  *::after {
    box-sizing: border-box;
    margin: 0;
    padding: 0;
  }

  body {
    background: var(--bg-0);
    color: var(--text);
    font-family: var(--font-sans);
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  /* ── Buttons ─────────────────────────────────────────── */

  .btn-primary {
    background: linear-gradient(135deg, var(--accent), var(--accent-2));
    color: var(--accent-ink);
    font-weight: 600;
    border-radius: var(--r);
    padding: 10px 20px;
    border: none;
    cursor: pointer;
    box-shadow: 0 0 0 0 var(--accent);
    transition: box-shadow 0.2s;
  }

  .btn-primary:hover {
    box-shadow: 0 0 16px -4px var(--accent);
  }

  .btn-primary:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  /* ── Score inputs ─────────────────────────────────────── */

  .score-input {
    width: 56px;
    height: 56px;
    font-family: var(--font-mono);
    font-size: 26px;
    font-weight: 600;
    text-align: center;
    background: var(--bg-inset);
    border: 1px solid var(--line);
    border-radius: var(--r-sm);
    color: var(--text);
  }

  .score-input:focus {
    outline: none;
    border-color: var(--accent);
    box-shadow: 0 0 0 3px rgba(255, 210, 63, 0.18);
  }

  .step-btn {
    width: 28px;
    height: 24px;
    background: var(--bg-2);
    border: 1px solid var(--line);
    color: var(--text-dim);
    border-radius: var(--r-xs);
    cursor: pointer;
  }

  .step-btn:hover {
    background: var(--bg-3);
  }

  /* ── Status pills ─────────────────────────────────────── */

  .pill-live {
    display: inline-flex;
    align-items: center;
    gap: 5px;
    background: rgba(25, 224, 138, 0.12);
    color: var(--live);
    border-radius: 99px;
    padding: 3px 10px;
    font-size: 11px;
    font-weight: 600;
    letter-spacing: 0.04em;
  }

  .pill-live::before {
    content: '';
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--live);
    animation: pulse 1.4s ease infinite;
  }

  @keyframes pulse {
    0%,
    100% {
      opacity: 1;
      transform: scale(1);
    }
    50% {
      opacity: 0.5;
      transform: scale(0.7);
    }
  }

  /* ── Rank badges ──────────────────────────────────────── */

  .rank-1 {
    background: linear-gradient(135deg, #ffd700, #ffb300);
  }

  .rank-2 {
    background: linear-gradient(135deg, #c0c8d4, #a0aab5);
  }

  .rank-3 {
    background: linear-gradient(135deg, #cd7f32, #b8651e);
  }

  /* ── Table current-user highlight ────────────────────── */

  .tbl tr.me {
    background: rgba(255, 210, 63, 0.06);
  }

  /* ── Filter chips ─────────────────────────────────────── */

  .chip {
    padding: 5px 12px;
    border-radius: 99px;
    font-size: 12px;
    font-weight: 600;
    background: var(--bg-2);
    border: 1px solid var(--line);
    color: var(--text-dim);
    cursor: pointer;
    transition: all 0.15s;
  }

  .chip.sel {
    background: var(--accent);
    color: var(--accent-ink);
    border-color: var(--accent);
  }

  /* ── Skeleton loader ──────────────────────────────────── */

  .skel {
    background: linear-gradient(
      90deg,
      var(--bg-2) 25%,
      var(--bg-3) 50%,
      var(--bg-2) 75%
    );
    background-size: 200% 100%;
    animation: shimmer 1.5s infinite;
    border-radius: var(--r-sm);
  }

  @keyframes shimmer {
    0% {
      background-position: 200% 0;
    }
    100% {
      background-position: -200% 0;
    }
  }

  /* ── Toast notifications ──────────────────────────────── */

  .toast {
    position: fixed;
    bottom: 24px;
    right: 24px;
    background: var(--bg-2);
    border: 1px solid var(--line-2);
    border-radius: var(--r);
    padding: 14px 18px;
    box-shadow: var(--shadow);
    min-width: 240px;
    z-index: 9999;
    animation: slideIn 0.2s ease;
  }

  @keyframes slideIn {
    from {
      transform: translateY(16px);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
  ```

- [ ] Write `src/styles/tailwind.css`:

  ```css
  /* frontend/src/styles/tailwind.css */
  @tailwind base;
  @tailwind components;
  @tailwind utilities;
  ```

- [ ] Delete the scaffold-generated `tailwind.config.js` if present and write `tailwind.config.ts`:

  ```bash
  rm -f /home/shath/projects/auxillary/MySCORE/frontend/tailwind.config.js
  ```

  ```typescript
  // frontend/tailwind.config.ts
  import type { Config } from 'tailwindcss';

  export default {
    content: ['./index.html', './src/**/*.{ts,tsx}'],
    theme: {
      extend: {
        colors: {
          accent: 'var(--accent)',
          'accent-2': 'var(--accent-2)',
          'accent-ink': 'var(--accent-ink)',
          live: 'var(--live)',
          danger: 'var(--danger)',
          warn: 'var(--warn)',
          info: 'var(--info)',
          'bg-0': 'var(--bg-0)',
          'bg-1': 'var(--bg-1)',
          'bg-2': 'var(--bg-2)',
          'bg-3': 'var(--bg-3)',
          'bg-inset': 'var(--bg-inset)',
          'text-base': 'var(--text)',
          'text-dim': 'var(--text-dim)',
          'text-mute': 'var(--text-mute)',
        },
        fontFamily: {
          sans: ['var(--font-sans)'],
          mono: ['var(--font-mono)'],
        },
        borderRadius: {
          xs: 'var(--r-xs)',
          sm: 'var(--r-sm)',
          DEFAULT: 'var(--r)',
          lg: 'var(--r-lg)',
          xl: 'var(--r-xl)',
        },
        maxWidth: {
          page: 'var(--maxw)',
        },
        boxShadow: {
          card: 'var(--shadow)',
          sm: 'var(--shadow-sm)',
        },
      },
    },
    plugins: [],
  } satisfies Config;
  ```

- [ ] Update `postcss.config.js` to ensure Tailwind and autoprefixer are included (the `npx tailwindcss init -p` step should have generated this already; verify it looks like the following, rewriting if needed):

  ```javascript
  // frontend/postcss.config.js
  export default {
    plugins: {
      tailwindcss: {},
      autoprefixer: {},
    },
  };
  ```

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add -A
  git commit -m "feat: port design system tokens and Tailwind config"
  ```

---

## Task 3: Write shared TypeScript types

- [ ] Create the types directory:

  ```bash
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/types
  ```

- [ ] Write `src/types/index.ts` with all shared domain types:

  ```typescript
  // frontend/src/types/index.ts

  // ── Primitives ──────────────────────────────────────────────────────────────

  export type UserRole = 'user' | 'admin';
  export type MatchStage =
    | 'group'
    | 'r32'
    | 'r16'
    | 'qf'
    | 'sf'
    | 'third_place'
    | 'final';
  export type MatchStatus = 'scheduled' | 'locked' | 'live' | 'completed';

  // ── Domain entities ─────────────────────────────────────────────────────────

  export interface User {
    id: string;
    email: string;
    displayName: string;
    role: UserRole;
    isActive: boolean;
    mustChangePassword: boolean;
    createdAt: string;
  }

  export interface AuthTokenPayload {
    sub: string;
    email: string;
    role: UserRole;
    displayName: string;
  }

  export interface Tournament {
    id: string;
    name: string;
    year: number;
    isActive: boolean;
    lockMinutes: number;
  }

  export interface Team {
    id: string;
    tournamentId: string;
    name: string;
    fifaCode: string;
    isoCode: string;
    groupLabel: string;
  }

  export interface Match {
    id: string;
    tournamentId: string;
    homeTeam: Team;
    awayTeam: Team;
    kickoffAt: string;
    stage: MatchStage;
    groupLabel?: string;
    venue?: string;
    status: MatchStatus;
    homeScore?: number;
    awayScore?: number;
  }

  export interface Prediction {
    id: string;
    userId: string;
    matchId: string;
    homeScore: number;
    awayScore: number;
    pointsEarned?: number;
    createdAt: string;
    updatedAt: string;
    match?: Match;
  }

  export interface LeaderboardEntry {
    userId: string;
    tournamentId: string;
    user: User;
    totalPts: number;
    fullCount: number;
    totoCount: number;
    goalDiffCount: number;
    playedCount: number;
    rank: number;
    prevRank?: number;
  }

  export interface ScoreRules {
    id: string;
    tournamentId: string;
    totoPts: number;
    fullScorePts: number;
    goalDiffPts: number;
  }

  export interface Stats {
    mostExact: { user: User; count: number } | null;
    mostPredictions: { user: User; count: number } | null;
    consensusByMatch: Array<{
      match: Match;
      homePercent: number;
      drawPercent: number;
      awayPercent: number;
    }>;
    pointsByRound: Array<{ stage: string; avgPts: number }>;
  }

  export interface ApiError {
    statusCode: number;
    error: string;
    message: string;
  }

  // ── Request / Response DTOs ─────────────────────────────────────────────────

  export interface LoginRequest {
    email: string;
    password: string;
  }

  export interface LoginResponse {
    accessToken: string;
  }

  export interface RegisterRequest {
    displayName: string;
    email: string;
    password: string;
  }

  export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
  }

  export interface GeneratePasswordRequest {
    email: string;
  }

  export interface GeneratePasswordResponse {
    password: string;
  }

  export interface CreatePredictionRequest {
    matchId: string;
    homeScore: number;
    awayScore: number;
  }

  export interface UpdatePredictionRequest {
    homeScore: number;
    awayScore: number;
  }

  export interface MatchResultRequest {
    homeScore: number;
    awayScore: number;
  }

  export interface CreateMatchRequest {
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: string;
    stage: MatchStage;
    groupLabel?: string;
    venue?: string;
  }

  export interface CreateTeamRequest {
    tournamentId: string;
    name: string;
    fifaCode: string;
    isoCode: string;
    groupLabel: string;
  }
  ```

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/types/index.ts
  git commit -m "feat: define all shared TypeScript types"
  ```

---

## Task 4: Write the API client and all API modules

- [ ] Create the api directory:

  ```bash
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/api
  ```

- [ ] Write `src/api/client.ts` — axios instance with JWT request interceptor and 401 logout interceptor:

  ```typescript
  // frontend/src/api/client.ts
  import axios from 'axios';

  export const apiClient = axios.create({
    baseURL: import.meta.env.VITE_API_URL,
  });

  // Attach JWT to every request
  apiClient.interceptors.request.use((config) => {
    const token = localStorage.getItem('mscore_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  });

  // On 401, clear auth state and redirect to login
  apiClient.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.response?.status === 401) {
        localStorage.removeItem('mscore_token');
        window.location.href = '/login';
      }
      return Promise.reject(error);
    },
  );
  ```

- [ ] Write `src/api/queryClient.ts` — TanStack Query client singleton:

  ```typescript
  // frontend/src/api/queryClient.ts
  import { QueryClient } from '@tanstack/react-query';

  export const queryClient = new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 30_000,
        retry: 1,
      },
    },
  });
  ```

- [ ] Write `src/api/auth.ts`:

  ```typescript
  // frontend/src/api/auth.ts
  import type {
    LoginRequest,
    LoginResponse,
    RegisterRequest,
    User,
    ChangePasswordRequest,
    GeneratePasswordRequest,
    GeneratePasswordResponse,
  } from '../types';
  import { apiClient } from './client';

  export const authApi = {
    login: async (data: LoginRequest): Promise<LoginResponse> => {
      const res = await apiClient.post<LoginResponse>('/auth/login', data);
      return res.data;
    },

    register: async (data: RegisterRequest): Promise<User> => {
      const res = await apiClient.post<User>('/auth/register', data);
      return res.data;
    },

    generatePassword: async (
      data: GeneratePasswordRequest,
    ): Promise<GeneratePasswordResponse> => {
      const res = await apiClient.post<GeneratePasswordResponse>(
        '/auth/generate-password',
        data,
      );
      return res.data;
    },

    changePassword: async (data: ChangePasswordRequest): Promise<void> => {
      await apiClient.post('/auth/change-password', data);
    },
  };
  ```

- [ ] Write `src/api/users.ts`:

  ```typescript
  // frontend/src/api/users.ts
  import type { User } from '../types';
  import { apiClient } from './client';

  export const usersApi = {
    getMe: async (): Promise<User> => {
      const res = await apiClient.get<User>('/users/me');
      return res.data;
    },

    updateMe: async (data: Partial<Pick<User, 'displayName'>>): Promise<User> => {
      const res = await apiClient.patch<User>('/users/me', data);
      return res.data;
    },

    // Admin only
    listUsers: async (): Promise<User[]> => {
      const res = await apiClient.get<User[]>('/users');
      return res.data;
    },

    disableUser: async (id: string): Promise<void> => {
      await apiClient.patch(`/users/${id}/disable`);
    },

    resetUserPassword: async (id: string): Promise<{ password: string }> => {
      const res = await apiClient.post<{ password: string }>(
        `/users/${id}/reset-password`,
      );
      return res.data;
    },
  };
  ```

- [ ] Write `src/api/matches.ts`:

  ```typescript
  // frontend/src/api/matches.ts
  import type {
    Match,
    Tournament,
    ScoreRules,
    CreateMatchRequest,
    MatchResultRequest,
    MatchStatus,
  } from '../types';
  import { apiClient } from './client';

  export interface MatchFilters {
    group?: string;
    status?: MatchStatus;
    search?: string;
  }

  export const matchesApi = {
    getActiveTournament: async (): Promise<Tournament> => {
      const res = await apiClient.get<Tournament>('/tournaments/active');
      return res.data;
    },

    getMatches: async (
      tournamentId: string,
      filters: MatchFilters = {},
    ): Promise<Match[]> => {
      const params: Record<string, string> = {};
      if (filters.group) params.group = filters.group;
      if (filters.status) params.status = filters.status;
      if (filters.search) params.search = filters.search;
      const res = await apiClient.get<Match[]>(
        `/tournaments/${tournamentId}/matches`,
        { params },
      );
      return res.data;
    },

    getScoreRules: async (tournamentId: string): Promise<ScoreRules> => {
      const res = await apiClient.get<ScoreRules>(
        `/tournaments/${tournamentId}/score-rules`,
      );
      return res.data;
    },

    // Admin only
    updateScoreRules: async (
      tournamentId: string,
      data: Partial<Pick<ScoreRules, 'totoPts' | 'fullScorePts' | 'goalDiffPts'>>,
    ): Promise<ScoreRules> => {
      const res = await apiClient.patch<ScoreRules>(
        `/tournaments/${tournamentId}/score-rules`,
        data,
      );
      return res.data;
    },

    updateMatchStatus: async (
      matchId: string,
      status: MatchStatus,
    ): Promise<Match> => {
      const res = await apiClient.patch<Match>(`/matches/${matchId}/status`, {
        status,
      });
      return res.data;
    },

    updateMatchResult: async (
      matchId: string,
      data: MatchResultRequest,
    ): Promise<Match> => {
      const res = await apiClient.patch<Match>(
        `/matches/${matchId}/result`,
        data,
      );
      return res.data;
    },

    createMatch: async (data: CreateMatchRequest): Promise<Match> => {
      const res = await apiClient.post<Match>('/matches', data);
      return res.data;
    },
  };
  ```

- [ ] Write `src/api/predictions.ts`:

  ```typescript
  // frontend/src/api/predictions.ts
  import type {
    Prediction,
    CreatePredictionRequest,
    UpdatePredictionRequest,
  } from '../types';
  import { apiClient } from './client';

  export const predictionsApi = {
    getMyPredictions: async (): Promise<Prediction[]> => {
      const res = await apiClient.get<Prediction[]>('/predictions/me');
      return res.data;
    },

    createPrediction: async (
      data: CreatePredictionRequest,
    ): Promise<Prediction> => {
      const res = await apiClient.post<Prediction>('/predictions', data);
      return res.data;
    },

    updatePrediction: async (
      id: string,
      data: UpdatePredictionRequest,
    ): Promise<Prediction> => {
      const res = await apiClient.patch<Prediction>(`/predictions/${id}`, data);
      return res.data;
    },
  };
  ```

- [ ] Write `src/api/leaderboard.ts`:

  ```typescript
  // frontend/src/api/leaderboard.ts
  import type { LeaderboardEntry } from '../types';
  import { apiClient } from './client';

  export const leaderboardApi = {
    getLeaderboard: async (tournamentId: string): Promise<LeaderboardEntry[]> => {
      const res = await apiClient.get<LeaderboardEntry[]>('/leaderboard', {
        params: { tournamentId },
      });
      return res.data;
    },
  };
  ```

- [ ] Write `src/api/stats.ts`:

  ```typescript
  // frontend/src/api/stats.ts
  import type { Stats } from '../types';
  import { apiClient } from './client';

  export const statsApi = {
    getStats: async (): Promise<Stats> => {
      const res = await apiClient.get<Stats>('/stats');
      return res.data;
    },
  };
  ```

- [ ] Write `src/api/teams.ts`:

  ```typescript
  // frontend/src/api/teams.ts
  import type { Team, CreateTeamRequest } from '../types';
  import { apiClient } from './client';

  export const teamsApi = {
    getTeams: async (tournamentId: string): Promise<Team[]> => {
      const res = await apiClient.get<Team[]>(
        `/tournaments/${tournamentId}/teams`,
      );
      return res.data;
    },

    // Admin only
    createTeam: async (data: CreateTeamRequest): Promise<Team> => {
      const res = await apiClient.post<Team>('/teams', data);
      return res.data;
    },

    updateTeam: async (
      id: string,
      data: Partial<Omit<CreateTeamRequest, 'tournamentId'>>,
    ): Promise<Team> => {
      const res = await apiClient.patch<Team>(`/teams/${id}`, data);
      return res.data;
    },

    deleteTeam: async (id: string): Promise<void> => {
      await apiClient.delete(`/teams/${id}`);
    },
  };
  ```

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/api/
  git commit -m "feat: add typed axios API client and all API modules"
  ```

---

## Task 5: AuthContext, Router, and main.tsx — wire up the app

- [ ] Create required directories:

  ```bash
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/context
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/pages
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/components/layout
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/components/ui
  mkdir -p /home/shath/projects/auxillary/MySCORE/frontend/src/hooks
  ```

- [ ] Write `src/context/AuthContext.tsx`:

  ```typescript
  // frontend/src/context/AuthContext.tsx
  import {
    createContext,
    useCallback,
    useContext,
    useEffect,
    useMemo,
    useState,
  } from 'react';
  import { useNavigate } from 'react-router-dom';
  import { jwtDecode } from 'jwt-decode';
  import type { AuthTokenPayload } from '../types';

  const TOKEN_KEY = 'mscore_token';

  interface AuthContextValue {
    token: string | null;
    user: AuthTokenPayload | null;
    login: (token: string) => void;
    logout: () => void;
    isAuthenticated: boolean;
  }

  const AuthContext = createContext<AuthContextValue | null>(null);

  function decodeToken(token: string): AuthTokenPayload | null {
    try {
      return jwtDecode<AuthTokenPayload>(token);
    } catch {
      return null;
    }
  }

  export function AuthProvider({ children }: { children: React.ReactNode }) {
    const [token, setToken] = useState<string | null>(() =>
      localStorage.getItem(TOKEN_KEY),
    );
    const [user, setUser] = useState<AuthTokenPayload | null>(() => {
      const stored = localStorage.getItem(TOKEN_KEY);
      return stored ? decodeToken(stored) : null;
    });

    // Keep navigate accessible — must be inside RouterProvider
    // We use window.location for the 401 interceptor (outside React tree)
    // but useNavigate is used for in-app logout
    const navigate = useNavigate();

    const login = useCallback((newToken: string) => {
      localStorage.setItem(TOKEN_KEY, newToken);
      setToken(newToken);
      setUser(decodeToken(newToken));
    }, []);

    const logout = useCallback(() => {
      localStorage.removeItem(TOKEN_KEY);
      setToken(null);
      setUser(null);
      navigate('/login', { replace: true });
    }, [navigate]);

    // Sync state if token changes externally (e.g. another tab)
    useEffect(() => {
      const handler = (e: StorageEvent) => {
        if (e.key === TOKEN_KEY) {
          if (e.newValue) {
            setToken(e.newValue);
            setUser(decodeToken(e.newValue));
          } else {
            setToken(null);
            setUser(null);
          }
        }
      };
      window.addEventListener('storage', handler);
      return () => window.removeEventListener('storage', handler);
    }, []);

    const value = useMemo<AuthContextValue>(
      () => ({
        token,
        user,
        login,
        logout,
        isAuthenticated: token !== null && user !== null,
      }),
      [token, user, login, logout],
    );

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
  }

  export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) {
      throw new Error('useAuth must be used inside <AuthProvider>');
    }
    return ctx;
  }
  ```

- [ ] Write stub page files so the router compiles. Each stub is minimal — full implementations come in Parts 2–4:

  Write `src/pages/LoginPage.tsx`:

  ```typescript
  // frontend/src/pages/LoginPage.tsx
  export default function LoginPage() {
    return <div>Login</div>;
  }
  ```

  Write `src/pages/RegisterPage.tsx`:

  ```typescript
  // frontend/src/pages/RegisterPage.tsx
  export default function RegisterPage() {
    return <div>Register</div>;
  }
  ```

  Write `src/pages/ForgotPasswordPage.tsx`:

  ```typescript
  // frontend/src/pages/ForgotPasswordPage.tsx
  export default function ForgotPasswordPage() {
    return <div>Forgot Password</div>;
  }
  ```

  Write `src/pages/DashboardPage.tsx`:

  ```typescript
  // frontend/src/pages/DashboardPage.tsx
  export default function DashboardPage() {
    return <div>Dashboard</div>;
  }
  ```

  Write `src/pages/MatchesPage.tsx`:

  ```typescript
  // frontend/src/pages/MatchesPage.tsx
  export default function MatchesPage() {
    return <div>Matches</div>;
  }
  ```

  Write `src/pages/PredictionsPage.tsx`:

  ```typescript
  // frontend/src/pages/PredictionsPage.tsx
  export default function PredictionsPage() {
    return <div>Predictions</div>;
  }
  ```

  Write `src/pages/LeaderboardPage.tsx`:

  ```typescript
  // frontend/src/pages/LeaderboardPage.tsx
  export default function LeaderboardPage() {
    return <div>Leaderboard</div>;
  }
  ```

  Write `src/pages/StatsPage.tsx`:

  ```typescript
  // frontend/src/pages/StatsPage.tsx
  export default function StatsPage() {
    return <div>Stats</div>;
  }
  ```

  Write `src/pages/AdminPage.tsx`:

  ```typescript
  // frontend/src/pages/AdminPage.tsx
  export default function AdminPage() {
    return <div>Admin</div>;
  }
  ```

- [ ] Write a stub `src/components/layout/AppShell.tsx` (full shell with nav/sidebar comes in Part 2):

  ```typescript
  // frontend/src/components/layout/AppShell.tsx
  import { Outlet } from 'react-router-dom';

  export default function AppShell() {
    return (
      <div className="min-h-screen bg-bg-0 text-text-base">
        <Outlet />
      </div>
    );
  }
  ```

- [ ] Write `src/router.tsx` with all routes, ProtectedRoute, and AdminRoute:

  ```typescript
  // frontend/src/router.tsx
  import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
  import { useAuth } from './context/AuthContext';
  import AppShell from './components/layout/AppShell';
  import LoginPage from './pages/LoginPage';
  import RegisterPage from './pages/RegisterPage';
  import ForgotPasswordPage from './pages/ForgotPasswordPage';
  import DashboardPage from './pages/DashboardPage';
  import MatchesPage from './pages/MatchesPage';
  import PredictionsPage from './pages/PredictionsPage';
  import LeaderboardPage from './pages/LeaderboardPage';
  import StatsPage from './pages/StatsPage';
  import AdminPage from './pages/AdminPage';

  // Redirects to /login when not authenticated
  function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Outlet />;
  }

  // Redirects to / when not admin
  function AdminRoute() {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return <Outlet />;
  }

  // Redirects already-authenticated users away from auth pages
  function GuestRoute() {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <Outlet />;
  }

  export const router = createBrowserRouter([
    // Public / guest-only routes
    {
      element: <GuestRoute />,
      children: [
        { path: '/login', element: <LoginPage /> },
        { path: '/register', element: <RegisterPage /> },
        { path: '/forgot-password', element: <ForgotPasswordPage /> },
      ],
    },
    // Protected routes wrapped in AppShell
    {
      element: <ProtectedRoute />,
      children: [
        {
          element: <AppShell />,
          children: [
            { path: '/', element: <DashboardPage /> },
            { path: '/matches', element: <MatchesPage /> },
            { path: '/predictions', element: <PredictionsPage /> },
            { path: '/leaderboard', element: <LeaderboardPage /> },
            { path: '/stats', element: <StatsPage /> },
          ],
        },
      ],
    },
    // Admin-only routes wrapped in AppShell
    {
      element: <AdminRoute />,
      children: [
        {
          element: <AppShell />,
          children: [{ path: '/admin', element: <AdminPage /> }],
        },
      ],
    },
  ]);
  ```

  > **Note:** `ProtectedRoute`, `AdminRoute`, and `GuestRoute` use `useAuth()` which requires `<AuthProvider>` to be in the tree. The provider wraps `<RouterProvider>` in main.tsx, so hooks fire inside the router context — this is correct for React Router v6 data routers.

- [ ] Write `src/main.tsx`:

  ```typescript
  // frontend/src/main.tsx
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { RouterProvider } from 'react-router-dom';
  import { QueryClientProvider } from '@tanstack/react-query';
  import { queryClient } from './api/queryClient';
  import { AuthProvider } from './context/AuthContext';
  import { router } from './router';
  import './styles/global.css';
  import './styles/tailwind.css';

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          future={{ v7_startTransition: true }}
        />
      </QueryClientProvider>
    </React.StrictMode>,
  );
  ```

  > **Note on AuthProvider placement:** React Router v6 data routers (`createBrowserRouter`) require route components to be rendered inside `<RouterProvider>`. Because `AuthProvider` uses `useNavigate` internally, it must be rendered *inside* the router tree. Move `<AuthProvider>` to wrap the root layout element, or use a layout route. The cleanest approach: wrap `<AuthProvider>` around `<Outlet />` in a root layout route.

  Update `src/main.tsx` to not include `<AuthProvider>` at the top level (it must live inside the router):

  ```typescript
  // frontend/src/main.tsx  (FINAL — AuthProvider inside router via root layout)
  import React from 'react';
  import ReactDOM from 'react-dom/client';
  import { RouterProvider } from 'react-router-dom';
  import { QueryClientProvider } from '@tanstack/react-query';
  import { queryClient } from './api/queryClient';
  import { router } from './router';
  import './styles/global.css';
  import './styles/tailwind.css';

  ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
      <QueryClientProvider client={queryClient}>
        <RouterProvider
          router={router}
          future={{ v7_startTransition: true }}
        />
      </QueryClientProvider>
    </React.StrictMode>,
  );
  ```

  Update `src/router.tsx` to add a root layout route that provides `<AuthProvider>`:

  ```typescript
  // frontend/src/router.tsx  (FINAL — AuthProvider at root layout)
  import { createBrowserRouter, Navigate, Outlet } from 'react-router-dom';
  import { AuthProvider, useAuth } from './context/AuthContext';
  import AppShell from './components/layout/AppShell';
  import LoginPage from './pages/LoginPage';
  import RegisterPage from './pages/RegisterPage';
  import ForgotPasswordPage from './pages/ForgotPasswordPage';
  import DashboardPage from './pages/DashboardPage';
  import MatchesPage from './pages/MatchesPage';
  import PredictionsPage from './pages/PredictionsPage';
  import LeaderboardPage from './pages/LeaderboardPage';
  import StatsPage from './pages/StatsPage';
  import AdminPage from './pages/AdminPage';

  function RootLayout() {
    return (
      <AuthProvider>
        <Outlet />
      </AuthProvider>
    );
  }

  function ProtectedRoute() {
    const { isAuthenticated } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    return <Outlet />;
  }

  function AdminRoute() {
    const { isAuthenticated, user } = useAuth();
    if (!isAuthenticated) return <Navigate to="/login" replace />;
    if (user?.role !== 'admin') return <Navigate to="/" replace />;
    return <Outlet />;
  }

  function GuestRoute() {
    const { isAuthenticated } = useAuth();
    if (isAuthenticated) return <Navigate to="/" replace />;
    return <Outlet />;
  }

  export const router = createBrowserRouter([
    {
      element: <RootLayout />,
      children: [
        // Guest-only routes
        {
          element: <GuestRoute />,
          children: [
            { path: '/login', element: <LoginPage /> },
            { path: '/register', element: <RegisterPage /> },
            { path: '/forgot-password', element: <ForgotPasswordPage /> },
          ],
        },
        // Protected routes
        {
          element: <ProtectedRoute />,
          children: [
            {
              element: <AppShell />,
              children: [
                { path: '/', element: <DashboardPage /> },
                { path: '/matches', element: <MatchesPage /> },
                { path: '/predictions', element: <PredictionsPage /> },
                { path: '/leaderboard', element: <LeaderboardPage /> },
                { path: '/stats', element: <StatsPage /> },
              ],
            },
          ],
        },
        // Admin-only routes
        {
          element: <AdminRoute />,
          children: [
            {
              element: <AppShell />,
              children: [{ path: '/admin', element: <AdminPage /> }],
            },
          ],
        },
      ],
    },
  ]);
  ```

  Also update `src/context/AuthContext.tsx` — since `AuthProvider` now sits inside the router, `useNavigate` works correctly. No changes needed to the AuthContext code written earlier.

- [ ] Write `frontend/.env` for local development (create if not present):

  ```bash
  # frontend/.env
  VITE_API_URL=http://localhost:3001
  ```

  Run:

  ```bash
  echo "VITE_API_URL=http://localhost:3001" > /home/shath/projects/auxillary/MySCORE/frontend/.env
  ```

- [ ] Verify TypeScript compiles without errors:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend && npx tsc --noEmit
  ```

  Expected output: no errors. Fix any reported issues before proceeding.

- [ ] Verify the dev server starts cleanly:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend && npm run dev -- --port 3000
  ```

  Navigate to `http://localhost:3000/` in a browser. Should redirect to `/login` (showing "Login" stub). Press Ctrl+C to stop.

- [ ] Delete the scaffold boilerplate files that are no longer needed:

  ```bash
  rm -f /home/shath/projects/auxillary/MySCORE/frontend/src/App.tsx
  rm -f /home/shath/projects/auxillary/MySCORE/frontend/src/App.css
  rm -f /home/shath/projects/auxillary/MySCORE/frontend/src/index.css
  rm -f /home/shath/projects/auxillary/MySCORE/frontend/src/assets/react.svg
  rm -f /home/shath/projects/auxillary/MySCORE/frontend/public/vite.svg
  ```

- [ ] Final TypeScript check after cleanup:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend && npx tsc --noEmit
  ```

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add -A
  git commit -m "feat: wire AuthContext, React Router v6 with guards, and main entry point"
  ```

---

## Verification checklist

After completing all tasks, confirm:

- [ ] `npm run dev` starts on port 3000 with no console errors
- [ ] `npx tsc --noEmit` reports zero errors
- [ ] Navigating to `http://localhost:3000/` redirects to `/login`
- [ ] `src/styles/global.css` contains all CSS custom properties for both dark and light themes
- [ ] `src/types/index.ts` exports all 20+ types/interfaces
- [ ] `src/api/` contains `client.ts`, `queryClient.ts`, `auth.ts`, `users.ts`, `matches.ts`, `predictions.ts`, `leaderboard.ts`, `stats.ts`, `teams.ts`
- [ ] `src/context/AuthContext.tsx` exports `AuthProvider` and `useAuth`
- [ ] `src/router.tsx` exports `router` with `RootLayout`, `ProtectedRoute`, `AdminRoute`, `GuestRoute`
- [ ] `tailwind.config.ts` extends colors, fontFamily, borderRadius, and maxWidth with CSS variable references

---

## What comes next

- **Part 2:** Layout shell (AppShell, sidebar/nav, ThemeToggle, ToastProvider, useToast hook) + auth pages (LoginPage, RegisterPage, ForgotPasswordPage) with form validation
- **Part 3:** MatchesPage, PredictionsPage, score input widgets, match cards, useMatches and usePredictions hooks
- **Part 4:** LeaderboardPage, StatsPage, DashboardPage, AdminPage, and remaining hooks (useLeaderboard, useStats)
