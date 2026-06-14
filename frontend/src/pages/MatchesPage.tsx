import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { useMatches } from '../hooks/useMatches';
import { usePredictions, useSavePrediction } from '../hooks/usePredictions';
import { Card } from '../components/ui/Card';
import { Skel } from '../components/ui/Skeleton';
import { MatchCard } from '../components/match/MatchCard';
import type { MatchStatus, ScoreRules, Tournament } from '../types';

const STATUS_LABELS: { value: MatchStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'scheduled', label: 'To Predict' },
  { value: 'live', label: 'Live' },
  { value: 'completed', label: 'Results' },
];

const GROUPS = ['All', 'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L'];

function formatDateHeading(dateStr: string): string {
  const d = new Date(dateStr);
  const today = new Date();
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  if (d.toDateString() === today.toDateString()) return 'Today';
  if (d.toDateString() === tomorrow.toDateString()) return 'Tomorrow';
  return d.toLocaleDateString(undefined, { weekday: 'long', month: 'short', day: 'numeric' });
}

export default function MatchesPage() {
  const [statusFilter, setStatusFilter] = useState<MatchStatus | 'all'>('all');
  const [groupFilter, setGroupFilter] = useState('All');
  const [search, setSearch] = useState('');

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ['tournament', 'active'],
    queryFn: () => matchesApi.getActiveTournament(),
  });

  const { data: rules } = useQuery<ScoreRules>({
    queryKey: ['score-rules', tournament?.id],
    queryFn: () => matchesApi.getScoreRules(tournament!.id),
    enabled: !!tournament?.id,
  });

  const { data: matches = [], isLoading: matchesLoading } = useMatches(tournament?.id ?? '', {
    status: statusFilter !== 'all' ? statusFilter : undefined,
    group: groupFilter !== 'All' ? groupFilter : undefined,
    search: search.trim() || undefined,
  });

  const { data: predictions = [] } = usePredictions();
  const savePrediction = useSavePrediction();

  const predsByMatchId = new Map(predictions.map((p) => [p.matchId, p]));

  // Group matches by date
  const grouped = new Map<string, typeof matches>();
  for (const m of matches) {
    const dateKey = new Date(m.kickoffAt).toDateString();
    const group = grouped.get(dateKey) ?? [];
    group.push(m);
    grouped.set(dateKey, group);
  }

  const defaultRules: ScoreRules = rules ?? {
    id: '', tournamentId: '', totoPts: 1, fullScorePts: 2, goalDiffPts: 1,
  };

  return (
    <div style={{ padding: '24px 20px', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>Matches</h1>

      {/* Filters */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 20 }}>
        {/* Status filter */}
        <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {STATUS_LABELS.map(({ value, label }) => (
            <button
              key={value}
              className={`chip${statusFilter === value ? ' sel' : ''}`}
              onClick={() => setStatusFilter(value)}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Group chips */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
          {GROUPS.map((g) => (
            <button
              key={g}
              className={`chip${groupFilter === g ? ' sel' : ''}`}
              style={{ padding: '4px 10px', fontSize: 11 }}
              onClick={() => setGroupFilter(g)}
            >
              {g === 'All' ? 'All Groups' : `Group ${g}`}
            </button>
          ))}
        </div>

        {/* Search */}
        <input
          type="search"
          placeholder="Search teams..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            background: 'var(--bg-inset)', border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-sm)', padding: '9px 14px', color: 'var(--text)',
            fontFamily: 'var(--font-sans)', fontSize: 14, width: '100%', maxWidth: 320, outline: 'none',
          }}
        />
      </div>

      {matchesLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {[1, 2, 3].map((i) => <Skel key={i} height="140px" />)}
        </div>
      ) : grouped.size === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-mute)', fontSize: 14 }}>No matches match your filters.</p>
        </Card>
      ) : (
        Array.from(grouped.entries()).map(([dateKey, dayMatches]) => (
          <div key={dateKey} style={{ marginBottom: 28 }}>
            <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 12 }}>
              {formatDateHeading(dayMatches[0].kickoffAt)}
            </h2>
            {dayMatches.map((match) => {
              const prediction = predsByMatchId.get(match.id);
              return (
                <MatchCard
                  key={match.id}
                  match={match}
                  prediction={prediction}
                  rules={defaultRules}
                  onPredictionSave={async (home, away) => {
                    await savePrediction.mutateAsync({
                      matchId: match.id,
                      homeScore: home,
                      awayScore: away,
                      existingPredictionId: prediction?.id,
                    });
                  }}
                />
              );
            })}
          </div>
        ))
      )}
    </div>
  );
}
