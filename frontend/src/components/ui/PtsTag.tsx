import type { ScoreRules } from '../../types';

export interface PtsTagProps {
  pts: number | null | undefined;
  rules: ScoreRules;
}

export function PtsTag({ pts, rules }: PtsTagProps) {
  const tagStyle: React.CSSProperties = {
    display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
    borderRadius: 99, padding: '2px 10px', fontSize: 12, fontWeight: 700,
    fontFamily: 'var(--font-mono)',
  };

  if (pts == null) {
    return <span style={{ ...tagStyle, background: 'var(--bg-3)', color: 'var(--text-mute)' }}>—</span>;
  }

  const { totoPts, fullScorePts, goalDiffPts } = rules;
  const fullScore = totoPts + fullScorePts;
  const goalDiff = totoPts + goalDiffPts;

  if (pts >= fullScore) {
    return <span style={{ ...tagStyle, background: 'rgba(255,210,63,0.18)', color: 'var(--accent)' }}>+{pts}pts</span>;
  }
  if (pts >= goalDiff && pts < fullScore) {
    return <span style={{ ...tagStyle, background: 'rgba(74,168,255,0.15)', color: 'var(--info)' }}>+{pts}pts</span>;
  }
  if (pts >= totoPts) {
    return <span style={{ ...tagStyle, background: 'var(--bg-3)', color: 'var(--text-dim)' }}>+{pts}pts</span>;
  }
  return <span style={{ ...tagStyle, background: 'rgba(255,77,94,0.15)', color: 'var(--danger)' }}>0pts</span>;
}
