import { useState } from 'react';
import type { Match, Prediction, ScoreRules } from '../../types';
import { ScoreInput } from './ScoreInput';
import { Button } from '../ui/Button';
import { Flag } from '../ui/Flag';
import { useToast } from '../../hooks/useToast';

export interface PredictionFormProps {
  match: Match;
  prediction?: Prediction;
  rules: ScoreRules;
  onSave: (home: number, away: number) => Promise<void>;
  isLocked: boolean;
}

export function PredictionForm({ match, prediction, rules: _rules, onSave, isLocked }: PredictionFormProps) {
  const [home, setHome] = useState(prediction?.homeScore ?? 0);
  const [away, setAway] = useState(prediction?.awayScore ?? 0);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  const minutesUntilLock = Math.ceil(
    (new Date(match.kickoffAt).getTime() - Date.now()) / 60000
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      await onSave(home, away);
      toast('Prediction saved!', 'success');
    } catch {
      toast('Failed to save prediction', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (isLocked) {
    return (
      <div style={{ padding: '12px 0', display: 'flex', flexDirection: 'column', gap: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Flag isoCode={match.homeTeam.isoCode} size={20} />
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{match.homeTeam.fifaCode}</span>
          </div>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <ScoreInput value={prediction?.homeScore ?? 0} onChange={() => {}} disabled />
            <span style={{ color: 'var(--text-mute)', fontWeight: 700 }}>–</span>
            <ScoreInput value={prediction?.awayScore ?? 0} onChange={() => {}} disabled />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <Flag isoCode={match.awayTeam.isoCode} size={20} />
            <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{match.awayTeam.fifaCode}</span>
          </div>
        </div>
        <p style={{ textAlign: 'center', fontSize: 12, color: 'var(--text-mute)' }}>
          {match.status === 'locked' && minutesUntilLock > 0
            ? `Locked — ${minutesUntilLock} min to kickoff`
            : 'Predictions locked'}
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12, padding: '12px 0' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, justifyContent: 'center' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Flag isoCode={match.homeTeam.isoCode} size={20} />
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{match.homeTeam.fifaCode}</span>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <ScoreInput value={home} onChange={setHome} />
          <span style={{ color: 'var(--text-mute)', fontWeight: 700 }}>–</span>
          <ScoreInput value={away} onChange={setAway} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
          <Flag isoCode={match.awayTeam.isoCode} size={20} />
          <span style={{ fontSize: 12, color: 'var(--text-dim)' }}>{match.awayTeam.fifaCode}</span>
        </div>
      </div>
      <Button type="submit" variant="primary" loading={saving} style={{ alignSelf: 'center' }}>
        Save Prediction
      </Button>
    </form>
  );
}
