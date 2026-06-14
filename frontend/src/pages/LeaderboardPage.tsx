import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Skel } from '../components/ui/Skeleton';
import { PodiumRow } from '../components/leaderboard/PodiumRow';
import { StandingsTable } from '../components/leaderboard/StandingsTable';
import type { LeaderboardEntry, Tournament } from '../types';

type SortKey = 'pts' | 'exact' | 'correct';

const SORT_LABELS: { value: SortKey; label: string }[] = [
  { value: 'pts', label: 'Points' },
  { value: 'exact', label: 'Exact scores' },
  { value: 'correct', label: 'Correct results' },
];

function sortEntries(entries: LeaderboardEntry[], key: SortKey): LeaderboardEntry[] {
  return [...entries].sort((a, b) => {
    if (key === 'pts') return b.totalPts - a.totalPts;
    if (key === 'exact') return b.fullCount - a.fullCount || b.totalPts - a.totalPts;
    if (key === 'correct') return b.totoCount - a.totoCount || b.totalPts - a.totalPts;
    return 0;
  });
}

export default function LeaderboardPage() {
  const { user } = useAuth();
  const [sortKey, setSortKey] = useState<SortKey>('pts');

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ['tournament', 'active'],
    queryFn: () => matchesApi.getActiveTournament(),
  });

  const { data: entries = [], isLoading } = useLeaderboard(tournament?.id ?? '');

  const sorted = sortEntries(entries, sortKey);

  // Re-assign rank numbers based on sort
  const ranked = sorted.map((e, i) => ({ ...e, rank: i + 1 }));

  const first = ranked.find((e) => e.rank === 1);
  const second = ranked.find((e) => e.rank === 2);
  const third = ranked.find((e) => e.rank === 3);

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>Leaderboard</h1>

      {/* Sort control */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {SORT_LABELS.map(({ value, label }) => (
          <button
            key={value}
            className={`chip${sortKey === value ? ' sel' : ''}`}
            onClick={() => setSortKey(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <>
          <Skel height="200px" style={{ marginBottom: 24 }} />
          <Skel height="320px" />
        </>
      ) : (
        <>
          {/* Podium — hidden on mobile */}
          {first && second && third && (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 8, marginBottom: 32 }}
              className="hide-mobile">
              {/* 2nd, 1st, 3rd order */}
              <PodiumRow entry={second} rank={2} isMe={second.userId === user?.sub} />
              <PodiumRow entry={first} rank={1} isMe={first.userId === user?.sub} />
              <PodiumRow entry={third} rank={3} isMe={third.userId === user?.sub} />
            </div>
          )}

          {/* Standings table */}
          {ranked.length > 0 ? (
            <Card padding={false}>
              <StandingsTable entries={ranked} currentUserId={user?.sub ?? ''} />
            </Card>
          ) : (
            <Card style={{ textAlign: 'center', padding: 40 }}>
              <p style={{ color: 'var(--text-mute)', fontSize: 14 }}>No entries yet.</p>
            </Card>
          )}

          {/* Tiebreaker note */}
          <p style={{ fontSize: 12, color: 'var(--text-mute)', marginTop: 14, textAlign: 'center' }}>
            Tiebreaker: Full scores → Correct results → Total predictions
          </p>
        </>
      )}
    </div>
  );
}
