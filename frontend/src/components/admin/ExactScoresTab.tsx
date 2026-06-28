import { useQuery } from '@tanstack/react-query';
import { predictionsApi } from '../../api/predictions';
import type { ExactWinnersMatch } from '../../types';

const STAGE_LABELS: Record<string, string> = {
  group: 'Group Stage', r32: 'Round of 32', r16: 'Round of 16',
  qf: 'Quarter-final', sf: 'Semi-final', third_place: 'Third Place', final: 'Final',
};

interface ExactScoresTabProps {
  tournamentId: string;
}

export function ExactScoresTab({ tournamentId }: ExactScoresTabProps) {
  const { data: matches = [], isLoading } = useQuery<ExactWinnersMatch[]>({
    queryKey: ['exact-winners', tournamentId],
    queryFn: () => predictionsApi.adminGetExactWinners(tournamentId),
    enabled: !!tournamentId,
  });

  if (isLoading) return <p style={{ color: 'var(--text-dim)' }}>Loading…</p>;

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Exact Score Winners</h2>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>
        Users who predicted the exact score for each completed match.
      </p>

      {matches.length === 0 && (
        <p style={{ color: 'var(--text-mute)', fontSize: 13 }}>No completed matches yet.</p>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {matches.map((m) => (
          <div key={m.matchId} style={{ border: '1px solid var(--line)', borderRadius: 'var(--r)', overflow: 'hidden' }}>
            {/* Match header */}
            <div style={{
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              padding: '10px 16px', background: 'var(--bg-2)',
            }}>
              <div>
                <div style={{ fontWeight: 700, fontSize: 14, color: 'var(--text)' }}>
                  {m.homeTeamName} vs {m.awayTeamName}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>
                  {STAGE_LABELS[m.stage] ?? m.stage}
                  {' · '}
                  {new Date(m.kickoffAt).toLocaleDateString()}
                  {' · Actual: '}
                  <strong>{m.actualHome} – {m.actualAway}</strong>
                </div>
              </div>
              {m.winners.length > 0 ? (
                <span style={{
                  background: '#d4a017', color: '#fff',
                  fontSize: 11, fontWeight: 800, padding: '3px 10px', borderRadius: 20,
                }}>
                  {m.winners.length} winner{m.winners.length !== 1 ? 's' : ''}
                </span>
              ) : (
                <span style={{
                  background: 'var(--bg-2)', color: 'var(--text-mute)',
                  border: '1px solid var(--line)',
                  fontSize: 11, fontWeight: 700, padding: '3px 10px', borderRadius: 20,
                }}>
                  No winners
                </span>
              )}
            </div>

            {/* Winners table */}
            {m.winners.length > 0 ? (
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                <thead>
                  <tr style={{ background: 'var(--bg-1)' }}>
                    {['Staff / User', 'Predicted', 'Points'].map((h) => (
                      <th key={h} style={{
                        textAlign: h === 'Points' ? 'center' : 'left',
                        padding: '7px 16px', fontSize: 11,
                        color: 'var(--text-mute)', fontWeight: 600,
                        borderTop: '1px solid var(--line)',
                      }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {m.winners.map((w) => (
                    <tr key={w.userId} style={{ borderTop: '1px solid var(--line)' }}>
                      <td style={{ padding: '9px 16px', fontWeight: 600, color: 'var(--text)' }}>
                        {w.displayName}
                      </td>
                      <td style={{ padding: '9px 16px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
                        {m.actualHome} – {m.actualAway}
                      </td>
                      <td style={{ padding: '9px 16px', textAlign: 'center' }}>
                        <span style={{
                          background: '#22863a', color: '#fff',
                          fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20,
                        }}>
                          {w.pointsEarned != null ? `${w.pointsEarned} pts` : '—'}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <div style={{ padding: '12px 16px', fontSize: 12, color: 'var(--text-mute)', fontStyle: 'italic' }}>
                No one predicted the exact score for this match.
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
