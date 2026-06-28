import type { Match } from '../../types';
import { BracketMatchCard } from './BracketMatchCard';

interface Props {
  label: string;
  matches: (Match | null)[];
  slotHeight: number;
  side: 'left' | 'right' | 'center';
}

export function BracketRound({ label, matches, slotHeight, side }: Props) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
      <div style={{
        fontSize: 10, fontWeight: 700, color: 'var(--text-mute)',
        marginBottom: 8, letterSpacing: '.07em', textTransform: 'uppercase',
        whiteSpace: 'nowrap',
      }}>
        {label}
      </div>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {matches.map((match, i) => (
          <div
            key={match?.id ?? `empty-${i}`}
            className={`bk-slot bk-slot--${side}`}
            style={{ height: slotHeight, display: 'flex', alignItems: 'center' }}
          >
            <BracketMatchCard match={match} />
          </div>
        ))}
      </div>
    </div>
  );
}
