import type { Match } from '../../types';

interface Props {
  match: Match | null;
}

function statusLabel(match: Match): string {
  if (match.status === 'completed') return 'FT';
  if (match.status === 'live') return 'LIVE';
  if (match.status === 'locked') return 'Soon';
  const d = new Date(match.kickoffAt);
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short' });
}

export function BracketMatchCard({ match }: Props) {
  if (!match) {
    return (
      <div style={{
        width: 160, height: 52,
        border: '1px dashed var(--line-2)',
        borderRadius: 'var(--r-sm)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}>
        <span style={{ fontSize: 11, color: 'var(--text-mute)' }}>TBD</span>
      </div>
    );
  }

  const hasScore = match.homeScore != null && match.awayScore != null;
  const isLive = match.status === 'live';
  const isCompleted = match.status === 'completed';

  return (
    <div style={{
      width: 160, height: 52,
      background: 'var(--bg-2)',
      border: `1px solid ${isLive ? 'var(--live)' : isCompleted ? 'var(--line-2)' : 'var(--line)'}`,
      borderRadius: 'var(--r-sm)',
      padding: '5px 8px',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'space-between',
      boxSizing: 'border-box',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '.02em' }}>
          {match.homeTeam.fifaCode}
        </span>
        {hasScore && (
          <span style={{ fontSize: 13, fontWeight: 800, fontFamily: 'var(--font-mono)', color: 'var(--text)' }}>
            {match.homeScore}–{match.awayScore}
          </span>
        )}
        <span style={{ fontSize: 12, fontWeight: 700, color: 'var(--text)', letterSpacing: '.02em' }}>
          {match.awayTeam.fifaCode}
        </span>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center' }}>
        <span style={{
          fontSize: 10, fontWeight: 600,
          color: isLive ? 'var(--live)' : 'var(--text-mute)',
          padding: isLive ? '1px 5px' : '0',
          background: isLive ? 'rgba(25,224,138,.12)' : 'transparent',
          borderRadius: 20,
        }}>
          {statusLabel(match)}
        </span>
      </div>
    </div>
  );
}
