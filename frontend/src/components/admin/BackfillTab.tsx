import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { usersApi } from '../../api/users';
import { matchesApi } from '../../api/matches';
import { predictionsApi } from '../../api/predictions';
import type { Match, User, Prediction } from '../../types';

function ptsBadge(pts: number | null | undefined, isExact: boolean) {
  if (pts == null) return null;
  const map: Record<number, { bg: string; color: string }> = {
    4: { bg: '#22863a', color: '#fff' },
    2: { bg: '#e37c00', color: '#fff' },
    1: { bg: '#1a7ac4', color: '#fff' },
    0: { bg: 'var(--border)', color: 'var(--text-mute)' },
  };
  const s = map[pts] ?? { bg: 'var(--border)', color: 'var(--text-mute)' };
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3, minWidth: 70 }}>
      {isExact && (
        <span style={{
          background: '#d4a017', color: '#fff', fontSize: 10,
          fontWeight: 800, padding: '2px 7px', borderRadius: 20,
          whiteSpace: 'nowrap',
        }}>⭐ EXACT</span>
      )}
      <span style={{
        background: s.bg, color: s.color, fontSize: 12,
        fontWeight: 700, padding: '3px 10px', borderRadius: 20,
      }}>{pts} pts</span>
    </div>
  );
}

interface BackfillTabProps {
  tournamentId: string;
}

export function BackfillTab({ tournamentId }: BackfillTabProps) {
  const qc = useQueryClient();
  const [selectedUserId, setSelectedUserId] = useState('');
  const [editingMatch, setEditingMatch] = useState<string | null>(null);
  const [scores, setScores] = useState<Record<string, { home: string; away: string }>>({});
  const [saved, setSaved] = useState<string | null>(null);

  const { data: users = [] } = useQuery<User[]>({
    queryKey: ['users'],
    queryFn: usersApi.listUsers,
  });

  const { data: matches = [] } = useQuery<Match[]>({
    queryKey: ['matches', tournamentId, 'all'],
    queryFn: () => matchesApi.getMatches(tournamentId),
    enabled: !!tournamentId,
  });

  const { data: userPreds = [], isLoading: loadingPreds } = useQuery<Prediction[]>({
    queryKey: ['admin-preds', selectedUserId, tournamentId],
    queryFn: () => predictionsApi.adminGetForUser(selectedUserId, tournamentId),
    enabled: !!selectedUserId && !!tournamentId,
  });

  const backfill = useMutation({
    mutationFn: predictionsApi.adminBackfill,
    onSuccess: (_, vars) => {
      qc.invalidateQueries({ queryKey: ['admin-preds', selectedUserId, tournamentId] });
      qc.invalidateQueries({ queryKey: ['leaderboard'] });
      setSaved(vars.matchId);
      setEditingMatch(null);
      setTimeout(() => setSaved(null), 2500);
    },
  });

  const predsByMatchId = new Map(userPreds.map((p) => [p.matchId, p]));
  const selectedUser = users.find((u) => u.id === selectedUserId);

  const fieldStyle: React.CSSProperties = {
    width: 60, padding: '6px 8px', fontSize: 16, fontFamily: 'var(--font-mono)',
    fontWeight: 700, textAlign: 'center' as const,
    background: 'var(--bg-inset)', border: '1px solid var(--line-2)',
    borderRadius: 'var(--r-sm)', color: 'var(--text)',
  };

  function startEdit(matchId: string, existing?: Prediction) {
    setEditingMatch(matchId);
    setScores((prev) => ({
      ...prev,
      [matchId]: {
        home: existing?.homeScore?.toString() ?? '',
        away: existing?.awayScore?.toString() ?? '',
      },
    }));
  }

  function submit(matchId: string) {
    const s = scores[matchId];
    if (!s || s.home === '' || s.away === '') return;
    backfill.mutate({
      userId: selectedUserId,
      matchId,
      homeScore: parseInt(s.home, 10),
      awayScore: parseInt(s.away, 10),
    });
  }

  return (
    <div>
      <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6 }}>Backfill Predictions</h2>
      <p style={{ fontSize: 13, color: 'var(--text-dim)', marginBottom: 24 }}>
        Add or update predictions for any user on any match. Points are recalculated automatically for completed matches.
      </p>

      {/* User select */}
      <div style={{ marginBottom: 24, maxWidth: 360 }}>
        <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-dim)', display: 'block', marginBottom: 6 }}>
          Select user
        </label>
        <select
          value={selectedUserId}
          onChange={(e) => setSelectedUserId(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px', fontSize: 14,
            background: 'var(--bg-inset)', border: '1px solid var(--line-2)',
            borderRadius: 'var(--r-sm)', color: 'var(--text)',
          }}
        >
          <option value="">— Choose a user —</option>
          {users.map((u) => (
            <option key={u.id} value={u.id}>{u.displayName} ({u.email})</option>
          ))}
        </select>
      </div>

      {/* Predictions table */}
      {selectedUserId && (() => {
        const completed = matches.filter((m) => m.status === 'completed');
        const active = matches.filter((m) => m.status === 'live' || m.status === 'locked');
        const upcoming = matches.filter((m) => m.status === 'scheduled');

        const renderMatch = (match: Match) => {
          const pred = predsByMatchId.get(match.id);
          const isEditing = editingMatch === match.id;
          const isSaved = saved === match.id;
          const s = scores[match.id];
          const isExact = !!pred &&
            match.homeScore != null &&
            match.awayScore != null &&
            pred.homeScore === match.homeScore &&
            pred.awayScore === match.awayScore;

          return (
            <div
              key={match.id}
              style={{
                display: 'flex', alignItems: 'center', gap: 16,
                padding: '12px 16px',
                background: 'var(--bg-1)',
                border: isExact ? '2px solid #d4a017' : '1px solid var(--line)',
                borderRadius: 'var(--r)', flexWrap: 'wrap',
              }}
            >
              <div style={{ flex: '1 1 200px', minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text)' }}>
                  {match.homeTeam.fifaCode} vs {match.awayTeam.fifaCode}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-mute)', marginTop: 2 }}>
                  {match.homeScore != null ? `Result: ${match.homeScore} – ${match.awayScore} · ` : ''}
                  {new Date(match.kickoffAt).toLocaleDateString()}
                </div>
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 160 }}>
                {pred ? (
                  <>
                    <div style={{ textAlign: 'center' }}>
                      <div style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 2 }}>Predicted</div>
                      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
                        {pred.homeScore} – {pred.awayScore}
                      </span>
                    </div>
                    {match.homeScore != null && match.awayScore != null && (
                      <div style={{ textAlign: 'center' }}>
                        <div style={{ fontSize: 10, color: 'var(--text-mute)', marginBottom: 2 }}>Actual</div>
                        <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 14 }}>
                          {match.homeScore} – {match.awayScore}
                        </span>
                      </div>
                    )}
                    {ptsBadge(pred.pointsEarned, isExact)}
                    {pred.byAdmin && (
                      <span style={{
                        fontSize: 10, color: 'var(--text-mute)',
                        background: 'var(--bg-2)', border: '1px solid var(--line)',
                        padding: '2px 7px', borderRadius: 20, whiteSpace: 'nowrap',
                      }}>Entered by Admin</span>
                    )}
                  </>
                ) : (
                  <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>No prediction</span>
                )}
              </div>

              {isEditing ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <input
                    type="number" min={0} max={99} style={fieldStyle}
                    value={s?.home ?? ''}
                    onChange={(e) => setScores((prev) => ({ ...prev, [match.id]: { ...prev[match.id], home: e.target.value } }))}
                  />
                  <span style={{ color: 'var(--text-mute)' }}>–</span>
                  <input
                    type="number" min={0} max={99} style={fieldStyle}
                    value={s?.away ?? ''}
                    onChange={(e) => setScores((prev) => ({ ...prev, [match.id]: { ...prev[match.id], away: e.target.value } }))}
                  />
                  <button
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: 13 }}
                    disabled={backfill.isPending}
                    onClick={() => submit(match.id)}
                  >
                    {backfill.isPending && backfill.variables?.matchId === match.id ? '…' : 'Save'}
                  </button>
                  <button
                    onClick={() => setEditingMatch(null)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-mute)', padding: '6px 10px' }}
                  >
                    Cancel
                  </button>
                </div>
              ) : (
                <button
                  onClick={() => startEdit(match.id, pred)}
                  style={{
                    background: 'var(--bg-2)', border: '1px solid var(--line)',
                    borderRadius: 'var(--r-sm)', padding: '6px 14px', fontSize: 13,
                    cursor: 'pointer', color: isSaved ? 'var(--live)' : 'var(--text-dim)',
                    fontWeight: isSaved ? 700 : 500,
                  }}
                >
                  {isSaved ? '✓ Saved' : (pred ? 'Edit' : 'Add')}
                </button>
              )}
            </div>
          );
        };

        const Section = ({ title, items }: { title: string; items: Match[] }) =>
          items.length === 0 ? null : (
            <div style={{ marginBottom: 24 }}>
              <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-dim)', marginBottom: 10, textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                {title}
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.map(renderMatch)}
              </div>
            </div>
          );

        return (
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 600, marginBottom: 16, color: 'var(--text-dim)' }}>
              {loadingPreds ? 'Loading…' : `${matches.length} matches for ${selectedUser?.displayName}`}
            </h3>
            <Section title="Upcoming" items={upcoming} />
            <Section title="Locked / Live" items={active} />
            <Section title="Completed" items={completed} />
            {matches.length === 0 && (
              <p style={{ color: 'var(--text-mute)', fontSize: 13 }}>No matches found.</p>
            )}
          </div>
        );
      })()}
    </div>
  );
}
