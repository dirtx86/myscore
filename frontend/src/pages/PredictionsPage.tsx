import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { usePredictions } from '../hooks/usePredictions';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Skel } from '../components/ui/Skeleton';
import { Flag } from '../components/ui/Flag';
import { PtsTag } from '../components/ui/PtsTag';
import { StatusPill } from '../components/ui/StatusPill';
import type { Match, Prediction, ScoreRules, Tournament } from '../types';

type FilterTab = 'all' | 'exact' | 'correct' | 'wrong';

const TABS: { value: FilterTab; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'exact', label: 'Full score' },
  { value: 'correct', label: 'Correct result' },
  { value: 'wrong', label: 'Wrong' },
];

function getOutcome(pred: Prediction, match: Match): 'exact' | 'correct' | 'wrong' | 'pending' {
  if (match.status !== 'completed' || match.homeScore == null || match.awayScore == null) {
    return 'pending';
  }
  const predHome = pred.homeScore;
  const predAway = pred.awayScore;
  const realHome = match.homeScore;
  const realAway = match.awayScore;

  if (predHome === realHome && predAway === realAway) return 'exact';

  const predResult = predHome > predAway ? 'home' : predHome < predAway ? 'away' : 'draw';
  const realResult = realHome > realAway ? 'home' : realHome < realAway ? 'away' : 'draw';
  if (predResult === realResult) return 'correct';

  return 'wrong';
}

interface PredictionRowProps {
  prediction: Prediction;
  match: Match;
  rules: ScoreRules;
}

function PredictionRow({ prediction, match, rules }: PredictionRowProps) {
  const outcome = getOutcome(prediction, match);
  const isCompleted = match.status === 'completed';

  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
      borderBottom: '1px solid var(--line)',
    }}>
      {/* Teams + Pick */}
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: 8 }}>
        <Flag isoCode={match.homeTeam.isoCode} size={18} />
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
          {match.homeTeam.fifaCode}
        </span>
        <span style={{ fontSize: 12, color: 'var(--text-mute)', margin: '0 4px' }}>vs</span>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', fontFamily: 'var(--font-mono)' }}>
          {match.awayTeam.fifaCode}
        </span>
        <Flag isoCode={match.awayTeam.isoCode} size={18} />
      </div>

      {/* Pick */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
        <span style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 600, marginBottom: 2 }}>PICK</span>
        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
          {prediction.homeScore} – {prediction.awayScore}
        </span>
      </div>

      {/* Result */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', minWidth: 60 }}>
        <span style={{ fontSize: 10, color: 'var(--text-mute)', fontWeight: 600, marginBottom: 2 }}>RESULT</span>
        {isCompleted && match.homeScore != null ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
            {match.homeScore} – {match.awayScore}
          </span>
        ) : (
          <span style={{ color: 'var(--text-mute)', fontSize: 12 }}>—</span>
        )}
      </div>

      {/* Points / Status */}
      <div style={{ minWidth: 64, display: 'flex', justifyContent: 'flex-end' }}>
        {isCompleted ? (
          <PtsTag pts={prediction.pointsEarned} rules={rules} />
        ) : (
          <StatusPill status={match.status} />
        )}
      </div>

      {/* Outcome indicator */}
      {outcome !== 'pending' && (
        <div style={{
          width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
          background: outcome === 'exact' ? 'var(--accent)' : outcome === 'correct' ? 'var(--info)' : 'var(--danger)',
        }} />
      )}
    </div>
  );
}

export default function PredictionsPage() {
  const { user } = useAuth();
  const [tab, setTab] = useState<FilterTab>('all');

  const { data: tournament } = useQuery<Tournament>({
    queryKey: ['tournament', 'active'],
    queryFn: () => matchesApi.getActiveTournament(),
  });

  const { data: rules } = useQuery<ScoreRules>({
    queryKey: ['score-rules', tournament?.id],
    queryFn: () => matchesApi.getScoreRules(tournament!.id),
    enabled: !!tournament?.id,
  });

  const { data: predictions = [], isLoading: predsLoading } = usePredictions();
  const { data: leaderboard = [], isLoading: lbLoading } = useLeaderboard(tournament?.id ?? '');

  const myEntry = leaderboard.find((e) => e.userId === user?.sub);

  const defaultRules: ScoreRules = rules ?? {
    id: '', tournamentId: '', totoPts: 1, fullScorePts: 2, goalDiffPts: 1,
  };

  // Predictions with match data
  const predsWithMatch = predictions.filter((p) => p.match != null) as (Prediction & { match: Match })[];

  // Filter by tab
  const filtered = predsWithMatch.filter((p) => {
    if (tab === 'all') return true;
    const outcome = getOutcome(p, p.match);
    if (tab === 'exact') return outcome === 'exact';
    if (tab === 'correct') return outcome === 'correct';
    if (tab === 'wrong') return outcome === 'wrong';
    return true;
  });

  // Split into completed and upcoming
  const completed = filtered.filter((p) => p.match.status === 'completed')
    .sort((a, b) => new Date(b.match.kickoffAt).getTime() - new Date(a.match.kickoffAt).getTime());
  const upcoming = filtered.filter((p) => p.match.status !== 'completed')
    .sort((a, b) => new Date(a.match.kickoffAt).getTime() - new Date(b.match.kickoffAt).getTime());

  const isLoading = predsLoading || lbLoading;

  return (
    <div style={{ padding: '24px 20px', maxWidth: 860, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>My Predictions</h1>

      {/* Summary tiles */}
      {isLoading ? (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4, 5].map((i) => <Skel key={i} height="72px" style={{ flex: 1 }} />)}
        </div>
      ) : (
        <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
          {[
            { label: 'Rank', value: myEntry ? `#${myEntry.rank}` : '–' },
            { label: 'Points', value: myEntry?.totalPts ?? 0 },
            { label: 'Full scores', value: myEntry?.fullCount ?? 0 },
            { label: 'Correct result', value: myEntry?.totoCount ?? 0 },
            { label: 'Played', value: myEntry?.playedCount ?? 0 },
          ].map(({ label, value }) => (
            <Card key={label} style={{ flex: 1, minWidth: 90, textAlign: 'center' }}>
              <div style={{ fontSize: 22, fontWeight: 800, fontFamily: 'var(--font-mono)' }}>{value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 4, fontWeight: 600 }}>{label}</div>
            </Card>
          ))}
        </div>
      )}

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap' }}>
        {TABS.map(({ value, label }) => (
          <button
            key={value}
            className={`chip${tab === value ? ' sel' : ''}`}
            onClick={() => setTab(value)}
          >
            {label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {[1, 2, 3, 4].map((i) => <Skel key={i} height="52px" />)}
        </div>
      ) : predsWithMatch.length === 0 ? (
        <Card style={{ textAlign: 'center', padding: 40 }}>
          <p style={{ color: 'var(--text-mute)', fontSize: 14 }}>No predictions yet. Head to Matches to start predicting!</p>
        </Card>
      ) : (
        <>
          {/* Upcoming */}
          {upcoming.length > 0 && (
            <div style={{ marginBottom: 24 }}>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Upcoming
              </h2>
              <Card padding={false}>
                {upcoming.map((p) => (
                  <PredictionRow key={p.id} prediction={p} match={p.match} rules={defaultRules} />
                ))}
              </Card>
            </div>
          )}

          {/* Completed */}
          {completed.length > 0 && (
            <div>
              <h2 style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Results
              </h2>
              <Card padding={false}>
                {completed.map((p) => (
                  <PredictionRow key={p.id} prediction={p} match={p.match} rules={defaultRules} />
                ))}
              </Card>
            </div>
          )}

          {filtered.length === 0 && (
            <Card style={{ textAlign: 'center', padding: 32 }}>
              <p style={{ color: 'var(--text-mute)', fontSize: 14 }}>No predictions match this filter.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
