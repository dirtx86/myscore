# MySCORE Frontend — Part 4: Admin Page, Tests & DevOps

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build the admin panel (matches/teams/users/scoring tabs), add Vitest tests for PredictionForm, create the frontend Dockerfile with nginx, and verify the full stack end-to-end.

**Architecture:** AdminPage uses TanStack Query mutations for all CRUD; admin state is not in global context. Dockerfile is multi-stage (node build → nginx serve). nginx handles SPA routing.

**Tech Stack:** React 18, TypeScript 5, TanStack Query v5, Vitest, @testing-library/react, nginx:alpine

**Prerequisites:** Parts 1, 2, 3 complete. Backend running on port 3001.

---

## Task 1: AdminPage skeleton + MatchesTab

- [ ] Add admin API functions to `src/api/matches.ts`:

  ```typescript
  // Append to frontend/src/api/matches.ts

  export async function createMatch(data: {
    tournamentId: string;
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: string;
    stage: MatchStage;
    groupLabel?: string;
    venue?: string;
  }): Promise<Match> {
    const res = await api.post('/matches', data);
    return res.data;
  }

  export async function setMatchStatus(id: string, status: MatchStatus): Promise<Match> {
    const res = await api.patch(`/matches/${id}/status`, { status });
    return res.data;
  }

  export async function setMatchResult(
    id: string,
    scores: { homeScore: number; awayScore: number }
  ): Promise<Match> {
    const res = await api.patch(`/matches/${id}/result`, scores);
    return res.data;
  }
  ```

- [ ] Add admin API functions to `src/api/users.ts`:

  ```typescript
  // Append to frontend/src/api/users.ts

  export async function fetchAllUsers(): Promise<User[]> {
    const res = await api.get('/users');
    return res.data;
  }

  export async function disableUser(id: string): Promise<void> {
    await api.patch(`/users/${id}/disable`);
  }

  export async function resetUserPassword(id: string): Promise<{ password: string }> {
    const res = await api.post(`/users/${id}/reset-password`);
    return res.data;
  }
  ```

- [ ] Add admin API functions to `src/api/teams.ts` (create if it does not exist):

  ```typescript
  // frontend/src/api/teams.ts
  import api from './client';
  import type { Team } from '../types';

  export async function fetchTeams(tournamentId: string): Promise<Team[]> {
    const res = await api.get(`/tournaments/${tournamentId}/teams`);
    return res.data;
  }

  export async function createTeam(data: {
    tournamentId: string;
    name: string;
    fifaCode: string;
    isoCode: string;
    groupLabel: string;
  }): Promise<Team> {
    const res = await api.post('/teams', data);
    return res.data;
  }

  export async function updateTeam(
    id: string,
    data: Partial<Pick<Team, 'name' | 'fifaCode' | 'isoCode' | 'groupLabel'>>
  ): Promise<Team> {
    const res = await api.patch(`/teams/${id}`, data);
    return res.data;
  }

  export async function deleteTeam(id: string): Promise<void> {
    await api.delete(`/teams/${id}`);
  }
  ```

- [ ] Add score-rules + tournament API functions to `src/api/tournaments.ts` (create if it does not exist):

  ```typescript
  // frontend/src/api/tournaments.ts
  import api from './client';
  import type { ScoreRules, Tournament } from '../types';

  export async function fetchActiveTournament(): Promise<Tournament> {
    const res = await api.get('/tournaments/active');
    return res.data;
  }

  export async function fetchScoreRules(tournamentId: string): Promise<ScoreRules> {
    const res = await api.get(`/tournaments/${tournamentId}/score-rules`);
    return res.data;
  }

  export async function updateScoreRules(
    tournamentId: string,
    data: Pick<ScoreRules, 'totoPts' | 'fullScorePts' | 'goalDiffPts'>
  ): Promise<ScoreRules> {
    const res = await api.patch(`/tournaments/${tournamentId}/score-rules`, data);
    return res.data;
  }

  export async function updateTournamentLockMinutes(
    tournamentId: string,
    lockMinutes: number
  ): Promise<Tournament> {
    const res = await api.patch(`/tournaments/${tournamentId}`, { lockMinutes });
    return res.data;
  }
  ```

- [ ] Create `src/components/admin/ResultForm.tsx`:

  ```typescript
  // frontend/src/components/admin/ResultForm.tsx
  import { useState } from 'react';
  import { ScoreInput } from '../ui/ScoreInput';
  import { Button } from '../ui/Button';
  import type { Match } from '../../types';

  interface ResultFormProps {
    match: Match;
    onSave: (homeScore: number, awayScore: number) => void;
    onCancel: () => void;
  }

  export function ResultForm({ match, onSave, onCancel }: ResultFormProps) {
    const [home, setHome] = useState<number>(match.homeScore ?? 0);
    const [away, setAway] = useState<number>(match.awayScore ?? 0);
    const isKnockout = match.stage !== 'group';

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
        {isKnockout && (
          <p style={{ color: 'var(--warn)', fontSize: 12, margin: 0 }}>
            Enter AET score only (no penalty goals)
          </p>
        )}
        <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
          <ScoreInput value={home} onChange={setHome} />
          <span style={{ color: 'var(--text-dim)' }}>–</span>
          <ScoreInput value={away} onChange={setAway} />
          <Button variant="primary" onClick={() => onSave(home, away)}>
            Save Result
          </Button>
          <Button variant="ghost" onClick={onCancel}>
            Cancel
          </Button>
        </div>
      </div>
    );
  }
  ```

- [ ] Create `src/components/admin/MatchesTab.tsx`:

  ```typescript
  // frontend/src/components/admin/MatchesTab.tsx
  import { useState } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { fetchMatches } from '../../api/matches';
  import { createMatch, setMatchStatus, setMatchResult } from '../../api/matches';
  import { Button } from '../ui/Button';
  import { Input } from '../ui/Input';
  import { StatusPill } from '../ui/StatusPill';
  import { TeamTag } from '../ui/TeamTag';
  import { ResultForm } from './ResultForm';
  import { useToast } from '../../hooks/useToast';
  import type { Match, MatchStage, MatchStatus, Team } from '../../types';

  const STAGES: MatchStage[] = ['group', 'r32', 'r16', 'qf', 'sf', 'third_place', 'final'];
  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];
  const STATUSES: MatchStatus[] = ['scheduled', 'locked', 'live', 'completed'];

  interface MatchesTabProps {
    tournamentId: string;
    teams: Team[];
  }

  interface CreateForm {
    homeTeamId: string;
    awayTeamId: string;
    kickoffAt: string;
    stage: MatchStage;
    groupLabel: string;
    venue: string;
  }

  export function MatchesTab({ tournamentId, teams }: MatchesTabProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [resultMatchId, setResultMatchId] = useState<string | null>(null);
    const [showCreate, setShowCreate] = useState(false);
    const [form, setForm] = useState<CreateForm>({
      homeTeamId: '',
      awayTeamId: '',
      kickoffAt: '',
      stage: 'group',
      groupLabel: 'A',
      venue: '',
    });

    const { data: matches = [], isLoading } = useQuery<Match[]>({
      queryKey: ['admin-matches', tournamentId],
      queryFn: () => fetchMatches(tournamentId),
    });

    const statusMutation = useMutation({
      mutationFn: ({ id, status }: { id: string; status: MatchStatus }) =>
        setMatchStatus(id, status),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-matches', tournamentId] });
        showToast('Match status updated', 'success');
      },
      onError: () => showToast('Failed to update status', 'error'),
    });

    const resultMutation = useMutation({
      mutationFn: ({
        id,
        homeScore,
        awayScore,
      }: {
        id: string;
        homeScore: number;
        awayScore: number;
      }) => setMatchResult(id, { homeScore, awayScore }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-matches', tournamentId] });
        setResultMatchId(null);
        showToast('Result saved — leaderboard recalculated', 'success');
      },
      onError: () => showToast('Failed to save result', 'error'),
    });

    const createMutation = useMutation({
      mutationFn: () =>
        createMatch({
          tournamentId,
          homeTeamId: form.homeTeamId,
          awayTeamId: form.awayTeamId,
          kickoffAt: new Date(form.kickoffAt).toISOString(),
          stage: form.stage,
          groupLabel: form.stage === 'group' ? form.groupLabel : undefined,
          venue: form.venue || undefined,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-matches', tournamentId] });
        setShowCreate(false);
        setForm({
          homeTeamId: '',
          awayTeamId: '',
          kickoffAt: '',
          stage: 'group',
          groupLabel: 'A',
          venue: '',
        });
        showToast('Match created', 'success');
      },
      onError: () => showToast('Failed to create match', 'error'),
    });

    const formatKickoff = (iso: string) =>
      new Date(iso).toLocaleString(undefined, {
        dateStyle: 'short',
        timeStyle: 'short',
      });

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Create match toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Cancel' : '+ New Match'}
          </Button>
        </div>

        {/* Create match form */}
        {showCreate && (
          <div
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r)',
              padding: 20,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: 16,
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Home Team</span>
              <select
                value={form.homeTeamId}
                onChange={(e) => setForm((f) => ({ ...f, homeTeamId: e.target.value }))}
                style={{
                  background: 'var(--bg-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '8px 10px',
                }}
              >
                <option value="">Select team…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fifaCode} — {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Away Team</span>
              <select
                value={form.awayTeamId}
                onChange={(e) => setForm((f) => ({ ...f, awayTeamId: e.target.value }))}
                style={{
                  background: 'var(--bg-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '8px 10px',
                }}
              >
                <option value="">Select team…</option>
                {teams.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.fifaCode} — {t.name}
                  </option>
                ))}
              </select>
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Kickoff (local time)</span>
              <Input
                type="datetime-local"
                value={form.kickoffAt}
                onChange={(e) => setForm((f) => ({ ...f, kickoffAt: e.target.value }))}
              />
            </label>

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Stage</span>
              <select
                value={form.stage}
                onChange={(e) =>
                  setForm((f) => ({ ...f, stage: e.target.value as MatchStage }))
                }
                style={{
                  background: 'var(--bg-2)',
                  color: 'var(--text)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '8px 10px',
                }}
              >
                {STAGES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </label>

            {form.stage === 'group' && (
              <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Group</span>
                <select
                  value={form.groupLabel}
                  onChange={(e) => setForm((f) => ({ ...f, groupLabel: e.target.value }))}
                  style={{
                    background: 'var(--bg-2)',
                    color: 'var(--text)',
                    border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)',
                    padding: '8px 10px',
                  }}
                >
                  {GROUPS.map((g) => (
                    <option key={g} value={g}>
                      Group {g}
                    </option>
                  ))}
                </select>
              </label>
            )}

            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Venue (optional)</span>
              <Input
                type="text"
                placeholder="e.g. MetLife Stadium"
                value={form.venue}
                onChange={(e) => setForm((f) => ({ ...f, venue: e.target.value }))}
              />
            </label>

            <div
              style={{
                gridColumn: '1 / -1',
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 12,
              }}
            >
              <Button
                variant="primary"
                onClick={() => createMutation.mutate()}
                disabled={
                  !form.homeTeamId ||
                  !form.awayTeamId ||
                  !form.kickoffAt ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? 'Creating…' : 'Create Match'}
              </Button>
            </div>
          </div>
        )}

        {/* Matches table */}
        {isLoading ? (
          <p style={{ color: 'var(--text-dim)' }}>Loading matches…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table
              style={{
                width: '100%',
                borderCollapse: 'collapse',
                fontSize: 14,
              }}
            >
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                  {[
                    'Date/Time',
                    'Home',
                    'Away',
                    'Stage',
                    'Venue',
                    'Status',
                    'Result',
                    'Actions',
                  ].map((h) => (
                    <th
                      key={h}
                      style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <>
                    <tr
                      key={match.id}
                      style={{ borderBottom: '1px solid var(--line)', verticalAlign: 'middle' }}
                    >
                      <td style={{ padding: '10px 12px', whiteSpace: 'nowrap' }}>
                        {formatKickoff(match.kickoffAt)}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <TeamTag team={match.homeTeam} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <TeamTag team={match.awayTeam} />
                      </td>
                      <td style={{ padding: '10px 12px' }}>{match.stage}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>
                        {match.venue ?? '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <StatusPill status={match.status} />
                      </td>
                      <td style={{ padding: '10px 12px', fontVariantNumeric: 'tabular-nums' }}>
                        {match.homeScore != null && match.awayScore != null
                          ? `${match.homeScore} – ${match.awayScore}`
                          : '—'}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                          {match.status !== 'completed' && (
                            <select
                              value={match.status}
                              onChange={(e) =>
                                statusMutation.mutate({
                                  id: match.id,
                                  status: e.target.value as MatchStatus,
                                })
                              }
                              style={{
                                background: 'var(--bg-2)',
                                color: 'var(--text)',
                                border: '1px solid var(--line)',
                                borderRadius: 'var(--r-sm)',
                                padding: '4px 8px',
                                fontSize: 13,
                              }}
                            >
                              {STATUSES.map((s) => (
                                <option key={s} value={s}>
                                  {s}
                                </option>
                              ))}
                            </select>
                          )}
                          <Button
                            variant="ghost"
                            onClick={() =>
                              setResultMatchId(
                                resultMatchId === match.id ? null : match.id
                              )
                            }
                          >
                            {resultMatchId === match.id ? 'Cancel' : 'Enter Result'}
                          </Button>
                        </div>
                      </td>
                    </tr>
                    {resultMatchId === match.id && (
                      <tr key={`result-${match.id}`}>
                        <td
                          colSpan={8}
                          style={{
                            padding: '12px 20px',
                            background: 'var(--bg-1)',
                          }}
                        >
                          <ResultForm
                            match={match}
                            onSave={(homeScore, awayScore) =>
                              resultMutation.mutate({ id: match.id, homeScore, awayScore })
                            }
                            onCancel={() => setResultMatchId(null)}
                          />
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

- [ ] Create the main `src/pages/AdminPage.tsx` skeleton with tab navigation (TeamsTab, UsersTab, and ScoringTab imported as stubs — they will be filled in subsequent tasks):

  ```typescript
  // frontend/src/pages/AdminPage.tsx
  import { useState } from 'react';
  import { useQuery } from '@tanstack/react-query';
  import { Navigate } from 'react-router-dom';
  import { useAuth } from '../hooks/useAuth';
  import { fetchActiveTournament } from '../api/tournaments';
  import { fetchTeams } from '../api/teams';
  import { MatchesTab } from '../components/admin/MatchesTab';
  import { TeamsTab } from '../components/admin/TeamsTab';
  import { UsersTab } from '../components/admin/UsersTab';
  import { ScoringTab } from '../components/admin/ScoringTab';
  import type { Tournament, Team } from '../types';

  type TabId = 'matches' | 'teams' | 'users' | 'scoring';

  const TABS: { id: TabId; label: string }[] = [
    { id: 'matches', label: 'Matches' },
    { id: 'teams', label: 'Teams' },
    { id: 'users', label: 'Users' },
    { id: 'scoring', label: 'Scoring' },
  ];

  export function AdminPage() {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<TabId>('matches');

    const { data: tournament } = useQuery<Tournament>({
      queryKey: ['active-tournament'],
      queryFn: fetchActiveTournament,
    });

    const { data: teams = [] } = useQuery<Team[]>({
      queryKey: ['teams', tournament?.id],
      queryFn: () => fetchTeams(tournament!.id),
      enabled: !!tournament?.id,
    });

    if (!user || user.role !== 'admin') {
      return <Navigate to="/" replace />;
    }

    return (
      <div style={{ maxWidth: 1200, margin: '0 auto', padding: '24px 16px' }}>
        <h1
          style={{
            fontSize: 24,
            fontWeight: 700,
            color: 'var(--text)',
            marginBottom: 24,
          }}
        >
          Admin Panel
        </h1>

        {/* Tab nav */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--line)',
            marginBottom: 32,
          }}
        >
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                padding: '12px 20px',
                fontSize: 14,
                fontWeight: 500,
                color: activeTab === tab.id ? 'var(--text)' : 'var(--text-dim)',
                borderBottom:
                  activeTab === tab.id
                    ? '2px solid var(--accent)'
                    : '2px solid transparent',
                marginBottom: -1,
                transition: 'color 0.15s, border-color 0.15s',
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab content */}
        {tournament ? (
          <>
            {activeTab === 'matches' && (
              <MatchesTab tournamentId={tournament.id} teams={teams} />
            )}
            {activeTab === 'teams' && <TeamsTab tournamentId={tournament.id} />}
            {activeTab === 'users' && <UsersTab />}
            {activeTab === 'scoring' && (
              <ScoringTab tournamentId={tournament.id} tournament={tournament} />
            )}
          </>
        ) : (
          <p style={{ color: 'var(--text-dim)' }}>Loading tournament…</p>
        )}
      </div>
    );
  }
  ```

- [ ] Add the `/admin` route to `src/App.tsx`. Import `AdminPage` and add a `<Route path="/admin" element={<AdminPage />} />` inside the authenticated route group alongside the existing routes.

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/api/matches.ts src/api/users.ts src/api/teams.ts src/api/tournaments.ts \
    src/components/admin/ResultForm.tsx src/components/admin/MatchesTab.tsx \
    src/pages/AdminPage.tsx src/App.tsx
  git commit -m "feat: add AdminPage skeleton with MatchesTab (match list, result form, create form)"
  ```

---

## Task 2: TeamsTab

- [ ] Create `src/components/admin/TeamsTab.tsx`:

  ```typescript
  // frontend/src/components/admin/TeamsTab.tsx
  import { useState } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { fetchTeams, createTeam, updateTeam, deleteTeam } from '../../api/teams';
  import { Button } from '../ui/Button';
  import { Input } from '../ui/Input';
  import { Flag } from '../ui/Flag';
  import { useToast } from '../../hooks/useToast';
  import type { Team } from '../../types';

  const GROUPS = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

  interface TeamsTabProps {
    tournamentId: string;
  }

  interface EditState {
    name: string;
    fifaCode: string;
    isoCode: string;
    groupLabel: string;
  }

  interface CreateState {
    name: string;
    fifaCode: string;
    isoCode: string;
    groupLabel: string;
  }

  export function TeamsTab({ tournamentId }: TeamsTabProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editForm, setEditForm] = useState<EditState>({
      name: '',
      fifaCode: '',
      isoCode: '',
      groupLabel: 'A',
    });
    const [showCreate, setShowCreate] = useState(false);
    const [createForm, setCreateForm] = useState<CreateState>({
      name: '',
      fifaCode: '',
      isoCode: '',
      groupLabel: 'A',
    });

    const { data: teams = [], isLoading } = useQuery<Team[]>({
      queryKey: ['teams', tournamentId],
      queryFn: () => fetchTeams(tournamentId),
    });

    const createMutation = useMutation({
      mutationFn: () =>
        createTeam({
          tournamentId,
          name: createForm.name,
          fifaCode: createForm.fifaCode.toUpperCase(),
          isoCode: createForm.isoCode.toLowerCase(),
          groupLabel: createForm.groupLabel,
        }),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] });
        setShowCreate(false);
        setCreateForm({ name: '', fifaCode: '', isoCode: '', groupLabel: 'A' });
        showToast('Team created', 'success');
      },
      onError: () => showToast('Failed to create team', 'error'),
    });

    const updateMutation = useMutation({
      mutationFn: ({ id, data }: { id: string; data: Partial<EditState> }) =>
        updateTeam(id, data),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] });
        setEditingId(null);
        showToast('Team updated', 'success');
      },
      onError: () => showToast('Failed to update team', 'error'),
    });

    const deleteMutation = useMutation({
      mutationFn: (id: string) => deleteTeam(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['teams', tournamentId] });
        showToast('Team deleted', 'success');
      },
      onError: () => showToast('Failed to delete team', 'error'),
    });

    const startEdit = (team: Team) => {
      setEditingId(team.id);
      setEditForm({
        name: team.name,
        fifaCode: team.fifaCode,
        isoCode: team.isoCode,
        groupLabel: team.groupLabel,
      });
    };

    const handleDelete = (team: Team) => {
      if (window.confirm(`Delete ${team.name} (${team.fifaCode})? This cannot be undone.`)) {
        deleteMutation.mutate(team.id);
      }
    };

    const inputStyle = {
      background: 'var(--bg-2)',
      color: 'var(--text)',
      border: '1px solid var(--line)',
      borderRadius: 'var(--r-sm)',
      padding: '4px 8px',
      fontSize: 13,
      width: '100%',
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Create team toggle */}
        <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
          <Button variant="primary" onClick={() => setShowCreate((v) => !v)}>
            {showCreate ? 'Cancel' : '+ New Team'}
          </Button>
        </div>

        {/* Create team form */}
        {showCreate && (
          <div
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r)',
              padding: 20,
              display: 'grid',
              gridTemplateColumns: '1fr 1fr 1fr 1fr',
              gap: 16,
              alignItems: 'end',
            }}
          >
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Name</span>
              <Input
                type="text"
                placeholder="Argentina"
                value={createForm.name}
                onChange={(e) => setCreateForm((f) => ({ ...f, name: e.target.value }))}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>FIFA Code</span>
              <Input
                type="text"
                placeholder="ARG"
                maxLength={3}
                value={createForm.fifaCode}
                onChange={(e) =>
                  setCreateForm((f) => ({
                    ...f,
                    fifaCode: e.target.value.toUpperCase(),
                  }))
                }
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>ISO Code (flag)</span>
              <Input
                type="text"
                placeholder="ar"
                value={createForm.isoCode}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, isoCode: e.target.value.toLowerCase() }))
                }
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>Group</span>
              <select
                value={createForm.groupLabel}
                onChange={(e) =>
                  setCreateForm((f) => ({ ...f, groupLabel: e.target.value }))
                }
                style={inputStyle}
              >
                {GROUPS.map((g) => (
                  <option key={g} value={g}>
                    Group {g}
                  </option>
                ))}
              </select>
            </label>
            <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'flex-end' }}>
              <Button
                variant="primary"
                onClick={() => createMutation.mutate()}
                disabled={
                  !createForm.name ||
                  createForm.fifaCode.length !== 3 ||
                  !createForm.isoCode ||
                  createMutation.isPending
                }
              >
                {createMutation.isPending ? 'Creating…' : 'Create Team'}
              </Button>
            </div>
          </div>
        )}

        {/* Teams table */}
        {isLoading ? (
          <p style={{ color: 'var(--text-dim)' }}>Loading teams…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                  {['Flag', 'FIFA Code', 'Name', 'Group', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {teams.map((team) =>
                  editingId === team.id ? (
                    <tr
                      key={team.id}
                      style={{ borderBottom: '1px solid var(--line)', background: 'var(--bg-1)' }}
                    >
                      <td style={{ padding: '8px 12px' }}>
                        <Flag isoCode={editForm.isoCode} size={24} />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          style={inputStyle}
                          maxLength={3}
                          value={editForm.fifaCode}
                          onChange={(e) =>
                            setEditForm((f) => ({
                              ...f,
                              fifaCode: e.target.value.toUpperCase(),
                            }))
                          }
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <input
                          style={inputStyle}
                          value={editForm.name}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, name: e.target.value }))
                          }
                        />
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <select
                          style={inputStyle}
                          value={editForm.groupLabel}
                          onChange={(e) =>
                            setEditForm((f) => ({ ...f, groupLabel: e.target.value }))
                          }
                        >
                          {GROUPS.map((g) => (
                            <option key={g} value={g}>
                              {g}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td style={{ padding: '8px 12px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button
                            variant="primary"
                            onClick={() =>
                              updateMutation.mutate({ id: team.id, data: editForm })
                            }
                            disabled={updateMutation.isPending}
                          >
                            Save
                          </Button>
                          <Button variant="ghost" onClick={() => setEditingId(null)}>
                            Cancel
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    <tr key={team.id} style={{ borderBottom: '1px solid var(--line)' }}>
                      <td style={{ padding: '10px 12px' }}>
                        <Flag isoCode={team.isoCode} size={24} />
                      </td>
                      <td
                        style={{
                          padding: '10px 12px',
                          fontWeight: 600,
                          letterSpacing: '0.05em',
                        }}
                      >
                        {team.fifaCode}
                      </td>
                      <td style={{ padding: '10px 12px' }}>{team.name}</td>
                      <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>
                        Group {team.groupLabel}
                      </td>
                      <td style={{ padding: '10px 12px' }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <Button variant="ghost" onClick={() => startEdit(team)}>
                            Edit
                          </Button>
                          <Button
                            variant="danger"
                            onClick={() => handleDelete(team)}
                            disabled={deleteMutation.isPending}
                          >
                            Delete
                          </Button>
                        </div>
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/components/admin/TeamsTab.tsx
  git commit -m "feat: add admin TeamsTab with inline edit, delete, and create form"
  ```

---

## Task 3: UsersTab

- [ ] Create `src/components/admin/UsersTab.tsx`:

  ```typescript
  // frontend/src/components/admin/UsersTab.tsx
  import { useState } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { fetchAllUsers, disableUser, resetUserPassword } from '../../api/users';
  import { Button } from '../ui/Button';
  import { Avatar } from '../ui/Avatar';
  import { useToast } from '../../hooks/useToast';
  import type { User } from '../../types';

  interface ResetResult {
    userId: string;
    password: string;
  }

  export function UsersTab() {
    const queryClient = useQueryClient();
    const { showToast } = useToast();
    const [resetResult, setResetResult] = useState<ResetResult | null>(null);

    const { data: users = [], isLoading } = useQuery<User[]>({
      queryKey: ['admin-users'],
      queryFn: fetchAllUsers,
    });

    const disableMutation = useMutation({
      mutationFn: (id: string) => disableUser(id),
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['admin-users'] });
        showToast('User disabled', 'success');
      },
      onError: () => showToast('Failed to disable user', 'error'),
    });

    const resetMutation = useMutation({
      mutationFn: (id: string) => resetUserPassword(id),
      onSuccess: (data, userId) => {
        setResetResult({ userId, password: data.password });
      },
      onError: () => showToast('Failed to reset password', 'error'),
    });

    const handleCopy = () => {
      if (resetResult) {
        navigator.clipboard.writeText(resetResult.password);
        showToast('Password copied to clipboard', 'success');
      }
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
        {/* Generated password modal overlay */}
        {resetResult && (
          <div
            style={{
              position: 'fixed',
              inset: 0,
              background: 'rgba(0,0,0,0.6)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              zIndex: 9999,
            }}
            onClick={() => setResetResult(null)}
          >
            <div
              style={{
                background: 'var(--bg-1)',
                border: '1px solid var(--line)',
                borderRadius: 'var(--r-lg)',
                padding: 32,
                maxWidth: 400,
                width: '90%',
                display: 'flex',
                flexDirection: 'column',
                gap: 16,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <h3 style={{ margin: 0, color: 'var(--text)', fontSize: 18 }}>
                New Password Generated
              </h3>
              <p style={{ margin: 0, color: 'var(--danger)', fontSize: 13 }}>
                This password is shown once. Copy it now and share securely.
              </p>
              <div
                style={{
                  background: 'var(--bg-2)',
                  border: '1px solid var(--line)',
                  borderRadius: 'var(--r-sm)',
                  padding: '12px 16px',
                  fontFamily: 'monospace',
                  fontSize: 16,
                  letterSpacing: '0.05em',
                  color: 'var(--text)',
                  userSelect: 'all',
                }}
              >
                {resetResult.password}
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <Button variant="primary" onClick={handleCopy}>
                  Copy Password
                </Button>
                <Button variant="ghost" onClick={() => setResetResult(null)}>
                  Close
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Users table */}
        {isLoading ? (
          <p style={{ color: 'var(--text-dim)' }}>Loading users…</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--line)', color: 'var(--text-dim)' }}>
                  {['', 'Name', 'Email', 'Role', 'Status', 'Created', 'Actions'].map((h) => (
                    <th
                      key={h}
                      style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 500 }}
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {users.map((user: User) => (
                  <tr
                    key={user.id}
                    style={{
                      borderBottom: '1px solid var(--line)',
                      opacity: user.isActive ? 1 : 0.5,
                    }}
                  >
                    <td style={{ padding: '10px 12px', width: 40 }}>
                      <Avatar displayName={user.displayName} size={32} />
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{ fontWeight: 500 }}>{user.displayName}</span>
                      {!user.isActive && (
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            color: 'var(--danger)',
                            background: 'color-mix(in srgb, var(--danger) 15%, transparent)',
                            padding: '2px 6px',
                            borderRadius: 4,
                          }}
                        >
                          [Disabled]
                        </span>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px', color: 'var(--text-dim)' }}>
                      {user.email}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background:
                            user.role === 'admin'
                              ? 'color-mix(in srgb, var(--accent) 20%, transparent)'
                              : 'var(--bg-2)',
                          color: user.role === 'admin' ? 'var(--accent)' : 'var(--text-dim)',
                        }}
                      >
                        {user.role}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span
                        style={{
                          fontSize: 12,
                          padding: '2px 8px',
                          borderRadius: 4,
                          background: user.isActive
                            ? 'color-mix(in srgb, #22c55e 15%, transparent)'
                            : 'var(--bg-2)',
                          color: user.isActive ? '#22c55e' : 'var(--text-mute)',
                        }}
                      >
                        {user.isActive ? 'active' : 'disabled'}
                      </span>
                    </td>
                    <td
                      style={{
                        padding: '10px 12px',
                        color: 'var(--text-dim)',
                        whiteSpace: 'nowrap',
                      }}
                    >
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ display: 'flex', gap: 8 }}>
                        {user.isActive && (
                          <Button
                            variant="danger"
                            onClick={() => disableMutation.mutate(user.id)}
                            disabled={disableMutation.isPending}
                          >
                            Disable
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          onClick={() => resetMutation.mutate(user.id)}
                          disabled={resetMutation.isPending}
                        >
                          Reset Password
                        </Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    );
  }
  ```

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/components/admin/UsersTab.tsx
  git commit -m "feat: add admin UsersTab with disable user and reset-password modal"
  ```

---

## Task 4: ScoringTab

- [ ] Create `src/components/admin/ScoringTab.tsx`:

  ```typescript
  // frontend/src/components/admin/ScoringTab.tsx
  import { useState, useEffect } from 'react';
  import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
  import { fetchScoreRules, updateScoreRules, updateTournamentLockMinutes } from '../../api/tournaments';
  import { Button } from '../ui/Button';
  import { Input } from '../ui/Input';
  import { useToast } from '../../hooks/useToast';
  import type { Tournament, ScoreRules } from '../../types';

  interface ScoringTabProps {
    tournamentId: string;
    tournament: Tournament;
  }

  interface ScoringForm {
    totoPts: number;
    fullScorePts: number;
    goalDiffPts: number;
    lockMinutes: number;
  }

  export function ScoringTab({ tournamentId, tournament }: ScoringTabProps) {
    const queryClient = useQueryClient();
    const { showToast } = useToast();

    const { data: rules } = useQuery<ScoreRules>({
      queryKey: ['score-rules', tournamentId],
      queryFn: () => fetchScoreRules(tournamentId),
    });

    const [form, setForm] = useState<ScoringForm>({
      totoPts: 1,
      fullScorePts: 3,
      goalDiffPts: 1,
      lockMinutes: 15,
    });

    useEffect(() => {
      if (rules && tournament) {
        setForm({
          totoPts: rules.totoPts,
          fullScorePts: rules.fullScorePts,
          goalDiffPts: rules.goalDiffPts,
          lockMinutes: tournament.lockMinutes,
        });
      }
    }, [rules, tournament]);

    const saveMutation = useMutation({
      mutationFn: async () => {
        await updateScoreRules(tournamentId, {
          totoPts: form.totoPts,
          fullScorePts: form.fullScorePts,
          goalDiffPts: form.goalDiffPts,
        });
        await updateTournamentLockMinutes(tournamentId, form.lockMinutes);
      },
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['score-rules', tournamentId] });
        queryClient.invalidateQueries({ queryKey: ['active-tournament'] });
        showToast('Scoring rules saved', 'success');
      },
      onError: () => showToast('Failed to save scoring rules', 'error'),
    });

    const setField =
      (key: keyof ScoringForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = Math.max(0, parseInt(e.target.value, 10) || 0);
        setForm((f) => ({ ...f, [key]: value }));
      };

    const previewRows = [
      {
        label: 'Correct winner / draw (toto)',
        pts: form.totoPts,
      },
      {
        label: `Exact score (toto + full)`,
        pts: form.totoPts + form.fullScorePts,
      },
      {
        label: `Correct goal difference (toto + diff)`,
        pts: form.totoPts + form.goalDiffPts,
      },
      {
        label: 'Wrong result',
        pts: 0,
      },
    ];

    const fieldStyle = {
      display: 'flex' as const,
      flexDirection: 'column' as const,
      gap: 6,
    };

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, maxWidth: 640 }}>
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 20 }}>
            Scoring Rules
          </h2>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            <label style={fieldStyle}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                Toto points (correct result / draw)
              </span>
              <Input
                type="number"
                min={0}
                value={form.totoPts}
                onChange={setField('totoPts')}
              />
            </label>

            <label style={fieldStyle}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                Full score bonus (additional for exact scoreline)
              </span>
              <Input
                type="number"
                min={0}
                value={form.fullScorePts}
                onChange={setField('fullScorePts')}
              />
            </label>

            <label style={fieldStyle}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                Goal difference bonus (additional for correct diff)
              </span>
              <Input
                type="number"
                min={0}
                value={form.goalDiffPts}
                onChange={setField('goalDiffPts')}
              />
            </label>

            <label style={fieldStyle}>
              <span style={{ fontSize: 13, color: 'var(--text-dim)' }}>
                Lock window (minutes before kickoff)
              </span>
              <Input
                type="number"
                min={0}
                value={form.lockMinutes}
                onChange={setField('lockMinutes')}
              />
            </label>
          </div>
        </div>

        {/* Live preview */}
        <div>
          <h2 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text)', marginBottom: 16 }}>
            Live Preview
          </h2>
          <div
            style={{
              background: 'var(--bg-1)',
              border: '1px solid var(--line)',
              borderRadius: 'var(--r)',
              overflow: 'hidden',
            }}
          >
            {previewRows.map((row, i) => (
              <div
                key={row.label}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '12px 20px',
                  borderBottom:
                    i < previewRows.length - 1 ? '1px solid var(--line)' : undefined,
                  background: row.pts === 0 ? 'transparent' : undefined,
                }}
              >
                <span style={{ color: 'var(--text-dim)', fontSize: 14 }}>{row.label}</span>
                <span
                  style={{
                    fontWeight: 700,
                    fontSize: 16,
                    color: row.pts === 0 ? 'var(--text-mute)' : 'var(--accent)',
                    fontVariantNumeric: 'tabular-nums',
                  }}
                >
                  {row.pts} pts
                </span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 8 }}>
            Predictions lock {form.lockMinutes} minute{form.lockMinutes !== 1 ? 's' : ''} before
            kickoff.
          </p>
        </div>

        <div>
          <Button
            variant="primary"
            onClick={() => saveMutation.mutate()}
            disabled={saveMutation.isPending}
          >
            {saveMutation.isPending ? 'Saving…' : 'Save Rules'}
          </Button>
        </div>
      </div>
    );
  }
  ```

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add src/components/admin/ScoringTab.tsx
  git commit -m "feat: add admin ScoringTab with live scoring preview and lock-minutes setting"
  ```

---

## Task 5: Vitest setup + PredictionForm tests

- [ ] Install Vitest and testing library dependencies (if not already present from Part 1):

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  npm install -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event jsdom @vitejs/plugin-react
  ```

- [ ] Write `vitest.config.ts` in the `frontend/` directory:

  ```typescript
  // frontend/vitest.config.ts
  import { defineConfig } from 'vitest/config';
  import react from '@vitejs/plugin-react';

  export default defineConfig({
    plugins: [react()],
    test: {
      environment: 'jsdom',
      setupFiles: ['./src/test/setup.ts'],
    },
  });
  ```

- [ ] Create the test setup file `src/test/setup.ts`:

  ```typescript
  // frontend/src/test/setup.ts
  import '@testing-library/jest-dom';
  ```

- [ ] Add a `test` script to `frontend/package.json`. Open `package.json` and add `"test": "vitest run"` and `"test:watch": "vitest"` to the `"scripts"` object:

  ```json
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "test": "vitest run",
    "test:watch": "vitest"
  }
  ```

- [ ] Create `src/components/match/PredictionForm.test.tsx`:

  ```typescript
  // frontend/src/components/match/PredictionForm.test.tsx
  import { render, screen } from '@testing-library/react';
  import userEvent from '@testing-library/user-event';
  import { PredictionForm } from './PredictionForm';
  import { describe, it, expect, vi } from 'vitest';
  import type { Match, ScoreRules } from '../../types';

  const mockMatch: Match = {
    id: 'm1',
    tournamentId: 't1',
    homeTeam: {
      id: 'h1',
      tournamentId: 't1',
      name: 'Mexico',
      fifaCode: 'MEX',
      isoCode: 'mx',
      groupLabel: 'A',
    },
    awayTeam: {
      id: 'a1',
      tournamentId: 't1',
      name: 'Argentina',
      fifaCode: 'ARG',
      isoCode: 'ar',
      groupLabel: 'A',
    },
    kickoffAt: new Date(Date.now() + 3_600_000).toISOString(), // 1 hour from now
    stage: 'group',
    groupLabel: 'A',
    status: 'scheduled',
  };

  const mockRules: ScoreRules = {
    id: 'r1',
    tournamentId: 't1',
    totoPts: 1,
    fullScorePts: 3,
    goalDiffPts: 1,
  };

  describe('PredictionForm', () => {
    it('disables all inputs when isLocked is true', () => {
      render(
        <PredictionForm
          match={mockMatch}
          rules={mockRules}
          onSave={vi.fn()}
          isLocked={true}
        />
      );
      const inputs = screen.getAllByRole('spinbutton');
      expect(inputs[0]).toBeDisabled();
    });

    it('clamps stepper to 0 minimum', async () => {
      render(
        <PredictionForm
          match={mockMatch}
          rules={mockRules}
          onSave={vi.fn()}
          isLocked={false}
        />
      );
      const downBtn = screen.getAllByLabelText(/decrease/i)[0];
      await userEvent.click(downBtn); // already at 0, should stay 0
      expect(screen.getAllByRole('spinbutton')[0]).toHaveValue(0);
    });

    it('clamps stepper to 20 maximum', async () => {
      render(
        <PredictionForm
          match={mockMatch}
          rules={mockRules}
          onSave={vi.fn()}
          isLocked={false}
        />
      );
      const input = screen.getAllByRole('spinbutton')[0];
      await userEvent.clear(input);
      await userEvent.type(input, '20');
      await userEvent.click(screen.getAllByLabelText(/increase/i)[0]);
      expect(input).toHaveValue(20);
    });

    it('calls onSave with home and away scores on submit', async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      render(
        <PredictionForm
          match={mockMatch}
          rules={mockRules}
          onSave={onSave}
          isLocked={false}
        />
      );
      await userEvent.click(screen.getAllByLabelText(/increase/i)[0]); // home = 1
      await userEvent.click(screen.getByRole('button', { name: /save prediction/i }));
      expect(onSave).toHaveBeenCalledWith(1, 0);
    });
  });
  ```

- [ ] Run the test suite to confirm all 4 tests pass:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  npm run test
  ```

  Expected output: `4 passed` with no failures.

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add vitest.config.ts src/test/setup.ts src/components/match/PredictionForm.test.tsx package.json
  git commit -m "feat: add Vitest setup and PredictionForm unit tests (4 test cases)"
  ```

---

## Task 6: Frontend Dockerfile + nginx + docker-compose update

- [ ] Create `frontend/Dockerfile`:

  ```dockerfile
  # frontend/Dockerfile
  FROM node:20-alpine AS build
  WORKDIR /app
  COPY package*.json ./
  RUN npm ci
  COPY . .
  ARG VITE_API_URL=http://localhost:3001
  ENV VITE_API_URL=$VITE_API_URL
  RUN npm run build

  FROM nginx:alpine AS production
  COPY --from=build /app/dist /usr/share/nginx/html
  COPY nginx.conf /etc/nginx/conf.d/default.conf
  EXPOSE 3000
  CMD ["nginx", "-g", "daemon off;"]
  ```

- [ ] Create `frontend/nginx.conf`:

  ```nginx
  server {
      listen 3000;
      root /usr/share/nginx/html;
      index index.html;

      location / {
          try_files $uri $uri/ /index.html;
      }

      location ~* \.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2)$ {
          expires 1y;
          add_header Cache-Control "public, immutable";
      }
  }
  ```

- [ ] Create `frontend/.dockerignore` to keep the image lean:

  ```
  node_modules
  dist
  .env
  .env.*
  *.local
  coverage
  .git
  ```

- [ ] Update `docker-compose.yml` in the repository root. Open the file and locate the `frontend` service block. Replace it with the following (preserving the rest of the compose file unchanged):

  ```yaml
    frontend:
      build:
        context: ./frontend
        dockerfile: Dockerfile
        args:
          VITE_API_URL: ${VITE_API_URL:-http://localhost:3001}
      ports:
        - "3000:3000"
      depends_on:
        - backend
      restart: unless-stopped
  ```

  The `VITE_API_URL` arg lets operators override the API base URL at build time (e.g. `VITE_API_URL=https://api.myscore.example.com docker-compose build`).

- [ ] Verify the Dockerfile builds successfully (optional but recommended — requires Docker to be running):

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  docker build --build-arg VITE_API_URL=http://localhost:3001 -t myscore-frontend:test .
  ```

  Expect: `Successfully built` / `naming to docker.io/library/myscore-frontend:test` with no errors.

- [ ] Commit:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE/frontend
  git add Dockerfile nginx.conf .dockerignore
  cd /home/shath/projects/auxillary/MySCORE
  git add docker-compose.yml
  git commit -m "feat: add frontend Dockerfile (multi-stage node/nginx) and update docker-compose"
  ```

---

## Task 7: End-to-end verification checklist

Perform these steps manually after running `docker-compose up --build` from the `MySCORE/` root.

- [ ] Run the full stack:

  ```bash
  cd /home/shath/projects/auxillary/MySCORE
  docker-compose up --build
  ```

- [ ] Confirm all 3 containers start with no crash-loop errors in the logs: `db`, `backend`, `frontend`.

- [ ] Open `http://localhost:3001/api/docs` — Swagger UI renders with all endpoints listed.

- [ ] Navigate to `http://localhost:3000` — browser redirects to `/login`.

- [ ] Register a new user at `/register` — form submits successfully, auto-login occurs, and the dashboard (`/`) renders with an empty fixture list.

- [ ] Test forgot-password flow: click "Forgot password" on `/login`, enter the registered email, receive a new password displayed on screen, log out, then log back in with the new password.

- [ ] Log in as `admin@myscore.local` / `changeme123` — forced password change screen appears; complete it and reach the dashboard.

- [ ] As admin, navigate to `/admin` → Matches tab — create a group-stage match with kickoff set 20 minutes from now (so predictions are still open).

- [ ] Log in as the regular user — match appears on dashboard; submit a prediction (e.g. 2–0); confirm toast "Prediction saved".

- [ ] Verify prediction lock: wait until the match is within 15 minutes of kickoff (or set kickoff to now + 10 min) — the PredictionForm inputs are disabled and show a "Locked" state.

- [ ] As admin → Matches tab: click "Enter Result" on the match, enter `2–0`, click "Save Result". Verify toast "Result saved — leaderboard recalculated".

- [ ] Navigate to `/leaderboard` as any user — scores are updated:
  - Prediction `2–0` → 4 pts (toto 1 + full 3)
  - Prediction `3–1` → 2 pts (toto 1 + goal diff 1)
  - Prediction `1–0` → 1 pt (toto only)
  - Prediction `0–1` → 0 pts

- [ ] Leaderboard sort order: highest total points first; ties broken by `full_count` desc, then `toto_count` desc.

- [ ] As admin: create a knockout-stage match (stage = `qf`). Click "Enter Result" — confirm the warning "Enter AET score only (no penalty goals)" is visible in the result form.

- [ ] Theme toggle: click the sun/moon icon in the nav bar — page switches between dark and light theme without page reload; CSS variables update correctly.

- [ ] Resize browser to ≤880px (or use DevTools mobile emulation) — sidebar is hidden and a mobile bottom tab bar is visible with navigation icons.
