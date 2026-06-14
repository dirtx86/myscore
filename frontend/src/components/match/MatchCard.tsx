import type { Match, Prediction, ScoreRules } from '../../types';
import { StatusPill } from '../ui/StatusPill';
import { PtsTag } from '../ui/PtsTag';
import { Flag } from '../ui/Flag';
import { Card } from '../ui/Card';
import { PredictionForm } from './PredictionForm';

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

  return (
    <Card style={{ marginBottom: 12 }}>
      {/* Header row */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
        <div style={{ fontSize: 12, color: 'var(--text-mute)' }}>
          {kickoff.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          {match.venue && <span> · {match.venue}</span>}
          {stageLabel && <span style={{ marginLeft: 8, color: 'var(--accent)', fontWeight: 600 }}>{stageLabel}</span>}
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

      {/* Prediction or result */}
      {match.status === 'completed' && prediction ? (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 12, paddingTop: 8, borderTop: '1px solid var(--line)' }}>
          <span style={{ fontSize: 12, color: 'var(--text-mute)' }}>Your pick:</span>
          <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700 }}>
            {prediction.homeScore} – {prediction.awayScore}
          </span>
          <PtsTag pts={prediction.pointsEarned} rules={rules} />
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
