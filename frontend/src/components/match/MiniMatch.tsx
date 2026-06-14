import type { Match, Prediction, ScoreRules } from '../../types';
import { Flag } from '../ui/Flag';
import { StatusPill } from '../ui/StatusPill';
import { PtsTag } from '../ui/PtsTag';

export interface MiniMatchProps {
  match: Match;
  prediction?: Prediction;
  rules?: ScoreRules;
  compact?: boolean;
}

export function MiniMatch({ match, prediction, rules, compact = false }: MiniMatchProps) {
  const kickoff = new Date(match.kickoffAt);
  return (
    <div style={{
      display: 'flex', alignItems: 'center', gap: 12, padding: compact ? '8px 0' : '12px 16px',
      borderBottom: '1px solid var(--line)',
    }}>
      <span style={{ fontSize: 11, color: 'var(--text-mute)', minWidth: 40, fontFamily: 'var(--font-mono)' }}>
        {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
      </span>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6, flex: 1 }}>
        <Flag isoCode={match.homeTeam.isoCode} size={18} />
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{match.homeTeam.fifaCode}</span>
        {(match.status === 'completed' || match.status === 'live') && match.homeScore != null ? (
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, margin: '0 4px', color: 'var(--text)' }}>
            {match.homeScore} – {match.awayScore}
          </span>
        ) : (
          <span style={{ color: 'var(--text-mute)', margin: '0 4px', fontSize: 12 }}>vs</span>
        )}
        <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text)' }}>{match.awayTeam.fifaCode}</span>
        <Flag isoCode={match.awayTeam.isoCode} size={18} />
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <StatusPill status={match.status} />
        {prediction && rules && match.status === 'completed' && (
          <PtsTag pts={prediction.pointsEarned} rules={rules} />
        )}
      </div>
    </div>
  );
}
