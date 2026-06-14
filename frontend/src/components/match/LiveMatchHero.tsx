import type { Match, Prediction } from '../../types';
import { Flag } from '../ui/Flag';
import { StatusPill } from '../ui/StatusPill';

export interface LiveMatchHeroProps {
  match: Match;
  prediction?: Prediction;
}

export function LiveMatchHero({ match, prediction }: LiveMatchHeroProps) {
  return (
    <div style={{
      background: 'var(--field-grad)', border: '1px solid var(--line)',
      borderRadius: 'var(--r-xl)', padding: '28px 24px', marginBottom: 24,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-mute)', textTransform: 'uppercase', letterSpacing: '0.08em' }}>
          Live Now
        </span>
        <StatusPill status="live" />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
          <Flag isoCode={match.homeTeam.isoCode} size={56} />
          <span style={{ fontWeight: 800, fontSize: 15, textAlign: 'center' }}>{match.homeTeam.name}</span>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <div style={{ fontFamily: 'var(--font-mono)', fontSize: 40, fontWeight: 800, color: 'var(--text)' }}>
            {match.homeScore ?? 0} – {match.awayScore ?? 0}
          </div>
          {prediction && (
            <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>
              Your pick: {prediction.homeScore} – {prediction.awayScore}
            </div>
          )}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, flex: 1 }}>
          <Flag isoCode={match.awayTeam.isoCode} size={56} />
          <span style={{ fontWeight: 800, fontSize: 15, textAlign: 'center' }}>{match.awayTeam.name}</span>
        </div>
      </div>
    </div>
  );
}
