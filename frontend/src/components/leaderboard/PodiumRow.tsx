import type { LeaderboardEntry } from '../../types';
import { Avatar } from '../ui/Avatar';
import { RankMedal } from './RankMedal';

export interface PodiumRowProps {
  entry: LeaderboardEntry;
  rank: 1 | 2 | 3;
  isMe: boolean;
}

const HEIGHT_BY_RANK: Record<number, number> = { 1: 160, 2: 130, 3: 120 };

export function PodiumRow({ entry, rank, isMe }: PodiumRowProps) {
  const height = HEIGHT_BY_RANK[rank] ?? 120;

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8,
      flex: 1, paddingBottom: 0,
    }}>
      {/* Avatar + medal */}
      <div style={{ position: 'relative', marginBottom: 4 }}>
        <Avatar displayName={entry.user.displayName} size={isMe ? 52 : 44} />
        <div style={{ position: 'absolute', bottom: -8, right: -8 }}>
          <RankMedal rank={rank} size={24} />
        </div>
      </div>

      {/* Name */}
      <span style={{
        fontSize: 13, fontWeight: isMe ? 800 : 600, color: isMe ? 'var(--accent)' : 'var(--text)',
        textAlign: 'center', maxWidth: 90, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
      }}>
        {entry.user.displayName}
      </span>

      {/* Points */}
      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 20, fontWeight: 800, color: 'var(--text)' }}>
        {entry.totalPts}
      </span>
      <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>{entry.fullCount} full</span>

      {/* Podium block */}
      <div style={{
        width: '100%', height, background: 'var(--bg-2)', border: '1px solid var(--line)',
        borderRadius: 'var(--r-sm) var(--r-sm) 0 0',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        fontSize: 28, fontWeight: 800, color: 'var(--text-mute)',
      }}>
        #{rank}
      </div>
    </div>
  );
}
