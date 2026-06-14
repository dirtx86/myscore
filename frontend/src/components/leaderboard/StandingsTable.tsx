import type { LeaderboardEntry } from '../../types';
import { Avatar } from '../ui/Avatar';
import { RankMedal } from './RankMedal';

export interface StandingsTableProps {
  entries: LeaderboardEntry[];
  currentUserId: string;
}

function RankDelta({ current, prev }: { current: number; prev?: number }) {
  if (prev == null || prev === current) {
    return <span style={{ color: 'var(--text-mute)', fontSize: 11 }}>–</span>;
  }
  const diff = prev - current;
  if (diff > 0) {
    return <span style={{ color: 'var(--live)', fontSize: 11, fontWeight: 700 }}>▲{diff}</span>;
  }
  return <span style={{ color: 'var(--danger)', fontSize: 11, fontWeight: 700 }}>▼{Math.abs(diff)}</span>;
}

export function StandingsTable({ entries, currentUserId }: StandingsTableProps) {
  return (
    <table className="tbl" style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--line)' }}>
          {['#', 'Player', 'Pts', 'Full', 'Toto', 'Played', 'Δ'].map((h) => (
            <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {h}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {entries.map((entry) => {
          const isMe = entry.userId === currentUserId;
          return (
            <tr
              key={entry.userId}
              className={isMe ? 'me' : undefined}
              style={{ borderBottom: '1px solid var(--line)' }}
            >
              <td style={{ padding: '10px 12px' }}>
                <RankMedal rank={entry.rank} size={28} />
              </td>
              <td style={{ padding: '10px 12px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <Avatar displayName={entry.user.displayName} size={28} />
                  <span style={{ fontWeight: isMe ? 800 : 500, color: isMe ? 'var(--accent)' : 'var(--text)' }}>
                    {entry.user.displayName}
                  </span>
                </div>
              </td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', fontWeight: 700 }}>{entry.totalPts}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{entry.fullCount}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-dim)' }}>{entry.totoCount}</td>
              <td style={{ padding: '10px 12px', fontFamily: 'var(--font-mono)', color: 'var(--text-mute)' }}>{entry.playedCount}</td>
              <td style={{ padding: '10px 12px' }}>
                <RankDelta current={entry.rank} prev={entry.prevRank} />
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}
