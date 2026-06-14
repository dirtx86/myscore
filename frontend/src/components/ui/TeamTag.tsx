import type { Team } from '../../types';
import { Flag } from './Flag';

export interface TeamTagProps {
  team: Team;
}

export function TeamTag({ team }: TeamTagProps) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
      <Flag isoCode={team.isoCode} size={16} />
      <span style={{ fontFamily: 'var(--font-mono)', fontWeight: 700, fontSize: 12, letterSpacing: '0.06em' }}>
        {team.fifaCode}
      </span>
    </span>
  );
}
