import { useState } from 'react';
import { ScoreInput } from '../match/ScoreInput';
import { Button } from '../ui/Button';
import type { Match } from '../../types';

interface ResultFormProps {
  match: Match;
  onSave: (homeScore: number, awayScore: number) => void;
  onCancel: () => void;
}

export function ResultForm({ match, onSave, onCancel }: ResultFormProps) {
  const [home, setHome] = useState<number>(match.homeScore ?? 0);
  const [away, setAway] = useState<number>(match.awayScore ?? 0);
  const isKnockout = match.stage !== 'group';
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      {isKnockout && (
        <p style={{ color: 'var(--warn)', fontSize: 12, margin: 0 }}>
          Enter AET score only (no penalty goals)
        </p>
      )}
      <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
        <ScoreInput value={home} onChange={setHome} />
        <span style={{ color: 'var(--text-dim)' }}>–</span>
        <ScoreInput value={away} onChange={setAway} />
        <Button variant="primary" onClick={() => onSave(home, away)}>Save Result</Button>
        <Button variant="ghost" onClick={onCancel}>Cancel</Button>
      </div>
    </div>
  );
}
