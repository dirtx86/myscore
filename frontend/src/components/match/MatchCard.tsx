import type { Match, Prediction, ScoreRules } from '../../types';
import { StatusPill } from '../ui/StatusPill';
import { PtsTag } from '../ui/PtsTag';
import { Flag } from '../ui/Flag';
import { Card } from '../ui/Card';
import { PredictionForm } from './PredictionForm';
import { useCountdown } from '../../hooks/useCountdown';
import { Icon } from '../ui/Icon';

export interface MatchCardProps {
  match: Match;
  prediction?: Prediction;
  rules: ScoreRules;
  onPredictionSave: (home: number, away: number) => Promise<void>;
}

const STAGE_LABELS: Record<string, string> = {
  group: '', r32: 'Round of 32', r16: 'Round of 16',
  qf: 'Quarter-final', sf: 'Semi-final', third_place: 'Third Place', final: 'Final',
};

export function MatchCard({ match, prediction, rules, onPredictionSave }: MatchCardProps) {
  const isLocked = match.status === 'locked' || match.status === 'completed' || match.status === 'live';
  const kickoff = new Date(match.kickoffAt);
  const stageLabel = STAGE_LABELS[match.stage] || match.stage;
  const countdown = useCountdown(match.kickoffAt);
  const showCountdown = match.status === 'scheduled' && !countdown.started;

  return (
    <Card style={{ marginBottom: 12 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
          <div style={{ fontSize: 12, color: 'var(--text-mute)', display: 'flex', alignItems: 'center', gap: 6 }}>
            <Icon name="clock" size={12} style={{ flexShrink: 0 }} />
            {kickoff.toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
            {' · '}
            {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            {stageLabel && <span style={{ color: 'var(--accent-text)', fontWeight: 600, marginLeft: 4 }}>{stageLabel}</span>}
          </div>
          {match.venue && (
            <div style={{ fontSize: 11, color: 'var(--text-mute)', display: 'flex', alignItems: 'center', gap: 5 }}>
              <Icon name="location" size={11} style={{ flexShrink: 0 }} />
              {match.venue}
            </div>
          )}
        </div>
        <StatusPill status={match.status} />
      </div>

      {/* Teams row */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, justifyContent: 'center', marginBottom: 12 }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <Flag isoCode={match.homeTeam.isoCode} size={32} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>{match.homeTeam.name}</span>
        </div>

        {(match.status === 'completed' || match.status === 'live') && match.homeScore != null ? (
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
              {match.homeScore}
            </span>
            <span style={{ color: 'var(--text-mute)', fontWeight: 700 }}>–</span>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 28, fontWeight: 700, color: 'var(--text)' }}>
              {match.awayScore}
            </span>
          </div>
        ) : (
          <span style={{ color: 'var(--text-mute)', fontWeight: 700, fontSize: 18 }}>vs</span>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, flex: 1 }}>
          <Flag isoCode={match.awayTeam.isoCode} size={32} />
          <span style={{ fontWeight: 700, fontSize: 13 }}>{match.awayTeam.name}</span>
        </div>
      </div>

      {/* Countdown */}
      {showCountdown && (
        <div style={{
          textAlign: 'center', marginBottom: 10,
          fontSize: countdown.urgent ? 13 : 12,
          fontWeight: countdown.urgent ? 700 : 500,
          fontFamily: 'var(--font-mono)',
          color: countdown.urgent ? 'var(--accent-text)' : 'var(--text-mute)',
          letterSpacing: '0.04em',
        }}>
          {countdown.urgent && '⚡ '}Starts in {countdown.label}
        </div>
      )}

      {/* Prediction or result */}
      {match.status === 'completed' && prediction ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--line)', flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Your pick:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {prediction.homeScore} – {prediction.awayScore}
          </span>
          <PtsTag pts={prediction.pointsEarned} rules={rules} />
          {prediction.byAdmin && (
            <span style={{
              fontSize: 10, color: 'var(--text-mute)',
              background: 'var(--bg-2)', border: '1px solid var(--line)',
              padding: '2px 7px', borderRadius: 20,
            }}>Entered by Admin</span>
          )}
        </div>
      ) : match.status !== 'completed' ? (
        <PredictionForm
          match={match}
          prediction={prediction}
          rules={rules}
          onSave={onPredictionSave}
          isLocked={isLocked}
        />
      ) : null}
    </Card>
  );
}
