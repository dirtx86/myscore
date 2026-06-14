import { useQuery } from '@tanstack/react-query';
import { matchesApi } from '../api/matches';
import { useStats } from '../hooks/useStats';
import { useLeaderboard } from '../hooks/useLeaderboard';
import { Card } from '../components/ui/Card';
import { Skel } from '../components/ui/Skeleton';
import { Avatar } from '../components/ui/Avatar';
import { Flag } from '../components/ui/Flag';
import type { Tournament } from '../types';

interface ConsensusBarProps {
  label: string;
  percent: number;
  color: string;
}

function ConsensusBar({ label, percent, color }: ConsensusBarProps) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      <span style={{ fontSize: 12, color: 'var(--text-mute)', width: 42, textAlign: 'right', fontWeight: 600 }}>
        {label}
      </span>
      <div style={{ flex: 1, height: 10, background: 'var(--bg-3)', borderRadius: 99, overflow: 'hidden' }}>
        <div style={{
          width: `${Math.max(0, Math.min(100, percent))}%`,
          height: '100%', background: color, borderRadius: 99,
          transition: 'width 0.4s ease',
        }} />
      </div>
      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: 36 }}>
        {percent.toFixed(0)}%
      </span>
    </div>
  );
}

export default function StatsPage() {
  const { data: tournament } = useQuery<Tournament>({
    queryKey: ['tournament', 'active'],
    queryFn: () => matchesApi.getActiveTournament(),
  });

  const { data: stats, isLoading: statsLoading } = useStats();
  const { data: leaderboard = [], isLoading: lbLoading } = useLeaderboard(tournament?.id ?? '');

  const isLoading = statsLoading || lbLoading;

  // Top 5 by exact scores
  const topExact = [...leaderboard]
    .sort((a, b) => b.fullCount - a.fullCount || b.totalPts - a.totalPts)
    .slice(0, 5);

  // Top 5 by predictions made
  const topPredictions = [...leaderboard]
    .sort((a, b) => b.playedCount - a.playedCount || b.totalPts - a.totalPts)
    .slice(0, 5);

  // Biggest comeback: largest positive rank delta (prevRank was worst, now best → prev - current is largest)
  const biggestComeback = leaderboard.length > 0
    ? [...leaderboard].reduce((best, e) => {
      if (e.prevRank == null) return best;
      const delta = e.prevRank - e.rank;
      if (best === null) return delta > 0 ? e : null;
      const bestDelta = best.prevRank != null ? best.prevRank - best.rank : 0;
      return delta > bestDelta ? e : best;
    }, null as typeof leaderboard[0] | null)
    : null;

  // Points bar chart
  const maxAvg = stats
    ? Math.max(...stats.pointsByRound.map((r) => r.avgPts), 0.1)
    : 1;

  // First consensus match
  const consensusItem = stats?.consensusByMatch[0];

  return (
    <div style={{ padding: '24px 20px', maxWidth: 900, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 800, marginBottom: 20, color: 'var(--text)' }}>Stats</h1>

      {isLoading ? (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {[1, 2, 3].map((i) => <Skel key={i} height="100px" />)}
        </div>
      ) : (
        <>
          {/* Award cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginBottom: 28 }}>
            {/* Most exact scores */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Most full scores
              </div>
              {stats?.mostExact ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar displayName={stats.mostExact.user.displayName} size={36} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{stats.mostExact.user.displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{stats.mostExact.count} exact</div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-mute)' }}>No data yet</p>
              )}
            </Card>

            {/* Most predictions */}
            <Card>
              <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                Most predictions
              </div>
              {stats?.mostPredictions ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar displayName={stats.mostPredictions.user.displayName} size={36} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{stats.mostPredictions.user.displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{stats.mostPredictions.count} picks</div>
                  </div>
                </div>
              ) : (
                <p style={{ fontSize: 13, color: 'var(--text-mute)' }}>No data yet</p>
              )}
            </Card>

            {/* Top scorer */}
            {leaderboard.length > 0 && (
              <Card>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Top scorer
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar displayName={leaderboard[0].user.displayName} size={36} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{leaderboard[0].user.displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>{leaderboard[0].totalPts} pts</div>
                  </div>
                </div>
              </Card>
            )}

            {/* Biggest comeback */}
            {biggestComeback && biggestComeback.prevRank != null && biggestComeback.prevRank - biggestComeback.rank > 0 && (
              <Card>
                <div style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 10 }}>
                  Biggest comeback
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar displayName={biggestComeback.user.displayName} size={36} />
                  <div>
                    <div style={{ fontWeight: 700, fontSize: 14 }}>{biggestComeback.user.displayName}</div>
                    <div style={{ fontSize: 12, color: 'var(--live)' }}>
                      ▲{biggestComeback.prevRank - biggestComeback.rank} places
                    </div>
                  </div>
                </div>
              </Card>
            )}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20, marginBottom: 28 }}>
            {/* Points by round bar chart */}
            {stats && stats.pointsByRound.length > 0 && (
              <Card>
                <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                  Avg points by stage
                </h2>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {stats.pointsByRound.map((r) => (
                    <div key={r.stage} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 11, color: 'var(--text-mute)', width: 56, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                        {r.stage}
                      </span>
                      <div style={{ flex: 1, height: 10, background: 'var(--bg-3)', borderRadius: 99, overflow: 'hidden' }}>
                        <div style={{
                          width: `${(r.avgPts / maxAvg) * 100}%`,
                          height: '100%',
                          background: 'linear-gradient(90deg, var(--accent), var(--accent-2))',
                          borderRadius: 99, transition: 'width 0.4s ease',
                        }} />
                      </div>
                      <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', fontWeight: 700, minWidth: 36 }}>
                        {r.avgPts.toFixed(1)}
                      </span>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* Office consensus */}
            {consensusItem && (
              <Card>
                <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text)' }}>
                  Office consensus
                </h2>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
                  <Flag isoCode={consensusItem.match.homeTeam.isoCode} size={20} />
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{consensusItem.match.homeTeam.fifaCode}</span>
                  <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>vs</span>
                  <span style={{ fontSize: 13, fontWeight: 700 }}>{consensusItem.match.awayTeam.fifaCode}</span>
                  <Flag isoCode={consensusItem.match.awayTeam.isoCode} size={20} />
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  <ConsensusBar label={consensusItem.match.homeTeam.fifaCode} percent={consensusItem.homePercent} color="var(--info)" />
                  <ConsensusBar label="Draw" percent={consensusItem.drawPercent} color="var(--text-mute)" />
                  <ConsensusBar label={consensusItem.match.awayTeam.fifaCode} percent={consensusItem.awayPercent} color="var(--accent)" />
                </div>
              </Card>
            )}
          </div>

          {/* Rank lists */}
          <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,1fr) minmax(0,1fr)', gap: 20 }}>
            {/* Top 5 by exact scores */}
            <Card>
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>
                Top full score predictors
              </h2>
              {topExact.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-mute)' }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topExact.map((e, i) => (
                    <div key={e.userId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, width: 20, color: 'var(--text-mute)' }}>
                        {i + 1}
                      </span>
                      <Avatar displayName={e.user.displayName} size={26} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{e.user.displayName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--accent)' }}>
                        {e.fullCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Top 5 by predictions made */}
            <Card>
              <h2 style={{ fontSize: 14, fontWeight: 700, marginBottom: 14, color: 'var(--text)' }}>
                Most active predictors
              </h2>
              {topPredictions.length === 0 ? (
                <p style={{ fontSize: 13, color: 'var(--text-mute)' }}>No data yet</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {topPredictions.map((e, i) => (
                    <div key={e.userId} style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                      <span style={{ fontSize: 13, fontFamily: 'var(--font-mono)', fontWeight: 700, width: 20, color: 'var(--text-mute)' }}>
                        {i + 1}
                      </span>
                      <Avatar displayName={e.user.displayName} size={26} />
                      <span style={{ flex: 1, fontSize: 13, fontWeight: 600 }}>{e.user.displayName}</span>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700, color: 'var(--info)' }}>
                        {e.playedCount}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </Card>
          </div>
        </>
      )}
    </div>
  );
}
