import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { matchesApi } from '../api/matches';
import { useMatches } from '../hooks/useMatches';
import { usePredictions } from '../hooks/usePredictions';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { useAuth } from '../hooks/useAuth';
import { Card } from '../components/ui/Card';
import { Skel } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui/Avatar';
import { MiniMatch } from '../components/match/MiniMatch';
import { LiveMatchHero } from '../components/match/LiveMatchHero';
import type { Tournament } from '../types';

function StatTile({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <Card style={{ textAlign: 'center', flex: 1, minWidth: 100 }}>
      <div style={{ fontSize: 28, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
        {value}
      </div>
      <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-mute)', marginTop: 4 }}>{label}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>{sub}</div>}
    </Card>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();

  const { data: tournament, isLoading: tourLoading } = useQuery<Tournament>({
    queryKey: ['tournament', 'active'],
    queryFn: () => matchesApi.getActiveTournament(),
  });

  const { data: matches = [], isLoading: matchesLoading } = useMatches(tournament?.id ?? '', undefined);
  const { data: predictions = [], isLoading: predsLoading } = usePredictions();
  const { data: leaderboard = [], isLoading: lbLoading } = useLeaderboard(tournament?.id ?? '');

  const isLoading = tourLoading || matchesLoading || predsLoading || lbLoading;

  // My leaderboard entry
  const myEntry = leaderboard.find((e) => e.userId === user?.sub);

  // Predictions by matchId
  const predsByMatchId = new Map(predictions.map((p) => [p.matchId, p]));

  // Live match
  const liveMatch = matches.find((m) => m.status === 'live');

  // Upcoming within 6 hours
  const now = Date.now();
  const soonMatches = matches
    .filter((m) => {
      if (m.status !== 'scheduled') return false;
      const kickoff = new Date(m.kickoffAt).getTime();
      return kickoff > now && kickoff - now <= 6 * 60 * 60 * 1000;
    })
    .sort((a, b) => new Date(a.kickoffAt).getTime() - new Date(b.kickoffAt).getTime())
    .slice(0, 5);

  // Recent results
  const recentResults = matches
    .filter((m) => m.status === 'completed')
    .sort((a, b) => new Date(b.kickoffAt).getTime() - new Date(a.kickoffAt).getTime())
    .slice(0, 5);

  // Top 6 leaderboard
  const top6 = [...leaderboard].sort((a, b) => a.rank - b.rank).slice(0, 6);

  if (isLoading) {
    return (
      <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
        <Skel height="32px" width="200px" style={{ marginBottom: 24 }} />
        <div style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
          {[1, 2, 3, 4].map((i) => <Skel key={i} height="80px" style={{ flex: 1 }} />)}
        </div>
        <Skel height="160px" style={{ marginBottom: 24 }} />
        <Skel height="200px" />
      </div>
    );
  }

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      {/* Greeting */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 800, color: 'var(--text)' }}>
          Hey, {user?.displayName?.split(' ')[0] ?? 'there'} 👋
        </h1>
        {tournament && (
          <p style={{ fontSize: 13, color: 'var(--text-mute)', marginTop: 4 }}>
            {tournament.name} · {tournament.year}
          </p>
        )}
      </div>

      {/* Stat tiles */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 24, flexWrap: 'wrap' }}>
        <StatTile label="Rank" value={myEntry ? `#${myEntry.rank}` : '–'} />
        <StatTile label="Total pts" value={myEntry?.totalPts ?? 0} />
        <StatTile label="Full scores" value={myEntry?.fullCount ?? 0} />
        <StatTile label="Predictions" value={myEntry?.playedCount ?? 0} />
      </div>

      {/* Live match hero */}
      {liveMatch && (
        <LiveMatchHero match={liveMatch} prediction={predsByMatchId.get(liveMatch.id)} />
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
        {/* Predictions closing soon */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              Closing soon
            </h2>
            <Link to="/matches" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              All matches →
            </Link>
          </div>
          {soonMatches.length === 0 ? (
            <Card>
              <p style={{ fontSize: 13, color: 'var(--text-mute)', textAlign: 'center', padding: '12px 0' }}>
                No matches closing in the next 6 hours.
              </p>
            </Card>
          ) : (
            <Card padding={false}>
              {soonMatches.map((m) => (
                <MiniMatch key={m.id} match={m} prediction={predsByMatchId.get(m.id)} />
              ))}
            </Card>
          )}
        </div>

        {/* Recent results */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>
              Recent results
            </h2>
            <Link to="/predictions" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              My predictions →
            </Link>
          </div>
          {recentResults.length === 0 ? (
            <Card>
              <p style={{ fontSize: 13, color: 'var(--text-mute)', textAlign: 'center', padding: '12px 0' }}>
                No completed matches yet.
              </p>
            </Card>
          ) : (
            <Card padding={false}>
              {recentResults.map((m) => (
                <MiniMatch key={m.id} match={m} prediction={predsByMatchId.get(m.id)} />
              ))}
            </Card>
          )}
        </div>
      </div>

      {/* Leaderboard snapshot */}
      {top6.length > 0 && (
        <div style={{ marginTop: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
            <h2 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text)' }}>Leaderboard</h2>
            <Link to="/leaderboard" style={{ fontSize: 12, color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>
              Full table →
            </Link>
          </div>
          <Card padding={false}>
            {top6.map((entry) => {
              const isMe = entry.userId === user?.sub;
              return (
                <div
                  key={entry.userId}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 16px', borderBottom: '1px solid var(--line)',
                    background: isMe ? 'rgba(255,210,63,0.05)' : 'transparent',
                  }}
                >
                  <span style={{
                    width: 28, textAlign: 'center',
                    fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 13,
                    color: entry.rank <= 3 ? 'var(--accent)' : 'var(--text-mute)',
                  }}>
                    #{entry.rank}
                  </span>
                  <Avatar displayName={entry.user.displayName} size={28} />
                  <span style={{ flex: 1, fontSize: 14, fontWeight: isMe ? 800 : 500, color: isMe ? 'var(--accent)' : 'var(--text)' }}>
                    {entry.user.displayName}
                  </span>
                  <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
                    {entry.totalPts} pts
                  </span>
                </div>
              );
            })}
          </Card>
        </div>
      )}
    </div>
  );
}
