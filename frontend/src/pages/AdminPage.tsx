import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../hooks/useAuth';
import { getActiveTournament } from '../api/tournaments';
import { teamsApi } from '../api/teams';
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

export default function AdminPage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<TabId>('matches');

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ['active-tournament'],
    queryFn: getActiveTournament,
  });

  const { data: teams = [] } = useQuery<Team[]>({
    queryKey: ['teams', tournament?.id],
    queryFn: () => teamsApi.getTeams(tournament!.id),
    enabled: !!tournament?.id,
  });

  if (!user || user.role !== 'admin') {
    return <div style={{ padding: 40, color: 'var(--danger)' }}>Access denied.</div>;
  }

  const tabBtnStyle = (active: boolean): React.CSSProperties => ({
    background: 'none', border: 'none', cursor: 'pointer',
    padding: '12px 20px', fontSize: 14, fontWeight: 500,
    color: active ? 'var(--text)' : 'var(--text-dim)',
    borderBottom: active ? '2px solid var(--accent)' : '2px solid transparent',
    marginBottom: -1, transition: 'color 0.15s, border-color 0.15s',
  });

  return (
    <div>
      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Admin Panel</h1>
      <div style={{ display: 'flex', borderBottom: '1px solid var(--line)', marginBottom: 32 }}>
        {TABS.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={tabBtnStyle(activeTab === tab.id)}>
            {tab.label}
          </button>
        ))}
      </div>
      {tournament ? (
        <>
          {activeTab === 'matches' && <MatchesTab tournamentId={tournament.id} teams={teams} />}
          {activeTab === 'teams' && <TeamsTab tournamentId={tournament.id} />}
          {activeTab === 'users' && <UsersTab />}
          {activeTab === 'scoring' && <ScoringTab tournamentId={tournament.id} tournament={tournament} />}
        </>
      ) : (
        <p style={{ color: 'var(--text-dim)' }}>Loading tournament…</p>
      )}
    </div>
  );
}
